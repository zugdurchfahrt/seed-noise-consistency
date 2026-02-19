# `rand_met.py` — подробный разбор разделов 2–5

Файл-источник: `sunami/tools/generators/rand_met.py`  
Фокус разбора: функция `generate_font_manifest(...)`, этапы **Step 2 → Step 5** (включительно).  
Опора только на текущий код (без предположений вне файла).

## 1) Короткий контекст перед Step 2

К моменту входа в Step 2 функция уже:

1. Нормализовала платформу к `Win32` или `MacIntel` (иначе `ValueError`).
2. Попробовала перенести новые `.woff2` из `assets/fonts_raw` в `assets/generated_fonts/<platform>`.
3. На этапе переноса применяла фильтры к новым файлам (валидность woff2, cmap, ASCII, icon/emoji, fsType, GSUB, sanity-метрики).

Дальше (Step 2–5) функция работает уже с платформенным каталогом и индексом.

## 2) Step 2: построение актуального пула шрифтов для отбора

Код-блоки: `generate_font_manifest` (строки около 592+), `ensure_platform_index`, `_load_index`, `_cleanup_cache`.

### 2.1. Гарантия каталога и загрузка индекса

1. Создаётся `target_dir` (если его нет).
2. Вызывается `idx = ensure_platform_index(platform)`.
3. Из индекса берётся `files_map = idx.get("files", {})`.
4. Формируется `all_names = list(files_map.keys())`.
5. Если `all_names` пустой, логируется warning и функция возвращает `[]`.

### 2.2. Что именно делает `ensure_platform_index(platform)`

Функция синхронизирует `fonts_index.json` с фактическими `.woff2` в `generated_fonts/<platform>`.

Порядок:

1. Вычисляет путь индекса через `_index_path_for(platform)`.
2. Загружает текущий индекс через `_load_index(...)`.
3. Если индекс битый/не того формата/не той платформы — возвращает новый каркас:
   `{"version": 1, "platform": platform, "files": {}}`.
4. Удаляет устаревшее поле `data` из записей индекса (если осталось от старых версий).
5. Сканирует файловую систему только по маске `*.woff2`.
6. Удаляет из индекса записи файлов, которых уже нет на диске.
7. Для каждого файла на диске:
   - сравнивает `size` и `mtime` с записью индекса;
   - если файл новый/изменён — читает байты, проверяет `wOF2`-заголовок;
   - сохраняет в индекс только `size`, `mtime`, `md5`.
8. Для старых записей без `md5` делает backfill `md5`.
9. Если были изменения — атомарно сохраняет индекс (`_atomic_write_json`).
10. Чистит side-cache `cache_data/*.b64`, удаляя сироты (нет md5 в актуальном индексе).

### 2.3. Дополнительный дедуп пула после индекса

После `files_map` в `generate_font_manifest` выполняется отдельная дедупликация:

1. `seen = set()`, `unique_names = []`.
2. Для каждого имени из `sorted(all_names)`:
   - читается `family/subfamily` через `get_font_compare(...)`;
   - ключ дедупа: `(fam or "", sub or "")`.
3. Если ключ уже встречался — файл пропускается.
4. Иначе имя попадает в `unique_names`.
5. Далее `all_names = unique_names`.

Итог Step 2: пул кандидатов для fingerprint — это **не весь индекс**, а индекс после дедупа по `(family, subfamily)`.

## 3) Step 3: отбор шрифтов для fingerprint (`fingerprint_names`)

Код-блок: строки около 617–640.

### 3.1. Детеминированный seed для отбора

1. Берётся `seed_env = os.environ.get("__GLOBAL_SEED", "0")`.
2. Сборка источника seed:
   `"{seed_env}|{platform}|{sorted(all_names) через '|'}"`.
3. Seed = первые 8 hex-символов от `md5(seed_src)` как `int(..., 16)`.
4. Создаётся локальный RNG: `_rng = random.Random(_seed)`.

Это даёт повторяемость отбора при одинаковых:

1. `__GLOBAL_SEED`,
2. платформе,
3. составе `all_names` после дедупа.

### 3.2. Границы количества

1. `MIN_N = int(os.environ.get("FONTS_MIN_N", "14"))`
2. `MAX_N = int(os.environ.get("FONTS_MAX_N", "16"))`
3. `max_n = len(all_names)`

Ветвление:

1. Если `max_n == 0`:
   - warning,
   - `fingerprint_names = []`.
2. Иначе:
   - `hi = min(MAX_N, max_n)`,
   - `lo = 1 if max_n < MIN_N else MIN_N`,
   - `N = _rng.randint(lo, hi)`,
   - если `N < MIN_N`, пишется warning,
   - `fingerprint_names = _rng.sample(sorted(all_names), k=N)`,
   - итог сортируется (`fingerprint_names.sort()`).

Ключевые ограничения:

1. Выборка без повторов (`sample`).
2. Когда кандидатов меньше `MIN_N`, нижняя граница жёстко становится `1`.
3. `N` выбирается по уже дедупнутому `all_names`.

## 4) Step 4: формирование `temp_configs` и `cfg`

Код-блок: строки около 641–709.

### 4.1. Подготовка структуры накопления

Перед циклом:

1. `max_family_repeats = 6`.
2. `family_counter = defaultdict(int)`.
3. `used_families = set()`.
4. `temp_configs = []`.

Также делается контроль глобального `random`:

1. Сохраняется текущее состояние `random.getstate()`.
2. Устанавливается `random.seed(_seed ^ 0x9E3779B1)`.
3. В `finally` состояние обязательно возвращается (`random.setstate(...)`).

Зачем: генерация метадаты в этом блоке должна быть детерминированной и не ломать внешний global-random контекст.

### 4.2. Цикл по выбранным `fingerprint_names`

Для каждого `fname`:

1. Берётся индексная запись `rec = files_map.get(fname)`.
2. Если записи нет: warning + `continue`.
3. Строится `data_url = _get_data_url(platform, target_dir, fname, rec)`.
4. Если `data_url` пустой: warning + `continue`.
5. Вычисляются служебные переменные:
   - `file_path = target_dir / fname`,
   - `name_no_ext = Path(fname).stem`.

### 4.3. Как формируется `data_url` (преобразование woff2 в строку)

`_get_data_url(...)` делает следующее:

1. Пытается взять `md5` из `rec["md5"]`.
2. Если md5 нет — считает md5 по байтам файла.
3. Путь к кэшу: `generated_fonts/<platform>/cache_data/<md5>.b64`.
4. Если `.b64` существует:
   - читает ASCII-строку base64 из кэша.
5. Если `.b64` нет:
   - читает бинарник `fname`,
   - проверяет заголовок `wOF2` (`_is_woff2_header`),
   - если заголовок невалидный: warning и возвращает `""`,
   - иначе кодирует в base64 (ASCII),
   - атомарно пишет `.b64`.
6. Возвращает строку формата:
   `data:font/woff2;base64,<base64>`.

То есть в Step 4 бинарный woff2 преобразуется в строковый `data:` URL.

### 4.4. Генерация и “патч” метадаты

Вызывается `meta_values = generate_font_metadata(platform, subfamilies_src)`.

Что делает `generate_font_metadata`:

1. Выбирает пул семей:
   - `SYS_FONTS_WIN` для `Win32`,
   - `SYS_FONTS_MAC` для `MacIntel`.
2. Выбирает пул дизайнеров по платформе.
3. Выбирает пул subfamily:
   - если `subfamilies_src` передан — через `_normalize_subfamilies(...)`,
   - иначе берёт глобальный `SUBFAMILIES`.
4. Случайно формирует:
   - `family`,
   - `subfamily`,
   - `unique_id` (`<2 буквы family>-<12 alnum>`),
   - `full_name = "<family> <subfamily>"`,
   - `version = "Version X.Y"`,
   - `ps_name = "<family>-<subfamily>"`,
   - `designer`,
   - `license_desc`.
5. Возвращает словарь с numeric key-полями:
   - `1,2,3,4,5,6,9,13`.

В Step 4 эти numeric key затем маппятся в именованные поля.

### 4.5. Ограничения/фильтрация уже на этапе сборки `cfg`

После генерации метадаты:

1. Локально извлекаются:
   - `family = meta_values.get(1, fname)`,
   - `subfamily = meta_values.get(2, "")`,
   - `full_name = meta_values.get(4, "")`,
   - `postscript = meta_values.get(6, "")`.
2. Собирается ключ уникальности:
   - `uniq_triple = (family, full_name, postscript)`.
3. Если этот `uniq_triple` уже использован — пропуск.
4. Если `family_counter[family] >= 6` — пропуск.

Это второй уровень ограничения после Step 3:

1. Даже если имя файла попало в `fingerprint_names`, оно может не попасть в финальный `temp_configs`.
2. Причина: конфликт `uniq_triple` или превышение лимита на семью.

### 4.6. Вычисление `weight/style`

Из `subfamily.lower()`:

1. `weight = "bold"`, если есть один из маркеров:
   `bold`, `black`, `heavy`, `semibold`, `demibold`, `extrabold`, `ultrabold`.
2. Иначе `weight = "normal"`.
3. `style = "italic"`, если есть `italic` или `oblique`.
4. Иначе `style = "normal"`.

### 4.7. Что такое `cfg` и что такое `temp_configs`

`cfg` — это **одна** конфигурация для одного шрифта (одна итерация цикла).  
`temp_configs` — это **список** всех принятых `cfg` после фильтрации.

Состав `cfg`:

1. `name`: basename файла без расширения.
2. `url`: `data:font/woff2;base64,...` из `_get_data_url`.
3. `fontFamily`: `meta_values[6]` (postscript) или `name_no_ext`.
4. `family`: из `meta_values[1]`.
5. `subfamily`: из `meta_values[2]`.
6. `weight`: рассчитан по subfamily.
7. `style`: рассчитан по subfamily.
8. `unique_id`: из `meta_values[3]`.
9. `full_name`: из `meta_values[4]`.
10. `version`: из `meta_values[5]`.
11. `postscript_name`: из `meta_values[6]`.
12. `designer`: из `meta_values[9]`.
13. `license`: из `meta_values[13]`.
14. `fallback`: `name_no_ext`.
15. `platform_id`: `PLATFORM_ID_MAP[platform][0]` (`3` для Win32, `1` для MacIntel).
16. `platform_dom`: строка платформы (`Win32`/`MacIntel`).

После успешного добавления:

1. `temp_configs.append(cfg)`,
2. `used_families.add(uniq_triple)`,
3. `family_counter[family] += 1`,
4. debug-лог сравнения исходного family/subfamily файла и сгенерированного.

## 5) Step 5: запись манифеста и генерация JS-патча

Код-блок: строки около 711–746.

### 5.1. Запись `fonts-manifest.json`

1. Создаётся папка `manifest_path.parent`.
2. В `manifest_path` записывается **ровно `temp_configs`**:
   - `json.dump(..., ensure_ascii=False, indent=2)`.
3. Логируется количество шрифтов в манифесте:
   `len(temp_configs)`.

Итог: содержимое манифеста равно результату Step 4 после всех `continue`-фильтров.

### 5.2. Подготовка данных для шаблона JS

1. Создаётся Jinja2 `Environment(loader=FileSystemLoader(TEMPLATES), trim_blocks=True)`.
2. Загружается `font_patch.template.j2`.
3. Формируется `configs_for_js` как проекция `temp_configs` с полями:
   - `name`,
   - `family`,
   - `url`,
   - `fallback`,
   - `platform_id`,
   - `platform_dom`,
   - `weight` (default `"normal"`),
   - `style` (default `"normal"`).
4. `configs_for_js` сериализуется в строку JSON:
   `configs_json = json.dumps(configs_for_js, ensure_ascii=False)`.

### 5.3. Рендер и запись `font_patch.generated.js`

1. Рендер шаблона:
   - `configs_json=configs_json`,
   - `PLATFORM=platform`.
2. Создаётся `PATCH_OUT.parent`.
3. Пишется файл `PATCH_OUT`.
4. Логируется факт генерации.
5. Функция возвращает `temp_configs`.

## 6) Сводка ограничений и рамок именно в Step 2–5

1. Источник пула для отбора — только `fonts_index.json`, синхронизированный с `generated_fonts/<platform>`.
2. Перед Step 3 пул дополнительно режется дедупом по `(family, subfamily)` из name-таблицы.
3. Количество выбираемых кандидатов `N` ограничено:
   - сверху `min(MAX_N, max_n)`,
   - снизу `MIN_N`, либо `1`, если кандидатов меньше минимума.
4. Попадание в `fingerprint_names` не гарантирует попадание в manifest:
   - можно вылететь на пустом `rec`,
   - на пустом `data_url`,
   - на дубликате `uniq_triple`,
   - на лимите `max_family_repeats`.
5. Поля manifest и JS-патча берутся из `cfg`, который комбинирует:
   - строковые данные из файла (`name`, `url`, `fallback`),
   - сгенерированную метадату (`family/subfamily/version/...`),
   - платформенные атрибуты (`platform_id`, `platform_dom`),
   - вычисленные `weight/style`.

# Readme_RUS.md

**Коротко (TL;DR):** исследовательский anti-fingerprinting pipeline (Python + JavaScript) с детерминированными seed-based патчами Canvas/WebGL/WebGPU/Fonts/Headers через CDP.  
**Работает на Windows с VPN** (ProtonVPN/OpenVPN) + опциональный proxy.

Browser Anti-Fingerprinting: Python + JavaScript

English version: see README.md.

## О чем этот проект

Система предназначена для оценки и смягчения современных browser fingerprinting surfaces: Canvas 2D/OffscreenCanvas, WebGL/WebGPU, Fonts, UA-CH/Headers.

## Архитектура

Python (Selenium + undetected_chromedriver) + инъекция JavaScript-патчей/модулей через CDP для управления fingerprint surfaces. Mitmproxy теперь опционален и переключается прямо в `main.py`.

## Этика и область применения

Инструменты предназначены только для тестирования, отладки и исследований. Не используйте их для обхода защитных механизмов, нарушения правил сайтов или законов.  
Это инструмент для исследования приватности и устойчивости детекторов. Ответственность за применение лежит на пользователе.

## Важный дисклеймер

Это не "silver bullet" и не набор средств для полной анонимности. Современные техники fingerprinting (TLS fingerprints, behavioral checks, WebGL/WebGPU constraints, AudioContext API updates и т.д.) могут коррелировать сессии и деанонимизировать окружение даже при наличии патчей. Частичный контроль поверхности не дает полной анонимности.

## Цели проекта

Основная цель проекта - исследовать браузер изнутри, понять, какие API используются и где могут быть каналы утечки данных.  
Понять, как шрифты, `WebGL`, `Client Hints`, plug-ins и другие компоненты влияют на fingerprint.  
Сохранять наблюдаемость fingerprinting-поверхностей и их воспроизводимость через профилирование и управление сетевой прослойкой.

## Конфигурация и принципы

Без хардкода: значения профиля собираются из словарей/profile data и попадают в `window.__*` только как входные bootstrap/bridge-значения. Реальная patch-логика, helpers и промежуточное состояние постепенно переносятся в module-local closure state, а не хранятся как долгоживущие public globals.  
Совместимость с MDN/Chromium: hooks остаются внутри native API boundaries; closure-owned routing/helpers используются для сохранения receiver/owner contracts и предотвращения Illegal invocation.  
`__GLOBAL_SEED` / DPR / device metrics синхронизируются через initialization variables.

## Статус проекта

Исследовательский и некоммерческий проект; публикуется "as is". Гарантий стабильности нет.  
Проект разрабатывается одним автором, поэтому охват сценариев и окружений ограничен. Forks и contributions приветствуются.  
Границы применимости см. в Issues/TODO.  
Проверялось только на Windows + ProtonVPN (OpenVPN CLI). Другие OS/VPN не тестировались.  
В целом pipeline инициализируется, скрипт запускается и выполняет назначенные задачи.

## Лицензия

The Unlicense (Public Domain). Авторские и смежные права waived  
to the extent possible. Разрешено копировать, изменять, публиковать, использовать, компилировать, продавать  
и распространять проект, с attribution или без нее. Software provided "AS IS".

## Требования

OS: Windows 10/11 (путь OpenVPN рассчитан на Windows).  
Python: 3.12 (рекомендуется 3.11+).

## Сторонние компоненты

OpenVPN установлен локально (дефолтный путь определен в `vpn_utils.py`, может быть изменен).  
`mitmproxy` (есть в `requirements.txt`, нужен только когда переключатель mitmproxy включен).  
Chrome/Chromium - локальная копия Chrome for Testing; путь настроен в `main.py`.  
Все Python-зависимости указаны в `requirements.txt`.

## Режимы запуска

Есть одна точка входа: `main.py`.

Mitmproxy управляется маленьким видимым переключателем возле начала `main.py`:

```python
MITMPROXY_ON = True
# MITMPROXY_OFF = True
```

Это значит: запуск **с mitmproxy**. `main.py` сам запускает `mitmdump`, направляет Chrome через `127.0.0.1:8082` и останавливает процесс при выходе.

Чтобы запустить **без mitmproxy**, поменяйте активную строку:

```python
# MITMPROXY_ON = True
MITMPROXY_OFF = True
```

В этом режиме `main.py` не запускает `mitmdump`, не ставит proxy options для Chrome, и Chrome подключается напрямую.

Активной должна быть только одна строка. Если активны обе или обе закомментированы, запуск сразу завершится понятной ошибкой.

### С mitmproxy

✔ Проще ходить по сайтам без немедленных CORS/header challenges.  
✔ Есть прямой доступ к CORS/headers/`Client Hints`.  
✖ Требуется `mitmproxy`.  
✖ Детекторы могут видеть TLS fingerprint mitmproxy как не "native".

### Без mitmproxy

✔ Более простой и легкий запуск.  
✔ Нет локальной proxy-прослойки.  
✖ Ограничения CORS могут снижать эффективность для реального browsing; этот режим лучше подходит как прямой browser/CDP/JS pipeline.

Примечание: VPN используется в обоих режимах, если отдельно не отключить VPN calls.

### Использование без встроенного VPN-клиента

Скрипт можно запускать без управления OpenVPN изнутри. В этом случае можно:  
✔ Использовать любой другой VPN-клиент, включая управляемый через GUI.  
✔ Или работать вообще без VPN.  
Для этого достаточно закомментировать в `def main():` вызовы методов `VPNClient`, отвечающие за проверку, подготовку и подключение:

```python
# client.verify()
# client.prepare()
# logger.info("Preparation completed")
# client.connect()
client.post()
```

В этом режиме скрипт работает как раньше: все последующие шаги выполняются, но VPN-процессы не останавливаются и не запускаются.  
Если VPN уже поднят любым другим способом, скрипт просто использует текущее сетевое окружение.

## Структура репозитория

```text
├── assets/
│   ├── JS_fonts_patch/
│   ├── Manifest/
│   ├── fonts_raw/
│   ├── generated_fonts/
│   │   ├── MacIntel/
│   │   │   ├── cache_data/
│   │   └── Win32/
│   │       ├── cache_data/
│   ├── scripts/
│   │   ├── window/
│   │   │   ├── core/
│   │   │   │   ├── bootstrap_hide.js
│   │   │   │   ├── context.js
│   │   │   │   ├── core_window.js
│   │   │   │   ├── prng_seed.js
│   │   │   │   ├── probe.js
│   │   │   │   └── set_log.js
│   │   │   └── patches/
│   │   │       ├── graphics/
│   │   │       ├── media/
│   │   │       ├── navigator/
│   │   │       └── stealth/
│   │   └── workerscope/
│   │       ├── set_reflect.js
│   │       ├── sw_prelude.js
│   │       ├── worker_bootstrap.js
│   │       ├── WORKER_PATCH_SRC.js
│   │       └── wrk.js
│   └── templates/
│       └── font_patch.template.j2
├── cfg_vpn/
├── logs/
├── profile_data_source/
│   ├── datashell_win32.py
│   ├── depo_browser.py
│   ├── FONTS_DESIGNER_BY_FAMILY_JSON.json
│   ├── FONTS_LICENSE_BY_FAMILY_JSON.json
│   ├── macintel.py
│   ├── permissions_dict.py
│   ├── plugins_dict.py
│   └── profile.json
├── profiles/
├── tools/
│   ├── generators/
│   │   ├── cdp_catapult.py
│   │   ├── cdp_worker_env.py
│   │   └── rand_met.py
│   ├── tools_infra/
│   │   ├── overseer.py
│   │   └── vpn_utils.py
│   └── tools_runtime/
│       ├── handle_cors_addon.py
│       ├── headers_adapter.py
│       └── helpers.py
├── user_data/
├── main.py
├── Readme_RUS.md
├── requirements.txt
└── README.md
```

## Обзор модулей (кратко)

### Python

- `main.py` - главный оркестратор и точка входа: собирает/загружает данные профиля, готовит CDP payload для инъекции, запускает Selenium + undetected-chromedriver, подключает runtime helpers и применяет staged JS pipeline к window и worker scopes.
- `profile_data_source/` - словари и базовые данные профиля для сборки платформы и браузера: Win32/MacIntel shells, карты версий браузеров, наборы plugins, настройки permissions и profile defaults.
- `tools/generators/rand_met.py` - шрифтовой pipeline: готовит generated fonts для платформ, cache metadata и `assets/JS_fonts_patch/font_patch.generated.js` из Jinja2-шаблона.
- `tools/generators/cdp_catapult.py` - собирает CDP-side payload и содержит helper для доставки в `ServiceWorker`, используемый runtime injection flow.
- `tools/generators/cdp_worker_env.py` - подключается к `DedicatedWorker` и `SharedWorker` targets через CDP и применяет те же environment overrides, что и main page; поддерживает согласованность worker-side поверхностей `userAgent`, `language`, `languages`, `platform` и `hardwareConcurrency` до возобновления выполнения.
- `tools/tools_runtime/handle_cors_addon.py` - runtime addon для mitmproxy: CORS/preflight handling, фильтрация служебных доменов и координация request/response-side headers.
- `tools/tools_runtime/headers_adapter.py` - формирует реалистичные `Accept`/header-наборы под бренд и версию браузера.
- `tools/tools_runtime/helpers.py` - общие runtime/profile helpers для `main.py` и injection pipeline.
- `tools/tools_infra/vpn_utils.py` - управление жизненным циклом VPN и region-aligned setup с использованием `.ovpn` файлов из `cfg_vpn/`.
- `tools/tools_infra/overseer.py` - helper для логирования и диагностики на стороне Python.
- `tools/tools_native_check/` - helpers для нормативной проверки proxy/native-surface механики, включая registry checks и bridge-firewall tooling.

### JavaScript (`assets/scripts/window/core`)

- `core_window.js` - базовый слой для window-модулей и общей инфраструктуры `Core`. Здесь находятся общие wrappers, `Core.applyTargets`, безопасная установка дескрипторов, native shaping, маскировка `toString`, `invalid-this` contract и диагностические утилиты. Модуль задает contract-driven patching engine: downstream modules используют его как общий слой, который сохраняет native behavior/appearance, корректно обрабатывает `invalid receiver` и другие engine-level errors, не ломая ожидаемую native pass-through semantics.
- `context.js` - оркестрационный модуль для хуков и `Canvas`/`WebGL`: собирает `FernwehHooks`, проверяет наличие экспортированных хуков из модулей и регистрирует их в unified hook queue. Также это patching gateway: он оборачивает `getContext`, `toDataURL`, `toBlob`, `convertToBlob`, методы `CanvasRenderingContext2D` и `WebGL` prototypes, чтобы downstream modules проходили через одну точку применения, без proxy leaks, потери `this` и поломки нативной механики дескрипторов.
- `prng_seed.js` - gateway для `__GLOBAL_SEED` от Python backend к JavaScript environment. Модуль устанавливает seed-driven PRNG state и предоставляет deterministic seed context, который используется ниже по цепочке graphics/media patches.
- `bootstrap_hide.js` - инициализирует внутренний bootstrap-контекст и переносит значения из публичной поверхности `window` в hidden state. Создает и поддерживает `FernwehContext`, переносит bootstrap data во внутренние state objects, скрывает служебные поля от enumeration и удаляет временные global values после подготовки required owners and retention snapshots.
- `set_log.js` - JS-side logging/diagnostic emitter. Создает JS-side logger/diag buffer и unified `__DEGRADE__` channel, через который pipeline incidents собираются и нормализуются.
- `probe.js` - слой внутренней наблюдаемости и self-checking. Проверяет critical APIs после загрузки патчей и валидирует runtime invariants, descriptor integrity, call semantics и timeout behavior. Findings пишутся в тот же diagnostic stream.

### JavaScript (`assets/scripts/window/patches/*`)

- `graphics/canvas.js` - Canvas 2D/Offscreen hooks с seed-based noise и обертками, сохраняющими инварианты.
- `graphics/webgl.js`, `graphics/WEBGL_DICKts.js` - перехват `WebGL` плюс статические whitelist/parameter data.
- `graphics/webgpu.js`, `graphics/WebgpuWL.js` - перехват `WebGPU` плюс whitelist/limits data.
- `graphics/screen.js` - patching поверхностей `screen` и `visualViewport`.
- `media/audiocontext.js` - seed-based/media adjustments, согласованные с AudioContext.
- `media/font_module.js` - потребляет generated font configs, регистрирует `@font-face` и инжектит CSS/font-loading glue.
- `media/RTCPeerConnection.js` - нормализация ICE servers и non-relay/network-shaping logic.
- `navigator/nav_total_set.js`, `navigator/override_ua_data.js` - выравнивание navigator, UA-CH, language и client-hint surfaces на стороне window.
- `stealth/hide_webdriver.js` - маскировка webdriver и связанное native-surface hardening.
- `stealth/headers_interceptor.js`, `stealth/headers_bridge.js` - shaping request/header на JS-стороне, синхронизированный с CDP/mitmproxy path.
- `stealth/GeoOverride_source.js`, `stealth/TimezoneOverride_source.js` - geo/timezone overrides.

### JavaScript (`assets/scripts/workerscope`)

- `wrk.js` - координатор worker-scope: отвечает за перенос окружения и установку патчей в `DedicatedWorker`, `SharedWorker` и `ServiceWorker`.
- `WORKER_PATCH_SRC.js` - основной набор worker-side патчей, который применяется внутри worker-контекста после bootstrap/prelude этапов.
- `worker_bootstrap.js` - ранняя связка для `Worker`: перехватывает создание worker и передает туда подготовленный patch payload до выполнения пользовательского worker-кода.
- `sw_prelude.js` - prelude для `ServiceWorker`: подготавливает окружение перед применением worker-патчей.
- `set_reflect.js` - worker-side helper для reflection/native-surface механики: помогает сохранять ожидаемый вид функций, `toString`-поведение и совместимость с native-like поверхностью.

### Генерируемые файлы и шаблоны

- `assets/Manifest/fonts-manifest.json` - диагностический манифест (большой JSON); не является прямым runtime-источником, а служит диагностическим артефактом.
- `assets/JS_fonts_patch/font_patch.generated.js` - авто-генерируемый fonts patch, который потребляет `font_module.js`.
- `assets/templates/font_patch.template.j2` - Jinja2-шаблон, который `rand_met.py` использует для генерации JS patch.

### Шрифты

Готовые generated fonts уже лежат в `assets/generated_fonts/Win32` и `assets/generated_fonts/MacIntel` вместе со своими `fonts_index.json`. Для обычного запуска ничего докладывать и перекладывать не нужно.

В проект уже добавлен набор шрифтов, скачанных из Google Fonts и затем переименованных pipeline-ом проекта для runtime-использования. Это сделано специально, чтобы проект запускался без необходимости сначала искать и подготавливать свои шрифты.

Если хотите использовать свои шрифты, кладите только `.woff2` файлы в `assets/fonts_raw/` и запускайте проект обычным способом. При старте `rand_met.py` воспринимает `fonts_raw` как входную папку: проверяет файлы, пропускает неподходящие, переносит принятые шрифты в платформенную generated-папку, обновляет индекс и пересобирает runtime font patch. После принятия файл удаляется из `fonts_raw`.

Для своих шрифтов лучше использовать обычные текстовые шрифты. Не подходят icon fonts, emoji fonts, пустые/битые файлы, шрифты без базового ASCII, шрифты с ограничительными embedding flags и шрифты с экстремальными метриками.

### Логирование

- В консоли можно вызвать:
- `L.__PROBE__();` - вывод результатов probe-диагностики из `probe.js` в консоль DevTools; данные также сохраняются в JSON/HTML для чтения и обработки.

- `L.__DEGRADE__.getBuffer();` - вывод буфера `set_log.js` в консоль DevTools.

- Сохранение лога `set_log.js` в JSON:

  ```js
  (() => {
    const json = JSON.stringify(L.__DEGRADE__?.getBuffer?.() || [], null, 2);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `degrade-buffer-${stamp}.json` });
    a.click();
    URL.revokeObjectURL(url);
  })();
  ```
  
Вы также можете просто ввести `L.exportMyDebugLog()` в консоли DevTools, чтобы получить тот же результат.

### Переключатель mitmproxy

Откройте `main.py`, выберите один активный профиль и нажмите Play/F5 в VS Code.

С mitmproxy:

```python
MITMPROXY_ON = True
# MITMPROXY_OFF = True
```

Без mitmproxy:

```python
# MITMPROXY_ON = True
MITMPROXY_OFF = True
```

## Быстрый старт (Windows)

Установить зависимости:

```pwsh
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

Положить `.ovpn` в `configs\`.

Шрифты уже подготовлены в `assets\generated_fonts\`; для обычного запуска ничего делать не нужно. Если хотите добавить свои шрифты, положите `.woff2` файлы в `assets\fonts_raw\`, а startup font pipeline сам их обработает.

Запустить `main.py` из VS Code или терминала. Активный профиль mitmproxy выбирается внутри `main.py` переключателем выше.

* Если при установке возникает ошибка "permission denied", выполните:
  `pip install --no-cache-dir -r requirements.txt`

## Issues/TODO

- Интегрировать proxying для `getClientRects` / `getBoundingClientRect`.
- Реализовать ротацию TLS fingerprint через OpenSSL.
- События `success/ready` из мест, где фиксируется только факт установки hooks, считать только `applied`: механизм установлен, но результат еще не доказан.
- Эмитить финальный `success` только после postcondition на observable surface:
- Для font module эмитить `success` только если состояние наблюдаемо после текущей цепочки через `DOM/CSS/font-measurement surface`, а не только через внутренние структуры; иначе помечать `applied_but_not_effective` или не эмитить `success`.


**Коротко (TL;DR)**: исследовательский anti-fingerprinting pipeline на Python + JavaScript, который через CDP внедряет детерминированные seed-based патчи для Canvas/WebGL/WebGPU/Fonts/Headers.
**Работает на Windows** + опциональный proxy.

Browser Anti-Fingerprinting: Python + JavaScript

English version: see [README.md](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/README.md).

## Что это за проект
Система предназначена для оценки и смягчения современных browser fingerprinting surfaces: Canvas 2D/OffscreenCanvas, WebGL/WebGPU, Fonts, UA-CH/Headers.

Проект показывает, что изолированная рандомизация отдельных fingerprint-поверхностей практически бессмысленна. Осмысленная защита начинается только тогда, когда наблюдаемые поверхности браузера контролируются как единая согласованная система, а не патчатся по отдельности.


## Архитектура
Python (Selenium + undetected_chromedriver) + инъекция JavaScript-патчей/модулей через CDP для управления fingerprint surfaces. Mitmproxy опционален и переключается прямо в [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py).

<!-- PIPELINE_CONTRACT_MAP_START -->
## Карта контрактов pipeline

### Архитектура и владение состоянием
- [FernwehContext hidden state](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/2._Hidden_State_FernwehContext_Contract.md) - описывает canonical hidden state, module slots и owner routes.
- [Core apply methodology](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/11._CORE_METHODOLOGY_v3.md) - описывает preflight, wrapper, apply, rollback и работу с native references.
- [Function.prototype.toString essentials](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/7._FuctiontoString_ESSENTIALS_CUT.md) - задаёт native-looking форму функций и realm-local synchronization rules.


### Детерминизм и worker scopes
- [PRNG seed and global_seed](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/15._PRNG_SEED_CONTRACT.md) - описывает seed creation, transfer, canonical PRNG ownership и consumer rules.
- [Worker scope hidden state](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/13_.WRK_SCOPE_HIDDEN_UNIFIED.md) - задаёт parity для Dedicated, Shared и Service Worker без cross-realm object sharing.


### Патчинг public API
- [Public API implementation policy](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/1._Policy_implement_reg.md) - сохраняет descriptor shape, receiver checks, native error paths и proxy observability.
- [Pipeline entity typology](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/8._Entity_typology.md) - классифицирует containers, state owners, wrappers, carriers и diagnostic entities.
- [Method surfaces methodology](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/10._METHOD_SURFACES.md) - связывает method/accessor surfaces с нормативными routes установки.
- [Promise and entry/result accessor methodology](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/10.1_METHOD_PROMISE_AND_ENTRY_ACCESSOR_EXTENDED.md) - расширяет правила surface для asynchronous и accessor-driven paths.
- [Hooks methodology](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/6._Hooks_Methodology_v1.15.md) - описывает регистрацию Canvas/WebGL hooks и границы их выполнения.


### Runtime-домены
- [WebGL critical paths](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/9._WEBGL-CRITICAL.md) - описывает WebGL values, hooks и diagnostic routes.
- [Headers pipeline](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/12._HEADERS_CONTRACT.md) - координирует browser preferences, CDP, JavaScript и опциональный mitmproxy headers path.
- [Fonts compound](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/14._FONTS_CONTRACT.md) - описывает generated font assets, runtime loading, Canvas interaction и deterministic behavior.
- [RectsPatchModule](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/16._RectsPatchModule.md) является window-realm модулем влияния на DOM/SVG layout и rendering inputs, которые затем измеряются нативным Chromium через `DOMRect`, `DOMRectList`, `Element.getBoundingClientRect()`, `Element.getClientRects()`, `Range.getBoundingClientRect()`, `Range.getClientRects()` и SVG layout/geometry APIs.
- [Guard flag](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/5._GuardFlagSEED.md) - определяет guard lifecycle.


### Диагностика
- [DEGRADE diagnostics](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/3._DEGRADE_Contract.md) - определяет единый observable diagnostics channel и failure classes.
- [DEGRADE module template](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/3.1_DEGRADE_APPENDIX_MODULE_CODE_TEMPLATE.md) - даёт module-level diagnostic projection template.
- [DEGRADE calls summary](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/3.2_DEGRADE_CALLS_SUMMARY.md) - инвентаризирует текущие diagnostic call sites по pipeline.
<!-- PIPELINE_CONTRACT_MAP_END -->

## Этика и область применения
Инструменты предназначены только для тестирования, отладки и исследований. Не используйте их для обхода защитных механизмов, нарушения правил сайтов или законов.
Это инструмент для исследования приватности и устойчивости детекторов. Ответственность за применение лежит на пользователе.

## Важный дисклеймер
Это не "silver bullet" и не набор средств для полной анонимности. Современные техники fingerprinting (TLS fingerprints, behavioral checks, WebGL/WebGPU constraints, AudioContext API updates и т.д.) могут коррелировать сессии и деанонимизировать окружение даже при наличии патчей. Частичный контроль surface не даёт полной анонимности.

## Цели проекта
Основная цель проекта - комплексно исследовать браузер изнутри, понять, какие API используются и где могут быть каналы утечки данных.
Понять, как fonts, `WebGL`, `Client Hints`, plug-ins и другие компоненты влияют на fingerprint.
Сохранять наблюдаемость fingerprinting-поверхностей и их воспроизводимость через profiling и управление network layer.

## Конфигурация и принципы
Без хардкода: значения профиля собираются из dictionaries/profile data и попадают в `window.__*` только как входные bootstrap/bridge-значения. Реальная patch-логика, helpers и промежуточное состояние постепенно переносятся в module-local closure state, а не хранятся как долгоживущие public globals.
Совместимость с MDN/Chromium: hooks остаются внутри native API boundaries; closure-owned routing/helpers используются для сохранения receiver/owner contracts и предотвращения Illegal invocation.
`__GLOBAL_SEED` / DPR / device metrics синхронизируются через initialization variables.

## Статус проекта
Исследовательский и некоммерческий проект; публикуется "as is". Гарантий стабильности нет.
Проект разрабатывается одним автором, поэтому охват сценариев и окружений ограничен. Forks и contributions приветствуются.
Границы применимости см. в Issues/TODO.
Проверялось только на Windows. Другие OS не тестировались.
В целом pipeline инициализируется, скрипт запускается и выполняет назначенные задачи; пропатчена только часть surfaces.

## Лицензия
The Unlicense (Public Domain). Авторские и смежные права waived
to the extent possible. Разрешено копировать, изменять, публиковать, использовать, компилировать, продавать
и распространять проект, с attribution или без неё. Software is provided "AS IS".

## Требования
OS: Windows 10/11.
Python: 3.12 (рекомендуется 3.11+).

## Сторонние компоненты
`mitmproxy` (есть в [requirements.txt](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/requirements.txt), нужен только когда переключатель mitmproxy включён).
Chrome/Chromium - локальная копия Chrome for Testing; путь настроен в [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py).
Все Python-зависимости закреплены в [requirements.txt](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/requirements.txt).

## Режимы запуска

Есть одна точка входа: [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py).

Mitmproxy управляется маленьким видимым переключателем возле начала [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py):

```python
MITMPROXY_ON = True
# MITMPROXY_OFF = True
```

Это значит: запуск **с mitmproxy**. [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py) сам запускает `mitmdump`, направляет Chrome через `127.0.0.1:8082` и останавливает процесс при выходе.

Чтобы запустить **без mitmproxy**, поменяйте активную строку:

```python
# MITMPROXY_ON = True
MITMPROXY_OFF = True
```

В этом режиме [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py) не запускает `mitmdump`, не ставит proxy options для Chrome, и Chrome подключается напрямую.

Активной должна быть только одна строка. Если активны обе или обе закомментированы, запуск сразу завершится понятной ошибкой.

### Использование mitmproxy

✔ Проще ходить по сайтам без немедленных CORS/header challenges.
✔ Есть прямой доступ к CORS/headers/`Client Hints`.
✖ Требуется `mitmproxy`.
✖ Детекторы могут видеть TLS fingerprint mitmproxy как не "native".

### Без mitmproxy

✔ Более простой и лёгкий запуск.
✔ Нет локальной proxy-прослойки.
✖ Ограничения CORS могут снижать эффективность для реального browsing; этот режим лучше подходит как прямой browser/CDP/JS pipeline.

### Использование без встроенного VPN-клиента

Можно использовать любой другой VPN-клиент, включая управляемый через GUI.
Или работать вообще без VPN.


## Структура репозитория

- [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py) - runtime entrypoint и orchestration layer.
- [assets/scripts/window/core](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/scripts/window/core) - window bootstrap, Core, context, PRNG, логирование и дебаг.
- [assets/scripts/window/patches](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/scripts/window/patches) - window-side graphics, media, navigator и stealth patches.
- [assets/scripts/workerscope](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/scripts/workerscope) - bootstrap и patching для Dedicated, Shared и Service Worker.
- [assets/generated_fonts](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/generated_fonts) - bundled generated font assets и indexes.
- [assets/templates/font_patch.template.j2](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/templates/font_patch.template.j2) - template для generated font patch output.
- [profile_data_source](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/profile_data_source) - profile dictionaries и platform/browser data.
- [tools/generators](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/tools/generators) - font generation и CDP worker/service-worker helpers.
- [tools/tools_runtime](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/tools/tools_runtime) - runtime helper modules и header/CORS support.
- [tools/tools_infra](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/tools/tools_infra) - Python-утилиты логиования и настройки сети.
- [requirements.txt](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/requirements.txt) - список зависимостей Python.

## Обзор модулей (кратко)

### Python

- [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py) - главный orchestration entrypoint: собирает/загружает profile data, готовит CDP injection payloads, запускает Selenium + undetected-chromedriver, подключает runtime helpers и применяет staged JS pipeline к window и worker scopes.
- [profile_data_source](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/profile_data_source) - source dictionaries и базовые profile data для platform/browser composition: Win32/MacIntel shells, browser-version maps, plugin sets, permissions setting и profile defaults.
- [rand_met.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/generators/rand_met.py) - fonts pipeline: готовит per-platform generated fonts, cache metadata и [font_patch.generated.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/JS_fonts_patch/font_patch.generated.js) из Jinja2 template.
- [cdp_catapult.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/generators/cdp_catapult.py) - CDP-side payload assembly и `ServiceWorker` delivery helper, используемый runtime injection flow.
- [cdp_worker_env.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/generators/cdp_worker_env.py) - подключается к `DedicatedWorker` и `SharedWorker` targets через CDP и применяет те же environment overrides, что и main page, сохраняя worker-side `userAgent`, `language`, `languages`, `platform` и `hardwareConcurrency` accessor variables согласованными до возобновления выполнения.
- [handle_cors_addon.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/tools_runtime/handle_cors_addon.py) - mitmproxy runtime addon для CORS/preflight handling, service-domain filtering и request/response-side header coordination.
- [headers_adapter.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/tools_runtime/headers_adapter.py) - realistic Accept/header shaping по browser brand/version.
- [helpers.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/tools_runtime/helpers.py) - общие runtime/profile helpers, используемые [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py) и injection pipeline.
- [network_utils.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/tools_infra/network_utils.py) -  региональные сетевые настройки.
- [overseer.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/tools_infra/overseer.py) - Python-side logging/diagnostic helper.

### JavaScript ([assets/scripts/window/core](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/scripts/window/core))

- [core_window.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/core_window.js) - базовый слой для всех window-related modules и общей инфраструктуры `Core`. Здесь находятся common wrappers, `Core.applyTargets`, safe descriptor installation, native shaping и `toString` masking, `invalid-this` contract и diagnostic utilities. Здесь же реализованы `safeDefine`, wrapper factory для `method` / `accessor` / `ctor` и логика сохранения native-looking public API surface.
Задаёт contract-driven patching engine через `Core.applyTargets`. Downstream modules опираются на него как на support layer, который сохраняет native behavior and appearance, корректную обработку `invalid receiver` и других engine-level errors, не ломая expected native pass-through semantics.
- [context.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/context.js) - orchestration layer для `Canvas`/`WebGL`: собирает `FernwehHooks`, проверяет наличие hooks, экспортированных соответствующими модулями, и регистрирует их в unified hook queue. Также это patching gateway: он оборачивает `getContext`, `toDataURL`, `toBlob`, `convertToBlob`, методы `CanvasRenderingContext2D` и `WebGL` prototypes, чтобы downstream modules проходили через одну точку применения без proxy leaks, потери `this` и поломки native descriptor mechanics.
- [prng_seed.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/prng_seed.js) - gateway для `__GLOBAL_SEED` от Python backend к JavaScript environment. Модуль устанавливает seed-driven PRNG state и exposes deterministic seed context, который используется downstream graphics/media patches.
- [bootstrap_hide.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/bootstrap_hide.js) - инициализирует internal bootstrap context и переносит startup values из public window surface в private pipeline state. Создаёт и поддерживает `FernwehContext`, переносит bootstrap data во internal state objects, скрывает service fields от enumeration и удаляет temporary global values после подготовки required owners и retention snapshots.
- [set_log.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/set_log.js) - JS-side logging/diagnostic emitter. Создаёт JS-side logger/diag buffer и unified `__DEGRADE__` channel.
- [probe.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/probe.js) - pipeline observability и self-checking layer. Валидирует runtime invariants, descriptor integrity, call semantics и timeout behavior после загрузки patches.

### JavaScript ([assets/scripts/window/patches](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/scripts/window/patches))

- [canvas.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/graphics/canvas.js) - Canvas 2D/Offscreen hooks с seeded noise и invariant-preserving wrapping.
- [webgl.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/graphics/webgl.js), [WEBGL_DICKts.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/graphics/WEBGL_DICKts.js) - `WebGL` interception плюс static whitelist/parameter support.
- [webgpu.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/graphics/webgpu.js), [WebgpuWL.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/graphics/WebgpuWL.js) - `WebGPU` interception плюс whitelist/limits data.
- [screen.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/graphics/screen.js) - patching для `screen` и `visualViewport` surfaces.
- [audiocontext.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/media/audiocontext.js) - AudioContext-aligned seeded/media surface adjustments.
- [font_module.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/media/font_module.js) - потребляет generated font configs, регистрирует `@font-face` и инжектит CSS/font-loading glue.
- [rects.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/graphics/rects.js) — это window-realm модуль, влияющий на параметры компоновки и отрисовки DOM/SVG, которые впоследствии измеряются нативным кодом Chromium с помощью API для работы с `Rect` и геометрией/компоновкой SVG.
- [RTCPeerConnection.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/media/RTCPeerConnection.js) - ICE-server normalization и non-relay/network-shaping logic.
- [nav_total_set.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/navigator/nav_total_set.js), [override_ua_data.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/navigator/override_ua_data.js) - window-side alignment для navigator, UA-CH, language и client-hint surfaces.
- [hide_webdriver.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/stealth/hide_webdriver.js) - webdriver masking и related native-surface hardening.
- [headers_interceptor.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/stealth/headers_interceptor.js), [headers_bridge.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/stealth/headers_bridge.js) - JS-side request/header shaping, синхронизированный с CDP/mitmproxy path.
- [GeoOverride_source.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/stealth/GeoOverride_source.js), [TimezoneOverride_source.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/stealth/TimezoneOverride_source.js) - geo/timezone overrides.

### JavaScript ([assets/scripts/workerscope](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/scripts/workerscope))

- [wrk.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/workerscope/wrk.js) - worker-scope coordinator для environment propagation и patch installation across Dedicated/Shared/Service Workers.
- [WORKER_PATCH_SRC.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/workerscope/WORKER_PATCH_SRC.js) - worker-side patch source bundle, потребляемый bootstrap/prelude stages.
- [worker_bootstrap.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/workerscope/worker_bootstrap.js) - early worker bootstrap glue, который связывает worker creation с injected patch payload.
- [sw_prelude.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/workerscope/sw_prelude.js) - Service Worker prelude для установления environment до worker patch application.
- [set_reflect.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/workerscope/set_reflect.js) - worker-side reflection/native-surface helper.

### Генерируемые файлы и шаблоны

- [fonts-manifest.json](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/Manifest/fonts-manifest.json) - diagnostic manifest (large JSON).
- [font_patch.generated.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/JS_fonts_patch/font_patch.generated.js) - auto-generated fonts patch, потребляемый [font_module.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/media/font_module.js).
- [font_patch.template.j2](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/templates/font_patch.template.j2) - Jinja2 template, который [rand_met.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/generators/rand_met.py) использует для генерации JS patch.

### Шрифты

Ready-to-use generated fonts уже лежат в [assets/generated_fonts/Win32](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/generated_fonts/Win32) и [assets/generated_fonts/MacIntel](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/generated_fonts/MacIntel), вместе со своими generated font indexes. Для обычного запуска ничего докладывать и перекладывать не нужно.

Bundled fonts взяты из Google Fonts и затем переименованы pipeline-ом проекта для runtime use. Это сделано специально, чтобы проект запускался без необходимости сначала искать собственный набор шрифтов.

Если хотите использовать свои шрифты, кладите только `.woff2` files в [assets/fonts_raw](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/fonts_raw) и запускайте проект обычным способом. Во время startup [rand_met.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/generators/rand_met.py) воспринимает [assets/fonts_raw](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/fonts_raw) как intake folder: валидирует файлы, пропускает unsuitable fonts, копирует принятые файлы в platform-specific generated folder, обновляет index и пересобирает runtime font patch. После принятия файл удаляется из этой intake folder.

Для своих шрифтов лучше использовать обычные text fonts. Не подходят icon fonts, emoji fonts, empty/broken files, fonts без basic ASCII coverage, fonts с restrictive embedding flags или extreme metrics.

### Логирование

- В консоли можно вызвать:
- `L.__PROBE__();` - [probe.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/probe.js) выводит probe diagnostics в console, JSON и HTML files.

- `L.__DEGRADE__.getBuffer();` - [set_log.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/set_log.js) выводит buffer в console.

- [set_log.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/set_log.js) JSON log file saving:

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

Можно также просто ввести `L.exportMyDebugLog()` в DevTools console, чтобы получить тот же результат.

### Переключатель mitmproxy

Откройте [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py), выберите один active profile и нажмите Play/F5 в VS Code.

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

```powershell
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

Шрифты уже подготовлены в [assets/generated_fonts](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/generated_fonts); для обычного запуска ничего делать не нужно. Если хотите добавить свои шрифты, положите `.woff2` files в [assets/fonts_raw](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/fonts_raw), и startup font pipeline сам их обработает.

Запустите [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py) из VS Code или терминала. Активный профиль mitmproxy выбирается внутри [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py) переключателем выше.

* Если при установке возникает ошибка "permission denied", выполните:
  `pip install --no-cache-dir -r requirements.txt`

## Issues/TODO

- Реализовать ротацию TLS fingerprint через OpenSSL.
- События `success/ready` из мест, где фиксируется только факт установки hooks, считать только `applied`: механизм установлен, но результат ещё не доказан.
- Для font module эмитить `success` только если состояние наблюдаемо после текущей цепочки через `DOM/CSS/font-measurement surface`, а не только через внутренние структуры; иначе помечать `applied_but_not_effective` или не эмитить `success`.

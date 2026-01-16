# Readme_RUS.md

**Коротко (TL;DR):** исследовательский анти‑фингерпринтинг‑пайплайн (Python + JavaScript) с детерминированными (seed‑based) патчами Canvas/WebGL/WebGPU/Fonts/Headers через CDP.  
**Работает на Windows с VPN** (ProtonVPN/OpenVPN) + proxy.

Браузерный антифингерпринтинг на Python + JavaScript

English version: check README_EN.md.

## О чём этот проект
Этот проект — система обхода современных методов browser fingerprinting (Canvas 2D/Offscreen, WebGL/WebGPU, Fonts, UA‑CH/Headers).  
Архитектурно это стек Python (Selenium + undetected_chromedriver) + CDP‑инъекции JavaScript‑патчей (модулей) для управляемой подмены отпечатков, опциональное использование прокси.

## Этичность и область применения
Инструменты предназначены для тестирования, отладки и исследований совместимости. Не используйте для обхода мер безопасности и нарушений законодательства.  
Код предоставляется исключительно для исследования приватности и тестирования стойкости детекторов. Ответственность за применение лежит на пользователе. Не используйте на ресурсах, чьи условия это запрещают.

## Важный дисклеймер
Это не панацея и не «хакерский инструмент». Современные методы (TLS‑отпечатки, поведенческие проверки, контроль параметров WebGL/WebGPU, изменения в API AudioContext и др.) позволяют коррелировать сессии и деанонимизировать окружение даже при подменах. Контролируя часть поверхности, код не обеспечивает полную анонимизацию.

## Цель проекта
Исследовать браузер «изнутри»: какие API доступны и какие каналы утечки используются.  
Понять, как шрифты, WebGL, Client Hints, плагины и т. д. влияют на «фингерпринт» пользователя.  
Проверить, насколько можно контролировать фингерпринт и воспроизводить его через создание профилей и управление сетевой прослойкой.

## Конфигурация и принципы
- Без харда: значения профиля не забиты жёстко; формируются словарями и помещаются в `window.__*`.
- Совместимость с MDN/Chromium: хуки держатся в нативных границах API; избегаем Illegal invocation.
- `__GLOBAL_SEED` / DPR / device metrics: синхронизация значений через инициализационные переменные.

## Статус проекта
Проект исследовательский и некоммерческий, публикуется «как есть». Гарантий стабильности нет.  
Разрабатывался одним автором — охват всех сценариев и сред ограничен. Форки и доработки приветствуются.  
Подробные границы применимости см. в Issues / TODO.  
Проверено только на Windows + ProtonVPN (OpenVPN CLI). Другие OS/VPN не тестировались.  
Freeze: 2025‑09‑11 (принимаются правки документации и минорные фиксы).  
Общее состояние: пайплайн инициализируется, скрипт работает, выполняет свои задачи, отдельные поверхности подменяются.

## Лицензия
Проект распространяется по The Unlicense (Public Domain). Автор отказывается от авторских и смежных прав в максимально допустимой законом мере.  
Разрешено копировать, изменять, публиковать, использовать, компилировать, продавать и распространять исходники и сборки без условий; атрибуция не требуется. ПО поставляется «как есть».

## Предварительные требования
- OS: Windows 10/11 (батники и путь OpenVPN рассчитаны на Windows).  
- Python: 3.12 (рекомендуется 3.11+).

## Сторонние компоненты
- OpenVPN установлен локально (путь по умолчанию задаётся в `vpn_utils.py` и может быть изменён).  
- `mitmproxy` (включён в `requirements.txt`).  
- Chrome/Chromium — в `main.py` прописан локальный адрес для Chrome for Testing.  
- Все Python‑зависимости зафиксированы в `requirements.txt`.

## Режимы запуска
### Через mitmproxy (`main.py`)
✔ Можно ходить по сайтам без моментального «челленджа».  
✔ Видны CORS/заголовки/Client Hints напрямую.  
✖ Требуется установка и настройка mitmproxy.  
✖ TLS‑отпечаток прокси не «нативный».

### Без mitmproxy (`main_no_proxy.py`)
✔ Меньше внешних зависимостей.  
✖ Трудно использовать для реального серфинга из‑за ограничений CORS, но полезно как «чистая» модель API/JS.

Примечание: использование VPN жёстко зафиксировано в обоих режимах; без VPN скрипт не запускался и не тестировался.

### Использование без встроенного VPN-клиента
Скрипт можно запускать и без управления OpenVPN изнутри. В этом случае вы можете:  
✔ Использовать любой другой VPN-клиент (включая те, что управляются через графический интерфейс).    
✔ Или вовсе работать без VPN.  
Для этого достаточно в def main(): закомментировать вызовы методов экземпляра VPNClient, отвечающих за проверку, подготовку и подключение VPN:  
        #  client.verify()  
        #  client.prepare()  
        #  logger.info("preparation completed")  
        #  client.connect()  
        client.post()  
В таком режиме скрипт будет работать точно так же, как и раньше: все последующие шаги выполняются, только без остановки/запуска OpenVPN-процессов.  
Если у вас уже поднят VPN любым другим способом, скрипт просто будет использовать текущее сетевое окружение.



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
│   │   ├── GeoOverride_source.js
│   │   ├── RTCPeerConnection.js
│   │   ├── TimezoneOverride_source.js
│   │   ├── WORKER_PATCH_SRC.js
│   │   ├── audiocontext.js
│   │   ├── canvas.js
│   │   ├── context.js
│   │   ├── env_params.js
│   │   ├── font_module.js
│   │   ├── headers_interceptor.js
│   │   ├── hide_webdriver.js
│   │   ├── nav_total_set.js
│   │   ├── screen.js
│   │   ├── set_log.js
│   │   ├── webgl.js
│   │   ├── webgpu.js
│   │   └── wrk.js
│   └── templates/
│       └── font_patch.template.j2
├── configs/
├── logs/
├── profiles/
│   └── profile_20250909_112712_584426.json
├── user_data/
├── NO_PROXY_START.bat
├── PROXY_START.bat
├── WEBGL_DICKts.js
├── WebgpuWL.js
├── datashell_win32.py
├── depo_browser.py
├── handle_cors_addon.py
├── headers_adapter.py
├── macintel.py
├── main.py
├── main_no_proxy.py
├── mitmproxy_full_log.txt
├── overseer.py
├── plugins_dict.py
├── profile.json
├── rand_met.py
├── requirements.txt
├── tools.py
└── vpn_utils.py
```

## Обзор модулей (кратко)
### Python (корень)
- `main.py` — точка оркестрации: Selenium + undetected‑chromedriver, генерация/применение профиля, инъекция JS‑патчей через основной bundle, управление CDP, прокси‑режим.  
- `main_no_proxy.py` — альтернативная конфигурация без использования прокси (ограничения CORS).  
- `vpn_utils.py` — управление VPN‑процессом: выбор случайного `.ovpn` из `configs/`, запуск VPN, подготовка региональных полей профиля (timezone/geolocation).  
- `handle_cors_addon.py` — аддон mitmproxy: корректные CORS (включая preflight), фильтрация служебных доменов, кольцевой буфер логов; читает `profiles/profile.json` для ожидаемых Client Hints.  
- `headers_adapter.py` — реалистичный `Accept` под бренд/мажорную версию.  
- `rand_met.py` — пайплайн шрифтов: per‑platform `generated_fonts/...`, эмитит `fonts_index.json` и генерирует `assets/JS_fonts_patch/font_patch.generated.js` из шаблона Jinja2.  
- `tools.py` — хелперы профиля/метрик устройства (UA‑CH, языки, версии браузера, утилиты заголовков).  
- `depo_browser.py` — словарь версий (Chrome/Firefox/Edge/Safari) для состава профиля.  
- `plugins_dict.py` — наборы «плагинов» для профилей.  
- `datashell_win32.py` / `macintel.py` — платформенные словари для Win32 / MacIntel.  
- `WEBGL_DICKts.js` / `WebgpuWL.js` — whitelists/limits/parameters для WebGL/WebGPU.  
- `overseer.py` — Python‑логгер.

### JavaScript (`assets/scripts`)
- `set_log.js` — JS‑логирование.  
- `env_params.js` — инициализация PRNG на базе `__GLOBAL_SEED`.  
- `hide_webdriver.js` — маскировка webdriver.  
- `nav_total_set.js`, `screen.js`, `audiocontext.js` — корректировки `navigator`/`screen`/`AudioContext` в рамках политики сидирования/шума.  
- `font_module.js` — потребляет `window.fontPatchConfigs`; регистрирует `@font-face`, инжектит CSS шрифтов.  
- `context.js` — регистрация хуков и цепочки применения.  
- `canvas.js` — хуки Canvas 2D/Offscreen с учётом DPR и «edge‑respecting» шумом.  
- `webgl.js` / `webgpu.js` — хуки WebGL/WebGPU; перехват параметров/расширений; дополняются статическими whitelist‑ами (см. выше).  
- `headers_interceptor.js` — генератор `Accept` под бренд/версию; safelisted‑патч для fetch/XHR на cross‑origin; синхронизация с CDP Fetch‑мостом.  
- `RTCPeerConnection.js` — фильтрация non‑relay ICE‑кандидатов; нормализация ICE‑серверов.  
- `GeoOverride_source.js` / `TimezoneOverride_source.js` — оверрайды гео/часового пояса.  
- `wrk.js` / `WORKER_PATCH_SRC.js` — `EnvBus` / `EnvHub`: снапшоты окружения, синхронизация Dedicated/Shared/Service Worker (UA/UA‑CH, inline bootstrap).

### Генерируемые файлы и шаблоны
- `assets/Manifest/fonts-manifest.json` — диагностический манифест (большой JSON).  
- `assets/JS_fonts_patch/font_patch.generated.js` — автогенерируемый шрифтовой патч, потребляется `font_module.js`.  
- `assets/templates/font_patch.template.j2` — шаблон Jinja2, который использует `rand_met.py` для генерации JS‑патча.

### Лаунчеры
- `NO_PROXY_START.bat` — venv → `python main_no_proxy.py`.  
- `PROXY_START.bat` — venv → mitmproxy (addon) → `python main.py`.

## Быстрый старт (Windows)
Установить зависимости:
```CMD
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

Положить `.ovpn` в папку `configs\`.  
Поместить `*.woff2` в `assets\fonts_raw\`.

Минимальное/максимальное количество — любое, но число должно быть задано в `rand_met.py` в секции “Step 3: Select a random amount n fonts for fingerPrint”; иначе скрипт работать не будет.

Запуск:
```powershell
:: с прокси
PROXY_START.bat

:: без прокси
NO_PROXY_START.bat
```

*Если при установке словите «permission denied», выполните:*  
```CMD
pip install --no-cache-dir -r requirements.txt
```

## Issues/TODO
- Синхронизация window ↔ WorkerScope с момента старта (language(s), hardwareConcurrency, deviceMemory, userAgentData через Hub; геттеры на `WorkerNavigator.prototype`).  
- Интегрировать модуль `getClientRects` / `getBoundingClientRect` (проксирование).  
- Доработать корректный патч `toBlob` / `convertToBlob`, чтобы избежать Illegal invocation на краях.  
- Фикс для Adapter “core‑features‑and‑limits” для WebGPU.  
- Перенос патчей на прототипы (не на инстансы) + корректные дескрипторы.  
- Ротация TLS‑отпечатка через OpenSSL.  

З.Ы. В качестве бонуса добавлены инструменты для предварительной подготовки/обработки шрифтов.

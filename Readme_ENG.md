# Readme_ENG.md

**TL;DR**: Research-grade anti-fingerprinting pipeline (Python + JavaScript) injecting deterministic, seed-based patches for Canvas/WebGL/WebGPU/Fonts/Headers via CDP.  
**Runs on Windows with VPN** (ProtonVPN/OpenVPN) + proxy  

Browser Anti-Fingerprinting: Python + JavaScript

Русская версия: см. Readme_RUS.md

## What this project is about
The system has been designed to evaluate and mitigate modern browser fingerprinting surfaces (Canvas 2D/OffscreenCanvas, WebGL/WebGPU, Fonts, UA-CH/Headers).

## Architecture
Python (Selenium + undetected_chromedriver) + JavaScript patches (modules) injection via CDP to control fingerprint surfaces, proxy application is available as a switchable option.

## Ethics & scope
The tools are intended for testing, debugging and research purposes only. Do not use to bypass security controls or violate site policies or laws.  
This is a privacy research tool and detector resilience tester. Remember that you are responsible for how you use it.

## Important disclaimer
This is not a "silver bullet" or an anonymity toolkit. Modern FP techniques (TLS fingerprints, behavioral checks, WebGL/WebGPU constraints, AudioContext API updates, etc.) can correlate sessions and deanonymize environments even with patches. Partial control of the surface does not provide full anonymity.

## Project goals
The primary objective of the project was to conduct a comprehensive examination of the browser from an internal perspective, with the aim of identifying the APIs in use and any data-leak channels that may be present.  
Understand how fonts, WebGL, Client Hints, plug-ins and other components affect the fingerprint.  
Maintain oversight of fingerprinting and its replication through profiling and network layer management.

## Configuration & principles
There is no hardcoding: the values of the profile variables are not hardwired; instead, they are compiled into dictionaries and exported to `window.__*`. Then, they are assigned to the respective profile fields.  
MDN/Chromium compatibility: hooks stay within native API boundaries; avoid Illegal invocation.  
`__GLOBAL_SEED` / DPR / device metrics: synchronized through initialization variables.

## Project status
Research / non-commercial; released “as is”. No stability guarantees.  
Built by a single author — scenario/OS coverage is limited. Forks and contributions are welcome.  
See Issues/TODO for applicability limitations.  
Executed only on Windows + ProtonVPN (OpenVPN CLI). Other OS/VPNs not tested.  
Freeze: 2025-09-11 (docs & fixes will be considered).  
In sum, the pipeline is being initialised and the script is being executed. The designated tasks are being carried out, just several surfaces have been patched.

## License
The Unlicense (Public Domain). Copyright and related rights are waived  
to the extent possible. You may copy, modify, publish, use, compile, sell,  
and distribute, with or without attribution. Software is provided “AS IS”.

## Requirements
OS: Windows 10/11 (batch files and OpenVPN path assume Windows).  
Python: 3.12 (3.11+ recommended).

## 3rd-party
OpenVPN installed locally (default path is set in `vpn_utils.py`, can be changed).  
`mitmproxy` (in `requirements.txt`).  
Chrome/Chromium — local copy of Chrome for Testing path configured in `main.py`.  
All Python deps are pinned in `requirements.txt`.

## Run modes
### With mitmproxy (`main.py`)

✔ Easier browsing without immediate challenges.  
✔ Direct visibility into CORS/headers/Client Hints.  
✖ Requires installing/setting up mitmproxy.  
✖ Detectors may identify mitmproxy TLS fingerprint as not "native".

### Without mitmproxy (`main_no_proxy.py`)
✔ Fewer external deps.  
✖ CORS limitations hinder the effectiveness for real browsing; nevertheless, the model is advantageous as a "pure API/JS" paradigm.  
Note: VPN usage is enforced in both modes; the script was not run/tested without VPN.

### Using without a built-in VPN client
The script can be run without controlling OpenVPN. In this case, you can:  
✔ Use any other VPN client (including one controlled via a graphical interface).  
✔ Or work without VPN at all.  
To accomplish this, just comment calls to the VPNClient instance methods responsible for VPN authentication, setup, and connection in def main():  
        # client.verify()  
        # client.prepare()  
        # logger.info("Preparation completed")  
        # client.connect()  
        client.post()  
In this mode, the script works exactly as before, performing all subsequent steps without stopping or starting OpenVPN processes.  
If you already have a VPN set up in any other way, the script will simply use the current network environment.



## Repository structure
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

## Modules overview (short)

### Python (root)

- `main.py` — orchestration: Selenium + undetected-chromedriver, profile build/apply, JS patch injection via the main bundle, CDP control, mitmproxy mode.
- `main_no_proxy.py` — alternative run without mitmproxy (CORS constraints).
- `vpn_utils.py` — VPN lifecycle: pick random `.ovpn` from `configs/`, start VPN, prepare regional profile bits (timezone/geolocation).
- `handle_cors_addon.py` — mitmproxy addon: proper CORS (incl. preflight), service-domain filtering, ring-buffer logs; consumes `profiles/profile.json` for expected Client Hints.
- `headers_adapter.py` — realistic Accept builder by brand/major version.
- `rand_met.py` — fonts pipeline: per-platform `generated_fonts/...`, emits `fonts_index.json` and generates `assets/JS_fonts_patch/font_patch.generated.js` from a Jinja2 template.
- `tools.py` — profile/device metrics helpers (UA-CH, languages, browser versions, header utilities).
- `depo_browser.py` — browser versions map (Chrome/Firefox/Edge/Safari) for profile composition.
- `plugins_dict.py` — plugin sets per browser for profile composition.
- `datashell_win32.py` / `macintel.py` — platform dictionaries for Win32 / MacIntel.
- `WEBGL_DICKts.js` / `WebgpuWL.js` — static whitelists/limits/parameters for WebGL/WebGPU.
- `overseer.py` — Python logger.

### JavaScript (`assets/scripts`)

- `set_log.js` — JS logging helper.
- `env_params.js` — initializes PRNG based on `__GLOBAL_SEED`.
- `hide_webdriver.js` — webdriver masking.
- `nav_total_set.js`, `screen.js`, `audiocontext.js` — navigator/screen/AudioContext adjustments aligned with the seeding/noise policy.
- `font_module.js` — consumes `window.fontPatchConfigs`; registers `@font-face`, injects CSS for fonts.
- `context.js` — hook registration and application chains for patch points.
- `canvas.js` — Canvas 2D/Offscreen hooks with DPR-aware, edge-respecting noise.
- `webgl.js` / `webgpu.js` — WebGL/WebGPU hooks; parameter/extension interception; complemented by static whitelists (see above).
- `headers_interceptor.js` — Accept generator by brand/version; safelisted cross-origin patch for fetch/XHR; synchronized with the CDP Fetch bridge.
- `RTCPeerConnection.js` — non-relay ICE filtering; ICE servers normalization.
- `GeoOverride_source.js` / `TimezoneOverride_source.js` — geo/timezone overrides.
- `wrk.js` / `WORKER_PATCH_SRC.js` — EnvBus / EnvHub: environment snapshots, Dedicated/Shared/Service Worker sync (UA/UA-CH, inline bootstrap).

### Generated files & templates

- `assets/Manifest/fonts-manifest.json` — diagnostic manifest (large JSON).
- `assets/JS_fonts_patch/font_patch.generated.js` — auto-generated fonts patch, consumed by `font_module.js`.
- `assets/templates/font_patch.template.j2` — Jinja2 template used by `rand_met.py` to generate the JS patch.

### Launchers

- `NO_PROXY_START.bat` — venv → `python main_no_proxy.py`.
- `PROXY_START.bat` — venv → mitmproxy (addon) → `python main.py`.

## Quick start (Windows)

Install deps:

```powershell
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

Put `.ovpn` into `configs\`.

Place `*.woff2` into `assets\fonts_raw\`.

Run:

```powershell
:: with proxy
PROXY_START.bat

:: without proxy
NO_PROXY_START.bat
```

* If you face error "permission denied" during installation → run
  `pip install --no-cache-dir -r requirements.txt`

## Issues/TODO

- Synchronize window ↔ SharedWorkerScope completely.
- Integrate `getClientRects` / `getBoundingClientRect` proxying.
- Fix Adapter “core-features-and-limits” for WebGPU.
- Switch hooks patching to prototypes (not instances) + correct descriptors.
- Implement TLS fingerprint rotation via OpenSSL.

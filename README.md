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
│   ├── macintel.py
│   ├── plugins_dict.py
│   └── profile.json
├── profiles/
├── tools/
│   ├── generators/
│   │   ├── cdp_catapult.py
│   │   └── rand_met.py
│   ├── tools_infra/
│   │   ├── overseer.py
│   │   └── vpn_utils.py
│   ├── tools_native_check/
│   │   ├── core_bridge_firewall.py
│   │   ├── PROXY_MECHANICS_REGISTRY.md
│   │   └── validate_proxy_mechanics_registry.ps1
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

## Modules overview (short)

### Python

- `main.py` — main orchestration entrypoint: builds/loads profile data, prepares CDP injection payloads, launches Selenium + undetected-chromedriver, wires runtime helpers, and applies the staged JS pipeline to window and worker scopes.
- `profile_data_source/` — source dictionaries and base profile data for platform/browser composition: Win32/MacIntel shells, browser-version maps, plugin sets, and profile defaults.
- `tools/generators/rand_met.py` — fonts pipeline: prepares per-platform generated fonts, cache metadata, and `assets/JS_fonts_patch/font_patch.generated.js` from the Jinja2 template.
- `tools/generators/cdp_catapult.py` — CDP-side payload assembly and delivery helper used by the runtime injection flow.
- `tools/tools_runtime/handle_cors_addon.py` — mitmproxy runtime addon for CORS/preflight handling, service-domain filtering, and request/response-side header coordination.
- `tools/tools_runtime/headers_adapter.py` — realistic Accept/header shaping by browser brand/version.
- `tools/tools_runtime/helpers.py` — shared runtime/profile helpers used by `main.py` and the injection pipeline.
- `tools/tools_infra/vpn_utils.py` — VPN lifecycle and region-aligned setup using `.ovpn` files from `cfg_vpn/`.
- `tools/tools_infra/overseer.py` — Python-side logging/diagnostic helper.
- `tools/tools_native_check/` — normative validation helpers for proxy/native-surface mechanics, including registry checks and bridge-firewall tooling.

### JavaScript (`assets/scripts/window/core`)

- `core_window.js` — main window-side bootstrap/orchestrator that composes the staged patch pipeline and controls when modules are applied.
- `context.js` — hook registration, chaining, and shared patch mechanics for window-side modules.
- `prng_seed.js` — installs seed-driven PRNG state and exposes the deterministic seed context used downstream by graphics/media patches.
- `bootstrap_hide.js` — early bootstrap/hiding helpers that must run before the broader window patch set.
- `probe.js` — runtime probe/diagnostic surface for verifying whether critical stages were installed.
- `set_log.js` — JS-side logging/diagnostic emitter.

### JavaScript (`assets/scripts/window/patches/*`)

- `graphics/canvas.js` — Canvas 2D/Offscreen hooks with seeded noise and invariant-preserving wrapping.
- `graphics/webgl.js`, `graphics/WEBGL_DICKts.js` — WebGL interception plus static whitelist/parameter support.
- `graphics/webgpu.js`, `graphics/WebgpuWL.js` — WebGPU interception plus whitelist/limits data.
- `graphics/screen.js` — `screen` and `visualViewport` surface patching.
- `media/audiocontext.js` — AudioContext-aligned seeded/media surface adjustments.
- `media/font_module.js` — consumes generated font configs, registers `@font-face`, and injects CSS/font-loading glue.
- `media/RTCPeerConnection.js` — ICE-server normalization and non-relay/network-shaping logic.
- `navigator/nav_total_set.js`, `navigator/override_ua_data.js`, `navigator/lang_win_scope.js` — navigator, UA-CH, language, and client-hint surface alignment on the window side.
- `stealth/hide_webdriver.js` — webdriver masking and related native-surface hardening.
- `stealth/headers_interceptor.js`, `stealth/headers_bridge.js` — request/header shaping on the JS side, synchronized with the CDP/mitmproxy path.
- `stealth/GeoOverride_source.js`, `stealth/TimezoneOverride_source.js` — geo/timezone overrides.

### JavaScript (`assets/scripts/workerscope`)

- `wrk.js` — worker-scope coordinator for environment propagation and patch installation across Dedicated/Shared/Service Workers.
- `WORKER_PATCH_SRC.js` — worker-side patch source bundle consumed by bootstrap/prelude stages.
- `worker_bootstrap.js` — early worker bootstrap glue that connects worker creation with the injected patch payload.
- `sw_prelude.js` — Service Worker prelude used to establish the environment before worker patch application.
- `set_reflect.js` — worker-side reflection/native-surface helper.

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

- Synchronize window Canvas ↔ SharedWorkerScope Canvas.
- Synchronize window GPU ↔ ServiceWorkerScope GPU.
- Integrate `getClientRects` / `getBoundingClientRect` proxying.
- Implement TLS fingerprint rotation via OpenSSL.
- Treat `success/ready` events from places that only record hook installation only as `applied`: the mechanism is installed, but the result is not yet proven.
- Emit final `success` only after a postcondition on the observable surface.
- For the font module, emit `success` only if the state is observable after the current chain through the `DOM/CSS/font-measurement surface`, not only through internal structures; otherwise mark `applied_but_not_effective` or emit no `success`.

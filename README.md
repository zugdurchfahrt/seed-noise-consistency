**TL;DR**: Research-grade anti-fingerprinting pipeline (Python + JavaScript) injecting deterministic, seed-based patches for Canvas/WebGL/WebGPU/Fonts/Headers via CDP.  
**Runs on Windows with VPN** (ProtonVPN/OpenVPN) + optional proxy  

Browser Anti-Fingerprinting: Python + JavaScript

Russian version: see [Readme_RUS.md](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/Readme_RUS.md).

## What this project is about
The system has been designed to evaluate and mitigate modern browser fingerprinting surfaces (Canvas 2D/OffscreenCanvas, WebGL/WebGPU, Fonts, UA-CH/Headers).

## Architecture
Python (Selenium + undetected_chromedriver) + JavaScript patches (modules) injection via CDP to control fingerprint surfaces. Mitmproxy is optional and is switched directly in [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py).

<!-- PIPELINE_CONTRACT_MAP_START -->
## Pipeline Contract Map

Detailed rules live in the external contracts repository; this README keeps only the project-level map.

### Architecture and ownership
- [FernwehContext hidden state](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/2._Hidden_State_FernwehContext_Contract.md) - Defines canonical hidden state, module slots, and owner routes.
- [Core apply methodology](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/11._CORE_METHODOLOGY_v3.md) - Documents preflight, wrapper, apply, rollback, and native-reference handling.
- [Function.prototype.toString essentials](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/7._FuctiontoString_ESSENTIALS_CUT.md) - Defines native-looking function shape and realm-local synchronization rules.

### Public API patching
- [Public API implementation policy](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/1._Policy_implement_reg.md) - Preserves descriptor shape, receiver checks, native error paths, and proxy observability.
- [Pipeline entity typology](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/8._Entity_typology.md) - Classifies containers, state owners, wrappers, carriers, and diagnostic entities.
- [Method surfaces methodology](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/10._METHOD_SURFACES.md) - Maps method and accessor surfaces to their normative installation routes.
- [Promise and entry/result accessor methodology](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/10.1_METHOD_PROMISE_AND_ENTRY_ACCESSOR_EXTENDED.md) - Extends the surface rules for asynchronous and accessor-driven paths.
- [Hooks methodology](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/6._Hooks_Methodology_v1.15.md) - Describes Canvas/WebGL hook registration and execution boundaries.


### Runtime domains
- [WebGL critical paths](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/9._WEBGL-CRITICAL.md) - Maps WebGL values, hooks, and diagnostic routes.
- [Headers pipeline](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/12._HEADERS_CONTRACT.md) - Coordinates browser preferences, CDP, JavaScript, and optional mitmproxy headers.
- [Fonts compound](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/14._FONTS_CONTRACT.md) - Documents generated font assets, runtime loading, Canvas interaction, and deterministic behavior.
- [Guard flag](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/5._GuardFlagSEED.md) - Defines guard lifecycle.

### Determinism and worker scopes
- [PRNG seed and global_seed](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/15._PRNG_SEED_CONTRACT.md) - Documents seed creation, transfer, canonical PRNG ownership, and consumer rules.
- [Worker scope hidden state](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/13_.WRK_SCOPE_HIDDEN_UNIFIED.md) - Defines Dedicated, Shared, and Service Worker parity without cross-realm object sharing.


### Diagnostics
- [DEGRADE diagnostics](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/3._DEGRADE_Contract.md) - Defines the unified observable diagnostics channel and failure classes.
- [DEGRADE module template](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/3.1_DEGRADE_APPENDIX_MODULE_CODE_TEMPLATE.md) - Provides the module-level diagnostic projection template.
- [DEGRADE calls summary](https://github.com/zugdurchfahrt/seed-noise-consistency-contracts/blob/main/3.2_DEGRADE_CALLS_SUMMARY.md) - Inventories current diagnostic call sites across the pipeline.
<!-- PIPELINE_CONTRACT_MAP_END -->

## Ethics & scope
The tools are intended for testing, debugging and research purposes only. Do not use to bypass security controls or violate site policies or laws.  
This is a privacy research tool and detector resilience tester. Remember that you are responsible for how you use it.

## Important disclaimer
This is not a "silver bullet" or an anonymity toolkit. Modern FP techniques (TLS fingerprints, behavioral checks, WebGL/WebGPU constraints, AudioContext API updates, etc.) can correlate sessions and deanonymize environments even with patches. Partial control of the surface does not provide full anonymity.

## Project goals
The primary objective of the project was to conduct a comprehensive examination of the browser from an internal perspective, with the aim of identifying the APIs in use and any data-leak channels that may be present.  
Understand how fonts, `WebGL`, `Client Hints`, plug-ins and other components affect the fingerprint.  
Maintain oversight of fingerprinting and its replication through profiling and network layer management.

## Configuration & principles
There is no hardcoding: profile values are assembled from dictionaries/profile data and exposed through `window.__*` only as bootstrap/bridge inputs. The actual patch logic, helpers, and intermediate state are progressively moved into module-local closure state instead of being kept as long-lived public globals.  
MDN/Chromium compatibility: hooks stay within native API boundaries, with closure-owned routing/helpers used to preserve receiver/owner contracts and avoid Illegal invocation.  
`__GLOBAL_SEED` / DPR / device metrics: synchronized through initialization variables.

## Project status
Research / non-commercial; released “as is”. No stability guarantees.  
Built by a single author — scenario/OS coverage is limited. Forks and contributions are welcome.  
See Issues/TODO for applicability limitations.  
Executed only on Windows + ProtonVPN (OpenVPN CLI). Other OS/VPNs not tested.  
In sum, the pipeline is being initialised and the script is being executed. The designated tasks are being carried out, just several surfaces have been patched.

## License
The Unlicense (Public Domain). Copyright and related rights are waived  
to the extent possible. You may copy, modify, publish, use, compile, sell,  
and distribute, with or without attribution. Software is provided “AS IS”.

## Requirements
OS: Windows 10/11 (OpenVPN path assumes Windows).  
Python: 3.12 (3.11+ recommended).

## 3rd-party
OpenVPN installed locally (default path is set in [vpn_utils.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/tools_infra/vpn_utils.py), can be changed).
`mitmproxy` (in [requirements.txt](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/requirements.txt), only needed when the mitmproxy switch is ON).
Chrome/Chromium — local copy of Chrome for Testing path configured in [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py).
All Python deps are pinned in [requirements.txt](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/requirements.txt).

## Run modes

There is one entrypoint: [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py).

Mitmproxy is controlled by a small visible switch near the top of [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py):

```python
MITMPROXY_ON = True
# MITMPROXY_OFF = True
```

This means: run **with mitmproxy**. [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py) starts `mitmdump`, sends Chrome through `127.0.0.1:8082`, and stops the process on exit.

To run **without mitmproxy**, flip the two lines:

```python
# MITMPROXY_ON = True
MITMPROXY_OFF = True
```

In this mode, [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py) does not start `mitmdump`, does not set Chrome proxy options, and Chrome connects directly.

Only one line must be active. If both are active or both are commented, startup fails immediately with a clear error.

### With mitmproxy

✔ Easier browsing without immediate CORS/header challenges.  
✔ Direct visibility into CORS/headers/`Client Hints`.  
✖ Requires `mitmproxy`.  
✖ Detectors may identify mitmproxy TLS fingerprint as not "native".

### Without mitmproxy

✔ Simpler and lighter startup.  
✔ No local proxy layer.  
✖ CORS limitations may reduce effectiveness for real browsing; this mode is better as a direct browser/CDP/JS pipeline.

Note: VPN usage is enforced in both modes unless you disable the VPN calls separately.

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

- [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py) - runtime entrypoint and orchestration layer.
- [assets/scripts/window/core](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/scripts/window/core) - window bootstrap, Core, context, PRNG, logging, and probes.
- [assets/scripts/window/patches](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/scripts/window/patches) - window-side graphics, media, navigator, and stealth patches.
- [assets/scripts/workerscope](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/scripts/workerscope) - Dedicated, Shared, and Service Worker bootstrap and patching.
- [assets/generated_fonts](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/generated_fonts) - bundled generated font assets and indexes.
- [assets/templates/font_patch.template.j2](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/templates/font_patch.template.j2) - template for generated font patch output.
- [profile_data_source](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/profile_data_source) - profile dictionaries and platform/browser data.
- [tools/generators](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/tools/generators) - font generation and CDP worker/service-worker helpers.
- [tools/tools_runtime](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/tools/tools_runtime) - runtime helper modules and header/CORS support.
- [tools/tools_infra](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/tools/tools_infra) - VPN and Python-side diagnostic helpers.
- [requirements.txt](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/requirements.txt) - pinned Python dependency list.

## Modules overview (short)

### Python

- [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py) - main orchestration entrypoint: builds/loads profile data, prepares CDP injection payloads, launches Selenium + undetected-chromedriver, wires runtime helpers, and applies the staged JS pipeline to window and worker scopes.
- [profile_data_source](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/profile_data_source) - source dictionaries and base profile data for platform/browser composition: Win32/MacIntel shells, browser-version maps, plugin sets, permissions setting, and profile defaults.
- [rand_met.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/generators/rand_met.py) - fonts pipeline: prepares per-platform generated fonts, cache metadata, and [font_patch.generated.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/JS_fonts_patch/font_patch.generated.js) from the Jinja2 template.
- [cdp_catapult.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/generators/cdp_catapult.py) - CDP-side payload assembly and `ServiceWorker` delivery helper used by the runtime injection flow.
- [cdp_worker_env.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/generators/cdp_worker_env.py) - attaches to `DedicatedWorker` and `SharedWorker` targets over CDP and applies the same environment overrides used by the main page, keeping worker-side `userAgent`, `language`, `languages`, `platform`, and `hardwareConcurrency` accessor variables aligned before execution resumes.
- [handle_cors_addon.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/tools_runtime/handle_cors_addon.py) - mitmproxy runtime addon for CORS/preflight handling, service-domain filtering, and request/response-side header coordination.
- [headers_adapter.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/tools_runtime/headers_adapter.py) - realistic Accept/header shaping by browser brand/version.
- [helpers.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/tools_runtime/helpers.py) - shared runtime/profile helpers used by [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py) and the injection pipeline.
- [vpn_utils.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/tools_infra/vpn_utils.py) - VPN lifecycle and region-aligned setup using `.ovpn` files from [cfg_vpn](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/cfg_vpn).
- [overseer.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/tools_infra/overseer.py) - Python-side logging/diagnostic helper.

### JavaScript ([assets/scripts/window/core](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/scripts/window/core))

- [core_window.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/core_window.js) - provides the foundational layer for all other window-related modules and initializes the shared `Core` infrastructure. It contains the key runtime mechanisms: common wrappers, `Core.applyTargets`, safe descriptor installation, native shaping and `toString` masking, the `invalid-this` contract, and diagnostic utilities. It is also the place where `safeDefine`, the wrapper factory for `method` / `accessor` / `ctor`, and the logic for preserving the API's native-looking surface are implemented.
Defines the contract-driven patching engine through `Core.applyTargets`. Downstream modules rely on it as the support layer preserving native behavior and appearance, correct handling of `invalid receiver` and other engine-level errors while maintaining the expected native pass-through semantics.
- [context.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/context.js) - acts as an orchestration layer for `Canvas`/`WebGL`: it assembles `FernwehHooks`, validates the presence of hooks exported from respective modules, then registers them in a unified hook queue. It also acts as a patching gateway: it wraps `getContext`, `toDataURL`, `toBlob`, `convertToBlob`, `CanvasRenderingContext2D` methods, and `WebGL` prototypes so that downstream modules pass through a single point of application, preventing proxy leaks, `this` loss, and broken native descriptor mechanics.
- [prng_seed.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/prng_seed.js) - gateway for `__GLOBAL_SEED` from the Python backend to the JavaScript environment. Module installs seed-driven PRNG state and exposes the deterministic seed context used downstream by graphics/media patches.
- [bootstrap_hide.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/bootstrap_hide.js) - initializes the internal bootstrap context and moves startup values out of the public window surface into private pipeline state. It creates and maintains `FernwehContext`, transfers bootstrap data into internal state objects, hides service fields from enumeration, and removes temporary global values once the required owners and retention snapshots are ready.
- [set_log.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/set_log.js) - JS-side logging/diagnostic emitter. Creates a JS-side logger/diag buffer and a unified `__DEGRADE__` channel.
- [probe.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/probe.js) - pipeline observability and self-checking layer. It validates runtime invariants, descriptor integrity, call semantics, and timeout behavior after patches are loaded.

### JavaScript ([assets/scripts/window/patches](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/scripts/window/patches))

- [canvas.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/graphics/canvas.js) - Canvas 2D/Offscreen hooks with seeded noise and invariant-preserving wrapping.
- [webgl.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/graphics/webgl.js), [WEBGL_DICKts.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/graphics/WEBGL_DICKts.js) - `WebGL` interception plus static whitelist/parameter support.
- [webgpu.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/graphics/webgpu.js), [WebgpuWL.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/graphics/WebgpuWL.js) - `WebGPU` interception plus whitelist/limits data.
- [screen.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/graphics/screen.js) - `screen` and `visualViewport` surface patching.
- [audiocontext.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/media/audiocontext.js) - AudioContext-aligned seeded/media surface adjustments.
- [font_module.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/media/font_module.js) - consumes generated font configs, registers `@font-face`, and injects CSS/font-loading glue.
- [RTCPeerConnection.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/media/RTCPeerConnection.js) - ICE-server normalization and non-relay/network-shaping logic.
- [nav_total_set.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/navigator/nav_total_set.js), [override_ua_data.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/navigator/override_ua_data.js) - navigator, UA-CH, language, and client-hint surface alignment on the window side.
- [hide_webdriver.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/stealth/hide_webdriver.js) - webdriver masking and related native-surface hardening.
- [headers_interceptor.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/stealth/headers_interceptor.js), [headers_bridge.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/stealth/headers_bridge.js) - request/header shaping on the JS side, synchronized with the CDP/mitmproxy path.
- [GeoOverride_source.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/stealth/GeoOverride_source.js), [TimezoneOverride_source.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/stealth/TimezoneOverride_source.js) - geo/timezone overrides.

### JavaScript ([assets/scripts/workerscope](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/scripts/workerscope))

- [wrk.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/workerscope/wrk.js) - worker-scope coordinator for environment propagation and patch installation across Dedicated/Shared/Service Workers.
- [WORKER_PATCH_SRC.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/workerscope/WORKER_PATCH_SRC.js) - worker-side patch source bundle consumed by bootstrap/prelude stages.
- [worker_bootstrap.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/workerscope/worker_bootstrap.js) - early worker bootstrap glue that connects worker creation with the injected patch payload.
- [sw_prelude.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/workerscope/sw_prelude.js) - Service Worker prelude used to establish the environment before worker patch application.
- [set_reflect.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/workerscope/set_reflect.js) - worker-side reflection/native-surface helper.

### Generated files & templates

- [fonts-manifest.json](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/Manifest/fonts-manifest.json) - diagnostic manifest (large JSON).
- [font_patch.generated.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/JS_fonts_patch/font_patch.generated.js) - auto-generated fonts patch, consumed by [font_module.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/patches/media/font_module.js).
- [font_patch.template.j2](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/templates/font_patch.template.j2) - Jinja2 template used by [rand_met.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/generators/rand_met.py) to generate the JS patch.

### Fonts

Ready-to-use generated fonts are already included in [assets/generated_fonts/Win32](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/generated_fonts/Win32) and [assets/generated_fonts/MacIntel](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/generated_fonts/MacIntel), together with their generated font indexes. For a normal run, you do not need to add or move any font files.

The bundled fonts were taken from Google Fonts and then renamed by the project pipeline for runtime use. They are meant to make the project start without forcing every user to search for their own font set first.

If you want to use your own fonts, place only `.woff2` files into [assets/fonts_raw](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/fonts_raw) and run the project normally. During startup, [rand_met.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/tools/generators/rand_met.py) treats [assets/fonts_raw](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/fonts_raw) as an intake folder: it validates the files, skips unsuitable fonts, copies accepted files into the platform-specific generated folder, updates the index, and regenerates the runtime font patch. After a file is accepted, it is removed from that intake folder.

Custom fonts should be normal text fonts. Avoid icon fonts, emoji fonts, empty/broken files, fonts without basic ASCII coverage, and fonts with restrictive embedding flags or extreme metrics.

### Logging

- type in console to get:
- L.__PROBE__(); [probe.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/probe.js) log console output, json and html files saving;

- L.__DEGRADE__.getBuffer(); - [set_log.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/set_log.js) console output;

- [set_log.js](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/assets/scripts/window/core/set_log.js) json log file saving:

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

You also can  easily just type `L.exportMyDebugLog()` in Devtools console to get the same result.

### Mitmproxy switch

Open [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py), choose one active profile, then press Play/F5 in VS Code.

With mitmproxy:

```python
MITMPROXY_ON = True
# MITMPROXY_OFF = True
```

Without mitmproxy:

```python
# MITMPROXY_ON = True
MITMPROXY_OFF = True
```

## Quick start (Windows)

Install deps:

```powershell
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

Put `.ovpn` files into [cfg_vpn](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/cfg_vpn).

Fonts are already prepared in [assets/generated_fonts](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/generated_fonts); no font setup is required for a normal run. To add your own fonts, put `.woff2` files into [assets/fonts_raw](https://github.com/zugdurchfahrt/seed-noise-consistency/tree/borderline/assets/fonts_raw) and let the startup font pipeline process them.

Run [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py) from VS Code or from the terminal. The active mitmproxy profile is selected inside [main.py](https://github.com/zugdurchfahrt/seed-noise-consistency/blob/borderline/main.py) by the switch shown above.

* If you face error "permission denied" during installation → run
  `pip install --no-cache-dir -r requirements.txt`

## Issues/TODO

- Integrate `getClientRects` / `getBoundingClientRect` proxying.
- Implement TLS fingerprint rotation via OpenSSL.
- Treat `success/ready` events from places that only record hook installation only as `applied`: the mechanism is installed, but the result is not yet proven.
- For the font module, emit `success` only if the state is observable after the current chain through the `DOM/CSS/font-measurement surface`, not only through internal structures; otherwise mark `applied_but_not_effective` or emit no `success`.

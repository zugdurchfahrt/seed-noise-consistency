# Changelog


## 31.08.2026

- `rects.js`: Standardized PRNG initialization to use the official `Core.__internal.prng.rand.use` API while preserving strict deterministic property isolation. Replaced the monolithic stateful generator with independent property-based pools (`__randSource.use('rects-' + label)`). This resolves a determinism gap where conditionally evaluated layout noise (e.g., font family choice) would incorrectly shift the pseudo-random sequence of downstream geometry metrics, violating the exact seed-based determinism contract.

## 28.08.2026

Fixed layout distortion issues by replacing aggressive CSS overrides (1000% width, 200px font-size) with relative base values (100%, 1em) and sub-pixel deltas. This ensures `getClientRects()` spoofing remains effective without breaking the visual appearance of the target pages.



## 27.08.2026

Enhance error handling and logging across various modules

- Added detailed error logging for swallowed exceptions in WebgpuWL.js, webgpu.js, and sw_prelude.js to improve debugging capabilities.
- Updated BrowserSessionPolicy in main.py to differentiate between window closure and other exceptions, enhancing error reporting.
- Refactored CORS handling in handle_cors_addon.py to streamline request processing.
- Removed unused functions related to Accept-Language header processing in headers_adapter.py to clean up the codebase.
- Adjusted paths and constants in rand_met.py and network_utils.py for better organization and clarity.


## 30.07.2026

Since VPN technology has made significant developments over the past two years, i decided to remove the feature for configuring a custom VPN, and the script now runs without managing the VPN internally. This means that VPN processes are not stopped or started.If a VPN is already running via any other method, the script simply uses the current network environment.

## 05.06.2026

Rects layout influence may affect visible glyph/layout nodes on arbitrary pages; no fix until a reproducible non-fixture page regression is observed.



## 16.04.2026

- `deviceMemory`: aligned the public behavior across `window`, `WorkerNavigator`, and `ServiceWorkerGlobalScope` with  `navigator.deviceMemory` variable nativet regime.
- As dedicated dynamic native overrid  for `navigator.deviceMemory` does not exist,  project-side accessor mutation on the active path switched to `ReduceDeviceMemory` privded by Chromium developers,  so constant native value 8 flows natively without replacing the public getter, regadlesss the exact RAM anount you posess.
- Preserved the original synthetic rollback path next to the active code in the same three local scope points:
  - `window` in `nav_total_set.js`
  - `worker` in `WORKER_PATCH_SRC.js`
  - `service worker` in `sw_prelude.js`
- Added a browser-native `ReduceDeviceMemory` launch path and synchronized the existing mirrors from the early native `navigator.deviceMemory` read instead of pre-injecting a synthetic value first.

## 03.04.2026

- `clientCode`: [] on `ServiceWorkerGlobalScope`
- `Function.prototype.toString` improvements

## 26.03.2026
### `context.js`  


- Added instance-level routing for serialization and `WebGL` methods.
- `toDataURL`, `toBlob`, `convertToBlob`, `getParameter`, and `readPixels` are now attached only to real canvas/context objects instead of being patched on public prototypes.
- `chainGetContext()` is now used only to install those handlers after a real context is created.
- Public prototype patch loops were removed for `HTMLCanvasElement.prototype.toDataURL`, `HTMLCanvasElement.prototype.toBlob`, `OffscreenCanvas.prototype.convertToBlob`, `WebGLRenderingContext.prototype.*`, and `WebGL2RenderingContext.prototype.*`.
- `getContext` patch was removed from the `HTMLCanvasElement` and `OffscreenCanvas` prototypes. It is now applied only to actual canvas objects when they are created, so the public prototypes keep native shape.
- `getContext` patch was removed from the `HTMLCanvasElement` and `OffscreenCanvas` prototypes. It is now applied only to actual canvas objects when they are created, so the public prototypes keep native shape.
- The hook logic hasn't been affected.

### `screen.js` 

- `clientWidth` and `clientHeight` patch were removed from `Element.prototype`. It is now applied only to `document.documentElement` and `document.body`, so the native prototype getter is no longer replaced.

## 24.03.2026

- `clientCode`: [] on .window, `DedicatedWorkerGlobalScope`/`SharedWorkerGlobalScope`
- Aligned Screen.* `accessor` path
- Aligned navigator strict scalar accessors
- Aligned promise_method
- Aligned `plugins`/`mimeTypes` object-return `accessor`


## 23.03.2026 [2026-01-09 - 2026-03-23]

### Major Milestones

-   Rebuilt the project layout and execution ownership: the runtime was split into `window/core`, `window/patches/*`, `WorkerGlobalScope`, `profile_data_source`, and `tools/*`, which turned the old flat script set into a staged pipeline with clearer entrypoints.
-   Reworked the worker pipeline end-to-end: `worker_bootstrap` was connected into the main injection flow, service/shared/dedicated worker preludes were introduced and iterated, bridge/routing logic was revised, and worker patch deployment moved closer to the window-side orchestration.
-   Brought `navigator.userAgentData`, UA-CH, and client hints much closer to native behavior across window and worker scopes: high-entropy validation, model/fullVersionList descriptors, expected client hints routing, worker-side UAData prototype fixes, and UACH mirror/hash alignment were all addressed.
-   Repaired native-surface invariants and stealth contracts: `Function.prototype.toString`, `markAsNative`, `hide_webdriver`, `descriptor`/`accessor` fixes, module descriptor cleanup, and owner/receiver routing work all pushed the codebase toward fewer descriptor leaks and fewer illegal invocation cases.
-   Consolidated graphics and media patching into the new core-driven flow: Canvas was repaired and turned into native-orienred behaviour, WebGL logic was moved closer to core/context handling, WebGPU received a much larger alignment pass including `GPU.requestAdapter` owner-contract work, and `RTCPeerConnection`, audio, screen, `Blob`/`dataURL`/`toBlob` paths were repeatedly stabilized.
-   Built out deterministic fonts and seed consistency as a full subsystem instead of isolated fixes: font generation/cache work expanded, fonts execution moved deeper into the runtime, CSS and `document.fonts.ready` handling were layered in, `stableNoiseFromString` and PRNG propagation were tightened, and seed delivery was pushed through driver/CDP flow.
-   Added a much stronger diagnostics and recovery layer: logging and CDP capture evolved, native/proxy validation tooling appeared under `tools_native_check`, the code moved toward explicit degrade/probe behavior.
-   By the end of the range, the work had shifted from adding isolated patches to closing the consistency gap between window core, workerscope, navigator surfaces, graphics surfaces, so that the  stack behaves more like one coordinated pipeline.


## 21.09.2025

### Added

-   set_log.js  - The "G.__DEBUG__" debug flag now works properly, and setting it to "false" stops JavaScript logging. Unfortunately, however, the log still displays the Undetected chromedriver notification.


### Changed

-   Language detection functions have been improved. The detection of English as a second language  has been removed. The function now returns only the language(s) based on geographic location.
-   vpn_utils.py — The DNS dependency in "sanity-check" has been removed from connect(). TThis eliminates a 10–15-second “freeze” during DNS resolution.

### Fixed

-   Various minor fixes and improvements.

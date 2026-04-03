# Changelog

03.04.2026

- `clientCode`: [] on `ServiceWorkerGlobalScope`
- `Function.prototype.toString` improvements

26.03.2026
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

24.03.2026

- `clientCode`: [] on .window, `DedicatedWorkerGlobalScope`/`SharedWorkerGlobalScope`
- Aligned Screen.* `accessor` path
- Aligned navigator strict scalar accessors
- Aligned promise_method
- Aligned `plugins`/`mimeTypes` object-return `accessor`


23.03.2026
**[2026-01-09 - 2026-03-23]**

### Major Milestones

-   Rebuilt the project layout and execution ownership: the runtime was split into `window/core`, `window/patches/*`, `WorkerGlobalScope`, `profile_data_source`, and `tools/*`, which turned the old flat script set into a staged pipeline with clearer entrypoints.
-   Reworked the worker pipeline end-to-end: `worker_bootstrap` was connected into the main injection flow, service/shared/dedicated worker preludes were introduced and iterated, bridge/routing logic was revised, and worker patch deployment moved closer to the window-side orchestration.
-   Brought `navigator.userAgentData`, UA-CH, and client hints much closer to native behavior across window and worker scopes: high-entropy validation, model/fullVersionList descriptors, expected client hints routing, worker-side UAData prototype fixes, and UACH mirror/hash alignment were all addressed.
-   Repaired native-surface invariants and stealth contracts: `Function.prototype.toString`, `markAsNative`, `hide_webdriver`, `descriptor`/`accessor` fixes, module descriptor cleanup, and owner/receiver routing work all pushed the codebase toward fewer descriptor leaks and fewer illegal invocation cases.
-   Consolidated graphics and media patching into the new core-driven flow: Canvas was repaired and turned into native-orienred behaviour, WebGL logic was moved closer to core/context handling, WebGPU received a much larger alignment pass including `GPU.requestAdapter` owner-contract work, and `RTCPeerConnection`, audio, screen, `Blob`/`dataURL`/`toBlob` paths were repeatedly stabilized.
-   Built out deterministic fonts and seed consistency as a full subsystem instead of isolated fixes: font generation/cache work expanded, fonts execution moved deeper into the runtime, CSS and `document.fonts.ready` handling were layered in, `stableNoiseFromString` and PRNG propagation were tightened, and seed delivery was pushed through driver/CDP flow.
-   Added a much stronger diagnostics and recovery layer: logging and CDP capture evolved, native/proxy validation tooling appeared under `tools_native_check`, the code moved toward explicit degrade/probe behavior.
-   By the end of the range, the work had shifted from adding isolated patches to closing the consistency gap between window core, workerscope, navigator surfaces, graphics surfaces, so that the  stack behaves more like one coordinated pipeline.


21.09.2025
## \[Unreleased\]

### Added

-   set_log.js  - The "G.__DEBUG__" debug flag now works properly, and setting it to "false" stops JavaScript logging. Unfortunately, however, the log still displays the Undetected chromedriver notification.


### Changed

-   Language detection functions have been improved. The detection of English as a second language  has been removed. The function now returns only the language(s) based on geographic location.
-   vpn_utils.py — The DNS dependency in "sanity-check" has been removed from connect(). TThis eliminates a 10–15-second “freeze” during DNS resolution.

### Fixed

-   Various minor fixes and improvements.

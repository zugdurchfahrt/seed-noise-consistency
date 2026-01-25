# Stage 2 Worker Pipeline Manifest

## Purpose
Record the exact, minimal Stage 2 changes to the worker pipeline to improve
deterministic early readiness and service worker delivery efficiency, without
changing overall architecture or disabling core hooks.

## Baseline Invariants (from Stage 1)
- Window pipeline is injected via Page.addScriptToEvaluateOnNewDocument.
- Worker overrides must be installed before any worker creation.
- Env snapshot must be available/published as early as possible.
- Service worker prelude can only be injected via CDP (no alternative channel).
- No hardcoded values are introduced; behavior remains default unless flags are set.

## Stage 2 Changes (Approved)
1) WorkerPatchHooks.initAll readiness order (wrk.js)
   - Publish LE snapshot immediately after overrides install.
   - Publish HE-updated snapshot later (async), without blocking early readiness.
   - Rationale: close readiness gate early; avoid delays caused by HE fetch.

2) SW injector auto-attach scope (cdp_caught_logger.py)
   - Prefer auto-attach only for service_worker targets using targetFilter.
   - Fallback to global auto-attach only if targetFilter is unsupported.
   - Rationale: reduce attach pauses on non-SW targets; keep SW deterministic.

## Explicitly Rejected Items
- Disabling WebGL or Canvas hooks (remain always-on by default).
- Cosmetic debugger-only changes in context.js (not needed for runtime).

## Verification Checklist
- Window: WorkerPatchHooks.diag() shows worker/shared overrides installed.
- Worker: __GW_BOOTSTRAP__, __WORKER_PATCH_LOADED__, __UACH_MIRROR_INSTALLED__ true.
- SW: prelude applied before script execution (no SW scope mismatch).
- Performance: reduced pauses when creating non-SW targets.

## Notes
- Any additional changes must preserve current architecture and invariants.

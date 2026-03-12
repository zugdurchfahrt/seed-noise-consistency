const BootstrapHideModule = function BootstrapHideModule(window) {
const G = (typeof globalThis !== 'undefined' && globalThis)
    || (typeof self !== 'undefined' && self)
    || (typeof window !== 'undefined' && window)
    || (typeof global !== 'undefined' && global)
    || null;

if (!G || (typeof G !== 'object' && typeof G !== 'function')) {
  throw new Error('[module] global object missing');
}
  
 const W = (typeof window !== 'undefined') ? window : null;

if (!W || (typeof W !== 'object' && typeof W !== 'function')) {
  throw new Error('[module] window missing');
}

const C = W.CanvasPatchContext || (W.CanvasPatchContext = {});
  
  
  const hiddenSurfaceState = {
    keys: [
    "__GLOBAL_SEED",
    "__EXPECTED_CLIENT_HINTS",
    "__NAV_PLATFORM__",
    "__GENERATED_PLATFORM",
    "__GENERATED_PLATFORM_VERSION",
    "__USER_AGENT",
    "__VENDOR",
    "__LATITUDE__",
    "__LONGITUDE__",
    "__TIMEZONE__",
    "__OFFSET_MINUTES__",
    "__WIDTH",
    "__HEIGHT",
    "__COLOR_DEPTH",
    "__DPR",
    "__primaryLanguage",
    "__normalizedLanguages",
    "__cpu",
    "__memory",
    "__WEBGL_RENDERER__",
    "__WEBGL_VENDOR__",
    "__WEBGL_UNMASKED_VENDOR__",
    "__WEBGL_UNMASKED_RENDERER__",
    "__GPU_TYPE__",
    "__GPU_ARCHITECTURE__",
    "__GPU_VENDOR__",
    "__DEVICES_LABELS",
    "__PLUGIN_PROFILES__",
    "__safeDefine",
    "__CORE_TOSTRING_STATE__",
    "__ensureMarkAsNative",
    "__wrapNativeApply",
    "__wrapNativeAccessor",
    "__wrapStrictAccessor",
    "__wrapNativeCtor",
    "__CORE_WINDOW_LOADED__",
    "Core",
    "__ENV_BRIDGE__",
    "__ENV_HUB__",
    "__lastSnap__",
    "__LAST_UACH_HE__",
    "__UACH_HE_READY__",
    "__UACH_HE_PROMISE__",
    "__PATCHED_SAFE_WORKER__",
    "__PATCHED_SHARED_WORKER__",
    "__PATCHED_SERVICE_WORKER__",
    "__BLOB_URL_STORE__",
    "__LAST_WORKER_BOOTSTRAP_ERROR__",
    "__LAST_WORKER_USER_URL_LOADED__",
    "__LAST_SHARED_WORKER_BOOTSTRAP_ERROR__",
    "__LAST_SHARED_WORKER_USER_URL_LOADED__",
    "__LAST_SHARED_WORKER_PATCH_OK__",
    "WorkerPatchHooks",
    "WrkModule",
    "SafeWorkerOverride",
    "SafeSharedWorkerOverride",
    "ServiceWorkerOverride",
    "CanvasPatchContext",
    "CanvasPatchHooks",
    "webglHooks",
    "RNGsetModule",
    "rand",
    "mulberry32",
    "strToSeed"
    ],
    applied: Object.create(null)
  };

  for (const key of hiddenSurfaceState.keys) {
    const d = Object.getOwnPropertyDescriptor(window, key);
    if (!d) {
      Object.defineProperty(window, key, {
        value: undefined,
        writable: true,
        configurable: true,
        enumerable: false
      });
      hiddenSurfaceState.applied[key] = "predefined";
      continue;
    }
    if (d.enumerable === false) {
      hiddenSurfaceState.applied[key] = "already_hidden";
      continue;
    }
    if (d.configurable === false) {
      hiddenSurfaceState.applied[key] = "skip_nonconfigurable";
      continue;
    }
    if ("value" in d) {
      Object.defineProperty(window, key, {
        value: d.value,
        writable: !!d.writable,
        configurable: true,
        enumerable: false
      });
    } else {
      Object.defineProperty(window, key, {
        get: d.get,
        set: d.set,
        configurable: true,
        enumerable: false
      });
    }
    hiddenSurfaceState.applied[key] = "hidden";
  }
};

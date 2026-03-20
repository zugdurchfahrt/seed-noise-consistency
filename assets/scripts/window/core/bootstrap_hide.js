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

function __defineHiddenValue__(obj, key, value) {
  const d = Object.getOwnPropertyDescriptor(obj, key);
  if (d && d.configurable === false) return null;
  Object.defineProperty(obj, key, {
    value,
    writable: true,
    configurable: true,
    enumerable: false
  });
  return value;
}

let C = (W.CanvasPatchContext && (typeof W.CanvasPatchContext === 'object' || typeof W.CanvasPatchContext === 'function'))
  ? W.CanvasPatchContext
  : null;

if (!C) {
  C = __defineHiddenValue__(W, 'CanvasPatchContext', {});
  if (!C) throw new Error('[module] CanvasPatchContext bootstrap failed');
} else {
  __defineHiddenValue__(W, 'CanvasPatchContext', C);
}

let stateRoot = (C.state && typeof C.state === 'object') ? C.state : null;
if (!stateRoot) {
  stateRoot = __defineHiddenValue__(C, 'state', Object.create(null));
  if (!stateRoot) throw new Error('[module] CanvasPatchContext.state bootstrap failed');
} else {
  __defineHiddenValue__(C, 'state', stateRoot);
}

let loggerRoot = (C.__logger && typeof C.__logger === 'object') ? C.__logger : null;
if (!loggerRoot) {
  loggerRoot = __defineHiddenValue__(C, '__logger', Object.create(null));
  if (!loggerRoot) throw new Error('[module] CanvasPatchContext.__logger bootstrap failed');
} else {
  __defineHiddenValue__(C, '__logger', loggerRoot);
}

const __MODULE = 'bootstrap_hide';
const __SURFACE = 'bootstrap_hide';
const __D = (loggerRoot && typeof loggerRoot.__DEGRADE__ === 'function') ? loggerRoot.__DEGRADE__ : null;
const __diag = (__D && typeof __D.diag === 'function') ? __D.diag.bind(__D) : null;

function __bootstrapHideEmit__(level, code, extra, err) {
  const x = (extra && typeof extra === 'object') ? extra : {};
  const ctx = {
    module: __MODULE,
    diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : __MODULE,
    surface: (typeof x.surface === 'string' && x.surface) ? x.surface : __SURFACE,
    key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
    stage: x.stage,
    message: x.message,
    data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
    type: x.type
  };
  try {
    if (__diag) return __diag(level, code, ctx, err || null);
    if (typeof __D === 'function') {
      return __D(code, err || null, Object.assign({}, ctx, { level: level || 'info' }));
    }
  } catch (_emitErr) {
    return undefined;
  }
}

function __isFiniteNumber__(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function __ensureGeoTransitState__() {
  let state = (stateRoot.__GEO_STATE__ && typeof stateRoot.__GEO_STATE__ === 'object')
    ? stateRoot.__GEO_STATE__
    : null;
  if (!state) {
    state = Object.create(null);
    state.latitude = null;
    state.longitude = null;
    state.timezone = null;
    state.offsetMinutes = null;
    Object.defineProperty(stateRoot, '__GEO_STATE__', {
      value: state,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  if (C.__GEO_STATE__ !== state) {
    Object.defineProperty(C, '__GEO_STATE__', {
      value: state,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  return state;
}

function __ensureLangTransitState__() {
  let state = (stateRoot.__LANG_STATE__ && typeof stateRoot.__LANG_STATE__ === 'object')
    ? stateRoot.__LANG_STATE__
    : null;
  if (!state) {
    state = Object.create(null);
    state.primaryLanguage = null;
    state.normalizedLanguages = null;
    Object.defineProperty(stateRoot, '__LANG_STATE__', {
      value: state,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  if (C.__LANG_STATE__ !== state) {
    Object.defineProperty(C, '__LANG_STATE__', {
      value: state,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  return state;
}

function __cloneProfileValue__(value) {
  if (Array.isArray(value)) return value.map(__cloneProfileValue__);
  if (value && typeof value === 'object') {
    const out = Object.create(null);
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      out[key] = __cloneProfileValue__(value[key]);
    }
    return out;
  }
  return value;
}

function __ensureEnvProfileState__() {
  let state = (stateRoot.__ENV_PROFILE__ && typeof stateRoot.__ENV_PROFILE__ === 'object')
    ? stateRoot.__ENV_PROFILE__
    : null;
  if (!state) {
    state = Object.create(null);
    Object.defineProperty(stateRoot, '__ENV_PROFILE__', {
      value: state,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  return state;
}

function __emitBootstrapTransferDiag__(level, code, key, message, reason, err, extraData) {
  const data = { outcome: 'skip', reason: reason };
  if (extraData && typeof extraData === 'object') {
    Object.assign(data, extraData);
  }
  return __bootstrapHideEmit__(level, code, {
    diagTag: 'bootstrap_hide',
    surface: 'window',
    key: key,
    stage: 'bootstrap',
    message: message,
    type: 'browser structure missing data',
    data: data
  }, err);
}

function __ensureBootstrapTransitStatus__() {
  let status = (C.__bootstrapTransitStatus__ && typeof C.__bootstrapTransitStatus__ === 'object')
    ? C.__bootstrapTransitStatus__
    : null;
  if (!status) {
    status = Object.create(null);
  }
  __defineHiddenValue__(C, '__bootstrapTransitStatus__', status);
  if (!status.geo || typeof status.geo !== 'object') status.geo = Object.create(null);
  if (!status.lang || typeof status.lang !== 'object') status.lang = Object.create(null);
  if (!status.retention || typeof status.retention !== 'object') status.retention = Object.create(null);
  return status;
}

const __bootstrapTransitStatus__ = __ensureBootstrapTransitStatus__();

function __setBootstrapTransferStatus__(slot, ready, reason, extraData) {
  if (!__bootstrapTransitStatus__[slot] || typeof __bootstrapTransitStatus__[slot] !== 'object') {
    __bootstrapTransitStatus__[slot] = Object.create(null);
  }
  const status = __bootstrapTransitStatus__[slot];
  status.ready = !!ready;
  status.status = ready ? 'ready' : 'incomplete';
  status.reason = reason || (ready ? 'ready' : 'incomplete');
  status.data = (extraData && typeof extraData === 'object') ? Object.assign({}, extraData) : null;
}

const __geoTransitState__ = __ensureGeoTransitState__();
const __langTransitState__ = __ensureLangTransitState__();
const __envProfileState__ = __ensureEnvProfileState__();
const __bootstrapLatitude__ = W.__LATITUDE__;
const __bootstrapLongitude__ = W.__LONGITUDE__;
const __bootstrapTimezone__ = W.__TIMEZONE__;
const __bootstrapOffsetMinutes__ = W.__OFFSET_MINUTES__;
const __bootstrapPrimaryLanguage__ = W.__primaryLanguage;
const __bootstrapNormalizedLanguages__ = W.__normalizedLanguages;
const __geoMissingKeys__ = [];
if (!__isFiniteNumber__(__bootstrapLatitude__)) __geoMissingKeys__.push('__LATITUDE__');
if (!__isFiniteNumber__(__bootstrapLongitude__)) __geoMissingKeys__.push('__LONGITUDE__');
if (!(typeof __bootstrapTimezone__ === 'string' && __bootstrapTimezone__)) __geoMissingKeys__.push('__TIMEZONE__');
if (!__isFiniteNumber__(__bootstrapOffsetMinutes__)) __geoMissingKeys__.push('__OFFSET_MINUTES__');
if (__geoMissingKeys__.length === 0) {
  __geoTransitState__.latitude = __bootstrapLatitude__;
  __geoTransitState__.longitude = __bootstrapLongitude__;
  __geoTransitState__.timezone = __bootstrapTimezone__;
  __geoTransitState__.offsetMinutes = __bootstrapOffsetMinutes__;
  __setBootstrapTransferStatus__('geo', true, 'owner_ready', { source: 'window_transit' });
} else {
  __setBootstrapTransferStatus__('geo', false, 'bootstrap_input_incomplete', { missingKeys: __geoMissingKeys__.slice() });
  __emitBootstrapTransferDiag__(
    'warn',
    'bootstrap_hide:geo_transfer_incomplete',
    'state.__GEO_STATE__',
    'geo owner-transfer incomplete',
    'bootstrap_input_incomplete',
    null,
    { missingKeys: __geoMissingKeys__.slice() }
  );
}
const __langMissingKeys__ = [];
if (!(typeof __bootstrapPrimaryLanguage__ === 'string' && __bootstrapPrimaryLanguage__)) __langMissingKeys__.push('__primaryLanguage');
if (!(Array.isArray(__bootstrapNormalizedLanguages__) && __bootstrapNormalizedLanguages__.length > 0)) __langMissingKeys__.push('__normalizedLanguages');
if (__langMissingKeys__.length === 0) {
  __langTransitState__.primaryLanguage = __bootstrapPrimaryLanguage__;
  __langTransitState__.normalizedLanguages = __bootstrapNormalizedLanguages__;
  if (Array.isArray(__langTransitState__.normalizedLanguages) && !Object.isFrozen(__langTransitState__.normalizedLanguages)) {
    Object.freeze(__langTransitState__.normalizedLanguages);
  }
  if (
    typeof __langTransitState__.primaryLanguage !== 'string' ||
    !__langTransitState__.primaryLanguage ||
    !Array.isArray(__langTransitState__.normalizedLanguages) ||
    __langTransitState__.normalizedLanguages.length === 0 ||
    __langTransitState__.normalizedLanguages[0] !== __langTransitState__.primaryLanguage
  ) {
    throw new Error('[module] CanvasPatchContext.__LANG_STATE__ bootstrap invalid');
  }
  __setBootstrapTransferStatus__('lang', true, 'owner_ready', { source: 'window_transit' });
} else {
  __setBootstrapTransferStatus__('lang', false, 'bootstrap_input_incomplete', { missingKeys: __langMissingKeys__.slice() });
  __emitBootstrapTransferDiag__(
    'warn',
    'bootstrap_hide:lang_transfer_incomplete',
    'state.__LANG_STATE__',
    'language owner-transfer incomplete',
    'bootstrap_input_incomplete',
    null,
    { missingKeys: __langMissingKeys__.slice() }
  );
}

__envProfileState__.meta = __cloneProfileValue__(W.__EXPECTED_CLIENT_HINTS || {});
__envProfileState__.navPlat = W.__NAV_PLATFORM__;
__envProfileState__.generatedPlatform = W.__GENERATED_PLATFORM;
__envProfileState__.generatedPlatformVersion = W.__GENERATED_PLATFORM_VERSION;
__envProfileState__.userAgent = W.__USER_AGENT;
__envProfileState__.vendor = W.__VENDOR;
__envProfileState__.mem = Number(W.__memory);
__envProfileState__.cpu = Number(W.__cpu);
__envProfileState__.dpr = Number(W.__DPR);
__envProfileState__.width = Number(W.__WIDTH ?? (W.screen && W.screen.width));
__envProfileState__.height = Number(W.__HEIGHT ?? (W.screen && W.screen.height));
__envProfileState__.devicesLabels = __cloneProfileValue__(W.__DEVICES_LABELS);
__envProfileState__.colorDepth = Number(W.__COLOR_DEPTH);
__envProfileState__.orientationDom = W.__ORIENTATION ?? (((__envProfileState__.height >= __envProfileState__.width)) ? 'portrait-primary' : 'landscape-primary');
__envProfileState__.strict = (W.__NAV_PATCH_STRICT__ !== undefined) ? !!W.__NAV_PATCH_STRICT__ : true;
__envProfileState__.debug = !!W.__NAV_PATCH_DEBUG__;
__envProfileState__.fullVersionList = __cloneProfileValue__(W.__FULL_VERSION_LIST);
__envProfileState__.storageQuotaMb = W.__STORAGE_QUOTA_MB;
__envProfileState__.storageUsedPct = W.__STORAGE_USED_PCT;
__envProfileState__.pluginProfiles = __cloneProfileValue__(Array.isArray(W.__PLUGIN_PROFILES__) ? W.__PLUGIN_PROFILES__ : []);

function __emitCleanupDiag__(level, code, key, message, reason, err) {
  return __bootstrapHideEmit__(level, code, {
    diagTag: 'bootstrap_hide',
    surface: 'window',
    key: key,
    stage: 'cleanup',
    message: message,
    type: 'browser structure missing data',
    data: { outcome: 'skip', reason: reason }
  }, err);
}

function __geoTransitOwnerReady__() {
  const state = __ensureGeoTransitState__();
  return !!state &&
    __isFiniteNumber__(state.latitude) &&
    __isFiniteNumber__(state.longitude) &&
    typeof state.timezone === 'string' && !!state.timezone &&
    __isFiniteNumber__(state.offsetMinutes);
}

function __langTransitOwnerReady__() {
  const state = __ensureLangTransitState__();
  return !!state &&
    typeof state.primaryLanguage === 'string' && !!state.primaryLanguage &&
    Array.isArray(state.normalizedLanguages) &&
    state.normalizedLanguages.length > 0 &&
    state.normalizedLanguages[0] === state.primaryLanguage;
}

function __workerTransitSnapshotReady__() {
  const ready = !!(C && C.__workerEnvSnapshotReady__ === true);
  __bootstrapTransitStatus__.retention.workerEnvSnapshotReady = ready;
  __bootstrapTransitStatus__.retention.workerEnvSnapshotStage = ready ? 'ready' : 'pending';
  return ready;
}

function __ensureBootstrapCleanupState__() {
  let cleanup = (__bootstrapTransitStatus__.retention.cleanup && typeof __bootstrapTransitStatus__.retention.cleanup === 'object')
    ? __bootstrapTransitStatus__.retention.cleanup
    : null;
  if (!cleanup) {
    cleanup = Object.create(null);
    __bootstrapTransitStatus__.retention.cleanup = cleanup;
  }
  if (typeof cleanup.requested !== 'boolean') cleanup.requested = false;
  if (typeof cleanup.completed !== 'boolean') cleanup.completed = false;
  if (typeof cleanup.deferred !== 'boolean') cleanup.deferred = false;
  if (typeof cleanup.lastTrigger !== 'string' && cleanup.lastTrigger !== null) cleanup.lastTrigger = null;
  if (typeof cleanup.reason !== 'string' && cleanup.reason !== null) cleanup.reason = null;
  return cleanup;
}

function __getBootstrapSanitizeGate__(key) {
  if (
    key === '__LATITUDE__' ||
    key === '__LONGITUDE__' ||
    key === '__TIMEZONE__' ||
    key === '__OFFSET_MINUTES__'
  ) {
    return {
      ready: __geoTransitOwnerReady__(),
      reason: 'geo_owner_not_ready'
    };
  }
  if (
    key === '__primaryLanguage' ||
    key === '__normalizedLanguages'
  ) {
    return {
      ready: __langTransitOwnerReady__(),
      reason: 'lang_owner_not_ready'
    };
  }
  if (
    key === '__EXPECTED_CLIENT_HINTS' ||
    key === '__USER_AGENT' ||
    key === '__VENDOR' ||
    key === '__DPR' ||
    key === '__cpu' ||
    key === '__memory'
  ) {
    return {
      ready: __workerTransitSnapshotReady__(),
      reason: 'worker_snapshot_not_ready'
    };
  }
  return {
    ready: true,
    reason: 'ready'
  };
}

function __sanitizeBootstrapEnvSurface__(win) {
  const keys = [
    '__GLOBAL_SEED',
    '__EXPECTED_CLIENT_HINTS',
    '__NAV_PLATFORM__',
    '__GENERATED_PLATFORM',
    '__GENERATED_PLATFORM_VERSION',
    '__USER_AGENT',
    '__VENDOR',
    '__LATITUDE__',
    '__LONGITUDE__',
    '__TIMEZONE__',
    '__OFFSET_MINUTES__',
    '__WIDTH',
    '__HEIGHT',
    '__COLOR_DEPTH',
    '__DPR',
    '__primaryLanguage',
    '__normalizedLanguages',
    '__cpu',
    '__memory',
    '__DEVICES_LABELS',
    '__PLUGIN_PROFILES__',
    '__ORIENTATION'
  ];
  for (const key of keys) {
    const gate = __getBootstrapSanitizeGate__(key);
    if (!gate.ready) {
      const code = gate.reason === 'worker_snapshot_not_ready'
        ? 'bootstrap_hide:cleanup_env_retention_not_ready'
        : 'bootstrap_hide:cleanup_env_owner_not_ready';
      const message = gate.reason === 'worker_snapshot_not_ready'
        ? 'env surface cleanup skipped: retention not ready'
        : 'env surface cleanup skipped: owner not ready';
      __emitCleanupDiag__('warn', code, key, message, gate.reason, null);
      continue;
    }
    const desc = Object.getOwnPropertyDescriptor(win, key);
    if (!desc) continue;
    if (desc.configurable === false) {
      __emitCleanupDiag__('warn', 'bootstrap_hide:cleanup_env_nonconfigurable', key, 'env surface cleanup skipped: non-configurable', 'cleanup_env_nonconfigurable', null);
      continue;
    }
    try {
      delete win[key];
    } catch (e) {
      __emitCleanupDiag__('warn', 'bootstrap_hide:cleanup_env_delete_failed', key, 'env surface cleanup delete failed', 'cleanup_env_delete_failed', e);
    }
  }
}
__defineHiddenValue__(C, '__sanitizeBootstrapEnvSurface__', __sanitizeBootstrapEnvSurface__);

function __runBootstrapEnvCleanup__(win, trigger) {
  const cleanupState = __ensureBootstrapCleanupState__();
  const nextTrigger = (typeof trigger === 'string' && trigger) ? trigger : 'runtime';
  cleanupState.requested = true;
  cleanupState.lastTrigger = nextTrigger;
  if (cleanupState.completed) {
    cleanupState.deferred = false;
    cleanupState.reason = 'already_completed';
    return { outcome: 'skip', reason: 'already_completed' };
  }
  if (!__workerTransitSnapshotReady__()) {
    cleanupState.deferred = true;
    cleanupState.reason = 'worker_snapshot_not_ready';
    __bootstrapTransitStatus__.retention.cleanupDeferred = true;
    __bootstrapTransitStatus__.retention.cleanupDeferredReason = 'worker_snapshot_not_ready';
    return { outcome: 'defer', reason: 'worker_snapshot_not_ready' };
  }
  cleanupState.deferred = false;
  cleanupState.reason = 'ready';
  __bootstrapTransitStatus__.retention.cleanupDeferred = false;
  __bootstrapTransitStatus__.retention.cleanupDeferredReason = null;
  __sanitizeBootstrapEnvSurface__(win);
  cleanupState.completed = true;
  cleanupState.reason = 'completed';
  return { outcome: 'return', reason: 'completed' };
}
__defineHiddenValue__(C, '__runBootstrapEnvCleanup__', __runBootstrapEnvCleanup__);
  
  
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
    "RNGsetModule"
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
  __bootstrapHideEmit__('info', 'bootstrap_hide:ready', {
    diagTag: 'bootstrap_hide',
    surface: 'window',
    key: 'bootstrap_hide',
    stage: 'apply',
    message: 'bootstrap_hide ready',
    type: 'pipeline missing data',
    data: { outcome: 'return', reason: 'ready' }
  }, null);
};

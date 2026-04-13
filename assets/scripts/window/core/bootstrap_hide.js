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

let fontsRoot = (stateRoot.__FONTS__ && typeof stateRoot.__FONTS__ === 'object')
  ? stateRoot.__FONTS__
  : null;
if (!fontsRoot) {
  fontsRoot = __defineHiddenValue__(stateRoot, '__FONTS__', Object.create(null));
  if (!fontsRoot) throw new Error('[module] CanvasPatchContext.state.__FONTS__ bootstrap failed');
} else {
  __defineHiddenValue__(stateRoot, '__FONTS__', fontsRoot);
}

let fontsState = (fontsRoot.__STATE__ && typeof fontsRoot.__STATE__ === 'object')
  ? fontsRoot.__STATE__
  : null;
if (!fontsState) {
  fontsState = __defineHiddenValue__(fontsRoot, '__STATE__', {
    ready: false,
    error: null,
    awaitReady: null,
    awaitReadyStatus: null,
    awaitReadyResolve: null,
    awaitReadyReject: null,
    familySnapshot: {
      allowedFamilies: null,
      runtimeFamilies: new Set(),
      platformDom: null,
      versionToken: null
    }
  });
  if (!fontsState) throw new Error('[module] CanvasPatchContext.state.__FONTS__.__STATE__ bootstrap failed');
} else {
  __defineHiddenValue__(fontsRoot, '__STATE__', fontsState);
}

let fontsConfigState = (fontsRoot.__CONFIG__ && typeof fontsRoot.__CONFIG__ === 'object')
  ? fontsRoot.__CONFIG__
  : null;
if (!fontsConfigState) {
  fontsConfigState = Object.create(null);
  fontsConfigState.configs = [];
  fontsConfigState = __defineHiddenValue__(fontsRoot, '__CONFIG__', fontsConfigState);
  if (!fontsConfigState) throw new Error('[module] CanvasPatchContext.state.__FONTS__.__CONFIG__ bootstrap failed');
} else {
  __defineHiddenValue__(fontsRoot, '__CONFIG__', fontsConfigState);
}
if (!Array.isArray(fontsConfigState.configs)) fontsConfigState.configs = [];

let canvasRoot = (stateRoot.__CANVAS__ && typeof stateRoot.__CANVAS__ === 'object')
  ? stateRoot.__CANVAS__
  : null;
if (!canvasRoot) {
  canvasRoot = __defineHiddenValue__(stateRoot, '__CANVAS__', Object.create(null));
  if (!canvasRoot) throw new Error('[module] CanvasPatchContext.state.__CANVAS__ bootstrap failed');
} else {
  __defineHiddenValue__(stateRoot, '__CANVAS__', canvasRoot);
}

let canvasState = (canvasRoot.__STATE__ && typeof canvasRoot.__STATE__ === 'object')
  ? canvasRoot.__STATE__
  : null;
if (!canvasState) {
  canvasState = __defineHiddenValue__(canvasRoot, '__STATE__', {
    domReady: false,
    offscreenReady: false,
    domCanvas: null,
    domCanvasHost: null,
    offscreenCanvas: null,
    defaultCtx2dFont: ''
  });
  if (!canvasState) throw new Error('[module] CanvasPatchContext.state.__CANVAS__.__STATE__ bootstrap failed');
} else {
  __defineHiddenValue__(canvasRoot, '__STATE__', canvasState);
}

const __bootstrapDefaultCtx2dFontCached__ = (typeof canvasState.defaultCtx2dFont === 'string' && canvasState.defaultCtx2dFont.trim())
  ? canvasState.defaultCtx2dFont.trim()
  : '';
if (!__bootstrapDefaultCtx2dFontCached__) {
  try {
    const doc = (W && W.document && typeof W.document.createElement === 'function')
      ? W.document
      : null;
    const bootstrapCanvas = doc
      ? doc.createElement('canvas')
      : ((typeof W.OffscreenCanvas === 'function') ? new W.OffscreenCanvas(1, 1) : null);
    if (!bootstrapCanvas || typeof bootstrapCanvas.getContext !== 'function') {
      throw new Error('[module] CanvasPatchContext.state.__CANVAS__.__STATE__.defaultCtx2dFont source missing');
    }
    const bootstrapCtx = bootstrapCanvas.getContext('2d');
    const font = (bootstrapCtx && typeof bootstrapCtx.font === 'string' && bootstrapCtx.font.trim())
      ? bootstrapCtx.font.trim()
      : '';
    if (!font) {
      throw new Error('[module] CanvasPatchContext.state.__CANVAS__.__STATE__.defaultCtx2dFont invalid');
    }
    canvasState.defaultCtx2dFont = font;
  } catch (e) {
    __emitBootstrapTransferDiag__(
      'error',
      'bootstrap_hide:canvas_default_font_missing',
      'state.__CANVAS__.__STATE__.defaultCtx2dFont',
      'canvas default font owner-transfer failed',
      'bootstrap_input_incomplete',
      e,
      null
    );
    throw e;
  }
}

let screenRoot = (stateRoot.__SCREEN__ && typeof stateRoot.__SCREEN__ === 'object')
  ? stateRoot.__SCREEN__
  : null;
if (!screenRoot) {
  screenRoot = __defineHiddenValue__(stateRoot, '__SCREEN__', Object.create(null));
  if (!screenRoot) throw new Error('[module] CanvasPatchContext.state.__SCREEN__ bootstrap failed');
} else {
  __defineHiddenValue__(stateRoot, '__SCREEN__', screenRoot);
}
let screenState = (screenRoot.__STATE__ && typeof screenRoot.__STATE__ === 'object')
  ? screenRoot.__STATE__
  : null;
if (!screenState) {
  screenState = __defineHiddenValue__(screenRoot, '__STATE__', Object.create(null));
  if (!screenState) throw new Error('[module] CanvasPatchContext.state.__SCREEN__.__STATE__ bootstrap failed');
} else {
  __defineHiddenValue__(screenRoot, '__STATE__', screenState);
}

let navRoot = (stateRoot.__NAV_TOTAL_SET__ && typeof stateRoot.__NAV_TOTAL_SET__ === 'object')
  ? stateRoot.__NAV_TOTAL_SET__
  : null;
if (!navRoot) {
  navRoot = __defineHiddenValue__(stateRoot, '__NAV_TOTAL_SET__', Object.create(null));
  if (!navRoot) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__ bootstrap failed');
} else {
  __defineHiddenValue__(stateRoot, '__NAV_TOTAL_SET__', navRoot);
}

let navDataStoreState = (navRoot.__DATA_STORE_STATE__ && typeof navRoot.__DATA_STORE_STATE__ === 'object')
  ? navRoot.__DATA_STORE_STATE__
  : null;
if (!navDataStoreState) {
  navDataStoreState = __defineHiddenValue__(navRoot, '__DATA_STORE_STATE__', Object.create(null));
  if (!navDataStoreState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__DATA_STORE_STATE__ bootstrap failed');
} else {
  __defineHiddenValue__(navRoot, '__DATA_STORE_STATE__', navDataStoreState);
}

let navScalarState = (navRoot.__SCALAR_STATE__ && typeof navRoot.__SCALAR_STATE__ === 'object')
  ? navRoot.__SCALAR_STATE__
  : null;
if (!navScalarState) {
  navScalarState = __defineHiddenValue__(navRoot, '__SCALAR_STATE__', Object.create(null));
  if (!navScalarState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__SCALAR_STATE__ bootstrap failed');
} else {
  __defineHiddenValue__(navRoot, '__SCALAR_STATE__', navScalarState);
}

let navObjectState = (navRoot.__OBJECT_STATE__ && typeof navRoot.__OBJECT_STATE__ === 'object')
  ? navRoot.__OBJECT_STATE__
  : null;
if (!navObjectState) {
  navObjectState = __defineHiddenValue__(navRoot, '__OBJECT_STATE__', Object.create(null));
  if (!navObjectState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__ bootstrap failed');
} else {
  __defineHiddenValue__(navRoot, '__OBJECT_STATE__', navObjectState);
}

let hideWebdriverRoot = (stateRoot.__HIDE_WEBDRIVER__ && typeof stateRoot.__HIDE_WEBDRIVER__ === 'object')
  ? stateRoot.__HIDE_WEBDRIVER__
  : null;
if (!hideWebdriverRoot) {
  hideWebdriverRoot = __defineHiddenValue__(stateRoot, '__HIDE_WEBDRIVER__', Object.create(null));
  if (!hideWebdriverRoot) throw new Error('[module] CanvasPatchContext.state.__HIDE_WEBDRIVER__ bootstrap failed');
} else {
  __defineHiddenValue__(stateRoot, '__HIDE_WEBDRIVER__', hideWebdriverRoot);
}

let hideWebdriverState = (hideWebdriverRoot.__STATE__ && typeof hideWebdriverRoot.__STATE__ === 'object')
  ? hideWebdriverRoot.__STATE__
  : null;
if (!hideWebdriverState) {
  hideWebdriverState = __defineHiddenValue__(hideWebdriverRoot, '__STATE__', Object.create(null));
  if (!hideWebdriverState) throw new Error('[module] CanvasPatchContext.state.__HIDE_WEBDRIVER__.__STATE__ bootstrap failed');
} else {
  __defineHiddenValue__(hideWebdriverRoot, '__STATE__', hideWebdriverState);
}

let wrkRoot = (stateRoot.__WRK__ && typeof stateRoot.__WRK__ === 'object')
  ? stateRoot.__WRK__
  : null;
if (!wrkRoot) {
  wrkRoot = __defineHiddenValue__(stateRoot, '__WRK__', Object.create(null));
  if (!wrkRoot) throw new Error('[module] CanvasPatchContext.state.__WRK__ bootstrap failed');
} else {
  __defineHiddenValue__(stateRoot, '__WRK__', wrkRoot);
}

let wrkBootstrapState = (wrkRoot.bootstrap && typeof wrkRoot.bootstrap === 'object')
  ? wrkRoot.bootstrap
  : null;
if (!wrkBootstrapState) {
  wrkBootstrapState = __defineHiddenValue__(wrkRoot, 'bootstrap', Object.create(null));
  if (!wrkBootstrapState) throw new Error('[module] CanvasPatchContext.state.__WRK__.bootstrap bootstrap failed');
} else {
  __defineHiddenValue__(wrkRoot, 'bootstrap', wrkBootstrapState);
}

let wrkRuntimeState = (wrkRoot.runtime && typeof wrkRoot.runtime === 'object')
  ? wrkRoot.runtime
  : null;
if (!wrkRuntimeState) {
  wrkRuntimeState = __defineHiddenValue__(wrkRoot, 'runtime', Object.create(null));
  if (!wrkRuntimeState) throw new Error('[module] CanvasPatchContext.state.__WRK__.runtime bootstrap failed');
} else {
  __defineHiddenValue__(wrkRoot, 'runtime', wrkRuntimeState);
}

let wrkHooksState = (wrkRoot.hooks && typeof wrkRoot.hooks === 'object')
  ? wrkRoot.hooks
  : null;
if (!wrkHooksState) {
  wrkHooksState = __defineHiddenValue__(wrkRoot, 'hooks', Object.create(null));
  if (!wrkHooksState) throw new Error('[module] CanvasPatchContext.state.__WRK__.hooks bootstrap failed');
} else {
  __defineHiddenValue__(wrkRoot, 'hooks', wrkHooksState);
}

let patchStateRoot = (C.__patchState && typeof C.__patchState === 'object')
  ? C.__patchState
  : null;
if (!patchStateRoot) {
  patchStateRoot = __defineHiddenValue__(C, '__patchState', {
    canvas: false,
    offscreen: false,
    webgl: false,
    hooksRegistered: false
  });
  if (!patchStateRoot) throw new Error('[module] CanvasPatchContext.__patchState__ bootstrap failed');
} else {
  __defineHiddenValue__(C, '__patchState', patchStateRoot);
}

let hookModeStore = (C.__hookModeStore && typeof C.__hookModeStore === 'object')
  ? C.__hookModeStore
  : null;
if (!hookModeStore) {
  hookModeStore = __defineHiddenValue__(C, '__hookModeStore', Object.create(null));
  if (!hookModeStore) throw new Error('[module] CanvasPatchContext.__hookModeStore bootstrap failed');
} else {
  __defineHiddenValue__(C, '__hookModeStore', hookModeStore);
}
if (!Object.prototype.hasOwnProperty.call(hookModeStore, 'post_orig_once')) {
  Object.defineProperty(hookModeStore, 'post_orig_once', {
    value: Object.freeze({}),
    writable: false,
    configurable: false,
    enumerable: false
  });
}

if (typeof C.__READY__ !== 'boolean') {
  __defineHiddenValue__(C, '__READY__', false);
}

let loggerRoot = (C.__logger && typeof C.__logger === 'object') ? C.__logger : null;
if (!loggerRoot) {
  loggerRoot = __defineHiddenValue__(C, '__logger', Object.create(null));
  if (!loggerRoot) throw new Error('[module] CanvasPatchContext.__logger bootstrap failed');
} else {
  __defineHiddenValue__(C, '__logger', loggerRoot);
}

let coreRoot = (W.Core && (typeof W.Core === 'object' || typeof W.Core === 'function'))
  ? W.Core
  : null;
if (!coreRoot) {
  coreRoot = __defineHiddenValue__(W, 'Core', Object.create(null));
  if (!coreRoot) throw new Error('[module] Core bootstrap failed');
} else {
  __defineHiddenValue__(W, 'Core', coreRoot);
}

let coreInternal = (coreRoot.__internal && typeof coreRoot.__internal === 'object')
  ? coreRoot.__internal
  : null;
if (!coreInternal) {
  coreInternal = __defineHiddenValue__(coreRoot, '__internal', Object.create(null));
  if (!coreInternal) throw new Error('[module] Core.__internal bootstrap failed');
} else {
  __defineHiddenValue__(coreRoot, '__internal', coreInternal);
}

let prngRoot = (coreInternal.prng && typeof coreInternal.prng === 'object')
  ? coreInternal.prng
  : null;
if (!prngRoot) {
  prngRoot = __defineHiddenValue__(coreInternal, 'prng', Object.create(null));
  if (!prngRoot) throw new Error('[module] Core.__internal.prng bootstrap failed');
} else {
  __defineHiddenValue__(coreInternal, 'prng', prngRoot);
}
if (typeof prngRoot.seed !== 'string') prngRoot.seed = '';
if (typeof prngRoot.strToSeed !== 'function') prngRoot.strToSeed = null;
if (typeof prngRoot.mulberry32 !== 'function') prngRoot.mulberry32 = null;
if (!prngRoot.rand || typeof prngRoot.rand !== 'object') prngRoot.rand = null;
if (!prngRoot.pools || typeof prngRoot.pools !== 'object') prngRoot.pools = Object.create(null);
if (typeof prngRoot.marker !== 'string' || !prngRoot.marker) prngRoot.marker = 'envrand';
if (typeof prngRoot.version !== 'string' || !prngRoot.version) prngRoot.version = '1.1.1';

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
    throw new Error('[module] CanvasPatchContext.state.__LANG_STATE__ bootstrap invalid');
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
__envProfileState__.devicesLabels = __cloneProfileValue__(W.__DEVICES_LABELS);

screenState.dpr = Number(W.__DPR);
screenState.width = Number(W.__WIDTH ?? (W.screen && W.screen.width));
screenState.height = Number(W.__HEIGHT ?? (W.screen && W.screen.height));
screenState.colorDepth = Number(W.__COLOR_DEPTH);
screenState.orientationDom = ((screenState.height >= screenState.width))
  ? 'portrait-primary'
  : 'landscape-primary';

__envProfileState__.webglRenderer = W.__WEBGL_RENDERER__;
__envProfileState__.webglVendor = W.__WEBGL_VENDOR__;
__envProfileState__.webglUnmaskedVendor = W.__WEBGL_UNMASKED_VENDOR__;
__envProfileState__.webglUnmaskedRenderer = W.__WEBGL_UNMASKED_RENDERER__;
__envProfileState__.gpuType = W.__GPU_TYPE__;
__envProfileState__.gpuArchitecture = W.__GPU_ARCHITECTURE__;
__envProfileState__.gpuVendor = W.__GPU_VENDOR__;
__envProfileState__.webgpuDevice = W.__WEBGPU_DEVICE__;
__envProfileState__.profile = (__envProfileState__.profile && typeof __envProfileState__.profile === 'object')
  ? __envProfileState__.profile
  : Object.create(null);
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
    '__WEBGL_RENDERER__',
    '__WEBGL_VENDOR__',
    '__WEBGL_UNMASKED_VENDOR__',
    '__WEBGL_UNMASKED_RENDERER__',
    '__GPU_TYPE__',
    '__GPU_ARCHITECTURE__',
    '__GPU_VENDOR__',
    '__WEBGPU_DEVICE__',
    '__DEVICES_LABELS',
    '__PLUGIN_PROFILES__'
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

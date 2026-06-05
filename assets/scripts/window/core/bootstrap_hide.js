const BootstrapHideModule = function BootstrapHideModule(window) {
// Bootstrap globals and seed input capture.
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

const __bootstrapSeedKeys__ = [
  '__GLOBAL_SEED',
  '__EXPECTED_CLIENT_HINTS',
  '__NAV_PLATFORM__',
  '__UA_PLATFORM__',
  '__UA_PLATFORM_VERSION',
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
  '__STORAGE_QUOTA_MB',
  '__STORAGE_USED_PCT',
  '__WEBGL_RENDERER__',
  '__WEBGL_VENDOR__',
  '__WEBGL_UNMASKED_VENDOR__',
  '__WEBGL_UNMASKED_RENDERER__',
  '__GPU_TYPE__',
  '__GPU_ARCHITECTURE__',
  '__GPU_VENDOR__',
  '__WEBGPU_DEVICE__',
  '__NAV_PATCH_STRICT__',
  '__NAV_PATCH_DEBUG__',
  '__DEVICES_LABELS',
  '__PLUGIN_PROFILES__'
];

// Read-only capture of public bootstrap inputs before owner-transfer.
const __bootstrapInputs__ = Object.create(null);
for (const key of __bootstrapSeedKeys__) {
  __bootstrapInputs__[key] = W[key];
}

// Hidden helper functions.
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

function __isObjectLike__(value) {
  return !!value && typeof value === 'object';
}

function __isObjectOrFunction__(value) {
  return !!value && (typeof value === 'object' || typeof value === 'function');
}

function __ensureHiddenObjectSlot__(owner, key, errorMessage, initialValue) {
  let value = __isObjectLike__(owner[key]) ? owner[key] : null;
  if (!value) {
    value = __defineHiddenValue__(
      owner,
      key,
      typeof initialValue === 'function' ? initialValue() : initialValue
    );
    if (!value) throw new Error(errorMessage);
  } else {
    __defineHiddenValue__(owner, key, value);
  }
  return value;
}

function __ensureHiddenObjectOrFunctionSlot__(owner, key, errorMessage, initialValue) {
  let value = __isObjectOrFunction__(owner[key]) ? owner[key] : null;
  if (!value) {
    value = __defineHiddenValue__(
      owner,
      key,
      typeof initialValue === 'function' ? initialValue() : initialValue
    );
    if (!value) throw new Error(errorMessage);
  } else {
    __defineHiddenValue__(owner, key, value);
  }
  return value;
}

function __ensureHiddenOwnSlot__(owner, key, errorMessage) {
  if (!Object.prototype.hasOwnProperty.call(owner, key)) {
    __defineHiddenValue__(owner, key, undefined);
    if (!Object.prototype.hasOwnProperty.call(owner, key)) {
      throw new Error(errorMessage);
    }
  } else {
    __defineHiddenValue__(owner, key, owner[key]);
  }
}

// Root/container creation.
const C = __ensureHiddenObjectOrFunctionSlot__(
  W,
  'FernwehContext',
  '[module] FernwehContext bootstrap failed',
  {}
);

const stateRoot = __ensureHiddenObjectSlot__(
  C,
  'state',
  '[module] FernwehContext.state bootstrap failed',
  () => Object.create(null)
);

// Module route slots.
// FernwehContext.state.__FONTS__
const fontsRoot = __ensureHiddenObjectSlot__(
  stateRoot,
  '__FONTS__',
  '[module] FernwehContext.state.__FONTS__ bootstrap failed',
  () => Object.create(null)
);

const fontsState = __ensureHiddenObjectSlot__(
  fontsRoot,
  '__STATE__',
  '[module] FernwehContext.state.__FONTS__.__STATE__ bootstrap failed',
  () => ({
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
  })
);

const fontsConfigState = __ensureHiddenObjectSlot__(
  fontsRoot,
  '__CONFIG__',
  '[module] FernwehContext.state.__FONTS__.__CONFIG__ bootstrap failed',
  () => {
    const state = Object.create(null);
    state.configs = [];
    return state;
  }
);
if (!Array.isArray(fontsConfigState.configs)) fontsConfigState.configs = [];

// FernwehContext.state.__CANVAS__
const canvasRoot = __ensureHiddenObjectSlot__(
  stateRoot,
  '__CANVAS__',
  '[module] FernwehContext.state.__CANVAS__ bootstrap failed',
  () => Object.create(null)
);

const fernwehState = __ensureHiddenObjectSlot__(
  canvasRoot,
  '__STATE__',
  '[module] FernwehContext.state.__CANVAS__.__STATE__ bootstrap failed',
  () => ({
    domReady: false,
    offscreenReady: false,
    domCanvas: null,
    domCanvasHost: null,
    offscreenCanvas: null
  })
);
__ensureHiddenOwnSlot__(
  fernwehState,
  'defaultCtx2dFont',
  '[module] FernwehContext.state.__CANVAS__.__STATE__.defaultCtx2dFont bootstrap failed'
);
if (typeof fernwehState.defaultCtx2dFont !== 'string' || !fernwehState.defaultCtx2dFont.trim()) {
  __defineHiddenValue__(fernwehState, 'defaultCtx2dFont', null);
}

// FernwehContext.state.__AUDIOCONTEXT__
const audioContextRoot = __ensureHiddenObjectSlot__(
  stateRoot,
  '__AUDIOCONTEXT__',
  '[module] FernwehContext.state.__AUDIOCONTEXT__ bootstrap failed',
  () => Object.create(null)
);

const audioContextState = __ensureHiddenObjectSlot__(
  audioContextRoot,
  '__STATE__',
  '[module] FernwehContext.state.__AUDIOCONTEXT__.__STATE__ bootstrap failed',
  () => ({
    ready: false,
    status: 'bootstrap',
    error: null,
    reason: null,
    ctxClasses: 0,
    offlineCtxClasses: 0,
    targets: 0,
    applied: 0,
    nativeSampleRate: null,
    nativeBaseLatency: null
  })
);
if (audioContextState.ready !== true) audioContextState.ready = false;
if (typeof audioContextState.status !== 'string') audioContextState.status = 'bootstrap';
if (!Object.prototype.hasOwnProperty.call(audioContextState, 'error')) audioContextState.error = null;
if (!Object.prototype.hasOwnProperty.call(audioContextState, 'reason')) audioContextState.reason = null;
if (!Number.isFinite(Number(audioContextState.ctxClasses))) audioContextState.ctxClasses = 0;
if (!Number.isFinite(Number(audioContextState.offlineCtxClasses))) audioContextState.offlineCtxClasses = 0;
if (!Number.isFinite(Number(audioContextState.targets))) audioContextState.targets = 0;
if (!Number.isFinite(Number(audioContextState.applied))) audioContextState.applied = 0;
if (!Object.prototype.hasOwnProperty.call(audioContextState, 'nativeSampleRate')) audioContextState.nativeSampleRate = null;
if (!Object.prototype.hasOwnProperty.call(audioContextState, 'nativeBaseLatency')) audioContextState.nativeBaseLatency = null;

// FernwehContext.state.__WEBGL_STATE__
const webglState = __ensureHiddenObjectSlot__(
  stateRoot,
  '__WEBGL_STATE__',
  '[module] FernwehContext.state.__WEBGL_STATE__ bootstrap failed',
  () => ({
    paramWhitelist: [],
    extensionsWhitelist: []
  })
);
if (!Array.isArray(webglState.paramWhitelist)) webglState.paramWhitelist = [];
if (!Array.isArray(webglState.extensionsWhitelist)) webglState.extensionsWhitelist = [];


// FernwehContext.state.__SCREEN__
const screenRoot = __ensureHiddenObjectSlot__(
  stateRoot,
  '__SCREEN__',
  '[module] FernwehContext.state.__SCREEN__ bootstrap failed',
  () => Object.create(null)
);

// Navigator route skeleton; nav_total_set.js owns the detailed population.
const navRoot = __ensureHiddenObjectSlot__(
  stateRoot,
  '__NAV_TOTAL_SET__',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__ bootstrap failed',
  () => Object.create(null)
);

const navDataStoreState = __ensureHiddenObjectSlot__(
  navRoot,
  '__DATA_STORE_STATE__',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__.__DATA_STORE_STATE__ bootstrap failed',
  () => Object.create(null)
);

const workerEnvSnapshotState = __ensureHiddenObjectSlot__(
  navDataStoreState,
  '__WORKER_ENV_SNAPSHOT__',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__.__DATA_STORE_STATE__.__WORKER_ENV_SNAPSHOT__ bootstrap failed',
  () => Object.create(null)
);

const navScalarState = __ensureHiddenObjectSlot__(
  navRoot,
  '__SCALAR_STATE__',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__.__SCALAR_STATE__ bootstrap failed',
  () => Object.create(null)
);

__ensureHiddenOwnSlot__(navScalarState, 'platform', '[module] FernwehContext.state.__NAV_TOTAL_SET__.__SCALAR_STATE__.platform bootstrap failed');
__ensureHiddenOwnSlot__(navScalarState, 'vendor', '[module] FernwehContext.state.__NAV_TOTAL_SET__.__SCALAR_STATE__.vendor bootstrap failed');
__ensureHiddenOwnSlot__(navScalarState, 'appVersion', '[module] FernwehContext.state.__NAV_TOTAL_SET__.__SCALAR_STATE__.appVersion bootstrap failed');
__ensureHiddenOwnSlot__(navScalarState, 'productSub', '[module] FernwehContext.state.__NAV_TOTAL_SET__.__SCALAR_STATE__.productSub bootstrap failed');
__ensureHiddenOwnSlot__(navScalarState, 'vendorSub', '[module] FernwehContext.state.__NAV_TOTAL_SET__.__SCALAR_STATE__.vendorSub bootstrap failed');
__ensureHiddenOwnSlot__(navScalarState, 'maxTouchPoints', '[module] FernwehContext.state.__NAV_TOTAL_SET__.__SCALAR_STATE__.maxTouchPoints bootstrap failed');
__ensureHiddenOwnSlot__(navScalarState, 'deviceMemory', '[module] FernwehContext.state.__NAV_TOTAL_SET__.__SCALAR_STATE__.deviceMemory bootstrap failed');
__ensureHiddenOwnSlot__(navScalarState, 'hardwareConcurrency', '[module] FernwehContext.state.__NAV_TOTAL_SET__.__SCALAR_STATE__.hardwareConcurrency bootstrap failed');
__ensureHiddenOwnSlot__(navScalarState, 'language', '[module] FernwehContext.state.__NAV_TOTAL_SET__.__SCALAR_STATE__.language bootstrap failed');
__ensureHiddenOwnSlot__(navScalarState, 'languages', '[module] FernwehContext.state.__NAV_TOTAL_SET__.__SCALAR_STATE__.languages bootstrap failed');
__ensureHiddenOwnSlot__(navScalarState, 'buildID', '[module] FernwehContext.state.__NAV_TOTAL_SET__.__SCALAR_STATE__.buildID bootstrap failed');
__ensureHiddenOwnSlot__(navScalarState, 'globalPrivacyControl', '[module] FernwehContext.state.__NAV_TOTAL_SET__.__SCALAR_STATE__.globalPrivacyControl bootstrap failed');
__ensureHiddenOwnSlot__(navScalarState, 'oscpu', '[module] FernwehContext.state.__NAV_TOTAL_SET__.__SCALAR_STATE__.oscpu bootstrap failed');
__ensureHiddenOwnSlot__(navScalarState, 'devicePixelRatio', '[module] FernwehContext.state.__NAV_TOTAL_SET__.__SCALAR_STATE__.devicePixelRatio bootstrap failed');

const navObjectState = __ensureHiddenObjectSlot__(
  navRoot,
  '__OBJECT_STATE__',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__ bootstrap failed',
  () => Object.create(null)
);

const navObjectUserAgentDataState = __ensureHiddenObjectSlot__(
  navObjectState,
  'userAgentData',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.userAgentData bootstrap failed',
  () => Object.create(null)
);

const navObjectUserAgentDataHighEntropyState = __ensureHiddenObjectSlot__(
  navObjectUserAgentDataState,
  'highEntropy',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.userAgentData.highEntropy bootstrap failed',
  () => Object.create(null)
);

const navObjectPluginsState = __ensureHiddenObjectSlot__(
  navObjectState,
  'plugins',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.plugins bootstrap failed',
  () => Object.create(null)
);

const navObjectPluginsProtoMethodsState = __ensureHiddenObjectSlot__(
  navObjectPluginsState,
  'protoMethods',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.plugins.protoMethods bootstrap failed',
  () => Object.create(null)
);

const navObjectPluginsPluginRecordsState = __ensureHiddenObjectSlot__(
  navObjectPluginsState,
  'pluginRecords',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.plugins.pluginRecords bootstrap failed',
  () => Object.create(null)
);

const navObjectMimeTypesState = __ensureHiddenObjectSlot__(
  navObjectState,
  'mimeTypes',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.mimeTypes bootstrap failed',
  () => Object.create(null)
);

const navObjectMimeTypesProtoMethodsState = __ensureHiddenObjectSlot__(
  navObjectMimeTypesState,
  'protoMethods',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.mimeTypes.protoMethods bootstrap failed',
  () => Object.create(null)
);

const navObjectMimeTypesMimeRecordsState = __ensureHiddenObjectSlot__(
  navObjectMimeTypesState,
  'mimeRecords',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.mimeTypes.mimeRecords bootstrap failed',
  () => Object.create(null)
);

const navObjectPermissionsState = __ensureHiddenObjectSlot__(
  navObjectState,
  'permissions',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.permissions bootstrap failed',
  () => Object.create(null)
);

const navObjectStorageState = __ensureHiddenObjectSlot__(
  navObjectState,
  'storage',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.storage bootstrap failed',
  () => Object.create(null)
);

const navObjectStorageEstimateState = __ensureHiddenObjectSlot__(
  navObjectStorageState,
  'estimate',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.storage.estimate bootstrap failed',
  () => Object.create(null)
);

const navObjectPerformanceState = __ensureHiddenObjectSlot__(
  navObjectState,
  'performance',
  '[module] FernwehContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.performance bootstrap failed',
  () => Object.create(null)
);

// FernwehContext.state.__HIDE_WEBDRIVER__
const hideWebdriverRoot = __ensureHiddenObjectSlot__(
  stateRoot,
  '__HIDE_WEBDRIVER__',
  '[module] FernwehContext.state.__HIDE_WEBDRIVER__ bootstrap failed',
  () => Object.create(null)
);

const hideWebdriverState = __ensureHiddenObjectSlot__(
  hideWebdriverRoot,
  '__STATE__',
  '[module] FernwehContext.state.__HIDE_WEBDRIVER__.__STATE__ bootstrap failed',
  () => Object.create(null)
);

// FernwehContext.state.__WRK__
const wrkRoot = __ensureHiddenObjectSlot__(
  stateRoot,
  '__WRK__',
  '[module] FernwehContext.state.__WRK__ bootstrap failed',
  () => Object.create(null)
);

const wrkBootstrapState = __ensureHiddenObjectSlot__(
  wrkRoot,
  'bootstrap',
  '[module] FernwehContext.state.__WRK__.bootstrap bootstrap failed',
  () => Object.create(null)
);

const wrkRuntimeState = __ensureHiddenObjectSlot__(
  wrkRoot,
  'runtime',
  '[module] FernwehContext.state.__WRK__.runtime bootstrap failed',
  () => Object.create(null)
);

const wrkHooksState = __ensureHiddenObjectSlot__(
  wrkRoot,
  'hooks',
  '[module] FernwehContext.state.__WRK__.hooks bootstrap failed',
  () => Object.create(null)
);

// FernwehContext.state.__RECTS__
const rectsRoot = __ensureHiddenObjectSlot__(
  stateRoot,
  '__RECTS__',
  '[module] FernwehContext.state.__RECTS__ bootstrap failed',
  () => Object.create(null)
);

const rectsState = __ensureHiddenObjectSlot__(
  rectsRoot,
  '__STATE__',
  '[module] FernwehContext.state.__RECTS__.__STATE__ bootstrap failed',
  () => Object.create(null)
);
__defineHiddenValue__(rectsState, 'ready', rectsState.ready === true);
__defineHiddenValue__(rectsState, 'status', (typeof rectsState.status === 'string' && rectsState.status) ? rectsState.status : 'bootstrap');
__defineHiddenValue__(rectsState, 'reason', (typeof rectsState.reason === 'string' || rectsState.reason === null) ? rectsState.reason : null);
__defineHiddenValue__(rectsState, 'error', Object.prototype.hasOwnProperty.call(rectsState, 'error') ? rectsState.error : null);
__defineHiddenValue__(rectsState, 'applied', Number.isFinite(Number(rectsState.applied)) ? Number(rectsState.applied) : 0);
__defineHiddenValue__(rectsState, 'targets', Number.isFinite(Number(rectsState.targets)) ? Number(rectsState.targets) : 0);

const rectsConfig = __ensureHiddenObjectSlot__(
  rectsRoot,
  '__CONFIG__',
  '[module] FernwehContext.state.__RECTS__.__CONFIG__ bootstrap failed',
  () => Object.create(null)
);
const rectsMaxMeasurementScan = Number(rectsConfig.maxMeasurementScan);
__defineHiddenValue__(
  rectsConfig,
  'maxMeasurementScan',
  (Number.isFinite(rectsMaxMeasurementScan) && rectsMaxMeasurementScan > 0) ? Math.floor(rectsMaxMeasurementScan) : 2048
);
// FernwehContext runtime helpers and patch state.
const patchStateRoot = __ensureHiddenObjectSlot__(
  C,
  '__patchState',
  '[module] FernwehContext.__patchState__ bootstrap failed',
  () => ({
    canvas: false,
    offscreen: false,
    webgl: false,
    hooksRegistered: false
  })
);

const hookModeStore = __ensureHiddenObjectSlot__(
  C,
  '__hookModeStore',
  '[module] FernwehContext.__hookModeStore bootstrap failed',
  () => Object.create(null)
);
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

const loggerRoot = __ensureHiddenObjectSlot__(
  C,
  '__logger',
  '[module] FernwehContext.__logger bootstrap failed',
  () => Object.create(null)
);

// Core.__internal.prng bootstrap tree.
const coreRoot = __ensureHiddenObjectOrFunctionSlot__(
  W,
  'Core',
  '[module] Core bootstrap failed',
  () => Object.create(null)
);

const coreInternal = __ensureHiddenObjectSlot__(
  coreRoot,
  '__internal',
  '[module] Core.__internal bootstrap failed',
  () => Object.create(null)
);

const prngRoot = __ensureHiddenObjectSlot__(
  coreInternal,
  'prng',
  '[module] Core.__internal.prng bootstrap failed',
  () => Object.create(null)
);
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

// Transit helper functions.
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

function __ensureEnvPlatformState__(envProfileState) {
  const owner = (envProfileState && typeof envProfileState === 'object')
    ? envProfileState
    : __ensureEnvProfileState__();
  let state = (owner.__PLATFORM__ && typeof owner.__PLATFORM__ === 'object')
    ? owner.__PLATFORM__
    : null;
  if (!state) {
    state = Object.create(null);
    state.domPlatform = null;
    state.uaPlatform = null;
    state.platformVersion = null;
    Object.defineProperty(owner, '__PLATFORM__', {
      value: state,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  return state;
}

function __ensureScreenTransitState__() {
  let state = (stateRoot.__SCREEN__ && typeof stateRoot.__SCREEN__ === 'object')
    ? stateRoot.__SCREEN__
    : null;

  if (!state) {
    state = Object.create(null);
    Object.defineProperty(stateRoot, '__SCREEN__', {
      value: state,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }

  if (!Object.prototype.hasOwnProperty.call(state, 'width')) state.width = null;
  if (!Object.prototype.hasOwnProperty.call(state, 'height')) state.height = null;
  if (!Object.prototype.hasOwnProperty.call(state, 'dpr')) state.dpr = null;
  if (!Object.prototype.hasOwnProperty.call(state, 'colorDepth')) state.colorDepth = null;
  if (!Object.prototype.hasOwnProperty.call(state, 'orientationDom')) state.orientationDom = null;

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
    type: 'pipeline missing data',
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
  if (!status.platform || typeof status.platform !== 'object') status.platform = Object.create(null);
  // Screen here means bootstrap transfer readiness, not ScreenPatchModule apply readiness.
  if (!status.screen || typeof status.screen !== 'object') status.screen = Object.create(null);
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

// Seed input transfer into hidden owner state.
const __geoTransitState__ = __ensureGeoTransitState__();
const __langTransitState__ = __ensureLangTransitState__();
const __screenTransitState__ = __ensureScreenTransitState__();
const __envProfileState__ = __ensureEnvProfileState__();
const __envPlatformState__ = __ensureEnvPlatformState__(__envProfileState__);
const __bootstrapLatitude__ = __bootstrapInputs__.__LATITUDE__;
const __bootstrapLongitude__ = __bootstrapInputs__.__LONGITUDE__;
const __bootstrapTimezone__ = __bootstrapInputs__.__TIMEZONE__;
const __bootstrapOffsetMinutes__ = __bootstrapInputs__.__OFFSET_MINUTES__;
const __bootstrapPrimaryLanguage__ = __bootstrapInputs__.__primaryLanguage;
const __bootstrapNormalizedLanguages__ = __bootstrapInputs__.__normalizedLanguages;
const __bootstrapDomPlatform__ = __bootstrapInputs__.__NAV_PLATFORM__;
const __bootstrapUaPlatform__ = __bootstrapInputs__.__UA_PLATFORM__;
const __bootstrapPlatformVersion__ = __bootstrapInputs__.__UA_PLATFORM_VERSION;
const __bootstrapScreenWidth__ = Number(__bootstrapInputs__.__WIDTH ?? (W.screen && W.screen.width));
const __bootstrapScreenHeight__ = Number(__bootstrapInputs__.__HEIGHT ?? (W.screen && W.screen.height));
const __bootstrapScreenDpr__ = Number(__bootstrapInputs__.__DPR);
const __bootstrapScreenColorDepth__ = Number(__bootstrapInputs__.__COLOR_DEPTH);
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
  __langTransitState__.normalizedLanguages = __bootstrapNormalizedLanguages__.slice();
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
    throw new Error('[module] FernwehContext.state.__LANG_STATE__ bootstrap invalid');
  }
  __setBootstrapTransferStatus__('lang', true, 'owner_ready', { source: 'window_transit' });
} else {
  const e = new Error('[module] FernwehContext.state.__LANG_STATE__ bootstrap failed');
  __setBootstrapTransferStatus__('lang', false, 'bootstrap_input_incomplete', { missingKeys: __langMissingKeys__.slice() });
  __emitBootstrapTransferDiag__(
    'error',
    'bootstrap_hide:lang_transfer_incomplete',
    'state.__LANG_STATE__',
    'language owner-transfer incomplete',
    'bootstrap_input_incomplete',
    e,
    { missingKeys: __langMissingKeys__.slice() }
  );
  throw e;
}

const __platformMissingKeys__ = [];
if (!(typeof __bootstrapDomPlatform__ === 'string' && __bootstrapDomPlatform__)) __platformMissingKeys__.push('__NAV_PLATFORM__');
if (!(typeof __bootstrapUaPlatform__ === 'string' && __bootstrapUaPlatform__)) __platformMissingKeys__.push('__UA_PLATFORM__');
if (!(typeof __bootstrapPlatformVersion__ === 'string' && __bootstrapPlatformVersion__)) __platformMissingKeys__.push('__UA_PLATFORM_VERSION');
if (__platformMissingKeys__.length === 0) {
  __envPlatformState__.domPlatform = __bootstrapDomPlatform__;
  __envPlatformState__.uaPlatform = __bootstrapUaPlatform__;
  __envPlatformState__.platformVersion = __bootstrapPlatformVersion__;
  __setBootstrapTransferStatus__('platform', true, 'owner_ready', { source: 'window_transit' });
} else {
  __setBootstrapTransferStatus__('platform', false, 'bootstrap_input_incomplete', { missingKeys: __platformMissingKeys__.slice() });
  __emitBootstrapTransferDiag__(
    'warn',
    'bootstrap_hide:platform_transfer_incomplete',
    'state.__ENV_PROFILE__.__PLATFORM__',
    'platform owner-transfer incomplete',
    'bootstrap_input_incomplete',
    null,
    { missingKeys: __platformMissingKeys__.slice() }
  );
}

const __screenMissingKeys__ = [];
if (!__isFiniteNumber__(__bootstrapScreenWidth__)) __screenMissingKeys__.push('__WIDTH');
if (!__isFiniteNumber__(__bootstrapScreenHeight__)) __screenMissingKeys__.push('__HEIGHT');
if (!__isFiniteNumber__(__bootstrapScreenDpr__)) __screenMissingKeys__.push('__DPR');
if (!__isFiniteNumber__(__bootstrapScreenColorDepth__)) __screenMissingKeys__.push('__COLOR_DEPTH');
if (__screenMissingKeys__.length === 0) {
  __screenTransitState__.width = __bootstrapScreenWidth__;
  __screenTransitState__.height = __bootstrapScreenHeight__;
  __screenTransitState__.dpr = __bootstrapScreenDpr__;
  __screenTransitState__.colorDepth = __bootstrapScreenColorDepth__;
  __screenTransitState__.orientationDom = ((__screenTransitState__.height >= __screenTransitState__.width))
    ? 'portrait-primary'
    : 'landscape-primary';

  __setBootstrapTransferStatus__('screen', true, 'owner_ready', { source: 'window_transit' });
} else {
  __setBootstrapTransferStatus__('screen', false, 'bootstrap_input_incomplete', { missingKeys: __screenMissingKeys__.slice() });
  __emitBootstrapTransferDiag__(
    'warn',
    'bootstrap_hide:screen_transfer_incomplete',
    'state.__SCREEN__',
    'screen owner-transfer incomplete',
    'bootstrap_input_incomplete',
    null,
    { missingKeys: __screenMissingKeys__.slice() }
  );
}

__envProfileState__.meta = __cloneProfileValue__(__bootstrapInputs__.__EXPECTED_CLIENT_HINTS || {});
__envProfileState__.userAgent = __bootstrapInputs__.__USER_AGENT;
__envProfileState__.vendor = __bootstrapInputs__.__VENDOR;
__envProfileState__.mem = Number(__bootstrapInputs__.__memory);
__envProfileState__.cpu = Number(__bootstrapInputs__.__cpu);
__envProfileState__.devicesLabels = __cloneProfileValue__(__bootstrapInputs__.__DEVICES_LABELS);
__envProfileState__.webglRenderer = __bootstrapInputs__.__WEBGL_RENDERER__;
__envProfileState__.webglVendor = __bootstrapInputs__.__WEBGL_VENDOR__;
__envProfileState__.webglUnmaskedVendor = __bootstrapInputs__.__WEBGL_UNMASKED_VENDOR__;
__envProfileState__.webglUnmaskedRenderer = __bootstrapInputs__.__WEBGL_UNMASKED_RENDERER__;
if (!(typeof __envProfileState__.webglVendor === 'string' && __envProfileState__.webglVendor)) {
  throw new Error('[module] FernwehContext.state.__NAV_TOTAL_SET__.__DATA_STORE_STATE__.__WORKER_ENV_SNAPSHOT__.webgl.vendor bootstrap failed');
}
if (!(typeof __envProfileState__.webglRenderer === 'string' && __envProfileState__.webglRenderer)) {
  throw new Error('[module] FernwehContext.state.__NAV_TOTAL_SET__.__DATA_STORE_STATE__.__WORKER_ENV_SNAPSHOT__.webgl.renderer bootstrap failed');
}
if (!(typeof __envProfileState__.webglUnmaskedVendor === 'string' && __envProfileState__.webglUnmaskedVendor)) {
  throw new Error('[module] FernwehContext.state.__NAV_TOTAL_SET__.__DATA_STORE_STATE__.__WORKER_ENV_SNAPSHOT__.webgl.unmaskedVendor bootstrap failed');
}
if (!(typeof __envProfileState__.webglUnmaskedRenderer === 'string' && __envProfileState__.webglUnmaskedRenderer)) {
  throw new Error('[module] FernwehContext.state.__NAV_TOTAL_SET__.__DATA_STORE_STATE__.__WORKER_ENV_SNAPSHOT__.webgl.unmaskedRenderer bootstrap failed');
}
workerEnvSnapshotState.webgl = {
  vendor: __envProfileState__.webglVendor,
  renderer: __envProfileState__.webglRenderer,
  unmaskedVendor: __envProfileState__.webglUnmaskedVendor,
  unmaskedRenderer: __envProfileState__.webglUnmaskedRenderer
};
__envProfileState__.gpuType = __bootstrapInputs__.__GPU_TYPE__;
__envProfileState__.gpuArchitecture = __bootstrapInputs__.__GPU_ARCHITECTURE__;
__envProfileState__.gpuVendor = __bootstrapInputs__.__GPU_VENDOR__;
__envProfileState__.webgpuDevice = __bootstrapInputs__.__WEBGPU_DEVICE__;
__envProfileState__.profile = (__envProfileState__.profile && typeof __envProfileState__.profile === 'object')
  ? __envProfileState__.profile
  : Object.create(null);
__envProfileState__.strict = (__bootstrapInputs__.__NAV_PATCH_STRICT__ !== undefined) ? !!__bootstrapInputs__.__NAV_PATCH_STRICT__ : true;
__envProfileState__.debug = !!__bootstrapInputs__.__NAV_PATCH_DEBUG__;
__envProfileState__.storageQuotaMb = __bootstrapInputs__.__STORAGE_QUOTA_MB;
__envProfileState__.storageUsedPct = __bootstrapInputs__.__STORAGE_USED_PCT;
__envProfileState__.pluginProfiles = __cloneProfileValue__(Array.isArray(__bootstrapInputs__.__PLUGIN_PROFILES__) ? __bootstrapInputs__.__PLUGIN_PROFILES__ : []);

// Cleanup gates.
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

function __platformTransitOwnerReady__() {
  const state = __ensureEnvPlatformState__(__envProfileState__);
  return !!state &&
    typeof state.domPlatform === 'string' && !!state.domPlatform &&
    typeof state.uaPlatform === 'string' && !!state.uaPlatform &&
    typeof state.platformVersion === 'string' && !!state.platformVersion;
}

function __screenTransitOwnerReady__() {
  const state = __ensureScreenTransitState__();
  return !!state &&
    __isFiniteNumber__(state.width) &&
    __isFiniteNumber__(state.height) &&
    __isFiniteNumber__(state.dpr) &&
    __isFiniteNumber__(state.colorDepth);
}

function __workerTransitSnapshotReady__() {
  const ready = !!(C && C.__workerEnvSnapshotReady__ === true);
  if (ready) {
    __bootstrapTransitStatus__.retention.workerEnvSnapshotReady = true;
    __bootstrapTransitStatus__.retention.workerEnvSnapshotStage = 'ready';
    return true;
  }
  const stateRoot = (C && C.state && typeof C.state === 'object') ? C.state : null;
  const wrkState = (stateRoot && stateRoot.__WRK__ && typeof stateRoot.__WRK__ === 'object') ? stateRoot.__WRK__ : null;
  const wrkBootstrap = (wrkState && wrkState.bootstrap && typeof wrkState.bootstrap === 'object') ? wrkState.bootstrap : null;
  const initStatus = (wrkBootstrap && typeof wrkBootstrap.initStatus === 'string') ? wrkBootstrap.initStatus : null;
  if (initStatus === 'skipped' || initStatus === 'error') {
    const prevStage = __bootstrapTransitStatus__.retention.workerEnvSnapshotStage;
    __bootstrapTransitStatus__.retention.workerEnvSnapshotReady = true;
    __bootstrapTransitStatus__.retention.workerEnvSnapshotStage = initStatus;
    if (prevStage !== initStatus) {
      __emitCleanupDiag__(
        initStatus === 'error' ? 'error' : 'warn',
        initStatus === 'error' ? 'bootstrap_hide:cleanup_env_retention_error' : 'bootstrap_hide:cleanup_env_retention_skipped',
        'workerEnvSnapshot',
        initStatus === 'error' ? 'worker snapshot retention terminal error; cleanup released' : 'worker snapshot retention skipped; cleanup released',
        initStatus === 'error' ? 'worker_snapshot_error_terminal' : 'worker_snapshot_skipped',
        null
      );
    }
    return true;
  }
  __bootstrapTransitStatus__.retention.workerEnvSnapshotReady = false;
  __bootstrapTransitStatus__.retention.workerEnvSnapshotStage = 'pending';
  return false;
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
    key === '__NAV_PLATFORM__' ||
    key === '__UA_PLATFORM__' ||
    key === '__UA_PLATFORM_VERSION'
  ) {
    return {
      ready: __platformTransitOwnerReady__(),
      reason: 'platform_owner_not_ready'
    };
  }
  if (
    key === '__WIDTH' ||
    key === '__HEIGHT' ||
    key === '__DPR' ||
    key === '__COLOR_DEPTH'
  ) {
    return {
      ready: __screenTransitOwnerReady__(),
      reason: 'screen_owner_not_ready'
    };
  }
  if (
    key === '__EXPECTED_CLIENT_HINTS' ||
    key === '__USER_AGENT' ||
    key === '__VENDOR' ||
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
  const keys = __bootstrapSeedKeys__.slice();
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

// Ready diag.
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

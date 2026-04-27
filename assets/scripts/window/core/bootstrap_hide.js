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

const __bootstrapSeedKeys__ = [
  '__GLOBAL_SEED',
  '__EXPECTED_CLIENT_HINTS',
  '__FULL_VERSION_LIST',
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

const __bootstrapInputs__ = Object.create(null);
for (const key of __bootstrapSeedKeys__) {
  __bootstrapInputs__[key] = W[key];
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
let navObjectUserAgentDataState = (navObjectState.userAgentData && typeof navObjectState.userAgentData === 'object')
  ? navObjectState.userAgentData
  : null;
if (!navObjectUserAgentDataState) {
  navObjectUserAgentDataState = __defineHiddenValue__(navObjectState, 'userAgentData', Object.create(null));
  if (!navObjectUserAgentDataState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.userAgentData bootstrap failed');
} else {
  __defineHiddenValue__(navObjectState, 'userAgentData', navObjectUserAgentDataState);
}

let navObjectUserAgentDataLowEntropyState = (navObjectUserAgentDataState.lowEntropy && typeof navObjectUserAgentDataState.lowEntropy === 'object')
  ? navObjectUserAgentDataState.lowEntropy
  : null;
if (!navObjectUserAgentDataLowEntropyState) {
  navObjectUserAgentDataLowEntropyState = __defineHiddenValue__(navObjectUserAgentDataState, 'lowEntropy', Object.create(null));
  if (!navObjectUserAgentDataLowEntropyState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.userAgentData.lowEntropy bootstrap failed');
} else {
  __defineHiddenValue__(navObjectUserAgentDataState, 'lowEntropy', navObjectUserAgentDataLowEntropyState);
}

let navObjectUserAgentDataHighEntropyState = (navObjectUserAgentDataState.highEntropy && typeof navObjectUserAgentDataState.highEntropy === 'object')
  ? navObjectUserAgentDataState.highEntropy
  : null;
if (!navObjectUserAgentDataHighEntropyState) {
  navObjectUserAgentDataHighEntropyState = __defineHiddenValue__(navObjectUserAgentDataState, 'highEntropy', Object.create(null));
  if (!navObjectUserAgentDataHighEntropyState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.userAgentData.highEntropy bootstrap failed');
} else {
  __defineHiddenValue__(navObjectUserAgentDataState, 'highEntropy', navObjectUserAgentDataHighEntropyState);
}

let navObjectUserAgentDataToJSONState = (navObjectUserAgentDataState.toJSON && typeof navObjectUserAgentDataState.toJSON === 'object')
  ? navObjectUserAgentDataState.toJSON
  : null;
if (!navObjectUserAgentDataToJSONState) {
  navObjectUserAgentDataToJSONState = __defineHiddenValue__(navObjectUserAgentDataState, 'toJSON', Object.create(null));
  if (!navObjectUserAgentDataToJSONState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.userAgentData.toJSON bootstrap failed');
} else {
  __defineHiddenValue__(navObjectUserAgentDataState, 'toJSON', navObjectUserAgentDataToJSONState);
}

let navObjectPluginsState = (navObjectState.plugins && typeof navObjectState.plugins === 'object')
  ? navObjectState.plugins
  : null;
if (!navObjectPluginsState) {
  navObjectPluginsState = __defineHiddenValue__(navObjectState, 'plugins', Object.create(null));
  if (!navObjectPluginsState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.plugins bootstrap failed');
} else {
  __defineHiddenValue__(navObjectState, 'plugins', navObjectPluginsState);
}

let navObjectPluginsProtoMethodsState = (navObjectPluginsState.protoMethods && typeof navObjectPluginsState.protoMethods === 'object')
  ? navObjectPluginsState.protoMethods
  : null;
if (!navObjectPluginsProtoMethodsState) {
  navObjectPluginsProtoMethodsState = __defineHiddenValue__(navObjectPluginsState, 'protoMethods', Object.create(null));
  if (!navObjectPluginsProtoMethodsState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.plugins.protoMethods bootstrap failed');
} else {
  __defineHiddenValue__(navObjectPluginsState, 'protoMethods', navObjectPluginsProtoMethodsState);
}

let navObjectPluginsPluginRecordsState = (navObjectPluginsState.pluginRecords && typeof navObjectPluginsState.pluginRecords === 'object')
  ? navObjectPluginsState.pluginRecords
  : null;
if (!navObjectPluginsPluginRecordsState) {
  navObjectPluginsPluginRecordsState = __defineHiddenValue__(navObjectPluginsState, 'pluginRecords', Object.create(null));
  if (!navObjectPluginsPluginRecordsState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.plugins.pluginRecords bootstrap failed');
} else {
  __defineHiddenValue__(navObjectPluginsState, 'pluginRecords', navObjectPluginsPluginRecordsState);
}

let navObjectMimeTypesState = (navObjectState.mimeTypes && typeof navObjectState.mimeTypes === 'object')
  ? navObjectState.mimeTypes
  : null;
if (!navObjectMimeTypesState) {
  navObjectMimeTypesState = __defineHiddenValue__(navObjectState, 'mimeTypes', Object.create(null));
  if (!navObjectMimeTypesState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.mimeTypes bootstrap failed');
} else {
  __defineHiddenValue__(navObjectState, 'mimeTypes', navObjectMimeTypesState);
}

let navObjectMimeTypesProtoMethodsState = (navObjectMimeTypesState.protoMethods && typeof navObjectMimeTypesState.protoMethods === 'object')
  ? navObjectMimeTypesState.protoMethods
  : null;
if (!navObjectMimeTypesProtoMethodsState) {
  navObjectMimeTypesProtoMethodsState = __defineHiddenValue__(navObjectMimeTypesState, 'protoMethods', Object.create(null));
  if (!navObjectMimeTypesProtoMethodsState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.mimeTypes.protoMethods bootstrap failed');
} else {
  __defineHiddenValue__(navObjectMimeTypesState, 'protoMethods', navObjectMimeTypesProtoMethodsState);
}

let navObjectMimeTypesMimeRecordsState = (navObjectMimeTypesState.mimeRecords && typeof navObjectMimeTypesState.mimeRecords === 'object')
  ? navObjectMimeTypesState.mimeRecords
  : null;
if (!navObjectMimeTypesMimeRecordsState) {
  navObjectMimeTypesMimeRecordsState = __defineHiddenValue__(navObjectMimeTypesState, 'mimeRecords', Object.create(null));
  if (!navObjectMimeTypesMimeRecordsState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.mimeTypes.mimeRecords bootstrap failed');
} else {
  __defineHiddenValue__(navObjectMimeTypesState, 'mimeRecords', navObjectMimeTypesMimeRecordsState);
}

let navObjectPermissionsState = (navObjectState.permissions && typeof navObjectState.permissions === 'object')
  ? navObjectState.permissions
  : null;
if (!navObjectPermissionsState) {
  navObjectPermissionsState = __defineHiddenValue__(navObjectState, 'permissions', Object.create(null));
  if (!navObjectPermissionsState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.permissions bootstrap failed');
} else {
  __defineHiddenValue__(navObjectState, 'permissions', navObjectPermissionsState);
}

let navObjectStorageState = (navObjectState.storage && typeof navObjectState.storage === 'object')
  ? navObjectState.storage
  : null;
if (!navObjectStorageState) {
  navObjectStorageState = __defineHiddenValue__(navObjectState, 'storage', Object.create(null));
  if (!navObjectStorageState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.storage bootstrap failed');
} else {
  __defineHiddenValue__(navObjectState, 'storage', navObjectStorageState);
}

let navObjectStorageEstimateState = (navObjectStorageState.estimate && typeof navObjectStorageState.estimate === 'object')
  ? navObjectStorageState.estimate
  : null;
if (!navObjectStorageEstimateState) {
  navObjectStorageEstimateState = __defineHiddenValue__(navObjectStorageState, 'estimate', Object.create(null));
  if (!navObjectStorageEstimateState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.storage.estimate bootstrap failed');
} else {
  __defineHiddenValue__(navObjectStorageState, 'estimate', navObjectStorageEstimateState);
}

let navObjectStorageWebkitTemporaryStorageState = (navObjectStorageState.webkitTemporaryStorage && typeof navObjectStorageState.webkitTemporaryStorage === 'object')
  ? navObjectStorageState.webkitTemporaryStorage
  : null;
if (!navObjectStorageWebkitTemporaryStorageState) {
  navObjectStorageWebkitTemporaryStorageState = __defineHiddenValue__(navObjectStorageState, 'webkitTemporaryStorage', Object.create(null));
  if (!navObjectStorageWebkitTemporaryStorageState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.storage.webkitTemporaryStorage bootstrap failed');
} else {
  __defineHiddenValue__(navObjectStorageState, 'webkitTemporaryStorage', navObjectStorageWebkitTemporaryStorageState);
}

let navObjectStoragePersistenceState = (navObjectStorageState.persistence && typeof navObjectStorageState.persistence === 'object')
  ? navObjectStorageState.persistence
  : null;
if (!navObjectStoragePersistenceState) {
  navObjectStoragePersistenceState = __defineHiddenValue__(navObjectStorageState, 'persistence', Object.create(null));
  if (!navObjectStoragePersistenceState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.storage.persistence bootstrap failed');
} else {
  __defineHiddenValue__(navObjectStorageState, 'persistence', navObjectStoragePersistenceState);
}

let navObjectPerformanceState = (navObjectState.performance && typeof navObjectState.performance === 'object')
  ? navObjectState.performance
  : null;
if (!navObjectPerformanceState) {
  navObjectPerformanceState = __defineHiddenValue__(navObjectState, 'performance', Object.create(null));
  if (!navObjectPerformanceState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.performance bootstrap failed');
} else {
  __defineHiddenValue__(navObjectState, 'performance', navObjectPerformanceState);
}

let navObjectPerformanceMemoryState = (navObjectPerformanceState.memory && typeof navObjectPerformanceState.memory === 'object')
  ? navObjectPerformanceState.memory
  : null;
if (!navObjectPerformanceMemoryState) {
  navObjectPerformanceMemoryState = __defineHiddenValue__(navObjectPerformanceState, 'memory', Object.create(null));
  if (!navObjectPerformanceMemoryState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.performance.memory bootstrap failed');
} else {
  __defineHiddenValue__(navObjectPerformanceState, 'memory', navObjectPerformanceMemoryState);
}

let navObjectCredentialsState = (navObjectState.credentials && typeof navObjectState.credentials === 'object')
  ? navObjectState.credentials
  : null;
if (!navObjectCredentialsState) {
  navObjectCredentialsState = __defineHiddenValue__(navObjectState, 'credentials', Object.create(null));
  if (!navObjectCredentialsState) throw new Error('[module] CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__.credentials bootstrap failed');
} else {
  __defineHiddenValue__(navObjectState, 'credentials', navObjectCredentialsState);
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

function __ensureEnvScreenState__(envProfileState) {
  const owner = (envProfileState && typeof envProfileState === 'object')
    ? envProfileState
    : __ensureEnvProfileState__();
  let state = (owner.__SCREEN__ && typeof owner.__SCREEN__ === 'object')
    ? owner.__SCREEN__
    : null;
  if (!state) {
    state = Object.create(null);
    state.width = null;
    state.height = null;
    state.dpr = null;
    state.colorDepth = null;
    state.orientationDom = null;
    Object.defineProperty(owner, '__SCREEN__', {
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
  if (!status.platform || typeof status.platform !== 'object') status.platform = Object.create(null);
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
const __envPlatformState__ = __ensureEnvPlatformState__(__envProfileState__);
const __envScreenState__ = __ensureEnvScreenState__(__envProfileState__);
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
  __envScreenState__.width = __bootstrapScreenWidth__;
  __envScreenState__.height = __bootstrapScreenHeight__;
  __envScreenState__.dpr = __bootstrapScreenDpr__;
  __envScreenState__.colorDepth = __bootstrapScreenColorDepth__;
  __envScreenState__.orientationDom = ((__envScreenState__.height >= __envScreenState__.width))
    ? 'portrait-primary'
    : 'landscape-primary';
  __envProfileState__.dpr = __bootstrapScreenDpr__;
  __envProfileState__.colorDepth = __bootstrapScreenColorDepth__;
} else {
  __emitBootstrapTransferDiag__(
    'warn',
    'bootstrap_hide:screen_transfer_incomplete',
    'state.__ENV_PROFILE__.__SCREEN__',
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
__envProfileState__.gpuType = __bootstrapInputs__.__GPU_TYPE__;
__envProfileState__.gpuArchitecture = __bootstrapInputs__.__GPU_ARCHITECTURE__;
__envProfileState__.gpuVendor = __bootstrapInputs__.__GPU_VENDOR__;
__envProfileState__.webgpuDevice = __bootstrapInputs__.__WEBGPU_DEVICE__;
__envProfileState__.profile = (__envProfileState__.profile && typeof __envProfileState__.profile === 'object')
  ? __envProfileState__.profile
  : Object.create(null);
__envProfileState__.strict = (__bootstrapInputs__.__NAV_PATCH_STRICT__ !== undefined) ? !!__bootstrapInputs__.__NAV_PATCH_STRICT__ : true;
__envProfileState__.debug = !!__bootstrapInputs__.__NAV_PATCH_DEBUG__;
__envProfileState__.fullVersionList = __cloneProfileValue__(__bootstrapInputs__.__FULL_VERSION_LIST);
__envProfileState__.storageQuotaMb = __bootstrapInputs__.__STORAGE_QUOTA_MB;
__envProfileState__.storageUsedPct = __bootstrapInputs__.__STORAGE_USED_PCT;
__envProfileState__.pluginProfiles = __cloneProfileValue__(Array.isArray(__bootstrapInputs__.__PLUGIN_PROFILES__) ? __bootstrapInputs__.__PLUGIN_PROFILES__ : []);
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

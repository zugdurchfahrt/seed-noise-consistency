// === WRK MODULE ===
const WrkModule = function WrkModule(window) {
  'use strict';
  const G = (typeof globalThis !== 'undefined' && globalThis)
    || (typeof self       !== 'undefined' && self)
    || (typeof window     !== 'undefined' && window)
    || (typeof global     !== 'undefined' && global)
    || {};
  const __MODULE = 'wrk';
  const __SURFACE = 'wrk';
  const __tag = 'wrk';
  const __flagKey = '__PATCH_WRK__';
  function __resolveWrkDegrade__() {
    const C = (G && G.FernwehContext && typeof G.FernwehContext === 'object')
      ? G.FernwehContext
      : null;
    const L = (C && C.__logger && typeof C.__logger === 'object')
      ? C.__logger
      : null;
    if (L && typeof L.__DEGRADE__ === 'function') return L.__DEGRADE__;
    return (G && typeof G.__DEGRADE__ === 'function') ? G.__DEGRADE__ : null;
  }

  function __wrkEmit(level, code, ctx, err) {
    try {
      const __D = __resolveWrkDegrade__();
      const __diag = (__D && typeof __D.diag === 'function') ? __D.diag.bind(__D) : null;
      if (__diag) return __diag(level, code, ctx, err);
      if (typeof __D === 'function') {
        const safeCtx = (ctx && typeof ctx === 'object') ? ctx : {};
        const safeErr = (err === undefined || err === null) ? null : err;
        return __D(code, safeErr, Object.assign({}, safeCtx, { level: level || 'info' }));
      }
    } catch (emitErr) {
      return undefined;
    }
    return undefined;
  }

  function __wrkDiag(level, code, extra, err) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    return __wrkEmit(level, code, {
      module: __MODULE,
      diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : __MODULE,
      surface: (typeof x.surface === 'string' && x.surface) ? x.surface : __SURFACE,
      key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
      stage: x.stage,
      message: x.message,
      data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
      type: x.type
    }, err || null);
  }

  function __wrkBestEffort(code, extra, fn) {
    try {
      return fn();
    } catch (e) {
      __wrkDiag('warn', code, extra, e);
      return undefined;
    }
  }

  function __setHiddenValue__(obj, key, value) {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return value;
    const d = Object.getOwnPropertyDescriptor(obj, key);
    if (d && d.configurable === false) {
      if (Object.prototype.hasOwnProperty.call(d, 'value')) return d.value;
      return value;
    }
    Object.defineProperty(obj, key, {
      value: value,
      writable: true,
      configurable: true,
      enumerable: false
    });
    return value;
  }

  function __wrkCloneEnvValue__(v) {
    if (Array.isArray(v)) return v.map(__wrkCloneEnvValue__);
    if (v && typeof v === 'object') {
      const out = {};
      const keys = Object.keys(v);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        out[key] = __wrkCloneEnvValue__(v[key]);
      }
      return out;
    }
    return v;
  }

  function __resolveFernwehContext__() {
    const C = (G && G.FernwehContext && typeof G.FernwehContext === 'object')
      ? G.FernwehContext
      : null;
    return C;
  }

  function __ensureWrkStateRoot__() {
    const C = __resolveFernwehContext__();
    const stateRoot = (C && C.state && typeof C.state === 'object')
      ? C.state
      : null;
    if (!stateRoot) return null;
    const wrkState = (stateRoot.__WRK__ && typeof stateRoot.__WRK__ === 'object')
      ? stateRoot.__WRK__
      : null;
    return wrkState;
  }

  function __ensureWrkRuntimeRoot__() {
    const wrkState = __ensureWrkStateRoot__();
    if (!wrkState) return null;
    const runtimeRoot = (wrkState.runtime && typeof wrkState.runtime === 'object')
      ? wrkState.runtime
      : null;
    return runtimeRoot;
  }

  function __ensureWrkHooksRoot__() {
    const wrkState = __ensureWrkStateRoot__();
    if (!wrkState) return null;
    const hooksRoot = (wrkState.hooks && typeof wrkState.hooks === 'object')
      ? wrkState.hooks
      : null;
    return hooksRoot;
  }

  function __wrkStateSet__(key, value) {
    const stateRoot = __ensureWrkStateRoot__();
    if (stateRoot && typeof key === 'string' && key) stateRoot[key] = value;
    return value;
  }

  function __wrkRuntimeSet__(key, value) {
    const runtimeRoot = __ensureWrkRuntimeRoot__();
    if (runtimeRoot && typeof key === 'string' && key) __setHiddenValue__(runtimeRoot, key, value);
    return value;
  }

  function __wrkRuntimeGet__(key) {
    const runtimeRoot = __ensureWrkRuntimeRoot__();
    if (runtimeRoot && typeof key === 'string' && key && Object.prototype.hasOwnProperty.call(runtimeRoot, key)) {
      return runtimeRoot[key];
    }
    return undefined;
  }

  function __resolveScopeWrkRuntimeRoot__(scope) {
    if (!scope || (typeof scope !== 'object' && typeof scope !== 'function')) return null;
    const C = (scope.FernwehContext && typeof scope.FernwehContext === 'object')
      ? scope.FernwehContext
      : null;
    if (!C) return null;
    const stateRoot = (C.state && typeof C.state === 'object')
      ? C.state
      : null;
    if (!stateRoot) return null;
    const wrkState = (stateRoot.__WRK__ && typeof stateRoot.__WRK__ === 'object')
      ? stateRoot.__WRK__
      : null;
    if (!wrkState) return null;
    return (wrkState.runtime && typeof wrkState.runtime === 'object')
      ? wrkState.runtime
      : null;
  }

  function __ensureScopeWrkRuntimeRoot__(scope) {
    return __resolveScopeWrkRuntimeRoot__(scope);
  }

  function __captureEnvHub__(hub) {
    if (hub && typeof hub === 'object') __wrkRuntimeSet__('envHub', hub);
    return hub;
  }

  function __resolveEnvHub__() {
    const hub = __wrkRuntimeGet__('envHub');
    if (hub && typeof hub.publish === 'function' && typeof hub.subscribe === 'function') return hub;
    return null;
  }

  function __captureBlobUrlStore__(store) {
    if (store instanceof Map) __wrkRuntimeSet__('blobUrlStore', store);
    return store;
  }

  function __resolveBlobUrlStore__() {
    const store = __wrkRuntimeGet__('blobUrlStore');
    return (store instanceof Map) ? store : null;
  }

  function __resolveWorkerReflectSource__() {
    const reflectSrc = (typeof __wrkRuntimeGet__('inlineReflect') === 'string' && __wrkRuntimeGet__('inlineReflect'))
      ? __wrkRuntimeGet__('inlineReflect')
      : null;
    return reflectSrc;
  }

  function __requireWorkerPatchRuntime__(reason, stage) {
    const workerPatchClassic = __wrkRuntimeGet__('workerPatchClassic');
    const workerPatchModule = __wrkRuntimeGet__('workerPatchModule');
    const inlineReflect = __wrkRuntimeGet__('inlineReflect') || __resolveWorkerReflectSource__();
    const inlineCoreWindow = __wrkRuntimeGet__('inlineCoreWindow');
    const inlinePrng = __wrkRuntimeGet__('inlinePrng');
    const inlineCanvasPatch = __wrkRuntimeGet__('inlineCanvasPatch');
    const inlineFernwehContext = __wrkRuntimeGet__('inlineFernwehContext');
    if (typeof workerPatchClassic === 'string' && workerPatchClassic
        && typeof workerPatchModule === 'string' && workerPatchModule
        && typeof inlineReflect === 'string' && inlineReflect
        && typeof inlineCoreWindow === 'string' && inlineCoreWindow
        && typeof inlinePrng === 'string' && inlinePrng
        && typeof inlineCanvasPatch === 'string' && inlineCanvasPatch
        && typeof inlineFernwehContext === 'string' && inlineFernwehContext) {
      return {
        workerPatchClassic,
        workerPatchModule,
        inlineReflect,
        inlineCoreWindow,
        inlinePrng,
        inlineCanvasPatch,
        inlineFernwehContext
      };
    }
    const err = new Error('[WrkModule] FAIL_FAST: worker patch runtime not ready');
    __wrkDiag('error', 'wrk:worker_patch_runtime_missing', {
      stage: (typeof stage === 'string' && stage) ? stage : 'preflight',
      key: 'FernwehContext.state.__WRK__.runtime',
      message: (typeof reason === 'string' && reason) ? reason : 'worker patch runtime not ready',
      type: 'pipeline missing data',
      data: { outcome: 'throw', reason: 'worker_patch_runtime_missing' }
    }, err);
    throw err;
  }

  function __captureWorkerPatchApi__(api) {
    if (!api || typeof api !== 'object') return null;
    __wrkRuntimeSet__('workerPatchApi', api);
    __wrkStateSet__('workerPatchApiReady', true);
    return api;
  }

  function __requireWorkerPatchApi__(reason, stage) {
    const api = __wrkRuntimeGet__('workerPatchApi');
    if (api && typeof api === 'object') return api;
    const err = new Error('[WrkModule] FAIL_FAST: worker patch api not ready');
    __wrkDiag('error', 'wrk:worker_patch_api_missing', {
      stage: (typeof stage === 'string' && stage) ? stage : 'preflight',
      key: 'FernwehContext.state.__WRK__.runtime.workerPatchApi',
      message: (typeof reason === 'string' && reason) ? reason : 'worker patch api not ready',
      type: 'pipeline missing data',
      data: { outcome: 'throw', reason: 'worker_patch_api_missing' }
    }, err);
    throw err;
  }

  function __captureWorkerPatchHooks__(hooks) {
    if (!hooks || typeof hooks !== 'object') return null;
    const hooksRoot = __ensureWrkHooksRoot__();
    if (!hooksRoot) return hooks;
    __setHiddenValue__(hooksRoot, 'WorkerPatchHooks', hooks);
    __wrkRuntimeSet__('workerPatchHooksReady', true);
    return hooks;
  }

  function __updateWorkerSnapshotStatus__(ready, stage) {
    const C = (G && G.FernwehContext && typeof G.FernwehContext === 'object')
      ? G.FernwehContext
      : null;
    if (!C) return;
    __wrkBestEffort('wrk:worker_snapshot_status_update_failed', {
      stage: 'apply',
      key: 'FernwehContext.__workerEnvSnapshotReady__',
      message: 'worker snapshot status update failed',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'worker_snapshot_status_update_failed' }
    }, () => {
      __setHiddenValue__(C, '__workerEnvSnapshotReady__', !!ready);
      const status = (C.__bootstrapTransitStatus__ && typeof C.__bootstrapTransitStatus__ === 'object')
        ? C.__bootstrapTransitStatus__
        : null;
      if (!status) return;
      if (!status.retention || typeof status.retention !== 'object') {
        status.retention = Object.create(null);
      }
      status.retention.workerEnvSnapshotReady = !!ready;
      status.retention.workerEnvSnapshotStage = (typeof stage === 'string' && stage) ? stage : null;
    });
  }

  function __retryBootstrapEnvCleanup__() {
    const C = (G && G.FernwehContext && typeof G.FernwehContext === 'object')
      ? G.FernwehContext
      : null;
    if (!C || typeof C.__runBootstrapEnvCleanup__ !== 'function') return;
    __wrkBestEffort('wrk:bootstrap_cleanup_retry_failed', {
      stage: 'cleanup',
      key: 'FernwehContext.__runBootstrapEnvCleanup__',
      message: 'bootstrap env cleanup retry failed',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'bootstrap_cleanup_retry_failed' }
    }, () => {
      C.__runBootstrapEnvCleanup__(G, 'worker_snapshot_ready');
    });
  }

  __updateWorkerSnapshotStatus__(false, 'pending');

  function relayWorkerDiagEnvelope(G, scope, payload) {
    const d = __resolveWrkDegrade__();
    if (typeof d !== 'function' || !payload || typeof payload !== 'object') return false;
    const rawCtx = (payload.ctx && typeof payload.ctx === 'object') ? payload.ctx : {};
    const rawData = Object.prototype.hasOwnProperty.call(rawCtx, 'data') ? rawCtx.data : null;
    let nextData = rawData;
    if (rawData && typeof rawData === 'object') {
      nextData = Object.assign({}, rawData, { scope: scope || null });
    } else if (scope) {
      nextData = { scope: scope || null };
    }
    const ctx = {
      module: (typeof rawCtx.module === 'string' && rawCtx.module) ? rawCtx.module : 'wrk',
      diagTag: (typeof rawCtx.diagTag === 'string' && rawCtx.diagTag) ? rawCtx.diagTag : 'wrk',
      surface: (typeof rawCtx.surface === 'string' && rawCtx.surface) ? rawCtx.surface : 'worker',
      key: (typeof rawCtx.key === 'string' || rawCtx.key === null) ? rawCtx.key : null,
      stage: (typeof rawCtx.stage === 'string' && rawCtx.stage) ? rawCtx.stage : 'runtime',
      message: (typeof rawCtx.message === 'string' && rawCtx.message) ? rawCtx.message : String(payload.code || 'wrk:worker_diag'),
      data: nextData,
      type: (typeof rawCtx.type === 'string' && rawCtx.type) ? rawCtx.type : 'pipeline missing data'
    };
    const errObj = (payload.error && typeof payload.error === 'object') ? payload.error : null;
    let err = null;
    if (errObj) {
      err = new Error(String(errObj.message || payload.code || 'worker relay error'));
      if (typeof errObj.name === 'string' && errObj.name) err.name = errObj.name;
      if (typeof errObj.stack === 'string' && errObj.stack) err.stack = errObj.stack;
    }
    if (typeof d.diag === 'function') {
      d.diag((typeof payload.level === 'string' && payload.level) ? payload.level : 'info', String(payload.code || 'wrk:worker_diag'), ctx, err);
      return true;
    }
    d(String(payload.code || 'wrk:worker_diag'), err, Object.assign({}, ctx, {
      level: (typeof payload.level === 'string' && payload.level) ? payload.level : 'info'
    }));
    return true;
  }

  const __core = window && window.Core;
  let __guardToken = null;
  try {
    if (!__core || typeof __core.guardFlag !== 'function') {
      __wrkDiag('warn', __MODULE + ':guard_missing', {
        stage: 'guard',
        key: 'guard',
        message: 'Core.guardFlag missing',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
      }, null);
      return;
    }
    __guardToken = __core.guardFlag(__flagKey, __tag);
  } catch (e) {
    __wrkDiag('warn', __MODULE + ':guard_failed', {
      stage: 'guard',
      key: 'guard',
      message: 'guardFlag threw',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'guard_failed' }
    }, e);
    return;
  }
  if (!__guardToken) return;

  try {
    const mark = (function() {
      const register = (__core && typeof __core.__registerToStringWrapper === 'function')
        ? __core.__registerToStringWrapper
        : null;
      if (typeof register !== 'function') {
        throw new Error('[WrkModule] Core.__registerToStringWrapper missing');
      }
      return function registerNativeSurface(raw, label) {
        const bridgeTarget = raw && raw.__coreBridgeTarget__;
        if (typeof raw !== 'function' || typeof bridgeTarget !== 'function') {
          throw new Error('[WrkModule] bridge target missing');
        }
        if (Object.getPrototypeOf(raw) !== Object.getPrototypeOf(bridgeTarget)) {
          throw new Error('[WrkModule] function prototype chain mismatch');
        }
        return register(raw, bridgeTarget, label, 'WrkModule:' + String(label || 'anonymous'));
      };
    })();

// 1) Источник снапшотов
function EnvBus(G){
  function __cloneEnvValue(v) {
    return __wrkCloneEnvValue__(v);
  }
  function __resolveFernwehContextStateRoot() {
    const C = (G && G.FernwehContext && typeof G.FernwehContext === 'object')
      ? G.FernwehContext
      : null;
    const stateRoot = (C && C.state && typeof C.state === 'object')
      ? C.state
      : null;
    return stateRoot;
  }
  function __requireWorkerEnvSnapshot() {
    const stateRoot = __resolveFernwehContextStateRoot();
    if (!stateRoot) throw new Error('EnvBus: FernwehContext.state missing');
    const navModuleState = (stateRoot && stateRoot.__NAV_TOTAL_SET__ && typeof stateRoot.__NAV_TOTAL_SET__ === 'object')
      ? stateRoot.__NAV_TOTAL_SET__
      : null;
    const navScalarState = (navModuleState && navModuleState.__SCALAR_STATE__ && typeof navModuleState.__SCALAR_STATE__ === 'object')
      ? navModuleState.__SCALAR_STATE__
      : null;
    if (!navScalarState) throw new Error('EnvBus: __NAV_TOTAL_SET__.__SCALAR_STATE__ missing');
    const envProfileSource = (stateRoot.__ENV_PROFILE__ && typeof stateRoot.__ENV_PROFILE__ === 'object')
      ? stateRoot.__ENV_PROFILE__
      : null;
    if (!envProfileSource) throw new Error('EnvBus: __ENV_PROFILE__ missing');
    const envPlatform = (envProfileSource.__PLATFORM__ && typeof envProfileSource.__PLATFORM__ === 'object')
      ? envProfileSource.__PLATFORM__
      : null;
    if (!envPlatform) throw new Error('EnvBus: __ENV_PROFILE__.__PLATFORM__ missing');
    const workerMeta = (envProfileSource.meta && typeof envProfileSource.meta === 'object')
      ? envProfileSource.meta
      : null;
    if (!workerMeta) throw new Error('EnvBus: __ENV_PROFILE__.meta missing');
    const out = __cloneEnvValue({
      ua: envProfileSource.userAgent,
      language: navScalarState.language,
      languages: __cloneEnvValue(navScalarState.languages),
      deviceMemory: navScalarState.deviceMemory,
      hardwareConcurrency: navScalarState.hardwareConcurrency,
      uaData: {
        brands: __cloneEnvValue(workerMeta.brands),
        mobile: workerMeta.mobile,
        platform: envPlatform.uaPlatform,
        he: {
          architecture: workerMeta.architecture,
          bitness: workerMeta.bitness,
          model: workerMeta.model,
          platformVersion: envPlatform.platformVersion,
          uaFullVersion: workerMeta.uaFullVersion,
          fullVersionList: __cloneEnvValue(workerMeta.fullVersionList),
          wow64: workerMeta.wow64,
          formFactors: __cloneEnvValue(workerMeta.formFactors)
        }
      },
      webgl: {
        vendor: envProfileSource.webglVendor,
        renderer: envProfileSource.webglRenderer,
        unmaskedVendor: envProfileSource.webglUnmaskedVendor,
        unmaskedRenderer: envProfileSource.webglUnmaskedRenderer
      }
    });
    const isStringArray = (value, allowEmpty) => {
      if (!Array.isArray(value)) return false;
      if (!allowEmpty && !value.length) return false;
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] !== 'string' || !value[i]) return false;
      }
      return true;
    };
    const isBrandList = (value) => {
      if (!Array.isArray(value) || !value.length) return false;
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (!item || typeof item !== 'object') return false;
        if (typeof item.brand !== 'string' || !item.brand) return false;
        if (typeof item.version !== 'string' || !item.version) return false;
      }
      return true;
    };
    if (typeof out.ua !== 'string' || !out.ua) throw new Error('EnvBus: worker env snapshot ua missing');
    if (typeof out.language !== 'string' || !out.language) throw new Error('EnvBus: worker env snapshot language missing');
    if (!isStringArray(out.languages, false)) throw new Error('EnvBus: worker env snapshot languages missing');
    if (!Number.isFinite(Number(out.deviceMemory))) throw new Error('EnvBus: worker env snapshot deviceMemory missing');
    if (!Number.isFinite(Number(out.hardwareConcurrency))) throw new Error('EnvBus: worker env snapshot hardwareConcurrency missing');
    if (!out.uaData || typeof out.uaData !== 'object') throw new Error('EnvBus: worker env snapshot uaData missing');
    if (!isBrandList(out.uaData.brands)) throw new Error('EnvBus: worker env snapshot uaData.brands missing');
    if (typeof out.uaData.mobile !== 'boolean') throw new Error('EnvBus: worker env snapshot uaData.mobile missing');
    if (typeof out.uaData.platform !== 'string' || !out.uaData.platform) throw new Error('EnvBus: worker env snapshot uaData.platform missing');
    if (!out.uaData.he || typeof out.uaData.he !== 'object') throw new Error('EnvBus: worker env snapshot uaData.he missing');
    if (typeof out.uaData.he.architecture !== 'string' || !out.uaData.he.architecture) throw new Error('EnvBus: worker env snapshot uaData.he.architecture missing');
    if (typeof out.uaData.he.bitness !== 'string' || !out.uaData.he.bitness) throw new Error('EnvBus: worker env snapshot uaData.he.bitness missing');
    if (typeof out.uaData.he.model !== 'string') throw new Error('EnvBus: worker env snapshot uaData.he.model missing');
    if (typeof out.uaData.he.platformVersion !== 'string' || !out.uaData.he.platformVersion) throw new Error('EnvBus: worker env snapshot uaData.he.platformVersion missing');
    if (typeof out.uaData.he.uaFullVersion !== 'string' || !out.uaData.he.uaFullVersion) throw new Error('EnvBus: worker env snapshot uaData.he.uaFullVersion missing');
    if (!isBrandList(out.uaData.he.fullVersionList)) throw new Error('EnvBus: worker env snapshot uaData.he.fullVersionList missing');
    if (typeof out.uaData.he.wow64 !== 'boolean') throw new Error('EnvBus: worker env snapshot uaData.he.wow64 missing');
    if (!isStringArray(out.uaData.he.formFactors, false)) throw new Error('EnvBus: worker env snapshot uaData.he.formFactors missing');
    if (!out.webgl || typeof out.webgl !== 'object') throw new Error('EnvBus: worker env snapshot webgl missing');
    if (typeof out.webgl.vendor !== 'string' || !out.webgl.vendor) throw new Error('EnvBus: worker env snapshot webgl.vendor missing');
    if (typeof out.webgl.renderer !== 'string' || !out.webgl.renderer) throw new Error('EnvBus: worker env snapshot webgl.renderer missing');
    if (typeof out.webgl.unmaskedVendor !== 'string' || !out.webgl.unmaskedVendor) throw new Error('EnvBus: worker env snapshot webgl.unmaskedVendor missing');
    if (typeof out.webgl.unmaskedRenderer !== 'string' || !out.webgl.unmaskedRenderer) throw new Error('EnvBus: worker env snapshot webgl.unmaskedRenderer missing');
    if (Object.prototype.hasOwnProperty.call(out.webgl, 'compressedTextureFormats')) {
      if (!Array.isArray(out.webgl.compressedTextureFormats)) throw new Error('EnvBus: worker env snapshot webgl.compressedTextureFormats invalid');
      for (let i = 0; i < out.webgl.compressedTextureFormats.length; i++) {
        if (typeof out.webgl.compressedTextureFormats[i] !== 'number' || !Number.isFinite(out.webgl.compressedTextureFormats[i])) {
          throw new Error('EnvBus: worker env snapshot webgl.compressedTextureFormats invalid');
        }
      }
    }
    if (Object.prototype.hasOwnProperty.call(out.webgl, 'webglCapabilities')) {
      const webglCapabilities = out.webgl.webglCapabilities;
      if (!webglCapabilities || typeof webglCapabilities !== 'object') throw new Error('EnvBus: worker env snapshot webgl.webglCapabilities invalid');
      if (typeof webglCapabilities.selected !== 'string' || !webglCapabilities.selected) throw new Error('EnvBus: worker env snapshot webgl.webglCapabilities.selected missing');
      const capabilityKeys = ['webgl2', 'webgl', 'experimentalWebgl'];
      for (let i = 0; i < capabilityKeys.length; i++) {
        const capabilityKey = capabilityKeys[i];
        if (!Object.prototype.hasOwnProperty.call(webglCapabilities, capabilityKey)) continue;
        const entry = webglCapabilities[capabilityKey];
        if (!entry || typeof entry !== 'object' || !Array.isArray(entry.compressedTextureFormats)) {
          throw new Error('EnvBus: worker env snapshot webgl.webglCapabilities.' + capabilityKey + ' invalid');
        }
        for (let j = 0; j < entry.compressedTextureFormats.length; j++) {
          if (typeof entry.compressedTextureFormats[j] !== 'number' || !Number.isFinite(entry.compressedTextureFormats[j])) {
            throw new Error('EnvBus: worker env snapshot webgl.webglCapabilities.' + capabilityKey + '.compressedTextureFormats invalid');
          }
        }
      }
      if (Object.prototype.hasOwnProperty.call(out.webgl, 'compressedTextureFormats')) {
        const selectedCapability = webglCapabilities[webglCapabilities.selected];
        if (!selectedCapability || typeof selectedCapability !== 'object' || !Array.isArray(selectedCapability.compressedTextureFormats)) {
          throw new Error('EnvBus: worker env snapshot webgl.webglCapabilities.selected entry missing');
        }
        if (selectedCapability.compressedTextureFormats.length !== out.webgl.compressedTextureFormats.length) {
          throw new Error('EnvBus: worker env snapshot webgl.compressedTextureFormats selected mismatch');
        }
        for (let i = 0; i < out.webgl.compressedTextureFormats.length; i++) {
          if (!Object.is(selectedCapability.compressedTextureFormats[i], out.webgl.compressedTextureFormats[i])) {
            throw new Error('EnvBus: worker env snapshot webgl.compressedTextureFormats selected mismatch');
          }
        }
      }
    }
    return out;
  }
  function __cloneFontsFamilySnapshotForWorker__(familySnapshot) {
    const out = {
      allowedFamilies: null,
      runtimeFamilies: [],
      platformDom: null,
      versionToken: null
    };
    if (!familySnapshot || typeof familySnapshot !== 'object') return out;
    if (familySnapshot.allowedFamilies instanceof Set) {
      out.allowedFamilies = Array.from(familySnapshot.allowedFamilies);
    } else if (Array.isArray(familySnapshot.allowedFamilies)) {
      out.allowedFamilies = familySnapshot.allowedFamilies.slice();
    }
    if (familySnapshot.runtimeFamilies instanceof Set) {
      out.runtimeFamilies = Array.from(familySnapshot.runtimeFamilies);
    } else if (Array.isArray(familySnapshot.runtimeFamilies)) {
      out.runtimeFamilies = familySnapshot.runtimeFamilies.slice();
    }
    if (Object.prototype.hasOwnProperty.call(familySnapshot, 'platformDom')) {
      out.platformDom = __cloneEnvValue(familySnapshot.platformDom);
    }
    if (Object.prototype.hasOwnProperty.call(familySnapshot, 'versionToken')) {
      out.versionToken = __cloneEnvValue(familySnapshot.versionToken);
    }
    return out;
  }
  function __cloneFontsStateForWorker__() {
    const stateRoot = __resolveFernwehContextStateRoot();
    const fontsRoot = (stateRoot && stateRoot.__FONTS__ && typeof stateRoot.__FONTS__ === 'object')
      ? stateRoot.__FONTS__
      : null;
    const fontsState = (fontsRoot && fontsRoot.__STATE__ && typeof fontsRoot.__STATE__ === 'object')
      ? fontsRoot.__STATE__
      : null;
    if (!fontsState) return null;
    const awaitReadyStatus = (typeof fontsState.awaitReadyStatus === 'string' && fontsState.awaitReadyStatus)
      ? fontsState.awaitReadyStatus
      : null;
    return {
      ready: fontsState.ready === true,
      error: Object.prototype.hasOwnProperty.call(fontsState, 'error')
        ? __cloneEnvValue(fontsState.error)
        : null,
      awaitReady: null,
      awaitReadyStatus,
      awaitReadyPending: awaitReadyStatus === 'pending' && !!(fontsState.awaitReady && typeof fontsState.awaitReady.then === 'function'),
      familySnapshot: __cloneFontsFamilySnapshotForWorker__(fontsState.familySnapshot)
    };
  }
  function __cloneFontsConfigForWorker__() {
    const stateRoot = __resolveFernwehContextStateRoot();
    const fontsRoot = (stateRoot && stateRoot.__FONTS__ && typeof stateRoot.__FONTS__ === 'object')
      ? stateRoot.__FONTS__
      : null;
    const fontsConfigState = (fontsRoot && fontsRoot.__CONFIG__ && typeof fontsRoot.__CONFIG__ === 'object')
      ? fontsRoot.__CONFIG__
      : null;
    const configs = Array.isArray(fontsConfigState && fontsConfigState.configs)
      ? fontsConfigState.configs
      : null;
    if (!configs) return null;
    return {
      configs: __cloneEnvValue(configs)
    };
  }
  const __geoStateRoot = (G && G.FernwehContext && G.FernwehContext.state && typeof G.FernwehContext.state === 'object' && G.FernwehContext.state.__GEO_STATE__ && typeof G.FernwehContext.state.__GEO_STATE__ === 'object')
    ? G.FernwehContext.state.__GEO_STATE__
    : null;
  const __envTimeZone = (__geoStateRoot && typeof __geoStateRoot.timezone === 'string' && __geoStateRoot.timezone)
    ? __geoStateRoot.timezone
    : null;
  function envSnapshot(){
    const ownerSnap = __requireWorkerEnvSnapshot();
    const snap = (ownerSnap && typeof ownerSnap === 'object')
      ? __cloneEnvValue(ownerSnap)
      : null;
    if (!snap || typeof snap !== 'object') {
      throw new Error('EnvBus: worker env snapshot missing');
    }
    const stateRoot = __resolveFernwehContextStateRoot();
    const cpu = Number(snap.hardwareConcurrency);
    const mem = Number(snap.deviceMemory);
    const timeZone = __envTimeZone;
    if (!timeZone) throw new Error('EnvBus: state.__GEO_STATE__.timezone missing');
    const uaData = (snap.uaData && typeof snap.uaData === 'object')
      ? __cloneEnvValue(snap.uaData)
      : null;
    if (!uaData) {
      throw new Error('EnvBus: worker env snapshot uaData missing');
    }
    const he = __cloneEnvValue(uaData.he);
    uaData.he = he;
    const envProfileSource = (stateRoot && stateRoot.__ENV_PROFILE__ && typeof stateRoot.__ENV_PROFILE__ === 'object')
      ? stateRoot.__ENV_PROFILE__
      : null;
    const envProfile = envProfileSource
      ? __cloneEnvValue(envProfileSource)
      : null;
    if (!envProfile || typeof envProfile !== 'object') {
      throw new Error('EnvBus: __ENV_PROFILE__ missing');
    }
    const envPlatform = (envProfileSource.__PLATFORM__ && typeof envProfileSource.__PLATFORM__ === 'object')
      ? envProfileSource.__PLATFORM__
      : null;
    if (!envPlatform || typeof envPlatform !== 'object') {
      throw new Error('EnvBus: __ENV_PROFILE__.__PLATFORM__ missing');
    }
    if (typeof envPlatform.domPlatform !== 'string' || !envPlatform.domPlatform) {
      throw new Error('EnvBus: __ENV_PROFILE__.__PLATFORM__.domPlatform missing');
    }
    if (typeof envPlatform.uaPlatform !== 'string' || !envPlatform.uaPlatform) {
      throw new Error('EnvBus: __ENV_PROFILE__.__PLATFORM__.uaPlatform missing');
    }
    if (typeof envPlatform.platformVersion !== 'string' || !envPlatform.platformVersion) {
      throw new Error('EnvBus: __ENV_PROFILE__.__PLATFORM__.platformVersion missing');
    }
    envProfile.__PLATFORM__ = __cloneEnvValue(envPlatform);

    const envScreenState = (stateRoot && stateRoot.__SCREEN__ && typeof stateRoot.__SCREEN__ === 'object')
      ? stateRoot.__SCREEN__
      : null;

    if (!envScreenState || typeof envScreenState !== 'object') {
      throw new Error('EnvBus: __SCREEN__ missing');
    }

    const envScreen = {
      width: Number(envScreenState.width),
      height: Number(envScreenState.height),
      dpr: Number(envScreenState.dpr),
      colorDepth: Number(envScreenState.colorDepth),
      orientationDom: envScreenState.orientationDom
    };

    if (!Number.isFinite(Number(envScreen.width))) {
      throw new Error('EnvBus: __SCREEN__.width missing');
    }
    if (!Number.isFinite(Number(envScreen.height))) {
      throw new Error('EnvBus: __SCREEN__.height missing');
    }
    if (!Number.isFinite(Number(envScreen.dpr)) || Number(envScreen.dpr) <= 0) {
      throw new Error('EnvBus: __SCREEN__.dpr missing');
    }
    if (!Number.isFinite(Number(envScreen.colorDepth))) {
      throw new Error('EnvBus: __SCREEN__.colorDepth missing');
    }

    const dpr = Number(envScreen.dpr);


    snap.uaData = uaData;
    snap.highEntropy = he;
    snap.webgl = __cloneEnvValue(snap.webgl);
    snap.hardwareConcurrency = cpu;
    snap.deviceMemory = mem;
    snap.cpu = cpu;
    snap.mem = mem;
    snap.dpr = dpr;
    snap.timeZone = timeZone;
    snap.screen = __cloneEnvValue(envScreen);
    snap.envProfile = envProfile;
    (() => {
      const existing = __wrkRuntimeGet__('windowKeys');
      if (Array.isArray(existing) && existing.length) return existing;
      try {
        const keys = Object.getOwnPropertyNames(G);
        if (!Array.isArray(keys) || keys.length === 0) {
          throw new Error('EnvBus: windowKeys missing');
        }
        __wrkRuntimeSet__('windowKeys', keys.slice());
        return keys;
      } catch (e) {
        throw new Error('EnvBus: windowKeys missing');
      }
    })();
    return snap;
  }

  function syncShared(port){ const snap = envSnapshot(); port.start(); port.postMessage({ __ENV_SYNC__: { envSnapshot: snap } }); }
  function syncDedicated(worker){ const snap = envSnapshot(); worker.postMessage({ __ENV_SYNC__: { envSnapshot: snap } }); }
  return {
    envSnapshot,
    syncShared,
    syncDedicated,
    cloneFontsStateForWorker: __cloneFontsStateForWorker__,
    cloneFontsConfigForWorker: __cloneFontsConfigForWorker__
  };
}


// 2) Хаб (инициализация без записи в глобал): вернёт объект hub
function EnvHub_init(G){
  if (typeof BroadcastChannel !== 'function') {
    throw new Error('EnvHub: BroadcastChannel missing');
  }
  const bc = new BroadcastChannel('__ENV_SYNC__');
  const state = { snap: null };
  const hub = {
    v: 1000001,
    __OWNS_WORKER__: false,
    __OWNS_SHARED__: false,
    __OWNS_SW__:     false,
    getSnapshot(){ return state.snap; },
    publish(snap){
      if (!snap || typeof snap !== 'object') throw new Error('EnvHub: publish missing snapshot');
      state.snap = snap;
      bc.postMessage({ __ENV_SYNC__: { envSnapshot: snap } });
    },
    subscribe(fn){
      if (typeof fn !== 'function') throw new Error('EnvHub: subscribe requires function');
      const h = ev=>{ fn(ev?.data?.__ENV_SYNC__?.envSnapshot); };
      bc.addEventListener('message',h);
      return ()=>bc.removeEventListener('message',h);
    },
    installWorkerNavMirror(scope){
      if (!scope) throw new Error('EnvHub: installWorkerNavMirror missing scope');
      const runtimeRoot = __ensureScopeWrkRuntimeRoot__(scope);
      if (!runtimeRoot) throw new Error('EnvHub: installWorkerNavMirror runtime root missing');
      __setHiddenValue__(runtimeRoot, 'envHub', hub);
    }
  };
  return hub;
}


// 2a) Обёртка для вызова из бандла
function EnvHubPatchModule(G){
  const existingHub = __resolveEnvHub__();
  if (existingHub) return existingHub;
  const hub = EnvHub_init(G);
  return __captureEnvHub__(hub);
}

// 3) Установка оверрайдов (Worker/Shared/SW).Используем SafeWorkerOverride.
function WorkerOverrides_install(G, hub) {
  const already = G.Worker && G.Worker.__ENV_WRAPPED__ === true;
  if (!already) SafeWorkerOverride(G);

  if (G.SharedWorker) {
    const alreadySW = !!(G.SharedWorker && G.SharedWorker.__ENV_WRAPPED__ === true);
    if (!alreadySW) SafeSharedWorkerOverride(G);
  }
  ServiceWorkerOverride(G);
}



// === worker patch runtime (главный бандл) ===
(function setupWorkerPatchRuntime(global){
const ENV_WRK_SRC = __resolveWorkerReflectSource__();
if (typeof ENV_WRK_SRC !== 'string' || !ENV_WRK_SRC) {
  throw new Error('WrkModule: inlineReflect missing');
}

function mkWorkerBootstrapCore(opts){
  if (!opts || typeof opts !== 'object') throw new Error('wrk: mkWorkerBootstrapCore bad opts');
  const snapshot = opts.snapshot;
  const absUrl = opts.absUrl;
  const patchUrl = opts.patchUrl;
  const expectedWorkerScopeKind = opts.expectedWorkerScopeKind;
  const inlineCoreWindow = opts.inlineCoreWindow;
  const inlinePrng = opts.inlinePrng;
  const inlineCanvasPatch = opts.inlineCanvasPatch;
  const inlineFernwehContext = opts.inlineFernwehContext;
  const patchUrlMissingMessage = opts.patchUrlMissingMessage;
  const prePatchOwnerSource = typeof opts.prePatchOwnerSource === 'string' ? opts.prePatchOwnerSource : '';
  const patchLoaderSource = opts.patchLoaderSource;
  const userLoaderSource = opts.userLoaderSource;
  const bootstrapSuffixSource = opts.bootstrapSuffixSource;
  const sourceURL = opts.sourceURL;
  if (!snapshot || typeof snapshot !== 'object') throw new Error('wrk: mkWorkerBootstrapCore bad snapshot');
  if (typeof absUrl !== 'string' || !absUrl) throw new Error('wrk: mkWorkerBootstrapCore bad absUrl');
  if (typeof patchUrl !== 'string' || !patchUrl) throw new Error('wrk: mkWorkerBootstrapCore bad patchUrl');
  if (expectedWorkerScopeKind !== 'dedicated' && expectedWorkerScopeKind !== 'shared') throw new Error('wrk: mkWorkerBootstrapCore bad expectedWorkerScopeKind');
  if (typeof inlineCoreWindow !== 'string' || !inlineCoreWindow) throw new Error('wrk: mkWorkerBootstrapCore bad inlineCoreWindow');
  if (typeof inlinePrng !== 'string' || !inlinePrng) throw new Error('wrk: mkWorkerBootstrapCore bad inlinePrng');
  if (typeof inlineCanvasPatch !== 'string' || !inlineCanvasPatch) throw new Error('wrk: mkWorkerBootstrapCore bad inlineCanvasPatch');
  if (typeof inlineFernwehContext !== 'string' || !inlineFernwehContext) throw new Error('wrk: mkWorkerBootstrapCore bad inlineFernwehContext');
  if (typeof patchUrlMissingMessage !== 'string' || !patchUrlMissingMessage) throw new Error('wrk: mkWorkerBootstrapCore bad patchUrlMissingMessage');
  if (typeof patchLoaderSource !== 'string' || !patchLoaderSource) throw new Error('wrk: mkWorkerBootstrapCore bad patchLoaderSource');
  if (typeof userLoaderSource !== 'string' || !userLoaderSource) throw new Error('wrk: mkWorkerBootstrapCore bad userLoaderSource');
  if (typeof bootstrapSuffixSource !== 'string') throw new Error('wrk: mkWorkerBootstrapCore bad bootstrapSuffixSource');
  if (typeof sourceURL !== 'string' || !sourceURL) throw new Error('wrk: mkWorkerBootstrapCore bad sourceURL');
  const SNAP = JSON.stringify(snapshot);
  const PATCH_URL = JSON.stringify(patchUrl);
  const EXPECTED_WORKER_SCOPE_KIND = JSON.stringify(expectedWorkerScopeKind);
  const INLINE_CORE_WINDOW = JSON.stringify(inlineCoreWindow);
  const INLINE_PRNG = JSON.stringify(inlinePrng);
  const INLINE_CANVAS_PATCH = JSON.stringify(inlineCanvasPatch);
  const INLINE_CONTEXT_PATCH = JSON.stringify(inlineFernwehContext);
  return `
    (async function(){
      'use strict';
      var __ENV_BOOTSTRAP_ACTIVE__ = true;
      var __ENV_EMIT_Q__ = [];
      var __ENV_DIAG_RELAY_ACTIVE__ = false;
      var __ENV_SHARED_PORTS__ = [];
      var __ENV_CONNECT_Q__ = [];
      var __ENV_CONNECT_BUF__ = true;
      var __LAST_SNAP__ = null;
      var __ENV_SNAP_APPLIED__ = null;
      var __ENV_EXPECTED_WORKER_SCOPE_KIND__ =
        (typeof ${EXPECTED_WORKER_SCOPE_KIND} === 'string' && ${EXPECTED_WORKER_SCOPE_KIND})
          ? ${EXPECTED_WORKER_SCOPE_KIND}
          : null;
      var __isServiceWorkerScope__ = function(){
        try {
          return typeof ServiceWorkerGlobalScope === 'function' && self instanceof ServiceWorkerGlobalScope;
        } catch(_e) {}
        return false;
      };
      var __detectWorkerScopeKind__ = function(){
        try {
          if (typeof SharedWorkerGlobalScope === 'function' && self instanceof SharedWorkerGlobalScope) return 'shared';
        } catch(_e) {}
        try {
          if (typeof DedicatedWorkerGlobalScope === 'function' && self instanceof DedicatedWorkerGlobalScope) return 'dedicated';
        } catch(_e) {}
        return null;
      };
      var __ENV_WORKER_SCOPE_KIND__ = __detectWorkerScopeKind__();
      var __serializeDiagErr = function(err){
        if (!err) return null;
        var out = {};
        try { if (typeof err.name === 'string' && err.name) out.name = err.name; } catch(_e) {}
        try { if (typeof err.message === 'string' && err.message) out.message = err.message; } catch(_e) {}
        try { if (typeof err.stack === 'string' && err.stack) out.stack = err.stack; } catch(_e) {}
        if (!Object.keys(out).length) {
          try { out.message = String(err); } catch(_e) { out.message = 'worker bootstrap relay error'; }
        }
        return out;
      };
      var __sendRelayMsg = function(msg){
        var sent = false;
        try {
          if (__ENV_WORKER_SCOPE_KIND__ !== 'shared' && typeof self.postMessage === 'function') {
            self.postMessage(msg);
            sent = true;
          }
        } catch(_e) {}
        try {
          if (__ENV_SHARED_PORTS__ && __ENV_SHARED_PORTS__.length) {
            for (var i = 0; i < __ENV_SHARED_PORTS__.length; i++) {
              try { __ENV_SHARED_PORTS__[i].postMessage(msg); sent = true; } catch(_e) {}
            }
          }
        } catch(_e) {}
        if (!sent) {
          try { __ENV_EMIT_Q__.push(msg); } catch(_e) {}
        }
      };
      var __relayDiag = function(level, code, ctx, err){
        if (__ENV_DIAG_RELAY_ACTIVE__) return;
        __ENV_DIAG_RELAY_ACTIVE__ = true;
        try {
          var x = (ctx && typeof ctx === 'object') ? ctx : {};
          __sendRelayMsg({
            __ENV_DIAG__: {
              level: (typeof level === 'string' && level) ? level : 'info',
              code: String(code || 'worker_bootstrap:diag'),
              ctx: {
                module: (typeof x.module === 'string' && x.module) ? x.module : 'wrk',
                diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : 'wrk',
                surface: (typeof x.surface === 'string' && x.surface) ? x.surface : 'worker_bootstrap',
                key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
                stage: (typeof x.stage === 'string' && x.stage) ? x.stage : 'runtime',
                message: (typeof x.message === 'string' && x.message) ? x.message : String(code || 'worker bootstrap diag'),
                data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
                type: (typeof x.type === 'string' && x.type) ? x.type : 'pipeline missing data'
              },
              error: __serializeDiagErr(err)
            }
          });
        } finally {
          __ENV_DIAG_RELAY_ACTIVE__ = false;
        }
      };
      var __emitDiag = function(code, err, extra){
        var e = (err && typeof err === 'object') ? err : new Error(String(err || code));
        var ctx = {
          type: 'pipeline missing data',
          stage: 'apply',
          module: 'wrk',
          diagTag: 'wrk',
          surface: 'worker_bootstrap',
          key: '__ENV_BOOTSTRAP_ERROR__',
          message: 'worker bootstrap emit failed',
          data: { outcome: 'throw', reason: 'worker_bootstrap_emit_failed' },
          policy: 'throw',
          action: 'throw'
        };
        try {
          var d = self && self.__DEGRADE__;
          if (extra && typeof extra === 'object') {
            for (var k in extra) {
              if (Object.prototype.hasOwnProperty.call(extra, k)) ctx[k] = extra[k];
            }
          }
          if (typeof d === 'function') {
            if (typeof d.diag === 'function') d.diag('error', code, ctx, e);
            else d(code, e, Object.assign({}, ctx, { level: 'error' }));
          }
        } catch(__diagErr) {
          try { self.__ENV_DIAG_ERROR__ = String((__diagErr && (__diagErr.stack || __diagErr.message)) || __diagErr); } catch(__diagStoreErr) { self.__ENV_DIAG_STORE_ERROR__ = String((__diagStoreErr && (__diagStoreErr.stack || __diagStoreErr.message)) || __diagStoreErr); }
        }
        __relayDiag('error', code, ctx, e);
      };
      var __emit = function(msg){
        var sent = false;
        try {
          if (__ENV_WORKER_SCOPE_KIND__ !== 'shared' && typeof self.postMessage === 'function') {
            self.postMessage(msg);
            sent = true;
          }
        } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'worker_postMessage' }); }
        try {
          if (__ENV_SHARED_PORTS__ && __ENV_SHARED_PORTS__.length) {
            for (var i = 0; i < __ENV_SHARED_PORTS__.length; i++) {
              try { __ENV_SHARED_PORTS__[i].postMessage(msg); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'shared_port' }); }
            }
            sent = true;
          }
        } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'shared_ports_enumeration' }); }
        if (!sent) {
          try { __ENV_EMIT_Q__.push(msg); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'emit_queue' }); }
        }
      };
      var __closeBootstrapScope__ = function(){
        try {
          if (typeof setTimeout === 'function') {
            setTimeout(function(){ try { self.close(); } catch(_e) {} });
          } else {
            self.close();
          }
        } catch(_e) {}
      };
      function __resolveWorkerRuntimeApplyFn__(){
        try {
          var __materialized = __materializeWorkerOwnerGraph__();
          var __wrkRuntime = __materialized && __materialized.wrkRuntime;
          if (!__wrkRuntime || typeof __wrkRuntime !== 'object') return null;
          if (typeof __wrkRuntime.consumeEnvSnapshot === 'function') return __wrkRuntime.consumeEnvSnapshot;
        } catch(_e) {}
        return null;
      }
      function __queueWorkerRuntimeSnapshot__(s){
        try {
          if (!s || typeof s !== 'object') return false;
          var __materialized = __materializeWorkerOwnerGraph__();
          var __wrkRuntime = __materialized && __materialized.wrkRuntime;
          if (!__wrkRuntime || typeof __wrkRuntime !== 'object') return false;
          var q = Array.isArray(__wrkRuntime.pendingEnvSnapshots) ? __wrkRuntime.pendingEnvSnapshots : null;
          if (!q) {
            q = [];
            __defineWorkerHiddenValue__(__wrkRuntime, 'pendingEnvSnapshots', q);
          }
          q.push(s);
          return true;
        } catch(_e) {}
        return false;
      }
      if (__isServiceWorkerScope__()) {
        __emitDiag('wrk:worker_bootstrap:preflight:service_scope_unsupported', new Error('ServiceWorker scope is unsupported in dedicated/shared bootstrap core'), {
          stage: 'preflight',
          key: '__WORKER_SCOPE_KIND__',
          message: 'service worker must use a separate pipeline lane',
          type: 'pipeline missing data',
          data: { outcome: 'throw', reason: 'service_scope_requires_separate_lane' }
        });
        throw new Error('WorkerBootstrap: service worker requires separate lane');
      }
      if (!__ENV_WORKER_SCOPE_KIND__) {
        __emitDiag('wrk:worker_bootstrap:preflight:scope_kind_missing', new Error('Worker bootstrap scope kind missing'), {
          stage: 'preflight',
          key: '__WORKER_SCOPE_KIND__',
          message: 'worker bootstrap scope kind missing',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'worker_scope_kind_missing' }
        });
        throw new Error('WorkerBootstrap: scope kind missing');
      }
      if (__ENV_EXPECTED_WORKER_SCOPE_KIND__ && __ENV_EXPECTED_WORKER_SCOPE_KIND__ !== __ENV_WORKER_SCOPE_KIND__) {
        __emitDiag('wrk:worker_bootstrap:contract:scope_kind_mismatch', new Error('Worker bootstrap scope kind mismatch'), {
          stage: 'contract',
          key: '__EXPECTED_WORKER_SCOPE_KIND__',
          message: 'worker bootstrap scope kind mismatch',
          type: 'pipeline missing data',
          data: {
            outcome: 'throw',
            reason: 'worker_scope_kind_mismatch',
            expected: __ENV_EXPECTED_WORKER_SCOPE_KIND__,
            actual: __ENV_WORKER_SCOPE_KIND__
          }
        });
        throw new Error('WorkerBootstrap: scope kind mismatch');
      }
      try {
        if (typeof BroadcastChannel === 'function') {
          var __ENV_SYNC_CHANNEL__ = new BroadcastChannel('__ENV_SYNC__');
          __ENV_SYNC_CHANNEL__.addEventListener('message', function(msgEv){
            try {
              var syncPacket = msgEv && msgEv.data && msgEv.data.__ENV_SYNC__;
              var syncSnap = syncPacket && syncPacket.envSnapshot;
              var syncApply = __resolveWorkerRuntimeApplyFn__();
              if (syncSnap && syncApply) {
                syncApply(syncSnap);
              } else if (syncSnap && !syncApply && !__queueWorkerRuntimeSnapshot__(syncSnap)) {
                throw new Error('WorkerBootstrap: env sync consumer missing');
              }
            } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'broadcast_env_sync' }); }
          });
        }
      } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'broadcast_channel_install' }); }
      try {
        // SharedWorker needs port-based signalling; do not rely on onconnect (user code can overwrite it).
        self.addEventListener('connect', function(ev){
          try {
            if (__ENV_WORKER_SCOPE_KIND__ !== 'shared') {
              throw new Error('WorkerBootstrap: unexpected connect event outside SharedWorkerGlobalScope');
            }
            var ports = ev && ev.ports;
            var connectPorts = null;
            if (!ports || !ports.length) {
              throw new Error('WorkerBootstrap: shared connect event missing ports');
            }
            if (ports && ports.length) {
              connectPorts = [];
              for (var j = 0; j < ports.length; j++) {
                try { if (typeof ports[j].start === 'function') ports[j].start(); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'shared_port_start' }); }
                try {
                  if (typeof ports[j].addEventListener === 'function') {
                    ports[j].addEventListener('message', function(msgEv){
                      try {
                        var syncPacket = msgEv && msgEv.data && msgEv.data.__ENV_SYNC__;
                        var syncSnap = syncPacket && syncPacket.envSnapshot;
                        var syncApply = __resolveWorkerRuntimeApplyFn__();
                        if (syncSnap && syncApply) {
                          syncApply(syncSnap);
                        } else if (syncSnap && !syncApply && !__queueWorkerRuntimeSnapshot__(syncSnap)) {
                          throw new Error('WorkerBootstrap: shared env sync consumer missing');
                        }
                      } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'shared_port_env_sync' }); }
                    });
                  }
                } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'shared_port_listener_install' }); }
                __ENV_SHARED_PORTS__.push(ports[j]);
                connectPorts.push(ports[j]);
              }
            }
            if (__ENV_CONNECT_BUF__ && connectPorts && connectPorts.length) {
              __ENV_CONNECT_Q__.push(connectPorts);
            }
          } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'shared_connect_event' }); }
          try {
            if (__ENV_EMIT_Q__ && __ENV_EMIT_Q__.length) {
              var q = __ENV_EMIT_Q__.slice(0);
              __ENV_EMIT_Q__.length = 0;
              for (var k = 0; k < q.length; k++) {
                __emit(q[k]);
              }
            }
          } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'emit_queue_flush' }); }
        });
      } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'connect_listener_install' }); }
      // Buffer early messages sent before user code installs its handler(s).
      // Without this, callers that postMessage immediately after Worker() may time out.
      const __MSG_Q__ = [];
      let __MSG_BUF__ = true;
      const __onEarlyMsg__ = ev => { if (__MSG_BUF__) __MSG_Q__.push(ev && ev.data); };
      try { self.addEventListener('message', __onEarlyMsg__); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'early_message_listener_install' }); }
      const __requireSnap = s => {
        if (!s || typeof s !== 'object') throw new Error('Ubergabe: no snapshot');
        if (typeof s.language !== 'string' || !s.language) throw new Error('Ubergabe: bad language');
        if (!Array.isArray(s.languages)) throw new Error('Ubergabe: bad languages');
        if (!Number.isFinite(Number(s.deviceMemory))) throw new Error('Ubergabe: bad deviceMemory');
        if (!Number.isFinite(Number(s.hardwareConcurrency))) throw new Error('Ubergabe: bad hardwareConcurrency');
        if (!s.uaData) throw new Error('Ubergabe: missing userAgentData');
        const he = (s.uaData && s.uaData.he) || s.highEntropy;
        if (!he || typeof he !== 'object') throw new Error('Ubergabe: missing highEntropy');
        const KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
        for (const k of KEYS) {
          if (!(k in he)) throw new Error('Ubergabe: missing highEntropy.' + k);
          const v = he[k];
          if (v === undefined || v === null) throw new Error('Ubergabe: bad highEntropy.' + k);
          if (Array.isArray(v) && !v.length) throw new Error('Ubergabe: bad highEntropy.' + k);
        }
        return s;
      };
      var __defineWorkerHiddenValue__ = function(obj, key, value){
        if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return value;
        var desc = Object.getOwnPropertyDescriptor(obj, key);
        if (desc && desc.configurable === false) {
          return Object.prototype.hasOwnProperty.call(desc, 'value') ? desc.value : value;
        }
        Object.defineProperty(obj, key, {
          value: value,
          writable: true,
          configurable: true,
          enumerable: false
        });
        return value;
      };
      var __materializeWorkerOwnerGraph__ = function(){
        var C = (self.FernwehContext && typeof self.FernwehContext === 'object')
          ? self.FernwehContext
          : __defineWorkerHiddenValue__(self, 'FernwehContext', Object.create(null));
        var stateRoot = (C.state && typeof C.state === 'object')
          ? C.state
          : __defineWorkerHiddenValue__(C, 'state', Object.create(null));
        var wrkState = (stateRoot.__WRK__ && typeof stateRoot.__WRK__ === 'object')
          ? stateRoot.__WRK__
          : __defineWorkerHiddenValue__(stateRoot, '__WRK__', Object.create(null));
        var navModuleState = (stateRoot.__NAV_TOTAL_SET__ && typeof stateRoot.__NAV_TOTAL_SET__ === 'object')
          ? stateRoot.__NAV_TOTAL_SET__
          : __defineWorkerHiddenValue__(stateRoot, '__NAV_TOTAL_SET__', Object.create(null));
        var dataStoreState = (navModuleState.__DATA_STORE_STATE__ && typeof navModuleState.__DATA_STORE_STATE__ === 'object')
          ? navModuleState.__DATA_STORE_STATE__
          : __defineWorkerHiddenValue__(navModuleState, '__DATA_STORE_STATE__', Object.create(null));
        var workerEnvSnapshot = (dataStoreState.__WORKER_ENV_SNAPSHOT__ && typeof dataStoreState.__WORKER_ENV_SNAPSHOT__ === 'object')
          ? dataStoreState.__WORKER_ENV_SNAPSHOT__
          : __defineWorkerHiddenValue__(dataStoreState, '__WORKER_ENV_SNAPSHOT__', Object.create(null));
        var envProfileRoot = (stateRoot.__ENV_PROFILE__ && typeof stateRoot.__ENV_PROFILE__ === 'object')
          ? stateRoot.__ENV_PROFILE__
          : __defineWorkerHiddenValue__(stateRoot, '__ENV_PROFILE__', Object.create(null));
        var screenRoot = (stateRoot.__SCREEN__ && typeof stateRoot.__SCREEN__ === 'object')
          ? stateRoot.__SCREEN__
          : __defineWorkerHiddenValue__(stateRoot, '__SCREEN__', Object.create(null));
        var fontsRoot = (stateRoot.__FONTS__ && typeof stateRoot.__FONTS__ === 'object')
          ? stateRoot.__FONTS__
          : __defineWorkerHiddenValue__(stateRoot, '__FONTS__', Object.create(null));
        var fontsState = (fontsRoot.__STATE__ && typeof fontsRoot.__STATE__ === 'object')
          ? fontsRoot.__STATE__
          : __defineWorkerHiddenValue__(fontsRoot, '__STATE__', {
              ready: false,
              error: null,
              awaitReady: null,
              awaitReadyStatus: null,
              awaitReadyResolve: null,
              awaitReadyReject: null,
              familySnapshot: {
                allowedFamilies: null,
                runtimeFamilies: [],
                platformDom: null,
                versionToken: null
              }
            });
        var fontsConfig = (fontsRoot.__CONFIG__ && typeof fontsRoot.__CONFIG__ === 'object')
          ? fontsRoot.__CONFIG__
          : __defineWorkerHiddenValue__(fontsRoot, '__CONFIG__', { configs: [] });
        var canvasRoot = (stateRoot.__CANVAS__ && typeof stateRoot.__CANVAS__ === 'object')
          ? stateRoot.__CANVAS__
          : __defineWorkerHiddenValue__(stateRoot, '__CANVAS__', Object.create(null));
        var fernwehState = (canvasRoot.__STATE__ && typeof canvasRoot.__STATE__ === 'object')
          ? canvasRoot.__STATE__
          : __defineWorkerHiddenValue__(canvasRoot, '__STATE__', {
              domReady: false,
              offscreenReady: false,
              domCanvas: null,
              domCanvasHost: null,
              offscreenCanvas: null,
              defaultCtx2dFont: ''
            });
        var Core = (self.Core && (typeof self.Core === 'object' || typeof self.Core === 'function'))
          ? self.Core
          : __defineWorkerHiddenValue__(self, 'Core', Object.create(null));
        var coreInternal = (Core.__internal && typeof Core.__internal === 'object')
          ? Core.__internal
          : __defineWorkerHiddenValue__(Core, '__internal', Object.create(null));
        var prngRoot = (coreInternal.prng && typeof coreInternal.prng === 'object')
          ? coreInternal.prng
          : __defineWorkerHiddenValue__(coreInternal, 'prng', Object.create(null));
        var wrkRuntime = (wrkState.runtime && typeof wrkState.runtime === 'object')
          ? wrkState.runtime
          : __defineWorkerHiddenValue__(wrkState, 'runtime', Object.create(null));
        if (!workerEnvSnapshot || typeof workerEnvSnapshot !== 'object') {
          throw new Error('Ubergabe: __WORKER_ENV_SNAPSHOT__ owner route missing');
        }
        if (!envProfileRoot || typeof envProfileRoot !== 'object') {
          throw new Error('Ubergabe: FernwehContext.state.__ENV_PROFILE__ missing');
        }
        if (!screenRoot || typeof screenRoot !== 'object') {
          throw new Error('Ubergabe: FernwehContext.state.__SCREEN__ missing');
        }
        if (!fontsRoot || typeof fontsRoot !== 'object') {
          throw new Error('Ubergabe: FernwehContext.state.__FONTS__ missing');
        }
        if (!fontsState || typeof fontsState !== 'object') {
          throw new Error('Ubergabe: FernwehContext.state.__FONTS__.__STATE__ missing');
        }
        if (!fontsConfig || typeof fontsConfig !== 'object') {
          throw new Error('Ubergabe: FernwehContext.state.__FONTS__.__CONFIG__ missing');
        }
        if (!canvasRoot || typeof canvasRoot !== 'object') {
          throw new Error('Ubergabe: FernwehContext.state.__CANVAS__ missing');
        }
        if (!fernwehState || typeof fernwehState !== 'object') {
          throw new Error('Ubergabe: FernwehContext.state.__CANVAS__.__STATE__ missing');
        }
        if (!Core || (typeof Core !== 'object' && typeof Core !== 'function')) {
          throw new Error('Ubergabe: Core missing');
        }
        if (!coreInternal || typeof coreInternal !== 'object') {
          throw new Error('Ubergabe: Core.__internal missing');
        }
        if (!prngRoot || typeof prngRoot !== 'object') {
          throw new Error('Ubergabe: Core.__internal.prng missing');
        }
        if (!wrkRuntime || typeof wrkRuntime !== 'object') {
          throw new Error('Ubergabe: FernwehContext.state.__WRK__.runtime missing');
        }
        return {
          C: C,
          stateRoot: stateRoot,
          wrkState: wrkState,
          navModuleState: navModuleState,
          dataStoreState: dataStoreState,
          workerEnvSnapshot: workerEnvSnapshot,
          envProfileRoot: envProfileRoot,
          screenRoot: screenRoot,
          fontsRoot: fontsRoot,
          fontsState: fontsState,
          fontsConfig: fontsConfig,
          canvasRoot: canvasRoot,
          fernwehState: fernwehState,
          Core: Core,
          coreInternal: coreInternal,
          prngRoot: prngRoot,
          wrkRuntime: wrkRuntime
        };
      };
      var __syncWorkerOwnerSnapshotRoute__ = function(s){
        var materialized = __materializeWorkerOwnerGraph__();
        var workerEnvSnapshot = materialized.workerEnvSnapshot;
        var prevKeys = Object.keys(workerEnvSnapshot);
        for (var i = 0; i < prevKeys.length; i++) {
          delete workerEnvSnapshot[prevKeys[i]];
        }
        var nextKeys = Object.keys(s);
        for (var j = 0; j < nextKeys.length; j++) {
          var key = nextKeys[j];
          workerEnvSnapshot[key] = s[key];
        }
        return workerEnvSnapshot;
      };
      var __bootstrapApplyEnvSnapshot__ = function(s){
        if (__ENV_SNAP_APPLIED__ === s) return;
        __LAST_SNAP__ = __requireSnap(s);
        __syncWorkerOwnerSnapshotRoute__(__LAST_SNAP__);
        __ENV_SNAP_APPLIED__ = s;
      };
      try {
        __bootstrapApplyEnvSnapshot__(${SNAP});
      } catch (e) {
        __LAST_SNAP__ = ${SNAP};
        self.__ENV_SNAP_ERROR__ = String((e && (e.stack || e.message)) || e);
        __emit({ __ENV_BOOTSTRAP_ERROR__: self.__ENV_SNAP_ERROR__ });
        throw e;
      }
      var __requireWebGLSnap__ = function(){
        var snap = __LAST_SNAP__;
        if (!snap || typeof snap !== 'object') throw new Error('Ubergabe: no snapshot');
        var webgl = snap.webgl;
        if (!webgl || typeof webgl !== 'object') throw new Error('Ubergabe: missing webgl');
        if (typeof webgl.vendor !== 'string' || !webgl.vendor) throw new Error('Ubergabe: bad webgl.vendor');
        if (typeof webgl.renderer !== 'string' || !webgl.renderer) throw new Error('Ubergabe: bad webgl.renderer');
        if (typeof webgl.unmaskedVendor !== 'string' || !webgl.unmaskedVendor) throw new Error('Ubergabe: bad webgl.unmaskedVendor');
        if (typeof webgl.unmaskedRenderer !== 'string' || !webgl.unmaskedRenderer) throw new Error('Ubergabe: bad webgl.unmaskedRenderer');
        if (Object.prototype.hasOwnProperty.call(webgl, 'compressedTextureFormats') && !Array.isArray(webgl.compressedTextureFormats)) {
          throw new Error('Ubergabe: bad webgl.compressedTextureFormats');
        }
        return webgl;
      };
      var __installEarlyWorkerWebGLMirror__ = function(){
        __requireWebGLSnap__();
        if (typeof OffscreenCanvas !== 'function' || !OffscreenCanvas.prototype) return;
        var oscProto = OffscreenCanvas.prototype;
        var dGetContext = Object.getOwnPropertyDescriptor(oscProto, 'getContext');
        if (!dGetContext || typeof dGetContext.value !== 'function' || dGetContext.configurable === false) {
          throw new Error('Ubergabe: OffscreenCanvas.getContext descriptor missing');
        }
        var nativeGetContext = dGetContext.value;
        var patchedContexts = new WeakSet();
        var debugInfoCache = new WeakMap();
        var patchContextInstance = function(ctx){
          if (!ctx || (typeof ctx !== 'object' && typeof ctx !== 'function')) return ctx;
          if (patchedContexts.has(ctx)) return ctx;
          patchedContexts.add(ctx);
          var dGetParameter = Object.getOwnPropertyDescriptor(ctx, 'getParameter');
          var nativeGetParameter = (dGetParameter && typeof dGetParameter.value === 'function')
            ? dGetParameter.value
            : (typeof ctx.getParameter === 'function' ? ctx.getParameter : null);
          if (!nativeGetParameter) throw new Error('Ubergabe: worker WebGL getParameter missing');
          var dGetExtension = Object.getOwnPropertyDescriptor(ctx, 'getExtension');
          var nativeGetExtension = (dGetExtension && typeof dGetExtension.value === 'function')
            ? dGetExtension.value
            : (typeof ctx.getExtension === 'function' ? ctx.getExtension : null);
          if (typeof nativeGetExtension === 'function') {
            Object.defineProperty(ctx, 'getExtension', {
              configurable: dGetExtension ? !!dGetExtension.configurable : true,
              enumerable: dGetExtension ? !!dGetExtension.enumerable : false,
              writable: dGetExtension && Object.prototype.hasOwnProperty.call(dGetExtension, 'writable') ? dGetExtension.writable : true,
              value: function getExtension(name) {
                var ext = Reflect.apply(nativeGetExtension, this, arguments);
                if (name === 'WEBGL_debug_renderer_info') {
                  debugInfoCache.set(this, ext || null);
                }
                return ext;
              }
            });
          }
          Object.defineProperty(ctx, 'getParameter', {
            configurable: dGetParameter ? !!dGetParameter.configurable : true,
            enumerable: dGetParameter ? !!dGetParameter.enumerable : false,
            writable: dGetParameter && Object.prototype.hasOwnProperty.call(dGetParameter, 'writable') ? dGetParameter.writable : true,
            value: function getParameter(pname) {
              var live = __requireWebGLSnap__();
              var dbg = debugInfoCache.has(this) ? debugInfoCache.get(this) : undefined;
              if (dbg === undefined) {
                dbg = null;
                if (typeof nativeGetExtension === 'function') {
                  try { dbg = Reflect.apply(nativeGetExtension, this, ['WEBGL_debug_renderer_info']); } catch (_e) { dbg = null; }
                }
                debugInfoCache.set(this, dbg);
              }
              if (dbg) {
                if (pname === dbg.UNMASKED_VENDOR_WEBGL) return live.unmaskedVendor;
                if (pname === dbg.UNMASKED_RENDERER_WEBGL) return live.unmaskedRenderer;
              }
              if (pname === this.VENDOR || pname === 0x1F00) return live.vendor;
              if (pname === this.RENDERER || pname === 0x1F01) return live.renderer;
              if (Array.isArray(live.compressedTextureFormats) && (pname === this.COMPRESSED_TEXTURE_FORMATS || pname === 0x86A3)) {
                return live.compressedTextureFormats.slice();
              }
              return Reflect.apply(nativeGetParameter, this, arguments);
            }
          });
          return ctx;
        };
        Object.defineProperty(oscProto, 'getContext', {
          configurable: !!dGetContext.configurable,
          enumerable: !!dGetContext.enumerable,
          writable: dGetContext && Object.prototype.hasOwnProperty.call(dGetContext, 'writable') ? dGetContext.writable : true,
          value: function getContext(kind) {
            var res = Reflect.apply(nativeGetContext, this, arguments);
            if (!res) return res;
            if (kind === 'webgl' || kind === 'webgl2' || kind === 'experimental-webgl') {
              return patchContextInstance(res);
            }
            return res;
          }
        });
      };
      var __finalizeBootstrapReady__ = function(USER){
        __ENV_CONNECT_BUF__ = false;
        try {
          if (__ENV_CONNECT_Q__ && __ENV_CONNECT_Q__.length) {
            if (__ENV_WORKER_SCOPE_KIND__ !== 'shared') {
              throw new Error('WorkerBootstrap: connect replay is only valid for SharedWorkerGlobalScope');
            }
            if (typeof MessageEvent !== 'function' || typeof self.dispatchEvent !== 'function') {
              throw new Error('WorkerBootstrap: connect replay dispatch unavailable');
            }
            for (const ports of __ENV_CONNECT_Q__) {
              self.dispatchEvent(new MessageEvent('connect', { ports: ports }));
            }
            __ENV_CONNECT_Q__.length = 0;
          }
        } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'early_connect_replay_call' }); }
        __MSG_BUF__ = false;
        try { self.removeEventListener('message', __onEarlyMsg__); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'early_message_listener_remove' }); }
        try {
          if (typeof MessageEvent === 'function' && typeof self.dispatchEvent === 'function') {
            for (const d of __MSG_Q__) self.dispatchEvent(new MessageEvent('message', { data: d }));
          }
        } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'early_message_replay_dispatch' }); }
        __emit({ __ENV_PATCH_OK__: __patchOK === true, __ENV_USER_URL_LOADED__: USER });
      };
      __installEarlyWorkerWebGLMirror__();
      ${ENV_WRK_SRC}
      (function __installWorkerCanvasSources__(){
        var __materialized = __materializeWorkerOwnerGraph__();
        var wrkRuntime = __materialized.wrkRuntime;
        __defineWorkerHiddenValue__(wrkRuntime, 'bootstrapActive', __ENV_BOOTSTRAP_ACTIVE__ === true);
        __defineWorkerHiddenValue__(wrkRuntime, 'relayDiag', function(level, code, ctx, err){ __relayDiag(level, code, ctx, err); });
        __defineWorkerHiddenValue__(wrkRuntime, 'workerScopeKind', __ENV_WORKER_SCOPE_KIND__);
        __defineWorkerHiddenValue__(wrkRuntime, 'expectedWorkerScopeKind', __ENV_EXPECTED_WORKER_SCOPE_KIND__);
        __defineWorkerHiddenValue__(wrkRuntime, 'inlineCoreWindow', ${INLINE_CORE_WINDOW});
        __defineWorkerHiddenValue__(wrkRuntime, 'inlinePrng', ${INLINE_PRNG});
        __defineWorkerHiddenValue__(wrkRuntime, 'inlineCanvasPatch', ${INLINE_CANVAS_PATCH});
        __defineWorkerHiddenValue__(wrkRuntime, 'inlineFernwehContext', ${INLINE_CONTEXT_PATCH});
      })();
${prePatchOwnerSource}
      let __patchOK = false;
      try {
        const PATCH_URL = ${PATCH_URL};
        if (!PATCH_URL) throw new Error(${JSON.stringify(patchUrlMissingMessage)});
${patchLoaderSource}
        const __runtimeRoot = __materializeWorkerOwnerGraph__().wrkRuntime;
        const installWorkerUACHMirror = __runtimeRoot && __runtimeRoot.installWorkerUACHMirror;
        if (typeof installWorkerUACHMirror !== 'function') throw new Error('Ubergabe: installWorkerUACHMirror missing');
        installWorkerUACHMirror();
        __patchOK = true;
      } catch (e) {
        __emit({ __ENV_BOOTSTRAP_ERROR__: String((e && (e.stack || e.message)) || e) });
        self.__ENV_PATCH_ERROR__ = String((e && (e.stack || e.message)) || e);
        throw e;
      }
      if (__patchOK) {
        try {
          if (!__LAST_SNAP__) throw new Error('Ubergabe: snapshot not applied');
          ['__WORKER_WEBGL_MIRROR_INSTALLED__','__SCOPE_CONSISTENCY_PATCHED__','__ensureMarkAsNative','__CORE_TOSTRING_STATE__','__wrapNativeApply','__wrapNativeAccessor','__wrapStrictAccessor','__wrapNativeCtor','__ENV_PATCH_ERROR__','__ENV_PATCH_APPLY_ERROR__','__ENV_SNAP_ERROR__','__ENV_DIAG_ERROR__','__ENV_DIAG_STORE_ERROR__'].forEach(function(key){
            if (!Object.prototype.hasOwnProperty.call(self, key)) return;
            try {
              delete self[key];
            } catch(_e) {
              __emitDiag('wrk:worker_bootstrap:apply:cleanup_failed', _e, { transport: 'cleanup_delete', key: key });
              throw _e;
            }
            if (Object.prototype.hasOwnProperty.call(self, key)) {
              var __cleanupErr = new Error('Ubergabe: ' + key + ' visible after patch apply');
              __emitDiag('wrk:worker_bootstrap:apply:cleanup_failed', __cleanupErr, { transport: 'cleanup_visible', key: key });
              throw __cleanupErr;
            }
          });
        } catch (e) {
          __emit({ __ENV_BOOTSTRAP_ERROR__: String((e && (e.stack || e.message)) || e) });
          self.__ENV_PATCH_APPLY_ERROR__ = String((e && (e.stack || e.message)) || e);
          throw e;
        }
      }
${userLoaderSource}
    })()${bootstrapSuffixSource}
    //# sourceURL=${sourceURL}
  `;
}

function mkModuleWorkerSource(snapshot, absUrl, expectedWorkerScopeKind){
  if (!snapshot || typeof snapshot !== 'object') throw new Error('wrk: mkModuleWorkerSource bad snapshot');
  if (typeof absUrl !== 'string' || !absUrl) throw new Error('wrk: mkModuleWorkerSource bad absUrl');
  if (expectedWorkerScopeKind !== 'dedicated' && expectedWorkerScopeKind !== 'shared') throw new Error('wrk: mkModuleWorkerSource bad expectedWorkerScopeKind');
  const runtime = __requireWorkerPatchRuntime__('workerPatchModule runtime not ready', 'preflight');
  const patchUrl = runtime && runtime.workerPatchModule;
  const inlineCoreWindow = runtime && runtime.inlineCoreWindow;
  const inlinePrng = runtime && runtime.inlinePrng;
  const inlineCanvasPatch = runtime && runtime.inlineCanvasPatch;
  const inlineFernwehContext = runtime && runtime.inlineFernwehContext;
  if (typeof patchUrl !== 'string' || !patchUrl) throw new Error('wrk: mkModuleWorkerSource bad workerPatchModule url');
  if (typeof inlineCoreWindow !== 'string' || !inlineCoreWindow) throw new Error('wrk: mkModuleWorkerSource bad inlineCoreWindow');
  if (typeof inlinePrng !== 'string' || !inlinePrng) throw new Error('wrk: mkModuleWorkerSource bad inlinePrng');
  if (typeof inlineCanvasPatch !== 'string' || !inlineCanvasPatch) throw new Error('wrk: mkModuleWorkerSource bad inlineCanvasPatch');
  if (typeof inlineFernwehContext !== 'string' || !inlineFernwehContext) throw new Error('wrk: mkModuleWorkerSource bad inlineFernwehContext');
  const USER = JSON.stringify(absUrl);
  return mkWorkerBootstrapCore({
    snapshot: snapshot,
    absUrl: absUrl,
    patchUrl: patchUrl,
    expectedWorkerScopeKind: expectedWorkerScopeKind,
    inlineCoreWindow: inlineCoreWindow,
    inlinePrng: inlinePrng,
    inlineCanvasPatch: inlineCanvasPatch,
    inlineFernwehContext: inlineFernwehContext,
    patchUrlMissingMessage: 'Ubergabe: missing workerPatchModule URL',
    prePatchOwnerSource: `
      (function __installWorkerCoreOwners__(){
        var __runInlineModule__ = function(source, exportName, label) {
          if (typeof source !== 'string' || !source) throw new Error('Ubergabe: ' + String(label || exportName || 'inlineModule') + ' source missing');
          var runner = new Function('window', source + '\\nreturn (typeof ' + exportName + ' === "function") ? ' + exportName + '(window) : null;');
          try {
            return runner(self);
          } finally {
            try {
              var d = Object.getOwnPropertyDescriptor(self, exportName);
              if (d && d.configurable !== false) delete self[exportName];
            } catch (_) {}
          }
        };
        __runInlineModule__(${JSON.stringify(inlineCoreWindow)}, 'CoreWindowModule', 'inlineCoreWindow');
        __runInlineModule__(${JSON.stringify(inlinePrng)}, 'RNGsetModule', 'inlinePrng');
        if (!self.Core || typeof self.Core !== 'object') throw new Error('Ubergabe: worker Core missing after bootstrap owner install');
        if (!self.Core.__internal || typeof self.Core.__internal !== 'object') throw new Error('Ubergabe: worker Core.__internal missing after bootstrap owner install');
        if (!self.Core.__internal.prng || typeof self.Core.__internal.prng !== 'object') throw new Error('Ubergabe: worker Core.__internal.prng missing after bootstrap owner install');
      })();`,
    patchLoaderSource: `
        await import(PATCH_URL);`,
    userLoaderSource: `
      const USER = ${USER};
      if (!USER || typeof USER !== 'string') throw new Error('Ubergabe: missing user module URL');
      await import(USER);
      __finalizeBootstrapReady__(USER);`,
    bootstrapSuffixSource: `.catch(function(e){
      // Avoid worker unhandledrejection surface: report via diag channel and terminate to avoid partial state.
      __emit({ __ENV_BOOTSTRAP_ERROR__: String((e && (e.stack || e.message)) || e) });
      __closeBootstrapScope__();
    });
    export {};`,
    sourceURL: 'worker_module_bootstrap.js'
  });
}

function mkClassicWorkerSource(snapshot, absUrl, expectedWorkerScopeKind){
  if (!snapshot || typeof snapshot !== 'object') throw new Error('wrk: mkClassicWorkerSource bad snapshot');
  if (typeof absUrl !== 'string' || !absUrl) throw new Error('wrk: mkClassicWorkerSource bad absUrl');
  if (expectedWorkerScopeKind !== 'dedicated' && expectedWorkerScopeKind !== 'shared') throw new Error('wrk: mkClassicWorkerSource bad expectedWorkerScopeKind');
  const runtime = __requireWorkerPatchRuntime__('workerPatchClassic runtime not ready', 'preflight');
  const patchUrl = runtime && runtime.workerPatchClassic;
  const inlineCoreWindow = runtime && runtime.inlineCoreWindow;
  const inlinePrng = runtime && runtime.inlinePrng;
  const inlineCanvasPatch = runtime && runtime.inlineCanvasPatch;
  const inlineFernwehContext = runtime && runtime.inlineFernwehContext;
  if (typeof patchUrl !== 'string' || !patchUrl) throw new Error('wrk: mkClassicWorkerSource bad workerPatchClassic url');
  if (typeof inlineCoreWindow !== 'string' || !inlineCoreWindow) throw new Error('wrk: mkClassicWorkerSource bad inlineCoreWindow');
  if (typeof inlinePrng !== 'string' || !inlinePrng) throw new Error('wrk: mkClassicWorkerSource bad inlinePrng');
  if (typeof inlineCanvasPatch !== 'string' || !inlineCanvasPatch) throw new Error('wrk: mkClassicWorkerSource bad inlineCanvasPatch');
  if (typeof inlineFernwehContext !== 'string' || !inlineFernwehContext) throw new Error('wrk: mkClassicWorkerSource bad inlineFernwehContext');
  const USER = JSON.stringify(absUrl);
  return mkWorkerBootstrapCore({
    snapshot: snapshot,
    absUrl: absUrl,
    patchUrl: patchUrl,
    expectedWorkerScopeKind: expectedWorkerScopeKind,
    inlineCoreWindow: inlineCoreWindow,
    inlinePrng: inlinePrng,
    inlineCanvasPatch: inlineCanvasPatch,
    inlineFernwehContext: inlineFernwehContext,
    patchUrlMissingMessage: 'Ubergabe: missing workerPatchClassic URL',
    prePatchOwnerSource: `
      (function __installWorkerCoreOwners__(){
        var __runInlineModule__ = function(source, exportName, label) {
          if (typeof source !== 'string' || !source) throw new Error('Ubergabe: ' + String(label || exportName || 'inlineModule') + ' source missing');
          var runner = new Function('window', source + '\\nreturn (typeof ' + exportName + ' === "function") ? ' + exportName + '(window) : null;');
          try {
            return runner(self);
          } finally {
            try {
              var d = Object.getOwnPropertyDescriptor(self, exportName);
              if (d && d.configurable !== false) delete self[exportName];
            } catch (_) {}
          }
        };
        __runInlineModule__(${JSON.stringify(inlineCoreWindow)}, 'CoreWindowModule', 'inlineCoreWindow');
        __runInlineModule__(${JSON.stringify(inlinePrng)}, 'RNGsetModule', 'inlinePrng');
        if (!self.Core || typeof self.Core !== 'object') throw new Error('Ubergabe: worker Core missing after bootstrap owner install');
        if (!self.Core.__internal || typeof self.Core.__internal !== 'object') throw new Error('Ubergabe: worker Core.__internal missing after bootstrap owner install');
        if (!self.Core.__internal.prng || typeof self.Core.__internal.prng !== 'object') throw new Error('Ubergabe: worker Core.__internal.prng missing after bootstrap owner install');
      })();`,
    patchLoaderSource: `
        importScripts(PATCH_URL);`,
    userLoaderSource: `
      var __isModuleURL = function(u){
        if (typeof u !== 'string' || !u) return false;
        if (/\\.mjs(?:$|[?#])/i.test(u)) return true;
        if (/[?&]type=module(?:&|$)/i.test(u)) return true;
        if (/[?&]module(?:&|$)/i.test(u)) return true;
        if (/#module\\b/i.test(u)) return true;
        if (u.slice(0, 5) === 'data:') {
          return /;module\\b/i.test(u) || /\\bmodule\\b/i.test(u.slice(0, 80));
        }
        return false;
      };
      var USER = ${USER};
      if (!USER || typeof USER !== 'string') throw new Error('Ubergabe: missing user script URL');
      if (__isModuleURL(USER)) {
        import(USER).then(function(){
          __finalizeBootstrapReady__(USER);
        }, function(e){
          __emit({ __ENV_BOOTSTRAP_ERROR__: String((e && (e.stack || e.message)) || e) });
          __closeBootstrapScope__();
        });
        return;
      }
      try {
        importScripts(USER);
      } catch (e) {
        import(USER).then(function(){
          __finalizeBootstrapReady__(USER);
        }, function(e2){
          __emit({ __ENV_BOOTSTRAP_ERROR__: String((e2 && (e2.stack || e2.message)) || e2) });
          __closeBootstrapScope__();
        });
        return;
      }
      __finalizeBootstrapReady__(USER);`,
    bootstrapSuffixSource: `;`,
    sourceURL: 'worker_classic_bootstrap.js'
  });
}


  // Паблик-API для main
  function publishSnapshot(snap){
    if (typeof BroadcastChannel !== 'function') {
      throw new Error('EnvPublish: BroadcastChannel missing');
    }
    const bc = new BroadcastChannel('__ENV_SYNC__');
    bc.postMessage({ __ENV_SYNC__: { envSnapshot: snap } });
  }
  const __bridgeEnvBus = EnvBus(global);
  function __resolveFontsStateForWorkerSync__() {
    const C = (global && global.FernwehContext && typeof global.FernwehContext === 'object')
      ? global.FernwehContext
      : null;
    const stateRoot = (C && C.state && typeof C.state === 'object')
      ? C.state
      : null;
    const fontsRoot = (stateRoot && stateRoot.__FONTS__ && typeof stateRoot.__FONTS__ === 'object')
      ? stateRoot.__FONTS__
      : null;
    return (fontsRoot && fontsRoot.__STATE__ && typeof fontsRoot.__STATE__ === 'object')
      ? fontsRoot.__STATE__
      : null;
  }
  function __publishCurrentWorkerSnapshot__(reason) {
    const snap = requireWorkerSnapshot(__bridgeEnvBus.envSnapshot(), reason);
    if (reason === 'fonts-ready' || reason === 'fonts-failed') {
      snap.fontsState = __bridgeEnvBus.cloneFontsStateForWorker();
      snap.fontsConfig = __bridgeEnvBus.cloneFontsConfigForWorker();
    }
    __wrkRuntimeSet__('lastSnap', snap);
    publishSnapshot(snap);
    return snap;
  }
  function __installFontsSnapshotSync__() {
    if (__wrkRuntimeGet__('fontsSnapshotSyncInstalled') === true) return;
    const fontsState = __resolveFontsStateForWorkerSync__();
    if (!fontsState || typeof fontsState !== 'object') return;
    __wrkRuntimeSet__('fontsSnapshotSyncInstalled', true);
    const status = (typeof fontsState.awaitReadyStatus === 'string' && fontsState.awaitReadyStatus)
      ? fontsState.awaitReadyStatus
      : null;
    const readyPromise = (fontsState.awaitReady && typeof fontsState.awaitReady.then === 'function')
      ? fontsState.awaitReady
      : null;
    if (status === 'pending' && readyPromise) {
      readyPromise.then(() => {
        __wrkBestEffort('wrk:fonts_snapshot_sync_publish_failed', {
          stage: 'runtime',
          key: 'FernwehContext.state.__FONTS__.__STATE__.awaitReady',
          message: 'worker fonts snapshot sync publish failed',
          type: 'pipeline missing data',
          data: { outcome: 'skip', reason: 'fonts_snapshot_sync_publish_failed', source: 'awaitReady:resolved' }
        }, () => { __publishCurrentWorkerSnapshot__('fonts-ready'); });
      }, () => {
        __wrkBestEffort('wrk:fonts_snapshot_sync_publish_failed', {
          stage: 'runtime',
          key: 'FernwehContext.state.__FONTS__.__STATE__.awaitReady',
          message: 'worker fonts snapshot sync publish failed',
          type: 'pipeline missing data',
          data: { outcome: 'skip', reason: 'fonts_snapshot_sync_publish_failed', source: 'awaitReady:failed' }
        }, () => { __publishCurrentWorkerSnapshot__('fonts-failed'); });
      });
    }
  }
  __captureWorkerPatchApi__({
    mkModuleWorkerSource,
    mkClassicWorkerSource,
    publishSnapshot,
    envSnapshot: __bridgeEnvBus.envSnapshot
  });
  __installFontsSnapshotSync__();
})(window);


// === SafeWorkerOverride (Dedicated) ===
function requireWorkerSnapshot(snap, label) {
  if (!snap || typeof snap !== 'object') {
    if (label) {
      throw new Error(`[WorkerOverride] missing snapshot (${label})`);
    }
    throw new Error('[WorkerOverride] missing snapshot');
  }
  if (typeof snap.language !== 'string' || !snap.language) throw new Error('[WorkerOverride] snapshot.language missing');
  if (!Array.isArray(snap.languages)) throw new Error('[WorkerOverride] snapshot.languages missing');
  if (!Number.isFinite(Number(snap.deviceMemory))) throw new Error('[WorkerOverride] snapshot.deviceMemory missing');
  if (!Number.isFinite(Number(snap.hardwareConcurrency))) throw new Error('[WorkerOverride] snapshot.hardwareConcurrency missing');
  if (!Number.isFinite(Number(snap.dpr))) throw new Error('[WorkerOverride] snapshot.dpr missing');
  if (!snap.uaData) throw new Error('[WorkerOverride] snapshot.uaData missing');
  const he = (snap.uaData && snap.uaData.he) || snap.highEntropy;
  if (!he || typeof he !== 'object') throw new Error('[WorkerOverride] snapshot.highEntropy missing');
  const KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
  for (const k of KEYS) {
    if (!(k in he)) throw new Error(`[WorkerOverride] snapshot.highEntropy.${k} missing`);
    const v = he[k];
    if (v === undefined || v === null) throw new Error(`[WorkerOverride] snapshot.highEntropy.${k} missing`);
    if (Array.isArray(v) && !v.length) throw new Error(`[WorkerOverride] snapshot.highEntropy.${k} missing`);
  }
  return snap;
}

function installBlobURLStore(G) {
  if (!G || !G.URL || typeof G.URL.createObjectURL !== 'function') return;
  const existingStore = __resolveBlobUrlStore__();
  if (existingStore) return;
  const store = __captureBlobUrlStore__(new Map());
  if (typeof mark !== 'function') {
    throw new Error('[WorkerOverride] markAsNative missing');
  }
  const nativeCreate = G.URL.createObjectURL;
  const nativeRevoke = G.URL.revokeObjectURL;
  const createWrappedRaw = function createObjectURL(obj){
    const url = nativeCreate.call(G.URL, obj);
    if (obj && typeof obj === 'object') store.set(url, obj);
    return url;
  };
  Object.defineProperty(createWrappedRaw, '__coreBridgeTarget__', {
    value: nativeCreate,
    writable: true,
    configurable: true,
    enumerable: false
  });
  const createWrapped = mark(createWrappedRaw, 'createObjectURL');
  const revokeWrappedRaw = function revokeObjectURL(url){
    if (store.has(url)) store.delete(url);
    return nativeRevoke.call(G.URL, url);
  };
  Object.defineProperty(revokeWrappedRaw, '__coreBridgeTarget__', {
    value: nativeRevoke,
    writable: true,
    configurable: true,
    enumerable: false
  });
  const revokeWrapped = mark(revokeWrappedRaw, 'revokeObjectURL');
  const dCreate = Object.getOwnPropertyDescriptor(G.URL, 'createObjectURL');
  const dRevoke = Object.getOwnPropertyDescriptor(G.URL, 'revokeObjectURL');
  if (dCreate && dCreate.configurable === false && dCreate.writable === false) {
    throw new Error('[WorkerOverride] URL.createObjectURL not writable');
  }
  if (dRevoke && dRevoke.configurable === false && dRevoke.writable === false) {
    throw new Error('[WorkerOverride] URL.revokeObjectURL not writable');
  }
  Object.defineProperty(G.URL, 'createObjectURL', Object.assign({}, dCreate, { value: createWrapped }));
  Object.defineProperty(G.URL, 'revokeObjectURL', Object.assign({}, dRevoke, { value: revokeWrapped }));
}

function resolveUserScriptURL(G, absUrl, label) {
  if (typeof absUrl !== 'string' || !absUrl) return absUrl;
  if (absUrl.slice(0, 5) !== 'blob:') return absUrl;
  const store = __resolveBlobUrlStore__();
  if (!store || !store.has(absUrl)) {
    const l = label ? ` (${label})` : '';
    throw new Error(`[WorkerOverride] blob URL missing from store${l}`);
  }
  const blob = store.get(absUrl);
  const fresh = G.URL.createObjectURL(blob);
  return fresh;
}

function isProbablyModuleWorkerURL(absUrl) {
  if (typeof absUrl !== 'string' || !absUrl) return false;
  if (/\.mjs(?:$|[?#])/i.test(absUrl)) return true;
  if (/[?&]type=module(?:&|$)/i.test(absUrl)) return true;
  if (/[?&]module(?:&|$)/i.test(absUrl)) return true;
  if (/#module\\b/i.test(absUrl)) return true;
  if (absUrl.slice(0, 5) === 'data:') {
    return /;module\\b/i.test(absUrl) || /\\bmodule\\b/i.test(absUrl.slice(0, 80));
  }
  return false;
}

function resolveWorkerType(absUrl, opts, label) {
  const hasType = !!(opts && (typeof opts === 'object' || typeof opts === 'function') && ('type' in opts));
  const t = hasType ? opts.type : undefined;
  if (hasType && t !== 'module' && t !== 'classic') {
    const l = label ? ` (${label})` : '';
    throw new Error(`[WorkerOverride] invalid worker type${l}`);
  }
  const isModuleURL = isProbablyModuleWorkerURL(absUrl);
  if (t === 'classic' && isModuleURL) {
    const l = label ? ` (${label})` : '';
    throw new Error(`[WorkerOverride] module worker URL with classic type${l}`);
  }
  return (t === 'module' || (!hasType && isModuleURL)) ? 'module' : 'classic';
}

function definePatchedValue(target, key, value, label) {
  const d = Object.getOwnPropertyDescriptor(target, key)
    || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target) || {}, key);
  if (!d) {
    throw new Error(`[WorkerOverride] ${label || key} descriptor missing`);
  }
  Object.defineProperty(target, key, {
    value,
    configurable: d.configurable,
    enumerable: d.enumerable,
    writable: d.writable
  });
}

function emitWorkerBootstrapDegrade(G, scope, bootErr) {
  const d = __resolveWrkDegrade__();
  if (typeof d !== 'function') return;
  const err = bootErr instanceof Error ? bootErr : new Error(String(bootErr || 'Worker bootstrap error'));
  const ctx = {
    type: 'pipeline missing data',
    stage: 'apply',
    module: 'worker_bootstrap',
    diagTag: 'worker_bootstrap',
    surface: 'worker_bootstrap',
    key: '__ENV_BOOTSTRAP_ERROR__',
    policy: 'throw',
    action: 'throw',
    scope: scope || null,
    data: { outcome: 'throw', reason: 'worker_bootstrap_apply_error', scope: scope || null }
  };
  if (typeof d.diag === 'function') {
    d.diag('error', 'worker_bootstrap:apply:error', ctx, err);
    return;
  }
  d('worker_bootstrap:apply:error', err, Object.assign({}, ctx, { level: 'error' }));
}

function relayWorkerScopeDiag(G, scope, payload) {
  try {
    return relayWorkerDiagEnvelope(G, scope, payload);
  } catch (e) {
    __wrkDiag('warn', 'wrk:worker_diag_relay_failed', {
      stage: 'runtime',
      key: '__ENV_DIAG__',
      message: 'worker diag relay failed',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'worker_diag_relay_failed', scope: scope || null }
    }, e);
    return false;
  }
}


function SafeWorkerOverride(G){
  if (!G || !G.Worker) throw new Error('[WorkerOverride] Worker missing');
  if (G.Worker.__ENV_WRAPPED__) return;
  installBlobURLStore(G);
  const NativeWorker = G.Worker;

  if (typeof mark !== 'function') {
    throw new Error('[WorkerOverride] markAsNative missing');
  }

  const WrappedWorkerRaw = function Worker(url, opts) {
  const abs = new URL(url, location.href).href;
  const workerType = resolveWorkerType(abs, opts, 'Worker');
  const workerPatchApi = __requireWorkerPatchApi__('worker override runtime api not ready', 'preflight');
  if (!workerPatchApi
      || typeof workerPatchApi.mkClassicWorkerSource !== 'function'
      || typeof workerPatchApi.mkModuleWorkerSource !== 'function'
      || typeof workerPatchApi.publishSnapshot !== 'function'
      || typeof workerPatchApi.envSnapshot !== 'function') {
    const e = new Error('[WorkerOverride] FAIL_FAST: worker patch api not ready');
    __wrkDiag('error', 'wrk:worker_override_bridge_not_ready', {
      stage: 'preflight',
      key: 'FernwehContext.state.__WRK__.runtime.workerPatchApi',
      message: 'worker override runtime api not ready',
      type: 'pipeline missing data',
      data: { outcome: 'throw', reason: 'worker_patch_api_not_ready' }
    }, e);
    throw e;
  }
  const snap = requireWorkerSnapshot(workerPatchApi.envSnapshot(), 'create');
  __wrkRuntimeSet__('lastSnap', snap);
  workerPatchApi.publishSnapshot(snap);

  // Important: for module workers, do not "clone" blob: URLs.
  // Some real-world bundles embed the original blob URL string for follow-up dynamic imports.
  // If we mint a fresh blob URL, those imports can later fail (original blob gets revoked).
  const userURL = (typeof abs === 'string' && abs.slice(0, 5) === 'blob:' && workerType === 'module')
    ? abs
    : resolveUserScriptURL(G, abs, 'Worker');
  const src = ((workerType === 'module'
    ? workerPatchApi.mkModuleWorkerSource(snap, userURL, 'dedicated')
    : workerPatchApi.mkClassicWorkerSource(snap, userURL, 'dedicated')));

  const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
  const w = new NativeWorker(blobURL, { ...(opts), type: workerType });

    if (w && typeof w.addEventListener === 'function') {
      const cleanup = () => {
        __wrkBestEffort('wrk:worker_cleanup_revoke_failed', {
          stage: 'runtime',
          key: 'blobURL',
          message: 'worker cleanup revoke failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'worker_cleanup_revoke_failed' }
        }, () => URL.revokeObjectURL(blobURL));
        __wrkBestEffort('wrk:worker_cleanup_remove_message_failed', {
          stage: 'runtime',
          key: 'message',
          message: 'worker cleanup remove message listener failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'worker_cleanup_remove_message_failed' }
        }, () => w.removeEventListener('message', onMsg));
        __wrkBestEffort('wrk:worker_cleanup_remove_error_failed', {
          stage: 'runtime',
          key: 'error',
          message: 'worker cleanup remove error listener failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'worker_cleanup_remove_error_failed' }
        }, () => w.removeEventListener('error', onErr));
      };

    let sawWorkerPatchDiag = false;

    const onErr = () => {
      cleanup();
    };

    const onMsg = (ev) => {
      const data = ev && ev.data;
      const relayDiag = data && typeof data === 'object' ? data.__ENV_DIAG__ : null;
      if (relayDiag && typeof relayDiag === 'object') {
        const relayCtx = (relayDiag.ctx && typeof relayDiag.ctx === 'object') ? relayDiag.ctx : null;
        const relayModule = relayCtx && typeof relayCtx.module === 'string' ? relayCtx.module : null;
        const relayTag = relayCtx && typeof relayCtx.diagTag === 'string' ? relayCtx.diagTag : null;
        const relayCode = typeof relayDiag.code === 'string' ? relayDiag.code : null;
        if (
          relayModule === 'WORKER_PATCH_SRC'
          || relayTag === 'worker_patch'
          || (typeof relayCode === 'string' && relayCode.indexOf('worker_patch_src:') === 0)
        ) {
          sawWorkerPatchDiag = true;
        }
        relayWorkerScopeDiag(G, 'DedicatedWorker', relayDiag);
        __wrkBestEffort('wrk:worker_diag_stop_propagation_failed', {
          stage: 'runtime',
          key: 'message',
          message: 'worker diag stop propagation failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'worker_diag_stop_propagation_failed' }
        }, () => { ev.stopImmediatePropagation(); ev.stopPropagation(); });
        return;
      }

      const patchOk = data && typeof data === 'object' ? data.__ENV_PATCH_OK__ : null;
      if (patchOk === true && !sawWorkerPatchDiag) {
        sawWorkerPatchDiag = true;
        __wrkDiag('info', 'wrk:worker_patch_ok_confirmed', {
          stage: 'runtime',
          surface: 'worker',
          key: '__ENV_PATCH_OK__',
          message: 'worker patch ok confirmed (DedicatedWorker)',
          type: 'pipeline missing data',
          data: { outcome: 'return', reason: 'worker_patch_ok_confirmed', scope: 'DedicatedWorker' }
        }, null);
      }

      const bootErr = data && typeof data === 'object' && data.__ENV_BOOTSTRAP_ERROR__;
      if (bootErr) {
        __wrkBestEffort('wrk:worker_bootstrap_error_store_failed', {
          stage: 'runtime',
          key: '__LAST_WORKER_BOOTSTRAP_ERROR__',
          message: 'worker bootstrap error store failed',
          type: 'pipeline missing data',
          data: { outcome: 'skip', reason: 'worker_bootstrap_error_store_failed' }
        }, () => { __wrkRuntimeSet__('lastWorkerBootstrapError', bootErr); });
        emitWorkerBootstrapDegrade(G, 'DedicatedWorker', bootErr);
        __wrkBestEffort('wrk:worker_bootstrap_stop_propagation_failed', {
          stage: 'runtime',
          key: 'message',
          message: 'worker bootstrap stop propagation failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'worker_bootstrap_stop_propagation_failed' }
        }, () => { ev.stopImmediatePropagation(); ev.stopPropagation(); });
        __wrkBestEffort('wrk:worker_terminate_failed', {
          stage: 'runtime',
          key: 'terminate',
          message: 'worker terminate failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'worker_terminate_failed' }
        }, () => { if (w && typeof w.terminate === 'function') w.terminate(); });
        cleanup();
        return;
      }

      const loaded =
        data && typeof data === 'object' && typeof data.__ENV_USER_URL_LOADED__ === 'string'
          ? data.__ENV_USER_URL_LOADED__
          : null;

      if (loaded) {
        __wrkBestEffort('wrk:worker_loaded_store_failed', {
          stage: 'runtime',
          key: '__LAST_WORKER_USER_URL_LOADED__',
          message: 'worker loaded url store failed',
          type: 'pipeline missing data',
          data: { outcome: 'skip', reason: 'worker_loaded_store_failed' }
        }, () => { __wrkRuntimeSet__('lastWorkerUserUrlLoaded', loaded); });
        // скрываем внутренний сигнал от внешних слушателей
        __wrkBestEffort('wrk:worker_loaded_stop_propagation_failed', {
          stage: 'runtime',
          key: 'message',
          message: 'worker loaded stop propagation failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'worker_loaded_stop_propagation_failed' }
        }, () => { ev.stopImmediatePropagation(); ev.stopPropagation(); });

        if (loaded === userURL && userURL !== abs) {
          __wrkBestEffort('wrk:worker_user_url_revoke_failed', {
            stage: 'runtime',
            key: 'userURL',
            message: 'worker user url revoke failed',
            type: 'browser structure missing data',
            data: { outcome: 'skip', reason: 'worker_user_url_revoke_failed' }
          }, () => URL.revokeObjectURL(userURL));
        }

        cleanup();
      }
    };

    w.addEventListener('message', onMsg);
    w.addEventListener('error', onErr);
  }

  return w;

};
  Object.defineProperty(WrappedWorkerRaw, '__coreBridgeTarget__', {
    value: NativeWorker,
    writable: true,
    configurable: true,
    enumerable: false
  });
  Object.setPrototypeOf(WrappedWorkerRaw, Object.getPrototypeOf(NativeWorker));
  Object.defineProperty(WrappedWorkerRaw, 'prototype', {
    value: NativeWorker.prototype,
    writable: false,
    configurable: false,
    enumerable: false
  });
  const WrappedWorker = mark(WrappedWorkerRaw, 'Worker');

  definePatchedValue(G, 'Worker', WrappedWorker, 'Worker');

  G.Worker.__ENV_WRAPPED__ = true;
  if (G.__DEBUG__) {
    __wrkBestEffort('wrk:worker_debug_mark_failed', {
      stage: 'apply',
      key: 'Worker',
      message: 'worker debug mark failed',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'worker_debug_mark_failed' }
    }, () => { __wrkRuntimeSet__('patchedSafeWorker', true); });
    __wrkDiag('info', 'wrk:worker_installed', {
      stage: 'apply',
      key: 'Worker',
      message: 'SafeWorker installed',
      type: 'pipeline missing data',
      data: { outcome: 'return' }
    }, null);
  }
}
// === SafeSharedWorkerOverride (Shared) ===
function SafeSharedWorkerOverride(G){
  if (!G || !G.SharedWorker) throw new Error('[SharedWorkerOverride] SharedWorker missing');
  if (G.SharedWorker.__ENV_WRAPPED__) return;
  installBlobURLStore(G);
  const NativeShared = G.SharedWorker;

  if (typeof mark !== 'function') {
    throw new Error('[SharedWorkerOverride] markAsNative missing');
  }

  // === SharedWorker override wrapper (complete, self-contained) ===
   // Normalize 2nd arg to an options object (always), so `type` is never lost
  const WrappedSharedWorkerRaw = function SharedWorker(url, nameOrOpts) {
    const abs = new URL(url, location.href).href;
    const hasOptsObj =
      !!(nameOrOpts && (typeof nameOrOpts === 'object' || typeof nameOrOpts === 'function')) &&
      (typeof nameOrOpts !== 'string');

    const name =
      (typeof nameOrOpts === 'string')
        ? nameOrOpts
        : (hasOptsObj && typeof nameOrOpts.name === 'string' ? nameOrOpts.name : undefined);

    const optsForResolve = hasOptsObj ? nameOrOpts : (name !== undefined ? { name } : null);
    const workerType = resolveWorkerType(abs, optsForResolve, 'SharedWorker');

    const workerPatchApi = __requireWorkerPatchApi__('shared worker override runtime api not ready', 'preflight');
    if (!workerPatchApi
        || typeof workerPatchApi.mkClassicWorkerSource !== 'function'
        || typeof workerPatchApi.mkModuleWorkerSource !== 'function'
        || typeof workerPatchApi.publishSnapshot !== 'function'
        || typeof workerPatchApi.envSnapshot !== 'function') {
      // Fail-fast: SharedWorker reuse can lock a native (unpatched) worker for the whole origin.
      throw new Error('[SharedWorkerOverride] FAIL_FAST: worker patch api not ready');
    }

    const snap = requireWorkerSnapshot(workerPatchApi.envSnapshot(), 'create');
    __wrkRuntimeSet__('lastSnap', snap);
    workerPatchApi.publishSnapshot(snap);

  // Same reasoning as Worker(): keep original blob: URL for module SharedWorker scripts.
  const userURL = (typeof abs === 'string' && abs.slice(0, 5) === 'blob:' && workerType === 'module')
    ? abs
    : resolveUserScriptURL(G, abs, 'SharedWorker');
    const src = (((workerType === 'module')
      ? workerPatchApi.mkModuleWorkerSource(snap, userURL, 'shared')
      : workerPatchApi.mkClassicWorkerSource(snap, userURL, 'shared')));

    const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));

    let sw;
    try {
      // Always pass options-object so `type` definitely reaches the browser.
      const finalOpts = hasOptsObj ? { ...(nameOrOpts || {}) } : {};
      if (name !== undefined) finalOpts.name = name;
      finalOpts.type = workerType;

      sw = new NativeShared(blobURL, finalOpts);
    } finally {}
    // SharedWorker handshake (port-based): capture bootstrap/patch signals.
    try {
      const port = sw && sw.port;
      if (port && typeof port.addEventListener === 'function') {
        let sawSharedWorkerPatchDiag = false;
        const onMsg = (ev) => {
          const data = ev && ev.data;
          if (!data || typeof data !== 'object') return;
          let internal = false;
          const relayDiag = data.__ENV_DIAG__;
          if (relayDiag && typeof relayDiag === 'object') {
            internal = true;
            const relayCtx = (relayDiag.ctx && typeof relayDiag.ctx === 'object') ? relayDiag.ctx : null;
            const relayModule = relayCtx && typeof relayCtx.module === 'string' ? relayCtx.module : null;
            const relayTag = relayCtx && typeof relayCtx.diagTag === 'string' ? relayCtx.diagTag : null;
            const relayCode = typeof relayDiag.code === 'string' ? relayDiag.code : null;
            if (
              relayModule === 'WORKER_PATCH_SRC'
              || relayTag === 'worker_patch'
              || (typeof relayCode === 'string' && relayCode.indexOf('worker_patch_src:') === 0)
            ) {
              sawSharedWorkerPatchDiag = true;
            }
            relayWorkerScopeDiag(G, 'SharedWorker', relayDiag);
          }
          const bootErr = data.__ENV_BOOTSTRAP_ERROR__;
          if (bootErr) {
            internal = true;
            __wrkBestEffort('wrk:shared_worker_bootstrap_error_store_failed', {
              stage: 'runtime',
              key: '__LAST_SHARED_WORKER_BOOTSTRAP_ERROR__',
              message: 'shared worker bootstrap error store failed',
              type: 'pipeline missing data',
              data: { outcome: 'skip', reason: 'shared_worker_bootstrap_error_store_failed' }
            }, () => { __wrkRuntimeSet__('lastSharedWorkerBootstrapError', bootErr); });
            emitWorkerBootstrapDegrade(G, 'SharedWorker', bootErr);
          }
          const loaded = data.__ENV_USER_URL_LOADED__;
          if (typeof loaded === 'string') {
            internal = true;
            __wrkBestEffort('wrk:shared_worker_loaded_store_failed', {
              stage: 'runtime',
              key: '__LAST_SHARED_WORKER_USER_URL_LOADED__',
              message: 'shared worker loaded url store failed',
              type: 'pipeline missing data',
              data: { outcome: 'skip', reason: 'shared_worker_loaded_store_failed' }
            }, () => { __wrkRuntimeSet__('lastSharedWorkerUserUrlLoaded', loaded); });
          }
          const ok = data.__ENV_PATCH_OK__;
          if (ok === true) {
            internal = true;
            if (!sawSharedWorkerPatchDiag) {
              sawSharedWorkerPatchDiag = true;
              __wrkDiag('info', 'wrk:shared_worker_patch_ok_confirmed', {
                stage: 'runtime',
                surface: 'worker',
                key: '__ENV_PATCH_OK__',
                message: 'worker patch ok confirmed (SharedWorker)',
                type: 'pipeline missing data',
                data: { outcome: 'return', reason: 'worker_patch_ok_confirmed', scope: 'SharedWorker' }
              }, null);
            }
            __wrkBestEffort('wrk:shared_worker_patch_ok_store_failed', {
              stage: 'runtime',
              key: '__LAST_SHARED_WORKER_PATCH_OK__',
              message: 'shared worker patch-ok store failed',
              type: 'pipeline missing data',
              data: { outcome: 'skip', reason: 'shared_worker_patch_ok_store_failed' }
            }, () => { __wrkRuntimeSet__('lastSharedWorkerPatchOk', true); });
          }
          if (internal) {
            __wrkBestEffort('wrk:shared_worker_stop_propagation_failed', {
              stage: 'runtime',
              key: 'message',
              message: 'shared worker stop propagation failed',
              type: 'browser structure missing data',
              data: { outcome: 'skip', reason: 'shared_worker_stop_propagation_failed' }
            }, () => { ev.stopImmediatePropagation(); ev.stopPropagation(); });
          }
        };
        port.addEventListener('message', onMsg);
        __wrkBestEffort('wrk:shared_worker_port_sync_failed', {
          stage: 'runtime',
          key: '__ENV_SYNC__',
          message: 'shared worker per-connect env sync failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'shared_worker_port_sync_failed' }
        }, () => {
          const connectSnap = requireWorkerSnapshot(workerPatchApi.envSnapshot(), 'connect');
          __wrkRuntimeSet__('lastSnap', connectSnap);
          workerPatchApi.publishSnapshot(connectSnap);
          port.start();
          port.postMessage({ __ENV_SYNC__: { envSnapshot: connectSnap } });
        });
      }
    } catch(e) {
      __wrkDiag('warn', 'wrk:shared_worker_handshake_failed', {
        stage: 'runtime',
        key: 'SharedWorker.port',
        message: 'shared worker handshake failed',
        type: 'browser structure missing data',
        data: { outcome: 'skip', reason: 'shared_worker_handshake_failed' }
      }, e);
    }
    return sw;
  };
  Object.defineProperty(WrappedSharedWorkerRaw, '__coreBridgeTarget__', {
    value: NativeShared,
    writable: true,
    configurable: true,
    enumerable: false
  });
  Object.setPrototypeOf(WrappedSharedWorkerRaw, Object.getPrototypeOf(NativeShared));
  Object.defineProperty(WrappedSharedWorkerRaw, 'prototype', {
    value: NativeShared.prototype,
    writable: false,
    configurable: false,
    enumerable: false
  });
  const WrappedSharedWorker = mark(WrappedSharedWorkerRaw, 'SharedWorker');
  
  
  
  definePatchedValue(G, 'SharedWorker', WrappedSharedWorker, 'SharedWorker');
  G.SharedWorker.__ENV_WRAPPED__ = true;
  if (G.__DEBUG__) {
    __wrkBestEffort('wrk:shared_worker_debug_mark_failed', {
      stage: 'apply',
      key: 'SharedWorker',
      message: 'shared worker debug mark failed',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'shared_worker_debug_mark_failed' }
    }, () => { __wrkRuntimeSet__('patchedSharedWorker', true); });
    __wrkDiag('info', 'wrk:shared_worker_installed', {
      stage: 'apply',
      key: 'SharedWorker',
      message: 'SharedWorker installed',
      type: 'pipeline missing data',
      data: { outcome: 'return' }
    }, null);
  }
}
// ===== ServiceWorker override (allow self/infra; block others; hub-friendly) =====
function ServiceWorkerOverride(G){
  'use strict';
  __wrkBestEffort('wrk:service_worker_registration_lane_state_failed', {
    stage: 'apply',
    key: 'FernwehContext.state.__WRK__.runtime.serviceWorkerLane',
    message: 'service worker registration lane state failed',
    type: 'pipeline missing data',
    data: { outcome: 'skip', reason: 'service_worker_registration_lane_state_failed' }
  }, () => {
    __wrkRuntimeSet__('serviceWorkerLane', 'registration');
    __wrkRuntimeSet__('serviceWorkerScopeKind', 'service');
  });
  if (!G || !G.navigator) {
    __wrkDiag('warn', 'wrk:service_worker_navigator_missing', {
      stage: 'preflight',
      key: 'navigator',
      message: 'navigator missing',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'navigator_missing' }
    }, null);
    return;
  }
  if (G.isSecureContext === false) {
    return;
  }
  if (!('serviceWorker' in G.navigator)) {
    __wrkDiag('warn', 'wrk:service_worker_missing', {
      stage: 'preflight',
      key: 'serviceWorker',
      message: 'navigator.serviceWorker missing',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'service_worker_missing' }
    }, null);
    return;
  }
  if (!G.navigator.serviceWorker) {
    __wrkDiag('warn', 'wrk:service_worker_unavailable', {
      stage: 'preflight',
      key: 'serviceWorker',
      message: 'navigator.serviceWorker unavailable',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'service_worker_unavailable' }
    }, null);
    return;
  }

  // --- Идемпотентная проверка: если уже обёрнуто — выходим (без HUB-флагов)
  try {
    const sw    = G.navigator.serviceWorker;
    const proto = Object.getPrototypeOf(sw) || sw;
    const fn    = proto && proto.register;
    // Check three methods at once
    const already =
      (typeof fn === 'function' &&
       fn.__ENV_WRAPPED__ === true) &&
      (typeof (proto && proto.getRegistrations) === 'function' &&
       proto.getRegistrations.__ENV_WRAPPED__ === true) &&
      (typeof (proto && proto.getRegistration) === 'function' &&
       proto.getRegistration.__ENV_WRAPPED__ === true);
    if (already) {
      if (G.__DEBUG__) {
        __wrkBestEffort('wrk:service_worker_already_mark_failed', {
          stage: 'apply',
          key: 'serviceWorker',
          message: 'service worker already-installed mark failed',
          type: 'pipeline missing data',
          data: { outcome: 'skip', reason: 'service_worker_already_mark_failed' }
        }, () => { __wrkRuntimeSet__('patchedServiceWorker', true); });
      }
      __wrkDiag('info', 'wrk:service_worker_already_installed', {
        stage: 'guard',
        key: 'serviceWorker',
        message: 'ServiceWorker already installed',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'already_installed' }
      }, null);
      return;
    }
  } catch(e) {
    __wrkDiag('warn', 'wrk:service_worker_preflight_failed', {
      stage: 'preflight',
      key: 'serviceWorker',
      message: 'service worker preflight failed',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'service_worker_preflight_failed' }
    }, e);
  }

  const SWC   = G.navigator.serviceWorker;
  const proto = Object.getPrototypeOf(SWC) || SWC;
  if (typeof mark !== 'function') {
    throw new Error('[ServiceWorkerOverride] markAsNative missing');
  }

  const Native = {
    register:         proto.register,
    getRegistration:  proto.getRegistration,
    getRegistrations: proto.getRegistrations,
  };

  // ---- режим/политика
  const MODE       = (G.__SW_FILTER_MODE__ ?? 'off');
  const ALLOW_SELF = !!G.__SW_ALLOW_SELF__;
  const EXTRA      = Array.isArray(G.__SW_ALLOW_HOSTS__) ? G.__SW_ALLOW_HOSTS__ : [];
  const FAKE_ON_BLOCK = !!G.__SW_FAKE_ON_BLOCK__;
  const INFRA_ALLOW = Array.isArray(G.__SW_INFRA_ALLOW__) ? G.__SW_INFRA_ALLOW__ : [
    /(?:^|\.)cloudflare\.com$/i,
    /(?:^|\.)challenge\.cloudflare\.com$/i,
    /(?:^|\.)challenges\.cloudflare\.com$/i,
    /(?:^|\.)akamaihd\.net$/i,
    /(?:^|\.)perimeterx\.net$/i,
    /(?:^|\.)hcaptcha\.com$/i,
    /(?:^|\.)recaptcha\.net$/i,
  ];

  const wantFilter = () => MODE !== 'off';
  const wantClean  = () => MODE === 'clean';
  const wantFake   = () => MODE === 'fake' || FAKE_ON_BLOCK;


  const hostOf = (u, base) => {
    try {
      return new URL(u, base || G.location.href).hostname.toLowerCase();
    } catch (e) {
      const emsg =
        (e && typeof e === 'object' && 'message' in e) ? e.message : String(e);
      throw new Error(
        `ServiceWorker host resolve failed (u=${String(u)}, base=${String(base)}): ${emsg}`
      );
    }
  };

  const isSelf  = (h) => !!h && (h === (G.location.hostname).toLowerCase());
  const inList  = (h, arr) => arr.some(x => x instanceof RegExp ? x.test(h)
                                                                : (h === String(x).toLowerCase()) ||
                                                                  h.endsWith('.' + String(x).toLowerCase()));
  const isAllowed = (url, scope) => {
    if (!wantFilter()) return true;
    const h = hostOf(url) || hostOf(scope);
    if (!h) return false;
    if (INFRA_ALLOW.some(rx => rx.test(h))) return true;
    if (ALLOW_SELF && isSelf(h)) return true;
    return inList(h, EXTRA);
  };

  // ---- безопасные заглушки
  const CLEANED = new Set();

  function makeFakeServiceWorker(scriptURL, scope) {
    if (typeof scriptURL !== 'string' || !scriptURL) {
      throw new Error('ServiceWorker fake missing scriptURL');
    }
    if (typeof scope !== 'string' || !scope) {
      throw new Error('ServiceWorker fake missing scope');
    }
    return {
      scriptURL,
      state: 'activated',
      onstatechange: null,
      postMessage() { throw new Error('ServiceWorker.postMessage unavailable'); },
      addEventListener() { throw new Error('ServiceWorker.addEventListener unavailable'); },
      removeEventListener() { throw new Error('ServiceWorker.removeEventListener unavailable'); }
    };
  }

  function makeFakeRegistration(options, scriptURL) {
    if (!options || typeof options !== 'object') {
      throw new Error('ServiceWorker fake registration missing options');
    }
    const scope = options.scope;
    if (typeof scope !== 'string' || !scope) {
      throw new Error('ServiceWorker fake registration missing options.scope');
    }
    const active = makeFakeServiceWorker(scriptURL, scope);
    return {
      scope, installing: null, waiting: null, active,
      navigationPreload: {
        enable: async () => { throw new Error('navigationPreload.enable unavailable'); },
        disable: async () => { throw new Error('navigationPreload.disable unavailable'); },
        getState: async () => { throw new Error('navigationPreload.getState unavailable'); }
      },
      addEventListener() { throw new Error('registration.addEventListener unavailable'); },
      removeEventListener() { throw new Error('registration.removeEventListener unavailable'); },
      update: async () => { throw new Error('registration.update unavailable'); },
      unregister: async () => { throw new Error('registration.unregister unavailable'); }
    };
  }


  // ---- register ----
  if (typeof Native.register === 'function') {
    const desc = Object.getOwnPropertyDescriptor(proto, 'register');
    if (!desc || desc.configurable === false || desc.writable === false) {
      throw new Error(`[ServiceWorkerOverride] register not configurable: ${JSON.stringify(desc)}`);
    }
    const WrappedServiceWorkerRegisterRaw = function register(url, opts){
      if (!isAllowed(url, (opts && opts.scope))) {
        if (wantFake()) return Promise.resolve(makeFakeRegistration(opts, String(url)));
        const Err = (typeof DOMException === 'function')
          ? new DOMException('ServiceWorker register blocked by policy', 'SecurityError')
          : new Error('ServiceWorker register blocked by policy');
        return Promise.reject(Err);
      }

      // ServiceWorker.register must stay as network scriptURL (blob/data are unsupported).
      if (arguments.length >= 2) return Native.register.call(this, url, opts);
      return Native.register.call(this, url);

    };
    Object.defineProperty(WrappedServiceWorkerRegisterRaw, '__coreBridgeTarget__', {
      value: Native.register,
      writable: true,
      configurable: true,
      enumerable: false
    });
    const WrappedServiceWorkerRegister = mark(WrappedServiceWorkerRegisterRaw, 'register');
    __wrkBestEffort('wrk:service_worker_register_name_failed', {
      stage: 'apply',
      key: 'register.name',
      message: 'service worker register name define failed',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'service_worker_register_name_failed' }
    }, () => Object.defineProperty(WrappedServiceWorkerRegister, 'name', { value: 'WrappedServiceWorkerRegister' }));
    WrappedServiceWorkerRegister.__ENV_WRAPPED__ = true;
    Object.defineProperty(proto, 'register', {
      configurable: desc.configurable,
      enumerable: desc.enumerable,
      writable: desc.writable,
      value: WrappedServiceWorkerRegister
    });
  }

  // ---- getRegistrations ----
  if (typeof Native.getRegistrations === 'function') {
    const desc = Object.getOwnPropertyDescriptor(proto, 'getRegistrations');
    if (!desc || desc.configurable === false || desc.writable === false) {
      throw new Error(`[ServiceWorkerOverride] getRegistrations not configurable: ${JSON.stringify(desc)}`);
    }
    const WrappedSWGetRegistrationsRaw = function getRegistrations(){
      return Reflect.apply(Native.getRegistrations, this, arguments).then(async function filterServiceWorkerRegistrations(regs) {
      if (!wantFilter()) return regs;
      const out = [];
      for (const r of regs || []) {
        const sc  = (r && r.scope) || '/';
        const url = (r && r.active && r.active.scriptURL) || sc;
        if (isAllowed(url, sc)) {
          out.push(r);
        } else {
          if (wantClean() && !CLEANED.has(sc)) {
            try {
              await r.unregister();
            } catch (e) {
              __wrkDiag('warn', 'wrk:service_worker_unregister_failed', {
                stage: 'runtime',
                key: sc,
                message: 'service worker unregister failed',
                type: 'browser structure missing data',
                data: { outcome: 'skip', reason: 'service_worker_unregister_failed' }
              }, e);
            }
            CLEANED.add(sc);
          }
          if (wantFake()) out.push(makeFakeRegistration({ scope: sc }, url));
        }
      }
      return out;
      });
    };
    Object.defineProperty(WrappedSWGetRegistrationsRaw, '__coreBridgeTarget__', {
      value: Native.getRegistrations,
      writable: true,
      configurable: true,
      enumerable: false
    });
    const WrappedSWGetRegistrations = mark(WrappedSWGetRegistrationsRaw, 'getRegistrations');
    __wrkBestEffort('wrk:service_worker_getregistrations_name_failed', {
      stage: 'apply',
      key: 'getRegistrations.name',
      message: 'getRegistrations name define failed',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'service_worker_getregistrations_name_failed' }
    }, () => Object.defineProperty(WrappedSWGetRegistrations, 'name', { value: 'WrappedSWGetRegistrations' }));
    WrappedSWGetRegistrations.__ENV_WRAPPED__ = true;
    Object.defineProperty(proto, 'getRegistrations', {
      configurable: desc.configurable, enumerable: desc.enumerable, writable: desc.writable, value: WrappedSWGetRegistrations
    });
  }

  // ---- getRegistration ----
  if (typeof Native.getRegistration === 'function') {
    const desc = Object.getOwnPropertyDescriptor(proto, 'getRegistration');
    if (!desc || desc.configurable === false || desc.writable === false) {
      throw new Error(`[ServiceWorkerOverride] getRegistration not configurable: ${JSON.stringify(desc)}`);
    }
    const WrappedSWGetRegistrationRaw = function getRegistration(scope){
      return Reflect.apply(Native.getRegistration, this, arguments).then(async function filterServiceWorkerRegistration(r) {
      if (!r) return wantFake() && wantFilter() ? makeFakeRegistration({ scope }) : r;
      if (!wantFilter()) return r;

      const sc  = r.scope || scope || '/';
      const url = (r.active && r.active.scriptURL) || sc;
      if (isAllowed(url, sc)) return r;

      if (wantClean() && !CLEANED.has(sc)) {
        try {
          await r.unregister();
        } catch (e) {
          __wrkDiag('warn', 'wrk:service_worker_unregister_failed', {
            stage: 'runtime',
            key: sc,
            message: 'service worker unregister failed',
            type: 'browser structure missing data',
            data: { outcome: 'skip', reason: 'service_worker_unregister_failed' }
          }, e);
        }
        CLEANED.add(sc);
      }
      return wantFake() ? makeFakeRegistration({ scope: sc }, url) : undefined;
      });
    };
    Object.defineProperty(WrappedSWGetRegistrationRaw, '__coreBridgeTarget__', {
      value: Native.getRegistration,
      writable: true,
      configurable: true,
      enumerable: false
    });
    const WrappedSWGetRegistration = mark(WrappedSWGetRegistrationRaw, 'getRegistration');
    __wrkBestEffort('wrk:service_worker_getregistration_name_failed', {
      stage: 'apply',
      key: 'getRegistration.name',
      message: 'getRegistration name define failed',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'service_worker_getregistration_name_failed' }
    }, () => Object.defineProperty(WrappedSWGetRegistration, 'name', { value: 'WrappedSWGetRegistration' }));
    WrappedSWGetRegistration.__ENV_WRAPPED__ = true;
    Object.defineProperty(proto, 'getRegistration', {
      configurable: desc.configurable, enumerable: desc.enumerable, writable: desc.writable, value: WrappedSWGetRegistration
    });
  }

  //Diagnostics
  if (G.__DEBUG__) {
    __wrkBestEffort('wrk:service_worker_debug_mark_failed', {
      stage: 'apply',
      key: 'serviceWorker',
      message: 'service worker debug mark failed',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'service_worker_debug_mark_failed' }
    }, () => { __wrkRuntimeSet__('patchedServiceWorker', true); });
  }
  __wrkDiag('info', 'wrk:service_worker_installed', {
    stage: 'apply',
    key: 'serviceWorker',
    message: 'ServiceWorker installed',
    type: 'pipeline missing data',
    data: { outcome: 'return' }
  }, null);
}
// === WorkerPatchHooks: оркестратор ===
(function WorkerPatchHooks(G){
  const hooksRoot = __ensureWrkHooksRoot__();
  if (!G || (hooksRoot && hooksRoot.WorkerPatchHooks)) return;

  // 1) Hub (идемпотентно, без сайд-эффектов)
  function initHub(){
    const hub = __resolveEnvHub__() || EnvHubPatchModule(G) || __resolveEnvHub__();
    if (!hub) throw new Error('[WorkerInit] EnvHub missing');
    return hub;
  }

  // 2) Overrides (Worker/Shared/SW) — после Hub
  function installOverrides(){
    const hub = initHub();
    WorkerOverrides_install(G, hub);
    return hub;
  }

  // 3) Первый снапшот (LE) из текущего состояния
  function snapshotOnce(){
    const workerPatchApi = __requireWorkerPatchApi__('worker patch hooks runtime api not ready', 'preflight');
    const envSnapshot = (workerPatchApi && typeof workerPatchApi.envSnapshot === 'function')
      ? workerPatchApi.envSnapshot
      : EnvBus(G).envSnapshot;
    const snap = envSnapshot();
    const hub = __resolveEnvHub__();
    if (!hub || typeof hub.publish !== 'function') {
      throw new Error('[WorkerInit] hub missing');
    }
    hub.publish(snap);
    __updateWorkerSnapshotStatus__(true, 'snapshot_ready');
    __retryBootstrapEnvCleanup__();
    return snap;
  }

  // 4) HE-догонка (не блокирует загрузку, без «N»/«Nav»)
  function snapshotHE(keys){
    const existingPromise = __wrkRuntimeGet__('uachHePromise');
    if (existingPromise && typeof existingPromise.then === 'function') return existingPromise;
    const KEYS = Array.isArray(keys) && keys.length
      ? keys
      : ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','formFactors','wow64'];
    const workerEnvSnapshot = (() => {
      const lastSnap = __wrkRuntimeGet__('lastSnap');
      if (lastSnap && typeof lastSnap === 'object') return lastSnap;
      const workerPatchApi = __requireWorkerPatchApi__('worker patch hooks runtime api not ready', 'preflight');
      if (workerPatchApi && typeof workerPatchApi.envSnapshot === 'function') {
        return workerPatchApi.envSnapshot();
      }
      return EnvBus(G).envSnapshot();
    })();
    const heSource = (workerEnvSnapshot && workerEnvSnapshot.uaData && workerEnvSnapshot.uaData.he && typeof workerEnvSnapshot.uaData.he === 'object')
      ? workerEnvSnapshot.uaData.he
      : null;
    if (!heSource) throw new Error('[WorkerInit] high entropy missing');
    const he = {};
    for (const k of KEYS) {
      if (!(k in heSource)) throw new Error(`[WorkerInit] high entropy missing ${k}`);
      const v = heSource[k];
      if (v === undefined || v === null) throw new Error(`[WorkerInit] high entropy bad ${k}`);
      if (Array.isArray(v) && !v.length) throw new Error(`[WorkerInit] high entropy bad ${k}`);
      he[k] = __wrkCloneEnvValue__(v);
    }
    const p = Promise.resolve(he).then(result => {
      __wrkRuntimeSet__('lastUachHe', result);
      __wrkRuntimeSet__('uachHeReady', true);
      return result;
    });
    __wrkRuntimeSet__('uachHePromise', p);
    return p;
  }

  // 5) Полный сценарий
  function initAll(opts){
    const o = Object.assign({ publishHE: true, heKeys: null }, opts);
    __updateWorkerSnapshotStatus__(false, 'pending');
    // Install overrides first to prevent early native SharedWorker creation before async HE readiness.
    installOverrides(); // Hub -> Overrides
    // Strict UAData mode: obtain HE first; only then publish snapshots.
    return snapshotHE(o.heKeys).then(() => snapshotOnce());
  }

  // 6) Diagnostics
  function diag(){
    if (!G.__DEBUG__) return {};
    const workerPatchApi = __requireWorkerPatchApi__('worker patch hooks diag runtime api not ready', 'runtime');
    return {
      hasHub:        !!__resolveEnvHub__(),
      workerWrapped: !!(G.Worker && G.Worker.__ENV_WRAPPED__ === true),
      sharedWrapped: !!(G.SharedWorker && G.SharedWorker.__ENV_WRAPPED__),
      swWrapped:     !!__wrkRuntimeGet__('patchedServiceWorker'),
      bridge: {
        mkClassic: typeof workerPatchApi.mkClassicWorkerSource === 'function',
        mkModule:  typeof workerPatchApi.mkModuleWorkerSource  === 'function',
        publish:   typeof workerPatchApi.publishSnapshot       === 'function',
        envSnap:   typeof workerPatchApi.envSnapshot           === 'function'
      }
    };
  }
  __captureWorkerPatchHooks__({ initHub, installOverrides, snapshotOnce, snapshotHE, initAll, diag });

})(G); // <-- закрыли и СРАЗУ вызвали WorkerPatchHooks(G)


  __wrkDiag('info', 'wrk:worker_patch_hooks_ready', {
    stage: 'apply',
    key: 'FernwehContext.state.__WRK__.hooks.WorkerPatchHooks',
    message: 'WorkerPatchHooks ready',
    type: 'pipeline missing data',
    data: { outcome: 'return' }
  }, null);

    __wrkDiag('info', 'wrk:ready', {
      stage: 'apply',
      key: 'WrkModule',
      message: 'WrkModule initialized',
      type: 'pipeline missing data',
      data: { outcome: 'return', reason: 'ready' }
    }, null);
  } catch (e) {
    __wrkDiag('error', 'wrk:module_init_failed', {
      stage: 'apply',
      key: 'WrkModule',
      message: 'WrkModule initialization failed',
      type: 'browser structure missing data',
      data: { outcome: 'throw', reason: 'module_init_failed', rollbackOk: false }
    }, e);
    __wrkBestEffort('wrk:guard_release_failed', {
      stage: 'guard',
      key: 'guard',
      message: 'releaseGuardFlag failed',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'guard_release_failed' }
    }, () => (__core && typeof __core.releaseGuardFlag === 'function')
      ? __core.releaseGuardFlag(__flagKey, __guardToken, false, __tag)
      : false);
    throw e;
  }
}; // <-- закрыли WrkModule

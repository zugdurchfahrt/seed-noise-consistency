// WORKER_PATCH_SRC.js
(() => {
  const G = (typeof globalThis !== 'undefined' && globalThis)
      || (typeof self       !== 'undefined' && self)
      || (typeof window     !== 'undefined' && window)
      || (typeof global     !== 'undefined' && global)
      || {};
  if (typeof self==='undefined' || typeof WorkerGlobalScope==='undefined' || !(self instanceof WorkerGlobalScope)) {
    throw new Error('Ubergabe: not in WorkerGlobalScope');
  }
  const W = self;
  const __resolveBootstrapWorkerRuntimeRoot__ = () => {
    const C = (self && self.FernwehContext && typeof self.FernwehContext === 'object')
      ? self.FernwehContext
      : null;
    const stateRoot = (C && C.state && typeof C.state === 'object')
      ? C.state
      : null;
    const wrkState = (stateRoot && stateRoot.__WRK__ && typeof stateRoot.__WRK__ === 'object')
      ? stateRoot.__WRK__
      : null;
    return (wrkState && wrkState.runtime && typeof wrkState.runtime === 'object')
      ? wrkState.runtime
      : null;
  };
  const __defineHiddenWorkerRuntimeValue__ = (obj, key, value) => {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return value;
    const desc = Object.getOwnPropertyDescriptor(obj, key);
    if (desc && desc.configurable === false) {
      return Object.prototype.hasOwnProperty.call(desc, 'value') ? desc.value : value;
    }
    Object.defineProperty(obj, key, {
      value,
      writable: true,
      configurable: true,
      enumerable: false
    });
    return value;
  };
  let __uachMirrorInstalled__ = false;
  const __rollbackProbeRoot__ = Object.create(null);

  const __installWorkerUACHMirror__ = function installWorkerUACHMirror(){
    if (__uachMirrorInstalled__) {
      throw new Error('Ubergabe: already installed');
    }
    const bootstrapRuntimeRoot = __resolveBootstrapWorkerRuntimeRoot__();
    if (!(bootstrapRuntimeRoot && typeof bootstrapRuntimeRoot === 'object')) {
      throw new Error('Ubergabe: worker runtime root missing');
    }
    if (bootstrapRuntimeRoot.bootstrapActive !== true) {
      throw new Error('Ubergabe: bootstrap marker missing');
    }
    const __workerScopeMarker__ = (() => {
      const runtimeScope = (typeof bootstrapRuntimeRoot.workerScope === 'string' && bootstrapRuntimeRoot.workerScope)
        ? bootstrapRuntimeRoot.workerScope
        : null;
      if (runtimeScope) return runtimeScope;
      const runtimeKind = bootstrapRuntimeRoot && bootstrapRuntimeRoot.workerScopeKind;
      return runtimeKind === 'shared'
        ? 'SharedWorker'
        : (runtimeKind === 'dedicated' ? 'DedicatedWorker' : null);
    })();
    __defineHiddenWorkerRuntimeValue__(bootstrapRuntimeRoot, 'workerScope', __workerScopeMarker__);
    const nav = self.navigator;
    const proto = (typeof WorkerNavigator!=='undefined' && WorkerNavigator.prototype) || Object.getPrototypeOf(nav);
    if (!proto && !nav) {
      throw new Error('Ubergabe: WorkerNavigator unavailable');
    }
    const cache = { snap:null };
    let __bootstrapSnapshotConsumed__ = false;
    const relayDiag = (typeof bootstrapRuntimeRoot.relayDiag === 'function') ? bootstrapRuntimeRoot.relayDiag : null;
    const emitDegrade = (level, code, ctx, err) => {
      const d = (typeof __DEGRADE__ === "function") ? __DEGRADE__ : null;
      const x = (ctx && typeof ctx === 'object') ? ctx : {};
      const normalizedCtx = {
        module: 'WORKER_PATCH_SRC',
        diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : 'worker_patch',
        surface: (typeof x.surface === 'string' && x.surface) ? x.surface : 'worker',
        key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
        stage: x.stage,
        message: (typeof x.message === 'string' && x.message) ? x.message : String(code || 'worker_patch_src'),
        data: Object.prototype.hasOwnProperty.call(x, 'data')
          ? x.data
          : {
              outcome: (x.action === 'throw')
                ? 'throw'
                : ((x.action === 'native' || x.action === 'skip') ? 'skip' : (level === 'info' ? 'return' : 'skip'))
            },
        type: x.type
      };
      if (relayDiag) {
        relayDiag(level, code, normalizedCtx, err || null);
      }
      if (d) {
        if (typeof d.diag === "function") {
          d.diag(level, code, normalizedCtx, err || null);
        } else {
          d(code, err || null, Object.assign({}, normalizedCtx, { level: level || 'info' }));
        }
      }
    };
    const appliedDescriptors = [];
    const __resolveWorkerWrkRuntimeRoot__ = () => __resolveBootstrapWorkerRuntimeRoot__();
    const __resolveWorkerStateRoot__ = () => {
      const C = (self && self.FernwehContext && typeof self.FernwehContext === 'object')
        ? self.FernwehContext
        : null;
      return (C && C.state && typeof C.state === 'object')
        ? C.state
        : null;
    };
    const __resolveWorkerSnapshotOwner__ = () => {
      const stateRoot = __resolveWorkerStateRoot__();
      const navModuleState = (stateRoot && stateRoot.__NAV_TOTAL_SET__ && typeof stateRoot.__NAV_TOTAL_SET__ === 'object')
        ? stateRoot.__NAV_TOTAL_SET__
        : null;
      const dataStoreState = (navModuleState && navModuleState.__DATA_STORE_STATE__ && typeof navModuleState.__DATA_STORE_STATE__ === 'object')
        ? navModuleState.__DATA_STORE_STATE__
        : null;
      const workerEnvSnapshot = (dataStoreState && dataStoreState.__WORKER_ENV_SNAPSHOT__ && typeof dataStoreState.__WORKER_ENV_SNAPSHOT__ === 'object')
        ? dataStoreState.__WORKER_ENV_SNAPSHOT__
        : null;
      return workerEnvSnapshot;
    };
    const __isWorkerScopeKind__ = (kind) => kind === 'dedicated' || kind === 'shared';
    const __isServiceWorkerScope__ = () => {
      try {
        return typeof ServiceWorkerGlobalScope === 'function' && self instanceof ServiceWorkerGlobalScope;
      } catch (_e) {}
      return false;
    };
    const __scopeNameFromKind__ = (kind) => kind === 'service'
      ? 'ServiceWorker'
      : (kind === 'shared'
        ? 'SharedWorker'
        : (kind === 'dedicated' ? 'DedicatedWorker' : null));
    const __resolveBootstrapWorkerScopeKind__ = () => {
      const runtimeRoot = __resolveWorkerWrkRuntimeRoot__();
      const runtimeKind = runtimeRoot && runtimeRoot.workerScopeKind;
      if (__isWorkerScopeKind__(runtimeKind)) return runtimeKind;
      throw new Error('Ubergabe: worker scope kind missing');
    };
    if (__isServiceWorkerScope__()) {
      const e = new Error('Ubergabe: service worker requires separate lane');
      emitDegrade('error', 'worker_patch_src:scope_kind:contract:service_lane_required', {
        type: 'pipeline missing data',
        stage: 'contract',
        module: 'WORKER_PATCH_SRC',
        surface: 'worker',
        key: '__WORKER_SCOPE_KIND__',
        policy: 'throw',
        action: 'throw',
        data: { outcome: 'throw', reason: 'service_scope_requires_separate_lane' }
      }, e);
      throw e;
    }
    const workerScopeKind = __resolveBootstrapWorkerScopeKind__();
    const __workerScopeName__ = __scopeNameFromKind__(workerScopeKind);
    const __isCoreToStringStateOk__ = (st) => !!(st
      && st.__CORE_TOSTRING_STATE__ === true
      && typeof st.nativeToString === 'function'
      && (st.overrideMap instanceof WeakMap)
      && (st.proxyTargetMap instanceof WeakMap));
    const __resolveCoreToStringState__ = () => {
      const runtimeRoot = __resolveWorkerWrkRuntimeRoot__();
      const ownedState = runtimeRoot && runtimeRoot.__CORE_TOSTRING_STATE__;
      if (__isCoreToStringStateOk__(ownedState)) return ownedState;
      return null;
    };
    const trackedDefineProperty = (obj, key, desc) => {
      const hadOwn = Object.prototype.hasOwnProperty.call(obj, key);
      const prevDesc = hadOwn ? Object.getOwnPropertyDescriptor(obj, key) : null;
      Object.defineProperty(obj, key, desc);
      appliedDescriptors.push({ obj, key, hadOwn, prevDesc });
    };
    const trackedDefineProperties = (obj, descriptors) => {
      for (const key of Object.keys(descriptors || {})) {
        trackedDefineProperty(obj, key, descriptors[key]);
      }
    };
    const rollbackAppliedDescriptors = () => {
      while (appliedDescriptors.length) {
        const item = appliedDescriptors.pop();
        if (!item || !item.obj) continue;
        if (item.hadOwn && item.prevDesc) {
          Object.defineProperty(item.obj, item.key, item.prevDesc);
        } else {
          delete item.obj[item.key];
        }
      }
    };
    const verifyRollbackRepeatApply = () => {
      const probeKey = '__WORKER_PATCH_SELFTEST__';
      if (Object.prototype.hasOwnProperty.call(__rollbackProbeRoot__, probeKey)) {
        throw new Error('Ubergabe: rollback selftest residue');
      }
      const runAttempt = () => {
        let forced = null;
        try {
          trackedDefineProperty(__rollbackProbeRoot__, probeKey, {
            value: true,
            writable: true,
            configurable: true,
            enumerable: false
          });
          throw new Error('Ubergabe: rollback selftest trigger');
        } catch (e) {
          forced = e;
          rollbackAppliedDescriptors();
        }
        if (!forced) {
          throw new Error('Ubergabe: rollback selftest missing forced failure');
        }
        if (Object.prototype.hasOwnProperty.call(__rollbackProbeRoot__, probeKey)) {
          throw new Error('Ubergabe: rollback selftest failed');
        }
      };
      runAttempt();
      runAttempt();
    };
    verifyRollbackRepeatApply();
    const __workerNavigatorPatchedOwners__ = Object.create(null);
    const __workerNavigatorDescriptorModes__ = Object.create(null);
    const validDpr = v => Number.isFinite(v) && v > 0;
    const HE_KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
    const LE_KEYS = ['brands','mobile','platform'];
    const requireSnap = (s, where) => {
      if (!s || typeof s !== 'object') {
        const msg = where ? `Ubergabe: no snapshot (${where})` : 'Ubergabe: no snapshot';
        throw new Error(msg);
      }
      if (typeof s.language !== 'string' || s.language.trim() === '') throw new Error('Ubergabe: bad language');
      if (!Array.isArray(s.languages)) throw new Error('Ubergabe: bad languages');
      if (!Number.isFinite(Number(s.deviceMemory))) throw new Error('Ubergabe: bad deviceMemory');
      if (!Number.isFinite(Number(s.hardwareConcurrency))) throw new Error('Ubergabe: bad hardwareConcurrency');
      if (!s.webgl || typeof s.webgl !== 'object') throw new Error('Ubergabe: missing webgl');
      if (typeof s.webgl.vendor !== 'string' || !s.webgl.vendor) throw new Error('Ubergabe: bad webgl.vendor');
      if (typeof s.webgl.renderer !== 'string' || !s.webgl.renderer) throw new Error('Ubergabe: bad webgl.renderer');
      if (typeof s.webgl.unmaskedVendor !== 'string' || !s.webgl.unmaskedVendor) throw new Error('Ubergabe: bad webgl.unmaskedVendor');
      if (typeof s.webgl.unmaskedRenderer !== 'string' || !s.webgl.unmaskedRenderer) throw new Error('Ubergabe: bad webgl.unmaskedRenderer');
      if (!s.uaData) throw new Error('Ubergabe: missing userAgentData');
      if (!s.screen || typeof s.screen !== 'object') throw new Error('Ubergabe: missing screen');
      if (!Number.isFinite(Number(s.screen.width))) throw new Error('Ubergabe: bad screen.width');
      if (!Number.isFinite(Number(s.screen.height))) throw new Error('Ubergabe: bad screen.height');
      if (!Number.isFinite(Number(s.screen.dpr)) || Number(s.screen.dpr) <= 0) throw new Error('Ubergabe: bad screen.dpr');
      if (!Number.isFinite(Number(s.screen.colorDepth))) throw new Error('Ubergabe: bad screen.colorDepth');
      if (!s.envProfile || typeof s.envProfile !== 'object') throw new Error('Ubergabe: missing envProfile');
      if (!s.envProfile.__PLATFORM__ || typeof s.envProfile.__PLATFORM__ !== 'object') throw new Error('Ubergabe: missing envProfile.__PLATFORM__');
      if (typeof s.envProfile.__PLATFORM__.domPlatform !== 'string' || !s.envProfile.__PLATFORM__.domPlatform) throw new Error('Ubergabe: bad envProfile.__PLATFORM__.domPlatform');
      if (typeof s.envProfile.__PLATFORM__.uaPlatform !== 'string' || !s.envProfile.__PLATFORM__.uaPlatform) throw new Error('Ubergabe: bad envProfile.__PLATFORM__.uaPlatform');
      if (typeof s.envProfile.__PLATFORM__.platformVersion !== 'string' || !s.envProfile.__PLATFORM__.platformVersion) throw new Error('Ubergabe: bad envProfile.__PLATFORM__.platformVersion');
      const he = (s.uaData && s.uaData.he) || s.highEntropy;
      if (!he || typeof he !== 'object') throw new Error('Ubergabe: missing highEntropy');
      for (const k of HE_KEYS) {
        if (!(k in he)) throw new Error(`Ubergabe: missing highEntropy.${k}`);
        const v = he[k];
        if (v === undefined || v === null) throw new Error(`Ubergabe: bad highEntropy.${k}`);
        // if (typeof v === 'string' && !v) throw new Error(`Ubergabe: bad highEntropy.${k}`);
        if (typeof v === 'string' && !v && k !== 'model' && k !== 'uaFullVersion') throw new Error(`Ubergabe: bad highEntropy.${k}`);
        if (Array.isArray(v) && !v.length) throw new Error(`Ubergabe: bad highEntropy.${k}`);
      }
      return s;
    };
    const requirePlatformTransit = (snap, where) => {
      const source = requireSnap(snap, where);
      const envProfile = source && source.envProfile && typeof source.envProfile === 'object'
        ? source.envProfile
        : null;
      const envPlatform = envProfile && envProfile.__PLATFORM__ && typeof envProfile.__PLATFORM__ === 'object'
        ? envProfile.__PLATFORM__
        : null;
      if (!envPlatform) throw new Error('Ubergabe: missing envProfile.__PLATFORM__');
      return envPlatform;
    };
    const bootstrapSnapshotOwner = __resolveWorkerSnapshotOwner__();
    if (!bootstrapSnapshotOwner) {
      throw new Error('Ubergabe: FernwehContext.state.__NAV_TOTAL_SET__.__DATA_STORE_STATE__.__WORKER_ENV_SNAPSHOT__ missing');
    }
    cache.snap = requireSnap(bootstrapSnapshotOwner, 'init');

    // Seed must be provided inside the worker realm (e.g. via CDP prelude).
    const seedInit = (self.CDP_GLOBAL_SEED != null) ? String(self.CDP_GLOBAL_SEED) : null;
    if (seedInit == null || seedInit === '') {
      const e = new Error('Ubergabe: CDP_GLOBAL_SEED missing');
      emitDegrade('error', 'worker_patch_src:seed:preflight:missing', {
        type: 'pipeline missing data',
        stage: 'preflight',
        module: 'WORKER_PATCH_SRC',
        surface: 'CDP_GLOBAL_SEED',
        key: 'CDP_GLOBAL_SEED',
        policy: 'throw',
        action: 'throw'
      }, e);
      throw e;
    }
    const runtimeRoot = __resolveWorkerWrkRuntimeRoot__();
    const wrapNativeApplyDesc = runtimeRoot
      ? Object.getOwnPropertyDescriptor(runtimeRoot, '__wrapNativeApply')
      : null;
    const wrapNativeApply = (wrapNativeApplyDesc && typeof wrapNativeApplyDesc.value === 'function')
      ? wrapNativeApplyDesc.value
      : (runtimeRoot && typeof runtimeRoot.__wrapNativeApply === 'function'
          ? runtimeRoot.__wrapNativeApply
          : null);
    if (typeof wrapNativeApply !== 'function') {
      const e = new Error('Ubergabe: __wrapNativeApply missing');
      emitDegrade('error', 'worker_patch_src:wrap_native_apply:preflight:missing', {
        type: 'pipeline missing data',
        stage: 'preflight',
        module: 'WORKER_PATCH_SRC',
        surface: '__wrapNativeApply',
        key: '__wrapNativeApply',
        policy: 'throw',
        action: 'throw'
      }, e);
      throw e;
    }
    const wrapNativeAccessorDesc = runtimeRoot
      ? Object.getOwnPropertyDescriptor(runtimeRoot, '__wrapNativeAccessor')
      : null;
    const wrapNativeAccessor = (wrapNativeAccessorDesc && typeof wrapNativeAccessorDesc.value === 'function')
      ? wrapNativeAccessorDesc.value
      : (runtimeRoot && typeof runtimeRoot.__wrapNativeAccessor === 'function'
          ? runtimeRoot.__wrapNativeAccessor
          : null);
    if (typeof wrapNativeAccessor !== 'function') {
      const e = new Error('Ubergabe: __wrapNativeAccessor missing');
      emitDegrade('error', 'worker_patch_src:wrap_native_accessor:preflight:missing', {
        type: 'pipeline missing data',
        stage: 'preflight',
        module: 'WORKER_PATCH_SRC',
        surface: '__wrapNativeAccessor',
        key: '__wrapNativeAccessor',
        policy: 'throw',
        action: 'throw'
      }, e);
      throw e;
    }
    const wrapNativeCtorDesc = runtimeRoot
      ? Object.getOwnPropertyDescriptor(runtimeRoot, '__wrapNativeCtor')
      : null;
    const wrapNativeCtor = (wrapNativeCtorDesc && typeof wrapNativeCtorDesc.value === 'function')
      ? wrapNativeCtorDesc.value
      : (runtimeRoot && typeof runtimeRoot.__wrapNativeCtor === 'function'
          ? runtimeRoot.__wrapNativeCtor
          : null);
    if (typeof wrapNativeCtor !== 'function') {
      const e = new Error('Ubergabe: __wrapNativeCtor missing');
      emitDegrade('error', 'worker_patch_src:wrap_native_ctor:preflight:missing', {
        type: 'pipeline missing data',
        stage: 'preflight',
        module: 'WORKER_PATCH_SRC',
        surface: '__wrapNativeCtor',
        key: '__wrapNativeCtor',
        policy: 'throw',
        action: 'throw'
      }, e);
      throw e;
    }
    const applyAccessorTargetsDesc = runtimeRoot
      ? Object.getOwnPropertyDescriptor(runtimeRoot, '__applyAccessorTargets')
      : null;
    const applyAccessorTargets = (applyAccessorTargetsDesc && typeof applyAccessorTargetsDesc.value === 'function')
      ? applyAccessorTargetsDesc.value
      : (runtimeRoot && typeof runtimeRoot.__applyAccessorTargets === 'function'
          ? runtimeRoot.__applyAccessorTargets
          : null);
    if (typeof applyAccessorTargets !== 'function') {
      const e = new Error('Ubergabe: worker accessor target executor missing');
      emitDegrade('error', 'worker_patch_src:apply_accessor_targets:preflight:missing', {
        type: 'pipeline missing data',
        stage: 'preflight',
        module: 'WORKER_PATCH_SRC',
        surface: '__applyAccessorTargets',
        key: '__applyAccessorTargets',
        policy: 'throw',
        action: 'throw'
      }, e);
      throw e;
    }

    // [NORMATIVE] use unified core toString bridge state (no module-local WeakMap holders).
    {
      const st = __resolveCoreToStringState__();
      const ok = __isCoreToStringStateOk__(st);
      if (!ok) {
        const e = new Error('Ubergabe: __CORE_TOSTRING_STATE__ missing/invalid');
        emitDegrade('error', 'worker_patch_src:tostring_state:preflight:missing', {
          type: 'pipeline missing data',
          stage: 'preflight',
          module: 'WORKER_PATCH_SRC',
          surface: 'FernwehContext.state.__WRK__.runtime.__CORE_TOSTRING_STATE__',
          key: 'FernwehContext.state.__WRK__.runtime.__CORE_TOSTRING_STATE__',
          policy: 'throw',
          action: 'throw'
        }, e);
        throw e;
      }
    }

    const toStringDesc = Object.getOwnPropertyDescriptor(Function.prototype, 'toString');
    const nativeToString = (toStringDesc && typeof toStringDesc.value === 'function')
      ? toStringDesc.value
      : ((typeof Function.prototype.toString === 'function') ? Function.prototype.toString : null);
    if (typeof nativeToString !== 'function') {
      const e = new Error('Ubergabe: Function.prototype.toString missing');
      emitDegrade('error', 'worker_patch_src:tostring:preflight:missing', {
        type: 'pipeline missing data',
        stage: 'preflight',
        module: 'WORKER_PATCH_SRC',
        surface: 'Function.prototype.toString',
        key: 'toString',
        policy: 'throw',
        action: 'throw'
      }, e);
      throw e;
    }

    // sanity: worker follows window-style native baseline.
    {
      const directProbe = function workerPatchDirectProbe(){};
      const expectedNative = Reflect.apply(nativeToString, directProbe, []);
      const actualNative = Reflect.apply(Function.prototype.toString, directProbe, []);
      if (actualNative !== expectedNative) {
        const e = new Error('Ubergabe: toString native forwarding mismatch');
        emitDegrade('error', 'worker_patch_src:tostring:contract:forwarding_mismatch', {
          type: 'pipeline missing data',
          stage: 'contract',
          module: 'WORKER_PATCH_SRC',
          surface: 'Function.prototype.toString',
          key: 'toString',
          policy: 'throw',
          action: 'throw'
        }, e);
        throw e;
      }
    }


    try {
    const getDevicePixelRatioRaw = function getDevicePixelRatio(){
      if (!cache.snap) throw new Error('Ubergabe: no snap');
      if (!('dpr' in cache.snap)) throw new Error('Ubergabe: no dpr');
      const snapVal = Number(cache.snap.dpr);
      if (validDpr(snapVal)) return snapVal;
      throw new Error('Ubergabe: bad dpr');
    };
    const dprOwn = Object.getOwnPropertyDescriptor(self, 'devicePixelRatio');
    const dprProto = (!dprOwn && Object.getPrototypeOf(self))
      ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(self), 'devicePixelRatio')
      : null;
    const dprTarget = dprOwn ? self : (dprProto ? Object.getPrototypeOf(self) : null);
    const dprDesc = dprOwn || dprProto;
    if (dprTarget && !(dprDesc && dprDesc.configurable === false)) {
      const isData = dprDesc && Object.prototype.hasOwnProperty.call(dprDesc, 'value') && !dprDesc.get && !dprDesc.set;
      if (isData) {
        trackedDefineProperty(dprTarget, 'devicePixelRatio', {
          value: getDevicePixelRatioRaw(),
          writable: !!dprDesc.writable,
          configurable: !!dprDesc.configurable,
          enumerable: !!dprDesc.enumerable
        });
      } else if (dprDesc && typeof dprDesc.get === 'function') {
        const wrappedGetDevicePixelRatio = wrapNativeAccessor(dprDesc.get, 'get devicePixelRatio', function(target, thisArg) {
          if (thisArg !== self) {
            return Reflect.apply(target, thisArg, []);
          }
          return getDevicePixelRatioRaw.call(thisArg);
        });
        trackedDefineProperty(dprTarget, 'devicePixelRatio', {
          configurable: dprDesc ? !!dprDesc.configurable : true,
          enumerable: dprDesc ? !!dprDesc.enumerable : false,
          get: wrappedGetDevicePixelRatio,
          set: dprDesc && dprDesc.set
        });
      }
    }

    const deep = v => v==null ? v : JSON.parse(JSON.stringify(v));
    const toBrands = a => {
      if (!Array.isArray(a)) throw new Error('worker_patch_src: uaData.brands missing');
      return a.map(x => {
        if (!x || typeof x !== 'object') throw new Error('worker_patch_src: uaData.brand entry');
        const brand = (typeof x.brand === 'string' && x.brand) ? x.brand
                    : (typeof x.name === 'string' && x.name) ? x.name
                    : null;
        if (!brand) throw new Error('worker_patch_src: uaData.brand missing');
        let versionRaw = null;
        if (typeof x.version === 'string') {
          if (!x.version) throw new Error('worker_patch_src: uaData.brand version missing');
          versionRaw = x.version;
        } else if (typeof x.version === 'number' && Number.isFinite(x.version)) {
          versionRaw = String(x.version);
        } else {
          throw new Error('worker_patch_src: uaData.brand version missing');
        }
        const major = String(versionRaw).split('.')[0];
        if (!major) throw new Error('worker_patch_src: uaData.brand version missing');
        return { brand: String(brand), version: String(major) };
      });
    };
    const nativeUAD = nav && nav.userAgentData;
    if (!nativeUAD) throw new Error('worker_patch_src: worker navigator.userAgentData missing');
    const uadProto = Object.getPrototypeOf(nativeUAD);
    if (!uadProto) throw new Error('worker_patch_src: worker navigator.userAgentData proto missing');
    const stateRootForUAD = (self.FernwehContext && typeof self.FernwehContext === 'object' && self.FernwehContext.state && typeof self.FernwehContext.state === 'object')
      ? self.FernwehContext.state
      : null;
    if (!stateRootForUAD) throw new Error('Ubergabe: FernwehContext.state missing');
    const navModuleStateForUAD = (stateRootForUAD.__NAV_TOTAL_SET__ && typeof stateRootForUAD.__NAV_TOTAL_SET__ === 'object')
      ? stateRootForUAD.__NAV_TOTAL_SET__
      : null;
    if (!navModuleStateForUAD) throw new Error('Ubergabe: FernwehContext.state.__NAV_TOTAL_SET__ missing');
    const dataStoreStateForUAD = (navModuleStateForUAD.__DATA_STORE_STATE__ && typeof navModuleStateForUAD.__DATA_STORE_STATE__ === 'object')
      ? navModuleStateForUAD.__DATA_STORE_STATE__
      : null;
    if (!dataStoreStateForUAD) throw new Error('Ubergabe: FernwehContext.state.__NAV_TOTAL_SET__.__DATA_STORE_STATE__ missing');
    const workerEnvSnapshotOwner = (dataStoreStateForUAD.__WORKER_ENV_SNAPSHOT__ && typeof dataStoreStateForUAD.__WORKER_ENV_SNAPSHOT__ === 'object')
      ? dataStoreStateForUAD.__WORKER_ENV_SNAPSHOT__
      : null;
    if (!workerEnvSnapshotOwner) throw new Error('Ubergabe: FernwehContext.state.__NAV_TOTAL_SET__.__DATA_STORE_STATE__.__WORKER_ENV_SNAPSHOT__ missing');
    const uadState = (workerEnvSnapshotOwner.workerNavigatorUADataState && typeof workerEnvSnapshotOwner.workerNavigatorUADataState === 'object')
      ? workerEnvSnapshotOwner.workerNavigatorUADataState
      : Object.create(null);
    if (uadState !== workerEnvSnapshotOwner.workerNavigatorUADataState) {
      trackedDefineProperty(workerEnvSnapshotOwner, 'workerNavigatorUADataState', {
        value: uadState,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }
    const dropUadOwnIfConfigurable = (key) => {
      const ownDesc = Object.getOwnPropertyDescriptor(nativeUAD, key);
      if (!ownDesc) return;
      if (ownDesc.configurable === false) {
        throw new Error(`worker_patch_src: nativeUAD own ${key} not configurable`);
      }
      delete nativeUAD[key];
    };
    dropUadOwnIfConfigurable('brands');
    dropUadOwnIfConfigurable('mobile');
    dropUadOwnIfConfigurable('platform');
    dropUadOwnIfConfigurable('fullVersionList');
    dropUadOwnIfConfigurable('getHighEntropyValues');
    dropUadOwnIfConfigurable('toJSON');
    const dBrands = Object.getOwnPropertyDescriptor(uadProto, 'brands');
    const dMobile = Object.getOwnPropertyDescriptor(uadProto, 'mobile');
    const dPlatform = Object.getOwnPropertyDescriptor(uadProto, 'platform');
    if (!dBrands || !dMobile || !dPlatform) throw new Error('worker_patch_src: worker navigator.userAgentData descriptor missing');
    const origBrandsGet = dBrands && dBrands.get;
    const origMobileGet = dMobile && dMobile.get;
    const origPlatformGet = dPlatform && dPlatform.get;
    const uadReceivers = (typeof WeakSet === 'function' && uadState && uadState.receivers instanceof WeakSet)
      ? uadState.receivers
      : ((typeof WeakSet === 'function') ? new WeakSet() : null);
    if (uadState && uadReceivers && uadReceivers !== uadState.receivers) {
      trackedDefineProperty(uadState, 'receivers', {
        value: uadReceivers,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }
    if (uadState && uadState.proto !== uadProto) {
      trackedDefineProperty(uadState, 'proto', {
        value: uadProto,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }
    const rememberUadReceiver = (recv) => {
      if (!uadReceivers) return recv;
      if (!recv || (typeof recv !== 'object' && typeof recv !== 'function')) return recv;
      try { uadReceivers.add(recv); } catch (_e) {}
      return recv;
    };
    rememberUadReceiver(nativeUAD);
    const validateUadReceiver = (recv) => {
      if (recv === nativeUAD) return true;
      if (!recv || (typeof recv !== 'object' && typeof recv !== 'function')) return false;
      if (uadReceivers && uadReceivers.has(recv)) return true;
      const validator = (typeof origBrandsGet === 'function')
        ? origBrandsGet
        : ((typeof origMobileGet === 'function')
            ? origMobileGet
            : ((typeof origPlatformGet === 'function') ? origPlatformGet : null));
      if (typeof validator !== 'function') return false;
      Reflect.apply(validator, recv, []);
      rememberUadReceiver(recv);
      return true;
    };
    const isUadThis = (recv) => {
      try {
        return validateUadReceiver(recv);
      } catch (_e) {
        return false;
      }
    };
    const origBrandsDataValue = (dBrands
      && Object.prototype.hasOwnProperty.call(dBrands, 'value')
      && !dBrands.get
      && !dBrands.set) ? dBrands.value : undefined;
    const origMobileDataValue = (dMobile
      && Object.prototype.hasOwnProperty.call(dMobile, 'value')
      && !dMobile.get
      && !dMobile.set) ? dMobile.value : undefined;
    const origPlatformDataValue = (dPlatform
      && Object.prototype.hasOwnProperty.call(dPlatform, 'value')
      && !dPlatform.get
      && !dPlatform.set) ? dPlatform.value : undefined;
    const getBrandsRaw = function getBrands(){
                        if (!isUadThis(this)) {
                          if (typeof origBrandsGet === 'function') {
                            try {
                              return origBrandsGet.call(this);
                            } catch (e) {
                              emitDegrade('warn', 'worker_patch_src:uadata_illegal_invocation', {
                                stage: 'runtime',
                                surface: 'WorkerNavigatorUAData',
                                key: 'brands',
                                message: 'brands illegal invocation',
                                type: 'browser structure missing data',
                                data: { outcome: 'throw', reason: 'native_illegal_invocation' }
                              }, e);
                              throw e;
                            }
                          }
                          if (origBrandsDataValue !== undefined) return origBrandsDataValue;
                          throw new TypeError('Illegal invocation');
                        }
                        try {
                          if (!cache.snap) throw new Error('Ubergabe: no snap');
                          const le = cache.snap.uaData;
                          if (!le) throw new Error('Ubergabe: missing userAgentData');
                          return toBrands(le && le.brands);
                        } catch (e) {
                          emitDegrade('warn', 'worker_patch_src:uadata:getter_native_fallback', {
                            stage: 'runtime',
                            surface: 'WorkerNavigatorUAData',
                            key: 'brands',
                            message: 'brands getter fallback to native',
                            type: 'pipeline missing data',
                            data: { outcome: 'skip', reason: 'uadata_getter_native_fallback' }
                          }, e);
                          if (typeof origBrandsGet === 'function') return origBrandsGet.call(this);
                          throw e;
                        }
                      };
    const getBrands = (typeof origBrandsGet === 'function')
      ? wrapNativeAccessor(origBrandsGet, 'get brands', function(target, thisArg) {
          if (!isUadThis(thisArg)) {
            return Reflect.apply(target, thisArg, []);
          }
          return getBrandsRaw.call(thisArg);
        })
      : getBrandsRaw;
    const getMobileRaw = function getMobile(){
                        if (!isUadThis(this)) {
                          if (typeof origMobileGet === 'function') {
                            try {
                              return origMobileGet.call(this);
                            } catch (e) {
                              emitDegrade('warn', 'worker_patch_src:uadata_illegal_invocation', {
                                stage: 'runtime',
                                surface: 'WorkerNavigatorUAData',
                                key: 'mobile',
                                message: 'mobile illegal invocation',
                                type: 'browser structure missing data',
                                data: { outcome: 'throw', reason: 'native_illegal_invocation' }
                              }, e);
                              throw e;
                            }
                          }
                          if (origMobileDataValue !== undefined) return origMobileDataValue;
                          throw new TypeError('Illegal invocation');
                        }
                        try {
                          if (!cache.snap) throw new Error('Ubergabe: no snap');
                          const le = cache.snap.uaData;
                          if (!le) throw new Error('Ubergabe: missing userAgentData');
                          if (typeof le.mobile !== 'boolean') throw new Error('worker_patch_src: uaData.mobile missing');
                          return le.mobile;
                        } catch (e) {
                          emitDegrade('warn', 'worker_patch_src:uadata:getter_native_fallback', {
                            stage: 'runtime',
                            surface: 'WorkerNavigatorUAData',
                            key: 'mobile',
                            message: 'mobile getter fallback to native',
                            type: 'pipeline missing data',
                            data: { outcome: 'skip', reason: 'uadata_getter_native_fallback' }
                          }, e);
                          if (typeof origMobileGet === 'function') return origMobileGet.call(this);
                          throw e;
                        }
                      };
    const getMobile = (typeof origMobileGet === 'function')
      ? wrapNativeAccessor(origMobileGet, 'get mobile', function(target, thisArg) {
          if (!isUadThis(thisArg)) {
            return Reflect.apply(target, thisArg, []);
          }
          return getMobileRaw.call(thisArg);
        })
      : getMobileRaw;
    const getPlatformRaw = function getPlatform(){
                        if (!isUadThis(this)) {
                          if (typeof origPlatformGet === 'function') {
                            try {
                              return origPlatformGet.call(this);
                            } catch (e) {
                              emitDegrade('warn', 'worker_patch_src:uadata_illegal_invocation', {
                                stage: 'runtime',
                                surface: 'WorkerNavigatorUAData',
                                key: 'platform',
                                message: 'platform illegal invocation',
                                type: 'browser structure missing data',
                                data: { outcome: 'throw', reason: 'native_illegal_invocation' }
                              }, e);
                              throw e;
                            }
                          }
                          if (origPlatformDataValue !== undefined) return origPlatformDataValue;
                          throw new TypeError('Illegal invocation');
                        }
                        try {
                          if (!cache.snap) throw new Error('Ubergabe: no snap');
                          const envPlatform = requirePlatformTransit(cache.snap, 'uadata.platform');
                          return envPlatform.uaPlatform;
                        } catch (e) {
                          emitDegrade('warn', 'worker_patch_src:uadata:getter_native_fallback', {
                            stage: 'runtime',
                            surface: 'WorkerNavigatorUAData',
                            key: 'platform',
                            message: 'platform getter fallback to native',
                            type: 'pipeline missing data',
                            data: { outcome: 'skip', reason: 'uadata_getter_native_fallback' }
                          }, e);
                          if (typeof origPlatformGet === 'function') return origPlatformGet.call(this);
                          throw e;
                        }
                      };
    const getPlatform = (typeof origPlatformGet === 'function')
      ? wrapNativeAccessor(origPlatformGet, 'get platform', function(target, thisArg) {
          if (!isUadThis(thisArg)) {
            return Reflect.apply(target, thisArg, []);
          }
          return getPlatformRaw.call(thisArg);
        })
      : getPlatformRaw;
    trackedDefineProperties(uadProto, {
      brands:   { get: getBrands, enumerable: !!dBrands.enumerable, configurable: !!dBrands.configurable, set: dBrands.set },
      mobile:   { get: getMobile, enumerable: !!dMobile.enumerable, configurable: !!dMobile.configurable, set: dMobile.set },
      platform: { get: getPlatform, enumerable: !!dPlatform.enumerable, configurable: !!dPlatform.configurable, set: dPlatform.set },
    });
    const dFull = Object.getOwnPropertyDescriptor(uadProto, 'fullVersionList');
    const origFullGet = dFull && dFull.get;
    const origFullDataValue = (dFull
      && Object.prototype.hasOwnProperty.call(dFull, 'value')
      && !dFull.get
      && !dFull.set) ? dFull.value : undefined;
    const getFullVersionListRaw = function getFullVersionList(){
      if (!isUadThis(this)) {
        if (typeof origFullGet === 'function') {
          try {
            return origFullGet.call(this);
          } catch (e) {
            emitDegrade('warn', 'worker_patch_src:uadata_illegal_invocation', {
              stage: 'runtime',
              surface: 'WorkerNavigatorUAData',
              key: 'fullVersionList',
              message: 'fullVersionList illegal invocation',
              type: 'browser structure missing data',
              data: { outcome: 'throw', reason: 'native_illegal_invocation' }
            }, e);
            throw e;
          }
        }
        if (origFullDataValue !== undefined) return origFullDataValue;
        throw new TypeError('Illegal invocation');
      }
      try {
        if (!cache.snap) throw new Error('Ubergabe: no snap');
        const le = cache.snap.uaData;
        if (!le || !le.he) throw new Error('Ubergabe: missing userAgentData.he');
        if (!Array.isArray(le.he.fullVersionList)) throw new Error('Ubergabe: bad highEntropy.fullVersionList');
        return deep(le.he.fullVersionList);
      } catch (e) {
        emitDegrade('warn', 'worker_patch_src:uadata:getter_native_fallback', {
          stage: 'runtime',
          surface: 'WorkerNavigatorUAData',
          key: 'fullVersionList',
          message: 'fullVersionList getter fallback to native',
          type: 'pipeline missing data',
          data: { outcome: 'skip', reason: 'uadata_getter_native_fallback' }
        }, e);
        if (typeof origFullGet === 'function') return origFullGet.call(this);
        throw e;
      }
    };
    const getFullVersionList = (typeof origFullGet === 'function')
      ? wrapNativeAccessor(origFullGet, 'get fullVersionList', function(target, thisArg) {
          if (!isUadThis(thisArg)) {
            return Reflect.apply(target, thisArg, []);
          }
          return getFullVersionListRaw.call(thisArg);
        })
      : getFullVersionListRaw;
    if (dFull) {
      trackedDefineProperty(uadProto, 'fullVersionList', {
        configurable: !!dFull.configurable,
        enumerable: !!dFull.enumerable,
        get: getFullVersionList,
        set: dFull.set
      });
    }
    const dToJSON = Object.getOwnPropertyDescriptor(uadProto, 'toJSON');
    const origToJSON = dToJSON && dToJSON.value;
    const toJSONRaw = function toJSON(){
      if (!isUadThis(this)) {
        if (typeof origToJSON === 'function') {
          try {
            return origToJSON.call(this);
          } catch (e) {
            emitDegrade('warn', 'worker_patch_src:uadata_illegal_invocation', {
              stage: 'runtime',
              surface: 'WorkerNavigatorUAData',
              key: 'toJSON',
              message: 'toJSON illegal invocation',
              type: 'browser structure missing data',
              data: { outcome: 'throw', reason: 'native_illegal_invocation' }
            }, e);
            throw e;
          }
        }
        throw new TypeError('Illegal invocation');
      }
      return {brands:this.brands, mobile:this.mobile, platform:this.platform};
    };
    const toJSON = (typeof origToJSON === 'function')
      ? wrapNativeApply(origToJSON, 'toJSON', function(target, thisArg) {
          if (!isUadThis(thisArg)) {
            return Reflect.apply(target, thisArg, []);
          }
          return toJSONRaw.call(thisArg);
        })
      : toJSONRaw;
    trackedDefineProperty(uadProto, 'toJSON', {
      configurable: dToJSON ? !!dToJSON.configurable : true,
      enumerable: dToJSON ? !!dToJSON.enumerable : false,
      writable: dToJSON && Object.prototype.hasOwnProperty.call(dToJSON, 'writable') ? dToJSON.writable : true,
      value: toJSON
    });
    const dGHEV = Object.getOwnPropertyDescriptor(uadProto, 'getHighEntropyValues');
    const origGHEV = dGHEV && dGHEV.value;
    const getHighEntropyValuesRaw = function getHighEntropyValues(keys){
        if (!isUadThis(this)) {
          if (typeof origGHEV === 'function') {
            try {
              return origGHEV.call(this, keys);
            } catch (e) {
              emitDegrade('warn', 'worker_patch_src:uadata_illegal_invocation', {
                stage: 'runtime',
                surface: 'WorkerNavigatorUAData',
                key: 'getHighEntropyValues',
                message: 'getHighEntropyValues illegal invocation',
                type: 'browser structure missing data',
                data: { outcome: 'throw', reason: 'native_illegal_invocation' }
              }, e);
              throw e;
            }
          }
          throw new TypeError('Illegal invocation');
        }
        try {
          if (!cache.snap) throw new Error('Ubergabe: no snap');
          if (!Array.isArray(keys)) {
            emitDegrade('error', 'worker_patch_src:get_high_entropy_values_bad_keys', {
              stage: 'runtime',
              surface: 'WorkerNavigatorUAData',
              key: 'getHighEntropyValues',
              message: 'bad highEntropy keys',
              type: 'pipeline missing data',
              data: { outcome: 'return', reason: 'bad_keys' }
            }, null);
            return Reflect.apply(origGHEV, this, [keys]);
          }
          const nativeOut = Reflect.apply(origGHEV, this, [keys]);
          for (const k of keys) {
            if (typeof k !== 'string' || !k) {
              emitDegrade('error', 'worker_patch_src:get_high_entropy_values_bad_hint', {
                stage: 'runtime',
                surface: 'WorkerNavigatorUAData',
                key: 'getHighEntropyValues',
                message: 'bad highEntropy key item',
                type: 'pipeline missing data',
                data: { outcome: 'return', reason: 'bad_hint' }
              }, null);
              return nativeOut;
            }
          }
          if (!nativeOut || typeof nativeOut.then !== 'function') {
            emitDegrade('warn', 'worker_patch_src:get_high_entropy_values_promise_contract_failed', {
              stage: 'runtime',
              surface: 'WorkerNavigatorUAData',
              key: 'getHighEntropyValues',
              message: 'promise contract failed',
              type: 'pipeline missing data',
              data: { outcome: 'return', reason: 'promise_contract_failed' }
            }, null);
            return origGHEV.call(this, keys);
          }
          const s = cache.snap;
          const le = s.uaData;
          if (!le || typeof le !== 'object') throw new Error('Ubergabe: missing userAgentData');
          const he = le.he;
          if (!he || typeof he !== 'object') throw new Error('Ubergabe: missing userAgentData.he');
          const envPlatform = requirePlatformTransit(s, 'uadata.getHighEntropyValues');
            const map = {
            architecture: he.architecture,
            bitness: he.bitness,
            model: he.model,
            platformVersion: envPlatform.platformVersion,
            uaFullVersion: he.uaFullVersion,
            fullVersionList: he.fullVersionList,
            wow64: he.wow64,
            formFactors: he.formFactors,
          };
          const out = {};
          for (const k of keys) {
            const v = map[k];
            if (v === undefined || v === null || (typeof v === 'string' && !v && k !== 'model') || (Array.isArray(v) && !v.length)) {
              continue;
            }
            out[k] = deep(v);
          }
          return nativeOut.then(function workerGetHighEntropyValuesPost(nativeResolved) {
            try {
              const base = (nativeResolved && typeof nativeResolved === 'object') ? nativeResolved : null;
              if (!base) {
                return Object.keys(out).length ? Object.assign({}, out) : nativeResolved;
              }
              const merged = Object.assign({}, base);
              merged.brands = toBrands(le.brands);
              merged.mobile = !!le.mobile;
              merged.platform = envPlatform.uaPlatform;
              for (const k of Object.keys(out)) {
                merged[k] = out[k];
              }
              return merged;
            } catch (e) {
              emitDegrade('warn', 'worker_patch_src:get_high_entropy_values_hooks_post_failed', {
                stage: 'runtime',
                surface: 'WorkerNavigatorUAData',
                key: 'getHighEntropyValues',
                message: 'getHighEntropyValues hooksPost failed',
                type: 'pipeline missing data',
                data: { outcome: 'return', reason: 'hooks_post_failed' }
              }, e);
              return nativeResolved;
            }
          });
        } catch (e) {
          emitDegrade('error', 'worker_patch_src:get_high_entropy_values_failed', {
            stage: 'runtime',
            surface: 'WorkerNavigatorUAData',
            key: 'getHighEntropyValues',
            message: 'getHighEntropyValues failed',
            type: 'pipeline missing data',
            data: { outcome: 'throw', reason: 'get_high_entropy_values_failed' }
          }, e);
          throw e;
        }
      };
    const getHighEntropyValues = (typeof origGHEV === 'function')
      ? wrapNativeApply(origGHEV, 'getHighEntropyValues', function(target, thisArg, argList) {
          if (!isUadThis(thisArg)) {
            return Reflect.apply(target, thisArg, argList || []);
          }
          return getHighEntropyValuesRaw.apply(thisArg, argList || []);
        })
      : getHighEntropyValuesRaw;
    trackedDefineProperty(uadProto, 'getHighEntropyValues', {
      configurable: dGHEV ? !!dGHEV.configurable : true,
      enumerable: dGHEV ? !!dGHEV.enumerable : false,
      writable: dGHEV && Object.prototype.hasOwnProperty.call(dGHEV, 'writable') ? dGHEV.writable : true,
      value: getHighEntropyValues
    });

    const applyWorkerNavigatorAccessorTarget = (k, getter, diagTag) => {
      if (!nav) throw new Error(`Ubergabe: cannot define ${k} (no navigator)`);
      if (typeof getter !== 'function') {
        throw new Error(`Ubergabe: ${k} getter implementation missing`);
      }
      const resolved = resolveWorkerNavigatorNativeDescriptor(k);
      const d = resolved.desc;
      if (!d || typeof d.get !== 'function' || Object.prototype.hasOwnProperty.call(d, 'value')) {
        throw new Error(`Ubergabe: ${k} native accessor getter missing`);
      }
      if (d.configurable === false) {
        throw new Error(`Ubergabe: ${k} not configurable on proto-chain`);
      }
      const groupTag = (typeof diagTag === 'string' && diagTag) ? diagTag : `worker_patch_src:${k}`;
      const applied = applyAccessorTargets(groupTag, [{
        owner: resolved.owner,
        key: k,
        kind: 'accessor',
        wrapLayer: 'strict_accessor_gateway',
        resolve: 'proto_chain',
        policy: 'strict',
        diagTag: groupTag,
        configurable: !!d.configurable,
        enumerable: !!d.enumerable,
        validThis: function(recv) {
          return recv === nav;
        },
        invalidThis: 'native',
        defineProperty: trackedDefineProperty,
        getImpl: function workerNavigatorAccessorGet() {
          return getter.call(this);
        }
      }], 'strict');
      if (applied !== 1) {
        throw new Error(`Ubergabe: ${k} accessor target apply failed`);
      }
      __workerNavigatorPatchedOwners__[k] = resolved.owner;
      __workerNavigatorDescriptorModes__[k] = 'patched';
      return true;
    };

    const resolveWorkerNavigatorNativeDescriptor = (k) => {
      const targetOwner = (typeof WorkerNavigator !== 'undefined' && WorkerNavigator.prototype) || proto || null;
      if (!targetOwner) {
        throw new Error(`Ubergabe: cannot resolve ${k} (no WorkerNavigator.prototype)`);
      }
      let d = null;
      let resolvedOwner = null;
      for (let o = targetOwner; o; o = Object.getPrototypeOf(o)) {
        try { d = Object.getOwnPropertyDescriptor(o, k) || null; }
        catch (e) {
          d = null;
          emitDegrade('warn', 'worker_patch_src:descriptor:get_failed', {
            type: 'browser structure missing data',
            stage: 'runtime',
            module: 'WORKER_PATCH_SRC',
            surface: 'descriptor',
            key: String(k || ''),
            policy: 'skip',
            action: 'native',
            data: { outcome: 'skip', reason: 'get_own_property_descriptor_failed' }
          }, e);
        }
        if (d) {
          resolvedOwner = o;
          break;
        }
      }
      if (!d || !resolvedOwner) {
        throw new Error(`Ubergabe: ${k} native descriptor missing on proto-chain`);
      }
      return { owner: resolvedOwner, desc: d };
    };

    const readWorkerNavigatorNativeValue = (k) => {
      const resolved = resolveWorkerNavigatorNativeDescriptor(k);
      const d = resolved.desc;
      if (d && typeof d.get === 'function') {
        return { owner: resolved.owner, desc: d, value: d.get.call(nav) };
      }
      if (d
          && Object.prototype.hasOwnProperty.call(d, 'value')
          && !d.get
          && !d.set) {
        return { owner: resolved.owner, desc: d, value: d.value };
      }
      throw new Error(`Ubergabe: ${k} missing native getter on proto-chain`);
    };

    const failWorkerNavigatorSanity = (code, key, message, data) => {
      const err = new Error(message);
      emitDegrade('error', code, {
        type: 'browser structure missing data',
        stage: 'contract',
        module: 'WORKER_PATCH_SRC',
        surface: 'WorkerNavigator',
        key: key || null,
        policy: 'throw',
        action: 'throw',
        data: data || null
      }, err);
      throw err;
    };
    const sameJson = (left, right) => {
      try {
        return JSON.stringify(left) === JSON.stringify(right);
      } catch (_) {
        return false;
      }
    };
    const canonicalizeLanguageListForCompare = (value) => {
      if (!Array.isArray(value)) return null;
      const out = [];
      const seen = new Set();
      for (let i = 0; i < value.length; i += 1) {
        const entry = value[i];
        if (typeof entry !== 'string' || entry.trim() === '') return null;
        if (!seen.has(entry)) {
          seen.add(entry);
          out.push(entry);
        }
      }
      return out;
    };
    const assertWorkerNavigatorDescriptor = (k) => {
      const mode = __workerNavigatorDescriptorModes__[k] || null;
      const owner = __workerNavigatorPatchedOwners__[k]
        || (typeof WorkerNavigator !== 'undefined' && WorkerNavigator.prototype)
        || proto
        || null;
      if (!owner) {
        failWorkerNavigatorSanity(
          'worker_patch_src:workernavigator_descriptor:sanity:owner_missing',
          k,
          `Ubergabe: ${k} descriptor owner missing`
        );
      }
      let d = null;
      try { d = Object.getOwnPropertyDescriptor(owner, k) || null; }
      catch (e) {
        d = null;
        emitDegrade('warn', 'worker_patch_src:descriptor:get_failed', {
          type: 'browser structure missing data',
          stage: 'runtime',
          module: 'WORKER_PATCH_SRC',
          surface: 'descriptor',
          key: String(k || ''),
          policy: 'skip',
          action: 'native',
          data: { outcome: 'skip', reason: 'get_own_property_descriptor_failed' }
        }, e);
      }
      if (!d) {
        failWorkerNavigatorSanity(
          'worker_patch_src:workernavigator_descriptor:sanity:missing',
          k,
          `Ubergabe: ${k} descriptor missing after apply`
        );
      }
      const hasGetter = typeof d.get === 'function';
      const hasValue = Object.prototype.hasOwnProperty.call(d, 'value');
      const hasOwnOnNavigator = !!Object.getOwnPropertyDescriptor(nav, k);
      if (mode === 'native_skip') {
        const hasDescriptorSurface = hasGetter || hasValue;
        if (!hasDescriptorSurface || (hasGetter && hasValue) || hasOwnOnNavigator) {
          failWorkerNavigatorSanity(
            'worker_patch_src:workernavigator_descriptor:sanity:mismatch',
            k,
            `Ubergabe: ${k} descriptor shape mismatch`,
            {
              mode,
              hasGetter,
              hasSetter: typeof d.set === 'function',
              hasValue,
              hasOwnOnNavigator,
              configurable: !!d.configurable,
              enumerable: !!d.enumerable
            }
          );
        }
        return;
      }
      if (!hasGetter || hasValue || hasOwnOnNavigator) {
        failWorkerNavigatorSanity(
          'worker_patch_src:workernavigator_descriptor:sanity:mismatch',
          k,
          `Ubergabe: ${k} descriptor shape mismatch`,
          {
            mode,
            hasGetter,
            hasSetter: typeof d.set === 'function',
            hasValue,
            hasOwnOnNavigator,
            configurable: !!d.configurable,
            enumerable: !!d.enumerable
          }
        );
      }
    };


    {
      const resolvedUserAgentData = resolveWorkerNavigatorNativeDescriptor('userAgentData');
      __workerNavigatorPatchedOwners__['userAgentData'] = resolvedUserAgentData.owner;
      __workerNavigatorDescriptorModes__['userAgentData'] = 'native_skip';
    }
    const getLanguage = function getLanguage(){
      const snap = requireSnap(cache.snap, 'getLanguage');
      return String(snap.language);
    };
    let __patchLanguage = false;
    try {
      const nativeLanguageResolved = readWorkerNavigatorNativeValue('language');
      const nativeLanguage = nativeLanguageResolved.value;
      __workerNavigatorPatchedOwners__['language'] = nativeLanguageResolved.owner;
      if (typeof nativeLanguage === 'string' && nativeLanguage.trim() !== '') {
        const profileLanguage = cache.snap.language;
        __workerNavigatorDescriptorModes__['language'] = 'native_skip';
        if (nativeLanguage === profileLanguage) {
          emitDegrade('info', 'worker_patch_src:workernavigator_descriptor:language_getter_value_match', {
            type: 'browser structure missing data',
            stage: 'preflight',
            module: 'WORKER_PATCH_SRC',
            surface: 'WorkerNavigator',
            key: 'language',
            policy: 'skip',
            action: 'native',
            data: {
              outcome: 'return',
              reason: 'getter_value_match',
              nativeValue: nativeLanguage,
              profileValue: profileLanguage,
              scope: __workerScopeMarker__
            }
          }, null);
        } else {
          emitDegrade('warn', 'worker_patch_src:workernavigator_descriptor:language_getter_value_mismatch', {
            type: 'browser structure missing data',
            stage: 'preflight',
            module: 'WORKER_PATCH_SRC',
            surface: 'WorkerNavigator',
            key: 'language',
            policy: 'skip',
            action: 'keep_native_getter',
            data: {
              outcome: 'skip',
              reason: 'getter_value_mismatch',
              nativeValue: nativeLanguage,
              profileValue: profileLanguage,
              scope: __workerScopeMarker__
            }
          }, null);
        }
      } else {
        __patchLanguage = true;
        __workerNavigatorDescriptorModes__['language'] = 'patched_accessor';
        emitDegrade('warn', 'worker_patch_src:workernavigator_descriptor:language_native_invalid', {
          type: 'browser structure missing data',
          stage: 'preflight',
          module: 'WORKER_PATCH_SRC',
          surface: 'WorkerNavigator',
          key: 'language',
          policy: 'patch',
          action: 'patch_getter',
          data: {
            outcome: 'patch',
            reason: 'native_invalid',
            nativeValue: nativeLanguage,
            profileValue: cache.snap.language,
            scope: __workerScopeMarker__
          }
        }, null);
      }
    } catch (e) {
      __patchLanguage = true;
      __workerNavigatorDescriptorModes__['language'] = 'patched_accessor';
      emitDegrade('warn', 'worker_patch_src:workernavigator_descriptor:compare_failed', {
        type: 'browser structure missing data',
        stage: 'runtime',
        module: 'WORKER_PATCH_SRC',
        surface: 'WorkerNavigator',
        key: 'language',
        policy: 'patch',
        action: 'patch_getter',
        data: { outcome: 'patch', reason: 'native_compare_failed' }
      }, e);
    }
    if (__patchLanguage) {
      applyWorkerNavigatorAccessorTarget('language', getLanguage, 'worker_patch_src:language');
    }
    const getLanguages = function getLanguages(){
      const snap = requireSnap(cache.snap, 'getLanguages');
      if (!Array.isArray(snap.languages)) throw new Error('Ubergabe: bad languages');
      return snap.languages.slice();
    };
    let __patchLanguages = false;
    try {
      const nativeLanguagesResolved = readWorkerNavigatorNativeValue('languages');
      const nativeLanguages = nativeLanguagesResolved.value;
      __workerNavigatorPatchedOwners__['languages'] = nativeLanguagesResolved.owner;
      if (Array.isArray(nativeLanguages)
          && nativeLanguages.length > 0
          && nativeLanguages.every(function(value) { return typeof value === 'string' && value.trim() !== ''; })) {
        const profileLanguages = Array.isArray(cache.snap.languages) ? cache.snap.languages.slice() : cache.snap.languages;
        if (sameJson(nativeLanguages, profileLanguages)) {
          __workerNavigatorDescriptorModes__['languages'] = 'native_skip';
          emitDegrade('info', 'worker_patch_src:workernavigator_descriptor:languages_getter_value_match', {
            type: 'browser structure missing data',
            stage: 'preflight',
            module: 'WORKER_PATCH_SRC',
            surface: 'WorkerNavigator',
            key: 'languages',
            policy: 'skip',
            action: 'native',
            data: {
              outcome: 'return',
              reason: 'getter_value_match',
              nativeValue: nativeLanguages.slice(),
              profileValue: profileLanguages,
              scope: __workerScopeMarker__
            }
          }, null);
        } else {
          const nativeCanonical = canonicalizeLanguageListForCompare(nativeLanguages);
          const profileCanonical = canonicalizeLanguageListForCompare(profileLanguages);
          if (nativeCanonical && profileCanonical && sameJson(nativeCanonical, profileCanonical)) {
            __workerNavigatorDescriptorModes__['languages'] = 'native_skip';
            emitDegrade('info', 'worker_patch_src:workernavigator_descriptor:profile_languages_canonicalized', {
              type: 'browser structure missing data',
              stage: 'preflight',
              module: 'WORKER_PATCH_SRC',
              surface: 'WorkerNavigator',
              key: 'languages',
              policy: 'skip',
              action: 'native',
              data: {
                outcome: 'skip',
                reason: 'profile_languages_canonicalized',
                nativeValue: nativeLanguages.slice(),
                profileValue: Array.isArray(profileLanguages) ? profileLanguages.slice() : profileLanguages,
                canonicalNativeValue: nativeCanonical,
                canonicalProfileValue: profileCanonical,
                scope: __workerScopeMarker__
              }
            }, null);
          } else {
            __workerNavigatorDescriptorModes__['languages'] = 'native_skip';
            emitDegrade('warn', 'worker_patch_src:workernavigator_descriptor:languages_getter_value_mismatch', {
              type: 'browser structure missing data',
              stage: 'preflight',
              module: 'WORKER_PATCH_SRC',
              surface: 'WorkerNavigator',
              key: 'languages',
              policy: 'skip',
              action: 'keep_native_getter',
              data: {
                outcome: 'skip',
                reason: 'getter_value_mismatch',
                nativeValue: nativeLanguages.slice(),
                profileValue: Array.isArray(profileLanguages) ? profileLanguages.slice() : profileLanguages,
                scope: __workerScopeMarker__
              }
            }, null);
          }
        }
      } else {
        __patchLanguages = true;
        __workerNavigatorDescriptorModes__['languages'] = 'patched_accessor';
        emitDegrade('warn', 'worker_patch_src:workernavigator_descriptor:languages_native_invalid', {
          type: 'browser structure missing data',
          stage: 'preflight',
          module: 'WORKER_PATCH_SRC',
          surface: 'WorkerNavigator',
          key: 'languages',
          policy: 'patch',
          action: 'patch_getter',
          data: {
            outcome: 'patch',
            reason: 'native_invalid',
            nativeValue: nativeLanguages,
            profileValue: Array.isArray(cache.snap.languages) ? cache.snap.languages.slice() : cache.snap.languages,
            scope: __workerScopeMarker__
          }
        }, null);
      }
    } catch (e) {
      __patchLanguages = true;
      __workerNavigatorDescriptorModes__['languages'] = 'patched_accessor';
      emitDegrade('warn', 'worker_patch_src:workernavigator_descriptor:compare_failed', {
        type: 'browser structure missing data',
        stage: 'runtime',
        module: 'WORKER_PATCH_SRC',
        surface: 'WorkerNavigator',
        key: 'languages',
        policy: 'patch',
        action: 'patch_getter',
        data: { outcome: 'patch', reason: 'native_compare_failed' }
      }, e);
    }
    if (__patchLanguages) {
      applyWorkerNavigatorAccessorTarget('languages', getLanguages, 'worker_patch_src:languages');
    }


    const getDeviceMemory = function getDeviceMemory(){
      if (!cache.snap) throw new Error('Ubergabe: no snap');
      const v = Number(cache.snap.deviceMemory);
      if (!Number.isFinite(v)) throw new Error('Ubergabe: bad deviceMemory');
      return v;
    };
    let __patchDeviceMemory = true;
    try {
      const nativeDeviceMemoryResolved = readWorkerNavigatorNativeValue('deviceMemory');
      const nativeDeviceMemory = Number(nativeDeviceMemoryResolved.value);
      if (Number.isFinite(nativeDeviceMemory)) {
        cache.snap.deviceMemory = nativeDeviceMemory;
        __workerNavigatorPatchedOwners__['deviceMemory'] = nativeDeviceMemoryResolved.owner;
        __workerNavigatorDescriptorModes__['deviceMemory'] = 'native_passthrough';
        __patchDeviceMemory = false;
        emitDegrade('info', 'worker_patch_src:workernavigator_descriptor:native_passthrough', {
          type: 'browser structure missing data',
          stage: 'preflight',
          module: 'WORKER_PATCH_SRC',
          surface: 'WorkerNavigator',
          key: 'deviceMemory',
          policy: 'skip',
          action: 'native',
          data: { outcome: 'skip', reason: 'native_passthrough', nativeValue: nativeDeviceMemory }
        });
      }
    } catch (e) {
      emitDegrade('warn', 'worker_patch_src:workernavigator_descriptor:compare_failed', {
        type: 'browser structure missing data',
        stage: 'runtime',
        module: 'WORKER_PATCH_SRC',
        surface: 'WorkerNavigator',
        key: 'deviceMemory',
        policy: 'skip',
        action: 'native',
        data: { outcome: 'skip', reason: 'native_compare_failed' }
      }, e);
    }
    if (__patchDeviceMemory) {
      emitDegrade('warn', 'worker_patch_src:workernavigator_descriptor:native_passthrough_unresolved', {
        type: 'browser structure missing data',
        stage: 'preflight',
        module: 'WORKER_PATCH_SRC',
        surface: 'WorkerNavigator',
        key: 'deviceMemory',
        policy: 'skip',
        action: 'native',
        data: { outcome: 'skip', reason: 'native_passthrough_unresolved' }
      }, null);
    }

    const getHardwareConcurrency = function getHardwareConcurrency(){
      if (!cache.snap) throw new Error('Ubergabe: no snap');
      const v = Number(cache.snap.hardwareConcurrency);
      if (!Number.isFinite(v)) throw new Error('Ubergabe: bad hardwareConcurrency');
      return v;
    };
    let __patchHardwareConcurrency = false;
    try {
      const nativeHardwareConcurrencyResolved = readWorkerNavigatorNativeValue('hardwareConcurrency');
      const nativeHardwareConcurrency = Number(nativeHardwareConcurrencyResolved.value);
      __workerNavigatorPatchedOwners__['hardwareConcurrency'] = nativeHardwareConcurrencyResolved.owner;
      if (Number.isFinite(nativeHardwareConcurrency) && nativeHardwareConcurrency > 0) {
        const profileHardwareConcurrency = Number(cache.snap.hardwareConcurrency);
        __workerNavigatorDescriptorModes__['hardwareConcurrency'] = 'native_skip';
        if (Object.is(nativeHardwareConcurrency, profileHardwareConcurrency)) {
          emitDegrade('info', 'worker_patch_src:workernavigator_descriptor:hardwareConcurrency_native_descriptor_match', {
            type: 'browser structure missing data',
            stage: 'preflight',
            module: 'WORKER_PATCH_SRC',
            surface: 'WorkerNavigator',
            key: 'hardwareConcurrency',
            policy: 'skip',
            action: 'native',
            data: {
              outcome: 'return',
              reason: 'native_descriptor_match',
              nativeValue: nativeHardwareConcurrency,
              profileValue: profileHardwareConcurrency,
              scope: __workerScopeMarker__
            }
          }, null);
        } else {
          emitDegrade('warn', 'worker_patch_src:workernavigator_descriptor:hardwareConcurrency_native_profile_mismatch_keep_native_getter', {
            type: 'browser structure missing data',
            stage: 'preflight',
            module: 'WORKER_PATCH_SRC',
            surface: 'WorkerNavigator',
            key: 'hardwareConcurrency',
            policy: 'skip',
            action: 'keep_native_getter',
            data: {
              outcome: 'skip',
              reason: 'getter_value_mismatch',
              nativeValue: nativeHardwareConcurrency,
              profileValue: profileHardwareConcurrency,
              scope: __workerScopeMarker__
            }
          }, null);
        }
      } else {
        __patchHardwareConcurrency = true;
        __workerNavigatorDescriptorModes__['hardwareConcurrency'] = 'patched_accessor';
        emitDegrade('warn', 'worker_patch_src:workernavigator_descriptor:hardwareConcurrency_native_invalid', {
          type: 'browser structure missing data',
          stage: 'preflight',
          module: 'WORKER_PATCH_SRC',
          surface: 'WorkerNavigator',
          key: 'hardwareConcurrency',
          policy: 'patch',
          action: 'patch_getter',
          data: {
            outcome: 'patch',
            reason: 'native_invalid',
            nativeValue: nativeHardwareConcurrencyResolved.value,
            profileValue: Number(cache.snap.hardwareConcurrency),
            scope: __workerScopeMarker__
          }
        }, null);
      }
    } catch (e) {
      __patchHardwareConcurrency = true;
      __workerNavigatorDescriptorModes__['hardwareConcurrency'] = 'patched_accessor';
      emitDegrade('warn', 'worker_patch_src:workernavigator_descriptor:compare_failed', {
        type: 'browser structure missing data',
        stage: 'runtime',
        module: 'WORKER_PATCH_SRC',
        surface: 'WorkerNavigator',
        key: 'hardwareConcurrency',
        policy: 'patch',
        action: 'patch_getter',
        data: { outcome: 'patch', reason: 'native_compare_failed' }
      }, e);
    }
    if (__patchHardwareConcurrency) {
      applyWorkerNavigatorAccessorTarget('hardwareConcurrency', getHardwareConcurrency, 'worker_patch_src:hardwareConcurrency');
    }
    assertWorkerNavigatorDescriptor('userAgentData');
    assertWorkerNavigatorDescriptor('language');
    assertWorkerNavigatorDescriptor('languages');
    assertWorkerNavigatorDescriptor('deviceMemory');
    assertWorkerNavigatorDescriptor('hardwareConcurrency');

    const requireWebGLSnapshot = (s, where) => {
      const snap = requireSnap(s, where);
      const webgl = snap && snap.webgl;
      if (!webgl || typeof webgl !== 'object') throw new Error('Ubergabe: missing webgl');
      if (typeof webgl.vendor !== 'string' || !webgl.vendor) throw new Error('Ubergabe: bad webgl.vendor');
      if (typeof webgl.renderer !== 'string' || !webgl.renderer) throw new Error('Ubergabe: bad webgl.renderer');
      if (typeof webgl.unmaskedVendor !== 'string' || !webgl.unmaskedVendor) throw new Error('Ubergabe: bad webgl.unmaskedVendor');
      if (typeof webgl.unmaskedRenderer !== 'string' || !webgl.unmaskedRenderer) throw new Error('Ubergabe: bad webgl.unmaskedRenderer');
      return webgl;
    };

    const installWorkerWebGLMirror = () => {
      requireWebGLSnapshot(cache.snap, 'webgl_init');
      const OffscreenCanvasCtor = (typeof self.OffscreenCanvas === 'function') ? self.OffscreenCanvas : null;
      if (!OffscreenCanvasCtor || !OffscreenCanvasCtor.prototype) {
        trackedDefineProperty(self, '__WORKER_WEBGL_MIRROR_INSTALLED__', {
          value: true,
          writable: true,
          configurable: true,
          enumerable: false
        });
        return;
      }
      const oscProto = OffscreenCanvasCtor.prototype;
      const dGetContext = Object.getOwnPropertyDescriptor(oscProto, 'getContext');
      if (!dGetContext || dGetContext.configurable === false || typeof dGetContext.value !== 'function') {
        throw new Error('Ubergabe: OffscreenCanvas.getContext descriptor missing');
      }
      const nativeGetContext = dGetContext.value;
      const patchedContexts = (typeof WeakSet === 'function') ? new WeakSet() : null;
      const debugInfoCache = (typeof WeakMap === 'function') ? new WeakMap() : null;
      if (!patchedContexts || !debugInfoCache) {
        throw new Error('Ubergabe: worker WebGL weak structures missing');
      }

      const patchContextInstance = (ctx) => {
        if (!ctx || (typeof ctx !== 'object' && typeof ctx !== 'function')) return ctx;
        if (patchedContexts.has(ctx)) return ctx;
        patchedContexts.add(ctx);

        const dGetParameter = Object.getOwnPropertyDescriptor(ctx, 'getParameter');
        const origGetParameter = (dGetParameter && typeof dGetParameter.value === 'function')
          ? dGetParameter.value
          : (typeof ctx.getParameter === 'function' ? ctx.getParameter : null);
        if (!origGetParameter) throw new Error('Ubergabe: worker WebGL getParameter missing');

        const dGetExtension = Object.getOwnPropertyDescriptor(ctx, 'getExtension');
        const origGetExtension = (dGetExtension && typeof dGetExtension.value === 'function')
          ? dGetExtension.value
          : (typeof ctx.getExtension === 'function' ? ctx.getExtension : null);

        if (typeof origGetExtension === 'function') {
          const wrappedGetExtensionRaw = function getExtension(name) {
            const ext = Reflect.apply(origGetExtension, this, arguments);
            if (name === 'WEBGL_debug_renderer_info') {
              debugInfoCache.set(this, ext || null);
            }
            return ext;
          };
          const wrappedGetExtension = wrapNativeApply(origGetExtension, 'getExtension', function(target, thisArg, argList) {
            return wrappedGetExtensionRaw.apply(thisArg, argList || []);
          });
          trackedDefineProperty(ctx, 'getExtension', {
            configurable: dGetExtension ? !!dGetExtension.configurable : true,
            enumerable: dGetExtension ? !!dGetExtension.enumerable : false,
            writable: dGetExtension && Object.prototype.hasOwnProperty.call(dGetExtension, 'writable') ? dGetExtension.writable : true,
            value: wrappedGetExtension
          });
        }

        const wrappedGetParameterRaw = function getParameter(pname) {
          const live = requireWebGLSnapshot(cache.snap, 'webgl_runtime');
          let dbg = debugInfoCache.has(this) ? debugInfoCache.get(this) : undefined;
          if (dbg === undefined) {
            dbg = null;
            if (typeof origGetExtension === 'function') {
              try {
                dbg = Reflect.apply(origGetExtension, this, ['WEBGL_debug_renderer_info']);
              } catch (_) {
                dbg = null;
              }
            }
            debugInfoCache.set(this, dbg);
          }
          if (dbg) {
            if (pname === dbg.UNMASKED_VENDOR_WEBGL) return live.unmaskedVendor;
            if (pname === dbg.UNMASKED_RENDERER_WEBGL) return live.unmaskedRenderer;
          }
          if (pname === this.VENDOR || pname === 0x1F00) return live.vendor;
          if (pname === this.RENDERER || pname === 0x1F01) return live.renderer;
          return Reflect.apply(origGetParameter, this, arguments);
        };
        const wrappedGetParameter = wrapNativeApply(origGetParameter, 'getParameter', function(target, thisArg, argList) {
          return wrappedGetParameterRaw.apply(thisArg, argList || []);
        });
        trackedDefineProperty(ctx, 'getParameter', {
          configurable: dGetParameter ? !!dGetParameter.configurable : true,
          enumerable: dGetParameter ? !!dGetParameter.enumerable : false,
          writable: dGetParameter && Object.prototype.hasOwnProperty.call(dGetParameter, 'writable') ? dGetParameter.writable : true,
          value: wrappedGetParameter
        });
        return ctx;
      };

      const wrappedGetContextRaw = function getContext(kind) {
        const res = Reflect.apply(nativeGetContext, this, arguments);
        if (!res) return res;
        if (kind === 'webgl' || kind === 'webgl2' || kind === 'experimental-webgl') {
          return patchContextInstance(res);
        }
        return res;
      };
      const wrappedGetContext = wrapNativeApply(nativeGetContext, 'getContext', function(target, thisArg, argList) {
        return wrappedGetContextRaw.apply(thisArg, argList || []);
      });
      trackedDefineProperty(oscProto, 'getContext', {
        configurable: !!dGetContext.configurable,
        enumerable: !!dGetContext.enumerable,
        writable: dGetContext && Object.prototype.hasOwnProperty.call(dGetContext, 'writable') ? dGetContext.writable : true,
        value: wrappedGetContext
      });
      trackedDefineProperty(self, '__WORKER_WEBGL_MIRROR_INSTALLED__', {
        value: true,
        writable: true,
        configurable: true,
        enumerable: false
      });
    };
    installWorkerWebGLMirror();

    const resolveWorkerCanvasPatchSources = () => {
      const runtimeRoot = __resolveWorkerWrkRuntimeRoot__();
      const inlineCoreWindow = runtimeRoot && runtimeRoot.inlineCoreWindow;
      const inlinePrng = runtimeRoot && runtimeRoot.inlinePrng;
      const inlineCanvasPatch = runtimeRoot && runtimeRoot.inlineCanvasPatch;
      const inlineFernwehContext = runtimeRoot && runtimeRoot.inlineFernwehContext;
      if (typeof inlineCoreWindow !== 'string' || !inlineCoreWindow) {
        throw new Error('Ubergabe: inlineCoreWindow missing');
      }
      if (typeof inlinePrng !== 'string' || !inlinePrng) {
        throw new Error('Ubergabe: inlinePrng missing');
      }
      if (typeof inlineCanvasPatch !== 'string' || !inlineCanvasPatch) {
        throw new Error('Ubergabe: inlineCanvasPatch missing');
      }
      if (typeof inlineFernwehContext !== 'string' || !inlineFernwehContext) {
        throw new Error('Ubergabe: inlineFernwehContext missing');
      }
      return {
        runtimeRoot,
        inlineCoreWindow,
        inlinePrng,
        inlineCanvasPatch,
        inlineFernwehContext
      };
    };

    const executeWorkerInlineModule = (source, exportName, label) => {
      if (typeof source !== 'string' || !source) {
        throw new Error('Ubergabe: ' + String(label || exportName || 'inlineModule') + ' source missing');
      }
      const runner = new Function('window', source + '\nreturn (typeof ' + exportName + ' === "function") ? ' + exportName + '(window) : null;');
      try {
        return runner(self);
      } finally {
        try {
          const d = Object.getOwnPropertyDescriptor(self, exportName);
          if (d && d.configurable !== false) {
            delete self[exportName];
          }
        } catch (_) {}
      }
    };
    const syncWorkerEnvProfileState = stateRoot => {
      if (!stateRoot || typeof stateRoot !== 'object') {
        throw new Error('Ubergabe: FernwehContext.state missing for envProfile sync');
      }
      const snap = requireSnap(cache.snap, 'env_profile_sync');
      const envProfileSnap = snap.envProfile;
      const envProfileRoot = (stateRoot.__ENV_PROFILE__ && typeof stateRoot.__ENV_PROFILE__ === 'object')
        ? stateRoot.__ENV_PROFILE__
        : null;
      if (!(envProfileRoot && typeof envProfileRoot === 'object')) {
        throw new Error('Ubergabe: FernwehContext.state.__ENV_PROFILE__ missing');
      }
      const cloneEnvProfileValue = value => {
        if (Array.isArray(value)) {
          const out = [];
          for (let i = 0; i < value.length; i++) out.push(cloneEnvProfileValue(value[i]));
          return out;
        }
        if (value && typeof value === 'object') {
          const out = Object.create(null);
          const keys = Object.keys(value);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            out[key] = cloneEnvProfileValue(value[key]);
          }
          return out;
        }
        return value;
      };
      const prevKeys = Object.keys(envProfileRoot);
      for (let i = 0; i < prevKeys.length; i++) {
        delete envProfileRoot[prevKeys[i]];
      }
      const nextKeys = Object.keys(envProfileSnap);
      for (let i = 0; i < nextKeys.length; i++) {
        const key = nextKeys[i];
        envProfileRoot[key] = cloneEnvProfileValue(envProfileSnap[key]);
      }
      return envProfileRoot;
    };

    const syncWorkerScreenState = stateRoot => {
      if (!stateRoot || typeof stateRoot !== 'object') {
        throw new Error('Ubergabe: FernwehContext.state missing for screen sync');
      }

      const snap = requireSnap(cache.snap, 'screen_sync');
      const screenSnap = snap.screen;

      const screenRoot = (stateRoot.__SCREEN__ && typeof stateRoot.__SCREEN__ === 'object')
        ? stateRoot.__SCREEN__
        : null;

      if (!(screenRoot && typeof screenRoot === 'object')) {
        throw new Error('Ubergabe: FernwehContext.state.__SCREEN__ missing');
      }

      const cloneScreenValue = value => {
        if (Array.isArray(value)) {
          const out = [];
          for (let i = 0; i < value.length; i++) out.push(cloneScreenValue(value[i]));
          return out;
        }
        if (value && typeof value === 'object') {
          const out = Object.create(null);
          const keys = Object.keys(value);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            out[key] = cloneScreenValue(value[key]);
          }
          return out;
        }
        return value;
      };

      const prevKeys = Object.keys(screenRoot);
      for (let i = 0; i < prevKeys.length; i++) {
        delete screenRoot[prevKeys[i]];
      }

      const nextKeys = Object.keys(screenSnap);
      for (let i = 0; i < nextKeys.length; i++) {
        const key = nextKeys[i];
        screenRoot[key] = cloneScreenValue(screenSnap[key]);
      }

      return screenRoot;
    };

    const restoreWorkerFontsState = stateRoot => {
      if (!stateRoot || typeof stateRoot !== 'object') {
        throw new Error('Ubergabe: FernwehContext.state missing for fonts restore');
      }
      const snap = (cache.snap && cache.snap.fontsState && typeof cache.snap.fontsState === 'object')
        ? cache.snap.fontsState
        : null;
      const cfgSnap = (cache.snap && cache.snap.fontsConfig && typeof cache.snap.fontsConfig === 'object')
        ? cache.snap.fontsConfig
        : null;
      if (!snap && !cfgSnap) return false;
      const fontsRoot = (stateRoot.__FONTS__ && typeof stateRoot.__FONTS__ === 'object')
        ? stateRoot.__FONTS__
        : null;
      if (!(fontsRoot && typeof fontsRoot === 'object')) {
        throw new Error('Ubergabe: FernwehContext.state.__FONTS__ missing');
      }
      const ensureFontsSubSlot = key => {
        const existing = (fontsRoot[key] && typeof fontsRoot[key] === 'object')
          ? fontsRoot[key]
          : null;
        if (!existing) {
          throw new Error('Ubergabe: FernwehContext.state.__FONTS__.' + key + ' missing');
        }
        return existing;
      };
      if (snap) {
        const fontsState = ensureFontsSubSlot('__STATE__');
        const familySnapshot = (snap.familySnapshot && typeof snap.familySnapshot === 'object')
          ? snap.familySnapshot
          : null;
        const prevAwaitResolve = (fontsState && typeof fontsState.awaitReadyResolve === 'function')
          ? fontsState.awaitReadyResolve
          : null;
        const snapStatus = (typeof snap.awaitReadyStatus === 'string' && snap.awaitReadyStatus)
          ? snap.awaitReadyStatus
          : (snap.awaitReadyPending ? 'pending' : (snap.ready === true ? 'resolved' : null));
        const awaitPayload = {
          scope: __workerScopeName__ || null,
          source: 'snapshot',
          ready: snap.ready === true,
          status: snapStatus,
          error: Object.prototype.hasOwnProperty.call(snap, 'error') ? snap.error : null
        };
        let awaitReadyValue = null;
        let awaitReadyResolve = null;
        let awaitReadyReject = null;
        if (snapStatus === 'pending') {
          awaitReadyValue = new Promise((resolve, reject) => {
            awaitReadyResolve = resolve;
            awaitReadyReject = reject;
          });
        } else if (snapStatus) {
          awaitReadyValue = Promise.resolve(awaitPayload);
        }
        if (prevAwaitResolve && snapStatus && snapStatus !== 'pending') {
          prevAwaitResolve(awaitPayload);
        }
        trackedDefineProperty(fontsState, 'ready', {
          value: snap.ready === true,
          writable: true,
          configurable: true,
          enumerable: true
        });
        trackedDefineProperty(fontsState, 'error', {
          value: Object.prototype.hasOwnProperty.call(snap, 'error') ? snap.error : null,
          writable: true,
          configurable: true,
          enumerable: true
        });
        trackedDefineProperty(fontsState, 'awaitReady', {
          value: awaitReadyValue,
          writable: true,
          configurable: true,
          enumerable: true
        });
        trackedDefineProperty(fontsState, 'awaitReadyStatus', {
          value: snapStatus,
          writable: true,
          configurable: true,
          enumerable: true
        });
        trackedDefineProperty(fontsState, 'awaitReadyResolve', {
          value: awaitReadyResolve,
          writable: true,
          configurable: true,
          enumerable: true
        });
        trackedDefineProperty(fontsState, 'awaitReadyReject', {
          value: awaitReadyReject,
          writable: true,
          configurable: true,
          enumerable: true
        });
        trackedDefineProperty(fontsState, 'familySnapshot', {
          value: {
            allowedFamilies: Array.isArray(familySnapshot && familySnapshot.allowedFamilies)
              ? new Set(familySnapshot.allowedFamilies)
              : null,
            runtimeFamilies: Array.isArray(familySnapshot && familySnapshot.runtimeFamilies)
              ? new Set(familySnapshot.runtimeFamilies)
              : new Set(),
            platformDom: familySnapshot && Object.prototype.hasOwnProperty.call(familySnapshot, 'platformDom')
              ? familySnapshot.platformDom
              : null,
            versionToken: familySnapshot && Object.prototype.hasOwnProperty.call(familySnapshot, 'versionToken')
              ? familySnapshot.versionToken
              : null
          },
          writable: true,
          configurable: true,
          enumerable: true
        });
      }
      if (cfgSnap) {
        const fontsConfig = ensureFontsSubSlot('__CONFIG__');
        trackedDefineProperty(fontsConfig, 'configs', {
          value: Array.isArray(cfgSnap.configs) ? cfgSnap.configs.slice() : [],
          writable: true,
          configurable: true,
          enumerable: true
        });
      }
      return true;
    };

    const installWorkerCanvasPipeline = () => {
      const existingCanvasState = (self.FernwehContext
        && typeof self.FernwehContext === 'object'
        && self.FernwehContext.state
        && typeof self.FernwehContext.state === 'object'
        && self.FernwehContext.state.__CANVAS__
        && typeof self.FernwehContext.state.__CANVAS__ === 'object'
        && self.FernwehContext.state.__CANVAS__.__STATE__
        && typeof self.FernwehContext.state.__CANVAS__.__STATE__ === 'object')
        ? self.FernwehContext.state.__CANVAS__.__STATE__
        : null;
      if (existingCanvasState && existingCanvasState.__WORKER_CANVAS_PATCH_INSTALLED__ === true) return true;

      const sources = resolveWorkerCanvasPatchSources();
      const runtimeRoot = sources.runtimeRoot;
      const C = (self.FernwehContext && typeof self.FernwehContext === 'object')
        ? self.FernwehContext
        : null;
      const stateRoot = (C && C.state && typeof C.state === 'object')
        ? C.state
        : null;

      const seed = (self.CDP_GLOBAL_SEED != null) ? String(self.CDP_GLOBAL_SEED) : '';
      if (!seed) {
        throw new Error('Ubergabe: worker canvas seed missing');
      }
      if (!(stateRoot && typeof stateRoot === 'object')) {
        throw new Error('Ubergabe: FernwehContext.state missing');
      }

      syncWorkerEnvProfileState(stateRoot);
      syncWorkerScreenState(stateRoot);
      restoreWorkerFontsState(stateRoot);

      executeWorkerInlineModule(sources.inlineCoreWindow, 'CoreWindowModule', 'inlineCoreWindow');
      executeWorkerInlineModule(sources.inlinePrng, 'RNGsetModule', 'inlinePrng');
      executeWorkerInlineModule(sources.inlineCanvasPatch, 'CanvasPatchModule', 'inlineCanvasPatch');
      executeWorkerInlineModule(sources.inlineFernwehContext, 'ContextPatchModule', 'inlineFernwehContext');

      const Core = (self.Core && typeof self.Core === 'object')
        ? self.Core
        : null;
      if (!Core) {
        throw new Error('Ubergabe: worker Core missing after inline install');
      }
      const coreInternal = (Core.__internal && typeof Core.__internal === 'object')
        ? Core.__internal
        : null;
      if (!coreInternal) {
        throw new Error('Ubergabe: worker Core.__internal missing after inline install');
      }
      const prngRoot = (coreInternal.prng && typeof coreInternal.prng === 'object')
        ? coreInternal.prng
        : null;
      if (!prngRoot) {
        throw new Error('Ubergabe: worker Core.__internal.prng missing after inline install');
      }
      if (runtimeRoot && runtimeRoot.__CORE_TOSTRING_STATE__ && coreInternal.coreToStringState !== runtimeRoot.__CORE_TOSTRING_STATE__) {
        trackedDefineProperty(coreInternal, 'coreToStringState', {
          value: runtimeRoot.__CORE_TOSTRING_STATE__,
          writable: true,
          configurable: true,
          enumerable: false
        });
      }
      const canvasRoot = (stateRoot.__CANVAS__ && typeof stateRoot.__CANVAS__ === 'object')
        ? stateRoot.__CANVAS__
        : null;
      if (!(canvasRoot && typeof canvasRoot === 'object')) {
        throw new Error('Ubergabe: FernwehContext.state.__CANVAS__ missing');
      }
      const fernwehState = (canvasRoot.__STATE__ && typeof canvasRoot.__STATE__ === 'object')
        ? canvasRoot.__STATE__
        : null;
      if (!(fernwehState && typeof fernwehState === 'object')) {
        throw new Error('Ubergabe: FernwehContext.state.__CANVAS__.__STATE__ missing');
      }

      const hooks = (self.FernwehHooks && typeof self.FernwehHooks === 'object')
        ? self.FernwehHooks
        : null;
      const patchCtx = (self.FernwehContext && typeof self.FernwehContext === 'object')
        ? self.FernwehContext
        : null;
      if (!patchCtx) {
        throw new Error('Ubergabe: worker FernwehContext missing after install');
      }
      if (!hooks) {
        throw new Error('Ubergabe: worker FernwehHooks missing after install');
      }

      if (typeof patchCtx.registerOffscreenConvertToBlobHook === 'function' && typeof hooks.patchConvertToBlobInjectNoise === 'function') {
        patchCtx.registerOffscreenConvertToBlobHook(hooks.patchConvertToBlobInjectNoise);
      }
      if (typeof patchCtx.registerCtx2DMeasureTextHook === 'function' && typeof hooks.measureTextNoiseHook === 'function') {
        patchCtx.registerCtx2DMeasureTextHook(hooks.measureTextNoiseHook);
      }
      if (typeof patchCtx.registerCtx2DFillTextHook === 'function' && typeof hooks.fillTextNoiseHook === 'function') {
        patchCtx.registerCtx2DFillTextHook(hooks.fillTextNoiseHook);
      }
      if (typeof patchCtx.registerCtx2DStrokeTextHook === 'function' && typeof hooks.strokeTextNoiseHook === 'function') {
        patchCtx.registerCtx2DStrokeTextHook(hooks.strokeTextNoiseHook);
      }
      if (typeof patchCtx.registerCtx2DFillRectHook === 'function' && typeof hooks.fillRectNoiseHook === 'function') {
        patchCtx.registerCtx2DFillRectHook(hooks.fillRectNoiseHook);
      }
      if (typeof patchCtx.registerCtx2DDrawImageHook === 'function' && typeof hooks.applyDrawImageHook === 'function') {
        patchCtx.registerCtx2DDrawImageHook(hooks.applyDrawImageHook);
      }

      if (typeof patchCtx.applyOffscreenPatches === 'function') {
        patchCtx.applyOffscreenPatches();
      }
      if (typeof patchCtx.applyCtx2DContextPatches === 'function') {
        patchCtx.applyCtx2DContextPatches();
      }
      if (typeof patchCtx.applyWebGLContextPatches === 'function') {
        patchCtx.applyWebGLContextPatches();
      }

      trackedDefineProperty(fernwehState, '__WORKER_CANVAS_PATCH_INSTALLED__', {
        value: true,
        writable: true,
        configurable: true,
        enumerable: false
      });
      if (runtimeRoot) {
        trackedDefineProperty(runtimeRoot, 'workerCanvasPatchInstalled', {
          value: true,
          writable: true,
          configurable: true,
          enumerable: false
        });
      }
      return true;
    };
    installWorkerCanvasPipeline();




    const isProbablyModuleWorkerURL = absUrl => {
      if (typeof absUrl !== 'string' || !absUrl) return false;
      if (/\.mjs(?:$|[?#])/i.test(absUrl)) return true;
      if (/[?&]type=module(?:&|$)/i.test(absUrl)) return true;
      if (/[?&]module(?:&|$)/i.test(absUrl)) return true;
      if (/#module\\b/i.test(absUrl)) return true;
      if (absUrl.slice(0, 5) === 'data:') {
        return /;module\\b/i.test(absUrl) || /\\bmodule\\b/i.test(absUrl.slice(0, 80));
      }
      return false;
    };
    const resolveWorkerType = (absUrl, opts) => {
      const hasType = !!(opts && (typeof opts === 'object' || typeof opts === 'function') && ('type' in opts));
      const t = hasType ? opts.type : undefined;
      if (hasType && t !== 'module' && t !== 'classic') {
        throw new Error('Ubergabe: invalid worker type');
      }
      const isModuleURL = isProbablyModuleWorkerURL(absUrl);
      if (t === 'classic' && isModuleURL) {
        throw new Error('Ubergabe: module worker URL with classic type');
      }
      return (t === 'module' || (!hasType && isModuleURL)) ? 'module' : 'classic';
    };

    const applyWorkerSnapshot = s => {
      if (!s || typeof s !== 'object') throw new Error('Ubergabe: invalid snapshot');
      if (cache.snap === s && __bootstrapSnapshotConsumed__ === true) return;
      const prevSeed = (self.CDP_GLOBAL_SEED != null) ? String(self.CDP_GLOBAL_SEED) : null;
      cache.snap = requireSnap(s, 'apply');
      if (self.CDP_GLOBAL_SEED == null || String(self.CDP_GLOBAL_SEED) === '') {
        const e = new Error('Ubergabe: CDP_GLOBAL_SEED missing');
        emitDegrade('error', 'worker_patch_src:seed:runtime:missing', {
          type: 'pipeline missing data',
          stage: 'runtime',
          module: 'WORKER_PATCH_SRC',
          surface: 'CDP_GLOBAL_SEED',
          key: 'CDP_GLOBAL_SEED',
          policy: 'throw',
          action: 'throw'
        }, e);
        throw e;
      }
      const stateRoot = (self.FernwehContext && typeof self.FernwehContext === 'object' && self.FernwehContext.state && typeof self.FernwehContext.state === 'object')
        ? self.FernwehContext.state
        : null;
      if (!stateRoot) throw new Error('Ubergabe: FernwehContext.state missing');
      // Worker runtime consumes cache.snap; do not rewrite the canonical
      // __WORKER_ENV_SNAPSHOT__ owner-store from the consumer apply path.
      syncWorkerEnvProfileState(stateRoot);
      syncWorkerScreenState(stateRoot);
      restoreWorkerFontsState(stateRoot);
      // Paradigm: seed is immutable within session.
      const curSeed = (self.CDP_GLOBAL_SEED != null) ? String(self.CDP_GLOBAL_SEED) : null;
      if (prevSeed != null && curSeed != null && prevSeed !== curSeed) {
        throw new Error('Ubergabe: seed mutation is not allowed');
      }
      __bootstrapSnapshotConsumed__ = true;
    };
    __defineHiddenWorkerRuntimeValue__(bootstrapRuntimeRoot, 'consumeEnvSnapshot', applyWorkerSnapshot);
    const consumePendingEnvSnapshots = () => {
      const pending = Array.isArray(bootstrapRuntimeRoot.pendingEnvSnapshots)
        ? bootstrapRuntimeRoot.pendingEnvSnapshots
        : null;
      if (!(pending && pending.length)) return;
      const queued = pending.slice(0);
      pending.length = 0;
      for (let i = 0; i < queued.length; i++) {
        applyWorkerSnapshot(queued[i]);
      }
    };
    const bootstrapSnap = __resolveWorkerSnapshotOwner__();
    if (!bootstrapSnap) {
      throw new Error('Ubergabe: FernwehContext.state.__NAV_TOTAL_SET__.__DATA_STORE_STATE__.__WORKER_ENV_SNAPSHOT__ missing');
    }
    if (self.CDP_GLOBAL_SEED == null || String(self.CDP_GLOBAL_SEED) === '') {
      const e = new Error('Ubergabe: CDP_GLOBAL_SEED missing');
      emitDegrade('error', 'worker_patch_src:seed:contract:missing_bootstrap', {
        type: 'pipeline missing data',
        stage: 'contract',
        module: 'WORKER_PATCH_SRC',
        surface: 'CDP_GLOBAL_SEED',
        key: 'CDP_GLOBAL_SEED',
        policy: 'throw',
        action: 'throw'
      }, e);
      throw e;
    }
    applyWorkerSnapshot(bootstrapSnap);
    consumePendingEnvSnapshots();
    if (typeof BroadcastChannel !== 'function') {
      throw new Error('Ubergabe: BroadcastChannel missing');
    }
    const bc = new BroadcastChannel('__ENV_SYNC__');
    bc.onmessage = ev => {
      const s = ev?.data?.__ENV_SYNC__?.envSnapshot;
      const applyFn = (typeof bootstrapRuntimeRoot.consumeEnvSnapshot === 'function')
        ? bootstrapRuntimeRoot.consumeEnvSnapshot
        : applyWorkerSnapshot;
      if (s && applyFn) applyFn(s);
    };
    if (self.Worker && !self.Worker.__ENV_WRAPPED__) {
      const NativeWorker = self.Worker;
      const dWorker = Object.getOwnPropertyDescriptor(self, 'Worker');
      if (!dWorker) throw new Error('Ubergabe: Worker descriptor missing');
      const WrappedWorker = wrapNativeCtor(NativeWorker, 'Worker', function(argList) {
        const nextArgs = Array.isArray(argList) ? argList : [];
        const url = nextArgs[0];
        const opts = nextArgs[1];
        const abs = new URL(url, self.location && self.location.href || undefined).href;
        const workerType = resolveWorkerType(abs, opts);
        const snap = requireSnap(cache.snap, 'nested');
        const SNAP = JSON.stringify(snap);
        const SEED = JSON.stringify((self.CDP_GLOBAL_SEED != null) ? String(self.CDP_GLOBAL_SEED) : '');
        const USER = JSON.stringify(String(abs));
        const src = workerType === 'module'
          ? `(async function(){'use strict';const SEED=${SEED};if(!SEED||typeof SEED!=='string') throw new Error('Ubergabe: missing nested worker seed');Object.defineProperty(self,'CDP_GLOBAL_SEED',{value:SEED,writable:true,configurable:true,enumerable:false});const SNAP=${SNAP};var __defHidden=function(obj,key,value){if(!obj||(typeof obj!=='object'&&typeof obj!=='function')) return value;var desc=Object.getOwnPropertyDescriptor(obj,key);if(desc&&desc.configurable===false){return Object.prototype.hasOwnProperty.call(desc,'value')?desc.value:value;}Object.defineProperty(obj,key,{value:value,writable:true,configurable:true,enumerable:false});return value;};var __ensureOwner=function(){var C=(self.FernwehContext&&typeof self.FernwehContext==='object')?self.FernwehContext:__defHidden(self,'FernwehContext',Object.create(null));var state=(C.state&&typeof C.state==='object')?C.state:__defHidden(C,'state',Object.create(null));var wrk=(state.__WRK__&&typeof state.__WRK__==='object')?state.__WRK__:__defHidden(state,'__WRK__',Object.create(null));var runtime=(wrk.runtime&&typeof wrk.runtime==='object')?wrk.runtime:__defHidden(wrk,'runtime',Object.create(null));var nav=(state.__NAV_TOTAL_SET__&&typeof state.__NAV_TOTAL_SET__==='object')?state.__NAV_TOTAL_SET__:__defHidden(state,'__NAV_TOTAL_SET__',Object.create(null));var data=(nav.__DATA_STORE_STATE__&&typeof nav.__DATA_STORE_STATE__==='object')?nav.__DATA_STORE_STATE__:__defHidden(nav,'__DATA_STORE_STATE__',Object.create(null));var snapRoot=(data.__WORKER_ENV_SNAPSHOT__&&typeof data.__WORKER_ENV_SNAPSHOT__==='object')?data.__WORKER_ENV_SNAPSHOT__:__defHidden(data,'__WORKER_ENV_SNAPSHOT__',Object.create(null));var screenRoot=(state.__SCREEN__&&typeof state.__SCREEN__==='object')?state.__SCREEN__:__defHidden(state,'__SCREEN__',Object.create(null));return{runtime:runtime,snapRoot:snapRoot,screenRoot:screenRoot};};var __applyOwnerSnapshot=function(s){if(!s||typeof s!=='object') throw new Error('Ubergabe: invalid nested worker snapshot');if(!s.screen||typeof s.screen!=='object') throw new Error('Ubergabe: invalid nested worker screen');if(!Number.isFinite(Number(s.screen.width))) throw new Error('Ubergabe: bad nested screen.width');if(!Number.isFinite(Number(s.screen.height))) throw new Error('Ubergabe: bad nested screen.height');if(!Number.isFinite(Number(s.screen.dpr))||Number(s.screen.dpr)<=0) throw new Error('Ubergabe: bad nested screen.dpr');if(!Number.isFinite(Number(s.screen.colorDepth))) throw new Error('Ubergabe: bad nested screen.colorDepth');var owner=__ensureOwner();var root=owner.snapRoot;var prevKeys=Object.keys(root);for(var i=0;i<prevKeys.length;i++){delete root[prevKeys[i]];}var nextKeys=Object.keys(s);for(var j=0;j<nextKeys.length;j++){var key=nextKeys[j];root[key]=s[key];}var screen=owner.screenRoot;var prevScreenKeys=Object.keys(screen);for(var si=0;si<prevScreenKeys.length;si++){delete screen[prevScreenKeys[si]];}var nextScreenKeys=Object.keys(s.screen);for(var sj=0;sj<nextScreenKeys.length;sj++){var screenKey=nextScreenKeys[sj];screen[screenKey]=s.screen[screenKey];}__defHidden(owner.runtime,'bootstrapActive',true);__defHidden(owner.runtime,'consumeEnvSnapshot',__applyOwnerSnapshot);return root;};__applyOwnerSnapshot(SNAP);if(typeof BroadcastChannel!=='function') throw new Error('Ubergabe: BroadcastChannel missing');const bc=new BroadcastChannel('__ENV_SYNC__');bc.onmessage=ev=>{const s=ev&&ev.data&&ev.data.__ENV_SYNC__&&ev.data.__ENV_SYNC__.envSnapshot;if(s) __applyOwnerSnapshot(s);};const USER=${USER};if(!USER||typeof USER!=='string') throw new Error('Ubergabe: missing user import');await import(USER);} )();export {};`
          : `(function(){'use strict';var SEED=${SEED};if(!SEED||typeof SEED!=='string') throw new Error('Ubergabe: missing nested worker seed');Object.defineProperty(self,'CDP_GLOBAL_SEED',{value:SEED,writable:true,configurable:true,enumerable:false});var SNAP=${SNAP};var __defHidden=function(obj,key,value){if(!obj||(typeof obj!=='object'&&typeof obj!=='function')) return value;var desc=Object.getOwnPropertyDescriptor(obj,key);if(desc&&desc.configurable===false){return Object.prototype.hasOwnProperty.call(desc,'value')?desc.value:value;}Object.defineProperty(obj,key,{value:value,writable:true,configurable:true,enumerable:false});return value;};var __ensureOwner=function(){var C=(self.FernwehContext&&typeof self.FernwehContext==='object')?self.FernwehContext:__defHidden(self,'FernwehContext',Object.create(null));var state=(C.state&&typeof C.state==='object')?C.state:__defHidden(C,'state',Object.create(null));var wrk=(state.__WRK__&&typeof state.__WRK__==='object')?state.__WRK__:__defHidden(state,'__WRK__',Object.create(null));var runtime=(wrk.runtime&&typeof wrk.runtime==='object')?wrk.runtime:__defHidden(wrk,'runtime',Object.create(null));var nav=(state.__NAV_TOTAL_SET__&&typeof state.__NAV_TOTAL_SET__==='object')?state.__NAV_TOTAL_SET__:__defHidden(state,'__NAV_TOTAL_SET__',Object.create(null));var data=(nav.__DATA_STORE_STATE__&&typeof nav.__DATA_STORE_STATE__==='object')?nav.__DATA_STORE_STATE__:__defHidden(nav,'__DATA_STORE_STATE__',Object.create(null));var snapRoot=(data.__WORKER_ENV_SNAPSHOT__&&typeof data.__WORKER_ENV_SNAPSHOT__==='object')?data.__WORKER_ENV_SNAPSHOT__:__defHidden(data,'__WORKER_ENV_SNAPSHOT__',Object.create(null));var screenRoot=(state.__SCREEN__&&typeof state.__SCREEN__==='object')?state.__SCREEN__:__defHidden(state,'__SCREEN__',Object.create(null));return{runtime:runtime,snapRoot:snapRoot,screenRoot:screenRoot};};var __applyOwnerSnapshot=function(s){if(!s||typeof s!=='object') throw new Error('Ubergabe: invalid nested worker snapshot');if(!s.screen||typeof s.screen!=='object') throw new Error('Ubergabe: invalid nested worker screen');if(!Number.isFinite(Number(s.screen.width))) throw new Error('Ubergabe: bad nested screen.width');if(!Number.isFinite(Number(s.screen.height))) throw new Error('Ubergabe: bad nested screen.height');if(!Number.isFinite(Number(s.screen.dpr))||Number(s.screen.dpr)<=0) throw new Error('Ubergabe: bad nested screen.dpr');if(!Number.isFinite(Number(s.screen.colorDepth))) throw new Error('Ubergabe: bad nested screen.colorDepth');var owner=__ensureOwner();var root=owner.snapRoot;var prevKeys=Object.keys(root);for(var i=0;i<prevKeys.length;i++){delete root[prevKeys[i]];}var nextKeys=Object.keys(s);for(var j=0;j<nextKeys.length;j++){var key=nextKeys[j];root[key]=s[key];}var screen=owner.screenRoot;var prevScreenKeys=Object.keys(screen);for(var si=0;si<prevScreenKeys.length;si++){delete screen[prevScreenKeys[si]];}var nextScreenKeys=Object.keys(s.screen);for(var sj=0;sj<nextScreenKeys.length;sj++){var screenKey=nextScreenKeys[sj];screen[screenKey]=s.screen[screenKey];}__defHidden(owner.runtime,'bootstrapActive',true);__defHidden(owner.runtime,'consumeEnvSnapshot',__applyOwnerSnapshot);return root;};__applyOwnerSnapshot(SNAP);if(typeof BroadcastChannel!=='function') throw new Error('Ubergabe: BroadcastChannel missing');var bc=new BroadcastChannel('__ENV_SYNC__');bc.onmessage=function(ev){var s=ev&&ev.data&&ev.data.__ENV_SYNC__&&ev.data.__ENV_SYNC__.envSnapshot;if(s) __applyOwnerSnapshot(s);};var USER=${USER};if(!USER||typeof USER!=='string') throw new Error('Ubergabe: missing user import');var __isModuleURL=function(u){if(typeof u!=='string'||!u) return false; if(/\\.mjs(?:$|[?#])/i.test(u)) return true; if(/[?&]type=module(?:&|$)/i.test(u)) return true; if(/[?&]module(?:&|$)/i.test(u)) return true; if(/#module\\b/i.test(u)) return true; if(u.slice(0,5)==='data:'){ return /;module\\b/i.test(u) || /\\bmodule\\b/i.test(u.slice(0,80)); } return false;}; if(__isModuleURL(USER)) { return import(USER); } try { importScripts(USER); } catch(e) { return import(USER); }})();`;
        const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
        return [blobURL, { ...(opts || {}), type: workerType }];
      });
      trackedDefineProperty(self, 'Worker', {
        configurable: dWorker.configurable,
        enumerable: dWorker.enumerable,
        writable: dWorker.writable,
        value: WrappedWorker
      });
      trackedDefineProperty(self.Worker, '__ENV_WRAPPED__', {
        value: true,
        writable: false,
        configurable: true,
        enumerable: false
      });
    }
    const sanity = {
      language: self.navigator && self.navigator.language,
      languages: self.navigator && self.navigator.languages,
      deviceMemory: self.navigator && self.navigator.deviceMemory,
      hardwareConcurrency: self.navigator && self.navigator.hardwareConcurrency
    };
    if (sanity.language !== cache.snap.language) {
      failWorkerNavigatorSanity(
        'worker_patch_src:workernavigator:sanity:mismatch',
        'language',
        'Ubergabe: language mismatch',
        { actual: sanity.language, expected: cache.snap.language }
      );
    }
    const sanityLanguagesCanonical = canonicalizeLanguageListForCompare(sanity.languages);
    const snapLanguagesCanonical = canonicalizeLanguageListForCompare(cache.snap.languages);
    if (!sameJson(sanity.languages, cache.snap.languages)) {
      if (sanityLanguagesCanonical && snapLanguagesCanonical && sameJson(sanityLanguagesCanonical, snapLanguagesCanonical)) {
        emitDegrade('info', 'worker_patch_src:workernavigator_descriptor:profile_languages_canonicalized', {
          type: 'browser structure missing data',
          stage: 'sanity',
          module: 'WORKER_PATCH_SRC',
          surface: 'WorkerNavigator',
          key: 'languages',
          policy: 'skip',
          action: 'native',
          data: {
            outcome: 'skip',
            reason: 'profile_languages_canonicalized',
            nativeValue: Array.isArray(sanity.languages) ? sanity.languages.slice() : sanity.languages,
            profileValue: Array.isArray(cache.snap.languages) ? cache.snap.languages.slice() : cache.snap.languages,
            canonicalNativeValue: sanityLanguagesCanonical,
            canonicalProfileValue: snapLanguagesCanonical
          }
        }, null);
      } else {
        failWorkerNavigatorSanity(
          'worker_patch_src:workernavigator:sanity:mismatch',
          'languages',
          'Ubergabe: languages mismatch',
          {
            actual: Array.isArray(sanity.languages) ? sanity.languages.slice() : sanity.languages,
            expected: Array.isArray(cache.snap.languages) ? cache.snap.languages.slice() : cache.snap.languages
          }
        );
      }
    }
    if (Number(sanity.deviceMemory) !== Number(cache.snap.deviceMemory)) {
      failWorkerNavigatorSanity(
        'worker_patch_src:workernavigator:sanity:mismatch',
        'deviceMemory',
        'Ubergabe: deviceMemory mismatch',
        { actual: sanity.deviceMemory, expected: cache.snap.deviceMemory }
      );
    }
    if (Number(sanity.hardwareConcurrency) !== Number(cache.snap.hardwareConcurrency)) {
      failWorkerNavigatorSanity(
        'worker_patch_src:workernavigator:sanity:mismatch',
        'hardwareConcurrency',
        'Ubergabe: hardwareConcurrency mismatch',
        { actual: sanity.hardwareConcurrency, expected: cache.snap.hardwareConcurrency }
      );
    }
    const sanityUAD = self.navigator && self.navigator.userAgentData;
    if (!sanityUAD || typeof sanityUAD !== 'object') {
      failWorkerNavigatorSanity(
        'worker_patch_src:workernavigator:sanity:mismatch',
        'userAgentData',
        'Ubergabe: userAgentData missing',
        { actual: sanityUAD, expected: cache.snap.uaData }
      );
    }
    const expectedBrands = toBrands(cache.snap.uaData.brands);
    if (!sameJson(sanityUAD.brands, expectedBrands)) {
      failWorkerNavigatorSanity(
        'worker_patch_src:workernavigator:sanity:mismatch',
        'userAgentData.brands',
        'Ubergabe: brands mismatch',
        { actual: sanityUAD.brands, expected: expectedBrands }
      );
    }
    if (sanityUAD.mobile !== cache.snap.uaData.mobile) {
      failWorkerNavigatorSanity(
        'worker_patch_src:workernavigator:sanity:mismatch',
        'userAgentData.mobile',
        'Ubergabe: mobile mismatch',
        { actual: sanityUAD.mobile, expected: cache.snap.uaData.mobile }
      );
    }
    const expectedPlatformTransit = requirePlatformTransit(cache.snap, 'sanity.userAgentData.platform');
    if (sanityUAD.platform !== expectedPlatformTransit.uaPlatform) {
      failWorkerNavigatorSanity(
        'worker_patch_src:workernavigator:sanity:mismatch',
        'userAgentData.platform',
        'Ubergabe: platform mismatch',
        { actual: sanityUAD.platform, expected: expectedPlatformTransit.uaPlatform }
      );
    }
    let directFullVersionListAvailable = false;
    let sanityFullVersionList = null;
    try {
      directFullVersionListAvailable = ('fullVersionList' in sanityUAD);
      if (directFullVersionListAvailable) {
        sanityFullVersionList = sanityUAD.fullVersionList;
      }
    } catch (e) {
      emitDegrade('warn', 'worker_patch_src:fullversionlist:sanity:read_failed', {
        stage: 'runtime',
        surface: 'WorkerNavigatorUAData',
        key: 'fullVersionList',
        message: 'fullVersionList sanity read failed',
        type: 'browser structure missing data',
        data: { outcome: 'skip', reason: 'fullversionlist_sanity_read_failed' }
      }, e);
    }
    if (directFullVersionListAvailable && !sameJson(sanityFullVersionList, cache.snap.uaData.he.fullVersionList)) {
      failWorkerNavigatorSanity(
        'worker_patch_src:workernavigator:sanity:mismatch',
        'userAgentData.fullVersionList',
        'Ubergabe: fullVersionList mismatch',
        { actual: sanityFullVersionList, expected: cache.snap.uaData.he.fullVersionList }
      );
    }
    try {
      const expectedHe = cache.snap.uaData && cache.snap.uaData.he ? cache.snap.uaData.he : null;
      const expectedPlatformTransitHe = requirePlatformTransit(cache.snap, 'sanity.userAgentData.getHighEntropyValues');
      const sanityHePromise = sanityUAD.getHighEntropyValues(['platformVersion','uaFullVersion','fullVersionList','architecture','bitness','model','wow64','formFactors']);
      if (!sanityHePromise || typeof sanityHePromise.then !== 'function') {
        failWorkerNavigatorSanity(
          'worker_patch_src:workernavigator:sanity:mismatch',
          'userAgentData.getHighEntropyValues',
          'Ubergabe: high entropy promise contract failed',
          { actual: sanityHePromise, expected: expectedHe }
        );
      }
      sanityHePromise.then(function(sanityHe) {
        if (!expectedHe || typeof expectedHe !== 'object') {
          failWorkerNavigatorSanity(
            'worker_patch_src:workernavigator:sanity:mismatch',
            'userAgentData.getHighEntropyValues',
            'Ubergabe: high entropy snapshot missing',
            { actual: sanityHe, expected: expectedHe }
          );
        }
        const comparableHeKeys = ['uaFullVersion', 'fullVersionList', 'architecture', 'bitness', 'model', 'wow64', 'formFactors'];
        const actualHeValues = {
          platformVersion: sanityHe && sanityHe.platformVersion
        };
        const expectedHeValues = {
          platformVersion: expectedPlatformTransitHe.platformVersion
        };
        for (let i = 0; i < comparableHeKeys.length; i++) {
          const key = comparableHeKeys[i];
          actualHeValues[key] = sanityHe && sanityHe[key];
          expectedHeValues[key] = expectedHe[key];
        }
        if (!sameJson(actualHeValues, expectedHeValues)) {
          failWorkerNavigatorSanity(
            'worker_patch_src:workernavigator:sanity:mismatch',
            'userAgentData.getHighEntropyValues',
            'Ubergabe: high entropy mismatch',
            { actual: actualHeValues, expected: expectedHeValues }
          );
        }
      }).catch(function(e) {
        emitDegrade('warn', 'worker_patch_src:gethighentropyvalues:sanity:failed', {
          stage: 'runtime',
          surface: 'WorkerNavigatorUAData',
          key: 'getHighEntropyValues',
          message: 'getHighEntropyValues sanity failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'gethighentropyvalues_sanity_failed' }
        }, e);
      });
    } catch (e) {
      emitDegrade('warn', 'worker_patch_src:gethighentropyvalues:sanity:failed', {
        stage: 'runtime',
        surface: 'WorkerNavigatorUAData',
        key: 'getHighEntropyValues',
        message: 'getHighEntropyValues sanity failed',
        type: 'browser structure missing data',
        data: { outcome: 'skip', reason: 'gethighentropyvalues_sanity_failed' }
      }, e);
    }
    __uachMirrorInstalled__ = true;

    const __workerCtx = {
      module: "WORKER_PATCH_SRC",
      diagTag: "worker_patch",
      surface: "worker",
      key: "installWorkerUACHMirror",
      stage: "apply",
      message: "worker patch applied",
      data: {
        outcome: "return",
        reason: "applied",
        core: true,
        mirror: __uachMirrorInstalled__ === true,
        scope: __workerScopeMarker__
      },
      type: "pipeline missing data"
    };
    emitDegrade('info', 'worker_patch_src:applied', __workerCtx, null);
    } catch (e) {
      let rollbackErr = null;
      try {
        rollbackAppliedDescriptors();
      } catch (re) {
        rollbackErr = re;
      }
      emitDegrade('error', 'worker_patch_src:apply:rollback', {
        stage: rollbackErr ? 'rollback' : 'apply',
        surface: 'worker',
        key: 'installWorkerUACHMirror',
        message: rollbackErr ? 'worker patch rollback failed' : 'worker patch apply failed',
        type: 'browser structure missing data',
        data: { outcome: rollbackErr ? 'throw' : 'rollback', reason: rollbackErr ? 'rollback_failed' : 'apply_failed', rollbackOk: !rollbackErr }
      }, rollbackErr || e);
      throw (rollbackErr || e);
    }
  };
  const __bootstrapRuntimeRoot = __resolveBootstrapWorkerRuntimeRoot__();
  if (!__bootstrapRuntimeRoot) {
    throw new Error('Ubergabe: worker runtime root missing before install export');
  }
  __defineHiddenWorkerRuntimeValue__(__bootstrapRuntimeRoot, 'installWorkerUACHMirror', __installWorkerUACHMirror__);
})();

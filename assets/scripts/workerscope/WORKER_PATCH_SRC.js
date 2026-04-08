// WORKER_PATCH_SRC.js
(() => {
  const G = (typeof globalThis !== 'undefined' && globalThis)
      || (typeof self       !== 'undefined' && self)
      || (typeof window     !== 'undefined' && window)
      || (typeof global     !== 'undefined' && global)
      || {};
  if (typeof self==='undefined' || typeof WorkerGlobalScope==='undefined' || !(self instanceof WorkerGlobalScope)) {
    throw new Error('UACHPatch: not in WorkerGlobalScope');
  }
  const W = self;
  const installDesc = Object.getOwnPropertyDescriptor(self, '__installWorkerUACHMirror__');
  if (installDesc && installDesc.configurable === false) {
    throw new Error('UACHPatch: __installWorkerUACHMirror__ non-configurable');
  }
  if (installDesc && Object.prototype.hasOwnProperty.call(installDesc, 'value') && typeof installDesc.value === 'function') {
    throw new Error('UACHPatch: __installWorkerUACHMirror__ already defined');
  }
  let __uachMirrorInstalled__ = false;
  const __rollbackProbeRoot__ = Object.create(null);

  const __installWorkerUACHMirror__ = function installWorkerUACHMirror(){
    if (__uachMirrorInstalled__) {
      throw new Error('UACHPatch: already installed');
    }
    if (!self.__GW_BOOTSTRAP__) {
      throw new Error('UACHPatch: bootstrap marker missing');
    }
    if (!self.__lastSnap__ || typeof self.__lastSnap__ !== 'object') {
      throw new Error('UACHPatch: no snapshot');
    }
    const nav = self.navigator;
    const proto = (typeof WorkerNavigator!=='undefined' && WorkerNavigator.prototype) || Object.getPrototypeOf(nav);
    if (!proto && !nav) {
      throw new Error('UACHPatch: WorkerNavigator unavailable');
    }
    const cache = { snap:null };
    const relayDiag = (typeof self.__ENV_RELAY_DIAG__ === 'function') ? self.__ENV_RELAY_DIAG__ : null;
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
    const __resolveWorkerWrkRuntimeRoot__ = () => {
      const C = (self && self.CanvasPatchContext && typeof self.CanvasPatchContext === 'object')
        ? self.CanvasPatchContext
        : null;
      const stateRoot = (C && C.state && typeof C.state === 'object')
        ? C.state
        : null;
      const wrkState = (stateRoot && stateRoot.__WRK__ && typeof stateRoot.__WRK__ === 'object')
        ? stateRoot.__WRK__
        : null;
      const wrkRuntime = (wrkState && wrkState.runtime && typeof wrkState.runtime === 'object')
        ? wrkState.runtime
        : null;
      return wrkRuntime;
    };
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
        throw new Error('UACHPatch: rollback selftest residue');
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
          throw new Error('UACHPatch: rollback selftest trigger');
        } catch (e) {
          forced = e;
          rollbackAppliedDescriptors();
        }
        if (!forced) {
          throw new Error('UACHPatch: rollback selftest missing forced failure');
        }
        if (Object.prototype.hasOwnProperty.call(__rollbackProbeRoot__, probeKey)) {
          throw new Error('UACHPatch: rollback selftest failed');
        }
      };
      runAttempt();
      runAttempt();
    };
    verifyRollbackRepeatApply();
    const __workerNavigatorPatchedOwners__ = Object.create(null);
    const __workerNavigatorDescriptorModes__ = Object.create(null);
    const validDpr = v => Number.isFinite(v) && v > 0;
    const HE_KEYS = ['architecture','bitness','model','platformVersion','fullVersionList','wow64','formFactors'];
    const LE_KEYS = ['brands','mobile','platform'];
    const requireSnap = (s, where) => {
      if (!s || typeof s !== 'object') {
        const msg = where ? `UACHPatch: no snapshot (${where})` : 'UACHPatch: no snapshot';
        throw new Error(msg);
      }
      if (typeof s.language !== 'string' || s.language.trim() === '') throw new Error('UACHPatch: bad language');
      if (!Array.isArray(s.languages)) throw new Error('UACHPatch: bad languages');
      if (!Number.isFinite(Number(s.deviceMemory))) throw new Error('UACHPatch: bad deviceMemory');
      if (!Number.isFinite(Number(s.hardwareConcurrency))) throw new Error('UACHPatch: bad hardwareConcurrency');
      if (!s.webgl || typeof s.webgl !== 'object') throw new Error('UACHPatch: missing webgl');
      if (typeof s.webgl.vendor !== 'string' || !s.webgl.vendor) throw new Error('UACHPatch: bad webgl.vendor');
      if (typeof s.webgl.renderer !== 'string' || !s.webgl.renderer) throw new Error('UACHPatch: bad webgl.renderer');
      if (typeof s.webgl.unmaskedVendor !== 'string' || !s.webgl.unmaskedVendor) throw new Error('UACHPatch: bad webgl.unmaskedVendor');
      if (typeof s.webgl.unmaskedRenderer !== 'string' || !s.webgl.unmaskedRenderer) throw new Error('UACHPatch: bad webgl.unmaskedRenderer');
      if (!s.uaData) throw new Error('UACHPatch: missing userAgentData');
      const he = (s.uaData && s.uaData.he) || s.highEntropy;
      if (!he || typeof he !== 'object') throw new Error('UACHPatch: missing highEntropy');
      for (const k of HE_KEYS) {
        if (!(k in he)) throw new Error(`UACHPatch: missing highEntropy.${k}`);
        const v = he[k];
        if (v === undefined || v === null) throw new Error(`UACHPatch: bad highEntropy.${k}`);
        // if (typeof v === 'string' && !v) throw new Error(`UACHPatch: bad highEntropy.${k}`);
        if (typeof v === 'string' && !v && k !== 'model' && k !== 'uaFullVersion') throw new Error(`UACHPatch: bad highEntropy.${k}`);
        if (Array.isArray(v) && !v.length) throw new Error(`UACHPatch: bad highEntropy.${k}`);
      }
      return s;
    };
    cache.snap = requireSnap(self.__lastSnap__, 'init');

    // Seed must be provided inside the worker realm (e.g. via CDP prelude).
    const seedInit = (self.CDP_GLOBAL_SEED != null) ? String(self.CDP_GLOBAL_SEED) : null;
    if (seedInit == null || seedInit === '') {
      const e = new Error('UACHPatch: CDP_GLOBAL_SEED missing');
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
    // --- seed __ensureMarkAsNative must exist (delivered by bootstrap) ---
    const seedEnsureDesc = Object.getOwnPropertyDescriptor(self, '__ensureMarkAsNative');
    const seedEnsure = (seedEnsureDesc && typeof seedEnsureDesc.value === 'function')
      ? seedEnsureDesc.value
      : (typeof self.__ensureMarkAsNative === 'function' ? self.__ensureMarkAsNative : null);

    if (!seedEnsure) {
      const e = new Error('UACHPatch: __ensureMarkAsNative missing');
      emitDegrade('error', 'worker_patch_src:ensure:preflight:missing', {
        type: 'pipeline missing data',
        stage: 'preflight',
        module: 'WORKER_PATCH_SRC',
        surface: '__ensureMarkAsNative',
        key: '__ensureMarkAsNative',
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
        const e = new Error('UACHPatch: __CORE_TOSTRING_STATE__ missing/invalid');
        emitDegrade('error', 'worker_patch_src:tostring_state:preflight:missing', {
          type: 'pipeline missing data',
          stage: 'preflight',
          module: 'WORKER_PATCH_SRC',
          surface: 'CanvasPatchContext.state.__WRK__.runtime.__CORE_TOSTRING_STATE__',
          key: 'CanvasPatchContext.state.__WRK__.runtime.__CORE_TOSTRING_STATE__',
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
      const e = new Error('UACHPatch: Function.prototype.toString missing');
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

    const markAsNative = seedEnsure();
    if (typeof markAsNative !== 'function') {
      const e = new Error('UACHPatch: markAsNative seed missing');
      emitDegrade('error', 'worker_patch_src:ensure:contract:missing_mark', {
        type: 'pipeline missing data',
        stage: 'contract',
        module: 'WORKER_PATCH_SRC',
        surface: '__ensureMarkAsNative',
        key: '__ensureMarkAsNative',
        policy: 'throw',
        action: 'throw'
      }, e);
      throw e;
    }
    if (markAsNative !== seedEnsure()) {
      const e = new Error('UACHPatch: markAsNative seed unstable');
      emitDegrade('error', 'worker_patch_src:ensure:contract:unstable_mark', {
        type: 'pipeline missing data',
        stage: 'contract',
        module: 'WORKER_PATCH_SRC',
        surface: '__ensureMarkAsNative',
        key: '__ensureMarkAsNative',
        policy: 'throw',
        action: 'throw'
      }, e);
      throw e;
    }

    // sanity: worker follows window-style nativeization.
    // markAsNative must not relabel source-text probes; public Function.prototype.toString stays native.
    {
      const st = __resolveCoreToStringState__();
      const probe = function probe(){};
      Object.defineProperty(probe, '__coreBridgeTarget__', {
        value: nativeToString,
        writable: true,
        configurable: true,
        enumerable: false
      });
      markAsNative(probe, 'toString');
      const actual = st && st.overrideMap && typeof st.overrideMap.get === 'function'
        ? st.overrideMap.get(probe)
        : undefined;
      if (typeof actual === 'string') {
        const e = new Error('UACHPatch: source-text toString probe must stay unlabeled');
        emitDegrade('error', 'worker_patch_src:tostring_state:contract:unexpected_source_label', {
          type: 'pipeline missing data',
          stage: 'contract',
          module: 'WORKER_PATCH_SRC',
          surface: 'CanvasPatchContext.state.__WRK__.runtime.__CORE_TOSTRING_STATE__',
          key: 'CanvasPatchContext.state.__WRK__.runtime.__CORE_TOSTRING_STATE__',
          policy: 'throw',
          action: 'throw'
        }, e);
        throw e;
      }
      if (st && st.overrideMap && typeof st.overrideMap.delete === 'function') st.overrideMap.delete(probe);
      if (st && st.proxyTargetMap && typeof st.proxyTargetMap.delete === 'function') st.proxyTargetMap.delete(probe);
      const directProbe = function workerPatchDirectProbe(){};
      const expectedNative = Reflect.apply(nativeToString, directProbe, []);
      const actualNative = Reflect.apply(Function.prototype.toString, directProbe, []);
      if (actualNative !== expectedNative) {
        const e = new Error('UACHPatch: toString native forwarding mismatch');
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
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      if (!('dpr' in cache.snap)) throw new Error('UACHPatch: no dpr');
      const snapVal = Number(cache.snap.dpr);
      if (validDpr(snapVal)) return snapVal;
      throw new Error('UACHPatch: bad dpr');
    };
    const dprOwn = Object.getOwnPropertyDescriptor(self, 'devicePixelRatio');
    const dprProto = (!dprOwn && Object.getPrototypeOf(self))
      ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(self), 'devicePixelRatio')
      : null;
    const dprTarget = dprOwn ? self : (dprProto ? Object.getPrototypeOf(self) : null);
    const dprDesc = dprOwn || dprProto;
    if (dprDesc && typeof dprDesc.get === 'function') {
      Object.defineProperty(getDevicePixelRatioRaw, '__coreBridgeTarget__', {
        value: dprDesc.get,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }
    const getDevicePixelRatio = (dprDesc && typeof dprDesc.get === 'function')
      ? markAsNative(getDevicePixelRatioRaw, 'get devicePixelRatio')
      : getDevicePixelRatioRaw;
    if (dprTarget && !(dprDesc && dprDesc.configurable === false)) {
      const isData = dprDesc && Object.prototype.hasOwnProperty.call(dprDesc, 'value') && !dprDesc.get && !dprDesc.set;
      if (isData) {
        trackedDefineProperty(dprTarget, 'devicePixelRatio', {
          value: getDevicePixelRatio(),
          writable: !!dprDesc.writable,
          configurable: !!dprDesc.configurable,
          enumerable: !!dprDesc.enumerable
        });
      } else {
        trackedDefineProperty(dprTarget, 'devicePixelRatio', {
          configurable: dprDesc ? !!dprDesc.configurable : true,
          enumerable: dprDesc ? !!dprDesc.enumerable : false,
          get: getDevicePixelRatio,
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
    const isUadThis = (recv) => {
      if (recv === nativeUAD) return true;
      if (!recv || (typeof recv !== 'object' && typeof recv !== 'function')) return false;
      try {
        let cur = recv;
        for (let i = 0; i < 8; i++) {
          cur = Object.getPrototypeOf(cur);
          if (!cur) return false;
          if (cur === uadProto) return true;
        }
        return false;
      } catch (_) {
        return false;
      }
    };
    const dBrands = Object.getOwnPropertyDescriptor(uadProto, 'brands');
    const dMobile = Object.getOwnPropertyDescriptor(uadProto, 'mobile');
    const dPlatform = Object.getOwnPropertyDescriptor(uadProto, 'platform');
    if (!dBrands || !dMobile || !dPlatform) throw new Error('worker_patch_src: worker navigator.userAgentData descriptor missing');
    const origBrandsGet = dBrands && dBrands.get;
    const origMobileGet = dMobile && dMobile.get;
    const origPlatformGet = dPlatform && dPlatform.get;
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
                          if (!cache.snap) throw new Error('UACHPatch: no snap');
                          const le = cache.snap.uaData;
                          if (!le) throw new Error('UACHPatch: missing userAgentData');
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
    if (typeof origBrandsGet === 'function') {
      Object.defineProperty(getBrandsRaw, '__coreBridgeTarget__', {
        value: origBrandsGet,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }
    const getBrands = (typeof origBrandsGet === 'function')
      ? markAsNative(getBrandsRaw, 'get brands')
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
                          if (!cache.snap) throw new Error('UACHPatch: no snap');
                          const le = cache.snap.uaData;
                          if (!le) throw new Error('UACHPatch: missing userAgentData');
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
    if (typeof origMobileGet === 'function') {
      Object.defineProperty(getMobileRaw, '__coreBridgeTarget__', {
        value: origMobileGet,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }
    const getMobile = (typeof origMobileGet === 'function')
      ? markAsNative(getMobileRaw, 'get mobile')
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
                          if (!cache.snap) throw new Error('UACHPatch: no snap');
                          const le = cache.snap.uaData;
                          if (!le) throw new Error('UACHPatch: missing userAgentData');
                          if (typeof le.platform !== 'string' || !le.platform) {
                            throw new Error('worker_patch_src: uaData.platform missing');
                          }
                          return le.platform;
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
    if (typeof origPlatformGet === 'function') {
      Object.defineProperty(getPlatformRaw, '__coreBridgeTarget__', {
        value: origPlatformGet,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }
    const getPlatform = (typeof origPlatformGet === 'function')
      ? markAsNative(getPlatformRaw, 'get platform')
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
        if (!cache.snap) throw new Error('UACHPatch: no snap');
        const le = cache.snap.uaData;
        if (!le || !le.he) throw new Error('UACHPatch: missing userAgentData.he');
        if (!Array.isArray(le.he.fullVersionList)) throw new Error('UACHPatch: bad highEntropy.fullVersionList');
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
    if (typeof origFullGet === 'function') {
      Object.defineProperty(getFullVersionListRaw, '__coreBridgeTarget__', {
        value: origFullGet,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }
    const getFullVersionList = (typeof origFullGet === 'function')
      ? markAsNative(getFullVersionListRaw, 'get fullVersionList')
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
    if (typeof origToJSON === 'function') {
      Object.defineProperty(toJSONRaw, '__coreBridgeTarget__', {
        value: origToJSON,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }
    const toJSON = (typeof origToJSON === 'function')
      ? markAsNative(toJSONRaw, 'toJSON')
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
          if (!cache.snap) throw new Error('UACHPatch: no snap');
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
          if (!le || typeof le !== 'object') throw new Error('UACHPatch: missing userAgentData');
          const src = (le.he && typeof le.he === 'object') ? le.he : s.highEntropy;
          if (!src || typeof src !== 'object') throw new Error('UACHPatch: missing highEntropy');
          const fullVersionList = (src.fullVersionList != null)
            ? src.fullVersionList
            : ((le.he && le.he.fullVersionList != null) ? le.he.fullVersionList : undefined);
          const map = {
            brands: le.brands,
            mobile: le.mobile,
            platform: le.platform,
            architecture: src.architecture,
            bitness: src.bitness,
            model: src.model,
            platformVersion: src.platformVersion,
            fullVersionList: fullVersionList,
            wow64: src.wow64,
            formFactors: src.formFactors
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
    if (typeof origGHEV === 'function') {
      Object.defineProperty(getHighEntropyValuesRaw, '__coreBridgeTarget__', {
        value: origGHEV,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }
    const getHighEntropyValues = (typeof origGHEV === 'function')
      ? markAsNative(getHighEntropyValuesRaw, 'getHighEntropyValues')
      : getHighEntropyValuesRaw;
    trackedDefineProperty(uadProto, 'getHighEntropyValues', {
      configurable: dGHEV ? !!dGHEV.configurable : true,
      enumerable: dGHEV ? !!dGHEV.enumerable : false,
      writable: dGHEV && Object.prototype.hasOwnProperty.call(dGHEV, 'writable') ? dGHEV.writable : true,
      value: getHighEntropyValues
    });

    const wrapStrictAccessor = (typeof self.__wrapStrictAccessor === 'function') ? self.__wrapStrictAccessor : null;
    if (typeof wrapStrictAccessor !== 'function') {
      throw new Error('UACHPatch: worker native accessor bridge missing');
    }
    const languagesCache = {
      values: null,
      frozen: null
    };

    const makeGuardedGetter = (k, owner, patchedGet, origGet, desc) => {
      if (typeof origGet !== 'function') {
        throw new Error(`UACHPatch: ${k} native getter missing`);
      }
      const guardedPatchedGet = function() {
        try {
          return Reflect.apply(patchedGet, this, []);
        } catch (e) {
          emitDegrade('warn', 'worker_patch_src:getter_native_fallback', {
            stage: 'runtime',
            surface: 'WorkerNavigator',
            key: k,
            message: 'worker navigator getter fallback to native',
            type: 'pipeline missing data',
            data: { outcome: 'skip', reason: 'getter_native_fallback' }
          }, e);
          return Reflect.apply(origGet, this, []);
        }
      };
      const sourceDesc = desc && typeof desc === 'object'
        ? {
            configurable: !!desc.configurable,
            enumerable: !!desc.enumerable,
            get: origGet,
            set: undefined
          }
        : {
            configurable: true,
            enumerable: true,
            get: origGet,
            set: undefined
          };
      return wrapStrictAccessor(k, guardedPatchedGet, sourceDesc, function(recv) {
        return recv === nav;
      }, {
        name: `get ${k}`
      });
    };

    const def = (obj, k, getter, enumerable = true) => {
      // По методологии: не молчим, если некуда ставить
      if (!nav) throw new Error(`UACHPatch: cannot define ${k} (no navigator)`);
      const targetOwner = (typeof WorkerNavigator !== 'undefined' && WorkerNavigator.prototype) || obj || null;
      if (!targetOwner) {
        throw new Error(`UACHPatch: cannot define ${k} (no WorkerNavigator.prototype)`);
      }
      const resolveNativeGetter = (desc, where) => {
        if (desc && typeof desc.get === 'function') return desc.get;
        const isData = !!desc
          && Object.prototype.hasOwnProperty.call(desc, 'value')
          && !desc.get
          && !desc.set;
        if (isData) {
          const nativeValue = desc.value;
          return function nativeDataGetterFallback() { return nativeValue; };
        }
        throw new Error(`UACHPatch: ${k} missing native getter on ${where}`);
      };

      // Patch the actual native owner on the proto-chain. Forcing a new own
      // property on WorkerNavigator.prototype leaks through own-property checks.
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
      if (!d) {
        throw new Error(`UACHPatch: ${k} native descriptor missing on proto-chain`);
      }
      if (d.configurable === false) {
        throw new Error(`UACHPatch: ${k} not configurable on proto-chain`);
      }
      const protoOrigGet = resolveNativeGetter(d, 'proto-chain');
      const patchOwner = resolvedOwner || targetOwner;
      const protoGuardedGet = makeGuardedGetter(k, patchOwner, getter, protoOrigGet, d);
      trackedDefineProperty(patchOwner, k, {
        configurable: d ? !!d.configurable : true,
        enumerable: d ? !!d.enumerable : !!enumerable,
        get: protoGuardedGet,
        set: undefined
      });
      __workerNavigatorPatchedOwners__[k] = patchOwner;
      __workerNavigatorDescriptorModes__[k] = 'patched';
      return;

    };

    const resolveWorkerNavigatorNativeDescriptor = (k) => {
      const targetOwner = (typeof WorkerNavigator !== 'undefined' && WorkerNavigator.prototype) || proto || null;
      if (!targetOwner) {
        throw new Error(`UACHPatch: cannot resolve ${k} (no WorkerNavigator.prototype)`);
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
        throw new Error(`UACHPatch: ${k} native descriptor missing on proto-chain`);
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
      throw new Error(`UACHPatch: ${k} missing native getter on proto-chain`);
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
          `UACHPatch: ${k} descriptor owner missing`
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
          `UACHPatch: ${k} descriptor missing after apply`
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
            `UACHPatch: ${k} descriptor shape mismatch`,
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
          `UACHPatch: ${k} descriptor shape mismatch`,
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


    const getLanguage = function getLanguage(){
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      if (typeof cache.snap.language !== 'string' || cache.snap.language.trim() === '') throw new Error('UACHPatch: bad language');
      return cache.snap.language;
    };
    {
      const resolvedUserAgentData = resolveWorkerNavigatorNativeDescriptor('userAgentData');
      __workerNavigatorPatchedOwners__['userAgentData'] = resolvedUserAgentData.owner;
      __workerNavigatorDescriptorModes__['userAgentData'] = 'native_skip';
    }
    let __patchLanguage = true;
    try {
      const nativeLanguageResolved = readWorkerNavigatorNativeValue('language');
      if (nativeLanguageResolved.value === cache.snap.language) {
        __workerNavigatorPatchedOwners__['language'] = nativeLanguageResolved.owner;
        __workerNavigatorDescriptorModes__['language'] = 'native_skip';
        __patchLanguage = false;
      }
    } catch (e) {
      emitDegrade('warn', 'worker_patch_src:workernavigator_descriptor:compare_failed', {
        type: 'browser structure missing data',
        stage: 'runtime',
        module: 'WORKER_PATCH_SRC',
        surface: 'WorkerNavigator',
        key: 'language',
        policy: 'skip',
        action: 'native',
        data: { outcome: 'skip', reason: 'native_compare_failed' }
      }, e);
    }
    if (__patchLanguage) {
      def(proto,'language', getLanguage, true);
    }

    const getLanguages = function getLanguages(){
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      if (!Array.isArray(cache.snap.languages)) throw new Error('UACHPatch: bad languages');
      const currentValues = cache.snap.languages;
      const cachedValues = languagesCache.values;
      if (Array.isArray(cachedValues)
          && cachedValues.length === currentValues.length
          && cachedValues.every(function(value, index) { return value === currentValues[index]; })
          && Array.isArray(languagesCache.frozen)) {
        return languagesCache.frozen;
      }
      const out = currentValues.slice();
      try { Object.freeze(out); } catch(e) {
        emitDegrade('warn', 'worker_patch_src:languages:freeze_failed', {
          type: 'browser structure missing data',
          stage: 'runtime',
          module: 'WORKER_PATCH_SRC',
          surface: 'WorkerNavigator.languages',
          key: 'Object.freeze',
          policy: 'skip',
          action: 'native'
        }, e);
      }
      languagesCache.values = out.slice();
      languagesCache.frozen = out;
      return out;
    };
    let __patchLanguages = true;
    try {
      const nativeLanguagesResolved = readWorkerNavigatorNativeValue('languages');
      const nativeLanguages = nativeLanguagesResolved.value;
      const snapLanguages = cache.snap.languages;
      if (Array.isArray(nativeLanguages)
          && Array.isArray(snapLanguages)
          && nativeLanguages.length === snapLanguages.length
          && nativeLanguages.every(function(value, index) { return value === snapLanguages[index]; })) {
        __workerNavigatorPatchedOwners__['languages'] = nativeLanguagesResolved.owner;
        __workerNavigatorDescriptorModes__['languages'] = 'native_skip';
        __patchLanguages = false;
      }
    } catch (e) {
      emitDegrade('warn', 'worker_patch_src:workernavigator_descriptor:compare_failed', {
        type: 'browser structure missing data',
        stage: 'runtime',
        module: 'WORKER_PATCH_SRC',
        surface: 'WorkerNavigator',
        key: 'languages',
        policy: 'skip',
        action: 'native',
        data: { outcome: 'skip', reason: 'native_compare_failed' }
      }, e);
    }
    if (__patchLanguages) {
      def(proto,'languages', getLanguages, true);
    }


    const getDeviceMemory = function getDeviceMemory(){
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      const v = Number(cache.snap.deviceMemory);
      if (!Number.isFinite(v)) throw new Error('UACHPatch: bad deviceMemory');
      return v;
    };
    let __patchDeviceMemory = true;
    try {
      const nativeDeviceMemoryResolved = readWorkerNavigatorNativeValue('deviceMemory');
      const nativeDeviceMemory = Number(nativeDeviceMemoryResolved.value);
      const snapDeviceMemory = Number(cache.snap.deviceMemory);
      if (Number.isFinite(nativeDeviceMemory) && Number.isFinite(snapDeviceMemory) && Object.is(nativeDeviceMemory, snapDeviceMemory)) {
        __workerNavigatorPatchedOwners__['deviceMemory'] = nativeDeviceMemoryResolved.owner;
        __workerNavigatorDescriptorModes__['deviceMemory'] = 'native_skip';
        __patchDeviceMemory = false;
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
      def(proto, 'deviceMemory', getDeviceMemory, true);
    }

    const getHardwareConcurrency = function getHardwareConcurrency(){
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      const v = Number(cache.snap.hardwareConcurrency);
      if (!Number.isFinite(v)) throw new Error('UACHPatch: bad hardwareConcurrency');
      return v;
    };
    let __patchHardwareConcurrency = true;
    try {
      const nativeHardwareConcurrencyResolved = readWorkerNavigatorNativeValue('hardwareConcurrency');
      const nativeHardwareConcurrency = Number(nativeHardwareConcurrencyResolved.value);
      const snapHardwareConcurrency = Number(cache.snap.hardwareConcurrency);
      if (Number.isFinite(nativeHardwareConcurrency) && Number.isFinite(snapHardwareConcurrency) && Object.is(nativeHardwareConcurrency, snapHardwareConcurrency)) {
        __workerNavigatorPatchedOwners__['hardwareConcurrency'] = nativeHardwareConcurrencyResolved.owner;
        __workerNavigatorDescriptorModes__['hardwareConcurrency'] = 'native_skip';
        __patchHardwareConcurrency = false;
      }
    } catch (e) {
      emitDegrade('warn', 'worker_patch_src:workernavigator_descriptor:compare_failed', {
        type: 'browser structure missing data',
        stage: 'runtime',
        module: 'WORKER_PATCH_SRC',
        surface: 'WorkerNavigator',
        key: 'hardwareConcurrency',
        policy: 'skip',
        action: 'native',
        data: { outcome: 'skip', reason: 'native_compare_failed' }
      }, e);
    }
    if (__patchHardwareConcurrency) {
      def(proto, 'hardwareConcurrency', getHardwareConcurrency, true);
    }
    assertWorkerNavigatorDescriptor('userAgentData');
    assertWorkerNavigatorDescriptor('language');
    assertWorkerNavigatorDescriptor('languages');
    assertWorkerNavigatorDescriptor('deviceMemory');
    assertWorkerNavigatorDescriptor('hardwareConcurrency');

    const requireWebGLSnapshot = (s, where) => {
      const snap = requireSnap(s, where);
      const webgl = snap && snap.webgl;
      if (!webgl || typeof webgl !== 'object') throw new Error('UACHPatch: missing webgl');
      if (typeof webgl.vendor !== 'string' || !webgl.vendor) throw new Error('UACHPatch: bad webgl.vendor');
      if (typeof webgl.renderer !== 'string' || !webgl.renderer) throw new Error('UACHPatch: bad webgl.renderer');
      if (typeof webgl.unmaskedVendor !== 'string' || !webgl.unmaskedVendor) throw new Error('UACHPatch: bad webgl.unmaskedVendor');
      if (typeof webgl.unmaskedRenderer !== 'string' || !webgl.unmaskedRenderer) throw new Error('UACHPatch: bad webgl.unmaskedRenderer');
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
        throw new Error('UACHPatch: OffscreenCanvas.getContext descriptor missing');
      }
      const nativeGetContext = dGetContext.value;
      const patchedContexts = (typeof WeakSet === 'function') ? new WeakSet() : null;
      const debugInfoCache = (typeof WeakMap === 'function') ? new WeakMap() : null;
      if (!patchedContexts || !debugInfoCache) {
        throw new Error('UACHPatch: worker WebGL weak structures missing');
      }

      const patchContextInstance = (ctx) => {
        if (!ctx || (typeof ctx !== 'object' && typeof ctx !== 'function')) return ctx;
        if (patchedContexts.has(ctx)) return ctx;
        patchedContexts.add(ctx);

        const dGetParameter = Object.getOwnPropertyDescriptor(ctx, 'getParameter');
        const origGetParameter = (dGetParameter && typeof dGetParameter.value === 'function')
          ? dGetParameter.value
          : (typeof ctx.getParameter === 'function' ? ctx.getParameter : null);
        if (!origGetParameter) throw new Error('UACHPatch: worker WebGL getParameter missing');

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
          Object.defineProperty(wrappedGetExtensionRaw, '__coreBridgeTarget__', {
            value: origGetExtension,
            writable: true,
            configurable: true,
            enumerable: false
          });
          const wrappedGetExtension = markAsNative(wrappedGetExtensionRaw, 'getExtension');
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
        Object.defineProperty(wrappedGetParameterRaw, '__coreBridgeTarget__', {
          value: origGetParameter,
          writable: true,
          configurable: true,
          enumerable: false
        });
        const wrappedGetParameter = markAsNative(wrappedGetParameterRaw, 'getParameter');
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
      Object.defineProperty(wrappedGetContextRaw, '__coreBridgeTarget__', {
        value: nativeGetContext,
        writable: true,
        configurable: true,
        enumerable: false
      });
      const wrappedGetContext = markAsNative(wrappedGetContextRaw, 'getContext');
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
      const inlineContextPatch = runtimeRoot && runtimeRoot.inlineContextPatch;
      if (typeof inlineCoreWindow !== 'string' || !inlineCoreWindow) {
        throw new Error('UACHPatch: inlineCoreWindow missing');
      }
      if (typeof inlinePrng !== 'string' || !inlinePrng) {
        throw new Error('UACHPatch: inlinePrng missing');
      }
      if (typeof inlineCanvasPatch !== 'string' || !inlineCanvasPatch) {
        throw new Error('UACHPatch: inlineCanvasPatch missing');
      }
      if (typeof inlineContextPatch !== 'string' || !inlineContextPatch) {
        throw new Error('UACHPatch: inlineContextPatch missing');
      }
      return {
        runtimeRoot,
        inlineCoreWindow,
        inlinePrng,
        inlineCanvasPatch,
        inlineContextPatch
      };
    };

    const executeWorkerInlineModule = (source, exportName, label) => {
      if (typeof source !== 'string' || !source) {
        throw new Error('UACHPatch: ' + String(label || exportName || 'inlineModule') + ' source missing');
      }
      const runner = new Function('window', source + '\nreturn (typeof ' + exportName + ' === "function") ? ' + exportName + '(window) : null;');
      return runner(self);
    };
    const restoreWorkerFontsState = stateRoot => {
      if (!stateRoot || typeof stateRoot !== 'object') {
        throw new Error('UACHPatch: CanvasPatchContext.state missing for fonts restore');
      }
      const snap = (cache.snap && cache.snap.fontsState && typeof cache.snap.fontsState === 'object')
        ? cache.snap.fontsState
        : null;
      const cfgSnap = (cache.snap && cache.snap.fontsConfig && typeof cache.snap.fontsConfig === 'object')
        ? cache.snap.fontsConfig
        : null;
      if (!snap && !cfgSnap) return false;
      const ensureStateSlot = key => {
        const existing = (stateRoot[key] && typeof stateRoot[key] === 'object')
          ? stateRoot[key]
          : null;
        if (existing) return existing;
        trackedDefineProperty(stateRoot, key, {
          value: Object.create(null),
          writable: true,
          configurable: true,
          enumerable: false
        });
        return stateRoot[key];
      };
      const ensureFontsSubSlot = key => {
        const fontsRoot = ensureStateSlot('__FONTS__');
        const existing = (fontsRoot[key] && typeof fontsRoot[key] === 'object')
          ? fontsRoot[key]
          : null;
        if (existing) return existing;
        trackedDefineProperty(fontsRoot, key, {
          value: Object.create(null),
          writable: true,
          configurable: true,
          enumerable: false
        });
        return fontsRoot[key];
      };
      if (snap) {
        const fontsState = ensureFontsSubSlot('__STATE__');
        const familySnapshot = (snap.familySnapshot && typeof snap.familySnapshot === 'object')
          ? snap.familySnapshot
          : null;
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
          value: null,
          writable: true,
          configurable: true,
          enumerable: true
        });
        trackedDefineProperty(fontsState, 'awaitReadyStatus', {
          value: (typeof snap.awaitReadyStatus === 'string' && snap.awaitReadyStatus)
            ? snap.awaitReadyStatus
            : (snap.awaitReadyPending ? 'pending' : null),
          writable: true,
          configurable: true,
          enumerable: true
        });
        trackedDefineProperty(fontsState, 'awaitReadyResolve', {
          value: null,
          writable: true,
          configurable: true,
          enumerable: true
        });
        trackedDefineProperty(fontsState, 'awaitReadyReject', {
          value: null,
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
      const existingCanvasState = (self.CanvasPatchContext
        && typeof self.CanvasPatchContext === 'object'
        && self.CanvasPatchContext.state
        && typeof self.CanvasPatchContext.state === 'object'
        && self.CanvasPatchContext.state.__CANVAS__
        && typeof self.CanvasPatchContext.state.__CANVAS__ === 'object'
        && self.CanvasPatchContext.state.__CANVAS__.__STATE__
        && typeof self.CanvasPatchContext.state.__CANVAS__.__STATE__ === 'object')
        ? self.CanvasPatchContext.state.__CANVAS__.__STATE__
        : null;
      if (existingCanvasState && existingCanvasState.__WORKER_CANVAS_PATCH_INSTALLED__ === true) return true;

      const sources = resolveWorkerCanvasPatchSources();
      const runtimeRoot = sources.runtimeRoot;
      const C = (self.CanvasPatchContext && typeof self.CanvasPatchContext === 'object')
        ? self.CanvasPatchContext
        : (trackedDefineProperty(self, 'CanvasPatchContext', {
            value: Object.create(null),
            writable: true,
            configurable: true,
            enumerable: false
          }), self.CanvasPatchContext);
      const stateRoot = (C.state && typeof C.state === 'object')
        ? C.state
        : (trackedDefineProperty(C, 'state', {
            value: Object.create(null),
            writable: true,
            configurable: true,
            enumerable: false
          }), C.state);

      let Core = (self.Core && typeof self.Core === 'object')
        ? self.Core
        : null;
      if (!Core) {
        trackedDefineProperty(self, 'Core', {
          value: Object.create(null),
          writable: true,
          configurable: true,
          enumerable: false
        });
        Core = self.Core;
      }
      let coreInternal = (Core.__internal && typeof Core.__internal === 'object')
        ? Core.__internal
        : null;
      if (!coreInternal) {
        trackedDefineProperty(Core, '__internal', {
          value: Object.create(null),
          writable: true,
          configurable: true,
          enumerable: false
        });
        coreInternal = Core.__internal;
      }
      let prngRoot = (coreInternal.prng && typeof coreInternal.prng === 'object')
        ? coreInternal.prng
        : null;
      if (!prngRoot) {
        trackedDefineProperty(coreInternal, 'prng', {
          value: Object.create(null),
          writable: true,
          configurable: true,
          enumerable: false
        });
        prngRoot = coreInternal.prng;
      }
      if (typeof prngRoot.seed !== 'string') prngRoot.seed = '';
      if (typeof prngRoot.strToSeed !== 'function') prngRoot.strToSeed = null;
      if (typeof prngRoot.mulberry32 !== 'function') prngRoot.mulberry32 = null;
      if (!prngRoot.rand || typeof prngRoot.rand !== 'object') prngRoot.rand = null;
      if (!prngRoot.pools || typeof prngRoot.pools !== 'object') prngRoot.pools = Object.create(null);
      if (typeof prngRoot.marker !== 'string' || !prngRoot.marker) prngRoot.marker = 'envrand';
      if (typeof prngRoot.version !== 'string' || !prngRoot.version) prngRoot.version = '1.1.1';
      if (runtimeRoot && runtimeRoot.__CORE_TOSTRING_STATE__ && coreInternal.coreToStringState !== runtimeRoot.__CORE_TOSTRING_STATE__) {
        trackedDefineProperty(coreInternal, 'coreToStringState', {
          value: runtimeRoot.__CORE_TOSTRING_STATE__,
          writable: true,
          configurable: true,
          enumerable: false
        });
      }

      const seed = (self.CDP_GLOBAL_SEED != null) ? String(self.CDP_GLOBAL_SEED) : '';
      if (!seed) {
        throw new Error('UACHPatch: worker canvas seed missing');
      }
      const snapDpr = Number(cache.snap && cache.snap.dpr);
      if (Number.isFinite(snapDpr) && snapDpr > 0) {
        trackedDefineProperty(self, '__DPR', {
          value: snapDpr,
          writable: true,
          configurable: true,
          enumerable: false
        });
      }

      if (!(stateRoot && typeof stateRoot === 'object')) {
        throw new Error('UACHPatch: CanvasPatchContext.state missing');
      }
      const ensureWorkerCanvasStateSlot = () => {
        let canvasRoot = (stateRoot.__CANVAS__ && typeof stateRoot.__CANVAS__ === 'object')
          ? stateRoot.__CANVAS__
          : null;
        if (!canvasRoot) {
          trackedDefineProperty(stateRoot, '__CANVAS__', {
            value: Object.create(null),
            writable: true,
            configurable: true,
            enumerable: false
          });
          canvasRoot = stateRoot.__CANVAS__;
        }
        if (!(canvasRoot && typeof canvasRoot === 'object')) {
          throw new Error('UACHPatch: CanvasPatchContext.state.__CANVAS__ missing');
        }
        let canvasState = (canvasRoot.__STATE__ && typeof canvasRoot.__STATE__ === 'object')
          ? canvasRoot.__STATE__
          : null;
        if (!canvasState) {
          trackedDefineProperty(canvasRoot, '__STATE__', {
            value: {
              domReady: false,
              offscreenReady: false,
              domCanvas: null,
              domCanvasHost: null,
              offscreenCanvas: null,
              defaultCtx2dFont: ''
            },
            writable: true,
            configurable: true,
            enumerable: false
          });
          canvasState = canvasRoot.__STATE__;
        }
        if (!(canvasState && typeof canvasState === 'object')) {
          throw new Error('UACHPatch: CanvasPatchContext.state.__CANVAS__.__STATE__ missing');
        }
        return canvasState;
      };
      const canvasState = ensureWorkerCanvasStateSlot();
      restoreWorkerFontsState(stateRoot);

      executeWorkerInlineModule(sources.inlineCoreWindow, 'CoreWindowModule', 'inlineCoreWindow');
      executeWorkerInlineModule(sources.inlinePrng, 'RNGsetModule', 'inlinePrng');
      executeWorkerInlineModule(sources.inlineCanvasPatch, 'CanvasPatchModule', 'inlineCanvasPatch');
      executeWorkerInlineModule(sources.inlineContextPatch, 'ContextPatchModule', 'inlineContextPatch');

      const hooks = (self.CanvasPatchHooks && typeof self.CanvasPatchHooks === 'object')
        ? self.CanvasPatchHooks
        : null;
      const patchCtx = (self.CanvasPatchContext && typeof self.CanvasPatchContext === 'object')
        ? self.CanvasPatchContext
        : null;
      if (!patchCtx) {
        throw new Error('UACHPatch: worker CanvasPatchContext missing after install');
      }
      if (!hooks) {
        throw new Error('UACHPatch: worker CanvasPatchHooks missing after install');
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

      trackedDefineProperty(canvasState, '__WORKER_CANVAS_PATCH_INSTALLED__', {
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
        throw new Error('UACHPatch: invalid worker type');
      }
      const isModuleURL = isProbablyModuleWorkerURL(absUrl);
      if (t === 'classic' && isModuleURL) {
        throw new Error('UACHPatch: module worker URL with classic type');
      }
      return (t === 'module' || (!hasType && isModuleURL)) ? 'module' : 'classic';
    };

    const prev = self.__applyEnvSnapshot__;
    const applyWorkerSnapshot = s => {
      if (!s || typeof s !== 'object') throw new Error('UACHPatch: invalid snapshot');
      if (cache.snap === s) return;
      const prevSeed = (self.CDP_GLOBAL_SEED != null) ? String(self.CDP_GLOBAL_SEED) : null;
      cache.snap = requireSnap(s, 'apply');
      if (self.CDP_GLOBAL_SEED == null || String(self.CDP_GLOBAL_SEED) === '') {
        const e = new Error('UACHPatch: CDP_GLOBAL_SEED missing');
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
      if (typeof prev==='function') prev.call(self,s);
      // Paradigm: seed is immutable within session.
      const curSeed = (self.CDP_GLOBAL_SEED != null) ? String(self.CDP_GLOBAL_SEED) : null;
      if (prevSeed != null && curSeed != null && prevSeed !== curSeed) {
        throw new Error('UACHPatch: seed mutation is not allowed');
      }
    };
    self.__applyEnvSnapshot__ = applyWorkerSnapshot;
    cache.snap = requireSnap(self.__lastSnap__, 'bootstrap');
    if (self.CDP_GLOBAL_SEED == null || String(self.CDP_GLOBAL_SEED) === '') {
      const e = new Error('UACHPatch: CDP_GLOBAL_SEED missing');
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
    let __envSyncBcInstalled = false;
    if (!__envSyncBcInstalled) {
      if (typeof BroadcastChannel !== 'function') {
        throw new Error('UACHPatch: BroadcastChannel missing');
      }
      __envSyncBcInstalled = true;
      const bc = new BroadcastChannel('__ENV_SYNC__');
      bc.onmessage = ev => { const s = ev?.data?.__ENV_SYNC__?.envSnapshot; if (s) applyWorkerSnapshot(s); };
    }
    if (self.Worker && !self.Worker.__ENV_WRAPPED__) {
      const NativeWorker = self.Worker;
      const dWorker = Object.getOwnPropertyDescriptor(self, 'Worker');
      if (!dWorker) throw new Error('UACHPatch: Worker descriptor missing');
      const WrappedWorkerRaw = function Worker(url, opts){
        const abs = new URL(url, self.location && self.location.href || undefined).href;
        const workerType = resolveWorkerType(abs, opts);
        const snap = requireSnap(cache.snap, 'nested');
        const SNAP = JSON.stringify(snap);
        const USER = JSON.stringify(String(abs));
        const src = workerType === 'module'
          ? `(async function(){'use strict';Object.defineProperty(self,'__GW_BOOTSTRAP__',{value:true,writable:true,configurable:true,enumerable:false});Object.defineProperty(self,'__applyEnvSnapshot__',{value:function(s){self.__lastSnap__=s;},writable:true,configurable:true,enumerable:false});self.__applyEnvSnapshot__(${SNAP});if(!self.__ENV_SYNC_BC_INSTALLED__){self.__ENV_SYNC_BC_INSTALLED__=true;if(typeof BroadcastChannel!=='function') throw new Error('UACHPatch: BroadcastChannel missing');const bc=new BroadcastChannel('__ENV_SYNC__');bc.onmessage=ev=>{const s=ev&&ev.data&&ev.data.__ENV_SYNC__&&ev.data.__ENV_SYNC__.envSnapshot;if(s)self.__applyEnvSnapshot__(s);};}const USER=${USER};if(!USER||typeof USER!=='string') throw new Error('UACHPatch: missing user import');await import(USER);} )();export {};`
          : `(function(){'use strict';Object.defineProperty(self,'__GW_BOOTSTRAP__',{value:true,writable:true,configurable:true,enumerable:false});Object.defineProperty(self,'__applyEnvSnapshot__',{value:function(s){self.__lastSnap__=s;},writable:true,configurable:true,enumerable:false});self.__applyEnvSnapshot__(${SNAP});if(!self.__ENV_SYNC_BC_INSTALLED__){self.__ENV_SYNC_BC_INSTALLED__=true;if(typeof BroadcastChannel!=='function') throw new Error('UACHPatch: BroadcastChannel missing');const bc=new BroadcastChannel('__ENV_SYNC__');bc.onmessage=function(ev){var s=ev&&ev.data&&ev.data.__ENV_SYNC__&&ev.data.__ENV_SYNC__.envSnapshot;if(s)self.__applyEnvSnapshot__(s);};}var USER=${USER};if(!USER||typeof USER!=='string') throw new Error('UACHPatch: missing user import');var __isModuleURL=function(u){if(typeof u!=='string'||!u) return false; if(/\\.mjs(?:$|[?#])/i.test(u)) return true; if(/[?&]type=module(?:&|$)/i.test(u)) return true; if(/[?&]module(?:&|$)/i.test(u)) return true; if(/#module\\b/i.test(u)) return true; if(u.slice(0,5)==='data:'){ return /;module\\b/i.test(u) || /\\bmodule\\b/i.test(u.slice(0,80)); } return false;}; if(__isModuleURL(USER)) { return import(USER); } try { importScripts(USER); } catch(e) { return import(USER); }})();`;
        const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
        // Do not revoke immediately: the worker may still be fetching the bootstrap script.
        // Early revoke can surface as `importScripts(blob:...) failed to load` in real sites.
        return new NativeWorker(blobURL, { ...(opts || {}), type: workerType });
      };
      Object.defineProperty(WrappedWorkerRaw, '__coreBridgeTarget__', {
        value: NativeWorker,
        writable: true,
        configurable: true,
        enumerable: false
      });
      const WrappedWorker = markAsNative(WrappedWorkerRaw, 'Worker');
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
    self.__SCOPE_CONSISTENCY_PATCHED__ = true;

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
        'UACHPatch: language mismatch',
        { actual: sanity.language, expected: cache.snap.language }
      );
    }
    if (!Array.isArray(sanity.languages) || sanity.languages.join(',') !== cache.snap.languages.join(',')) {
      failWorkerNavigatorSanity(
        'worker_patch_src:workernavigator:sanity:mismatch',
        'languages',
        'UACHPatch: languages mismatch',
        { actual: sanity.languages, expected: cache.snap.languages }
      );
    }
    if (Number(sanity.deviceMemory) !== Number(cache.snap.deviceMemory)) {
      failWorkerNavigatorSanity(
        'worker_patch_src:workernavigator:sanity:mismatch',
        'deviceMemory',
        'UACHPatch: deviceMemory mismatch',
        { actual: sanity.deviceMemory, expected: cache.snap.deviceMemory }
      );
    }
    if (Number(sanity.hardwareConcurrency) !== Number(cache.snap.hardwareConcurrency)) {
      failWorkerNavigatorSanity(
        'worker_patch_src:workernavigator:sanity:mismatch',
        'hardwareConcurrency',
        'UACHPatch: hardwareConcurrency mismatch',
        { actual: sanity.hardwareConcurrency, expected: cache.snap.hardwareConcurrency }
      );
    }
    const sanityUAD = self.navigator && self.navigator.userAgentData;
    if (!sanityUAD || typeof sanityUAD !== 'object') {
      failWorkerNavigatorSanity(
        'worker_patch_src:workernavigator:sanity:mismatch',
        'userAgentData',
        'UACHPatch: userAgentData missing',
        { actual: sanityUAD, expected: cache.snap.uaData }
      );
    }
    if (!sameJson(sanityUAD.brands, cache.snap.uaData.brands)) {
      failWorkerNavigatorSanity(
        'worker_patch_src:workernavigator:sanity:mismatch',
        'userAgentData.brands',
        'UACHPatch: brands mismatch',
        { actual: sanityUAD.brands, expected: cache.snap.uaData.brands }
      );
    }
    if (sanityUAD.mobile !== cache.snap.uaData.mobile) {
      failWorkerNavigatorSanity(
        'worker_patch_src:workernavigator:sanity:mismatch',
        'userAgentData.mobile',
        'UACHPatch: mobile mismatch',
        { actual: sanityUAD.mobile, expected: cache.snap.uaData.mobile }
      );
    }
    if (sanityUAD.platform !== cache.snap.uaData.platform) {
      failWorkerNavigatorSanity(
        'worker_patch_src:workernavigator:sanity:mismatch',
        'userAgentData.platform',
        'UACHPatch: platform mismatch',
        { actual: sanityUAD.platform, expected: cache.snap.uaData.platform }
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
        'UACHPatch: fullVersionList mismatch',
        { actual: sanityFullVersionList, expected: cache.snap.uaData.he.fullVersionList }
      );
    }
    try {
      const expectedHe = cache.snap.uaData && cache.snap.uaData.he ? cache.snap.uaData.he : null;
      const sanityHePromise = sanityUAD.getHighEntropyValues(['platformVersion','fullVersionList','architecture','bitness','model','wow64','formFactors']);
      if (!sanityHePromise || typeof sanityHePromise.then !== 'function') {
        failWorkerNavigatorSanity(
          'worker_patch_src:workernavigator:sanity:mismatch',
          'userAgentData.getHighEntropyValues',
          'UACHPatch: high entropy promise contract failed',
          { actual: sanityHePromise, expected: expectedHe }
        );
      }
      sanityHePromise.then(function(sanityHe) {
        if (!expectedHe || typeof expectedHe !== 'object') {
          failWorkerNavigatorSanity(
            'worker_patch_src:workernavigator:sanity:mismatch',
            'userAgentData.getHighEntropyValues',
            'UACHPatch: high entropy snapshot missing',
            { actual: sanityHe, expected: expectedHe }
          );
        }
        const sanityHeProjection = {
          platformVersion: sanityHe && sanityHe.platformVersion,
          fullVersionList: sanityHe && sanityHe.fullVersionList,
          architecture: sanityHe && sanityHe.architecture,
          bitness: sanityHe && sanityHe.bitness,
          model: sanityHe && sanityHe.model,
          wow64: sanityHe && sanityHe.wow64,
          formFactors: sanityHe && sanityHe.formFactors
        };
        const expectedHeProjection = {
          platformVersion: expectedHe.platformVersion,
          fullVersionList: expectedHe.fullVersionList,
          architecture: expectedHe.architecture,
          bitness: expectedHe.bitness,
          model: expectedHe.model,
          wow64: expectedHe.wow64,
          formFactors: expectedHe.formFactors
        };
        if (!sameJson(sanityHeProjection, expectedHeProjection)) {
          failWorkerNavigatorSanity(
            'worker_patch_src:workernavigator:sanity:mismatch',
            'userAgentData.getHighEntropyValues',
            'UACHPatch: high entropy mismatch',
            { actual: sanityHeProjection, expected: expectedHeProjection }
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
      message: "worker patch installed",
      data: {
        core: true,
        mirror: __uachMirrorInstalled__ === true,
        scope: !!self.__SCOPE_CONSISTENCY_PATCHED__
      },
      type: "pipeline missing data"
    };
    emitDegrade('info', 'worker_patch_src:apply:installed', __workerCtx, null);
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
  Object.defineProperty(self, '__installWorkerUACHMirror__', {
    value: __installWorkerUACHMirror__,
    writable: true,
    configurable: true,
    enumerable: false
  });
})();

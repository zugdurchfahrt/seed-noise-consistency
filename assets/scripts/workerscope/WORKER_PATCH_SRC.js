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
  if (self.installWorkerUACHMirror) {
    throw new Error('UACHPatch: installWorkerUACHMirror already defined');
  }
  self.__WORKER_PATCH_LOADED__ = true;

  self.installWorkerUACHMirror = function installWorkerUACHMirror(){
    if (self.__UACH_MIRROR_INSTALLED__) {
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
    const emitDegrade = (level, code, ctx, err) => {
      const d = (typeof __DEGRADE__ === "function") ? __DEGRADE__ : null;
      const relay = (typeof self.__ENV_RELAY_DIAG__ === 'function') ? self.__ENV_RELAY_DIAG__ : null;
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
      if (d) {
        if (typeof d.diag === "function") {
          d.diag(level, code, normalizedCtx, err || null);
        } else {
          d(code, err || null, Object.assign({}, normalizedCtx, { level: level || 'info' }));
        }
      }
      if (relay) {
        relay(level, code, normalizedCtx, err || null);
      }
    };
    const appliedDescriptors = [];
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
      for (let i = appliedDescriptors.length - 1; i >= 0; i -= 1) {
        const item = appliedDescriptors[i];
        if (!item || !item.obj) continue;
        if (item.hadOwn && item.prevDesc) {
          Object.defineProperty(item.obj, item.key, item.prevDesc);
        } else {
          delete item.obj[item.key];
        }
      }
    };
    const validDpr = v => Number.isFinite(v) && v > 0;
    const HE_KEYS = ['architecture','bitness','model','platformVersion','fullVersionList','wow64','formFactors'];
    const LE_KEYS = ['brands','mobile','platform'];
    const ALL_KEYS = new Set(HE_KEYS.concat(LE_KEYS));
    const requireSnap = (s, where) => {
      if (!s || typeof s !== 'object') {
        const msg = where ? `UACHPatch: no snapshot (${where})` : 'UACHPatch: no snapshot';
        throw new Error(msg);
      }
      if (typeof s.language !== 'string' || s.language.trim() === '') throw new Error('UACHPatch: bad language');
      if (!Array.isArray(s.languages)) throw new Error('UACHPatch: bad languages');
      if (!Number.isFinite(Number(s.deviceMemory))) throw new Error('UACHPatch: bad deviceMemory');
      if (!Number.isFinite(Number(s.hardwareConcurrency))) throw new Error('UACHPatch: bad hardwareConcurrency');
      if (!s.uaData) throw new Error('UACHPatch: missing userAgentData');
      const he = (s.uaData && s.uaData.he) || s.highEntropy;
      if (!he || typeof he !== 'object') throw new Error('UACHPatch: missing highEntropy');
      for (const k of HE_KEYS) {
        if (!(k in he)) throw new Error(`UACHPatch: missing highEntropy.${k}`);
        const v = he[k];
        if (v === undefined || v === null) throw new Error(`UACHPatch: bad highEntropy.${k}`);
        // if (typeof v === 'string' && !v) throw new Error(`UACHPatch: bad highEntropy.${k}`);
        if (typeof v === 'string' && !v && k !== 'model') throw new Error(`UACHPatch: bad highEntropy.${k}`);
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
    // Seed must be obtained once and then treated as immutable within session; hide it from enumeration.
    try {
      Object.defineProperty(self, 'CDP_GLOBAL_SEED', {
        value: seedInit,
        writable: false,
        configurable: true,
        enumerable: false
      });
    } catch (e) {
      emitDegrade('warn', 'worker_patch_src:seed:apply:seal_failed', {
        type: 'browser structure missing data',
        stage: 'apply',
        module: 'WORKER_PATCH_SRC',
        surface: 'CDP_GLOBAL_SEED',
        key: 'CDP_GLOBAL_SEED',
        policy: 'skip',
        action: 'native'
      }, e);
      self.CDP_GLOBAL_SEED = seedInit;
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

    const state = self.__CORE_TOSTRING_STATE__ || null;
    if (!state) {
      const e = new Error('UACHPatch: __CORE_TOSTRING_STATE__ missing');
      emitDegrade('error', 'worker_patch_src:state:preflight:missing', {
        type: 'pipeline missing data',
        stage: 'preflight',
        module: 'WORKER_PATCH_SRC',
        surface: '__CORE_TOSTRING_STATE__',
        key: '__CORE_TOSTRING_STATE__',
        policy: 'throw',
        action: 'throw'
      }, e);
      throw e;
    }
    if (state.__CORE_TOSTRING_STATE__ !== true) {
      const e = new Error('UACHPatch: __CORE_TOSTRING_STATE__ marker invalid');
      emitDegrade('error', 'worker_patch_src:state:contract:marker_invalid', {
        type: 'pipeline missing data',
        stage: 'contract',
        module: 'WORKER_PATCH_SRC',
        surface: '__CORE_TOSTRING_STATE__',
        key: '__CORE_TOSTRING_STATE__',
        policy: 'throw',
        action: 'throw'
      }, e);
      throw e;
    }
    const overrideMap = state.overrideMap;
    const proxyTargetMap = state.proxyTargetMap;
    if (!(overrideMap instanceof WeakMap) || !(proxyTargetMap instanceof WeakMap)) {
      const e = new Error('UACHPatch: __CORE_TOSTRING_STATE__ invalid');
      emitDegrade('error', 'worker_patch_src:state:contract:invalid', {
        type: 'pipeline missing data',
        stage: 'contract',
        module: 'WORKER_PATCH_SRC',
        surface: '__CORE_TOSTRING_STATE__',
        key: '__CORE_TOSTRING_STATE__',
        policy: 'throw',
        action: 'throw'
      }, e);
      throw e;
    }
    function resolveToStringBridgeTarget(candidate) {
      if (typeof candidate !== 'function') return null;
      let bridgeTarget = candidate;
      const seenBridgeTargets = new WeakSet();
      while (typeof bridgeTarget === 'function') {
        if (seenBridgeTargets.has(bridgeTarget)) {
          const e = new Error('UACHPatch: toString bridge cycle in state');
          emitDegrade('error', 'worker_patch_src:tostring:contract:bridge_cycle', {
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
        seenBridgeTargets.add(bridgeTarget);
        const nextTarget = proxyTargetMap.get(bridgeTarget);
        if (typeof nextTarget !== 'function') break;
        bridgeTarget = nextTarget;
      }
      return (typeof bridgeTarget === 'function') ? bridgeTarget : null;
    }
    const nativeToString = resolveToStringBridgeTarget(state.nativeToString);
    if (typeof nativeToString !== 'function') {
      const e = new Error('UACHPatch: __CORE_TOSTRING_STATE__.nativeToString invalid');
      emitDegrade('error', 'worker_patch_src:state:contract:native_toString_invalid', {
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

    // sanity: toString state must reflect labels written by seed markAsNative
    {
      const probe = function probe(){};
      markAsNative(probe);
      const expected = overrideMap.get(probe);
      if (expected === undefined) {
        const e = new Error('UACHPatch: toString probe missing label');
        emitDegrade('error', 'worker_patch_src:tostring:contract:probe_missing', {
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
      const actual = Function.prototype.toString.call(probe);
      if (actual !== expected) {
        const e = new Error('UACHPatch: toString state mismatch');
        emitDegrade('error', 'worker_patch_src:tostring:contract:state_mismatch', {
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
      const directProbe = function workerPatchDirectProbe(){};
      const expectedNative = Reflect.apply(nativeToString, directProbe, []);
      const actualNative = Function.prototype.toString.call(directProbe);
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

    markAsNative(seedEnsure, '__ensureMarkAsNative');


    try {
    const getDevicePixelRatio = markAsNative(function getDevicePixelRatio(){
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      if (!('dpr' in cache.snap)) throw new Error('UACHPatch: no dpr');
      const snapVal = Number(cache.snap.dpr);
      if (validDpr(snapVal)) return snapVal;
      throw new Error('UACHPatch: bad dpr');
    }, 'get devicePixelRatio');
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
    const isUadThis = (self) => (self === nativeUAD);
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
    trackedDefineProperties(uadProto, {
      brands:   { get: markAsNative(function getBrands(){
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
                      }, 'get brands'), enumerable: !!dBrands.enumerable, configurable: !!dBrands.configurable, set: dBrands.set },
      mobile:   { get: markAsNative(function getMobile(){
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
                      }, 'get mobile'),       enumerable: !!dMobile.enumerable, configurable: !!dMobile.configurable, set: dMobile.set },
      platform: { get: markAsNative(function getPlatform(){
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
                      }, 'get platform'), enumerable: !!dPlatform.enumerable, configurable: !!dPlatform.configurable, set: dPlatform.set },
    });
    const dFull = Object.getOwnPropertyDescriptor(uadProto, 'fullVersionList');
    const origFullGet = dFull && dFull.get;
    const origFullDataValue = (dFull
      && Object.prototype.hasOwnProperty.call(dFull, 'value')
      && !dFull.get
      && !dFull.set) ? dFull.value : undefined;
    const getFullVersionList = markAsNative(function getFullVersionList(){
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
    }, 'get fullVersionList');
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
    const toJSON = markAsNative(function toJSON(){
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
    }, 'toJSON');
    trackedDefineProperty(uadProto, 'toJSON', {
      configurable: dToJSON ? !!dToJSON.configurable : true,
      enumerable: dToJSON ? !!dToJSON.enumerable : false,
      writable: dToJSON && Object.prototype.hasOwnProperty.call(dToJSON, 'writable') ? dToJSON.writable : true,
      value: toJSON
    });
    const dGHEV = Object.getOwnPropertyDescriptor(uadProto, 'getHighEntropyValues');
    const origGHEV = dGHEV && dGHEV.value;
    const getHighEntropyValues = markAsNative(function getHighEntropyValues(keys){
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
          for (const k of keys) {
            if (typeof k !== 'string' || !k) {
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
          }
          const s = cache.snap;
          const le = s.uaData;
          if (!le || typeof le !== 'object') throw new Error('UACHPatch: missing userAgentData');
          const src = s.highEntropy;
          if (!src || typeof src !== 'object') throw new Error('UACHPatch: missing highEntropy');
          const map = {
            brands: le.brands,
            mobile: le.mobile,
            platform: le.platform,
            architecture: src.architecture,
            bitness: src.bitness,
            model: src.model,
            platformVersion: src.platformVersion,
            fullVersionList: src.fullVersionList,
            wow64: src.wow64,
            formFactors: src.formFactors
          };
          const out = {};
          for (const k of keys) {
            if (!(k in map)) continue;
            const v = map[k];
            if (v === undefined || v === null || (typeof v === 'string' && !v && k !== 'model') || (Array.isArray(v) && !v.length)) {
              emitDegrade('warn', 'worker_patch_src:get_high_entropy_values_native_fallback', {
                stage: 'runtime',
                surface: 'WorkerNavigatorUAData',
                key: k,
                message: 'getHighEntropyValues fallback to native',
                type: 'pipeline missing data',
                data: { outcome: 'skip', reason: 'get_high_entropy_values_native_fallback' }
              }, null);
              return origGHEV.call(this, keys);
            }
            out[k] = deep(v);
          }
          return Promise.resolve(out);
        } catch (e) {
          emitDegrade('warn', 'worker_patch_src:get_high_entropy_values_native_fallback', {
            stage: 'runtime',
            surface: 'WorkerNavigatorUAData',
            key: 'getHighEntropyValues',
            message: 'getHighEntropyValues fallback to native',
            type: 'pipeline missing data',
            data: { outcome: 'skip', reason: 'get_high_entropy_values_native_fallback' }
          }, e);
          if (typeof origGHEV === 'function') return origGHEV.call(this, keys);
          throw e;
        }
      }, 'getHighEntropyValues');
    trackedDefineProperty(uadProto, 'getHighEntropyValues', {
      configurable: dGHEV ? !!dGHEV.configurable : true,
      enumerable: dGHEV ? !!dGHEV.enumerable : false,
      writable: dGHEV && Object.prototype.hasOwnProperty.call(dGHEV, 'writable') ? dGHEV.writable : true,
      value: getHighEntropyValues
    });

    const makeGuardedGetter = (k, owner, patchedGet, origGet) => {
      if (typeof origGet !== 'function') {
        throw new Error(`UACHPatch: ${k} native getter missing`);
      }
      const impl = function(){
        const recv = this;
        if (recv === nav) {
          try {
            return Reflect.apply(patchedGet, recv, []);
          } catch (e) {
            emitDegrade('warn', 'worker_patch_src:getter_native_fallback', {
              stage: 'runtime',
              surface: 'WorkerNavigator',
              key: k,
              message: 'worker navigator getter fallback to native',
              type: 'pipeline missing data',
              data: { outcome: 'skip', reason: 'getter_native_fallback' }
            }, e);
            return Reflect.apply(origGet, recv, []);
          }
        }
        try {
          return Reflect.apply(origGet, recv, []);
        } catch (e) {
          emitDegrade('warn', 'worker_patch_src:workernavigator_illegal_invocation', {
            stage: 'runtime',
            surface: 'WorkerNavigator',
            key: k,
            message: 'worker navigator getter illegal invocation',
            type: 'browser structure missing data',
            data: { outcome: 'throw', reason: 'native_illegal_invocation' }
          }, e);
          throw e;
        }
      };

      // IMPORTANT: native getters have stable `name` like "get hardwareConcurrency".
      // `markAsNative()` only patches toString-labels, so we must produce a named getter function.
      let wrapped = impl;
      if (typeof k === 'string' && k) {
        try {
          const isIdent = /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(k);
          if (isIdent) {
            // Static accessor name keeps engine-facing source form stable (avoids computed "[k]" leakage).
            const buildAccessor = new Function('impl', `return ({ get ${k}() { return impl.call(this); } });`);
            const acc = buildAccessor(impl);
            const d = Object.getOwnPropertyDescriptor(acc, k);
            if (d && typeof d.get === 'function') wrapped = d.get;
          } else {
            const acc = ({ get [k]() { return impl.call(this); } });
            const d = Object.getOwnPropertyDescriptor(acc, k);
            if (d && typeof d.get === 'function') wrapped = d.get;
          }
        } catch (e) {
          emitDegrade('warn', 'worker_patch_src:getter:apply:name_failed', {
            type: 'browser structure missing data',
            stage: 'apply',
            module: 'WORKER_PATCH_SRC',
            surface: 'makeGuardedGetter',
            key: 'name',
            policy: 'skip',
            action: 'skip'
          }, e);
        }
      }

      return markAsNative(wrapped, `get ${k}`);
    };

    const def = (obj, k, getter, enumerable = true) => {
      // По методологии: не молчим, если некуда ставить
      if (!nav) throw new Error(`UACHPatch: cannot define ${k} (no navigator)`);
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

      // 1) Если свойство уже есть как OWN на navigator — патчим ТУДА.
      // Иначе прототипный getter никогда не сработает.
      const own = Object.getOwnPropertyDescriptor(nav, k);
      if (own) {
        if (own.configurable === false) {
          throw new Error(`UACHPatch: ${k} not configurable on navigator`);
        }
        const ownOrigGet = resolveNativeGetter(own, 'navigator');
        const ownGuardedGet = makeGuardedGetter(k, nav, getter, ownOrigGet);
        trackedDefineProperty(nav, k, {
          configurable: !!own.configurable,
          enumerable: !!own.enumerable,
          get: ownGuardedGet,
          set: own && Object.prototype.hasOwnProperty.call(own, 'set') ? own.set : undefined
        });
        return;
      }

      // 2) Иначе — патчим на proto (как раньше)
      if (obj) {
        // CORE 4.1: descriptor-owner по proto-chain (не всегда OWN на ближайшем proto)
        let owner = obj;
        let d = null;
        for (let o = obj; o; o = Object.getPrototypeOf(o)) {
          try { d = Object.getOwnPropertyDescriptor(o, k) || null; } catch (_) { d = null; }
          if (d) { owner = o; break; }
        }
        if (!d) {
          throw new Error(`UACHPatch: ${k} native descriptor missing on proto-chain`);
        }
        if (d.configurable === false) {
          throw new Error(`UACHPatch: ${k} not configurable on proto-chain`);
        }
        const protoOrigGet = resolveNativeGetter(d, 'proto-chain');
        const protoGuardedGet = makeGuardedGetter(k, obj, getter, protoOrigGet);
        trackedDefineProperty(owner, k, {
          configurable: d ? !!d.configurable : true,
          enumerable: d ? !!d.enumerable : !!enumerable,
          get: protoGuardedGet,
          set: d && Object.prototype.hasOwnProperty.call(d, 'set') ? d.set : undefined
        });
        return;
      }

      throw new Error(`UACHPatch: cannot define ${k} (no proto)`);
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
    const assertWorkerNavigatorDescriptor = (k) => {
      const owner = (typeof WorkerNavigator !== 'undefined' && WorkerNavigator.prototype) || proto || null;
      if (!owner) {
        failWorkerNavigatorSanity(
          'worker_patch_src:workernavigator_descriptor:sanity:owner_missing',
          k,
          `UACHPatch: ${k} descriptor owner missing`
        );
      }
      // CORE 4.1: descriptor-owner по proto-chain
      let d = null;
      for (let o = owner; o; o = Object.getPrototypeOf(o)) {
        try { d = Object.getOwnPropertyDescriptor(o, k) || null; } catch (_) { d = null; }
        if (d) break;
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
      if (!hasGetter || hasValue) {
        failWorkerNavigatorSanity(
          'worker_patch_src:workernavigator_descriptor:sanity:mismatch',
          k,
          `UACHPatch: ${k} descriptor shape mismatch`,
          {
            hasGetter,
            hasSetter: typeof d.set === 'function',
            hasValue,
            configurable: !!d.configurable,
            enumerable: !!d.enumerable
          }
        );
      }
    };


    const getLanguage = markAsNative(function getLanguage(){
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      if (typeof cache.snap.language !== 'string' || cache.snap.language.trim() === '') throw new Error('UACHPatch: bad language');
      return cache.snap.language;
    }, 'get language');
    def(proto,'language', getLanguage, true);

    const getLanguages = markAsNative(function getLanguages(){
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      if (!Array.isArray(cache.snap.languages)) throw new Error('UACHPatch: bad languages');
      const out = cache.snap.languages.slice();
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
      return out;
    }, 'get languages');
    def(proto,'languages', getLanguages, true);


    const getDeviceMemory = markAsNative(function getDeviceMemory(){
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      const v = Number(cache.snap.deviceMemory);
      if (!Number.isFinite(v)) throw new Error('UACHPatch: bad deviceMemory');
      return v;
    }, 'get deviceMemory');
    def(proto, 'deviceMemory', getDeviceMemory, true);

    const getHardwareConcurrency = markAsNative(function getHardwareConcurrency(){
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      const v = Number(cache.snap.hardwareConcurrency);
      if (!Number.isFinite(v)) throw new Error('UACHPatch: bad hardwareConcurrency');
      return v;
    }, 'get hardwareConcurrency');
    def(proto, 'hardwareConcurrency', getHardwareConcurrency, true);
    assertWorkerNavigatorDescriptor('language');
    assertWorkerNavigatorDescriptor('languages');
    assertWorkerNavigatorDescriptor('deviceMemory');
    assertWorkerNavigatorDescriptor('hardwareConcurrency');




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
    self.__applyEnvSnapshot__ = s => {
      if (!s || typeof s !== 'object') throw new Error('UACHPatch: invalid snapshot');
      if (cache.snap === s) return;
      const prevSeed = (self.CDP_GLOBAL_SEED != null) ? String(self.CDP_GLOBAL_SEED) : null;
      cache.snap = requireSnap(s, 'apply');
      if (self.CDP_GLOBAL_SEED == null || String(self.CDP_GLOBAL_SEED) === '') {
        throw new Error('UACHPatch: CDP_GLOBAL_SEED missing');
      }
      if (typeof prev==='function') prev.call(self,s);
      // Paradigm: seed is immutable within session.
      const curSeed = (self.CDP_GLOBAL_SEED != null) ? String(self.CDP_GLOBAL_SEED) : null;
      if (prevSeed != null && curSeed != null && prevSeed !== curSeed) {
        throw new Error('UACHPatch: seed mutation is not allowed');
      }
    };
    cache.snap = requireSnap(self.__lastSnap__, 'bootstrap');
    if (self.CDP_GLOBAL_SEED == null || String(self.CDP_GLOBAL_SEED) === '') {
      throw new Error('UACHPatch: CDP_GLOBAL_SEED missing');
    }
    if (!self.__ENV_SYNC_BC_INSTALLED__) {
      if (typeof BroadcastChannel !== 'function') {
        throw new Error('UACHPatch: BroadcastChannel missing');
      }
      self.__ENV_SYNC_BC_INSTALLED__ = true;
      const bc = new BroadcastChannel('__ENV_SYNC__');
      bc.onmessage = ev => { const s = ev?.data?.__ENV_SYNC__?.envSnapshot; if (s) self.__applyEnvSnapshot__(s); };
    }
    if (self.Worker && !self.Worker.__ENV_WRAPPED__) {
      const NativeWorker = self.Worker;
      const dWorker = Object.getOwnPropertyDescriptor(self, 'Worker');
      if (!dWorker) throw new Error('UACHPatch: Worker descriptor missing');
      const WrappedWorker = markAsNative(function Worker(url, opts){
        const abs = new URL(url, self.location && self.location.href || undefined).href;
        const workerType = resolveWorkerType(abs, opts);
        const snap = requireSnap(self.__lastSnap__, 'nested');
        const SNAP = JSON.stringify(snap);
        const USER = JSON.stringify(String(abs));
        const src = workerType === 'module'
          ? `(async function(){'use strict';self.__GW_BOOTSTRAP__=true;self.__applyEnvSnapshot__=s=>{self.__lastSnap__=s;};self.__applyEnvSnapshot__(${SNAP});if(!self.__ENV_SYNC_BC_INSTALLED__){self.__ENV_SYNC_BC_INSTALLED__=true;if(typeof BroadcastChannel!=='function') throw new Error('UACHPatch: BroadcastChannel missing');const bc=new BroadcastChannel('__ENV_SYNC__');bc.onmessage=ev=>{const s=ev&&ev.data&&ev.data.__ENV_SYNC__&&ev.data.__ENV_SYNC__.envSnapshot;if(s)self.__applyEnvSnapshot__(s);};}const USER=${USER};if(!USER||typeof USER!=='string') throw new Error('UACHPatch: missing user import');await import(USER);} )();export {};`
          : `(function(){'use strict';self.__GW_BOOTSTRAP__=true;self.__applyEnvSnapshot__=function(s){self.__lastSnap__=s;};self.__applyEnvSnapshot__(${SNAP});if(!self.__ENV_SYNC_BC_INSTALLED__){self.__ENV_SYNC_BC_INSTALLED__=true;if(typeof BroadcastChannel!=='function') throw new Error('UACHPatch: BroadcastChannel missing');const bc=new BroadcastChannel('__ENV_SYNC__');bc.onmessage=function(ev){var s=ev&&ev.data&&ev.data.__ENV_SYNC__&&ev.data.__ENV_SYNC__.envSnapshot;if(s)self.__applyEnvSnapshot__(s);};}var USER=${USER};if(!USER||typeof USER!=='string') throw new Error('UACHPatch: missing user import');var __isModuleURL=function(u){if(typeof u!=='string'||!u) return false; if(/\\.mjs(?:$|[?#])/i.test(u)) return true; if(/[?&]type=module(?:&|$)/i.test(u)) return true; if(/[?&]module(?:&|$)/i.test(u)) return true; if(/#module\\b/i.test(u)) return true; if(u.slice(0,5)==='data:'){ return /;module\\b/i.test(u) || /\\bmodule\\b/i.test(u.slice(0,80)); } return false;}; if(__isModuleURL(USER)) { return import(USER); } try { importScripts(USER); } catch(e) { return import(USER); }})();`;
        const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
        // Do not revoke immediately: the worker may still be fetching the bootstrap script.
        // Early revoke can surface as `importScripts(blob:...) failed to load` in real sites.
        return new NativeWorker(blobURL, { ...(opts || {}), type: workerType });
      }, 'Worker');
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
    self.__UACH_MIRROR_INSTALLED__ = true;

    const __workerDegrade = (typeof __DEGRADE__ === "function") ? __DEGRADE__ : null;
    const __workerDegradeDiag = (__workerDegrade && typeof __workerDegrade.diag === "function")
      ? __workerDegrade.diag.bind(__workerDegrade)
      : null;
    const __workerCtx = {
      module: "WORKER_PATCH_SRC",
      diagTag: "worker_patch",
      surface: "worker",
      key: "installWorkerUACHMirror",
      stage: "apply",
      message: "worker patch installed",
      data: {
        core: true,
        mirror: !!self.__UACH_MIRROR_INSTALLED__,
        scope: !!self.__SCOPE_CONSISTENCY_PATCHED__
      },
      type: "pipeline missing data"
    };
    emitDegrade('info', 'WORKER_PATCH_SRC:worker_patch', __workerCtx, null);
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
})();

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
    self.__UACH_MIRROR_INSTALLED__ = true;
    const nav = self.navigator;
    const proto = (typeof WorkerNavigator!=='undefined' && WorkerNavigator.prototype) || Object.getPrototypeOf(nav);
    if (!proto && !nav) {
      throw new Error('UACHPatch: WorkerNavigator unavailable');
    }
    const cache = { snap:null };
    const validDpr = v => Number.isFinite(v) && v > 0;
    const HE_KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
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
      if (!s.uaData && !s.uaCH) throw new Error('UACHPatch: missing userAgentData');
      const he = (s.uaData && s.uaData.he) || (s.uaCH && s.uaCH.he) || s.highEntropy || (s.uaCH && s.uaCH.highEntropy);
      if (!he || typeof he !== 'object') throw new Error('UACHPatch: missing highEntropy');
      for (const k of HE_KEYS) {
        if (!(k in he)) throw new Error(`UACHPatch: missing highEntropy.${k}`);
        const v = he[k];
        if (v === undefined || v === null) throw new Error(`UACHPatch: bad highEntropy.${k}`);
        if (typeof v === 'string');
        if (Array.isArray(v) && !v.length) throw new Error(`UACHPatch: bad highEntropy.${k}`);
      }
      return s;
    };
    cache.snap = requireSnap(self.__lastSnap__, 'init');

    const nativeToString = self.__NativeToString || Function.prototype.toString;
    if (typeof nativeToString !== 'function') {
      throw new Error('UACHPatch: Function.prototype.toString missing');
    }
    if (!self.__NativeToString) self.__NativeToString = nativeToString;

    const toStringMap = (self.__NativeToStringMap instanceof WeakMap)
      ? self.__NativeToStringMap
      : new WeakMap();
    self.__NativeToStringMap = toStringMap;

    const existingMarkAsNative = (typeof self.markAsNative === 'function') ? self.markAsNative : null;
    const markAsNative = (func, name) => {
      if (typeof func !== 'function') return func;
      const out = existingMarkAsNative ? existingMarkAsNative(func, name) : func;
      const target = (typeof out === 'function') ? out : func;
      try {
        const n = name || target.name || "";
        const label = n ? `function ${n}() { [native code] }` : 'function () { [native code] }';
        toStringMap.set(target, label);
      } catch (_) {}
      return out;
    };
    if (!self.__TOSTRING_PROXY_INSTALLED__) {
      function toString() {
        // IMPORTANT: do not touch WeakMap for primitives/null/undefined
        const t = typeof this;
        const isObj = (this !== null) && (t === 'function' || t === 'object');

        if (isObj && toStringMap.has(this)) {
          return toStringMap.get(this);
        }
        // preserve native TypeError + semantics
        return nativeToString.call(this);
      }

      // make wrapper look native via the same mechanism
      markAsNative(toString, 'toString');

      Object.defineProperty(Function.prototype, 'toString', {
        value: toString,
        writable: true,
        configurable: true,
        enumerable: false
      });
      self.__TOSTRING_PROXY_INSTALLED__ = true;
    }
    self.markAsNative = markAsNative;

    const getDevicePixelRatio = markAsNative(function getDevicePixelRatio(){
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      if (!('dpr' in cache.snap)) throw new Error('UACHPatch: no dpr');
      const snapVal = Number(cache.snap.dpr);
      if (validDpr(snapVal)) return snapVal;
      throw new Error('UACHPatch: bad dpr');
    }, 'get devicePixelRatio');
    Object.defineProperty(self, 'devicePixelRatio', {
      configurable: true,
      enumerable: false,
      get: getDevicePixelRatio
    });

    const deep = v => v==null ? v : JSON.parse(JSON.stringify(v));
    const toBrands = a => {
      if (!Array.isArray(a)) throw new Error('THW: uaData.brands missing');
      return a.map(x => {
        if (!x || typeof x !== 'object') throw new Error('THW: uaData.brand entry');
        const brand = (typeof x.brand === 'string' && x.brand) ? x.brand
                    : (typeof x.name === 'string' && x.name) ? x.name
                    : null;
        if (!brand) throw new Error('THW: uaData.brand missing');
        let versionRaw = null;
        if (typeof x.version === 'string') {
          if (!x.version) throw new Error('THW: uaData.brand version missing');
          versionRaw = x.version;
        } else if (typeof x.version === 'number' && Number.isFinite(x.version)) {
          versionRaw = String(x.version);
        } else {
          throw new Error('THW: uaData.brand version missing');
        }
        const major = String(versionRaw).split('.')[0];
        if (!major) throw new Error('THW: uaData.brand version missing');
        return { brand: String(brand), version: String(major) };
      });
    };
    const nativeUAD = nav && nav.userAgentData;
    if (!nativeUAD) throw new Error('THW: worker navigator.userAgentData missing');
    const uadProto = Object.getPrototypeOf(nativeUAD);
    if (!uadProto) throw new Error('THW: worker navigator.userAgentData proto missing');
    Object.defineProperties(uadProto, {
      brands:   { get: markAsNative(function getBrands(){
                        if (!cache.snap) throw new Error('UACHPatch: no snap');
                        const le = cache.snap.uaData || cache.snap.uaCH;
                        if (!le) throw new Error('UACHPatch: missing userAgentData');
                        return toBrands(le && le.brands);
                      }, 'get brands'), enumerable:true, configurable:true },
      mobile:   { get: markAsNative(function getMobile(){
                        if (!cache.snap) throw new Error('UACHPatch: no snap');
                        const le = cache.snap.uaData || cache.snap.uaCH;
                        if (!le) throw new Error('UACHPatch: missing userAgentData');
                        if (typeof le.mobile !== 'boolean') throw new Error('THW: uaData.mobile missing');
                        return le.mobile;
                      }, 'get mobile'),       enumerable:true, configurable:true },
      platform: { get: markAsNative(function getPlatform(){
                        if (!cache.snap) throw new Error('UACHPatch: no snap');
                        const le = cache.snap.uaData || cache.snap.uaCH;
                        if (!le) throw new Error('UACHPatch: missing userAgentData');
                        if (typeof le.platform !== 'string' || !le.platform) {
                          throw new Error('THW: uaData.platform missing');
                        }
                        return le.platform;
                      }, 'get platform'), enumerable:true, configurable:true },
    });
    const getFullVersionList = markAsNative(function getFullVersionList(){
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      const le = cache.snap.uaData || cache.snap.uaCH;
      if (!le || !le.he) throw new Error('UACHPatch: missing userAgentData.he');
      if (!Array.isArray(le.he.fullVersionList)) throw new Error('UACHPatch: bad highEntropy.fullVersionList');
      return deep(le.he.fullVersionList);
    }, 'get fullVersionList');
    Object.defineProperty(uadProto, 'fullVersionList', {
      configurable: true,
      enumerable: false,
      get: getFullVersionList
    });
    const getUaFullVersion = markAsNative(function getUaFullVersion(){
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      const le = cache.snap.uaData || cache.snap.uaCH;
      if (!le || !le.he) throw new Error('UACHPatch: missing userAgentData.he');
      if (typeof le.he.uaFullVersion !== 'string' || !le.he.uaFullVersion) {
        throw new Error('UACHPatch: bad highEntropy.uaFullVersion');
      }
      return le.he.uaFullVersion;
    }, 'get uaFullVersion');
    Object.defineProperty(uadProto, 'uaFullVersion', {
      configurable: true,
      enumerable: false,
      get: getUaFullVersion
    });
    const toJSON = markAsNative(function toJSON(){
      return {brands:this.brands, mobile:this.mobile, platform:this.platform};
    }, 'toJSON');
    Object.defineProperty(uadProto, 'toJSON', {
      configurable: true,
      enumerable: false,
      get: markAsNative(function get_toJSON(){ return toJSON; }, 'get toJSON')
    });
    const getHighEntropyValues = markAsNative(function getHighEntropyValues(keys){
        if (!cache.snap) throw new Error('UACHPatch: no snap');
        if (!Array.isArray(keys)) throw new Error('THW: bad keys');
        for (const k of keys) {
          if (typeof k !== 'string' || !k) throw new Error('THW: bad keys');
        }
        const unknown = keys.filter(k => !ALL_KEYS.has(k));
        if (unknown.length) throw new Error(`UACHPatch: unknown highEntropy ${unknown.join(',')}`);
        const s = cache.snap;
        const le = s.uaData || s.uaCH;
        if (!le || typeof le !== 'object') throw new Error('UACHPatch: missing userAgentData');
        const src = s.highEntropy || (s.uaCH && s.uaCH.highEntropy);
        if (!src || typeof src !== 'object') throw new Error('UACHPatch: missing highEntropy');
        const map = {
          brands: le.brands,
          mobile: le.mobile,
          platform: le.platform,
          architecture: src.architecture,
          bitness: src.bitness,
          model: src.model,
          platformVersion: src.platformVersion,
          uaFullVersion: src.uaFullVersion,
          fullVersionList: src.fullVersionList,
          wow64: src.wow64,
          formFactors: src.formFactors
        };
        const out = {};
        for (const k of keys) {
          if (!(k in map)) throw new Error(`THW: missing highEntropy.${k}`);
          const v = map[k];
          if (v === undefined || v === null) throw new Error(`THW: missing highEntropy.${k}`);
          if (typeof v === 'string' && !v && k !== 'model') throw new Error(`THW: missing highEntropy.${k}`);
          if (Array.isArray(v) && !v.length) throw new Error(`THW: missing highEntropy.${k}`);
          out[k] = deep(v);
        }
        return Promise.resolve(out);
      }, 'getHighEntropyValues');
    Object.defineProperty(uadProto, 'getHighEntropyValues', {
      configurable: true,
      enumerable: false,
      get: markAsNative(function get_getHighEntropyValues(){ return getHighEntropyValues; }, 'get getHighEntropyValues')
    });

    const def = (obj,k,getter,enumerable=true)=>{
      if (obj) {
        Object.defineProperty(obj,k,{configurable:true,enumerable,get:getter});
        return;
      }
      if (nav) {
        Object.defineProperty(nav,k,{configurable:true,enumerable,get:getter});
        return;
      }
      throw new Error(`UACHPatch: cannot define ${k}`);
    };

    const getUserAgentData = markAsNative(function getUserAgentData(){ return nativeUAD; }, 'get userAgentData');
    def(proto,'userAgentData',getUserAgentData, false);
    const getHardwareConcurrency = markAsNative(function getHardwareConcurrency(){
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      if (!Number.isFinite(Number(cache.snap.hardwareConcurrency))) throw new Error('UACHPatch: bad hardwareConcurrency');
      return Number(cache.snap.hardwareConcurrency);
    }, 'get hardwareConcurrency');
    def(proto,'hardwareConcurrency',getHardwareConcurrency, true);
    const getDeviceMemory = markAsNative(function getDeviceMemory(){
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      if (!Number.isFinite(Number(cache.snap.deviceMemory))) throw new Error('UACHPatch: bad deviceMemory');
      return Number(cache.snap.deviceMemory);
    }, 'get deviceMemory');
    def(proto,'deviceMemory',getDeviceMemory, true);

    const getLanguage = markAsNative(function getLanguage(){
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      if (typeof cache.snap.language !== 'string' || cache.snap.language.trim() === '') throw new Error('UACHPatch: bad language');
      return cache.snap.language;
    }, 'get language');
    def(proto,'language', getLanguage, true);
  
    const getLanguages = markAsNative(function getLanguages(){
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      if (!Array.isArray(cache.snap.languages)) throw new Error('UACHPatch: bad languages');
      return cache.snap.languages.slice();
    }, 'get languages');
    def(proto,'languages', getLanguages, true);

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
      cache.snap = requireSnap(s, 'apply');
      if (s.seed != null) self.__GLOBAL_SEED = String(s.seed);
      if (typeof prev==='function') prev.call(self,s);
    };
    cache.snap = requireSnap(self.__lastSnap__, 'bootstrap');
    if (self.__lastSnap__ && self.__lastSnap__.seed != null) self.__GLOBAL_SEED = String(self.__lastSnap__.seed);
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
        try {
          return new NativeWorker(blobURL, { ...(opts || {}), type: workerType });
        } finally {
          URL.revokeObjectURL(blobURL);
        }
      }, 'Worker');
      Object.defineProperty(self, 'Worker', {
        configurable: dWorker.configurable,
        enumerable: dWorker.enumerable,
        writable: dWorker.writable,
        value: WrappedWorker
      });
      self.Worker.__ENV_WRAPPED__ = true;
    }
    self.__SCOPE_CONSISTENCY_PATCHED__ = true;

    const sanity = {
      language: self.navigator && self.navigator.language,
      languages: self.navigator && self.navigator.languages,
      deviceMemory: self.navigator && self.navigator.deviceMemory,
      hardwareConcurrency: self.navigator && self.navigator.hardwareConcurrency
    };
    if (sanity.language !== cache.snap.language) throw new Error('UACHPatch: language mismatch');
    if (!Array.isArray(sanity.languages) || sanity.languages.join(',') !== cache.snap.languages.join(',')) {
      throw new Error('UACHPatch: languages mismatch');
    }
    if (Number(sanity.deviceMemory) !== Number(cache.snap.deviceMemory)) throw new Error('UACHPatch: deviceMemory mismatch');
    if (Number(sanity.hardwareConcurrency) !== Number(cache.snap.hardwareConcurrency)) throw new Error('UACHPatch: hardwareConcurrency mismatch');

    console.info('[UACHPatch] installed', {
      core: true,
      mirror: !!self.__UACH_MIRROR_INSTALLED__,
      scope: !!self.__SCOPE_CONSISTENCY_PATCHED__
    });
  };
})();

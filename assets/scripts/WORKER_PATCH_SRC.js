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
        // if (typeof v === 'string' && !v) throw new Error(`UACHPatch: bad highEntropy.${k}`);
        if (typeof v === 'string' && !v && k !== 'model') throw new Error(`UACHPatch: bad highEntropy.${k}`);
        if (Array.isArray(v) && !v.length) throw new Error(`UACHPatch: bad highEntropy.${k}`);
      }
      return s;
    };
    cache.snap = requireSnap(self.__lastSnap__, 'init');

    const seedInit = (cache.snap && cache.snap.seed != null)
      ? String(cache.snap.seed)
      : ((self.__GLOBAL_SEED != null) ? String(self.__GLOBAL_SEED) : null);
    if (seedInit == null || seedInit === '') {
      const e = new Error('UACHPatch: __GLOBAL_SEED missing');
      if (typeof __DEGRADE__ === "function") __DEGRADE__("WORKER_PATCH_SRC:seed_missing", e);
      throw e;
    }
    self.__GLOBAL_SEED = seedInit;
    // --- seed __ensureMarkAsNative must exist (delivered by bootstrap) ---
    const seedEnsureDesc = Object.getOwnPropertyDescriptor(self, '__ensureMarkAsNative');
    const seedEnsure = (seedEnsureDesc && typeof seedEnsureDesc.value === 'function')
      ? seedEnsureDesc.value
      : (typeof self.__ensureMarkAsNative === 'function' ? self.__ensureMarkAsNative : null);

    if (!seedEnsure) {
      const e = new Error('UACHPatch: __ensureMarkAsNative missing');
      if (typeof __DEGRADE__ === "function") __DEGRADE__("WORKER_PATCH_SRC:seedEnsure_missing", e);
      throw e;
    }

    const seedMarkAsNative = seedEnsure();
    if (typeof seedMarkAsNative !== 'function') {
      throw new Error('UACHPatch: markAsNative seed missing');
    }
    if (seedMarkAsNative !== seedEnsure()) {
      throw new Error('UACHPatch: markAsNative seed unstable');
    }

    const nativeGetOwnProp = Object.getOwnPropertyDescriptor;
    const toStringDesc = nativeGetOwnProp(Function.prototype, 'toString');
    const existingToString = toStringDesc && toStringDesc.value;
    const existingToStringBridge = !!(existingToString && existingToString.__TOSTRING_BRIDGE__);

    // По концепции: мост обязан быть seed’ом, не ставим “с нуля” в патче
    if (!existingToStringBridge) {
      throw new Error('UACHPatch: toString bridge missing');
    }
    const nativeToString = existingToString.__NativeToString;
    const toStringMap = existingToString.__NativeToStringMap;
    if (typeof nativeToString !== 'function' || !(toStringMap instanceof WeakMap)) {
      throw new Error('UACHPatch: toString bridge invalid');
    }

    let memoMarkAsNative = null;
    function ensureMarkAsNative() {
      const seedNow = (self.__GLOBAL_SEED != null) ? String(self.__GLOBAL_SEED) : null;
      if (seedNow == null || seedNow === '') {
        const e = new Error('UACHPatch: __GLOBAL_SEED missing');
        if (typeof __DEGRADE__ === "function") __DEGRADE__("WORKER_PATCH_SRC:seed_missing", e);
        throw e;
      }
      if (!memoMarkAsNative) {
        const wrapped = function markAsNative(func, name = "") {
          return seedMarkAsNative(func, name);
        };
        if (!wrapped.__TOSTRING_BRIDGE__) {
          Object.defineProperty(wrapped, '__TOSTRING_BRIDGE__', {
            value: true,
            writable: false,
            configurable: true,
            enumerable: false
          });
        }
        memoMarkAsNative = wrapped;
      }
      Object.defineProperty(memoMarkAsNative, '__GLOBAL_SEED__', {
        value: seedNow,
        writable: false,
        configurable: true,
        enumerable: false
      });
      return memoMarkAsNative;
    }

    // override self.__ensureMarkAsNative with derived (fork) if allowed
    const ensureDesc = Object.getOwnPropertyDescriptor(self, '__ensureMarkAsNative');
    if (ensureDesc && ensureDesc.configurable === false && ensureDesc.value !== ensureMarkAsNative) {
      const e = new Error('UACHPatch: __ensureMarkAsNative not overridable');
      if (typeof __DEGRADE__ === "function") __DEGRADE__("WORKER_PATCH_SRC:ensure_not_overridable", e);
      throw e;
    }
    if (!ensureDesc || ensureDesc.configurable !== false) {
      Object.defineProperty(self, '__ensureMarkAsNative', {
        value: ensureMarkAsNative,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }

    const markAsNative = ensureMarkAsNative();

    // sanity: seed bridge must reflect labels written by seedMarkAsNative
    {
      const probe = function probe(){};
      markAsNative(probe);
      const expected = toStringMap.get(probe);
      if (expected === undefined) throw new Error('UACHPatch: toString probe missing label');
      const actual = existingToString.call(probe);
      if (actual !== expected) throw new Error('UACHPatch: toString bridge mismatch');
    }

    if (existingToString.__TOSTRING_PROXY_INSTALLED__ !== true) {
      Object.defineProperty(existingToString, '__TOSTRING_PROXY_INSTALLED__', {
        value: true,
        writable: false,
        configurable: true,
        enumerable: false
      });
    }
    Object.defineProperty(existingToString, '__GLOBAL_SEED__', {
      value: String(self.__GLOBAL_SEED),
      writable: false,
      configurable: true,
      enumerable: false
    });

    markAsNative(ensureMarkAsNative, '__ensureMarkAsNative');


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
        Object.defineProperty(dprTarget, 'devicePixelRatio', {
          value: getDevicePixelRatio(),
          writable: !!dprDesc.writable,
          configurable: !!dprDesc.configurable,
          enumerable: !!dprDesc.enumerable
        });
      } else {
        Object.defineProperty(dprTarget, 'devicePixelRatio', {
          configurable: dprDesc ? !!dprDesc.configurable : true,
          enumerable: dprDesc ? !!dprDesc.enumerable : false,
          get: getDevicePixelRatio,
          set: dprDesc && dprDesc.set
        });
      }
    }

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
    const isUadThis = (self) => (self === nativeUAD);
    const dBrands = Object.getOwnPropertyDescriptor(uadProto, 'brands');
    const dMobile = Object.getOwnPropertyDescriptor(uadProto, 'mobile');
    const dPlatform = Object.getOwnPropertyDescriptor(uadProto, 'platform');
    if (!dBrands || !dMobile || !dPlatform) throw new Error('THW: worker navigator.userAgentData descriptor missing');
    const origBrandsGet = dBrands && dBrands.get;
    const origMobileGet = dMobile && dMobile.get;
    const origPlatformGet = dPlatform && dPlatform.get;
    Object.defineProperties(uadProto, {
      brands:   { get: markAsNative(function getBrands(){
                        if (!isUadThis(this)) {
                          if (typeof origBrandsGet === 'function') return origBrandsGet.call(this);
                          throw new TypeError('Illegal invocation');
                        }
                        if (!cache.snap) throw new Error('UACHPatch: no snap');
                        const le = cache.snap.uaData || cache.snap.uaCH;
                        if (!le) throw new Error('UACHPatch: missing userAgentData');
                        return toBrands(le && le.brands);
                      }, 'get brands'), enumerable: !!dBrands.enumerable, configurable: !!dBrands.configurable, set: dBrands.set },
      mobile:   { get: markAsNative(function getMobile(){
                        if (!isUadThis(this)) {
                          if (typeof origMobileGet === 'function') return origMobileGet.call(this);
                          throw new TypeError('Illegal invocation');
                        }
                        if (!cache.snap) throw new Error('UACHPatch: no snap');
                        const le = cache.snap.uaData || cache.snap.uaCH;
                        if (!le) throw new Error('UACHPatch: missing userAgentData');
                        if (typeof le.mobile !== 'boolean') throw new Error('THW: uaData.mobile missing');
                        return le.mobile;
                      }, 'get mobile'),       enumerable: !!dMobile.enumerable, configurable: !!dMobile.configurable, set: dMobile.set },
      platform: { get: markAsNative(function getPlatform(){
                        if (!isUadThis(this)) {
                          if (typeof origPlatformGet === 'function') return origPlatformGet.call(this);
                          throw new TypeError('Illegal invocation');
                        }
                        if (!cache.snap) throw new Error('UACHPatch: no snap');
                        const le = cache.snap.uaData || cache.snap.uaCH;
                        if (!le) throw new Error('UACHPatch: missing userAgentData');
                        if (typeof le.platform !== 'string' || !le.platform) {
                          throw new Error('THW: uaData.platform missing');
                        }
                        return le.platform;
                      }, 'get platform'), enumerable: !!dPlatform.enumerable, configurable: !!dPlatform.configurable, set: dPlatform.set },
    });
    const dFull = Object.getOwnPropertyDescriptor(uadProto, 'fullVersionList');
    const origFullGet = dFull && dFull.get;
    const getFullVersionList = markAsNative(function getFullVersionList(){
      if (!isUadThis(this)) {
        if (typeof origFullGet === 'function') return origFullGet.call(this);
        throw new TypeError('Illegal invocation');
      }
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      const le = cache.snap.uaData || cache.snap.uaCH;
      if (!le || !le.he) throw new Error('UACHPatch: missing userAgentData.he');
      if (!Array.isArray(le.he.fullVersionList)) throw new Error('UACHPatch: bad highEntropy.fullVersionList');
      return deep(le.he.fullVersionList);
    }, 'get fullVersionList');
    if (dFull) {
      Object.defineProperty(uadProto, 'fullVersionList', {
        configurable: !!dFull.configurable,
        enumerable: !!dFull.enumerable,
        get: getFullVersionList,
        set: dFull.set
      });
    }
    const dUaFull = Object.getOwnPropertyDescriptor(uadProto, 'uaFullVersion');
    const origUaFullGet = dUaFull && dUaFull.get;
    const getUaFullVersion = markAsNative(function getUaFullVersion(){
      if (!isUadThis(this)) {
        if (typeof origUaFullGet === 'function') return origUaFullGet.call(this);
        throw new TypeError('Illegal invocation');
      }
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      const le = cache.snap.uaData || cache.snap.uaCH;
      if (!le || !le.he) throw new Error('UACHPatch: missing userAgentData.he');
      if (typeof le.he.uaFullVersion !== 'string' || !le.he.uaFullVersion) {
        throw new Error('UACHPatch: bad highEntropy.uaFullVersion');
      }
      return le.he.uaFullVersion;
    }, 'get uaFullVersion');
    if (dUaFull) {
      Object.defineProperty(uadProto, 'uaFullVersion', {
        configurable: !!dUaFull.configurable,
        enumerable: !!dUaFull.enumerable,
        get: getUaFullVersion,
        set: dUaFull.set
      });
    }
    const dToJSON = Object.getOwnPropertyDescriptor(uadProto, 'toJSON');
    const origToJSON = dToJSON && dToJSON.value;
    const toJSON = markAsNative(function toJSON(){
      if (!isUadThis(this)) {
        if (typeof origToJSON === 'function') return origToJSON.call(this);
        throw new TypeError('Illegal invocation');
      }
      return {brands:this.brands, mobile:this.mobile, platform:this.platform};
    }, 'toJSON');
    Object.defineProperty(uadProto, 'toJSON', {
      configurable: dToJSON ? !!dToJSON.configurable : true,
      enumerable: dToJSON ? !!dToJSON.enumerable : false,
      writable: dToJSON && Object.prototype.hasOwnProperty.call(dToJSON, 'writable') ? dToJSON.writable : true,
      value: toJSON
    });
    const dGHEV = Object.getOwnPropertyDescriptor(uadProto, 'getHighEntropyValues');
    const origGHEV = dGHEV && dGHEV.value;
    const getHighEntropyValues = markAsNative(function getHighEntropyValues(keys){
        if (!isUadThis(this)) {
          if (typeof origGHEV === 'function') return origGHEV.call(this, keys);
          throw new TypeError('Illegal invocation');
        }
        if (!cache.snap) throw new Error('UACHPatch: no snap');
        if (!Array.isArray(keys)) throw new Error('THW: bad keys');
        for (const k of keys) {
          if (typeof k !== 'string' || !k) throw new Error('THW: bad keys');
        }
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
          if (!(k in map)) continue;
          const v = map[k];
          if (v === undefined || v === null) throw new Error(`THW: missing highEntropy.${k}`);
          if (typeof v === 'string' && !v && k !== 'model') throw new Error(`THW: missing highEntropy.${k}`);
          if (Array.isArray(v) && !v.length) throw new Error(`THW: missing highEntropy.${k}`);
          out[k] = deep(v);
        }
        return Promise.resolve(out);
      }, 'getHighEntropyValues');
    Object.defineProperty(uadProto, 'getHighEntropyValues', {
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
          return Reflect.apply(patchedGet, recv, []);
        }
        return Reflect.apply(origGet, recv, []);
      };

      // IMPORTANT: native getters have stable `name` like "get hardwareConcurrency".
      // `markAsNative()` only patches toString-labels, so we must produce a named getter function.
      let wrapped = impl;
      if (typeof k === 'string' && k) {
        try {
          const acc = ({ get [k]() { return impl.call(this); } });
          const d = Object.getOwnPropertyDescriptor(acc, k);
          if (d && typeof d.get === 'function') wrapped = d.get;
        } catch (e) {
          if (typeof __DEGRADE__ === "function") __DEGRADE__("WORKER_PATCH_SRC:makeGuardedGetter_name_failed", e);
        }
      }

      return markAsNative(wrapped, `get ${k}`);
    };

    const def = (obj, k, getter, enumerable = true) => {
      // По методологии: не молчим, если некуда ставить
      if (!nav) throw new Error(`UACHPatch: cannot define ${k} (no navigator)`);

      // 1) Если свойство уже есть как OWN на navigator — патчим ТУДА.
      // Иначе прототипный getter никогда не сработает.
      const own = Object.getOwnPropertyDescriptor(nav, k);
      if (own) {
        if (own.configurable === false) {
          throw new Error(`UACHPatch: ${k} not configurable on navigator`);
        }
        if (typeof own.get !== 'function') {
          throw new Error(`UACHPatch: ${k} missing native getter on navigator`);
        }
        const ownGuardedGet = makeGuardedGetter(k, nav, getter, own.get);
        Object.defineProperty(nav, k, {
          configurable: !!own.configurable,
          enumerable: !!own.enumerable,
          get: ownGuardedGet,
          set: own && Object.prototype.hasOwnProperty.call(own, 'set') ? own.set : undefined
        });
        return;
      }

      // 2) Иначе — патчим на proto (как раньше)
      if (obj) {
        const d = Object.getOwnPropertyDescriptor(obj, k);
        if (!d) {
          throw new Error(`UACHPatch: ${k} native descriptor missing on proto`);
        }
        if (d && d.configurable === false) {
          throw new Error(`UACHPatch: ${k} not configurable on proto`);
        }
        if (typeof d.get !== 'function') {
          throw new Error(`UACHPatch: ${k} missing native getter on proto`);
        }
        const protoGuardedGet = makeGuardedGetter(k, obj, getter, d.get);
        Object.defineProperty(obj, k, {
          configurable: d ? !!d.configurable : true,
          enumerable: d ? !!d.enumerable : !!enumerable,
          get: protoGuardedGet,
          set: d && Object.prototype.hasOwnProperty.call(d, 'set') ? d.set : undefined
        });
        return;
      }

      throw new Error(`UACHPatch: cannot define ${k} (no proto)`);
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
      try { Object.freeze(out); } catch(_) {}
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
      const prevSeed = (self.__GLOBAL_SEED != null) ? String(self.__GLOBAL_SEED) : null;
      const nextSeed = (s && s.seed != null) ? String(s.seed) : null;
      cache.snap = requireSnap(s, 'apply');
      if (nextSeed != null) {
        self.__GLOBAL_SEED = nextSeed;
        try {
          const td = Object.getOwnPropertyDescriptor(Function.prototype, 'toString');
          const ts = td && td.value;
          if (ts && ts.__TOSTRING_BRIDGE__) {
            Object.defineProperty(ts, '__GLOBAL_SEED__', {
              value: String(nextSeed),
              writable: false,
              configurable: true,
              enumerable: false
            });
          }
        } catch (e) {
          if (typeof __DEGRADE__ === "function") __DEGRADE__("WORKER_PATCH_SRC:seed_sync_failed", e);
          throw e;
        }
      }
      if (prevSeed != null && nextSeed != null && prevSeed !== nextSeed) {
        const jit = (typeof globalThis !== 'undefined' && globalThis.__JIT_CACHE__ instanceof Map)
          ? globalThis.__JIT_CACHE__
          : (self.__JIT_CACHE__ instanceof Map ? self.__JIT_CACHE__ : null);
        if (jit && typeof jit.clear === 'function') jit.clear();
        const C = (typeof globalThis !== 'undefined' && globalThis.CanvasPatchContext)
          ? globalThis.CanvasPatchContext
          : (self.CanvasPatchContext || null);
        if (C && C.__TextMetrics__ && C.__TextMetrics__.cache && typeof C.__TextMetrics__.cache.clear === 'function') {
          C.__TextMetrics__.cache.clear();
        }
      }
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
      Object.defineProperty(self.Worker, '__ENV_WRAPPED__', {
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
    if (sanity.language !== cache.snap.language) throw new Error('UACHPatch: language mismatch');
    if (!Array.isArray(sanity.languages) || sanity.languages.join(',') !== cache.snap.languages.join(',')) {
      throw new Error('UACHPatch: languages mismatch');
    }
    if (Number(sanity.deviceMemory) !== Number(cache.snap.deviceMemory)) throw new Error('UACHPatch: deviceMemory mismatch');
    if (Number(sanity.hardwareConcurrency) !== Number(cache.snap.hardwareConcurrency)) throw new Error('UACHPatch: hardwareConcurrency mismatch');
    self.__UACH_MIRROR_INSTALLED__ = true;

    if (Array.isArray(self._myDebugLog)) {
      self._myDebugLog.push({
        type: "worker_patch",
        core: true,
        mirror: !!self.__UACH_MIRROR_INSTALLED__,
        scope: !!self.__SCOPE_CONSISTENCY_PATCHED__,
        timestamp: new Date().toISOString()
      });
    }
  };
})();

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
    const requireSnap = (s, where) => {
      if (!s || typeof s !== 'object') throw new Error(`UACHPatch: no snapshot${where ? ` (${where})` : ''}`);
      if (typeof s.language !== 'string' || s.language.trim() === '') throw new Error('UACHPatch: bad language');
      if (!Array.isArray(s.languages)) throw new Error('UACHPatch: bad languages');
      if (!Number.isFinite(Number(s.deviceMemory))) throw new Error('UACHPatch: bad deviceMemory');
      if (!Number.isFinite(Number(s.hardwareConcurrency))) throw new Error('UACHPatch: bad hardwareConcurrency');
      if (!s.uaData && !s.uaCH) throw new Error('UACHPatch: missing userAgentData');
      return s;
    };
    cache.snap = requireSnap(self.__lastSnap__, 'init');

    Object.defineProperty(self, 'devicePixelRatio', {
      configurable: true,
      enumerable: false,
      get(){
        if (!cache.snap) throw new Error('UACHPatch: no snap');
        if (!('dpr' in cache.snap)) throw new Error('UACHPatch: no dpr');
        const snapVal = Number(cache.snap.dpr);
        if (validDpr(snapVal)) return snapVal;
        throw new Error('UACHPatch: bad dpr');
      }
    });

    const deep = v => v==null ? v : JSON.parse(JSON.stringify(v));
    const toBrands = a => Array.isArray(a) ? a.map(x=>({brand:String(x.brand??x.name??''),version:String(String(x.version??'').split('.')[0])})) : [];
    const HE = new Set(['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','formFactors','wow64']);
    const uad = {};
    Object.defineProperties(uad, {
    brands:   { get(){
                      if (!cache.snap) throw new Error('UACHPatch: no snap');
                      const le=cache.snap.uaData||cache.snap.uaCH||null;
                      if (!le) throw new Error('UACHPatch: missing userAgentData');
                      return toBrands(le && le.brands);
                    }, enumerable:true },
    mobile:   { get(){
                      if (!cache.snap) throw new Error('UACHPatch: no snap');
                      const le=cache.snap.uaData||cache.snap.uaCH||null;
                      if (!le) throw new Error('UACHPatch: missing userAgentData');
                      return !!(le && le.mobile);
                    },       enumerable:true },
    platform: { get(){
                      if (!cache.snap) throw new Error('UACHPatch: no snap');
                      const le=cache.snap.uaData||cache.snap.uaCH||null;
                      if (!le) throw new Error('UACHPatch: missing userAgentData');
                      return String((le && le.platform) || '');
                    }, enumerable:true },
    });
    uad.toJSON = function(){ return {brands:this.brands, mobile:this.mobile, platform:this.platform}; };
    uad.getHighEntropyValues = keys => {
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      const ks = Array.isArray(keys) ? keys.filter(k=>HE.has(k)) : null;
      if (!ks) throw new Error('UACHPatch: bad keys');
      const s = cache.snap;
      const src = s.highEntropy || (s.uaCH && s.uaCH.highEntropy);
      if (!src) throw new Error('UACHPatch: missing highEntropy');
      const out = {}; for (const k of ks) if (k in src) out[k]=deep(src[k]);
      return Promise.resolve(out);
    };

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

    def(proto,'userAgentData',()=>uad);
    def(proto,'hardwareConcurrency',()=> {
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      if (!Number.isFinite(Number(cache.snap.hardwareConcurrency))) throw new Error('UACHPatch: bad hardwareConcurrency');
      return Number(cache.snap.hardwareConcurrency);
    });
    def(proto,'deviceMemory',()=> {
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      if (!Number.isFinite(Number(cache.snap.deviceMemory))) throw new Error('UACHPatch: bad deviceMemory');
      return Number(cache.snap.deviceMemory);
    });

    def(proto,'language', ()=>{
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      if (typeof cache.snap.language !== 'string' || cache.snap.language.trim() === '') throw new Error('UACHPatch: bad language');
      return cache.snap.language;
    });
  
    def(proto,'languages', ()=>{
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      if (!Array.isArray(cache.snap.languages)) throw new Error('UACHPatch: bad languages');
      return cache.snap.languages.slice();
    });

    const prev = self.__applyEnvSnapshot__;
    self.__applyEnvSnapshot__ = s => {
      if (!s || typeof s !== 'object') throw new Error('UACHPatch: invalid snapshot');
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
      self.Worker = function WrappedWorker(url, opts){
        const abs = new URL(url, self.location && self.location.href || undefined).href;
        const workerType = (opts && opts.type) === 'module' ? 'module' : 'classic';
        const snap = requireSnap(self.__lastSnap__, 'nested');
        const SNAP = JSON.stringify(snap);
        const USER = JSON.stringify(String(abs));
        const src = workerType === 'module'
          ? `(async function(){'use strict';self.__GW_BOOTSTRAP__=true;self.__applyEnvSnapshot__=s=>{self.__lastSnap__=s;};self.__applyEnvSnapshot__(${SNAP});if(!self.__ENV_SYNC_BC_INSTALLED__){self.__ENV_SYNC_BC_INSTALLED__=true;if(typeof BroadcastChannel!=='function') throw new Error('UACHPatch: BroadcastChannel missing');const bc=new BroadcastChannel('__ENV_SYNC__');bc.onmessage=ev=>{const s=ev&&ev.data&&ev.data.__ENV_SYNC__&&ev.data.__ENV_SYNC__.envSnapshot;if(s)self.__applyEnvSnapshot__(s);};}const USER=${USER};if(!USER||typeof USER!=='string') throw new Error('UACHPatch: missing user import');await import(USER);} )();export {};`
          : `(function(){'use strict';self.__GW_BOOTSTRAP__=true;self.__applyEnvSnapshot__=function(s){self.__lastSnap__=s;};self.__applyEnvSnapshot__(${SNAP});if(!self.__ENV_SYNC_BC_INSTALLED__){self.__ENV_SYNC_BC_INSTALLED__=true;if(typeof BroadcastChannel!=='function') throw new Error('UACHPatch: BroadcastChannel missing');const bc=new BroadcastChannel('__ENV_SYNC__');bc.onmessage=function(ev){var s=ev&&ev.data&&ev.data.__ENV_SYNC__&&ev.data.__ENV_SYNC__.envSnapshot;if(s)self.__applyEnvSnapshot__(s);};}if(!${USER}||typeof ${USER}!=='string') throw new Error('UACHPatch: missing user import');importScripts(${USER});})();`;
        const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
        try {
          return new NativeWorker(blobURL, { ...(opts || {}), type: workerType });
        } finally {
          URL.revokeObjectURL(blobURL);
        }
      };
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


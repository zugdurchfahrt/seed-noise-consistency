// WORKER_PATCH_SRC.js
(() => {
  const G = (typeof globalThis !== 'undefined' && globalThis)
      || (typeof self       !== 'undefined' && self)
      || (typeof window     !== 'undefined' && window)
      || (typeof global     !== 'undefined' && global)
      || {};
  if (typeof self==='undefined' || typeof WorkerGlobalScope==='undefined' || !(self instanceof WorkerGlobalScope)) return;
  if (self.installWorkerUACHMirror) return;

  self.installWorkerUACHMirror = function installWorkerUACHMirror(){
    if (self.__UACH_MIRROR_INSTALLED__) return; self.__UACH_MIRROR_INSTALLED__ = true;
    const nav = self.navigator;
    const proto = (typeof WorkerNavigator!=='undefined' && WorkerNavigator.prototype) || Object.getPrototypeOf(nav);
    const ORIG = {
      language: Object.getOwnPropertyDescriptor(proto,'language'),
      languages: Object.getOwnPropertyDescriptor(proto,'languages'),
      hardwareConcurrency: Object.getOwnPropertyDescriptor(proto,'hardwareConcurrency'),
      deviceMemory: Object.getOwnPropertyDescriptor(proto,'deviceMemory'),
    };
    const ORIG_DPR = Object.getOwnPropertyDescriptor(self,'devicePixelRatio');
    const callOrig = (d, def) => {
      try { return (d && typeof d.get==='function') ? d.get.call(nav) : def; } catch(_) { return def; }
    };
    const cache = { snap:null };
    const validDpr = v => Number.isFinite(v) && v > 0;

    try {
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
    } catch(_) {}

    const deep = v => v==null ? v : JSON.parse(JSON.stringify(v));
    const toBrands = a => Array.isArray(a) ? a.map(x=>({brand:String(x.brand??x.name??''),version:String(String(x.version??'').split('.')[0])})) : [];
    const HE = new Set(['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','formFactors','wow64']);
    const uad = {};
    Object.defineProperties(uad, {
    brands:   { get(){ const s=cache.snap||{}; const le=s.uaData||s.uaCH||null;
                      return toBrands(le && le.brands); }, enumerable:true },
    mobile:   { get(){ const s=cache.snap||{}; const le=s.uaData||s.uaCH||null;
                      return !!(le && le.mobile); },       enumerable:true },
    platform: { get(){ const s=cache.snap||{}; const le=s.uaData||s.uaCH||null;
                      return String((le && le.platform) || ''); }, enumerable:true },
    });
    uad.toJSON = function(){ return {brands:this.brands, mobile:this.mobile, platform:this.platform}; };
    uad.getHighEntropyValues = keys => {
      const ks = Array.isArray(keys) ? keys.filter(k=>HE.has(k)) : [];
      const s = cache.snap || {};
      const src = s.highEntropy || (s.uaCH && s.uaCH.highEntropy) || {};
      const out = {}; for (const k of ks) if (k in src) out[k]=deep(src[k]);
      return Promise.resolve(out);
    };

    const def = (obj,k,getter,enumerable=true)=>{
      try{ Object.defineProperty(obj,k,{configurable:true,enumerable,get:getter}); return true; }catch(_){}
      try{ Object.defineProperty(nav,k,{configurable:true,enumerable,get:getter}); return true; }catch(_){}
      return false;
    };

    def(proto,'userAgentData',()=>uad);
    // Толерантные HC/DM: новые имена или старые cpu/mem, иначе натив
    def(proto,'hardwareConcurrency',()=>Number(
      cache.snap?.hardwareConcurrency ?? cache.snap?.cpu ?? callOrig(ORIG.hardwareConcurrency, nav.hardwareConcurrency)
    ));
    def(proto,'deviceMemory',()=>Number(
      cache.snap?.deviceMemory ?? cache.snap?.mem ?? callOrig(ORIG.deviceMemory, nav.deviceMemory)
    ));

    def(proto,'language', ()=>{
      if (!cache.snap) throw new Error('UACHPatch: no snap');
      if (!('language' in cache.snap)) throw new Error('UACHPatch: no language');
      const v = cache.snap.language;
      if (typeof v !== 'string' || v.trim() === '') throw new Error('UACHPatch: bad language');
      return v;
    });
  
    def(proto,'languages', ()=>{
        if (Array.isArray(cache.snap?.languages))
            return cache.snap.languages.slice();
        const o = callOrig(ORIG.languages, []);
        return Array.isArray(o) ? o.slice() : [];
    });

    const prev = self.__applyEnvSnapshot__;
    self.__applyEnvSnapshot__ = s => {
      if (s) cache.snap = s;
      if (s && s.seed != null) self.__GLOBAL_SEED = String(s.seed); 
      if (typeof prev==='function') try{ prev.call(self,s); }catch(_){}
    };
    try{ if (self.__lastSnap__ && typeof self.__lastSnap__==='object') cache.snap = self.__lastSnap__; }catch(_){}
    try{ if (self.__lastSnap__ && self.__lastSnap__.seed != null) self.__GLOBAL_SEED = String(self.__lastSnap__.seed); }catch(_){}
    try{
      if (!self.__GW_BOOTSTRAP__ && !self.__ENV_SYNC_BC_INSTALLED__) {
        self.__ENV_SYNC_BC_INSTALLED__ = true;
        const bc = new BroadcastChannel('__ENV_SYNC__');
        bc.onmessage = ev => { const s = ev?.data?.__ENV_SYNC__?.envSnapshot; if (s) self.__applyEnvSnapshot__(s); };
      }
    }catch(_){}
    try {
      if (self.Worker && !self.Worker.__ENV_WRAPPED__) {
        const NativeWorker = self.Worker;
        self.Worker = function WrappedWorker(url, opts){
          try {
            const abs = new URL(url, self.location && self.location.href || undefined).href;
            const workerType = (opts && opts.type) === 'module' ? 'module' : 'classic';
            const snap = self.__lastSnap__ || null;
            const SNAP = JSON.stringify(snap || null);
            const USER = JSON.stringify(String(abs));
            const src = workerType === 'module'
              ? `(async function(){'use strict';try{self.__GW_BOOTSTRAP__=true;}catch(_){}self.__applyEnvSnapshot__=s=>{try{self.__lastSnap__=s;}catch(_){}};try{if(${SNAP})self.__applyEnvSnapshot__(${SNAP});}catch(_){}try{if(!self.__ENV_SYNC_BC_INSTALLED__){self.__ENV_SYNC_BC_INSTALLED__=true;const bc=new BroadcastChannel('__ENV_SYNC__');bc.onmessage=ev=>{const s=ev&&ev.data&&ev.data.__ENV_SYNC__&&ev.data.__ENV_SYNC__.envSnapshot;if(s)self.__applyEnvSnapshot__(s);};}}catch(_){}try{const USER=${USER};if(USER&&typeof USER==='string')await import(USER);}catch(_){}})();export {};`
              : `(function(){'use strict';try{self.__GW_BOOTSTRAP__=true;}catch(_){}self.__applyEnvSnapshot__=function(s){try{self.__lastSnap__=s;}catch(_){}};try{if(${SNAP})self.__applyEnvSnapshot__(${SNAP});}catch(_){}try{if(!self.__ENV_SYNC_BC_INSTALLED__){self.__ENV_SYNC_BC_INSTALLED__=true;const bc=new BroadcastChannel('__ENV_SYNC__');bc.onmessage=function(ev){var s=ev&&ev.data&&ev.data.__ENV_SYNC__&&ev.data.__ENV_SYNC__.envSnapshot;if(s)self.__applyEnvSnapshot__(s);};}}catch(_){}try{importScripts(${USER});}catch(_){}})();`;
            const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
            try {
              const w = new NativeWorker(blobURL, { ...(opts || {}), type: workerType });
              try { URL.revokeObjectURL(blobURL); } catch (_) {}
              return w;
            } catch (_) {
              try { URL.revokeObjectURL(blobURL); } catch (_) {}
              return new NativeWorker(url, opts);
            }
          } catch (_) {
            return new NativeWorker(url, opts);
          }
        };
        self.Worker.__ENV_WRAPPED__ = true;
      }
    } catch(_) {}
    try { self.__SCOPE_CONSISTENCY_PATCHED__ = true; } catch(_){}

    console.info('[UACHPatch] installed', {
      core: true,
      mirror: !!self.__UACH_MIRROR_INSTALLED__,
      scope: !!self.__SCOPE_CONSISTENCY_PATCHED__
    });
  };
})();



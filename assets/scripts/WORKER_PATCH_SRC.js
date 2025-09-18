// WORKER_PATCH_SRC.js
(() => {
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
    const callOrig = (d, def) => (d && typeof d.get==='function') ? d.get.call(nav) : def;
    const cache = { snap:null };

    try {
      Object.defineProperty(self, 'devicePixelRatio', {
        configurable: true,
        enumerable: false,
        get(){ return Number(cache.snap?.dpr ?? 1); }
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
      cache.snap?.hardwareConcurrency ?? cache.snap?.cpu ?? callOrig(ORIG.hardwareConcurrency, nav.hardwareConcurrency ?? 4)
    ));
    def(proto,'deviceMemory',()=>Number(
      cache.snap?.deviceMemory ?? cache.snap?.mem ?? callOrig(ORIG.deviceMemory, nav.deviceMemory ?? 8)
    ));

    def(proto,'language',           ()=>String(cache.snap?.language           ?? callOrig(ORIG.language,            'en-GB')));
    def(proto,'languages',          ()=>{ if (Array.isArray(cache.snap?.languages)) return cache.snap.languages.slice();
                                         const o=callOrig(ORIG.languages,['en-GB','en']); return Array.isArray(o)? o.slice():['en-GB','en']; });


    const prev = self.__applyEnvSnapshot__;
    self.__applyEnvSnapshot__ = s => {
      if (s) cache.snap = s;
      if (s && s.seed != null) self.__GLOBAL_SEED = String(s.seed); // ← [ADD #1]
      if (typeof prev==='function') try{ prev.call(self,s); }catch(_){}
    };
    try{ if (self.__lastSnap__ && typeof self.__lastSnap__==='object') cache.snap = self.__lastSnap__; }catch(_){}
    try{ if (self.__lastSnap__ && self.__lastSnap__.seed != null) self.__GLOBAL_SEED = String(self.__lastSnap__.seed); }catch(_){}
    // ← [ADD #2] отдельным try-блоком, ничего не трогая выше
    try{
      const bc = new BroadcastChannel('__ENV_SYNC__');
      bc.onmessage = ev => { const s = ev?.data?.__ENV_SYNC__?.envSnapshot; if (s) self.__applyEnvSnapshot__(s); };
    }catch(_){}
    try { self.__SCOPE_CONSISTENCY_PATCHED__ = true; } catch(_){}

    console.info('[UACHPatch] installed', {
      core: true,
      mirror: !!self.__UACH_MIRROR_INSTALLED__,
      scope: !!self.__SCOPE_CONSISTENCY_PATCHED__
    });
  };

})();





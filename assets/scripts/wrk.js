// 1) Источник снапшотов 
function EnvBus(G){
  function envSnapshot(){
    const nav = G.navigator;
    let langs = G.__normalizedLanguages;
    if (!Array.isArray(langs)) {
      if (typeof langs === 'string') langs = [langs];
      else throw new Error('EnvBus: __normalizedLanguages missing');
    }
    const lang     = (typeof G.__primaryLanguage === 'string') ? G.__primaryLanguage : null;
    if (!lang) throw new Error('EnvBus: __primaryLanguage missing');
    const ua       = G.__USER_AGENT;
    const vendor   = G.__VENDOR;
    if (typeof ua !== 'string' || !ua) throw new Error('EnvBus: __USER_AGENT missing');
    if (typeof vendor !== 'string') throw new Error('EnvBus: __VENDOR missing');
    const dpr      = (typeof G.__DPR === 'number' && G.__DPR > 0) ? +G.__DPR : null;
    if (!dpr) throw new Error('EnvBus: __DPR missing');
    const cpu      = (G.__cpu != null) ? G.__cpu : null;
    const mem      = (G.__memory != null) ? G.__memory : null;
    if (cpu == null) throw new Error('EnvBus: __cpu missing');
    if (mem == null) throw new Error('EnvBus: __memory missing');
    const timeZone = G.__TIMEZONE__;
    if (!timeZone) throw new Error('EnvBus: __TIMEZONE__ missing');

    // ЕДИНЫЙ источник CH: сначала берем подготовленный (__EXPECTED_CLIENT_HINTS), иначе — low-entropy из navigator
    let ch = null;
    if (G.__EXPECTED_CLIENT_HINTS && typeof G.__EXPECTED_CLIENT_HINTS === 'object') {
      ch = G.__EXPECTED_CLIENT_HINTS;
    } else {
      throw new Error('EnvBus: __EXPECTED_CLIENT_HINTS missing');
    }

    // низкоэнтропийные — ровно как вы уже именуете: uaData
    const uaData = ch ? {
      platform: typeof ch.platform === 'string' ? ch.platform : '',
      brands: Array.isArray(ch.brands) ? ch.brands.slice()
            : Array.isArray(ch.fullVersionList)
              ? ch.fullVersionList.map(x => ({
                  brand: String(x && x.brand || ''),
                  // low-entropy требование: только major
                  version: String(x && x.version || '').split('.')[0]
                }))
              : [],
      mobile: !!ch.mobile
    } : null;
    if (!uaData) throw new Error('EnvBus: uaData missing');

    // высокоэнтропийные + прочее, в один объект he
    const he = {};
    const put = (k,v)=>{ if (v !== undefined && v !== null) he[k] = v; };
    const heSrc = (G.__LAST_UACH_HE__ && typeof G.__LAST_UACH_HE__ === 'object') ? G.__LAST_UACH_HE__ : (ch && ch.highEntropy);

    // ← интеграция тех самых двух переменных под уже существующими именами
    put('uaFullVersion',   (heSrc && heSrc.uaFullVersion) ?? (ch && ch.uaFullVersion));
    put('fullVersionList', (heSrc && heSrc.fullVersionList) ?? (ch && ch.fullVersionList));

    // остальные (если есть в __EXPECTED_CLIENT_HINTS)
    put('architecture',    (heSrc && heSrc.architecture) ?? (ch && ch.architecture));
    put('bitness',         (heSrc && heSrc.bitness) ?? (ch && ch.bitness));
    put('model',           (heSrc && heSrc.model) ?? (ch && ch.model));
    put('platformVersion', (heSrc && heSrc.platformVersion) ?? (ch && ch.platformVersion));
    put('formFactors',     (heSrc && heSrc.formFactors) ?? (ch && ch.formFactors));
    put('wow64',           (heSrc && heSrc.wow64 !== undefined) ? !!heSrc.wow64
                         : (ch && ch.wow64 !== undefined) ? !!ch.wow64 : undefined);

    const seed = String(G && G.__GLOBAL_SEED);
    // Алиасы для совместимости с воркер-патчем
    return {
      ua, vendor, language: lang, languages: langs, dpr, cpu, mem, timeZone,
      uaData,
      uaCH: uaData,
      highEntropy: he,
      hardwareConcurrency: cpu,
      deviceMemory: mem,
      seed
    };
  }

  function syncShared(port){ const snap = envSnapshot(); port.start(); port.postMessage({ __ENV_SYNC__: { envSnapshot: snap } }); }
  function syncDedicated(worker){ const snap = envSnapshot(); worker.postMessage({ __ENV_SYNC__: { envSnapshot: snap } }); }
  return { envSnapshot, syncShared, syncDedicated };
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
      scope.__ENV_HUB__ = hub;
    }
  };
  return hub;
}


// 2a) Обёртка для вызова из бандла
function EnvHubPatchModule(G){
  const hub = EnvHub_init(G);
  G.__ENV_HUB__ = hub;   // здесь фикс: записываем в глобал один раз
}

// 3) Установка оверрайдов (Worker/Shared/SW).Используем SafeWorkerOverride.
function WorkerOverrides_install(G, hub) {
  const already = G.Worker && (G.Worker.__ENV_WRAPPED__ === true || String(G.Worker).includes('WrappedWorker'));
  if (!already) SafeWorkerOverride(G);

  if (G.SharedWorker) {
    const alreadySW = !!(G.SharedWorker && G.SharedWorker.__ENV_WRAPPED__ === true);
    if (!alreadySW) SafeSharedWorkerOverride(G);
  }
  ServiceWorkerOverride(G);
}


// 4) Публикация стартового снапшота 
function EnvPublishSnapshotModule(G){
  const EB = EnvBus(G);
  const snap = EB.envSnapshot();
  if (!G.__ENV_HUB__ || typeof G.__ENV_HUB__.publish !== 'function') {
    throw new Error('EnvPublish: hub missing');
  }
  G.__ENV_HUB__.publish(snap);
}


// === env-worker-bridge (главный бандл) ===
(function setupEnvBridge(global){
  global.__ENV_BRIDGE__ = global.__ENV_BRIDGE__ || {};
  const BR = global.__ENV_BRIDGE__;

function mkModuleWorkerSource(snapshot, absUrl){
  const SNAP = JSON.stringify(snapshot || null);
  const USER = JSON.stringify(String(absUrl));
  return `
    (async function(){
      'use strict';
      self.__GW_BOOTSTRAP__ = true;
      const __requireSnap = s => {
        if (!s || typeof s !== 'object') throw new Error('UACHPatch: no snapshot');
        if (typeof s.language !== 'string' || !s.language) throw new Error('UACHPatch: bad language');
        if (!Array.isArray(s.languages)) throw new Error('UACHPatch: bad languages');
        if (!Number.isFinite(Number(s.deviceMemory))) throw new Error('UACHPatch: bad deviceMemory');
        if (!Number.isFinite(Number(s.hardwareConcurrency))) throw new Error('UACHPatch: bad hardwareConcurrency');
        if (!s.uaData && !s.uaCH) throw new Error('UACHPatch: missing userAgentData');
        return s;
      };
      self.__applyEnvSnapshot__ = s => { self.__lastSnap__ = __requireSnap(s); };
      self.__applyEnvSnapshot__(${SNAP});
      if (!self.__ENV_SYNC_BC_INSTALLED__) {
        if (typeof BroadcastChannel !== 'function') throw new Error('UACHPatch: BroadcastChannel missing');
        self.__ENV_SYNC_BC_INSTALLED__ = true;
        const bc = new BroadcastChannel('__ENV_SYNC__');
        bc.onmessage = ev => { const s = ev?.data?.__ENV_SYNC__?.envSnapshot; if (s) self.__applyEnvSnapshot__(s); };
      }
      // <<< ВПЕЧАТАННЫЙ URL ПАТЧА >>>
      const PATCH_URL = ${JSON.stringify(global.__ENV_BRIDGE__.urls.workerPatchModule || "")};
      if (!PATCH_URL) throw new Error('UACHPatch: missing workerPatchModule URL');
      await import(PATCH_URL);
      if (typeof self.installWorkerUACHMirror !== 'function') throw new Error('UACHPatch: installWorkerUACHMirror missing');
      self.installWorkerUACHMirror();
      if (!self.__WORKER_PATCH_LOADED__) throw new Error('UACHPatch: patch marker missing');
      if (!self.__UACH_MIRROR_INSTALLED__) throw new Error('UACHPatch: mirror not installed');
      // Применяем снимок СЕЙЧАС, уже через реализацию патча:
      if (!self.__applyEnvSnapshot__ || !self.__lastSnap__) throw new Error('UACHPatch: snapshot not applied');
      self.__applyEnvSnapshot__(self.__lastSnap__);
      // Только ПОСЛЕ зеркала грузим пользовательский код:
      const USER = ${USER};
      if (!USER || typeof USER !== 'string') throw new Error('UACHPatch: missing user module URL');
      await import(USER);
    })();
    export {};
    //# sourceURL=worker_module_bootstrap.js
  `;
}




function mkClassicWorkerSource(snapshot, absUrl){
  const SNAP = JSON.stringify(snapshot || null);
  const USER = JSON.stringify(String(absUrl));
  return `
    (function(){
      'use strict';
      self.__GW_BOOTSTRAP__ = true;
      var __requireSnap = function(s){
        if (!s || typeof s !== 'object') throw new Error('UACHPatch: no snapshot');
        if (typeof s.language !== 'string' || !s.language) throw new Error('UACHPatch: bad language');
        if (!Array.isArray(s.languages)) throw new Error('UACHPatch: bad languages');
        if (!Number.isFinite(Number(s.deviceMemory))) throw new Error('UACHPatch: bad deviceMemory');
        if (!Number.isFinite(Number(s.hardwareConcurrency))) throw new Error('UACHPatch: bad hardwareConcurrency');
        if (!s.uaData && !s.uaCH) throw new Error('UACHPatch: missing userAgentData');
        return s;
      };
      self.__applyEnvSnapshot__ = function(s){ self.__lastSnap__ = __requireSnap(s); };
      self.__applyEnvSnapshot__(${SNAP});
      if (!self.__ENV_SYNC_BC_INSTALLED__) {
        if (typeof BroadcastChannel !== 'function') throw new Error('UACHPatch: BroadcastChannel missing');
        self.__ENV_SYNC_BC_INSTALLED__ = true;
        const bc = new BroadcastChannel('__ENV_SYNC__');
        bc.onmessage = function(ev){ var s = ev && ev.data && ev.data.__ENV_SYNC__ && ev.data.__ENV_SYNC__.envSnapshot; if (s) self.__applyEnvSnapshot__(s); };
      }
      // <<< ВПЕЧАТАННЫЙ URL ПАТЧА >>>
      const PATCH_URL = ${JSON.stringify(global.__ENV_BRIDGE__.urls.workerPatchClassic || "")};
      if (!PATCH_URL) throw new Error('UACHPatch: missing workerPatchClassic URL');
      importScripts(PATCH_URL);
      if (typeof self.installWorkerUACHMirror !== 'function') throw new Error('UACHPatch: installWorkerUACHMirror missing');
      self.installWorkerUACHMirror();
      if (!self.__WORKER_PATCH_LOADED__) throw new Error('UACHPatch: patch marker missing');
      if (!self.__UACH_MIRROR_INSTALLED__) throw new Error('UACHPatch: mirror not installed');
      // Применяем снимок СЕЙЧАС, уже через реализацию патча:
      if (!self.__applyEnvSnapshot__ || !self.__lastSnap__) throw new Error('UACHPatch: snapshot not applied');
      self.__applyEnvSnapshot__(self.__lastSnap__);
      var USER = ${USER};
      if (!USER || typeof USER !== 'string') throw new Error('UACHPatch: missing user script URL');
      importScripts(USER);
    })();
    //# sourceURL=worker_classic_bootstrap.js
  `;
}


  // Паблик-API для main
  function publishSnapshot(snap){
    if (typeof BroadcastChannel !== 'function') {
      throw new Error('EnvPublish: BroadcastChannel missing');
    }
    const bc = new BroadcastChannel('__ENV_SYNC__');
    bc.postMessage({ __ENV_SYNC__: { envSnapshot: snap } });
  }
  if (BR.mkModuleWorkerSource && BR.mkModuleWorkerSource !== mkModuleWorkerSource) {
    throw new Error('EnvBridge: mkModuleWorkerSource already set');
  }
  if (BR.mkClassicWorkerSource && BR.mkClassicWorkerSource !== mkClassicWorkerSource) {
    throw new Error('EnvBridge: mkClassicWorkerSource already set');
  }
  if (BR.publishSnapshot && BR.publishSnapshot !== publishSnapshot) {
    throw new Error('EnvBridge: publishSnapshot already set');
  }
  if (BR.envSnapshot && BR.envSnapshot !== EnvBus(global).envSnapshot) {
    throw new Error('EnvBridge: envSnapshot already set');
  }
  BR.mkModuleWorkerSource  = mkModuleWorkerSource;
  BR.mkClassicWorkerSource = mkClassicWorkerSource;
  BR.publishSnapshot       = publishSnapshot;
  BR.envSnapshot           = EnvBus(global).envSnapshot;
})(window);


// === SafeWorkerOverride (Dedicated) ===
function requireWorkerSnapshot(snap, label){
  if (!snap || typeof snap !== 'object') throw new Error(`[WorkerOverride] missing snapshot${label ? ` (${label})` : ''}`);
  if (typeof snap.language !== 'string' || !snap.language) throw new Error('[WorkerOverride] snapshot.language missing');
  if (!Array.isArray(snap.languages)) throw new Error('[WorkerOverride] snapshot.languages missing');
  if (!Number.isFinite(Number(snap.deviceMemory))) throw new Error('[WorkerOverride] snapshot.deviceMemory missing');
  if (!Number.isFinite(Number(snap.hardwareConcurrency))) throw new Error('[WorkerOverride] snapshot.hardwareConcurrency missing');
  if (!Number.isFinite(Number(snap.dpr))) throw new Error('[WorkerOverride] snapshot.dpr missing');
  if (!snap.uaData && !snap.uaCH) throw new Error('[WorkerOverride] snapshot.uaData missing');
  return snap;
}

function SafeWorkerOverride(G){
  if (!G || !G.Worker) throw new Error('[WorkerOverride] Worker missing');
  if (G.Worker.__ENV_WRAPPED__) return;
  const NativeWorker = G.Worker;

G.Worker = function WrappedWorker(url, opts) {
  const abs = new URL(url, location.href).href;
  const workerType = (opts && opts.type) === 'module' ? 'module' : 'classic';
  const bridge = G.__ENV_BRIDGE__;
  if (!bridge || typeof bridge.mkClassicWorkerSource !== 'function') {
    console.error('[WorkerOverride] __ENV_BRIDGE__ not ready, refusing to create unpatched Worker');
    throw new Error('[WorkerOverride] __ENV_BRIDGE__ not ready; refusing to create unpatched Worker');
  }
  if (typeof bridge.mkModuleWorkerSource !== 'function') {
    throw new Error('[WorkerOverride] mkModuleWorkerSource missing');
  }
  if (typeof bridge.publishSnapshot !== 'function') {
    throw new Error('[WorkerOverride] publishSnapshot missing');
  }
  if (typeof bridge.envSnapshot !== 'function') {
    throw new Error('[WorkerOverride] envSnapshot missing');
  }
  const snap = requireWorkerSnapshot(bridge.envSnapshot(), 'create');
  G.__lastSnap__ = snap;
  bridge.publishSnapshot(snap);

  const src = workerType === 'module'
    ? bridge.mkModuleWorkerSource(snap, abs)
    : bridge.mkClassicWorkerSource(snap, abs);

  const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
  try {
    return new NativeWorker(blobURL, { ...(opts || {}), type: workerType });
  } finally {
    URL.revokeObjectURL(blobURL);
  }
};

  G.Worker.__ENV_WRAPPED__ = true;
    // маркер для диагностики
  if (G.__DEBUG__) {  
    try { G.__PATCHED_SAFE_WORKER__ = true; console.info('SafeWorker installed'); } catch(_){}
}
}
window.SafeWorkerOverride = SafeWorkerOverride;


// === SafeSharedWorkerOverride (Shared) ===
function SafeSharedWorkerOverride(G){
  if (!G || !G.SharedWorker) throw new Error('[SharedWorkerOverride] SharedWorker missing');
  if (G.SharedWorker.__ENV_WRAPPED__) return;
  const NativeShared = G.SharedWorker;

  G.SharedWorker = function WrappedSharedWorker(url, name) {
    const abs = new URL(url, location.href).href;
    const bridge = G.__ENV_BRIDGE__;
    if (!bridge || typeof bridge.mkClassicWorkerSource !== 'function') {
      console.error('[SharedWorkerOverride] __ENV_BRIDGE__ not ready, refusing to create unpatched SharedWorker');
      throw new Error('[SharedWorkerOverride] __ENV_BRIDGE__ not ready; refusing to create unpatched SharedWorker');
    }
    if (typeof bridge.publishSnapshot !== 'function') {
      throw new Error('[SharedWorkerOverride] publishSnapshot missing');
    }
    if (typeof bridge.envSnapshot !== 'function') {
      throw new Error('[SharedWorkerOverride] envSnapshot missing');
    }
    const snap = requireWorkerSnapshot(bridge.envSnapshot(), 'create');
    G.__lastSnap__ = snap;
    bridge.publishSnapshot(snap);
    const src = bridge.mkClassicWorkerSource(snap, abs);
    const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));

    try {
      return new NativeShared(blobURL, name);
    } finally {
      URL.revokeObjectURL(blobURL);
    }
  };
  G.SharedWorker.__ENV_WRAPPED__ = true;
  if (G.__DEBUG__) {
    try { G.__PATCHED_SHARED_WORKER__ = true; console.info('SharedWorker installed'); } catch(_){}
}
}
window.SafeSharedWorkerOverride = SafeSharedWorkerOverride;



// ===== ServiceWorker override (allow self/infra; block others; hub-friendly) =====
function ServiceWorkerOverride(G){
  'use strict';
  try { if (!G || !G.navigator || !('serviceWorker' in G.navigator)) return; } catch(_) { return; }

  // --- Идемпотентная проверка: если уже обёрнуто — выходим (без HUB-флагов)
  try {
    const sw    = G.navigator.serviceWorker;
    const proto = Object.getPrototypeOf(sw) || sw;
    const fn    = proto && proto.register;
    // Check three methods at once
    const already =
      (typeof fn === 'function' &&
       (fn.__ENV_WRAPPED__ === true || /\bWrappedServiceWorkerRegister\b/.test(String(fn)))) &&
      (typeof (proto && proto.getRegistrations) === 'function' &&
       (proto.getRegistrations.__ENV_WRAPPED__ === true || /\bWrappedSWGetRegistrations\b/.test(String(proto.getRegistrations)))) &&
      (typeof (proto && proto.getRegistration) === 'function' &&
       (proto.getRegistration.__ENV_WRAPPED__ === true || /\bWrappedSWGetRegistration\b/.test(String(proto.getRegistration))));
    if (already) return;
  } catch(_) {}

  const SWC   = G.navigator.serviceWorker;
  const proto = Object.getPrototypeOf(SWC) || SWC;

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

  const hostOf  = (u, base) => { try { return new URL(u, base || G.location.href).hostname.toLowerCase(); } catch { return ''; } };
  const isSelf  = (h) => !!h && (h === (G.location.hostname||'').toLowerCase());
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
  function makeFakeServiceWorker(scriptURL, scope){
    return { scriptURL: scriptURL || ((scope || '/') + '__blocked_sw__.js'),
             state: 'activated', onstatechange: null,
             postMessage(){}, addEventListener(){}, removeEventListener(){} };
  }
  function makeFakeRegistration(options, scriptURL){
    const scope = (options && options.scope) || '/';
    const active = makeFakeServiceWorker(scriptURL, scope);
    return {
      scope, installing: null, waiting: null, active,
      navigationPreload: { enable:async()=>{}, disable:async()=>{}, getState:async()=>({enabled:false, headerValue:''}) },
      addEventListener(){}, removeEventListener(){},
      update:async()=>{}, unregister:async()=>true
    };
  }

  // ---- register ----
  if (typeof Native.register === 'function') {
    function WrappedServiceWorkerRegister(url, opts){
      if (!isAllowed(url, (opts && opts.scope))) {
        if (wantFake()) return Promise.resolve(makeFakeRegistration(opts, String(url||'')));
        const Err = (typeof DOMException === 'function')
          ? new DOMException('ServiceWorker register blocked by policy', 'SecurityError')
          : new Error('ServiceWorker register blocked by policy');
        return Promise.reject(Err);
      }
      return Native.register.apply(this, arguments);
    }
    try { Object.defineProperty(WrappedServiceWorkerRegister, 'name', { value: 'WrappedServiceWorkerRegister' }); } catch(_){}
    WrappedServiceWorkerRegister.__ENV_WRAPPED__ = true;
    Object.defineProperty(proto, 'register', { configurable: true, writable: true, value: WrappedServiceWorkerRegister });
  }

  // ---- getRegistrations ----
  if (typeof Native.getRegistrations === 'function') {
    async function WrappedSWGetRegistrations(){
      const regs = await Native.getRegistrations.apply(this, arguments);
      if (!wantFilter()) return regs;
      const out = [];
      for (const r of regs || []) {
        const sc  = (r && r.scope) || '/';
        const url = (r && r.active && r.active.scriptURL) || sc;
        if (isAllowed(url, sc)) {
          out.push(r);
        } else {
          if (wantClean() && !CLEANED.has(sc)) {
            try { await r.unregister(); } catch(_) {}
            CLEANED.add(sc);
          }
          if (wantFake()) out.push(makeFakeRegistration({ scope: sc }, url));
        }
      }
      return out;
    }
    try { Object.defineProperty(WrappedSWGetRegistrations, 'name', { value: 'WrappedSWGetRegistrations' }); } catch(_){}
    WrappedSWGetRegistrations.__ENV_WRAPPED__ = true;                  
    Object.defineProperty(proto, 'getRegistrations', {                 
      configurable: true, writable: true, value: WrappedSWGetRegistrations
    });
  }

  // ---- getRegistration ----
  if (typeof Native.getRegistration === 'function') {
    async function WrappedSWGetRegistration(scope){
      const r = await Native.getRegistration.apply(this, arguments);
      if (!r) return wantFake() && wantFilter() ? makeFakeRegistration({ scope }) : r;
      if (!wantFilter()) return r;

      const sc  = r.scope || scope || '/';
      const url = (r.active && r.active.scriptURL) || sc;
      if (isAllowed(url, sc)) return r;

      if (wantClean() && !CLEANED.has(sc)) {
        try { await r.unregister(); } catch(_) {}
        CLEANED.add(sc);
      }
      return wantFake() ? makeFakeRegistration({ scope: sc }, url) : undefined;
    }
    try { Object.defineProperty(WrappedSWGetRegistration, 'name', { value: 'WrappedSWGetRegistration' }); } catch(_){}
    WrappedSWGetRegistration.__ENV_WRAPPED__ = true;                    
    Object.defineProperty(proto, 'getRegistration', {                  
      configurable: true, writable: true, value: WrappedSWGetRegistration
    });
  }

  //Diagnostics
  if (G.__DEBUG__) {  
    try { G.__PATCHED_SERVICE_WORKER__ = true; console.info('ServiceWorker installed'); } catch(_){}
}
}
window.ServiceWorkerOverride = ServiceWorkerOverride;



// --- mirror fonts readiness to worker/globalThis (Offscreen/Worker) ---
(function mirrorFontsReadyOnce() {
  const G = (typeof globalThis !== 'undefined' && globalThis)
    || (typeof self       !== 'undefined' && self)
    || (typeof window     !== 'undefined' && window)
    || (typeof global     !== 'undefined' && global)
    || {};
  if (!G) return;

  const p = G.__fontsReady || G.awaitFontsReady;
  if (G.__FONTS_READY__) return; 
  if (p && typeof p.then === 'function') {
    p.then(() => {
      if (G.__FONTS_READY__) return;
      G.__FONTS_READY__ = true;
      try { G.dispatchEvent && G.dispatchEvent(new Event('fontsready')); } catch (_) {}
    }).catch(() => {
      // даже при ошибке считаем готовым, чтобы не залипли хуки
      G.__FONTS_READY__ = true;
      try { G.dispatchEvent && G.dispatchEvent(new Event('fontsready')); } catch (_) {}
    });
  }
})();


// === WorkerPatchHooks: оркестратор ===
(function WorkerPatchHooks(G){
  if (!G || G.WorkerPatchHooks) return;

  // 1) Hub (идемпотентно, без сайд-эффектов)
  function initHub(){
    const hub = G.__ENV_HUB__ || EnvHubPatchModule(G) || G.__ENV_HUB__;
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
    const snap = EnvBus(G).envSnapshot();
    if (!G.__ENV_HUB__ || typeof G.__ENV_HUB__.publish !== 'function') {
      throw new Error('[WorkerInit] hub missing');
    }
    G.__ENV_HUB__.publish(snap);
    return snap;
  }

  // 4) HE-догонка (не блокирует загрузку, без «N»/«Nav»)
  function snapshotHE(keys){
    const UAD = G.navigator && G.navigator.userAgentData;
    if (!UAD || typeof UAD.getHighEntropyValues !== 'function') {
      throw new Error('[WorkerInit] userAgentData missing');
    }
    const KEYS = Array.isArray(keys) && keys.length
      ? keys
      : ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','formFactors','wow64'];
    return UAD.getHighEntropyValues(KEYS).then(he => {
      G.__LAST_UACH_HE__ = he || {};
      const snap = EnvBus(G).envSnapshot();
      if (!G.__ENV_HUB__ || typeof G.__ENV_HUB__.publish !== 'function') {
        throw new Error('[WorkerInit] hub missing');
      }
      G.__ENV_HUB__.publish(snap);
      return he;
    });
  }

  // 5) Полный сценарий
  function initAll(opts){
    const o = Object.assign({ publishHE: true, heKeys: null }, opts||{});
    installOverrides();        // Hub → Overrides
    snapshotOnce();            // первый снап
    if (o.publishHE) snapshotHE(o.heKeys); // HE-догонка
  }

  // 6) Diagnostics
  function diag(){
    if (!G.__DEBUG__) return {};
    const BR = G.__ENV_BRIDGE__ || {};
    return {
      hasHub:        !!G.__ENV_HUB__,
      workerWrapped: !!(G.Worker && (G.Worker.__ENV_WRAPPED__ || /WrappedWorker/.test(String(G.Worker)))),
      sharedWrapped: !!(G.SharedWorker && G.SharedWorker.__ENV_WRAPPED__),
      swWrapped:     !!G.__PATCHED_SERVICE_WORKER__,
      bridge: {
        mkClassic: typeof BR.mkClassicWorkerSource === 'function',
        mkModule:  typeof BR.mkModuleWorkerSource  === 'function',
        publish:   typeof BR.publishSnapshot       === 'function',
        envSnap:   typeof BR.envSnapshot           === 'function'
      }
    };
  }
  G.WorkerPatchHooks = { initHub, installOverrides, snapshotOnce, snapshotHE, initAll, diag };
  window.WorkerPatchHooks = G.WorkerPatchHooks;
  if (G.__DEBUG__) { 
    console.info('[WorkerInit] WorkerPatchHooks ready');
  } 
})(window);

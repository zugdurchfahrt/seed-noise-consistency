// 1) Источник снапшотов 
function EnvBus(G){
  function envSnapshot(){
    let langs = G.__normalizedLanguages;
    if (!Array.isArray(langs)) {
      if (typeof langs === 'string') langs = [langs];
      else langs = []; 
    }
    const lang     = (typeof G.__primaryLanguage === 'string') ? G.__primaryLanguage : (langs[0]);
    const ua       = G.__USER_AGENT;
    const vendor   = G.__VENDOR;
    const dpr      = (typeof devicePixelRatio === 'number' && devicePixelRatio > 0)
      ? +devicePixelRatio
      : ((typeof globalThis !== 'undefined' && typeof globalThis.__DPR === 'number' && globalThis.__DPR > 0)
          ? +globalThis.__DPR
          : undefined);
    const cpu      = G.__cpu;
    const mem      = G.__memory;
    const timeZone = G.__TIMEZONE__ ?? (G.Intl?.DateTimeFormat?.().resolvedOptions().timeZone);

    // ЕДИНЫЙ источник CH: сначала берем подготовленный (__EXPECTED_CLIENT_HINTS), иначе — low-entropy из navigator
    let ch = null;
    if (G.__EXPECTED_CLIENT_HINTS && typeof G.__EXPECTED_CLIENT_HINTS === 'object') {
      ch = G.__EXPECTED_CLIENT_HINTS;
    } else {
      ch = { platform: "unknown", brands: [], mobile: false };
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

    // высокоэнтропийные + прочее, в один объект he
    const he = {};
    const put = (k,v)=>{ if (v !== undefined && v !== null) he[k] = v; };

    // ← интеграция тех самых двух переменных под уже существующими именами
    put('uaFullVersion',   ch && ch.uaFullVersion);
    put('fullVersionList', ch && ch.fullVersionList);

    // остальные (если есть в __EXPECTED_CLIENT_HINTS)
    put('architecture',    ch && ch.architecture);
    put('bitness',         ch && ch.bitness);
    put('model',           ch && ch.model);
    put('platformVersion', ch && ch.platformVersion);
    put('formFactors',     ch && ch.formFactors);
    put('wow64',           (ch && ch.wow64 !== undefined) ? !!ch.wow64 : undefined);

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

  function syncShared(port){ const snap = envSnapshot(); try{port.start();}catch(_){} try{ port.postMessage({ __ENV_SYNC__: { envSnapshot: snap } }); }catch(_){} }
  function syncDedicated(worker){ const snap = envSnapshot(); try{ worker.postMessage({ __ENV_SYNC__: { envSnapshot: snap } }); }catch(_){} }
  return { envSnapshot, syncShared, syncDedicated };
}


// 2) Хаб (инициализация без записи в глобал): вернёт объект hub
function EnvHub_init(G){
  const bc = new BroadcastChannel('__ENV_SYNC__');
  const state = { snap: null };
  const hub = {
    v: 1000001,
    __OWNS_WORKER__: false,
    __OWNS_SHARED__: false,
    __OWNS_SW__:     false,
    getSnapshot(){ return state.snap; },
    publish(snap){ state.snap = snap; try { bc.postMessage({ __ENV_SYNC__: { envSnapshot: snap } }); } catch(_){ } },
    subscribe(fn){ const h = ev=>{ try{ fn(ev?.data?.__ENV_SYNC__?.envSnapshot); }catch(_){} }; bc.addEventListener('message',h); return ()=>bc.removeEventListener('message',h); },
    installWorkerNavMirror(scope){ try{ scope.__ENV_HUB__ = hub; }catch(_){} }
  };
  return hub;
}


// 2a) Обёртка для вызова из бандла
function EnvHubPatchModule(G){
  try {
    const hub = EnvHub_init(G);
    G.__ENV_HUB__ = hub;   // здесь фикс: записываем в глобал один раз
  } catch(_){}
}

// 3) Установка оверрайдов (Worker/Shared/SW).Используем SafeWorkerOverride.
function WorkerOverrides_install(G, hub) {
  try {
    const already = G.Worker && (G.Worker.__ENV_WRAPPED__ === true || String(G.Worker).includes('WrappedWorker'));
    if (!already) SafeWorkerOverride(G);
  } catch (_) {}

  try {
    if (G.SharedWorker) {

      const alreadySW = !!(G.SharedWorker && G.SharedWorker.__ENV_WRAPPED__ === true);
      if (!alreadySW) SafeSharedWorkerOverride(G);
    }
  } catch (_) {}

  try { ServiceWorkerOverride(G); } catch (_) {}
}


// 4) Публикация стартового снапшота 
function EnvPublishSnapshotModule(G){
  try {
    const EB = EnvBus(G);
    const snap = EB.envSnapshot();
    G.__ENV_HUB__ && typeof G.__ENV_HUB__.publish === 'function' && G.__ENV_HUB__.publish(snap);
  } catch(_){}
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
      try{ self.__GW_BOOTSTRAP__ = true; }catch(_){}
      self.__applyEnvSnapshot__ = s => { try{ self.__lastSnap__ = s; }catch(_){} };
      try{ if (${SNAP}) self.__applyEnvSnapshot__(${SNAP}); }catch(_){}
      try{
        const bc = new BroadcastChannel('__ENV_SYNC__');
        bc.onmessage = ev => { const s = ev?.data?.__ENV_SYNC__?.envSnapshot; if (s) self.__applyEnvSnapshot__(s); };
      }catch(_){}
      // <<< ВПЕЧАТАННЫЙ URL ПАТЧА >>>
      const PATCH_URL = ${JSON.stringify(global.__ENV_BRIDGE__.urls.workerPatchModule || "")};
      const INLINE = ${JSON.stringify((global.__ENV_BRIDGE__||{}).inlinePatch || "")};
      try{
        if (PATCH_URL) {
          await import(PATCH_URL);
        } else if (INLINE) {
          const u = URL.createObjectURL(new Blob(["/*module*/\\n", INLINE, "\\nexport{{}};"], {type:'text/javascript'}));
          try { await import(u); } finally { try{ URL.revokeObjectURL(u);}catch(_){ } }
        }
        if (typeof self.installWorkerUACHMirror === 'function') self.installWorkerUACHMirror();
        else console.warn('[UACHPatch] installWorkerUACHMirror missing');
        // Применяем снимок СЕЙЧАС, уже через реализацию патча:
        if (self.__applyEnvSnapshot__ && self.__lastSnap__) self.__applyEnvSnapshot__(self.__lastSnap__);
        // Только ПОСЛЕ зеркала грузим пользовательский код:
        const USER = ${USER};
        if (USER && typeof USER === 'string') await import(USER);
      }catch(e){ try{ console.warn('[UACHPatch] module import failed', e && (e.message||e)); }catch(_){}}    
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
      try{ self.__GW_BOOTSTRAP__ = true; }catch(_){}
      self.__applyEnvSnapshot__ = function(s){ try{ self.__lastSnap__ = s; }catch(_){} };
      try{ if (${SNAP}) self.__applyEnvSnapshot__(${SNAP}); }catch(_){}
      try{
        const bc = new BroadcastChannel('__ENV_SYNC__');
        bc.onmessage = function(ev){ var s = ev && ev.data && ev.data.__ENV_SYNC__ && ev.data.__ENV_SYNC__.envSnapshot; if (s) self.__applyEnvSnapshot__(s); };
      }catch(_){}
      // <<< ВПЕЧАТАННЫЙ URL ПАТЧА >>>
      const PATCH_URL = ${JSON.stringify(global.__ENV_BRIDGE__.urls.workerPatchClassic || "")};
      const INLINE = ${JSON.stringify((global.__ENV_BRIDGE__||{}).inlinePatch || "")};
      try{
        if (PATCH_URL) {
          importScripts(PATCH_URL);
        } else if (INLINE) {
          const u = URL.createObjectURL(new Blob([INLINE], {type:'text/javascript'}));
          try { importScripts(u); } finally { try{ URL.revokeObjectURL(u);}catch(_){ } }
        }
        if (typeof self.installWorkerUACHMirror === 'function') {
          self.installWorkerUACHMirror();
          console.info('[UACHPatch] PATCH_URL inside worker', PATCH_URL);
        } else {
          console.warn('[UACHPatch] installWorkerUACHMirror missing');
        }
      }catch(e){ try{ console.warn('[UACHPatch] classic importScripts failed', e && (e.message||e)); }catch(_){}}    
      try{ importScripts(${USER}); }catch(_){}
    })();
    //# sourceURL=worker_classic_bootstrap.js
  `;
}


  // Паблик-API для main
  function publishSnapshot(snap){
    try{
      const bc = new BroadcastChannel('__ENV_SYNC__');
      bc.postMessage({ __ENV_SYNC__: { envSnapshot: snap } });
    }catch(_){}
  }
  BR.mkModuleWorkerSource  = BR.mkModuleWorkerSource  || mkModuleWorkerSource;
  BR.mkClassicWorkerSource = BR.mkClassicWorkerSource || mkClassicWorkerSource;
  BR.publishSnapshot       = BR.publishSnapshot       || publishSnapshot;
  BR.envSnapshot           = BR.envSnapshot           || EnvBus(global).envSnapshot;
})(window);


// === SafeWorkerOverride (Dedicated) ===
function SafeWorkerOverride(G){
  if (!G || !G.Worker || G.Worker.__ENV_WRAPPED__) return;
  const NativeWorker = G.Worker;

G.Worker = function WrappedWorker(url, opts) {
  const abs = new URL(url, location.href).href;
  const workerType = (opts && opts.type) === 'module' ? 'module' : 'classic';
  const bridge = G.__ENV_BRIDGE__;
  if (!bridge || typeof bridge.mkClassicWorkerSource !== 'function') {
    console.error('[WorkerOverride] __ENV_BRIDGE__ not ready, fallback');
    return new NativeWorker(url, opts); // или NativeWorker(url, opts)
  }
  const snap = typeof bridge.envSnapshot === 'function' ? bridge.envSnapshot() : null;

  const src = workerType === 'module'
    ? bridge.mkModuleWorkerSource(snap, abs)
    : bridge.mkClassicWorkerSource(snap, abs);

  const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
  try {
    const w = new NativeWorker(blobURL, { ...(opts || {}), type: workerType });
    try { URL.revokeObjectURL(blobURL); } catch (_) {}
    return w;
  } catch (e) {
    try { URL.revokeObjectURL(blobURL); } catch (_) {}
    return new NativeWorker(url, opts); // CSP fallback
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
  if (!G || !G.SharedWorker || G.SharedWorker.__ENV_WRAPPED__) return;
  const NativeShared = G.SharedWorker;

  G.SharedWorker = function WrappedSharedWorker(url, name) {
    const abs = new URL(url, location.href).href;
    const bridge = G.__ENV_BRIDGE__;
    if (!bridge || typeof bridge.mkClassicWorkerSource !== 'function') {
      console.error('[WorkerOverride] __ENV_BRIDGE__ not ready, fallback');
      return new NativeShared(url, name); // или NativeWorker(url, opts)
    }
    const snap = typeof bridge.envSnapshot === 'function' ? bridge.envSnapshot() : null;
    const src = bridge.mkClassicWorkerSource(snap, abs);
    const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));

    try {
      const w = new NativeShared(blobURL, name);
      try { URL.revokeObjectURL(blobURL); } catch(_) {}
      return w;
    } catch (e) {
      try { URL.revokeObjectURL(blobURL); } catch(_) {}
      return new NativeShared(url, name);
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
    try {
      return G.__ENV_HUB__ || EnvHubPatchModule(G) || G.__ENV_HUB__;
    } catch(e) {
      console.warn('[WorkerInit] initHub:', e);
      return G.__ENV_HUB__ || null;
    }
  }

  // 2) Overrides (Worker/Shared/SW) — после Hub
  function installOverrides(){
    const hub = initHub();
    try { WorkerOverrides_install(G, hub); } catch(e){ console.warn('[WorkerInit] overrides:', e); }
    return hub;
  }

  // 3) Первый снапшот (LE) из текущего состояния
  function snapshotOnce(){
    try {
      const snap = EnvBus(G).envSnapshot();
      if (G.__ENV_HUB__ && typeof G.__ENV_HUB__.publish === 'function') G.__ENV_HUB__.publish(snap);
      return snap;
    } catch(e){ console.warn('[WorkerInit] snapshotOnce:', e); return null; }
  }

  // 4) HE-догонка (не блокирует загрузку, без «N»/«Nav»)
  function snapshotHE(keys){
    try {
      const UAD = G.navigator && G.navigator.userAgentData;
      if (!UAD || typeof UAD.getHighEntropyValues !== 'function') return null;
      const KEYS = Array.isArray(keys) && keys.length
        ? keys
        : ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','formFactors','wow64'];
      return UAD.getHighEntropyValues(KEYS).then(he => {
        G.__LAST_UACH_HE__ = he || {};
        const snap = EnvBus(G).envSnapshot();
        if (G.__ENV_HUB__ && typeof G.__ENV_HUB__.publish === 'function') G.__ENV_HUB__.publish(snap);
        return he;
      }).catch(() => null);
    } catch { return null; }
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












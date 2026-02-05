// === WRK MODULE ===
const WrkModule = function WrkModule(window) {
  'use strict';
  const G = (typeof globalThis !== 'undefined' && globalThis)
    || (typeof self       !== 'undefined' && self)
    || (typeof window     !== 'undefined' && window)
    || (typeof global     !== 'undefined' && global)
    || {};

  const mark = (function() {
    const ensure = (G && typeof G.__ensureMarkAsNative === 'function') ? G.__ensureMarkAsNative : null;
    const m = ensure ? ensure() : null;
    if (typeof m !== 'function') {
      throw new Error('[WrkModule] markAsNative missing');
    }
    return m;
  })();

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

    // ЕДИНЫЙ источник CH: берем подготовленный (__EXPECTED_CLIENT_HINTS)
    let ch = null;
    if (G.__EXPECTED_CLIENT_HINTS && typeof G.__EXPECTED_CLIENT_HINTS === 'object') {
      ch = G.__EXPECTED_CLIENT_HINTS;
    } else {
      throw new Error('EnvBus: __EXPECTED_CLIENT_HINTS missing');
    }

    // низкоэнтропийные — ровно как вы уже именуете: uaData
    const uaData = ch ? (() => {
      if (typeof ch.platform !== 'string' || !ch.platform) {
        throw new Error('THW: uaData.platform missing');
      }
      let brandsSrc = null;
      if (Array.isArray(ch.brands)) {
        brandsSrc = ch.brands;
      } else if (Array.isArray(ch.fullVersionList)) {
        brandsSrc = ch.fullVersionList;
      } else {
        throw new Error('THW: uaData.brands missing');
      }
      const brands = brandsSrc.map(x => {
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
        return { brand, version: major };
      });
      return { platform: ch.platform, brands, mobile: !!ch.mobile };
    })() : null;
    if (!uaData) throw new Error('EnvBus: uaData missing');

    const HE_KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
    const heSource = (G.__UACH_HE_READY__ && G.__LAST_UACH_HE__ && typeof G.__LAST_UACH_HE__ === 'object')
      ? G.__LAST_UACH_HE__
      : (G.__EXPECTED_CLIENT_HINTS && typeof G.__EXPECTED_CLIENT_HINTS === 'object')
        ? G.__EXPECTED_CLIENT_HINTS
        : null;
    if (!heSource) throw new Error('EnvBus: high entropy missing');
    const he = {};
    for (const k of HE_KEYS) {
      if (!(k in heSource)) throw new Error(`EnvBus: high entropy missing ${k}`);
      const v = heSource[k];
      if (v === undefined || v === null) throw new Error(`EnvBus: high entropy bad ${k}`);
      if (typeof v === 'string' && !v.trim() && k !== 'model') {
        throw new Error(`EnvBus: high entropy bad ${k}`);
      }
      if (k === 'fullVersionList' && !Array.isArray(v)) {
        throw new Error('EnvBus: high entropy bad fullVersionList');
      }
      if (Array.isArray(v) && !v.length) throw new Error(`EnvBus: high entropy bad ${k}`);
      he[k] = v;
    }
    uaData.he = he;

    const seed = String(G && G.__GLOBAL_SEED);
    const windowKeys = (() => {
      try {
        const keys = Object.getOwnPropertyNames(G);
        if (!Array.isArray(keys) || keys.length === 0) {
          throw new Error('EnvBus: windowKeys missing');
        }
        return keys;
      } catch (e) {
        throw new Error('EnvBus: windowKeys missing');
      }
    })();
    // Алиасы для совместимости с воркер-патчем
    return {
      ua, vendor, language: lang, languages: langs, dpr, cpu, mem, timeZone,
      uaData,
      uaCH: uaData,
      highEntropy: he,
      hardwareConcurrency: cpu,
      deviceMemory: mem,
      seed,
      windowKeys
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



// === env-worker-bridge (главный бандл) ===
(function setupEnvBridge(global){
  const BR = (global.__ENV_BRIDGE__ = global.__ENV_BRIDGE__ || {});

function mkModuleWorkerSource(snapshot, absUrl){
  if (!snapshot || typeof snapshot !== 'object') throw new Error('THW: mkModuleWorkerSource bad snapshot');
  if (typeof absUrl !== 'string' || !absUrl) throw new Error('THW: mkModuleWorkerSource bad absUrl');
  const patchUrl = global.__ENV_BRIDGE__ && global.__ENV_BRIDGE__.urls && global.__ENV_BRIDGE__.urls.workerPatchModule;
  if (typeof patchUrl !== 'string' || !patchUrl) throw new Error('THW: mkModuleWorkerSource bad workerPatchModule url');
  const SNAP = JSON.stringify(snapshot);
  const USER = JSON.stringify(absUrl);
  const PATCH_URL = JSON.stringify(patchUrl);
  return `
    (async function(){
      'use strict';
      self.__GW_BOOTSTRAP__ = true;
      var __ENV_EMIT_Q__ = [];
      var __emit = function(msg){
        var sent = false;
        try { if (typeof self.postMessage === 'function') self.postMessage(msg); } catch(_e) {}
        try { sent = sent || (typeof self.postMessage === 'function'); } catch(_e) {}
        try {
          if (self.__ENV_SHARED_PORTS__ && self.__ENV_SHARED_PORTS__.length) {
            for (var i = 0; i < self.__ENV_SHARED_PORTS__.length; i++) {
              try { self.__ENV_SHARED_PORTS__[i].postMessage(msg); } catch(_e) {}
            }
            sent = true;
          }
        } catch(_e) {}
        if (!sent) {
          try { __ENV_EMIT_Q__.push(msg); } catch(_e) {}
        }
      };
      try {
        if (!self.__ENV_SHARED_PORTS__) self.__ENV_SHARED_PORTS__ = [];
        // SharedWorker needs port-based signalling; do not rely on onconnect (user code can overwrite it).
        self.addEventListener('connect', function(ev){
          try {
            var ports = ev && ev.ports;
            if (ports && ports.length) {
              for (var j = 0; j < ports.length; j++) {
                try { if (typeof ports[j].start === 'function') ports[j].start(); } catch(_e) {}
                self.__ENV_SHARED_PORTS__.push(ports[j]);
              }
            }
          } catch(_e) {}
          try {
            if (__ENV_EMIT_Q__ && __ENV_EMIT_Q__.length) {
              var q = __ENV_EMIT_Q__.slice(0);
              __ENV_EMIT_Q__.length = 0;
              for (var k = 0; k < q.length; k++) {
                try { __emit(q[k]); } catch(_e) {}
              }
            }
          } catch(_e) {}
        });
      } catch(_e) {}
      // Buffer early messages sent before user code installs its handler(s).
      // Without this, callers that postMessage immediately after Worker() may time out.
      const __MSG_Q__ = [];
      let __MSG_BUF__ = true;
      const __onEarlyMsg__ = ev => { if (__MSG_BUF__) __MSG_Q__.push(ev && ev.data); };
      try { self.addEventListener('message', __onEarlyMsg__); } catch(_e) {}
      const __requireSnap = s => {
        if (!s || typeof s !== 'object') throw new Error('UACHPatch: no snapshot');
        if (typeof s.language !== 'string' || !s.language) throw new Error('UACHPatch: bad language');
        if (!Array.isArray(s.languages)) throw new Error('UACHPatch: bad languages');
        if (!Number.isFinite(Number(s.deviceMemory))) throw new Error('UACHPatch: bad deviceMemory');
        if (!Number.isFinite(Number(s.hardwareConcurrency))) throw new Error('UACHPatch: bad hardwareConcurrency');
        if (!s.uaData && !s.uaCH) throw new Error('UACHPatch: missing userAgentData');
        const he = (s.uaData && s.uaData.he) || (s.uaCH && s.uaCH.he) || s.highEntropy || (s.uaCH && s.uaCH.highEntropy);
        if (!he || typeof he !== 'object') throw new Error('UACHPatch: missing highEntropy');
        const KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
        for (const k of KEYS) {
          if (!(k in he)) throw new Error('UACHPatch: missing highEntropy.' + k);
          const v = he[k];
          if (v === undefined || v === null) throw new Error('UACHPatch: bad highEntropy.' + k);
          if (Array.isArray(v) && !v.length) throw new Error('UACHPatch: bad highEntropy.' + k);
        }
        return s;
      };
      self.__applyEnvSnapshot__ = s => {
        if (self.__ENV_SNAP_APPLIED__ === s) return;
        self.__lastSnap__ = __requireSnap(s);
        self.__ENV_SNAP_APPLIED__ = s;
      };
      try {
        self.__applyEnvSnapshot__(${SNAP});
      } catch (e) {
        self.__lastSnap__ = ${SNAP};
        self.__ENV_SNAP_ERROR__ = String((e && (e.stack || e.message)) || e);
      }
      if (!self.__ENV_SYNC_BC_INSTALLED__) {
        try {
          if (typeof BroadcastChannel !== 'function') throw new Error('UACHPatch: BroadcastChannel missing');
          self.__ENV_SYNC_BC_INSTALLED__ = true;
          const bc = new BroadcastChannel('__ENV_SYNC__');
          bc.onmessage = ev => { const s = ev?.data?.__ENV_SYNC__?.envSnapshot; if (s) self.__applyEnvSnapshot__(s); };
        } catch (e) {
          self.__ENV_BC_ERROR__ = String((e && (e.stack || e.message)) || e);
        }
      }
      // --- Seed nativization (Window → Worker). No runtime coupling after start. ---
      try {
        if (typeof self.__ensureMarkAsNative !== 'function') {
          const nativeGetOwnProp = Object.getOwnPropertyDescriptor;

          const fpToStringDesc = nativeGetOwnProp(Function.prototype, 'toString');
          const existingToString = fpToStringDesc && fpToStringDesc.value;
          const existingBridge = !!(existingToString && existingToString.__TOSTRING_BRIDGE__);

          if (existingBridge) {
            const n = existingToString.__NativeToString;
            const m = existingToString.__NativeToStringMap;
            if (typeof n !== 'function' || !(m instanceof WeakMap)) {
              throw new Error('UACHPatch: seed toString bridge invalid');
            }
          }

          const nativeToString = existingBridge
            ? existingToString.__NativeToString
            : (existingToString || Function.prototype.toString);

          if (typeof nativeToString !== 'function') {
            throw new Error('UACHPatch: Function.prototype.toString missing');
          }

          const toStringMap = existingBridge
            ? existingToString.__NativeToStringMap
            : new WeakMap();

          function baseMarkAsNative(func, name = "") {
            if (typeof func !== 'function') return func;
            const n = name || func.name || "";
            const label = n
              ? ('function ' + n + '() { [native code] }')
              : 'function () { [native code] }';
            toStringMap.set(func, label);
            return func;
          }

          let memoMarkAsNative = null;
          function ensureMarkAsNative() {
            if (memoMarkAsNative) return memoMarkAsNative;
            if (!baseMarkAsNative.__TOSTRING_BRIDGE__) {
              Object.defineProperty(baseMarkAsNative, '__TOSTRING_BRIDGE__', {
                value: true,
                writable: false,
                configurable: true,
                enumerable: false
              });
            }
            memoMarkAsNative = baseMarkAsNative;
            return memoMarkAsNative;
          }

          Object.defineProperty(self, '__ensureMarkAsNative', {
            value: ensureMarkAsNative,
            writable: true,
            configurable: true,
            enumerable: false
          });

          if (!existingBridge) {
            const d = nativeGetOwnProp(Function.prototype, 'toString');

            const toString = ({ toString() {
              if (typeof this !== 'function') {
                return nativeToString.call(this);
              }
              const v = toStringMap.get(this);
              if (v !== undefined) return v;
              return nativeToString.call(this);
            }}).toString;

            Object.defineProperty(toString, '__TOSTRING_BRIDGE__', {
              value: true, writable: false, configurable: true, enumerable: false
            });
            Object.defineProperty(toString, '__NativeToString', {
              value: nativeToString, writable: false, configurable: true, enumerable: false
            });
            Object.defineProperty(toString, '__NativeToStringMap', {
              value: toStringMap, writable: false, configurable: true, enumerable: false
            });
            Object.defineProperty(toString, '__TOSTRING_PROXY_INSTALLED__', {
              value: true, writable: false, configurable: true, enumerable: false
            });

            const markAsNative = ensureMarkAsNative();
            markAsNative(toString, 'toString');
            markAsNative(ensureMarkAsNative, '__ensureMarkAsNative');

            Object.defineProperty(Function.prototype, 'toString', {
              value: toString,
              writable: d ? !!d.writable : true,
              configurable: d ? !!d.configurable : true,
              enumerable: d ? !!d.enumerable : false
            });
          }
        }
      } catch (e) {
        self.__ENV_SEED_ERROR__ = String((e && (e.stack || e.message)) || e);
        throw e;
      }
      let __patchOK = false;
      try {
        // <<< ВПЕЧАТАННЫЙ URL ПАТЧА >>>
        const PATCH_URL = ${PATCH_URL};
        if (!PATCH_URL) throw new Error('UACHPatch: missing workerPatchModule URL');
        await import(PATCH_URL);
        if (typeof self.installWorkerUACHMirror !== 'function') throw new Error('UACHPatch: installWorkerUACHMirror missing');
        self.installWorkerUACHMirror();
        if (!self.__WORKER_PATCH_LOADED__) throw new Error('UACHPatch: patch marker missing');
        if (!self.__UACH_MIRROR_INSTALLED__) throw new Error('UACHPatch: mirror not installed');
        __patchOK = true;
      } catch (e) {
        try { __emit({ __ENV_BOOTSTRAP_ERROR__: String((e && (e.stack || e.message)) || e) }); } catch (_e) {}
        self.__ENV_PATCH_ERROR__ = String((e && (e.stack || e.message)) || e);
        throw e;
      }
      if (__patchOK) {
        try {
          // Применяем снимок СЕЙЧАС, уже через реализацию патча:
          if (!self.__applyEnvSnapshot__ || !self.__lastSnap__) throw new Error('UACHPatch: snapshot not applied');
          self.__applyEnvSnapshot__(self.__lastSnap__);
        } catch (e) {
          try { __emit({ __ENV_BOOTSTRAP_ERROR__: String((e && (e.stack || e.message)) || e) }); } catch (_e) {}
          self.__ENV_PATCH_APPLY_ERROR__ = String((e && (e.stack || e.message)) || e);
        }
      }
      // Только ПОСЛЕ зеркала грузим пользовательский код:
      const USER = ${USER};
      if (!USER || typeof USER !== 'string') throw new Error('UACHPatch: missing user module URL');
      await import(USER);
      // Replay any early messages after user code is loaded.
      __MSG_BUF__ = false;
      try { self.removeEventListener('message', __onEarlyMsg__); } catch(_e) {}
      try {
        if (typeof MessageEvent === 'function' && typeof self.dispatchEvent === 'function') {
          for (const d of __MSG_Q__) self.dispatchEvent(new MessageEvent('message', { data: d }));
        }
      } catch(_e) {}
      try { __emit({ __ENV_PATCH_OK__: __patchOK === true, __ENV_USER_URL_LOADED__: USER }); } catch(_e) {}
    })();
    export {};
    //# sourceURL=worker_module_bootstrap.js
  `;
}




function mkClassicWorkerSource(snapshot, absUrl){
  if (!snapshot || typeof snapshot !== 'object') throw new Error('THW: mkClassicWorkerSource bad snapshot');
  if (typeof absUrl !== 'string' || !absUrl) throw new Error('THW: mkClassicWorkerSource bad absUrl');
  const patchUrl = global.__ENV_BRIDGE__ && global.__ENV_BRIDGE__.urls && global.__ENV_BRIDGE__.urls.workerPatchClassic;
  if (typeof patchUrl !== 'string' || !patchUrl) throw new Error('THW: mkClassicWorkerSource bad workerPatchClassic url');
  const SNAP = JSON.stringify(snapshot);
  const USER = JSON.stringify(absUrl);
  const PATCH_URL = JSON.stringify(patchUrl);
  return `
    (function(){
      'use strict';
      self.__GW_BOOTSTRAP__ = true;
      var __ENV_EMIT_Q__ = [];
      var __emit = function(msg){
        var sent = false;
        try { if (typeof self.postMessage === 'function') self.postMessage(msg); } catch(_e) {}
        try { sent = sent || (typeof self.postMessage === 'function'); } catch(_e) {}
        try {
          if (self.__ENV_SHARED_PORTS__ && self.__ENV_SHARED_PORTS__.length) {
            for (var i = 0; i < self.__ENV_SHARED_PORTS__.length; i++) {
              try { self.__ENV_SHARED_PORTS__[i].postMessage(msg); } catch(_e) {}
            }
            sent = true;
          }
        } catch(_e) {}
        if (!sent) {
          try { __ENV_EMIT_Q__.push(msg); } catch(_e) {}
        }
      };
      try {
        if (!self.__ENV_SHARED_PORTS__) self.__ENV_SHARED_PORTS__ = [];
        // SharedWorker needs port-based signalling; do not rely on onconnect (user code can overwrite it).
        self.addEventListener('connect', function(ev){
          try {
            var ports = ev && ev.ports;
            if (ports && ports.length) {
              for (var j = 0; j < ports.length; j++) {
                try { if (typeof ports[j].start === 'function') ports[j].start(); } catch(_e) {}
                self.__ENV_SHARED_PORTS__.push(ports[j]);
              }
            }
          } catch(_e) {}
          try {
            if (__ENV_EMIT_Q__ && __ENV_EMIT_Q__.length) {
              var q = __ENV_EMIT_Q__.slice(0);
              __ENV_EMIT_Q__.length = 0;
              for (var k = 0; k < q.length; k++) {
                try { __emit(q[k]); } catch(_e) {}
              }
            }
          } catch(_e) {}
        });
      } catch(_e) {}
      // Buffer early messages sent before user code installs its handler(s).
      var __MSG_Q__ = [];
      var __MSG_BUF__ = true;
      var __onEarlyMsg__ = function(ev){ if (__MSG_BUF__) __MSG_Q__.push(ev && ev.data); };
      try { self.addEventListener('message', __onEarlyMsg__); } catch(_e) {}
      var __requireSnap = function(s){
        if (!s || typeof s !== 'object') throw new Error('UACHPatch: no snapshot');
        if (typeof s.language !== 'string' || !s.language) throw new Error('UACHPatch: bad language');
        if (!Array.isArray(s.languages)) throw new Error('UACHPatch: bad languages');
        if (!Number.isFinite(Number(s.deviceMemory))) throw new Error('UACHPatch: bad deviceMemory');
        if (!Number.isFinite(Number(s.hardwareConcurrency))) throw new Error('UACHPatch: bad hardwareConcurrency');
        if (!s.uaData && !s.uaCH) throw new Error('UACHPatch: missing userAgentData');
        const he = (s.uaData && s.uaData.he) || (s.uaCH && s.uaCH.he) || s.highEntropy || (s.uaCH && s.uaCH.highEntropy);
        if (!he || typeof he !== 'object') throw new Error('UACHPatch: missing highEntropy');
        const KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
        for (const k of KEYS) {
          if (!(k in he)) throw new Error('UACHPatch: missing highEntropy.' + k);
          const v = he[k];
          if (v === undefined || v === null) throw new Error('UACHPatch: bad highEntropy.' + k);
          if (Array.isArray(v) && !v.length) throw new Error('UACHPatch: bad highEntropy.' + k);
        }
        return s;
      };
      self.__applyEnvSnapshot__ = function(s){
        if (self.__ENV_SNAP_APPLIED__ === s) return;
        self.__lastSnap__ = __requireSnap(s);
        self.__ENV_SNAP_APPLIED__ = s;
      };
      try {
        self.__applyEnvSnapshot__(${SNAP});
      } catch (e) {
        self.__lastSnap__ = ${SNAP};
        self.__ENV_SNAP_ERROR__ = String((e && (e.stack || e.message)) || e);
      }
      if (!self.__ENV_SYNC_BC_INSTALLED__) {
        try {
          if (typeof BroadcastChannel !== 'function') throw new Error('UACHPatch: BroadcastChannel missing');
          self.__ENV_SYNC_BC_INSTALLED__ = true;
          const bc = new BroadcastChannel('__ENV_SYNC__');
          bc.onmessage = function(ev){ var s = ev && ev.data && ev.data.__ENV_SYNC__ && ev.data.__ENV_SYNC__.envSnapshot; if (s) self.__applyEnvSnapshot__(s); };
        } catch (e) {
          self.__ENV_BC_ERROR__ = String((e && (e.stack || e.message)) || e);
        }
      }

      // --- Seed nativization (Window → Worker). No runtime coupling after start. ---
      try {
        if (typeof self.__ensureMarkAsNative !== 'function') {
          const nativeGetOwnProp = Object.getOwnPropertyDescriptor;

          const fpToStringDesc = nativeGetOwnProp(Function.prototype, 'toString');
          const existingToString = fpToStringDesc && fpToStringDesc.value;
          const existingBridge = !!(existingToString && existingToString.__TOSTRING_BRIDGE__);

          if (existingBridge) {
            const n = existingToString.__NativeToString;
            const m = existingToString.__NativeToStringMap;
            if (typeof n !== 'function' || !(m instanceof WeakMap)) {
              throw new Error('UACHPatch: seed toString bridge invalid');
            }
          }

          const nativeToString = existingBridge
            ? existingToString.__NativeToString
            : (existingToString || Function.prototype.toString);

          if (typeof nativeToString !== 'function') {
            throw new Error('UACHPatch: Function.prototype.toString missing');
          }

          const toStringMap = existingBridge
            ? existingToString.__NativeToStringMap
            : new WeakMap();

          function baseMarkAsNative(func, name = "") {
            if (typeof func !== 'function') return func;
            const n = name || func.name || "";
            const label = n
              ? ('function ' + n + '() { [native code] }')
              : 'function () { [native code] }';
            toStringMap.set(func, label);
            return func;
          }

          let memoMarkAsNative = null;
          function ensureMarkAsNative() {
            if (memoMarkAsNative) return memoMarkAsNative;
            if (!baseMarkAsNative.__TOSTRING_BRIDGE__) {
              Object.defineProperty(baseMarkAsNative, '__TOSTRING_BRIDGE__', {
                value: true,
                writable: false,
                configurable: true,
                enumerable: false
              });
            }
            memoMarkAsNative = baseMarkAsNative;
            return memoMarkAsNative;
          }

          Object.defineProperty(self, '__ensureMarkAsNative', {
            value: ensureMarkAsNative,
            writable: true,
            configurable: true,
            enumerable: false
          });

          if (!existingBridge) {
            const d = nativeGetOwnProp(Function.prototype, 'toString');

            const toString = ({ toString() {
              if (typeof this !== 'function') {
                return nativeToString.call(this);
              }
              const v = toStringMap.get(this);
              if (v !== undefined) return v;
              return nativeToString.call(this);
            }}).toString;

            Object.defineProperty(toString, '__TOSTRING_BRIDGE__', {
              value: true, writable: false, configurable: true, enumerable: false
            });
            Object.defineProperty(toString, '__NativeToString', {
              value: nativeToString, writable: false, configurable: true, enumerable: false
            });
            Object.defineProperty(toString, '__NativeToStringMap', {
              value: toStringMap, writable: false, configurable: true, enumerable: false
            });
            Object.defineProperty(toString, '__TOSTRING_PROXY_INSTALLED__', {
              value: true, writable: false, configurable: true, enumerable: false
            });

            const markAsNative = ensureMarkAsNative();
            markAsNative(toString, 'toString');
            markAsNative(ensureMarkAsNative, '__ensureMarkAsNative');

            Object.defineProperty(Function.prototype, 'toString', {
              value: toString,
              writable: d ? !!d.writable : true,
              configurable: d ? !!d.configurable : true,
              enumerable: d ? !!d.enumerable : false
            });
          }
        }
      } catch (e) {
        self.__ENV_SEED_ERROR__ = String((e && (e.stack || e.message)) || e);
        throw e;
      }








      let __patchOK = false;
      try {
        // <<< ВПЕЧАТАННЫЙ URL ПАТЧА >>>
        const PATCH_URL = ${PATCH_URL};
        if (!PATCH_URL) throw new Error('UACHPatch: missing workerPatchClassic URL');
        importScripts(PATCH_URL);
        if (typeof self.installWorkerUACHMirror !== 'function') throw new Error('UACHPatch: installWorkerUACHMirror missing');
        self.installWorkerUACHMirror();
        if (!self.__WORKER_PATCH_LOADED__) throw new Error('UACHPatch: patch marker missing');
        if (!self.__UACH_MIRROR_INSTALLED__) throw new Error('UACHPatch: mirror not installed');
        __patchOK = true;
      } catch (e) {
        try { __emit({ __ENV_BOOTSTRAP_ERROR__: String((e && (e.stack || e.message)) || e) }); } catch (_e) {}
        self.__ENV_PATCH_ERROR__ = String((e && (e.stack || e.message)) || e);
        throw e;
      }
      if (__patchOK) {
        try {
          // Применяем снимок СЕЙЧАС, уже через реализацию патча:
          if (!self.__applyEnvSnapshot__ || !self.__lastSnap__) throw new Error('UACHPatch: snapshot not applied');
          self.__applyEnvSnapshot__(self.__lastSnap__);
        } catch (e) {
          try { __emit({ __ENV_BOOTSTRAP_ERROR__: String((e && (e.stack || e.message)) || e) }); } catch (_e) {}
          self.__ENV_PATCH_APPLY_ERROR__ = String((e && (e.stack || e.message)) || e);
        }
      }
      var __isModuleURL = function(u){
        if (typeof u !== 'string' || !u) return false;
        if (/\\.mjs(?:$|[?#])/i.test(u)) return true;
        if (/[?&]type=module(?:&|$)/i.test(u)) return true;
        if (/[?&]module(?:&|$)/i.test(u)) return true;
        if (/#module\\b/i.test(u)) return true;
        if (u.slice(0, 5) === 'data:') {
          return /;module\\b/i.test(u) || /\\bmodule\\b/i.test(u.slice(0, 80));
        }
        return false;
      };
      var USER = ${USER};
      if (!USER || typeof USER !== 'string') throw new Error('UACHPatch: missing user script URL');
      if (__isModuleURL(USER)) {
        return import(USER).then(function(){
          __emit({ __ENV_PATCH_OK__: __patchOK === true, __ENV_USER_URL_LOADED__: USER });
        });
      }
      try {
        importScripts(USER);
      } catch (e) {
        return import(USER).then(function(){
          // Replay any early messages after user code is loaded.
          __MSG_BUF__ = false;
          try { self.removeEventListener('message', __onEarlyMsg__); } catch(_e) {}
          try {
            if (typeof MessageEvent === 'function' && typeof self.dispatchEvent === 'function') {
              for (var i = 0; i < __MSG_Q__.length; i++) self.dispatchEvent(new MessageEvent('message', { data: __MSG_Q__[i] }));
            }
          } catch(_e) {}
          __emit({ __ENV_PATCH_OK__: __patchOK === true, __ENV_USER_URL_LOADED__: USER });
        });
      }
      // Replay any early messages after user code is loaded.
      __MSG_BUF__ = false;
      try { self.removeEventListener('message', __onEarlyMsg__); } catch(_e) {}
      try {
        if (typeof MessageEvent === 'function' && typeof self.dispatchEvent === 'function') {
          for (var i = 0; i < __MSG_Q__.length; i++) self.dispatchEvent(new MessageEvent('message', { data: __MSG_Q__[i] }));
        }
      } catch(_e) {}
      __emit({ __ENV_PATCH_OK__: __patchOK === true, __ENV_USER_URL_LOADED__: USER });
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
function requireWorkerSnapshot(snap, label) {
  if (!snap || typeof snap !== 'object') {
    if (label) {
      throw new Error(`[WorkerOverride] missing snapshot (${label})`);
    }
    throw new Error('[WorkerOverride] missing snapshot');
  }
  if (typeof snap.language !== 'string' || !snap.language) throw new Error('[WorkerOverride] snapshot.language missing');
  if (!Array.isArray(snap.languages)) throw new Error('[WorkerOverride] snapshot.languages missing');
  if (!Number.isFinite(Number(snap.deviceMemory))) throw new Error('[WorkerOverride] snapshot.deviceMemory missing');
  if (!Number.isFinite(Number(snap.hardwareConcurrency))) throw new Error('[WorkerOverride] snapshot.hardwareConcurrency missing');
  if (!Number.isFinite(Number(snap.dpr))) throw new Error('[WorkerOverride] snapshot.dpr missing');
  if (!snap.uaData && !snap.uaCH) throw new Error('[WorkerOverride] snapshot.uaData missing');
  const he = (snap.uaData && snap.uaData.he) || (snap.uaCH && snap.uaCH.he) || snap.highEntropy || (snap.uaCH && snap.uaCH.highEntropy);
  if (!he || typeof he !== 'object') throw new Error('[WorkerOverride] snapshot.highEntropy missing');
  const KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
  for (const k of KEYS) {
    if (!(k in he)) throw new Error(`[WorkerOverride] snapshot.highEntropy.${k} missing`);
    const v = he[k];
    if (v === undefined || v === null) throw new Error(`[WorkerOverride] snapshot.highEntropy.${k} missing`);
    if (Array.isArray(v) && !v.length) throw new Error(`[WorkerOverride] snapshot.highEntropy.${k} missing`);
  }
  return snap;
}

function installBlobURLStore(G) {
  if (!G || !G.URL || typeof G.URL.createObjectURL !== 'function') return;
  if (G.__BLOB_URL_STORE__) return;
  const store = new Map();
  Object.defineProperty(G, '__BLOB_URL_STORE__', { value: store, configurable: false, writable: false });
  if (typeof mark !== 'function') {
    throw new Error('[WorkerOverride] markAsNative missing');
  }
  const nativeCreate = G.URL.createObjectURL;
  const nativeRevoke = G.URL.revokeObjectURL;
  const createWrapped = mark(function createObjectURL(obj){
    const url = nativeCreate.call(G.URL, obj);
    if (obj && typeof obj === 'object') store.set(url, obj);
    return url;
  }, 'createObjectURL');
  const revokeWrapped = mark(function revokeObjectURL(url){
    if (store.has(url)) store.delete(url);
    return nativeRevoke.call(G.URL, url);
  }, 'revokeObjectURL');
  const dCreate = Object.getOwnPropertyDescriptor(G.URL, 'createObjectURL');
  const dRevoke = Object.getOwnPropertyDescriptor(G.URL, 'revokeObjectURL');
  if (dCreate && dCreate.configurable === false && dCreate.writable === false) {
    throw new Error('[WorkerOverride] URL.createObjectURL not writable');
  }
  if (dRevoke && dRevoke.configurable === false && dRevoke.writable === false) {
    throw new Error('[WorkerOverride] URL.revokeObjectURL not writable');
  }
  Object.defineProperty(G.URL, 'createObjectURL', Object.assign({}, dCreate, { value: createWrapped }));
  Object.defineProperty(G.URL, 'revokeObjectURL', Object.assign({}, dRevoke, { value: revokeWrapped }));
}

function resolveUserScriptURL(G, absUrl, label) {
  if (typeof absUrl !== 'string' || !absUrl) return absUrl;
  if (absUrl.slice(0, 5) !== 'blob:') return absUrl;
  const store = G && G.__BLOB_URL_STORE__;
  if (!store || !store.has(absUrl)) {
    const l = label ? ` (${label})` : '';
    throw new Error(`[WorkerOverride] blob URL missing from store${l}`);
  }
  const blob = store.get(absUrl);
  const fresh = G.URL.createObjectURL(blob);
  return fresh;
}

function isProbablyModuleWorkerURL(absUrl) {
  if (typeof absUrl !== 'string' || !absUrl) return false;
  if (/\.mjs(?:$|[?#])/i.test(absUrl)) return true;
  if (/[?&]type=module(?:&|$)/i.test(absUrl)) return true;
  if (/[?&]module(?:&|$)/i.test(absUrl)) return true;
  if (/#module\\b/i.test(absUrl)) return true;
  if (absUrl.slice(0, 5) === 'data:') {
    return /;module\\b/i.test(absUrl) || /\\bmodule\\b/i.test(absUrl.slice(0, 80));
  }
  return false;
}

function resolveWorkerType(absUrl, opts, label) {
  const hasType = !!(opts && (typeof opts === 'object' || typeof opts === 'function') && ('type' in opts));
  const t = hasType ? opts.type : undefined;
  if (hasType && t !== 'module' && t !== 'classic') {
    const l = label ? ` (${label})` : '';
    throw new Error(`[WorkerOverride] invalid worker type${l}`);
  }
  const isModuleURL = isProbablyModuleWorkerURL(absUrl);
  if (t === 'classic' && isModuleURL) {
    const l = label ? ` (${label})` : '';
    throw new Error(`[WorkerOverride] module worker URL with classic type${l}`);
  }
  return (t === 'module' || (!hasType && isModuleURL)) ? 'module' : 'classic';
}

function definePatchedValue(target, key, value, label) {
  const d = Object.getOwnPropertyDescriptor(target, key)
    || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target) || {}, key);
  if (!d) {
    throw new Error(`[WorkerOverride] ${label || key} descriptor missing`);
  }
  Object.defineProperty(target, key, {
    value,
    configurable: d.configurable,
    enumerable: d.enumerable,
    writable: d.writable
  });
}


function SafeWorkerOverride(G){
  if (!G || !G.Worker) throw new Error('[WorkerOverride] Worker missing');
  if (G.Worker.__ENV_WRAPPED__) return;
  installBlobURLStore(G);
  const NativeWorker = G.Worker;

  if (typeof mark !== 'function') {
    throw new Error('[WorkerOverride] markAsNative missing');
  }

  const WrappedWorker = mark(function Worker(url, opts) {
  const abs = new URL(url, location.href).href;
  const workerType = resolveWorkerType(abs, opts, 'Worker');
  const bridge = G.__ENV_BRIDGE__;
  if (!bridge
      || typeof bridge.mkClassicWorkerSource !== 'function'
      || typeof bridge.mkModuleWorkerSource !== 'function'
      || typeof bridge.publishSnapshot !== 'function'
      || typeof bridge.envSnapshot !== 'function') {
    const e = new Error('[WorkerOverride] FAIL_FAST: __ENV_BRIDGE__ not ready');
    if (typeof G.__DEGRADE__ === 'function') G.__DEGRADE__('wrk:worker_override_bridge_not_ready', e);
    throw e;
  }
  const snap = requireWorkerSnapshot(bridge.envSnapshot(), 'create');
  G.__lastSnap__ = snap;
  bridge.publishSnapshot(snap);

  // Important: for module workers, do not "clone" blob: URLs.
  // Some real-world bundles embed the original blob URL string for follow-up dynamic imports.
  // If we mint a fresh blob URL, those imports can later fail (original blob gets revoked).
  const userURL = (typeof abs === 'string' && abs.slice(0, 5) === 'blob:' && workerType === 'module')
    ? abs
    : resolveUserScriptURL(G, abs, 'Worker');
  const src = workerType === 'module'
    ? bridge.mkModuleWorkerSource(snap, userURL)
    : bridge.mkClassicWorkerSource(snap, userURL);

  const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
  const w = new NativeWorker(blobURL, { ...(opts), type: workerType });

  if (w && typeof w.addEventListener === 'function') {
    const cleanup = () => {
      try { URL.revokeObjectURL(blobURL); } catch(_) {}
      try { w.removeEventListener('message', onMsg); } catch(_) {}
      try { w.removeEventListener('error', onErr); } catch(_) {}
    };

    const onErr = () => {
      cleanup();
    };

    const onMsg = (ev) => {
      const data = ev && ev.data;

      const bootErr = data && typeof data === 'object' && data.__ENV_BOOTSTRAP_ERROR__;
      if (bootErr) {
        try { G.__LAST_WORKER_BOOTSTRAP_ERROR__ = bootErr; } catch(_) {}
        cleanup();
        return;
      }

      const loaded =
        data && typeof data === 'object' && typeof data.__ENV_USER_URL_LOADED__ === 'string'
          ? data.__ENV_USER_URL_LOADED__
          : null;

      if (loaded) {
        try { G.__LAST_WORKER_USER_URL_LOADED__ = loaded; } catch(_) {}
        // скрываем внутренний сигнал от внешних слушателей
        try { ev.stopImmediatePropagation(); ev.stopPropagation(); } catch(_) {}

        if (loaded === userURL && userURL !== abs) {
          try { URL.revokeObjectURL(userURL); } catch(_) {}
        }

        cleanup();
      }
    };

    w.addEventListener('message', onMsg);
    w.addEventListener('error', onErr);
  }

  return w;

}, 'Worker');

  definePatchedValue(G, 'Worker', WrappedWorker, 'Worker');

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
  installBlobURLStore(G);
  const NativeShared = G.SharedWorker;

  if (typeof mark !== 'function') {
    throw new Error('[SharedWorkerOverride] markAsNative missing');
  }

  // === SharedWorker override wrapper (complete, self-contained) ===
  const WrappedSharedWorker = mark(function SharedWorker(url, nameOrOpts) {
    const abs = new URL(url, location.href).href;

    // Normalize 2nd arg to an options object (always), so `type` is never lost
    const hasOptsObj =
      !!(nameOrOpts && (typeof nameOrOpts === 'object' || typeof nameOrOpts === 'function')) &&
      (typeof nameOrOpts !== 'string');

    const name =
      (typeof nameOrOpts === 'string')
        ? nameOrOpts
        : (hasOptsObj && typeof nameOrOpts.name === 'string' ? nameOrOpts.name : undefined);

    const optsForResolve = hasOptsObj ? nameOrOpts : (name !== undefined ? { name } : null);
    const workerType = resolveWorkerType(abs, optsForResolve, 'SharedWorker');

    const bridge = G.__ENV_BRIDGE__;
    if (!bridge
        || typeof bridge.mkClassicWorkerSource !== 'function'
        || typeof bridge.mkModuleWorkerSource !== 'function'
        || typeof bridge.publishSnapshot !== 'function'
        || typeof bridge.envSnapshot !== 'function') {
      // Fail-fast: SharedWorker reuse can lock a native (unpatched) worker for the whole origin.
      throw new Error('[SharedWorkerOverride] FAIL_FAST: __ENV_BRIDGE__ not ready');
    }

    const snap = requireWorkerSnapshot(bridge.envSnapshot(), 'create');
    G.__lastSnap__ = snap;
    bridge.publishSnapshot(snap);

  // Same reasoning as Worker(): keep original blob: URL for module SharedWorker scripts.
  const userURL = (typeof abs === 'string' && abs.slice(0, 5) === 'blob:' && workerType === 'module')
    ? abs
    : resolveUserScriptURL(G, abs, 'SharedWorker');
    const src = (workerType === 'module')
      ? bridge.mkModuleWorkerSource(snap, userURL)
      : bridge.mkClassicWorkerSource(snap, userURL);

    const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));

    let sw;
    try {
      // Always pass options-object so `type` definitely reaches the browser.
      const finalOpts = hasOptsObj ? { ...(nameOrOpts || {}) } : {};
      if (name !== undefined) finalOpts.name = name;
      finalOpts.type = workerType;

      sw = new NativeShared(blobURL, finalOpts);
    } finally {}
    // SharedWorker handshake (port-based): capture bootstrap/patch signals.
    try {
      const port = sw && sw.port;
      if (port && typeof port.addEventListener === 'function') {
        const onMsg = (ev) => {
          const data = ev && ev.data;
          if (!data || typeof data !== 'object') return;
          let internal = false;
          const bootErr = data.__ENV_BOOTSTRAP_ERROR__;
          if (bootErr) {
            internal = true;
            try { G.__LAST_SHARED_WORKER_BOOTSTRAP_ERROR__ = bootErr; } catch(_) {}
          }
          const loaded = data.__ENV_USER_URL_LOADED__;
          if (typeof loaded === 'string') {
            internal = true;
            try { G.__LAST_SHARED_WORKER_USER_URL_LOADED__ = loaded; } catch(_) {}
          }
          const ok = data.__ENV_PATCH_OK__;
          if (ok === true) {
            internal = true;
            try { G.__LAST_SHARED_WORKER_PATCH_OK__ = true; } catch(_) {}
          }
          if (internal) {
            try { ev.stopImmediatePropagation(); ev.stopPropagation(); } catch(_) {}
          }
        };
        port.addEventListener('message', onMsg);
        try { if (typeof port.start === 'function') port.start(); } catch(_) {}
      }
    } catch(_) {}
    // Post-create resync via BroadcastChannel (avoids interfering with user port messaging)
    try { bridge && bridge.publishSnapshot && bridge.publishSnapshot(snap); } catch(_) {}
    return sw;
  }, 'SharedWorker');
  
  
  
  definePatchedValue(G, 'SharedWorker', WrappedSharedWorker, 'SharedWorker');
  G.SharedWorker.__ENV_WRAPPED__ = true;
  if (G.__DEBUG__) {
    try { G.__PATCHED_SHARED_WORKER__ = true; console.info('SharedWorker installed'); } catch(_){}
}
}
window.SafeSharedWorkerOverride = SafeSharedWorkerOverride;



// ===== ServiceWorker override (allow self/infra; block others; hub-friendly) =====
function ServiceWorkerOverride(G){
  'use strict';
  if (!G || !G.navigator) {
    if (G && G.__DEBUG__) {
      try { console.info('ServiceWorkerOverride: navigator missing'); } catch(_){}
    }
    return;
  }
  if (G.isSecureContext === false) {
    return;
  }
  if (!('serviceWorker' in G.navigator)) {
    if (G.__DEBUG__) {
      try { console.info('ServiceWorkerOverride: navigator.serviceWorker missing'); } catch(_){}
    }
    return;
  }
  if (!G.navigator.serviceWorker) {
    if (G.__DEBUG__) {
      try { console.info('ServiceWorkerOverride: navigator.serviceWorker unavailable'); } catch(_){}
    }
    return;
  }

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
    if (already) {
      if (G.__DEBUG__) {
        try { G.__PATCHED_SERVICE_WORKER__ = true; console.info('ServiceWorker already installed'); } catch(_){}
      }
      return;
    }
  } catch(_) {}

  const SWC   = G.navigator.serviceWorker;
  const proto = Object.getPrototypeOf(SWC) || SWC;
  if (typeof mark !== 'function') {
    throw new Error('[ServiceWorkerOverride] markAsNative missing');
  }

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


  const hostOf = (u, base) => {
    try {
      return new URL(u, base || G.location.href).hostname.toLowerCase();
    } catch (e) {
      const emsg =
        (e && typeof e === 'object' && 'message' in e) ? e.message : String(e);
      throw new Error(
        `THW: hostOf failed (u=${String(u)}, base=${String(base)}): ${emsg}`
      );
    }
  };

  const isSelf  = (h) => !!h && (h === (G.location.hostname).toLowerCase());
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

  function makeFakeServiceWorker(scriptURL, scope) {
    if (typeof scriptURL !== 'string' || !scriptURL) {
      throw new Error('THW: makeFakeServiceWorker missing scriptURL');
    }
    if (typeof scope !== 'string' || !scope) {
      throw new Error('THW: makeFakeServiceWorker missing scope');
    }
    return {
      scriptURL,
      state: 'activated',
      onstatechange: null,
      postMessage() { throw new Error('THW: ServiceWorker.postMessage'); },
      addEventListener() { throw new Error('THW: ServiceWorker.addEventListener'); },
      removeEventListener() { throw new Error('THW: ServiceWorker.removeEventListener'); }
    };
  }

  function makeFakeRegistration(options, scriptURL) {
    if (!options || typeof options !== 'object') {
      throw new Error('THW: makeFakeRegistration missing options');
    }
    const scope = options.scope;
    if (typeof scope !== 'string' || !scope) {
      throw new Error('THW: makeFakeRegistration missing options.scope');
    }
    const active = makeFakeServiceWorker(scriptURL, scope);
    return {
      scope, installing: null, waiting: null, active,
      navigationPreload: {
        enable: async () => { throw new Error('THW: navigationPreload.enable'); },
        disable: async () => { throw new Error('THW: navigationPreload.disable'); },
        getState: async () => { throw new Error('THW: navigationPreload.getState'); }
      },
      addEventListener() { throw new Error('THW: registration.addEventListener'); },
      removeEventListener() { throw new Error('THW: registration.removeEventListener'); },
      update: async () => { throw new Error('THW: registration.update'); },
      unregister: async () => { throw new Error('THW: registration.unregister'); }
    };
  }


  // ---- register ----
  if (typeof Native.register === 'function') {
    const desc = Object.getOwnPropertyDescriptor(proto, 'register');
    if (!desc || desc.configurable === false || desc.writable === false) {
      throw new Error(`[ServiceWorkerOverride] register not configurable: ${JSON.stringify(desc)}`);
    }
    const WrappedServiceWorkerRegister = mark(function register(url, opts){
      if (!isAllowed(url, (opts && opts.scope))) {
        if (wantFake()) return Promise.resolve(makeFakeRegistration(opts, String(url)));
        const Err = (typeof DOMException === 'function')
          ? new DOMException('ServiceWorker register blocked by policy', 'SecurityError')
          : new Error('ServiceWorker register blocked by policy');
        return Promise.reject(Err);
      }

      // ServiceWorker.register must stay as network scriptURL (blob/data are unsupported).
      if (arguments.length >= 2) return Native.register.call(this, url, opts);
      return Native.register.call(this, url);

    }, 'register');
    try { Object.defineProperty(WrappedServiceWorkerRegister, 'name', { value: 'WrappedServiceWorkerRegister' }); } catch(_){}
    WrappedServiceWorkerRegister.__ENV_WRAPPED__ = true;
    Object.defineProperty(proto, 'register', {
      configurable: desc.configurable,
      enumerable: desc.enumerable,
      writable: desc.writable,
      value: WrappedServiceWorkerRegister
    });
  }

  // ---- getRegistrations ----
  if (typeof Native.getRegistrations === 'function') {
    const desc = Object.getOwnPropertyDescriptor(proto, 'getRegistrations');
    if (!desc || desc.configurable === false || desc.writable === false) {
      throw new Error(`[ServiceWorkerOverride] getRegistrations not configurable: ${JSON.stringify(desc)}`);
    }
    const WrappedSWGetRegistrations = mark(async function getRegistrations(){
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
    }, 'getRegistrations');
    try { Object.defineProperty(WrappedSWGetRegistrations, 'name', { value: 'WrappedSWGetRegistrations' }); } catch(_){}
    WrappedSWGetRegistrations.__ENV_WRAPPED__ = true;
    Object.defineProperty(proto, 'getRegistrations', {
      configurable: desc.configurable, enumerable: desc.enumerable, writable: desc.writable, value: WrappedSWGetRegistrations
    });
  }

  // ---- getRegistration ----
  if (typeof Native.getRegistration === 'function') {
    const desc = Object.getOwnPropertyDescriptor(proto, 'getRegistration');
    if (!desc || desc.configurable === false || desc.writable === false) {
      throw new Error(`[ServiceWorkerOverride] getRegistration not configurable: ${JSON.stringify(desc)}`);
    }
    const WrappedSWGetRegistration = mark(async function getRegistration(scope){
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
    }, 'getRegistration');
    try { Object.defineProperty(WrappedSWGetRegistration, 'name', { value: 'WrappedSWGetRegistration' }); } catch(_){}
    WrappedSWGetRegistration.__ENV_WRAPPED__ = true;
    Object.defineProperty(proto, 'getRegistration', {
      configurable: desc.configurable, enumerable: desc.enumerable, writable: desc.writable, value: WrappedSWGetRegistration
    });
  }

  //Diagnostics
  if (G.__DEBUG__) {
    try { G.__PATCHED_SERVICE_WORKER__ = true; console.info('ServiceWorker installed'); } catch(_){}
}
}
window.ServiceWorkerOverride = ServiceWorkerOverride;

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
    if (G.__UACH_HE_PROMISE__) return G.__UACH_HE_PROMISE__;
    const UAD = G.navigator && G.navigator.userAgentData;
    const KEYS = Array.isArray(keys) && keys.length
      ? keys
      : ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','formFactors','wow64'];
    const meta = G.__EXPECTED_CLIENT_HINTS;
    if (meta && typeof meta === 'object') {
      const he = {};
      for (const k of KEYS) {
        if (!(k in meta)) throw new Error(`[WorkerInit] high entropy missing ${k}`);
        const v = meta[k];
        if (v === undefined || v === null) throw new Error(`[WorkerInit] high entropy bad ${k}`);
        if (typeof v === 'string' && !v.trim() && k !== 'model') throw new Error(`[WorkerInit] high entropy bad ${k}`);
        if (k === 'fullVersionList' && !Array.isArray(v)) throw new Error('[WorkerInit] high entropy bad fullVersionList');
        if (Array.isArray(v) && !v.length) throw new Error(`[WorkerInit] high entropy bad ${k}`);
        he[k] = v;
      }
      G.__LAST_UACH_HE__ = he;
      G.__UACH_HE_READY__ = true;
      const p = Promise.resolve(he);
      G.__UACH_HE_PROMISE__ = p;
      return p;
    }
    if (!UAD || typeof UAD.getHighEntropyValues !== 'function') {
      if (!meta || typeof meta !== 'object') {
        throw new Error('[WorkerInit] userAgentData missing');
      }
      const he = {};
      for (const k of KEYS) {
        if (!(k in meta)) throw new Error(`[WorkerInit] high entropy missing ${k}`);
        const v = meta[k];
        if (v === undefined || v === null) throw new Error(`[WorkerInit] high entropy bad ${k}`);
        if (Array.isArray(v) && !v.length) throw new Error(`[WorkerInit] high entropy bad ${k}`);
        he[k] = v;
      }
      G.__LAST_UACH_HE__ = he;
      G.__UACH_HE_READY__ = true;
      const p = Promise.resolve(he);
      G.__UACH_HE_PROMISE__ = p;
      return p;
    }
    const p = UAD.getHighEntropyValues(KEYS).then(he => {
      if (!he || typeof he !== 'object') throw new Error('[WorkerInit] high entropy missing');
      for (const k of KEYS) {
        if (!(k in he)) throw new Error(`[WorkerInit] high entropy missing ${k}`);
        const v = he[k];
        if (v === undefined || v === null) throw new Error(`[WorkerInit] high entropy bad ${k}`);
        if (Array.isArray(v) && !v.length) throw new Error(`[WorkerInit] high entropy bad ${k}`);
      }
      G.__LAST_UACH_HE__ = he;
      G.__UACH_HE_READY__ = true;
      return he;
    });
    G.__UACH_HE_PROMISE__ = p;
    return p;
  }

  // 5) Полный сценарий
  function initAll(opts){
    const o = Object.assign({ publishHE: true, heKeys: null }, opts);
    installOverrides();        // Hub → Overrides
    if (o.publishHE) {
      const first = snapshotOnce();
      return snapshotHE(o.heKeys).then(() => {
        snapshotOnce();
        return first;
      });
    }
    return snapshotOnce();
  }

  // 6) Diagnostics
  function diag(){
    if (!G.__DEBUG__) return {};
    const BR = G.__ENV_BRIDGE__;
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

})(G); // <-- закрыли и СРАЗУ вызвали WorkerPatchHooks(G)


  window.WorkerPatchHooks = G.WorkerPatchHooks;
  if (G.__DEBUG__) {
    console.info('[WorkerInit] WorkerPatchHooks ready');
  }

  // reduce visibility of pipeline globals in Window realm (non-enumerable)
  try {
    const win = G;
    if (win && (typeof win === 'object' || typeof win === 'function')) {
      const keys = [
        '__ENV_BRIDGE__',
        '__ENV_HUB__',
        'CanvasPatchContext',
        '__TOSTRING_BRIDGE__',
        '__TOSTRING_PROXY_INSTALLED__',
        '__NativeToStringMap',
        'toStringOverrideMap'
      ];
      for (const k of keys) {
        if (!Object.prototype.hasOwnProperty.call(win, k)) continue;
        const d = Object.getOwnPropertyDescriptor(win, k);
        if (!d || d.enumerable === false) continue;
        if (d.configurable === false) {
          const e = new Error('[WrkModule] hidePipelineSurface non-configurable: ' + k);
          if (typeof win.__DEGRADE__ === 'function') win.__DEGRADE__('wrk:hide_pipeline_surface_nonconfigurable', e);
          continue;
        }
        if ('value' in d) {
          Object.defineProperty(win, k, { value: win[k], writable: !!d.writable, configurable: !!d.configurable, enumerable: false });
        } else {
          Object.defineProperty(win, k, { get: d.get, set: d.set, configurable: !!d.configurable, enumerable: false });
        }
      }
    }
  } catch (e) {
    if (typeof G.__DEGRADE__ === 'function') G.__DEGRADE__('wrk:hide_pipeline_surface_failed', e);
  }


}; // <-- закрыли WrkModule

// --- export WrkModule globally (stable regardless of load order) ---
Object.defineProperty(globalThis, 'WrkModule', {
  value: WrkModule,
  writable: true,
  configurable: false,
  enumerable: false,
});

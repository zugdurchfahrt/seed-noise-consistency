// === WRK MODULE ===
const WrkModule = function WrkModule(window) {
  'use strict';
  const G = (typeof globalThis !== 'undefined' && globalThis)
    || (typeof self       !== 'undefined' && self)
    || (typeof window     !== 'undefined' && window)
    || (typeof global     !== 'undefined' && global)
    || {};
  const __MODULE = 'wrk';
  const __SURFACE = 'wrk';
  const __D = G && G.__DEGRADE__;
  const __diag = (__D && typeof __D.diag === 'function') ? __D.diag.bind(__D) : null;

  function __wrkEmit(level, code, ctx, err) {
    try {
      if (__diag) return __diag(level, code, ctx, err);
      if (typeof __D === 'function') {
        const safeCtx = (ctx && typeof ctx === 'object') ? ctx : {};
        const safeErr = (err === undefined || err === null) ? null : err;
        return __D(code, safeErr, Object.assign({}, safeCtx, { level: level || 'info' }));
      }
    } catch (emitErr) {
      return undefined;
    }
    return undefined;
  }

  function __wrkDiag(level, code, extra, err) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    return __wrkEmit(level, code, {
      module: __MODULE,
      diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : __MODULE,
      surface: (typeof x.surface === 'string' && x.surface) ? x.surface : __SURFACE,
      key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
      stage: x.stage,
      message: x.message,
      data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
      type: x.type
    }, err || null);
  }

  function __wrkBestEffort(code, extra, fn) {
    try {
      return fn();
    } catch (e) {
      __wrkDiag('warn', code, extra, e);
      return undefined;
    }
  }

  function relayWorkerDiagEnvelope(G, scope, payload) {
    const d = G && G.__DEGRADE__;
    if (typeof d !== 'function' || !payload || typeof payload !== 'object') return false;
    const rawCtx = (payload.ctx && typeof payload.ctx === 'object') ? payload.ctx : {};
    const rawData = Object.prototype.hasOwnProperty.call(rawCtx, 'data') ? rawCtx.data : null;
    let nextData = rawData;
    if (rawData && typeof rawData === 'object') {
      nextData = Object.assign({}, rawData, { scope: scope || null });
    } else if (scope) {
      nextData = { scope: scope || null };
    }
    const ctx = {
      module: (typeof rawCtx.module === 'string' && rawCtx.module) ? rawCtx.module : 'wrk',
      diagTag: (typeof rawCtx.diagTag === 'string' && rawCtx.diagTag) ? rawCtx.diagTag : 'wrk',
      surface: (typeof rawCtx.surface === 'string' && rawCtx.surface) ? rawCtx.surface : 'worker',
      key: (typeof rawCtx.key === 'string' || rawCtx.key === null) ? rawCtx.key : null,
      stage: (typeof rawCtx.stage === 'string' && rawCtx.stage) ? rawCtx.stage : 'runtime',
      message: (typeof rawCtx.message === 'string' && rawCtx.message) ? rawCtx.message : String(payload.code || 'wrk:worker_diag'),
      data: nextData,
      type: (typeof rawCtx.type === 'string' && rawCtx.type) ? rawCtx.type : 'pipeline missing data'
    };
    const errObj = (payload.error && typeof payload.error === 'object') ? payload.error : null;
    let err = null;
    if (errObj) {
      err = new Error(String(errObj.message || payload.code || 'worker relay error'));
      if (typeof errObj.name === 'string' && errObj.name) err.name = errObj.name;
      if (typeof errObj.stack === 'string' && errObj.stack) err.stack = errObj.stack;
    }
    if (typeof d.diag === 'function') {
      d.diag((typeof payload.level === 'string' && payload.level) ? payload.level : 'info', String(payload.code || 'wrk:worker_diag'), ctx, err);
      return true;
    }
    d(String(payload.code || 'wrk:worker_diag'), err, Object.assign({}, ctx, {
      level: (typeof payload.level === 'string' && payload.level) ? payload.level : 'info'
    }));
    return true;
  }

  const __core = window && window.Core;
  let __guardToken = null;
  try {
    if (!__core || typeof __core.guardFlag !== 'function') {
      __wrkDiag('warn', __MODULE + ':guard_missing', {
        stage: 'guard',
        key: '__PATCH_WRK__',
        message: 'Core.guardFlag missing',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
      }, null);
      return;
    }
    __guardToken = __core.guardFlag('__PATCH_WRK__', __MODULE);
  } catch (e) {
    __wrkDiag('warn', __MODULE + ':guard_failed', {
      stage: 'guard',
      key: '__PATCH_WRK__',
      message: 'guardFlag threw',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'guard_failed' }
    }, e);
    return;
  }
  if (!__guardToken) return;

  try {
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

    // UAData (Window runtime) is the primary source for Worker snapshots.
    const UAD = nav && nav.userAgentData;
    if (!UAD) throw new Error('EnvBus: navigator.userAgentData missing');

    // Contract snapshot is used only for validation (not as a data source).
    const contract = G.__EXPECTED_CLIENT_HINTS;
    if (!contract || typeof contract !== 'object') {
      throw new Error('EnvBus: __EXPECTED_CLIENT_HINTS missing');
    }

    const uaData = (() => {
      const platform = (typeof UAD.platform === 'string' && UAD.platform) ? UAD.platform : null;
      if (!platform) throw new Error('EnvBus: uaData.platform missing');
      const brandsSrc = Array.isArray(UAD.brands) ? UAD.brands : null;
      if (!brandsSrc) throw new Error('EnvBus: uaData.brands missing');
      const brands = brandsSrc.map(x => {
        if (!x || typeof x !== 'object') throw new Error('EnvBus: uaData.brand entry');
        const brand = (typeof x.brand === 'string' && x.brand) ? x.brand
                    : (typeof x.name === 'string' && x.name) ? x.name
                    : null;
        if (!brand) throw new Error('EnvBus: uaData.brand missing');
        let versionRaw = null;
        if (typeof x.version === 'string') {
          if (!x.version) throw new Error('EnvBus: uaData.brand version missing');
          versionRaw = x.version;
        } else if (typeof x.version === 'number' && Number.isFinite(x.version)) {
          versionRaw = String(x.version);
        } else {
          throw new Error('EnvBus: uaData.brand version missing');
        }
        const major = String(versionRaw).split('.')[0];
        if (!major) throw new Error('EnvBus: uaData.brand version missing');
        return { brand: String(brand), version: String(major) };
      });
      return { platform, brands, mobile: !!UAD.mobile };
    })();

    // Validate UAData LE vs contract snapshot (fail-fast, no fallback).
    (function validateUaDataLE() {
      const expPlatform = contract.platform;
      if (typeof expPlatform !== 'string' || !expPlatform) throw new Error('EnvBus: contract.platform missing');
      const expMobile = !!contract.mobile;
      let expBrandsSrc = null;
      if (Array.isArray(contract.brands)) expBrandsSrc = contract.brands;
      else if (Array.isArray(contract.fullVersionList)) expBrandsSrc = contract.fullVersionList;
      else throw new Error('EnvBus: contract.brands missing');
      const expNorm = expBrandsSrc
        .filter(x => x && typeof x === 'object')
        .map(x => {
          const brand = (typeof x.brand === 'string' && x.brand) ? x.brand
                      : (typeof x.name === 'string' && x.name) ? x.name
                      : null;
          const versionRaw = (typeof x.version === 'string' && x.version) ? x.version
                           : (typeof x.version === 'number' && Number.isFinite(x.version)) ? String(x.version)
                           : null;
          if (!brand || !versionRaw) throw new Error('EnvBus: contract.brands entry');
          const major = String(versionRaw).split('.')[0];
          if (!major) throw new Error('EnvBus: contract.brands entry');
          return [String(brand), String(major)];
        })
        .sort((a, b) => (a[0] === b[0] ? (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0) : (a[0] < b[0] ? -1 : 1)));
      const curNorm = uaData.brands
        .map(b => [String(b.brand), String(b.version)])
        .sort((a, b) => (a[0] === b[0] ? (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0) : (a[0] < b[0] ? -1 : 1)));
      const sameBrands = (expNorm.length === curNorm.length) && expNorm.every((x, i) => x[0] === curNorm[i][0] && x[1] === curNorm[i][1]);
      if (uaData.platform !== expPlatform || !!uaData.mobile !== expMobile || !sameBrands) {
        const e = new Error('EnvBus: UAData LE mismatch vs contract');
        __wrkDiag('error', 'wrk:uadata_le_mismatch', {
          stage: 'contract',
          key: 'userAgentData',
          message: 'UAData low entropy mismatch vs contract',
          type: 'pipeline missing data',
          data: { outcome: 'throw', expPlatform, expMobile }
        }, e);
        throw e;
      }
    })();

    const HE_KEYS = ['architecture','bitness','model','platformVersion','fullVersionList','wow64','formFactors'];
    const heSource = (G.__UACH_HE_READY__ && G.__LAST_UACH_HE__ && typeof G.__LAST_UACH_HE__ === 'object')
      ? G.__LAST_UACH_HE__
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
    // Snapshot contract: uaData + highEntropy (no CH transport).
    return {
      ua, vendor, language: lang, languages: langs, dpr, cpu, mem, timeZone,
      uaData,
      highEntropy: he,
      hardwareConcurrency: cpu,
      deviceMemory: mem,
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

const SEED_NATIVIZATION_SRC = `
      // --- Seed nativization (Window → Worker). No runtime coupling after start. ---
      try {
        const nativeGetOwnProp = Object.getOwnPropertyDescriptor;
        const fpToStringDesc = nativeGetOwnProp(Function.prototype, 'toString');
        const currentToString = fpToStringDesc && fpToStringDesc.value;

        const existingState = self.__CORE_TOSTRING_STATE__;
        const existingStateOk = !!(existingState
          && existingState.__CORE_TOSTRING_STATE__ === true
          && typeof existingState.nativeToString === 'function'
          && (existingState.overrideMap instanceof WeakMap)
          && (existingState.proxyTargetMap instanceof WeakMap));

        const nativeToString = existingStateOk
          ? existingState.nativeToString
          : (currentToString || Function.prototype.toString);
        if (typeof nativeToString !== 'function') {
          throw new Error('UACHPatch: Function.prototype.toString missing');
        }

        const toStringOverrideMap = existingStateOk
          ? existingState.overrideMap
          : new WeakMap();
        const toStringProxyTargetMap = existingStateOk
          ? existingState.proxyTargetMap
          : new WeakMap();

        function baseMarkAsNative(func, name = "") {
          if (typeof func !== 'function') return func;
          const t = toStringProxyTargetMap.get(func);
          if (t) func = t;
          const n = name || func.name || "";
          const label = n
            ? ('function ' + n + '() { [native code] }')
            : 'function () { [native code] }';
          toStringOverrideMap.set(func, label);
          return func;
        }

        let memoMarkAsNative = null;
        function ensureMarkAsNative() {
          if (memoMarkAsNative) return memoMarkAsNative;
          memoMarkAsNative = baseMarkAsNative;
          return memoMarkAsNative;
        }

        if (typeof self.__ensureMarkAsNative !== 'function') {
          Object.defineProperty(self, '__ensureMarkAsNative', {
            value: ensureMarkAsNative,
            writable: true,
            configurable: true,
            enumerable: false
          });
        }

        const ensure = (typeof self.__ensureMarkAsNative === 'function')
          ? self.__ensureMarkAsNative
          : ensureMarkAsNative;
        const markAsNative = ensure();
        if (typeof markAsNative !== 'function') {
          throw new Error('UACHPatch: markAsNative seed missing');
        }
        markAsNative(ensure, '__ensureMarkAsNative');

        const seedProbe = function seedProbe(){};
        markAsNative(seedProbe);
        const seedExpected = toStringOverrideMap.get(seedProbe);
        if (seedExpected === undefined) {
          throw new Error('UACHPatch: toString probe missing label');
        }

        if (existingStateOk) {
          if (typeof currentToString !== 'function') {
            throw new Error('UACHPatch: Function.prototype.toString missing');
          }
          const actual = Reflect.apply(currentToString, seedProbe, []);
          if (actual !== seedExpected) {
            throw new Error('UACHPatch: toString bridge mismatch');
          }
        }

        const toString = new Proxy(nativeToString, {
          apply(target, thisArg, argList) {
            if (typeof thisArg !== 'function') {
              return Reflect.apply(target, thisArg, argList);
            }
            const v = toStringOverrideMap.get(thisArg);
            if (v !== undefined) return v;
            const t = toStringProxyTargetMap.get(thisArg);
            if (t) {
              const tv = toStringOverrideMap.get(t);
              if (tv !== undefined) return tv;
            }
            return Reflect.apply(target, thisArg, argList);
          }
        });

        const installDesc = {
          value: toString,
          writable: fpToStringDesc ? !!fpToStringDesc.writable : true,
          configurable: fpToStringDesc ? !!fpToStringDesc.configurable : true,
          enumerable: fpToStringDesc ? !!fpToStringDesc.enumerable : false
        };
        const prevCoreStateDesc = nativeGetOwnProp(self, '__CORE_TOSTRING_STATE__');
        try {
          toStringProxyTargetMap.set(toString, nativeToString);
          markAsNative(toString, 'toString');

          Object.defineProperty(Function.prototype, 'toString', installDesc);

          const installedDesc = nativeGetOwnProp(Function.prototype, 'toString');
          if (!installedDesc || installedDesc.value !== toString) {
            throw new Error('UACHPatch: toString install descriptor mismatch');
          }
          if (!!installedDesc.writable !== !!installDesc.writable
            || !!installedDesc.configurable !== !!installDesc.configurable
            || !!installedDesc.enumerable !== !!installDesc.enumerable) {
            throw new Error('UACHPatch: toString install flags mismatch');
          }

          let nonFnErr = null;
          try {
            Reflect.apply(toString, {}, []);
          } catch (e) {
            nonFnErr = e;
          }
          if (!nonFnErr) {
            throw new Error('UACHPatch: toString brand-check lost');
          }

          const directProbe = function directProbe(){};
          const expectedNative = Reflect.apply(nativeToString, directProbe, []);
          const actualNative = Reflect.apply(toString, directProbe, []);
          if (actualNative !== expectedNative) {
            throw new Error('UACHPatch: toString native forwarding mismatch');
          }

          Object.defineProperty(self, '__CORE_TOSTRING_STATE__', {
            value: {
              __CORE_TOSTRING_STATE__: true,
              nativeToString: nativeToString,
              overrideMap: toStringOverrideMap,
              proxyTargetMap: toStringProxyTargetMap
            },
            writable: false,
            configurable: true,
            enumerable: false
          });
        } catch (e) {
          toStringProxyTargetMap.delete(toString);
          toStringOverrideMap.delete(toString);

          if (typeof currentToString === 'function') {
            Object.defineProperty(Function.prototype, 'toString', {
              value: currentToString,
              writable: fpToStringDesc ? !!fpToStringDesc.writable : true,
              configurable: fpToStringDesc ? !!fpToStringDesc.configurable : true,
              enumerable: fpToStringDesc ? !!fpToStringDesc.enumerable : false
            });
          }

          if (prevCoreStateDesc) {
            Object.defineProperty(self, '__CORE_TOSTRING_STATE__', prevCoreStateDesc);
          } else {
            delete self.__CORE_TOSTRING_STATE__;
          }
          throw e;
        }
      } catch (e) {
        self.__ENV_SEED_ERROR__ = String((e && (e.stack || e.message)) || e);
        throw e;
      }
`;



function mkModuleWorkerSource(snapshot, absUrl){
  if (!snapshot || typeof snapshot !== 'object') throw new Error('wrk: mkModuleWorkerSource bad snapshot');
  if (typeof absUrl !== 'string' || !absUrl) throw new Error('wrk: mkModuleWorkerSource bad absUrl');
  const patchUrl = global.__ENV_BRIDGE__ && global.__ENV_BRIDGE__.urls && global.__ENV_BRIDGE__.urls.workerPatchModule;
  if (typeof patchUrl !== 'string' || !patchUrl) throw new Error('wrk: mkModuleWorkerSource bad workerPatchModule url');
  const SNAP = JSON.stringify(snapshot);
  const USER = JSON.stringify(absUrl);
  const PATCH_URL = JSON.stringify(patchUrl);
  return `
    (async function(){
      'use strict';
      self.__GW_BOOTSTRAP__ = true;
      var __ENV_EMIT_Q__ = [];
      var __ENV_DIAG_RELAY_ACTIVE__ = false;
      var __serializeDiagErr = function(err){
        if (!err) return null;
        var out = {};
        try { if (typeof err.name === 'string' && err.name) out.name = err.name; } catch(_e) {}
        try { if (typeof err.message === 'string' && err.message) out.message = err.message; } catch(_e) {}
        try { if (typeof err.stack === 'string' && err.stack) out.stack = err.stack; } catch(_e) {}
        if (!Object.keys(out).length) {
          try { out.message = String(err); } catch(_e) { out.message = 'worker bootstrap relay error'; }
        }
        return out;
      };
      var __sendRelayMsg = function(msg){
        var sent = false;
        try { if (typeof self.postMessage === 'function') { self.postMessage(msg); sent = true; } } catch(_e) {}
        try {
          if (self.__ENV_SHARED_PORTS__ && self.__ENV_SHARED_PORTS__.length) {
            for (var i = 0; i < self.__ENV_SHARED_PORTS__.length; i++) {
              try { self.__ENV_SHARED_PORTS__[i].postMessage(msg); sent = true; } catch(_e) {}
            }
          }
        } catch(_e) {}
        if (!sent) {
          try { __ENV_EMIT_Q__.push(msg); } catch(_e) {}
        }
      };
      var __relayDiag = function(level, code, ctx, err){
        if (__ENV_DIAG_RELAY_ACTIVE__) return;
        __ENV_DIAG_RELAY_ACTIVE__ = true;
        try {
          var x = (ctx && typeof ctx === 'object') ? ctx : {};
          __sendRelayMsg({
            __ENV_DIAG__: {
              level: (typeof level === 'string' && level) ? level : 'info',
              code: String(code || 'worker_bootstrap:diag'),
              ctx: {
                module: (typeof x.module === 'string' && x.module) ? x.module : 'wrk',
                diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : 'wrk',
                surface: (typeof x.surface === 'string' && x.surface) ? x.surface : 'worker_bootstrap',
                key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
                stage: (typeof x.stage === 'string' && x.stage) ? x.stage : 'runtime',
                message: (typeof x.message === 'string' && x.message) ? x.message : String(code || 'worker bootstrap diag'),
                data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
                type: (typeof x.type === 'string' && x.type) ? x.type : 'pipeline missing data'
              },
              error: __serializeDiagErr(err)
            }
          });
        } finally {
          __ENV_DIAG_RELAY_ACTIVE__ = false;
        }
      };
      var __emitDiag = function(code, err, extra){
        var e = (err && typeof err === 'object') ? err : new Error(String(err || code));
        var ctx = {
          type: 'pipeline missing data',
          stage: 'apply',
          module: 'wrk',
          diagTag: 'wrk',
          surface: 'worker_bootstrap',
          key: '__ENV_BOOTSTRAP_ERROR__',
          message: 'worker bootstrap emit failed',
          data: { outcome: 'throw', reason: 'worker_bootstrap_emit_failed' },
          policy: 'throw',
          action: 'throw'
        };
        try {
          var d = self && self.__DEGRADE__;
          if (extra && typeof extra === 'object') {
            for (var k in extra) {
              if (Object.prototype.hasOwnProperty.call(extra, k)) ctx[k] = extra[k];
            }
          }
          if (typeof d === 'function') {
            if (typeof d.diag === 'function') d.diag('error', code, ctx, e);
            else d(code, e, ctx);
          }
        } catch(__diagErr) {
          try { self.__ENV_DIAG_ERROR__ = String((__diagErr && (__diagErr.stack || __diagErr.message)) || __diagErr); } catch(__diagStoreErr) { self.__ENV_DIAG_STORE_ERROR__ = String((__diagStoreErr && (__diagStoreErr.stack || __diagStoreErr.message)) || __diagStoreErr); }
        }
        __relayDiag('error', code, ctx, e);
      };
      var __emit = function(msg){
        var sent = false;
        try { if (typeof self.postMessage === 'function') self.postMessage(msg); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'worker_postMessage' }); }
        try { sent = sent || (typeof self.postMessage === 'function'); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'worker_postMessage_probe' }); }
        try {
          if (self.__ENV_SHARED_PORTS__ && self.__ENV_SHARED_PORTS__.length) {
            for (var i = 0; i < self.__ENV_SHARED_PORTS__.length; i++) {
              try { self.__ENV_SHARED_PORTS__[i].postMessage(msg); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'shared_port' }); }
            }
            sent = true;
          }
        } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'shared_ports_enumeration' }); }
        if (!sent) {
          try { __ENV_EMIT_Q__.push(msg); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'emit_queue' }); }
        }
      };
      try {
        Object.defineProperty(self, '__ENV_RELAY_DIAG__', {
          value: function(level, code, ctx, err){ __relayDiag(level, code, ctx, err); },
          writable: false,
          configurable: true,
          enumerable: false
        });
      } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'relay_diag_define' }); }
      try {
        if (!self.__ENV_SHARED_PORTS__) self.__ENV_SHARED_PORTS__ = [];
        // SharedWorker needs port-based signalling; do not rely on onconnect (user code can overwrite it).
        self.addEventListener('connect', function(ev){
          try {
            var ports = ev && ev.ports;
            if (ports && ports.length) {
              for (var j = 0; j < ports.length; j++) {
                try { if (typeof ports[j].start === 'function') ports[j].start(); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'shared_port_start' }); }
                self.__ENV_SHARED_PORTS__.push(ports[j]);
              }
            }
          } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'shared_connect_event' }); }
          try {
            if (__ENV_EMIT_Q__ && __ENV_EMIT_Q__.length) {
              var q = __ENV_EMIT_Q__.slice(0);
              __ENV_EMIT_Q__.length = 0;
              for (var k = 0; k < q.length; k++) {
                __emit(q[k]);
              }
            }
          } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'emit_queue_flush' }); }
        });
      } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'connect_listener_install' }); }
      // Buffer early messages sent before user code installs its handler(s).
      // Without this, callers that postMessage immediately after Worker() may time out.
      const __MSG_Q__ = [];
      let __MSG_BUF__ = true;
      const __onEarlyMsg__ = ev => { if (__MSG_BUF__) __MSG_Q__.push(ev && ev.data); };
      try { self.addEventListener('message', __onEarlyMsg__); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'early_message_listener_install' }); }
      const __requireSnap = s => {
        if (!s || typeof s !== 'object') throw new Error('UACHPatch: no snapshot');
        if (typeof s.language !== 'string' || !s.language) throw new Error('UACHPatch: bad language');
        if (!Array.isArray(s.languages)) throw new Error('UACHPatch: bad languages');
        if (!Number.isFinite(Number(s.deviceMemory))) throw new Error('UACHPatch: bad deviceMemory');
        if (!Number.isFinite(Number(s.hardwareConcurrency))) throw new Error('UACHPatch: bad hardwareConcurrency');
        if (!s.uaData) throw new Error('UACHPatch: missing userAgentData');
        const he = (s.uaData && s.uaData.he) || s.highEntropy;
        if (!he || typeof he !== 'object') throw new Error('UACHPatch: missing highEntropy');
        const KEYS = ['architecture','bitness','model','platformVersion','fullVersionList','wow64','formFactors'];
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
        __emit({ __ENV_BOOTSTRAP_ERROR__: self.__ENV_SNAP_ERROR__ });
        throw e;
      }
      if (!self.__ENV_SYNC_BC_INSTALLED__) {
        try {
          if (typeof BroadcastChannel !== 'function') throw new Error('UACHPatch: BroadcastChannel missing');
          self.__ENV_SYNC_BC_INSTALLED__ = true;
          const bc = new BroadcastChannel('__ENV_SYNC__');
          bc.onmessage = ev => { const s = ev?.data?.__ENV_SYNC__?.envSnapshot; if (s) self.__applyEnvSnapshot__(s); };
        } catch (e) {
          self.__ENV_BC_ERROR__ = String((e && (e.stack || e.message)) || e);
          __emit({ __ENV_BOOTSTRAP_ERROR__: self.__ENV_BC_ERROR__ });
          throw e;
        }
      }
      // --- Seed nativization (Window → Worker). No runtime coupling after start. ---
      ${SEED_NATIVIZATION_SRC}
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
        __emit({ __ENV_BOOTSTRAP_ERROR__: String((e && (e.stack || e.message)) || e) });
        self.__ENV_PATCH_ERROR__ = String((e && (e.stack || e.message)) || e);
        throw e;
      }
      if (__patchOK) {
        try {
          // Применяем снимок СЕЙЧАС, уже через реализацию патча:
          if (!self.__applyEnvSnapshot__ || !self.__lastSnap__) throw new Error('UACHPatch: snapshot not applied');
          self.__applyEnvSnapshot__(self.__lastSnap__);
        } catch (e) {
          __emit({ __ENV_BOOTSTRAP_ERROR__: String((e && (e.stack || e.message)) || e) });
          self.__ENV_PATCH_APPLY_ERROR__ = String((e && (e.stack || e.message)) || e);
          throw e;
        }
      }
      // Только ПОСЛЕ зеркала грузим пользовательский код:
      const USER = ${USER};
      if (!USER || typeof USER !== 'string') throw new Error('UACHPatch: missing user module URL');
      await import(USER);
      // Replay any early messages after user code is loaded.
      __MSG_BUF__ = false;
      try { self.removeEventListener('message', __onEarlyMsg__); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'early_message_listener_remove' }); }
      try {
        if (typeof MessageEvent === 'function' && typeof self.dispatchEvent === 'function') {
          for (const d of __MSG_Q__) self.dispatchEvent(new MessageEvent('message', { data: d }));
        }
      } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'early_message_replay_dispatch' }); }
      __emit({ __ENV_PATCH_OK__: __patchOK === true, __ENV_USER_URL_LOADED__: USER });
    })();
    export {};
    //# sourceURL=worker_module_bootstrap.js
  `;
}

function mkClassicWorkerSource(snapshot, absUrl){
  if (!snapshot || typeof snapshot !== 'object') throw new Error('wrk: mkClassicWorkerSource bad snapshot');
  if (typeof absUrl !== 'string' || !absUrl) throw new Error('wrk: mkClassicWorkerSource bad absUrl');
  const patchUrl = global.__ENV_BRIDGE__ && global.__ENV_BRIDGE__.urls && global.__ENV_BRIDGE__.urls.workerPatchClassic;
  if (typeof patchUrl !== 'string' || !patchUrl) throw new Error('wrk: mkClassicWorkerSource bad workerPatchClassic url');
  const SNAP = JSON.stringify(snapshot);
  const USER = JSON.stringify(absUrl);
  const PATCH_URL = JSON.stringify(patchUrl);
  return `
    (function(){
      'use strict';
      self.__GW_BOOTSTRAP__ = true;
      var __ENV_EMIT_Q__ = [];
      var __ENV_DIAG_RELAY_ACTIVE__ = false;
      var __serializeDiagErr = function(err){
        if (!err) return null;
        var out = {};
        try { if (typeof err.name === 'string' && err.name) out.name = err.name; } catch(_e) {}
        try { if (typeof err.message === 'string' && err.message) out.message = err.message; } catch(_e) {}
        try { if (typeof err.stack === 'string' && err.stack) out.stack = err.stack; } catch(_e) {}
        if (!Object.keys(out).length) {
          try { out.message = String(err); } catch(_e) { out.message = 'worker bootstrap relay error'; }
        }
        return out;
      };
      var __sendRelayMsg = function(msg){
        var sent = false;
        try { if (typeof self.postMessage === 'function') { self.postMessage(msg); sent = true; } } catch(_e) {}
        try {
          if (self.__ENV_SHARED_PORTS__ && self.__ENV_SHARED_PORTS__.length) {
            for (var i = 0; i < self.__ENV_SHARED_PORTS__.length; i++) {
              try { self.__ENV_SHARED_PORTS__[i].postMessage(msg); sent = true; } catch(_e) {}
            }
          }
        } catch(_e) {}
        if (!sent) {
          try { __ENV_EMIT_Q__.push(msg); } catch(_e) {}
        }
      };
      var __relayDiag = function(level, code, ctx, err){
        if (__ENV_DIAG_RELAY_ACTIVE__) return;
        __ENV_DIAG_RELAY_ACTIVE__ = true;
        try {
          var x = (ctx && typeof ctx === 'object') ? ctx : {};
          __sendRelayMsg({
            __ENV_DIAG__: {
              level: (typeof level === 'string' && level) ? level : 'info',
              code: String(code || 'worker_bootstrap:diag'),
              ctx: {
                module: (typeof x.module === 'string' && x.module) ? x.module : 'wrk',
                diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : 'wrk',
                surface: (typeof x.surface === 'string' && x.surface) ? x.surface : 'worker_bootstrap',
                key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
                stage: (typeof x.stage === 'string' && x.stage) ? x.stage : 'runtime',
                message: (typeof x.message === 'string' && x.message) ? x.message : String(code || 'worker bootstrap diag'),
                data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
                type: (typeof x.type === 'string' && x.type) ? x.type : 'pipeline missing data'
              },
              error: __serializeDiagErr(err)
            }
          });
        } finally {
          __ENV_DIAG_RELAY_ACTIVE__ = false;
        }
      };
      var __emitDiag = function(code, err, extra){
        var e = (err && typeof err === 'object') ? err : new Error(String(err || code));
        var ctx = {
          type: 'pipeline missing data',
          stage: 'apply',
          module: 'wrk',
          diagTag: 'wrk',
          surface: 'worker_bootstrap',
          key: '__ENV_BOOTSTRAP_ERROR__',
          message: 'worker bootstrap emit failed',
          data: { outcome: 'throw', reason: 'worker_bootstrap_emit_failed' },
          policy: 'throw',
          action: 'throw'
        };
        try {
          var d = self && self.__DEGRADE__;
          if (extra && typeof extra === 'object') {
            for (var k in extra) {
              if (Object.prototype.hasOwnProperty.call(extra, k)) ctx[k] = extra[k];
            }
          }
          if (typeof d === 'function') {
            if (typeof d.diag === 'function') d.diag('error', code, ctx, e);
            else d(code, e, ctx);
          }
        } catch(__diagErr) {
          try { self.__ENV_DIAG_ERROR__ = String((__diagErr && (__diagErr.stack || __diagErr.message)) || __diagErr); } catch(__diagStoreErr) { self.__ENV_DIAG_STORE_ERROR__ = String((__diagStoreErr && (__diagStoreErr.stack || __diagStoreErr.message)) || __diagStoreErr); }
        }
        __relayDiag('error', code, ctx, e);
      };
      var __emit = function(msg){
        var sent = false;
        try { if (typeof self.postMessage === 'function') self.postMessage(msg); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'worker_postMessage' }); }
        try { sent = sent || (typeof self.postMessage === 'function'); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'worker_postMessage_probe' }); }
        try {
          if (self.__ENV_SHARED_PORTS__ && self.__ENV_SHARED_PORTS__.length) {
            for (var i = 0; i < self.__ENV_SHARED_PORTS__.length; i++) {
              try { self.__ENV_SHARED_PORTS__[i].postMessage(msg); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'shared_port' }); }
            }
            sent = true;
          }
        } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'shared_ports_enumeration' }); }
        if (!sent) {
          try { __ENV_EMIT_Q__.push(msg); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'emit_queue' }); }
        }
      };
      try {
        Object.defineProperty(self, '__ENV_RELAY_DIAG__', {
          value: function(level, code, ctx, err){ __relayDiag(level, code, ctx, err); },
          writable: false,
          configurable: true,
          enumerable: false
        });
      } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'relay_diag_define' }); }
      try {
        if (!self.__ENV_SHARED_PORTS__) self.__ENV_SHARED_PORTS__ = [];
        // SharedWorker needs port-based signalling; do not rely on onconnect (user code can overwrite it).
        self.addEventListener('connect', function(ev){
          try {
            var ports = ev && ev.ports;
            if (ports && ports.length) {
              for (var j = 0; j < ports.length; j++) {
                try { if (typeof ports[j].start === 'function') ports[j].start(); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'shared_port_start' }); }
                self.__ENV_SHARED_PORTS__.push(ports[j]);
              }
            }
          } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'shared_connect_event' }); }
          try {
            if (__ENV_EMIT_Q__ && __ENV_EMIT_Q__.length) {
              var q = __ENV_EMIT_Q__.slice(0);
              __ENV_EMIT_Q__.length = 0;
              for (var k = 0; k < q.length; k++) {
                __emit(q[k]);
              }
            }
          } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'emit_queue_flush' }); }
        });
      } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'connect_listener_install' }); }
      // Buffer early messages sent before user code installs its handler(s).
      var __MSG_Q__ = [];
      var __MSG_BUF__ = true;
      var __onEarlyMsg__ = function(ev){ if (__MSG_BUF__) __MSG_Q__.push(ev && ev.data); };
      try { self.addEventListener('message', __onEarlyMsg__); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'early_message_listener_install' }); }
      var __requireSnap = function(s){
        if (!s || typeof s !== 'object') throw new Error('UACHPatch: no snapshot');
        if (typeof s.language !== 'string' || !s.language) throw new Error('UACHPatch: bad language');
        if (!Array.isArray(s.languages)) throw new Error('UACHPatch: bad languages');
        if (!Number.isFinite(Number(s.deviceMemory))) throw new Error('UACHPatch: bad deviceMemory');
        if (!Number.isFinite(Number(s.hardwareConcurrency))) throw new Error('UACHPatch: bad hardwareConcurrency');
        if (!s.uaData) throw new Error('UACHPatch: missing userAgentData');
        const he = (s.uaData && s.uaData.he) || s.highEntropy;
        if (!he || typeof he !== 'object') throw new Error('UACHPatch: missing highEntropy');
        const KEYS = ['architecture','bitness','model','platformVersion','fullVersionList','wow64','formFactors'];
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
        __emit({ __ENV_BOOTSTRAP_ERROR__: self.__ENV_SNAP_ERROR__ });
        throw e;
      }
      if (!self.__ENV_SYNC_BC_INSTALLED__) {
        try {
          if (typeof BroadcastChannel !== 'function') throw new Error('UACHPatch: BroadcastChannel missing');
          self.__ENV_SYNC_BC_INSTALLED__ = true;
          const bc = new BroadcastChannel('__ENV_SYNC__');
          bc.onmessage = function(ev){ var s = ev && ev.data && ev.data.__ENV_SYNC__ && ev.data.__ENV_SYNC__.envSnapshot; if (s) self.__applyEnvSnapshot__(s); };
        } catch (e) {
          self.__ENV_BC_ERROR__ = String((e && (e.stack || e.message)) || e);
          __emit({ __ENV_BOOTSTRAP_ERROR__: self.__ENV_BC_ERROR__ });
          throw e;
        }
      }

      // --- Seed nativization (Window → Worker). No runtime coupling after start. ---
      ${SEED_NATIVIZATION_SRC}
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
        __emit({ __ENV_BOOTSTRAP_ERROR__: String((e && (e.stack || e.message)) || e) });
        self.__ENV_PATCH_ERROR__ = String((e && (e.stack || e.message)) || e);
        throw e;
      }
      if (__patchOK) {
        try {
          // Применяем снимок СЕЙЧАС, уже через реализацию патча:
          if (!self.__applyEnvSnapshot__ || !self.__lastSnap__) throw new Error('UACHPatch: snapshot not applied');
          self.__applyEnvSnapshot__(self.__lastSnap__);
        } catch (e) {
          __emit({ __ENV_BOOTSTRAP_ERROR__: String((e && (e.stack || e.message)) || e) });
          self.__ENV_PATCH_APPLY_ERROR__ = String((e && (e.stack || e.message)) || e);
          throw e;
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
          try { self.removeEventListener('message', __onEarlyMsg__); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'early_message_listener_remove' }); }
          try {
            if (typeof MessageEvent === 'function' && typeof self.dispatchEvent === 'function') {
              for (var i = 0; i < __MSG_Q__.length; i++) self.dispatchEvent(new MessageEvent('message', { data: __MSG_Q__[i] }));
            }
          } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'early_message_replay_dispatch' }); }
          __emit({ __ENV_PATCH_OK__: __patchOK === true, __ENV_USER_URL_LOADED__: USER });
        });
      }
      // Replay any early messages after user code is loaded.
      __MSG_BUF__ = false;
      try { self.removeEventListener('message', __onEarlyMsg__); } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'early_message_listener_remove' }); }
      try {
        if (typeof MessageEvent === 'function' && typeof self.dispatchEvent === 'function') {
          for (var i = 0; i < __MSG_Q__.length; i++) self.dispatchEvent(new MessageEvent('message', { data: __MSG_Q__[i] }));
        }
      } catch(_e) { __emitDiag('wrk:worker_bootstrap:apply:emit_failed', _e, { transport: 'early_message_replay_dispatch' }); }
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
  if (!snap.uaData) throw new Error('[WorkerOverride] snapshot.uaData missing');
  const he = (snap.uaData && snap.uaData.he) || snap.highEntropy;
  if (!he || typeof he !== 'object') throw new Error('[WorkerOverride] snapshot.highEntropy missing');
  const KEYS = ['architecture','bitness','model','platformVersion','fullVersionList','wow64','formFactors'];
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

function emitWorkerBootstrapDegrade(G, scope, bootErr) {
  const d = G && G.__DEGRADE__;
  if (typeof d !== 'function') return;
  const err = bootErr instanceof Error ? bootErr : new Error(String(bootErr || 'Worker bootstrap error'));
  const ctx = {
    type: 'pipeline missing data',
    stage: 'apply',
    module: 'wrk',
    surface: 'worker_bootstrap',
    key: '__ENV_BOOTSTRAP_ERROR__',
    policy: 'throw',
    action: 'throw',
    scope: scope || null
  };
  if (typeof d.diag === 'function') {
    d.diag('error', 'wrk:worker_bootstrap:apply:error', ctx, err);
    return;
  }
  d('wrk:worker_bootstrap:apply:error', err, ctx);
}

function relayWorkerScopeDiag(G, scope, payload) {
  try {
    return relayWorkerDiagEnvelope(G, scope, payload);
  } catch (e) {
    __wrkDiag('warn', 'wrk:worker_diag_relay_failed', {
      stage: 'runtime',
      key: '__ENV_DIAG__',
      message: 'worker diag relay failed',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'worker_diag_relay_failed', scope: scope || null }
    }, e);
    return false;
  }
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
    __wrkDiag('error', 'wrk:worker_override_bridge_not_ready', {
      stage: 'preflight',
      key: '__ENV_BRIDGE__',
      message: 'worker override bridge not ready',
      type: 'pipeline missing data',
      data: { outcome: 'throw', reason: 'bridge_not_ready' }
    }, e);
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
        __wrkBestEffort('wrk:worker_cleanup_revoke_failed', {
          stage: 'runtime',
          key: 'blobURL',
          message: 'worker cleanup revoke failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'worker_cleanup_revoke_failed' }
        }, () => URL.revokeObjectURL(blobURL));
        __wrkBestEffort('wrk:worker_cleanup_remove_message_failed', {
          stage: 'runtime',
          key: 'message',
          message: 'worker cleanup remove message listener failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'worker_cleanup_remove_message_failed' }
        }, () => w.removeEventListener('message', onMsg));
        __wrkBestEffort('wrk:worker_cleanup_remove_error_failed', {
          stage: 'runtime',
          key: 'error',
          message: 'worker cleanup remove error listener failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'worker_cleanup_remove_error_failed' }
        }, () => w.removeEventListener('error', onErr));
      };

    const onErr = () => {
      cleanup();
    };

    const onMsg = (ev) => {
      const data = ev && ev.data;
      const relayDiag = data && typeof data === 'object' ? data.__ENV_DIAG__ : null;
      if (relayDiag && typeof relayDiag === 'object') {
        relayWorkerScopeDiag(G, 'Worker', relayDiag);
        __wrkBestEffort('wrk:worker_diag_stop_propagation_failed', {
          stage: 'runtime',
          key: 'message',
          message: 'worker diag stop propagation failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'worker_diag_stop_propagation_failed' }
        }, () => { ev.stopImmediatePropagation(); ev.stopPropagation(); });
        return;
      }

      const bootErr = data && typeof data === 'object' && data.__ENV_BOOTSTRAP_ERROR__;
      if (bootErr) {
        __wrkBestEffort('wrk:worker_bootstrap_error_store_failed', {
          stage: 'runtime',
          key: '__LAST_WORKER_BOOTSTRAP_ERROR__',
          message: 'worker bootstrap error store failed',
          type: 'pipeline missing data',
          data: { outcome: 'skip', reason: 'worker_bootstrap_error_store_failed' }
        }, () => { G.__LAST_WORKER_BOOTSTRAP_ERROR__ = bootErr; });
        emitWorkerBootstrapDegrade(G, 'Worker', bootErr);
        __wrkBestEffort('wrk:worker_bootstrap_stop_propagation_failed', {
          stage: 'runtime',
          key: 'message',
          message: 'worker bootstrap stop propagation failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'worker_bootstrap_stop_propagation_failed' }
        }, () => { ev.stopImmediatePropagation(); ev.stopPropagation(); });
        __wrkBestEffort('wrk:worker_terminate_failed', {
          stage: 'runtime',
          key: 'terminate',
          message: 'worker terminate failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'worker_terminate_failed' }
        }, () => { if (w && typeof w.terminate === 'function') w.terminate(); });
        cleanup();
        return;
      }

      const loaded =
        data && typeof data === 'object' && typeof data.__ENV_USER_URL_LOADED__ === 'string'
          ? data.__ENV_USER_URL_LOADED__
          : null;

      if (loaded) {
        __wrkBestEffort('wrk:worker_loaded_store_failed', {
          stage: 'runtime',
          key: '__LAST_WORKER_USER_URL_LOADED__',
          message: 'worker loaded url store failed',
          type: 'pipeline missing data',
          data: { outcome: 'skip', reason: 'worker_loaded_store_failed' }
        }, () => { G.__LAST_WORKER_USER_URL_LOADED__ = loaded; });
        // скрываем внутренний сигнал от внешних слушателей
        __wrkBestEffort('wrk:worker_loaded_stop_propagation_failed', {
          stage: 'runtime',
          key: 'message',
          message: 'worker loaded stop propagation failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'worker_loaded_stop_propagation_failed' }
        }, () => { ev.stopImmediatePropagation(); ev.stopPropagation(); });

        if (loaded === userURL && userURL !== abs) {
          __wrkBestEffort('wrk:worker_user_url_revoke_failed', {
            stage: 'runtime',
            key: 'userURL',
            message: 'worker user url revoke failed',
            type: 'browser structure missing data',
            data: { outcome: 'skip', reason: 'worker_user_url_revoke_failed' }
          }, () => URL.revokeObjectURL(userURL));
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
  if (G.__DEBUG__) {
    __wrkBestEffort('wrk:worker_debug_mark_failed', {
      stage: 'apply',
      key: 'Worker',
      message: 'worker debug mark failed',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'worker_debug_mark_failed' }
    }, () => { G.__PATCHED_SAFE_WORKER__ = true; });
    __wrkDiag('info', 'wrk:worker_installed', {
      stage: 'apply',
      key: 'Worker',
      message: 'SafeWorker installed',
      type: 'pipeline missing data',
      data: { outcome: 'return' }
    }, null);
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
   // Normalize 2nd arg to an options object (always), so `type` is never lost
  const WrappedSharedWorker = mark(function SharedWorker(url, nameOrOpts) {
    const abs = new URL(url, location.href).href;
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
          const relayDiag = data.__ENV_DIAG__;
          if (relayDiag && typeof relayDiag === 'object') {
            internal = true;
            relayWorkerScopeDiag(G, 'SharedWorker', relayDiag);
          }
          const bootErr = data.__ENV_BOOTSTRAP_ERROR__;
          if (bootErr) {
            internal = true;
            __wrkBestEffort('wrk:shared_worker_bootstrap_error_store_failed', {
              stage: 'runtime',
              key: '__LAST_SHARED_WORKER_BOOTSTRAP_ERROR__',
              message: 'shared worker bootstrap error store failed',
              type: 'pipeline missing data',
              data: { outcome: 'skip', reason: 'shared_worker_bootstrap_error_store_failed' }
            }, () => { G.__LAST_SHARED_WORKER_BOOTSTRAP_ERROR__ = bootErr; });
            emitWorkerBootstrapDegrade(G, 'SharedWorker', bootErr);
          }
          const loaded = data.__ENV_USER_URL_LOADED__;
          if (typeof loaded === 'string') {
            internal = true;
            __wrkBestEffort('wrk:shared_worker_loaded_store_failed', {
              stage: 'runtime',
              key: '__LAST_SHARED_WORKER_USER_URL_LOADED__',
              message: 'shared worker loaded url store failed',
              type: 'pipeline missing data',
              data: { outcome: 'skip', reason: 'shared_worker_loaded_store_failed' }
            }, () => { G.__LAST_SHARED_WORKER_USER_URL_LOADED__ = loaded; });
          }
          const ok = data.__ENV_PATCH_OK__;
          if (ok === true) {
            internal = true;
            __wrkBestEffort('wrk:shared_worker_patch_ok_store_failed', {
              stage: 'runtime',
              key: '__LAST_SHARED_WORKER_PATCH_OK__',
              message: 'shared worker patch-ok store failed',
              type: 'pipeline missing data',
              data: { outcome: 'skip', reason: 'shared_worker_patch_ok_store_failed' }
            }, () => { G.__LAST_SHARED_WORKER_PATCH_OK__ = true; });
          }
          if (internal) {
            __wrkBestEffort('wrk:shared_worker_stop_propagation_failed', {
              stage: 'runtime',
              key: 'message',
              message: 'shared worker stop propagation failed',
              type: 'browser structure missing data',
              data: { outcome: 'skip', reason: 'shared_worker_stop_propagation_failed' }
            }, () => { ev.stopImmediatePropagation(); ev.stopPropagation(); });
          }
        };
        port.addEventListener('message', onMsg);
        __wrkBestEffort('wrk:shared_worker_port_start_failed', {
          stage: 'runtime',
          key: 'port.start',
          message: 'shared worker port start failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'shared_worker_port_start_failed' }
        }, () => { if (typeof port.start === 'function') port.start(); });
      }
    } catch(e) {
      __wrkDiag('warn', 'wrk:shared_worker_handshake_failed', {
        stage: 'runtime',
        key: 'SharedWorker.port',
        message: 'shared worker handshake failed',
        type: 'browser structure missing data',
        data: { outcome: 'skip', reason: 'shared_worker_handshake_failed' }
      }, e);
    }
    // Post-create resync via BroadcastChannel (avoids interfering with user port messaging)
    __wrkBestEffort('wrk:shared_worker_publish_snapshot_failed', {
      stage: 'runtime',
      key: 'publishSnapshot',
      message: 'shared worker publish snapshot failed',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'shared_worker_publish_snapshot_failed' }
    }, () => { bridge && bridge.publishSnapshot && bridge.publishSnapshot(snap); });
    return sw;
  }, 'SharedWorker');
  
  
  
  definePatchedValue(G, 'SharedWorker', WrappedSharedWorker, 'SharedWorker');
  G.SharedWorker.__ENV_WRAPPED__ = true;
  if (G.__DEBUG__) {
    __wrkBestEffort('wrk:shared_worker_debug_mark_failed', {
      stage: 'apply',
      key: 'SharedWorker',
      message: 'shared worker debug mark failed',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'shared_worker_debug_mark_failed' }
    }, () => { G.__PATCHED_SHARED_WORKER__ = true; });
    __wrkDiag('info', 'wrk:shared_worker_installed', {
      stage: 'apply',
      key: 'SharedWorker',
      message: 'SharedWorker installed',
      type: 'pipeline missing data',
      data: { outcome: 'return' }
    }, null);
  }
}
window.SafeSharedWorkerOverride = SafeSharedWorkerOverride;



// ===== ServiceWorker override (allow self/infra; block others; hub-friendly) =====
function ServiceWorkerOverride(G){
  'use strict';
  if (!G || !G.navigator) {
    __wrkDiag('warn', 'wrk:service_worker_navigator_missing', {
      stage: 'preflight',
      key: 'navigator',
      message: 'navigator missing',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'navigator_missing' }
    }, null);
    return;
  }
  if (G.isSecureContext === false) {
    return;
  }
  if (!('serviceWorker' in G.navigator)) {
    __wrkDiag('warn', 'wrk:service_worker_missing', {
      stage: 'preflight',
      key: 'serviceWorker',
      message: 'navigator.serviceWorker missing',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'service_worker_missing' }
    }, null);
    return;
  }
  if (!G.navigator.serviceWorker) {
    __wrkDiag('warn', 'wrk:service_worker_unavailable', {
      stage: 'preflight',
      key: 'serviceWorker',
      message: 'navigator.serviceWorker unavailable',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'service_worker_unavailable' }
    }, null);
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
        __wrkBestEffort('wrk:service_worker_already_mark_failed', {
          stage: 'apply',
          key: 'serviceWorker',
          message: 'service worker already-installed mark failed',
          type: 'pipeline missing data',
          data: { outcome: 'skip', reason: 'service_worker_already_mark_failed' }
        }, () => { G.__PATCHED_SERVICE_WORKER__ = true; });
      }
      __wrkDiag('info', 'wrk:service_worker_already_installed', {
        stage: 'guard',
        key: 'serviceWorker',
        message: 'ServiceWorker already installed',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'already_installed' }
      }, null);
      return;
    }
  } catch(e) {
    __wrkDiag('warn', 'wrk:service_worker_preflight_failed', {
      stage: 'preflight',
      key: 'serviceWorker',
      message: 'service worker preflight failed',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'service_worker_preflight_failed' }
    }, e);
  }

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
        `ServiceWorker host resolve failed (u=${String(u)}, base=${String(base)}): ${emsg}`
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
      throw new Error('ServiceWorker fake missing scriptURL');
    }
    if (typeof scope !== 'string' || !scope) {
      throw new Error('ServiceWorker fake missing scope');
    }
    return {
      scriptURL,
      state: 'activated',
      onstatechange: null,
      postMessage() { throw new Error('ServiceWorker.postMessage unavailable'); },
      addEventListener() { throw new Error('ServiceWorker.addEventListener unavailable'); },
      removeEventListener() { throw new Error('ServiceWorker.removeEventListener unavailable'); }
    };
  }

  function makeFakeRegistration(options, scriptURL) {
    if (!options || typeof options !== 'object') {
      throw new Error('ServiceWorker fake registration missing options');
    }
    const scope = options.scope;
    if (typeof scope !== 'string' || !scope) {
      throw new Error('ServiceWorker fake registration missing options.scope');
    }
    const active = makeFakeServiceWorker(scriptURL, scope);
    return {
      scope, installing: null, waiting: null, active,
      navigationPreload: {
        enable: async () => { throw new Error('navigationPreload.enable unavailable'); },
        disable: async () => { throw new Error('navigationPreload.disable unavailable'); },
        getState: async () => { throw new Error('navigationPreload.getState unavailable'); }
      },
      addEventListener() { throw new Error('registration.addEventListener unavailable'); },
      removeEventListener() { throw new Error('registration.removeEventListener unavailable'); },
      update: async () => { throw new Error('registration.update unavailable'); },
      unregister: async () => { throw new Error('registration.unregister unavailable'); }
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
    __wrkBestEffort('wrk:service_worker_register_name_failed', {
      stage: 'apply',
      key: 'register.name',
      message: 'service worker register name define failed',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'service_worker_register_name_failed' }
    }, () => Object.defineProperty(WrappedServiceWorkerRegister, 'name', { value: 'WrappedServiceWorkerRegister' }));
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
            try {
              await r.unregister();
            } catch (e) {
              __wrkDiag('warn', 'wrk:service_worker_unregister_failed', {
                stage: 'runtime',
                key: sc,
                message: 'service worker unregister failed',
                type: 'browser structure missing data',
                data: { outcome: 'skip', reason: 'service_worker_unregister_failed' }
              }, e);
            }
            CLEANED.add(sc);
          }
          if (wantFake()) out.push(makeFakeRegistration({ scope: sc }, url));
        }
      }
      return out;
    }, 'getRegistrations');
    __wrkBestEffort('wrk:service_worker_getregistrations_name_failed', {
      stage: 'apply',
      key: 'getRegistrations.name',
      message: 'getRegistrations name define failed',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'service_worker_getregistrations_name_failed' }
    }, () => Object.defineProperty(WrappedSWGetRegistrations, 'name', { value: 'WrappedSWGetRegistrations' }));
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
        try {
          await r.unregister();
        } catch (e) {
          __wrkDiag('warn', 'wrk:service_worker_unregister_failed', {
            stage: 'runtime',
            key: sc,
            message: 'service worker unregister failed',
            type: 'browser structure missing data',
            data: { outcome: 'skip', reason: 'service_worker_unregister_failed' }
          }, e);
        }
        CLEANED.add(sc);
      }
      return wantFake() ? makeFakeRegistration({ scope: sc }, url) : undefined;
    }, 'getRegistration');
    __wrkBestEffort('wrk:service_worker_getregistration_name_failed', {
      stage: 'apply',
      key: 'getRegistration.name',
      message: 'getRegistration name define failed',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'service_worker_getregistration_name_failed' }
    }, () => Object.defineProperty(WrappedSWGetRegistration, 'name', { value: 'WrappedSWGetRegistration' }));
    WrappedSWGetRegistration.__ENV_WRAPPED__ = true;
    Object.defineProperty(proto, 'getRegistration', {
      configurable: desc.configurable, enumerable: desc.enumerable, writable: desc.writable, value: WrappedSWGetRegistration
    });
  }

  //Diagnostics
  if (G.__DEBUG__) {
    __wrkBestEffort('wrk:service_worker_debug_mark_failed', {
      stage: 'apply',
      key: 'serviceWorker',
      message: 'service worker debug mark failed',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'service_worker_debug_mark_failed' }
    }, () => { G.__PATCHED_SERVICE_WORKER__ = true; });
  }
  __wrkDiag('info', 'wrk:service_worker_installed', {
    stage: 'apply',
    key: 'serviceWorker',
    message: 'ServiceWorker installed',
    type: 'pipeline missing data',
    data: { outcome: 'return' }
  }, null);
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
    const KEYS = Array.isArray(keys) && keys.length
      ? keys
      : ['architecture','bitness','model','platformVersion','fullVersionList','formFactors','wow64'];
    const contract = G.__EXPECTED_CLIENT_HINTS;

    // Prefer contract values: avoids blocking initAll() on async native HE.
    if (contract && typeof contract === 'object') {
      try {
        const he = {};
        for (const k of KEYS) {
          if (!(k in contract)) throw new Error('[WorkerInit] contract missing ' + k);
          const v = contract[k];
          if (v === undefined || v === null) throw new Error('[WorkerInit] contract bad ' + k);
          if (typeof v === 'string' && !v.trim() && k !== 'model') throw new Error('[WorkerInit] contract bad ' + k);
          if (Array.isArray(v) && !v.length) throw new Error('[WorkerInit] contract bad ' + k);
          if (k === 'fullVersionList') {
            if (!Array.isArray(v) || !v.length) throw new Error('[WorkerInit] contract bad fullVersionList');
            for (const x of v) {
              if (!x || typeof x !== 'object') throw new Error('[WorkerInit] contract bad fullVersionList');
              const brand = (typeof x.brand === 'string' && x.brand) ? x.brand
                          : (typeof x.name === 'string' && x.name) ? x.name
                          : null;
              const version = (typeof x.version === 'string' && x.version) ? x.version
                            : (typeof x.version === 'number' && Number.isFinite(x.version)) ? String(x.version)
                            : null;
              if (!brand || !version) throw new Error('[WorkerInit] contract bad fullVersionList');
            }
          }
          he[k] = v;
        }
        G.__LAST_UACH_HE__ = he;
        G.__UACH_HE_READY__ = true;
        const p = Promise.resolve(he);
        G.__UACH_HE_PROMISE__ = p;
        return p;
      } catch (e) {
        __wrkDiag('error', 'wrk:uadata_he_contract_mismatch', {
          stage: 'contract',
          key: '__EXPECTED_CLIENT_HINTS',
          message: 'high entropy contract mismatch',
          type: 'pipeline missing data',
          data: { outcome: 'throw', reason: 'uadata_he_contract_mismatch' }
        }, e);
        throw e;
      }
    }

    const UAD = G.navigator && G.navigator.userAgentData;
    if (!UAD || typeof UAD.getHighEntropyValues !== 'function') {
      throw new Error('[WorkerInit] userAgentData missing');
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
    // Install overrides first to prevent early native SharedWorker creation before async HE readiness.
    installOverrides(); // Hub -> Overrides
    // Strict UAData mode: obtain HE first; only then publish snapshots.
    return snapshotHE(o.heKeys).then(() => snapshotOnce());
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
  __wrkDiag('info', 'wrk:worker_patch_hooks_ready', {
    stage: 'apply',
    key: 'WorkerPatchHooks',
    message: 'WorkerPatchHooks ready',
    type: 'pipeline missing data',
    data: { outcome: 'return' }
  }, null);

  // reduce visibility of pipeline globals in Window realm (non-enumerable)
  try {
    const win = G;
    if (win && (typeof win === 'object' || typeof win === 'function')) {
      const keys = [
        '__ENV_BRIDGE__',
        '__ENV_HUB__',
        'CanvasPatchContext',
        '__CORE_TOSTRING_STATE__'
      ];
      for (const k of keys) {
        if (!Object.prototype.hasOwnProperty.call(win, k)) continue;
        const d = Object.getOwnPropertyDescriptor(win, k);
        if (!d || d.enumerable === false) continue;
        if (d.configurable === false) {
          const e = new Error('[WrkModule] hidePipelineSurface non-configurable: ' + k);
          __wrkDiag('warn', 'wrk:hide_pipeline_surface_nonconfigurable', {
            stage: 'apply',
            key: k,
            message: 'hide pipeline surface skipped: non-configurable',
            type: 'browser structure missing data',
            data: { outcome: 'skip', reason: 'hide_pipeline_surface_nonconfigurable' }
          }, e);
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
    __wrkDiag('warn', 'wrk:hide_pipeline_surface_failed', {
      stage: 'apply',
      key: '__ENV_BRIDGE__',
      message: 'hide pipeline surface failed',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'hide_pipeline_surface_failed' }
    }, e);
  }
    __wrkDiag('info', 'wrk:init:return', {
      stage: 'apply',
      key: '__PATCH_WRK__',
      message: 'WrkModule initialized',
      type: 'pipeline missing data',
      data: { outcome: 'return' }
    }, null);
  } catch (e) {
    __wrkDiag('error', 'wrk:fatal', {
      stage: 'apply',
      key: '__PATCH_WRK__',
      message: 'WrkModule fatal',
      type: 'browser structure missing data',
      data: { outcome: 'throw', reason: 'fatal', rollbackOk: false }
    }, e);
    __wrkBestEffort('wrk:guard_release_failed', {
      stage: 'guard',
      key: '__PATCH_WRK__',
      message: 'releaseGuardFlag failed',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'guard_release_failed' }
    }, () => (__core && typeof __core.releaseGuardFlag === 'function')
      ? __core.releaseGuardFlag('__PATCH_WRK__', __guardToken, false, __MODULE)
      : false);
    throw e;
  }
}; // <-- закрыли WrkModule

// --- export WrkModule globally (stable regardless of load order) ---
Object.defineProperty(globalThis, 'WrkModule', {
  value: WrkModule,
  writable: true,
  configurable: false,
  enumerable: false,
});

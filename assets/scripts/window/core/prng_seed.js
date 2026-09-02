(function () {
  const RNGsetModule = function RNGsetModule(window) {
    'use strict';
    // Global-Alias ​​(reliable in the window and workrs)
    const G = (typeof globalThis !== 'undefined' && globalThis)
          || (typeof self       !== 'undefined' && self)
          || (typeof window     !== 'undefined' && window)
          || (typeof global     !== 'undefined' && global)
          || {};

    const __FERNWEH_DIAG__ = function(level, code, extra, err) {
  try {
    const G_ = (typeof globalThis !== 'undefined' && globalThis) || (typeof self !== 'undefined' && self) || (typeof window !== 'undefined' && window) || {};
    if (G_.FernwehContext && G_.FernwehContext.__logger && G_.FernwehContext.__logger.__DEGRADE__ && typeof G_.FernwehContext.__logger.__DEGRADE__.diag === 'function') {
      G_.FernwehContext.__logger.__DEGRADE__.diag(level, code, extra, err);
    } else if (G_.__loggerRoot && G_.__loggerRoot.__DEGRADE__ && typeof G_.__loggerRoot.__DEGRADE__.diag === 'function') {
      G_.__loggerRoot.__DEGRADE__.diag(level, code, extra, err);
    }
  } catch (_) {}
};

    const __emit = (level, code, ctx, err) => {
      try {
        const _err = (typeof err === 'undefined') ? null : err;
        if (__diag) return __diag(level, code, ctx || null, _err);
        if (typeof __D === 'function') {
          const extra = (ctx && typeof ctx === 'object') ? Object.assign({ level }, ctx) : (ctx || { level });
          return __D(code, _err, extra || null);
        }
      } catch (_) {  try {
    const _root = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this);
    if (_root && _root.__loggerRoot && typeof _root.__loggerRoot.__DEGRADE__ === "function") {
      if (typeof _root.__loggerRoot.__DEGRADE__.diag === "function") {
        _root.__loggerRoot.__DEGRADE__.diag("error", "silent_swallow", {message: "caught swallowed exception"}, _);
      } else {
        _root.__loggerRoot.__DEGRADE__("silent_swallow", _, {message: "caught swallowed exception"});
      }
    }
  } catch (_err) {}
}
    };

    const __core = window && window.Core;
    const __tag = 'rng_set';
    const __surface = 'rng_set';

    // Utilities
    function toBool(v) {
      if (typeof v === 'boolean') return v;
      if (typeof v === 'number') return v !== 0;
      if (typeof v === 'string') return /^(1|true|yes|on)$/i.test(v.trim());
      return false;
    }
    function maskSeed(s, keep) {
      s = String(s); const n = s.length; const k = Math.max(2, Math.min(keep || 4, Math.floor(n / 4)));
      return (n <= 2 * k) ? '"' + s + '" (len ' + n + ')' : '"' + s.slice(0, k) + '…' + s.slice(-k) + '" (len ' + n + ')';
    }
    const C = (G && G.FernwehContext) || (window && window.FernwehContext) || null;
    const __coreInternal = (__core && __core.__internal && typeof __core.__internal === 'object')
      ? __core.__internal
      : null;
    function isWorkerRealm() {
      return !!(
        typeof WorkerGlobalScope !== 'undefined'
        && window
        && window instanceof WorkerGlobalScope
      );
    }
    function resolveBootstrapSeedMeta() {
      if (isWorkerRealm()) {
        if (window && window.CDP_GLOBAL_SEED != null) {
          return { seed: String(window.CDP_GLOBAL_SEED), key: 'CDP_GLOBAL_SEED', source: 'CDP_GLOBAL_SEED' };
        }
        if (G && G.CDP_GLOBAL_SEED != null) {
          return { seed: String(G.CDP_GLOBAL_SEED), key: 'CDP_GLOBAL_SEED', source: 'CDP_GLOBAL_SEED' };
        }
        return { seed: '', key: 'CDP_GLOBAL_SEED', source: 'CDP_GLOBAL_SEED' };
      }
      if (window && typeof window.__GLOBAL_SEED === 'string' && window.__GLOBAL_SEED) {
        return { seed: String(window.__GLOBAL_SEED), key: '__GLOBAL_SEED', source: '__GLOBAL_SEED' };
      }
      if (G && typeof G.__GLOBAL_SEED === 'string' && G.__GLOBAL_SEED) {
        return { seed: String(G.__GLOBAL_SEED), key: '__GLOBAL_SEED', source: '__GLOBAL_SEED' };
      }
      return { seed: '', key: '__GLOBAL_SEED', source: '__GLOBAL_SEED' };
    }
    function resolveBootstrapSeed() {
      return resolveBootstrapSeedMeta().seed;
    }
    function ensurePrngState() {
      const state = (__coreInternal && __coreInternal.prng && typeof __coreInternal.prng === 'object')
        ? __coreInternal.prng
        : null;
      if (!state) {
        __emit('fatal', 'rng_set:core_prng_owner_missing', {
          module: 'rng_set',
          diagTag: 'rng_set',
          surface: 'Core.__internal.prng',
          key: 'Core.__internal.prng',
          stage: 'preflight',
          message: 'Core.__internal.prng missing; bootstrap owner-space was not created',
          type: 'pipeline missing data',
          data: { outcome: 'rollback', action: 'native' }
        }, new Error('[RNGsetModule] Core.__internal.prng missing'));
        return null;
      }
      if (typeof state.seed !== 'string') state.seed = '';
      if (typeof state.strToSeed !== 'function') state.strToSeed = null;
      if (typeof state.mulberry32 !== 'function') state.mulberry32 = null;
      if (!state.rand || typeof state.rand !== 'object') state.rand = null;
      if (!state.pools || typeof state.pools !== 'object') state.pools = Object.create(null);
      if (typeof state.marker !== 'string' || !state.marker) state.marker = 'envrand';
      if (typeof state.version !== 'string' || !state.version) state.version = '1.1.1';
      return state;
    }
    const __prngState = ensurePrngState();
    if (!__prngState) return;
    if (__prngState.__rngSetSeedMissingLocked === true) {
      __emit('warn', 'rng_set:preflight:global_seed_missing_locked', {
        module: __tag,
        diagTag: __tag,
        surface: __surface,
        key: 'Core.__internal.prng',
        stage: 'preflight',
        message: 'bootstrap seed was previously missing; rand install remains locked',
        type: 'pipeline missing data',
        data: { outcome: 'return', reason: 'bootstrap_seed_missing_locked', action: 'native', producerLock: 'locked' }
      }, null);
      return;
    }

    function installRand() {
      if (!__prngState) return false;
      const bootstrapSeedMeta = resolveBootstrapSeedMeta();
      const bootstrapSeed = bootstrapSeedMeta.seed;
      if (__prngState && __prngState.rand && __prngState.rand.__marker === 'envrand' && typeof __prngState.rand.use === 'function') {
        if (!__prngState.seed && bootstrapSeed) __prngState.seed = bootstrapSeed;
        return true;
      }
      const seed = bootstrapSeed || ((__prngState && typeof __prngState.seed === 'string' && __prngState.seed) ? __prngState.seed : '');
      if (!seed) return false; // why: waiting for the seed
      if (__prngState) __prngState.seed = seed;

      let mulberry32Fn = (__prngState && typeof __prngState.mulberry32 === 'function')
        ? __prngState.mulberry32
        : null;
      if (typeof mulberry32Fn !== 'function') {
        const __mulberry32 = function (seed) {
          return function () {
            let t = (seed += 0x6d2b79f5);
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
          };
        };
        mulberry32Fn = __mulberry32;
      }
      if (__prngState) __prngState.mulberry32 = mulberry32Fn;

      let strToSeedFn = (__prngState && typeof __prngState.strToSeed === 'function')
        ? __prngState.strToSeed
        : null;
      if (typeof strToSeedFn !== 'function') {
        const __strToSeed = function (str) {
          let h = 5381; str = String(str);
          for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
          return h >>> 0;
        };
        strToSeedFn = __strToSeed;
      }
      if (__prngState) __prngState.strToSeed = strToSeedFn;

      const LOG_SEED = toBool(G.__LOG_SEED);
      const LOG_POOLS = toBool(G.__LOG_POOLS);
      if (LOG_SEED) {
        __emit('info', 'rng_set:seed_detected', {
          module: 'rng_set',
          diagTag: 'rng_set',
          surface: 'rng_set',
          key: bootstrapSeedMeta.key,
          stage: 'preflight',
          message: bootstrapSeedMeta.source + ' detected',
          type: 'ok',
          data: { outcome: 'return', seed: maskSeed(seed) }
        }, null);
      }

      const ROOT = '__RAND_SEED_POOL__';
      const pools = (__prngState && __prngState.pools && typeof __prngState.pools === 'object')
        ? __prngState.pools
        : Object.create(null);
      if (__prngState) __prngState.pools = pools;
      let __labelCoerceWarned = false;

      function getRng(label) {
        if (!__labelCoerceWarned && label != null && typeof label !== 'string') {
          __labelCoerceWarned = true;
          __emit('warn', 'rng_set:rand_use_label_coerced', {
            module: 'rng_set',
            diagTag: 'rng_set',
            surface: 'rng_set',
            key: 'rand.use',
            stage: 'runtime',
            message: 'rand.use label coerced to string',
            type: 'contract violation',
            data: { outcome: 'return', labelType: typeof label }
          }, null);
        }
        const key = String(label == null ? 'default' : label);
        let rng = pools[key];
        if (!rng) {
          const material = ROOT + '|' + key + '|' + String(seed);
          const numericSeed = strToSeedFn(material);
          if (LOG_POOLS) {
            __emit('info', 'rng_set:pool_created', {
              module: 'rng_set',
              diagTag: 'rng_set',
              surface: 'rng_set',
              key,
              stage: 'apply',
              message: 'pool created',
              type: 'ok',
              data: { outcome: 'return' }
            }, null);
          }
          rng = pools[key] = mulberry32Fn(numericSeed);
        }
        return rng;
      }

      const rand = {
        use(label) { return getRng(label); },
        __marker: 'envrand',
        __version: '1.1.1'
      };

      Object.freeze(rand);
      if (__prngState) {
        __prngState.seed = seed;
        __prngState.rand = rand;
        __prngState.marker = 'envrand';
        __prngState.version = '1.1.1';
      }
      return true;
    }

    (function boot() {
      try {
        if (installRand()) {
          __emit('info', 'rng_set:ready', {
            module: __tag,
            diagTag: __tag,
            surface: __surface,
            key: 'rand',
            stage: 'apply',
            message: 'rand ready',
            type: 'ok',
            data: { outcome: 'return', reason: 'ready' }
          }, null);
          return; // Everything is ready
        }
        const missingSeedMeta = resolveBootstrapSeedMeta();
        __prngState.__rngSetSeedMissingLocked = true;
        __emit('warn', 'rng_set:preflight:global_seed_missing', {
          module: __tag,
          diagTag: __tag,
          surface: __surface,
          key: missingSeedMeta.key,
          stage: 'preflight',
          message: missingSeedMeta.source + ' missing; rand not installed',
          type: 'pipeline missing data',
          data: { outcome: 'return', reason: 'bootstrap_seed_missing', action: 'native', producerLock: 'locked' }
        }, null);
      } catch (e) {
        __emit('fatal', 'rng_set:boot_failed', {
          module: __tag,
          diagTag: __tag,
          surface: __surface,
          key: null,
          stage: 'runtime',
          message: 'boot failed',
          type: 'browser structure missing data',
          data: { outcome: 'rollback', action: 'native' }
        }, e);
      }
    })();

    try {
      if (C && (typeof C === 'object' || typeof C === 'function')) {
        let prngRuntime = (C.__prngRuntime__ && typeof C.__prngRuntime__ === 'object') ? C.__prngRuntime__ : null;
        if (!prngRuntime) {
          prngRuntime = Object.create(null);
          Object.defineProperty(C, '__prngRuntime__', {
            value: prngRuntime,
            writable: true,
            configurable: true,
            enumerable: false
          });
        }
        Object.defineProperty(prngRuntime, 'RNGsetModule', {
          value: RNGsetModule,
          writable: true,
          configurable: true,
          enumerable: false
        });
      }
      const exportDesc = Object.getOwnPropertyDescriptor(G, 'RNGsetModule');
      if (exportDesc && exportDesc.configurable !== false) {
        delete G.RNGsetModule;
      }
    } catch (e) {
      __emit('warn', 'rng_set:runtime_export_sync_failed', {
        module: 'rng_set',
        diagTag: 'rng_set',
        surface: 'rng_set',
        key: 'RNGsetModule',
        stage: 'apply',
        message: 'runtime export sync failed',
        type: 'browser structure missing data',
        data: { outcome: 'return', action: 'keep_runtime_shell' }
      }, e);
    }
  }

  // Function export*
  const G = (typeof globalThis !== 'undefined' && globalThis)
        || (typeof self       !== 'undefined' && self)
        || (typeof window     !== 'undefined' && window)
        || (typeof global     !== 'undefined' && global)
        || {};

  const __rngHasOwnExport = Object.prototype.hasOwnProperty.call(G, 'RNGsetModule');
  const __rngExportDesc = __rngHasOwnExport ? Object.getOwnPropertyDescriptor(G, 'RNGsetModule') : null;
  const __rngCanFillPlaceholder = !!(__rngExportDesc && __rngExportDesc.configurable !== false && G.RNGsetModule === undefined);
  const __outerLoggerRoot = (G && G.FernwehContext && G.FernwehContext.__logger && typeof G.FernwehContext.__logger === 'object')
    ? G.FernwehContext.__logger
    : null;
  const __outerDegrade = (__outerLoggerRoot && typeof __outerLoggerRoot.__DEGRADE__ === 'function') ? __outerLoggerRoot.__DEGRADE__ : null;
  const __outerDiag = (__outerDegrade && typeof __outerDegrade.diag === 'function') ? __outerDegrade.diag.bind(__outerDegrade) : null;
  function __emitOuter(level, code, ctx, err) {
    try {
      if (__outerDiag) return __outerDiag(level, code, ctx || null, err || null);
      if (typeof __outerDegrade === 'function') {
        return __outerDegrade(code, err || null, Object.assign({ level: level || 'warn' }, ctx || null));
      }
    } catch (_emitErr) {  try {
    const _root = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this);
    if (_root && _root.__loggerRoot && typeof _root.__loggerRoot.__DEGRADE__ === "function") {
      if (typeof _root.__loggerRoot.__DEGRADE__.diag === "function") {
        _root.__loggerRoot.__DEGRADE__.diag("error", "silent_swallow", {message: "caught swallowed exception"}, _emitErr);
      } else {
        _root.__loggerRoot.__DEGRADE__("silent_swallow", _emitErr, {message: "caught swallowed exception"});
      }
    }
  } catch (_err) {}
}
    return undefined;
  }
  if (!__rngHasOwnExport || __rngCanFillPlaceholder) {
    try {
      Object.defineProperty(G, 'RNGsetModule', {
        value: RNGsetModule,
        writable: true,
        configurable: true,
        enumerable: false
      });
    } catch (e) {
      // [NORMATIVE] no console.*, report through __DEGRADE__.diag with fallback
      try {
        const ctx = {
          module: 'rng_set',
          diagTag: 'rng_set',
          surface: 'rng_set',
          key: 'RNGsetModule',
          stage: 'apply',
          message: 'Object.defineProperty(G,"RNGsetModule") failed; fallback to assignment',
          type: 'browser structure missing data',
          data: { outcome: 'rollback', action: 'fallback_assign' }
        };
        __emitOuter('warn', 'rng_set:export_define_failed', ctx, e);
      } catch (_reportErr) {  try {
    const _root = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this);
    if (_root && _root.__loggerRoot && typeof _root.__loggerRoot.__DEGRADE__ === "function") {
      if (typeof _root.__loggerRoot.__DEGRADE__.diag === "function") {
        _root.__loggerRoot.__DEGRADE__.diag("error", "silent_swallow", {message: "caught swallowed exception"}, _reportErr);
      } else {
        _root.__loggerRoot.__DEGRADE__("silent_swallow", _reportErr, {message: "caught swallowed exception"});
      }
    }
  } catch (_err) {}
}
      G.RNGsetModule = RNGsetModule;
    }
  } else {
    try {
      const d = Object.getOwnPropertyDescriptor(G, 'RNGsetModule');
      if (d && d.enumerable !== false && d.configurable !== false && typeof G.RNGsetModule === 'function') {
        Object.defineProperty(G, 'RNGsetModule', {
          value: G.RNGsetModule,
          writable: !!d.writable,
          configurable: true,
          enumerable: false
        });
      }
    } catch (e) {
      __emitOuter('warn', 'rng_set:export_hide_failed', {
        module: 'rng_set',
        diagTag: 'rng_set',
        surface: 'rng_set',
        key: 'RNGsetModule',
        stage: 'apply',
        message: 'RNGsetModule hide-pass failed',
        type: 'browser structure missing data',
        data: { outcome: 'return', action: 'keep_export_shape' }
      }, e);
    }
  }
})();

// *A global property is made unchangable to prevent other code from accidentally/intentionally overwriting the function.
// This isn't "patching your function," but rather protecting it from changes after it's declared.
// Adding a function to the global object once makes it protected, allowing any other code or module to access it without risk of being accidentally overwritten.
// This is the standard approach for modules that can run in different environments (window/worker/).

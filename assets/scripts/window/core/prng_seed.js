(function () {
  const RNGsetModule = function RNGsetModule(window) {
    'use strict';
    // Global-Alias ​​(reliable in the window and workrs)
    const G = (typeof globalThis !== 'undefined' && globalThis)
          || (typeof self       !== 'undefined' && self)
          || (typeof window     !== 'undefined' && window)
          || (typeof global     !== 'undefined' && global)
          || {};

    // [NORMATIVE] local adapter for __DEGRADE__ (no console.*, safe-noop on failure)
    const __D = (G && G.__DEGRADE__) || (window && window.__DEGRADE__) || null;
    const __diag = (__D && typeof __D.diag === 'function') ? __D.diag.bind(__D) : null;
    const __emit = (level, code, ctx, err) => {
      try {
        const _err = (typeof err === 'undefined') ? null : err;
        if (__diag) return __diag(level, code, ctx || null, _err);
        if (typeof __D === 'function') {
          const extra = (ctx && typeof ctx === 'object') ? Object.assign({ level }, ctx) : (ctx || { level });
          return __D(code, _err, extra || null);
        }
      } catch (_) {}
    };

    // ===== MODULE: canonical guard client (GuardFlag.md) =====
    const __core = window && window.Core;
    const __flagKey = '__PATCH_RNG_SET__';
    const __tag = 'rng_set';
    const __surface = 'rng_set';
    let __guardToken = null;
    try {
      if (!__core || typeof __core.guardFlag !== 'function') {
        __emit('warn', 'rng_set:guard_missing', {
          module: __tag,
          diagTag: __tag,
          surface: __surface,
          key: __flagKey,
          stage: 'guard',
          message: 'Core.guardFlag missing',
          type: 'pipeline missing data',
          data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
        }, null);
        return;
      }
      __guardToken = __core.guardFlag(__flagKey, __tag);
    } catch (e) {
      __emit('warn', 'rng_set:guard_failed', {
        module: __tag,
        diagTag: __tag,
        surface: __surface,
        key: __flagKey,
        stage: 'guard',
        message: 'guardFlag threw',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_failed' }
      }, e);
      return;
    }
    if (!__guardToken) return; // already_patched: Core emits rng_set:already_patched

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
    const C = (G && G.CanvasPatchContext) || (window && window.CanvasPatchContext) || null;
    function ensurePrngState() {
      if (!C || (typeof C !== 'object' && typeof C !== 'function')) return null;
      let state = (C.__PRNG_STATE__ && typeof C.__PRNG_STATE__ === 'object') ? C.__PRNG_STATE__ : null;
      if (!state) {
        state = {
          seed: '',
          strToSeed: null,
          mulberry32: null,
          rand: null,
          pools: Object.create(null),
          marker: 'envrand',
          version: '1.1.1'
        };
        try {
          Object.defineProperty(C, '__PRNG_STATE__', {
            value: state,
            writable: true,
            configurable: true,
            enumerable: false
          });
        } catch (e) {
          __emit('warn', 'rng_set:define_prng_state_failed', {
            module: 'rng_set',
            diagTag: 'rng_set',
            surface: 'CanvasPatchContext',
            key: '__PRNG_STATE__',
            stage: 'apply',
            message: 'Object.defineProperty(CanvasPatchContext,"__PRNG_STATE__") failed; fallback to assignment',
            type: 'browser structure missing data',
            data: { outcome: 'rollback', action: 'fallback_assign' }
          }, e);
          C.__PRNG_STATE__ = state;
        }
      }
      const stateRoot = (C.state && typeof C.state === 'object') ? C.state : null;
      if (stateRoot) {
        try {
          const shared = stateRoot.__PRNG_STATE__;
          if (shared !== state) {
            Object.defineProperty(stateRoot, '__PRNG_STATE__', {
              value: state,
              writable: true,
              configurable: true,
              enumerable: false
            });
          }
        } catch (e) {
          __emit('warn', 'rng_set:define_state_root_prng_failed', {
            module: 'rng_set',
            diagTag: 'rng_set',
            surface: 'CanvasPatchContext.state',
            key: '__PRNG_STATE__',
            stage: 'apply',
            message: 'Object.defineProperty(CanvasPatchContext.state,"__PRNG_STATE__") failed',
            type: 'browser structure missing data',
            data: { outcome: 'continue', action: 'keep_root_slot' }
          }, e);
        }
      }
      if (!state.pools || typeof state.pools !== 'object') state.pools = Object.create(null);
      return state;
    }
    const __prngState = ensurePrngState();

    function installRand() {
      if (__prngState && __prngState.rand && __prngState.rand.__marker === 'envrand' && typeof __prngState.rand.use === 'function') {
        if (!__prngState.seed && typeof G.__GLOBAL_SEED === 'string' && G.__GLOBAL_SEED) __prngState.seed = String(G.__GLOBAL_SEED);
        if (!__prngState.strToSeed && typeof G.strToSeed === 'function') __prngState.strToSeed = G.strToSeed;
        if (!__prngState.mulberry32 && typeof G.mulberry32 === 'function') __prngState.mulberry32 = G.mulberry32;
        if (G.rand !== __prngState.rand) {
          try {
            Object.defineProperty(G, 'rand', { value: __prngState.rand, writable: false, configurable: false, enumerable: true });
          } catch (e) {
            try { G.rand = __prngState.rand; } catch (_) {}
          }
        }
        return true;
      }
      if (G.rand && G.rand.__marker === 'envrand' && typeof G.rand.use === 'function') {
        if (__prngState) {
          __prngState.seed = (typeof G.__GLOBAL_SEED === 'string' && G.__GLOBAL_SEED) ? String(G.__GLOBAL_SEED) : (__prngState.seed || '');
          __prngState.strToSeed = (typeof G.strToSeed === 'function') ? G.strToSeed : __prngState.strToSeed;
          __prngState.mulberry32 = (typeof G.mulberry32 === 'function') ? G.mulberry32 : __prngState.mulberry32;
          __prngState.rand = G.rand;
        }
        return true;
      }
      const seed = (typeof G.__GLOBAL_SEED === 'string' && G.__GLOBAL_SEED)
        ? String(G.__GLOBAL_SEED)
        : ((__prngState && typeof __prngState.seed === 'string' && __prngState.seed) ? __prngState.seed : '');
      if (!seed) return false; // why: waiting for the seed
      if (__prngState) __prngState.seed = seed;

      let mulberry32Fn = (__prngState && typeof __prngState.mulberry32 === 'function')
        ? __prngState.mulberry32
        : ((typeof G.mulberry32 === 'function') ? G.mulberry32 : null);
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
        try {
          Object.defineProperty(G, 'mulberry32', {
            value: mulberry32Fn,
            writable: true,
            configurable: true,
            enumerable: false
          });
        } catch (e) {
          __emit('warn', 'rng_set:define_mulberry32_failed', {
            module: 'rng_set',
            diagTag: 'rng_set',
            surface: 'rng_set',
            key: 'mulberry32',
            stage: 'apply',
            message: 'Object.defineProperty(G,"mulberry32") failed; fallback to assignment',
            type: 'browser structure missing data',
            data: { outcome: 'rollback', action: 'fallback_assign' }
          }, e);
          G.mulberry32 = mulberry32Fn;
        }
      }
      if (__prngState) __prngState.mulberry32 = mulberry32Fn;

      let strToSeedFn = (__prngState && typeof __prngState.strToSeed === 'function')
        ? __prngState.strToSeed
        : ((typeof G.strToSeed === 'function') ? G.strToSeed : null);
      if (typeof strToSeedFn !== 'function') {
        const __strToSeed = function (str) {
          let h = 5381; str = String(str);
          for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
          return h >>> 0;
        };
        strToSeedFn = __strToSeed;
        try {
          Object.defineProperty(G, 'strToSeed', {
            value: strToSeedFn,
            writable: true,
            configurable: true,
            enumerable: false
          });
        } catch (e) {
          __emit('warn', 'rng_set:define_strToSeed_failed', {
            module: 'rng_set',
            diagTag: 'rng_set',
            surface: 'rng_set',
            key: 'strToSeed',
            stage: 'apply',
            message: 'Object.defineProperty(G,"strToSeed") failed; fallback to assignment',
            type: 'browser structure missing data',
            data: { outcome: 'rollback', action: 'fallback_assign' }
          }, e);
          G.strToSeed = strToSeedFn;
        }
      }
      if (__prngState) __prngState.strToSeed = strToSeedFn;

      const LOG_SEED = toBool(G.__LOG_SEED);
      const LOG_POOLS = toBool(G.__LOG_POOLS);
      if (LOG_SEED) {
        __emit('info', 'rng_set:seed_detected', {
          module: 'rng_set',
          diagTag: 'rng_set',
          surface: 'rng_set',
          key: '__GLOBAL_SEED',
          stage: 'preflight',
          message: '__GLOBAL_SEED detected',
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

      try {
        Object.defineProperty(G, 'rand', { value: rand, writable: false, configurable: false, enumerable: true });
      } catch (e) {
        __emit('warn', 'rng_set:define_rand_failed', {
          module: 'rng_set',
          diagTag: 'rng_set',
          surface: 'rng_set',
          key: 'rand',
          stage: 'apply',
          message: 'Object.defineProperty(G,"rand") failed; fallback to assignment',
          type: 'browser structure missing data',
          data: { outcome: 'rollback', action: 'fallback_assign' }
        }, e);
        try {
          G.rand = rand;
        } catch (e2) {
          __emit('fatal', 'rng_set:assign_rand_failed', {
            module: 'rng_set',
            diagTag: 'rng_set',
            surface: 'rng_set',
            key: 'rand',
            stage: 'apply',
            message: 'G.rand assignment failed; leaving native',
            type: 'browser structure missing data',
            data: { outcome: 'rollback', action: 'native' }
          }, e2);
          return false;
        }
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
        __emit('warn', 'rng_set:preflight:global_seed_missing', {
          module: __tag,
          diagTag: __tag,
          surface: __surface,
          key: '__GLOBAL_SEED',
          stage: 'preflight',
          message: '__GLOBAL_SEED missing; rand not installed',
          type: 'pipeline missing data',
          // Policy exception: for seed we keep the guard (do NOT release) to prevent late seed replacement.
          data: { outcome: 'return', reason: 'global_seed_missing', action: 'native', guard: 'locked' }
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
        const __D = (G && G.__DEGRADE__) || null;
        const __diag = (__D && typeof __D.diag === 'function') ? __D.diag.bind(__D) : null;
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
        if (__diag) __diag('warn', 'rng_set:export_define_failed', ctx, e);
        else if (typeof __D === 'function') __D('rng_set:export_define_failed', e, Object.assign({ level: 'warn' }, ctx));
      } catch (_) {}
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
    } catch (_) {}
  }
})();

// *A global property is made unchangable to prevent other code from accidentally/intentionally overwriting the function.
// This isn't "patching your function," but rather protecting it from changes after it's declared.
// Adding a function to the global object once makes it protected, allowing any other code or module to access it without risk of being accidentally overwritten.
// This is the standard approach for modules that can run in different environments (window/worker/).

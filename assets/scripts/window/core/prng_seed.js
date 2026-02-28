(function () {
  const RNGsetModule = function RNGsetModule(window) {
    'use strict';
    // Global-Alias ​​(reliable in the window and workrs)
    const G = (typeof globalThis !== 'undefined' && globalThis)
          || (typeof self       !== 'undefined' && self)
          || (typeof window     !== 'undefined' && window)
          || (typeof global     !== 'undefined' && global)
          || {};

    // Idempotent‑guard For the whole module
    if (G.__PATCH_ENVPARAMS__) return; // why: Protection against re -initialization
    G.__PATCH_ENVPARAMS__ = true;

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

    // Fallbacks (do not interfere, if already defined)
    if (typeof G.mulberry32 !== 'function') {
      G.mulberry32 = function (seed) {
        return function () {
          let t = (seed += 0x6d2b79f5);
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      };
    }
    if (typeof G.strToSeed !== 'function') {
      G.strToSeed = function (str) {
        let h = 5381; str = String(str);
        for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
        return h >>> 0;
      };
    }

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

    function installRand() {
      if (G.rand && G.rand.__marker === 'envrand' && typeof G.rand.use === 'function') return true;
      if (typeof G.__GLOBAL_SEED !== 'string' || !G.__GLOBAL_SEED) return false; // why: waiting for the seed

      const LOG_SEED = toBool(G.__LOG_SEED);
      const LOG_POOLS = toBool(G.__LOG_POOLS);
      // console.* is forbidden here; diagnostics must go through __DEGRADE__.diag
      if (LOG_SEED) {
        __emit('info', 'rng_set:seed_detected', {
          module: 'rng_set',
          diagTag: 'rng_set',
          surface: 'rng_set',
          key: '__GLOBAL_SEED',
          stage: 'preflight',
          message: '__GLOBAL_SEED detected',
          type: 'ok',
          data: { outcome: 'return', seed: maskSeed(G.__GLOBAL_SEED) }
        }, null);
      }

      const ROOT = '__RAND_SEED_POOL__';
      const pools = Object.create(null);
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
          const material = ROOT + '|' + key + '|' + String(G.__GLOBAL_SEED);
          const numericSeed = G.strToSeed(material);
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
          rng = pools[key] = G.mulberry32(numericSeed);
        }
        return rng;
      }

      const rand = {
        use(label) { return getRng(label); },
        __marker: 'envrand',
        __version: '1.1.1'
      };

      Object.freeze(rand);

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
        if (installRand()) return; // Everything is ready
        __emit('warn', 'rng_set:preflight:global_seed_missing', {
          module: 'rng_set',
          diagTag: 'rng_set',
          surface: 'rng_set',
          key: '__GLOBAL_SEED',
          stage: 'preflight',
          message: '__GLOBAL_SEED missing; rand not installed',
          type: 'pipeline missing data',
          data: { outcome: 'rollback', action: 'native' }
        }, null);
      } catch (e) {
        __emit('fatal', 'rng_set:boot_failed', {
          module: 'rng_set',
          diagTag: 'rng_set',
          surface: 'rng_set',
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

  if (typeof G.RNGsetModule !== 'function') {
    try {
      Object.defineProperty(G, 'RNGsetModule', {
        value: RNGsetModule,
        writable: false,
        configurable: false,
        enumerable: true
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
  }
})();

// *A global property is made unchangable to prevent other code from accidentally/intentionally overwriting the function.
// This isn't "patching your function," but rather protecting it from changes after it's declared.
// Adding a function to the global object once makes it protected, allowing any other code or module to access it without risk of being accidentally overwritten.
// This is the standard approach for modules that can run in different environments (window/worker/).

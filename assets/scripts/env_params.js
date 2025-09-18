(function () {
  'use strict';
  function EnvParamsPatchModule() {
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
    G._myDebugLog = G._myDebugLog || [];

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

    //Lazy initialization of rand (does not tear the bandl if seed arrives later)
    let timer = null, attemptsLeft = 150; // ~3 сек при 20ms

    function installRand() {
      if (G.rand && G.rand.__marker === 'envrand' && typeof G.rand.use === 'function') return true;
      if (typeof G.__GLOBAL_SEED !== 'string' || !G.__GLOBAL_SEED) return false; // why: waiting for the seed

      const LOG_SEED = toBool(G.__LOG_SEED);
      const LOG_POOLS = toBool(G.__LOG_POOLS);
      if (LOG_SEED) { try { console.log('[PRNG] __GLOBAL_SEED detected:', maskSeed(G.__GLOBAL_SEED)); } catch (_) {} }

      const ROOT = '__RAND_SEED_POOL__';
      const pools = Object.create(null);

      function getRng(label) {
        const key = String(label == null ? 'default' : label);
        let rng = pools[key];
        if (!rng) {
          const material = ROOT + '|' + key + '|' + String(G.__GLOBAL_SEED);
          const numericSeed = G.strToSeed(material);
          if (LOG_POOLS) { try { console.log('[PRNG] pool created:', key); } catch (_) {} }
          rng = pools[key] = G.mulberry32(numericSeed);
        }
        return rng;
      }

      const rand = {
        use(label) { return getRng(label); },
        next(label) { return getRng(label)(); },
        reset(label) {
          if (typeof label === 'undefined') {
            for (const k in pools) if (Object.prototype.hasOwnProperty.call(pools, k)) delete pools[k];
            return true;
          }
          const key = String(label);
          if (Object.prototype.hasOwnProperty.call(pools, key)) { delete pools[key]; return true; }
          return false;
        },
        __marker: 'envrand',
        __version: '1.1.1'
      };

      Object.freeze(rand);

      try {
        Object.defineProperty(G, 'rand', { value: rand, writable: false, configurable: false, enumerable: true });
      } catch (_) {
        G.rand = rand;
      }
      return true;
    }

    (function boot() {
      try {
        if (installRand()) return; // Everything is ready
        timer = setInterval(function () {
          try {
            if (installRand() || --attemptsLeft <= 0) { clearInterval(timer); timer = null; }
          } catch (e) {
            clearInterval(timer); timer = null; try { console.error('[PRNG] init failed:', e && e.message); } catch (_) {}
          }
        }, 20);
      } catch (e) {
        try { console.error('[PRNG] boot failed:', e && e.message); } catch (_) { }
      }
    })();

    // Main‑thread only (Not executed in workerscope)
    if (typeof window !== 'undefined' && G === window) {
      const WSProto = window.WebSocket && window.WebSocket.prototype;
      if (WSProto) {
        const origClose = WSProto.close;
        window._myDebugLog = window._myDebugLog || [];
        WSProto.close = function (code, reason) {
          // why:Diagnostic closing trace ws
          window._myDebugLog.push({ type: 'websocket-close', code, reason, timestamp: new Date().toISOString() });
          return typeof origClose === 'function' ? origClose.call(this, code, reason) : undefined;
        };
      }
    }

    try { console.log('[ENV] EnvParamsPatchModule ready'); } catch (_) {}
  }

  // Function export
  const G = (typeof globalThis !== 'undefined' && globalThis)
        || (typeof self       !== 'undefined' && self)
        || (typeof window     !== 'undefined' && window)
        || (typeof global     !== 'undefined' && global)
        || {};

  if (typeof G.EnvParamsPatchModule !== 'function') {
    try {
      Object.defineProperty(G, 'EnvParamsPatchModule', {
        value: EnvParamsPatchModule,
        writable: false,
        configurable: false,
        enumerable: true
      });
    } catch {
      G.EnvParamsPatchModule = EnvParamsPatchModule;
    }
  }
})();

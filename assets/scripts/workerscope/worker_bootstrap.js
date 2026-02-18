(() => {
 
const G = (typeof globalThis !== 'undefined' && globalThis)
    || (typeof self       !== 'undefined' && self)
    || (typeof window     !== 'undefined' && window)
    || (typeof global     !== 'undefined' && global)
    || {};
 
  const BR = (window.__ENV_BRIDGE__ = window.__ENV_BRIDGE__ || {});
  if (!BR || typeof BR !== 'object') throw new Error('WorkerBootstrap: __ENV_BRIDGE__ missing');

  if (!Object.prototype.hasOwnProperty.call(BR, 'urls')) {
    Object.defineProperty(BR, 'urls', { value: {}, writable: false, configurable: false });
  }
  if (!BR.urls || typeof BR.urls !== 'object') throw new Error('WorkerBootstrap: BR.urls missing');

  const core = BR.inlinePatch;
  if (typeof core !== 'string' || !core) throw new Error('WorkerBootstrap: inlinePatch missing');

  // Create URLs only once (idempotent)
  if (!BR.urls.workerPatchClassic) {
    BR.urls.workerPatchClassic = URL.createObjectURL(new Blob([core], { type: 'text/javascript' }));
  }
  if (!BR.urls.workerPatchModule) {
    BR.urls.workerPatchModule = URL.createObjectURL(
      new Blob(['/*module*/\n', core, '\nexport {};\n'], { type: 'text/javascript' })
    );
  }

  if (typeof BR.urls.workerPatchClassic !== 'string' || !BR.urls.workerPatchClassic) {
    throw new Error('WorkerBootstrap: bad workerPatchClassic url');
  }
  if (typeof BR.urls.workerPatchModule !== 'string' || !BR.urls.workerPatchModule) {
    throw new Error('WorkerBootstrap: bad workerPatchModule url');
  }

  Object.freeze(BR.urls);

  function boot() {
    const H = window.WorkerPatchHooks;
    if (!H || typeof H.initAll !== 'function') return; // wait until ready

    const emitBootstrapDegrade = (code, err, extra) => {
      const d = window.__DEGRADE__;
      if (typeof d !== 'function') return;
      const e = err instanceof Error ? err : new Error(String(err || code));
      const ctx = Object.assign({
        type: 'pipeline missing data',
        stage: 'apply',
        module: 'worker_bootstrap',
        surface: 'WorkerPatchHooks.initAll',
        key: 'initAll',
        policy: 'throw',
        action: 'throw'
      }, extra || null);
      if (typeof d.diag === 'function') {
        d.diag('error', code, ctx, e);
        return;
      }
      d(code, e, ctx);
    };

    // Context preconditions: this bootstrap is injected into every new document
    // (including error/non-secure documents). Only run strict worker init when
    // the runtime can provide UA-CH HE in a secure context.
    try {
      if (window.isSecureContext === false) {
        if (typeof window.__DEGRADE__ === 'function') {
          window.__DEGRADE__('worker_bootstrap:context_ineligible', new Error('WorkerBootstrap: non-secure context'), {
            secureContext: window.isSecureContext,
            href: (window.location && typeof window.location.href === 'string') ? window.location.href : null
          });
        }
        return;
      }
      const nav = window.navigator;
      const uad = nav && nav.userAgentData;
      if (!uad || typeof uad.getHighEntropyValues !== 'function') {
        if (typeof window.__DEGRADE__ === 'function') {
          window.__DEGRADE__('worker_bootstrap:context_ineligible', new Error('WorkerBootstrap: userAgentData unavailable'), {
            secureContext: window.isSecureContext,
            href: (window.location && typeof window.location.href === 'string') ? window.location.href : null
          });
        }
        return;
      }
    } catch (e) {
      emitBootstrapDegrade('worker_bootstrap:context:preflight:unstable', e, {
        stage: 'preflight',
        surface: 'window',
        key: 'context_checks'
      });
      // fail-safe: do not start strict init when context checks are unstable
      return;
    }

    try {
      const initPromise = H.initAll({ publishHE: true });
      if (initPromise && typeof initPromise.then === 'function') {
        initPromise
          .then(() => {
            console.info('[DIAG.postBoot]', H.diag && H.diag());
          })
          .catch((e) => {
            emitBootstrapDegrade('worker_bootstrap:initAll:apply:failed', e);
          });
        return;
      }
      // Post-bootstrap diagnostics: confirm wrappers are installed after initAll().
      console.info('[DIAG.postBoot]', H.diag && H.diag());
    } catch (e) {
      emitBootstrapDegrade('worker_bootstrap:initAll:apply:failed', e);
      throw e;
    }
  }

  if ('WorkerPatchHooks' in window && window.WorkerPatchHooks && typeof window.WorkerPatchHooks.initAll === 'function') {
    boot();
  } else {
    let _h;
    Object.defineProperty(window, 'WorkerPatchHooks', {
      configurable: true,
      get() { return _h; },
      set(v) { _h = v; boot(); }
    });
  }
})();
//# sourceURL=worker_bootstrap_init.js

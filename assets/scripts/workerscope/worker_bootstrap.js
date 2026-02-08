(() => {
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
    H.initAll({ publishHE: true });
    // Post-bootstrap diagnostics: confirm wrappers are installed after initAll().
    console.info('[DIAG.postBoot]', H.diag && H.diag());
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

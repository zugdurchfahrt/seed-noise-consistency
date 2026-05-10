(() => {
  'use strict';

  const G = (typeof globalThis !== 'undefined' && globalThis)
    || (typeof self !== 'undefined' && self)
    || (typeof window !== 'undefined' && window)
    || {};
  const W = (typeof window !== 'undefined' && window) ? window : null;
  const __MODULE = 'worker_bootstrap';
  const __SURFACE = 'worker_bootstrap';

  function __resolveCanvasPatchContext() {
    const C = (W && W.FernwehContext && (typeof W.FernwehContext === 'object' || typeof W.FernwehContext === 'function'))
      ? W.FernwehContext
      : null;
    return C;
  }

  function __resolveLoggerDegrade() {
    const C = __resolveCanvasPatchContext();
    const loggerRoot = (C && C.__logger && typeof C.__logger === 'object')
      ? C.__logger
      : null;
    return (loggerRoot && typeof loggerRoot.__DEGRADE__ === 'function')
      ? loggerRoot.__DEGRADE__
      : null;
  }

  function __setHiddenValue(obj, key, value) {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return value;
    const desc = Object.getOwnPropertyDescriptor(obj, key);
    if (desc && desc.configurable === false) {
      if (Object.prototype.hasOwnProperty.call(desc, 'value')) return desc.value;
      return value;
    }
    Object.defineProperty(obj, key, {
      value: value,
      writable: true,
      configurable: true,
      enumerable: false
    });
    return value;
  }

  function __ensureWrkStateRoot() {
    const C = __resolveCanvasPatchContext();
    const stateRoot = (C && C.state && typeof C.state === 'object')
      ? C.state
      : null;
    if (!stateRoot) return null;
    let wrkState = (stateRoot.__WRK__ && typeof stateRoot.__WRK__ === 'object')
      ? stateRoot.__WRK__
      : null;
    return wrkState;
  }

  function __ensureWorkerBootstrapState() {
    const wrkState = __ensureWrkStateRoot();
    if (!wrkState) return null;
    let state = (wrkState.bootstrap && typeof wrkState.bootstrap === 'object')
      ? wrkState.bootstrap
      : null;
    if (!state) {
      state = __setHiddenValue(wrkState, 'bootstrap', Object.create(null));
    }
    return state;
  }

  function __syncWorkerBootstrapState(patch) {
    const state = __ensureWorkerBootstrapState();
    if (!state || !patch || typeof patch !== 'object') return false;
    const keys = Object.keys(patch);
    for (let i = 0; i < keys.length; i++) {
      state[keys[i]] = patch[keys[i]];
    }
    return true;
  }

  function __ensureWrkRuntimeRoot() {
    const wrkState = __ensureWrkStateRoot();
    if (!wrkState) return null;
    const wrkRuntime = (wrkState.runtime && typeof wrkState.runtime === 'object')
      ? wrkState.runtime
      : null;
    return wrkRuntime;
  }

  function __syncWrkRuntime(patch) {
    const runtimeRoot = __ensureWrkRuntimeRoot();
    if (!runtimeRoot || !patch || typeof patch !== 'object') return false;
    const keys = Object.keys(patch);
    for (let i = 0; i < keys.length; i++) {
      runtimeRoot[keys[i]] = patch[keys[i]];
    }
    return true;
  }

  function __ensureWrkHooksRoot() {
    const wrkState = __ensureWrkStateRoot();
    if (!wrkState) return null;
    const wrkHooks = (wrkState.hooks && typeof wrkState.hooks === 'object')
      ? wrkState.hooks
      : null;
    return wrkHooks;
  }

  function __captureWorkerPatchHooks(hooks) {
    const hooksRoot = __ensureWrkHooksRoot();
    if (!hooksRoot || !hooks || typeof hooks !== 'object' || typeof hooks.initAll !== 'function') return null;
    __setHiddenValue(hooksRoot, 'WorkerPatchHooks', hooks);
    __syncWrkRuntime({ workerPatchHooksReady: true });
    return hooks;
  }

  function __resolveWorkerPatchHooks() {
    const hooksRoot = __ensureWrkHooksRoot();
    const ownedHooks = (hooksRoot && hooksRoot.WorkerPatchHooks && typeof hooksRoot.WorkerPatchHooks === 'object' && typeof hooksRoot.WorkerPatchHooks.initAll === 'function')
      ? hooksRoot.WorkerPatchHooks
      : null;
    if (ownedHooks) return ownedHooks;
    return null;
  }

  function __resolveInlineWorkerSources() {
    const runtimeRoot = __ensureWrkRuntimeRoot();
    const inlinePatch = (runtimeRoot && typeof runtimeRoot.inlinePatch === 'string' && runtimeRoot.inlinePatch)
      ? runtimeRoot.inlinePatch
      : null;
    const inlineReflect = (runtimeRoot && typeof runtimeRoot.inlineReflect === 'string' && runtimeRoot.inlineReflect)
      ? runtimeRoot.inlineReflect
      : null;
    return { inlinePatch, inlineReflect };
  }

  function __emit(level, code, ctx, err) {
    try {
      // lazy lookup: logger-space may be installed later in the pipeline than this script runs
      const d = __resolveLoggerDegrade();
      const diag = (d && typeof d.diag === 'function') ? d.diag.bind(d) : null;
      if (diag) return diag(level, code, ctx, err);
      if (typeof d === 'function') {
        const safeCtx = (ctx && typeof ctx === 'object') ? ctx : {};
        const safeErr = (err === undefined || err === null) ? null : err;
        return d(code, safeErr, Object.assign({}, safeCtx, { level: level || 'info' }));
      }
    } catch (emitErr) {
      return undefined;
    }
    return undefined;
  }

  function __moduleDiag(level, code, extra, err) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    return __emit(level, code, {
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

  function __releaseGuard(token, rollbackOk) {
    try {
      const core = G && G.Core;
      if (!token || !core || typeof core.releaseGuardFlag !== 'function') return false;
      return core.releaseGuardFlag('__PATCH_WORKER_BOOTSTRAP__', token, rollbackOk, __MODULE);
    } catch (releaseErr) {
      __moduleDiag('warn', __MODULE + ':guard_release_failed', {
        stage: 'guard',
        key: 'guard',
        message: 'releaseGuardFlag failed',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_failed' }
      }, releaseErr);
      return false;
    }
  }

  try {
    if (!W || (typeof W !== 'object' && typeof W !== 'function')) {
      throw new Error('WorkerBootstrap: window missing');
    }
    const inlineSources = __resolveInlineWorkerSources();
    const core = inlineSources.inlinePatch;
    if (typeof core !== 'string' || !core) {
      const err = new Error('WorkerBootstrap: inlinePatch missing');
      __moduleDiag('error', __MODULE + ':inline_patch_missing', {
        stage: 'preflight',
        key: 'inlinePatch',
        message: 'inlinePatch missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'inline_patch_missing' }
      }, err);
      throw err;
    }
    const reflectSource = inlineSources.inlineReflect;
    if (typeof reflectSource !== 'string' || !reflectSource) {
      const err = new Error('WorkerBootstrap: inlineReflect missing');
      __moduleDiag('error', __MODULE + ':inline_reflect_missing', {
        stage: 'preflight',
        key: 'inlineReflect',
        message: 'inlineReflect missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'inline_reflect_missing' }
      }, err);
      throw err;
    }

    const __workerPatchUrls = Object.create(null);
    if (!__workerPatchUrls.workerPatchClassic) {
      __workerPatchUrls.workerPatchClassic = URL.createObjectURL(new Blob([core], { type: 'text/javascript' }));
    }
    if (!__workerPatchUrls.workerPatchModule) {
      __workerPatchUrls.workerPatchModule = URL.createObjectURL(
        new Blob(['/*module*/\n', core, '\nexport {};\n'], { type: 'text/javascript' })
      );
    }

    if (typeof __workerPatchUrls.workerPatchClassic !== 'string' || !__workerPatchUrls.workerPatchClassic) {
      const err = new Error('WorkerBootstrap: bad workerPatchClassic url');
      __moduleDiag('error', __MODULE + ':classic_url_bad', {
        stage: 'contract',
        key: 'workerPatchClassic',
        message: 'workerPatchClassic url invalid',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'classic_url_bad' }
      }, err);
      throw err;
    }
    if (typeof __workerPatchUrls.workerPatchModule !== 'string' || !__workerPatchUrls.workerPatchModule) {
      const err = new Error('WorkerBootstrap: bad workerPatchModule url');
      __moduleDiag('error', __MODULE + ':module_url_bad', {
        stage: 'contract',
        key: 'workerPatchModule',
        message: 'workerPatchModule url invalid',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'module_url_bad' }
      }, err);
      throw err;
    }

    Object.freeze(__workerPatchUrls);
    __syncWrkRuntime({
      inlinePatch: core,
      inlineReflect: reflectSource,
      workerPatchClassic: __workerPatchUrls.workerPatchClassic,
      workerPatchModule: __workerPatchUrls.workerPatchModule,
      workerPatchUrlsReady: true,
      workerPatchHooksReady: false
    });
    __syncWorkerBootstrapState({
      urls: __workerPatchUrls,
      inlinePatchReady: true,
      inlineReflectReady: true
    });

    function boot() {
      const H = __resolveWorkerPatchHooks();
      if (!H || typeof H.initAll !== 'function') return;

      const __workerBootstrapState = __ensureWorkerBootstrapState();
      if (!__workerBootstrapState) {
        const err = new Error('WorkerBootstrap: FernwehContext.state.__WRK__.bootstrap unavailable');
        __moduleDiag('error', __MODULE + ':state_missing', {
          stage: 'preflight',
          key: 'FernwehContext.state.__WRK__.bootstrap',
          message: 'worker bootstrap module-state unavailable',
          type: 'pipeline missing data',
          data: { outcome: 'throw', reason: 'state_missing' }
        }, err);
        throw err;
      }
      __syncWrkRuntime({
        inlinePatch: core,
        inlineReflect: reflectSource,
        workerPatchClassic: __workerPatchUrls.workerPatchClassic,
        workerPatchModule: __workerPatchUrls.workerPatchModule,
        workerPatchUrlsReady: true,
        workerPatchHooks: H,
        workerPatchHooksReady: true
      });
      __syncWorkerBootstrapState({
        urls: __workerPatchUrls,
        inlinePatchReady: true,
        inlineReflectReady: true,
        initRequested: true
      });

      const __core = W.Core;
      let __guardToken = null;
      try {
        if (!__core || typeof __core.guardFlag !== 'function') {
          __moduleDiag('warn', __MODULE + ':guard_missing', {
            stage: 'guard',
            key: 'guard',
            message: 'Core.guardFlag missing',
            type: 'pipeline missing data',
            data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
          }, null);
          return;
        }
        __guardToken = __core.guardFlag('__PATCH_WORKER_BOOTSTRAP__', __MODULE);
      } catch (e) {
        __moduleDiag('warn', __MODULE + ':guard_failed', {
          stage: 'guard',
          key: 'guard',
          message: 'guardFlag threw',
          type: 'pipeline missing data',
          data: { outcome: 'skip', reason: 'guard_failed' }
        }, e);
        return;
      }
      if (!__guardToken) return;

      try {
        if (W.isSecureContext === false) {
          __moduleDiag('warn', __MODULE + ':context_ineligible', {
            stage: 'preflight',
            key: 'context_checks',
            message: 'non-secure context',
            type: 'browser structure missing data',
            data: {
              outcome: 'skip',
              reason: 'context_ineligible',
              secureContext: W.isSecureContext,
              href: (W.location && typeof W.location.href === 'string') ? W.location.href : null
            }
          }, new Error('WorkerBootstrap: non-secure context'));
          __syncWorkerBootstrapState({ initRequested: false, initStatus: 'skipped', initReason: 'context_ineligible' });
          __releaseGuard(__guardToken, true);
          return;
        }

        const nav = W.navigator;
        const uad = nav && nav.userAgentData;
        if (!uad || typeof uad.getHighEntropyValues !== 'function') {
          __moduleDiag('warn', __MODULE + ':context_ineligible', {
            stage: 'preflight',
            key: 'context_checks',
            message: 'userAgentData unavailable',
            type: 'browser structure missing data',
            data: {
              outcome: 'skip',
              reason: 'context_ineligible',
              secureContext: W.isSecureContext,
              href: (W.location && typeof W.location.href === 'string') ? W.location.href : null
            }
          }, new Error('WorkerBootstrap: userAgentData unavailable'));
          __syncWorkerBootstrapState({ initRequested: false, initStatus: 'skipped', initReason: 'context_ineligible' });
          __releaseGuard(__guardToken, true);
          return;
        }
      } catch (e) {
          __moduleDiag('warn', __MODULE + ':context_preflight_unstable', {
            stage: 'preflight',
            key: 'context_checks',
          message: 'context checks unstable',
          type: 'browser structure missing data',
            data: { outcome: 'skip', reason: 'context_preflight_unstable' }
          }, e);
          __syncWorkerBootstrapState({ initRequested: false, initStatus: 'skipped', initReason: 'context_preflight_unstable' });
          __releaseGuard(__guardToken, true);
          return;
        }

      try {
        const initPromise = H.initAll({ publishHE: true });
        if (initPromise && typeof initPromise.then === 'function') {
          initPromise
            .then(() => {
              __syncWorkerBootstrapState({ initStatus: 'ready', initReason: 'ready' });
              __moduleDiag('info', __MODULE + ':ready', {
                stage: 'apply',
                key: 'initAll',
                message: 'initAll resolved',
                  type: 'pipeline missing data',
                  data: { outcome: 'return', reason: 'ready' }
                }, null);
              })
              .catch((e) => {
                __syncWorkerBootstrapState({ initStatus: 'error', initReason: 'ready_failed' });
                __moduleDiag('error', __MODULE + ':ready_failed', {
                  stage: 'apply',
                  key: 'initAll',
                message: 'initAll rejected',
                  type: 'browser structure missing data',
                  data: { outcome: 'throw', reason: 'ready_failed', rollbackOk: false }
                }, e);
                __releaseGuard(__guardToken, false);
              });
          return;
        }

        __syncWorkerBootstrapState({ initStatus: 'ready', initReason: 'ready' });
        __moduleDiag('info', __MODULE + ':ready', {
          stage: 'apply',
          key: 'initAll',
          message: 'initAll completed',
          type: 'pipeline missing data',
          data: { outcome: 'return', reason: 'ready' }
        }, null);
      } catch (e) {
        __syncWorkerBootstrapState({ initStatus: 'error', initReason: 'ready_failed' });
        __moduleDiag('error', __MODULE + ':ready_failed', {
          stage: 'apply',
          key: 'initAll',
          message: 'initAll threw',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'ready_failed', rollbackOk: false }
        }, e);
        __releaseGuard(__guardToken, false);
        throw e;
      }
    }

    const hooks = __resolveWorkerPatchHooks();
    if (!hooks) {
      const err = new Error('WorkerBootstrap: WorkerPatchHooks missing');
      __moduleDiag('error', __MODULE + ':hooks_missing', {
        stage: 'preflight',
        key: 'FernwehContext.state.__WRK__.hooks.WorkerPatchHooks',
        message: 'WorkerPatchHooks missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'hooks_missing' }
      }, err);
      throw err;
    }
    boot();
  } catch (e) {
    __moduleDiag('error', __MODULE + ':fatal', {
      stage: 'apply',
      key: null,
      message: 'worker bootstrap fatal',
      type: 'browser structure missing data',
      data: { outcome: 'throw', reason: 'fatal' }
    }, e);
    throw e;
  }
})();
//# sourceURL=worker_bootstrap_init.js

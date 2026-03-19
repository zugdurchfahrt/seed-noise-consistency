(() => {
  'use strict';

  const G = (typeof globalThis !== 'undefined' && globalThis)
    || (typeof self !== 'undefined' && self)
    || (typeof window !== 'undefined' && window)
    || {};
  const __MODULE = 'worker_bootstrap';
  const __SURFACE = 'worker_bootstrap';

  function __emit(level, code, ctx, err) {
    try {
      // lazy lookup: __DEGRADE__ may be installed later in the pipeline than this script runs
      const d = G && G.__DEGRADE__;
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
        key: '__PATCH_WORKER_BOOTSTRAP__',
        message: 'releaseGuardFlag failed',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_failed' }
      }, releaseErr);
      return false;
    }
  }

  try {
    const bridgeDesc = Object.getOwnPropertyDescriptor(window, '__ENV_BRIDGE__');
    let BR = bridgeDesc
      ? (Object.prototype.hasOwnProperty.call(bridgeDesc, 'value') ? bridgeDesc.value : window.__ENV_BRIDGE__)
      : window.__ENV_BRIDGE__;
    if (BR == null) {
      BR = {};
      Object.defineProperty(window, '__ENV_BRIDGE__', {
        value: BR,
        writable: true,
        configurable: true,
        enumerable: false
      });
    } else if (typeof BR !== 'object') {
      const err = new Error('WorkerBootstrap: __ENV_BRIDGE__ missing');
      __moduleDiag('error', __MODULE + ':bridge_missing', {
        stage: 'preflight',
        key: '__ENV_BRIDGE__',
        message: '__ENV_BRIDGE__ missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'bridge_missing' }
      }, err);
      throw err;
    } else if (!bridgeDesc) {
      Object.defineProperty(window, '__ENV_BRIDGE__', {
        value: BR,
        writable: true,
        configurable: true,
        enumerable: false
      });
    } else if (bridgeDesc.enumerable !== false) {
      if (bridgeDesc.configurable === false) {
        const err = new Error('WorkerBootstrap: __ENV_BRIDGE__ non-configurable enumerable');
        __moduleDiag('error', __MODULE + ':bridge_descriptor_invalid', {
          stage: 'contract',
          key: '__ENV_BRIDGE__',
          message: '__ENV_BRIDGE__ non-configurable enumerable',
          type: 'contract violation',
          data: { outcome: 'throw', reason: 'bridge_descriptor_invalid' }
        }, err);
        throw err;
      }
      if (Object.prototype.hasOwnProperty.call(bridgeDesc, 'value')) {
        Object.defineProperty(window, '__ENV_BRIDGE__', {
          value: BR,
          writable: !!bridgeDesc.writable,
          configurable: true,
          enumerable: false
        });
      } else {
        Object.defineProperty(window, '__ENV_BRIDGE__', {
          get: bridgeDesc.get,
          set: bridgeDesc.set,
          configurable: true,
          enumerable: false
        });
      }
    }
    if (!BR || typeof BR !== 'object') {
      const err = new Error('WorkerBootstrap: __ENV_BRIDGE__ missing');
      __moduleDiag('error', __MODULE + ':bridge_missing', {
        stage: 'preflight',
        key: '__ENV_BRIDGE__',
        message: '__ENV_BRIDGE__ missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'bridge_missing' }
      }, err);
      throw err;
    }

    if (!Object.prototype.hasOwnProperty.call(BR, 'urls')) {
      Object.defineProperty(BR, 'urls', { value: {}, writable: false, configurable: false });
    }
    if (!BR.urls || typeof BR.urls !== 'object') {
      const err = new Error('WorkerBootstrap: BR.urls missing');
      __moduleDiag('error', __MODULE + ':urls_missing', {
        stage: 'preflight',
        key: 'urls',
        message: 'bridge urls missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'urls_missing' }
      }, err);
      throw err;
    }

    const core = BR.inlinePatch;
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

    if (!BR.urls.workerPatchClassic) {
      BR.urls.workerPatchClassic = URL.createObjectURL(new Blob([core], { type: 'text/javascript' }));
    }
    if (!BR.urls.workerPatchModule) {
      BR.urls.workerPatchModule = URL.createObjectURL(
        new Blob(['/*module*/\n', core, '\nexport {};\n'], { type: 'text/javascript' })
      );
    }

    if (typeof BR.urls.workerPatchClassic !== 'string' || !BR.urls.workerPatchClassic) {
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
    if (typeof BR.urls.workerPatchModule !== 'string' || !BR.urls.workerPatchModule) {
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

    Object.freeze(BR.urls);

    function boot() {
      const H = window.WorkerPatchHooks;
      if (!H || typeof H.initAll !== 'function') return;

      const __core = window.Core;
      let __guardToken = null;
      try {
        if (!__core || typeof __core.guardFlag !== 'function') {
          __moduleDiag('warn', __MODULE + ':guard_missing', {
            stage: 'guard',
            key: '__PATCH_WORKER_BOOTSTRAP__',
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
          key: '__PATCH_WORKER_BOOTSTRAP__',
          message: 'guardFlag threw',
          type: 'pipeline missing data',
          data: { outcome: 'skip', reason: 'guard_failed' }
        }, e);
        return;
      }
      if (!__guardToken) return;

      try {
        if (window.isSecureContext === false) {
          __moduleDiag('warn', __MODULE + ':context_ineligible', {
            stage: 'preflight',
            key: 'context_checks',
            message: 'non-secure context',
            type: 'browser structure missing data',
            data: {
              outcome: 'skip',
              reason: 'context_ineligible',
              secureContext: window.isSecureContext,
              href: (window.location && typeof window.location.href === 'string') ? window.location.href : null
            }
          }, new Error('WorkerBootstrap: non-secure context'));
          __releaseGuard(__guardToken, true);
          return;
        }

        const nav = window.navigator;
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
              secureContext: window.isSecureContext,
              href: (window.location && typeof window.location.href === 'string') ? window.location.href : null
            }
          }, new Error('WorkerBootstrap: userAgentData unavailable'));
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
        __releaseGuard(__guardToken, true);
        return;
      }

      try {
        const initPromise = H.initAll({ publishHE: true });
        if (initPromise && typeof initPromise.then === 'function') {
          initPromise
            .then(() => {
              __moduleDiag('info', __MODULE + ':initAll_return', {
                stage: 'apply',
                key: 'initAll',
                message: 'initAll resolved',
                type: 'pipeline missing data',
                data: { outcome: 'return' }
              }, null);
            })
            .catch((e) => {
              __moduleDiag('error', __MODULE + ':initAll_failed', {
                stage: 'apply',
                key: 'initAll',
                message: 'initAll rejected',
                type: 'browser structure missing data',
                data: { outcome: 'throw', reason: 'initAll_failed', rollbackOk: false }
              }, e);
            });
          return;
        }

        __moduleDiag('info', __MODULE + ':initAll_return', {
          stage: 'apply',
          key: 'initAll',
          message: 'initAll completed',
          type: 'pipeline missing data',
          data: { outcome: 'return' }
        }, null);
      } catch (e) {
        __moduleDiag('error', __MODULE + ':initAll_failed', {
          stage: 'apply',
          key: 'initAll',
          message: 'initAll threw',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'initAll_failed', rollbackOk: false }
        }, e);
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
        set(v) {
          _h = v;

          // one-shot: accept the first valid hooks object, run boot(), then replace accessor
          // with a plain value property to prevent re-entry in the same document.
          if (v && typeof v === 'object' && typeof v.initAll === 'function') {
            try {
              Object.defineProperty(window, 'WorkerPatchHooks', {
                value: v,
                writable: true,
                configurable: true,
                enumerable: false
              });
            } catch (e) {
              __moduleDiag('warn', __MODULE + ':hooks_lock_failed', {
                stage: 'guard',
                key: 'WorkerPatchHooks',
                message: 'failed to lock WorkerPatchHooks to plain property',
                type: 'browser structure missing data',
                data: { outcome: 'skip', reason: 'hooks_lock_failed' }
              }, e);
            }
            boot();
            return;
          }

          __moduleDiag('warn', __MODULE + ':hooks_invalid', {
            stage: 'preflight',
            key: 'WorkerPatchHooks',
            message: 'WorkerPatchHooks set to invalid value; waiting for valid initAll',
            type: 'pipeline missing data',
            data: { outcome: 'skip', reason: 'hooks_invalid' }
          }, null);
        }
      });
    }
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

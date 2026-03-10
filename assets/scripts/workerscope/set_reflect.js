    
      // === env-worker-bridge (главный бандл) ===
(function workerInit(self){
  // бАЗОВАЯ ПРОВЕРКА WorkerGlobalScope НЕ УБИРАТЬ
  const IS_WORKER =
    typeof WorkerGlobalScope !== 'undefined' &&
    self instanceof WorkerGlobalScope;

    if (!IS_WORKER) return;

    const BR = (globalThis.__ENV_BRIDGE__ = globalThis.__ENV_BRIDGE__ || {});

    const G = (typeof globalThis !== 'undefined' && globalThis)
        || (typeof self       !== 'undefined' && self)
        || (typeof window     !== 'undefined' && window)
        || (typeof global     !== 'undefined' && global)
        || {};
    if (typeof self==='undefined' || typeof WorkerGlobalScope==='undefined' || !(self instanceof WorkerGlobalScope)) {
      throw new Error('UworkerInit: not in WorkerGlobalScope');
    }

    const __MODULE = 'wrk_BRIDGE';
    const __SURFACE = 'wrk_BRIDGE';
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

      
      
  try {
    const nativeGetOwnProp = Object.getOwnPropertyDescriptor;
    const fpToStringDesc = nativeGetOwnProp(Function.prototype, 'toString');
    const currentToString = fpToStringDesc && fpToStringDesc.value;

    // [NORMATIVE] single core bridge state (no module-local WeakMap holders)
    const existingCoreToStringState = self && self.__CORE_TOSTRING_STATE__;
    const existingCoreToStringStateOk = !!(existingCoreToStringState
      && existingCoreToStringState.__CORE_TOSTRING_STATE__ === true
      && typeof existingCoreToStringState.nativeToString === 'function'
      && (existingCoreToStringState.overrideMap instanceof WeakMap)
      && (existingCoreToStringState.proxyTargetMap instanceof WeakMap));

    const toStringOverrideMap = existingCoreToStringStateOk
      ? existingCoreToStringState.overrideMap
      : new WeakMap();
    const toStringProxyTargetMap = existingCoreToStringStateOk
      ? existingCoreToStringState.proxyTargetMap
      : new WeakMap();

    const currentRealmToString = (typeof currentToString === 'function')
      ? currentToString
      : Function.prototype.toString;

      function resolveToStringBridgeTarget(candidate) {
        if (typeof candidate !== 'function') return null;
        var bridgeTarget = candidate;
        var seenBridgeTargets = new WeakSet();
        while (typeof bridgeTarget === 'function') {
          if (seenBridgeTargets.has(bridgeTarget)) {
            try {
              var d0 = self && self.__DEGRADE__;
              if (typeof d0 === 'function') {
                var ctx0 = {
                  type: 'contract violation',
                  stage: 'preflight',
                  module: 'wrk',
                  diagTag: 'wrk',
                  surface: 'worker_bootstrap',
                  key: 'Function.prototype.toString',
                  message: 'Function.prototype.toString bridge candidate cycle',
                  data: { outcome: 'return', reason: 'bridge_candidate_cycle', fallback: 'current_realm_toString' }
                };
                if (typeof d0.diag === 'function') d0.diag('warn', 'wrk:toString_bridge_candidate_cycle', ctx0, null);
                else d0('wrk:toString_bridge_candidate_cycle', null, Object.assign({}, ctx0, { level: 'warn' }));
              }
            } catch (_e0) {}
            return null;
          }
          seenBridgeTargets.add(bridgeTarget);
          var nextTarget = toStringProxyTargetMap.get(bridgeTarget);
          if (typeof nextTarget !== 'function') break;
          bridgeTarget = nextTarget;
        }
        return (typeof bridgeTarget === 'function') ? bridgeTarget : null;
      }

      const nativeToString = existingCoreToStringStateOk
        ? existingCoreToStringState.nativeToString
        : (resolveToStringBridgeTarget(currentRealmToString) || null);
      if (typeof nativeToString !== 'function') {
        throw new Error('UACHPatch: Function.prototype.toString missing');
      }

      function publishCoreToStringState() {
        try {
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
        } catch (eState) {
          __wrkDiag('error', 'wrk:core_tostring_state_define_failed', {
            stage: 'apply',
            key: '__CORE_TOSTRING_STATE__',
            message: 'failed to define __CORE_TOSTRING_STATE__',
            type: 'pipeline missing data',
            data: { outcome: 'throw' }
          }, eState);
          throw eState;
        }
      }

      if (!existingCoreToStringStateOk) {
        publishCoreToStringState();
      }

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
    } catch (e) {
      self.__ENV_SEED_ERROR__ = String((e && (e.stack || e.message)) || e);
      throw e;
    }
    __wrkDiag('info', 'wrk:worker_function.prototype_state_ready', {
      stage: 'apply',
      key: 'function.prototype_state',
      message: 'function.prototype_state ready',
      type: 'pipeline missing data',
      data: { outcome: 'return' }
    }, null);

    // reduce visibility of pipeline globals in Window realm (non-enumerable)
    try {
      const win = G;
      if (win && (typeof win === 'object' || typeof win === 'function')) {
        const keys = [
          '__ENV_BRIDGE__',
          'CanvasPatchContext'
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
  ;
})(self); // <-- закрыли WrkModule

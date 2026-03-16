    
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

      function __throwWrapFactoryPreflight(code, key, message, err) {
        __wrkDiag('error', code, {
          stage: 'preflight',
          key: (typeof key === 'string' && key) ? key : null,
          message: message,
          type: 'contract violation',
          data: { outcome: 'throw' }
        }, err);
        throw err;
      }

      function __requireMarkAsNative(key, wrapperName) {
        const ensure = (self && typeof self.__ensureMarkAsNative === 'function') ? self.__ensureMarkAsNative : null;
        const m = ensure ? ensure() : null;
        if (typeof m !== 'function') {
          const e = new Error('[WrkBridge] markAsNative missing');
          __throwWrapFactoryPreflight(
            'wrk:wrap_factory:mark_missing',
            key,
            (wrapperName || 'wrapFactory') + ': markAsNative missing',
            e
          );
        }
        return m;
      }

      function __resolveWrappedBridgeTarget(nativeFn, wrapperName) {
        let bridgeTarget = (nativeFn && typeof nativeFn.__coreBridgeTarget__ === 'function')
          ? nativeFn.__coreBridgeTarget__
          : nativeFn;
        const seenBridgeTargets = new WeakSet();
        while (typeof bridgeTarget === 'function') {
          if (seenBridgeTargets.has(bridgeTarget)) {
            throw new Error('[WrkBridge] ' + wrapperName + ': proxyTargetMap cycle');
          }
          seenBridgeTargets.add(bridgeTarget);
          const nextTarget = toStringProxyTargetMap.get(bridgeTarget);
          if (typeof nextTarget !== 'function') break;
          bridgeTarget = nextTarget;
        }
        if (typeof bridgeTarget !== 'function') {
          throw new TypeError('[WrkBridge] ' + wrapperName + ': bridge target must be function');
        }
        return bridgeTarget;
      }

      function __exportWrapFactory(exportName, exportValue) {
        const hasOwnExport = Object.prototype.hasOwnProperty.call(self, exportName);
        if (!hasOwnExport || typeof self[exportName] !== 'function') {
          if (hasOwnExport && typeof self[exportName] !== 'function') {
            __wrkDiag('warn', 'wrk:export_conflict', {
              stage: 'contract',
              key: exportName,
              message: 'export conflict: existing own property is not a function; overwriting',
              type: 'contract violation',
              data: { outcome: 'return', typeof: typeof self[exportName] }
            }, null);
          }
          Object.defineProperty(self, exportName, {
            value: exportValue,
            writable: true,
            configurable: true,
            enumerable: false
          });
        }
      }

      function __wrapNativeApply(nativeFn, name, applyImpl) {
        if (typeof nativeFn !== 'function') {
          const e = new TypeError('[WrkBridge] __wrapNativeApply: nativeFn must be function');
          __throwWrapFactoryPreflight('wrk:wrapNativeApply:bad_nativeFn', name, '__wrapNativeApply: nativeFn must be function', e);
        }
        if (typeof applyImpl !== 'function') {
          const e = new TypeError('[WrkBridge] __wrapNativeApply: applyImpl must be function');
          __throwWrapFactoryPreflight('wrk:wrapNativeApply:bad_applyImpl', name, '__wrapNativeApply: applyImpl must be function', e);
        }
        const markAsNative = __requireMarkAsNative(name || (nativeFn && nativeFn.name) || null, 'wrapNativeApply');
        const wrapped = new Proxy(nativeFn, {
          apply(target, thisArg, argList) {
            return applyImpl(target, thisArg, argList);
          }
        });
        try {
          const bridgeTarget = __resolveWrappedBridgeTarget(nativeFn, '__wrapNativeApply');
          toStringProxyTargetMap.set(wrapped, bridgeTarget);
          const wrappedName = name || nativeFn.name || '';
          const nativeName = bridgeTarget.name || '';
          markAsNative(bridgeTarget, nativeName);
          const wrappedLabel = wrappedName
            ? ('function ' + wrappedName + '() { [native code] }')
            : 'function () { [native code] }';
          toStringOverrideMap.set(wrapped, wrappedLabel);
          if (toStringProxyTargetMap.get(wrapped) !== bridgeTarget || toStringOverrideMap.get(wrapped) !== wrappedLabel) {
            throw new Error('[WrkBridge] __wrapNativeApply: bridge registration failed');
          }
        } catch (e) {
          __wrkDiag('error', 'wrk:wrapNativeApply:mark_failed', {
            stage: 'apply',
            key: (typeof name === 'string' && name) ? name : (nativeFn && nativeFn.name ? String(nativeFn.name) : null),
            message: '__wrapNativeApply mark/bridge registration failed',
            type: 'browser structure missing data',
            data: { outcome: 'throw' }
          }, e);
          throw e;
        }
        return wrapped;
      }

      function __wrapNativeAccessor(origGetOrSet, name, applyImpl) {
        if (typeof origGetOrSet !== 'function') {
          const e = new TypeError('[WrkBridge] __wrapNativeAccessor: origGetOrSet must be function');
          __throwWrapFactoryPreflight('wrk:wrapNativeAccessor:bad_origGetOrSet', name, '__wrapNativeAccessor: origGetOrSet must be function', e);
        }
        if (typeof applyImpl !== 'function') {
          const e = new TypeError('[WrkBridge] __wrapNativeAccessor: applyImpl must be function');
          __throwWrapFactoryPreflight('wrk:wrapNativeAccessor:bad_applyImpl', name, '__wrapNativeAccessor: applyImpl must be function', e);
        }
        return __wrapNativeApply(origGetOrSet, name, applyImpl);
      }

      function __wrapNativeCtor(nativeFn, name, argsImpl) {
        if (typeof nativeFn !== 'function') {
          const e = new TypeError('[WrkBridge] __wrapNativeCtor: nativeFn must be function');
          __throwWrapFactoryPreflight('wrk:wrapNativeCtor:bad_nativeFn', name || '__wrapNativeCtor', '__wrapNativeCtor: nativeFn must be function', e);
        }
        if (typeof argsImpl !== 'function') {
          const e = new TypeError('[WrkBridge] __wrapNativeCtor: argsImpl must be function');
          __throwWrapFactoryPreflight('wrk:wrapNativeCtor:bad_argsImpl', name || '__wrapNativeCtor', '__wrapNativeCtor: argsImpl must be function', e);
        }
        const markAsNative = __requireMarkAsNative(name || (nativeFn && nativeFn.name) || '__wrapNativeCtor', 'wrapNativeCtor');
        const wrapped = new Proxy(nativeFn, {
          apply(target, thisArg, argList) {
            const nextArgs = argsImpl(argList || [], false);
            return Reflect.apply(target, thisArg, nextArgs);
          },
          construct(target, argList, newTarget) {
            const nextArgs = argsImpl(argList || [], true);
            return Reflect.construct(target, nextArgs, newTarget || target);
          }
        });
        try {
          const bridgeTarget = __resolveWrappedBridgeTarget(nativeFn, '__wrapNativeCtor');
          toStringProxyTargetMap.set(wrapped, bridgeTarget);
          const wrappedName = name || nativeFn.name || '';
          const nativeName = bridgeTarget.name || '';
          markAsNative(bridgeTarget, nativeName);
          const wrappedLabel = wrappedName
            ? ('function ' + wrappedName + '() { [native code] }')
            : 'function () { [native code] }';
          toStringOverrideMap.set(wrapped, wrappedLabel);
          if (toStringProxyTargetMap.get(wrapped) !== bridgeTarget || toStringOverrideMap.get(wrapped) !== wrappedLabel) {
            throw new Error('[WrkBridge] __wrapNativeCtor: bridge registration failed');
          }
        } catch (e) {
          __wrkDiag('error', 'wrk:wrapNativeCtor:mark_failed', {
            stage: 'apply',
            key: '__wrapNativeCtor',
            message: '__wrapNativeCtor native mark/bridge registration failed',
            type: 'apply_failed',
            data: { outcome: 'throw' }
          }, e);
          throw e;
        }
        return wrapped;
      }

      function __wrapStrictAccessor(key, getter, desc, validThis, options) {
        if (typeof key !== 'string' || !key) {
          const e = new TypeError('[WrkBridge] __wrapStrictAccessor: key must be non-empty string');
          __throwWrapFactoryPreflight('wrk:wrapStrictAccessor:bad_key', null, '__wrapStrictAccessor: key must be non-empty string', e);
        }
        const opts = options || {};
        const onAccess = (typeof opts.onAccess === 'function') ? opts.onAccess : null;
        const name = (typeof opts.name === 'string' && opts.name) ? opts.name : ('get ' + key);
        const isData = !!desc && Object.prototype.hasOwnProperty.call(desc, 'value') && !desc.get && !desc.set;
        if (isData) return getter;

        const markAsNative = __requireMarkAsNative(name || key, 'wrapStrictAccessor');
        const valueFromGetter = function(thisArg) {
          return (typeof getter === 'function') ? getter.call(thisArg) : getter;
        };
        const checkThis = (typeof validThis === 'function') ? validThis : null;
        const origGet = desc && desc.get;
        const syntheticBridgeTarget = (typeof origGet === 'function')
          ? origGet
          : ((typeof getter === 'function' && typeof getter.__coreBridgeTarget__ === 'function')
              ? getter.__coreBridgeTarget__
              : ((typeof getter === 'function') ? toStringProxyTargetMap.get(getter) : null));
        const nativeBridgeTarget = (typeof syntheticBridgeTarget === 'function')
          ? __resolveWrappedBridgeTarget(syntheticBridgeTarget, '__wrapStrictAccessor')
          : null;

        let wrapped;
        const synthetic = Object.getOwnPropertyDescriptor(({ get [key]() {
          if (onAccess) onAccess(key, wrapped, this);
          if (checkThis && !checkThis(this)) {
            if (typeof nativeBridgeTarget === 'function') {
              return Reflect.apply(nativeBridgeTarget, this, []);
            }
            throw new TypeError();
          }
          return valueFromGetter(this);
        }}), key).get;
        if (typeof nativeBridgeTarget === 'function') {
          Object.defineProperty(synthetic, '__coreBridgeTarget__', {
            value: nativeBridgeTarget,
            writable: false,
            configurable: true,
            enumerable: false
          });
        }
        wrapped = markAsNative(synthetic, name);
        return wrapped;
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
      __exportWrapFactory('__wrapNativeApply', __wrapNativeApply);
      __exportWrapFactory('__wrapNativeAccessor', __wrapNativeAccessor);
      __exportWrapFactory('__wrapStrictAccessor', __wrapStrictAccessor);
      __exportWrapFactory('__wrapNativeCtor', __wrapNativeCtor);
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

})(self); // <-- закрыли WrkModule

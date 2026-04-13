    
      // === env-worker-bridge (главный бандл) ===
(function workerInit(self){
  // бАЗОВАЯ ПРОВЕРКА WorkerGlobalScope НЕ УБИРАТЬ
  const IS_WORKER =
    typeof WorkerGlobalScope !== 'undefined' &&
    self instanceof WorkerGlobalScope;

    if (!IS_WORKER) return;

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
        if (self && (typeof self.__ENV_SEED_ERROR__ !== 'string' || !self.__ENV_SEED_ERROR__)) {
          self.__ENV_SEED_ERROR__ = String((emitErr && (emitErr.stack || emitErr.message)) || emitErr);
        }
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

  function __ensureWorkerCanvasPatchContext() {
    const existing = (self && self.CanvasPatchContext && typeof self.CanvasPatchContext === 'object')
      ? self.CanvasPatchContext
      : null;
    return existing || __setHiddenValue(self, 'CanvasPatchContext', Object.create(null));
  }

  function __ensureWorkerWrkRuntimeRoot() {
    const C = __ensureWorkerCanvasPatchContext();
    if (!C) return null;
    const stateRoot = (C.state && typeof C.state === 'object')
      ? C.state
      : __setHiddenValue(C, 'state', Object.create(null));
    if (!stateRoot) return null;
    const wrkState = (stateRoot.__WRK__ && typeof stateRoot.__WRK__ === 'object')
      ? stateRoot.__WRK__
      : __setHiddenValue(stateRoot, '__WRK__', Object.create(null));
    if (!wrkState) return null;
    const wrkRuntime = (wrkState.runtime && typeof wrkState.runtime === 'object')
      ? wrkState.runtime
      : null;
    return wrkRuntime || __setHiddenValue(wrkState, 'runtime', Object.create(null));
  }

  function __isCoreToStringStateOk(state) {
    return !!(state
      && state.__CORE_TOSTRING_STATE__ === true
      && typeof state.nativeToString === 'function'
      && (state.overrideMap instanceof WeakMap)
      && (state.proxyTargetMap instanceof WeakMap));
  }

      
      
  try {
    const nativeGetOwnProp = Object.getOwnPropertyDescriptor;
    const fpToStringDesc = nativeGetOwnProp(Function.prototype, 'toString');
    const currentToString = fpToStringDesc && fpToStringDesc.value;
    const currentRealmToString = (typeof currentToString === 'function')
      ? currentToString
      : Function.prototype.toString;

    // [NORMATIVE] single core bridge state lives in owner-route; self-key is compatibility fallback only.
    const __wrkRuntimeRoot = __ensureWorkerWrkRuntimeRoot();

    function resolveToStringBridgeTarget(candidate, bridgeRegistry) {
      if (typeof candidate !== 'function') return null;
      let bridgeTarget = candidate;
      const seenBridgeTargets = new WeakSet();
      while (typeof bridgeTarget === 'function') {
        if (seenBridgeTargets.has(bridgeTarget)) {
          __wrkDiag('warn', 'wrk:toString_bridge_candidate_cycle', {
            stage: 'preflight',
            key: 'Function.prototype.toString',
            message: 'Function.prototype.toString bridge candidate cycle',
            type: 'contract violation',
            data: { outcome: 'return', reason: 'bridge_candidate_cycle', fallback: 'current_realm_toString' }
          }, new Error('[WrkBridge] Function.prototype.toString bridge candidate cycle'));
          return null;
        }
        seenBridgeTargets.add(bridgeTarget);
        const nextTarget = (bridgeRegistry instanceof WeakMap)
          ? bridgeRegistry.get(bridgeTarget)
          : undefined;
        if (typeof nextTarget !== 'function') break;
        bridgeTarget = nextTarget;
      }
      return (typeof bridgeTarget === 'function') ? bridgeTarget : null;
    }

    function validateCoreToStringStateCandidate(state, sourceName) {
      if (!__isCoreToStringStateOk(state)) return null;
      const source = (typeof sourceName === 'string' && sourceName) ? sourceName : 'coreToStringState';
      const stateBridgeTarget = resolveToStringBridgeTarget(state.nativeToString, state.proxyTargetMap);
      const currentBridgeTarget = resolveToStringBridgeTarget(currentRealmToString, state.proxyTargetMap)
        || ((typeof currentRealmToString === 'function') ? currentRealmToString : null);
      if (typeof stateBridgeTarget !== 'function' || typeof currentBridgeTarget !== 'function') {
        __wrkDiag('warn', 'wrk:toString_state_rejected', {
          stage: 'preflight',
          key: 'Function.prototype.toString',
          message: 'shared toString state rejected because bridge target is missing',
          type: 'contract violation',
          data: {
            outcome: 'return',
            source: source,
            reason: 'bridge_target_missing'
          }
        }, new Error('[WrkBridge] shared toString state bridge target missing'));
        return null;
      }
      if (stateBridgeTarget !== currentBridgeTarget) {
        __wrkDiag('warn', 'wrk:toString_state_rejected', {
          stage: 'preflight',
          key: 'Function.prototype.toString',
          message: 'shared toString state rejected because realm baseline mismatched',
          type: 'contract violation',
          data: {
            outcome: 'return',
            source: source,
            reason: 'realm_baseline_mismatch'
          }
        }, new Error('[WrkBridge] shared toString state realm mismatch'));
        return null;
      }
      return state;
    }

    const ownedCoreToStringState = validateCoreToStringStateCandidate(
      (__wrkRuntimeRoot && __wrkRuntimeRoot.__CORE_TOSTRING_STATE__) ? __wrkRuntimeRoot.__CORE_TOSTRING_STATE__ : null,
      'CanvasPatchContext.state.__WRK__.runtime.__CORE_TOSTRING_STATE__'
    );
    let sharedCoreToStringState = ownedCoreToStringState || null;

    const toStringOverrideMap = sharedCoreToStringState
      ? sharedCoreToStringState.overrideMap
      : new WeakMap();
    const toStringProxyTargetMap = sharedCoreToStringState
      ? sharedCoreToStringState.proxyTargetMap
      : new WeakMap();

    const nativeToStringCandidate = sharedCoreToStringState
      ? sharedCoreToStringState.nativeToString
      : currentRealmToString;
    const nativeToString = resolveToStringBridgeTarget(nativeToStringCandidate, toStringProxyTargetMap)
      || resolveToStringBridgeTarget(currentRealmToString, toStringProxyTargetMap)
      || null;
    if (typeof nativeToString !== 'function') {
      throw new Error('UACHPatch: Function.prototype.toString missing');
    }

    function publishCoreToStringState() {
      const nextState = {
        __CORE_TOSTRING_STATE__: true,
        nativeToString: nativeToString,
        overrideMap: toStringOverrideMap,
        proxyTargetMap: toStringProxyTargetMap
      };
      try {
        if (!__wrkRuntimeRoot) {
          throw new Error('worker bridge runtime root missing');
        }
        __setHiddenValue(__wrkRuntimeRoot, '__CORE_TOSTRING_STATE__', nextState);
      } catch (eState) {
        __wrkDiag('error', 'wrk:core_tostring_state_owner_define_failed', {
          stage: 'apply',
          key: 'CanvasPatchContext.state.__WRK__.runtime.__CORE_TOSTRING_STATE__',
          message: 'failed to define owner-route __CORE_TOSTRING_STATE__',
          type: 'pipeline missing data',
          data: { outcome: 'throw' }
        }, eState);
        throw eState;
      }
      return nextState;
    }

    // Compatibility-only label primitive: do not native-label source-text-observable JS functions.
    function baseMarkAsNative(func, name = "") {
      if (typeof func !== 'function') return func;
      try {
        const hasOwnBridgeTarget = (typeof func.__coreBridgeTarget__ === 'function');
        if (!hasOwnBridgeTarget) {
          const bridgeErr = new Error('[set_reflect] markAsNative requires __coreBridgeTarget__');
          __wrkDiag('error', 'wrk:mark_as_native_bridge_missing', {
            stage: 'preflight',
            key: 'Function.prototype.toString',
            message: 'markAsNative requires __coreBridgeTarget__',
            type: 'contract_violation',
            data: { outcome: 'throw' }
          }, bridgeErr);
          throw bridgeErr;
        }
        const currentSource = Reflect.apply(nativeToString, func, []);
        if (typeof currentSource === 'string' && currentSource.indexOf('[native code]') === -1) {
          return func;
        }
        const bridgeTarget = __resolveWrappedBridgeTarget(func.__coreBridgeTarget__, 'baseMarkAsNative');
        const nativeName = name || bridgeTarget.name || func.name || "";
        const label = nativeName
          ? ('function ' + nativeName + '() { [native code] }')
          : 'function () { [native code] }';
        if (bridgeTarget !== func) {
          const bridgeLabel = bridgeTarget.name
            ? ('function ' + bridgeTarget.name + '() { [native code] }')
            : 'function () { [native code] }';
          toStringOverrideMap.set(bridgeTarget, bridgeLabel);
        }
        toStringOverrideMap.set(func, label);
      } catch (e) {
        __wrkDiag('error', 'wrk:WeakMap.set', {
          stage: 'apply',
          key: 'Function.prototype.toString',
          message: 'WeakMap.set failed in toString override map',
          type: 'apply_failed',
          data: { outcome: 'throw' }
        }, e);
        throw e;
      }
      return func;
    }

    let memoMarkAsNative = null;
    function ensureMarkAsNative() {
      if (memoMarkAsNative) return memoMarkAsNative;
      memoMarkAsNative = baseMarkAsNative;
      return memoMarkAsNative;
    }

    function resolveNativeLabel(candidate) {
      if (typeof candidate !== 'function') return null;
      if (toStringOverrideMap.has(candidate)) {
        const ownLabel = toStringOverrideMap.get(candidate);
        if (typeof ownLabel === 'string' && ownLabel) return ownLabel;
      }
      let current = candidate;
      const seen = new WeakSet();
      while (typeof current === 'function') {
        if (seen.has(current)) {
          __wrkDiag('warn', 'wrk:toString_bridge_cycle', {
            stage: 'runtime',
            key: 'Function.prototype.toString',
            message: 'toString bridge cycle detected during label resolution',
            type: 'contract violation',
            data: { outcome: 'return' }
          }, new Error('[WrkBridge] toString bridge cycle'));
          return null;
        }
        seen.add(current);
        const next = toStringProxyTargetMap.get(current);
        if (typeof next !== 'function') break;
        current = next;
        if (toStringOverrideMap.has(current)) {
          const nextLabel = toStringOverrideMap.get(current);
          if (typeof nextLabel === 'string' && nextLabel) return nextLabel;
        }
      }
      return null;
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
      const ensure = (typeof ensureMarkAsNative === 'function') ? ensureMarkAsNative : null;
      const markAsNative = ensure ? ensure() : null;
      if (typeof markAsNative !== 'function') {
        const e = new Error('[WrkBridge] markAsNative missing');
        __throwWrapFactoryPreflight(
          'wrk:' + wrapperName + ':mark_missing',
          key,
          wrapperName + ': markAsNative missing',
          e
        );
      }
      return markAsNative;
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

    function __registerToStringWrapper(wrapped, nativeFn, wrappedName, wrapperName) {
      const bridgeTarget = __resolveWrappedBridgeTarget(nativeFn, wrapperName);
      const wrappedLabel = wrappedName
        ? ('function ' + wrappedName + '() { [native code] }')
        : 'function () { [native code] }';
      const nativeName = bridgeTarget.name || '';
      const bridgeLabel = nativeName
        ? ('function ' + nativeName + '() { [native code] }')
        : 'function () { [native code] }';
      toStringOverrideMap.set(bridgeTarget, bridgeLabel);
      toStringProxyTargetMap.set(wrapped, bridgeTarget);
      toStringOverrideMap.set(wrapped, wrappedLabel);
      if (Object.getPrototypeOf(wrapped) !== Object.getPrototypeOf(nativeFn)) {
        throw new Error('[WrkBridge] ' + wrapperName + ': function prototype chain mismatch');
      }
      if (toStringOverrideMap.get(bridgeTarget) !== bridgeLabel
          || toStringProxyTargetMap.get(wrapped) !== bridgeTarget
          || toStringOverrideMap.get(wrapped) !== wrappedLabel) {
        throw new Error('[WrkBridge] ' + wrapperName + ': bridge registration failed');
      }
      return wrapped;
    }

    {
      const currentProto = Object.getPrototypeOf(currentRealmToString);
      const nativeProto = Object.getPrototypeOf(nativeToString);
      const shouldPublishCoreToStringState = !sharedCoreToStringState || ownedCoreToStringState !== sharedCoreToStringState;
      try {
        if (currentProto !== nativeProto) {
          throw new Error('[WrkBridge] Function.prototype.toString prototype bridge mismatch');
        }
        if (currentRealmToString !== nativeToString) {
          Object.defineProperty(Function.prototype, 'toString', {
            value: nativeToString,
            writable: !!fpToStringDesc.writable,
            configurable: !!fpToStringDesc.configurable,
            enumerable: !!fpToStringDesc.enumerable
          });
        }
        const installedToStringDesc = nativeGetOwnProp(Function.prototype, 'toString');
        const installedToString = installedToStringDesc && installedToStringDesc.value;
        if (installedToString !== nativeToString) {
          throw new Error('[WrkBridge] Function.prototype.toString native restore post-check failed');
        }
        if (shouldPublishCoreToStringState) {
          sharedCoreToStringState = publishCoreToStringState();
        }
      } catch (e) {
        __wrkDiag('error', 'wrk:toString_install_failed', {
          stage: 'preflight',
          key: 'Function.prototype.toString',
          message: 'Function.prototype.toString install failed',
          type: 'contract violation',
          data: { outcome: 'throw' }
        }, e);
        throw e;
      }
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
      if (toStringProxyTargetMap.has(nativeFn) && toStringProxyTargetMap.get(nativeFn) !== nativeFn) {
        const e = new TypeError('[WrkBridge] __wrapNativeApply: nativeFn already wrapped');
        __throwWrapFactoryPreflight('wrk:wrapNativeApply:double_wrap', name, '__wrapNativeApply: nativeFn already wrapped', e);
      }
      if (typeof applyImpl !== 'function') {
        const e = new TypeError('[WrkBridge] __wrapNativeApply: applyImpl must be function');
        __throwWrapFactoryPreflight('wrk:wrapNativeApply:bad_applyImpl', name, '__wrapNativeApply: applyImpl must be function', e);
      }
      __requireMarkAsNative(name || (nativeFn && nativeFn.name) || null, 'wrapNativeApply');
      const wrapped = new Proxy(nativeFn, {
        apply(target, thisArg, argList) {
          try {
            return applyImpl(target, thisArg, argList);
          } catch (e) {
            __wrkDiag('error', 'wrk:wrapNativeApply:runtime_failed', {
              stage: 'runtime',
              key: (typeof name === 'string' && name) ? name : (nativeFn && nativeFn.name ? String(nativeFn.name) : null),
              message: '__wrapNativeApply apply trap failed',
              type: 'apply_failed',
              data: { outcome: 'throw' }
            }, e);
            throw e;
          }
        }
      });
      try {
        __registerToStringWrapper(wrapped, nativeFn, name || nativeFn.name || "", '__wrapNativeApply');
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
      if (toStringProxyTargetMap.has(nativeFn) && toStringProxyTargetMap.get(nativeFn) !== nativeFn) {
        const e = new TypeError('[WrkBridge] __wrapNativeCtor: nativeFn already wrapped');
        __throwWrapFactoryPreflight('wrk:wrapNativeCtor:double_wrap', name || '__wrapNativeCtor', '__wrapNativeCtor: nativeFn already wrapped', e);
      }
      if (typeof argsImpl !== 'function') {
        const e = new TypeError('[WrkBridge] __wrapNativeCtor: argsImpl must be function');
        __throwWrapFactoryPreflight('wrk:wrapNativeCtor:bad_argsImpl', name || '__wrapNativeCtor', '__wrapNativeCtor: argsImpl must be function', e);
      }
      __requireMarkAsNative(name || (nativeFn && nativeFn.name) || '__wrapNativeCtor', 'wrapNativeCtor');
      const wrapped = new Proxy(nativeFn, {
        apply(target, thisArg, argList) {
          let nextArgs;
          try {
            nextArgs = argsImpl(argList || [], false);
          } catch (e) {
            __wrkDiag('error', 'wrk:wrapNativeCtor:args_failed', {
              stage: 'runtime',
              key: (typeof name === 'string' && name) ? name : (nativeFn && nativeFn.name ? String(nativeFn.name) : '__wrapNativeCtor'),
              message: '__wrapNativeCtor argsImpl failed in apply trap',
              type: 'apply_failed',
              data: { outcome: 'throw', path: 'apply' }
            }, e);
            throw e;
          }
          if (!Array.isArray(nextArgs)) {
            const e = new TypeError('[WrkBridge] __wrapNativeCtor: argsImpl must return array');
            __wrkDiag('error', 'wrk:wrapNativeCtor:args_shape_invalid', {
              stage: 'runtime',
              key: (typeof name === 'string' && name) ? name : (nativeFn && nativeFn.name ? String(nativeFn.name) : '__wrapNativeCtor'),
              message: '__wrapNativeCtor argsImpl returned non-array',
              type: 'contract violation',
              data: { outcome: 'throw', path: 'apply' }
            }, e);
            throw e;
          }
          try {
            return Reflect.apply(target, thisArg, nextArgs);
          } catch (e) {
            __wrkDiag('error', 'wrk:wrapNativeCtor:native_throw', {
              stage: 'runtime',
              key: (typeof name === 'string' && name) ? name : (nativeFn && nativeFn.name ? String(nativeFn.name) : '__wrapNativeCtor'),
              message: '__wrapNativeCtor native apply threw',
              type: 'browser structure missing data',
              data: { outcome: 'throw', path: 'apply' }
            }, e);
            throw e;
          }
        },
        construct(target, argList, newTarget) {
          let nextArgs;
          try {
            nextArgs = argsImpl(argList || [], true);
          } catch (e) {
            __wrkDiag('error', 'wrk:wrapNativeCtor:args_failed', {
              stage: 'runtime',
              key: (typeof name === 'string' && name) ? name : (nativeFn && nativeFn.name ? String(nativeFn.name) : '__wrapNativeCtor'),
              message: '__wrapNativeCtor argsImpl failed in construct trap',
              type: 'apply_failed',
              data: { outcome: 'throw', path: 'construct' }
            }, e);
            throw e;
          }
          if (!Array.isArray(nextArgs)) {
            const e = new TypeError('[WrkBridge] __wrapNativeCtor: argsImpl must return array');
            __wrkDiag('error', 'wrk:wrapNativeCtor:args_shape_invalid', {
              stage: 'runtime',
              key: (typeof name === 'string' && name) ? name : (nativeFn && nativeFn.name ? String(nativeFn.name) : '__wrapNativeCtor'),
              message: '__wrapNativeCtor argsImpl returned non-array',
              type: 'contract violation',
              data: { outcome: 'throw', path: 'construct' }
            }, e);
            throw e;
          }
          try {
            return Reflect.construct(target, nextArgs, newTarget || target);
          } catch (e) {
            __wrkDiag('error', 'wrk:wrapNativeCtor:native_throw', {
              stage: 'runtime',
              key: (typeof name === 'string' && name) ? name : (nativeFn && nativeFn.name ? String(nativeFn.name) : '__wrapNativeCtor'),
              message: '__wrapNativeCtor native construct threw',
              type: 'browser structure missing data',
              data: { outcome: 'throw', path: 'construct' }
            }, e);
            throw e;
          }
        }
      });
      try {
        __registerToStringWrapper(wrapped, nativeFn, name || nativeFn.name || "", '__wrapNativeCtor');
        if (Object.prototype.hasOwnProperty.call(nativeFn, 'prototype') && wrapped.prototype !== nativeFn.prototype) {
          throw new Error('[WrkBridge] __wrapNativeCtor: constructor prototype mismatch');
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

      const valueFromGetter = function(thisArg) {
        return (typeof getter === 'function') ? getter.call(thisArg) : getter;
      };
      const checkThis = (typeof validThis === 'function') ? validThis : null;
      const origGet = desc && desc.get;

      if (typeof origGet === 'function') {
        let wrapped = null;
        wrapped = __wrapNativeAccessor(origGet, name, function (target, thisArg, argList) {
          if (onAccess) onAccess(key, wrapped, thisArg);
          if (checkThis && !checkThis(thisArg)) {
            return Reflect.apply(origGet, thisArg, []);
          }
          return valueFromGetter(thisArg);
        });
        return wrapped;
      }

      const e = new Error('[WrkBridge] __wrapStrictAccessor: synthetic strict accessor path forbidden without native getter');
      __throwWrapFactoryPreflight(
        'wrk:wrapStrictAccessor:synthetic_path_forbidden',
        key,
        '__wrapStrictAccessor: synthetic strict accessor path forbidden without native getter',
        e
      );
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
      const seedProbe = function seedProbe(){};
      Object.defineProperty(seedProbe, '__coreBridgeTarget__', {
        value: nativeToString,
        writable: true,
        configurable: true,
        enumerable: false
      });
      const seedProbeSource = Reflect.apply(nativeToString, seedProbe, []);
      markAsNative(seedProbe, 'toString');
      if (typeof toStringOverrideMap.get(seedProbe) === 'string') {
        throw new Error('UACHPatch: source-text toString probe must stay unlabeled');
      }
      if (Reflect.apply(Function.prototype.toString, seedProbe, []) !== seedProbeSource) {
        throw new Error('UACHPatch: source-text toString probe forwarding mismatch');
      }
      toStringProxyTargetMap.delete(seedProbe);
      toStringOverrideMap.delete(seedProbe);
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

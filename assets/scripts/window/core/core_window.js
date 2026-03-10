const CoreWindowModule = function CoreWindowModule(window) {
  'use strict';

  const C = window.CanvasPatchContext;
  const G = (typeof globalThis !== 'undefined' && globalThis)
        || (typeof self       !== 'undefined' && self)
        || (typeof window     !== 'undefined' && window)
        || (typeof global     !== 'undefined' && global)
        || {};
     

  if (!window || (typeof window !== 'object' && typeof window !== 'function')) {
    throw new Error('[CoreWindow] window missing');
  }
  if (window.__CORE_WINDOW_LOADED__) return;

  // [MANDATORY MODULE PRELUDE] [NORMATIVE] unified adapter to window.__DEGRADE__ (module_NORMATIVE_align.md)
  const __D = (window && window.__DEGRADE__) || null;
  const __diag = (__D && typeof __D.diag === 'function') ? __D.diag.bind(__D) : null;
  const __emit = (level, code, ctx, err) => {
    try {
      const _err = (typeof err === 'undefined') ? null : err;
      if (__diag) return __diag(level, code, ctx || null, _err);
      if (typeof __D === 'function') {
        const extra = (ctx && typeof ctx === 'object') ? Object.assign({ level }, ctx) : (ctx || { level });
        return __D(code, _err, extra || null);
      }
    } catch (emitErr) {
      return undefined;
    }
    return undefined;
  };
  const __exit = (level, code, ctx, ret) => (__emit(level, code, ctx, null), ret);
  const __throw = (code, ctx, err) => (__emit('error', code, ctx, err), (() => { throw err; })());

  // --- nativization provider  ---
  function safeDefine(obj, prop, descriptor) {
    try {
      Object.defineProperty(obj, prop, descriptor);
    } catch (e) {
      const key = (typeof prop === 'string') ? prop : ((prop === null || typeof prop === 'undefined') ? null : String(prop));
      const targetOk = !!(obj && (typeof obj === 'object' || typeof obj === 'function'));
      __throw("core_window:safeDefine:define_failed", {
        module: "core_window",
        diagTag: "core_window",
        surface: "core_window",
        key,
        stage: targetOk ? "apply" : "guard",
        message: targetOk ? "Object.defineProperty failed in safeDefine" : "safeDefine target missing",
        type: targetOk ? "browser structure missing data" : "pipeline missing data",
        data: targetOk
          ? { outcome: "throw" }
          : { outcome: "throw", targetType: (obj === null) ? "null" : typeof obj }
      }, e);
    }
  }

  if (typeof window.__safeDefine !== 'function') {
    safeDefine(window, '__safeDefine', {
      value: safeDefine,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }

  // ——— Global mask "native" + general WeakMap ———
  const nativeGetOwnProp = Object.getOwnPropertyDescriptor;
  const fpToStringDesc = nativeGetOwnProp(Function.prototype, 'toString');
  const existingToString = fpToStringDesc && fpToStringDesc.value;

  const existingCoreToStringState = window && window.__CORE_TOSTRING_STATE__;
  const existingCoreToStringStateOk = !!(existingCoreToStringState
    && existingCoreToStringState.__CORE_TOSTRING_STATE__ === true
    && typeof existingCoreToStringState.nativeToString === 'function'
    && (existingCoreToStringState.overrideMap instanceof WeakMap)
    && (existingCoreToStringState.proxyTargetMap instanceof WeakMap));

  let sharedCoreToStringState = existingCoreToStringStateOk ? existingCoreToStringState : null;
  let sharedCoreToStringStateOk = existingCoreToStringStateOk;
  if (!sharedCoreToStringStateOk) {
    try {
      const parentWin = window && window.parent;
      if (parentWin && parentWin !== window) {
        const parentState = parentWin.__CORE_TOSTRING_STATE__;
        const parentOk = !!(parentState
          && parentState.__CORE_TOSTRING_STATE__ === true
          && typeof parentState.nativeToString === 'function'
          && (parentState.overrideMap instanceof WeakMap)
          && (parentState.proxyTargetMap instanceof WeakMap));
        if (parentOk) {
          sharedCoreToStringState = parentState;
          sharedCoreToStringStateOk = true;
        }
      }
    } catch (e) {
      __emit('warn', 'core_window:toString_parent_state_access_failed', {
        module: 'core',
        diagTag: 'core_window',
        surface: 'core',
        key: '__CORE_TOSTRING_STATE__',
        stage: 'preflight',
        message: 'parent state access failed',
        type: 'browser structure missing data',
        data: { outcome: 'return', fallback: 'local' }
      }, e);
    }
  }

  const toStringOverrideMap = sharedCoreToStringStateOk
    ? sharedCoreToStringState.overrideMap
    : new WeakMap();
  const toStringProxyTargetMap = sharedCoreToStringStateOk
    ? sharedCoreToStringState.proxyTargetMap
    : new WeakMap();

  const currentRealmToString = (typeof existingToString === 'function')
    ? existingToString
    : Function.prototype.toString;

  function resolveToStringBridgeTarget(candidate) {
    if (typeof candidate !== 'function') return null;
    let bridgeTarget = candidate;
    const seenBridgeTargets = new WeakSet();
    while (typeof bridgeTarget === 'function') {
      if (seenBridgeTargets.has(bridgeTarget)) {
        __emit('warn', 'core_window:toString_native_candidate_cycle', {
          module: 'core',
          diagTag: 'core_window',
          surface: 'core',
          key: 'Function.prototype.toString',
          stage: 'preflight',
          message: 'nativeToString candidate chain cycle detected; fallback to current realm toString',
          type: 'contract violation',
          data: { outcome: 'return', fallback: 'current_realm_toString' }
        }, new Error('[CoreWindow] nativeToString candidate cycle'));
        return null;
      }
      seenBridgeTargets.add(bridgeTarget);
      const nextTarget = toStringProxyTargetMap.get(bridgeTarget);
      if (typeof nextTarget !== 'function') break;
      bridgeTarget = nextTarget;
    }
    return (typeof bridgeTarget === 'function') ? bridgeTarget : null;
  }

  const nativeToStringCandidate = sharedCoreToStringStateOk
    ? sharedCoreToStringState.nativeToString
    : (currentRealmToString || Function.prototype.toString);

  const nativeToString = resolveToStringBridgeTarget(nativeToStringCandidate)
    || resolveToStringBridgeTarget(currentRealmToString)
    || null;

  if (typeof nativeToString !== 'function') {
    throw new Error('[CoreWindow] Function.prototype.toString missing');
  }

  // Unified global function-mask
  function baseMarkAsNative(func, name = "") {
    if (typeof func !== 'function') return func;
    try {
      const t = toStringProxyTargetMap.get(func);
      if (t) func = t;
      const n = name || func.name || "";
      const label = n ? `function ${n}() { [native code] }` : 'function () { [native code] }';
      toStringOverrideMap.set(func, label);
    } catch (e) {
      __emit('error', 'core_window:WeakMap.set', {
        module: 'core',
        diagTag: 'core_window',
        surface: 'core',
        key: 'Function.prototype.toString',
        stage: 'apply',
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

  function publishCoreToStringState() {
    safeDefine(window, '__CORE_TOSTRING_STATE__', {
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
  }


  if (typeof window.__ensureMarkAsNative !== 'function') {
    safeDefine(window, '__ensureMarkAsNative', {
      value: ensureMarkAsNative,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }

  // --- centralized native-shaped wrappers (Proxy/apply) ---
  function __throwWrapFactoryPreflight(code, key, message, err) {
    __throw(code, {
      module: 'core',
      diagTag: 'core_window',
      surface: 'core',
      key: (typeof key === 'string' && key) ? key : null,
      stage: 'preflight',
      message: message,
      type: 'contract violation',
      data: { outcome: 'throw', stx: (err && err.stack) ? String(err.stack) : null }
    }, err);
  }

  function __requireMarkAsNative(key, wrapperName) {
    const ensure = (window && typeof window.__ensureMarkAsNative === 'function') ? window.__ensureMarkAsNative : null;
    const m = ensure ? ensure() : null;
    if (typeof m !== 'function') {
      const e = new Error('[CoreWindow] markAsNative missing');
      __throwWrapFactoryPreflight(
        `core_window:${wrapperName}:mark_missing`,
        key,
        `${wrapperName}: markAsNative missing`,
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
        throw new Error(`[CoreWindow] ${wrapperName}: proxyTargetMap cycle`);
      }
      seenBridgeTargets.add(bridgeTarget);
      const nextTarget = toStringProxyTargetMap.get(bridgeTarget);
      if (typeof nextTarget !== 'function') break;
      bridgeTarget = nextTarget;
    }
    if (typeof bridgeTarget !== 'function') {
      throw new TypeError(`[CoreWindow] ${wrapperName}: bridge target must be function`);
    }
    return bridgeTarget;
  }

  function __exportWrapFactory(exportName, exportValue) {
    const hasOwnExport = Object.prototype.hasOwnProperty.call(window, exportName);
    if (!hasOwnExport || typeof window[exportName] !== 'function') {
      if (hasOwnExport && typeof window[exportName] !== 'function') {
        __emit('warn', 'core_window:export_conflict', {
          module: 'core',
          diagTag: 'core_window',
          surface: 'core',
          key: exportName,
          stage: 'contract',
          message: 'export conflict: existing own property is not a function; overwriting',
          type: 'contract violation',
          data: { outcome: 'return', typeof: typeof window[exportName] }
        }, null);
      }
      safeDefine(window, exportName, {
        value: exportValue,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }
  }

  function __wrapNativeApply(nativeFn, name, applyImpl) {
    if (typeof nativeFn !== 'function') {
      const e = new TypeError('[CoreWindow] __wrapNativeApply: nativeFn must be function');
      __throwWrapFactoryPreflight('core_window:wrapNativeApply:bad_nativeFn', name, '__wrapNativeApply: nativeFn must be function', e);
    }
    if (typeof applyImpl !== 'function') {
      const e = new TypeError('[CoreWindow] __wrapNativeApply: applyImpl must be function');
      __throwWrapFactoryPreflight('core_window:wrapNativeApply:bad_applyImpl', name, '__wrapNativeApply: applyImpl must be function', e);
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
      const wrappedName = name || nativeFn.name || "";
      const nativeName = bridgeTarget.name || "";
      markAsNative(bridgeTarget, nativeName);
      const wrappedLabel = wrappedName
        ? `function ${wrappedName}() { [native code] }`
        : 'function () { [native code] }';
      toStringOverrideMap.set(wrapped, wrappedLabel);
      if (toStringProxyTargetMap.get(wrapped) !== bridgeTarget || toStringOverrideMap.get(wrapped) !== wrappedLabel) {
        throw new Error('[CoreWindow] __wrapNativeApply: bridge registration failed');
      }
    } catch (e) {
      __emit('error', 'core_window:wrapNativeApply:mark_failed', {
        module: 'core',
        diagTag: 'core_window',
        surface: 'core',
        key: (typeof name === 'string' && name) ? name : (nativeFn && nativeFn.name ? String(nativeFn.name) : null),
        stage: 'apply',
        message: '__wrapNativeApply mark/bridge registration failed',
        type: 'browser structure missing data',
        data: { outcome: 'throw', stx: (e && e.stack) ? String(e.stack) : null }
      }, e);
      throw e;
    }
    return wrapped;
  }

  function __wrapNativeCtor(nativeFn, name, argsImpl) {
    if (typeof nativeFn !== 'function') {
      const e = new TypeError('[CoreWindow] __wrapNativeCtor: nativeFn must be function');
      __throwWrapFactoryPreflight('core_window:wrapNativeCtor:bad_nativeFn', name || '__wrapNativeCtor', '__wrapNativeCtor: nativeFn must be function', e);
    }
    if (typeof argsImpl !== 'function') {
      const e = new TypeError('[CoreWindow] __wrapNativeCtor: argsImpl must be function');
      __throwWrapFactoryPreflight('core_window:wrapNativeCtor:bad_argsImpl', name || '__wrapNativeCtor', '__wrapNativeCtor: argsImpl must be function', e);
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
      const wrappedName = name || nativeFn.name || "";
      const nativeName = bridgeTarget.name || "";
      markAsNative(bridgeTarget, nativeName);
      const wrappedLabel = wrappedName
        ? `function ${wrappedName}() { [native code] }`
        : 'function () { [native code] }';
      toStringOverrideMap.set(wrapped, wrappedLabel);
      if (toStringProxyTargetMap.get(wrapped) !== bridgeTarget || toStringOverrideMap.get(wrapped) !== wrappedLabel) {
        throw new Error('[CoreWindow] __wrapNativeCtor: bridge registration failed');
      }
    } catch (e) {
      __emit('error', 'core_window:wrapNativeCtor:mark_failed', {
        module: 'core',
        diagTag: 'core_window',
        surface: 'core',
        key: '__wrapNativeCtor',
        stage: 'apply',
        message: '__wrapNativeCtor native mark/bridge registration failed',
        type: 'apply_failed',
        data: { outcome: 'throw' }
      }, e);
      throw e;
    }
    return wrapped;
  }

  function __wrapNativeAccessor(origGetOrSet, name, applyImpl) {
    if (typeof origGetOrSet !== 'function') {
      const e = new TypeError('[CoreWindow] __wrapNativeAccessor: origGetOrSet must be function');
      __throwWrapFactoryPreflight('core_window:wrapNativeAccessor:bad_origGetOrSet', name, '__wrapNativeAccessor: origGetOrSet must be function', e);
    }
    if (typeof applyImpl !== 'function') {
      const e = new TypeError('[CoreWindow] __wrapNativeAccessor: applyImpl must be function');
      __throwWrapFactoryPreflight('core_window:wrapNativeAccessor:bad_applyImpl', name, '__wrapNativeAccessor: applyImpl must be function', e);
    }
    return __wrapNativeApply(origGetOrSet, name, applyImpl);
  }

  function __wrapStrictAccessor(key, getter, desc, validThis, options) {
    if (typeof key !== 'string' || !key) {
      const e = new TypeError('[CoreWindow] __wrapStrictAccessor: key must be non-empty string');
      __throwWrapFactoryPreflight('core_window:wrapStrictAccessor:bad_key', null, '__wrapStrictAccessor: key must be non-empty string', e);
    }
    const opts = options || {};
    const onAccess = (typeof opts.onAccess === 'function') ? opts.onAccess : null;
    const name = (typeof opts.name === 'string' && opts.name) ? opts.name : `get ${key}`;
    const isData = !!desc && Object.prototype.hasOwnProperty.call(desc, 'value') && !desc.get && !desc.set;
    if (isData) return getter;

    const valueFromGetter = function (thisArg) {
      return (typeof getter === 'function') ? getter.call(thisArg) : getter;
    };
    const checkThis = (typeof validThis === 'function') ? validThis : null;
    const origGet = desc && desc.get;

    if (typeof origGet === 'function') {
      let wrapped;
      wrapped = __wrapNativeAccessor(origGet, name, function (target, thisArg, argList) {
        if (onAccess) onAccess(key, wrapped, thisArg);
        if (checkThis && !checkThis(thisArg)) {
          return Reflect.apply(target, thisArg, argList || []);
        }
        return valueFromGetter(thisArg);
      });
      return wrapped;
    }

    const syntheticBridgeTarget = (typeof getter === 'function' && typeof getter.__coreBridgeTarget__ === 'function')
      ? getter.__coreBridgeTarget__
      : ((typeof getter === 'function') ? toStringProxyTargetMap.get(getter) : null);
    if (typeof syntheticBridgeTarget !== 'function') {
      const e = new Error('[CoreWindow] __wrapStrictAccessor: synthetic path requires native bridge target');
      __throwWrapFactoryPreflight(
        'core_window:wrapStrictAccessor:synthetic_bridge_missing',
        key,
        '__wrapStrictAccessor: synthetic path requires native bridge target',
        e
      );
    }

    const synthetic = Object.getOwnPropertyDescriptor(({ get [key]() {
      return valueFromGetter(this);
    }}), key).get;
    safeDefine(synthetic, '__coreBridgeTarget__', {
      value: syntheticBridgeTarget,
      writable: false,
      configurable: true,
      enumerable: false
    });
    let wrapped;
    wrapped = __wrapNativeAccessor(synthetic, name, function (target, thisArg, argList) {
      if (onAccess) onAccess(key, wrapped, thisArg);
      if (checkThis && !checkThis(thisArg)) {
        return Reflect.apply(syntheticBridgeTarget, thisArg, argList || []);
      }
      return Reflect.apply(target, thisArg, argList || []);
    });
    return wrapped;
  }

  // [Observed Exit Contract] idempotent export
  try {
    __exportWrapFactory('__wrapNativeApply', __wrapNativeApply);
  } catch (e) {
    __emit('error', 'core_window:export_failed', {
      module: 'core',
      diagTag: 'core_window',
      surface: 'core',
      key: '__wrapNativeApply',
      stage: 'contract',
      message: 'export failed',
      type: 'browser structure missing data',
      data: { outcome: 'return', stx: (e && e.stack) ? String(e.stack) : null }
    }, e);
  }
  {
    __exportWrapFactory('__wrapNativeAccessor', __wrapNativeAccessor);
    __exportWrapFactory('__wrapStrictAccessor', __wrapStrictAccessor);
    __exportWrapFactory('__wrapNativeCtor', __wrapNativeCtor);
  }


  {
    const toStringDesc = nativeGetOwnProp(Function.prototype, 'toString');
    const currentToString = toStringDesc && toStringDesc.value;
    if (typeof currentToString !== 'function') {
      const e = new Error('[CoreWindow] Function.prototype.toString missing');
      __emit('error', 'core_window:toString_missing', {
        module: 'core',
        diagTag: 'core_window',
        surface: 'core',
        key: 'Function.prototype.toString',
        stage: 'preflight',
        message: 'Function.prototype.toString missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw' }
      }, e);
      throw e;
    }

    if (!existingCoreToStringStateOk) {
      publishCoreToStringState();
    }
  }

  // === Core2.0 targets dispatcher (Window scope) ===
  // Methodology: Core controls preflight/dispatch/nativization/diag. Module applies descriptors.
  (function installCoreApplyTargets(){
    function diagDegrade(code, err, extra) {
      try {
        const x = (extra && typeof extra === 'object') ? extra : null;
        const policy = (x && typeof x.policy === 'string') ? x.policy : null;
        const level = (policy === 'skip')
          ? 'warn'
          : ((policy === 'throw' || policy === 'strict')
            ? 'error'
            : ((x && (x.level === 'info' || x.level === 'warn' || x.level === 'error' || x.level === 'fatal')) ? x.level : 'error'));

        const ctx = {
          module: (x && typeof x.module === 'string' && x.module) ? x.module : 'core_window',
          diagTag: (x && typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : 'core_window',
          surface: (x && typeof x.surface === 'string' && x.surface) ? x.surface : 'core',
          key: (x && (typeof x.key === 'string' || x.key === null)) ? x.key : null,
          stage: (x && typeof x.stage === 'string' && x.stage) ? x.stage : 'apply',
          message: (x && typeof x.message === 'string' && x.message) ? x.message : String(code || 'core_window:diag'),
          type: (x && typeof x.type === 'string' && x.type) ? x.type : null,
          data: (x && x.data && typeof x.data === 'object') ? x.data : null
        };
        if (!ctx.data || typeof ctx.data !== 'object') ctx.data = {};
        if (!Object.prototype.hasOwnProperty.call(ctx.data, 'outcome')) {
          ctx.data.outcome = (policy === 'skip')
            ? 'skip'
            : ((policy === 'throw' || policy === 'strict') ? 'throw' : 'return');
        }
        if (policy && !Object.prototype.hasOwnProperty.call(ctx.data, 'policy')) {
          ctx.data.policy = policy;
        }

        return __emit(level, code, ctx, (typeof err === 'undefined') ? null : err);
      } catch (diagErr) {
        return undefined;
      }
    }
    function normalizePolicy(v) {
      if (v === undefined || v === null || v === '') return 'skip';
      if (v === 'skip' || v === 'throw' || v === 'strict') return v;
      return null;
    }
    function cloneDesc(d) {
      if (!d) return null;
      const copy = {};
      if ('configurable' in d) copy.configurable = d.configurable;
      if ('enumerable' in d) copy.enumerable = d.enumerable;
      if ('writable' in d) copy.writable = d.writable;
      if ('value' in d) copy.value = d.value;
      if ('get' in d) copy.get = d.get;
      if ('set' in d) copy.set = d.set;
      return copy;
    }
    function hasAccessorShape(desc) {
      return !!desc && (Object.prototype.hasOwnProperty.call(desc, 'get') || Object.prototype.hasOwnProperty.call(desc, 'set'));
    }
    function hasDataShape(desc) {
      return !!desc && (Object.prototype.hasOwnProperty.call(desc, 'value') || Object.prototype.hasOwnProperty.call(desc, 'writable'));
    }
    function isPromiseLike(v) {
      return !!v && (typeof v === 'object' || typeof v === 'function') && typeof v.then === 'function';
    }
    function normalizeResolveMode(v) {
      return v === 'proto_chain' ? 'proto_chain' : 'own';
    }
    function normalizeInvokeClass(v) {
      if (v === undefined || v === null || v === '') return 'normal';
      if (v === 'normal' || v === 'brand_strict' || v === 'constructor' || v === 'meta_primitive') return v;
      return null;
    }
    function isWrapLayerMissing(v) {
      return v === undefined || v === null || v === '';
    }
    function classifyWrapLayer(v) {
      if (isWrapLayerMissing(v)) return 'wrap_layer_missing';
      if (v === 'auto') return 'wrap_layer_auto_forbidden';
      return 'wrap_layer_unsupported';
    }
    function wrapLayerContractError(code, scope) {
      const prefix = scope === 'wrapGetter' ? '[Core.wrapGetter]' : '[Core.applyTargets]';
      if (code === 'wrap_layer_missing') return new TypeError(prefix + ' wrapLayer missing');
      if (code === 'wrap_layer_auto_forbidden') return new TypeError(prefix + ' wrapLayer auto forbidden');
      return new TypeError(prefix + ' unsupported wrapLayer');
    }
    function normalizeWrapLayer(v) {
      if (isWrapLayerMissing(v)) return null;
      if (v === 'descriptor_only' || v === 'named_wrapper' || v === 'named_wrapper_strict' || v === 'core_wrapper') return v;
      return null;
    }
    function resolveDescriptor(owner, key, options) {
      const opts = options || {};
      const mode = normalizeResolveMode(opts.mode);
      if (!owner || (typeof owner !== 'object' && typeof owner !== 'function')) {
        return { owner: null, desc: null, mode };
      }
      if (typeof key !== 'string' || !key) {
        return { owner: null, desc: null, mode };
      }
      if (mode === 'own') {
        return { owner, desc: Object.getOwnPropertyDescriptor(owner, key) || null, mode };
      }
      let cur = owner;
      while (cur) {
        const d = Object.getOwnPropertyDescriptor(cur, key);
        if (d) return { owner: cur, desc: d, mode };
        cur = Object.getPrototypeOf(cur);
      }
      return { owner: owner, desc: null, mode };
    }
    function sameTargetKey(owner, key) {
      return String(key) + '::' + Object.prototype.toString.call(owner);
    }
    try {
      const existing = window.Core;
      const Core = (existing && (typeof existing === 'object' || typeof existing === 'function'))
        ? existing
        : {};

      const knownWrapped = new WeakSet();
      const globalTargetRegistry = (Core.__targetRegistry instanceof WeakMap) ? Core.__targetRegistry : new WeakMap();
      const __patchGuardSeq = (Core.__patchGuardSeq instanceof WeakMap) ? Core.__patchGuardSeq : new WeakMap();

      function nextGuardToken(flagKey) {
        let n = 0;
        try {
          n = __patchGuardSeq.get(window) || 0;
          n = (n + 1) | 0;
          __patchGuardSeq.set(window, n);
        } catch (e) {
          __emit('warn', 'core_window:nextGuardToken_seq_store_failed', {
            module: 'core',
            diagTag: 'core_window',
            surface: 'core',
            key: '__patchGuardSeq',
            stage: 'guard',
            message: 'guard token WeakMap store failed; using local counter fallback',
            type: 'pipeline missing data',
            data: { outcome: 'return', fallback: 'local_counter' }
          }, e);
          n = ((nextGuardToken.__n || 0) + 1) | 0;
          nextGuardToken.__n = n;
        }
        return `g:${String(flagKey || 'flag')}:${String(n)}`;
      }

      function guardFlag(flagKey, codePrefix) {
        const key = String(flagKey || '');
        if (!key) return null;
        const tag = (typeof codePrefix === 'string' && codePrefix) ? codePrefix : 'core_window';
        try {
          if (window[key]) {
            __emit('info', tag + ':already_patched', {
              module: 'core',
              diagTag: tag,
              surface: 'core',
              key,
              stage: 'guard',
              message: 'already patched (guard)',
              type: 'pipeline missing data',
              data: { outcome: 'skip', reason: 'already_patched' }
            }, null);
            return null;
          }
        } catch (e) {
          __emit('warn', tag + ':guard_exception', {
            module: 'core',
            diagTag: tag,
            surface: 'core',
            key,
            stage: 'guard',
            message: 'guard read failed',
            type: 'pipeline missing data',
            data: { outcome: 'skip', reason: 'guard_exception' }
          }, e);
          return null;
        }
        const token = nextGuardToken(key);
        try {
          Object.defineProperty(window, key, {
            value: token,
            writable: true,
            configurable: true,
            enumerable: false
          });
        } catch (e) {
          __emit('warn', tag + ':guard_write_failed', {
            module: 'core',
            diagTag: tag,
            surface: 'core',
            key,
            stage: 'guard',
            message: 'guard write failed',
            type: 'pipeline missing data',
            data: { outcome: 'skip', reason: 'guard_write_failed' }
          }, e);
          return null;
        }
        return token;
      }

      function releaseGuardFlag(flagKey, token, rollbackOk, codePrefix) {
        const key = String(flagKey || '');
        if (!key) return false;
        if (rollbackOk !== true) return false;
        const tag = (typeof codePrefix === 'string' && codePrefix) ? codePrefix : 'core_window';
        try {
          if (window[key] !== token) return false;
          try {
            delete window[key];
          } catch (deleteErr) {
            try {
              Object.defineProperty(window, key, {
                value: false,
                writable: true,
                configurable: true,
                enumerable: false
              });
            } catch (setErr) {
              __emit('warn', tag + ':guard_release_failed', {
                module: 'core',
                diagTag: tag,
                surface: 'core',
                key,
                stage: 'rollback',
                message: 'guard release failed',
                type: 'pipeline missing data',
                data: { outcome: 'skip', reason: 'guard_release_failed' }
              }, setErr || deleteErr);
              return false;
            }
          }
          if (window[key] === token) {
            __emit('warn', tag + ':guard_release_failed', {
              module: 'core',
              diagTag: tag,
              surface: 'core',
              key,
              stage: 'rollback',
              message: 'guard release failed',
              type: 'pipeline missing data',
              data: { outcome: 'skip', reason: 'guard_release_failed' }
            }, null);
            return false;
          }
          __emit('info', tag + ':guard_released', {
            module: 'core',
            diagTag: tag,
            surface: 'core',
            key,
            stage: 'rollback',
            message: 'guard released after rollback ok',
            type: 'pipeline missing data',
            data: { outcome: 'rollback', reason: 'rollback_ok' }
          }, null);
          return true;
        } catch (e) {
          __emit('warn', tag + ':guard_release_exception', {
            module: 'core',
            diagTag: tag,
            surface: 'core',
            key,
            stage: 'rollback',
            message: 'guard release failed',
            type: 'pipeline missing data',
            data: { outcome: 'skip', reason: 'guard_release_exception' }
          }, e);
          return false;
        }
      }

      function getTargetBucket(owner, create) {
        if (!owner || (typeof owner !== 'object' && typeof owner !== 'function')) return null;
        let bucket = globalTargetRegistry.get(owner);
        if (!bucket && create) {
          bucket = new Set();
          globalTargetRegistry.set(owner, bucket);
        }
        return bucket;
      }

      function isTargetRegistered(owner, key) {
        const bucket = getTargetBucket(owner, false);
        if (!bucket) return false;
        return bucket.has(String(key));
      }

      function registerPatchedTarget(owner, key) {
        const bucket = getTargetBucket(owner, true);
        if (!bucket) return false;
        bucket.add(String(key));
        return true;
      }

      function onInvalidThis(invalidPolicy, origFn, self, args) {
        if (typeof invalidPolicy === 'function') return invalidPolicy.call(self, origFn, args);
        // [NORMATIVE] Keep engine behavior for incompatible receiver:
        // call the original function/getter with the provided receiver and rethrow its exception.
        if (typeof origFn === 'function') {
          try {
            return Reflect.apply(origFn, self, args || []);
          } catch (e) {
            diagDegrade('core:onInvalidThis:native_throw', e, {
              module: 'core_window',
              diagTag: 'core:onInvalidThis',
              surface: 'core',
              key: null,
              stage: 'runtime',
              type: 'browser structure missing data',
              message: 'native invalid-this invocation threw',
              data: {
                outcome: 'throw',
                reason: 'native_throw',
                invalidPolicy: (typeof invalidPolicy === 'string' || invalidPolicy === null) ? invalidPolicy : typeof invalidPolicy
              }
            });
            throw e;
          }
        }
        if (invalidPolicy === 'throw') throw new TypeError();
        throw new TypeError();
      }

      function buildNamedAccessor(key, kind, impl) {
        if (kind === 'get') {
          return Object.getOwnPropertyDescriptor(({ get [key]() { return impl.call(this); } }), key).get;
        }
        return Object.getOwnPropertyDescriptor(({ set [key](v) { return impl.call(this, v); } }), key).set;
      }

      function wrapGetter(key, getter, desc, validThis, opts) {
        const options = opts || {};
        const isData = desc && Object.prototype.hasOwnProperty.call(desc, 'value') && !desc.get && !desc.set;
        if (isData) return getter;
        const origGet = desc && desc.get;
        const invalidThis = options.invalidThis || 'native';
        const checkThis = (typeof validThis === 'function') ? validThis : null;
        const wrapLayerInput = options.wrapLayer;
        let wrapLayer = normalizeWrapLayer(wrapLayerInput);
        if (wrapLayer === null) {
          const code = classifyWrapLayer(wrapLayerInput);
          const e = wrapLayerContractError(code, 'wrapGetter');
          diagDegrade('core:wrapGetter:' + code, e, {
            module: 'core_window',
            diagTag: 'core:wrapGetter',
            surface: 'core',
            key: key || null,
            stage: 'guard',
            type: 'pipeline missing data',
            message: e.message,
            data: { wrapLayer: wrapLayerInput }
          });
          throw e;
        }
        const valueFromGetter = function (thisArg) {
          return (typeof getter === 'function') ? getter.call(thisArg) : getter;
        };

        if (options.mark === false) {
          const namedGet = Object.getOwnPropertyDescriptor(({ get [key]() {
            if (checkThis && !checkThis(this)) {
              return onInvalidThis(invalidThis, origGet, this, arguments);
            }
            return valueFromGetter(this);
          }}), key).get;
          const markAsNative = ensureMarkAsNative();
          const wrapped = markAsNative(namedGet, 'get ' + key);
          knownWrapped.add(wrapped);
          return wrapped;
        }

        // [NORMATIVE] getters may use proxy wrapping only on explicit core_wrapper.
        const useCoreWrapper = wrapLayer === 'core_wrapper';
        if (!useCoreWrapper) {
          const namedGet = Object.getOwnPropertyDescriptor(({ get [key]() {
            if (checkThis && !checkThis(this)) {
              return onInvalidThis(invalidThis, origGet, this, arguments);
            }
            return valueFromGetter(this);
          }}), key).get;
          const markAsNative = ensureMarkAsNative();
          const wrapped = markAsNative(namedGet, 'get ' + key);
          knownWrapped.add(wrapped);
          return wrapped;
        }

        const baseGet = (typeof origGet === 'function')
          ? origGet
          : Object.getOwnPropertyDescriptor(({ get [key]() { return valueFromGetter(this); } }), key).get;

        const wrapped = __wrapNativeAccessor(baseGet, 'get ' + key, function (target, thisArg, argList) {
          if (checkThis && !checkThis(thisArg)) {
            return onInvalidThis(invalidThis, origGet, thisArg, argList || []);
          }
          return valueFromGetter(thisArg);
        });
        knownWrapped.add(wrapped);
        return wrapped;
      }

      function safeDefineAcc(target, key, getter, options) {
        const opts = options || {};
        const enumerable = !!opts.enumerable;
        const validThis = typeof opts.validThis === 'function' ? opts.validThis : null;
        if (!target || (typeof target !== 'object' && typeof target !== 'function')) {
          throw new TypeError('[Core.safeDefineAcc] invalid target for ' + key);
        }
        const d = Object.getOwnPropertyDescriptor(target, key);
        if (d && d.configurable === false) {
          throw new TypeError('[Core.safeDefineAcc] non-configurable ' + key);
        }
        const isData = d && Object.prototype.hasOwnProperty.call(d, 'value') && !d.get && !d.set;
        if (isData) {
          const value = (typeof getter === 'function') ? getter.call(target) : getter;
          Object.defineProperty(target, key, {
            value: value,
            writable: d ? !!d.writable : true,
            configurable: d ? !!d.configurable : true,
            enumerable: d ? !!d.enumerable : enumerable
          });
          return true;
        }
        const wrappedGet = wrapGetter(key, getter, d, validThis, { invalidThis: opts.invalidThis });
        Object.defineProperty(target, key, {
          get: wrappedGet,
          set: d && d.set,
          configurable: d ? !!d.configurable : true,
          enumerable: d ? !!d.enumerable : enumerable
        });
        return true;
      }

      function redefineAcc(target, key, getImpl) {
        const d = Object.getOwnPropertyDescriptor(target, key);
        if (d && d.configurable === false) {
          throw new TypeError('[Core.redefineAcc] non-configurable ' + key);
        }
        const isData = d && Object.prototype.hasOwnProperty.call(d, 'value') && !d.get && !d.set;
        if (isData) {
          const value = (typeof getImpl === 'function') ? getImpl.call(target) : getImpl;
          Object.defineProperty(target, key, {
            value: value,
            writable: d ? !!d.writable : true,
            configurable: d ? !!d.configurable : true,
            enumerable: d ? !!d.enumerable : false
          });
          return true;
        }
        const markAsNative = ensureMarkAsNative();
        const namedGet = (typeof getImpl === 'function' && getImpl.name === '')
          ? Object.getOwnPropertyDescriptor(({ get [key]() { return getImpl.call(this); } }), key).get
          : getImpl;
        if (typeof namedGet !== 'function') {
          throw new TypeError('[Core.redefineAcc] getter missing for ' + key);
        }
        const wrappedGet = markAsNative(namedGet, 'get ' + key);
        knownWrapped.add(wrappedGet);
        Object.defineProperty(target, key, {
          get: wrappedGet,
          set: d && d.set,
          configurable: d ? !!d.configurable : true,
          enumerable: d ? !!d.enumerable : false
        });
        return true;
      }

      function patchDataProp(planItem, t, desc, fail) {
        planItem.descriptorPath = 'descriptor_data';
        planItem.wrapperClass = null;
        if (t && typeof t.wrapperClass === 'string') {
          const wc = t.wrapperClass;
          if (wc !== 'synthetic_named' && wc !== 'core_proxy') {
            const e = new TypeError('[Core.applyTargets] unsupported wrapperClass for data');
            return fail(planItem.policy, planItem.tag, 'wrapper_class_unsupported', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId, wrapperClass: wc });
          }
          planItem.wrapperClass = wc;
          planItem.descriptorPath = null;
        }
        if (desc && !hasDataShape(desc)) {
          const e = new TypeError('[Core.applyTargets] kind mismatch for data');
          return fail(planItem.policy, planItem.tag, 'kind_mismatch', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId });
        }
        if (desc && !(desc.configurable || desc.writable)) {
          const e = new TypeError('[Core.applyTargets] non-configurable and non-writable');
          return fail(planItem.policy, planItem.tag, 'non_configurable', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId });
        }
        const hasExplicitValue = Object.prototype.hasOwnProperty.call(t, 'value');
        if (desc) {
          planItem.nextDesc = Object.assign({}, desc);
          if (hasExplicitValue) {
            planItem.nextDesc.value = t.value;
          } else if (Object.prototype.hasOwnProperty.call(planItem.nextDesc, 'value') && typeof planItem.nextDesc.value === 'undefined') {
            delete planItem.nextDesc.value;
          }
        } else {
          planItem.nextDesc = {
            writable: Object.prototype.hasOwnProperty.call(t, 'writable') ? !!t.writable : true,
            configurable: Object.prototype.hasOwnProperty.call(t, 'configurable') ? !!t.configurable : true,
            enumerable: Object.prototype.hasOwnProperty.call(t, 'enumerable') ? !!t.enumerable : true
          };
          if (hasExplicitValue) {
            planItem.nextDesc.value = t.value;
          }
        }
        return planItem;
      }

      function patchAccessor(planItem, t, desc, markAsNative, fail) {
        if (!desc && !planItem.allowCreate) {
          const e = new Error('[Core.applyTargets] descriptor missing');
          return fail(planItem.policy, planItem.tag, 'descriptor_missing', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId });
        }
        const key = planItem.key;
        const origGet = desc && typeof desc.get === 'function' ? desc.get : undefined;
        const origSet = desc && typeof desc.set === 'function' ? desc.set : undefined;
        const getImpl = typeof t.getImpl === 'function' ? t.getImpl : null;
        const setImpl = typeof t.setImpl === 'function' ? t.setImpl : null;
        const validThis = typeof t.validThis === 'function' ? t.validThis : null;
        const invalidThis = t.invalidThis || 'native';
        const wrapLayerInput = planItem.wrapLayer;
        const wrapLayer = normalizeWrapLayer(wrapLayerInput);
        if (wrapLayer === null) {
          const code = classifyWrapLayer(wrapLayerInput);
          const e = wrapLayerContractError(code, 'applyTargets');
          return fail(planItem.policy, planItem.tag, code, e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId, wrapLayer: wrapLayerInput });
        }
        const strictAccessorContract = planItem.policy === 'strict' && wrapLayer === 'named_wrapper_strict';
        const allowShapeChange = !!planItem.allowShapeChange;
        if (strictAccessorContract && !desc) {
          const e = new Error('[Core.applyTargets] accessor strict requires descriptor');
          return fail(planItem.policy, planItem.tag, 'descriptor_missing', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId });
        }
        const descIsAccessor = !!desc && hasAccessorShape(desc);
        const descIsData = !!desc && hasDataShape(desc);
        const canShapeChange = strictAccessorContract && allowShapeChange && descIsData;
        if (desc && !descIsAccessor && !canShapeChange) {
          const e = new TypeError('[Core.applyTargets] kind mismatch for accessor');
          return fail(planItem.policy, planItem.tag, 'kind_mismatch', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId });
        }
        if (desc && !desc.configurable) {
          const e = new TypeError('[Core.applyTargets] non-configurable accessor');
          return fail(planItem.policy, planItem.tag, 'non_configurable', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId });
        }
        if (strictAccessorContract && setImpl) {
          const e = new TypeError('[Core.applyTargets] named_wrapper_strict forbids setImpl');
          return fail(planItem.policy, planItem.tag, 'strict_contract_violation', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId });
        }
        const useCoreWrapper = wrapLayer === 'core_wrapper';
        if (strictAccessorContract && useCoreWrapper) {
          const e = new TypeError('[Core.applyTargets] named_wrapper_strict cannot use core_wrapper');
          return fail(planItem.policy, planItem.tag, 'strict_contract_violation', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId });
        }
        planItem.wrapperClass = (strictAccessorContract || !useCoreWrapper) ? 'synthetic_named' : 'core_proxy';
        let getWrapped = origGet;
        let setWrapped = origSet;

        try {
          if (origGet) {
            const computedGetter = function coreAccessorGet() {
              if (getImpl) return getImpl.call(this, origGet);
              return Reflect.apply(origGet, this, []);
            };
            getWrapped = wrapGetter(key, computedGetter, desc, validThis, {
              invalidThis: invalidThis,
              mark: true,
              wrapLayer: wrapLayer
            });
          } else if (getImpl) {
            const computedGetter = function coreAccessorGetCreate() {
              return getImpl.call(this, undefined);
            };
            const createDesc = strictAccessorContract && desc
              ? {
                  configurable: !!desc.configurable,
                  enumerable: !!desc.enumerable,
                  get: undefined,
                  set: (Object.prototype.hasOwnProperty.call(desc, 'set') ? desc.set : undefined)
                }
              : {
                  configurable: Object.prototype.hasOwnProperty.call(t, 'configurable') ? !!t.configurable : true,
                  enumerable: Object.prototype.hasOwnProperty.call(t, 'enumerable') ? !!t.enumerable : true
                };
            getWrapped = wrapGetter(key, computedGetter, createDesc, validThis, {
              invalidThis: invalidThis,
              mark: true,
              wrapLayer: wrapLayer
            });
          }
          if (strictAccessorContract) {
            if (desc && Object.prototype.hasOwnProperty.call(desc, 'set')) {
              setWrapped = desc.set;
            } else {
              setWrapped = undefined;
            }
          } else if (origSet) {
            if (useCoreWrapper) {
              setWrapped = __wrapNativeAccessor(origSet, 'set ' + key, function (target, thisArg, argList) {
                const args = argList || [];
                const v = args[0];
                if (validThis && !validThis(thisArg)) {
                  return onInvalidThis(invalidThis, origSet, thisArg, args);
                }
                if (setImpl) return setImpl.call(thisArg, origSet, v);
                return Reflect.apply(origSet, thisArg, args);
              });
            } else {
              const setRaw = buildNamedAccessor(key, 'set', function coreAccessorSet(v) {
                if (validThis && !validThis(this)) {
                  return onInvalidThis(invalidThis, origSet, this, [v]);
                }
                if (setImpl) return setImpl.call(this, origSet, v);
                return Reflect.apply(origSet, this, [v]);
              });
              setWrapped = markAsNative(setRaw, 'set ' + key);
            }
            knownWrapped.add(setWrapped);
          } else if (setImpl) {
            const setRaw = buildNamedAccessor(key, 'set', function coreAccessorSetCreate(v) {
              if (validThis && !validThis(this)) {
                return onInvalidThis(invalidThis, undefined, this, [v]);
              }
              return setImpl.call(this, undefined, v);
            });
            if (useCoreWrapper) {
              setWrapped = __wrapNativeAccessor(setRaw, 'set ' + key, function (target, thisArg, argList) {
                return Reflect.apply(target, thisArg, argList || []);
              });
            } else {
              setWrapped = markAsNative(setRaw, 'set ' + key);
            }
            knownWrapped.add(setWrapped);
          }
        } catch (e) {
          return fail(planItem.policy, planItem.tag, 'mark_failed', e, { key, kind: planItem.kind, targetId: planItem.targetId });
        }

        if (strictAccessorContract) {
          if (typeof getWrapped !== 'function') {
            const e = new TypeError('[Core.applyTargets] named_wrapper_strict requires getter');
            return fail(planItem.policy, planItem.tag, 'strict_contract_violation', e, { key, kind: planItem.kind, targetId: planItem.targetId });
          }
          const nextDesc = {
            get: getWrapped,
            set: setWrapped,
            configurable: desc ? !!desc.configurable : (Object.prototype.hasOwnProperty.call(t, 'configurable') ? !!t.configurable : true),
            enumerable: desc ? !!desc.enumerable : (Object.prototype.hasOwnProperty.call(t, 'enumerable') ? !!t.enumerable : true)
          };
          planItem.nextDesc = nextDesc;
          return planItem;
        }
        if (desc) {
          planItem.nextDesc = Object.assign({}, desc, { get: getWrapped, set: setWrapped });
        } else {
          planItem.nextDesc = {
            get: getWrapped,
            set: setWrapped,
            configurable: Object.prototype.hasOwnProperty.call(t, 'configurable') ? !!t.configurable : true,
            enumerable: Object.prototype.hasOwnProperty.call(t, 'enumerable') ? !!t.enumerable : true
          };
        }
        return planItem;
      }

      function patchMethod(planItem, t, desc, markAsNative, fail) {
        if (!desc) {
          const e = new Error('[Core.applyTargets] descriptor missing');
          return fail(planItem.policy, planItem.tag, 'descriptor_missing', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId });
        }
        if (!hasDataShape(desc) || typeof desc.value !== 'function') {
          const e = new TypeError('[Core.applyTargets] kind mismatch for method');
          return fail(planItem.policy, planItem.tag, 'kind_mismatch', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId, type: typeof desc.value });
        }
        if (!(desc.configurable || desc.writable)) {
          const e = new TypeError('[Core.applyTargets] non-configurable and non-writable');
          return fail(planItem.policy, planItem.tag, 'non_configurable', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId });
        }
        if (planItem.mode === 'declare_only' || t.enabled === false) {
          planItem.skipApply = true;
          planItem.reason = 'declare_only';
          return planItem;
        }

        const key = planItem.key;
        const orig = desc.value;
        const invoke = typeof t.invoke === 'function' ? t.invoke : null;
        const hooksPost = Array.isArray(t.hooksPost) ? t.hooksPost : [];
        const invokeClass = planItem.invokeClass || 'normal';
        const requiresStrictThis = invokeClass !== 'normal';
        const validThis = typeof t.validThis === 'function' ? t.validThis : null;
        const invalidThis = requiresStrictThis ? 'throw' : (t.invalidThis || 'native');
        const wrapLayerInput = planItem.wrapLayer;
        const wrapLayer = normalizeWrapLayer(wrapLayerInput);
        if (wrapLayer === null) {
          const code = classifyWrapLayer(wrapLayerInput);
          const e = wrapLayerContractError(code, 'applyTargets');
          return fail(planItem.policy, planItem.tag, code, e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId, wrapLayer: wrapLayerInput });
        }
        if (wrapLayer === 'descriptor_only') {
          const e = new TypeError('[Core.applyTargets] method cannot use descriptor_only wrapLayer');
          return fail(planItem.policy, planItem.tag, 'wrap_layer_kind_mismatch', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId });
        }
        const useCoreWrapper = wrapLayer === 'core_wrapper';
        planItem.wrapperClass = useCoreWrapper ? 'core_proxy' : 'synthetic_named';
        if (requiresStrictThis && !validThis) {
          const e = new TypeError('[Core.applyTargets] invokeClass requires validThis');
          return fail(planItem.policy, planItem.tag, 'invoke_class_requires_valid_this', e, {
            key: planItem.key,
            kind: planItem.kind,
            targetId: planItem.targetId,
            invokeClass
          });
        }
        function buildMethodWrapperByArity(fn, keyName, invokePath) {
          const arity = (fn && typeof fn.length === 'number' && fn.length >= 0) ? fn.length : 0;
          switch (arity) {
            case 0: return ({ [keyName]() { return invokePath(this, arguments); } })[keyName];
            case 1: return ({ [keyName](a0) { return invokePath(this, arguments); } })[keyName];
            case 2: return ({ [keyName](a0, a1) { return invokePath(this, arguments); } })[keyName];
            case 3: return ({ [keyName](a0, a1, a2) { return invokePath(this, arguments); } })[keyName];
            case 4: return ({ [keyName](a0, a1, a2, a3) { return invokePath(this, arguments); } })[keyName];
            case 5: return ({ [keyName](a0, a1, a2, a3, a4) { return invokePath(this, arguments); } })[keyName];
            default: return ({ [keyName](...args) { return invokePath(this, args); } })[keyName];
          }
        }
        function invokeMethodPath(self, inputArgs) {
          const args = Array.prototype.slice.call(inputArgs || []);
          if (validThis && !validThis(self)) {
            return onInvalidThis(invalidThis, orig, self, args);
          }
          let out;
          try {
            out = invoke
              ? invoke.call(self, orig, args)
              : Reflect.apply(orig, self, args);
          } catch (e) {
            diagDegrade(planItem.tag + ':native_throw', e, {
              key,
              kind: planItem.kind,
              targetId: planItem.targetId,
              invokeClass: invokeClass,
              stage: 'runtime',
              type: 'browser structure missing data',
              message: 'native invocation threw',
              data: { outcome: 'throw', reason: 'native_throw' }
            });
            throw e;
          }
          if (!hooksPost.length || typeof out !== 'string') return out;
          let res = out;
          for (let j = 0; j < hooksPost.length; j++) {
            const hook = hooksPost[j];
            if (typeof hook !== 'function') continue;
            try {
              const r = hook.call(self, res, ...args);
              if (typeof r === 'string') res = r;
            } catch (e) {
              diagDegrade(planItem.tag + ':hooksPost_failed', e, {
                key,
                kind: planItem.kind,
                targetId: planItem.targetId,
                invokeClass: invokeClass,
                hook: hook && (hook.name || null)
              });
              return out;
            }
          }
          return res;
        }

        let wrapped;
        try {
          if (useCoreWrapper) {
            wrapped = __wrapNativeApply(orig, key, function (target, thisArg, argList) {
              return invokeMethodPath(thisArg, argList);
            });
          } else {
            const wrappedRaw = buildMethodWrapperByArity(orig, key, invokeMethodPath);
            wrapped = markAsNative(wrappedRaw, key);
          }
          knownWrapped.add(wrapped);
        } catch (e) {
          return fail(planItem.policy, planItem.tag, 'mark_failed', e, { key, kind: planItem.kind, targetId: planItem.targetId, invokeClass: invokeClass });
        }

        planItem.nextDesc = Object.assign({}, desc, { value: wrapped });
        planItem.value = wrapped;
        return planItem;
      }

      function patchPromiseMethod(planItem, t, desc, markAsNative, fail) {
        if (!desc) {
          const e = new Error('[Core.applyTargets] descriptor missing');
          return fail(planItem.policy, planItem.tag, 'descriptor_missing', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId });
        }
        if (!hasDataShape(desc) || typeof desc.value !== 'function') {
          const e = new TypeError('[Core.applyTargets] kind mismatch for promise_method');
          return fail(planItem.policy, planItem.tag, 'kind_mismatch', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId, type: typeof desc.value });
        }
        if (!(desc.configurable || desc.writable)) {
          const e = new TypeError('[Core.applyTargets] non-configurable and non-writable');
          return fail(planItem.policy, planItem.tag, 'non_configurable', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId });
        }
        if (planItem.mode === 'declare_only' || t.enabled === false) {
          planItem.skipApply = true;
          planItem.reason = 'declare_only';
          return planItem;
        }

        const key = planItem.key;
        const orig = desc.value;
        const invoke = typeof t.invoke === 'function' ? t.invoke : null;
        const hooksPost = Array.isArray(t.hooksPost) ? t.hooksPost : [];
        const invokeClass = planItem.invokeClass || 'normal';
        const requiresStrictThis = invokeClass !== 'normal';
        const validThis = typeof t.validThis === 'function' ? t.validThis : null;
        const invalidThis = requiresStrictThis ? 'throw' : (t.invalidThis || 'native');
        const wrapLayerInput = planItem.wrapLayer;
        const wrapLayer = normalizeWrapLayer(wrapLayerInput);
        if (wrapLayer === null) {
          const code = classifyWrapLayer(wrapLayerInput);
          const e = wrapLayerContractError(code, 'applyTargets');
          return fail(planItem.policy, planItem.tag, code, e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId, wrapLayer: wrapLayerInput });
        }
        if (wrapLayer === 'descriptor_only') {
          const e = new TypeError('[Core.applyTargets] promise_method cannot use descriptor_only wrapLayer');
          return fail(planItem.policy, planItem.tag, 'wrap_layer_kind_mismatch', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId });
        }
        const useCoreWrapper = wrapLayer === 'core_wrapper';
        planItem.wrapperClass = useCoreWrapper ? 'core_proxy' : 'synthetic_named';
        if (requiresStrictThis && !validThis) {
          const e = new TypeError('[Core.applyTargets] invokeClass requires validThis');
          return fail(planItem.policy, planItem.tag, 'invoke_class_requires_valid_this', e, {
            key: planItem.key,
            kind: planItem.kind,
            targetId: planItem.targetId,
            invokeClass
          });
        }
        function buildPromiseMethodWrapperByArity(fn, keyName, invokePath) {
          const arity = (fn && typeof fn.length === 'number' && fn.length >= 0) ? fn.length : 0;
          switch (arity) {
            case 0: return ({ [keyName]() { return invokePath(this, arguments); } })[keyName];
            case 1: return ({ [keyName](a0) { return invokePath(this, arguments); } })[keyName];
            case 2: return ({ [keyName](a0, a1) { return invokePath(this, arguments); } })[keyName];
            case 3: return ({ [keyName](a0, a1, a2) { return invokePath(this, arguments); } })[keyName];
            case 4: return ({ [keyName](a0, a1, a2, a3) { return invokePath(this, arguments); } })[keyName];
            case 5: return ({ [keyName](a0, a1, a2, a3, a4) { return invokePath(this, arguments); } })[keyName];
            default: return ({ [keyName](...args) { return invokePath(this, args); } })[keyName];
          }
        }
        function invokePromisePath(self, inputArgs) {
          const args = Array.prototype.slice.call(inputArgs || []);
          let out;
          try {
            out = (validThis && !validThis(self))
              ? onInvalidThis(invalidThis, orig, self, args)
              : (invoke ? invoke.call(self, orig, args) : Reflect.apply(orig, self, args));
          } catch (e) {
            diagDegrade(planItem.tag + ':native_throw', e, {
              key,
              kind: planItem.kind,
              targetId: planItem.targetId,
              invokeClass: invokeClass,
              stage: 'runtime',
              type: 'browser structure missing data',
              message: 'native invocation threw',
              data: { outcome: 'throw', reason: 'native_throw', promise_method: true }
            });
            throw e;
          }

          if (!isPromiseLike(out)) {
            const e = new TypeError();
            diagDegrade(planItem.tag + ':promise_contract_failed', e, {
              key,
              kind: planItem.kind,
              targetId: planItem.targetId,
              invokeClass: invokeClass
            });
            throw e;
          }

          if (!hooksPost.length) return out;
          return out.then(function promisePostprocess(resolved) {
            let res = resolved;
            for (let j = 0; j < hooksPost.length; j++) {
              const hook = hooksPost[j];
              if (typeof hook !== 'function') continue;
              try {
                const r = hook.call(self, res, ...args);
                if (typeof r !== 'undefined') res = r;
              } catch (e) {
                diagDegrade(planItem.tag + ':hooksPost_failed', e, {
                  key,
                  kind: planItem.kind,
                  targetId: planItem.targetId,
                  invokeClass: invokeClass,
                  hook: hook && (hook.name || null),
                  promise_method: true
                });
                return resolved;
              }
            }
            return res;
          });
        }

        let wrapped;
        try {
          if (useCoreWrapper) {
            wrapped = __wrapNativeApply(orig, key, function (target, thisArg, argList) {
              return invokePromisePath(thisArg, argList);
            });
          } else {
            const wrappedRaw = buildPromiseMethodWrapperByArity(orig, key, invokePromisePath);
            wrapped = markAsNative(wrappedRaw, key);
          }
          knownWrapped.add(wrapped);
        } catch (e) {
          return fail(planItem.policy, planItem.tag, 'mark_failed', e, { key, kind: planItem.kind, targetId: planItem.targetId, invokeClass: invokeClass });
        }

        planItem.nextDesc = Object.assign({}, desc, { value: wrapped });
        planItem.value = wrapped;
        return planItem;
      }

      function preflightTarget(t, seenOwners) {
        const item = t || {};
        const owner = item.owner;
        const key = item.key;
        const kind = item.kind;
        const invokeClass = normalizeInvokeClass(item.invokeClass);
        const wrapLayerInput = item.wrapLayer;
        const wrapLayer = normalizeWrapLayer(wrapLayerInput);
        const allowNamedWrapperBrandStrict = item.allowNamedWrapperBrandStrict === true;
        const policy = normalizePolicy(item.policy);
        const tag = item.diagTag ? String(item.diagTag) : 'core:applyTargets';
        const targetId = item.targetId ? String(item.targetId) : ('pf:' + sameTargetKey(owner, key));
        const allowCreate = !!item.allowCreate;
        const allowShapeChange = !!item.allowShapeChange;
        let resolveMode = normalizeResolveMode(item.resolve);
        if (!owner || (typeof owner !== 'object' && typeof owner !== 'function')) {
          return { ok: false, reason: 'owner_invalid', error: new TypeError('[Core.applyTargets] owner invalid'), tag, policy, targetId, key: key || null, kind: kind || null };
        }
        if (typeof key !== 'string' || !key) {
          return { ok: false, reason: 'key_invalid', error: new TypeError('[Core.applyTargets] key invalid'), tag, policy, targetId, key: key || null, kind: kind || null };
        }
        if (policy === null) {
          return { ok: false, reason: 'policy_unsupported', error: new TypeError('[Core.applyTargets] unsupported policy'), tag, policy: 'throw', targetId, key, kind: kind || null };
        }
        if (kind !== 'data' && kind !== 'accessor' && kind !== 'method' && kind !== 'promise_method') {
          return { ok: false, reason: 'kind_unsupported', error: new TypeError('[Core.applyTargets] unsupported kind'), tag, policy, targetId, key, kind: kind || null };
        }
        if (invokeClass === null) {
          return { ok: false, reason: 'invoke_class_unsupported', error: new TypeError('[Core.applyTargets] unsupported invokeClass'), tag, policy, targetId, key, kind };
        }
        if ((kind !== 'method' && kind !== 'promise_method') && invokeClass !== 'normal') {
          return { ok: false, reason: 'invoke_class_kind_mismatch', error: new TypeError('[Core.applyTargets] invokeClass requires method kind'), tag, policy, targetId, key, kind };
        }
        if (wrapLayer === null) {
          const code = classifyWrapLayer(wrapLayerInput);
          return { ok: false, reason: code, error: wrapLayerContractError(code, 'applyTargets'), tag, policy, targetId, key, kind };
        }
        if (kind === 'data' && wrapLayer !== 'descriptor_only') {
          return { ok: false, reason: 'wrap_layer_kind_mismatch', error: new TypeError('[Core.applyTargets] data requires descriptor_only wrapLayer'), tag, policy, targetId, key, kind };
        }
        if (wrapLayer === 'named_wrapper_strict' && kind !== 'accessor') {
          return { ok: false, reason: 'wrap_layer_kind_mismatch', error: new TypeError('[Core.applyTargets] named_wrapper_strict requires accessor kind'), tag, policy, targetId, key, kind };
        }
        if (kind === 'accessor' && wrapLayer === 'named_wrapper_strict' && policy !== 'strict') {
          return { ok: false, reason: 'wrap_layer_policy_mismatch', error: new TypeError('[Core.applyTargets] named_wrapper_strict requires strict policy'), tag, policy, targetId, key, kind };
        }
        if (kind === 'accessor' && policy === 'strict' && wrapLayer !== 'named_wrapper_strict') {
          return { ok: false, reason: 'wrap_layer_policy_mismatch', error: new TypeError('[Core.applyTargets] strict policy for accessor requires named_wrapper_strict'), tag, policy, targetId, key, kind };
        }
        if ((kind === 'accessor' || kind === 'method' || kind === 'promise_method') && wrapLayer === 'descriptor_only') {
          return { ok: false, reason: 'wrap_layer_kind_mismatch', error: new TypeError('[Core.applyTargets] descriptor_only unsupported for non-data kind'), tag, policy, targetId, key, kind };
        }
        if (wrapLayer === 'named_wrapper_strict' && resolveMode !== 'proto_chain') {
          const fromMode = resolveMode;
          resolveMode = 'proto_chain';
          __emit('warn', 'core_window:strict_accessor_force_proto_chain', {
            module: 'core',
            diagTag: tag,
            surface: 'core',
            key,
            stage: 'preflight',
            message: 'strict accessor requires resolve=proto_chain; forced',
            type: 'contract violation',
            data: { outcome: 'return', from: fromMode, to: resolveMode, wrapLayer, policy, kind }
          }, null);
        }
        if ((kind === 'method' || kind === 'promise_method')
            && invokeClass === 'brand_strict'
            && wrapLayer !== 'core_wrapper'
            && !(allowNamedWrapperBrandStrict && wrapLayer === 'named_wrapper')) {
          return { ok: false, reason: 'wrap_layer_unsupported',
            error: new TypeError('[Core.applyTargets] brand_strict requires core_wrapper wrapLayer'),
            tag, policy, targetId, key, kind
          };
        }

        if ((kind === 'method' || kind === 'promise_method')
            && (invokeClass === 'constructor' || invokeClass === 'meta_primitive')
            && wrapLayer !== 'core_wrapper') {
          return { ok: false, reason: 'wrap_layer_unsupported',
            error: new TypeError('[Core.applyTargets] invokeClass requires core_wrapper wrapLayer'),
            tag, policy, targetId, key, kind
          };
        }






        const resolved = resolveDescriptor(owner, key, { mode: resolveMode });
        const descriptorOwner = resolved && resolved.owner ? resolved.owner : owner;
        const desc = resolved ? resolved.desc : null;

        if (seenOwners) {
          let keys = seenOwners.get(descriptorOwner);
          if (!keys) {
            keys = new Set();
            seenOwners.set(descriptorOwner, keys);
          }
          if (keys.has(key)) {
            return { ok: false, reason: 'duplicate_target', error: new TypeError('[Core.applyTargets] duplicate target in batch'), tag, policy, targetId, key, kind };
          }
          keys.add(key);
        }
        if (isTargetRegistered(descriptorOwner, key)) {
          return { ok: false, reason: 'duplicate_target', error: new TypeError('[Core.applyTargets] duplicate target in registry'), tag, policy, targetId, key, kind };
        }
        if (!desc && !allowCreate) {
          return { ok: false, reason: 'descriptor_missing', error: new Error('[Core.applyTargets] descriptor missing'), tag, policy, targetId, key, kind };
        }
        if (!desc && kind === 'accessor' && wrapLayer === 'named_wrapper_strict') {
          return { ok: false, reason: 'descriptor_missing', error: new Error('[Core.applyTargets] accessor strict requires descriptor'), tag, policy, targetId, key, kind };
        }
        if (desc && kind === 'data') {
          if (!hasDataShape(desc)) {
            return { ok: false, reason: 'kind_mismatch', error: new TypeError('[Core.applyTargets] kind mismatch for data'), tag, policy, targetId, key, kind };
          }
          if (!(desc.configurable || desc.writable)) {
            return { ok: false, reason: 'non_configurable', error: new TypeError('[Core.applyTargets] non-configurable and non-writable'), tag, policy, targetId, key, kind };
          }
        }
        if (desc && kind === 'accessor') {
          const accessorShape = hasAccessorShape(desc);
          const dataShape = hasDataShape(desc);
          const canShapeChange = wrapLayer === 'named_wrapper_strict' && allowShapeChange && dataShape;
          if (!accessorShape && !canShapeChange) {
            return { ok: false, reason: 'kind_mismatch', error: new TypeError('[Core.applyTargets] kind mismatch for accessor'), tag, policy, targetId, key, kind };
          }
          if (!desc.configurable) {
            return { ok: false, reason: 'non_configurable', error: new TypeError('[Core.applyTargets] non-configurable accessor'), tag, policy, targetId, key, kind };
          }
        }
        if (desc && (kind === 'method' || kind === 'promise_method')) {
          if (!hasDataShape(desc) || typeof desc.value !== 'function') {
            return { ok: false, reason: 'kind_mismatch', error: new TypeError('[Core.applyTargets] kind mismatch for method'), tag, policy, targetId, key, kind };
          }
          if (!(desc.configurable || desc.writable)) {
            return { ok: false, reason: 'non_configurable', error: new TypeError('[Core.applyTargets] non-configurable and non-writable'), tag, policy, targetId, key, kind };
          }
        }
        if (desc && (kind === 'method' || kind === 'promise_method') && typeof desc.value === 'function' && knownWrapped.has(desc.value)) {
          return { ok: false, reason: 'duplicate_target', error: new TypeError('[Core.applyTargets] duplicate target in realm'), tag, policy, targetId, key, kind };
        }
        if (desc && kind === 'accessor') {
          if ((typeof desc.get === 'function' && knownWrapped.has(desc.get)) || (typeof desc.set === 'function' && knownWrapped.has(desc.set))) {
            return { ok: false, reason: 'duplicate_target', error: new TypeError('[Core.applyTargets] duplicate target in realm'), tag, policy, targetId, key, kind };
          }
        }
        return {
          ok: true,
          reason: null,
          error: null,
          tag,
          policy,
          targetId,
          owner,
          descriptorOwner,
          key,
          kind,
          invokeClass,
          wrapLayer,
          resolve: resolveMode,
          desc: cloneDesc(desc),
          allowCreate,
          allowShapeChange
        };
      }

      function applyTargets(targets, profile, diag) {
        const list = Array.isArray(targets) ? targets : [];
        const planned = [];
        planned.ok = true;
        planned.total = list.length;
        planned.reason = null;
        if (!list.length) return planned;

        const markAsNative = ensureMarkAsNative();
        const seenOwners = new WeakMap();
        const failDedupe = new Set();

        function fail(policy, tag, code, err, extra) {
          const x = (extra && typeof extra === 'object') ? extra : {};
          const k = Object.prototype.hasOwnProperty.call(x, 'key') ? x.key : null;
          const tid = Object.prototype.hasOwnProperty.call(x, 'targetId') ? x.targetId : null;
          const dedupeKey = String(tag || 'core:applyTargets') + ':' + String(code || 'failed') + ':' + String(k || '') + ':' + String(tid || '');
          if (!failDedupe.has(dedupeKey)) {
            failDedupe.add(dedupeKey);
            diagDegrade(tag + ':' + code, err, Object.assign({}, x, {
              module: 'core_window',
              diagTag: tag,
              surface: 'core',
              policy: policy,
              stage: (typeof x.stage === 'string' && x.stage) ? x.stage : 'apply',
              message: (typeof x.message === 'string' && x.message) ? x.message : 'Core.applyTargets failed',
              type: (typeof x.type === 'string' && x.type) ? x.type : (
                (code === 'descriptor_missing' || code === 'kind_mismatch' || code === 'non_configurable' || code === 'strict_contract_violation')
                  ? 'browser structure missing data'
                  : 'pipeline missing data'
              ),
              data: (x.data && typeof x.data === 'object') ? x.data : { reason: code }
            }));
          }
          if (policy === 'throw' || policy === 'strict') throw err;
          planned.length = 0;
          planned.ok = false;
          planned.reason = code;
          return planned;
        }

        for (let i = 0; i < list.length; i++) {
          const t = list[i] || {};
          const mode = t.mode || 'default';
          const preflight = preflightTarget(t, seenOwners);
          if (!preflight.ok) {
            return fail(preflight.policy, preflight.tag, preflight.reason, preflight.error, {
              key: preflight.key || null,
              kind: preflight.kind || null,
              targetId: preflight.targetId,
              stage: 'preflight',
              message: 'Core.applyTargets preflight failed',
              data: { reason: preflight.reason }
            });
          }
          const owner = preflight.descriptorOwner || preflight.owner;
          const key = preflight.key;
          const kind = preflight.kind;
          const invokeClass = preflight.invokeClass || 'normal';
          const wrapLayer = preflight.wrapLayer;
          const policy = preflight.policy;
          const tag = preflight.tag;
          const targetId = t.targetId ? String(t.targetId) : (String(i) + ':' + sameTargetKey(owner, key));
          const desc = preflight.desc;

          const planItem = {
            targetId,
            owner,
            requestedOwner: preflight.owner,
            key,
            kind,
            invokeClass,
            wrapLayer,
            mode,
            policy,
            diagTag: tag,
            tag,
            applied: false,
            skipApply: false,
            reason: null,
            origDesc: cloneDesc(desc),
            desc: cloneDesc(desc),
            nextDesc: null,
            allowCreate: !!preflight.allowCreate,
            allowShapeChange: !!preflight.allowShapeChange,
            rollbackInfo: { owner, key, desc: cloneDesc(desc) }
          };

          if (kind === 'data') {
            if (patchDataProp(planItem, t, desc, fail) === planned) return planned;
          } else if (kind === 'accessor') {
            if (patchAccessor(planItem, t, desc, markAsNative, fail) === planned) return planned;
          } else if (kind === 'method') {
            if (patchMethod(planItem, t, desc, markAsNative, fail) === planned) return planned;
          } else {
            if (patchPromiseMethod(planItem, t, desc, markAsNative, fail) === planned) return planned;
          }
          planned.push(planItem);
        }

        try {
          if (diag && typeof diag === 'object' && typeof diag.push === 'function') {
            diag.push({ planned: planned.length, total: list.length, ok: planned.ok !== false, reason: planned.reason || null });
          }
        } catch (e) {
          diagDegrade('core:applyTargets:diag_push_failed', e);
        }
        return planned;
      }

      safeDefine(window, 'Core', {
        value: Core,
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, 'applyTargets', {
        value: applyTargets,
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, 'patchDataProp', {
        value: patchDataProp,
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, 'patchAccessor', {
        value: patchAccessor,
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, 'patchMethod', {
        value: patchMethod,
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, 'patchPromiseMethod', {
        value: patchPromiseMethod,
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, 'preflightTarget', {
        value: function corePreflightTarget(target) {
          return preflightTarget(target, null);
        },
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, 'resolveDescriptor', {
        value: function coreResolveDescriptor(owner, key, options) {
          return resolveDescriptor(owner, key, options);
        },
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, '__targetRegistry', {
        value: globalTargetRegistry,
        writable: false,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, 'isTargetRegistered', {
        value: function coreIsTargetRegistered(owner, key) {
          return isTargetRegistered(owner, key);
        },
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, 'registerPatchedTarget', {
        value: function coreRegisterPatchedTarget(owner, key) {
          if (!owner || (typeof owner !== 'object' && typeof owner !== 'function')) {
            throw new TypeError('[Core.registerPatchedTarget] owner invalid');
          }
          if (typeof key !== 'string' || !key) {
            throw new TypeError('[Core.registerPatchedTarget] key invalid');
          }
          registerPatchedTarget(owner, key);
          return true;
        },
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, '__patchGuardSeq', {
        value: __patchGuardSeq,
        writable: false,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, 'guardFlag', {
        value: guardFlag,
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, 'releaseGuardFlag', {
        value: releaseGuardFlag,
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, 'wrapGetter', {
        value: wrapGetter,
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, 'safeDefineAcc', {
        value: safeDefineAcc,
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, 'redefineAcc', {
        value: redefineAcc,
        writable: true,
        configurable: true,
        enumerable: false
      });
      try {
        const coreMark = ensureMarkAsNative();
        coreMark(applyTargets, 'applyTargets');
        coreMark(patchDataProp, 'patchDataProp');
        coreMark(patchAccessor, 'patchAccessor');
        coreMark(patchMethod, 'patchMethod');
        coreMark(patchPromiseMethod, 'patchPromiseMethod');
        coreMark(safeDefineAcc, 'safeDefineAcc');
        coreMark(redefineAcc, 'redefineAcc');
        coreMark(wrapGetter, 'wrapGetter');
      } catch (e) {
        diagDegrade('core:installCoreApplyTargets:mark_failed', e);
      }

    } catch (e) {
      diagDegrade('core:installCoreApplyTargets:failed', e);
      throw e;
    }
  })();

  Object.defineProperty(window, '__CORE_WINDOW_LOADED__', {
    value: true,
    writable: true,
    configurable: true,
    enumerable: false
  });
  __emit('info', 'core_window:ready', {
    module: 'core_window',
    diagTag: 'core_window',
    surface: 'core',
    key: null,
    stage: 'apply',
    message: 'core_window ready',
    type: null,
    data: { outcome: 'return', ok: true }
  }, null);
}

const CoreWindowModule = function CoreWindowModule(window) {
  'use strict';

  const C = window.CanvasPatchContext;
  const G = (typeof globalThis !== 'undefined' && globalThis)
        || (typeof self       !== 'undefined' && self)
        || (typeof window     !== 'undefined' && window)
        || (typeof global     !== 'undefined' && global)
        || {};
        


  const env = window && window.env;

  if (!window || (typeof window !== 'object' && typeof window !== 'function')) {
    throw new Error('[CoreWindow] window missing');
  }
  if (window.__CORE_WINDOW_LOADED__) return;

  // --- nativization provider  ---
  function safeDefine(obj, prop, descriptor) {
    try {
      if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return;
      Object.defineProperty(obj, prop, descriptor);
    } catch (e) {
      console.warn(`[stealth] safeDefine failed for ${prop}:`, e);
      if (typeof env !== "undefined" && env && env.DEBUG_DEGRADES && typeof __DEGRADE__ === "function") __DEGRADE__("hide_webdriver.js:safeDefine:define_failed", e);
      throw e;
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
      if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:toString_parent_state_access_failed", e);
    }
  }

  const nativeToString = existingCoreToStringStateOk
    ? existingCoreToStringState.nativeToString
    : (existingToString || Function.prototype.toString);
  if (typeof nativeToString !== 'function') {
    throw new Error('[CoreWindow] Function.prototype.toString missing');
  }

  const toStringOverrideMap = sharedCoreToStringStateOk
    ? sharedCoreToStringState.overrideMap
    : new WeakMap();
  const toStringProxyTargetMap = sharedCoreToStringStateOk
    ? sharedCoreToStringState.proxyTargetMap
    : new WeakMap();

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
      if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:WeakMap.set", e);
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


  if (typeof window.__ensureMarkAsNative !== 'function') {
    safeDefine(window, '__ensureMarkAsNative', {
      value: ensureMarkAsNative,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }

  // --- centralized native-shaped wrappers (Proxy/apply) ---
  function __requireMarkAsNative() {
    const ensure = (window && typeof window.__ensureMarkAsNative === 'function') ? window.__ensureMarkAsNative : null;
    const m = ensure ? ensure() : null;
    if (typeof m !== 'function') {
      throw new Error('[CoreWindow] markAsNative missing');
    }
    return m;
  }

  function __wrapNativeApply(nativeFn, name, applyImpl) {
    if (typeof nativeFn !== 'function') {
      throw new TypeError('[CoreWindow] __wrapNativeApply: nativeFn must be function');
    }
    if (typeof applyImpl !== 'function') {
      throw new TypeError('[CoreWindow] __wrapNativeApply: applyImpl must be function');
    }
    const wrapped = new Proxy(nativeFn, {
      apply(target, thisArg, argList) {
        return applyImpl(target, thisArg, argList);
      }
    });
    const markAsNative = __requireMarkAsNative();
    try {
      toStringProxyTargetMap.set(wrapped, nativeFn);
      const wrappedName = name || nativeFn.name || "";
      const nativeName = nativeFn.name || "";
      markAsNative(nativeFn, nativeName);
      const wrappedLabel = wrappedName
        ? `function ${wrappedName}() { [native code] }`
        : 'function () { [native code] }';
      toStringOverrideMap.set(wrapped, wrappedLabel);
    } catch (e) {
      if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:wrapNativeApply:mark_failed", e);
      throw e;
    }
    return wrapped;
  }

  function __wrapNativeCtor(nativeFn, name, argsImpl) {
    if (typeof nativeFn !== 'function') {
      throw new TypeError('[CoreWindow] __wrapNativeCtor: nativeFn must be function');
    }
    if (typeof argsImpl !== 'function') {
      throw new TypeError('[CoreWindow] __wrapNativeCtor: argsImpl must be function');
    }
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
    const markAsNative = __requireMarkAsNative();
    try {
      toStringProxyTargetMap.set(wrapped, nativeFn);
      const wrappedName = name || nativeFn.name || "";
      const nativeName = nativeFn.name || "";
      markAsNative(nativeFn, nativeName);
      const wrappedLabel = wrappedName
        ? `function ${wrappedName}() { [native code] }`
        : 'function () { [native code] }';
      toStringOverrideMap.set(wrapped, wrappedLabel);
    } catch (e) {
      if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:wrapNativeCtor:mark_failed", e);
      throw e;
    }
    return wrapped;
  }

  function __wrapNativeAccessor(origGetOrSet, name, applyImpl) {
    if (typeof origGetOrSet !== 'function') {
      throw new TypeError('[CoreWindow] __wrapNativeAccessor: origGetOrSet must be function');
    }
    if (typeof applyImpl !== 'function') {
      throw new TypeError('[CoreWindow] __wrapNativeAccessor: applyImpl must be function');
    }
    return __wrapNativeApply(origGetOrSet, name, applyImpl);
  }

  function __wrapStrictAccessor(key, getter, desc, validThis, options) {
    if (typeof key !== 'string' || !key) {
      throw new TypeError('[CoreWindow] __wrapStrictAccessor: key must be non-empty string');
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

    const synthetic = Object.getOwnPropertyDescriptor(({ get [key]() {
      return valueFromGetter(this);
    }}), key).get;
    let wrapped;
    wrapped = __wrapNativeAccessor(synthetic, name, function (target, thisArg, argList) {
      if (onAccess) onAccess(key, wrapped, thisArg);
      if (checkThis && !checkThis(thisArg)) {
        throw new TypeError();
      }
      return Reflect.apply(target, thisArg, argList || []);
    });
    return wrapped;
  }

  if (typeof window.__wrapNativeApply !== 'function') {
    safeDefine(window, '__wrapNativeApply', {
      value: __wrapNativeApply,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  if (typeof window.__wrapNativeAccessor !== 'function') {
    safeDefine(window, '__wrapNativeAccessor', {
      value: __wrapNativeAccessor,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  if (typeof window.__wrapStrictAccessor !== 'function') {
    safeDefine(window, '__wrapStrictAccessor', {
      value: __wrapStrictAccessor,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  if (typeof window.__wrapNativeCtor !== 'function') {
    safeDefine(window, '__wrapNativeCtor', {
      value: __wrapNativeCtor,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }


  {
    const toStringDesc = nativeGetOwnProp(Function.prototype, 'toString');
    const currentToString = toStringDesc && toStringDesc.value;

    if (existingCoreToStringStateOk) {
      const markAsNative = ensureMarkAsNative();
      const probe = function probe(){};
      markAsNative(probe);
      const expected = toStringOverrideMap.get(probe);
      if (expected === undefined) {
        const e = new Error('[CoreWindow] toString probe missing label');
        if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:toString_probe_missing", e);
        throw e;
      }
      if (typeof currentToString !== 'function') {
        const e = new Error('[CoreWindow] Function.prototype.toString missing');
        if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:toString_missing", e);
        throw e;
      }
      const actual = currentToString.call(probe);
      if (actual !== expected) {
        const e = new Error('[CoreWindow] toString bridge mismatch');
        if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:toString_bridge_mismatch", e);
        throw e;
      }
    }

    const toString = new Proxy(nativeToString, {
      apply(target, thisArg, argList) {
        if (typeof thisArg !== 'function') {
          return Reflect.apply(target, thisArg, argList);
        }
        const v = toStringOverrideMap.get(thisArg);
        if (v !== undefined) return v;
        const t = toStringProxyTargetMap.get(thisArg);
        if (t) {
          const tv = toStringOverrideMap.get(t);
          if (tv !== undefined) return tv;
        }
        return Reflect.apply(target, thisArg, argList);
      }
    });

    const installDesc = {
      value: toString,
      writable: toStringDesc ? !!toStringDesc.writable : true,
      configurable: toStringDesc ? !!toStringDesc.configurable : true,
      enumerable: toStringDesc ? !!toStringDesc.enumerable : false
    };
    const prevCoreStateDesc = nativeGetOwnProp(window, '__CORE_TOSTRING_STATE__');

    try {
      toStringProxyTargetMap.set(toString, nativeToString);
      const markAsNative = ensureMarkAsNative();
      markAsNative(toString, 'toString');

      Object.defineProperty(Function.prototype, 'toString', installDesc);

      const installedDesc = nativeGetOwnProp(Function.prototype, 'toString');
      if (!installedDesc || installedDesc.value !== toString) {
        throw new Error('[CoreWindow] toString install descriptor mismatch');
      }
      if (!!installedDesc.writable !== !!installDesc.writable
        || !!installedDesc.configurable !== !!installDesc.configurable
        || !!installedDesc.enumerable !== !!installDesc.enumerable) {
        throw new Error('[CoreWindow] toString install flags mismatch');
      }

      let nonFnErr = null;
      try {
        Reflect.apply(toString, {}, []);
      } catch (e) {
        nonFnErr = e;
      }
      if (!nonFnErr) {
        throw new Error('[CoreWindow] toString brand-check lost');
      }

      const directProbe = function coreToStringProbe(){};
      const expectedNative = Reflect.apply(nativeToString, directProbe, []);
      const actualNative = Reflect.apply(toString, directProbe, []);
      if (actualNative !== expectedNative) {
        throw new Error('[CoreWindow] toString native forwarding mismatch');
      }

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
    } catch (e) {
      try {
        toStringProxyTargetMap.delete(toString);
        toStringOverrideMap.delete(toString);
      } catch (mapErr) {
        if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:toString_maps_restore_failed", mapErr);
      }

      try {
        if (typeof currentToString === 'function') {
          Object.defineProperty(Function.prototype, 'toString', {
            value: currentToString,
            writable: toStringDesc ? !!toStringDesc.writable : true,
            configurable: toStringDesc ? !!toStringDesc.configurable : true,
            enumerable: toStringDesc ? !!toStringDesc.enumerable : false
          });
        }
      } catch (restoreErr) {
        if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:toString_restore_failed", restoreErr);
        throw restoreErr;
      }

      try {
        if (prevCoreStateDesc) {
          Object.defineProperty(window, '__CORE_TOSTRING_STATE__', prevCoreStateDesc);
        } else {
          delete window.__CORE_TOSTRING_STATE__;
        }
      } catch (stateErr) {
        if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:toString_state_restore_failed", stateErr);
        throw stateErr;
      }

      if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:toString_install_failed", e);
      throw e;
    }
  }

  // === Core2.0 targets dispatcher (Window scope) ===
  // Methodology: Core controls preflight/dispatch/nativization/diag. Module applies descriptors.
  (function installCoreApplyTargets(){
    function diagDegrade(code, err, extra) {
      try {
        if (typeof window.__DEGRADE__ === 'function') window.__DEGRADE__(code, err, extra);
      } catch (_) {}
    }
    function normalizePolicy(v) {
      return v === 'throw' ? 'throw' : 'skip';
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
        if (invalidPolicy === 'throw') throw new TypeError();
        if (typeof origFn === 'function') return Reflect.apply(origFn, self, args || []);
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
        const valueFromGetter = function (thisArg) {
          return (typeof getter === 'function') ? getter.call(thisArg) : getter;
        };

        if (options.mark === false) {
          return Object.getOwnPropertyDescriptor(({ get [key]() {
            if (checkThis && !checkThis(this)) {
              return onInvalidThis(invalidThis, origGet, this, arguments);
            }
            return valueFromGetter(this);
          }}), key).get;
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

      function defineAccWithFallback(target, key, getter, options) {
        if (safeDefineAcc(target, key, getter, options)) return true;
        throw new TypeError('[Core.defineAccWithFallback] failed to define ' + key);
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
        if (desc && !hasAccessorShape(desc)) {
          const e = new TypeError('[Core.applyTargets] kind mismatch for accessor');
          return fail(planItem.policy, planItem.tag, 'kind_mismatch', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId });
        }
        if (desc && !desc.configurable) {
          const e = new TypeError('[Core.applyTargets] non-configurable accessor');
          return fail(planItem.policy, planItem.tag, 'non_configurable', e, { key: planItem.key, kind: planItem.kind, targetId: planItem.targetId });
        }

        const key = planItem.key;
        const origGet = desc && typeof desc.get === 'function' ? desc.get : undefined;
        const origSet = desc && typeof desc.set === 'function' ? desc.set : undefined;
        const getImpl = typeof t.getImpl === 'function' ? t.getImpl : null;
        const setImpl = typeof t.setImpl === 'function' ? t.setImpl : null;
        const validThis = typeof t.validThis === 'function' ? t.validThis : null;
        const invalidThis = t.invalidThis || 'native';
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
              mark: true
            });
          } else if (getImpl) {
            const computedGetter = function coreAccessorGetCreate() {
              return getImpl.call(this, undefined);
            };
            const createDesc = {
              configurable: Object.prototype.hasOwnProperty.call(t, 'configurable') ? !!t.configurable : true,
              enumerable: Object.prototype.hasOwnProperty.call(t, 'enumerable') ? !!t.enumerable : true
            };
            getWrapped = wrapGetter(key, computedGetter, createDesc, validThis, {
              invalidThis: invalidThis,
              mark: true
            });
          }
          if (origSet) {
            setWrapped = __wrapNativeAccessor(origSet, 'set ' + key, function (target, thisArg, argList) {
              const args = argList || [];
              const v = args[0];
              if (validThis && !validThis(thisArg)) {
                return onInvalidThis(invalidThis, origSet, thisArg, args);
              }
              if (setImpl) return setImpl.call(thisArg, origSet, v);
              return Reflect.apply(origSet, thisArg, args);
            });
            knownWrapped.add(setWrapped);
          } else if (setImpl) {
            const setRaw = buildNamedAccessor(key, 'set', function coreAccessorSetCreate(v) {
              if (validThis && !validThis(this)) {
                return onInvalidThis(invalidThis, undefined, this, [v]);
              }
              return setImpl.call(this, undefined, v);
            });
            setWrapped = __wrapNativeAccessor(setRaw, 'set ' + key, function (target, thisArg, argList) {
              return Reflect.apply(target, thisArg, argList || []);
            });
            knownWrapped.add(setWrapped);
          }
        } catch (e) {
          return fail(planItem.policy, planItem.tag, 'mark_failed', e, { key, kind: planItem.kind, targetId: planItem.targetId });
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
        if (requiresStrictThis && !validThis) {
          const e = new TypeError('[Core.applyTargets] invokeClass requires validThis');
          return fail(planItem.policy, planItem.tag, 'invoke_class_requires_valid_this', e, {
            key: planItem.key,
            kind: planItem.kind,
            targetId: planItem.targetId,
            invokeClass
          });
        }
        function invokeMethodPath(self, inputArgs) {
          const args = Array.prototype.slice.call(inputArgs || []);
          if (validThis && !validThis(self)) {
            return onInvalidThis(invalidThis, orig, self, args);
          }
          const out = invoke
            ? invoke.call(self, orig, args)
            : Reflect.apply(orig, self, args);
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
          wrapped = __wrapNativeApply(orig, key, function (target, thisArg, argList) {
            return invokeMethodPath(thisArg, argList);
          });
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
        if (requiresStrictThis && !validThis) {
          const e = new TypeError('[Core.applyTargets] invokeClass requires validThis');
          return fail(planItem.policy, planItem.tag, 'invoke_class_requires_valid_this', e, {
            key: planItem.key,
            kind: planItem.kind,
            targetId: planItem.targetId,
            invokeClass
          });
        }
        function invokePromisePath(self, inputArgs) {
          const args = Array.prototype.slice.call(inputArgs || []);
          const out = (validThis && !validThis(self))
            ? onInvalidThis(invalidThis, orig, self, args)
            : (invoke ? invoke.call(self, orig, args) : Reflect.apply(orig, self, args));

          if (!isPromiseLike(out)) {
            const e = new TypeError('[Core.applyTargets] promise_method must return Promise');
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
          wrapped = __wrapNativeApply(orig, key, function (target, thisArg, argList) {
            return invokePromisePath(thisArg, argList);
          });
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
        const policy = normalizePolicy(item.policy);
        const tag = item.diagTag ? String(item.diagTag) : 'core:applyTargets';
        const targetId = item.targetId ? String(item.targetId) : ('pf:' + sameTargetKey(owner, key));
        const allowCreate = !!item.allowCreate;
        const resolveMode = normalizeResolveMode(item.resolve);
        if (!owner || (typeof owner !== 'object' && typeof owner !== 'function')) {
          return { ok: false, reason: 'owner_invalid', error: new TypeError('[Core.applyTargets] owner invalid'), tag, policy, targetId, key: key || null, kind: kind || null };
        }
        if (typeof key !== 'string' || !key) {
          return { ok: false, reason: 'key_invalid', error: new TypeError('[Core.applyTargets] key invalid'), tag, policy, targetId, key: key || null, kind: kind || null };
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
        if (desc && kind === 'data') {
          if (!hasDataShape(desc)) {
            return { ok: false, reason: 'kind_mismatch', error: new TypeError('[Core.applyTargets] kind mismatch for data'), tag, policy, targetId, key, kind };
          }
          if (!(desc.configurable || desc.writable)) {
            return { ok: false, reason: 'non_configurable', error: new TypeError('[Core.applyTargets] non-configurable and non-writable'), tag, policy, targetId, key, kind };
          }
        }
        if (desc && kind === 'accessor') {
          if (!hasAccessorShape(desc)) {
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
          resolve: resolveMode,
          desc: cloneDesc(desc),
          allowCreate
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

        function fail(policy, tag, code, err, extra) {
          diagDegrade(tag + ':' + code, err, extra);
          if (policy === 'throw') throw err;
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
              targetId: preflight.targetId
            });
          }
          const owner = preflight.descriptorOwner || preflight.owner;
          const key = preflight.key;
          const kind = preflight.kind;
          const invokeClass = preflight.invokeClass || 'normal';
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
      safeDefine(Core, 'defineAccWithFallback', {
        value: defineAccWithFallback,
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
      safeDefine(Core, '__wrapGetter', {
        value: wrapGetter,
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, '__safeDefineAcc', {
        value: safeDefineAcc,
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, '__defineAccWithFallback', {
        value: defineAccWithFallback,
        writable: true,
        configurable: true,
        enumerable: false
      });
      safeDefine(Core, '__redefineAcc', {
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
        coreMark(defineAccWithFallback, 'defineAccWithFallback');
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

  window.__CORE_WINDOW_LOADED__ = true;
}

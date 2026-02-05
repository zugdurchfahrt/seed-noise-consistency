const CoreWindowModule = function CoreWindowModule(window) {
  'use strict';
  const env = window && window.env;

  if (!window || (typeof window !== 'object' && typeof window !== 'function')) {
    throw new Error('[CoreWindow] window missing');
  }
  if (window.__CORE_WINDOW_LOADED__) return;

  // --- nativization provider (moved from RTCPeerConnection.js) ---
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

  // export for consumers (hide_webdriver.js and others)
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
  const existingToStringBridge = !!(existingToString && existingToString.__TOSTRING_BRIDGE__);
  if (existingToStringBridge) {
    const missingNative = (typeof existingToString.__NativeToString !== 'function');
    const missingMap = !(existingToString.__NativeToStringMap instanceof WeakMap);
    if (missingNative || missingMap) {
      try {
        if (missingNative) {
          Object.defineProperty(existingToString, '__NativeToString', {
            value: existingToString,
            writable: false,
            configurable: true,
            enumerable: false
          });
        }
        if (missingMap) {
          Object.defineProperty(existingToString, '__NativeToStringMap', {
            value: new WeakMap(),
            writable: false,
            configurable: true,
            enumerable: false
          });
        }
      } catch (e) {
        if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:toString_bridge_restore_failed", e);
        throw e;
      }
    }
    if (typeof existingToString.__NativeToString !== 'function' || !(existingToString.__NativeToStringMap instanceof WeakMap)) {
      const e = new Error('[CoreWindow] toString bridge invalid');
      if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:toString_bridge_invalid", e);
      throw e;
    }
  }
  const nativeToString = existingToStringBridge
    ? existingToString.__NativeToString
    : (existingToString || Function.prototype.toString);
  if (typeof nativeToString !== 'function') {
    throw new Error('[CoreWindow] Function.prototype.toString missing');
  }
  const existingToStringMap = existingToStringBridge
    ? existingToString.__NativeToStringMap
    : null;
  const toStringOverrideMap = existingToStringMap || new WeakMap();
  const toStringProxyTargetMap = new WeakMap();

  // Unified global function-mask
  function baseMarkAsNative(func, name = "") {
    if (typeof func !== 'function') return func;
    try {
      // If a Proxy created by __wrapNativeApply is passed here by mistake,
      // redirect masking to the stable native target reference.
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
    if (!baseMarkAsNative.__TOSTRING_BRIDGE__) {
      Object.defineProperty(baseMarkAsNative, '__TOSTRING_BRIDGE__', {
        value: true,
        writable: false,
        configurable: true,
        enumerable: false
      });
    }
    memoMarkAsNative = baseMarkAsNative;
    return memoMarkAsNative;
  }

// Global Function.prototype.toString bridge (no Proxy to avoid [as apply] frames)
      // IMPORTANT:
    // - preserve native brand-check semantics:
    //   Function.prototype.toString MUST throw when receiver is not a Function
    // - therefore NEVER return overrides for non-functions (objects/proxies/etc)



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
    // Use Proxy(nativeFn,{apply}) so name/length/prototype-shape come from nativeFn.
    const wrapped = new Proxy(nativeFn, {
      apply(target, thisArg, argList) {
        return applyImpl(target, thisArg, argList);
      }
    });
    const markAsNative = __requireMarkAsNative();
    try {
      // Methodology: key the stable original reference; Proxy is only an outward wrapper.
      toStringProxyTargetMap.set(wrapped, nativeFn);
      markAsNative(nativeFn, name || nativeFn.name || "");
    } catch (e) {
      if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:wrapNativeApply:mark_failed", e);
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


  {
    const toStringDesc = nativeGetOwnProp(Function.prototype, 'toString');
    const existingToString = toStringDesc && toStringDesc.value;
    if (existingToString && existingToString.__TOSTRING_BRIDGE__) {
      const markAsNative = ensureMarkAsNative();
      const probe = function probe(){};
      markAsNative(probe);
      const expected = toStringOverrideMap.get(probe);
      if (expected === undefined) {
        const e = new Error('[CoreWindow] toString probe missing label');
        if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:toString_probe_missing", e);
        throw e;
      }
      const actual = existingToString.call(probe);
      if (actual !== expected) {
        const e = new Error('[CoreWindow] toString bridge mismatch');
        if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:toString_bridge_mismatch", e);
        throw e;
      }
      if (existingToString.__TOSTRING_PROXY_INSTALLED__ !== true) {
        safeDefine(existingToString, '__TOSTRING_PROXY_INSTALLED__', {
          value: true,
          writable: false,
          configurable: true,
          enumerable: false
        });
      }
    } else {
      const toString = ({ toString() {
        if (typeof this !== 'function') {
          return nativeToString.call(this);
        }
        const v = toStringOverrideMap.get(this);
        if (v !== undefined) return v;
        // Proxy-wrapped native: resolve by stable target reference.
        const t = toStringProxyTargetMap.get(this);
        if (t) {
          const tv = toStringOverrideMap.get(t);
          if (tv !== undefined) return tv;
        }
        return nativeToString.call(this);
      }}).toString;

      Object.defineProperty(toString, '__TOSTRING_BRIDGE__', {
        value: true,
        writable: false,
        configurable: true,
        enumerable: false
      });
      Object.defineProperty(toString, '__NativeToString', {
        value: nativeToString,
        writable: false,
        configurable: true,
        enumerable: false
      });
      Object.defineProperty(toString, '__NativeToStringMap', {
        value: toStringOverrideMap,
        writable: false,
        configurable: true,
        enumerable: false
      });
      Object.defineProperty(toString, '__TOSTRING_PROXY_INSTALLED__', {
        value: true,
        writable: false,
        configurable: true,
        enumerable: false
      });
      const markAsNative = ensureMarkAsNative();
      markAsNative(toString, 'toString');

      Object.defineProperty(Function.prototype, 'toString', {
        value: toString,
        writable: toStringDesc ? !!toStringDesc.writable : true,
        configurable: toStringDesc ? !!toStringDesc.configurable : true,
        enumerable: toStringDesc ? !!toStringDesc.enumerable : false
      });
    }
  }

  window.__CORE_WINDOW_LOADED__ = true;
}

const CoreWindowModule = function CoreWindowModule(window) {
  'use strict';
  if (!window || (typeof window !== 'object' && typeof window !== 'function')) {
    throw new Error('[CoreWindow] window missing');
  }
  if (window.__CORE_WINDOW_LOADED__) return;

  // --- nativization provider (moved from RTCPeerConnection.js) ---
  function safeDefine(obj, prop, descriptor) {
    try {
      if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return;
      if (Object.prototype.hasOwnProperty.call(obj, prop)) delete obj[prop];
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
  const nativeToString = (fpToStringDesc && fpToStringDesc.value) || Function.prototype.toString;

  const existingToStringMap = (window.__NativeToStringMap instanceof WeakMap)
    ? window.__NativeToStringMap
    : null;
  const toStringOverrideMap = existingToStringMap || new WeakMap();
  try {
    if (Object.prototype.hasOwnProperty.call(window, '__NativeToString')) delete window.__NativeToString;
  } catch (_) {}
  try {
    if (Object.prototype.hasOwnProperty.call(window, '__NativeToStringMap')) delete window.__NativeToStringMap;
  } catch (_) {}
  try {
    if (Object.prototype.hasOwnProperty.call(window, '__TOSTRING_PROXY_INSTALLED__')) delete window.__TOSTRING_PROXY_INSTALLED__;
  } catch (_) {}

  // Unified global function-mask
  function baseMarkAsNative(func, name = "") {
    if (typeof func !== 'function') return func;
    try {
      const n = name || func.name || "";
      const label = n ? `function ${n}() { [native code] }` : 'function () { [native code] }';
      toStringOverrideMap.set(func, label);
    } catch (e) {
      if (typeof env !== "undefined" && env && env.DEBUG_DEGRADES && typeof __DEGRADE__ === "function") __DEGRADE__("hide_webdriver.js:baseMarkAsNative:override_set_failed", e);
    }
    return func;
  }

  function ensureMarkAsNative() {
    const existing = (typeof window.markAsNative === 'function') ? window.markAsNative : null;
    if (!existing) {
      baseMarkAsNative.__TOSTRING_BRIDGE__ = true;
      safeDefine(window, 'markAsNative', {
        value: baseMarkAsNative,
        writable: true,
        configurable: true,
        enumerable: false
      });
      return baseMarkAsNative;
    }
    if (existing.__TOSTRING_BRIDGE__) return existing;
    const wrapped = function markAsNative(func, name = "") {
      const out = existing(func, name);
      return baseMarkAsNative(out, name);
    };
    wrapped.__TOSTRING_BRIDGE__ = true;
    safeDefine(window, 'markAsNative', {
      value: wrapped,
      writable: true,
      configurable: true,
      enumerable: false
    });
    return wrapped;
  }

  if (typeof window.__ensureMarkAsNative !== 'function') {
    safeDefine(window, '__ensureMarkAsNative', {
      value: ensureMarkAsNative,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }

  // Global Function.prototype.toString bridge (no Proxy to avoid [as apply] frames)
        // IMPORTANT:
      // - preserve native brand-check semantics:
      //   Function.prototype.toString MUST throw when receiver is not a Function
      // - therefore NEVER return overrides for non-functions (objects/proxies/etc)
  {
    const toStringDesc = nativeGetOwnProp(Function.prototype, 'toString');
    const existingToString = toStringDesc && toStringDesc.value;
    if (!existingToString || !existingToString.__TOSTRING_BRIDGE__) {
      const nativeApply = Function.prototype.apply;
      const toString = ({ toString() {
        if (typeof this !== 'function') {
          return nativeApply.call(nativeToString, this, arguments);
        }
        const v = toStringOverrideMap.get(this);
        if (v !== undefined) return v;
        return nativeApply.call(nativeToString, this, arguments);
      }}).toString;

      toString.__TOSTRING_BRIDGE__ = true;
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

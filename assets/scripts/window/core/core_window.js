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

  // export for consumers 
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

  if (!existingCoreToStringStateOk) {
    const legacyBridge = !!(existingToString && existingToString.__TOSTRING_BRIDGE__);
    if (legacyBridge) {
      const e = new Error('[CoreWindow] legacy toString bridge detected without state');
      if (typeof __DEGRADE__ === "function") __DEGRADE__("core_window:toString_legacy_bridge_without_state", e);
      throw e;
    }
  }

  const nativeToString = existingCoreToStringStateOk
    ? existingCoreToStringState.nativeToString
    : (existingToString || Function.prototype.toString);
  if (typeof nativeToString !== 'function') {
    throw new Error('[CoreWindow] Function.prototype.toString missing');
  }

  const toStringOverrideMap = existingCoreToStringStateOk
    ? existingCoreToStringState.overrideMap
    : new WeakMap();
  const toStringProxyTargetMap = existingCoreToStringStateOk
    ? existingCoreToStringState.proxyTargetMap
    : new WeakMap();

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
    const currentToString = toStringDesc && toStringDesc.value;

    // Validate any existing bridge state, then (re)install toString wrapper.
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
        // Preserve native brand-check semantics.
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

    // Ensure self-toString looks native when inspected via our bridge.
    toStringProxyTargetMap.set(toString, nativeToString);

    const markAsNative = ensureMarkAsNative();
    markAsNative(toString, 'toString');

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

    Object.defineProperty(Function.prototype, 'toString', {
      value: toString,
      writable: toStringDesc ? !!toStringDesc.writable : true,
      configurable: toStringDesc ? !!toStringDesc.configurable : true,
      enumerable: toStringDesc ? !!toStringDesc.enumerable : false
    });
  }

  // === Core2.0 minimal targets dispatcher (Window scope) ===
  // Methodology: no new architecture; only unify execution mechanics for one initial kind ("method").
  (function installCoreApplyTargets(){
    function diagDegrade(code, err, extra) {
      try {
        if (typeof window.__DEGRADE__ === 'function') window.__DEGRADE__(code, err, extra);
      } catch (_) {}
    }
    try {
      const existing = window.Core;
      if (existing && typeof existing.applyTargets === 'function') return;

      const Core = (existing && (typeof existing === 'object' || typeof existing === 'function'))
        ? existing
        : {};

      function applyTargets(targets, profile, diag) {
        const list = Array.isArray(targets) ? targets : [];
        if (!list.length) return [];

        const markAsNative = ensureMarkAsNative();
        const planned = [];

        for (let i = 0; i < list.length; i++) {
          const t = list[i] || {};
          const owner = t.owner;
          const key = t.key;
          const kind = t.kind;
          const mode = t.mode || 'post_process_only';
          const policy = (t.policy === 'throw') ? 'throw' : 'skip';
          const tag = t.diagTag ? String(t.diagTag) : 'core:applyTargets';

          if (!owner || (typeof owner !== 'object' && typeof owner !== 'function')) {
            const e = new TypeError('[Core.applyTargets] owner invalid');
            diagDegrade(tag + ':owner_invalid', e, { key: key || null, kind: kind || null });
            if (policy === 'throw') throw e;
            return [];
          }
          if (typeof key !== 'string' || !key) {
            const e = new TypeError('[Core.applyTargets] key invalid');
            diagDegrade(tag + ':key_invalid', e, { kind: kind || null });
            if (policy === 'throw') throw e;
            return [];
          }
          if (kind !== 'method') {
            const e = new TypeError('[Core.applyTargets] unsupported kind');
            diagDegrade(tag + ':kind_unsupported', e, { key, kind: kind || null });
            if (policy === 'throw') throw e;
            return [];
          }
          if (mode !== 'post_process_only') {
            const e = new TypeError('[Core.applyTargets] unsupported method mode');
            diagDegrade(tag + ':mode_unsupported', e, { key, mode: mode || null });
            if (policy === 'throw') throw e;
            return [];
          }

          const desc = Object.getOwnPropertyDescriptor(owner, key);
          if (!desc) {
            const e = new Error('[Core.applyTargets] descriptor missing');
            diagDegrade(tag + ':descriptor_missing', e, { key });
            if (policy === 'throw') throw e;
            return [];
          }
          if (typeof desc.value !== 'function') {
            const e = new TypeError('[Core.applyTargets] descriptor.value not function');
            diagDegrade(tag + ':not_function', e, { key, type: typeof desc.value });
            if (policy === 'throw') throw e;
            return [];
          }
          if (!(desc.configurable || desc.writable)) {
            const e = new TypeError('[Core.applyTargets] non-configurable and non-writable');
            diagDegrade(tag + ':non_configurable_non_writable', e, { key });
            if (policy === 'throw') throw e;
            return [];
          }

          const orig = desc.value;
          const hooksPost = Array.isArray(t.hooksPost) ? t.hooksPost : [];
          const wrappedRaw = ({ [key]() {
            const args = Array.prototype.slice.call(arguments);
            const out = Reflect.apply(orig, this, args);
            if (typeof out !== 'string' || !hooksPost.length) return out;
            let res = out;
            for (let j = 0; j < hooksPost.length; j++) {
              const hook = hooksPost[j];
              if (typeof hook !== 'function') continue;
              try {
                const r = hook.call(this, res, ...args);
                if (typeof r === 'string') res = r;
              } catch (e) {
                diagDegrade(tag + ':hooksPost_failed', e, { key, hook: hook && (hook.name || null) });
                return out;
              }
            }
            return res;
          } })[key];

          let wrapped;
          try {
            wrapped = markAsNative(wrappedRaw, key);
          } catch (e) {
            diagDegrade(tag + ':mark_failed', e, { key });
            if (policy === 'throw') throw e;
            return [];
          }

          planned.push({
            owner,
            key,
            kind,
            mode,
            policy,
            tag,
            desc,
            value: wrapped,
          });
        }

        try {
          if (diag && typeof diag === 'object' && typeof diag.push === 'function') {
            diag.push({ planned: planned.length, total: list.length });
          }
        } catch (_) {}
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
      try { ensureMarkAsNative()(applyTargets, 'applyTargets'); } catch (_) {}

    } catch (e) {
      diagDegrade('core:installCoreApplyTargets:failed', e);
      throw e;
    }
  })();

  window.__CORE_WINDOW_LOADED__ = true;
}

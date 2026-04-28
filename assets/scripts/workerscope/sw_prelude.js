(() => {
  'use strict';

  const G = globalThis;
  const __MODULE = 'sw_prelude';
  const __SURFACE = 'service_worker';
  const __D = G && G.__DEGRADE__;
  const __diag = (__D && typeof __D.diag === 'function') ? __D.diag.bind(__D) : null;
  const __applied = [];

  function __serializeRelayErr(err) {
    if (!err) return null;
    const out = {};
    try { if (typeof err.name === 'string' && err.name) out.name = err.name; } catch (e) {}
    try { if (typeof err.message === 'string' && err.message) out.message = err.message; } catch (e) {}
    try { if (typeof err.stack === 'string' && err.stack) out.stack = err.stack; } catch (e) {}
    if (!Object.keys(out).length) {
      try { out.message = String(err); } catch (e) { out.message = 'service worker relay error'; }
    }
    return out;
  }

  const __swDiagBindingName = '__SW_REPORT_DIAG__';
  const __swDiagReporter =
    (G && typeof G[__swDiagBindingName] === 'function') ? G[__swDiagBindingName] : null;

  const __swDiagBindingDesc = G ? Object.getOwnPropertyDescriptor(G, __swDiagBindingName) : null;
  if (__swDiagBindingDesc && __swDiagBindingDesc.configurable === true) {
    __trackDeleteOwnIfConfigurable(G, __swDiagBindingName);
  }

  function __resolveWorkerBridgeRuntime() {
    const C = (G && G.CanvasPatchContext && typeof G.CanvasPatchContext === 'object')
      ? G.CanvasPatchContext
      : null;
    const stateRoot = (C && C.state && typeof C.state === 'object')
      ? C.state
      : null;
    const wrkState = (stateRoot && stateRoot.__WRK__ && typeof stateRoot.__WRK__ === 'object')
      ? stateRoot.__WRK__
      : null;
    const runtimeRoot = (wrkState && wrkState.runtime && typeof wrkState.runtime === 'object')
      ? wrkState.runtime
      : null;
    return runtimeRoot;
  }

  const __swRuntimeRoot = __resolveWorkerBridgeRuntime();
  const __swBootstrapEnvLiteral = (typeof __SW_BOOTSTRAP_ENV__ === 'object' && __SW_BOOTSTRAP_ENV__)
    ? __SW_BOOTSTRAP_ENV__
    : null;
  const __swWrapNativeApply = (__swRuntimeRoot && typeof __swRuntimeRoot.__wrapNativeApply === 'function')
    ? __swRuntimeRoot.__wrapNativeApply
    : null;
  function __relaySWDiag(level, code, ctx, err) {
    try {
      const reporter = __swDiagReporter;
      if (typeof reporter !== 'function') return;
      const x = (ctx && typeof ctx === 'object') ? ctx : {};
      reporter(JSON.stringify({
        level: (typeof level === 'string' && level) ? level : 'info',
        code: String(code || 'sw_prelude:diag'),
        ctx: {
          module: (typeof x.module === 'string' && x.module) ? x.module : __MODULE,
          diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : __MODULE,
          surface: (typeof x.surface === 'string' && x.surface) ? x.surface : __SURFACE,
          key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
          stage: (typeof x.stage === 'string' && x.stage) ? x.stage : 'runtime',
          message: (typeof x.message === 'string' && x.message) ? x.message : String(code || __MODULE),
          data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
          type: (typeof x.type === 'string' && x.type) ? x.type : 'pipeline missing data'
        },
        error: __serializeRelayErr(err)
      }));
    } catch (relayErr) {
      if (!__storeHiddenDiagSlot(G, '__SW_REPORT_DIAG_ERROR__', relayErr)) {
        try {
          __storeHiddenDiagSlot(G, '__SW_REPORT_DIAG_STORE_ERROR__', relayErr);
        } catch (storeErr) {
          __storeHiddenDiagSlot(G, '__SW_REPORT_DIAG_STORE_ERROR__', storeErr);
        }
      }
    }
  }

  function __emit(level, code, ctx, err) {
    try {
      if (__diag) {
        __diag(level, code, ctx, err);
      } else if (typeof __D === 'function') {
        const safeCtx = (ctx && typeof ctx === 'object') ? ctx : {};
        const safeErr = (err === undefined || err === null) ? null : err;
        __D(code, safeErr, Object.assign({}, safeCtx, { level: level || 'info' }));
      }
    } catch (emitErr) {
      if (!__storeHiddenDiagSlot(G, '__SW_EMIT_ERROR__', emitErr)) {
        try {
          __storeHiddenDiagSlot(G, '__SW_EMIT_STORE_ERROR__', emitErr);
        } catch (storeErr) {
          __storeHiddenDiagSlot(G, '__SW_EMIT_STORE_ERROR__', storeErr);
        }
      }
    }
    __relaySWDiag(level, code, ctx, err);
    return undefined;
  }

  function __swDiag(level, code, extra, err) {
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

  function __fail(code, extra, err) {
    const failure = err || new Error(String(code || __MODULE));
    __swDiag('error', code, extra, failure);
    throw failure;
  }

  function __reportNativeThrow(code, key, message, err) {
    __swDiag('warn', code, {
      stage: 'runtime',
      key: key || null,
      message: message,
      type: 'browser structure missing data',
      data: { outcome: 'throw', reason: 'native_throw' }
    }, err || null);
  }

  function __trackDefineProperty(obj, key, desc) {
    const hadOwn = Object.prototype.hasOwnProperty.call(obj, key);
    const prevDesc = hadOwn ? Object.getOwnPropertyDescriptor(obj, key) : null;
    Object.defineProperty(obj, key, desc);
    __applied.push({ obj, key, hadOwn, prevDesc });
  }

  function __trackDeleteOwnIfConfigurable(obj, key) {
    const ownDesc = Object.getOwnPropertyDescriptor(obj, key);
    if (!ownDesc || ownDesc.configurable !== true) return;
    delete obj[key];
    __applied.push({ obj, key, hadOwn: true, prevDesc: ownDesc });
  }

  function __storeHiddenDiagSlot(obj, key, value) {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return false;
    let text;
    try {
      text = String((value && (value.stack || value.message)) || value);
    } catch (e) {
      text = String(value);
    }
    try {
      Object.defineProperty(obj, key, {
        value: text,
        writable: true,
        configurable: true,
        enumerable: false
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  function __rollbackApplied() {
    for (let i = __applied.length - 1; i >= 0; i -= 1) {
      const item = __applied[i];
      if (!item || !item.obj) continue;
      if (item.hadOwn && item.prevDesc) {
        Object.defineProperty(item.obj, item.key, item.prevDesc);
      } else {
        delete item.obj[item.key];
      }
    }
  }

  const __swWrapStrictAccessor = (__swRuntimeRoot && typeof __swRuntimeRoot.__wrapStrictAccessor === 'function')
    ? __swRuntimeRoot.__wrapStrictAccessor
    : null;
  const __swApplyAccessorTargets = (__swRuntimeRoot && typeof __swRuntimeRoot.__applyAccessorTargets === 'function')
    ? __swRuntimeRoot.__applyAccessorTargets
    : null;

  function __dropBridgeExport(key) {
    try {
      const desc = G ? Object.getOwnPropertyDescriptor(G, key) : null;
      if (desc && desc.configurable === true) delete G[key];
    } catch (e) {}
  }

  __dropBridgeExport('__ensureMarkAsNative');
  __dropBridgeExport('__wrapNativeApply');
  __dropBridgeExport('__wrapNativeAccessor');
  __dropBridgeExport('__wrapStrictAccessor');
  __dropBridgeExport('__applyAccessorTargets');
  __dropBridgeExport('__wrapNativeCtor');
  __dropBridgeExport('__CORE_TOSTRING_STATE__');

  function __resolveDescriptor(startObj, key) {
    for (let cur = startObj; cur; cur = Object.getPrototypeOf(cur)) {
      let desc = null;
      try {
        desc = Object.getOwnPropertyDescriptor(cur, key) || null;
      } catch (e) {
        desc = null;
      }
      if (desc) return { owner: cur, desc };
    }
    return { owner: null, desc: null };
  }

  function __defineTrackedHiddenValue(obj, key, value) {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
      throw new Error('SW hidden owner missing for ' + String(key));
    }
    const desc = Object.getOwnPropertyDescriptor(obj, key);
    if (desc && desc.configurable === false) {
      return Object.prototype.hasOwnProperty.call(desc, 'value') ? desc.value : value;
    }
    __trackDefineProperty(obj, key, {
      value: value,
      writable: true,
      configurable: true,
      enumerable: false
    });
    return value;
  }

  function __ensureSwHiddenObject(owner, key) {
    if (!owner || (typeof owner !== 'object' && typeof owner !== 'function')) {
      throw new Error('SW hidden owner missing for ' + String(key));
    }
    if (Object.prototype.hasOwnProperty.call(owner, key) && owner[key] && typeof owner[key] === 'object') {
      return owner[key];
    }
    return __defineTrackedHiddenValue(owner, key, Object.create(null));
  }

  function __ensureSwBootstrapEnv() {
    if (!__swBootstrapEnvLiteral || typeof __swBootstrapEnvLiteral !== 'object') {
      throw new Error('SW bootstrap env literal missing');
    }
    const C = __ensureSwHiddenObject(G, 'CanvasPatchContext');
    const stateRoot = __ensureSwHiddenObject(C, 'state');
    const wrkState = __ensureSwHiddenObject(stateRoot, '__WRK__');
    const bootstrapRoot = __ensureSwHiddenObject(wrkState, 'bootstrap');
    const prev = Object.getOwnPropertyDescriptor(bootstrapRoot, '__SW_ENV__');
    const nextEnv = __cloneSwEnvValue(__swBootstrapEnvLiteral);
    if (prev && prev.configurable === false) {
      const cur = ('value' in prev) ? prev.value : bootstrapRoot.__SW_ENV__;
      const curJson = JSON.stringify(cur);
      const nextJson = JSON.stringify(nextEnv);
      if (curJson !== nextJson) {
        throw new Error('SW bootstrap env non-configurable mismatch');
      }
      return cur;
    }
    __defineTrackedHiddenValue(bootstrapRoot, '__SW_ENV__', nextEnv);
    return nextEnv;
  }

  function __resolveSwEnv() {
    const C = (G && G.CanvasPatchContext && typeof G.CanvasPatchContext === 'object')
      ? G.CanvasPatchContext
      : null;
    const stateRoot = (C && C.state && typeof C.state === 'object')
      ? C.state
      : null;
    const wrkState = (stateRoot && stateRoot.__WRK__ && typeof stateRoot.__WRK__ === 'object')
      ? stateRoot.__WRK__
      : null;
    const bootstrapRoot = (wrkState && wrkState.bootstrap && typeof wrkState.bootstrap === 'object')
      ? wrkState.bootstrap
      : null;
    if (!bootstrapRoot) return null;
    const envDesc = Object.getOwnPropertyDescriptor(bootstrapRoot, '__SW_ENV__');
    if (!envDesc) return null;
    return ('value' in envDesc) ? envDesc.value : bootstrapRoot.__SW_ENV__;
  }

  function __cloneSwEnvValue(value) {
    if (Array.isArray(value)) return value.map(__cloneSwEnvValue);
    if (ArrayBuffer.isView(value)) return Array.prototype.slice.call(value);
    if (value && typeof value === 'object') {
      const out = Object.create(null);
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i += 1) {
        out[keys[i]] = __cloneSwEnvValue(value[keys[i]]);
      }
      return out;
    }
    return value;
  }

  function __resolveCurrentSwWebglSnapshot() {
    const liveEnv = __resolveSwEnv();
    if (!liveEnv || typeof liveEnv !== 'object') {
      throw new Error('SW env missing');
    }
    const liveWebgl = liveEnv.webgl;
    if (!liveWebgl || typeof liveWebgl !== 'object') {
      throw new Error('SW webgl env missing');
    }
    if (typeof liveWebgl.vendor !== 'string' || !liveWebgl.vendor) throw new Error('SW webgl.vendor missing');
    if (typeof liveWebgl.renderer !== 'string' || !liveWebgl.renderer) throw new Error('SW webgl.renderer missing');
    if (typeof liveWebgl.unmaskedVendor !== 'string' || !liveWebgl.unmaskedVendor) throw new Error('SW webgl.unmaskedVendor missing');
    if (typeof liveWebgl.unmaskedRenderer !== 'string' || !liveWebgl.unmaskedRenderer) throw new Error('SW webgl.unmaskedRenderer missing');
    if (Object.prototype.hasOwnProperty.call(liveWebgl, 'compressedTextureFormats')) {
      const liveFormats = liveWebgl.compressedTextureFormats;
      if (!Array.isArray(liveFormats)) throw new Error('SW webgl.compressedTextureFormats invalid');
      for (let i = 0; i < liveFormats.length; i += 1) {
        if (typeof liveFormats[i] !== 'number' || !Number.isFinite(liveFormats[i])) {
          throw new Error('SW webgl.compressedTextureFormats invalid');
        }
      }
    }
    const liveCapabilities = (liveWebgl.webglCapabilities && typeof liveWebgl.webglCapabilities === 'object')
      ? liveWebgl.webglCapabilities
      : null;
    if (liveCapabilities) {
      if (typeof liveCapabilities.selected !== 'string' || !liveCapabilities.selected) {
        throw new Error('SW webgl.webglCapabilities.selected missing');
      }
      const capabilityKeys = ['webgl2', 'webgl', 'experimentalWebgl'];
      for (let i = 0; i < capabilityKeys.length; i += 1) {
        const capabilityKey = capabilityKeys[i];
        if (!Object.prototype.hasOwnProperty.call(liveCapabilities, capabilityKey)) continue;
        const capabilityEntry = liveCapabilities[capabilityKey];
        if (!capabilityEntry || typeof capabilityEntry !== 'object' || !Array.isArray(capabilityEntry.compressedTextureFormats)) {
          throw new Error('SW webgl.webglCapabilities.' + capabilityKey + ' invalid');
        }
        for (let j = 0; j < capabilityEntry.compressedTextureFormats.length; j += 1) {
          if (typeof capabilityEntry.compressedTextureFormats[j] !== 'number' || !Number.isFinite(capabilityEntry.compressedTextureFormats[j])) {
            throw new Error('SW webgl.webglCapabilities.' + capabilityKey + '.compressedTextureFormats invalid');
          }
        }
      }
      if (Array.isArray(liveWebgl.compressedTextureFormats)) {
        const selectedCapability = liveCapabilities[liveCapabilities.selected];
        if (!selectedCapability || typeof selectedCapability !== 'object' || !Array.isArray(selectedCapability.compressedTextureFormats)) {
          throw new Error('SW webgl.webglCapabilities.selected entry missing');
        }
        if (selectedCapability.compressedTextureFormats.length !== liveWebgl.compressedTextureFormats.length) {
          throw new Error('SW webgl.compressedTextureFormats selected mismatch');
        }
        for (let i = 0; i < liveWebgl.compressedTextureFormats.length; i += 1) {
          if (!Object.is(selectedCapability.compressedTextureFormats[i], liveWebgl.compressedTextureFormats[i])) {
            throw new Error('SW webgl.compressedTextureFormats selected mismatch');
          }
        }
      }
    }
    return liveWebgl;
  }

  try {
    __ensureSwBootstrapEnv();
    const env = __resolveSwEnv();
    if (!env || typeof env !== 'object') {
      __fail('sw_prelude:env_missing', {
        stage: 'preflight',
        key: 'CanvasPatchContext.state.__WRK__.bootstrap.__SW_ENV__',
        message: 'service worker env missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'env_missing' }
      }, new Error('SW env missing'));
    }

    const primary = env.language;
    const langs = env.languages;
    const hc = env.hardwareConcurrency;
    const dm = env.deviceMemory;
    const profileUaData = env.uaData;
    const profileHighEntropy = profileUaData && typeof profileUaData === 'object' && profileUaData.he && typeof profileUaData.he === 'object'
      ? profileUaData.he
      : null;
    const meta = (profileUaData && typeof profileUaData === 'object' && profileHighEntropy)
      ? {
          brands: profileUaData.brands,
          mobile: profileUaData.mobile,
          platform: profileUaData.platform,
          architecture: profileHighEntropy.architecture,
          bitness: profileHighEntropy.bitness,
          model: profileHighEntropy.model,
          platformVersion: profileHighEntropy.platformVersion,
          fullVersionList: profileHighEntropy.fullVersionList,
          wow64: profileHighEntropy.wow64,
          formFactors: profileHighEntropy.formFactors,
          language: primary,
          languages: Array.isArray(langs) ? langs.slice() : langs,
          hardwareConcurrency: Number(hc),
          deviceMemory: Number(dm)
        }
      : null;
    const webgl = env.webgl;

    if (typeof primary !== 'string' || !primary) {
      __fail('sw_prelude:language_invalid', {
        stage: 'preflight',
        key: 'language',
        message: 'service worker language invalid',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'language_invalid' }
      }, new Error('SW language invalid'));
    }
    if (!Array.isArray(langs) || !langs.length) {
      __fail('sw_prelude:languages_invalid', {
        stage: 'preflight',
        key: 'languages',
        message: 'service worker languages invalid',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'languages_invalid' }
      }, new Error('SW languages invalid'));
    }
    if (!Number.isFinite(Number(hc)) || Number(hc) <= 0) {
      __fail('sw_prelude:hardware_concurrency_invalid', {
        stage: 'preflight',
        key: 'hardwareConcurrency',
        message: 'service worker hardwareConcurrency invalid',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'hardware_concurrency_invalid' }
      }, new Error('SW hardwareConcurrency invalid'));
    }
    if (!Number.isFinite(Number(dm)) || Number(dm) <= 0) {
      __fail('sw_prelude:device_memory_invalid', {
        stage: 'preflight',
        key: 'deviceMemory',
        message: 'service worker deviceMemory invalid',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'device_memory_invalid' }
      }, new Error('SW deviceMemory invalid'));
    }
    if (!meta || typeof meta !== 'object') {
      __fail('sw_prelude:meta_invalid', {
        stage: 'preflight',
        key: 'meta',
        message: 'service worker uaData meta invalid',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'meta_invalid' }
      }, new Error('SW uaData meta invalid'));
    }
    if (!profileUaData || typeof profileUaData !== 'object' || !profileHighEntropy) {
      __fail('sw_prelude:uadata_snapshot_invalid', {
        stage: 'preflight',
        key: 'uaData',
        message: 'service worker uaData snapshot invalid',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'uadata_snapshot_invalid' }
      }, new Error('SW uaData snapshot invalid'));
    }
    if (!webgl || typeof webgl !== 'object') {
      __fail('sw_prelude:webgl_env_missing', {
        stage: 'preflight',
        key: 'webgl',
        message: 'service worker webgl env missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'webgl_env_missing' }
      }, new Error('SW webgl env missing'));
    }
    if (typeof webgl.vendor !== 'string' || !webgl.vendor) {
      __fail('sw_prelude:webgl_vendor_missing', {
        stage: 'preflight',
        key: 'webgl.vendor',
        message: 'service worker webgl.vendor missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'webgl_vendor_missing' }
      }, new Error('SW webgl.vendor missing'));
    }
    if (typeof webgl.renderer !== 'string' || !webgl.renderer) {
      __fail('sw_prelude:webgl_renderer_missing', {
        stage: 'preflight',
        key: 'webgl.renderer',
        message: 'service worker webgl.renderer missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'webgl_renderer_missing' }
      }, new Error('SW webgl.renderer missing'));
    }
    if (typeof webgl.unmaskedVendor !== 'string' || !webgl.unmaskedVendor) {
      __fail('sw_prelude:webgl_unmasked_vendor_missing', {
        stage: 'preflight',
        key: 'webgl.unmaskedVendor',
        message: 'service worker webgl.unmaskedVendor missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'webgl_unmasked_vendor_missing' }
      }, new Error('SW webgl.unmaskedVendor missing'));
    }
    if (typeof webgl.unmaskedRenderer !== 'string' || !webgl.unmaskedRenderer) {
      __fail('sw_prelude:webgl_unmasked_renderer_missing', {
        stage: 'preflight',
        key: 'webgl.unmaskedRenderer',
        message: 'service worker webgl.unmaskedRenderer missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'webgl_unmasked_renderer_missing' }
      }, new Error('SW webgl.unmaskedRenderer missing'));
    }
    const compressedTextureFormats = Array.isArray(webgl.compressedTextureFormats)
      ? webgl.compressedTextureFormats.slice()
      : null;
    if (compressedTextureFormats) {
      for (let i = 0; i < compressedTextureFormats.length; i += 1) {
        if (typeof compressedTextureFormats[i] !== 'number' || !Number.isFinite(compressedTextureFormats[i])) {
          __fail('sw_prelude:webgl_compressed_texture_formats_invalid', {
            stage: 'preflight',
            key: 'webgl.compressedTextureFormats',
            message: 'service worker webgl.compressedTextureFormats invalid',
            type: 'pipeline missing data',
            data: { outcome: 'throw', reason: 'webgl_compressed_texture_formats_invalid' }
          }, new Error('SW webgl.compressedTextureFormats invalid'));
        }
      }
    }
    const webglCapabilities = (webgl.webglCapabilities && typeof webgl.webglCapabilities === 'object')
      ? webgl.webglCapabilities
      : null;
    if (webglCapabilities) {
      if (typeof webglCapabilities.selected !== 'string' || !webglCapabilities.selected) {
        __fail('sw_prelude:webgl_capabilities_selected_missing', {
          stage: 'preflight',
          key: 'webgl.webglCapabilities.selected',
          message: 'service worker webgl.webglCapabilities.selected missing',
          type: 'pipeline missing data',
          data: { outcome: 'throw', reason: 'webgl_capabilities_selected_missing' }
        }, new Error('SW webgl.webglCapabilities.selected missing'));
      }
      const capabilityKeys = ['webgl2', 'webgl', 'experimentalWebgl'];
      for (let i = 0; i < capabilityKeys.length; i += 1) {
        const capabilityKey = capabilityKeys[i];
        if (!Object.prototype.hasOwnProperty.call(webglCapabilities, capabilityKey)) continue;
        const capabilityEntry = webglCapabilities[capabilityKey];
        if (!capabilityEntry || typeof capabilityEntry !== 'object' || !Array.isArray(capabilityEntry.compressedTextureFormats)) {
          __fail('sw_prelude:webgl_capabilities_entry_invalid', {
            stage: 'preflight',
            key: 'webgl.webglCapabilities.' + capabilityKey,
            message: 'service worker webgl.webglCapabilities entry invalid',
            type: 'pipeline missing data',
            data: { outcome: 'throw', reason: 'webgl_capabilities_entry_invalid' }
          }, new Error('SW webgl.webglCapabilities.' + capabilityKey + ' invalid'));
        }
        for (let j = 0; j < capabilityEntry.compressedTextureFormats.length; j += 1) {
          if (typeof capabilityEntry.compressedTextureFormats[j] !== 'number' || !Number.isFinite(capabilityEntry.compressedTextureFormats[j])) {
            __fail('sw_prelude:webgl_capabilities_entry_formats_invalid', {
              stage: 'preflight',
              key: 'webgl.webglCapabilities.' + capabilityKey + '.compressedTextureFormats',
              message: 'service worker webgl.webglCapabilities compressedTextureFormats invalid',
              type: 'pipeline missing data',
              data: { outcome: 'throw', reason: 'webgl_capabilities_entry_formats_invalid' }
            }, new Error('SW webgl.webglCapabilities.' + capabilityKey + '.compressedTextureFormats invalid'));
          }
        }
      }
    }
    if (compressedTextureFormats && webglCapabilities) {
      const selectedCapability = webglCapabilities[webglCapabilities.selected];
      if (!selectedCapability || typeof selectedCapability !== 'object' || !Array.isArray(selectedCapability.compressedTextureFormats)) {
        __fail('sw_prelude:webgl_compressed_texture_formats_selected_mismatch', {
          stage: 'preflight',
          key: 'webgl.compressedTextureFormats',
          message: 'service worker webgl.webglCapabilities selected entry missing',
          type: 'pipeline missing data',
          data: { outcome: 'throw', reason: 'webgl_compressed_texture_formats_selected_mismatch' }
        }, new Error('SW webgl.webglCapabilities.selected entry missing'));
      }
      if (selectedCapability.compressedTextureFormats.length !== compressedTextureFormats.length) {
        __fail('sw_prelude:webgl_compressed_texture_formats_selected_mismatch', {
          stage: 'preflight',
          key: 'webgl.compressedTextureFormats',
          message: 'service worker webgl.compressedTextureFormats selected mismatch',
          type: 'pipeline missing data',
          data: { outcome: 'throw', reason: 'webgl_compressed_texture_formats_selected_mismatch' }
        }, new Error('SW webgl.compressedTextureFormats selected mismatch'));
      }
      for (let i = 0; i < compressedTextureFormats.length; i += 1) {
        if (!Object.is(selectedCapability.compressedTextureFormats[i], compressedTextureFormats[i])) {
          __fail('sw_prelude:webgl_compressed_texture_formats_selected_mismatch', {
            stage: 'preflight',
            key: 'webgl.compressedTextureFormats',
            message: 'service worker webgl.compressedTextureFormats selected mismatch',
            type: 'pipeline missing data',
            data: { outcome: 'throw', reason: 'webgl_compressed_texture_formats_selected_mismatch' }
          }, new Error('SW webgl.compressedTextureFormats selected mismatch'));
        }
      }
    }
    if (typeof __swWrapStrictAccessor !== 'function') {
      __fail('sw_prelude:wrap_strict_accessor_missing', {
        stage: 'preflight',
        key: '__wrapStrictAccessor',
        message: 'service worker strict accessor bridge missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'wrap_strict_accessor_missing' }
      }, new Error('SW strict accessor bridge missing'));
    }
    if (typeof __swApplyAccessorTargets !== 'function') {
      __fail('sw_prelude:apply_accessor_targets_missing', {
        stage: 'preflight',
        key: '__applyAccessorTargets',
        message: 'service worker accessor target executor missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'apply_accessor_targets_missing' }
      }, new Error('SW accessor target executor missing'));
    }

    try {
      Object.freeze(langs);
    } catch (e) {
      __swDiag('warn', 'sw_prelude:languages_freeze_failed', {
        stage: 'apply',
        key: 'langs',
        message: 'languages freeze failed',
        type: 'browser structure missing data',
        data: { outcome: 'skip', reason: 'languages_freeze_failed' }
      }, e);
    }

    function __installServiceWorkerWebGLMirror(snapshot) {
      const OffscreenCanvasCtor = (typeof G.OffscreenCanvas === 'function') ? G.OffscreenCanvas : null;
      if (!OffscreenCanvasCtor || !OffscreenCanvasCtor.prototype) {
        __swDiag('info', 'sw_prelude:webgl_mirror_skipped', {
          stage: 'apply',
          key: 'OffscreenCanvas',
          message: 'service worker webgl mirror skipped',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'offscreen_canvas_missing' }
        }, null);
        return false;
      }
      if (typeof __swWrapNativeApply !== 'function') {
        __fail('sw_prelude:webgl_wrap_native_apply_missing', {
          stage: 'preflight',
          key: '__wrapNativeApply',
          message: 'service worker native apply bridge missing',
          type: 'pipeline missing data',
          data: { outcome: 'throw', reason: 'webgl_wrap_native_apply_missing' }
        }, new Error('SW __wrapNativeApply missing'));
      }
      const oscProto = OffscreenCanvasCtor.prototype;
      const dGetContext = Object.getOwnPropertyDescriptor(oscProto, 'getContext');
      if (!dGetContext || dGetContext.configurable === false || typeof dGetContext.value !== 'function') {
        __fail('sw_prelude:webgl_descriptor_missing', {
          stage: 'preflight',
          key: 'OffscreenCanvas.prototype.getContext',
          message: 'service worker OffscreenCanvas.getContext descriptor missing',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'webgl_descriptor_missing' }
        }, new Error('SW OffscreenCanvas.getContext descriptor missing'));
      }
      const nativeGetContext = dGetContext.value;
      const patchedContexts = (typeof WeakSet === 'function') ? new WeakSet() : null;
      const debugInfoCache = (typeof WeakMap === 'function') ? new WeakMap() : null;
      if (!patchedContexts || !debugInfoCache) {
        __fail('sw_prelude:webgl_weak_structures_missing', {
          stage: 'preflight',
          key: 'WeakSet',
          message: 'service worker webgl weak structures missing',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'webgl_weak_structures_missing' }
        }, new Error('SW webgl weak structures missing'));
      }

      const patchContextInstance = function(ctx) {
        if (!ctx || (typeof ctx !== 'object' && typeof ctx !== 'function')) return ctx;
        if (patchedContexts.has(ctx)) return ctx;
        patchedContexts.add(ctx);

        const dGetParameter = Object.getOwnPropertyDescriptor(ctx, 'getParameter');
        const origGetParameter = (dGetParameter && typeof dGetParameter.value === 'function')
          ? dGetParameter.value
          : (typeof ctx.getParameter === 'function' ? ctx.getParameter : null);
        if (!origGetParameter) {
          __fail('sw_prelude:webgl_get_parameter_missing', {
            stage: 'preflight',
            key: 'getParameter',
            message: 'service worker webgl getParameter missing',
            type: 'browser structure missing data',
            data: { outcome: 'throw', reason: 'webgl_get_parameter_missing' }
          }, new Error('SW webgl getParameter missing'));
        }

        const dGetExtension = Object.getOwnPropertyDescriptor(ctx, 'getExtension');
        const origGetExtension = (dGetExtension && typeof dGetExtension.value === 'function')
          ? dGetExtension.value
          : (typeof ctx.getExtension === 'function' ? ctx.getExtension : null);

        if (typeof origGetExtension === 'function') {
          const wrappedGetExtension = __swWrapNativeApply(origGetExtension, 'getExtension', function(target, thisArg, argList) {
            if (!thisArg || (typeof thisArg !== 'object' && typeof thisArg !== 'function') || !patchedContexts.has(thisArg)) {
              return Reflect.apply(target, thisArg, argList || []);
            }
            const ext = Reflect.apply(target, thisArg, argList || []);
            if ((argList && argList[0]) === 'WEBGL_debug_renderer_info') {
              debugInfoCache.set(thisArg, ext || null);
            }
            return ext;
          });
          __trackDefineProperty(ctx, 'getExtension', {
            configurable: dGetExtension ? !!dGetExtension.configurable : true,
            enumerable: dGetExtension ? !!dGetExtension.enumerable : false,
            writable: dGetExtension && Object.prototype.hasOwnProperty.call(dGetExtension, 'writable') ? dGetExtension.writable : true,
            value: wrappedGetExtension
          });
        }

        const wrappedGetParameter = __swWrapNativeApply(origGetParameter, 'getParameter', function(target, thisArg, argList) {
          if (!thisArg || (typeof thisArg !== 'object' && typeof thisArg !== 'function') || !patchedContexts.has(thisArg)) {
            return Reflect.apply(target, thisArg, argList || []);
          }
          const pname = argList && argList[0];
          const liveSnapshot = __resolveCurrentSwWebglSnapshot();
          const liveCompressedTextureFormats = Array.isArray(liveSnapshot.compressedTextureFormats)
            ? liveSnapshot.compressedTextureFormats
            : null;
          let dbg = debugInfoCache.has(thisArg) ? debugInfoCache.get(thisArg) : undefined;
          if (dbg === undefined) {
            dbg = null;
            if (typeof origGetExtension === 'function') {
              try {
                dbg = Reflect.apply(origGetExtension, thisArg, ['WEBGL_debug_renderer_info']);
              } catch (e) {
                __swDiag('warn', 'sw_prelude:webgl_debug_extension_native_throw', {
                  stage: 'runtime',
                  key: 'WEBGL_debug_renderer_info',
                  message: 'service worker WEBGL_debug_renderer_info probe failed',
                  type: 'browser structure missing data',
                  data: { outcome: 'throw', reason: 'native_throw' }
                }, e);
                dbg = null;
              }
            }
            debugInfoCache.set(thisArg, dbg);
          }
          if (dbg) {
            if (pname === dbg.UNMASKED_VENDOR_WEBGL) return liveSnapshot.unmaskedVendor;
            if (pname === dbg.UNMASKED_RENDERER_WEBGL) return liveSnapshot.unmaskedRenderer;
          }
          if (liveCompressedTextureFormats && (pname === thisArg.COMPRESSED_TEXTURE_FORMATS || pname === 0x86A3)) {
            return liveCompressedTextureFormats.slice();
          }
          if (pname === thisArg.VENDOR || pname === 0x1F00) return liveSnapshot.vendor;
          if (pname === thisArg.RENDERER || pname === 0x1F01) return liveSnapshot.renderer;
          return Reflect.apply(target, thisArg, argList || []);
        });
        __trackDefineProperty(ctx, 'getParameter', {
          configurable: dGetParameter ? !!dGetParameter.configurable : true,
          enumerable: dGetParameter ? !!dGetParameter.enumerable : false,
          writable: dGetParameter && Object.prototype.hasOwnProperty.call(dGetParameter, 'writable') ? dGetParameter.writable : true,
          value: wrappedGetParameter
        });
        return ctx;
      };

      const wrappedGetContext = __swWrapNativeApply(nativeGetContext, 'getContext', function(target, thisArg, argList) {
        const res = Reflect.apply(target, thisArg, argList || []);
        if (!res) return res;
        const kind = argList && argList[0];
        if (kind === 'webgl' || kind === 'webgl2' || kind === 'experimental-webgl') {
          return patchContextInstance(res);
        }
        return res;
      });
      __trackDefineProperty(oscProto, 'getContext', {
        configurable: !!dGetContext.configurable,
        enumerable: !!dGetContext.enumerable,
        writable: dGetContext && Object.prototype.hasOwnProperty.call(dGetContext, 'writable') ? dGetContext.writable : true,
        value: wrappedGetContext
      });
      __swDiag('info', 'sw_prelude:webgl_mirror_installed', {
        stage: 'apply',
        key: 'OffscreenCanvas.prototype.getContext',
        message: 'service worker webgl mirror installed',
        type: 'pipeline missing data',
        data: { outcome: 'return' }
      }, null);
      return true;
    }

    __installServiceWorkerWebGLMirror(webgl);

    const nav = G.navigator;
    if (!nav) {
      __fail('sw_prelude:navigator_missing', {
        stage: 'preflight',
        key: 'navigator',
        message: 'service worker navigator missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'navigator_missing' }
      }, new Error('SW navigator missing'));
    }
    const protoInfo = __resolveDescriptor(Object.getPrototypeOf(nav), 'language');
    const proto = Object.getPrototypeOf(nav);
    if (!proto) {
      __fail('sw_prelude:navigator_proto_missing', {
        stage: 'preflight',
        key: 'navigator',
        message: 'service worker navigator proto missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'navigator_proto_missing' }
      }, new Error('SW navigator proto missing'));
    }

    function __readNativeWorkerNavigatorValue(key) {
      const resolved = __resolveDescriptor(proto, key);
      if (!resolved || !resolved.desc) {
        throw new Error('SW ' + key + ' descriptor missing');
      }
      if (typeof resolved.desc.get === 'function') {
        return {
          owner: resolved.owner,
          desc: resolved.desc,
          value: Reflect.apply(resolved.desc.get, nav, [])
        };
      }
      if (Object.prototype.hasOwnProperty.call(resolved.desc, 'value')) {
        return {
          owner: resolved.owner,
          desc: resolved.desc,
          value: resolved.desc.value
        };
      }
      throw new Error('SW ' + key + ' descriptor unreadable');
    }

    function __isNonEmptyStringArray(value) {
      return Array.isArray(value) && value.length > 0 && value.every(function(entry) {
        return typeof entry === 'string' && entry.trim() !== '';
      });
    }

    function __stringArraysEqual(left, right) {
      if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
        return false;
      }
      for (let i = 0; i < left.length; i += 1) {
        if (left[i] !== right[i]) {
          return false;
        }
      }
      return true;
    }

    function __canonicalizeLanguageListForCompare(value) {
      if (!Array.isArray(value)) return null;
      const out = [];
      const seen = new Set();
      for (let i = 0; i < value.length; i += 1) {
        const entry = value[i];
        if (typeof entry !== 'string' || entry.trim() === '') return null;
        if (!seen.has(entry)) {
          seen.add(entry);
          out.push(entry);
        }
      }
      return out;
    }

    let swPrimaryValue = primary;
    let swLanguagesValue = Array.isArray(langs) ? langs.slice() : [];
    let swHardwareConcurrencyValue = Number(hc);
    let swDeviceMemoryValue = Number(dm);
    let swPatchHardwareConcurrency = false;

    try {
      const nativeLanguageRead = __readNativeWorkerNavigatorValue('language');
      if (typeof nativeLanguageRead.value === 'string' && nativeLanguageRead.value.trim() !== '') {
        if (nativeLanguageRead.value === primary) {
          __swDiag('info', 'sw_prelude:language_getter_value_match', {
            stage: 'preflight',
            key: 'language',
            message: 'service worker language already matches native getter',
            type: 'browser structure missing data',
            data: {
              outcome: 'return',
              reason: 'getter_value_match',
              nativeValue: nativeLanguageRead.value,
              profileValue: primary
            }
          }, null);
        } else {
          __swDiag('warn', 'sw_prelude:language_getter_value_mismatch', {
            stage: 'preflight',
            key: 'language',
            message: 'service worker language native getter value differs from profile value; native getter kept',
            type: 'browser structure missing data',
            data: {
              outcome: 'skip',
              reason: 'getter_value_mismatch',
              policy: 'skip',
              action: 'keep_native_getter',
              nativeValue: nativeLanguageRead.value,
              profileValue: primary
            }
          }, null);
        }
      } else {
        __swDiag('warn', 'sw_prelude:language_native_invalid', {
          stage: 'preflight',
          key: 'language',
          message: 'service worker native language is invalid; native getter kept',
          type: 'browser structure missing data',
          data: {
            outcome: 'skip',
            reason: 'native_invalid',
            nativeValue: nativeLanguageRead.value,
            profileValue: primary
          }
        }, null);
      }
    } catch (e) {
      __swDiag('warn', 'sw_prelude:language_native_read_failed', {
        stage: 'preflight',
        key: 'language',
        message: 'service worker native language read failed; native getter kept',
        type: 'browser structure missing data',
        data: {
          outcome: 'skip',
          reason: 'native_read_failed',
          profileValue: primary
        }
      }, e);
    }

    try {
      const nativeLanguagesRead = __readNativeWorkerNavigatorValue('languages');
      if (__isNonEmptyStringArray(nativeLanguagesRead.value)) {
        if (__stringArraysEqual(nativeLanguagesRead.value, Array.isArray(langs) ? langs : [])) {
          __swDiag('info', 'sw_prelude:languages_getter_value_match', {
            stage: 'preflight',
            key: 'languages',
            message: 'service worker languages already matches native getter',
            type: 'browser structure missing data',
            data: {
              outcome: 'return',
              reason: 'getter_value_match',
              nativeValue: nativeLanguagesRead.value.slice(),
              profileValue: Array.isArray(langs) ? langs.slice() : langs
            }
          }, null);
        } else {
          const nativeCanonical = __canonicalizeLanguageListForCompare(nativeLanguagesRead.value);
          const profileCanonical = __canonicalizeLanguageListForCompare(Array.isArray(langs) ? langs : []);
          if (nativeCanonical && profileCanonical && __stringArraysEqual(nativeCanonical, profileCanonical)) {
            __swDiag('info', 'sw_prelude:languages_profile_languages_canonicalized', {
              stage: 'preflight',
              key: 'languages',
              message: 'service worker profile languages duplicate-only mismatch canonicalized; native getter kept',
              type: 'browser structure missing data',
              data: {
                outcome: 'skip',
                reason: 'profile_languages_canonicalized',
                nativeValue: nativeLanguagesRead.value.slice(),
                profileValue: Array.isArray(langs) ? langs.slice() : langs,
                canonicalNativeValue: nativeCanonical,
                canonicalProfileValue: profileCanonical
              }
            }, null);
          } else {
            __swDiag('warn', 'sw_prelude:languages_getter_value_mismatch', {
              stage: 'preflight',
              key: 'languages',
              message: 'service worker languages native getter value differs from profile value; native getter kept',
              type: 'browser structure missing data',
              data: {
                outcome: 'skip',
                reason: 'getter_value_mismatch',
                policy: 'skip',
                action: 'keep_native_getter',
                nativeValue: nativeLanguagesRead.value.slice(),
                profileValue: Array.isArray(langs) ? langs.slice() : langs
              }
            }, null);
          }
        }
      } else {
        __swDiag('warn', 'sw_prelude:languages_native_invalid', {
          stage: 'preflight',
          key: 'languages',
          message: 'service worker native languages are invalid; native getter kept',
          type: 'browser structure missing data',
          data: {
            outcome: 'skip',
            reason: 'native_invalid',
            nativeValue: nativeLanguagesRead.value,
            profileValue: Array.isArray(langs) ? langs.slice() : langs
          }
        }, null);
      }
    } catch (e) {
      __swDiag('warn', 'sw_prelude:languages_native_read_failed', {
        stage: 'preflight',
        key: 'languages',
        message: 'service worker native languages read failed; native getter kept',
        type: 'browser structure missing data',
        data: {
          outcome: 'skip',
          reason: 'native_read_failed',
          profileValue: Array.isArray(langs) ? langs.slice() : langs
        }
      }, e);
    }

    if (!__isNonEmptyStringArray(swLanguagesValue)) {
      swLanguagesValue = [swPrimaryValue];
    } else if (swLanguagesValue[0] !== swPrimaryValue) {
      swLanguagesValue = [swPrimaryValue].concat(swLanguagesValue.filter(function(entry) {
        return entry !== swPrimaryValue;
      }));
    }
    try {
      Object.freeze(swLanguagesValue);
    } catch (e) {
      __swDiag('warn', 'sw_prelude:languages_snapshot_freeze_failed', {
        stage: 'preflight',
        key: 'languages',
        message: 'service worker language snapshot freeze failed',
        type: 'browser structure missing data',
        data: { outcome: 'skip', reason: 'languages_snapshot_freeze_failed' }
      }, e);
    }

    try {
      const nativeHardwareConcurrencyRead = __readNativeWorkerNavigatorValue('hardwareConcurrency');
      const nativeHardwareConcurrency = Number(nativeHardwareConcurrencyRead.value);
      if (Number.isFinite(nativeHardwareConcurrency) && nativeHardwareConcurrency > 0) {
        if (Object.is(nativeHardwareConcurrency, Number(hc))) {
          __swDiag('info', 'sw_prelude:hardwareConcurrency_native_skip', {
            stage: 'preflight',
            key: 'hardwareConcurrency',
            message: 'service worker hardwareConcurrency already matches native getter',
            type: 'browser structure missing data',
            data: {
              outcome: 'return',
              reason: 'native_skip',
              nativeValue: nativeHardwareConcurrency,
              profileValue: Number(hc)
            }
          }, null);
        } else {
          __swDiag('warn', 'sw_prelude:hardwareConcurrency_native_profile_mismatch_keep_native_getter', {
            stage: 'preflight',
            key: 'hardwareConcurrency',
            message: 'service worker hardwareConcurrency native getter value differs from profile value; native getter kept',
            type: 'browser structure missing data',
            data: {
              outcome: 'skip',
              reason: 'getter_value_mismatch',
              policy: 'skip',
              action: 'keep_native_getter',
              nativeValue: nativeHardwareConcurrency,
              profileValue: Number(hc)
            }
          }, null);
        }
      } else {
        __swDiag('warn', 'sw_prelude:hardwareConcurrency_native_invalid', {
          stage: 'preflight',
          key: 'hardwareConcurrency',
          message: 'service worker native hardwareConcurrency is invalid; keep mirror seed only',
          type: 'browser structure missing data',
          data: {
            outcome: 'skip',
            reason: 'native_invalid',
            nativeValue: nativeHardwareConcurrencyRead.value,
            profileValue: Number(hc)
          }
        }, null);
      }
    } catch (e) {
      __swDiag('warn', 'sw_prelude:hardwareConcurrency_native_read_failed', {
        stage: 'preflight',
        key: 'hardwareConcurrency',
        message: 'service worker native hardwareConcurrency read failed; keep mirror seed only',
        type: 'browser structure missing data',
        data: {
          outcome: 'skip',
          reason: 'native_read_failed',
          profileValue: Number(hc)
        }
      }, e);
    }

    __swDiag('info', 'sw_prelude:deviceMemory_native_read_disabled', {
      stage: 'preflight',
      key: 'deviceMemory',
      message: 'service worker native deviceMemory adoption disabled; keep mirror seed only',
      type: 'browser structure missing data',
      data: {
        outcome: 'skip',
        reason: 'native_read_disabled',
        profileValue: Number(dm)
      }
    }, null);

    const uad = nav.userAgentData;
    if (!uad) {
      __fail('sw_prelude:uadata_missing', {
        stage: 'preflight',
        key: 'userAgentData',
        message: 'service worker navigator.userAgentData missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'uadata_missing' }
      }, new Error('SW navigator.userAgentData missing'));
    }
    const uadProto = Object.getPrototypeOf(uad);
    if (!uadProto) {
      __fail('sw_prelude:uadata_proto_missing', {
        stage: 'preflight',
        key: 'userAgentData',
        message: 'service worker uaData proto missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'uadata_proto_missing' }
      }, new Error('SW uaData proto missing'));
    }
    function __dropUadOwnIfConfigurable(key) {
      const ownDesc = Object.getOwnPropertyDescriptor(uad, key);
      if (!ownDesc) return;
      if (ownDesc.configurable !== true) {
        __fail('sw_prelude:uadata_own_descriptor_nonconfigurable', {
          stage: 'preflight',
          key,
          message: 'service worker uaData own descriptor non-configurable',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'uadata_own_descriptor_nonconfigurable' }
        }, new Error('SW uaData own ' + key + ' non-configurable'));
      }
      delete uad[key];
      __applied.push({ obj: uad, key, hadOwn: true, prevDesc: ownDesc });
    }
    __dropUadOwnIfConfigurable('brands');
    __dropUadOwnIfConfigurable('mobile');
    __dropUadOwnIfConfigurable('platform');
    __dropUadOwnIfConfigurable('fullVersionList');
    __dropUadOwnIfConfigurable('getHighEntropyValues');
    __dropUadOwnIfConfigurable('toJSON');

    const chPlatform = profileUaData.platform;
    if (typeof chPlatform !== 'string' || !chPlatform) {
      __fail('sw_prelude:uadata_platform_missing', {
        stage: 'preflight',
        key: 'platform',
        message: 'service worker uaData.platform missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'uadata_platform_missing' }
      }, new Error('SW uaData.platform missing'));
    }
    const platformVersionValue = profileHighEntropy.platformVersion;
    if (!Array.isArray(profileUaData.brands) || !profileUaData.brands.length) {
      __fail('sw_prelude:uadata_brands_missing', {
        stage: 'preflight',
        key: 'brands',
        message: 'service worker uaData.brands missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'uadata_brands_missing' }
      }, new Error('SW uaData.brands missing'));
    }
    if (typeof profileUaData.mobile !== 'boolean') {
      __fail('sw_prelude:uadata_mobile_missing', {
        stage: 'preflight',
        key: 'mobile',
        message: 'service worker uaData.mobile missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'uadata_mobile_missing' }
      }, new Error('SW uaData.mobile missing'));
    }
    if (!Array.isArray(profileHighEntropy.fullVersionList) || !profileHighEntropy.fullVersionList.length) {
      __fail('sw_prelude:uadata_full_version_list_missing', {
        stage: 'preflight',
        key: 'fullVersionList',
        message: 'service worker uaData.fullVersionList missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'uadata_full_version_list_missing' }
      }, new Error('SW uaData.fullVersionList missing'));
    }

    const uadGetterInfo = __resolveDescriptor(proto, 'userAgentData');
    if (!uadGetterInfo.desc) {
      __fail('sw_prelude:uadata_descriptor_missing', {
        stage: 'preflight',
        key: 'userAgentData',
        message: 'service worker userAgentData descriptor missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'uadata_descriptor_missing' }
      }, new Error('SW userAgentData descriptor missing'));
    }
    if (uadGetterInfo.desc.configurable === false) {
      __fail('sw_prelude:uadata_descriptor_nonconfigurable', {
        stage: 'preflight',
        key: 'userAgentData',
        message: 'service worker userAgentData descriptor non-configurable',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'uadata_descriptor_nonconfigurable' }
      }, new Error('SW userAgentData non-configurable'));
    }

    const dBrands = Object.getOwnPropertyDescriptor(uadProto, 'brands');
    const dMobile = Object.getOwnPropertyDescriptor(uadProto, 'mobile');
    const dPlatform = Object.getOwnPropertyDescriptor(uadProto, 'platform');
    if (!dBrands || !dMobile || !dPlatform) {
      __fail('sw_prelude:uadata_leaf_descriptor_missing', {
        stage: 'preflight',
        key: 'brands',
        message: 'service worker uaData descriptor missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'uadata_leaf_descriptor_missing' }
      }, new Error('SW uaData descriptor missing'));
    }
    if (dBrands.configurable === false || dMobile.configurable === false || dPlatform.configurable === false) {
      __fail('sw_prelude:uadata_leaf_descriptor_nonconfigurable', {
        stage: 'preflight',
        key: 'brands',
        message: 'service worker uaData descriptor non-configurable',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'uadata_leaf_descriptor_nonconfigurable' }
      }, new Error('SW uaData non-configurable'));
    }

    const dFull = Object.getOwnPropertyDescriptor(uadProto, 'fullVersionList') || null;
    if (dFull && dFull.configurable === false) {
      __fail('sw_prelude:full_version_list_nonconfigurable', {
        stage: 'preflight',
        key: 'fullVersionList',
        message: 'service worker fullVersionList non-configurable',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'full_version_list_nonconfigurable' }
      }, new Error('SW uaData fullVersionList non-configurable'));
    }

    const ghevDesc = Object.getOwnPropertyDescriptor(uadProto, 'getHighEntropyValues');
    if (!ghevDesc || ghevDesc.configurable === false || typeof ghevDesc.value !== 'function') {
      __fail('sw_prelude:get_high_entropy_values_missing', {
        stage: 'preflight',
        key: 'getHighEntropyValues',
        message: 'service worker getHighEntropyValues descriptor missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'get_high_entropy_values_missing' }
      }, new Error('SW uaData.getHighEntropyValues original missing'));
    }
    const origGHEV = ghevDesc.value;

    const toJsonDesc = Object.getOwnPropertyDescriptor(uadProto, 'toJSON');
    if (!toJsonDesc || toJsonDesc.configurable === false || typeof toJsonDesc.value !== 'function') {
      __fail('sw_prelude:tojson_missing', {
        stage: 'preflight',
        key: 'toJSON',
        message: 'service worker toJSON descriptor missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'tojson_missing' }
      }, new Error('SW uaData.toJSON original missing'));
    }
    const origToJSON = toJsonDesc.value;

    const deep = v => v == null ? v : JSON.parse(JSON.stringify(v));
    const brandsValue = deep(profileUaData.brands);
    const mobileValue = profileUaData.mobile;
    const platformValue = chPlatform;
    const fullVersionListValue = deep(profileHighEntropy.fullVersionList);
    const isUadThis = recv => {
      if (recv === uad) return true;
      if (!recv || (typeof recv !== 'object' && typeof recv !== 'function')) return false;
      try {
        let cur = recv;
        for (let i = 0; i < 8; i += 1) {
          cur = Object.getPrototypeOf(cur);
          if (!cur) return false;
          if (cur === uadProto) return true;
        }
      } catch (e) {
        __swDiag('warn', 'sw_prelude:uadata_receiver_check_failed', {
          stage: 'runtime',
          key: 'userAgentData',
          message: 'service worker uaData receiver check failed',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'uadata_receiver_check_failed' }
        }, e);
        return false;
      }
      return false;
    };
    const uadAccessorBridgeGet = (dFull && typeof dFull.get === 'function')
      ? dFull.get
      : ((typeof dBrands.get === 'function')
        ? dBrands.get
        : ((typeof dMobile.get === 'function')
          ? dMobile.get
          : ((typeof dPlatform.get === 'function')
            ? dPlatform.get
            : (uadGetterInfo && uadGetterInfo.desc && typeof uadGetterInfo.desc.get === 'function')
              ? uadGetterInfo.desc.get
              : null)));

    function applyServiceWorkerNavigatorAccessorTarget(key, getter, diagTag) {
      if (typeof getter !== 'function') {
        __fail('sw_prelude:get_impl_missing', {
          stage: 'preflight',
          key,
          message: 'service worker accessor getImpl missing',
          type: 'pipeline missing data',
          data: { outcome: 'throw', reason: 'get_impl_missing' }
        }, new Error('SW ' + key + ' getter implementation missing'));
      }
      const resolved = __resolveDescriptor(proto, key);
      if (!resolved.owner || !resolved.desc) {
        __fail('sw_prelude:descriptor_missing', {
          stage: 'preflight',
          key,
          message: 'service worker descriptor missing',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'descriptor_missing' }
        }, new Error('SW ' + key + ' descriptor missing'));
      }
      if (resolved.desc && resolved.desc.configurable === false) {
        __fail('sw_prelude:descriptor_nonconfigurable', {
          stage: 'preflight',
          key,
          message: 'service worker descriptor non-configurable',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'descriptor_nonconfigurable' }
        }, new Error('SW ' + key + ' non-configurable'));
      }
      if (typeof resolved.desc.get !== 'function' || Object.prototype.hasOwnProperty.call(resolved.desc, 'value')) {
        __fail('sw_prelude:native_accessor_getter_missing', {
          stage: 'preflight',
          key,
          message: 'service worker native accessor getter missing',
          type: 'contract violation',
          data: {
            outcome: 'throw',
            reason: 'native_accessor_getter_missing',
            hasValue: Object.prototype.hasOwnProperty.call(resolved.desc, 'value'),
            hasGetter: typeof resolved.desc.get === 'function'
          }
        }, new Error('SW ' + key + ' native accessor getter missing'));
      }
      const groupTag = (typeof diagTag === 'string' && diagTag) ? diagTag : ('sw_prelude:' + key);
      const applied = __swApplyAccessorTargets(groupTag, [{
        owner: resolved.owner,
        key,
        kind: 'accessor',
        wrapLayer: 'strict_accessor_gateway',
        resolve: 'proto_chain',
        policy: 'strict',
        diagTag: groupTag,
        configurable: !!resolved.desc.configurable,
        enumerable: !!resolved.desc.enumerable,
        validThis: function(recv) {
          return recv === nav;
        },
        invalidThis: 'native',
        defineProperty: __trackDefineProperty,
        getImpl: function serviceWorkerNavigatorAccessorGet() {
          return getter.call(this);
        }
      }], 'strict');
      if (applied !== 1) {
        __fail('sw_prelude:accessor_target_apply_failed', {
          stage: 'apply',
          key,
          message: 'service worker accessor target apply failed',
          type: 'apply_failed',
          data: { outcome: 'throw', reason: 'accessor_target_apply_failed' }
        }, new Error('SW ' + key + ' accessor target apply failed'));
      }
    }

    function guardedUadGetter(key, value, sourceDesc) {
      const origGet = sourceDesc && typeof sourceDesc.get === 'function' ? sourceDesc.get : null;
      if (typeof origGet !== 'function') {
        __fail('sw_prelude:uadata_native_accessor_getter_missing', {
          stage: 'preflight',
          key,
          message: 'service worker uaData native accessor getter missing',
          type: 'contract violation',
          data: {
            outcome: 'throw',
            reason: 'uadata_native_accessor_getter_missing',
            hasValue: !!(sourceDesc && Object.prototype.hasOwnProperty.call(sourceDesc, 'value')),
            hasGetter: false
          }
        }, new Error('SW uaData ' + key + ' native accessor getter missing'));
      }
      const guardedGet = function guardedServiceWorkerUadAccessor() {
        const recv = this;
        if (isUadThis(recv)) return value;
        if (typeof origGet === 'function') {
          try {
            return Reflect.apply(origGet, recv, []);
          } catch (e) {
            __reportNativeThrow('sw_prelude:illegal_invocation', key, 'service worker uaData illegal invocation', e);
            throw e;
          }
        }
      };
      return __swWrapStrictAccessor(key, guardedGet, {
        configurable: !!sourceDesc.configurable,
        enumerable: !!sourceDesc.enumerable,
        get: origGet,
        set: undefined
      }, function(recv) {
        return isUadThis(recv);
      }, {
        name: 'get ' + key
      });
    }

    if (Object.prototype.hasOwnProperty.call(dBrands, 'value') && !dBrands.get && !dBrands.set) {
      __trackDefineProperty(uadProto, 'brands', {
        value: brandsValue,
        writable: !!dBrands.writable,
        configurable: !!dBrands.configurable,
        enumerable: !!dBrands.enumerable
      });
    } else {
      __trackDefineProperty(uadProto, 'brands', {
        get: guardedUadGetter('brands', brandsValue, dBrands),
        set: dBrands.set,
        configurable: !!dBrands.configurable,
        enumerable: !!dBrands.enumerable
      });
    }
    if (Object.prototype.hasOwnProperty.call(dMobile, 'value') && !dMobile.get && !dMobile.set) {
      __trackDefineProperty(uadProto, 'mobile', {
        value: mobileValue,
        writable: !!dMobile.writable,
        configurable: !!dMobile.configurable,
        enumerable: !!dMobile.enumerable
      });
    } else {
      __trackDefineProperty(uadProto, 'mobile', {
        get: guardedUadGetter('mobile', mobileValue, dMobile),
        set: dMobile.set,
        configurable: !!dMobile.configurable,
        enumerable: !!dMobile.enumerable
      });
    }
    if (Object.prototype.hasOwnProperty.call(dPlatform, 'value') && !dPlatform.get && !dPlatform.set) {
      __trackDefineProperty(uadProto, 'platform', {
        value: platformValue,
        writable: !!dPlatform.writable,
        configurable: !!dPlatform.configurable,
        enumerable: !!dPlatform.enumerable
      });
    } else {
      __trackDefineProperty(uadProto, 'platform', {
        get: guardedUadGetter('platform', platformValue, dPlatform),
        set: dPlatform.set,
        configurable: !!dPlatform.configurable,
        enumerable: !!dPlatform.enumerable
      });
    }

    if (dFull) {
      if (Object.prototype.hasOwnProperty.call(dFull, 'value') && !dFull.get && !dFull.set) {
        __trackDefineProperty(uadProto, 'fullVersionList', {
          value: fullVersionListValue,
          writable: !!dFull.writable,
          enumerable: !!dFull.enumerable,
          configurable: !!dFull.configurable
        });
      } else {
        __trackDefineProperty(uadProto, 'fullVersionList', {
          get: guardedUadGetter('fullVersionList', fullVersionListValue, dFull),
          set: dFull.set,
          enumerable: !!dFull.enumerable,
          configurable: !!dFull.configurable
        });
      }
    }

    const getHighEntropyValues = __swWrapNativeApply(origGHEV, 'getHighEntropyValues', function(target, thisArg, argList) {
      const keys = (argList && argList.length) ? argList[0] : undefined;
      if (!isUadThis(thisArg)) {
        try {
          return Reflect.apply(target, thisArg, [keys]);
        } catch (e) {
          __reportNativeThrow('sw_prelude:illegal_invocation', 'getHighEntropyValues', 'service worker getHighEntropyValues illegal invocation', e);
          throw e;
        }
      }
      if (!Array.isArray(keys)) {
        return Reflect.apply(target, thisArg, [keys]);
      }
      for (const hint of keys) {
        if (typeof hint !== 'string' || !hint) {
          return Reflect.apply(target, thisArg, [keys]);
        }
      }
      const map = {
        architecture: profileHighEntropy.architecture,
        bitness: profileHighEntropy.bitness,
        model: profileHighEntropy.model,
        brands: brandsValue,
        mobile: mobileValue,
        platform: platformValue,
        platformVersion: platformVersionValue,
        fullVersionList: fullVersionListValue,
        deviceMemory: swDeviceMemoryValue,
        hardwareConcurrency: Number(swHardwareConcurrencyValue),
        wow64: profileHighEntropy.wow64,
        formFactors: profileHighEntropy.formFactors
      };
      const result = {};
      for (const hint of keys) {
        if (!(hint in map)) continue;
        const val = map[hint];
        if (val === undefined || val === null || (typeof val === 'string' && !val && hint !== 'model') || (Array.isArray(val) && !val.length)) {
          __swDiag('error', 'sw_prelude:get_high_entropy_values_contract_missing', {
            stage: 'runtime',
            key: hint,
            message: 'service worker getHighEntropyValues contract value missing',
            type: 'pipeline missing data',
            data: { outcome: 'throw', reason: 'get_high_entropy_values_contract_missing' }
          }, null);
          // Disabled temporarily: valid SW profile reads must not fall back to native HE data.
          // return Reflect.apply(origGHEV, this, [keys]);
          throw new Error('SW getHighEntropyValues contract missing ' + hint);
        }
        result[hint] = val;
      }
      return Promise.resolve(result);
    });
    __trackDefineProperty(uadProto, 'getHighEntropyValues', {
      value: getHighEntropyValues,
      configurable: !!ghevDesc.configurable,
      enumerable: !!ghevDesc.enumerable,
      writable: Object.prototype.hasOwnProperty.call(ghevDesc, 'writable') ? ghevDesc.writable : true
    });

    const toJSON = __swWrapNativeApply(origToJSON, 'toJSON', function(target, thisArg, argList) {
      if (!isUadThis(thisArg)) {
        try {
          return Reflect.apply(target, thisArg, argList || []);
        } catch (e) {
          __reportNativeThrow('sw_prelude:illegal_invocation', 'toJSON', 'service worker toJSON illegal invocation', e);
          throw e;
        }
      }
      return { platform: thisArg.platform, brands: thisArg.brands, mobile: thisArg.mobile };
    });
    __trackDefineProperty(uadProto, 'toJSON', {
      value: toJSON,
      configurable: !!toJsonDesc.configurable,
      enumerable: !!toJsonDesc.enumerable,
      writable: Object.prototype.hasOwnProperty.call(toJsonDesc, 'writable') ? toJsonDesc.writable : true
    });

    __swDiag('info', 'sw_prelude:userAgentData_accessor_native_skip', {
      stage: 'apply',
      key: 'userAgentData',
      message: 'service worker userAgentData accessor left native',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'native_skip' }
    }, null);
    __swDiag('info', 'sw_prelude:language_accessor_native_skip', {
      stage: 'apply',
      key: 'language',
      message: 'service worker language accessor left native',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'native_skip', value: swPrimaryValue }
    }, null);
    __swDiag('info', 'sw_prelude:languages_accessor_native_skip', {
      stage: 'apply',
      key: 'languages',
      message: 'service worker languages accessor left native',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'native_skip', value: swLanguagesValue.slice() }
    }, null);
    __swDiag('info', 'sw_prelude:hardwareConcurrency_accessor_native_skip', {
      stage: 'apply',
      key: 'hardwareConcurrency',
      message: 'service worker hardwareConcurrency accessor left native',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'native_skip', value: Number(swHardwareConcurrencyValue) }
    }, null);
    __swDiag('info', 'sw_prelude:deviceMemory_accessor_native_passthrough', {
      stage: 'apply',
      key: 'deviceMemory',
      message: 'service worker deviceMemory accessor left native',
      type: 'browser structure missing data',
      data: {
        outcome: 'skip',
        reason: 'native_passthrough',
        value: swDeviceMemoryValue
      }
    }, null);
    if (nav.languages[0] !== nav.language) {
      __fail('sw_prelude:language_contract_mismatch', {
        stage: 'contract',
        key: 'languages',
        message: 'service worker language contract mismatch',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'language_contract_mismatch' }
      }, new Error('SW language != languages[0]'));
    }

    __swDiag('info', 'sw_prelude:return', {
      stage: 'apply',
      key: 'navigator',
      message: 'service worker mirror installed',
      type: 'pipeline missing data',
      data: { outcome: 'return' }
    }, null);
  } catch (e) {
    let rollbackErr = null;
    try {
      __rollbackApplied();
    } catch (re) {
      rollbackErr = re;
    }
    __swDiag('error', 'sw_prelude:rollback', {
      stage: rollbackErr ? 'rollback' : 'apply',
      key: 'navigator',
      message: rollbackErr ? 'service worker rollback failed' : 'service worker apply failed',
      type: 'browser structure missing data',
      data: { outcome: rollbackErr ? 'throw' : 'rollback', reason: rollbackErr ? 'rollback_failed' : 'apply_failed', rollbackOk: !rollbackErr }
    }, rollbackErr || e);
    throw (rollbackErr || e);
  }
})();

//# sourceURL=sw_prelude.js

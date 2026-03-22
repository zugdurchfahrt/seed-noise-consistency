const NavTotalSetPatchModule = function NavTotalSetPatchModule(window) {
  {
    let __navGuardToken = null;
    const G = (typeof globalThis !== 'undefined' && globalThis)
      || (typeof self !== 'undefined' && self)
      || (typeof window !== 'undefined' && window)
      || {};
    const __tag = 'nav_total_set';
    const __surface = 'navigator';
    const __flagKey = '__PATCH_NAVTOTALSET__';
    const __core = window.Core;
    const __navTypePipeline = 'pipeline missing data';
    const __navTypeBrowser = 'browser structure missing data';

    // [NORMATIVE] local adapter for __DEGRADE__ (no console.*, safe-noop on failure)
    const __loggerRoot = (window && window.CanvasPatchContext && window.CanvasPatchContext.__logger && typeof window.CanvasPatchContext.__logger === 'object')
      ? window.CanvasPatchContext.__logger
      : null;
    const __D = (__loggerRoot && typeof __loggerRoot.__DEGRADE__ === 'function') ? __loggerRoot.__DEGRADE__ : null;
    const __diag = (__D && typeof __D.diag === 'function') ? __D.diag.bind(__D) : null;
    const __emit = (level, code, ctx, err) => {
      try {
        const safeErr = (typeof err === 'undefined' || err === null) ? null : err;
        if (__diag) return __diag(level, code, ctx || null, safeErr);
        if (typeof __D === 'function') {
          const safeCtx = (ctx && typeof ctx === 'object') ? ctx : {};
          const safeLevel = (level === undefined || level === null) ? 'info' : level;
          return __D(code, safeErr, Object.assign({}, safeCtx, { level: safeLevel }));
        }
      } catch (emitErr) {
        return undefined;
      }
    };
    function __navDiag(level, code, extra, err) {
      try {
        const x = (extra && typeof extra === 'object') ? extra : {};
        const ctx = {
          module: __tag,
          diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : __tag,
          surface: __surface,
          key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
          stage: x.stage,
          message: x.message,
          type: x.type
        };
        if (x.stage === 'apply' && (typeof ctx.message !== 'string' || !ctx.message)) {
          ctx.message = code;
        }
        if (Object.prototype.hasOwnProperty.call(x, 'data')) {
          ctx.data = x.data;
        } else if (x.stage === 'apply' && level === 'info' && (err === undefined || err === null)) {
          ctx.data = { outcome: 'return' };
        }
        return __emit(level, code, ctx, err);
      } catch (diagErr) {
        return undefined;
      }
    }
    function __navDiagPipeline(level, code, extra, err) {
      const x = (extra && typeof extra === 'object') ? extra : {};
      return __navDiag(level, code, Object.assign({}, x, {
        type: (typeof x.type === 'string' && x.type) ? x.type : __navTypePipeline,
        diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : __tag
      }), err);
    }
    function __navDiagBrowser(level, code, extra, err) {
      const x = (extra && typeof extra === 'object') ? extra : {};
      return __navDiag(level, code, Object.assign({}, x, {
        type: (typeof x.type === 'string' && x.type) ? x.type : __navTypeBrowser,
        diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : __tag
      }), err);
    }
    function __navReleaseEntryGuard(rollbackOk, stage, substage) {
      try {
        if (__navGuardToken && __core && typeof __core.releaseGuardFlag === 'function') {
          __core.releaseGuardFlag(__flagKey, __navGuardToken, rollbackOk === true, __tag);
        }
      } catch (e) {
        __navDiagPipeline('warn', __tag + ':guard_release_failed', {
          stage: stage === 'rollback' ? 'rollback' : 'preflight',
          key: __flagKey,
          message: 'releaseGuardFlag threw',
          data: {
            outcome: 'skip',
            reason: 'guard_release_failed',
            substage: (typeof substage === 'string' && substage) ? substage : null
          }
        }, e);
      }
    }
    const __navResolveDescriptor = (__core && typeof __core.resolveDescriptor === 'function')
      ? __core.resolveDescriptor.bind(__core)
      : null;

    // ===== MODULE: canonical guard client =====
    if (!__core || typeof __core.guardFlag !== 'function') {
      __navDiagPipeline('warn', __tag + ':guard_missing', {
        stage: 'guard',
        key: __flagKey,
        message: 'Core.guardFlag missing',
        data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
      }, null);
      return;
    }
    try {
      __navGuardToken = __core.guardFlag(__flagKey, __tag);
    } catch (e) {
      __navDiagPipeline('warn', __tag + ':guard_failed', {
        stage: 'guard',
        key: __flagKey,
        message: 'guardFlag threw',
        data: { outcome: 'skip', reason: 'guard_failed' }
      }, e);
      return;
    }
    if (!__navGuardToken) return; // already_patched: Core emits nav_total_set:already_patched
    // Must run in Window realm (not Worker)
    if (typeof document === 'undefined' || !window || window.document !== document) {
      __navDiagBrowser('warn', 'nav_total_set:not_window_realm', {
        stage: 'preflight',
        message: 'not in Window realm',
        data: { outcome: 'skip', reason: 'not_window_realm' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'not_window_realm');
      return;
    }

    const C = window.CanvasPatchContext;
    if (!C) {
      __navDiagPipeline('warn', 'nav_total_set:canvas_patch_context_missing', {
        stage: 'preflight',
        message: 'CanvasPatchContext missing',
        data: { outcome: 'skip', reason: 'canvas_patch_context_missing' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'canvas_patch_context_missing');
      return;
    }
    const __stateRoot = (C && C.state && typeof C.state === 'object') ? C.state : null;
    if (!__stateRoot) {
      __navDiagPipeline('warn', 'nav_total_set:canvas_patch_state_missing', {
        stage: 'preflight',
        message: 'CanvasPatchContext.state missing',
        data: { outcome: 'skip', reason: 'canvas_patch_state_missing' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'canvas_patch_state_missing');
      return;
    }
    if (!(__stateRoot.__NAV_TOTAL_SET__ && typeof __stateRoot.__NAV_TOTAL_SET__ === 'object')) {
      Object.defineProperty(__stateRoot, '__NAV_TOTAL_SET__', {
        value: Object.create(null),
        writable: true,
        configurable: true,
        enumerable: false
      });
    }
    const __navModuleState = __stateRoot.__NAV_TOTAL_SET__;
    function __navCloneStateValue(value) {
      if (Array.isArray(value)) return value.map(__navCloneStateValue);
      if (value && typeof value === 'object') {
        const out = Object.create(null);
        const keys = Object.keys(value);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          out[key] = __navCloneStateValue(value[key]);
        }
        return out;
      }
      return value;
    }
    function __navSetHiddenStateValue(target, key, value) {
      if (!target || (typeof target !== 'object' && typeof target !== 'function')) return value;
      const prev = Object.getOwnPropertyDescriptor(target, key);
      if (prev && prev.configurable === false) {
        if (Object.prototype.hasOwnProperty.call(prev, 'value')) return prev.value;
        return value;
      }
      Object.defineProperty(target, key, {
        value: value,
        writable: true,
        configurable: true,
        enumerable: false
      });
      return value;
    }
    let __navProfileState = (__navModuleState.__PROFILE_STATE__ && typeof __navModuleState.__PROFILE_STATE__ === 'object')
      ? __navModuleState.__PROFILE_STATE__
      : null;
    if (!__navProfileState) {
      __navProfileState = Object.create(null);
      Object.defineProperty(__navModuleState, '__PROFILE_STATE__', {
        value: __navProfileState,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }

    // basic random from the existing seed initialization
    const __navCoreInternal = (__core && __core.__internal && typeof __core.__internal === 'object')
      ? __core.__internal
      : null;
    const __prngState = (__navCoreInternal && __navCoreInternal.prng && typeof __navCoreInternal.prng === 'object')
      ? __navCoreInternal.prng
      : null;
    const __randSource = (__prngState && __prngState.rand && typeof __prngState.rand.use === 'function')
      ? __prngState.rand
      : null;
    const R = (__randSource && typeof __randSource.use === 'function') ? __randSource.use('nav') : null;
    if (typeof R !== 'function') {
      __navDiagPipeline('error', 'nav_total_set:rand_missing', {
        stage: 'preflight',
        key: 'Core.__internal.prng.rand',
        message: 'Core.__internal.prng.rand missing',
        data: { outcome: 'skip', reason: 'core_internal_prng_rand_missing' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'rand_missing');
      return;
    }
    let mark = null;
    try {
      const ensureMarkAsNative = (__core && typeof __core.__ensureMarkAsNative === 'function')
        ? __core.__ensureMarkAsNative
        : null;
      mark = ensureMarkAsNative ? ensureMarkAsNative() : null;
    } catch (e) {
      __navDiagPipeline('error', 'nav_total_set:mark_as_native_failed', {
        stage: 'preflight',
        message: 'Core.__ensureMarkAsNative failed',
        data: { outcome: 'skip', reason: 'ensure_mark_as_native_failed', policy: 'skip', action: 'native' }
      }, e);
      __navReleaseEntryGuard(true, 'preflight', 'mark_as_native_failed');
      return;
    }
    if (typeof mark !== 'function') {
      __navDiagPipeline('warn', 'nav_total_set:mark_as_native_missing', {
        stage: 'preflight',
        message: 'Core.__ensureMarkAsNative missing',
        data: { outcome: 'skip', reason: 'missing_dep_core_mark_as_native', policy: 'skip', action: 'native' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'mark_as_native_missing');
      return;
    }
    const __navMark = mark;
    const wrapStrictAccessor = (__core && typeof __core.__wrapStrictAccessor === 'function') ? __core.__wrapStrictAccessor : null;
    if (typeof wrapStrictAccessor !== 'function') {
      __navDiagPipeline('warn', 'nav_total_set:wrap_strict_accessor_missing', {
        stage: 'preflight',
        message: 'Core.__wrapStrictAccessor missing',
        data: { outcome: 'skip', reason: 'missing_dep_wrap_strict_accessor', policy: 'skip', action: 'native' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'wrap_strict_accessor_missing');
      return;
    }
    const __navLangState = (__stateRoot && __stateRoot.__LANG_STATE__ && typeof __stateRoot.__LANG_STATE__ === 'object')
      ? __stateRoot.__LANG_STATE__
      : ((C && C.__LANG_STATE__ && typeof C.__LANG_STATE__ === 'object') ? C.__LANG_STATE__ : null);
    const __navScreenState = (__stateRoot && __stateRoot.__SCREEN__ && typeof __stateRoot.__SCREEN__ === 'object')
      ? __stateRoot.__SCREEN__
      : null;
    const __navPrimaryLanguage = (__navLangState && typeof __navLangState.primaryLanguage === 'string' && __navLangState.primaryLanguage)
      ? __navLangState.primaryLanguage
      : ((typeof window.__primaryLanguage === 'string' && window.__primaryLanguage) ? window.__primaryLanguage : null);
    const __navNormalizedLanguages = (__navLangState && Array.isArray(__navLangState.normalizedLanguages))
      ? __navLangState.normalizedLanguages.slice()
      : (Array.isArray(window.__normalizedLanguages) ? __navCloneStateValue(window.__normalizedLanguages) : null);
    if (Array.isArray(__navNormalizedLanguages)) {
      try {
        Object.freeze(__navNormalizedLanguages);
      } catch (e) {
        __navDiagPipeline('warn', 'nav_total_set:languages_snapshot_freeze_failed', {
          stage: 'preflight',
          key: 'languages',
          message: 'language snapshot freeze failed',
          data: { outcome: 'skip', reason: 'languages_snapshot_freeze_failed' }
        }, e);
      }
    }
    function registerPatchedTarget(owner, key, tag) {
      const coreRegisterPatchedTarget = (window.Core && typeof window.Core.registerPatchedTarget === 'function')
        ? window.Core.registerPatchedTarget
        : null;
      if (typeof coreRegisterPatchedTarget !== 'function') return;
      try {
        coreRegisterPatchedTarget(owner, key);
      } catch (e) {
        __navDiagBrowser('warn', (tag || 'nav_total_set') + ':register_target_failed', {
          stage: 'apply',
          diagTag: (tag || 'nav_total_set'),
          key: key || null,
          message: 'registerPatchedTarget failed',
          data: { outcome: STRICT ? 'throw' : 'skip', reason: 'register_target_failed' }
        }, e);
        if (STRICT) throw e;
      }
    }

    try {
    __navProfileState.meta = __navCloneStateValue(window.__EXPECTED_CLIENT_HINTS || {});
    __navProfileState.navPlat = window.__NAV_PLATFORM__;
    __navProfileState.generatedPlatform = window.__GENERATED_PLATFORM;
    __navProfileState.generatedPlatformVersion = window.__GENERATED_PLATFORM_VERSION;
    __navProfileState.userAgent = window.__USER_AGENT;
    __navProfileState.vendor = window.__VENDOR;
    __navProfileState.mem = Number(window.__memory);
    __navProfileState.cpu = Number(window.__cpu);
    __navProfileState.dpr = Number(window.__DPR);
    __navProfileState.width = Number(window.__WIDTH ?? (window.screen && window.screen.width));
    __navProfileState.height = Number(window.__HEIGHT ?? (window.screen && window.screen.height));
    __navProfileState.devicesLabels = __navCloneStateValue(window.__DEVICES_LABELS);
    __navProfileState.colorDepth = Number(window.__COLOR_DEPTH);
    __navProfileState.orientationDom = (typeof window.__ORIENTATION !== 'undefined')
      ? window.__ORIENTATION
      : ((__navScreenState && typeof __navScreenState.orientationDom === 'string' && __navScreenState.orientationDom)
        ? __navScreenState.orientationDom
        : (((__navProfileState.height >= __navProfileState.width)) ? 'portrait-primary' : 'landscape-primary'));
    __navProfileState.strict = (window.__NAV_PATCH_STRICT__ !== undefined) ? !!window.__NAV_PATCH_STRICT__ : true;
    __navProfileState.debug = !!window.__NAV_PATCH_DEBUG__;
    __navProfileState.fullVersionList = __navCloneStateValue(window.__FULL_VERSION_LIST);
    __navProfileState.storageQuotaMb = window.__STORAGE_QUOTA_MB;
    __navProfileState.storageUsedPct = window.__STORAGE_USED_PCT;
    __navProfileState.pluginProfiles = __navCloneStateValue(Array.isArray(window.__PLUGIN_PROFILES__) ? window.__PLUGIN_PROFILES__ : []);
    __navProfileState.primaryLanguage = __navPrimaryLanguage;
    __navProfileState.normalizedLanguages = __navCloneStateValue(__navNormalizedLanguages);
    // ---- Hard consistency for platform ----
    // ——— A. Input/meta ———
    const meta          = __navProfileState.meta || {};
    const navPlat       = __navProfileState.navPlat;     // 'Win32' | 'MacIntel'
    const gen           = __navProfileState.generatedPlatform; // "Windows" | "macOS"
    const userAgent     = __navProfileState.userAgent;
    const vendor        = __navProfileState.vendor;
    const mem           = __navProfileState.mem;
    const cpu           = __navProfileState.cpu;
    const dpr           = __navProfileState.dpr;
    const width         = __navProfileState.width;
    const height        = __navProfileState.height;
    const devicesLabels = __navProfileState.devicesLabels;
    const colorDepth    = __navProfileState.colorDepth;
    const orientationDom = __navProfileState.orientationDom;

    // strictness & diagnostics
    const STRICT        = __navProfileState.strict;
    const DEBUG         = __navProfileState.debug;
    let mediaDevicesLabelsUnlocked = false;
    let mediaMicGranted = false;
    let mediaCameraGranted = false;
    function syncMediaLabelsUnlocked() {
      mediaDevicesLabelsUnlocked = !!(mediaMicGranted || mediaCameraGranted);
    }

    if (!Number.isFinite(dpr) || dpr <= 0) {
      __navDiagPipeline('error', 'nav_total_set:bad_dpr', {
        stage: 'preflight',
        key: 'devicePixelRatio',
        message: 'bad __DPR',
        data: { outcome: 'skip', reason: 'bad_dpr', dpr: dpr }
      });
      __navReleaseEntryGuard(true, 'preflight', 'bad_dpr');
      return;
    }

    // --- Navigator patch registry + logging (filter noise) ---
    const __navPatchedFns = (typeof WeakSet === 'function') ? new WeakSet() : null;
    const __navPatchedKeys = new Set();
    function __navRegisterKey(key) {
      if (key != null) __navPatchedKeys.add(String(key));
    }
    function __navRegisterFn(fn) {
      if (__navPatchedFns && typeof fn === 'function') __navPatchedFns.add(fn);
    }
    function __navLogAccess(key, fn, extra) {
      const k = key != null ? String(key) : null;
      const keyOk = k && __navPatchedKeys.has(k);
      const fnOk = fn && __navPatchedFns && __navPatchedFns.has(fn);
      if (!keyOk && !fnOk) return;
      __navDiag('info', 'nav_total_set:nav_access', {
        stage: 'runtime',
        diagTag: 'nav_total_set',
        key: k || null,
        message: 'nav access',
        data: { outcome: 'return', reason: 'nav_access', extra: extra || null }
      });
    }
    const __isNavigatorThis = (self) => {
      try {
        return self === navigator;
      } catch (e) {
        __navDiag('warn', 'nav_total_set:navigator_this_check_failed', {
          stage: 'runtime',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set',
          key: null,
          message: 'Navigator receiver check failed',
          data: { outcome: 'return', reason: 'navigator_this_check_failed', policy: 'skip', action: 'native' }
        }, e);
        return false;
      }
    };
    function __wrapGetter(key, getter, desc, validThis) {
      __navRegisterKey(key);
      if (typeof wrapStrictAccessor !== 'function') {
        if (desc && typeof desc.get === 'function') return desc.get;
        return getter;
      }
      const wrapped = wrapStrictAccessor(key, getter, desc, validThis, {
        onAccess: function (_, fn) { __navLogAccess(key, fn); }
      });
      if (typeof wrapped === 'function' && wrapped !== getter) __navRegisterFn(wrapped);
      return wrapped;
    }

    // mapping helpers (OS <-> DOM)
    const asDom = (os) => os === 'Windows' ? 'Win32' : (os === 'macOS' ? 'MacIntel' : os);
    const asOS  = (dom) => dom === 'Win32' ? 'Windows' : (dom === 'MacIntel' ? 'macOS' : dom);
    const looksDom = (v) => v === 'Win32' || v === 'MacIntel';

    // guards (inputs must be present)
    if (!gen) {
      __navDiag('error', 'nav_total_set:generated_platform_missing', {
        stage: 'preflight',
        type: __navTypePipeline,
        diagTag: 'nav_total_set',
        key: 'platform',
        message: 'GENERATED_PLATFORM missing',
        data: { outcome: 'skip', reason: 'missing_generated_platform' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'generated_platform_missing');
      return;
    }
    if (!navPlat) {
      __navDiag('error', 'nav_total_set:nav_platform_missing', {
        stage: 'preflight',
        type: __navTypePipeline,
        diagTag: 'nav_total_set',
        key: 'platform',
        message: 'NAV_PLATFORM__ missing',
        data: { outcome: 'skip', reason: 'missing_nav_platform' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'nav_platform_missing');
      return;
    }

    // normalize/validate CH.platform (must be OS-string)
    let chPlatform = meta.platform || gen;
    if (looksDom(chPlatform)) {
      const normalized = asOS(chPlatform);
      if (STRICT) {
        __navDiag('error', 'nav_total_set:ch_platform_dom_like', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: 'nav_total_set',
          key: 'userAgentData.platform',
          message: `CH.platform '${chPlatform}' is DOM-like; expected OS-string (e.g. 'Windows'/'macOS')`,
          data: { outcome: 'skip', reason: 'ch_platform_dom_like', from: chPlatform, to: normalized }
        });
        __navReleaseEntryGuard(true, 'preflight', 'ch_platform_dom_like');
        return;
      } else {
        __navDiag('warn', 'nav_total_set:ch_platform_normalized', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: 'nav_total_set',
          key: 'userAgentData.platform',
          data: { from: chPlatform, to: normalized }
        });
        chPlatform = normalized;
      }
    }

    const expectedNavPlat = asDom(gen);
    if (navPlat !== expectedNavPlat) {
      const msg = `NAV_PLATFORM__ (${navPlat}) inconsistent with ${gen} (expected ${expectedNavPlat})`;
      if (STRICT) {
        __navDiag('error', 'nav_total_set:nav_platform_inconsistent', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: 'nav_total_set',
          key: 'platform',
          message: msg,
          data: { outcome: 'skip', reason: 'nav_platform_inconsistent', navPlat, generatedPlatform: gen, expectedNavPlat }
        });
        __navReleaseEntryGuard(true, 'preflight', 'nav_platform_inconsistent');
        return;
      } else {
        __navDiag('warn', 'nav_total_set:nav_platform_inconsistent', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: 'nav_total_set',
          key: 'platform',
          message: msg,
          data: { navPlat, generatedPlatform: gen, expectedNavPlat }
        });
      }
    }
    const navPlatformOut = STRICT ? navPlat : expectedNavPlat;
    if (!Number.isFinite(colorDepth) || colorDepth <= 0) {
      __navDiag('warn', 'nav_total_set:color_depth_missing', {
        stage: 'preflight',
        type: __navTypePipeline,
        diagTag: 'nav_total_set',
        key: 'colorDepth',
        message: 'colorDepth missing',
        data: { colorDepth: colorDepth }
      });
    }

    function publishWorkerEnvSnapshot() {
      function assert(cond, message) {
        if (!cond) throw new Error(message);
      }
      function isBrandList(value) {
        if (!Array.isArray(value) || !value.length) return false;
        for (let i = 0; i < value.length; i++) {
          const item = value[i];
          if (!item || typeof item !== 'object') return false;
          if (typeof item.brand !== 'string' || !item.brand) return false;
          if (typeof item.version !== 'string' || !item.version) return false;
        }
        return true;
      }
      function isStringArray(value, allowEmpty) {
        if (!Array.isArray(value)) return false;
        if (!allowEmpty && !value.length) return false;
        for (let i = 0; i < value.length; i++) {
          if (typeof value[i] !== 'string' || !value[i]) return false;
        }
        return true;
      }
      try {
        const packetMeta = (__navProfileState.meta && typeof __navProfileState.meta === 'object')
          ? __navProfileState.meta
          : null;
        assert(packetMeta, 'worker_env_snapshot.meta missing');
        const packet = {
          ua: __navProfileState.userAgent,
          vendor: __navProfileState.vendor,
          language: __navProfileState.primaryLanguage || packetMeta.language,
          languages: __navCloneStateValue(__navProfileState.normalizedLanguages || packetMeta.languages),
          deviceMemory: __navProfileState.mem,
          hardwareConcurrency: __navProfileState.cpu,
          uaData: {
            brands: __navCloneStateValue(packetMeta.brands),
            mobile: packetMeta.mobile,
            platform: packetMeta.platform || __navProfileState.generatedPlatform,
            he: {
              architecture: packetMeta.architecture,
              bitness: packetMeta.bitness,
              model: packetMeta.model,
              platformVersion: packetMeta.platformVersion || __navProfileState.generatedPlatformVersion,
              fullVersionList: __navCloneStateValue(packetMeta.fullVersionList != null ? packetMeta.fullVersionList : __navProfileState.fullVersionList),
              wow64: packetMeta.wow64,
              formFactors: __navCloneStateValue(packetMeta.formFactors)
            }
          }
        };
        assert(typeof packet.ua === 'string' && packet.ua, 'worker_env_snapshot.ua missing');
        assert(typeof packet.vendor === 'string', 'worker_env_snapshot.vendor missing');
        assert(typeof packet.language === 'string' && packet.language, 'worker_env_snapshot.language missing');
        assert(isStringArray(packet.languages, false), 'worker_env_snapshot.languages missing');
        assert(__navIsValidDeviceMemoryValue(packet.deviceMemory), 'worker_env_snapshot.deviceMemory missing');
        assert(__navIsValidHardwareConcurrencyValue(packet.hardwareConcurrency), 'worker_env_snapshot.hardwareConcurrency missing');
        assert(isBrandList(packet.uaData.brands), 'worker_env_snapshot.uaData.brands missing');
        assert(typeof packet.uaData.mobile === 'boolean', 'worker_env_snapshot.uaData.mobile missing');
        assert(typeof packet.uaData.platform === 'string' && packet.uaData.platform, 'worker_env_snapshot.uaData.platform missing');
        assert(typeof packet.uaData.he === 'object' && !!packet.uaData.he, 'worker_env_snapshot.uaData.he missing');
        assert(typeof packet.uaData.he.architecture === 'string' && packet.uaData.he.architecture, 'worker_env_snapshot.uaData.he.architecture missing');
        assert(typeof packet.uaData.he.bitness === 'string' && packet.uaData.he.bitness, 'worker_env_snapshot.uaData.he.bitness missing');
        assert(typeof packet.uaData.he.model === 'string', 'worker_env_snapshot.uaData.he.model missing');
        assert(typeof packet.uaData.he.platformVersion === 'string' && packet.uaData.he.platformVersion, 'worker_env_snapshot.uaData.he.platformVersion missing');
        assert(isBrandList(packet.uaData.he.fullVersionList), 'worker_env_snapshot.uaData.he.fullVersionList missing');
        assert(typeof packet.uaData.he.wow64 === 'boolean', 'worker_env_snapshot.uaData.he.wow64 missing');
        assert(isStringArray(packet.uaData.he.formFactors, false), 'worker_env_snapshot.uaData.he.formFactors missing');
        __navSetHiddenStateValue(__navProfileState, '__WORKER_ENV_SNAPSHOT__', __navCloneStateValue(packet));
      } catch (e) {
        try {
          const own = Object.getOwnPropertyDescriptor(__navProfileState, '__WORKER_ENV_SNAPSHOT__');
          if (own && own.configurable) delete __navProfileState.__WORKER_ENV_SNAPSHOT__;
        } catch (_) {}
        __navDiag('error', 'nav_total_set:worker_env_snapshot_invalid', {
          stage: 'apply',
          type: __navTypePipeline,
          diagTag: 'nav_total_set',
          key: '__WORKER_ENV_SNAPSHOT__',
          message: 'worker env snapshot invalid',
          data: { outcome: 'throw', reason: 'worker_env_snapshot_invalid' }
        }, e);
      }
    }

    // ——— B. Safe helpers ———
    const navProto = Object.getPrototypeOf(navigator);
    function safeDefineAcc(target, key, getter, { enumerable = false } = {}) {
      if (!target || (typeof target !== 'object' && typeof target !== 'function')) {
        const err = new TypeError(`${key}: invalid target`);
        __navDiagBrowser('error', 'nav_total_set:safeDefineAcc_invalid_target', {
          stage: 'preflight',
          diagTag: 'nav_total_set:safeDefineAcc',
          key: key || null,
          message: err.message,
          data: { outcome: 'throw', reason: 'invalid_target' }
        }, err);
        throw err;
      }
      const d = Object.getOwnPropertyDescriptor(target, key);
      if (d && d.configurable === false) {
        const err = new TypeError(`${key}: non-configurable`);
        let resolved = null;
        let resolveErr = null;
        try {
          resolved = __navResolveDescriptor ? __navResolveDescriptor(target, key, { mode: 'proto_chain' }) : null;
        } catch (e) {
          resolveErr = e;
        }
        __navDiagBrowser('error', 'nav_total_set:safeDefineAcc_non_configurable', {
          stage: 'preflight',
          diagTag: 'nav_total_set:safeDefineAcc',
          key: key || null,
          message: err.message,
          data: {
            outcome: 'throw',
            reason: 'non_configurable',
            targetTag: Object.prototype.toString.call(target),
            targetIsNavProto: target === navProto,
            ownDesc: {
              configurable: !!d.configurable,
              enumerable: !!d.enumerable,
              writable: Object.prototype.hasOwnProperty.call(d, 'writable') ? !!d.writable : undefined,
              hasGet: typeof d.get === 'function',
              hasSet: typeof d.set === 'function',
              hasValue: Object.prototype.hasOwnProperty.call(d, 'value')
            },
            protoChainFound: !!(resolved && resolved.desc),
            protoChainOwnerIsTarget: !!(resolved && resolved.owner === target),
            protoChainOwnerTag: (resolved && resolved.owner) ? Object.prototype.toString.call(resolved.owner) : undefined,
            protoChainDescConfigurable: (resolved && resolved.desc && Object.prototype.hasOwnProperty.call(resolved.desc, 'configurable')) ? !!resolved.desc.configurable : undefined,
            resolveDescriptorError: resolveErr ? String(resolveErr && (resolveErr.message || resolveErr)) : undefined
          }
        }, err);
        throw err;
      }
      const isData = d && Object.prototype.hasOwnProperty.call(d, 'value') && !d.get && !d.set;
      if (isData) {
        const value = (typeof getter === 'function') ? getter.call(target) : getter;
        const applied = applyCoreTargetsGroup('nav_total_set:safeDefineAcc', [{
          owner: target,
          key,
          kind: 'data',
          wrapLayer: 'descriptor_only',
          policy: 'throw',
          diagTag: 'nav_total_set:safeDefineAcc',
          allowCreate: !d,
          value,
          writable: d ? !!d.writable : true,
          configurable: d ? !!d.configurable : true,
          enumerable: d ? !!d.enumerable : !!enumerable
        }], 'throw');
        if (applied !== 1) {
          const err = new TypeError(`failed to define ${key}`);
          __navDiagBrowser('error', 'nav_total_set:safeDefineAcc_define_failed', {
            stage: 'apply',
            diagTag: 'nav_total_set:safeDefineAcc',
            key: key || null,
            message: err.message,
            data: { outcome: 'throw', reason: 'define_failed' }
          }, err);
          throw err;
        }
        return true;
      }
      let getFn = getter;
      if (typeof getter === 'function' && getter.name === '') {
        const acc = ({ get [key]() { return getter.call(this); } });
        getFn = Object.getOwnPropertyDescriptor(acc, key).get;
      }
      if (typeof getFn !== 'function') {
        const err = new TypeError(`${key}: getter missing`);
        __navDiagBrowser('error', 'nav_total_set:safeDefineAcc_getter_missing', {
          stage: 'preflight',
          diagTag: 'nav_total_set:safeDefineAcc',
          key: key || null,
          message: err.message,
          data: { outcome: 'throw', reason: 'getter_missing' }
        }, err);
        throw err;
      }
      const applied = applyCoreTargetsGroup('nav_total_set:safeDefineAcc', [{
        owner: target,
        key,
        kind: 'accessor',
        wrapLayer: 'named_wrapper',
        policy: 'throw',
        diagTag: 'nav_total_set:safeDefineAcc',
        allowCreate: !d,
        configurable: d ? !!d.configurable : true,
        enumerable: d ? !!d.enumerable : !!enumerable,
        invalidThis: 'throw',
        getImpl: function safeDefineAccGetImpl() {
          return Reflect.apply(getFn, this, []);
        }
        }], 'throw');
      if (applied !== 1) {
        const err = new TypeError(`failed to define ${key}`);
        __navDiagBrowser('error', 'nav_total_set:safeDefineAcc_define_failed', {
          stage: 'apply',
          diagTag: 'nav_total_set:safeDefineAcc',
          key: key || null,
          message: err.message,
          data: { outcome: 'throw', reason: 'define_failed' }
        }, err);
        throw err;
      }
      return true;
    }

    function redefineAcc(proto, key, getImpl) {
      const d = Object.getOwnPropertyDescriptor(proto, key);
      if (d && d.configurable === false) {
        const err = new TypeError(`${key}: non-configurable`);
        let resolved = null;
        let resolveErr = null;
        try {
          resolved = __navResolveDescriptor ? __navResolveDescriptor(proto, key, { mode: 'proto_chain' }) : null;
        } catch (e) {
          resolveErr = e;
        }
        __navDiagBrowser('error', 'nav_total_set:redefineAcc_non_configurable', {
          stage: 'preflight',
          diagTag: 'nav_total_set:redefineAcc',
          key: key || null,
          message: err.message,
          data: {
            outcome: 'throw',
            reason: 'non_configurable',
            targetTag: Object.prototype.toString.call(proto),
            targetIsNavProto: proto === navProto,
            ownDesc: {
              configurable: !!d.configurable,
              enumerable: !!d.enumerable,
              writable: Object.prototype.hasOwnProperty.call(d, 'writable') ? !!d.writable : undefined,
              hasGet: typeof d.get === 'function',
              hasSet: typeof d.set === 'function',
              hasValue: Object.prototype.hasOwnProperty.call(d, 'value')
            },
            protoChainFound: !!(resolved && resolved.desc),
            protoChainOwnerIsTarget: !!(resolved && resolved.owner === proto),
            protoChainOwnerTag: (resolved && resolved.owner) ? Object.prototype.toString.call(resolved.owner) : undefined,
            protoChainDescConfigurable: (resolved && resolved.desc && Object.prototype.hasOwnProperty.call(resolved.desc, 'configurable')) ? !!resolved.desc.configurable : undefined,
            resolveDescriptorError: resolveErr ? String(resolveErr && (resolveErr.message || resolveErr)) : undefined
          }
        }, err);
        throw err;
      }
      const isData = d && Object.prototype.hasOwnProperty.call(d, 'value') && !d.get && !d.set;
      if (isData) {
        const value = (typeof getImpl === 'function') ? getImpl.call(proto) : getImpl;
        const applied = applyCoreTargetsGroup('nav_total_set:redefineAcc', [{
          owner: proto,
          key,
          kind: 'data',
          wrapLayer: 'descriptor_only',
          policy: 'throw',
          diagTag: 'nav_total_set:redefineAcc',
          allowCreate: !d,
          value,
          writable: d ? !!d.writable : true,
          configurable: d ? !!d.configurable : true,
          enumerable: d ? !!d.enumerable : false
        }], 'throw');
        if (applied !== 1) {
          const err = new TypeError(`failed to define ${key}`);
          __navDiagBrowser('error', 'nav_total_set:redefineAcc_define_failed', {
            stage: 'apply',
            diagTag: 'nav_total_set:redefineAcc',
            key: key || null,
            message: err.message,
            data: { outcome: 'throw', reason: 'define_failed' }
          }, err);
          throw err;
        }
        return;
      }
      let getFn = getImpl;
      if (typeof getImpl === 'function' && getImpl.name === '') {
        const acc = ({ get [key]() { return getImpl.call(this); } });
        getFn = Object.getOwnPropertyDescriptor(acc, key).get;
      }
      if (typeof getFn !== 'function') {
        const err = new TypeError(`${key}: getter missing`);
        __navDiagBrowser('error', 'nav_total_set:redefineAcc_getter_missing', {
          stage: 'preflight',
          diagTag: 'nav_total_set:redefineAcc',
          key: key || null,
          message: err.message,
          data: { outcome: 'throw', reason: 'getter_missing' }
        }, err);
        throw err;
      }
      const applied = applyCoreTargetsGroup('nav_total_set:redefineAcc', [{
        owner: proto,
        key,
        kind: 'accessor',
        wrapLayer: 'named_wrapper',
        policy: 'throw',
        diagTag: 'nav_total_set:redefineAcc',
        allowCreate: !d,
        configurable: d ? !!d.configurable : true,
        enumerable: d ? !!d.enumerable : false,
        invalidThis: 'throw',
        getImpl: function redefineAccGetImpl() {
          return Reflect.apply(getFn, this, []);
        }
        }], 'throw');
      if (applied !== 1) {
        const err = new TypeError(`failed to define ${key}`);
        __navDiagBrowser('error', 'nav_total_set:redefineAcc_define_failed', {
          stage: 'apply',
          diagTag: 'nav_total_set:redefineAcc',
          key: key || null,
          message: err.message,
          data: { outcome: 'throw', reason: 'define_failed' }
        }, err);
        throw err;
      }
    }

    function isSameDescriptor(actual, expected) {
      if (!actual || !expected) return false;
      const keys = ['configurable', 'enumerable', 'writable', 'value', 'get', 'set'];
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (Object.prototype.hasOwnProperty.call(expected, k)) {
          if (actual[k] !== expected[k]) return false;
        }
      }
      return true;
    }

    function cloneDescriptor(desc) {
      if (!desc) return null;
      const copy = {};
      if (Object.prototype.hasOwnProperty.call(desc, 'configurable')) copy.configurable = desc.configurable;
      if (Object.prototype.hasOwnProperty.call(desc, 'enumerable')) copy.enumerable = desc.enumerable;
      if (Object.prototype.hasOwnProperty.call(desc, 'writable')) copy.writable = desc.writable;
      if (Object.prototype.hasOwnProperty.call(desc, 'value')) copy.value = desc.value;
      if (Object.prototype.hasOwnProperty.call(desc, 'get')) copy.get = desc.get;
      if (Object.prototype.hasOwnProperty.call(desc, 'set')) copy.set = desc.set;
      return copy;
    }

    const __navModuleApplied = [];
    const __navModuleAppliedOwners = (typeof WeakMap === 'function') ? new WeakMap() : null;
    function rememberModuleApplied(planItem) {
      if (!planItem || !planItem.owner || typeof planItem.key !== 'string') return;
      const owner = planItem.owner;
      const key = String(planItem.key);
      if (__navModuleAppliedOwners) {
        let bucket = __navModuleAppliedOwners.get(owner);
        if (!bucket) {
          bucket = new Set();
          __navModuleAppliedOwners.set(owner, bucket);
        }
        if (bucket.has(key)) return;
        bucket.add(key);
      } else {
        for (let i = 0; i < __navModuleApplied.length; i++) {
          const row = __navModuleApplied[i];
          if (row && row.owner === owner && row.key === key) return;
        }
      }
      __navModuleApplied.push({
        owner,
        key,
        origDesc: cloneDescriptor(planItem.origDesc)
      });
    }

    function rollbackModuleApplied() {
      let rollbackErr = null;
      for (let i = __navModuleApplied.length - 1; i >= 0; i--) {
        const row = __navModuleApplied[i];
        if (!row || !row.owner || typeof row.key !== 'string') continue;
        try {
          if (row.origDesc) Object.defineProperty(row.owner, row.key, row.origDesc);
          else delete row.owner[row.key];
        } catch (e) {
          if (!rollbackErr) rollbackErr = e;
          __navDiagBrowser('error', 'nav_total_set:module_rollback_failed', {
            stage: 'rollback',
            diagTag: 'nav_total_set',
            key: row.key,
            message: 'module rollback failed'
          }, e);
        }
      }
      if (rollbackErr) throw rollbackErr;
    }

    function applyCoreTargetsGroup(groupTag, targets, policy) {
      const groupPolicy = policy === 'throw' ? 'throw' : 'skip';
      let groupKey;
      if (Array.isArray(targets)) {
        for (let i = 0; i < targets.length; i++) {
          const t = targets[i];
          if (t && typeof t.key === 'string') {
            groupKey = t.key;
            break;
          }
        }
      }
      const Core = window.Core;
      if (!Core || typeof Core.applyTargets !== 'function') {
        const err = new Error('Core.applyTargets missing');
        __navDiag('error', groupTag + ':core_missing', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: groupTag,
          key: groupKey,
          message: 'Core.applyTargets missing',
          data: { outcome: (groupPolicy === 'throw') ? 'throw' : 'skip', reason: 'core_missing' }
        }, err);
        if (groupPolicy === 'throw') throw err;
        return 0;
      }
      if (typeof Core.registerPatchedTarget !== 'function') {
        const err = new Error('Core.registerPatchedTarget missing');
        __navDiag('warn', groupTag + ':core_registry_missing', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: groupTag,
          key: groupKey,
          message: 'Core.registerPatchedTarget missing',
          data: { outcome: (groupPolicy === 'throw') ? 'throw' : 'skip', reason: 'core_registry_missing' }
        }, err);
        if (groupPolicy === 'throw') throw err;
      }
      let plans = [];
      try {
        plans = Core.applyTargets(targets, null, []);
      } catch (e) {
        __navDiag('error', groupTag + ':preflight_failed', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: groupTag,
          key: groupKey,
          data: { outcome: (groupPolicy === 'throw') ? 'throw' : 'skip', reason: 'preflight_exception' }
        }, e);
        if (groupPolicy === 'throw') throw e;
        return 0;
      }
      if (!Array.isArray(plans) || !plans.length) {
        const reason = plans && plans.reason ? plans.reason : 'group_skipped';
        __navDiag('warn', groupTag + ':' + reason, {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: groupTag,
          key: groupKey,
          data: { outcome: (groupPolicy === 'throw') ? 'throw' : 'skip', reason: String(reason) }
        }, null);
        if (groupPolicy === 'throw') {
          throw new Error('target group skipped');
        }
        return 0;
      }

      const applied = [];
      let activeKey = groupKey;
      try {
        for (let i = 0; i < plans.length; i++) {
          const p = plans[i];
          if (!p || p.skipApply) continue;
          activeKey = (p && typeof p.key === 'string') ? p.key : activeKey;
          if (!p.owner || typeof p.key !== 'string' || !p.nextDesc) {
            throw new Error('invalid plan item');
          }
          Object.defineProperty(p.owner, p.key, p.nextDesc);
          const after = Object.getOwnPropertyDescriptor(p.owner, p.key);
          if (!isSameDescriptor(after, p.nextDesc)) {
            throw new Error('descriptor post-check mismatch');
          }
          applied.push(p);
        }

        // Side-effects only after full group apply succeeds (atomicity + registry/dedup invariant).
        for (let i = 0; i < applied.length; i++) {
          const p = applied[i];
          if (typeof p.value === 'function') __navRegisterFn(p.value);
          registerPatchedTarget(p.owner, p.key, groupTag);
          rememberModuleApplied(p);
        }
      } catch (e) {
        let rollbackErr = null;
        for (let i = applied.length - 1; i >= 0; i--) {
          const p = applied[i];
          try {
            if (p.origDesc) Object.defineProperty(p.owner, p.key, p.origDesc);
            else delete p.owner[p.key];
          } catch (re) {
            if (!rollbackErr) rollbackErr = re;
            __navDiag('error', groupTag + ':rollback_failed', {
              stage: 'rollback',
              type: __navTypeBrowser,
              diagTag: groupTag,
              key: p.key || null,
              data: { outcome: 'rollback', reason: 'rollback_failed' }
            }, re);
          }
        }
        if (rollbackErr) {
          throw rollbackErr;
        }
        __navDiag('error', groupTag + ':apply_failed', {
          stage: 'apply',
          type: __navTypeBrowser,
          diagTag: groupTag,
          key: activeKey,
          data: { outcome: (groupPolicy === 'throw') ? 'throw' : 'skip', reason: 'apply_failed' }
        }, e);
        if (groupPolicy === 'throw') throw e;
        return 0;
      }
      return applied.length;
    }

    function __navResolvePrototypeAccessorTarget(key, diagTag, options) {
      const opts = (options && typeof options === 'object') ? options : {};
      const descriptorCode = (typeof opts.descriptorCode === 'string' && opts.descriptorCode)
        ? opts.descriptorCode
        : `${diagTag}_descriptor_missing`;
      const ownerMismatchCode = (typeof opts.ownerMismatchCode === 'string' && opts.ownerMismatchCode)
        ? opts.ownerMismatchCode
        : `${diagTag}_owner_mismatch`;
      const accessorKindCode = (typeof opts.accessorKindCode === 'string' && opts.accessorKindCode)
        ? opts.accessorKindCode
        : `${diagTag}_descriptor_kind_mismatch`;
      const resolved = __navResolveDescriptor
        ? __navResolveDescriptor(navProto, key, { mode: 'proto_chain' })
        : {
            owner: Object.getOwnPropertyDescriptor(navProto, key) ? navProto : null,
            desc: Object.getOwnPropertyDescriptor(navProto, key) || null
          };
      const desc = resolved ? resolved.desc : null;
      const owner = (resolved && resolved.owner) ? resolved.owner : navProto;
      if (!desc) {
        __navDiag('error', descriptorCode, {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: diagTag,
          key: key,
          message: `${key} descriptor missing`
        });
        return null;
      }
      if (owner === navigator) {
        __navDiag('error', ownerMismatchCode, {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: diagTag,
          key: key,
          message: `${key} resolved to instance owner`,
          data: { outcome: 'skip', reason: 'instance_owner_resolved' }
        });
        return null;
      }
      if (!Object.prototype.hasOwnProperty.call(desc, 'get') && !Object.prototype.hasOwnProperty.call(desc, 'set')) {
        __navDiag('error', accessorKindCode, {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: diagTag,
          key: key,
          message: `${key} is not accessor-shaped on prototype`
        });
        return null;
      }
      return { owner, desc };
    }

    function __navResolveNativeAccessorDesc(key) {
      const resolved = __navResolveDescriptor
        ? __navResolveDescriptor(navProto, key, { mode: 'proto_chain' })
        : {
            owner: Object.getOwnPropertyDescriptor(navProto, key) ? navProto : null,
            desc: Object.getOwnPropertyDescriptor(navProto, key) || null
          };
      return (resolved && resolved.desc) ? resolved.desc : null;
    }

    // Bucket: strict scalar accessors on Navigator.prototype.
    function patchStrictScalarAccessor(key, getter, diagTag) {
      const resolved = __navResolvePrototypeAccessorTarget(key, diagTag);
      if (!resolved) return false;
      const owner = resolved.owner;
      const d = resolved.desc;
      if (typeof getter !== 'function') throw new TypeError(`${key}: getter missing`);
      __navRegisterKey(key);
      const applied = applyCoreTargetsGroup(diagTag, [{
        owner: owner,
        key: key,
        kind: 'accessor',
        wrapLayer: 'strict_accessor_gateway',
        resolve: 'proto_chain',
        policy: 'strict',
        diagTag: diagTag,
        allowCreate: false,
        configurable: !!d.configurable,
        enumerable: !!d.enumerable,
        allowShapeChange: false,
        validThis: __isNavigatorThis,
        invalidThis: 'native',
        getImpl: function navStrictScalarGetImpl() {
          __navLogAccess(key, null, { bucket: 'strict_accessor_gateway' });
          return getter.call(this);
        }
      }], 'throw');
      if (applied !== 1) {
        __navDiag('error', `${diagTag}_define_failed`, {
          stage: 'apply',
          type: __navTypeBrowser,
          diagTag: diagTag,
          key: key,
          message: `failed to define ${key}`
        });
        return false;
      }
      return true;
    }

    // Bucket: object-return identity surfaces.
    function patchObjectReturnAccessor(key, getter, diagTag) {
      const resolved = __navResolvePrototypeAccessorTarget(key, diagTag);
      if (!resolved) return false;
      const owner = resolved.owner;
      const d = resolved.desc;
      if (typeof getter !== 'function') throw new TypeError(`${key}: getter missing`);
      __navRegisterKey(key);
      const applied = applyCoreTargetsGroup(diagTag, [{
        owner: owner,
        key: key,
        kind: 'accessor',
        wrapLayer: 'object_return_gateway',
        resolve: 'proto_chain',
        policy: 'strict',
        diagTag: diagTag,
        allowCreate: false,
        configurable: !!d.configurable,
        enumerable: !!d.enumerable,
        allowShapeChange: false,
        validThis: __isNavigatorThis,
        invalidThis: 'native',
        getImpl: function navObjectReturnGetImpl() {
          __navLogAccess(key, null, { bucket: 'object_return_gateway' });
          return getter.call(this);
        }
      }], 'throw');
      if (applied !== 1) {
        __navDiag('error', `${diagTag}_define_failed`, {
          stage: 'apply',
          type: __navTypeBrowser,
          diagTag: diagTag,
          key: key,
          message: `failed to define ${key}`
        });
        return false;
      }
      return true;
    }

    function __navReadNativeScalarFallback(desc, receiver, key, diagTag) {
      try {
        if (desc && typeof desc.get === 'function') return Reflect.apply(desc.get, receiver, []);
        if (desc && Object.prototype.hasOwnProperty.call(desc, 'value')) return desc.value;
      } catch (e) {
        __navDiagBrowser('warn', (diagTag || 'nav_total_set') + '_native_fallback_failed', {
          stage: 'runtime',
          diagTag: diagTag || 'nav_total_set',
          key: key || null,
          message: 'native scalar fallback failed',
          data: { outcome: 'return', reason: 'native_fallback_failed' }
        }, e);
      }
      return undefined;
    }

    function __navIsValidLanguageList(value) {
      if (!Array.isArray(value) || !value.length) return false;
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] !== 'string' || !value[i]) return false;
      }
      return true;
    }

    function __navIsValidDeviceMemoryValue(value) {
      return Number.isFinite(value) && value > 0;
    }

    function __navIsValidHardwareConcurrencyValue(value) {
      return Number.isInteger(value) && value > 0;
    }

    // Important: like native - not enumerable
    // [REGISTRY] userAgent is handled in `override_ua_data.js` (opt-in gate).
    // Here we keep only strict scalar accessor surfaces on Navigator.prototype.
    const critical = new Set(['platform','vendor','appVersion']);
    const strictScalarKeys = new Set(['platform','vendor','appVersion','productSub','maxTouchPoints','vendorSub','deviceMemory','hardwareConcurrency','language','languages','webdriver']);
    const objectReturnKeys = new Set(['plugins','mimeTypes','userAgentData']);
    (function patchStrictScalarAccessorsOnProto(){
      patchStrictScalarAccessor('platform', 'platform' in navProto ? () => navPlatformOut : null, 'nav_total_set:platform');
      patchStrictScalarAccessor('vendor', 'vendor' in navProto ? () => vendor : null, 'nav_total_set:vendor');
      patchStrictScalarAccessor('appVersion', 'appVersion' in navProto ? () => {
        const pfx = "Mozilla/";
        return (typeof userAgent === "string" && userAgent.indexOf(pfx) === 0)
          ? userAgent.slice(pfx.length)
          : userAgent;
      } : null, 'nav_total_set:appVersion');
      patchStrictScalarAccessor('productSub', 'productSub' in navProto ? () => "20030107" : null, 'nav_total_set:productSub');
      patchStrictScalarAccessor('vendorSub', 'vendorSub' in navProto ? () => "" : null, 'nav_total_set:vendorSub');
      patchStrictScalarAccessor('maxTouchPoints', 'maxTouchPoints' in navProto ? () => 0 : null, 'nav_total_set:maxTouchPoints');
    })();

    // rest
    const navigatorPatches = [
      ['buildID',              () => "20230501"],
      ['globalPrivacyControl', () => false]
    ];
      navigatorPatches.forEach(([prop, getter]) => {
        if (critical.has(prop) || strictScalarKeys.has(prop) || objectReturnKeys.has(prop)) return; 
        if (!(prop in navProto)) return;
        const d = Object.getOwnPropertyDescriptor(navProto, prop);
        const wrapped = __wrapGetter(prop, getter, d, __isNavigatorThis);
        safeDefineAcc(navProto, prop, wrapped);
      });

    // ——— D. devicePixelRatio & screen.* ———
    // dpr: first we try to redefine own in window (often own), then — prototype
    (function () {
      const desc = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');
      if (desc && desc.configurable !== false) {
        safeDefineAcc(window, 'devicePixelRatio', function(){ return dpr; });
      } else {
        const acc = ({ get devicePixelRatio() { return dpr; } });
        const getDpr = Object.getOwnPropertyDescriptor(acc, 'devicePixelRatio').get;
        redefineAcc(Window.prototype, 'devicePixelRatio', getDpr);
      }
      // Post-apply invariant: devicePixelRatio must match profile DPR
      try {
        const actual = Number(window.devicePixelRatio);
        if (!Number.isFinite(actual) || actual !== dpr) {
          const msg = `devicePixelRatio mismatch (actual=${actual}, expected=${dpr})`;
          if (STRICT) {
            __navDiag('error', 'nav_total_set:dpr_mismatch', {
              stage: 'contract',
              type: __navTypePipeline,
              diagTag: 'nav_total_set',
              key: 'devicePixelRatio',
              message: msg,
              data: { outcome: 'throw', reason: 'dpr_mismatch', actual: actual, expected: dpr }
            });
            throw new TypeError(msg);
          }
          __navDiag('warn', 'nav_total_set:dpr_mismatch', {
            stage: 'contract',
            type: __navTypePipeline,
            diagTag: 'nav_total_set',
            key: 'devicePixelRatio',
            message: msg,
            data: { outcome: 'return', reason: 'dpr_mismatch', actual: actual, expected: dpr }
          });
        }
      } catch (e) {
        __navDiag(STRICT ? 'error' : 'warn', 'nav_total_set:dpr_check_failed', {
          stage: 'contract',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set',
          key: 'devicePixelRatio',
          message: 'devicePixelRatio check failed',
          data: { outcome: STRICT ? 'throw' : 'return', reason: 'dpr_check_failed' }
        }, e);
        if (STRICT) throw e;
      }
    })();

    // oscpu (только если есть в прототипе)
    if ('oscpu' in navProto) {
      const dOscpu = Object.getOwnPropertyDescriptor(navProto, 'oscpu');
      const wrappedOscpu = __wrapGetter('oscpu', () => undefined, dOscpu, __isNavigatorThis);
      safeDefineAcc(navProto, 'oscpu', wrappedOscpu);
    }
    // ——— E. userAgentData (low + high entropy) ———
    if ('userAgentData' in navigator) {
      const nativeUAD = navigator.userAgentData;
      if (!nativeUAD) {
        __navDiag('error', 'nav_total_set:userAgentData_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:userAgentData',
          key: 'userAgentData',
          message: 'window navigator.userAgentData missing'
        });
      } else {
        const uadProto = Object.getPrototypeOf(nativeUAD);
        if (!uadProto) {
          __navDiag('error', 'nav_total_set:userAgentData_proto_missing', {
            stage: 'preflight',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:userAgentData',
            key: 'userAgentData',
            message: 'window navigator.userAgentData proto missing'
          });
        } else {
          const isUadThis = (self) => (self === nativeUAD);

          const dBrands = Object.getOwnPropertyDescriptor(uadProto, 'brands');
          const dMobile = Object.getOwnPropertyDescriptor(uadProto, 'mobile');
          const dPlatform = Object.getOwnPropertyDescriptor(uadProto, 'platform');
          const dBrandsResolved = __navResolveDescriptor ? __navResolveDescriptor(uadProto, 'brands', { mode: 'proto_chain' }) : null;
          const dMobileResolved = __navResolveDescriptor ? __navResolveDescriptor(uadProto, 'mobile', { mode: 'proto_chain' }) : null;
          const dPlatformResolved = __navResolveDescriptor ? __navResolveDescriptor(uadProto, 'platform', { mode: 'proto_chain' }) : null;
          if (!dBrands || !dMobile || !dPlatform) {
            __navDiag('error', 'nav_total_set:userAgentData_descriptor_missing', {
              stage: 'preflight',
              type: __navTypeBrowser,
              diagTag: 'nav_total_set:userAgentData',
              key: 'userAgentData',
              message: 'window navigator.userAgentData descriptor missing',
              data: {
                outcome: 'skip',
                reason: 'descriptor_missing',
                protoChainFound: {
                  brands: !!(dBrandsResolved && dBrandsResolved.desc),
                  mobile: !!(dMobileResolved && dMobileResolved.desc),
                  platform: !!(dPlatformResolved && dPlatformResolved.desc)
                }
              }
            });
          } else {
            const uadOwner = uadProto;
            const uadPolicy = 'throw';
            const uadValidThis = isUadThis;
            const uadInvalidThis = 'throw';
            const primitiveSpecs = [
              {
                key: 'brands',
                desc: dBrands,
                hasValue: function () { return Array.isArray(meta.brands) && meta.brands.length > 0; },
                readValue: function () { return meta.brands; },
                missingPreflightCode: 'nav_total_set:userAgentData_brands_missing',
                missingRuntimeCode: 'nav_total_set:userAgentData_brands_runtime_missing',
                missingMessage: 'uaData.brands missing'
              },
              {
                key: 'mobile',
                desc: dMobile,
                hasValue: function () { return typeof meta.mobile === 'boolean'; },
                readValue: function () { return meta.mobile; },
                missingPreflightCode: 'nav_total_set:userAgentData_mobile_missing',
                missingRuntimeCode: 'nav_total_set:userAgentData_mobile_runtime_missing',
                missingMessage: 'uaData.mobile missing'
              },
              {
                key: 'platform',
                desc: dPlatform,
                hasValue: function () { return typeof chPlatform === 'string' && !!chPlatform; },
                readValue: function () { return chPlatform; },
                missingPreflightCode: 'nav_total_set:userAgentData_platform_missing',
                missingRuntimeCode: 'nav_total_set:userAgentData_platform_runtime_missing',
                missingMessage: 'uaData.platform missing'
              }
            ];

            for (let i = 0; i < primitiveSpecs.length; i++) {
              const spec = primitiveSpecs[i];
              const fullKey = 'userAgentData.' + spec.key;
              const isData = Object.prototype.hasOwnProperty.call(spec.desc, 'value') && !spec.desc.get && !spec.desc.set;
              __navRegisterKey(fullKey);

              if (isData) {
                if (!spec.hasValue()) {
                  __navDiag('error', spec.missingPreflightCode, {
                    stage: 'preflight',
                    type: __navTypePipeline,
                    diagTag: 'nav_total_set:' + fullKey,
                    key: fullKey,
                    message: spec.missingMessage
                  });
                } else {
                  applyCoreTargetsGroup('nav_total_set:' + fullKey, [{
                    owner: uadOwner,
                    key: spec.key,
                    kind: 'data',
                    wrapLayer: 'descriptor_only',
                    policy: uadPolicy,
                    diagTag: 'nav_total_set:' + fullKey,
                    value: spec.readValue(),
                    writable: !!spec.desc.writable,
                    configurable: !!spec.desc.configurable,
                    enumerable: !!spec.desc.enumerable
                  }], 'throw');
                }
              } else {
                const origGet = (typeof spec.desc.get === 'function') ? spec.desc.get : null;
                 applyCoreTargetsGroup('nav_total_set:' + fullKey, [{
                   owner: uadOwner,
                   key: spec.key,
                   kind: 'accessor',
                   wrapLayer: 'strict_accessor_gateway',
                   resolve: 'proto_chain',
                   policy: 'strict',
                  diagTag: 'nav_total_set:' + fullKey,
                  configurable: !!spec.desc.configurable,
                  enumerable: !!spec.desc.enumerable,
                  validThis: uadValidThis,
                  invalidThis: uadInvalidThis,
                  getImpl: function userAgentDataPrimitiveGetImpl() {
                    if (spec.hasValue()) return spec.readValue();
                    __navDiag('error', spec.missingRuntimeCode, {
                      stage: 'runtime',
                      type: __navTypePipeline,
                      diagTag: 'nav_total_set:' + fullKey,
                      key: fullKey,
                      message: spec.missingMessage
                    });
                    if (typeof origGet === 'function') return Reflect.apply(origGet, this, []);
                    return undefined;
                  }
                }], 'throw');
              }
            }
            // `fullVersionList` is a high-entropy key returned by
            // `getHighEntropyValues()`, not stable NavigatorUAData properties across Chromium.
            // Do not create synthetic descriptors on `NavigatorUAData` here (avoid shape drift).
        function dropOwnIfConfigurable(obj, key) {
          const ownDesc = Object.getOwnPropertyDescriptor(obj, key);
          if (ownDesc && ownDesc.configurable) {
           try {
             delete obj[key];
          } catch (e) {
            __navDiag('error', 'nav_total_set:userAgentData_dropOwn_failed', {
              stage: 'apply',
              type: __navTypeBrowser,
              diagTag: 'nav_total_set:userAgentData',
              key: key || null,
              message: 'dropOwn failed'
            }, e);
          }
        }
      }

      const ghevResolved = __navResolveDescriptor
        ? __navResolveDescriptor(uadProto, 'getHighEntropyValues', { mode: 'proto_chain' })
        : {
            owner: Object.getOwnPropertyDescriptor(uadProto, 'getHighEntropyValues') ? uadProto : nativeUAD,
            desc: Object.getOwnPropertyDescriptor(uadProto, 'getHighEntropyValues')
              || Object.getOwnPropertyDescriptor(nativeUAD, 'getHighEntropyValues')
              || null
          };
      const ghevDesc = ghevResolved ? ghevResolved.desc : null;
      const ghevOwner = (ghevResolved && ghevResolved.owner) ? ghevResolved.owner : uadProto;
      const origGHEV = ghevDesc ? ghevDesc.value : null;
      if (!ghevDesc) {
        __navDiag('error', 'nav_total_set:userAgentData_getHighEntropyValues_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
          key: 'userAgentData.getHighEntropyValues',
          message: 'uaData.getHighEntropyValues missing'
        });
      } else if (ghevOwner === nativeUAD) {
        __navDiag('error', 'nav_total_set:userAgentData_getHighEntropyValues_owner_mismatch', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
          key: 'userAgentData.getHighEntropyValues',
          message: 'uaData.getHighEntropyValues resolved to instance owner',
          data: { outcome: 'skip', reason: 'instance_owner_resolved' }
        });
      } else if (typeof origGHEV !== 'function') {
        __navDiag('error', 'nav_total_set:userAgentData_getHighEntropyValues_original_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
          key: 'userAgentData.getHighEntropyValues',
          message: 'uaData.getHighEntropyValues original missing'
        });
      } else {
        __navRegisterKey('userAgentData.getHighEntropyValues');
        dropOwnIfConfigurable(nativeUAD, 'getHighEntropyValues');
        applyCoreTargetsGroup('nav_total_set:userAgentData.getHighEntropyValues', [{
          owner: ghevOwner,
          key: 'getHighEntropyValues',
          kind: 'promise_method',
          resolve: 'proto_chain',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
          validThis: isUadThis,
          invalidThis: 'throw',
          invoke(orig, args) {
            __navLogAccess('userAgentData.getHighEntropyValues', null);
            const keys = (args && args.length) ? args[0] : undefined;
            if (!Array.isArray(keys)) {
              __navDiag('error', 'nav_total_set:userAgentData_getHighEntropyValues_bad_keys', {
                stage: 'runtime',
                type: __navTypePipeline,
                diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
                key: 'userAgentData.getHighEntropyValues',
                message: 'bad highEntropy keys',
                data: { outcome: 'return', reason: 'bad_keys' }
              });
              return Reflect.apply(orig, this, args || []);
             }
             const nativeOut = Reflect.apply(orig, this, args || []);
             if (!nativeOut || typeof nativeOut.then !== 'function') {
               const err = new TypeError('promise_contract_failed');
               __navDiag('error', 'nav_total_set:userAgentData_getHighEntropyValues_promise_contract_failed', {
                 stage: 'runtime',
                 type: __navTypePipeline,
                 diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
                 key: 'userAgentData.getHighEntropyValues',
                 message: 'promise_contract_failed',
                 data: { outcome: 'return', reason: 'promise_contract_failed' }
               }, err);
               // Public API path must not leak service errors; pass-through native behavior.
               return Reflect.apply(orig, this, args || []);
             }
              const safeDeviceMemory = __navIsValidDeviceMemoryValue(mem) ? mem : undefined;
              const safeHardwareConcurrency = __navIsValidHardwareConcurrencyValue(cpu) ? cpu : undefined;
              const fullVersionList = (meta && meta.fullVersionList != null)
                ? meta.fullVersionList
                : __navProfileState.fullVersionList;
               const map = {
                 architecture: meta.architecture,
                 bitness: meta.bitness,
                model: meta.model,
                brands: meta.brands,
                 mobile: meta.mobile,
                 platform: chPlatform,
                 platformVersion: meta.platformVersion,
                 fullVersionList: fullVersionList,
                 deviceMemory: safeDeviceMemory,
                 hardwareConcurrency: safeHardwareConcurrency,
                 wow64: meta.wow64,
                 formFactors: meta.formFactors
               };
             const result = {};
             for (const hint of keys) {
               if (typeof hint !== 'string' || !hint) {
                 __navDiag('error', 'nav_total_set:userAgentData_getHighEntropyValues_bad_hint', {
                   stage: 'runtime',
                   type: __navTypePipeline,
                   diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
                   key: 'userAgentData.getHighEntropyValues',
                   message: 'bad highEntropy key item',
                   data: { outcome: 'return', reason: 'bad_hint' }
                 });
                 return nativeOut;
               }
               const val = map[hint];
               if (val === undefined || val === null || (typeof val === 'string' && !val && hint !== 'model') || (Array.isArray(val) && !val.length)) {
                 continue;
               }
               result[hint] = val;
             }
              return nativeOut.then(function userAgentDataGetHighEntropyValuesPost(nativeResolved) {
                try {
                  const base = (nativeResolved && typeof nativeResolved === 'object') ? nativeResolved : null;
                  if (!base) {
                    return Object.keys(result).length ? Object.assign({}, result) : nativeResolved;
                  }
                  const out = Object.assign({}, base);
                  for (const hint of Object.keys(result)) {
                    const current = out[hint];
                    if (current === undefined || current === null || (typeof current === 'string' && !current && hint !== 'model') || (Array.isArray(current) && !current.length)) {
                      out[hint] = result[hint];
                    }
                  }
                  return out;
                } catch (e) {
                  __navDiag('error', 'nav_total_set:userAgentData_getHighEntropyValues_hooksPost_failed', {
                   stage: 'runtime',
                   type: __navTypePipeline,
                   diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
                   key: 'userAgentData.getHighEntropyValues',
                   message: 'hooksPost_failed',
                   data: { outcome: 'return', reason: 'hooksPost_failed' }
                 }, e);
                 return nativeResolved;
               }
             });
            }
          }], 'throw');
       }

      const toJsonResolved = __navResolveDescriptor
        ? __navResolveDescriptor(uadProto, 'toJSON', { mode: 'proto_chain' })
        : {
            owner: Object.getOwnPropertyDescriptor(uadProto, 'toJSON') ? uadProto : nativeUAD,
            desc: Object.getOwnPropertyDescriptor(uadProto, 'toJSON')
              || Object.getOwnPropertyDescriptor(nativeUAD, 'toJSON')
              || null
          };
      const toJsonDesc = toJsonResolved ? toJsonResolved.desc : null;
      const toJsonOwner = (toJsonResolved && toJsonResolved.owner) ? toJsonResolved.owner : uadProto;
      const origToJSON = toJsonDesc ? toJsonDesc.value : null;
      if (!toJsonDesc) {
        __navDiag('error', 'nav_total_set:userAgentData_toJSON_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:userAgentData.toJSON',
          key: 'userAgentData.toJSON',
          message: 'uaData.toJSON missing'
        });
      } else if (toJsonOwner === nativeUAD) {
        __navDiag('error', 'nav_total_set:userAgentData_toJSON_owner_mismatch', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:userAgentData.toJSON',
          key: 'userAgentData.toJSON',
          message: 'uaData.toJSON resolved to instance owner',
          data: { outcome: 'skip', reason: 'instance_owner_resolved' }
        });
      } else if (typeof origToJSON !== 'function') {
        __navDiag('error', 'nav_total_set:userAgentData_toJSON_original_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:userAgentData.toJSON',
          key: 'userAgentData.toJSON',
          message: 'uaData.toJSON original missing'
        });
      } else {
        __navRegisterKey('userAgentData.toJSON');
        dropOwnIfConfigurable(nativeUAD, 'toJSON');
        applyCoreTargetsGroup('nav_total_set:userAgentData.toJSON', [{
          owner: toJsonOwner,
          key: 'toJSON',
          kind: 'method',
          resolve: 'proto_chain',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:userAgentData.toJSON',
          validThis: isUadThis,
          invalidThis: 'throw',
          invoke(orig, args) {
            __navLogAccess('userAgentData.toJSON', null);
            let nativeOut;
            try {
              nativeOut = Reflect.apply(orig, this, args || []);
            } catch (e) {
              __navDiag('error', 'nav_total_set:userAgentData_toJSON_runtime_failed', {
                stage: 'runtime',
                type: __navTypeBrowser,
                diagTag: 'nav_total_set:userAgentData.toJSON',
                key: 'userAgentData.toJSON',
                message: 'uaData.toJSON runtime failed'
              }, e);
              throw e;
            }
            try {
              const out = (nativeOut && typeof nativeOut === 'object') ? Object.assign({}, nativeOut) : {};
              if (out.platform == null) out.platform = this.platform;
              if (out.brands == null) out.brands = this.brands;
              if (out.mobile == null) out.mobile = this.mobile;
              return out;
            } catch (e) {
              __navDiag('error', 'nav_total_set:userAgentData_toJSON_post_failed', {
                stage: 'runtime',
                type: __navTypePipeline,
                diagTag: 'nav_total_set:userAgentData.toJSON',
                key: 'userAgentData.toJSON',
                message: 'uaData.toJSON post failed'
              }, e);
              return nativeOut;
            }
          }
        }], 'throw');
      }

    // IMPORTANT: getter — on PROTOTYPE, without own-fallback
    const dUaData = Object.getOwnPropertyDescriptor(navProto, 'userAgentData');
    const dUaDataResolved = __navResolveDescriptor ? __navResolveDescriptor(navProto, 'userAgentData', { mode: 'proto_chain' }) : null;
    if (!dUaData) {
      __navDiag('error', 'nav_total_set:userAgentData_getter_descriptor_missing', {
        stage: 'preflight',
        type: __navTypeBrowser,
        diagTag: 'nav_total_set:userAgentData',
        key: 'userAgentData',
        message: 'userAgentData descriptor missing',
        data: {
          outcome: 'skip',
          reason: 'descriptor_missing',
          protoChainFound: !!(dUaDataResolved && dUaDataResolved.desc),
          protoChainOnExpectedOwner: !!(dUaDataResolved && dUaDataResolved.owner === navProto)
        }
      });
    } else {
      const appliedUaData = patchObjectReturnAccessor('userAgentData', function userAgentDataAccessorValue() {
        return nativeUAD;
      }, 'nav_total_set:userAgentData');
      if (appliedUaData) {
        const uadTag = Object.prototype.toString.call(nativeUAD);
        if (uadTag === '[object Object]') {
          __navDiag('warn', 'nav_total_set:userAgentData_tag_suspicious', {
            stage: 'contract',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:userAgentData',
            key: 'userAgentData',
            message: 'window navigator.userAgentData tag'
          });
        }
        const uadCtor = Object.getPrototypeOf(nativeUAD) && Object.getPrototypeOf(nativeUAD).constructor;
        if (!uadCtor || uadCtor.name === 'Object') {
          __navDiag('warn', 'nav_total_set:userAgentData_proto_suspicious', {
            stage: 'contract',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:userAgentData',
            key: 'userAgentData',
            message: 'window navigator.userAgentData proto'
          });
        }
        __navDiag('info', 'nav_total_set:uaData_toJSON_ok', {
          stage: 'apply',
          type: __navTypePipeline,
          diagTag: 'nav_total_set:userAgentData',
          key: 'userAgentData',
          message: 'userAgentData ready',
          data: { outcome: 'return', reason: 'ready' }
        });
      }
    }
    }
    }
    }

    // ——— F/G. strict scalar runtime-backed accessors ———
    const nativeDeviceMemoryDesc = __navResolveNativeAccessorDesc('deviceMemory');
    const nativeHardwareConcurrencyDesc = __navResolveNativeAccessorDesc('hardwareConcurrency');
    const nativeLanguageDesc = __navResolveNativeAccessorDesc('language');
    const nativeLanguagesDesc = __navResolveNativeAccessorDesc('languages');

    patchStrictScalarAccessor('deviceMemory', 'deviceMemory' in navProto ? function navDeviceMemoryValue() {
      if (__navIsValidDeviceMemoryValue(mem)) return mem;
      __navDiagPipeline('warn', 'nav_total_set:deviceMemory_invalid_profile', {
        stage: 'runtime',
        key: 'deviceMemory',
        message: 'invalid deviceMemory profile value',
        data: { outcome: 'return', reason: 'invalid_profile_value', value: mem }
      });
      return __navReadNativeScalarFallback(nativeDeviceMemoryDesc, this, 'deviceMemory', 'nav_total_set:deviceMemory');
    } : null, 'nav_total_set:deviceMemory');
    patchStrictScalarAccessor('hardwareConcurrency', 'hardwareConcurrency' in navProto ? function navHardwareConcurrencyValue() {
      if (__navIsValidHardwareConcurrencyValue(cpu)) return cpu;
      __navDiagPipeline('warn', 'nav_total_set:hardwareConcurrency_invalid_profile', {
        stage: 'runtime',
        key: 'hardwareConcurrency',
        message: 'invalid hardwareConcurrency profile value',
        data: { outcome: 'return', reason: 'invalid_profile_value', value: cpu }
      });
      return __navReadNativeScalarFallback(nativeHardwareConcurrencyDesc, this, 'hardwareConcurrency', 'nav_total_set:hardwareConcurrency');
    } : null, 'nav_total_set:hardwareConcurrency');
    patchStrictScalarAccessor('language', 'language' in navProto ? function navLanguageValue() {
      const primaryLanguage = __navPrimaryLanguage;
      const normalizedLanguages = __navNormalizedLanguages;
      if (__navIsValidLanguageList(normalizedLanguages) && typeof primaryLanguage === 'string' && primaryLanguage && primaryLanguage === normalizedLanguages[0]) {
        return primaryLanguage;
      }
      __navDiagPipeline('warn', 'nav_total_set:language_invalid_profile', {
        stage: 'runtime',
        key: 'language',
        message: 'invalid language profile value',
        data: {
          outcome: 'return',
          reason: 'invalid_profile_value',
          primaryLanguage: primaryLanguage == null ? null : primaryLanguage,
          normalizedLanguages: Array.isArray(normalizedLanguages) ? normalizedLanguages.slice(0, 8) : normalizedLanguages
        }
      });
      return __navReadNativeScalarFallback(nativeLanguageDesc, this, 'language', 'nav_total_set:language');
    } : null, 'nav_total_set:language');
    patchStrictScalarAccessor('languages', 'languages' in navProto ? function navLanguagesValue() {
      const primaryLanguage = __navPrimaryLanguage;
      const normalizedLanguages = __navNormalizedLanguages;
      if (__navIsValidLanguageList(normalizedLanguages) && typeof primaryLanguage === 'string' && primaryLanguage && primaryLanguage === normalizedLanguages[0]) {
        return normalizedLanguages;
      }
      __navDiagPipeline('warn', 'nav_total_set:languages_invalid_profile', {
        stage: 'runtime',
        key: 'languages',
        message: 'invalid languages profile value',
        data: {
          outcome: 'return',
          reason: 'invalid_profile_value',
          primaryLanguage: primaryLanguage == null ? null : primaryLanguage,
          normalizedLanguages: Array.isArray(normalizedLanguages) ? normalizedLanguages.slice(0, 8) : normalizedLanguages
        }
      });
      return __navReadNativeScalarFallback(nativeLanguagesDesc, this, 'languages', 'nav_total_set:languages');
    } : null, 'nav_total_set:languages');

  
   
    // ——— H. permissions.query ———
    if ('permissions' in navigator && navigator.permissions && typeof navigator.permissions.query === 'function') {
      const permProto = Object.getPrototypeOf(navigator.permissions) || navigator.permissions;
      const permResolved = __navResolveDescriptor
        ? __navResolveDescriptor(permProto, 'query', { mode: 'proto_chain' })
        : {
            owner: Object.getOwnPropertyDescriptor(permProto, 'query') ? permProto : navigator.permissions,
            desc: Object.getOwnPropertyDescriptor(permProto, 'query')
              || Object.getOwnPropertyDescriptor(navigator.permissions, 'query')
              || null
          };
      const permDesc = permResolved ? permResolved.desc : null;
      const permOwner = (permResolved && permResolved.owner) ? permResolved.owner : permProto;
      if (!permDesc) {
        __navDiag('error', 'nav_total_set:permissions_query_descriptor_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:permissions.query',
          key: 'permissions.query',
          message: 'permissions.query descriptor missing'
        });
      } else if (!Object.prototype.hasOwnProperty.call(permDesc, 'value') || typeof permDesc.value !== 'function') {
        __navDiag('error', 'nav_total_set:permissions_query_descriptor_kind_mismatch', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:permissions.query',
          key: 'permissions.query',
          message: 'permissions.query is not method-shaped on prototype'
        });
      } else if (permOwner === navigator.permissions) {
        __navDiag('error', 'nav_total_set:permissions_query_owner_mismatch', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:permissions.query',
          key: 'permissions.query',
          message: 'permissions.query resolved to instance owner',
          data: { outcome: 'skip', reason: 'instance_owner_resolved' }
        });
      } else {
        __navRegisterKey('permissions.query');
        const origQuery = permDesc.value;
        if (typeof origQuery !== 'function') {
          __navDiag('error', 'nav_total_set:permissions_query_original_missing', {
            stage: 'preflight',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:permissions.query',
            key: 'permissions.query',
            message: 'permissions.query original missing'
          });
        } else {
          applyCoreTargetsGroup('nav_total_set:permissions.query', [{
            owner: permOwner,
            key: 'query',
            resolve: 'proto_chain',
            kind: 'promise_method',
            wrapLayer: 'core_wrapper',
            invokeClass: 'brand_strict',
            wrapperClass: 'core_proxy',
            policy: 'throw',
            diagTag: 'nav_total_set:permissions.query',
            validThis(self) {
              return self === navigator.permissions;
            },
            invalidThis: 'native',
            invoke(orig, args) {
              const parameters = (args && args.length) ? args[0] : undefined;
              const permName = (parameters && typeof parameters === 'object' && typeof parameters.name === 'string')
                ? parameters.name
                : null;
              if (permName === 'microphone') {
                const sourceName = 'audioinput';
                const label = (devicesLabels && typeof devicesLabels === 'object') ? devicesLabels[sourceName] : undefined;
                const out = Reflect.apply(orig, this, args || []);
                if (!label) {
                  __navDiag('warn', 'nav_total_set:permissions_query_devices_label_missing', {
                    stage: 'runtime',
                    type: __navTypePipeline,
                    diagTag: 'nav_total_set:permissions.query',
                    key: 'permissions.query',
                    message: 'devices_labels.audioinput missing for permissions.query("microphone")'
                  });
                }
                return Promise.resolve(out).then(function onPermissionsQueryResolved(status) {
                  const state = (status && typeof status === 'object' && typeof status.state === 'string') ? status.state : null;
                  mediaMicGranted = state === 'granted';
                  syncMediaLabelsUnlocked();
                  __navLogAccess('permissions.query', null, {
                    bucket: 'core_wrapper',
                    permission: permName,
                    source: sourceName,
                    state,
                    mediaDevicesLabelsUnlocked
                  });
                  return status;
                });
              }
              if (permName === 'camera') {
                const out = Reflect.apply(orig, this, args || []);
                return Promise.resolve(out).then(function onPermissionsQueryResolved(status) {
                  const state = (status && typeof status === 'object' && typeof status.state === 'string') ? status.state : null;
                  mediaCameraGranted = state === 'granted';
                  syncMediaLabelsUnlocked();
                  __navLogAccess('permissions.query', null, {
                    bucket: 'core_wrapper',
                    permission: permName,
                    state,
                    mediaDevicesLabelsUnlocked
                  });
                  return status;
                });
              }
              __navLogAccess('permissions.query', null, { bucket: 'core_wrapper' });
              return Reflect.apply(orig, this, args || []);
            }
          }], 'throw');
        }
      }
    }

    // ——— I. mediaDevices.enumerateDevices ———
    if (navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function') {
      const mediaProto = Object.getPrototypeOf(navigator.mediaDevices) || navigator.mediaDevices;
      const mediaResolved = __navResolveDescriptor
        ? __navResolveDescriptor(mediaProto, 'enumerateDevices', { mode: 'proto_chain' })
        : {
            owner: Object.getOwnPropertyDescriptor(mediaProto, 'enumerateDevices') ? mediaProto : navigator.mediaDevices,
            desc: Object.getOwnPropertyDescriptor(mediaProto, 'enumerateDevices')
              || Object.getOwnPropertyDescriptor(navigator.mediaDevices, 'enumerateDevices')
              || null
          };
      const mediaDesc = mediaResolved ? mediaResolved.desc : null;
      const mediaOwner = (mediaResolved && mediaResolved.owner) ? mediaResolved.owner : mediaProto;
      if (!mediaDesc) {
        __navDiag('error', 'nav_total_set:mediaDevices_enumerateDevices_descriptor_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:mediaDevices.enumerateDevices',
          key: 'mediaDevices.enumerateDevices',
          message: 'mediaDevices.enumerateDevices descriptor missing'
        });
      } else if (!Object.prototype.hasOwnProperty.call(mediaDesc, 'value') || typeof mediaDesc.value !== 'function') {
        __navDiag('error', 'nav_total_set:mediaDevices_enumerateDevices_descriptor_kind_mismatch', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:mediaDevices.enumerateDevices',
          key: 'mediaDevices.enumerateDevices',
          message: 'mediaDevices.enumerateDevices is not method-shaped on prototype'
        });
      } else if (mediaOwner === navigator.mediaDevices) {
        __navDiag('error', 'nav_total_set:mediaDevices_enumerateDevices_owner_mismatch', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:mediaDevices.enumerateDevices',
          key: 'mediaDevices.enumerateDevices',
          message: 'mediaDevices.enumerateDevices resolved to instance owner',
          data: { outcome: 'skip', reason: 'instance_owner_resolved' }
        });
      } else {
        __navRegisterKey('mediaDevices.enumerateDevices');
        const origEnumerateDevices = mediaDesc.value;
        if (typeof origEnumerateDevices !== 'function') {
          __navDiag('error', 'nav_total_set:mediaDevices_enumerateDevices_original_missing', {
            stage: 'preflight',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:mediaDevices.enumerateDevices',
            key: 'mediaDevices.enumerateDevices',
            message: 'mediaDevices.enumerateDevices original missing'
          });
        } else {
          applyCoreTargetsGroup('nav_total_set:mediaDevices.enumerateDevices', [{
            owner: mediaOwner,
            key: 'enumerateDevices',
            resolve: 'proto_chain',
            kind: 'promise_method',
            wrapLayer: 'core_wrapper',
            invokeClass: 'brand_strict',
            wrapperClass: 'core_proxy',
            policy: 'throw',
            diagTag: 'nav_total_set:mediaDevices.enumerateDevices',
            validThis(self) {
              return self === navigator.mediaDevices;
            },
            invalidThis: 'native',
            invoke(orig, args) {
              if (!devicesLabels || typeof devicesLabels !== 'object') {
                __navDiag('error', 'nav_total_set:mediaDevices_devices_labels_missing', {
                  stage: 'runtime',
                  type: __navTypePipeline,
                  diagTag: 'nav_total_set:mediaDevices.enumerateDevices',
                  key: 'mediaDevices.enumerateDevices',
                  message: 'devices labels missing'
                });
                return Reflect.apply(orig, this, args || []);
              }
              if (typeof devicesLabels.audioinput !== 'string'
                || typeof devicesLabels.videoinput !== 'string'
                || typeof devicesLabels.audiooutput !== 'string') {
                __navDiag('error', 'nav_total_set:mediaDevices_devices_labels_invalid', {
                  stage: 'runtime',
                  type: __navTypePipeline,
                  diagTag: 'nav_total_set:mediaDevices.enumerateDevices',
                  key: 'mediaDevices.enumerateDevices',
                  message: 'devices labels invalid'
                });
                return Reflect.apply(orig, this, args || []);
              }
              if (typeof R !== 'function') {
                return Reflect.apply(orig, this, args || []);
              }
              const generateHexId = (len = 64) => {
                let s = '';
                for (let i = 0; i < len; ++i) s += Math.floor(R() * 16).toString(16);
                return s;
              };
              const audioUnlocked = !!mediaMicGranted;
              const videoUnlocked = !!mediaCameraGranted;
              __navLogAccess('mediaDevices.enumerateDevices', null, {
                bucket: 'core_wrapper',
                multimediaDevices: { speakers: 1, micros: 1, webcams: 1 },
                labelsHidden: !(audioUnlocked || videoUnlocked),
                audioUnlocked,
                videoUnlocked
              });
              const groupId = generateHexId(64);
              return Promise.resolve([
                {
                  kind: 'audioinput',
                  label: audioUnlocked ? devicesLabels.audioinput : '',
                  deviceId: audioUnlocked ? generateHexId(64) : '',
                  groupId: audioUnlocked ? groupId : ''
                },
                {
                  kind: 'videoinput',
                  label: videoUnlocked ? devicesLabels.videoinput : '',
                  deviceId: videoUnlocked ? generateHexId(64) : '',
                  groupId: videoUnlocked ? groupId : ''
                },
                {
                  kind: 'audiooutput',
                  label: audioUnlocked ? devicesLabels.audiooutput : '',
                  deviceId: audioUnlocked ? generateHexId(64) : '',
                  groupId: audioUnlocked ? generateHexId(64) : ''
                }
              ]);
            }
          }], 'throw');
        }
      }
    }

    // ——— J. storage.estimate & webkitTemporaryStorage ———
     // Конфигурация: берём из глобалов (как и прочие параметры в модуле), иначе безопасные дефолты
    if (navigator.storage && typeof navigator.storage.estimate === 'function') {
      const storageProto = Object.getPrototypeOf(navigator.storage) || navigator.storage;
      const storageResolved = __navResolveDescriptor
        ? __navResolveDescriptor(storageProto, 'estimate', { mode: 'proto_chain' })
        : {
            owner: Object.getOwnPropertyDescriptor(storageProto, 'estimate') ? storageProto : navigator.storage,
            desc: Object.getOwnPropertyDescriptor(storageProto, 'estimate')
              || Object.getOwnPropertyDescriptor(navigator.storage, 'estimate')
              || null
          };
      const storageDesc = storageResolved ? storageResolved.desc : null;
      const storageOwner = (storageResolved && storageResolved.owner) ? storageResolved.owner : storageProto;
         if (!storageDesc) {
           __navDiag('error', 'nav_total_set:storage_estimate_descriptor_missing', {
             surface: 'navigator',
             stage: 'preflight',
             type: __navTypeBrowser,
             diagTag: 'nav_total_set:storage.estimate',
           key: 'storage.estimate',
           message: 'storage.estimate descriptor missing'
         });
       } else if (!Object.prototype.hasOwnProperty.call(storageDesc, 'value') || typeof storageDesc.value !== 'function') {
         __navDiag('error', 'nav_total_set:storage_estimate_descriptor_kind_mismatch', {
           surface: 'navigator',
           stage: 'preflight',
           type: __navTypeBrowser,
           diagTag: 'nav_total_set:storage.estimate',
           key: 'storage.estimate',
           message: 'storage.estimate is not method-shaped on prototype'
         });
       } else if (storageOwner === navigator.storage) {
         __navDiag('error', 'nav_total_set:storage_estimate_owner_mismatch', {
           surface: 'navigator',
           stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:storage.estimate',
          key: 'storage.estimate',
          message: 'storage.estimate resolved to instance owner',
          data: { outcome: 'skip', reason: 'instance_owner_resolved' }
        });
      } else {
      const QUOTA_MB   = Number(__navProfileState.storageQuotaMb ?? 120);
      const USED_PCT   = Math.max(0, Math.min(100, Number(__navProfileState.storageUsedPct ?? 3))); // ~3% занято
      const quotaBytes = Math.floor(QUOTA_MB * 1024 * 1024);
      let usageBytes   = Math.max(0, Math.floor(quotaBytes * USED_PCT / 100));

      // Monotonous “jitter” of usage within a few KB, on R(), so as not to break the module’s entropy
       const tickUsage = __navMark(function tickUsage() {
         if (typeof R === 'function') {
           usageBytes = Math.min(quotaBytes - 4096, usageBytes + Math.floor(R() * 4096));
         }
       }, 'tickUsage');

        const origEstimate = storageDesc.value;
        if (typeof origEstimate !== 'function') {
          __navDiag('error', 'nav_total_set:storage_estimate_original_missing', {
            surface: 'navigator',
            stage: 'preflight',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:storage.estimate',
          key: 'storage.estimate',
          message: 'storage.estimate original missing'
        });
      } else {
        __navRegisterKey('storage.estimate');
        applyCoreTargetsGroup('nav_total_set:storage.estimate', [{
          owner: storageOwner,
          key: 'estimate',
          resolve: 'proto_chain',
          kind: 'promise_method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:storage.estimate',
          validThis(self) {
            return self === navigator.storage;
          },
          invalidThis: 'native',
          invoke(orig, args) {
            __navLogAccess('storage.estimate', null, { bucket: 'core_wrapper' });
            tickUsage();
            return Promise.resolve({ quota: quotaBytes, usage: usageBytes });
          }
        }], 'throw');
      }
      if (navigator.webkitTemporaryStorage) {
        const tmpProto = Object.getPrototypeOf(navigator.webkitTemporaryStorage) || navigator.webkitTemporaryStorage;
        const tmpResolved = __navResolveDescriptor
          ? __navResolveDescriptor(tmpProto, 'queryUsageAndQuota', { mode: 'proto_chain' })
          : {
              owner: Object.getOwnPropertyDescriptor(tmpProto, 'queryUsageAndQuota') ? tmpProto : navigator.webkitTemporaryStorage,
              desc: Object.getOwnPropertyDescriptor(tmpProto, 'queryUsageAndQuota')
                || Object.getOwnPropertyDescriptor(navigator.webkitTemporaryStorage, 'queryUsageAndQuota')
                || null
            };
        const tmpDesc = tmpResolved ? tmpResolved.desc : null;
        const tmpOwner = (tmpResolved && tmpResolved.owner) ? tmpResolved.owner : tmpProto;
        if (!tmpDesc) {
          __navDiag('error', 'nav_total_set:webkitTemporaryStorage_queryUsageAndQuota_descriptor_missing', {
            surface: 'navigator',
            stage: 'preflight',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:webkitTemporaryStorage.queryUsageAndQuota',
            key: 'webkitTemporaryStorage.queryUsageAndQuota',
            message: 'webkitTemporaryStorage.queryUsageAndQuota descriptor missing'
          });
        } else if (tmpOwner === navigator.webkitTemporaryStorage) {
          __navDiag('error', 'nav_total_set:webkitTemporaryStorage_queryUsageAndQuota_owner_mismatch', {
            surface: 'navigator',
            stage: 'preflight',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:webkitTemporaryStorage.queryUsageAndQuota',
            key: 'webkitTemporaryStorage.queryUsageAndQuota',
            message: 'webkitTemporaryStorage.queryUsageAndQuota resolved to instance owner',
            data: { outcome: 'skip', reason: 'instance_owner_resolved' }
          });
        } else {
          __navRegisterKey('webkitTemporaryStorage.queryUsageAndQuota');
          applyCoreTargetsGroup('nav_total_set:webkitTemporaryStorage.queryUsageAndQuota', [{
          owner: tmpOwner,
          key: 'queryUsageAndQuota',
          resolve: 'proto_chain',
          kind: 'method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:webkitTemporaryStorage.queryUsageAndQuota',
          validThis(self) {
            return self === navigator.webkitTemporaryStorage || self === tmpProto;
          },
          invalidThis: 'throw',
          invoke(_orig, args) {
            __navLogAccess('webkitTemporaryStorage.queryUsageAndQuota', null);
            const success = (args && args.length) ? args[0] : undefined;
            const error = (args && args.length > 1) ? args[1] : undefined;
            try {
              tickUsage();
            } catch (e) {
              __navDiag('error', 'nav_total_set:webkitTemporaryStorage_queryUsageAndQuota', {
                surface: 'navigator',
                stage: 'runtime',
                type: __navTypeBrowser,
                diagTag: 'nav_total_set:webkitTemporaryStorage.queryUsageAndQuota',
                key: 'webkitTemporaryStorage.queryUsageAndQuota',
                message: 'webkitTemporaryStorage.queryUsageAndQuota failed'
              }, e);
              if (typeof _orig === 'function') return Reflect.apply(_orig, this, args || []);
              if (typeof error === 'function') error(e);
              return undefined;
            }
            if (typeof success === 'function') success(usageBytes, quotaBytes);
            return undefined;
          }
        }], 'throw');
        }
      }

      // Consistent “persistence”
      if (typeof navigator.storage.persist   === 'function') {
        const persistResolved = __navResolveDescriptor
          ? __navResolveDescriptor(storageProto, 'persist', { mode: 'proto_chain' })
          : {
              owner: Object.getOwnPropertyDescriptor(storageProto, 'persist') ? storageProto : navigator.storage,
              desc: Object.getOwnPropertyDescriptor(storageProto, 'persist')
                || Object.getOwnPropertyDescriptor(navigator.storage, 'persist')
                || null
            };
        const persistDesc = persistResolved ? persistResolved.desc : null;
        const persistOwner = (persistResolved && persistResolved.owner) ? persistResolved.owner : storageProto;
        if (!persistDesc) {
          __navDiag('error', 'nav_total_set:storage_persist_descriptor_missing', {
            surface: 'navigator',
            stage: 'preflight',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:storage.persist',
            key: 'storage.persist',
            message: 'storage.persist descriptor missing'
          });
        } else if (persistOwner === navigator.storage) {
          __navDiag('error', 'nav_total_set:storage_persist_owner_mismatch', {
            surface: 'navigator',
            stage: 'preflight',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:storage.persist',
            key: 'storage.persist',
            message: 'storage.persist resolved to instance owner',
            data: { outcome: 'skip', reason: 'instance_owner_resolved' }
          });
        } else {
          __navRegisterKey('storage.persist');
          applyCoreTargetsGroup('nav_total_set:storage.persist', [{
          owner: persistOwner,
          key: 'persist',
          resolve: 'proto_chain',
          kind: 'promise_method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:storage.persist',
          validThis(self) {
            return self === navigator.storage;
          },
          invalidThis: 'throw',
          invoke(orig, args) {
            __navLogAccess('storage.persist', null);
            const out = Reflect.apply(orig, this, args || []);
            return Promise.resolve(out);
          }
        }], 'throw');
        }
      }
      if (typeof navigator.storage.persisted === 'function') {
        const persistedResolved = __navResolveDescriptor
          ? __navResolveDescriptor(storageProto, 'persisted', { mode: 'proto_chain' })
          : {
              owner: Object.getOwnPropertyDescriptor(storageProto, 'persisted') ? storageProto : navigator.storage,
              desc: Object.getOwnPropertyDescriptor(storageProto, 'persisted')
                || Object.getOwnPropertyDescriptor(navigator.storage, 'persisted')
                || null
            };
        const persistedDesc = persistedResolved ? persistedResolved.desc : null;
        const persistedOwner = (persistedResolved && persistedResolved.owner) ? persistedResolved.owner : storageProto;
        if (!persistedDesc) {
          __navDiag('error', 'nav_total_set:storage_persisted_descriptor_missing', {
            surface: 'navigator',
            stage: 'preflight',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:storage.persisted',
            key: 'storage.persisted',
            message: 'storage.persisted descriptor missing'
          });
        } else if (persistedOwner === navigator.storage) {
          __navDiag('error', 'nav_total_set:storage_persisted_owner_mismatch', {
            surface: 'navigator',
            stage: 'preflight',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:storage.persisted',
            key: 'storage.persisted',
            message: 'storage.persisted resolved to instance owner',
            data: { outcome: 'skip', reason: 'instance_owner_resolved' }
          });
        } else {
          __navRegisterKey('storage.persisted');
          applyCoreTargetsGroup('nav_total_set:storage.persisted', [{
          owner: persistedOwner,
          key: 'persisted',
          resolve: 'proto_chain',
          kind: 'promise_method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:storage.persisted',
          validThis(self) {
            return self === navigator.storage;
          },
          invalidThis: 'throw',
          invoke(orig, args) {
            __navLogAccess('storage.persisted', null);
            const out = Reflect.apply(orig, this, args || []);
            return Promise.resolve(out);
          }
        }], 'throw');
        }
      }
      }
    }

      // ———  JS heap sizing from deviceMemory ———
      // if-стиль: патчим только если dm валиден
      // dm: 0.25, 0.5, 1, 2, 4, 8, …
      // читаем dm каждый раз — «жёсткая» привязка к текущему realm
      // dm нелегален → не вмешиваемся (оставляем натив/предыдущее)
    const perfProto = (window.Performance && Performance.prototype) || Object.getPrototypeOf(performance);
    if (perfProto) {
      const dm0 = Number(navigator.deviceMemory);
      if (typeof dm0 === 'number' && isFinite(dm0)) {
        const perfMemoryResolved = __navResolveDescriptor
          ? __navResolveDescriptor(perfProto, 'memory', { mode: 'proto_chain' })
          : {
              owner: Object.getOwnPropertyDescriptor(perfProto, 'memory') ? perfProto : performance,
              desc: Object.getOwnPropertyDescriptor(perfProto, 'memory')
                || Object.getOwnPropertyDescriptor(performance, 'memory')
                || null
            };
        const perfMemoryOwner = (perfMemoryResolved && perfMemoryResolved.owner) ? perfMemoryResolved.owner : perfProto;

        const heapFromDM = __navMark(function heapFromDM(dm) {
          if (!(typeof dm === 'number' && isFinite(dm))) return null;
          if (dm <= 0.5) return 512  * 1024 * 1024;   
          if (dm <= 1)   return 768  * 1024 * 1024;   
          if (dm <= 2)   return 1536 * 1024 * 1024;   
          if (dm <= 4)   return 3072 * 1024 * 1024;   
          return 4096 * 1024 * 1024;                  
        }, 'heapFromDM');
        const getMemory = __navMark(function () {
          const dm = Number(navigator.deviceMemory);
          const limit = heapFromDM(dm);
          if (limit == null) {
            const d = perfMemoryResolved ? perfMemoryResolved.desc : null;
            return d && d.get ? d.get.call(performance) : undefined;
          }
          const total = Math.floor(limit * 0.25);
          const randMix = (typeof R === 'function') ? (0.40 + 0.15 * R()) : 0.40;
          const used  = Math.min(total - 1, Math.floor(total * randMix));
          return { jsHeapSizeLimit: limit, totalJSHeapSize: total, usedJSHeapSize: used };
        }, 'get memory');

        try {
          if (perfMemoryOwner === performance) {
            __navDiag('warn', 'nav_total_set:performance_memory_owner_mismatch', {
              surface: 'navigator',
              stage: 'preflight',
              type: __navTypeBrowser,
              diagTag: 'nav_total_set:performance.memory',
              key: 'performance.memory',
              message: 'performance.memory resolved to instance owner',
              data: { outcome: 'skip', reason: 'instance_owner_resolved', policy: 'skip', action: 'native' }
            });
          } else {
            redefineAcc(perfMemoryOwner, 'memory', getMemory);
          }
        } catch (e) {
          __navDiag('warn', 'nav_total_set:performance_memory_proto', {
            surface: 'navigator',
            stage: 'apply',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:performance.memory',
            key: 'performance.memory',
            message: 'performance.memory proto define failed',
            data: { policy: 'skip', action: 'native' }
          }, e);
        }
      }
    }

    // ——— K. WebAuthn (stub) ———
    if (!window.PublicKeyCredential) {
      window.PublicKeyCredential = __navMark(function PublicKeyCredential() {}, 'PublicKeyCredential');
      Object.defineProperty(PublicKeyCredential, 'isUserVerifyingPlatformAuthenticatorAvailable', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: __navMark(function isUserVerifyingPlatformAuthenticatorAvailable() { return Promise.resolve(true); },
             'isUserVerifyingPlatformAuthenticatorAvailable')
      });
    }
    if (navigator.credentials) {
      const origCreate = navigator.credentials.create;
      const origGet    = navigator.credentials.get;
      const credProto = Object.getPrototypeOf(navigator.credentials) || navigator.credentials;
      const createResolved = __navResolveDescriptor
        ? __navResolveDescriptor(credProto, 'create', { mode: 'proto_chain' })
        : {
            owner: Object.getOwnPropertyDescriptor(credProto, 'create') ? credProto : navigator.credentials,
            desc: Object.getOwnPropertyDescriptor(credProto, 'create')
              || Object.getOwnPropertyDescriptor(navigator.credentials, 'create')
              || null
          };
      const getResolved = __navResolveDescriptor
        ? __navResolveDescriptor(credProto, 'get', { mode: 'proto_chain' })
        : {
            owner: Object.getOwnPropertyDescriptor(credProto, 'get') ? credProto : navigator.credentials,
            desc: Object.getOwnPropertyDescriptor(credProto, 'get')
              || Object.getOwnPropertyDescriptor(navigator.credentials, 'get')
              || null
          };
      const createDesc = createResolved ? createResolved.desc : null;
      const getDesc = getResolved ? getResolved.desc : null;
      const createOwner = (createResolved && createResolved.owner) ? createResolved.owner : credProto;
      const getOwner = (getResolved && getResolved.owner) ? getResolved.owner : credProto;
      if (!createDesc || !getDesc) {
        __navDiag('error', 'nav_total_set:credentials_descriptor_missing', {
          surface: 'navigator',
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:credentials',
          key: !createDesc ? 'credentials.create' : 'credentials.get',
          message: 'credentials descriptor missing'
        });
      } else if (createOwner === navigator.credentials || getOwner === navigator.credentials) {
        __navDiag('error', 'nav_total_set:credentials_owner_mismatch', {
          surface: 'navigator',
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:credentials',
          key: (createOwner === navigator.credentials) ? 'credentials.create' : 'credentials.get',
          message: 'credentials resolved to instance owner',
          data: { outcome: 'skip', reason: 'instance_owner_resolved' }
        });
      } else {
        __navRegisterKey('credentials.create');
        __navRegisterKey('credentials.get');
        applyCoreTargetsGroup('nav_total_set:credentials', [
        {
          owner: createOwner,
          key: 'create',
          resolve: 'proto_chain',
          kind: 'promise_method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:credentials.create',
          validThis(self) {
            return self === navigator.credentials || self === credProto;
          },
          invalidThis: 'throw',
          invoke(orig, args) {
            __navLogAccess('credentials.create', null);
            const options = (args && args.length) ? args[0] : undefined;
            const isCredThis = (this === navigator.credentials || this === credProto);
            if (!isCredThis) return Reflect.apply(orig, this, args || []);
            if (options && options.publicKey) {
              return origCreate ? Reflect.apply(orig, this, args || []) : Promise.resolve(new PublicKeyCredential());
            }
            return origCreate ? Reflect.apply(orig, this, args || []) : Promise.resolve(undefined);
          }
        },
        {
          owner: getOwner,
          key: 'get',
          resolve: 'proto_chain',
          kind: 'promise_method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:credentials.get',
          validThis(self) {
            return self === navigator.credentials || self === credProto;
          },
          invalidThis: 'throw',
          invoke(orig, args) {
            __navLogAccess('credentials.get', null);
            const options = (args && args.length) ? args[0] : undefined;
            const isCredThis = (this === navigator.credentials || this === credProto);
            if (!isCredThis) return Reflect.apply(orig, this, args || []);
            if (options && options.publicKey) {
              return origGet ? Reflect.apply(orig, this, args || []) : Promise.resolve(new PublicKeyCredential());
            }
            return origGet ? Reflect.apply(orig, this, args || []) : Promise.resolve(undefined);
          }
        }
      ], 'throw');
      }
    }
    __navDiag('info', 'nav_total_set:webauthn_mock_applied', {
      stage: 'apply',
      type: __navTypePipeline,
      diagTag: 'nav_total_set',
      message: 'webauthn mock applied',
      data: { outcome: 'return', reason: 'webauthn_mock_applied' }
    });

    // ——— L. Plugins & MimeTypes ———
    const profiles = Array.isArray(__navProfileState.pluginProfiles) ? __navProfileState.pluginProfiles : [];
      function safeString(val) { return (typeof val === 'symbol' || typeof val === 'undefined') ? '' : String(val); }

      const fakeMimeTypes = [];
      profiles.forEach((pl, pi) =>
        (pl.mimeTypes || []).forEach(mt => {
          const d = (typeof mt === 'string') ? { type: mt, suffixes: '', description: '' } : mt;
          fakeMimeTypes.push({
            type:        safeString(d.type),
            suffixes: safeString(d.suffixes ?? ''),
            description: safeString(d.description ?? ''),
            pluginIndex: pi
          });
        })
      );

      const fakePlugins = profiles.map((pl, i) => ({
        name:        safeString(pl.name),
        filename:    safeString(pl.filename),
        description: safeString(pl.description),
        mimeTypes:   fakeMimeTypes.filter(m => m.pluginIndex === i)
      }));

      // --- Caching (one instance per page) ---
      let __PLUGIN_ARRAY_SINGLETON__ = null;
      let __MIMETYPE_ARRAY_SINGLETON__ = null;
      let __MIME_OBJECTS_SINGLETON__ = null;

      // 4.3. PluginArray (enumerable fields, compatible with JSON/assign)
      function createPluginArray(plugins) {
        if (__PLUGIN_ARRAY_SINGLETON__) return __PLUGIN_ARRAY_SINGLETON__;

        const arr = [];
        const mimeObjects = [];
        for (let i = 0; i < plugins.length; i++) {
          const p = plugins[i];
          const itemMethod = ({ item(index) { return this[index] || null; } }).item;
          const namedItemMethod = ({ namedItem(type) {
            for (let j = 0; j < this.length; j++) if (this[j]?.type === type) return this[j];
            return null;
          } }).namedItem;

          // Create plugin object: metadata non-enumerable, mime indexes enumerable
          const pluginObj = Object.create(Plugin.prototype, {
            name:        { value: String(p.name),        enumerable: false, configurable: true },
            filename:    { value: String(p.filename),    enumerable: false, configurable: true },
            description: { value: String(p.description), enumerable: false, configurable: true },
            length:      { value: p.mimeTypes.length,    enumerable: false, configurable: true },
            item: {
              value: __navMark(itemMethod, 'item'),
              enumerable: false, configurable: true
            },
            namedItem: {
              value: __navMark(namedItemMethod, 'namedItem'),
              enumerable: false, configurable: true
            }
          });

          // mime-??????? (enumerable ????, enabledPlugin ? ?? pluginObj)
          for (let j = 0; j < p.mimeTypes.length; j++) {
            const m = p.mimeTypes[j];
            const mType = String(m.type);
            const mimeObj = Object.create(MimeType.prototype, {
              type:         { value: mType,                  enumerable: true, configurable: true },
              suffixes: { value: String(m.suffixes ?? ''),enumerable: true, configurable: true },
              description: { value: String(m.description ?? ''), enumerable: true, configurable: true },
              enabledPlugin:{ value: pluginObj,             enumerable: true, configurable: true }
            });
            // index on the plugin itself ? enumerable
            Object.defineProperty(pluginObj, String(j), { value: mimeObj, enumerable: true, configurable: true });
            if (mType) {
              Object.defineProperty(pluginObj, mType, { value: mimeObj, enumerable: false, configurable: true });
            }
            mimeObjects.push(mimeObj);
          }

          arr.push(pluginObj);
        }

        // array of plugins
        const pluginArray = Object.create(PluginArray.prototype, {
          length:    { value: arr.length, enumerable: true, configurable: true },
          item:      { value: __navMark(({ item(index) { return pluginArray[String(index)] || null; } }).item, 'item'), enumerable: false, configurable: true },
          namedItem: { value: __navMark(({ namedItem(name) { for (let i = 0; i < arr.length; i++) if (pluginArray[String(i)]?.name === name) return pluginArray[String(i)]; return null; } }).namedItem, 'namedItem'), enumerable: false, configurable: true }
        });

        // Indexes ? enumerable + named props (non-enumerable)
        for (let i = 0; i < arr.length; i++) {
          const pluginObj = arr[i];
          Object.defineProperty(pluginArray, String(i), { value: pluginObj, enumerable: true, configurable: true });
          const pname = pluginObj && pluginObj.name;
          if (pname) {
            Object.defineProperty(pluginArray, pname, { value: pluginObj, enumerable: false, configurable: true });
          }
        }

        __MIME_OBJECTS_SINGLETON__ = mimeObjects;
        __PLUGIN_ARRAY_SINGLETON__ = pluginArray;
        return pluginArray;
      }

      // MimeTypeArray (in same time - for case of direct circulation)
      function createMimeTypeArray(plugins) {
        if (__MIMETYPE_ARRAY_SINGLETON__) return __MIMETYPE_ARRAY_SINGLETON__;

        createPluginArray(plugins);
        const mimes = Array.isArray(__MIME_OBJECTS_SINGLETON__) ? __MIME_OBJECTS_SINGLETON__ : [];
        const mimeArray = Object.create(MimeTypeArray.prototype, {
          length:    { value: mimes.length, enumerable: true, configurable: true },
          item:      { value: __navMark(({ item(index) { return mimeArray[String(index)] || null; } }).item, 'item'), enumerable: false, configurable: true },
          namedItem: { value: __navMark(({ namedItem(type) { return mimeArray[type] || null; } }).namedItem, 'namedItem'), enumerable: false, configurable: true }
        });

        for (let i = 0; i < mimes.length; i++) {
          const mimeObj = mimes[i];
          Object.defineProperty(mimeArray, String(i), { value: mimeObj, enumerable: true, configurable: true });
          const type = mimeObj && mimeObj.type;
          if (type) {
            Object.defineProperty(mimeArray, type, { value: mimeObj, enumerable: false, configurable: true });
          }
        }

        __MIMETYPE_ARRAY_SINGLETON__ = mimeArray;
        return mimeArray;
      }

      // Getters - like in ORIG: enumerable: true
      if ('plugins' in navigator) {
        patchObjectReturnAccessor('plugins', function pluginsAccessorValue() {
          return createPluginArray(fakePlugins);
        }, 'nav_total_set:plugins');
      }
      if ('mimeTypes' in navigator) {
        patchObjectReturnAccessor('mimeTypes', function mimeTypesAccessorValue() {
          return createMimeTypeArray(fakePlugins);
        }, 'nav_total_set:mimeTypes');
      }

   
   
    //  ——— Debug information (unified log) ———
    if (DEBUG) {
      const hasUAD = ('userAgentData' in navigator);
      __navDiag('debug', 'nav_total_set:debug', {
        stage: 'runtime',
        type: __navTypePipeline,
        diagTag: 'nav_total_set',
        message: 'debug snapshot',
        data: {
          meta: meta,
          hasUAD: hasUAD,
          secureContext: G.isSecureContext
        }
      });
    }
    publishWorkerEnvSnapshot();
    __navDiag('info', 'nav_total_set:applied', {
      stage: 'apply',
      type: __navTypePipeline,
      diagTag: 'nav_total_set',
      data: { outcome: 'return', reason: 'patched' }
    });

    }
    } catch (e) {
      let rollbackErr = null;
      try {
        rollbackModuleApplied();
      } catch (re) {
        rollbackErr = re;
      }
      __navDiagBrowser('fatal', 'nav_total_set:fatal', {
        stage: 'apply',
        diagTag: 'nav_total_set',
        key: null,
        message: 'fatal module error',
        data: { outcome: 'throw', reason: 'fatal', rollbackOk: !rollbackErr, action: 'native' }
      }, rollbackErr || e);
      __navReleaseEntryGuard(!rollbackErr, 'rollback', 'module_catch');
      throw (rollbackErr || e);
    }
  }
}

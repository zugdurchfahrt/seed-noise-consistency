const NavTotalSetPatchModule = function NavTotalSetPatchModule(window) {
  {
    let __navGuardToken = null;
    const G = (typeof globalThis !== 'undefined' && globalThis)
      || (typeof self !== 'undefined' && self)
      || {};
    const __tag = 'nav_total_set';
    const __surface = 'navigator';
    const __flagKey = '__PATCH_NAVTOTALSET__';
    const __windowRef = (window && (typeof window === 'object' || typeof window === 'function'))
      ? window
      : null;
    const C = (__windowRef && __windowRef.CanvasPatchContext && (typeof __windowRef.CanvasPatchContext === 'object' || typeof __windowRef.CanvasPatchContext === 'function'))
      ? __windowRef.CanvasPatchContext
      : null;
    const __core = (__windowRef && __windowRef.Core && (typeof __windowRef.Core === 'object' || typeof __windowRef.Core === 'function'))
      ? __windowRef.Core
      : null;
    const __navTypePipeline = 'pipeline missing data';
    const __navTypeBrowser = 'browser structure missing data';

    // [NORMATIVE] local adapter for __DEGRADE__ (no console.*, safe-noop on failure)
    const __loggerRoot = (C && C.__logger && typeof C.__logger === 'object')
      ? C.__logger
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
    if (typeof document === 'undefined' || !__windowRef || __windowRef.document !== document) {
      __navDiagBrowser('warn', 'nav_total_set:not_window_realm', {
        stage: 'preflight',
        message: 'not in Window realm',
        data: { outcome: 'skip', reason: 'not_window_realm' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'not_window_realm');
      return;
    }

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
    const __navModuleState = (__stateRoot.__NAV_TOTAL_SET__ && typeof __stateRoot.__NAV_TOTAL_SET__ === 'object')
      ? __stateRoot.__NAV_TOTAL_SET__
      : null;
    if (!__navModuleState) {
      __navDiagPipeline('warn', 'nav_total_set:module_state_missing', {
        stage: 'preflight',
        key: 'CanvasPatchContext.state.__NAV_TOTAL_SET__',
        message: 'CanvasPatchContext.state.__NAV_TOTAL_SET__ missing',
        data: { outcome: 'skip', reason: 'module_state_missing' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'module_state_missing');
      return;
    }
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
    let __navDataStoreState = (__navModuleState.__DATA_STORE_STATE__ && typeof __navModuleState.__DATA_STORE_STATE__ === 'object')
      ? __navModuleState.__DATA_STORE_STATE__
      : null;
    if (!__navDataStoreState) {
      __navDiagPipeline('warn', 'nav_total_set:data_store_state_missing', {
        stage: 'preflight',
        key: 'CanvasPatchContext.state.__NAV_TOTAL_SET__.__DATA_STORE_STATE__',
        message: 'CanvasPatchContext.state.__NAV_TOTAL_SET__.__DATA_STORE_STATE__ missing',
        data: { outcome: 'skip', reason: 'data_store_state_missing' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'data_store_state_missing');
      return;
    }
    let __navObjectState = (__navModuleState.__OBJECT_STATE__ && typeof __navModuleState.__OBJECT_STATE__ === 'object')
      ? __navModuleState.__OBJECT_STATE__
      : null;
    if (!__navObjectState) {
      __navDiagPipeline('warn', 'nav_total_set:object_state_missing', {
        stage: 'preflight',
        key: 'CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__',
        message: 'CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__ missing',
        data: { outcome: 'skip', reason: 'object_state_missing' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'object_state_missing');
      return;
    }
    const __navObjectUserAgentDataState = (__navObjectState.userAgentData && typeof __navObjectState.userAgentData === 'object')
      ? __navObjectState.userAgentData
      : null;
    const __navObjectUserAgentDataHighEntropyState = (__navObjectUserAgentDataState && __navObjectUserAgentDataState.highEntropy && typeof __navObjectUserAgentDataState.highEntropy === 'object')
      ? __navObjectUserAgentDataState.highEntropy
      : null;
    const __navObjectPermissionsState = (__navObjectState.permissions && typeof __navObjectState.permissions === 'object')
      ? __navObjectState.permissions
      : null;
    const __navObjectStorageState = (__navObjectState.storage && typeof __navObjectState.storage === 'object')
      ? __navObjectState.storage
      : null;
    const __navObjectStorageEstimateState = (__navObjectStorageState && __navObjectStorageState.estimate && typeof __navObjectStorageState.estimate === 'object')
      ? __navObjectStorageState.estimate
      : null;
    const __navObjectPluginsState = (__navObjectState.plugins && typeof __navObjectState.plugins === 'object')
      ? __navObjectState.plugins
      : null;
    const __navObjectPluginsProtoMethodsState = (__navObjectPluginsState && __navObjectPluginsState.protoMethods && typeof __navObjectPluginsState.protoMethods === 'object')
      ? __navObjectPluginsState.protoMethods
      : null;
    const __navObjectPluginsPluginRecordsState = (__navObjectPluginsState && __navObjectPluginsState.pluginRecords && typeof __navObjectPluginsState.pluginRecords === 'object')
      ? __navObjectPluginsState.pluginRecords
      : null;
    const __navObjectMimeTypesState = (__navObjectState.mimeTypes && typeof __navObjectState.mimeTypes === 'object')
      ? __navObjectState.mimeTypes
      : null;
    const __navObjectMimeTypesProtoMethodsState = (__navObjectMimeTypesState && __navObjectMimeTypesState.protoMethods && typeof __navObjectMimeTypesState.protoMethods === 'object')
      ? __navObjectMimeTypesState.protoMethods
      : null;
    const __navObjectMimeTypesMimeRecordsState = (__navObjectMimeTypesState && __navObjectMimeTypesState.mimeRecords && typeof __navObjectMimeTypesState.mimeRecords === 'object')
      ? __navObjectMimeTypesState.mimeRecords
      : null;
    if (
      !__navObjectUserAgentDataState ||
      !__navObjectUserAgentDataHighEntropyState ||
      !__navObjectPermissionsState ||
      !__navObjectStorageState ||
      !__navObjectStorageEstimateState ||
      !__navObjectPluginsState ||
      !__navObjectPluginsProtoMethodsState ||
      !__navObjectPluginsPluginRecordsState ||
      !__navObjectMimeTypesState ||
      !__navObjectMimeTypesProtoMethodsState ||
      !__navObjectMimeTypesMimeRecordsState
    ) {
      __navDiagPipeline('warn', 'nav_total_set:object_state_nested_missing', {
        stage: 'preflight',
        key: 'CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__',
        message: 'CanvasPatchContext.state.__NAV_TOTAL_SET__.__OBJECT_STATE__ nested slot missing',
        data: { outcome: 'skip', reason: 'object_state_nested_missing' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'object_state_nested_missing');
      return;
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
    const __envProfileState = (__stateRoot && __stateRoot.__ENV_PROFILE__ && typeof __stateRoot.__ENV_PROFILE__ === 'object')
      ? __stateRoot.__ENV_PROFILE__
      : null;
    if (!__envProfileState) {
      __navDiagPipeline('error', 'nav_total_set:env_profile_missing', {
        stage: 'preflight',
        key: 'CanvasPatchContext.state.__ENV_PROFILE__',
        message: 'CanvasPatchContext.state.__ENV_PROFILE__ missing',
        data: { outcome: 'skip', reason: 'env_profile_missing' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'env_profile_missing');
      return;
    }
    const __envPlatformState = (__envProfileState.__PLATFORM__ && typeof __envProfileState.__PLATFORM__ === 'object')
      ? __envProfileState.__PLATFORM__
      : null;
    if (!__envPlatformState) {
      __navDiagPipeline('error', 'nav_total_set:env_platform_missing', {
        stage: 'preflight',
        key: 'CanvasPatchContext.state.__ENV_PROFILE__.__PLATFORM__',
        message: 'CanvasPatchContext.state.__ENV_PROFILE__.__PLATFORM__ missing',
        data: { outcome: 'skip', reason: 'env_platform_missing' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'env_platform_missing');
      return;
    }
    const __navLangState = (__stateRoot && __stateRoot.__LANG_STATE__ && typeof __stateRoot.__LANG_STATE__ === 'object')
      ? __stateRoot.__LANG_STATE__
      : null;
    const __coreOwnerFirstAccessorCapable = !!(
      __core &&
      __core.__internal &&
      typeof __core.__internal === 'object' &&
      __core.__internal.__ACCESSOR_OWNER_FIRST_CAPABLE__ === true
    );
    const __navPrimaryLanguage = (__navLangState && typeof __navLangState.primaryLanguage === 'string' && __navLangState.primaryLanguage)
      ? __navLangState.primaryLanguage
      : null;
    const __navNormalizedLanguages = (__navLangState && Array.isArray(__navLangState.normalizedLanguages))
      ? __navLangState.normalizedLanguages.slice()
      : null;
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
      const coreRegisterPatchedTarget = (__core && typeof __core.registerPatchedTarget === 'function')
        ? __core.registerPatchedTarget
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
    // ---- Hard consistency for platform ----
    // ——— A. Input/meta ———
    const meta          = (__envProfileState.meta && typeof __envProfileState.meta === 'object') ? __envProfileState.meta : {};
    const navPlat       = __envPlatformState.domPlatform;     // 'Win32' | 'MacIntel'
    const uaPlatform    = __envPlatformState.uaPlatform;      // "Windows" | "macOS"
    const platformVersion = __envPlatformState.platformVersion;
    const userAgent     = __envProfileState.userAgent;
    const vendor        = __envProfileState.vendor;
    const mem           = Number(__envProfileState.mem);
    const cpu           = Number(__envProfileState.cpu);
    const dpr           = Number(__envProfileState.dpr);
    const devicesLabels = __navCloneStateValue(__envProfileState.devicesLabels);
    const colorDepth    = Number(__envProfileState.colorDepth);
    const fullVersionList = __navCloneStateValue(__envProfileState.fullVersionList);
    const storageQuotaMb = __envProfileState.storageQuotaMb;
    const storageUsedPct = __envProfileState.storageUsedPct;
    const pluginProfiles = __navCloneStateValue(Array.isArray(__envProfileState.pluginProfiles) ? __envProfileState.pluginProfiles : []);
    const primaryLanguage = __navPrimaryLanguage;
    const normalizedLanguages = __navCloneStateValue(__navNormalizedLanguages);

    // strictness & diagnostics
    const STRICT        = (__envProfileState.strict !== undefined) ? !!__envProfileState.strict : true;
    const DEBUG         = !!__envProfileState.debug;
    let __navNativePermissionsQuery = null;
    let __navNativePermissionsThis = null;
    let __navPermissionsState = __navObjectPermissionsState;
    function __navNormalizePermissionState(state) {
      return (state === 'granted' || state === 'denied' || state === 'prompt') ? state : 'prompt';
    }
    function __navGetPermissionState(name) {
      return __navNormalizePermissionState(__navPermissionsState ? __navPermissionsState[name] : undefined);
    }
    function __navSetPermissionState(name, state, source) {
      if (typeof name !== 'string' || !name) {
        __navDiag('error', 'nav_total_set:permission_state_name_invalid', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: 'nav_total_set:permissions.state',
          key: 'permissions',
          message: 'permission state name invalid',
          data: { outcome: 'return', reason: 'permission_state_name_invalid' }
        });
        return false;
      }
      const normalizedState = __navNormalizePermissionState(state);
      if ((state !== 'prompt' && state !== 'denied') || (normalizedState !== 'prompt' && normalizedState !== 'denied')) {
        __navDiag('error', 'nav_total_set:permission_state_forbidden', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: 'nav_total_set:permissions.state',
          key: `permissions.${name}`,
          message: 'permission state must stay prompt or denied in profile state',
          data: {
            outcome: 'return',
            reason: 'permission_state_forbidden',
            permission: name,
            state: state
          }
        });
        return false;
      }
      __navPermissionsState[name] = normalizedState;
      __navDiag('info', 'nav_total_set:permission_state_updated', {
        stage: 'runtime',
        type: __navTypePipeline,
        diagTag: 'nav_total_set:permissions.state',
        key: `permissions.${name}`,
        message: 'hidden permission state updated',
        data: {
          outcome: 'return',
          reason: 'permission_state_updated',
          permission: name,
          state: __navPermissionsState[name],
          source: (typeof source === 'string' && source) ? source : 'internal'
        }
      });
      return true;
    }
    function __navApplyPermissionGateState(source) {
      const permissionStates = (devicesLabels && typeof devicesLabels === 'object' && devicesLabels.states && typeof devicesLabels.states === 'object')
        ? devicesLabels.states
        : null;
      if (!permissionStates) return true;
      const names = Object.keys(permissionStates);
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        if (!__navSetPermissionState(name, permissionStates[name], source || 'profile_state')) return false;
      }
      return true;
    }
    function __navQueryNativePermissionState(name, onResolved) {
      if (typeof __navNativePermissionsQuery !== 'function' || !__navNativePermissionsThis) return;
      let out;
      try {
        out = Reflect.apply(__navNativePermissionsQuery, __navNativePermissionsThis, [{ name }]);
      } catch (e) {
        __navDiag('warn', 'nav_total_set:permissions_query_native_probe_failed', {
          stage: 'runtime',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:permissions.query',
          key: 'permissions.query',
          message: 'native permissions.query probe failed',
          data: { outcome: 'return', reason: 'native_probe_failed', permission: name }
        }, e);
        return;
      }
      Promise.resolve(out).then(function onNativePermissionResolved(status) {
        const state = (status && typeof status === 'object' && typeof status.state === 'string') ? status.state : null;
        if (typeof onResolved === 'function') onResolved(state, status);
      }).catch(function onNativePermissionRejected(e) {
        __navDiag('warn', 'nav_total_set:permissions_query_native_probe_rejected', {
          stage: 'runtime',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:permissions.query',
          key: 'permissions.query',
          message: 'native permissions.query probe rejected',
          data: { outcome: 'return', reason: 'native_probe_rejected', permission: name }
        }, e);
      });
    }
    function __navCheckPermissionSemanticMismatch(name, nativeState) {
      if (nativeState !== 'granted' && nativeState !== 'denied' && nativeState !== 'prompt') return;
      const internalState = __navGetPermissionState(name);
      if (nativeState === internalState) return;
      __navDiag('warn', 'nav_total_set:permissions_semantic_mismatch', {
        stage: 'runtime',
        type: __navTypePipeline,
        diagTag: 'nav_total_set:permissions.query',
        key: 'permissions.query',
        message: 'native permissions.query diverges from hidden permission state',
        data: {
          outcome: 'return',
          reason: 'semantic_mismatch',
          permission: name,
          nativeState: nativeState,
          internalState: internalState
        }
      });
    }
    if (!__navApplyPermissionGateState('profile_state')) {
      __navReleaseEntryGuard(true, 'preflight', 'bad_permissions_profile');
      return;
    }
    __navSetHiddenStateValue(__navObjectPermissionsState, '__GET_PERMISSION_STATE__', __navGetPermissionState);
    __navSetHiddenStateValue(__navObjectPermissionsState, '__SET_PERMISSION_STATE__', __navSetPermissionState);
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
    function __navLooksDomPlatform(value) {
      return value === 'Win32' || value === 'MacIntel';
    }
    function __navLooksUaPlatform(value) {
      return value === 'Windows' || value === 'macOS';
    }
    function __navPlatformPairMatches(domPlatform, osPlatform) {
      return (domPlatform === 'Win32' && osPlatform === 'Windows')
        || (domPlatform === 'MacIntel' && osPlatform === 'macOS');
    }
    // guards (inputs must be present)
    if (!uaPlatform) {
      __navDiag('error', 'nav_total_set:ua_platform_missing', {
        stage: 'preflight',
        type: __navTypePipeline,
        diagTag: 'nav_total_set',
        key: 'platform',
        message: 'UA_PLATFORM missing',
        data: { outcome: 'skip', reason: 'missing_ua_platform' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'ua_platform_missing');
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
    if (!__navLooksUaPlatform(uaPlatform)) {
      __navDiag('error', 'nav_total_set:ua_platform_invalid', {
        stage: 'preflight',
        type: __navTypePipeline,
        diagTag: 'nav_total_set',
        key: 'userAgentData.platform',
        message: 'PLATFORM.uaPlatform invalid; expected UA/OS platform string',
        data: { outcome: 'skip', reason: 'invalid_ua_platform', uaPlatform: uaPlatform }
      });
      __navReleaseEntryGuard(true, 'preflight', 'ua_platform_invalid');
      return;
    }
    if (!__navLooksDomPlatform(navPlat)) {
      __navDiag('error', 'nav_total_set:nav_platform_invalid', {
        stage: 'preflight',
        type: __navTypePipeline,
        diagTag: 'nav_total_set',
        key: 'platform',
        message: 'PLATFORM.domPlatform invalid; expected DOM platform string',
        data: { outcome: 'skip', reason: 'invalid_nav_platform', domPlatform: navPlat }
      });
      __navReleaseEntryGuard(true, 'preflight', 'nav_platform_invalid');
      return;
    }
    if (!__navPlatformPairMatches(navPlat, uaPlatform)) {
      __navDiag('error', 'nav_total_set:platform_pair_invalid', {
        stage: 'preflight',
        type: __navTypePipeline,
        diagTag: 'nav_total_set',
        key: 'platform',
        message: 'PLATFORM.domPlatform and PLATFORM.uaPlatform mismatch',
        data: {
          outcome: 'skip',
          reason: 'platform_pair_invalid',
          domPlatform: navPlat,
          uaPlatform: uaPlatform
        }
      });
      __navReleaseEntryGuard(true, 'preflight', 'platform_pair_invalid');
      return;
    }
    if (!(typeof platformVersion === 'string' && platformVersion)) {
      __navDiag('error', 'nav_total_set:platform_version_missing', {
        stage: 'preflight',
        type: __navTypePipeline,
        diagTag: 'nav_total_set',
        key: 'userAgentData.platformVersion',
        message: 'PLATFORM.platformVersion missing',
        data: { outcome: 'skip', reason: 'missing_platform_version' }
      });
      __navReleaseEntryGuard(true, 'preflight', 'platform_version_missing');
      return;
    }

    const chPlatform = uaPlatform;
    const navPlatformOut = navPlat;
    function __navBuildUserAgentDataHighEntropySource() {
      const safeDeviceMemory = __navIsValidDeviceMemoryValue(mem) ? mem : undefined;
      const safeHardwareConcurrency = __navIsValidHardwareConcurrencyValue(cpu) ? cpu : undefined;
      const highEntropyFullVersionList = (meta && meta.fullVersionList != null)
        ? meta.fullVersionList
        : fullVersionList;
      let highEntropyUaFullVersion = (meta && typeof meta.uaFullVersion === 'string')
        ? meta.uaFullVersion
        : undefined;
      if (!highEntropyUaFullVersion && Array.isArray(highEntropyFullVersionList)) {
        for (let i = 0; i < highEntropyFullVersionList.length; i++) {
          const item = highEntropyFullVersionList[i];
          if (!item || typeof item !== 'object') continue;
          const brand = String(item.brand || '');
          const version = (typeof item.version === 'string') ? item.version : '';
          if (version && brand !== 'Not)A;Brand' && brand !== 'Not.A/Brand') {
            highEntropyUaFullVersion = version;
            break;
          }
        }
      }
      return {
        architecture: meta.architecture,
        bitness: meta.bitness,
        model: meta.model,
        brands: meta.brands,
        mobile: meta.mobile,
        platform: uaPlatform,
        platformVersion: platformVersion,
        uaFullVersion: highEntropyUaFullVersion,
        fullVersionList: highEntropyFullVersionList,
        deviceMemory: safeDeviceMemory,
        hardwareConcurrency: safeHardwareConcurrency,
        wow64: meta.wow64,
        formFactors: meta.formFactors
      };
    }
    function __navBuildUserAgentDataHighEntropyPatch(keys) {
      const producer = (__navObjectUserAgentDataHighEntropyState && typeof __navObjectUserAgentDataHighEntropyState.__GET_HIGH_ENTROPY_VALUES_PRODUCER__ === 'function')
        ? __navObjectUserAgentDataHighEntropyState.__GET_HIGH_ENTROPY_VALUES_PRODUCER__
        : null;
      if (typeof producer !== 'function') {
        return { ok: false, reason: 'producer_missing', value: null };
      }
      const map = producer();
      const result = {};
      for (const hint of keys) {
        if (typeof hint !== 'string' || !hint) {
          return { ok: false, reason: 'bad_hint', value: null };
        }
        const val = map[hint];
        if (val === undefined || val === null || (typeof val === 'string' && !val && hint !== 'model') || (Array.isArray(val) && !val.length)) {
          continue;
        }
        result[hint] = val;
      }
      return { ok: true, reason: null, value: result };
    }
    function __navPostProcessUserAgentDataHighEntropyResult(nativeResolved, result) {
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
    }
    __navSetHiddenStateValue(__navObjectUserAgentDataHighEntropyState, '__GET_HIGH_ENTROPY_VALUES_PRODUCER__', __navBuildUserAgentDataHighEntropySource);
    __navSetHiddenStateValue(__navObjectUserAgentDataHighEntropyState, '__GET_HIGH_ENTROPY_VALUES_PATCH_BUILDER__', __navBuildUserAgentDataHighEntropyPatch);
    __navSetHiddenStateValue(__navObjectUserAgentDataHighEntropyState, '__POSTPROCESS_HIGH_ENTROPY_VALUES_RESULT__', __navPostProcessUserAgentDataHighEntropyResult);
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
        const workerMeta = (meta && typeof meta === 'object') ? meta : null;
        assert(workerMeta, 'worker_env_snapshot.meta missing');
        __navSetHiddenStateValue(__navDataStoreState, '__WORKER_ENV_SNAPSHOT__', __navCloneStateValue({
          ua: userAgent,
          language: primaryLanguage,
          languages: __navCloneStateValue(normalizedLanguages),
          deviceMemory: mem,
          hardwareConcurrency: cpu,
          uaData: {
            brands: __navCloneStateValue(workerMeta.brands),
            mobile: workerMeta.mobile,
            platform: uaPlatform,
            he: {
              architecture: workerMeta.architecture,
              bitness: workerMeta.bitness,
              model: workerMeta.model,
              platformVersion: platformVersion,
              fullVersionList: __navCloneStateValue(workerMeta.fullVersionList != null ? workerMeta.fullVersionList : fullVersionList),
              wow64: workerMeta.wow64,
              formFactors: __navCloneStateValue(workerMeta.formFactors)
            }
          }
        }));
        const workerEnvSnapshot = (__navDataStoreState && __navDataStoreState.__WORKER_ENV_SNAPSHOT__ && typeof __navDataStoreState.__WORKER_ENV_SNAPSHOT__ === 'object')
          ? __navDataStoreState.__WORKER_ENV_SNAPSHOT__
          : null;
        assert(workerEnvSnapshot && typeof workerEnvSnapshot === 'object', 'worker_env_snapshot missing');
        assert(typeof workerEnvSnapshot.ua === 'string' && workerEnvSnapshot.ua, 'worker_env_snapshot.ua missing');
        assert(typeof workerEnvSnapshot.language === 'string' && workerEnvSnapshot.language, 'worker_env_snapshot.language missing');
        assert(isStringArray(workerEnvSnapshot.languages, false), 'worker_env_snapshot.languages missing');
        assert(__navIsValidDeviceMemoryValue(workerEnvSnapshot.deviceMemory), 'worker_env_snapshot.deviceMemory missing');
        assert(__navIsValidHardwareConcurrencyValue(workerEnvSnapshot.hardwareConcurrency), 'worker_env_snapshot.hardwareConcurrency missing');
        assert(isBrandList(workerEnvSnapshot.uaData.brands), 'worker_env_snapshot.uaData.brands missing');
        assert(typeof workerEnvSnapshot.uaData.mobile === 'boolean', 'worker_env_snapshot.uaData.mobile missing');
        assert(typeof workerEnvSnapshot.uaData.platform === 'string' && workerEnvSnapshot.uaData.platform, 'worker_env_snapshot.uaData.platform missing');
        assert(typeof workerEnvSnapshot.uaData.he === 'object' && !!workerEnvSnapshot.uaData.he, 'worker_env_snapshot.uaData.he missing');
        assert(typeof workerEnvSnapshot.uaData.he.architecture === 'string' && workerEnvSnapshot.uaData.he.architecture, 'worker_env_snapshot.uaData.he.architecture missing');
        assert(typeof workerEnvSnapshot.uaData.he.bitness === 'string' && workerEnvSnapshot.uaData.he.bitness, 'worker_env_snapshot.uaData.he.bitness missing');
        assert(typeof workerEnvSnapshot.uaData.he.model === 'string', 'worker_env_snapshot.uaData.he.model missing');
        assert(typeof workerEnvSnapshot.uaData.he.platformVersion === 'string' && workerEnvSnapshot.uaData.he.platformVersion, 'worker_env_snapshot.uaData.he.platformVersion missing');
        assert(isBrandList(workerEnvSnapshot.uaData.he.fullVersionList), 'worker_env_snapshot.uaData.he.fullVersionList missing');
        assert(typeof workerEnvSnapshot.uaData.he.wow64 === 'boolean', 'worker_env_snapshot.uaData.he.wow64 missing');
        assert(isStringArray(workerEnvSnapshot.uaData.he.formFactors, false), 'worker_env_snapshot.uaData.he.formFactors missing');
      } catch (e) {
        try {
          const own = Object.getOwnPropertyDescriptor(__navDataStoreState, '__WORKER_ENV_SNAPSHOT__');
          if (own && own.configurable) delete __navDataStoreState.__WORKER_ENV_SNAPSHOT__;
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
      if (!d || typeof d.get !== 'function') {
        const err = new TypeError(`${key}: native getter missing`);
        __navDiagBrowser('error', 'nav_total_set:safeDefineAcc_getter_missing', {
          stage: 'preflight',
          diagTag: 'nav_total_set:safeDefineAcc',
          key: key || null,
          message: err.message,
          data: { outcome: 'throw', reason: 'getter_missing' }
        }, err);
        throw err;
      }
      if (typeof getter !== 'function') {
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
      __navRegisterKey(key);
      const applied = applyCoreTargetsGroup('nav_total_set:safeDefineAcc', [{
        owner: target,
        key,
        kind: 'accessor',
        wrapLayer: 'strict_accessor_gateway',
        resolve: 'proto_chain',
        policy: 'strict',
        diagTag: 'nav_total_set:safeDefineAcc',
        configurable: !!d.configurable,
        enumerable: !!d.enumerable,
        validThis: __isNavigatorThis,
        invalidThis: 'native',
        getImpl: function safeDefineAccGetImpl() {
          __navLogAccess(key, null);
          return Reflect.apply(getter, this, []);
        }
        }], 'strict');
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
      const Core = __core;
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

    function __navCheckNavigatorOwnShadow(key, diagTag) {
      const navInstance = (typeof navigator !== 'undefined' && navigator) ? navigator : null;
      if (!navInstance) return true;
      let ownDesc = null;
      try {
        ownDesc = Object.getOwnPropertyDescriptor(navInstance, key) || null;
      } catch (e) {
        __navDiag('error', 'nav_total_set:own_shadow_check_failed', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: diagTag || 'nav_total_set',
          key: key,
          message: key + ' own-shadow check failed'
        }, e);
        return false;
      }
      if (!ownDesc) return true;
      __navDiag('error', 'nav_total_set:own_shadow_detected', {
        stage: 'preflight',
        type: __navTypeBrowser,
        diagTag: diagTag || 'nav_total_set',
        key: key,
        message: key + ' own-property shadow detected on navigator',
        data: {
          outcome: 'skip',
          reason: 'instance_shadow_detected',
          configurable: !!ownDesc.configurable,
          enumerable: !!ownDesc.enumerable,
          hasGetter: typeof ownDesc.get === 'function',
          hasSetter: typeof ownDesc.set === 'function',
          hasValue: Object.prototype.hasOwnProperty.call(ownDesc, 'value')
        }
      });
      return false;
    }

    function __navResolvePrototypeAccessorTarget(key, diagTag, options) {
      if (!__navCheckNavigatorOwnShadow(key, diagTag)) {
        return null;
      }
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
      const resolved = __navResolvePrototypeAccessorTarget(key, diagTag, {
        mode: 'proto_chain'
      });
      if (!resolved || !resolved.owner || !resolved.desc) return false;
      const owner = resolved.owner;
      const d = resolved.desc;
      if (typeof getter !== 'function') {
        throw new TypeError('nav_total_set: getter missing for ' + key);
      }
      __navRegisterKey(key);
      try {
        const applied = applyCoreTargetsGroup(diagTag, [{
          owner: owner,
          key: key,
          kind: 'accessor',
          wrapLayer: 'strict_accessor_gateway',
          resolve: 'proto_chain',
          policy: 'strict',
          diagTag: diagTag,
          configurable: !!d.configurable,
          enumerable: !!d.enumerable,
          validThis: __isNavigatorThis,
          invalidThis: 'native',
          getImpl: function navStrictScalarAccessorValue() {
            __navLogAccess(key, null, { bucket: 'strict_accessor_gateway' });
            return getter.call(this);
          }
        }], 'strict');
        if (applied !== 1) {
          throw new TypeError('nav_total_set: strict accessor apply failed for ' + key);
        }
      } catch (e) {
        __navDiag('error', 'nav_total_set:strict_accessor_define_failed', {
          stage: 'apply',
          type: __navTypeBrowser,
          diagTag: diagTag,
          key: key,
          message: key + ' strict accessor define failed',
          data: { outcome: 'throw', reason: 'apply_failed' }
        }, e);
        return false;
      }
      return true;
    }

    // Bucket: object-return identity surfaces.
    function patchObjectReturnAccessor(key, getter, diagTag) {
      const isCriticalObjectReturnSurface = (key === 'plugins' || key === 'mimeTypes');
      const resolved = __navResolvePrototypeAccessorTarget(key, diagTag, {
        mode: 'proto_chain'
      });
      if (!resolved || !resolved.owner || !resolved.desc) {
        if (isCriticalObjectReturnSurface) {
          throw new TypeError('nav_total_set: critical object-return target missing for ' + key);
        }
        return false;
      }
      const owner = resolved.owner;
      const d = resolved.desc;
      if (typeof getter !== 'function') {
        throw new TypeError('nav_total_set: object-return getter missing for ' + key);
      }
      __navRegisterKey(key);
      try {
        const applied = applyCoreTargetsGroup(diagTag, [{
          owner: owner,
          key: key,
          kind: 'accessor',
          wrapLayer: 'object_return_gateway',
          resolve: 'proto_chain',
          policy: 'strict',
          diagTag: diagTag,
          configurable: !!d.configurable,
          enumerable: !!d.enumerable,
          validThis: __isNavigatorThis,
          invalidThis: 'native',
          getImpl: function navObjectReturnAccessorValue() {
            __navLogAccess(key, null, { bucket: 'object_return_gateway' });
            return getter.call(this);
          }
        }], 'strict');
        if (applied !== 1) {
          throw new TypeError('nav_total_set: object-return accessor apply failed for ' + key);
        }
      } catch (e) {
        __navDiag('error', 'nav_total_set:object_return_define_failed', {
          stage: 'apply',
          type: __navTypeBrowser,
          diagTag: diagTag,
          key: key,
          message: key + ' object-return accessor define failed',
          data: { outcome: 'throw', reason: 'apply_failed' }
        }, e);
        if (isCriticalObjectReturnSurface) throw e;
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

    function __navTryReadNativeValue(desc, receiver, code, diagTag, key, message) {
      try {
        if (desc && typeof desc.get === 'function') {
          return { ok: true, value: Reflect.apply(desc.get, receiver, []) };
        }
        if (desc && Object.prototype.hasOwnProperty.call(desc, 'value')) {
          return { ok: true, value: desc.value };
        }
        return { ok: true, value: undefined };
      } catch (e) {
        __navDiagBrowser('warn', code, {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: diagTag,
          key: key,
          message: message,
          data: { outcome: 'skip', reason: 'native_read_failed', action: 'native' }
        }, e);
        return { ok: false, value: undefined };
      }
    }

    function __navStringArrayEquals(left, right) {
      if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
      for (let i = 0; i < left.length; i++) {
        if (typeof left[i] !== 'string' || typeof right[i] !== 'string' || left[i] !== right[i]) return false;
      }
      return true;
    }

    function __navBrandVersionListEquals(left, right) {
      if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
      for (let i = 0; i < left.length; i++) {
        const a = left[i];
        const b = right[i];
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
        if (String(a.brand || '') !== String(b.brand || '')) return false;
        if (String(a.version || '') !== String(b.version || '')) return false;
      }
      return true;
    }

    function __navRunStrictScalarGetterChecks(specs) {
      if (!Array.isArray(specs) || !specs.length) return;
      for (let i = 0; i < specs.length; i++) {
        const spec = specs[i];
        if (!spec || typeof spec.key !== 'string' || !spec.key) continue;
        if (!(spec.key in navProto)) continue;
        const diagTag = (typeof spec.diagTag === 'string' && spec.diagTag) ? spec.diagTag : ('nav_total_set:' + spec.key);
        const nativeDesc = __navResolveNativeAccessorDesc(spec.key);
        const nativeValue = __navReadNativeScalarFallback(nativeDesc, navigator, spec.key, diagTag);
        const matchesNative = (typeof spec.matchesNative === 'function') ? spec.matchesNative(nativeValue) : false;
        if (matchesNative) {
          __navDiag('info', diagTag + '_getter_value_match', {
            stage: 'preflight',
            type: __navTypePipeline,
            diagTag: diagTag,
            key: spec.key,
            message: (typeof spec.skipMessage === 'string' && spec.skipMessage) ? spec.skipMessage : (spec.key + ' already matches native getter'),
            data: { outcome: 'return', reason: 'getter_value_match' }
          });
          continue;
        }
        if (spec && spec.mismatchAction === 'skip') {
          __navDiag('info', diagTag + '_getter_value_mismatch', {
            stage: 'preflight',
            type: __navTypePipeline,
            diagTag: diagTag,
            key: spec.key,
            message: (typeof spec.mismatchMessage === 'string' && spec.mismatchMessage)
              ? spec.mismatchMessage
              : (spec.key + ' native getter value differs from profile value; native getter kept'),
            data: {
              outcome: 'skip',
              reason: 'getter_value_mismatch',
              action: 'keep_native_getter',
              nativeValue: nativeValue,
              profileValue: Object.prototype.hasOwnProperty.call(spec, 'profileValue') ? spec.profileValue : null
            }
          });
          continue;
        }
        const getter = (typeof spec.getter === 'function') ? spec.getter : null;
        patchStrictScalarAccessor(spec.key, getter, diagTag);
      }
    }

    // Important: like native - not enumerable
    // [REGISTRY] userAgent is handled in `override_ua_data.js` (opt-in gate).
    // Here we keep only strict scalar accessor surfaces on Navigator.prototype.
    const strictScalarKeys = new Set(['platform','vendor','appVersion','productSub','maxTouchPoints','vendorSub','deviceMemory','hardwareConcurrency','language','languages']);
    const objectReturnKeys = new Set(['plugins','mimeTypes','userAgentData']);
    (function patchStrictScalarAccessorsOnProto(){
      __navRunStrictScalarGetterChecks([
        {
          key: 'platform',
          diagTag: 'nav_total_set:platform',
          getter: function navPlatformValue() { return navPlatformOut; },
          profileValue: navPlatformOut,
          matchesNative: function nativePlatformMatches(value) {
            return typeof value === 'string' && value === navPlatformOut;
          },
          skipMessage: 'platform already matches native getter',
          mismatchAction: 'skip',
          mismatchMessage: 'platform native getter value differs from profile value; native getter kept'
        },
        {
          key: 'vendor',
          diagTag: 'nav_total_set:vendor',
          getter: function navVendorValue() { return vendor; },
          profileValue: vendor,
          matchesNative: function nativeVendorMatches(value) {
            return typeof value === 'string' && value === vendor;
          },
          skipMessage: 'vendor already matches native getter',
          mismatchAction: 'skip',
          mismatchMessage: 'vendor native getter value differs from profile value; native getter kept'
        },
        {
          key: 'productSub',
          diagTag: 'nav_total_set:productSub',
          getter: function navProductSubValue() { return "20030107"; },
          profileValue: "20030107",
          matchesNative: function nativeProductSubMatches(value) {
            return typeof value === 'string' && value === "20030107";
          },
          skipMessage: 'productSub already matches native getter',
          mismatchAction: 'skip',
          mismatchMessage: 'productSub native getter value differs from profile value; native getter kept'
        },
        {
          key: 'vendorSub',
          diagTag: 'nav_total_set:vendorSub',
          getter: function navVendorSubValue() { return ""; },
          profileValue: "",
          matchesNative: function nativeVendorSubMatches(value) {
            return typeof value === 'string' && value === "";
          },
          skipMessage: 'vendorSub already matches native getter',
          mismatchAction: 'skip',
          mismatchMessage: 'vendorSub native getter value differs from profile value; native getter kept'
        },
        {
          key: 'maxTouchPoints',
          diagTag: 'nav_total_set:maxTouchPoints',
          getter: function navMaxTouchPointsValue() { return 0; },
          profileValue: 0,
          matchesNative: function nativeMaxTouchPointsMatches(value) {
            return Number.isInteger(value) && value === 0;
          },
          skipMessage: 'maxTouchPoints already matches native getter',
          mismatchAction: 'skip',
          mismatchMessage: 'maxTouchPoints native getter value differs from profile value; native getter kept'
        }
      ]);
      if ('appVersion' in navProto) {
        const nativeAppVersionDesc = __navResolveNativeAccessorDesc('appVersion');
        const pfx = "Mozilla/";
        const appVersionTarget = (typeof userAgent === "string" && userAgent.indexOf(pfx) === 0)
          ? userAgent.slice(pfx.length)
          : userAgent;
        if (typeof appVersionTarget === 'string' && appVersionTarget) {
          const nativeAppVersionRead = __navTryReadNativeValue(
            nativeAppVersionDesc,
            navigator,
            'nav_total_set:appVersion_native_read_failed',
            'nav_total_set:appVersion',
            'appVersion',
            'appVersion native getter read failed on navigator receiver'
          );
          if (nativeAppVersionRead.ok) {
            if (typeof nativeAppVersionRead.value === 'string' && nativeAppVersionRead.value === appVersionTarget) {
              __navDiag('info', 'nav_total_set:appVersion_getter_value_match', {
                stage: 'preflight',
                type: __navTypePipeline,
                diagTag: 'nav_total_set:appVersion',
                key: 'appVersion',
                message: 'appVersion already matches native getter',
                data: { outcome: 'return', reason: 'getter_value_match' }
              });
            } else {
              __navDiag('info', 'nav_total_set:appVersion_getter_value_mismatch', {
                stage: 'preflight',
                type: __navTypePipeline,
                diagTag: 'nav_total_set:appVersion',
                key: 'appVersion',
                message: 'appVersion native getter value differs from profile value; native getter kept',
                data: {
                  outcome: 'skip',
                  reason: 'getter_value_mismatch',
                  policy: 'skip',
                  action: 'keep_native_getter',
                  nativeValue: nativeAppVersionRead.value,
                  profileValue: appVersionTarget
                }
              });
            }
          }
        } else {
          patchStrictScalarAccessor('appVersion', function navAppVersionValue() {
            __navDiagPipeline('warn', 'nav_total_set:appVersion_invalid_profile', {
              stage: 'runtime',
              key: 'appVersion',
              message: 'invalid appVersion profile value',
              data: { outcome: 'return', reason: 'invalid_profile_value', value: appVersionTarget }
            });
            return __navReadNativeScalarFallback(nativeAppVersionDesc, this, 'appVersion', 'nav_total_set:appVersion');
          }, 'nav_total_set:appVersion');
        }
      }
    })();

    // rest
    const navigatorPatches = [
      ['buildID',              () => "20230501"],
      ['globalPrivacyControl', () => false]
    ];
      navigatorPatches.forEach(([prop, getter]) => {
        if (strictScalarKeys.has(prop) || objectReturnKeys.has(prop)) return; 
        if (!(prop in navProto)) return;
        safeDefineAcc(navProto, prop, getter);
      });

    // ——— D. devicePixelRatio & screen.* ———
    (function () {
      const windowProto = (window.Window && Window.prototype) ? Window.prototype : null;
      if (!windowProto) {
        __navDiag('warn', 'nav_total_set:devicePixelRatio_window_proto_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:devicePixelRatio',
          key: 'devicePixelRatio',
          message: 'Window.prototype missing',
          data: { outcome: 'skip', reason: 'window_proto_missing', policy: 'skip', action: 'native' }
        });
        return;
      }
      if (!__navResolveDescriptor) {
        __navDiag('warn', 'nav_total_set:devicePixelRatio_resolve_descriptor_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:devicePixelRatio',
          key: 'devicePixelRatio',
          message: 'Core.resolveDescriptor missing',
          data: { outcome: 'skip', reason: 'missing_dep_core_resolve_descriptor', policy: 'skip', action: 'native' }
        });
        return;
      }
      const dprOwnDesc = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');
      const dprResolved = dprOwnDesc
        ? null
        : __navResolveDescriptor(windowProto, 'devicePixelRatio', { mode: 'proto_chain' });

      let dprOwner = null;
      let dprDesc = null;
      let dprNeedsMaterialize = false;
      let dprOwnerFact = null;

      if (dprOwnDesc) {
        dprOwner = window;
        dprDesc = dprOwnDesc;
        dprOwnerFact = 'window_own';
      } else if (dprResolved && dprResolved.desc) {
        dprOwner = dprResolved.owner;
        dprDesc = dprResolved.desc;
        dprOwnerFact = 'proto_chain';
      } else {
        dprOwner = windowProto;
        dprDesc = null;
        dprNeedsMaterialize = true;
        dprOwnerFact = 'materialize_on_window_proto';
      }

      if (dprDesc && dprDesc.configurable === false) {
        __navDiag('warn', 'nav_total_set:devicePixelRatio_non_configurable', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:devicePixelRatio',
          key: 'devicePixelRatio',
          message: 'devicePixelRatio is non-configurable',
          data: { outcome: 'skip', reason: 'non_configurable', policy: 'skip', action: 'native' }
        });
        return;
      }

      const dprIsData = !!dprDesc
        && Object.prototype.hasOwnProperty.call(dprDesc, 'value')
        && !dprDesc.get
        && !dprDesc.set;

      if (dprDesc && !dprIsData && typeof dprDesc.get !== 'function') {
        __navDiag('warn', 'nav_total_set:devicePixelRatio_descriptor_kind_mismatch', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:devicePixelRatio',
          key: 'devicePixelRatio',
          message: 'devicePixelRatio is not accessor-shaped on prototype',
          data: { outcome: 'skip', reason: 'descriptor_kind_mismatch', policy: 'skip', action: 'native' }
        });
        return;
      }
      let __navDprThisCheckDiagSent = false;
      const validWindowThis = function validWindowThis(self) {
        try {
          return self === window || (typeof Window === 'function' && self instanceof Window);
        } catch (e) {
          if (!__navDprThisCheckDiagSent) {
            __navDprThisCheckDiagSent = true;
            __navDiag('warn', 'nav_total_set:devicePixelRatio_this_check_failed', {
              stage: 'runtime',
              type: __navTypeBrowser,
              diagTag: 'nav_total_set:devicePixelRatio',
              key: 'devicePixelRatio',
              message: 'Window receiver check failed',
              data: { outcome: 'return', reason: 'window_this_check_failed', policy: 'skip', action: 'native' }
            }, e);
          }
          return false;
        }
      };

      let applied = 0;

      if (dprIsData) {
        applied = applyCoreTargetsGroup('nav_total_set:devicePixelRatio', [{
          owner: dprOwner,
          key: 'devicePixelRatio',
          kind: 'data',
          wrapLayer: 'descriptor_only',
          policy: 'throw',
          diagTag: 'nav_total_set:devicePixelRatio',
          value: dpr,
          writable: !!dprDesc.writable,
          configurable: !!dprDesc.configurable,
          enumerable: !!dprDesc.enumerable
        }], 'throw');
      } else {
        const dprUseOwnerFirstGateway = (dprNeedsMaterialize || dprOwner === window);
        const dprWrapLayer = dprUseOwnerFirstGateway
          ? 'materialized_accessor_gateway'
          : 'strict_accessor_gateway';
        const dprResolveMode = dprUseOwnerFirstGateway
          ? ((dprOwner === window) ? 'own' : 'proto_chain')
          : 'proto_chain';
        const dprInvalidThis = dprUseOwnerFirstGateway
          ? ((dprDesc && typeof dprDesc.get === 'function') ? 'native' : 'throw')
          : 'native';

        if (dprUseOwnerFirstGateway && !__coreOwnerFirstAccessorCapable) {
          __navDiag('error', 'nav_total_set:devicePixelRatio_stale_core_bundle', {
            stage: 'preflight',
            type: __navTypePipeline,
            diagTag: 'nav_total_set:devicePixelRatio',
            key: 'devicePixelRatio',
            message: 'Core does not advertise owner-first accessor capability',
            data: {
              outcome: 'skip',
              reason: 'stale_core_bundle',
              ownerFact: dprOwnerFact,
              wrapLayer: dprWrapLayer,
              resolve: dprResolveMode
            }
          });
          return;
        }

        __navDiag('info', 'nav_total_set:devicePixelRatio_apply_plan', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: 'nav_total_set:devicePixelRatio',
          key: 'devicePixelRatio',
          message: 'devicePixelRatio apply plan prepared',
          data: {
            outcome: 'return',
            ownerFact: dprOwnerFact,
            wrapLayer: dprWrapLayer,
            resolve: dprResolveMode,
            needsMaterialize: dprNeedsMaterialize
          }
        });

        applied = applyCoreTargetsGroup('nav_total_set:devicePixelRatio', [{
          owner: dprOwner,
          key: 'devicePixelRatio',
          kind: 'accessor',
          wrapLayer: dprWrapLayer,
          resolve: dprResolveMode,
          policy: 'strict',
          allowCreate: dprNeedsMaterialize,
          diagTag: 'nav_total_set:devicePixelRatio',
          configurable: dprDesc ? !!dprDesc.configurable : true,
          enumerable: dprDesc ? !!dprDesc.enumerable : false,
          validThis: validWindowThis,
          invalidThis: dprInvalidThis,
          getImpl: function navDevicePixelRatioValue() {
            return dpr;
          }
        }], 'strict');
      }
      if (applied !== 1) {
        __navDiag('warn', 'nav_total_set:devicePixelRatio_define_failed', {
          stage: 'apply',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:devicePixelRatio',
          key: 'devicePixelRatio',
          message: 'failed to define devicePixelRatio',
          data: {
            outcome: 'skip',
            reason: 'apply_failed',
            policy: 'skip',
            action: 'native',
            ownerFact: dprOwnerFact
          }
        });
        return;
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
      safeDefineAcc(navProto, 'oscpu', () => undefined);
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
              const patchBuilder = (__navObjectUserAgentDataHighEntropyState && typeof __navObjectUserAgentDataHighEntropyState.__GET_HIGH_ENTROPY_VALUES_PATCH_BUILDER__ === 'function')
                ? __navObjectUserAgentDataHighEntropyState.__GET_HIGH_ENTROPY_VALUES_PATCH_BUILDER__
                : null;
              if (typeof patchBuilder !== 'function') {
                __navDiag('error', 'nav_total_set:userAgentData_getHighEntropyValues_patch_builder_missing', {
                  stage: 'runtime',
                  type: __navTypePipeline,
                  diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
                  key: 'userAgentData.getHighEntropyValues',
                  message: 'highEntropy patch builder missing',
                  data: { outcome: 'return', reason: 'patch_builder_missing' }
                });
                return nativeOut;
              }
              const patchBuild = patchBuilder(keys);
              if (!patchBuild || patchBuild.ok !== true) {
                if (patchBuild && patchBuild.reason === 'bad_hint') {
                  __navDiag('error', 'nav_total_set:userAgentData_getHighEntropyValues_bad_hint', {
                    stage: 'runtime',
                    type: __navTypePipeline,
                    diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
                    key: 'userAgentData.getHighEntropyValues',
                    message: 'bad highEntropy key item',
                    data: { outcome: 'return', reason: 'bad_hint' }
                  });
                } else {
                  __navDiag('error', 'nav_total_set:userAgentData_getHighEntropyValues_producer_missing', {
                    stage: 'runtime',
                    type: __navTypePipeline,
                    diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
                    key: 'userAgentData.getHighEntropyValues',
                    message: 'highEntropy producer missing',
                    data: { outcome: 'return', reason: 'producer_missing' }
                  });
                }
                return nativeOut;
              }
              const result = patchBuild.value || {};
              const postProcessor = (__navObjectUserAgentDataHighEntropyState && typeof __navObjectUserAgentDataHighEntropyState.__POSTPROCESS_HIGH_ENTROPY_VALUES_RESULT__ === 'function')
                ? __navObjectUserAgentDataHighEntropyState.__POSTPROCESS_HIGH_ENTROPY_VALUES_RESULT__
                : null;
              if (typeof postProcessor !== 'function') {
                __navDiag('error', 'nav_total_set:userAgentData_getHighEntropyValues_postprocessor_missing', {
                  stage: 'runtime',
                  type: __navTypePipeline,
                  diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
                  key: 'userAgentData.getHighEntropyValues',
                  message: 'highEntropy postprocessor missing',
                  data: { outcome: 'return', reason: 'postprocessor_missing' }
                });
                return nativeOut;
              }
              return nativeOut.then(function userAgentDataGetHighEntropyValuesPost(nativeResolved) {
                try {
                  return postProcessor(nativeResolved, result);
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
      const nativeUadRead = __navTryReadNativeValue(
        dUaData,
        navigator,
        'nav_total_set:userAgentData_native_read_failed',
        'nav_total_set:userAgentData',
        'userAgentData',
        'userAgentData native getter read failed on navigator receiver'
      );
      if (nativeUadRead.ok) {
        const nativeUadValue = nativeUadRead.value;
        const nativeUadProfile = {
          brands: meta.brands,
          mobile: meta.mobile,
          platform: chPlatform
        };
        const nativeUadMatches = !!(
          nativeUadValue &&
          nativeUadValue === nativeUAD &&
          __navBrandVersionListEquals(nativeUadValue.brands, meta.brands) &&
          nativeUadValue.mobile === meta.mobile &&
          nativeUadValue.platform === chPlatform
        );
        if (nativeUadMatches) {
          __navDiag('info', 'nav_total_set:userAgentData_getter_value_match', {
            stage: 'preflight',
            type: __navTypePipeline,
            diagTag: 'nav_total_set:userAgentData',
            key: 'userAgentData',
            message: 'userAgentData already matches native getter',
            data: { outcome: 'return', reason: 'getter_value_match' }
          });
        } else {
          __navDiag('info', 'nav_total_set:userAgentData_native_getter_kept', {
            stage: 'preflight',
            type: __navTypePipeline,
            diagTag: 'nav_total_set:userAgentData',
            key: 'userAgentData',
            message: 'userAgentData native getter kept; userAgentData values and methods are handled below',
            data: {
              outcome: 'return',
              reason: 'native_getter_kept',
              policy: 'keep_native_getter',
              action: 'keep_native_getter',
              requiresAction: false,
              descriptorOwner: (dUaDataResolved && dUaDataResolved.owner === navProto) ? 'Navigator.prototype' : 'prototype_chain',
              hasGetter: !!(dUaData && typeof dUaData.get === 'function'),
              nativeValue: {
                brands: nativeUadValue && Array.isArray(nativeUadValue.brands) ? nativeUadValue.brands : null,
                mobile: nativeUadValue ? nativeUadValue.mobile : null,
                platform: nativeUadValue ? nativeUadValue.platform : null
              },
              profileValue: nativeUadProfile
            }
          });
        }
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

    if ('deviceMemory' in navProto) {
      __navDiag('info', 'nav_total_set:deviceMemory_native_getter_kept', {
        stage: 'preflight',
        type: __navTypePipeline,
        diagTag: 'nav_total_set:deviceMemory',
        key: 'deviceMemory',
        message: 'deviceMemory patch disabled; native getter kept',
        data: { outcome: 'skip', reason: 'native_getter_kept', action: 'keep_native_getter' }
      });
      // LEGACY synthetic rollback for window scope:
      // patchStrictScalarAccessor('deviceMemory', function navDeviceMemoryValue() {
      //   if (!__navIsValidDeviceMemoryValue(mem)) {
      //     __navDiagPipeline('warn', 'nav_total_set:deviceMemory_invalid_profile', {
      //       stage: 'runtime',
      //       key: 'deviceMemory',
      //       message: 'invalid deviceMemory profile value',
      //       data: { outcome: 'return', reason: 'invalid_profile_value', value: mem }
      //     });
      //     return __navReadNativeScalarFallback(nativeDeviceMemoryDesc, this, 'deviceMemory', 'nav_total_set:deviceMemory');
      //   }
      //   return Number(mem);
      // }, 'nav_total_set:deviceMemory');
    }
    if ('hardwareConcurrency' in navProto) {
      if (__navIsValidHardwareConcurrencyValue(cpu)) {
        const nativeHardwareConcurrencyRead = __navTryReadNativeValue(
          nativeHardwareConcurrencyDesc,
          navigator,
          'nav_total_set:hardwareConcurrency_native_read_failed',
          'nav_total_set:hardwareConcurrency',
          'hardwareConcurrency',
          'hardwareConcurrency native getter read failed on navigator receiver'
        );
        if (nativeHardwareConcurrencyRead.ok) {
          if (Number(nativeHardwareConcurrencyRead.value) === Number(cpu)) {
            __navDiag('info', 'nav_total_set:hardwareConcurrency_getter_value_match', {
              stage: 'preflight',
              type: __navTypePipeline,
              diagTag: 'nav_total_set:hardwareConcurrency',
              key: 'hardwareConcurrency',
              message: 'hardwareConcurrency already matches native getter',
              data: { outcome: 'return', reason: 'getter_value_match' }
            });
          } else {
            __navDiag('info', 'nav_total_set:hardwareConcurrency_getter_value_mismatch', {
              stage: 'preflight',
              type: __navTypePipeline,
              diagTag: 'nav_total_set:hardwareConcurrency',
              key: 'hardwareConcurrency',
              message: 'hardwareConcurrency native getter value differs from profile value; native getter kept',
              data: {
                outcome: 'skip',
                reason: 'getter_value_mismatch',
                policy: 'skip',
                action: 'keep_native_getter',
                nativeValue: nativeHardwareConcurrencyRead.value,
                profileValue: cpu
              }
            });
          }
        }
      } else {
        patchStrictScalarAccessor('hardwareConcurrency', function navHardwareConcurrencyValue() {
          __navDiagPipeline('warn', 'nav_total_set:hardwareConcurrency_invalid_profile', {
            stage: 'runtime',
            key: 'hardwareConcurrency',
            message: 'invalid hardwareConcurrency profile value',
            data: { outcome: 'return', reason: 'invalid_profile_value', value: cpu }
          });
          return __navReadNativeScalarFallback(nativeHardwareConcurrencyDesc, this, 'hardwareConcurrency', 'nav_total_set:hardwareConcurrency');
        }, 'nav_total_set:hardwareConcurrency');
      }
    }
    if ('language' in navProto) {
      const primaryLanguage = __navPrimaryLanguage;
      const normalizedLanguages = __navNormalizedLanguages;
      const validLanguageTarget = __navIsValidLanguageList(normalizedLanguages) && typeof primaryLanguage === 'string' && primaryLanguage && primaryLanguage === normalizedLanguages[0];
      if (validLanguageTarget) {
        const nativeLanguageRead = __navTryReadNativeValue(
          nativeLanguageDesc,
          navigator,
          'nav_total_set:language_native_read_failed',
          'nav_total_set:language',
          'language',
          'language native getter read failed on navigator receiver'
        );
        if (nativeLanguageRead.ok) {
          if (typeof nativeLanguageRead.value === 'string' && nativeLanguageRead.value === primaryLanguage) {
            __navDiag('info', 'nav_total_set:language_getter_value_match', {
              stage: 'preflight',
              type: __navTypePipeline,
              diagTag: 'nav_total_set:language',
              key: 'language',
              message: 'language already matches native getter',
                data: { outcome: 'return', reason: 'getter_value_match' }
              });
          } else {
            __navDiag('info', 'nav_total_set:language_getter_value_mismatch', {
              stage: 'preflight',
              type: __navTypePipeline,
              diagTag: 'nav_total_set:language',
              key: 'language',
              message: 'language native getter value differs from profile value; native getter kept',
              data: {
                outcome: 'skip',
                reason: 'getter_value_mismatch',
                policy: 'skip',
                action: 'keep_native_getter',
                nativeValue: nativeLanguageRead.value,
                profileValue: primaryLanguage
              }
            });
          }
        }
      } else {
        patchStrictScalarAccessor('language', function navLanguageValue() {
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
        }, 'nav_total_set:language');
      }
    }
    if ('languages' in navProto) {
      const primaryLanguage = __navPrimaryLanguage;
      const normalizedLanguages = __navNormalizedLanguages;
      const validLanguagesTarget = __navIsValidLanguageList(normalizedLanguages) && typeof primaryLanguage === 'string' && primaryLanguage && primaryLanguage === normalizedLanguages[0];
      if (validLanguagesTarget) {
        const nativeLanguagesRead = __navTryReadNativeValue(
          nativeLanguagesDesc,
          navigator,
          'nav_total_set:languages_native_read_failed',
          'nav_total_set:languages',
          'languages',
          'languages native getter read failed on navigator receiver'
        );
        if (nativeLanguagesRead.ok) {
          if (__navStringArrayEquals(nativeLanguagesRead.value, normalizedLanguages)) {
            __navDiag('info', 'nav_total_set:languages_getter_value_match', {
              stage: 'preflight',
              type: __navTypePipeline,
              diagTag: 'nav_total_set:languages',
              key: 'languages',
              message: 'languages already matches native getter',
                data: { outcome: 'return', reason: 'getter_value_match' }
              });
          } else {
            __navDiag('info', 'nav_total_set:languages_getter_value_mismatch', {
              stage: 'preflight',
              type: __navTypePipeline,
              diagTag: 'nav_total_set:languages',
              key: 'languages',
              message: 'languages native getter value differs from profile value; native getter kept',
              data: {
                outcome: 'skip',
                reason: 'getter_value_mismatch',
                policy: 'skip',
                action: 'keep_native_getter',
                nativeValue: Array.isArray(nativeLanguagesRead.value) ? nativeLanguagesRead.value.slice(0, 8) : nativeLanguagesRead.value,
                profileValue: normalizedLanguages.slice(0, 8)
              }
            });
          }
        }
      } else {
        patchStrictScalarAccessor('languages', function navLanguagesValue() {
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
        }, 'nav_total_set:languages');
      }
    }

  
   
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
          __navNativePermissionsQuery = origQuery;
          __navNativePermissionsThis = navigator.permissions;
          if (devicesLabels && typeof devicesLabels === 'object' && devicesLabels.states && typeof devicesLabels.states === 'object') {
            Object.keys(devicesLabels.states).forEach(function probePermissionState(name) {
              __navQueryNativePermissionState(name, function (nativeState) {
                __navCheckPermissionSemanticMismatch(name, nativeState);
              });
            });
          }
          __navDiag('info', 'nav_total_set:permissions_query_native_passthrough', {
            stage: 'apply',
            type: __navTypePipeline,
            diagTag: 'nav_total_set:permissions.query',
            key: 'permissions.query',
            message: 'permissions.query left native; permission state is managed by browser context',
            data: {
              outcome: 'return',
              reason: 'native_passthrough',
              ownerIsPrototype: permOwner !== navigator.permissions
            }
          });
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
      const QUOTA_MB   = Number(storageQuotaMb ?? 120);
      const USED_PCT   = Math.max(0, Math.min(100, Number(storageUsedPct ?? 3))); // ~3% занято
      const quotaBytes = Math.floor(QUOTA_MB * 1024 * 1024);
      let usageBytes   = Math.max(0, Math.floor(quotaBytes * USED_PCT / 100));

      // Monotonous “jitter” of usage within a few KB, on R(), so as not to break the module’s entropy
       const tickUsage = function tickUsage() {
         if (typeof R === 'function') {
           usageBytes = Math.min(quotaBytes - 4096, usageBytes + Math.floor(R() * 4096));
         }
       };

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
         const buildStorageEstimateSnapshot = function buildStorageEstimateSnapshot(sourceTag) {
           tickUsage();
           __navLogAccess('storage.estimate', null, {
             bucket: 'hidden_snapshot_gate',
             source: sourceTag || 'snapshot_gate'
           });
           return {
             quota: quotaBytes,
             usage: usageBytes
           };
         };
          __navSetHiddenStateValue(__navObjectStorageEstimateState, '__STORAGE_ESTIMATE_IMPL__', buildStorageEstimateSnapshot);
          __navSetHiddenStateValue(__navObjectStorageEstimateState, '__STORAGE_ESTIMATE_SNAPSHOT_GATE__', function storageEstimateSnapshotGate() {
            return Promise.resolve(buildStorageEstimateSnapshot('snapshot_gate'));
          });
         __navDiag('info', 'nav_total_set:storage_estimate_native_passthrough', {
           surface: 'navigator',
           stage: 'apply',
           type: __navTypePipeline,
           diagTag: 'nav_total_set:storage.estimate',
           key: 'storage.estimate',
           message: 'storage.estimate left native; synthetic estimate moved to hidden gate',
           data: {
             outcome: 'return',
             reason: 'native_passthrough',
             ownerIsPrototype: storageOwner !== navigator.storage
           }
         });
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
    const perfProto = (window.Performance && Performance.prototype) ? Performance.prototype : null;
    if (perfProto) {
      const dm0 = Number(navigator.deviceMemory);
      if (typeof dm0 === 'number' && isFinite(dm0)) {
        if (!__navResolveDescriptor) {
          __navDiag('warn', 'nav_total_set:performance_memory_resolve_descriptor_missing', {
            surface: 'navigator',
            stage: 'preflight',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:performance.memory',
            key: 'performance.memory',
            message: 'Core.resolveDescriptor missing',
            data: { outcome: 'skip', reason: 'missing_dep_core_resolve_descriptor', policy: 'skip', action: 'native' }
          });
          return;
        }
        const perfMemoryResolved = __navResolveDescriptor(perfProto, 'memory', { mode: 'proto_chain' });
        const perfMemoryOwner = (perfMemoryResolved && perfMemoryResolved.owner) ? perfMemoryResolved.owner : perfProto;

        const heapFromDM = function heapFromDM(dm) {
          if (!(typeof dm === 'number' && isFinite(dm))) return null;
          if (dm <= 0.5) return 512  * 1024 * 1024;   
          if (dm <= 1)   return 768  * 1024 * 1024;   
          if (dm <= 2)   return 1536 * 1024 * 1024;   
          if (dm <= 4)   return 3072 * 1024 * 1024;   
          return 4096 * 1024 * 1024;                  
        };
        const getMemory = function () {
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
        };

        try {
          const perfMemoryOwnDesc = Object.getOwnPropertyDescriptor(performance, 'memory');
          const perfMemoryResolvedOwnerFirst = perfMemoryOwnDesc
            ? null
            : perfMemoryResolved;

          let perfMemoryOwner = null;
          let perfMemoryDesc = null;
          let perfMemoryNeedsMaterialize = false;
          let perfMemoryOwnerFact = null;

          if (perfMemoryOwnDesc) {
            perfMemoryOwner = performance;
            perfMemoryDesc = perfMemoryOwnDesc;
            perfMemoryOwnerFact = 'performance_own';
          } else if (perfMemoryResolvedOwnerFirst && perfMemoryResolvedOwnerFirst.desc) {
            perfMemoryOwner = perfMemoryResolvedOwnerFirst.owner;
            perfMemoryDesc = perfMemoryResolvedOwnerFirst.desc;
            perfMemoryOwnerFact = 'proto_chain';
          } else {
            perfMemoryOwner = perfProto;
            perfMemoryDesc = null;
            perfMemoryNeedsMaterialize = true;
            perfMemoryOwnerFact = 'materialize_on_performance_proto';
          }

          if (perfMemoryDesc && perfMemoryDesc.configurable === false) {
            __navDiag('warn', 'nav_total_set:performance_memory_non_configurable', {
              surface: 'navigator',
              stage: 'preflight',
              type: __navTypeBrowser,
              diagTag: 'nav_total_set:performance.memory',
              key: 'performance.memory',
              message: 'performance.memory is non-configurable',
              data: { outcome: 'skip', reason: 'non_configurable', policy: 'skip', action: 'native' }
            });
            return;
          }
          if (perfMemoryDesc && typeof perfMemoryDesc.get !== 'function') {
            __navDiag('warn', 'nav_total_set:performance_memory_descriptor_kind_mismatch', {
              surface: 'navigator',
              stage: 'preflight',
              type: __navTypeBrowser,
              diagTag: 'nav_total_set:performance.memory',
              key: 'performance.memory',
              message: 'performance.memory is not accessor-shaped on owner',
              data: {
                outcome: 'skip',
                reason: 'descriptor_kind_mismatch',
                policy: 'skip',
                action: 'native',
                ownerFact: perfMemoryOwnerFact
              }
            });
            return;
          }
          let __navPerformanceThisCheckDiagSent = false;
          const validPerformanceThis = function validPerformanceThis(self) {
            try {
              return self === performance || (typeof Performance === 'function' && self instanceof Performance);
            } catch (e) {
              if (!__navPerformanceThisCheckDiagSent) {
                __navPerformanceThisCheckDiagSent = true;
                __navDiag('warn', 'nav_total_set:performance_memory_this_check_failed', {
                  stage: 'runtime',
                  type: __navTypeBrowser,
                  diagTag: 'nav_total_set:performance.memory',
                  key: 'performance.memory',
                  message: 'Performance receiver check failed',
                  data: { outcome: 'return', reason: 'performance_this_check_failed', policy: 'skip', action: 'native' }
                }, e);
              }
              return false;
            }
          };
          const perfUseOwnerFirstGateway = (perfMemoryNeedsMaterialize || perfMemoryOwner === performance);
          const perfWrapLayer = perfUseOwnerFirstGateway
            ? 'materialized_accessor_gateway'
            : 'object_return_gateway';
          const perfResolveMode = perfUseOwnerFirstGateway
            ? ((perfMemoryOwner === performance) ? 'own' : 'proto_chain')
            : 'proto_chain';
          const perfInvalidThis = perfUseOwnerFirstGateway
            ? ((perfMemoryDesc && typeof perfMemoryDesc.get === 'function') ? 'native' : 'throw')
            : 'native';

          if (perfUseOwnerFirstGateway && !__coreOwnerFirstAccessorCapable) {
            __navDiag('error', 'nav_total_set:performance_memory_stale_core_bundle', {
              surface: 'navigator',
              stage: 'preflight',
              type: __navTypePipeline,
              diagTag: 'nav_total_set:performance.memory',
              key: 'performance.memory',
              message: 'Core does not advertise owner-first accessor capability',
              data: {
                outcome: 'skip',
                reason: 'stale_core_bundle',
                ownerFact: perfMemoryOwnerFact,
                wrapLayer: perfWrapLayer,
                resolve: perfResolveMode
              }
            });
            return;
          }

          __navDiag('info', 'nav_total_set:performance_memory_apply_plan', {
            surface: 'navigator',
            stage: 'preflight',
            type: __navTypePipeline,
            diagTag: 'nav_total_set:performance.memory',
            key: 'performance.memory',
            message: 'performance.memory apply plan prepared',
            data: {
              outcome: 'return',
              ownerFact: perfMemoryOwnerFact,
              wrapLayer: perfWrapLayer,
              resolve: perfResolveMode,
              needsMaterialize: perfMemoryNeedsMaterialize
            }
          });

          const applied = applyCoreTargetsGroup('nav_total_set:performance.memory', [{
            owner: perfMemoryOwner,
            key: 'memory',
            kind: 'accessor',
            wrapLayer: perfWrapLayer,
            resolve: perfResolveMode,
            policy: 'strict',
            allowCreate: perfMemoryNeedsMaterialize,
            diagTag: 'nav_total_set:performance.memory',
            configurable: perfMemoryDesc ? !!perfMemoryDesc.configurable : true,
            enumerable: perfMemoryDesc ? !!perfMemoryDesc.enumerable : false,
            validThis: validPerformanceThis,
            invalidThis: perfInvalidThis,
            getImpl: function navPerformanceMemoryValue() {
              return getMemory.call(this);
            }
          }], 'strict');
          if (applied !== 1) {
            __navDiag('warn', 'nav_total_set:performance_memory_define_failed', {
              surface: 'navigator',
              stage: 'apply',
              type: __navTypeBrowser,
              diagTag: 'nav_total_set:performance.memory',
              key: 'performance.memory',
              message: 'failed to define performance.memory',
              data: {
                outcome: 'skip',
                reason: 'apply_failed',
                policy: 'skip',
                action: 'native',
                ownerFact: perfMemoryOwnerFact
              }
            });
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
      window.PublicKeyCredential = function PublicKeyCredential() {};
      Object.defineProperty(PublicKeyCredential, 'isUserVerifyingPlatformAuthenticatorAvailable', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: function isUserVerifyingPlatformAuthenticatorAvailable() { return Promise.resolve(true); }
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
    (function applyPluginsAndMimeTypesSubgraph() {
      const __navPluginsAppliedCheckpoint = __navModuleApplied.length;
      const profiles = Array.isArray(pluginProfiles) ? pluginProfiles : [];
      function safeString(val) { return (typeof val === 'symbol' || typeof val === 'undefined') ? '' : String(val); }
      function __navPluginsError(reason, message) {
        const err = new Error(message);
        err.__navPluginsReason = reason;
        return err;
      }
      let __navPluginsState = __navObjectPluginsState;
      let __navMimeTypesState = __navObjectMimeTypesState;
      function __navResetPluginsHiddenState() {
        __navSetHiddenStateValue(__navPluginsState, '__NORMALIZED_PLUGIN_PROFILES__', null);
        __navSetHiddenStateValue(__navPluginsState, '__PLUGIN_ARRAY_META__', null);
        __navSetHiddenStateValue(__navPluginsState, '__PLUGIN_ARRAY_SINGLETON__', null);
        __navSetHiddenStateValue(__navPluginsState, '__GET_PLUGINS_VALUE__', null);
        __navSetHiddenStateValue(__navPluginsState, '__PROTO_METHODS_READY__', false);
        __navSetHiddenStateValue(__navPluginsState, '__PROTO_ACCESSORS_READY__', false);
        __navSetHiddenStateValue(__navObjectPluginsPluginRecordsState, '__PLUGIN_META__', null);
        __navSetHiddenStateValue(__navObjectPluginsProtoMethodsState, '__NATIVE_PLUGIN_ITEM__', null);
        __navSetHiddenStateValue(__navObjectPluginsProtoMethodsState, '__NATIVE_PLUGIN_NAMED_ITEM__', null);
        __navSetHiddenStateValue(__navObjectPluginsProtoMethodsState, '__NATIVE_PLUGIN_ARRAY_ITEM__', null);
        __navSetHiddenStateValue(__navObjectPluginsProtoMethodsState, '__NATIVE_PLUGIN_ARRAY_NAMED_ITEM__', null);
        __navSetHiddenStateValue(__navMimeTypesState, '__MIMETYPE_ARRAY_META__', null);
        __navSetHiddenStateValue(__navMimeTypesState, '__MIME_OBJECTS_SINGLETON__', null);
        __navSetHiddenStateValue(__navMimeTypesState, '__MIMETYPE_ARRAY_SINGLETON__', null);
        __navSetHiddenStateValue(__navMimeTypesState, '__GET_MIMETYPES_VALUE__', null);
        __navSetHiddenStateValue(__navMimeTypesState, '__PROTO_METHODS_READY__', false);
        __navSetHiddenStateValue(__navMimeTypesState, '__PROTO_ACCESSORS_READY__', false);
        __navSetHiddenStateValue(__navObjectMimeTypesMimeRecordsState, '__MIMETYPE_META__', null);
        __navSetHiddenStateValue(__navObjectMimeTypesProtoMethodsState, '__NATIVE_MIMETYPE_ARRAY_ITEM__', null);
        __navSetHiddenStateValue(__navObjectMimeTypesProtoMethodsState, '__NATIVE_MIMETYPE_ARRAY_NAMED_ITEM__', null);
      }
      function __navRollbackPluginsSubgraph(reason, err) {
        let rollbackErr = null;
        for (let i = __navModuleApplied.length - 1; i >= __navPluginsAppliedCheckpoint; i--) {
          const row = __navModuleApplied[i];
          if (!row || !row.owner || typeof row.key !== 'string') continue;
          try {
            if (row.origDesc) Object.defineProperty(row.owner, row.key, row.origDesc);
            else delete row.owner[row.key];
          } catch (e) {
            if (!rollbackErr) rollbackErr = e;
            __navDiag('error', 'nav_total_set:plugins_rollback_failed', {
              stage: 'rollback',
              type: __navTypePipeline,
              diagTag: 'nav_total_set:plugins',
              key: row.key,
              message: 'plugins/mimeTypes rollback failed',
              data: { outcome: 'rollback', reason: 'rollback_failed', sourceReason: reason || null }
            }, e);
          }
          if (__navModuleAppliedOwners) {
            const bucket = __navModuleAppliedOwners.get(row.owner);
            if (bucket && typeof bucket.delete === 'function') bucket.delete(row.key);
          }
        }
        __navModuleApplied.length = __navPluginsAppliedCheckpoint;
        __navResetPluginsHiddenState();
        if (rollbackErr) throw rollbackErr;
        __navDiag('warn', 'nav_total_set:plugins_skipped', {
          stage: 'rollback',
          type: __navTypePipeline,
          diagTag: 'nav_total_set:plugins',
          key: 'plugins',
          message: 'plugins/mimeTypes subgraph rolled back to native path',
          data: { outcome: 'skip', reason: reason || 'apply_failed', rollback: 'applied' }
        }, err || null);
      }
      __navResetPluginsHiddenState();

      const pluginProto = (typeof Plugin === 'function' && Plugin.prototype) ? Plugin.prototype : null;
      const pluginArrayProto = (typeof PluginArray === 'function' && PluginArray.prototype) ? PluginArray.prototype : null;
      const mimeProto = (typeof MimeType === 'function' && MimeType.prototype) ? MimeType.prototype : null;
      const mimeTypeArrayProto = (typeof MimeTypeArray === 'function' && MimeTypeArray.prototype) ? MimeTypeArray.prototype : null;
      if (
        !pluginProto ||
        !pluginArrayProto ||
        !mimeProto ||
        !mimeTypeArrayProto ||
        !('plugins' in navigator) ||
        !('mimeTypes' in navigator)
      ) {
        __navDiag('warn', 'nav_total_set:plugins_skipped', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: 'nav_total_set:plugins',
          key: 'plugins',
          message: 'plugins/mimeTypes prerequisites missing',
          data: {
            outcome: 'skip',
            reason: 'preflight_missing',
            hasPluginProto: !!pluginProto,
            hasPluginArrayProto: !!pluginArrayProto,
            hasMimeProto: !!mimeProto,
            hasMimeTypeArrayProto: !!mimeTypeArrayProto,
            hasNavigatorPlugins: ('plugins' in navigator),
            hasNavigatorMimeTypes: ('mimeTypes' in navigator)
          }
        });
        return;
      }

      const fakePlugins = [];
      let normalizedMimeCount = 0;
      for (let i = 0; i < profiles.length; i++) {
        const pl = profiles[i] && typeof profiles[i] === 'object' ? profiles[i] : Object.create(null);
        const rawMimeTypes = Array.isArray(pl.mimeTypes) ? pl.mimeTypes : [];
        const mimeTypes = [];
        for (let j = 0; j < rawMimeTypes.length; j++) {
          const mt = rawMimeTypes[j];
          const d = (mt && typeof mt === 'object')
            ? mt
            : { type: mt, suffixes: '', description: '' };
          mimeTypes.push({
            type: safeString(d.type),
            suffixes: safeString(d.suffixes == null ? '' : d.suffixes),
            description: safeString(d.description == null ? '' : d.description)
          });
          normalizedMimeCount += 1;
        }
        fakePlugins.push({
          name: safeString(pl.name),
          filename: safeString(pl.filename),
          description: safeString(pl.description),
          mimeTypes: mimeTypes
        });
      }
      const nativePluginsDesc = __navResolveNativeAccessorDesc('plugins');
      const nativeMimeTypesDesc = __navResolveNativeAccessorDesc('mimeTypes');
      const nativePluginsRead = __navTryReadNativeValue(
        nativePluginsDesc,
        navigator,
        'nav_total_set:plugins_native_read_failed',
        'nav_total_set:plugins',
        'plugins',
        'plugins native getter read failed on navigator receiver'
      );
      const nativeMimeTypesRead = __navTryReadNativeValue(
        nativeMimeTypesDesc,
        navigator,
        'nav_total_set:mimeTypes_native_read_failed',
        'nav_total_set:mimeTypes',
        'mimeTypes',
        'mimeTypes native getter read failed on navigator receiver'
      );
      function __navPluginsTopLevelParity(nativePluginsValue, nativeMimeTypesValue) {
        if (!nativePluginsValue || !nativeMimeTypesValue) return false;
        if (Number(nativePluginsValue.length) !== fakePlugins.length) return false;
        if (Number(nativeMimeTypesValue.length) !== normalizedMimeCount) return false;
        let mimeGlobalIndex = 0;
        for (let i = 0; i < fakePlugins.length; i++) {
          const expectedPlugin = fakePlugins[i];
          const nativePlugin = nativePluginsValue[i];
          if (!nativePlugin) return false;
          if (String(nativePlugin.name == null ? '' : nativePlugin.name) !== expectedPlugin.name) return false;
          if (String(nativePlugin.filename == null ? '' : nativePlugin.filename) !== expectedPlugin.filename) return false;
          if (String(nativePlugin.description == null ? '' : nativePlugin.description) !== expectedPlugin.description) return false;
          if (Number(nativePlugin.length) !== expectedPlugin.mimeTypes.length) return false;
          for (let j = 0; j < expectedPlugin.mimeTypes.length; j++) {
            const expectedMime = expectedPlugin.mimeTypes[j];
            const nativePluginMime = nativePlugin[j];
            const nativeMime = nativeMimeTypesValue[mimeGlobalIndex];
            if (!nativePluginMime || !nativeMime) return false;
            if (String(nativePluginMime.type == null ? '' : nativePluginMime.type) !== expectedMime.type) return false;
            if (String(nativePluginMime.suffixes == null ? '' : nativePluginMime.suffixes) !== expectedMime.suffixes) return false;
            if (String(nativePluginMime.description == null ? '' : nativePluginMime.description) !== expectedMime.description) return false;
            if (String(nativeMime.type == null ? '' : nativeMime.type) !== expectedMime.type) return false;
            if (String(nativeMime.suffixes == null ? '' : nativeMime.suffixes) !== expectedMime.suffixes) return false;
            if (String(nativeMime.description == null ? '' : nativeMime.description) !== expectedMime.description) return false;
            if (nativeMime.enabledPlugin !== nativePlugin) return false;
            mimeGlobalIndex += 1;
          }
        }
        return true;
      }
      const nativePluginsParity = nativePluginsRead.ok && nativeMimeTypesRead.ok
        ? __navPluginsTopLevelParity(nativePluginsRead.value, nativeMimeTypesRead.value)
        : false;
      if (nativePluginsRead.ok && nativeMimeTypesRead.ok && nativePluginsParity) {
        __navDiag('info', 'nav_total_set:plugins_getter_value_match', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: 'nav_total_set:plugins',
          key: 'plugins',
          message: 'plugins already matches native getter',
          data: { outcome: 'return', reason: 'getter_value_match' }
        });
        __navDiag('info', 'nav_total_set:mimeTypes_getter_value_match', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: 'nav_total_set:mimeTypes',
          key: 'mimeTypes',
          message: 'mimeTypes already matches native getter',
          data: { outcome: 'return', reason: 'getter_value_match' }
        });
        return;
      }
      if (nativePluginsRead.ok && nativeMimeTypesRead.ok && !nativePluginsParity) {
        __navDiag('info', 'nav_total_set:plugins_native_getter_kept', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: 'nav_total_set:plugins',
          key: 'plugins',
          message: 'plugins native getter kept',
          data: {
            outcome: 'return',
            reason: 'native_getter_kept',
            policy: 'keep_native_getter',
            action: 'keep_native_getter',
            requiresAction: false,
            nativeLength: nativePluginsRead.value && nativePluginsRead.value.length,
            profileLength: fakePlugins.length
          }
        });
        __navDiag('info', 'nav_total_set:mimeTypes_native_getter_kept', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: 'nav_total_set:mimeTypes',
          key: 'mimeTypes',
          message: 'mimeTypes native getter kept',
          data: {
            outcome: 'return',
            reason: 'native_getter_kept',
            policy: 'keep_native_getter',
            action: 'keep_native_getter',
            requiresAction: false,
            nativeLength: nativeMimeTypesRead.value && nativeMimeTypesRead.value.length,
            profileLength: normalizedMimeCount
          }
        });
        return;
      }

      const __navPluginArrayMeta = new WeakMap();
      const __navPluginMeta = new WeakMap();
      const __navMimeTypeArrayMeta = new WeakMap();
      const __navMimeTypeMeta = new WeakMap();
      const __navNativePluginItem = (typeof pluginProto.item === 'function') ? pluginProto.item : null;
      const __navNativePluginNamedItem = (typeof pluginProto.namedItem === 'function') ? pluginProto.namedItem : null;
      const __navNativePluginArrayItem = (typeof pluginArrayProto.item === 'function') ? pluginArrayProto.item : null;
      const __navNativePluginArrayNamedItem = (typeof pluginArrayProto.namedItem === 'function') ? pluginArrayProto.namedItem : null;
      const __navNativeMimeTypeArrayItem = (typeof mimeTypeArrayProto.item === 'function') ? mimeTypeArrayProto.item : null;
      const __navNativeMimeTypeArrayNamedItem = (typeof mimeTypeArrayProto.namedItem === 'function') ? mimeTypeArrayProto.namedItem : null;
      let __navCollectionsGraph = null;
      function __navResolveCollectionEntry(dict, key) {
        if (!dict || typeof dict !== 'object') return null;
        const normalizedKey = String(key);
        return Object.prototype.hasOwnProperty.call(dict, normalizedKey) ? dict[normalizedKey] : null;
      }
      function __navGetPluginRecord(receiver) {
        if (!receiver || (typeof receiver !== 'object' && typeof receiver !== 'function')) return null;
        return (__navPluginMeta instanceof WeakMap) ? (__navPluginMeta.get(receiver) || null) : null;
      }
      function __navGetPluginArrayRecord(receiver) {
        if (!receiver || (typeof receiver !== 'object' && typeof receiver !== 'function')) return null;
        return (__navPluginArrayMeta instanceof WeakMap) ? (__navPluginArrayMeta.get(receiver) || null) : null;
      }
      function __navGetMimeTypeRecord(receiver) {
        if (!receiver || (typeof receiver !== 'object' && typeof receiver !== 'function')) return null;
        return (__navMimeTypeMeta instanceof WeakMap) ? (__navMimeTypeMeta.get(receiver) || null) : null;
      }
      function __navGetMimeTypeArrayRecord(receiver) {
        if (!receiver || (typeof receiver !== 'object' && typeof receiver !== 'function')) return null;
        return (__navMimeTypeArrayMeta instanceof WeakMap) ? (__navMimeTypeArrayMeta.get(receiver) || null) : null;
      }
      function __navEnsureCollectionsGraph() {
        if (__navCollectionsGraph) return __navCollectionsGraph;
        throw __navPluginsError('collections_not_ready', 'plugins/mimeTypes collections graph missing');
      }

      try {
        const protoTargets = [{
          owner: pluginProto,
          key: 'item',
          resolve: 'proto_chain',
          kind: 'method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:Plugin.item',
          validThis(self) {
            return !!__navGetPluginRecord(self);
          },
          invalidThis: 'native',
          invoke(orig, args) {
            const record = __navGetPluginRecord(this);
            if (!record) return Reflect.apply(orig, this, args || []);
            const index = (args && args.length) ? args[0] : undefined;
            return __navResolveCollectionEntry(record.mimeByIndex, index);
          }
        }, {
          owner: pluginProto,
          key: 'namedItem',
          resolve: 'proto_chain',
          kind: 'method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:Plugin.namedItem',
          validThis(self) {
            return !!__navGetPluginRecord(self);
          },
          invalidThis: 'native',
          invoke(orig, args) {
            const record = __navGetPluginRecord(this);
            if (!record) return Reflect.apply(orig, this, args || []);
            const type = (args && args.length) ? args[0] : undefined;
            return __navResolveCollectionEntry(record.mimeByType, type);
          }
        }, {
          owner: pluginArrayProto,
          key: 'item',
          resolve: 'proto_chain',
          kind: 'method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:PluginArray.item',
          validThis(self) {
            return !!__navGetPluginArrayRecord(self);
          },
          invalidThis: 'native',
          invoke(orig, args) {
            const record = __navGetPluginArrayRecord(this);
            if (!record) return Reflect.apply(orig, this, args || []);
            const index = (args && args.length) ? args[0] : undefined;
            return __navResolveCollectionEntry(record.pluginsByIndex, index);
          }
        }, {
          owner: pluginArrayProto,
          key: 'namedItem',
          resolve: 'proto_chain',
          kind: 'method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:PluginArray.namedItem',
          validThis(self) {
            return !!__navGetPluginArrayRecord(self);
          },
          invalidThis: 'native',
          invoke(orig, args) {
            const record = __navGetPluginArrayRecord(this);
            if (!record) return Reflect.apply(orig, this, args || []);
            const name = (args && args.length) ? args[0] : undefined;
            return __navResolveCollectionEntry(record.pluginsByName, name);
          }
        }, {
          owner: mimeTypeArrayProto,
          key: 'item',
          resolve: 'proto_chain',
          kind: 'method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:MimeTypeArray.item',
          validThis(self) {
            return !!__navGetMimeTypeArrayRecord(self);
          },
          invalidThis: 'native',
          invoke(orig, args) {
            const record = __navGetMimeTypeArrayRecord(this);
            if (!record) return Reflect.apply(orig, this, args || []);
            const index = (args && args.length) ? args[0] : undefined;
            return __navResolveCollectionEntry(record.mimeByIndex, index);
          }
        }, {
          owner: mimeTypeArrayProto,
          key: 'namedItem',
          resolve: 'proto_chain',
          kind: 'method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:MimeTypeArray.namedItem',
          validThis(self) {
            return !!__navGetMimeTypeArrayRecord(self);
          },
          invalidThis: 'native',
          invoke(orig, args) {
            const record = __navGetMimeTypeArrayRecord(this);
            if (!record) return Reflect.apply(orig, this, args || []);
            const type = (args && args.length) ? args[0] : undefined;
            return __navResolveCollectionEntry(record.mimeByType, type);
          }
        }];
        const protoApplied = applyCoreTargetsGroup('nav_total_set:plugins_proto_methods', protoTargets, 'throw');
        if (protoApplied !== protoTargets.length) {
          throw __navPluginsError('proto_methods_incomplete', 'plugins/mimeTypes prototype methods patch incomplete');
        }

        const accessorTargets = [{
          owner: pluginProto,
          key: 'name',
          kind: 'accessor',
          wrapLayer: 'strict_accessor_gateway',
          resolve: 'proto_chain',
          policy: 'strict',
          diagTag: 'nav_total_set:Plugin.name',
          validThis(self) {
            return !!__navGetPluginRecord(self);
          },
          invalidThis: 'native',
          getImpl: function navPluginNameValue() {
            const record = __navGetPluginRecord(this);
            return record ? record.name : '';
          }
        }, {
          owner: pluginProto,
          key: 'filename',
          kind: 'accessor',
          wrapLayer: 'strict_accessor_gateway',
          resolve: 'proto_chain',
          policy: 'strict',
          diagTag: 'nav_total_set:Plugin.filename',
          validThis(self) {
            return !!__navGetPluginRecord(self);
          },
          invalidThis: 'native',
          getImpl: function navPluginFilenameValue() {
            const record = __navGetPluginRecord(this);
            return record ? record.filename : '';
          }
        }, {
          owner: pluginProto,
          key: 'description',
          kind: 'accessor',
          wrapLayer: 'strict_accessor_gateway',
          resolve: 'proto_chain',
          policy: 'strict',
          diagTag: 'nav_total_set:Plugin.description',
          validThis(self) {
            return !!__navGetPluginRecord(self);
          },
          invalidThis: 'native',
          getImpl: function navPluginDescriptionValue() {
            const record = __navGetPluginRecord(this);
            return record ? record.description : '';
          }
        }, {
          owner: pluginProto,
          key: 'length',
          kind: 'accessor',
          wrapLayer: 'strict_accessor_gateway',
          resolve: 'proto_chain',
          policy: 'strict',
          diagTag: 'nav_total_set:Plugin.length',
          validThis(self) {
            return !!__navGetPluginRecord(self);
          },
          invalidThis: 'native',
          getImpl: function navPluginLengthValue() {
            const record = __navGetPluginRecord(this);
            return record ? record.mimeList.length : 0;
          }
        }, {
          owner: mimeProto,
          key: 'type',
          kind: 'accessor',
          wrapLayer: 'strict_accessor_gateway',
          resolve: 'proto_chain',
          policy: 'strict',
          diagTag: 'nav_total_set:MimeType.type',
          validThis(self) {
            return !!__navGetMimeTypeRecord(self);
          },
          invalidThis: 'native',
          getImpl: function navMimeTypeValue() {
            const record = __navGetMimeTypeRecord(this);
            return record ? record.type : '';
          }
        }, {
          owner: mimeProto,
          key: 'suffixes',
          kind: 'accessor',
          wrapLayer: 'strict_accessor_gateway',
          resolve: 'proto_chain',
          policy: 'strict',
          diagTag: 'nav_total_set:MimeType.suffixes',
          validThis(self) {
            return !!__navGetMimeTypeRecord(self);
          },
          invalidThis: 'native',
          getImpl: function navMimeSuffixesValue() {
            const record = __navGetMimeTypeRecord(this);
            return record ? record.suffixes : '';
          }
        }, {
          owner: mimeProto,
          key: 'description',
          kind: 'accessor',
          wrapLayer: 'strict_accessor_gateway',
          resolve: 'proto_chain',
          policy: 'strict',
          diagTag: 'nav_total_set:MimeType.description',
          validThis(self) {
            return !!__navGetMimeTypeRecord(self);
          },
          invalidThis: 'native',
          getImpl: function navMimeDescriptionValue() {
            const record = __navGetMimeTypeRecord(this);
            return record ? record.description : '';
          }
        }, {
          owner: mimeProto,
          key: 'enabledPlugin',
          kind: 'accessor',
          wrapLayer: 'strict_accessor_gateway',
          resolve: 'proto_chain',
          policy: 'strict',
          diagTag: 'nav_total_set:MimeType.enabledPlugin',
          validThis(self) {
            return !!__navGetMimeTypeRecord(self);
          },
          invalidThis: 'native',
          getImpl: function navMimeEnabledPluginValue() {
            const record = __navGetMimeTypeRecord(this);
            return record ? record.enabledPlugin : null;
          }
        }];
        const accessorsApplied = applyCoreTargetsGroup('nav_total_set:plugins_proto_accessors', accessorTargets, 'throw');
        if (accessorsApplied !== accessorTargets.length) {
          throw __navPluginsError('proto_accessors_incomplete', 'plugins/mimeTypes prototype accessors patch incomplete');
        }

        function __navBuildCollectionsGraph() {
          if (__navCollectionsGraph) return __navCollectionsGraph;
          const pluginList = [];
          const mimeList = [];
          const pluginArray = Object.create(PluginArray.prototype, {
            length: { value: fakePlugins.length, enumerable: true, configurable: true }
          });
          const mimeArray = Object.create(MimeTypeArray.prototype, {
            length: { value: normalizedMimeCount, enumerable: true, configurable: true }
          });
          const pluginArrayRecord = {
            pluginArray: pluginArray,
            pluginsByIndex: Object.create(null),
            pluginsByName: Object.create(null),
            pluginList: pluginList
          };
          const mimeArrayRecord = {
            mimeArray: mimeArray,
            mimeByIndex: Object.create(null),
            mimeByType: Object.create(null),
            mimeList: mimeList
          };
          __navPluginArrayMeta.set(pluginArray, pluginArrayRecord);
          __navMimeTypeArrayMeta.set(mimeArray, mimeArrayRecord);

          for (let i = 0; i < fakePlugins.length; i++) {
            const p = fakePlugins[i];
            const pluginObj = Object.create(Plugin.prototype);
            const pluginRecord = {
              index: i,
              name: String(p.name),
              filename: String(p.filename),
              description: String(p.description),
              plugin: pluginObj,
              mimeByIndex: Object.create(null),
              mimeByType: Object.create(null),
              mimeList: []
            };
            __navPluginMeta.set(pluginObj, pluginRecord);
            pluginList.push(pluginObj);
            Object.defineProperty(pluginArray, String(i), { value: pluginObj, enumerable: true, configurable: true });
            pluginArrayRecord.pluginsByIndex[String(i)] = pluginObj;
            if (pluginRecord.name && !Object.prototype.hasOwnProperty.call(pluginArrayRecord.pluginsByName, pluginRecord.name)) {
              Object.defineProperty(pluginArray, pluginRecord.name, { value: pluginObj, enumerable: false, configurable: true });
              pluginArrayRecord.pluginsByName[pluginRecord.name] = pluginObj;
            }
          }

          let mimeGlobalIndex = 0;
          for (let i = 0; i < fakePlugins.length; i++) {
            const p = fakePlugins[i];
            const pluginObj = pluginList[i];
            const pluginRecord = __navGetPluginRecord(pluginObj);
            for (let j = 0; j < p.mimeTypes.length; j++) {
              const m = p.mimeTypes[j];
              const mimeType = String(m.type);
              const mimeObj = Object.create(MimeType.prototype);
              Object.defineProperty(pluginObj, String(j), { value: mimeObj, enumerable: true, configurable: true });
              if (mimeType && !Object.prototype.hasOwnProperty.call(pluginRecord.mimeByType, mimeType)) {
                Object.defineProperty(pluginObj, mimeType, { value: mimeObj, enumerable: false, configurable: true });
              }
              Object.defineProperty(mimeArray, String(mimeGlobalIndex), { value: mimeObj, enumerable: true, configurable: true });
              pluginRecord.mimeByIndex[String(j)] = mimeObj;
              if (mimeType && !Object.prototype.hasOwnProperty.call(pluginRecord.mimeByType, mimeType)) {
                pluginRecord.mimeByType[mimeType] = mimeObj;
              }
              pluginRecord.mimeList.push(mimeObj);
              mimeArrayRecord.mimeByIndex[String(mimeGlobalIndex)] = mimeObj;
              if (mimeType && !Object.prototype.hasOwnProperty.call(mimeArrayRecord.mimeByType, mimeType)) {
                Object.defineProperty(mimeArray, mimeType, { value: mimeObj, enumerable: false, configurable: true });
                mimeArrayRecord.mimeByType[mimeType] = mimeObj;
              }
              __navMimeTypeMeta.set(mimeObj, {
                index: j,
                type: mimeType,
                suffixes: String(m.suffixes == null ? '' : m.suffixes),
                description: String(m.description == null ? '' : m.description),
                mimeType: mimeObj,
                enabledPlugin: pluginObj
              });
              mimeList.push(mimeObj);
              mimeGlobalIndex += 1;
            }
          }

          __navCollectionsGraph = {
            pluginArray: pluginArray,
            mimeArray: mimeArray,
            pluginList: pluginList,
            mimeList: mimeList
          };
          return __navCollectionsGraph;
        }
        function __navGetPluginsValue() {
          return __navEnsureCollectionsGraph().pluginArray;
        }
        function __navGetMimeTypesValue() {
          return __navEnsureCollectionsGraph().mimeArray;
        }
        function __navPostcheckPluginsSubgraph() {
          const pluginArrayA = __navGetPluginsValue();
          const pluginArrayB = __navGetPluginsValue();
          const mimeArrayA = __navGetMimeTypesValue();
          const mimeArrayB = __navGetMimeTypesValue();
          if (pluginArrayA !== pluginArrayB) throw __navPluginsError('postcheck_failed', 'navigator.plugins identity unstable');
          if (mimeArrayA !== mimeArrayB) throw __navPluginsError('postcheck_failed', 'navigator.mimeTypes identity unstable');
          if (navigator.plugins !== pluginArrayA || navigator.plugins !== navigator.plugins) {
            throw __navPluginsError('postcheck_failed', 'navigator.plugins getter did not return stable singleton');
          }
          if (navigator.mimeTypes !== mimeArrayA || navigator.mimeTypes !== navigator.mimeTypes) {
            throw __navPluginsError('postcheck_failed', 'navigator.mimeTypes getter did not return stable singleton');
          }
          if (pluginArrayA.length !== fakePlugins.length) throw __navPluginsError('postcheck_failed', 'navigator.plugins length mismatch');
          if (mimeArrayA.length !== normalizedMimeCount) throw __navPluginsError('postcheck_failed', 'navigator.mimeTypes length mismatch');
          if (Object.prototype.toString.call(pluginArrayA) !== '[object PluginArray]') {
            throw __navPluginsError('postcheck_failed', 'navigator.plugins tag mismatch');
          }
          if (Object.prototype.toString.call(mimeArrayA) !== '[object MimeTypeArray]') {
            throw __navPluginsError('postcheck_failed', 'navigator.mimeTypes tag mismatch');
          }
          if (Object.prototype.hasOwnProperty.call(pluginArrayA, 'item') || Object.prototype.hasOwnProperty.call(pluginArrayA, 'namedItem')) {
            throw __navPluginsError('postcheck_failed', 'PluginArray own-method fallback detected');
          }
          if (Object.prototype.hasOwnProperty.call(mimeArrayA, 'item') || Object.prototype.hasOwnProperty.call(mimeArrayA, 'namedItem')) {
            throw __navPluginsError('postcheck_failed', 'MimeTypeArray own-method fallback detected');
          }
          const firstPlugin = pluginArrayA.length ? pluginArrayA[0] : null;
          if (firstPlugin) {
            if (
              Object.prototype.hasOwnProperty.call(firstPlugin, 'item') ||
              Object.prototype.hasOwnProperty.call(firstPlugin, 'namedItem') ||
              Object.prototype.hasOwnProperty.call(firstPlugin, 'name') ||
              Object.prototype.hasOwnProperty.call(firstPlugin, 'filename') ||
              Object.prototype.hasOwnProperty.call(firstPlugin, 'description') ||
              Object.prototype.hasOwnProperty.call(firstPlugin, 'length')
            ) {
              throw __navPluginsError('postcheck_failed', 'Plugin own fallback detected');
            }
          }
          const firstMime = mimeArrayA.length ? mimeArrayA[0] : null;
          if (firstMime) {
            if (
              Object.prototype.hasOwnProperty.call(firstMime, 'type') ||
              Object.prototype.hasOwnProperty.call(firstMime, 'suffixes') ||
              Object.prototype.hasOwnProperty.call(firstMime, 'description') ||
              Object.prototype.hasOwnProperty.call(firstMime, 'enabledPlugin')
            ) {
              throw __navPluginsError('postcheck_failed', 'MimeType own fallback detected');
            }
            if (firstPlugin && firstMime.enabledPlugin !== firstPlugin) {
              throw __navPluginsError('postcheck_failed', 'MimeType.enabledPlugin linkage mismatch');
            }
          }
        }
        const graph = __navBuildCollectionsGraph();
        try {
          if (patchObjectReturnAccessor('plugins', function pluginsAccessorValue() {
            return __navGetPluginsValue();
          }, 'nav_total_set:plugins') !== true) {
            throw __navPluginsError('plugins_getter_apply_failed', 'navigator.plugins getter patch failed');
          }
        } catch (e) {
          if (!e.__navPluginsReason) e.__navPluginsReason = 'plugins_getter_apply_failed';
          throw e;
        }
        try {
          if (patchObjectReturnAccessor('mimeTypes', function mimeTypesAccessorValue() {
            return __navGetMimeTypesValue();
          }, 'nav_total_set:mimeTypes') !== true) {
            throw __navPluginsError('mimeTypes_getter_apply_failed', 'navigator.mimeTypes getter patch failed');
          }
        } catch (e) {
          if (!e.__navPluginsReason) e.__navPluginsReason = 'mimeTypes_getter_apply_failed';
          throw e;
        }

        __navPostcheckPluginsSubgraph();
        __navSetHiddenStateValue(__navPluginsState, '__NORMALIZED_PLUGIN_PROFILES__', fakePlugins);
        __navSetHiddenStateValue(__navPluginsState, '__PLUGIN_ARRAY_META__', __navPluginArrayMeta);
        __navSetHiddenStateValue(__navPluginsState, '__PLUGIN_ARRAY_SINGLETON__', graph.pluginArray);
        __navSetHiddenStateValue(__navPluginsState, '__GET_PLUGINS_VALUE__', __navGetPluginsValue);
        __navSetHiddenStateValue(__navPluginsState, '__PROTO_METHODS_READY__', true);
        __navSetHiddenStateValue(__navPluginsState, '__PROTO_ACCESSORS_READY__', true);
        __navSetHiddenStateValue(__navObjectPluginsPluginRecordsState, '__PLUGIN_META__', __navPluginMeta);
        __navSetHiddenStateValue(__navObjectPluginsProtoMethodsState, '__NATIVE_PLUGIN_ITEM__', __navNativePluginItem);
        __navSetHiddenStateValue(__navObjectPluginsProtoMethodsState, '__NATIVE_PLUGIN_NAMED_ITEM__', __navNativePluginNamedItem);
        __navSetHiddenStateValue(__navObjectPluginsProtoMethodsState, '__NATIVE_PLUGIN_ARRAY_ITEM__', __navNativePluginArrayItem);
        __navSetHiddenStateValue(__navObjectPluginsProtoMethodsState, '__NATIVE_PLUGIN_ARRAY_NAMED_ITEM__', __navNativePluginArrayNamedItem);
        __navSetHiddenStateValue(__navMimeTypesState, '__MIMETYPE_ARRAY_META__', __navMimeTypeArrayMeta);
        __navSetHiddenStateValue(__navMimeTypesState, '__MIME_OBJECTS_SINGLETON__', graph.mimeList);
        __navSetHiddenStateValue(__navMimeTypesState, '__MIMETYPE_ARRAY_SINGLETON__', graph.mimeArray);
        __navSetHiddenStateValue(__navMimeTypesState, '__GET_MIMETYPES_VALUE__', __navGetMimeTypesValue);
        __navSetHiddenStateValue(__navMimeTypesState, '__PROTO_METHODS_READY__', true);
        __navSetHiddenStateValue(__navMimeTypesState, '__PROTO_ACCESSORS_READY__', true);
        __navSetHiddenStateValue(__navObjectMimeTypesMimeRecordsState, '__MIMETYPE_META__', __navMimeTypeMeta);
        __navSetHiddenStateValue(__navObjectMimeTypesProtoMethodsState, '__NATIVE_MIMETYPE_ARRAY_ITEM__', __navNativeMimeTypeArrayItem);
        __navSetHiddenStateValue(__navObjectMimeTypesProtoMethodsState, '__NATIVE_MIMETYPE_ARRAY_NAMED_ITEM__', __navNativeMimeTypeArrayNamedItem);
        __navDiag('info', 'nav_total_set:plugins_ready', {
          stage: 'apply',
          type: __navTypePipeline,
          diagTag: 'nav_total_set:plugins',
          key: 'plugins',
          message: 'plugins/mimeTypes subgraph applied',
          data: {
            outcome: 'return',
            reason: 'ready',
            plugins: fakePlugins.length,
            mimeTypes: normalizedMimeCount
          }
        });
      } catch (e) {
        const reason = (e && typeof e.__navPluginsReason === 'string' && e.__navPluginsReason)
          ? e.__navPluginsReason
          : 'apply_failed';
        __navRollbackPluginsSubgraph(reason, e);
      }
    })();

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

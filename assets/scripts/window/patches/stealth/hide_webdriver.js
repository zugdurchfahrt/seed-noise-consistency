const HideWebdriverPatchModule = function HideWebdriverPatchModule(window) {
  const __MODULE = 'hide_webdriver';
  const __SURFACE = 'navigator';
  const __FERNWEH_DIAG__ = function(level, code, extra, err) {
    try {
      const G_ = (typeof globalThis !== 'undefined' && globalThis) || (typeof self !== 'undefined' && self) || (typeof window !== 'undefined' && window) || {};
      if (G_.FernwehContext && G_.FernwehContext.__logger && G_.FernwehContext.__logger.__DEGRADE__ && typeof G_.FernwehContext.__logger.__DEGRADE__.diag === 'function') {
        G_.FernwehContext.__logger.__DEGRADE__.diag(level, code, extra, err);
      } else if (G_.__loggerRoot && G_.__loggerRoot.__DEGRADE__ && typeof G_.__loggerRoot.__DEGRADE__.diag === 'function') {
        G_.__loggerRoot.__DEGRADE__.diag(level, code, extra, err);
      }
    } catch (_) {}
  };

  const G = (typeof globalThis !== 'undefined' && globalThis) || (typeof self !== 'undefined' && self) || (typeof window !== 'undefined' && window) || {};

  const __typePipeline = 'pipeline missing data';
  const __typeBrowser = 'browser structure missing data';

  const C = window.FernwehContext;
  if (!C) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'hide_webdriver:fernweh_context_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      message: 'FernwehContext missing',
      type: __typePipeline,
      data: { outcome: 'skip', reason: 'fernweh_context_missing', missing: 'FernwehContext' }
    }, new Error('[HideWebdriverPatchModule] FernwehContext missing')) : undefined);
    return;
  }
  const __stateRoot = (C.state && typeof C.state === 'object') ? C.state : null;
  if (!__stateRoot) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'hide_webdriver:fernweh_context_state_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      message: 'FernwehContext.state missing',
      type: __typePipeline,
      data: { outcome: 'skip', reason: 'fernweh_context_state_missing', missing: 'FernwehContext.state' }
    }, new Error('[HideWebdriverPatchModule] FernwehContext.state missing')) : undefined);
    return;
  }
  const __envProfileState = (__stateRoot.__ENV_PROFILE__ && typeof __stateRoot.__ENV_PROFILE__ === 'object')
    ? __stateRoot.__ENV_PROFILE__
    : null;
  const __profile = (__envProfileState && __envProfileState.profile && typeof __envProfileState.profile === 'object')
    ? __envProfileState.profile
    : null;
  const __hideWebdriverRoot = (__stateRoot.__HIDE_WEBDRIVER__ && typeof __stateRoot.__HIDE_WEBDRIVER__ === 'object')
    ? __stateRoot.__HIDE_WEBDRIVER__
    : null;
  if (!__hideWebdriverRoot) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'hide_webdriver:module_state_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      key: 'FernwehContext.state.__HIDE_WEBDRIVER__',
      message: 'FernwehContext.state.__HIDE_WEBDRIVER__ missing',
      type: __typePipeline,
      data: { outcome: 'skip', reason: 'module_state_missing', missing: 'FernwehContext.state.__HIDE_WEBDRIVER__' }
    }, new Error('[HideWebdriverPatchModule] FernwehContext.state.__HIDE_WEBDRIVER__ missing')) : undefined);
    return;
  }
  const __hideWebdriverState = (__hideWebdriverRoot.__STATE__ && typeof __hideWebdriverRoot.__STATE__ === 'object')
    ? __hideWebdriverRoot.__STATE__
    : null;
  if (!__hideWebdriverState) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'hide_webdriver:module_state_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      key: 'FernwehContext.state.__HIDE_WEBDRIVER__.__STATE__',
      message: 'FernwehContext.state.__HIDE_WEBDRIVER__.__STATE__ missing',
      type: __typePipeline,
      data: { outcome: 'skip', reason: 'module_state_missing', missing: 'FernwehContext.state.__HIDE_WEBDRIVER__.__STATE__' }
    }, new Error('[HideWebdriverPatchModule] FernwehContext.state.__HIDE_WEBDRIVER__.__STATE__ missing')) : undefined);
    return;
  }
  if (__hideWebdriverState.ready !== true) __hideWebdriverState.ready = false;
  if (!Object.prototype.hasOwnProperty.call(__hideWebdriverState, 'descriptorOwner')) __hideWebdriverState.descriptorOwner = null;
  if (!Object.prototype.hasOwnProperty.call(__hideWebdriverState, 'descriptorShape')) __hideWebdriverState.descriptorShape = null;

  const Core = window && window.Core;
  if (!Core || typeof Core.applyTargets !== 'function' || typeof Core.registerPatchedTarget !== 'function') {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'hide_webdriver:core_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      message: 'Core.applyTargets/registerPatchedTarget missing',
      type: __typePipeline,
      data: {
        outcome: 'skip',
        reason: 'core_missing',
        hasCore: !!Core,
        hasApplyTargets: !!(Core && typeof Core.applyTargets === 'function'),
        hasRegisterPatchedTarget: !!(Core && typeof Core.registerPatchedTarget === 'function')
      }
    }, new Error('[HideWebdriverPatchModule] Core.applyTargets/registerPatchedTarget missing')) : undefined);
    return;
  }

  const safeDefine = (function() {
    const sd = (Core && typeof Core.__safeDefine === 'function') ? Core.__safeDefine : null;
    if (typeof sd !== 'function') {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'hide_webdriver:safe_define_missing', { module: __MODULE, surface: __SURFACE, 
        key: 'Core.__safeDefine',
        stage: 'preflight',
        message: 'Core.__safeDefine missing',
        type: __typePipeline,
        data: { outcome: 'skip', reason: 'safe_define_missing', missing: 'Core.__safeDefine' }
      }, new Error('[HideWebdriverPatchModule] safeDefine missing')) : undefined);
      return null;
    }
    return sd;
  })();
  if (typeof safeDefine !== 'function') return;

  // ===== MODULE: canonical guard client (GuardFlag.md) =====
  const __core = Core;
  const __flagKey = '__PATCH_HIDE_WEBDRIVER__';
  const __tag = __MODULE;
  const __surface = __SURFACE;

  let __guardToken = null;
  try {
    if (!__core || typeof __core.guardFlag !== 'function') {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', __tag + ':guard_missing', { module: __MODULE, surface: __SURFACE, 
        diagTag: __tag,
        key: __flagKey,
        stage: 'guard',
        message: 'Core.guardFlag missing',
        type: __typePipeline,
        data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
      }, null) : undefined);
      return;
    }
    __guardToken = __core.guardFlag(__flagKey, __tag);
  } catch (e) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', __tag + ':guard_failed', { module: __MODULE, surface: __SURFACE, 
      diagTag: __tag,
      key: __flagKey,
      stage: 'guard',
      message: 'guardFlag threw',
      type: __typePipeline,
      data: { outcome: 'skip', reason: 'guard_failed' }
    }, e) : undefined);
    return;
  }
  if (!__guardToken) return; // already_patched: Core emits <tag>:already_patched

  try {

  const resolveDescriptor = (Core && typeof Core.resolveDescriptor === 'function')
    ? Core.resolveDescriptor
    : function fallbackResolve(owner, key) {
        if (!owner || (typeof owner !== 'object' && typeof owner !== 'function')) return { owner: null, desc: null };
        let cur = owner;
        while (cur) {
          const d = Object.getOwnPropertyDescriptor(cur, key);
          if (d) return { owner: cur, desc: d };
          cur = Object.getPrototypeOf(cur);
        }
        return { owner: owner, desc: null };
      };

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

  function isSameDescriptor(actual, expected) {
    if (!actual || !expected) return false;
    const keys = ['configurable', 'enumerable', 'writable', 'value', 'get', 'set'];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (Object.prototype.hasOwnProperty.call(expected, k) && actual[k] !== expected[k]) return false;
    }
    return true;
  }

  function applyTargetGroup(groupTag, targets, policy) {
    const groupPolicy = policy === 'throw' ? 'throw' : 'skip';
    let plans = [];
    try {
      plans = Core.applyTargets(targets, __profile, []);
    } catch (e) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':preflight_failed', { module: __MODULE, surface: __SURFACE, 
        diagTag: groupTag,
        key: null,
        stage: 'preflight',
        message: 'Core.applyTargets threw',
        type: __typePipeline,
        data: { outcome: groupPolicy === 'throw' ? 'throw' : 'skip', reason: 'preflight_failed', policy: groupPolicy }
      }, e) : undefined);
      if (groupPolicy === 'throw') {
        if (e && typeof e === 'object') { e.__rollbackOk = true; e.__stage = 'preflight'; }
        throw e;
      }
      return 0;
    }

    if (!Array.isArray(plans) || !plans.length) {
      const reason = (plans && plans.reason) ? plans.reason : 'group_skipped';
      const e = new Error('[HideWebdriverPatchModule] group skipped');
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', groupTag + ':group_skipped', { module: __MODULE, surface: __SURFACE, 
        diagTag: groupTag,
        key: null,
        stage: 'preflight',
        message: 'target group skipped',
        type: __typeBrowser,
        data: { outcome: 'skip', reason: reason, policy: groupPolicy }
      }, e) : undefined);
      return 0;
    }

    const applied = [];
    try {
      for (let i = 0; i < plans.length; i++) {
        const p = plans[i];
        if (!p || p.skipApply) continue;
        if (!p.nextDesc || !p.owner || typeof p.key !== 'string') {
          throw new Error('[HideWebdriverPatchModule] invalid plan item');
        }
        Object.defineProperty(p.owner, p.key, p.nextDesc);
        const after = Object.getOwnPropertyDescriptor(p.owner, p.key);
        if (!isSameDescriptor(after, p.nextDesc)) {
          throw new Error('[HideWebdriverPatchModule] descriptor post-check mismatch');
        }
        applied.push(p);
      }

      // Dedup/registry invariant: register only after full apply succeeds.
      for (let i = 0; i < applied.length; i++) {
        const p = applied[i];
        try {
          Core.registerPatchedTarget(p.owner, p.key);
        } catch (e) {
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', groupTag + ':registry_failed', { module: __MODULE, surface: __SURFACE, 
            diagTag: groupTag,
            key: p && p.key ? p.key : null,
            stage: 'apply',
            message: 'Core.registerPatchedTarget failed',
            type: __typePipeline,
            data: { outcome: 'skip', reason: 'registry_failed' }
          }, e) : undefined);
        }
      }

      return applied.length;
    } catch (e) {
      let rollbackErr = null;
      for (let i = applied.length - 1; i >= 0; i--) {
        const p = applied[i];
        try {
          if (p.origDesc) Object.defineProperty(p.owner, p.key, p.origDesc);
          else delete p.owner[p.key];
        } catch (re) {
          if (!rollbackErr) rollbackErr = re;
        }
      }
      if (rollbackErr) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':rollback_failed', { module: __MODULE, surface: __SURFACE, 
          diagTag: groupTag,
          key: null,
          stage: 'rollback',
          message: 'rollback failed',
          type: __typeBrowser,
          data: { outcome: 'skip', reason: 'rollback_failed', policy: groupPolicy }
        }, rollbackErr) : undefined);
      }
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':apply_failed', { module: __MODULE, surface: __SURFACE, 
        diagTag: groupTag,
        key: null,
        stage: 'apply',
        message: 'apply failed',
        type: __typeBrowser,
        data: { outcome: groupPolicy === 'throw' ? 'throw' : 'skip', reason: 'apply_failed', policy: groupPolicy, rollbackOk: !rollbackErr }
      }, e) : undefined);
      if (groupPolicy === 'throw') {
        if (e && typeof e === 'object') { e.__rollbackOk = !rollbackErr; e.__stage = 'apply'; }
        throw e;
      }
      return 0;
    }
  }

  try {
    const nav = navigator;
    const navProto = Object.getPrototypeOf(nav);
    const __isNavigatorThis = function __isNavigatorThis(self) {
      return !!self && (self === nav || (navProto && typeof navProto.isPrototypeOf === 'function' && navProto.isPrototypeOf(self)));
    };
    const wdResolved = resolveDescriptor(nav, 'webdriver', { mode: 'proto_chain' });
    if (!wdResolved || !wdResolved.desc) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'hide_webdriver:webdriver_missing', { module: __MODULE, surface: __SURFACE, 
        diagTag: 'hide_webdriver:webdriver',
        key: 'webdriver',
        stage: 'preflight',
        message: 'webdriver descriptor missing',
        type: __typeBrowser,
        data: { outcome: 'skip', reason: 'webdriver_missing', resolve: 'proto_chain' }
      }, null) : undefined);
      try {
        if (__core && typeof __core.releaseGuardFlag === 'function') {
          __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
        }
      } catch (eRelease) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', __tag + ':guard_release_failed', { module: __MODULE, surface: __SURFACE, 
          diagTag: __tag,
          key: __flagKey,
          stage: 'rollback',
          message: 'releaseGuardFlag threw on preflight skip',
          type: __typePipeline,
          data: { outcome: 'skip', reason: 'guard_release_failed' }
        }, eRelease) : undefined);
      }
      return;
    } else {
      const wdDesc = cloneDesc(wdResolved.desc);
      const wdOwner = (wdResolved && wdResolved.owner) ? wdResolved.owner : navProto;
      if (wdDesc && wdDesc.configurable === false) {
        const e = new TypeError('[HideWebdriverPatchModule] webdriver non-configurable');
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'hide_webdriver:webdriver_non_configurable', { module: __MODULE, surface: __SURFACE, 
          diagTag: 'hide_webdriver:webdriver',
          key: 'webdriver',
          stage: 'preflight',
          message: 'webdriver non-configurable',
          type: __typeBrowser,
          data: { outcome: 'skip', reason: 'webdriver_non_configurable', configurable: false }
        }, e) : undefined);
        try {
          if (__core && typeof __core.releaseGuardFlag === 'function') {
            __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
          }
        } catch (eRelease) {
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', __tag + ':guard_release_failed', { module: __MODULE, surface: __SURFACE, 
            diagTag: __tag,
            key: __flagKey,
            stage: 'rollback',
            message: 'releaseGuardFlag threw on preflight skip',
            type: __typePipeline,
            data: { outcome: 'skip', reason: 'guard_release_failed' }
          }, eRelease) : undefined);
        }
        return;
      }
      if (!wdOwner || wdOwner === nav) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'hide_webdriver:webdriver_owner_mismatch', { module: __MODULE, surface: __SURFACE, 
          diagTag: 'hide_webdriver:webdriver',
          key: 'webdriver',
          stage: 'preflight',
          message: 'webdriver resolved to instance owner',
          type: __typeBrowser,
          data: { outcome: 'skip', reason: 'instance_owner_resolved' }
        }, null) : undefined);
        try {
          if (__core && typeof __core.releaseGuardFlag === 'function') {
            __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
          }
        } catch (eRelease) {
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', __tag + ':guard_release_failed', { module: __MODULE, surface: __SURFACE, 
            diagTag: __tag,
            key: __flagKey,
            stage: 'rollback',
            message: 'releaseGuardFlag threw on preflight skip',
            type: __typePipeline,
            data: { outcome: 'skip', reason: 'guard_release_failed' }
          }, eRelease) : undefined);
        }
        return;
      }
      const wdHasValue = !!wdDesc && Object.prototype.hasOwnProperty.call(wdDesc, 'value');
      const wdHasGetter = !!wdDesc && typeof wdDesc.get === 'function';
      const wdHasSetter = !!wdDesc && typeof wdDesc.set === 'function';
      __hideWebdriverState.descriptorOwner = (wdOwner && wdOwner.constructor && wdOwner.constructor.name)
        ? wdOwner.constructor.name + '.prototype'
        : null;
      __hideWebdriverState.descriptorShape = {
        configurable: !!wdDesc.configurable,
        enumerable: !!wdDesc.enumerable,
        hasGetter: wdHasGetter,
        hasSetter: wdHasSetter,
        hasValue: wdHasValue
      };
      if (wdHasValue || !wdHasGetter || wdHasSetter) {
        const e = new TypeError('[HideWebdriverPatchModule] webdriver descriptor shape mismatch');
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'hide_webdriver:webdriver_descriptor_shape_mismatch', { module: __MODULE, surface: __SURFACE, 
          diagTag: 'hide_webdriver:webdriver',
          key: 'webdriver',
          stage: 'preflight',
          message: 'webdriver is not readonly accessor-shaped on prototype owner',
          type: __typeBrowser,
          data: {
            outcome: 'skip',
            reason: 'descriptor_shape_mismatch',
            hasValue: wdHasValue,
            hasGetter: wdHasGetter,
            hasSetter: wdHasSetter
          }
        }, e) : undefined);
        try {
          if (__core && typeof __core.releaseGuardFlag === 'function') {
            __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
          }
        } catch (eRelease) {
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', __tag + ':guard_release_failed', { module: __MODULE, surface: __SURFACE, 
            diagTag: __tag,
            key: __flagKey,
            stage: 'rollback',
            message: 'releaseGuardFlag threw on preflight skip',
            type: __typePipeline,
            data: { outcome: 'skip', reason: 'guard_release_failed' }
          }, eRelease) : undefined);
        }
        return;
      }
      let nativeWebdriverValue;
      try {
        nativeWebdriverValue = Reflect.apply(wdDesc.get, nav, []);
      } catch (eNativeRead) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'hide_webdriver:webdriver_native_read_failed', { module: __MODULE, surface: __SURFACE, 
          diagTag: 'hide_webdriver:webdriver',
          key: 'webdriver',
          stage: 'preflight',
          message: 'webdriver native getter read failed on navigator receiver',
          type: __typeBrowser,
          data: { outcome: 'skip', reason: 'native_read_failed' }
        }, eNativeRead) : undefined);
        try {
          if (__core && typeof __core.releaseGuardFlag === 'function') {
            __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
          }
        } catch (eRelease) {
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', __tag + ':guard_release_failed', { module: __MODULE, surface: __SURFACE, 
            diagTag: __tag,
            key: __flagKey,
            stage: 'rollback',
            message: 'releaseGuardFlag threw on preflight skip',
            type: __typePipeline,
            data: { outcome: 'skip', reason: 'guard_release_failed' }
          }, eRelease) : undefined);
        }
        return;
      }
      if (nativeWebdriverValue === false) {
        __hideWebdriverState.ready = true;
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', 'hide_webdriver:webdriver_native_skip', { module: __MODULE, surface: __SURFACE, 
          diagTag: 'hide_webdriver:webdriver',
          key: 'webdriver',
          stage: 'preflight',
          message: 'webdriver already matches native getter',
          type: __typeBrowser,
          data: { outcome: 'return', reason: 'native_skip' }
        }, null) : undefined);
        try {
          if (__core && typeof __core.releaseGuardFlag === 'function') {
            __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
          }
        } catch (eRelease) {
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', __tag + ':guard_release_failed', { module: __MODULE, surface: __SURFACE, 
            diagTag: __tag,
            key: __flagKey,
            stage: 'rollback',
            message: 'releaseGuardFlag threw on preflight skip',
            type: __typePipeline,
            data: { outcome: 'skip', reason: 'guard_release_failed' }
          }, eRelease) : undefined);
        }
        return;
      }
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'hide_webdriver:webdriver_no_admissible_carrier', { module: __MODULE, surface: __SURFACE, 
        diagTag: 'hide_webdriver:webdriver',
        key: 'webdriver',
        stage: 'preflight',
        message: 'webdriver native getter mismatches target and no admissible carrier is proven in current runtime path',
        type: __typeBrowser,
        data: {
          outcome: 'skip',
          reason: 'no_admissible_carrier',
          nativeValue: nativeWebdriverValue
        }
      }, null) : undefined);
      try {
        if (__core && typeof __core.releaseGuardFlag === 'function') {
          __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
        }
      } catch (eRelease) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', __tag + ':guard_release_failed', { module: __MODULE, surface: __SURFACE, 
          diagTag: __tag,
          key: __flagKey,
          stage: 'rollback',
          message: 'releaseGuardFlag threw on preflight skip',
          type: __typePipeline,
          data: { outcome: 'skip', reason: 'guard_release_failed' }
        }, eRelease) : undefined);
      }
      return;
    }
  } catch (e) {
    const stage = (e && typeof e === 'object' && typeof e.__stage === 'string') ? e.__stage : 'apply';
    const rollbackOk = !!(e && typeof e === 'object' && e.__rollbackOk === true);
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'hide_webdriver:fatal', { module: __MODULE, surface: __SURFACE, 
      diagTag: __tag,
      key: null,
      stage: stage === 'preflight' ? 'preflight' : 'apply',
      message: stage === 'preflight' ? 'preflight exception' : 'fatal error',
      type: stage === 'preflight' ? __typePipeline : __typeBrowser,
      data: { outcome: 'skip', reason: stage === 'preflight' ? 'preflight_exception' : 'fatal', rollbackOk }
    }, e) : undefined);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, rollbackOk, __tag);
      }
    } catch (eRelease) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', __tag + ':guard_release_failed', { module: __MODULE, surface: __SURFACE, 
        diagTag: __tag,
        key: __flagKey,
        stage: 'rollback',
        message: 'releaseGuardFlag threw after fatal error',
        type: __typePipeline,
        data: { outcome: 'skip', reason: 'guard_release_failed' }
      }, eRelease) : undefined);
    }
    return;
  }

  // Success: per GuardFlag policy, do not release guard on success.
  (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', 'hide_webdriver:ready', { module: __MODULE, surface: __SURFACE, 
    diagTag: __tag,
    key: 'webdriver',
    stage: 'apply',
    message: 'hide_webdriver ready',
    type: 'ok',
    data: { outcome: 'return', reason: 'ready' }
  }, null) : undefined);

  } catch (e) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'hide_webdriver:fatal_unhandled', { module: __MODULE, surface: __SURFACE, 
      diagTag: __tag,
      key: null,
      stage: 'apply',
      message: 'fatal unhandled error',
      type: __typeBrowser,
      data: { outcome: 'skip', reason: 'fatal_unhandled', rollbackOk: false }
    }, e) : undefined);
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', __tag + ':guard_release_skipped', { module: __MODULE, surface: __SURFACE, 
      diagTag: __tag,
      key: 'guard',
      stage: 'rollback',
      message: 'guard release skipped because rollback failed',
      type: __typePipeline,
      data: { outcome: 'skip', reason: 'rollback_failed', rollbackOk: false }
    }, null) : undefined);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, false, __tag);
      }
    } catch (eRelease) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', __tag + ':guard_release_failed', { module: __MODULE, surface: __SURFACE, 
        diagTag: __tag,
        key: 'guard',
        stage: 'rollback',
        message: 'releaseGuardFlag threw after fatal_unhandled',
        type: __typePipeline,
        data: { outcome: 'skip', reason: 'guard_release_failed' }
      }, eRelease) : undefined);
    }
    return;
  }
};

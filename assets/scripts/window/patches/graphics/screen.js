const ScreenPatchModule = function ScreenPatchModule(window) {
  const __MODULE = 'screen';
  const __SURFACE = 'screen';
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

  const __screenTypePipeline = 'pipeline missing data';
  const __screenTypeBrowser = 'browser structure missing data';
  const __screenModule = 'screen';
  const __core = window.Core;
  const __flagKey = '__PATCH_SCREEN__';
  
  let __guardToken = null;
  if (!__core || typeof __core.guardFlag !== 'function') {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:guard_missing', { module: __MODULE, surface: __SURFACE,
      stage: 'guard',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: 'guard',
      message: 'Core.guardFlag missing',
      data: {
        outcome: 'skip',
        reason: 'missing_dep_core_guard'
      }
    }, null) : undefined);
    return;
  }
  try {
    __guardToken = __core.guardFlag(__flagKey, __screenModule);
  } catch (e) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:guard_failed', { module: __MODULE, surface: __SURFACE,
      stage: 'guard',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: 'guard',
      message: 'guardFlag threw',
      data: {
        outcome: 'skip',
        reason: 'guard_failed'
      }
    }, e) : undefined);
    return;
  }
  if (!__guardToken) return; // already_patched: Core emits screen:already_patched

  // Read-only preflight: required dependency check, separate from guard semantics.
  const C = window.FernwehContext;
  if (!C) {
    const contextMissingErr = new Error('[FernwehContext] FernwehContext is undefined - module registration is not available');
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:fernweh_context_missing', { module: __MODULE, surface: __SURFACE,
      stage: 'preflight',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: 'FernwehContext',
      message: 'FernwehContext is undefined - module registration is not available',
      data: {
        outcome: 'skip',
        reason: 'fernweh_context_missing',
        missing: 'FernwehContext'
      }
    }, contextMissingErr) : undefined);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, true, __screenModule);
      }
    } catch (releaseErr) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:guard_release_failed', { module: __MODULE, surface: __SURFACE,
        stage: 'preflight',
        type: __screenTypePipeline,
        diagTag: 'screen',
        key: 'guard',
        message: 'guard release failed after preflight skip',
        data: {
          outcome: 'skip',
          reason: 'guard_release_failed',
          substage: 'FernwehContext'
        }
      }, releaseErr) : undefined);
    }
    return;
  }

  const __screenStateRoot = (C.state && typeof C.state === 'object') ? C.state : null;
  if (!__screenStateRoot) {
    const stateMissingErr = new Error('[FernwehContext] FernwehContext.state is undefined - module registration is not available');
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:fernweh_context_state_missing', { module: __MODULE, surface: __SURFACE,
      stage: 'preflight',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: 'FernwehContext.state',
      message: 'FernwehContext.state is undefined - module registration is not available',
      data: {
        outcome: 'skip',
        reason: 'fernweh_context_state_missing',
        missing: 'FernwehContext.state'
      }
    }, stateMissingErr) : undefined);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, true, __screenModule);
      }
    } catch (releaseErr) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:guard_release_failed', { module: __MODULE, surface: __SURFACE,
        stage: 'preflight',
        type: __screenTypePipeline,
        diagTag: 'screen',
        key: 'guard',
        message: 'guard release failed after state registration skip',
        data: {
          outcome: 'skip',
          reason: 'guard_release_failed',
          substage: 'FernwehContext.state'
        }
      }, releaseErr) : undefined);
    }
    return;
  }

  const __screenState = (__screenStateRoot.__SCREEN__ && typeof __screenStateRoot.__SCREEN__ === 'object')
    ? __screenStateRoot.__SCREEN__
    : null;

  if (!__screenState) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:screen_state_missing', { module: __MODULE, surface: __SURFACE,
      stage: 'preflight',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: 'FernwehContext.state.__SCREEN__',
      message: 'FernwehContext.state.__SCREEN__ unavailable',
      data: {
        outcome: 'skip',
        reason: 'screen_state_missing',
        missing: 'FernwehContext.state.__SCREEN__'
      }
    }, new Error('[ScreenPatch] FernwehContext.state.__SCREEN__ unavailable')) : undefined);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, true, __screenModule);
      }
    } catch (releaseErr) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:guard_release_failed', { module: __MODULE, surface: __SURFACE,
        stage: 'preflight',
        type: __screenTypePipeline,
        diagTag: 'screen',
        key: 'guard',
        message: 'guard release failed after screen state missing skip',
        data: {
          outcome: 'skip',
          reason: 'guard_release_failed',
          substage: 'FernwehContext.state.__SCREEN__'
        }
      }, releaseErr) : undefined);
    }
    return;
  }

  if (!(__screenState.__RUNTIME_STATE__ && typeof __screenState.__RUNTIME_STATE__ === 'object')) {
    Object.defineProperty(__screenState, '__RUNTIME_STATE__', {
      value: Object.create(null),
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  const __screenRuntimeState = __screenState.__RUNTIME_STATE__;
  if (!Object.prototype.hasOwnProperty.call(__screenRuntimeState, 'rollbackStack')) {
    Object.defineProperty(__screenRuntimeState, 'rollbackStack', {
      value: [],
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  if (!Object.prototype.hasOwnProperty.call(__screenRuntimeState, 'appliedGroups')) {
    Object.defineProperty(__screenRuntimeState, 'appliedGroups', {
      value: Object.create(null),
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  if (!Object.prototype.hasOwnProperty.call(__screenRuntimeState, 'mqlMatches')) {
    Object.defineProperty(__screenRuntimeState, 'mqlMatches', {
      value: (typeof WeakMap === 'function') ? new WeakMap() : null,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  if (!Object.prototype.hasOwnProperty.call(__screenRuntimeState, 'viewportMetrics')) {
    Object.defineProperty(__screenRuntimeState, 'viewportMetrics', {
      value: Object.create(null),
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  const __moduleRollbackStack = __screenRuntimeState.rollbackStack;
  const __screenAppliedGroups = __screenRuntimeState.appliedGroups;
  const __screenViewportMetrics = (__screenRuntimeState.viewportMetrics && typeof __screenRuntimeState.viewportMetrics === 'object')
    ? __screenRuntimeState.viewportMetrics
    : Object.create(null);
  if (__screenRuntimeState.viewportMetrics !== __screenViewportMetrics) {
    Object.defineProperty(__screenRuntimeState, 'viewportMetrics', {
      value: __screenViewportMetrics,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }

  // `__screenState` is verified in preflight.
  const SCREEN_WIDTH  = Number(__screenState.width);
  const SCREEN_HEIGHT = Number(__screenState.height);
  const SCREEN_AVAIL_HEIGHT = Number(__screenState.availHeight ?? SCREEN_HEIGHT);
  const COLOR_DEPTH   = Number(__screenState.colorDepth);
  const DPR           = Number(__screenState.dpr);
  const ORIENTATION_DOM = (typeof __screenState.orientationDom === 'string' && __screenState.orientationDom)
    ? __screenState.orientationDom
    : null;

  try {
  if (!Number.isFinite(SCREEN_WIDTH) || !Number.isFinite(SCREEN_HEIGHT)) {
    throw new Error('bad width/height');
  }
  if (!Number.isFinite(COLOR_DEPTH)) {
    throw new Error('bad colorDepth');
  }
  if (!Number.isFinite(DPR) || DPR <= 0) {
    throw new Error('bad dpr');
  }
  if (ORIENTATION_DOM !== 'portrait-primary' && ORIENTATION_DOM !== 'landscape-primary') {
    throw new Error('bad orientationDom');
  }

  // Avoid hardcoded numeric literals for the constant zeros/ones used by layout offsets.
  // These values are derived from existing profile-driven values.
  const ZERO = SCREEN_WIDTH - SCREEN_WIDTH;
  const ONE = DPR / DPR;

  const __coreApplyTargets = (__core && typeof __core.applyTargets === 'function')
    ? __core.applyTargets
    : null;
  if (typeof __coreApplyTargets !== 'function') {
    throw new Error('Core.applyTargets missing');
  }
  
  let __screenReceiverCheckDiagSent = false;
  function receiverMatchesTarget(target, thisArg) {
    try {
      const ctor = target && target.constructor;
      const isProto = !!(typeof ctor === 'function' && ctor.prototype === target);

      if (isProto) {
        // Brand-sensitive singletons: require the real instance, not a forged object
        // with the right prototype chain.
        const scr = window && window.screen;
        if (scr && target === Object.getPrototypeOf(scr)) {
          return thisArg === scr;
        }
        const so = scr && scr.orientation;
        if (so && target === Object.getPrototypeOf(so)) {
          return thisArg === so;
        }
        const vv = window && window.visualViewport;
        if (vv && target === Object.getPrototypeOf(vv)) {
          return thisArg === vv;
        }
        return !!(target && typeof target.isPrototypeOf === 'function' && target.isPrototypeOf(thisArg));
      }

      return !!(
        thisArg === target ||
        (target && typeof target.isPrototypeOf === 'function' && target.isPrototypeOf(thisArg))
      );
    } catch (e) {
      if (!__screenReceiverCheckDiagSent) {
        __screenReceiverCheckDiagSent = true;
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:receiver_matches_target_failed', { module: __MODULE, surface: __SURFACE,
          stage: 'apply',
          type: __screenTypeBrowser,
          diagTag: 'screen',
          key: 'receiverMatchesTarget',
          message: 'receiverMatchesTarget failed',
          data: { outcome: 'skip', reason: 'exception', substage: 'receiverMatchesTarget' }
        }, e) : undefined);
      }
      return false;
    }
  }
  function cleanupRegisteredCoreTarget(owner, key, groupTag, substage, rollbackReason) {
    const coreIsTargetRegistered = (__core && typeof __core.isTargetRegistered === 'function')
      ? __core.isTargetRegistered
      : null;
    if (typeof coreIsTargetRegistered !== 'function') {
      return true;
    }
    let registered = false;
    try {
      registered = !!coreIsTargetRegistered(owner, key);
    } catch (e) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':registry_check_failed', { module: __MODULE, surface: __SURFACE,
        stage: 'rollback',
        type: __screenTypePipeline,
        diagTag: groupTag,
        key: key || null,
        message: 'target registry status check failed',
        data: {
          outcome: 'throw',
          reason: 'registry_check_failed',
          substage: substage || 'rollback(registry_check)',
          rollbackReason: rollbackReason || 'rollback'
        }
      }, e) : undefined);
      return false;
    }
    if (!registered) {
      return true;
    }
    const registry = (__core && __core.__targetRegistry instanceof WeakMap)
      ? __core.__targetRegistry
      : null;
    if (!registry) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':registry_cleanup_failed', { module: __MODULE, surface: __SURFACE,
        stage: 'rollback',
        type: __screenTypePipeline,
        diagTag: groupTag,
        key: key || null,
        message: 'core target registry missing during rollback cleanup',
        data: {
          outcome: 'throw',
          reason: 'registry_missing',
          substage: substage || 'rollback(registry_cleanup)',
          rollbackReason: rollbackReason || 'rollback'
        }
      }, null) : undefined);
      return false;
    }
    try {
      const bucket = registry.get(owner);
      if (!bucket || typeof bucket.delete !== 'function') {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':registry_cleanup_failed', { module: __MODULE, surface: __SURFACE,
          stage: 'rollback',
          type: __screenTypePipeline,
          diagTag: groupTag,
          key: key || null,
          message: 'core target registry bucket missing during rollback cleanup',
          data: {
            outcome: 'throw',
            reason: 'registry_bucket_missing',
            substage: substage || 'rollback(registry_cleanup)',
            rollbackReason: rollbackReason || 'rollback'
          }
        }, null) : undefined);
        return false;
      }
      bucket.delete(String(key));
      if (bucket.size === ZERO) {
        registry.delete(owner);
      }
    } catch (e) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':registry_cleanup_failed', { module: __MODULE, surface: __SURFACE,
        stage: 'rollback',
        type: __screenTypePipeline,
        diagTag: groupTag,
        key: key || null,
        message: 'core target registry cleanup failed',
        data: {
          outcome: 'throw',
          reason: 'registry_cleanup_failed',
          substage: substage || 'rollback(registry_cleanup)',
          rollbackReason: rollbackReason || 'rollback'
        }
      }, e) : undefined);
      return false;
    }
    try {
      if (coreIsTargetRegistered(owner, key)) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':registry_cleanup_failed', { module: __MODULE, surface: __SURFACE,
          stage: 'rollback',
          type: __screenTypePipeline,
          diagTag: groupTag,
          key: key || null,
          message: 'core target registry cleanup incomplete',
          data: {
            outcome: 'throw',
            reason: 'registry_cleanup_incomplete',
            substage: substage || 'rollback(registry_cleanup)',
            rollbackReason: rollbackReason || 'rollback'
          }
        }, null) : undefined);
        return false;
      }
    } catch (e) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':registry_check_failed', { module: __MODULE, surface: __SURFACE,
        stage: 'rollback',
        type: __screenTypePipeline,
        diagTag: groupTag,
        key: key || null,
        message: 'target registry status re-check failed',
        data: {
          outcome: 'throw',
          reason: 'registry_check_failed',
          substage: substage || 'rollback(registry_check)',
          rollbackReason: rollbackReason || 'rollback'
        }
      }, e) : undefined);
      return false;
    }
    return true;
  }
  function applyCoreTargetsGroup(groupTag, targets, policy) {
    const groupPolicy = (policy === 'throw' || policy === 'strict') ? 'throw' : 'skip';
    let plans = [];
    let groupKey = null;
    if (Array.isArray(targets)) {
      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        if (t && typeof t.key === 'string') {
          groupKey = t.key;
          break;
        }
      }
    }
    try {
      plans = __coreApplyTargets(targets);
    } catch (e) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':preflight_failed', { module: __MODULE, surface: __SURFACE,
        stage: 'preflight',
        type: __screenTypePipeline,
        diagTag: groupTag,
        key: groupKey,
        message: 'Core.applyTargets preflight failed',
        data: {
          outcome: groupPolicy === 'throw' ? 'throw' : 'skip',
          reason: 'exception',
          substage: 'Core.applyTargets(preflight)'
        }
      }, e) : undefined);
      if (groupPolicy === 'throw') throw e;
      return 0;
    }
    if (!Array.isArray(plans) || !plans.length) {
      const reason = plans && plans.reason ? plans.reason : 'group_skipped';
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', groupTag + ':' + reason, { module: __MODULE, surface: __SURFACE,
        stage: 'preflight',
        type: __screenTypePipeline,
        diagTag: groupTag,
        key: groupKey,
        message: reason,
        data: {
          outcome: groupPolicy === 'throw' ? 'throw' : 'skip',
          reason: String(reason),
          substage: 'Core.applyTargets(plan)'
        }
      }, null) : undefined);
      if (groupPolicy === 'throw') {
        throw new Error('core plan skipped');
      }
      return 0;
    }
    const applied = [];
    try {
      for (let i = 0; i < plans.length; i++) {
        const p = plans[i];
        if (!p || p.skipApply) continue;
        if (!p.owner || typeof p.key !== 'string' || !p.nextDesc || typeof p.apply !== 'function') {
          throw new Error('invalid core plan item');
        }
        p.apply();
        applied.push(p);
      }
      const coreRegisterPatchedTarget = (__core && typeof __core.registerPatchedTarget === 'function')
        ? __core.registerPatchedTarget
        : null;
      if (typeof coreRegisterPatchedTarget === 'function') {
        for (let i = 0; i < applied.length; i++) {
          const p = applied[i];
          try {
            coreRegisterPatchedTarget(p.owner, p.key);
          } catch (registerErr) {
            (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':register_failed', { module: __MODULE, surface: __SURFACE,
              stage: 'apply',
              type: __screenTypePipeline,
              diagTag: groupTag,
              key: p.key || null,
              message: 'registerPatchedTarget failed',
              data: {
                outcome: groupPolicy === 'throw' ? 'throw' : 'skip',
                reason: 'register_failed',
                substage: 'Core.registerPatchedTarget',
                policy: groupPolicy
              }
            }, registerErr) : undefined);
            if (groupPolicy === 'throw') throw registerErr;
          }
        }
      } else {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', groupTag + ':missing_core_registerPatchedTarget', { module: __MODULE, surface: __SURFACE,
          stage: 'preflight',
          type: __screenTypePipeline,
          diagTag: groupTag,
          key: groupTag,
          message: 'Core.registerPatchedTarget missing',
          data: {
            outcome: groupPolicy === 'throw' ? 'throw' : 'skip',
            reason: 'missing_core_registerPatchedTarget',
            substage: 'Core.registerPatchedTarget',
            policy: groupPolicy
          }
        }, null) : undefined);
      }
    } catch (e) {
      let rollbackErr = null;
      for (let i = applied.length - 1; i >= 0; i--) {
        const p = applied[i];
        try {
          if (typeof p.rollback !== 'function') throw new Error('invalid core rollback plan item');
          p.rollback();
          if (!cleanupRegisteredCoreTarget(p.owner, p.key, groupTag, 'rollback(registry_cleanup)', 'apply_failed') && !rollbackErr) {
            rollbackErr = new Error('target_registry_cleanup_failed');
          }
        } catch (re) {
          if (!rollbackErr) rollbackErr = re;
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':rollback_failed', { module: __MODULE, surface: __SURFACE,
            stage: 'rollback',
            type: __screenTypeBrowser,
            diagTag: groupTag,
            key: p.key || null,
            message: 'rollback failed',
            data: {
              outcome: 'throw',
              reason: 'rollback_failed',
              substage: 'Core.applyTargets.rollback'
            }
          }, re) : undefined);
        }
      }
      if (rollbackErr) {
        throw rollbackErr;
      }
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':apply_failed', { module: __MODULE, surface: __SURFACE,
        stage: 'apply',
        type: __screenTypeBrowser,
        diagTag: groupTag,
        key: groupKey,
        message: 'apply failed',
        data: {
          outcome: groupPolicy === 'throw' ? 'throw' : 'skip',
          reason: (e && e.message) ? String(e.message) : 'apply_failed',
          substage: 'Core.applyTargets.apply'
        }
      }, e) : undefined);
      if (groupPolicy === 'throw') throw e;
      return 0;
    }
    if (applied.length) {
      const appliedSnapshot = applied.slice();
      __screenAppliedGroups[groupTag] = appliedSnapshot;
      __moduleRollbackStack.push(function rollbackCoreTargetsGroup() {
        for (let i = appliedSnapshot.length - 1; i >= 0; i--) {
          const p = appliedSnapshot[i];
          if (typeof p.rollback !== 'function') throw new Error('invalid core rollback plan item');
          p.rollback();
          cleanupRegisteredCoreTarget(p.owner, p.key, groupTag, 'rollback(module_teardown)', 'module_teardown');
        }
        delete __screenAppliedGroups[groupTag];
      });
    }
    return applied.length;
  }
  function rollbackAppliedCoreGroup(groupTag, reason) {
    const appliedSnapshot = (__screenAppliedGroups && __screenAppliedGroups[groupTag] && Array.isArray(__screenAppliedGroups[groupTag]))
      ? __screenAppliedGroups[groupTag].slice()
      : [];
    if (!appliedSnapshot.length) return true;
    let rollbackErr = null;
    for (let i = appliedSnapshot.length - 1; i >= 0; i--) {
      const p = appliedSnapshot[i];
      try {
        if (typeof p.rollback !== 'function') throw new Error('invalid core rollback plan item');
        p.rollback();
        if (!cleanupRegisteredCoreTarget(p.owner, p.key, groupTag, 'rollback(postcheck)', reason || 'postcheck_failed') && !rollbackErr) {
          rollbackErr = new Error('target_registry_cleanup_failed');
        }
      } catch (re) {
        if (!rollbackErr) rollbackErr = re;
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':rollback_failed', { module: __MODULE, surface: __SURFACE,
          stage: 'rollback',
          type: __screenTypeBrowser,
          diagTag: groupTag,
          key: p.key || null,
          message: 'rollback failed after post-check',
          data: {
            outcome: 'throw',
            reason: 'rollback_failed',
            substage: 'postcheck',
            rollbackReason: reason || 'postcheck_failed'
          }
        }, re) : undefined);
      }
    }
    delete __screenAppliedGroups[groupTag];
    if (rollbackErr) throw rollbackErr;
    return true;
  }
  function chooseTarget(obj, proto, prop) {
    if (obj && Object.getOwnPropertyDescriptor(obj, prop)) return obj;
    let cur = proto;
    while (cur && cur !== Object.prototype) {
      if (Object.getOwnPropertyDescriptor(cur, prop)) return cur;
      cur = Object.getPrototypeOf(cur);
    }
    return null;
  }
  function sameDesc(actual, expected) {
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

  const mqlMatches = __screenRuntimeState.mqlMatches || new WeakMap();
  const mqlProto = (typeof MediaQueryList !== 'undefined' && MediaQueryList.prototype) ? MediaQueryList.prototype : null;
  const mqlMatchesDesc = mqlProto ? Object.getOwnPropertyDescriptor(mqlProto, 'matches') : null;
  const mqlOrigMatchesGet = (mqlMatchesDesc && typeof mqlMatchesDesc.get === 'function') ? mqlMatchesDesc.get : null;
  if (mqlProto) {
    if (!(mqlMatchesDesc && typeof mqlMatchesDesc.get === 'function')) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:mql_matches_descriptor_missing', { module: __MODULE, surface: __SURFACE,
        stage: 'preflight',
        type: __screenTypeBrowser,
        diagTag: 'screen:mql_matches',
        key: 'matches',
        message: 'MediaQueryList.matches descriptor missing',
        data: { outcome: 'skip', reason: 'descriptor_missing' }
      }, null) : undefined);
    }
  }
  
  const __screenGroupModes = __screenRuntimeState.groupModes = {
    coordinationPatched: false,
    appliedTargets: ZERO,
    deferredViewportRetryScheduled: false,
    deferredViewportRetryUsed: false
  };
  const screenObj = window.screen;
  const screenProto = screenObj && Object.getPrototypeOf(screenObj);
  const orientationObj = screenObj && screenObj.orientation;
  const orientationProto = orientationObj && Object.getPrototypeOf(orientationObj);
  const windowProto = Object.getPrototypeOf(window);
  const visualViewportObj = window.visualViewport || null;
  const visualViewportProto = visualViewportObj && Object.getPrototypeOf(visualViewportObj);
  const mmTarget = chooseTarget(window, windowProto, 'matchMedia');
  const mmDesc = mmTarget ? Object.getOwnPropertyDescriptor(mmTarget, 'matchMedia') : null;
  const mmOrig = (mmDesc && Object.prototype.hasOwnProperty.call(mmDesc, 'value') && typeof mmDesc.value === 'function')
    ? mmDesc.value
    : null;
  let __screenMatchMediaThisCheckDiagSent = false;
  const isWindowThis = (self) => {
    try {
      return self === window;
    } catch (e) {
      if (!__screenMatchMediaThisCheckDiagSent) {
        __screenMatchMediaThisCheckDiagSent = true;
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:matchMedia_window_this_check_failed', { module: __MODULE, surface: __SURFACE,
          stage: 'apply',
          type: __screenTypeBrowser,
          diagTag: 'screen:matchMedia',
          key: 'matchMedia',
          message: 'Window receiver check failed',
          data: { outcome: 'skip', reason: 'exception', substage: 'isWindowThis' }
        }, e) : undefined);
      }
      return false;
    }
  };
  const isMatchMediaThis = (self) => (self == null) || isWindowThis(self);
  const matchMediaResolve = (mmTarget === window) ? 'own' : 'proto_chain';
  let __screenMqlMediaReadDiagSent = false;
  const matchMediaInvoke = function matchMediaInvoke(target, thisArg, argList) {
    const list = Array.isArray(argList) ? argList : [];
    if (!isMatchMediaThis(thisArg)) return Reflect.apply(target, thisArg, list);
    const effectiveThis = (thisArg == null) ? window : thisArg;
    const mql = Reflect.apply(target, effectiveThis, list);
    if (!(mql && (typeof mql === 'object' || typeof mql === 'function'))) return mql;
    let query = null;
    try {
      query = mql.media;
    } catch (e) {
      if (!__screenMqlMediaReadDiagSent) {
        __screenMqlMediaReadDiagSent = true;
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:mql_media_read_failed', { module: __MODULE, surface: __SURFACE,
          stage: 'runtime',
          type: __screenTypeBrowser,
          diagTag: 'screen:mql_media',
          key: 'media',
          message: 'MediaQueryList.media read failed',
          data: { outcome: 'skip', reason: 'exception', substage: 'mql.media' }
        }, e) : undefined);
      }
      return mql;
    }
    if (typeof query !== 'string') {
      if (!__screenMqlMediaReadDiagSent) {
        __screenMqlMediaReadDiagSent = true;
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:mql_media_invalid', { module: __MODULE, surface: __SURFACE,
          stage: 'runtime',
          type: __screenTypeBrowser,
          diagTag: 'screen:mql_media',
          key: 'media',
          message: 'MediaQueryList.media is not string',
          data: { outcome: 'skip', reason: 'invalid_media', substage: 'mql.media' }
        }, null) : undefined);
      }
      return mql;
    }
    const q = query.toLowerCase().replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s*:\s*/g, ':');
    let touched = false;
    let matches = true;
    const deviceW = q.match(/\(device-width:\s*(\d+)px\)/);
    if (deviceW) { touched = true; matches = matches && SCREEN_WIDTH === parseInt(deviceW[1], 10); }
    const deviceH = q.match(/\(device-height:\s*(\d+)px\)/);
    if (deviceH) { touched = true; matches = matches && SCREEN_HEIGHT === parseInt(deviceH[1], 10); }
    const deviceAspectRatio = q.match(/\(device-aspect-ratio:\s*(\d+)\s*\/\s*(\d+)\)/);
    if (deviceAspectRatio && typeof SCREEN_WIDTH === 'number' && typeof SCREEN_HEIGHT === 'number') {
      touched = true;
      const wInt = parseInt(deviceAspectRatio[1], 10);
      const hInt = parseInt(deviceAspectRatio[2], 10);
      matches = matches && (SCREEN_WIDTH * hInt === SCREEN_HEIGHT * wInt);
    } else if (deviceAspectRatio) {
      touched = true;
      matches = false;
    }
    const exactW = q.match(/\(width:\s*(\d+)px\)/);
    if (exactW) { touched = true; matches = matches && viewportExpected.innerWidth === parseInt(exactW[1], 10); }
    const exactH = q.match(/\(height:\s*(\d+)px\)/);
    if (exactH) { touched = true; matches = matches && viewportExpected.innerHeight === parseInt(exactH[1], 10); }
    const maxW = q.match(/\(max-width:\s*(\d+)px\)/);
    if (maxW) { touched = true; matches = matches && viewportExpected.innerWidth <= parseInt(maxW[1], 10); }
    const minW = q.match(/\(min-width:\s*(\d+)px\)/);
    if (minW) { touched = true; matches = matches && viewportExpected.innerWidth >= parseInt(minW[1], 10); }
    const maxH = q.match(/\(max-height:\s*(\d+)px\)/);
    if (maxH) { touched = true; matches = matches && viewportExpected.innerHeight <= parseInt(maxH[1], 10); }
    const minH = q.match(/\(min-height:\s*(\d+)px\)/);
    if (minH) { touched = true; matches = matches && viewportExpected.innerHeight >= parseInt(minH[1], 10); }
    const aspectRatio = q.match(/\(aspect-ratio:\s*(\d+)\s*\/\s*(\d+)\)/);
    if (aspectRatio && typeof viewportExpected.innerWidth === 'number' && typeof viewportExpected.innerHeight === 'number') {
      touched = true;
      const wInt = parseInt(aspectRatio[1], 10);
      const hInt = parseInt(aspectRatio[2], 10);
      matches = matches && (viewportExpected.innerWidth * hInt === viewportExpected.innerHeight * wInt);
    } else if (aspectRatio) {
      touched = true;
      matches = false;
    }
    const maxAspectRatio = q.match(/\(max-aspect-ratio:\s*(\d+)\s*\/\s*(\d+)\)/);
    if (maxAspectRatio) {
      touched = true;
      const wInt = parseInt(maxAspectRatio[1], 10);
      const hInt = parseInt(maxAspectRatio[2], 10);
      matches = matches && (viewportExpected.innerWidth * hInt <= viewportExpected.innerHeight * wInt);
    }
    const minAspectRatio = q.match(/\(min-aspect-ratio:\s*(\d+)\s*\/\s*(\d+)\)/);
    if (minAspectRatio) {
      touched = true;
      const wInt = parseInt(minAspectRatio[1], 10);
      const hInt = parseInt(minAspectRatio[2], 10);
      matches = matches && (viewportExpected.innerWidth * hInt >= viewportExpected.innerHeight * wInt);
    }
    const orientation = q.match(/\(orientation:\s*(portrait|landscape)\)/);
    if (orientation) {
      touched = true;
      const actual = expectedCssViewportOrientation;
      matches = matches && actual === orientation[1];
    }
    const color = q.match(/\(color:\s*(\d+)\)/);
    if (color) {
      touched = true;
      matches = matches && COLOR_DEPTH === parseInt(color[1], 10);
    }
    const resolution = q.match(/\(resolution:\s*(\d+)dpi\)/);
    if (resolution) {
      touched = true;
      const dpi = 96 * DPR;
      matches = matches && dpi === parseInt(resolution[1], 10);
    }
    const displayMode = q.match(/\(display-mode:\s*([^)]+)\)/);
    if (displayMode) {
      touched = true;
      matches = matches && displayMode[1] === 'browser';
    }
    try {
      if (touched) mqlMatches.set(mql, matches);
    } catch (e) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:mql_matches_cache_set_failed', { module: __MODULE, surface: __SURFACE,
        stage: 'runtime',
        type: __screenTypeBrowser,
        diagTag: 'screen:mql_matches',
        key: 'matches',
        message: 'MediaQueryList cache set failed',
        data: { outcome: 'skip', reason: 'exception', substage: 'mqlMatches.set' }
      }, e) : undefined);
    }
    return mql;
  };
  const matchMediaInvokeCore = function matchMediaInvokeCore(orig, args) {
    const list = Array.isArray(args) ? args : [];
    return matchMediaInvoke(orig, this, list);
  };
  function __screenReadMqlMatchesValue(mql) {
    if (mqlMatches && typeof mqlMatches.has === 'function' && mqlMatches.has(mql)) {
      return mqlMatches.get(mql);
    }
    if (typeof mqlOrigMatchesGet === 'function') {
      return Reflect.apply(mqlOrigMatchesGet, mql, []);
    }
    throw new Error('MediaQueryList.matches getter missing');
  }
  function __screenInvokeInternalMatchMedia(query) {
    if (typeof mmOrig !== 'function') throw new Error('matchMedia descriptor missing');
    return matchMediaInvoke(mmOrig, window, [query]);
  }
  const expectedOrientationType = ORIENTATION_DOM;
  const screenExpected = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    availWidth: SCREEN_WIDTH,
    availHeight: SCREEN_AVAIL_HEIGHT,
    colorDepth: COLOR_DEPTH,
    pixelDepth: COLOR_DEPTH,
    availLeft: ZERO,
    availTop: ZERO
  };
  const orientationExpected = { type: expectedOrientationType, angle: ZERO };
  const cssViewportWidth = SCREEN_WIDTH;
  const nativeInnerH = __screenReadAccessorValue(window, windowProto, 'innerHeight', window);
  const idealCssViewportHeight = (typeof nativeInnerH === 'number' && nativeInnerH > 0) ? nativeInnerH : (SCREEN_AVAIL_HEIGHT - 132);
  const cssViewportHeight = (typeof DPR === 'number' && DPR > ZERO) 
    ? Math.round(Math.ceil(idealCssViewportHeight * DPR) / DPR) 
    : idealCssViewportHeight;
  const cssVisualViewportWidth = (visualViewportObj && Number.isFinite(Number(visualViewportObj.width)) && Number(visualViewportObj.width) > ZERO)
    ? Number(visualViewportObj.width)
    : cssViewportWidth;
  const cssVisualViewportHeight = (visualViewportObj && Number.isFinite(Number(visualViewportObj.height)) && Number(visualViewportObj.height) > ZERO)
    ? Number(visualViewportObj.height)
    : cssViewportHeight;
  const viewportExpected = {
    innerWidth: cssViewportWidth,
    innerHeight: cssViewportHeight,
    visualViewportWidth: cssVisualViewportWidth,
    visualViewportHeight: cssVisualViewportHeight,
    visualViewportOffsetLeft: ZERO,
    visualViewportOffsetTop: ZERO,
    visualViewportPageLeft: ZERO,
    visualViewportPageTop: ZERO,
    visualViewportScale: ONE
  };
  const expectedCssViewportOrientation = (viewportExpected.innerWidth > viewportExpected.innerHeight)
    ? 'landscape'
    : 'portrait';
  __screenViewportMetrics.width = viewportExpected.innerWidth;
  __screenViewportMetrics.height = viewportExpected.innerHeight;
  __screenViewportMetrics.scale = viewportExpected.visualViewportScale;
  __screenViewportMetrics.owner = 'screen';
  __screenViewportMetrics.source = 'css_viewport_runtime';
  function __screenSetGroupOutcome(groupName, mode, reason) {
    if (groupName === 'display') {
      __screenGroupModes.displayMode = mode;
      __screenGroupModes.displayReason = reason;
      return;
    }
    if (groupName === 'viewport') {
      __screenGroupModes.viewportMode = mode;
      __screenGroupModes.viewportReason = reason;
      return;
    }
    if (groupName === 'hostWindow') {
      __screenGroupModes.hostWindowMode = mode;
      __screenGroupModes.hostWindowReason = reason;
    }
  }
  function __screenCloneList(list) {
    return Array.isArray(list) ? list.slice() : [];
  }
  function __screenHasVisualViewport() {
    return !!(visualViewportObj && visualViewportProto);
  }
  function __screenCurrentReadyState() {
    return (typeof document !== 'undefined' && document && typeof document.readyState === 'string')
      ? document.readyState
      : null;
  }
  function __screenSetGroupEvidence(groupName, substage, details, mismatches) {
    const safeSubstage = (typeof substage === 'string' && substage) ? substage : 'apply';
    const safeDetails = __screenCloneList(details);
    const safeMismatches = __screenCloneList(mismatches);
    if (groupName === 'display') {
      __screenGroupModes.displaySubstage = safeSubstage;
      __screenGroupModes.displayDetails = safeDetails;
      __screenGroupModes.displayMismatches = safeMismatches;
      return;
    }
    if (groupName === 'viewport') {
      __screenGroupModes.viewportSubstage = safeSubstage;
      __screenGroupModes.viewportDetails = safeDetails;
      __screenGroupModes.viewportMismatches = safeMismatches;
      return;
    }
    if (groupName === 'hostWindow') {
      __screenGroupModes.hostWindowSubstage = safeSubstage;
      __screenGroupModes.hostWindowDetails = safeDetails;
      __screenGroupModes.hostWindowMismatches = safeMismatches;
    }
  }
  function __screenAugmentData(groupName, data) {
    const out = Object.assign({}, (data && typeof data === 'object') ? data : null);
    const normalizedGroup = (typeof groupName === 'string' && groupName) ? groupName : (out.group || null);
    if (normalizedGroup != null) out.group = normalizedGroup;
    out.hasVisualViewport = __screenHasVisualViewport();
    out.documentReadyState = __screenCurrentReadyState();
    out.appliedTargets = __screenGroupModes.appliedTargets;
    return out;
  }
  function __screenDescribeAccessorSurface(owner, proto, key) {
    const target = chooseTarget(owner, proto, key);
    const desc = target ? Object.getOwnPropertyDescriptor(target, key) : null;
    return {
      key: key,
      ownerFact: target ? (target === owner ? 'own' : 'proto_chain') : 'missing',
      descriptorMissing: !desc,
      accessorShape: !!(desc && typeof desc.get === 'function' && !Object.prototype.hasOwnProperty.call(desc, 'value')),
      configurable: desc ? !!desc.configurable : null,
      enumerable: desc ? !!desc.enumerable : null
    };
  }
  function __screenDescribeMethodSurface(owner, proto, key) {
    const target = chooseTarget(owner, proto, key);
    const desc = target ? Object.getOwnPropertyDescriptor(target, key) : null;
    return {
      key: key,
      ownerFact: target ? (target === owner ? 'own' : 'proto_chain') : 'missing',
      descriptorMissing: !desc,
      methodShape: !!(desc && Object.prototype.hasOwnProperty.call(desc, 'value') && typeof desc.value === 'function'),
      configurable: desc ? !!desc.configurable : null,
      enumerable: desc ? !!desc.enumerable : null,
      writable: desc ? !!desc.writable : null
    };
  }
  function __screenReadAccessorValue(owner, proto, key, receiver) {
    const target = chooseTarget(owner, proto, key);
    if (!target) throw new Error(String(key) + ' descriptor missing');
    const desc = Object.getOwnPropertyDescriptor(target, key);
    if (!desc || typeof desc.get !== 'function') throw new Error(String(key) + ' getter missing');
    return Reflect.apply(desc.get, receiver || owner, []);
  }
  function __screenGcd(a, b) {
    let x = Math.abs(Number(a) || ZERO);
    let y = Math.abs(Number(b) || ZERO);
    while (y) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x || ONE;
  }
  function __screenAspectText(width, height) {
    const divisor = __screenGcd(width, height);
    return String(Math.round(width / divisor)) + '/' + String(Math.round(height / divisor));
  }
  const expectedDeviceAspectText = __screenAspectText(SCREEN_WIDTH, SCREEN_HEIGHT);
  function __screenClassifyMediaQueryRows(rows) {
    const list = Array.isArray(rows) ? rows : [];
    const out = [];
    for (let i = ZERO; i < list.length; i++) {
      const row = list[i];
      if (!row || typeof row !== 'object') continue;
      const mandatory = row.mandatory !== false;
      out.push({
        key: row.key,
        query: row.query,
        matches: row.matches,
        readFailed: !!row.readFailed,
        readError: row.readError,
        mandatory: mandatory
      });
    }
    return out;
  }
  function __screenHasMandatoryQueryMismatch(rows) {
    const list = Array.isArray(rows) ? rows : [];
    for (let i = ZERO; i < list.length; i++) {
      const row = list[i];
      if (!row || row.mandatory === false) continue;
      if (row.readFailed || row.matches !== true) return true;
    }
    return false;
  }
  function __screenAppendMandatoryQueryMismatches(rows, mismatches, prefix) {
    const list = Array.isArray(rows) ? rows : [];
    const target = Array.isArray(mismatches) ? mismatches : [];
    const normalizedPrefix = (typeof prefix === 'string' && prefix) ? prefix : 'matchMedia.';
    for (let i = ZERO; i < list.length; i++) {
      const row = list[i];
      if (!row || row.mandatory === false) continue;
      if (row.readFailed || row.matches !== true) {
        target.push({
          key: normalizedPrefix + row.key,
          expected: true,
          actual: row.matches,
          readFailed: !!row.readFailed
        });
      }
    }
    return target;
  }
  function __screenAppendMandatoryQueryReasons(rows, reasons, prefix) {
    const list = Array.isArray(rows) ? rows : [];
    const target = Array.isArray(reasons) ? reasons : [];
    const normalizedPrefix = (typeof prefix === 'string' && prefix) ? prefix : 'matchMedia.';
    for (let i = ZERO; i < list.length; i++) {
      const row = list[i];
      if (!row || row.mandatory === false) continue;
      if (row.readFailed || row.matches !== true) {
        target.push(normalizedPrefix + row.key + ':' + (row.readFailed ? row.readError : 'unexpected_false'));
      }
    }
    return target;
  }
  function __screenBuildAccessorTarget(owner, proto, key, valueFactory, groupTag, options) {
    const opts = options || {};
    const target = chooseTarget(owner, proto, key);
    const patchOwner = target || owner;
    const desc = patchOwner ? Object.getOwnPropertyDescriptor(patchOwner, key) : null;
    const allowCreate = !!opts.allowCreate && !desc && patchOwner === owner;
    const ownerFact = target ? (target === owner ? 'own' : 'proto_chain') : (allowCreate ? 'own_create' : 'missing');
    if (!patchOwner || (!desc && !allowCreate)) return { ok: false, reason: 'descriptor_missing', key: key, ownerFact: ownerFact };
    if (desc && (Object.prototype.hasOwnProperty.call(desc, 'value') || typeof desc.get !== 'function')) {
      return { ok: false, reason: 'kind_mismatch', key: key, ownerFact: ownerFact };
    }
    const resolve = (patchOwner === owner) ? 'own' : 'proto_chain';
    const wrapLayer = (resolve === 'own') ? 'materialized_accessor_gateway' : 'strict_accessor_gateway';
    return {
      ok: true,
      target: {
        owner: patchOwner,
        key: key,
        kind: 'accessor',
        wrapLayer: wrapLayer,
        resolve: resolve,
        policy: 'strict',
        diagTag: groupTag + ':' + String(key),
        allowCreate: allowCreate,
        configurable: allowCreate
          ? (Object.prototype.hasOwnProperty.call(opts, 'configurable') ? !!opts.configurable : true)
          : undefined,
        enumerable: allowCreate
          ? (Object.prototype.hasOwnProperty.call(opts, 'enumerable') ? !!opts.enumerable : false)
          : undefined,
        validThis(self) { return receiverMatchesTarget(patchOwner, self); },
        invalidThis: Object.prototype.hasOwnProperty.call(opts, 'invalidThis') ? opts.invalidThis : 'native',
        getImpl: function coordinatedAccessorGetImpl(origGet) {
          void origGet;
          return (typeof valueFactory === 'function') ? valueFactory.call(this, origGet) : valueFactory;
        }
      },
      ownerFact: ownerFact
    };
  }
  function __screenCollectMediaQueries(queries) {
    const list = Array.isArray(queries) ? queries : [];
    const rows = [];
    for (let i = ZERO; i < list.length; i++) {
      const entry = list[i];
      try {
        const mql = __screenInvokeInternalMatchMedia(entry.query);
        rows.push({
          key: entry.key,
          query: entry.query,
          matches: !!__screenReadMqlMatchesValue(mql),
          readFailed: false,
          mandatory: entry.mandatory !== false
        });
      } catch (e) {
        rows.push({
          key: entry.key,
          query: entry.query,
          matches: null,
          readFailed: true,
          readError: (e && e.message) ? String(e.message) : 'matchMedia_failed',
          mandatory: entry.mandatory !== false
        });
      }
    }
    return __screenClassifyMediaQueryRows(rows);
  }
  function __screenCollectDisplayQueries() {
    return __screenCollectMediaQueries([
      { key: 'device', query: '(device-width: ' + String(SCREEN_WIDTH) + 'px) and (device-height: ' + String(SCREEN_HEIGHT) + 'px)' },
      { key: 'deviceAspectRatio', query: '(device-aspect-ratio: ' + expectedDeviceAspectText + ')' },
      { key: 'displayMode', query: '(display-mode: browser)', mandatory: false }
    ]);
  }
  function __screenCollectViewportQueries() {
    const expectedViewportAspectText = __screenAspectText(viewportExpected.innerWidth, viewportExpected.innerHeight);
    return __screenCollectMediaQueries([
      { key: 'viewport', query: '(width: ' + String(viewportExpected.innerWidth) + 'px) and (height: ' + String(viewportExpected.innerHeight) + 'px)' },
      { key: 'aspectRatio', query: '(aspect-ratio: ' + expectedViewportAspectText + ')' },
      { key: 'orientation', query: '(orientation: ' + expectedCssViewportOrientation + ')' }
    ]);
  }
  function __screenDisplaySnapshot() {
    return {
      screen: {
        width: __screenReadAccessorValue(screenObj, screenProto, 'width', screenObj),
        height: __screenReadAccessorValue(screenObj, screenProto, 'height', screenObj),
        availWidth: __screenReadAccessorValue(screenObj, screenProto, 'availWidth', screenObj),
        availHeight: __screenReadAccessorValue(screenObj, screenProto, 'availHeight', screenObj),
        colorDepth: __screenReadAccessorValue(screenObj, screenProto, 'colorDepth', screenObj),
        pixelDepth: __screenReadAccessorValue(screenObj, screenProto, 'pixelDepth', screenObj),
        availLeft: __screenReadAccessorValue(screenObj, screenProto, 'availLeft', screenObj),
        availTop: __screenReadAccessorValue(screenObj, screenProto, 'availTop', screenObj)
      },
      orientation: {
        type: __screenReadAccessorValue(orientationObj, orientationProto, 'type', orientationObj),
        angle: __screenReadAccessorValue(orientationObj, orientationProto, 'angle', orientationObj)
      },
      mediaQueries: __screenCollectDisplayQueries()
    };
  }
  function __screenViewportSnapshot() {
    const htmlRoot = document.documentElement || null;
    const snapshot = {
      innerWidth: __screenReadAccessorValue(window, windowProto, 'innerWidth', window),
      innerHeight: __screenReadAccessorValue(window, windowProto, 'innerHeight', window),
      outerWidth: __screenReadAccessorValue(window, windowProto, 'outerWidth', window),
      outerHeight: __screenReadAccessorValue(window, windowProto, 'outerHeight', window),
      htmlClientWidth: htmlRoot ? htmlRoot.clientWidth : null,
      htmlClientHeight: htmlRoot ? htmlRoot.clientHeight : null,
      mediaQueries: __screenCollectViewportQueries(),
      visualViewport: null
    };
    if (visualViewportObj && visualViewportProto) {
      snapshot.visualViewport = {
        width: __screenReadAccessorValue(visualViewportObj, visualViewportProto, 'width', visualViewportObj),
        height: __screenReadAccessorValue(visualViewportObj, visualViewportProto, 'height', visualViewportObj),
        offsetLeft: __screenReadAccessorValue(visualViewportObj, visualViewportProto, 'offsetLeft', visualViewportObj),
        offsetTop: __screenReadAccessorValue(visualViewportObj, visualViewportProto, 'offsetTop', visualViewportObj),
        pageLeft: __screenReadAccessorValue(visualViewportObj, visualViewportProto, 'pageLeft', visualViewportObj),
        pageTop: __screenReadAccessorValue(visualViewportObj, visualViewportProto, 'pageTop', visualViewportObj),
        scale: __screenReadAccessorValue(visualViewportObj, visualViewportProto, 'scale', visualViewportObj)
      };
    }
    return snapshot;
  }
  function __screenCheckDisplayCoherence() {
    const snapshot = __screenDisplaySnapshot();
    const mismatches = [];
    const screenKeys = Object.keys(screenExpected);
    for (let i = ZERO; i < screenKeys.length; i++) {
      const key = screenKeys[i];
      if (!Object.is(snapshot.screen[key], screenExpected[key])) {
        mismatches.push({ key: 'screen.' + key, expected: screenExpected[key], actual: snapshot.screen[key] });
      }
    }
    if (!Object.is(snapshot.orientation.type, orientationExpected.type)) {
      mismatches.push({ key: 'screen.orientation.type', expected: orientationExpected.type, actual: snapshot.orientation.type });
    }
    if (!Object.is(snapshot.orientation.angle, orientationExpected.angle)) {
      mismatches.push({ key: 'screen.orientation.angle', expected: orientationExpected.angle, actual: snapshot.orientation.angle });
    }
    __screenAppendMandatoryQueryMismatches(snapshot.mediaQueries, mismatches, 'matchMedia.');
    return { ok: mismatches.length === ZERO, snapshot: snapshot, mismatches: mismatches };
  }
  function __screenCheckViewportCoherence() {
    const snapshot = __screenViewportSnapshot();
    const mismatches = [];
    const enforceVisualViewport = (
      __screenGroupModes.viewportSubstage === 'DOMContentLoaded' ||
      __screenGroupModes.viewportSubstage === 'deferred_late_surface_reconcile'
    );
    if (!Object.is(snapshot.innerWidth, viewportExpected.innerWidth)) {
      mismatches.push({ key: 'window.innerWidth', expected: viewportExpected.innerWidth, actual: snapshot.innerWidth });
    }
    if (!Object.is(snapshot.innerHeight, viewportExpected.innerHeight)) {
      mismatches.push({ key: 'window.innerHeight', expected: viewportExpected.innerHeight, actual: snapshot.innerHeight });
    }
    __screenAppendMandatoryQueryMismatches(snapshot.mediaQueries, mismatches, 'matchMedia.');
    if (enforceVisualViewport && snapshot.visualViewport) {
      if (!Object.is(snapshot.visualViewport.height, viewportExpected.visualViewportHeight)) mismatches.push({ key: 'visualViewport.height', expected: viewportExpected.visualViewportHeight, actual: snapshot.visualViewport.height });
      if (!Object.is(snapshot.visualViewport.offsetLeft, viewportExpected.visualViewportOffsetLeft)) mismatches.push({ key: 'visualViewport.offsetLeft', expected: viewportExpected.visualViewportOffsetLeft, actual: snapshot.visualViewport.offsetLeft });
      if (!Object.is(snapshot.visualViewport.offsetTop, viewportExpected.visualViewportOffsetTop)) mismatches.push({ key: 'visualViewport.offsetTop', expected: viewportExpected.visualViewportOffsetTop, actual: snapshot.visualViewport.offsetTop });
      if (!Object.is(snapshot.visualViewport.pageLeft, viewportExpected.visualViewportPageLeft)) mismatches.push({ key: 'visualViewport.pageLeft', expected: viewportExpected.visualViewportPageLeft, actual: snapshot.visualViewport.pageLeft });
      if (!Object.is(snapshot.visualViewport.pageTop, viewportExpected.visualViewportPageTop)) mismatches.push({ key: 'visualViewport.pageTop', expected: viewportExpected.visualViewportPageTop, actual: snapshot.visualViewport.pageTop });
      if (!Object.is(snapshot.visualViewport.scale, viewportExpected.visualViewportScale)) mismatches.push({ key: 'visualViewport.scale', expected: viewportExpected.visualViewportScale, actual: snapshot.visualViewport.scale });
    }
    return { ok: mismatches.length === ZERO, snapshot: snapshot, mismatches: mismatches };
  }
  function __screenCheckHostWindowCoherence() {
    const snapshot = {
      outerWidth: __screenReadAccessorValue(window, windowProto, 'outerWidth', window),
      outerHeight: __screenReadAccessorValue(window, windowProto, 'outerHeight', window)
    };
    const mismatches = [];
    if (!Object.is(snapshot.outerWidth, SCREEN_WIDTH)) {
      mismatches.push({ key: 'window.outerWidth', expected: SCREEN_WIDTH, actual: snapshot.outerWidth });
    }
    if (!Object.is(snapshot.outerHeight, SCREEN_AVAIL_HEIGHT)) {
      mismatches.push({ key: 'window.outerHeight', expected: SCREEN_AVAIL_HEIGHT, actual: snapshot.outerHeight });
    }
    return { ok: mismatches.length === ZERO, snapshot: snapshot, mismatches: mismatches };
  }
  const displayObserved = {
    matchMedia: __screenDescribeMethodSurface(window, windowProto, 'matchMedia'),
    screen: [],
    orientation: [],
    mediaQueries: __screenCollectDisplayQueries()
  };
  const viewportObserved = { window: [], visualViewport: [], mediaQueries: __screenCollectViewportQueries() };
  const hostWindowObserved = [];
  const hostWindowTargets = [];
  const displayReasons = [];
  const displayTargets = [];
  const viewportReasons = [];
  const hostWindowReasons = [];
  let displayAppliedCount = ZERO;
  let hostWindowAppliedCount = ZERO;
  if (!(mmDesc && Object.prototype.hasOwnProperty.call(mmDesc, 'value') && typeof mmDesc.value === 'function')) {
    displayReasons.push('matchMedia:descriptor_invalid');
  }
  const screenKeys = Object.keys(screenExpected);
  for (let i = ZERO; i < screenKeys.length; i++) {
    const key = screenKeys[i];
    const fact = __screenDescribeAccessorSurface(screenObj, screenProto, key);
    displayObserved.screen.push(fact);
    try {
      fact.actual = __screenReadAccessorValue(screenObj, screenProto, key, screenObj);
    } catch (e) {
      fact.readFailed = true;
      fact.readError = (e && e.message) ? String(e.message) : 'native_read_failed';
      displayReasons.push('screen.' + key + ':' + fact.readError);
    }
    fact.expected = screenExpected[key];
    fact.matchesExpected = !fact.readFailed && Object.is(fact.actual, fact.expected);
    if (!fact.readFailed && !fact.matchesExpected) {
      if (key === 'availHeight') {
        const targetPlanWrapper = __screenBuildAccessorTarget(
          screenObj,
          screenProto,
          key,
          fact.expected,
          'screen:display_group'
        );
        if (targetPlanWrapper.ok) {
          displayTargets.push(targetPlanWrapper.target);
        } else {
          displayReasons.push('screen.' + key + ':' + targetPlanWrapper.reason);
        }
      } else {
        displayReasons.push('screen.' + key + ':native_profile_mismatch_keep_native_getter');
      }
    }
  }
  const orientationKeys = Object.keys(orientationExpected);
  for (let i = ZERO; i < orientationKeys.length; i++) {
    const key = orientationKeys[i];
    const fact = __screenDescribeAccessorSurface(orientationObj, orientationProto, key);
    displayObserved.orientation.push(fact);
    try {
      fact.actual = __screenReadAccessorValue(orientationObj, orientationProto, key, orientationObj);
    } catch (e) {
      fact.readFailed = true;
      fact.readError = (e && e.message) ? String(e.message) : 'native_read_failed';
      displayReasons.push('screen.orientation.' + key + ':' + fact.readError);
    }
    fact.expected = orientationExpected[key];
    fact.matchesExpected = !fact.readFailed && Object.is(fact.actual, fact.expected);
    if (!fact.readFailed && !fact.matchesExpected) {
      displayReasons.push('screen.orientation.' + key + ':native_profile_mismatch_keep_native_getter');
    }
  }
  let needsMqlCoordination = false;
  needsMqlCoordination = __screenHasMandatoryQueryMismatch(displayObserved.mediaQueries);
  if (needsMqlCoordination && mmDesc && Object.prototype.hasOwnProperty.call(mmDesc, 'value') && typeof mmDesc.value === 'function') {
    displayReasons.push('matchMedia:native_public_only');
  }
  __screenAppendMandatoryQueryReasons(displayObserved.mediaQueries, displayReasons, 'matchMedia.');
  const windowKeys = ['innerWidth', 'innerHeight'];
  for (let i = ZERO; i < windowKeys.length; i++) {
    const key = windowKeys[i];
    const fact = __screenDescribeAccessorSurface(window, windowProto, key);
    viewportObserved.window.push(fact);
    try {
      fact.actual = __screenReadAccessorValue(window, windowProto, key, window);
    } catch (e) {
      fact.readFailed = true;
      fact.readError = (e && e.message) ? String(e.message) : 'native_read_failed';
      viewportReasons.push('window.' + key + ':' + fact.readError);
    }
    fact.expected = viewportExpected[key];
    fact.matchesExpected = !fact.readFailed && Object.is(fact.actual, fact.expected);
    if (!fact.readFailed && !fact.matchesExpected) {
      viewportReasons.push('window.' + key + ':' + fact.actual + '!==' + fact.expected + ':native_profile_mismatch_keep_native_getter');
    }
  }
  const hostWindowMap = [
    { key: 'outerWidth', expected: SCREEN_WIDTH },
    { key: 'outerHeight', expected: SCREEN_AVAIL_HEIGHT }
  ];
  for (let i = ZERO; i < hostWindowMap.length; i++) {
    const item = hostWindowMap[i];
    const key = item.key;
    const fact = __screenDescribeAccessorSurface(window, windowProto, key);
    hostWindowObserved.push(fact);
    try {
      fact.actual = __screenReadAccessorValue(window, windowProto, key, window);
    } catch (e) {
      fact.readFailed = true;
      fact.readError = (e && e.message) ? String(e.message) : 'native_read_failed';
      hostWindowReasons.push('window.' + key + ':' + fact.readError);
    }
    fact.expected = item.expected;
    fact.matchesExpected = !fact.readFailed && Object.is(fact.actual, item.expected);
    if (!fact.readFailed && !fact.matchesExpected) {
      const targetPlan = __screenBuildAccessorTarget(window, windowProto, key, item.expected, 'screen:host_window_group');
      if (!targetPlan.ok) hostWindowReasons.push('window.' + key + ':' + targetPlan.reason);
      else {
        hostWindowTargets.push(targetPlan.target);
      }
    }
  }
  const elementProto = (typeof Element !== 'undefined' && Element && Element.prototype) ? Element.prototype : null;
  const clientWidthDesc = elementProto ? Object.getOwnPropertyDescriptor(elementProto, 'clientWidth') : null;
  const clientHeightDesc = elementProto ? Object.getOwnPropertyDescriptor(elementProto, 'clientHeight') : null;
  if (visualViewportObj && visualViewportProto) {
    const visualViewportMap = [
      { key: 'width', expected: viewportExpected.visualViewportWidth },
      { key: 'height', expected: viewportExpected.visualViewportHeight },
      { key: 'offsetLeft', expected: viewportExpected.visualViewportOffsetLeft },
      { key: 'offsetTop', expected: viewportExpected.visualViewportOffsetTop },
      { key: 'pageLeft', expected: viewportExpected.visualViewportPageLeft },
      { key: 'pageTop', expected: viewportExpected.visualViewportPageTop },
      { key: 'scale', expected: viewportExpected.visualViewportScale }
    ];
    for (let i = ZERO; i < visualViewportMap.length; i++) {
      const item = visualViewportMap[i];
      const fact = __screenDescribeAccessorSurface(visualViewportObj, visualViewportProto, item.key);
      viewportObserved.visualViewport.push(fact);
      try {
        fact.actual = __screenReadAccessorValue(visualViewportObj, visualViewportProto, item.key, visualViewportObj);
      } catch (e) {
        fact.readFailed = true;
        fact.readError = (e && e.message) ? String(e.message) : 'native_read_failed';
        viewportReasons.push('visualViewport.' + item.key + ':' + fact.readError);
      }
      fact.expected = item.expected;
      fact.matchesExpected = !fact.readFailed && Object.is(fact.actual, item.expected);
      if (!fact.readFailed && !fact.matchesExpected) {
        viewportReasons.push('visualViewport.' + item.key + ':native_profile_mismatch_keep_native_getter');
      }
    }
  }
  if (displayTargets.length && displayReasons.length === ZERO) {
    displayAppliedCount = applyCoreTargetsGroup('screen:display_group:avail_height', displayTargets, 'strict');
    __screenGroupModes.coordinationPatched = __screenGroupModes.coordinationPatched || (displayAppliedCount > ZERO);
    __screenGroupModes.appliedTargets += displayAppliedCount;
  }
  let displayPostcheck = null;
  if (displayReasons.length === ZERO) {
    displayPostcheck = __screenCheckDisplayCoherence();
    if (!displayPostcheck.ok) {
      if (displayAppliedCount > ZERO) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'screen:coordination_postcheck_failed', { module: __MODULE, surface: __SURFACE,
          stage: 'apply',
          type: __screenTypeBrowser,
          diagTag: 'screen',
          key: 'display_group',
          message: 'display coordination post-check failed',
          data: __screenAugmentData('display', { outcome: 'rollback', reason: 'display_postcheck_failed', substage: 'apply', details: ['display_postcheck_failed'], mismatches: displayPostcheck.mismatches })
        }, null) : undefined);
        rollbackAppliedCoreGroup('screen:display_group:avail_height', 'display_postcheck_failed');
        displayAppliedCount = ZERO;
      }
      displayReasons.push('display_postcheck_failed:' + displayPostcheck.mismatches.map(function(m) { return m.key + '=' + m.actual + '!=' + m.expected; }).join(','));
    }
  }
  if (displayReasons.length === ZERO) {
    __screenSetGroupEvidence('display', 'apply', [], displayPostcheck ? displayPostcheck.mismatches : []);
    __screenSetGroupOutcome('display', displayAppliedCount > ZERO ? 'patched' : 'native_observed', displayAppliedCount > ZERO ? 'coordinated_apply' : 'native_coherent');
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', displayAppliedCount > ZERO ? 'screen:display_group_applied' : 'screen:display_group_ready', { module: __MODULE, surface: __SURFACE,
      stage: 'apply',
      type: displayAppliedCount > ZERO ? 'ok' : __screenTypePipeline,
      diagTag: 'screen',
      key: 'display_group',
      message: displayAppliedCount > ZERO ? 'display group coordinated' : 'display group already coherent',
      data: __screenAugmentData('display', { outcome: 'return', mode: __screenGroupModes.displayMode, reason: __screenGroupModes.displayReason, substage: 'apply', details: [], mismatches: displayPostcheck ? displayPostcheck.mismatches : [], applied: displayAppliedCount, snapshot: displayPostcheck ? displayPostcheck.snapshot : null })
    }, null) : undefined);
  } else {
    __screenSetGroupEvidence('display', 'apply', displayReasons, displayPostcheck ? displayPostcheck.mismatches : []);
    __screenSetGroupOutcome('display', 'skip', displayReasons[ZERO] || 'display_skipped');
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:display_group_skipped', { module: __MODULE, surface: __SURFACE,
      stage: 'preflight',
      type: __screenTypeBrowser,
      diagTag: 'screen',
      key: 'display_group',
      message: 'display group skipped',
      data: __screenAugmentData('display', { outcome: 'skip', mode: __screenGroupModes.displayMode, reason: __screenGroupModes.displayReason, substage: 'apply', observed: displayObserved, details: displayReasons, mismatches: displayPostcheck ? displayPostcheck.mismatches : [] })
    }, null) : undefined);
  }
  let viewportPostcheck = null;
  if (viewportReasons.length === ZERO) {
    viewportPostcheck = __screenCheckViewportCoherence();
    if (!viewportPostcheck.ok) {
      viewportReasons.push('viewport_postcheck_failed');
    }
  }
  if (viewportReasons.length === ZERO) {
    __screenSetGroupEvidence('viewport', 'apply', [], viewportPostcheck ? viewportPostcheck.mismatches : []);
    __screenSetGroupOutcome('viewport', 'native_observed', 'native_coherent');
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', 'screen:viewport_group_ready', { module: __MODULE, surface: __SURFACE,
      stage: 'apply',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: 'viewport_group',
      message: 'viewport group already coherent',
      data: __screenAugmentData('viewport', { outcome: 'return', mode: __screenGroupModes.viewportMode, reason: __screenGroupModes.viewportReason, substage: 'apply', details: [], mismatches: viewportPostcheck ? viewportPostcheck.mismatches : [], applied: ZERO, snapshot: viewportPostcheck ? viewportPostcheck.snapshot : null })
    }, null) : undefined);
  } else {
    __screenSetGroupEvidence('viewport', 'apply', viewportReasons, viewportPostcheck ? viewportPostcheck.mismatches : []);
    __screenSetGroupOutcome('viewport', 'skip', viewportReasons[ZERO] || 'viewport_skipped');
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:viewport_group_skipped', { module: __MODULE, surface: __SURFACE,
      stage: 'preflight',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: 'viewport_group',
      message: 'viewport group skipped',
      data: __screenAugmentData('viewport', { outcome: 'skip', mode: __screenGroupModes.viewportMode, reason: __screenGroupModes.viewportReason, substage: 'apply', observed: viewportObserved, details: viewportReasons, mismatches: viewportPostcheck ? viewportPostcheck.mismatches : [] })
    }, null) : undefined);
  }
  if (hostWindowTargets.length && hostWindowReasons.length === ZERO) {
    hostWindowAppliedCount = applyCoreTargetsGroup('screen:host_window_group', hostWindowTargets, 'strict');
    __screenGroupModes.coordinationPatched = __screenGroupModes.coordinationPatched || (hostWindowAppliedCount > ZERO);
    __screenGroupModes.appliedTargets += hostWindowAppliedCount;
  }
  let hostWindowPostcheck = null;
  if (hostWindowReasons.length === ZERO) {
    hostWindowPostcheck = __screenCheckHostWindowCoherence();
    if (!hostWindowPostcheck.ok) {
      if (hostWindowAppliedCount > ZERO) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'screen:coordination_postcheck_failed', { module: __MODULE, surface: __SURFACE,
          stage: 'apply',
          type: __screenTypeBrowser,
          diagTag: 'screen',
          key: 'host_window_group',
          message: 'host-window coordination post-check failed',
          data: __screenAugmentData('hostWindow', { outcome: 'rollback', reason: 'host_window_postcheck_failed', substage: 'apply', details: ['host_window_postcheck_failed'], mismatches: hostWindowPostcheck.mismatches })
        }, null) : undefined);
        rollbackAppliedCoreGroup('screen:host_window_group', 'host_window_postcheck_failed');
        hostWindowAppliedCount = ZERO;
      }
      hostWindowReasons.push('host_window_postcheck_failed:' + hostWindowPostcheck.mismatches.map(function(m) { return m.key + '=' + m.actual + '!=' + m.expected; }).join(','));
    }
  }
  if (hostWindowReasons.length === ZERO) {
    __screenSetGroupEvidence('hostWindow', 'apply', [], hostWindowPostcheck ? hostWindowPostcheck.mismatches : []);
    __screenSetGroupOutcome('hostWindow', hostWindowAppliedCount > ZERO ? 'patched' : 'native_observed', hostWindowAppliedCount > ZERO ? 'coordinated_apply' : 'native_coherent');
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', hostWindowAppliedCount > ZERO ? 'screen:host_window_group_applied' : 'screen:host_window_group_ready', { module: __MODULE, surface: __SURFACE,
      stage: 'apply',
      type: hostWindowAppliedCount > ZERO ? 'ok' : __screenTypePipeline,
      diagTag: 'screen',
      key: 'host_window_group',
      message: hostWindowAppliedCount > ZERO ? 'host-window group coordinated' : 'host-window group already coherent',
      data: __screenAugmentData('hostWindow', { outcome: 'return', mode: __screenGroupModes.hostWindowMode, reason: __screenGroupModes.hostWindowReason, substage: 'apply', details: [], mismatches: hostWindowPostcheck ? hostWindowPostcheck.mismatches : [], applied: hostWindowAppliedCount, snapshot: hostWindowPostcheck ? hostWindowPostcheck.snapshot : null })
    }, null) : undefined);
  } else {
    __screenSetGroupEvidence('hostWindow', 'apply', hostWindowReasons, hostWindowPostcheck ? hostWindowPostcheck.mismatches : []);
    __screenSetGroupOutcome('hostWindow', 'skip', hostWindowReasons[ZERO] || 'host_window_skipped');
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:host_window_group_skipped', { module: __MODULE, surface: __SURFACE,
      stage: 'preflight',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: 'host_window_group',
      message: 'host-window group skipped',
      data: __screenAugmentData('hostWindow', { outcome: 'skip', mode: __screenGroupModes.hostWindowMode, reason: __screenGroupModes.hostWindowReason, substage: 'apply', observed: hostWindowObserved, details: hostWindowReasons, mismatches: hostWindowPostcheck ? hostWindowPostcheck.mismatches : [] })
    }, null) : undefined);
  }

  function __screenReconcileViewportRootClients(substage) {
    const localTargets = [];
    const localReasons = [];
    const htmlRoot = document.documentElement || null;
    __screenGroupModes.viewportSubstage = substage;
    if (!htmlRoot) {
      localReasons.push('document.documentElement:missing');
    } else {
      const htmlRootMap = [
        { key: 'clientWidth', expected: viewportExpected.innerWidth },
        { key: 'clientHeight', expected: viewportExpected.innerHeight }
      ];
      for (let i = ZERO; i < htmlRootMap.length; i++) {
        const item = htmlRootMap[i];
        let actual = null;
        let readFailed = false;
        let readError = null;
        try {
          actual = htmlRoot[item.key];
        } catch (e) {
          readFailed = true;
          readError = (e && e.message) ? String(e.message) : 'native_read_failed';
        }
        if (readFailed) {
          localReasons.push('document.documentElement.' + item.key + ':' + readError);
          continue;
        }
        const matchesExpected = Object.is(actual, item.expected);
        if (!matchesExpected) {
          const protoDesc = item.key === 'clientWidth' ? clientWidthDesc : clientHeightDesc;
          const targetPlan = __screenBuildAccessorTarget(
            htmlRoot,
            null,
            item.key,
            item.expected,
            'screen:viewport_group:html',
            {
              allowCreate: true,
              invalidThis: 'throw',
              configurable: protoDesc ? !!protoDesc.configurable : true,
              enumerable: protoDesc ? !!protoDesc.enumerable : false
            }
          );
          if (!targetPlan.ok) localReasons.push('document.documentElement.' + item.key + ':' + targetPlan.reason);
          else localTargets.push(targetPlan.target);
        }
      }
    }
    const runtimeViewportQueries = __screenCollectViewportQueries();
    let needsViewportQueryCoordination = __screenHasMandatoryQueryMismatch(runtimeViewportQueries);
    if (needsViewportQueryCoordination) {
      if (!(mmDesc && Object.prototype.hasOwnProperty.call(mmDesc, 'value') && typeof mmDesc.value === 'function')) {
        localReasons.push('matchMedia:descriptor_invalid');
      }
      if (!(mqlMatchesDesc && typeof mqlMatchesDesc.get === 'function')) {
        localReasons.push('matchMedia.matches:descriptor_missing');
      } else {
        localReasons.push('matchMedia.matches:native_public_only');
        __screenAppendMandatoryQueryReasons(runtimeViewportQueries, localReasons, 'matchMedia.');
      }
    }
    if (visualViewportObj && visualViewportProto) {
      const visualViewportMap = [
        { key: 'height', expected: viewportExpected.visualViewportHeight },
        { key: 'offsetLeft', expected: viewportExpected.visualViewportOffsetLeft },
        { key: 'offsetTop', expected: viewportExpected.visualViewportOffsetTop },
        { key: 'pageLeft', expected: viewportExpected.visualViewportPageLeft },
        { key: 'pageTop', expected: viewportExpected.visualViewportPageTop },
        { key: 'scale', expected: viewportExpected.visualViewportScale }
      ];
      for (let i = ZERO; i < visualViewportMap.length; i++) {
        const item = visualViewportMap[i];
        let actual = null;
        let readFailed = false;
        let readError = null;
        try {
          actual = __screenReadAccessorValue(visualViewportObj, visualViewportProto, item.key, visualViewportObj);
        } catch (e) {
          readFailed = true;
          readError = (e && e.message) ? String(e.message) : 'native_read_failed';
        }
        if (readFailed) {
          localReasons.push('visualViewport.' + item.key + ':' + readError);
          continue;
        }
        if (!Object.is(actual, item.expected)) {
          const targetPlan = __screenBuildAccessorTarget(
            visualViewportObj,
            visualViewportProto,
            item.key,
            item.expected,
            'screen:viewport_group:visualViewport'
          );
          if (!targetPlan.ok) localReasons.push('visualViewport.' + item.key + ':' + targetPlan.reason);
          else localTargets.push(targetPlan.target);
        }
      }
    } else {
      localReasons.push('visualViewport:missing');
    }
    let applied = ZERO;
    let postcheck = null;
    if (localTargets.length && localReasons.length === ZERO) {
      applied = applyCoreTargetsGroup('screen:viewport_group:dom_ready', localTargets, 'strict');
      if (applied > ZERO) {
        __screenGroupModes.coordinationPatched = true;
        __screenGroupModes.appliedTargets += applied;
      }
    }
    if (localReasons.length === ZERO) {
      postcheck = __screenCheckViewportCoherence();
      if (!postcheck.ok) {
        if (applied > ZERO) {
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'screen:coordination_postcheck_failed', { module: __MODULE, surface: __SURFACE,
            stage: 'apply',
            type: __screenTypeBrowser,
            diagTag: 'screen',
            key: 'viewport_group',
            message: 'viewport coordination post-check failed',
            data: __screenAugmentData('viewport', { outcome: 'rollback', reason: 'viewport_postcheck_failed', substage: substage, details: ['viewport_postcheck_failed'], mismatches: postcheck.mismatches })
          }, null) : undefined);
          rollbackAppliedCoreGroup('screen:viewport_group:dom_ready', 'viewport_postcheck_failed');
          applied = ZERO;
        }
        localReasons.push('viewport_postcheck_failed:' + postcheck.mismatches.map(function(m) { return m.key + '=' + m.actual + '!=' + m.expected; }).join(','));
      }
    }
    if (localReasons.length === ZERO) {
      __screenSetGroupEvidence('viewport', substage, [], postcheck ? postcheck.mismatches : []);
      __screenSetGroupOutcome('viewport', applied > ZERO ? 'patched' : 'native_observed', applied > ZERO ? (substage === 'deferred_late_surface_reconcile' ? 'deferred_late_surface_reconcile' : 'dom_ready_reconcile') : 'native_coherent');
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', applied > ZERO ? 'screen:viewport_group_applied' : 'screen:viewport_group_ready', { module: __MODULE, surface: __SURFACE,
        stage: 'runtime',
        type: applied > ZERO ? 'ok' : __screenTypePipeline,
        diagTag: 'screen',
        key: 'viewport_group',
        message: applied > ZERO
          ? (substage === 'deferred_late_surface_reconcile' ? 'viewport group reconciled after deferred late-surface retry' : 'viewport group reconciled after DOM ready')
          : 'viewport group coherent after DOM ready',
        data: __screenAugmentData('viewport', { outcome: 'return', mode: __screenGroupModes.viewportMode, reason: __screenGroupModes.viewportReason, substage: substage, details: [], mismatches: postcheck ? postcheck.mismatches : [], applied: applied, snapshot: postcheck ? postcheck.snapshot : null })
      }, null) : undefined);
    } else {
      __screenSetGroupEvidence('viewport', substage, localReasons, postcheck ? postcheck.mismatches : []);
      __screenSetGroupOutcome('viewport', 'skip', localReasons[ZERO] || 'viewport_skipped');
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'screen:viewport_group_skipped', { module: __MODULE, surface: __SURFACE,
        stage: 'runtime',
        type: __screenTypePipeline,
        diagTag: 'screen',
        key: 'viewport_group',
        message: 'viewport group skipped after DOM ready',
        data: __screenAugmentData('viewport', { outcome: 'skip', mode: __screenGroupModes.viewportMode, reason: __screenGroupModes.viewportReason, substage: substage, details: localReasons, mismatches: postcheck ? postcheck.mismatches : [] })
      }, null) : undefined);
    }
    return { applied: applied, postcheck: postcheck, reasons: localReasons };
  }
  function __screenEmitRuntimeSummary(substage, reconcileResult) {
    const runtimeSnapshot = (
      reconcileResult &&
      reconcileResult.postcheck &&
      reconcileResult.postcheck.snapshot &&
      (!reconcileResult.reasons || reconcileResult.reasons.length === ZERO)
    ) ? reconcileResult.postcheck.snapshot : null;
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', 'screen:patched_viewport', { module: __MODULE, surface: __SURFACE,
      stage: 'runtime',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: 'viewport_group',
      message: 'runtime viewport snapshot',
      data: __screenAugmentData('viewport', {
        outcome: 'return',
        reason: 'snapshot',
        substage: substage,
        details: __screenGroupModes.viewportDetails,
        mismatches: __screenGroupModes.viewportMismatches,
        viewportGroupMode: __screenGroupModes.viewportMode,
        viewportGroupReason: __screenGroupModes.viewportReason,
        displayGroupMode: __screenGroupModes.displayMode,
        displayGroupReason: __screenGroupModes.displayReason,
        html: {
          width: runtimeSnapshot ? runtimeSnapshot.htmlClientWidth : (document.documentElement ? document.documentElement.clientWidth : null),
          height: runtimeSnapshot ? runtimeSnapshot.htmlClientHeight : (document.documentElement ? document.documentElement.clientHeight : null)
        },
        window: {
          width: runtimeSnapshot ? runtimeSnapshot.innerWidth : window.innerWidth,
          height: runtimeSnapshot ? runtimeSnapshot.innerHeight : window.innerHeight,
          outerWidth: runtimeSnapshot ? runtimeSnapshot.outerWidth : window.outerWidth,
          outerHeight: runtimeSnapshot ? runtimeSnapshot.outerHeight : window.outerHeight
        },
        screen: {
          width: window.screen.width,
          height: window.screen.height
        }
      })
    }, null) : undefined);
    const __screenCoordinationComplete = (
      __screenGroupModes.displayMode !== 'skip' &&
      __screenGroupModes.viewportMode !== 'skip' &&
      __screenGroupModes.hostWindowMode !== 'skip'
    );
    const __screenSummaryCode = __screenCoordinationComplete
      ? (__screenGroupModes.coordinationPatched ? 'screen:patches_applied' : 'screen:coordination_ready')
      : 'screen:coordination_incomplete';
    const summaryDetails = []
      .concat(__screenGroupModes.displayDetails)
      .concat(__screenGroupModes.viewportDetails)
      .concat(__screenGroupModes.hostWindowDetails);
    const summaryMismatches = []
      .concat(__screenCloneList(__screenGroupModes.displayMismatches))
      .concat(__screenCloneList(__screenGroupModes.viewportMismatches))
      .concat(__screenCloneList(__screenGroupModes.hostWindowMismatches));
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__(__screenCoordinationComplete ? 'info' : 'warn', __screenSummaryCode, { module: __MODULE, surface: __SURFACE,
      stage: 'runtime',
      type: __screenCoordinationComplete
        ? (__screenGroupModes.coordinationPatched ? 'ok' : __screenTypePipeline)
        : __screenTypeBrowser,
      diagTag: 'screen',
      key: 'screen',
      message: __screenCoordinationComplete
        ? (__screenGroupModes.coordinationPatched ? 'screen module coordinated and applied' : 'screen module completed with coherent native state')
        : 'screen module completed with incomplete coordination',
      data: __screenAugmentData('coordination', {
        outcome: 'return',
        reason: __screenCoordinationComplete
          ? (__screenGroupModes.coordinationPatched ? 'coordinated_apply' : 'coherent_native_completion')
          : 'coordination_incomplete',
        substage: substage,
        details: summaryDetails,
        mismatches: summaryMismatches,
        displayGroupMode: __screenGroupModes.displayMode,
        displayGroupReason: __screenGroupModes.displayReason,
        displayGroupSubstage: __screenGroupModes.displaySubstage,
        viewportGroupMode: __screenGroupModes.viewportMode,
        viewportGroupReason: __screenGroupModes.viewportReason,
        viewportGroupSubstage: __screenGroupModes.viewportSubstage,
        hostWindowGroupMode: __screenGroupModes.hostWindowMode,
        hostWindowGroupReason: __screenGroupModes.hostWindowReason,
        hostWindowGroupSubstage: __screenGroupModes.hostWindowSubstage,
        hostWindowObserved: hostWindowObserved
      })
    }, null) : undefined);
    return __screenCoordinationComplete;
  }
  function __screenScheduleDeferredViewportReconcile(triggerReason) {
    if (__screenGroupModes.deferredViewportRetryScheduled || __screenGroupModes.deferredViewportRetryUsed) {
      return false;
    }
    __screenGroupModes.deferredViewportRetryScheduled = true;
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', 'screen:deferred_viewport_reconcile_scheduled', { module: __MODULE, surface: __SURFACE,
      stage: 'runtime',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: 'viewport_group',
      message: 'deferred viewport reconcile scheduled',
      data: __screenAugmentData('viewport', {
        outcome: 'return',
        reason: 'deferred_reconcile_scheduled',
        substage: 'DOMContentLoaded',
        details: [triggerReason || 'viewport_incomplete_after_domcontentloaded']
      })
    }, null) : undefined);
    window.setTimeout(function runDeferredViewportReconcile() {
      __screenGroupModes.deferredViewportRetryScheduled = false;
      __screenGroupModes.deferredViewportRetryUsed = true;
      const deferredResult = __screenReconcileViewportRootClients('deferred_late_surface_reconcile');
      __screenEmitRuntimeSummary('deferred_late_surface_reconcile', deferredResult);
    }, ZERO);
    return true;
  }

  const onViewportDomReady = () => {
    const reconcileResult = __screenReconcileViewportRootClients('DOMContentLoaded');
    const __screenCoordinationComplete = __screenEmitRuntimeSummary('DOMContentLoaded', reconcileResult);
    if (!__screenCoordinationComplete) {
      const triggerReason = (reconcileResult && Array.isArray(reconcileResult.reasons) && reconcileResult.reasons.length > ZERO)
        ? String(reconcileResult.reasons[ZERO])
        : 'coordination_incomplete';
      __screenScheduleDeferredViewportReconcile(triggerReason);
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", onViewportDomReady);
    __moduleRollbackStack.push(function rollbackDomContentLoadedViewportDomReady() {
      document.removeEventListener("DOMContentLoaded", onViewportDomReady);
    });
  } else {
    onViewportDomReady();
  }
  } catch (e) {
    let rollbackErr = null;
    for (let i = __moduleRollbackStack.length - 1; i >= 0; i--) {
      try {
        __moduleRollbackStack[i]();
      } catch (re) {
        if (!rollbackErr) rollbackErr = re;
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'screen:rollback_failed', { module: __MODULE, surface: __SURFACE,
          stage: 'rollback',
          type: __screenTypeBrowser,
          diagTag: 'screen',
          key: 'screen',
          message: 'module rollback failed',
          data: {
            outcome: 'rollback',
            reason: 'rollback_failed',
            substage: 'module_catch'
          }
        }, re) : undefined);
      }
    }
    const rollbackOk = !rollbackErr;
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'screen:fatal', { module: __MODULE, surface: __SURFACE,
      stage: 'apply',
      type: __screenTypeBrowser,
      diagTag: 'screen',
      key: 'screen',
      message: 'fatal module error',
      data: {
        outcome: 'throw',
        reason: 'fatal',
        substage: 'module_try',
        rollbackOk
      }
    }, rollbackErr || e) : undefined);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, rollbackOk, __screenModule);
      }
    } catch (releaseErr) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'screen:guard_release_failed', { module: __MODULE, surface: __SURFACE,
        stage: 'rollback',
        type: __screenTypePipeline,
        diagTag: 'screen',
        key: 'guard',
        message: 'guard release failed in fatal catch',
        data: {
          outcome: 'skip',
          reason: 'guard_release_failed',
          substage: 'module_catch'
        }
      }, releaseErr) : undefined);
    }
    throw (rollbackErr || e);
  }
}
  

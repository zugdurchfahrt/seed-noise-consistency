const FontPatchModule = function FontPatchModule(window) {
  const __MODULE = 'fonts';
  const __SURFACE = 'fonts';
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

const __fontRealmBootstrap = (typeof globalThis !== 'undefined' && globalThis)
      || (typeof self       !== 'undefined' && self)
      || (typeof window     !== 'undefined' && window)
      || (typeof global     !== 'undefined' && global)
      || {};
  const __fontRealmRoot = (window && (typeof window === 'object' || typeof window === 'function'))
    ? window
    : __fontRealmBootstrap;

  const __fontTypePipeline = 'pipeline missing data';
  function __makeFontFamilySnapshot() {
    return {
      allowedFamilies: null,
      runtimeFamilies: new Set(),
      platformDom: null,
      versionToken: null
    };
  }

  function __cloneFontsStateValue(state) {
    if (!state || typeof state !== 'object') return null;
    const familySnapshot = (state.familySnapshot && typeof state.familySnapshot === 'object')
      ? state.familySnapshot
      : null;
    return {
      ready: state.ready === true,
      error: Object.prototype.hasOwnProperty.call(state, 'error') ? state.error : null,
      awaitReady: state.awaitReady || null,
      awaitReadyStatus: state.awaitReadyStatus || null,
      awaitReadyResolve: (typeof state.awaitReadyResolve === 'function') ? state.awaitReadyResolve : null,
      awaitReadyReject: (typeof state.awaitReadyReject === 'function') ? state.awaitReadyReject : null,
      familySnapshot: familySnapshot ? {
        allowedFamilies: (familySnapshot.allowedFamilies instanceof Set)
          ? new Set(familySnapshot.allowedFamilies)
          : null,
        runtimeFamilies: (familySnapshot.runtimeFamilies instanceof Set)
          ? new Set(familySnapshot.runtimeFamilies)
          : new Set(),
        platformDom: Object.prototype.hasOwnProperty.call(familySnapshot, 'platformDom')
          ? familySnapshot.platformDom
          : null,
        versionToken: Object.prototype.hasOwnProperty.call(familySnapshot, 'versionToken')
          ? familySnapshot.versionToken
          : null
      } : __makeFontFamilySnapshot()
    };
  }

  const C = (__fontRealmRoot && __fontRealmRoot.FernwehContext) || null;
  if (!C) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:canvas_patch_context_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      message: 'FernwehContext missing',
      data: { outcome: 'skip', reason: 'missing_canvas_patch_context' }
    }, null) : undefined);
    return;
  }
  const __stateRoot = (C.state && typeof C.state === 'object')
    ? C.state
    : null;
  const __envProfileState = (__stateRoot && __stateRoot.__ENV_PROFILE__ && typeof __stateRoot.__ENV_PROFILE__ === 'object')
    ? __stateRoot.__ENV_PROFILE__
    : null;
  const __envPlatformState = (__envProfileState && __envProfileState.__PLATFORM__ && typeof __envProfileState.__PLATFORM__ === 'object')
    ? __envProfileState.__PLATFORM__
    : null;
  const __profile = (__envProfileState && __envProfileState.profile && typeof __envProfileState.profile === 'object')
    ? __envProfileState.profile
    : null;
  if (!__stateRoot) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:canvas_patch_state_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      key: 'FernwehContext.state',
      message: 'FernwehContext.state missing',
      data: { outcome: 'skip', reason: 'missing_canvas_patch_state' }
    }, null) : undefined);
    return;
  }

  function __ensureFontsModuleSlot() {
    const existing = (__stateRoot.__FONTS__ && typeof __stateRoot.__FONTS__ === 'object')
      ? __stateRoot.__FONTS__
      : null;
    if (existing) return existing;
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:fonts_config_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      key: 'FernwehContext.state.__FONTS__',
      message: 'FernwehContext.state.__FONTS__ missing',
      data: { outcome: 'skip', reason: 'fonts_module_slot_missing' }
    }, null) : undefined);
    return null;
  }

  const __fontsModuleState = __ensureFontsModuleSlot();
  if (!__fontsModuleState) return;

  function __ensureFontsConfigSlot() {
    const existing = (__fontsModuleState.__CONFIG__ && typeof __fontsModuleState.__CONFIG__ === 'object')
      ? __fontsModuleState.__CONFIG__
      : null;
    if (existing) return existing;
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:fonts_config_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      key: 'FernwehContext.state.__FONTS__.__CONFIG__',
      message: 'FernwehContext.state.__FONTS__.__CONFIG__ missing',
      data: { outcome: 'skip', reason: 'fonts_config_missing' }
    }, null) : undefined);
    return null;
  }

  const __fontsConfigState = __ensureFontsConfigSlot();
  if (!__fontsConfigState) return;

  function __getFontsConfigArray() {
    return Array.isArray(__fontsConfigState.configs) ? __fontsConfigState.configs : [];
  }

  function __ensureFontsStateSlot() {
    const existing = (__fontsModuleState.__STATE__ && typeof __fontsModuleState.__STATE__ === 'object')
      ? __fontsModuleState.__STATE__
      : null;
    if (existing) return existing;
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:fonts_state_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      surface: 'FernwehContext.state.__FONTS__',
      key: 'FernwehContext.state.__FONTS__.__STATE__',
      message: 'FernwehContext.state.__FONTS__.__STATE__ missing',
      data: { outcome: 'skip', reason: 'missing_fonts_state_slot' }
    }, null) : undefined);
    return null;
  }

  const __fontsState = __ensureFontsStateSlot();
  if (!__fontsState) return;

  if (__fontsState.ready !== true) __fontsState.ready = false;
  if (!Object.prototype.hasOwnProperty.call(__fontsState, 'error')) __fontsState.error = null;
  if (!Object.prototype.hasOwnProperty.call(__fontsState, 'awaitReady')) __fontsState.awaitReady = null;
  if (!Object.prototype.hasOwnProperty.call(__fontsState, 'awaitReadyStatus')) __fontsState.awaitReadyStatus = null;
  if (!Object.prototype.hasOwnProperty.call(__fontsState, 'awaitReadyResolve')) __fontsState.awaitReadyResolve = null;
  if (!Object.prototype.hasOwnProperty.call(__fontsState, 'awaitReadyReject')) __fontsState.awaitReadyReject = null;

  const __fontFamilySnapshot = (__fontsState.familySnapshot && typeof __fontsState.familySnapshot === 'object')
    ? __fontsState.familySnapshot
    : __makeFontFamilySnapshot();
  if (!(__fontFamilySnapshot.runtimeFamilies instanceof Set)) {
    __fontFamilySnapshot.runtimeFamilies = new Set();
  }
  __fontsState.familySnapshot = __fontFamilySnapshot;

  const Core = (__fontRealmRoot && __fontRealmRoot.Core) || null;
  const __fontDocument = (__fontRealmRoot && __fontRealmRoot.document && typeof __fontRealmRoot.document === 'object')
    ? __fontRealmRoot.document
    : null;
  const __fontFallbackFontFaceSet = (__fontRealmRoot && __fontRealmRoot.fonts)
    ? __fontRealmRoot.fonts
    : null;
  const __fontFontFaceSet = (__fontDocument && __fontDocument.fonts)
    ? __fontDocument.fonts
    : __fontFallbackFontFaceSet;
  const __fontEventTarget = (__fontRealmRoot && typeof __fontRealmRoot.dispatchEvent === 'function')
    ? __fontRealmRoot
    : null;
  const __fontDomPlatform = (__envPlatformState && typeof __envPlatformState.domPlatform === 'string' && __envPlatformState.domPlatform)
    ? __envPlatformState.domPlatform
    : null;
  if (__fontDocument && __fontFallbackFontFaceSet && __fontDocument.fonts && __fontDocument.fonts !== __fontFallbackFontFaceSet) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:document_fontfaceset_anchor_mismatch', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      diagTag: 'fonts',
      key: 'document.fonts',
      message: 'document.fonts and realm fonts fallback resolved to different anchors',
      data: { outcome: 'skip', reason: 'document_fontfaceset_anchor_mismatch' }
    }, null) : undefined);
  }
  if (!Core) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:core_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      key: 'Core',
      message: 'Core missing',
      data: { outcome: 'skip', reason: 'missing_core' }
    }, null) : undefined);
    return;
  }
  if (typeof Core.applyTargets !== 'function') {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:core_apply_targets_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      key: 'Core.applyTargets',
      message: 'Core.applyTargets missing',
      data: { outcome: 'skip', reason: 'missing_core_apply_targets' }
    }, null) : undefined);
    return;
  }
  if (typeof Core.registerPatchedTarget !== 'function') {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:core_register_patched_target_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      key: 'Core.registerPatchedTarget',
      message: 'Core.registerPatchedTarget missing',
      data: { outcome: 'skip', reason: 'missing_core_register_patched_target' }
    }, null) : undefined);
    return;
  }
  if (typeof Core.resolveDescriptor !== 'function') {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:core_resolve_descriptor_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      key: 'Core.resolveDescriptor',
      message: 'Core.resolveDescriptor missing',
      data: { outcome: 'skip', reason: 'missing_core_resolve_descriptor' }
    }, null) : undefined);
    return;
  }

  function applyTargetGroup(groupTag, targets, policy) {
    const groupPolicy = policy === 'throw' ? 'throw' : 'skip';
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
    const preflightTarget = (Core && typeof Core.preflightTarget === 'function') ? Core.preflightTarget : null;
    if (typeof preflightTarget === 'function') {
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const pre = preflightTarget(target);
        if (!pre || pre.ok !== true) {
          const err = (pre && pre.error instanceof Error) ? pre.error : new Error('target preflight failed');
          const reason = pre && pre.reason ? pre.reason : 'preflight_failed';
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__(groupPolicy === 'throw' ? 'error' : 'warn', groupTag + ':target_preflight_failed', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
            stage: 'preflight',
            diagTag: groupTag,
            key: target && target.key ? target.key : null,
            message: 'target preflight failed',
            data: {
              outcome: (groupPolicy === 'throw') ? 'throw' : 'skip',
              index: i,
              reason: reason,
              kind: target && target.kind ? target.kind : null
            }
          }, err) : undefined);
          if (groupPolicy === 'throw') throw err;
          return 0;
        }
      }
    }
    let plans = [];
    try {
      plans = Core.applyTargets(targets, __profile, []);
    } catch (e) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__(groupPolicy === 'throw' ? 'error' : 'warn', groupTag + ':preflight_failed', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
        stage: 'preflight',
        diagTag: groupTag,
        key: groupKey,
        message: 'Core.applyTargets preflight failed',
        data: { outcome: (groupPolicy === 'throw') ? 'throw' : 'skip', reason: 'core_apply_targets_preflight_failed' }
      }, e) : undefined);
      if (groupPolicy === 'throw') throw e;
      return 0;
    }

    if (!Array.isArray(plans) || !plans.length) {
      if (plans && plans.ok === false) {
        const e = new Error('target group skipped');
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__(groupPolicy === 'throw' ? 'error' : 'warn', groupTag + ':group_skipped', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
          stage: 'preflight',
          diagTag: groupTag,
          key: groupKey,
          message: 'target group skipped',
          data: { outcome: 'skip', reason: plans.reason || 'group_skipped' }
        }, e) : undefined);
      } else {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', groupTag + ':group_skipped', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
          stage: 'preflight',
          diagTag: groupTag,
          key: groupKey,
          message: 'target group skipped',
          data: { outcome: 'skip', reason: 'empty_plan' }
        }, null) : undefined);
      }
      return 0;
    }

    const done = [];
    try {
      for (let i = 0; i < plans.length; i++) {
        const p = plans[i];
        if (!p || p.skipApply) continue;
        if (!p.nextDesc || !p.owner || typeof p.key !== 'string' || typeof p.apply !== 'function') {
          const e = new Error('invalid execution plan item');
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':contract_violation', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
            stage: 'contract',
            diagTag: groupTag,
            key: p && typeof p.key === 'string' ? p.key : groupKey,
            message: 'invalid execution plan item',
            data: { outcome: 'throw', reason: 'invalid_execution_plan_item' }
          }, e) : undefined);
          throw e;
        }
        p.apply();
        done.push(p);
      }
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', groupTag + ':group_applied', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
        stage: 'apply',
        diagTag: groupTag,
        key: groupKey,
        message: 'target group applied',
        data: { outcome: 'return', applied: done.length }
      }, null) : undefined);
      return done.length;
    } catch (e) {
      let rollbackErr = null;
      for (let i = done.length - 1; i >= 0; i--) {
        const p = done[i];
        try {
          if (typeof p.rollback !== 'function') throw new Error('invalid core rollback plan item');
          p.rollback();
        } catch (re) {
          if (!rollbackErr) rollbackErr = re;
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':rollback_failed', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
            stage: 'rollback',
            diagTag: groupTag,
            key: p && p.key ? p.key : groupKey,
            message: 'rollback failed',
            data: { outcome: 'rollback', reason: 'rollback_failed' }
          }, re) : undefined);
        }
      }
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__(groupPolicy === 'throw' ? 'error' : 'warn', groupTag + ':apply_failed', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
        stage: 'apply',
        diagTag: groupTag,
        key: groupKey,
        message: 'apply failed',
        data: {
          outcome: (groupPolicy === 'throw') ? 'throw' : 'skip',
          reason: 'apply_failed',
          rollbackFailed: !!rollbackErr
        }
      }, e) : undefined);
      if (groupPolicy === 'throw') throw (rollbackErr || e);
      return 0;
    }
  }

  function __restoreFontsStateValue(snapshot) {
    if (!snapshot || !__fontsState || typeof __fontsState !== 'object') return;
    __fontsState.ready = snapshot.ready === true;
    __fontsState.error = Object.prototype.hasOwnProperty.call(snapshot, 'error') ? snapshot.error : null;
    __fontsState.awaitReady = snapshot.awaitReady || null;
    __fontsState.awaitReadyStatus = snapshot.awaitReadyStatus || null;
    __fontsState.awaitReadyResolve = (typeof snapshot.awaitReadyResolve === 'function') ? snapshot.awaitReadyResolve : null;
    __fontsState.awaitReadyReject = (typeof snapshot.awaitReadyReject === 'function') ? snapshot.awaitReadyReject : null;
    const familySnapshot = (snapshot.familySnapshot && typeof snapshot.familySnapshot === 'object')
      ? snapshot.familySnapshot
      : __makeFontFamilySnapshot();
    __fontFamilySnapshot.allowedFamilies = (familySnapshot.allowedFamilies instanceof Set)
      ? new Set(familySnapshot.allowedFamilies)
      : null;
    FONTFACE_RUNTIME_FAMILIES.clear();
    if (familySnapshot.runtimeFamilies instanceof Set) {
      familySnapshot.runtimeFamilies.forEach(function restoreRuntimeFamily(fam) {
        FONTFACE_RUNTIME_FAMILIES.add(fam);
      });
    }
    __fontFamilySnapshot.runtimeFamilies = FONTFACE_RUNTIME_FAMILIES;
    __fontFamilySnapshot.platformDom = Object.prototype.hasOwnProperty.call(familySnapshot, 'platformDom')
      ? familySnapshot.platformDom
      : null;
    __fontFamilySnapshot.versionToken = Object.prototype.hasOwnProperty.call(familySnapshot, 'versionToken')
      ? familySnapshot.versionToken
      : null;
    __fontsState.familySnapshot = __fontFamilySnapshot;
  }

  function __refreshFontsEpochState() {
    if (typeof refreshFamilySnapshot === 'function') {
      return refreshFamilySnapshot();
    }
    return __fontFamilySnapshot;
  }

  function __setFontsAwaitState(promiseValue, status, resolveFn, rejectFn) {
    __fontsState.awaitReady = promiseValue || null;
    __fontsState.awaitReadyStatus = status || null;
    __fontsState.awaitReadyResolve = (typeof resolveFn === 'function') ? resolveFn : null;
    __fontsState.awaitReadyReject = (typeof rejectFn === 'function') ? rejectFn : null;
    __refreshFontsEpochState();
    return true;
  }

  function __setFontsRuntimeState(readyValue, errorValue) {
    __fontsState.ready = readyValue === true;
    __fontsState.error = (errorValue == null) ? null : errorValue;
    __refreshFontsEpochState();
  }

  const FONTFACE_RUNTIME_FAMILIES = __fontFamilySnapshot.runtimeFamilies;
  let FONTFACE_RUNTIME_SYNC_FAILED = false;

  // === Fonts module local guard (window & worker) ===
  const __core = Core;
  const __flagKey = '__PATCH_FONTS__';
  const __tag = 'fonts';
  const __surface = 'fonts';
  let __guardToken = null;
  try {
    if (!__core || typeof __core.guardFlag !== 'function') {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:guard_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
        stage: 'guard',
        diagTag: __tag,
        surface: __surface,
        key: 'guard',
        message: 'Core.guardFlag missing',
        data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
      }, null) : undefined);
      return;
    }
    __guardToken = __core.guardFlag(__flagKey, __tag);
  } catch (e) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:guard_failed', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'guard',
      diagTag: __tag,
      surface: __surface,
      key: 'guard',
      message: 'guardFlag threw',
      data: { outcome: 'skip', reason: 'guard_failed' }
    }, e) : undefined);
    return;
  }
  if (!__guardToken) return; // already_patched: Core emits fonts:already_patched

  function __releaseGuardOnSkip(stage, message, reason) {
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
      }
    } catch (eRelease) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:guard_release_failed', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
        stage: stage || 'preflight',
        diagTag: __tag,
        surface: __surface,
        key: 'guard',
        message: message,
        data: { outcome: 'skip', reason: reason || 'guard_release_failed' }
      }, eRelease) : undefined);
    }
  }

  const __rollbackSnapshot = {
    fontsStateValue: __cloneFontsStateValue(__fontsState)
  };
  let __applyStarted = false;
  try {
    if (!Array.isArray(__fontsConfigState.configs)) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:configs_missing_or_invalid', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
        stage: 'preflight',
        diagTag: 'fonts',
        key: 'FernwehContext.state.__FONTS__.__CONFIG__.configs',
        message: 'FernwehContext.state.__FONTS__.__CONFIG__.configs missing/invalid (skip font patch)',
        data: { outcome: 'skip', reason: 'configs_missing_or_invalid', typeof: typeof __fontsConfigState.configs }
      }, null) : undefined);
      __releaseGuardOnSkip('preflight', 'guard release failed after preflight skip', 'guard_release_failed');
      return;
    }
    __applyStarted = true;


  // expose awaitFontsReady only in internal fonts state
  (function exposeFontsReady(){
    const hasDocFonts = !!(__fontDocument && __fontFontFaceSet && __fontFontFaceSet.ready);

    if (hasDocFonts) {
      if (!__fontsState.awaitReady || typeof __fontsState.awaitReady.then !== 'function' || __fontsState.awaitReadyStatus !== 'pending') {
        let resolveFn, rejectFn;
        const p = new Promise((res, rej) => { resolveFn = res; rejectFn = rej; });
        __setFontsAwaitState(p, 'pending', resolveFn, rejectFn);
      }
      return;
    }
    if (__fontFontFaceSet && __fontFontFaceSet.ready && typeof __fontFontFaceSet.ready.then === 'function') {
      __setFontsAwaitState(__fontFontFaceSet.ready, 'native', null, null);
    } else {
      __setFontsAwaitState(Promise.resolve(), 'native', null, null);
    }
  })();

  function __settleAwaitFontsReady(state, payload) {
    const p = __fontsState.awaitReady;
    if (!p || typeof p.then !== 'function') return false;
    if (__fontsState.awaitReadyStatus && __fontsState.awaitReadyStatus !== 'pending') return false;
    if (state === 'resolved') {
      __fontsState.awaitReadyStatus = 'resolved';
      __refreshFontsEpochState();
      if (typeof __fontsState.awaitReadyResolve === 'function') __fontsState.awaitReadyResolve(payload);
      return true;
    }
    if (state === 'rejected') {
      __fontsState.awaitReadyStatus = 'failed';
      __refreshFontsEpochState();
      if (typeof __fontsState.awaitReadyResolve === 'function') __fontsState.awaitReadyResolve(payload);
      return true;
    }
    return false;
  }

  function __doubleRafBarrier() {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

// font -guard (must run after minimal env validation and after exposeFontsReady)
(() => {
  'use strict';

  const __fontRuntimeRoot = __fontRealmRoot;

  // FontFaceSet в текущем окружении (window/worker)
  const FFS = __fontFontFaceSet;
  if (!FFS) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:ffs_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      diagTag: 'fonts',
      key: 'FontFaceSet',
      message: 'FontFaceSet missing (skip patch)',
      data: { outcome: 'skip', reason: 'missing_fontfaceset' }
    }, null) : undefined);
    return;
  }

  const proto = Object.getPrototypeOf(FFS);
  if (!proto) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:proto_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      diagTag: 'fonts',
      key: 'FontFaceSet.prototype',
      message: 'FontFaceSet prototype missing (skip patch)',
      data: { outcome: 'skip', reason: 'missing_prototype' }
    }, null) : undefined);
    return;
  }

  const __wrapNativeCtor = (Core && typeof Core.__wrapNativeCtor === 'function')
    ? Core.__wrapNativeCtor
    : null;

  function normalizeFamilyName(family) {
    return String(family == null ? '' : family)
      .trim()
      .replace(/^["']|["']$/g, '')
      .toLowerCase();
  }

  function getPlatformScopedFontConfigs(winArg) {
    const domPlat = __fontDomPlatform;
    const cfgs = __getFontsConfigArray();
    const hasPlatformDom = cfgs.some(f => f && typeof f.platform_dom === 'string');
    const filteredCfgs = (domPlat && hasPlatformDom) ? cfgs.filter(f => f && f.platform_dom === domPlat) : cfgs;
    return {
      domPlat: domPlat,
      cfgs: filteredCfgs
    };
  }

  function buildFamilyVersionToken(domPlat, cfgs, runtimeFamilies, readyValue, awaitStatus, errorValue) {
    const parts = [domPlat || '', String(Array.isArray(cfgs) ? cfgs.length : 0)];
    const list = Array.isArray(cfgs) ? cfgs : [];
    for (let i = 0; i < list.length; i++) {
      const cfg = list[i];
      if (!cfg || typeof cfg !== 'object') continue;
      parts.push([
        normalizeFamilyName(cfg.cssFamily || ''),
        normalizeFamilyName(cfg.family || ''),
        normalizeFamilyName(cfg.full_name || ''),
        normalizeFamilyName(cfg.postscript_name || ''),
        (typeof cfg.platform_dom === 'string') ? cfg.platform_dom : '',
        (typeof cfg.style === 'string') ? cfg.style.toLowerCase() : '',
        (typeof cfg.weight === 'string') ? cfg.weight.toLowerCase() : ''
      ].join('|'));
    }
    const runtimeList = (runtimeFamilies instanceof Set)
      ? Array.from(runtimeFamilies).map(normalizeFamilyName).filter(Boolean).sort()
      : [];
    parts.push('runtime:' + String(runtimeList.length));
    if (runtimeList.length) {
      parts.push(runtimeList.join('|'));
    }
    parts.push('ready:' + String(readyValue === true ? 1 : 0));
    parts.push('await:' + String(awaitStatus || ''));
    parts.push('error:' + String(errorValue == null ? '' : 1));
    return parts.join('||');
  }

  function refreshFamilySnapshot() {
    const scoped = getPlatformScopedFontConfigs();
    __fontFamilySnapshot.allowedFamilies = new Set(
      scoped.cfgs
        .flatMap(f => [f && f.cssFamily, f && f.family].filter(Boolean))
        .map(normalizeFamilyName)
        .filter(Boolean)
    );
    __fontFamilySnapshot.platformDom = scoped.domPlat;
    __fontFamilySnapshot.runtimeFamilies = FONTFACE_RUNTIME_FAMILIES;
    __fontFamilySnapshot.versionToken = buildFamilyVersionToken(
      scoped.domPlat,
      scoped.cfgs,
      FONTFACE_RUNTIME_FAMILIES,
      __fontsState && __fontsState.ready === true,
      __fontsState ? __fontsState.awaitReadyStatus : null,
      __fontsState ? __fontsState.error : null
    );
    return __fontFamilySnapshot;
  }

  function getSharedFamilyDictionary() {
    const snapshot = refreshFamilySnapshot();
    const dict = new Set(snapshot.allowedFamilies instanceof Set ? snapshot.allowedFamilies : []);
    const runtime = snapshot.runtimeFamilies instanceof Set ? snapshot.runtimeFamilies : FONTFACE_RUNTIME_FAMILIES;
    runtime.forEach(function addRuntimeFamily(fam) {
      dict.add(fam);
    });
    return dict;
  }

  function rememberRuntimeFamily(family) {
    const normalized = normalizeFamilyName(family);
    if (normalized) {
      const before = FONTFACE_RUNTIME_FAMILIES.size;
      FONTFACE_RUNTIME_FAMILIES.add(normalized);
      if (FONTFACE_RUNTIME_FAMILIES.size !== before) {
        refreshFamilySnapshot();
      }
    }
    __fontFamilySnapshot.runtimeFamilies = FONTFACE_RUNTIME_FAMILIES;
    return normalized;
  }

  function syncRuntimeFamiliesFromFontFaceSet() {
    try {
      if (!FFS) return;
      if (typeof FFS.forEach === 'function') {
        FFS.forEach(function onFontFace(face) {
          if (face && Object.prototype.hasOwnProperty.call(face, 'family')) {
            rememberRuntimeFamily(face.family);
          } else if (face && typeof face.family !== 'undefined') {
            rememberRuntimeFamily(face.family);
          }
        });
        return;
      }
      if (typeof FFS.values === 'function') {
        const iter = FFS.values();
        if (!iter || typeof iter.next !== 'function') return;
        for (let step = iter.next(); !step.done; step = iter.next()) {
          const face = step.value;
          if (face && typeof face.family !== 'undefined') {
            rememberRuntimeFamily(face.family);
          }
        }
      }
      __fontFamilySnapshot.runtimeFamilies = FONTFACE_RUNTIME_FAMILIES;
    } catch (e) {
      if (FONTFACE_RUNTIME_SYNC_FAILED) return;
      FONTFACE_RUNTIME_SYNC_FAILED = true;
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:runtime_families_sync_failed', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
        stage: 'runtime',
        diagTag: 'fonts:fontface',
        key: 'FontFaceSet',
        message: 'runtime FontFaceSet family sync failed',
        data: { outcome: 'return', reason: 'runtime_families_sync_failed' }
      }, e) : undefined);
    }
  }

  function splitTopLevelCommaList(input) {
    const s = String(input);
    const out = [];
    let buf = '';
    let depth = 0;
    let quote = null;
    let esc = false;

    for (let i = 0; i < s.length; i++) {
      const ch = s[i];

      if (esc) {
        buf += ch;
        esc = false;
        continue;
      }

      if (quote) {
        buf += ch;
        if (ch === '\\') {
          esc = true;
        } else if (ch === quote) {
          quote = null;
        }
        continue;
      }

      if (ch === '"' || ch === "'") {
        quote = ch;
        buf += ch;
        continue;
      }

      if (ch === '(') {
        depth++;
        buf += ch;
        continue;
      }

      if (ch === ')') {
        if (depth > 0) depth--;
        buf += ch;
        continue;
      }

      if (ch === ',' && depth === 0) {
        out.push(buf.trim());
        buf = '';
        continue;
      }

      buf += ch;
    }

    if (buf.trim()) out.push(buf.trim());
    return out;
  }

  function isLocalSrcItem(item) {
    return /^\s*local\s*\(/i.test(String(item));
  }

  function isUrlSrcItem(item) {
    return /^\s*url\s*\(/i.test(String(item));
  }

  function isManagedDataSrcItem(item) {
    return /^\s*url\s*\(\s*(['"]?)data:font\/woff2;base64,/i.test(String(item));
  }

  function getRuntimeFontConfigs() {
    const snapshot = refreshFamilySnapshot();
    const scoped = getPlatformScopedFontConfigs();
    if (__fontFamilySnapshot.platformDom !== snapshot.platformDom) {
      __fontFamilySnapshot.platformDom = snapshot.platformDom;
    }
    return scoped.cfgs;
  }

  function matchRuntimeFontConfig(family, descriptors) {
    const fam = normalizeFamilyName(family);
    if (!fam) return null;
    const cfgs = getRuntimeFontConfigs();
    if (!cfgs.length) return null;
    let familyMatches = cfgs.filter(cfg =>
      normalizeFamilyName(cfg && (cfg.cssFamily || cfg.family)) === fam
    );
    if (!familyMatches.length) {
      familyMatches = cfgs.filter(cfg => (
        normalizeFamilyName(cfg && cfg.full_name) === fam ||
        normalizeFamilyName(cfg && cfg.postscript_name) === fam
      ));
    }
    if (!familyMatches.length) return null;
    const desc = (descriptors && typeof descriptors === 'object') ? descriptors : null;
    const style = desc && typeof desc.style === 'string' ? desc.style.toLowerCase() : 'normal';
    const weight = desc && typeof desc.weight === 'string' ? desc.weight.toLowerCase() : 'normal';
    for (let i = 0; i < familyMatches.length; i++) {
      const cfg = familyMatches[i];
      const cfgStyle = typeof cfg.style === 'string' ? cfg.style.toLowerCase() : 'normal';
      const cfgWeight = typeof cfg.weight === 'string' ? cfg.weight.toLowerCase() : 'normal';
      if (cfgStyle === style && cfgWeight === weight) {
        return cfg;
      }
    }
    return null;
  }

  function sanitizeFontFaceSource(source, family, descriptors) {
    const resultBase = {
      source: source,
      hadLocal: false,
      hadOnlyLocal: false,
      localOnlyBlocked: false,
      localOnlyManaged: false,
      localOnlyPassthrough: false,
      unexpectedSourceType: false,
      runtimeConfigMatched: false,
      sanitizeFailed: false,
      sanitizeReason: null
    };
    if (typeof source !== 'string') {
      return resultBase;
    }

    let parts;
    try {
      parts = splitTopLevelCommaList(source);
    } catch (e) {
      return Object.assign({}, resultBase, {
        sanitizeFailed: true,
        sanitizeReason: 'split_src_list_failed'
      });
    }
    const filtered = [];
    let hadLocal = false;
    let unexpectedSourceType = false;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!isLocalSrcItem(part) && (!isUrlSrcItem(part) || !isManagedDataSrcItem(part))) {
        unexpectedSourceType = true;
      }
    }

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (isLocalSrcItem(part)) {
        hadLocal = true;
        continue;
      }
      filtered.push(part);
    }

    if (!hadLocal) {
      return Object.assign({}, resultBase, {
        hadLocal: false,
        hadOnlyLocal: false,
        localOnlyPassthrough: false,
        unexpectedSourceType: unexpectedSourceType,
        runtimeConfigMatched: false
      });
    }

    let matchedCfg = null;
    let managedSource = null;
    try {
      matchedCfg = matchRuntimeFontConfig(family, descriptors);
      const matchedUrl = matchedCfg && typeof matchedCfg.url === 'string' ? matchedCfg.url : '';
      if (/^data:font\/woff2;base64,/i.test(matchedUrl)) {
        managedSource = `url(${JSON.stringify(matchedUrl)}) format("woff2")`;
      }
    } catch (e) {
      return Object.assign({}, resultBase, {
        hadLocal: true,
        hadOnlyLocal: filtered.length === 0,
        sanitizeFailed: true,
        sanitizeReason: 'runtime_family_match_failed',
        unexpectedSourceType: unexpectedSourceType
      });
    }

    if (!filtered.length) {
      return Object.assign({}, resultBase, {
        source: managedSource || source,
        hadLocal: true,
        hadOnlyLocal: true,
        localOnlyBlocked: false,
        localOnlyManaged: !!managedSource,
        localOnlyPassthrough: !managedSource,
        unexpectedSourceType: unexpectedSourceType,
        runtimeConfigMatched: !!matchedCfg
      });
    }

    return Object.assign({}, resultBase, {
      source: filtered.join(', '),
      hadLocal: true,
      hadOnlyLocal: false,
      localOnlyPassthrough: false,
      unexpectedSourceType: unexpectedSourceType,
      runtimeConfigMatched: !!matchedCfg
    });
  }

  function extractFamiliesFromFontShorthand(fontValue) {
    const s = String(fontValue || '').trim();
    if (!s) return [];

    const sizeRe = /\b\d+(?:\.\d+)?(?:px|pt|pc|em|rem|ex|ch|lh|rlh|vw|vh|vmin|vmax|%)\b/i;
    const m = sizeRe.exec(s);
    if (!m) return [];

    let tail = s.slice(m.index + m[0].length).trim();
    if (tail.startsWith('/')) {
      tail = tail.slice(1).trim();
      const firstSpace = tail.search(/\s/);
      tail = firstSpace === -1 ? '' : tail.slice(firstSpace).trim();
    }

    if (!tail) return [];
    return splitTopLevelCommaList(tail)
      .map(normalizeFamilyName)
      .filter(Boolean);
  }

  const NativeFontFace = (__fontRuntimeRoot && typeof __fontRuntimeRoot.FontFace === 'function') ? __fontRuntimeRoot.FontFace : null;
  if (!NativeFontFace) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:fontface_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      diagTag: 'fonts:fontface',
      key: 'FontFace',
      message: 'FontFace missing (skip constructor patch)',
      data: { outcome: 'skip', reason: 'missing_fontface' }
    }, null) : undefined);
  } else if (typeof __wrapNativeCtor !== 'function') {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:wrap_native_ctor_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      diagTag: 'fonts:fontface',
      key: 'Core.__wrapNativeCtor',
      message: 'Core.__wrapNativeCtor missing (skip constructor patch)',
      data: { outcome: 'skip', reason: 'missing_wrap_native_ctor' }
    }, null) : undefined);
  } else {
    let WrappedFontFace = null;
    try {
      WrappedFontFace = __wrapNativeCtor(NativeFontFace, 'FontFace', function patchFontFaceArgs(argList) {
        const nextArgs = Array.isArray(argList) ? argList.slice() : [];
        if (nextArgs.length < 2) return nextArgs;
        try {
          const sanitized = sanitizeFontFaceSource(nextArgs[1], nextArgs[0], nextArgs[2]);
          nextArgs[1] = sanitized.source;
          if (sanitized.sanitizeFailed) {
            (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:fontface:sanitize_parser_failed', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
              stage: 'runtime',
              diagTag: 'fonts:fontface',
              key: 'FontFace',
              message: 'FontFace source sanitization parser-path failed',
              data: {
                outcome: 'return',
                reason: sanitized.sanitizeReason || 'sanitize_parser_failed',
                family: (typeof nextArgs[0] === 'string') ? nextArgs[0] : null
              }
            }, null) : undefined);
            return nextArgs;
          }
          if (sanitized.unexpectedSourceType) {
            (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:fontface:unexpected_source_type', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
              stage: 'runtime',
              diagTag: 'fonts:fontface',
              key: 'FontFace',
              message: 'FontFace source type is unexpected for runtime managed-font policy',
              data: {
                outcome: 'return',
                reason: 'unexpected_source_type',
                family: (typeof nextArgs[0] === 'string') ? nextArgs[0] : null,
                runtimeConfigMatched: !!sanitized.runtimeConfigMatched
              }
            }, null) : undefined);
          }
          if (sanitized.localOnlyManaged) {
            (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', 'fonts:fontface:local_only_replaced_with_managed_src', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
              stage: 'runtime',
              diagTag: 'fonts:fontface',
              key: 'FontFace',
              message: 'FontFace local-only source replaced with managed data src',
              isAccess: true,
              data: {
                outcome: 'return',
                reason: 'local_only_replaced_with_managed_src',
                family: (typeof nextArgs[0] === 'string') ? nextArgs[0] : null,
                runtimeConfigMatched: !!sanitized.runtimeConfigMatched
              }
            }, null) : undefined);
          }
          if (sanitized.localOnlyPassthrough) {
            (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:fontface:local_only_passthrough_not_proven', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
              stage: 'runtime',
              diagTag: 'fonts:fontface',
              key: 'FontFace',
              message: 'FontFace local-only source kept as native (not proven)',
              isAccess: true,
              data: {
                outcome: 'return',
                reason: 'local_only_passthrough_not_proven',
                family: (typeof nextArgs[0] === 'string') ? nextArgs[0] : null,
                runtimeConfigMatched: !!sanitized.runtimeConfigMatched
              }
            }, null) : undefined);
          }
          return nextArgs;
        } catch (e) {
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:fontface:sanitize_unexpected_failed', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
            stage: 'runtime',
            diagTag: 'fonts:fontface',
            key: 'FontFace',
            message: 'FontFace source sanitization failed unexpectedly',
            data: { outcome: 'return', reason: 'sanitize_unexpected_failed' }
          }, e) : undefined);
          return nextArgs;
        }
      });
      const ctorProtoMismatch = Object.prototype.hasOwnProperty.call(NativeFontFace, 'prototype') && WrappedFontFace.prototype !== NativeFontFace.prototype;
      const ctorChainMismatch = Object.getPrototypeOf(WrappedFontFace) !== Object.getPrototypeOf(NativeFontFace);
      if (typeof WrappedFontFace !== 'function' || ctorProtoMismatch || ctorChainMismatch) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:wrap_native_ctor_contract_violation', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
          stage: 'contract',
          diagTag: 'fonts:fontface',
          key: 'FontFace',
          message: 'Core.__wrapNativeCtor returned invalid constructor surface',
          data: { outcome: 'skip', reason: 'invalid_wrap_native_ctor_surface' }
        }, new Error('invalid wrap native ctor surface')) : undefined);
        WrappedFontFace = null;
      }
    } catch (e) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:fontface:wrap_failed', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
        stage: 'apply',
        diagTag: 'fonts:fontface',
        key: 'FontFace',
        message: 'FontFace wrap failed',
        data: { outcome: 'skip', reason: 'wrap_failed' }
      }, e) : undefined);
    }
    if (WrappedFontFace) {
      let __fontFaceOwner = null;
      try {
        const __fontFaceResolved = Core.resolveDescriptor(__fontRuntimeRoot, 'FontFace', { mode: 'own' });
        __fontFaceOwner = (__fontFaceResolved && __fontFaceResolved.owner) ? __fontFaceResolved.owner : null;
      } catch (e) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:fontface:resolve_owner_failed', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
          stage: 'preflight',
          diagTag: 'fonts:fontface',
          key: 'FontFace',
          message: 'FontFace owner resolution failed',
          data: { outcome: 'skip', reason: 'resolve_owner_failed' }
        }, e) : undefined);
      }
      if (!__fontFaceOwner) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:fontface:owner_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
          stage: 'preflight',
          diagTag: 'fonts:fontface',
          key: 'FontFace',
          message: 'FontFace resolved owner missing',
          data: { outcome: 'skip', reason: 'resolved_owner_missing' }
        }, null) : undefined);
      } else {
      applyTargetGroup('fonts:data:fontface', [{
        owner: __fontFaceOwner,
        key: 'FontFace',
        kind: 'data',
        wrapLayer: 'descriptor_only',
        resolve: 'own',
        value: WrappedFontFace,
        policy: 'skip',
        diagTag: 'fonts:data:fontface'
      }], 'skip');
      }
    }
  }

  function isFontFaceSetThis(self) {
    try {
      if (!self) return false;
      if (self === FFS) return true;
      return !!(proto && typeof proto.isPrototypeOf === 'function' && proto.isPrototypeOf(self));
    } catch (e) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:fontfaceset:this_check_failed', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
        stage: 'guard',
        diagTag: 'fonts:fontfaceset',
        key: 'FontFaceSet',
        message: 'FontFaceSet receiver check failed',
        data: { outcome: 'return', reason: 'this_check_failed' }
      }, e) : undefined);
      return false;
    }
  }

  // accessor group: ready
  applyTargetGroup('fonts:accessor', [{
    owner: proto,
    key: 'ready',
    kind: 'accessor',
    wrapLayer: 'named_wrapper',
    policy: 'skip',
    diagTag: 'fonts:accessor:ready',
    getImpl(origGet) {
      try {
        return Reflect.apply(origGet, this, []);
      } catch (e) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:accessor:ready:native_throw', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
          stage: 'runtime',
          diagTag: 'fonts:accessor:ready',
          key: 'ready',
          message: 'FontFaceSet.ready getter threw',
          data: { outcome: 'throw', reason: 'native_throw' }
        }, e) : undefined);
        throw e;
      }
    }
  }], 'skip');

  // === Tunables (локальные, регулируем «на месте», без глобальных флагов) ===
  let FFS_TICK_MS   = 16;
  let FFS_LIM_RUN   = 40;
  let FFS_BOOT_MS   = 180;
  let FFS_LIM_BOOT  = 96;

  const now = (__fontRuntimeRoot.performance && typeof __fontRuntimeRoot.performance.now === 'function')
    ? () => __fontRuntimeRoot.performance.now.call(__fontRuntimeRoot.performance)
    : () => Date.now();

  const T0 = now();
  let calls = 0;
  let ts    = 0;
  const throttled = () => {
    const t = now();
    const TMS = FFS_TICK_MS | 0;
    if (t - ts > TMS) { calls = 0; ts = t; }
    const inBoot = (t - T0) < FFS_BOOT_MS;
    const LIM = inBoot ? FFS_LIM_BOOT : FFS_LIM_RUN;
    return (calls++ >= LIM);
  };

  const MAX_LEN = 256;
  const CTRL = /[\u0000-\u001F]/;
  const SIZED  = /\b-?\d+(?:\.\d+)?(?:px|pt|em|rem|%)\b/i;
  const FAMILY = /"[^"]+"|'[^']+'|\b[a-z0-9][\w\- ]{1,}\b/i;
  const GENERICS = new Set(['serif','sans-serif','monospace','cursive','fantasy','system-ui']);

  function extractFamily(q) {
    const m = String(q).match(/(?:^|\s)\d+(?:\.\d+)?(?:px|pt|em|rem|%)\b(?:\/\d+(?:\.\d+)?(?:px|pt|em|rem|%))?\s+(.+)$/i);
    const raw = (m ? m[1] : q);
    return normalizeFamilyName(raw.split(',')[0]);
  }

  function getAllowedFamilies() {
    const snapshot = refreshFamilySnapshot();
    return snapshot.allowedFamilies instanceof Set ? snapshot.allowedFamilies : new Set();
  }

  const validFontQuery = q => {
    if (!(typeof q === 'string' && q.length <= MAX_LEN && !CTRL.test(q) && SIZED.test(q) && FAMILY.test(q))) {
      return false;
    }
    let familyDictionary = getSharedFamilyDictionary();
    const families = extractFamiliesFromFontShorthand(q);
    const candidateFamilies = families.length ? families : [extractFamily(q)];
    if (!candidateFamilies.length) return false;
    for (let i = 0; i < candidateFamilies.length; i++) {
      const fam = candidateFamilies[i];
      if (!fam) return false;
      if (GENERICS.has(fam)) continue;
      if (familyDictionary.has(fam)) continue;
      if (!FONTFACE_RUNTIME_FAMILIES.has(fam)) {
        syncRuntimeFamiliesFromFontFaceSet();
        familyDictionary = getSharedFamilyDictionary();
      }
      if (!familyDictionary.has(fam)) return false;
    }
    return true;
  };

  (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', 'fonts:method:check_native_passthrough', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
    stage: 'preflight',
    type: __fontTypePipeline,
    diagTag: 'fonts:method:check',
    key: 'FontFaceSet.check',
    message: 'FontFaceSet.check left native to preserve native abuse/error path',
    data: {
      outcome: 'return',
      reason: 'native_passthrough',
      carrierReason: 'no_admissible_public_method_carrier'
    }
  }, null) : undefined);

  (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', 'fonts:method:forEach_native_passthrough', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
    stage: 'preflight',
    type: __fontTypePipeline,
    diagTag: 'fonts:method:forEach',
    key: 'FontFaceSet.forEach',
    message: 'FontFaceSet.forEach left native to preserve native abuse/error path',
    data: {
      outcome: 'return',
      reason: 'native_passthrough',
      carrierReason: 'no_admissible_public_method_carrier'
    }
  }, null) : undefined);

  (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', 'fonts:promise:load_native_passthrough', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
    stage: 'preflight',
    type: __fontTypePipeline,
    diagTag: 'fonts:promise:load',
    key: 'FontFaceSet.load',
    message: 'FontFaceSet.load left native to preserve native abuse/error path',
    data: {
      outcome: 'return',
      reason: 'native_passthrough',
      carrierReason: 'no_admissible_public_method_carrier'
    }
  }, null) : undefined);
})();

  const domPlat = __fontDomPlatform;
  if (!domPlat) {
    // preflight soft-skip: keep awaitFontsReady as native document.fonts.ready where possible
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:nav_platform_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      diagTag: 'fonts',
      key: 'FernwehContext.state.__ENV_PROFILE__.__PLATFORM__.domPlatform',
      message: 'FernwehContext.state.__ENV_PROFILE__.__PLATFORM__.domPlatform missing (skip font patch)',
      data: { outcome: 'skip', reason: 'missing_nav_platform' }
    }, null) : undefined);
    try {
      if (__fontFontFaceSet && __fontFontFaceSet.ready && typeof __fontFontFaceSet.ready.then === 'function') {
        __setFontsAwaitState(__fontFontFaceSet.ready, 'native', null, null);
      }
    } catch (eRestore) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:await_ready_restore_failed', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
        stage: 'runtime',
        key: 'document.fonts.ready',
        message: 'awaitReady restore failed',
        type: __fontTypePipeline,
        data: { outcome: 'skip', reason: 'await_ready_restore_failed' }
      }, eRestore) : undefined);
    }
    __releaseGuardOnSkip('preflight', 'guard release failed after nav_platform skip', 'guard_release_failed');
    return;
  }

  const allFonts = __getFontsConfigArray();
  const hasPlatformDom = allFonts.some(f => f && typeof f.platform_dom === 'string');
  const fonts = (hasPlatformDom && domPlat) ? allFonts.filter(f => f.platform_dom === domPlat) : allFonts;
  __refreshFontsEpochState();
  if (!fonts.length) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:filtered_empty', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      diagTag: 'fonts',
      key: 'FernwehContext.state.__FONTS__.__CONFIG__.configs',
      message: 'filtered fonts list is empty',
      data: { platform: domPlat }
    }, null) : undefined);
  } else {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', 'fonts:filtered_count', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      diagTag: 'fonts',
      key: 'FernwehContext.state.__FONTS__.__CONFIG__.configs',
      message: 'filtered fonts list prepared',
      data: { platform: domPlat, count: fonts.length }
    }, null) : undefined);
  }




  // --- DOM override for quick macOS check (optional, debugging) ---
  (function () {
    // в worker’е документа нет — выходим
    if (!__fontDocument) return;

    const domPlat = __fontDomPlatform;
    if (!domPlat) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:dom_override_nav_platform_missing', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
        stage: 'preflight',
        diagTag: 'fonts',
        key: 'FernwehContext.state.__ENV_PROFILE__.__PLATFORM__.domPlatform',
        message: 'FernwehContext.state.__ENV_PROFILE__.__PLATFORM__.domPlatform missing (skip dom override)',
        data: { outcome: 'skip', reason: 'missing_nav_platform' }
      }, null) : undefined);
      return;
    }

    // строго только под macOS и только если есть что применять
    function run() {
      if (domPlat !== 'MacIntel') return;

      const allFonts = __getFontsConfigArray();
      const hasPlatformDom = allFonts.some(f => f && typeof f.platform_dom === 'string');
      const fonts = (hasPlatformDom && domPlat) ? allFonts.filter(f => f.platform_dom === domPlat) : allFonts;
      if (!fonts.length) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:dom_override_filtered_empty', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
          stage: 'preflight',
          diagTag: 'fonts',
          key: 'FernwehContext.state.__FONTS__.__CONFIG__.configs',
          message: 'dom override skipped: no filtered fonts',
          data: { platform: domPlat }
        }, null) : undefined);
        return;
      }

      const testFam = (fonts[0].cssFamily || fonts[0].family);
      if (!testFam) return;

      const testFamCss = JSON.stringify(String(testFam));

      // idempotent: не плодим несколько <style id="force-font-override">
      let el = __fontDocument.getElementById('force-font-override');
      if (!el) {
        el = __fontDocument.createElement('style');
        el.id = 'force-font-override';
        // вставляем в head, если он уже есть; иначе — в documentElement/body
        const parent =
          __fontDocument.head ||
          __fontDocument.documentElement ||
          __fontDocument.body;
        if (!parent) {
          // если DOM ещё не готов (редкий случай), оставим через RAF следующему тику
          requestAnimationFrame(run);
          return;
        }
        parent.appendChild(el);
      }

      el.textContent = `
        :root, body, * {
          font-family: ${testFamCss}, Helvetica, Arial, sans-serif !important;
          font-synthesis: none !important;
        }`;
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', 'fonts:dom_override_applied', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
        stage: 'apply',
        diagTag: 'fonts',
        key: 'force-font-override',
        message: 'dom override style applied',
        data: { platform: domPlat, family: testFam }
      }, null) : undefined);
    }

    // дождаться готовности DOM, чтобы не ловить appendChild на null
    if (__fontDocument.readyState === 'loading') {
      __fontDocument.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      run();
    }
})();


  // ===  window branch (DOM exist here) ====
  if (__fontDocument && __fontFontFaceSet && typeof __fontFontFaceSet.add === 'function') {
    function __applyFontPatchCss() {
      let css = '';
      for (const f of fonts) {
        if (!f || typeof f !== 'object') continue;
        const fam = (f.cssFamily || f.family);
        const url = f.url;
        if (!fam || typeof fam !== 'string') continue;
        if (!url || typeof url !== 'string') continue;

        const famCss = JSON.stringify(String(fam));
        const urlCss = JSON.stringify(String(url));
        css += `@font-face{font-family:${famCss};src:url(${urlCss}) format("woff2");font-weight:${f.weight||"normal"};font-style:${f.style||"normal"};font-display:swap;}`;
      }
      const tagId = 'font-patch-styles';
      const apply = () => {
        let styleEl = __fontDocument.getElementById(tagId) || __fontDocument.createElement('style');
        styleEl.id = tagId;
        (__fontDocument.head || __fontDocument.documentElement || __fontDocument.body).appendChild(styleEl);
        styleEl.textContent = css;
      };

      if (__fontDocument.readyState === 'loading') {
        const tryApply = () => {
          if (__fontDocument.head || __fontDocument.documentElement || __fontDocument.body) apply();
          else requestAnimationFrame(tryApply);
        };
        tryApply();
      } else {
        apply();
      }
    }

    __applyFontPatchCss();

    Promise.allSettled(
      fonts.map((f) => {
        try {
          if (!f || typeof f !== 'object') {
            return Promise.reject(new TypeError('font entry must be object'));
          }
          const fam = (f.cssFamily || f.family);
          if (!fam || typeof fam !== 'string') {
            return Promise.reject(new TypeError('font.family missing/invalid'));
          }
          const url = f.url;
          if (!url || typeof url !== 'string') {
            return Promise.reject(new TypeError('font.url missing/invalid'));
          }

          const src = `url(${JSON.stringify(url)}) format("woff2")`;

          const ff = new FontFace(fam, src, {
            weight: f.weight || 'normal',
            style:  f.style  || 'normal',
            display: 'swap',
          });

          return ff.load().then((loaded) => {
            try {
              __fontFontFaceSet.add(loaded);
            } catch (eAdd) {
              (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:document_fonts_add_failed', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
                stage: 'runtime',
                diagTag: 'fonts',
                key: 'document.fonts',
                message: 'document.fonts.add failed',
                data: { outcome: 'throw', reason: 'document_fonts_add_failed', family: fam }
              }, eAdd) : undefined);
              throw eAdd;
            }
            return fam;
          });
        } catch (e) {
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:load_item_failed', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
            stage: 'runtime',
            diagTag: 'fonts',
            key: 'FernwehContext.state.__FONTS__.__CONFIG__.configs',
            message: 'font item build failed',
            data: { outcome: 'skip', reason: 'font_item_build_failed' }
          }, e) : undefined);
          return Promise.reject(e);
        }
      })
    ).then((results) => {
      const loaded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      if (failed > 0) {
        const first = results.find((r) => r.status === 'rejected');
        const err = first && ('reason' in first) ? first.reason : new Error('font load failed');

        __setFontsRuntimeState(false, null);
        try {
          __fontsState.error = String((err && (err.stack || err.message)) || err);
          __refreshFontsEpochState();
        } catch (eSet) {
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:data:set_error_failed', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
            stage: 'runtime',
            key: 'FernwehContext.state.__FONTS__.error',
            message: 'font error state write failed',
            type: __fontTypePipeline,
            data: { outcome: 'skip', reason: 'set_error_failed' }
          }, eSet) : undefined);
        }

        __settleAwaitFontsReady('rejected', err);
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:load_settled_with_failures', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
          stage: 'runtime',
          diagTag: 'fonts',
          key: 'document.fonts',
          message: 'font load settled with failures',
          data: { outcome: 'skip', reason: 'load_settled_with_failures', loaded: loaded, failed: failed }
        }, err) : undefined);
        return;
      }

      // strict settle: wait for native document.fonts.ready + double RAF before exposing fontsready
      return Promise.resolve()
        .then(() => (__fontFontFaceSet && __fontFontFaceSet.ready) || Promise.resolve())
        .then(() => __doubleRafBarrier())
        .then(() => {
          __setFontsRuntimeState(true, null);
          __settleAwaitFontsReady('resolved');
          try {
            if (__fontEventTarget) __fontEventTarget.dispatchEvent(new Event('fontsready'));
          } catch (eEvt) {
            (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:event:dispatch_failed', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
              stage: 'runtime',
              key: 'dispatchEvent',
              message: 'fontsready dispatch failed',
              type: __fontTypePipeline,
              data: { outcome: 'skip', reason: 'dispatch_failed' }
            }, eEvt) : undefined);
          }
           (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', 'fonts:load_settled', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
             stage: 'runtime',
             diagTag: 'fonts',
             key: 'document.fonts',
             message: 'font load settled',
             data: { outcome: 'return', loaded: loaded, failed: failed }
            }, null) : undefined);
          });
    }).catch((e) => {
      // no "наружу": перехватываем неожиданные промис-ошибки и оставляем нативное состояние
      __setFontsRuntimeState(false, null);
      try {
        __fontsState.error = String((e && (e.stack || e.message)) || e);
        __refreshFontsEpochState();
      } catch (eSet) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:data:set_error_failed', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
          stage: 'runtime',
          key: 'FernwehContext.state.__FONTS__.error',
          message: 'font error state write failed',
          type: __fontTypePipeline,
          data: { outcome: 'skip', reason: 'set_error_failed' }
        }, eSet) : undefined);
      }
      try {
        __settleAwaitFontsReady('rejected', e);
      } catch (eRej) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:await_ready_reject_failed', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
          stage: 'runtime',
          key: 'document.fonts.ready',
          message: 'awaitReady reject failed',
          type: __fontTypePipeline,
          data: { outcome: 'skip', reason: 'await_ready_reject_failed' }
        }, eRej) : undefined);
      }
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'fonts:load_unexpected_rejection', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
        stage: 'runtime',
        diagTag: 'fonts',
        key: 'document.fonts',
        message: 'unexpected rejection in font load pipeline',
        data: { outcome: 'skip', reason: 'unexpected_rejection' }
      }, e) : undefined);
    });
  } else {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:fontfaceset_add_unavailable', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
      stage: 'preflight',
      diagTag: 'fonts',
      key: 'document.fonts.add',
      message: 'FontFaceSet add path unavailable',
      data: {
        outcome: 'skip',
        reason: 'fontfaceset_add_unavailable',
        hasDocument: !!__fontDocument,
        hasFontFaceSet: !!__fontFontFaceSet,
        hasAdd: !!(__fontFontFaceSet && typeof __fontFontFaceSet.add === 'function')
      }
    }, null) : undefined);
  }
  } catch (e) {
    let rollbackErr = null;
    if (__applyStarted) {
      try {
        __restoreFontsStateValue(__rollbackSnapshot.fontsStateValue);
      } catch (re) {
        rollbackErr = re;
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'fonts:rollback_failed', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
          stage: 'rollback',
          diagTag: __tag,
          surface: __surface,
          key: null,
          message: 'rollback failed',
          data: { outcome: 'rollback', reason: 'rollback_failed' }
        }, re) : undefined);
      }
    }

    const rollbackOk = __applyStarted ? !rollbackErr : true;
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'fonts:fatal', { module: __MODULE, surface: __SURFACE, type: 'browser structure missing data', 
      stage: 'apply',
      diagTag: __tag,
      surface: __surface,
      key: null,
      message: 'fatal module error',
      data: { outcome: 'throw', reason: 'fatal', rollbackOk: rollbackOk }
    }, rollbackErr || e) : undefined);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, rollbackOk, __tag);
      }
    } catch (eRelease) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'fonts:guard_release_failed', { module: __MODULE, surface: __SURFACE, type: 'pipeline missing data', 
        stage: 'rollback',
        diagTag: __tag,
        surface: __surface,
        key: 'guard',
        message: 'releaseGuardFlag threw after apply failure',
        data: { outcome: rollbackOk ? 'rollback' : 'skip', reason: 'guard_release_failed' }
      }, eRelease) : undefined);
    }
    throw (rollbackErr || e);
  }
}

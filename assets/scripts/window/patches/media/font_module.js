const FontPatchModule = function FontPatchModule(window) {
const G = (typeof globalThis !== 'undefined' && globalThis)
      || (typeof self       !== 'undefined' && self)
      || (typeof window     !== 'undefined' && window)
      || (typeof global     !== 'undefined' && global)
      || {};

  if (!window || (typeof window !== 'object' && typeof window !== 'function')) {
    // если модуль оказался в worker-среде и его вызвали как FontPatchModule(window) где window=undefined
    window = G;
  }

  const __fontTypePipeline = 'pipeline missing data';
  const __fontTypeBrowser = 'browser structure missing data';
  function __fontDiag(level, code, extra, err) {
    try {
      const __loggerRoot = (window && window.CanvasPatchContext && window.CanvasPatchContext.__logger && typeof window.CanvasPatchContext.__logger === 'object')
        ? window.CanvasPatchContext.__logger
        : null;
      const D = (__loggerRoot && typeof __loggerRoot.__DEGRADE__ === 'function') ? __loggerRoot.__DEGRADE__ : null;
      const emitCode = String(code || 'fonts');
      const ctx = (extra && typeof extra === 'object') ? extra : null;
      if (D && typeof D.diag === 'function') {
        D.diag(level, emitCode, ctx, err || null);
        return;
      }
      if (typeof D === 'function') {
        if (ctx && typeof ctx === 'object') {
          D(emitCode, err || null, Object.assign({ level: level }, ctx));
          return;
        }
        D(emitCode, err || null, { level: level });
      }
    } catch (_) {
      return;
    }
  }
  function __fontDiagPipeline(level, code, extra, err) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    __fontDiag(level, code, {
      module: (typeof x.module === 'string' && x.module) ? x.module : 'fonts',
      diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : 'fonts',
      surface: (typeof x.surface === 'string' && x.surface) ? x.surface : 'fonts',
      key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
      stage: (typeof x.stage === 'string' && x.stage) ? x.stage : 'runtime',
      message: (typeof x.message === 'string' && x.message) ? x.message : String(code || 'fonts'),
      data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
      type: (typeof x.type === 'string' && x.type) ? x.type : __fontTypePipeline
    }, err);
  }
  function __fontDiagBrowser(level, code, extra, err) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    __fontDiag(level, code, {
      module: (typeof x.module === 'string' && x.module) ? x.module : 'fonts',
      diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : 'fonts',
      surface: (typeof x.surface === 'string' && x.surface) ? x.surface : 'fonts',
      key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
      stage: (typeof x.stage === 'string' && x.stage) ? x.stage : 'runtime',
      message: (typeof x.message === 'string' && x.message) ? x.message : String(code || 'fonts'),
      data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
      type: (typeof x.type === 'string' && x.type) ? x.type : __fontTypeBrowser
    }, err);
  }
  function degrade(code, err, extra) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    __fontDiagPipeline('warn', code, {
      diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : 'fonts',
      stage: (typeof x.stage === 'string' && x.stage) ? x.stage : 'runtime',
      key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
      message: (typeof x.message === 'string' && x.message) ? x.message : String(code || 'fonts'),
      data: x
    }, err || null);
  }

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

  const C = window.CanvasPatchContext;
  if (!C) {
    __fontDiagPipeline('warn', 'fonts:canvas_patch_context_missing', {
      stage: 'preflight',
      message: 'CanvasPatchContext missing',
      data: { outcome: 'skip', reason: 'missing_canvas_patch_context' }
    }, null);
    return;
  }

  function __ensureFontsStateSlot() {
    if (Object.prototype.hasOwnProperty.call(C, '__FONTS_STATE__')) {
      const existing = C.__FONTS_STATE__;
      if (existing && typeof existing === 'object') return existing;
      __fontDiagPipeline('warn', 'fonts:fonts_state_invalid', {
        stage: 'preflight',
        surface: 'CanvasPatchContext',
        key: '__FONTS_STATE__',
        message: 'CanvasPatchContext.__FONTS_STATE__ invalid',
        data: { outcome: 'skip', reason: 'invalid_fonts_state_slot' }
      }, null);
      return null;
    }
    const state = {
      ready: false,
      error: null,
      awaitReady: null,
      awaitReadyStatus: null,
      awaitReadyResolve: null,
      awaitReadyReject: null,
      familySnapshot: __makeFontFamilySnapshot()
    };
    try {
      Object.defineProperty(C, '__FONTS_STATE__', {
        value: state,
        writable: true,
        configurable: true,
        enumerable: false
      });
      return state;
    } catch (e) {
      __fontDiagBrowser('warn', 'fonts:fonts_state_define_failed', {
        stage: 'apply',
        surface: 'CanvasPatchContext',
        key: '__FONTS_STATE__',
        message: 'Object.defineProperty(CanvasPatchContext,"__FONTS_STATE__") failed',
        data: { outcome: 'skip', reason: 'fonts_state_define_failed' }
      }, e);
      return null;
    }
  }

  const __fontsState = __ensureFontsStateSlot();
  if (!__fontsState) return;

  if (__fontsState.ready !== true) __fontsState.ready = false;
  if (!Object.prototype.hasOwnProperty.call(__fontsState, 'error')) __fontsState.error = null;
  if (!Object.prototype.hasOwnProperty.call(__fontsState, 'awaitReady')) __fontsState.awaitReady = null;
  if (!Object.prototype.hasOwnProperty.call(__fontsState, 'awaitReadyStatus')) __fontsState.awaitReadyStatus = null;
  if (!Object.prototype.hasOwnProperty.call(__fontsState, 'awaitReadyResolve')) __fontsState.awaitReadyResolve = null;
  if (!Object.prototype.hasOwnProperty.call(__fontsState, 'awaitReadyReject')) __fontsState.awaitReadyReject = null;

  const __legacyFontFamilySnapshot = (C.__fontFamilySnapshot && typeof C.__fontFamilySnapshot === 'object')
    ? C.__fontFamilySnapshot
    : null;
  const __fontFamilySnapshot = (__fontsState.familySnapshot && typeof __fontsState.familySnapshot === 'object')
    ? __fontsState.familySnapshot
    : __makeFontFamilySnapshot();
  if (__legacyFontFamilySnapshot && __fontFamilySnapshot !== __legacyFontFamilySnapshot) {
    if (
      (
        !(__fontFamilySnapshot.allowedFamilies instanceof Set) ||
        __fontFamilySnapshot.allowedFamilies.size === 0
      ) &&
      (__legacyFontFamilySnapshot.allowedFamilies instanceof Set)
    ) {
      __fontFamilySnapshot.allowedFamilies = new Set(__legacyFontFamilySnapshot.allowedFamilies);
    }
    if (__legacyFontFamilySnapshot.runtimeFamilies instanceof Set) {
      if (!(__fontFamilySnapshot.runtimeFamilies instanceof Set)) {
        __fontFamilySnapshot.runtimeFamilies = new Set();
      }
      if (__fontFamilySnapshot.runtimeFamilies.size === 0) {
        __legacyFontFamilySnapshot.runtimeFamilies.forEach(function migrateRuntimeFamily(fam) {
          __fontFamilySnapshot.runtimeFamilies.add(fam);
        });
      }
    }
    if (__fontFamilySnapshot.platformDom == null && Object.prototype.hasOwnProperty.call(__legacyFontFamilySnapshot, 'platformDom')) {
      __fontFamilySnapshot.platformDom = __legacyFontFamilySnapshot.platformDom;
    }
    if (__fontFamilySnapshot.versionToken == null && Object.prototype.hasOwnProperty.call(__legacyFontFamilySnapshot, 'versionToken')) {
      __fontFamilySnapshot.versionToken = __legacyFontFamilySnapshot.versionToken;
    }
  }
  if (!(__fontFamilySnapshot.runtimeFamilies instanceof Set)) {
    __fontFamilySnapshot.runtimeFamilies = new Set();
  }
  __fontsState.familySnapshot = __fontFamilySnapshot;

  const Core = window && window.Core;
  if (!Core) {
    __fontDiagPipeline('warn', 'fonts:core_missing', {
      stage: 'preflight',
      key: 'Core',
      message: 'Core missing',
      data: { outcome: 'skip', reason: 'missing_core' }
    }, null);
    return;
  }
  if (typeof Core.applyTargets !== 'function') {
    __fontDiagPipeline('warn', 'fonts:core_apply_targets_missing', {
      stage: 'preflight',
      key: 'Core.applyTargets',
      message: 'Core.applyTargets missing',
      data: { outcome: 'skip', reason: 'missing_core_apply_targets' }
    }, null);
    return;
  }
  if (typeof Core.registerPatchedTarget !== 'function') {
    __fontDiagPipeline('warn', 'fonts:core_register_patched_target_missing', {
      stage: 'preflight',
      key: 'Core.registerPatchedTarget',
      message: 'Core.registerPatchedTarget missing',
      data: { outcome: 'skip', reason: 'missing_core_register_patched_target' }
    }, null);
    return;
  }
  if (typeof Core.guardFlag !== 'function') {
    __fontDiagPipeline('warn', 'fonts:core_guard_flag_missing', {
      stage: 'preflight',
      key: 'Core.guardFlag',
      message: 'Core.guardFlag missing',
      data: { outcome: 'skip', reason: 'missing_core_guard_flag' }
    }, null);
    return;
  }
  if (typeof Core.resolveDescriptor !== 'function') {
    __fontDiagPipeline('warn', 'fonts:core_resolve_descriptor_missing', {
      stage: 'preflight',
      key: 'Core.resolveDescriptor',
      message: 'Core.resolveDescriptor missing',
      data: { outcome: 'skip', reason: 'missing_core_resolve_descriptor' }
    }, null);
    return;
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
          __fontDiagPipeline(groupPolicy === 'throw' ? 'error' : 'warn', groupTag + ':target_preflight_failed', {
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
          }, err);
          if (groupPolicy === 'throw') throw err;
          return 0;
        }
      }
    }
    let plans = [];
    try {
      plans = Core.applyTargets(targets, window.__PROFILE__, []);
    } catch (e) {
      __fontDiagPipeline(groupPolicy === 'throw' ? 'error' : 'warn', groupTag + ':preflight_failed', {
        stage: 'preflight',
        diagTag: groupTag,
        key: groupKey,
        message: 'Core.applyTargets preflight failed',
        data: { outcome: (groupPolicy === 'throw') ? 'throw' : 'skip', reason: 'core_apply_targets_preflight_failed' }
      }, e);
      if (groupPolicy === 'throw') throw e;
      return 0;
    }

    if (!Array.isArray(plans) || !plans.length) {
      if (plans && plans.ok === false) {
        const e = new Error('target group skipped');
        __fontDiagPipeline(groupPolicy === 'throw' ? 'error' : 'warn', groupTag + ':group_skipped', {
          stage: 'preflight',
          diagTag: groupTag,
          key: groupKey,
          message: 'target group skipped',
          data: { outcome: 'skip', reason: plans.reason || 'group_skipped' }
        }, e);
      } else {
        __fontDiagPipeline('warn', groupTag + ':group_skipped', {
          stage: 'preflight',
          diagTag: groupTag,
          key: groupKey,
          message: 'target group skipped',
          data: { outcome: 'skip', reason: 'empty_plan' }
        }, null);
      }
      return 0;
    }

    const done = [];
    try {
      for (let i = 0; i < plans.length; i++) {
        const p = plans[i];
        if (!p || p.skipApply) continue;
        if (!p.nextDesc || !p.owner || typeof p.key !== 'string') {
          const e = new Error('invalid execution plan item');
          __fontDiagBrowser('error', groupTag + ':contract_violation', {
            stage: 'contract',
            diagTag: groupTag,
            key: p && typeof p.key === 'string' ? p.key : groupKey,
            message: 'invalid execution plan item',
            data: { outcome: 'throw', reason: 'invalid_execution_plan_item' }
          }, e);
          throw e;
        }
        Object.defineProperty(p.owner, p.key, p.nextDesc);
        const after = Object.getOwnPropertyDescriptor(p.owner, p.key);
        if (!isSameDescriptor(after, p.nextDesc)) {
          const e = new Error('descriptor post-check mismatch');
          __fontDiagBrowser('error', groupTag + ':contract_violation', {
            stage: 'contract',
            diagTag: groupTag,
            key: p.key || groupKey,
            message: 'descriptor post-check mismatch',
            data: { outcome: 'throw', reason: 'descriptor_post_check_mismatch' }
          }, e);
          throw e;
        }
        p.applied = true;
        done.push(p);
      }
      __fontDiagPipeline('info', groupTag + ':group_applied', {
        stage: 'apply',
        diagTag: groupTag,
        key: groupKey,
        message: 'target group applied',
        data: { outcome: 'return', applied: done.length }
      }, null);
      return done.length;
    } catch (e) {
      let rollbackErr = null;
      for (let i = done.length - 1; i >= 0; i--) {
        const p = done[i];
        try {
          if (p.origDesc) Object.defineProperty(p.owner, p.key, p.origDesc);
          else delete p.owner[p.key];
        } catch (re) {
          if (!rollbackErr) rollbackErr = re;
          __fontDiagBrowser('error', groupTag + ':rollback_failed', {
            stage: 'rollback',
            diagTag: groupTag,
            key: p && p.key ? p.key : groupKey,
            message: 'rollback failed',
            data: { outcome: 'rollback', reason: 'rollback_failed' }
          }, re);
        }
      }
      __fontDiagBrowser(groupPolicy === 'throw' ? 'error' : 'warn', groupTag + ':apply_failed', {
        stage: 'apply',
        diagTag: groupTag,
        key: groupKey,
        message: 'apply failed',
        data: {
          outcome: (groupPolicy === 'throw') ? 'throw' : 'skip',
          reason: 'apply_failed',
          rollbackFailed: !!rollbackErr
        }
      }, e);
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

  function __hideLegacyFontSurface(key) {
    const d = Object.getOwnPropertyDescriptor(window, key);
    if (!d) return true;
    if (d.enumerable === false) return true;
    if (d.configurable === false) {
      __fontDiagBrowser('warn', 'fonts:hide_pass_nonconfigurable', {
        stage: 'apply',
        diagTag: 'fonts:hide-pass',
        key: key,
        message: 'hide-pass skipped: non-configurable legacy surface',
        data: { outcome: 'skip', reason: 'hide_pass_nonconfigurable' }
      }, null);
      return false;
    }
    try {
      if ('value' in d) {
        Object.defineProperty(window, key, {
          value: d.value,
          writable: !!d.writable,
          configurable: true,
          enumerable: false
        });
      } else {
        Object.defineProperty(window, key, {
          get: d.get,
          set: d.set,
          configurable: true,
          enumerable: false
        });
      }
      return true;
    } catch (e) {
      __fontDiagBrowser('warn', 'fonts:hide_pass_failed', {
        stage: 'apply',
        diagTag: 'fonts:hide-pass',
        key: key,
        message: 'hide-pass failed for legacy font surface',
        data: { outcome: 'skip', reason: 'hide_pass_failed' }
      }, e);
      return false;
    }
  }

  function __runFontsHidePass() {
    __hideLegacyFontSurface('awaitFontsReady');
    __hideLegacyFontSurface('__FONTS_READY__');
    __hideLegacyFontSurface('__FONTS_ERROR__');
  }

  function __syncAwaitFontsMirror() {
    try {
      Object.defineProperty(window, 'awaitFontsReady', {
        value: __fontsState.awaitReady,
        writable: true,
        configurable: true,
        enumerable: false
      });
      return true;
    } catch (e) {
      __fontDiagBrowser('warn', 'fonts:await_ready_mirror_define_failed', {
        stage: 'apply',
        diagTag: 'fonts:data:awaitFontsReady',
        key: 'awaitFontsReady',
        message: 'awaitFontsReady mirror define failed',
        data: { outcome: 'throw', reason: 'await_ready_mirror_define_failed' }
      }, e);
      return false;
    }
  }

  function __setFontsAwaitState(promiseValue, status, resolveFn, rejectFn) {
    __fontsState.awaitReady = promiseValue || null;
    __fontsState.awaitReadyStatus = status || null;
    __fontsState.awaitReadyResolve = (typeof resolveFn === 'function') ? resolveFn : null;
    __fontsState.awaitReadyReject = (typeof rejectFn === 'function') ? rejectFn : null;
    return __syncAwaitFontsMirror();
  }

  function __setFontsRuntimeState(readyValue, errorValue) {
    __fontsState.ready = readyValue === true;
    __fontsState.error = (errorValue == null) ? null : errorValue;
  }

  function __releaseGuardOnSkip(message, key, reason) {
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
      }
    } catch (eRelease) {
      __fontDiagPipeline('warn', 'fonts:guard_release_failed', {
        stage: 'rollback',
        diagTag: __tag,
        surface: __surface,
        key: key || __flagKey,
        message: message,
        data: { outcome: 'skip', reason: reason || 'guard_release_failed' }
      }, eRelease);
    }
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
      __fontDiagPipeline('warn', 'fonts:guard_missing', {
        stage: 'guard',
        diagTag: __tag,
        surface: __surface,
        key: __flagKey,
        message: 'Core.guardFlag missing',
        data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
      }, null);
      return;
    }
    __guardToken = __core.guardFlag(__flagKey, __tag);
  } catch (e) {
    __fontDiagPipeline('warn', 'fonts:guard_failed', {
      stage: 'guard',
      diagTag: __tag,
      surface: __surface,
      key: __flagKey,
      message: 'guardFlag threw',
      data: { outcome: 'skip', reason: 'guard_failed' }
    }, e);
    return;
  }
  if (!__guardToken) return; // already_patched: Core emits fonts:already_patched

  const __rollbackSnapshot = {
    fontsStateValue: __cloneFontsStateValue(__fontsState),
    awaitFontsReadyOwn: Object.prototype.hasOwnProperty.call(window, 'awaitFontsReady'),
    awaitFontsReadyDesc: Object.getOwnPropertyDescriptor(window, 'awaitFontsReady') || null,
    fontsReadyOwn: Object.prototype.hasOwnProperty.call(window, '__FONTS_READY__'),
    fontsReadyDesc: Object.getOwnPropertyDescriptor(window, '__FONTS_READY__') || null,
    fontsErrorOwn: Object.prototype.hasOwnProperty.call(window, '__FONTS_ERROR__'),
    fontsErrorDesc: Object.getOwnPropertyDescriptor(window, '__FONTS_ERROR__') || null
  };
  let __applyStarted = false;
  try {
    if (!Array.isArray(window.fontPatchConfigs)) {
      __fontDiagPipeline('warn', 'fonts:configs_missing_or_invalid', {
        stage: 'preflight',
        diagTag: 'fonts',
        key: 'fontPatchConfigs',
        message: 'fontPatchConfigs missing/invalid (skip font patch)',
        data: { outcome: 'skip', reason: 'configs_missing_or_invalid', typeof: typeof window.fontPatchConfigs }
      }, null);
      __releaseGuardOnSkip('releaseGuardFlag threw on preflight skip', __flagKey, 'guard_release_failed');
      return;
    }
    __applyStarted = true;


  // expose awaitFontsReady in window and in the Worker env
  (function exposeFontsReady(){
    const hasDocFonts = (typeof document === 'object' && document && document.fonts && document.fonts.ready);

    // В window-ветке нам нужна "внешне резолвимая" точка
    if (hasDocFonts) {
      if (!__fontsState.awaitReady || typeof __fontsState.awaitReady.then !== 'function' || __fontsState.awaitReadyStatus !== 'pending') {
        let resolveFn, rejectFn;
        const p = new Promise((res, rej) => { resolveFn = res; rejectFn = rej; });
        if (!__setFontsAwaitState(p, 'pending', resolveFn, rejectFn)) {
          throw new Error('awaitFontsReady mirror define failed');
        }
      } else if (!__syncAwaitFontsMirror()) {
        throw new Error('awaitFontsReady mirror define failed');
      }
      return;
    }
    // В non-window (worker) НЕ подменяем нативный ready на pending-промис, который никто не резолвит
    if (window.fonts && window.fonts.ready && typeof window.fonts.ready.then === 'function') {
      if (!__setFontsAwaitState(window.fonts.ready, 'native', null, null)) {
        throw new Error('awaitFontsReady mirror define failed');
      }
    } else {
      if (!__setFontsAwaitState(Promise.resolve(), 'native', null, null)) {
        throw new Error('awaitFontsReady mirror define failed');
      }
    }
  })();

  __runFontsHidePass();

  function __settleAwaitFontsReady(state, payload) {
    const p = __fontsState.awaitReady;
    if (!p || typeof p.then !== 'function') return false;
    if (__fontsState.awaitReadyStatus && __fontsState.awaitReadyStatus !== 'pending') return false;
    __fontsState.awaitReadyStatus = state;
    if (state === 'resolved') {
      if (typeof __fontsState.awaitReadyResolve === 'function') __fontsState.awaitReadyResolve(payload);
      return true;
    }
    if (state === 'rejected') {
      if (typeof __fontsState.awaitReadyReject === 'function') __fontsState.awaitReadyReject(payload);
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

  // Глобал рантайма
  const G = (typeof globalThis !== "undefined" ? globalThis : self);

  // FontFaceSet в текущем окружении (window/worker)
  const FFS = (G.document && G.document.fonts) || G.fonts || null;
  if (!FFS) {
    __fontDiagPipeline('warn', 'fonts:ffs_missing', {
      stage: 'preflight',
      diagTag: 'fonts',
      key: 'FontFaceSet',
      message: 'FontFaceSet missing (skip patch)',
      data: { outcome: 'skip', reason: 'missing_fontfaceset' }
    }, null);
    return;
  }

  const proto = Object.getPrototypeOf(FFS);
  if (!proto) {
    __fontDiagPipeline('warn', 'fonts:proto_missing', {
      stage: 'preflight',
      diagTag: 'fonts',
      key: 'FontFaceSet.prototype',
      message: 'FontFaceSet prototype missing (skip patch)',
      data: { outcome: 'skip', reason: 'missing_prototype' }
    }, null);
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
    const win = (winArg && (typeof winArg === 'object' || typeof winArg === 'function')) ? winArg : ((typeof window !== 'undefined') ? window : G);
    const domPlat = (win && typeof win.__NAV_PLATFORM__ === 'string') ? win.__NAV_PLATFORM__ : null;
    const cfgs = Array.isArray(win && win.fontPatchConfigs) ? win.fontPatchConfigs : [];
    const hasPlatformDom = cfgs.some(f => f && typeof f.platform_dom === 'string');
    const filteredCfgs = (domPlat && hasPlatformDom) ? cfgs.filter(f => f && f.platform_dom === domPlat) : cfgs;
    return {
      domPlat: domPlat,
      cfgs: filteredCfgs
    };
  }

  function buildFamilyVersionToken(domPlat, cfgs) {
    const parts = [domPlat || '', String(Array.isArray(cfgs) ? cfgs.length : 0)];
    const list = Array.isArray(cfgs) ? cfgs : [];
    for (let i = 0; i < list.length; i++) {
      const cfg = list[i];
      if (!cfg || typeof cfg !== 'object') continue;
      parts.push([
        normalizeFamilyName(cfg.cssFamily || ''),
        normalizeFamilyName(cfg.family || ''),
        (typeof cfg.platform_dom === 'string') ? cfg.platform_dom : '',
        (typeof cfg.style === 'string') ? cfg.style.toLowerCase() : '',
        (typeof cfg.weight === 'string') ? cfg.weight.toLowerCase() : ''
      ].join('|'));
    }
    return parts.join('||');
  }

  function refreshFamilySnapshot() {
    const scoped = getPlatformScopedFontConfigs();
    const token = buildFamilyVersionToken(scoped.domPlat, scoped.cfgs);
    if (__fontFamilySnapshot.allowedFamilies instanceof Set && __fontFamilySnapshot.versionToken === token) {
      if (__fontFamilySnapshot.platformDom !== scoped.domPlat) {
        __fontFamilySnapshot.platformDom = scoped.domPlat;
      }
      return __fontFamilySnapshot;
    }
    __fontFamilySnapshot.allowedFamilies = new Set(
      scoped.cfgs
        .flatMap(f => [f && f.cssFamily, f && f.family].filter(Boolean))
        .map(normalizeFamilyName)
        .filter(Boolean)
    );
    __fontFamilySnapshot.platformDom = scoped.domPlat;
    __fontFamilySnapshot.versionToken = token;
    __fontFamilySnapshot.runtimeFamilies = FONTFACE_RUNTIME_FAMILIES;
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
    if (normalized) FONTFACE_RUNTIME_FAMILIES.add(normalized);
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
      __fontDiagBrowser('warn', 'fonts:runtime_families_sync_failed', {
        stage: 'runtime',
        diagTag: 'fonts:fontface',
        key: 'FontFaceSet',
        message: 'runtime FontFaceSet family sync failed',
        data: { outcome: 'return', reason: 'runtime_families_sync_failed' }
      }, e);
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
    const scoped = getPlatformScopedFontConfigs((typeof window !== 'undefined') ? window : G);
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
    const familyMatches = cfgs.filter(cfg => normalizeFamilyName(cfg && (cfg.cssFamily || cfg.family)) === fam);
    if (!familyMatches.length) return null;
    const desc = (descriptors && typeof descriptors === 'object') ? descriptors : null;
    const style = desc && typeof desc.style === 'string' ? desc.style.toLowerCase() : '';
    const weight = desc && typeof desc.weight === 'string' ? desc.weight.toLowerCase() : '';
    if (!style && !weight) return familyMatches[0];
    for (let i = 0; i < familyMatches.length; i++) {
      const cfg = familyMatches[i];
      const cfgStyle = typeof cfg.style === 'string' ? cfg.style.toLowerCase() : 'normal';
      const cfgWeight = typeof cfg.weight === 'string' ? cfg.weight.toLowerCase() : 'normal';
      if ((!style || cfgStyle === style) && (!weight || cfgWeight === weight)) {
        return cfg;
      }
    }
    return familyMatches[0];
  }


  function sanitizeFontFaceSource(source, family, descriptors) {
    const resultBase = {
      source: source,
      hadLocal: false,
      hadOnlyLocal: false,
      localOnlyBlocked: false,
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
    let invalidManagedSource = null;
    try {
      const familyDictionary = getSharedFamilyDictionary();
      const normalizedFamily = normalizeFamilyName(family);
      matchedCfg = (normalizedFamily && familyDictionary.has(normalizedFamily))
        ? matchRuntimeFontConfig(family, descriptors)
        : null;
      const matchedUrl = matchedCfg && typeof matchedCfg.url === 'string' ? matchedCfg.url : '';
      const commaIndex = matchedUrl.indexOf(',');
      if (/^data:font\/woff2;base64,/i.test(matchedUrl) && commaIndex !== -1) {
        invalidManagedSource = `url(${JSON.stringify(matchedUrl.slice(0, commaIndex + 1))}) format("woff2")`;
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
        source: invalidManagedSource || source,
        hadLocal: true,
        hadOnlyLocal: true,
        localOnlyBlocked: !!invalidManagedSource,
        localOnlyPassthrough: !invalidManagedSource,
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

  const NativeFontFace = (G && typeof G.FontFace === 'function') ? G.FontFace : null;
  if (!NativeFontFace) {
    __fontDiagPipeline('warn', 'fonts:fontface_missing', {
      stage: 'preflight',
      diagTag: 'fonts:fontface',
      key: 'FontFace',
      message: 'FontFace missing (skip constructor patch)',
      data: { outcome: 'skip', reason: 'missing_fontface' }
    }, null);
  } else if (typeof __wrapNativeCtor !== 'function') {
    __fontDiagPipeline('warn', 'fonts:wrap_native_ctor_missing', {
      stage: 'preflight',
      diagTag: 'fonts:fontface',
      key: 'Core.__wrapNativeCtor',
      message: 'Core.__wrapNativeCtor missing (skip constructor patch)',
      data: { outcome: 'skip', reason: 'missing_wrap_native_ctor' }
    }, null);
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
            __fontDiagBrowser('warn', 'fonts:fontface:sanitize_parser_failed', {
              stage: 'runtime',
              diagTag: 'fonts:fontface',
              key: 'FontFace',
              message: 'FontFace source sanitization parser-path failed',
              data: {
                outcome: 'return',
                reason: sanitized.sanitizeReason || 'sanitize_parser_failed',
                family: (typeof nextArgs[0] === 'string') ? nextArgs[0] : null
              }
            }, null);
            return nextArgs;
          }
          if (sanitized.unexpectedSourceType) {
            __fontDiagPipeline('warn', 'fonts:fontface:unexpected_source_type', {
              stage: 'runtime',
              diagTag: 'fonts:fontface',
              key: 'FontFace',
              message: 'FontFace source type is unexpected for runtime fontPatchConfigs policy',
              data: {
                outcome: 'return',
                reason: 'unexpected_source_type',
                family: (typeof nextArgs[0] === 'string') ? nextArgs[0] : null,
                runtimeConfigMatched: !!sanitized.runtimeConfigMatched
              }
            }, null);
          }
          if (sanitized.localOnlyBlocked) {
            __fontDiagPipeline('info', 'fonts:fontface:local_only_replaced_with_managed_invalid_src', {
              stage: 'runtime',
              diagTag: 'fonts:fontface',
              key: 'FontFace',
              message: 'FontFace local-only source replaced with managed invalid data src',
              data: {
                outcome: 'return',
                reason: 'local_only_replaced_with_managed_invalid_src',
                family: (typeof nextArgs[0] === 'string') ? nextArgs[0] : null,
                runtimeConfigMatched: !!sanitized.runtimeConfigMatched
              }
            }, null);
          }
          if (sanitized.localOnlyPassthrough) {
            __fontDiagPipeline('warn', 'fonts:fontface:local_only_passthrough_not_proven', {
              stage: 'runtime',
              diagTag: 'fonts:fontface',
              key: 'FontFace',
              message: 'FontFace local-only source kept as native (not proven)',
              data: {
                outcome: 'return',
                reason: 'local_only_passthrough_not_proven',
                family: (typeof nextArgs[0] === 'string') ? nextArgs[0] : null,
                runtimeConfigMatched: !!sanitized.runtimeConfigMatched
              }
            }, null);
          }
          return nextArgs;
        } catch (e) {
          __fontDiagBrowser('warn', 'fonts:fontface:sanitize_unexpected_failed', {
            stage: 'runtime',
            diagTag: 'fonts:fontface',
            key: 'FontFace',
            message: 'FontFace source sanitization failed unexpectedly',
            data: { outcome: 'return', reason: 'sanitize_unexpected_failed' }
          }, e);
          return nextArgs;
        }
      });
    } catch (e) {
      __fontDiagBrowser('warn', 'fonts:fontface:wrap_failed', {
        stage: 'apply',
        diagTag: 'fonts:fontface',
        key: 'FontFace',
        message: 'FontFace wrap failed',
        data: { outcome: 'skip', reason: 'wrap_failed' }
      }, e);
    }
    if (WrappedFontFace) {
      applyTargetGroup('fonts:data:fontface', [{
        owner: G,
        key: 'FontFace',
        kind: 'data',
        wrapLayer: 'descriptor_only',
        value: WrappedFontFace,
        policy: 'skip',
        diagTag: 'fonts:data:fontface'
      }], 'skip');
    }
  }

  function isFontFaceSetThis(self) {
    try {
      if (!self) return false;
      if (self === FFS) return true;
      return !!(proto && typeof proto.isPrototypeOf === 'function' && proto.isPrototypeOf(self));
    } catch (e) {
      __fontDiagBrowser('warn', 'fonts:fontfaceset:this_check_failed', {
        stage: 'guard',
        diagTag: 'fonts:fontfaceset',
        key: 'FontFaceSet',
        message: 'FontFaceSet receiver check failed',
        data: { outcome: 'return', reason: 'this_check_failed' }
      }, e);
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
        __fontDiagBrowser('warn', 'fonts:accessor:ready:native_throw', {
          stage: 'runtime',
          diagTag: 'fonts:accessor:ready',
          key: 'ready',
          message: 'FontFaceSet.ready getter threw',
          data: { outcome: 'throw', reason: 'native_throw' }
        }, e);
        throw e;
      }
    }
  }], 'skip');

  // === Tunables (локальные, регулируем «на месте», без глобальных флагов) ===
  let FFS_TICK_MS   = 16;
  let FFS_LIM_RUN   = 40;
  let FFS_BOOT_MS   = 180;
  let FFS_LIM_BOOT  = 96;

  const now = (G.performance && typeof G.performance.now === 'function')
    ? () => G.performance.now.call(G.performance)
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

  // method group: check + forEach(declare-only)
  applyTargetGroup('fonts:method', [
    {
      owner: proto,
      key: 'check',
      kind: 'method',
      wrapLayer: 'core_wrapper',
      invokeClass: 'brand_strict',
      validThis: isFontFaceSetThis,
      invalidThis: 'throw',
      policy: 'skip',
      diagTag: 'fonts:method:check',
      invoke(orig, args) {
        const query = args[0];
        if (throttled()) return false;
        if (query != null && typeof query !== 'string') {
          try {
            return Reflect.apply(orig, this, args);
          } catch (e) {
            __fontDiagBrowser('warn', 'fonts:method:check:native_throw', {
              stage: 'runtime',
              key: 'FontFaceSet.check',
              message: 'FontFaceSet.check threw',
              data: { outcome: 'throw', reason: 'native_throw' }
            }, e);
            throw e;
          }
        }
        if (!validFontQuery(query)) return false;
        try {
          return Reflect.apply(orig, this, args);
        } catch (e) {
          __fontDiagBrowser('warn', 'fonts:method:check:native_throw', {
            stage: 'runtime',
            key: 'FontFaceSet.check',
            message: 'FontFaceSet.check threw',
            data: { outcome: 'throw', reason: 'native_throw' }
          }, e);
          throw e;
        }
      }
    },
    {
      owner: proto,
      key: 'forEach',
      kind: 'method',
      wrapLayer: 'named_wrapper',
      mode: 'declare_only',
      enabled: false,
      policy: 'skip',
      diagTag: 'fonts:method:forEach'
    }
  ], 'skip');

  // promise_method group: load
  applyTargetGroup('fonts:promise', [{
    owner: proto,
    key: 'load',
    kind: 'promise_method',
    wrapLayer: 'core_wrapper',
    invokeClass: 'brand_strict',
    validThis: isFontFaceSetThis,
    invalidThis: 'throw',
    policy: 'skip',
      diagTag: 'fonts:promise:load',
      invoke(orig, args) {
        const query = args[0];
        const text = args[1];
        if (throttled()) return Promise.resolve([]);
        if (query != null && typeof query !== 'string') {
          try {
            return Reflect.apply(orig, this, args);
          } catch (e) {
            __fontDiagBrowser('warn', 'fonts:promise:load:native_throw', {
              stage: 'runtime',
              key: 'FontFaceSet.load',
              message: 'FontFaceSet.load threw',
              data: { outcome: 'throw', reason: 'native_throw' }
            }, e);
            throw e;
          }
        }
        if (!validFontQuery(query)) return Promise.resolve([]);
        if (text != null && typeof text !== 'string') {
          try {
            return Reflect.apply(orig, this, args);
          } catch (e) {
            __fontDiagBrowser('warn', 'fonts:promise:load:native_throw', {
              stage: 'runtime',
              key: 'FontFaceSet.load',
              message: 'FontFaceSet.load threw',
              data: { outcome: 'throw', reason: 'native_throw' }
            }, e);
            throw e;
          }
        }
        try {
          return Reflect.apply(orig, this, args);
        } catch (e) {
          __fontDiagBrowser('warn', 'fonts:promise:load:native_throw', {
            stage: 'runtime',
            key: 'FontFaceSet.load',
            message: 'FontFaceSet.load threw',
            data: { outcome: 'throw', reason: 'native_throw' }
          }, e);
          throw e;
        }
      }
  }], 'skip');
})();

  const domPlat = window.__NAV_PLATFORM__;
  if (!domPlat) {
    // preflight soft-skip: keep awaitFontsReady as native document.fonts.ready where possible
    __fontDiagPipeline('warn', 'fonts:nav_platform_missing', {
      stage: 'preflight',
      diagTag: 'fonts',
      key: '__NAV_PLATFORM__',
      message: '__NAV_PLATFORM__ missing (skip font patch)',
      data: { outcome: 'skip', reason: 'missing_nav_platform' }
    }, null);
    try {
      if (typeof document === 'object' && document && document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
        __setFontsAwaitState(document.fonts.ready, 'native', null, null);
      }
    } catch (eRestore) {
      degrade('fonts:await_ready_restore_failed', eRestore);
    }
    __releaseGuardOnSkip('releaseGuardFlag threw on nav_platform skip', __flagKey, 'guard_release_failed');
    return;
  }

  const allFonts = Array.isArray(window.fontPatchConfigs) ? window.fontPatchConfigs : [];
  const hasPlatformDom = allFonts.some(f => f && typeof f.platform_dom === 'string');
  const fonts = (hasPlatformDom && domPlat) ? allFonts.filter(f => f.platform_dom === domPlat) : allFonts;
  if (!fonts.length) {
    __fontDiagPipeline('warn', 'fonts:filtered_empty', {
      stage: 'preflight',
      diagTag: 'fonts',
      key: 'fontPatchConfigs',
      message: 'filtered fonts list is empty',
      data: { platform: domPlat }
    }, null);
  } else {
    __fontDiagPipeline('info', 'fonts:filtered_count', {
      stage: 'preflight',
      diagTag: 'fonts',
      key: 'fontPatchConfigs',
      message: 'filtered fonts list prepared',
      data: { platform: domPlat, count: fonts.length }
    }, null);
  }




  // --- DOM override for quick macOS check (optional, debugging) ---
  (function () {
    // в worker’е документа нет — выходим
    if (typeof document === 'undefined') return;

    const domPlat = window.__NAV_PLATFORM__;
    if (!domPlat) {
      __fontDiagPipeline('warn', 'fonts:dom_override_nav_platform_missing', {
        stage: 'preflight',
        diagTag: 'fonts',
        key: '__NAV_PLATFORM__',
        message: '__NAV_PLATFORM__ missing (skip dom override)',
        data: { outcome: 'skip', reason: 'missing_nav_platform' }
      }, null);
      return;
    }

    // строго только под macOS и только если есть что применять
    function run() {
      if (domPlat !== 'MacIntel') return;

      const allFonts = Array.isArray(window.fontPatchConfigs) ? window.fontPatchConfigs : [];
      const hasPlatformDom = allFonts.some(f => f && typeof f.platform_dom === 'string');
      const fonts = (hasPlatformDom && domPlat) ? allFonts.filter(f => f.platform_dom === domPlat) : allFonts;
      if (!fonts.length) {
        __fontDiagPipeline('warn', 'fonts:dom_override_filtered_empty', {
          stage: 'preflight',
          diagTag: 'fonts',
          key: 'fontPatchConfigs',
          message: 'dom override skipped: no filtered fonts',
          data: { platform: domPlat }
        }, null);
        return;
      }

      const testFam = (fonts[0].cssFamily || fonts[0].family);
      if (!testFam) return;

      const testFamCss = JSON.stringify(String(testFam));

      // idempotent: не плодим несколько <style id="force-font-override">
      let el = document.getElementById('force-font-override');
      if (!el) {
        el = document.createElement('style');
        el.id = 'force-font-override';
        // вставляем в head, если он уже есть; иначе — в documentElement/body
        const parent =
          document.head ||
          document.documentElement ||
          document.body;
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
      __fontDiagPipeline('info', 'fonts:dom_override_applied', {
        stage: 'apply',
        diagTag: 'fonts',
        key: 'force-font-override',
        message: 'dom override style applied',
        data: { platform: domPlat, family: testFam }
      }, null);
    }

    // дождаться готовности DOM, чтобы не ловить appendChild на null
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      run();
    }
})();


  // ===  window branch (DOM exist here) ====
  if (typeof document === 'object' && document) {
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
              document.fonts.add(loaded);
            } catch (eAdd) {
              __fontDiagBrowser('warn', 'fonts:document_fonts_add_failed', {
                stage: 'runtime',
                diagTag: 'fonts',
                key: 'document.fonts',
                message: 'document.fonts.add failed',
                data: { outcome: 'throw', reason: 'document_fonts_add_failed', family: fam }
              }, eAdd);
              throw eAdd;
            }
            return fam;
          });
        } catch (e) {
          __fontDiagBrowser('warn', 'fonts:load_item_failed', {
            stage: 'runtime',
            diagTag: 'fonts',
            key: 'fontPatchConfigs',
            message: 'font item build failed',
            data: { outcome: 'skip', reason: 'font_item_build_failed' }
          }, e);
          return Promise.reject(e);
        }
      })
    ).then((results) => {
      const loaded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      // controlled settle: если native document.fonts.ready завис, разрываем pending через double RAF fallback
      let nativeReadySettled = false;
      const nativeReady = (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function')
        ? Promise.resolve(document.fonts.ready)
            .then(() => __doubleRafBarrier())
            .then(() => {
              nativeReadySettled = true;
              return { kind: 'native_ready' };
            }, (e) => {
              nativeReadySettled = true;
              throw e;
            })
        : Promise.resolve({ kind: 'native_ready_missing' });
      const readyFallback = __doubleRafBarrier().then(() => ({ kind: 'fallback_raf' }));

      return Promise.race([nativeReady, readyFallback]).then((readyInfo) => {
          if (readyInfo && readyInfo.kind === 'fallback_raf') {
            return __doubleRafBarrier().then(() => {
              const nativeStatus = (document.fonts && typeof document.fonts.status === 'string') ? document.fonts.status : null;
              const ownAwaitState = (__fontsState.awaitReadyStatus === 'pending')
                ? __fontsState.awaitReadyStatus
                : null;
              if (!nativeReadySettled && ownAwaitState === 'pending' && nativeStatus === 'loading') {
                __fontDiagPipeline('warn', 'fonts:await_ready_native_pending_fallback', {
                  stage: 'runtime',
                  diagTag: 'fonts',
                  key: 'awaitFontsReady',
                  message: 'document.fonts.ready pending; fallback settle used',
                  data: {
                    outcome: 'return',
                    reason: 'await_ready_native_pending_fallback',
                    loaded: loaded,
                    failed: failed,
                    nativeStatus: nativeStatus,
                    ownAwaitState: ownAwaitState
                  }
                }, null);
              }
              return readyInfo;
            });
          }
          return readyInfo;
        }).then((readyInfo) => {
          if (failed > 0) {
            const first = results.find((r) => r.status === 'rejected');
            const err = first && ('reason' in first) ? first.reason : new Error('font load failed');

            __setFontsRuntimeState(false, null);
            try {
              __fontsState.error = String((err && (err.stack || err.message)) || err);
            } catch (eSet) {
              degrade('fonts:data:set_error_failed', eSet);
            }

            __settleAwaitFontsReady('rejected', err);
            __fontDiagBrowser('warn', 'fonts:load_settled_with_failures', {
              stage: 'runtime',
              diagTag: 'fonts',
              key: 'document.fonts',
              message: 'font load settled with failures',
              data: { outcome: 'skip', reason: 'load_settled_with_failures', loaded: loaded, failed: failed }
            }, err);
            return;
          }

          __setFontsRuntimeState(true, null);
          __settleAwaitFontsReady('resolved');
          try {
            if (window.dispatchEvent) window.dispatchEvent(new Event('fontsready'));
          } catch (eEvt) {
            degrade('fonts:event:dispatch_failed', eEvt);
          }
           __fontDiagPipeline('info', 'fonts:load_settled', {
             stage: 'runtime',
             diagTag: 'fonts',
             key: 'document.fonts',
             message: 'font load settled',
             data: { outcome: 'return', loaded: loaded, failed: failed }
            }, null);
          });
    }).catch((e) => {
      // no "наружу": перехватываем неожиданные промис-ошибки и оставляем нативное состояние
      __setFontsRuntimeState(false, null);
      try {
        __fontsState.error = String((e && (e.stack || e.message)) || e);
      } catch (eSet) {
        degrade('fonts:data:set_error_failed', eSet);
      }
      try {
        __settleAwaitFontsReady('rejected', e);
      } catch (eRej) {
        degrade('fonts:await_ready_reject_failed', eRej);
      }
      __fontDiagBrowser('error', 'fonts:load_unexpected_rejection', {
        stage: 'runtime',
        diagTag: 'fonts',
        key: 'document.fonts',
        message: 'unexpected rejection in font load pipeline',
        data: { outcome: 'skip', reason: 'unexpected_rejection' }
      }, e);
    });
  
      // CSS @font-face →Only in the window
  (function injectCss(){
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
      let styleEl = document.getElementById(tagId) || document.createElement('style');
      styleEl.id = tagId;
      (document.head || document.documentElement || document.body).appendChild(styleEl);
      styleEl.textContent = css;
    };

    // НОВОЕ: не ждём строго DOMContentLoaded — пробуем как только появляется контейнер
    if (document.readyState === 'loading') {
      const tryApply = () => {
        if (document.head || document.documentElement || document.body) apply();
        else requestAnimationFrame(tryApply);
      };
      tryApply();
    } else {
      apply();
    }
  })();
  }
  } catch (e) {
    let rollbackErr = null;
    if (__applyStarted) {
      try {
        __restoreFontsStateValue(__rollbackSnapshot.fontsStateValue);
        if (__rollbackSnapshot.awaitFontsReadyOwn) {
          if (__rollbackSnapshot.awaitFontsReadyDesc) {
            Object.defineProperty(window, 'awaitFontsReady', __rollbackSnapshot.awaitFontsReadyDesc);
          }
        } else {
          delete window.awaitFontsReady;
        }
        if (__rollbackSnapshot.fontsReadyOwn) {
          if (__rollbackSnapshot.fontsReadyDesc) {
            Object.defineProperty(window, '__FONTS_READY__', __rollbackSnapshot.fontsReadyDesc);
          }
        } else {
          delete window.__FONTS_READY__;
        }
        if (__rollbackSnapshot.fontsErrorOwn) {
          if (__rollbackSnapshot.fontsErrorDesc) {
            Object.defineProperty(window, '__FONTS_ERROR__', __rollbackSnapshot.fontsErrorDesc);
          }
        } else {
          delete window.__FONTS_ERROR__;
        }
      } catch (re) {
        rollbackErr = re;
        __fontDiagBrowser('error', 'fonts:rollback_failed', {
          stage: 'rollback',
          diagTag: __tag,
          surface: __surface,
          key: null,
          message: 'rollback failed',
          data: { outcome: 'rollback', reason: 'rollback_failed' }
        }, re);
      }
    }

    const rollbackOk = __applyStarted ? !rollbackErr : true;
    __fontDiagBrowser('error', 'fonts:fatal', {
      stage: 'apply',
      diagTag: __tag,
      surface: __surface,
      key: null,
      message: 'fatal module error',
      data: { outcome: 'throw', reason: 'fatal', rollbackOk: rollbackOk }
    }, rollbackErr || e);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, rollbackOk, __tag);
      }
    } catch (eRelease) {
      __fontDiagPipeline('warn', 'fonts:guard_release_failed', {
        stage: 'rollback',
        diagTag: __tag,
        surface: __surface,
        key: __flagKey,
        message: 'releaseGuardFlag threw after apply failure',
        data: { outcome: rollbackOk ? 'rollback' : 'skip', reason: 'guard_release_failed' }
      }, eRelease);
    }
    throw (rollbackErr || e);
  }
}

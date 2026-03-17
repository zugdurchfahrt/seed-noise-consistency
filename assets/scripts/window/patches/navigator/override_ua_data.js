(function(){
  'use strict';
  const g = window;
  const __MODULE = 'override_ua_data';
  const __SURFACE = 'navigator';
  const __TYPE_PIPELINE = 'pipeline missing data';
  const __TYPE_BROWSER = 'browser structure missing data';
  const Core = g && g.Core;
  const __uaSnapshot = (typeof g.__USER_AGENT === 'string' && g.__USER_AGENT) ? g.__USER_AGENT : null;

  // ---- NORMATIVE: local diag adapter (single gateway; no local normalization) ----
  const __loggerRoot = (g && g.CanvasPatchContext && g.CanvasPatchContext.__logger && typeof g.CanvasPatchContext.__logger === 'object')
    ? g.CanvasPatchContext.__logger
    : null;
  const __D = (__loggerRoot && typeof __loggerRoot.__DEGRADE__ === 'function') ? __loggerRoot.__DEGRADE__ : null;
  const __diag = (__D && typeof __D.diag === 'function') ? __D.diag.bind(__D) : null;
  function __emit(level, code, ctx, err) {
    try {
      if (__diag) return __diag(level, code, ctx, err);
      if (typeof __D === 'function') {
        const safeCtx = (ctx && typeof ctx === 'object') ? ctx : {};
        const safeLevel = (level === undefined || level === null) ? 'info' : level;
        const safeErr = (err === undefined || err === null) ? null : err;
        return __D(code, safeErr, Object.assign({}, safeCtx, { level: safeLevel }));
      }
    } catch (emitErr) {
      return undefined;
    }
  }
  function __moduleDiag(level, code, extra, err) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    const ctx = {
      module: __MODULE,
      diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : __MODULE,
      surface: (typeof x.surface === 'string' && x.surface) ? x.surface : __SURFACE,
      key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
      stage: x.stage,
      message: x.message,
      data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
      type: x.type
    };
    return __emit(level, String(code || (__MODULE + ':diag')), ctx, (err === undefined ? null : err));
  }
  function __diagPipeline(level, code, extra, err) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    const y = Object.assign({}, x);
    if (typeof y.type !== 'string' || !y.type) y.type = __TYPE_PIPELINE;
    return __moduleDiag(level, code, y, err);
  }
  function __diagBrowser(level, code, extra, err) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    const y = Object.assign({}, x);
    if (typeof y.type !== 'string' || !y.type) y.type = __TYPE_BROWSER;
    return __moduleDiag(level, code, y, err);
  }

  // ---- TEMPORARY: module is present but disabled by default (opt-in via profile) ----
  // Purpose: keep legacy file available without accidental activation/conflicts in pipeline.
  // Enable only by setting: window.__PROFILE__.override_ua_data_enabled === true
  const __profile = g.__PROFILE__;
  const __moduleEnabled = !!(__profile && __profile.override_ua_data_enabled === true);
  if (!__moduleEnabled) {
    __diagPipeline('info', __MODULE + ':disabled', {
      diagTag: __MODULE,
      surface: __SURFACE,
      key: null,
      stage: 'preflight',
      message: 'module present but disabled (profile.override_ua_data_enabled !== true)',
      data: { outcome: 'skip', reason: 'disabled' }
    }, null);
    return;
  }

  // last group outcome (for guard release policy)
  let __groupStage = null;
  let __groupOutcome = null;
  let __groupReason = null;
  let __groupRollbackOk = true;
  let __groupEmitted = false;
  let __fatalReported = false;

  function cloneDesc(d){
    if (!d) return null;
    const out = {};
    if ('configurable' in d) out.configurable = d.configurable;
    if ('enumerable' in d) out.enumerable = d.enumerable;
    if ('writable' in d) out.writable = d.writable;
    if ('value' in d) out.value = d.value;
    if ('get' in d) out.get = d.get;
    if ('set' in d) out.set = d.set;
    return out;
  }

  function isSameDescriptor(actual, expected){
    if (!actual || !expected) return false;
    const keys = ['configurable', 'enumerable', 'writable', 'value', 'get', 'set'];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (Object.prototype.hasOwnProperty.call(expected, k) && actual[k] !== expected[k]) return false;
    }
    return true;
  }

  function applyTargetGroup(groupTag, targets, policy){
    __groupStage = 'apply';
    __groupOutcome = 'return';
    __groupReason = 'ok';
    __groupRollbackOk = true;
    __groupEmitted = false;

    const groupPolicy = policy === 'throw' ? 'throw' : 'skip';
    let plans = [];
    try {
      __groupStage = 'preflight';
      plans = Core.applyTargets(targets, g.__PROFILE__, []);
    } catch (e) {
      __groupOutcome = 'skip';
      __groupReason = 'preflight_failed';
      __groupEmitted = true;
      __diagPipeline((groupPolicy === 'throw') ? 'error' : 'warn', groupTag + ':preflight_failed', {
        stage: 'preflight',
        key: null,
        message: 'Core.applyTargets threw (preflight)',
        data: { outcome: 'skip', reason: 'preflight_failed' }
      }, e);
      if (groupPolicy === 'throw') throw e;
      return 0;
    }
    if (!Array.isArray(plans) || !plans.length) {
      __groupOutcome = 'skip';
      __groupReason = (plans && plans.reason) ? String(plans.reason) : 'group_skipped';
      __groupEmitted = true;
      __diagPipeline((groupPolicy === 'throw') ? 'error' : 'warn', groupTag + ':' + __groupReason, {
        stage: 'preflight',
        key: null,
        message: 'group skipped',
        data: { outcome: 'skip', reason: __groupReason }
      }, null);
      return 0;
    }

    const done = [];
    try {
      for (let i = 0; i < plans.length; i++) {
        const p = plans[i];
        if (!p || p.skipApply) continue;
        if (!p.owner || typeof p.key !== 'string' || !p.nextDesc) {
          throw new Error('[override_ua_data] invalid plan item');
        }
        Object.defineProperty(p.owner, p.key, p.nextDesc);
        const after = Object.getOwnPropertyDescriptor(p.owner, p.key);
        if (!isSameDescriptor(after, p.nextDesc)) {
          throw new Error('[override_ua_data] descriptor post-check mismatch');
        }
        done.push(p);
      }
      __groupOutcome = 'return';
      __groupReason = 'applied';
      return done.length;
    } catch (e) {
      for (let i = done.length - 1; i >= 0; i--) {
        const p = done[i];
        try {
          if (p.origDesc) Object.defineProperty(p.owner, p.key, cloneDesc(p.origDesc));
          else delete p.owner[p.key];
        } catch (rollbackErr) {
          __groupRollbackOk = false;
          __diagBrowser('error', groupTag + ':rollback_failed', {
            stage: 'rollback',
            key: p && p.key ? p.key : null,
            message: 'rollback failed',
            data: { outcome: 'rollback', reason: 'rollback_failed' }
          }, rollbackErr);
        }
      }
      __groupOutcome = 'rollback';
      __groupReason = 'apply_failed';
      __groupEmitted = true;
      __diagBrowser('error', groupTag + ':apply_failed', {
        stage: 'apply',
        key: null,
        message: 'apply failed (rolled back)',
        data: { outcome: 'rollback', reason: 'apply_failed', rollbackOk: __groupRollbackOk }
      }, e);
      if (groupPolicy === 'throw') throw e;
      return 0;
    }
  }

  function isObj(x){ return !!x && (typeof x === 'object' || typeof x === 'function'); }

  try {
    // ===== MODULE: canonical guard client (integrated; NORMATIVE exit contract) =====
    const __core = Core;
    const __flagKey = '__PATCH_OVERRIDE_UA_DATA__';
    const __tag = __MODULE;
    const __surface = __SURFACE;

    let __guardToken = null;
    try {
      if (!__core || typeof __core.guardFlag !== 'function' || typeof __core.releaseGuardFlag !== 'function') {
        __diagPipeline('warn', __tag + ':guard_missing', {
          module: __tag,
          diagTag: __tag,
          surface: __surface,
          key: __flagKey,
          stage: 'guard',
          message: 'Core.guardFlag/releaseGuardFlag missing',
          data: { outcome: 'skip', reason: 'missing_dep_core_guard_release' }
        }, null);
        return;
      }
      __guardToken = __core.guardFlag(__flagKey, __tag);
    } catch (e) {
      __diagPipeline('warn', __tag + ':guard_failed', {
        module: __tag,
        diagTag: __tag,
        surface: __surface,
        key: __flagKey,
        stage: 'guard',
        message: 'guardFlag threw',
        data: { outcome: 'skip', reason: 'guard_failed' }
      }, e);
      return;
    }
    if (!__guardToken) return; // already_patched: Core emits <tag>:already_patched

    try {
      // ---- Preflight ----
      if (!Core || typeof Core.applyTargets !== 'function') {
        __diagPipeline('warn', __tag + ':core_missing', {
          diagTag: __tag,
          surface: __surface,
          key: 'Core.applyTargets',
          stage: 'preflight',
          message: 'Core.applyTargets missing',
          data: { outcome: 'skip', reason: 'missing_dep_core_applyTargets' }
        }, null);
        try {
          if (__core && typeof __core.releaseGuardFlag === 'function') {
            __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
          }
        } catch (e) {
          __diagPipeline('warn', __tag + ':guard_release_failed', {
            diagTag: __tag,
            surface: __surface,
            key: __flagKey,
            stage: 'guard',
            message: 'releaseGuardFlag threw (preflight)',
            data: { outcome: 'skip', reason: 'guard_release_failed' }
          }, e);
        }
        return;
      }

      const nav = navigator;
      const proto = Object.getPrototypeOf(nav) || (typeof Navigator !== 'undefined' && Navigator && Navigator.prototype);
      if (!proto) {
        __diagBrowser('warn', __tag + ':navigator_proto_missing', {
          diagTag: __tag,
          surface: __surface,
          key: 'Navigator.prototype',
          stage: 'preflight',
          message: 'Navigator prototype missing',
          data: { outcome: 'skip', reason: 'navigator_proto_missing' }
        }, null);
        try {
          if (__core && typeof __core.releaseGuardFlag === 'function') {
            __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
          }
        } catch (e) {
          __diagPipeline('warn', __tag + ':guard_release_failed', {
            diagTag: __tag,
            surface: __surface,
            key: __flagKey,
            stage: 'guard',
            message: 'releaseGuardFlag threw (preflight)',
            data: { outcome: 'skip', reason: 'guard_release_failed' }
          }, e);
        }
        return;
      }

      function validNavThis(self){
        return !!self && (self === nav || proto.isPrototypeOf(self));
      }

      const targets = [];
      if (!(typeof __uaSnapshot === 'string' && __uaSnapshot)) {
        __diagPipeline('warn', __tag + ':ua_missing', {
          diagTag: __tag,
          surface: __surface,
          key: '__USER_AGENT',
          stage: 'preflight',
          message: 'window.__USER_AGENT missing',
          data: { outcome: 'skip', reason: 'missing_user_agent' }
        }, null);
        try {
          if (__core && typeof __core.releaseGuardFlag === 'function') {
            __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
          }
        } catch (e) {
          __diagPipeline('warn', __tag + ':guard_release_failed', {
            diagTag: __tag,
            surface: __surface,
            key: __flagKey,
            stage: 'guard',
            message: 'releaseGuardFlag threw (preflight)',
            data: { outcome: 'skip', reason: 'guard_release_failed' }
          }, e);
        }
        return;
      }

      const dUA = Object.getOwnPropertyDescriptor(proto, 'userAgent');
      if (!dUA || typeof dUA.get !== 'function') {
        __diagBrowser('warn', __tag + ':userAgent_descriptor_missing', {
          diagTag: __tag,
          surface: __surface,
          key: 'navigator.userAgent',
          stage: 'preflight',
          message: 'navigator.userAgent descriptor missing',
          data: { outcome: 'skip', reason: 'descriptor_missing' }
        }, null);
        try {
          if (__core && typeof __core.releaseGuardFlag === 'function') {
            __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
          }
        } catch (e) {
          __diagPipeline('warn', __tag + ':guard_release_failed', {
            diagTag: __tag,
            surface: __surface,
            key: __flagKey,
            stage: 'guard',
            message: 'releaseGuardFlag threw (preflight)',
            data: { outcome: 'skip', reason: 'guard_release_failed' }
          }, e);
        }
        return;
      }

      targets.push({
        owner: proto,
        key: 'userAgent',
        kind: 'accessor',
        wrapLayer: 'core_wrapper',
        resolve: 'own',
        policy: 'skip',
        diagTag: __tag + ':userAgent',
        allowCreate: false,
        configurable: !!dUA.configurable,
        enumerable: !!dUA.enumerable,
        validThis: validNavThis,
        invalidThis: 'native',
        getImpl: function getUAImpl(origGet){
          if (!isObj(this)) return Reflect.apply(origGet, this, []);
          return __uaSnapshot;
        }
      });

      const applied = applyTargetGroup(__tag + ':navigator', targets, 'skip');
      if (applied > 0) {
        __moduleDiag('info', __tag + ':applied', {
          diagTag: __tag,
          surface: __surface,
          key: 'navigator.userAgent',
          stage: 'apply',
          message: 'override applied',
          data: { outcome: 'return', reason: 'applied', applied: applied }
        }, null);
        return;
      }

      // If we reached here, group did not apply any target (skip or rollback).
      const outcome = (__groupOutcome === 'rollback') ? 'rollback' : 'skip';
      const rollbackOk = (__groupOutcome === 'rollback') ? !!__groupRollbackOk : true;
      if (!__groupEmitted) {
        __moduleDiag((outcome === 'rollback') ? 'error' : 'warn', __tag + ':not_applied', {
          diagTag: __tag,
          surface: __surface,
          key: 'navigator.userAgent',
          stage: __groupStage || 'apply',
          message: 'override not applied',
          data: { outcome: outcome, reason: (__groupReason || 'not_applied'), rollbackOk: rollbackOk }
        }, null);
      }
      try {
        if (__core && typeof __core.releaseGuardFlag === 'function') {
          __core.releaseGuardFlag(__flagKey, __guardToken, rollbackOk, __tag);
        }
      } catch (e) {
        __diagPipeline('warn', __tag + ':guard_release_failed', {
          diagTag: __tag,
          surface: __surface,
          key: __flagKey,
          stage: 'guard',
          message: 'releaseGuardFlag threw (post-apply)',
          data: { outcome: 'skip', reason: 'guard_release_failed' }
        }, e);
      }
    } catch (e) {
      const rollbackOk = (__groupOutcome === 'rollback') ? !!__groupRollbackOk : false;
      __fatalReported = true;
      __diagBrowser('error', __tag + ':fatal', {
        diagTag: __tag,
        surface: __surface,
        key: null,
        stage: 'apply',
        message: 'fatal module error',
        data: { outcome: 'throw', reason: 'fatal', rollbackOk: rollbackOk }
      }, e);
      try {
        if (__core && typeof __core.releaseGuardFlag === 'function') {
          __core.releaseGuardFlag(__flagKey, __guardToken, rollbackOk, __tag);
        }
      } catch (re) {
        __diagPipeline('warn', __tag + ':guard_release_failed', {
          diagTag: __tag,
          surface: __surface,
          key: __flagKey,
          stage: 'guard',
          message: 'releaseGuardFlag threw (fatal)',
          data: { outcome: 'skip', reason: 'guard_release_failed' }
        }, re);
      }
      throw e;
    }
  } catch(e) {
    if (__fatalReported) throw e;
    // Fail-fast at module entrypoint is allowed (not a public API).
    __diagBrowser('error', __MODULE + ':fatal', {
      diagTag: __MODULE,
      surface: __SURFACE,
      key: null,
      stage: 'apply',
      message: 'fatal module error',
      data: { outcome: 'throw', reason: 'fatal' }
    }, e);
    throw e;
  }
})();

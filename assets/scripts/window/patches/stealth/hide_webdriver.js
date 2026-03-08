const HideWebdriverPatchModule = function HideWebdriverPatchModule(window) {
  const __MODULE = 'hide_webdriver';
  const __SURFACE = 'navigator';
  const __typePipeline = 'pipeline missing data';
  const __typeBrowser = 'browser structure missing data';

  const __D = window && window.__DEGRADE__;
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
      surface: __SURFACE,
      key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
      stage: x.stage,
      message: x.message,
      data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
      type: x.type
    };
    return __emit(level, code, ctx, err);
  }

  function degrade(code, err, extra) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    return __moduleDiag(x.level, code, x, err);
  }

  const C = window.CanvasPatchContext;
  if (!C) {
    degrade('hide_webdriver:canvas_patch_context_missing', new Error('[HideWebdriverPatchModule] CanvasPatchContext missing'), {
      level: 'warn',
      stage: 'preflight',
      message: 'CanvasPatchContext missing',
      type: __typePipeline,
      data: { outcome: 'skip', reason: 'canvas_patch_context_missing', missing: 'CanvasPatchContext' }
    });
    return;
  }

  const Core = window && window.Core;
  if (!Core || typeof Core.applyTargets !== 'function' || typeof Core.registerPatchedTarget !== 'function') {
    degrade('hide_webdriver:core_missing', new Error('[HideWebdriverPatchModule] Core.applyTargets/registerPatchedTarget missing'), {
      level: 'fatal',
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
    });
    return;
  }

  const safeDefine = (function() {
    const sd = (window && typeof window.__safeDefine === 'function') ? window.__safeDefine : null;
    if (typeof sd !== 'function') {
      degrade('hide_webdriver:safe_define_missing', new Error('[HideWebdriverPatchModule] safeDefine missing'), {
        level: 'fatal',
        key: '__safeDefine',
        stage: 'preflight',
        message: 'safeDefine missing',
        type: __typePipeline,
        data: { outcome: 'skip', reason: 'safe_define_missing', missing: '__safeDefine' }
      });
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
      degrade(__tag + ':guard_missing', null, {
        level: 'warn',
        diagTag: __tag,
        key: __flagKey,
        stage: 'guard',
        message: 'Core.guardFlag missing',
        type: __typePipeline,
        data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
      });
      return;
    }
    __guardToken = __core.guardFlag(__flagKey, __tag);
  } catch (e) {
    degrade(__tag + ':guard_failed', e, {
      level: 'warn',
      diagTag: __tag,
      key: __flagKey,
      stage: 'guard',
      message: 'guardFlag threw',
      type: __typePipeline,
      data: { outcome: 'skip', reason: 'guard_failed' }
    });
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
      plans = Core.applyTargets(targets, window.__PROFILE__, []);
    } catch (e) {
      degrade(groupTag + ':preflight_failed', e, {
        level: 'error',
        diagTag: groupTag,
        key: null,
        stage: 'preflight',
        message: 'Core.applyTargets threw',
        type: __typePipeline,
        data: { outcome: groupPolicy === 'throw' ? 'throw' : 'skip', reason: 'preflight_failed', policy: groupPolicy }
      });
      if (groupPolicy === 'throw') {
        if (e && typeof e === 'object') { e.__rollbackOk = true; e.__stage = 'preflight'; }
        throw e;
      }
      return 0;
    }

    if (!Array.isArray(plans) || !plans.length) {
      const reason = (plans && plans.reason) ? plans.reason : 'group_skipped';
      const e = new Error('[HideWebdriverPatchModule] group skipped');
      degrade(groupTag + ':group_skipped', e, {
        level: 'warn',
        diagTag: groupTag,
        key: null,
        stage: 'preflight',
        message: 'target group skipped',
        type: __typeBrowser,
        data: { outcome: 'skip', reason: reason, policy: groupPolicy }
      });
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
          degrade(groupTag + ':registry_failed', e, {
            level: 'warn',
            diagTag: groupTag,
            key: p && p.key ? p.key : null,
            stage: 'apply',
            message: 'Core.registerPatchedTarget failed',
            type: __typePipeline,
            data: { outcome: 'skip', reason: 'registry_failed' }
          });
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
        degrade(groupTag + ':rollback_failed', rollbackErr, {
          level: 'error',
          diagTag: groupTag,
          key: null,
          stage: 'rollback',
          message: 'rollback failed',
          type: __typeBrowser,
          data: { outcome: 'skip', reason: 'rollback_failed', policy: groupPolicy }
        });
      }
      degrade(groupTag + ':apply_failed', e, {
        level: 'error',
        diagTag: groupTag,
        key: null,
        stage: 'apply',
        message: 'apply failed',
        type: __typeBrowser,
        data: { outcome: groupPolicy === 'throw' ? 'throw' : 'skip', reason: 'apply_failed', policy: groupPolicy, rollbackOk: !rollbackErr }
      });
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
      degrade('hide_webdriver:webdriver_missing', null, {
        level: 'warn',
        diagTag: 'hide_webdriver:webdriver',
        key: 'webdriver',
        stage: 'preflight',
        message: 'webdriver descriptor missing',
        type: __typeBrowser,
        data: { outcome: 'skip', reason: 'webdriver_missing', resolve: 'proto_chain' }
      });
      try {
        if (__core && typeof __core.releaseGuardFlag === 'function') {
          __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
        }
      } catch (eRelease) {
        degrade(__tag + ':guard_release_failed', eRelease, {
          level: 'warn',
          diagTag: __tag,
          key: __flagKey,
          stage: 'guard',
          message: 'releaseGuardFlag threw on preflight skip',
          type: __typePipeline,
          data: { outcome: 'skip', reason: 'guard_release_failed' }
        });
      }
      return;
    } else {
      const wdDesc = cloneDesc(wdResolved.desc);
      const wdOwner = (wdResolved && wdResolved.owner) ? wdResolved.owner : navProto;
      if (wdDesc && wdDesc.configurable === false) {
        const e = new TypeError('[HideWebdriverPatchModule] webdriver non-configurable');
        degrade('hide_webdriver:webdriver_non_configurable', e, {
          level: 'fatal',
          diagTag: 'hide_webdriver:webdriver',
          key: 'webdriver',
          stage: 'preflight',
          message: 'webdriver non-configurable',
          type: __typeBrowser,
          data: { outcome: 'skip', reason: 'webdriver_non_configurable', configurable: false }
        });
        try {
          if (__core && typeof __core.releaseGuardFlag === 'function') {
            __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
          }
        } catch (eRelease) {
          degrade(__tag + ':guard_release_failed', eRelease, {
            level: 'warn',
            diagTag: __tag,
            key: __flagKey,
            stage: 'guard',
            message: 'releaseGuardFlag threw on preflight skip',
            type: __typePipeline,
            data: { outcome: 'skip', reason: 'guard_release_failed' }
          });
        }
        return;
      }
      if (!wdOwner || wdOwner === nav) {
        degrade('hide_webdriver:webdriver_owner_mismatch', null, {
          level: 'error',
          diagTag: 'hide_webdriver:webdriver',
          key: 'webdriver',
          stage: 'preflight',
          message: 'webdriver resolved to instance owner',
          type: __typeBrowser,
          data: { outcome: 'skip', reason: 'instance_owner_resolved' }
        });
        try {
          if (__core && typeof __core.releaseGuardFlag === 'function') {
            __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
          }
        } catch (eRelease) {
          degrade(__tag + ':guard_release_failed', eRelease, {
            level: 'warn',
            diagTag: __tag,
            key: __flagKey,
            stage: 'guard',
            message: 'releaseGuardFlag threw on preflight skip',
            type: __typePipeline,
            data: { outcome: 'skip', reason: 'guard_release_failed' }
          });
        }
        return;
      }
      const wdIsData = !!wdDesc && Object.prototype.hasOwnProperty.call(wdDesc, 'value') && !wdDesc.get && !wdDesc.set;
      const wdTarget = {
        owner: wdOwner,
        key: 'webdriver',
        resolve: 'proto_chain',
        policy: 'strict',
        wrapLayer: 'named_wrapper_strict',
        diagTag: 'hide_webdriver:webdriver',
        kind: 'accessor',
        allowCreate: false,
        configurable: !!wdDesc.configurable,
        enumerable: !!wdDesc.enumerable,
        getImpl: function getWebdriverImpl() { return false; },
        validThis: __isNavigatorThis,
        invalidThis: 'native'
      };
      if (wdIsData) {
        wdTarget.allowShapeChange = true;
      }
      const applied = applyTargetGroup('hide_webdriver:webdriver', [wdTarget], 'throw');
      if (!applied) {
        try {
          if (__core && typeof __core.releaseGuardFlag === 'function') {
            __core.releaseGuardFlag(__flagKey, __guardToken, true, __tag);
          }
        } catch (eRelease) {
          degrade(__tag + ':guard_release_failed', eRelease, {
            level: 'warn',
            diagTag: __tag,
            key: __flagKey,
            stage: 'guard',
            message: 'releaseGuardFlag threw on preflight skip',
            type: __typePipeline,
            data: { outcome: 'skip', reason: 'guard_release_failed' }
          });
        }
        return;
      }
    }
  } catch (e) {
    const stage = (e && typeof e === 'object' && typeof e.__stage === 'string') ? e.__stage : 'apply';
    const rollbackOk = !!(e && typeof e === 'object' && e.__rollbackOk === true);
    degrade('hide_webdriver:fatal', e, {
      level: 'fatal',
      diagTag: __tag,
      key: null,
      stage: stage === 'preflight' ? 'preflight' : 'apply',
      message: stage === 'preflight' ? 'preflight exception' : 'fatal error',
      type: stage === 'preflight' ? __typePipeline : __typeBrowser,
      data: { outcome: 'skip', reason: stage === 'preflight' ? 'preflight_exception' : 'fatal', rollbackOk }
    });
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, rollbackOk, __tag);
      }
    } catch (eRelease) {
      degrade(__tag + ':guard_release_failed', eRelease, {
        level: 'warn',
        diagTag: __tag,
        key: __flagKey,
        stage: 'rollback',
        message: 'releaseGuardFlag threw after fatal error',
        type: __typePipeline,
        data: { outcome: 'skip', reason: 'guard_release_failed' }
      });
    }
    return;
  }

  // Success: per GuardFlag policy, do not release guard on success.
  degrade('hide_webdriver:ready', null, {
    level: 'info',
    diagTag: __tag,
    key: 'webdriver',
    stage: 'apply',
    message: 'hide_webdriver ready',
    type: 'ok',
    data: { outcome: 'return', reason: 'ready' }
  });

  } catch (e) {
    degrade('hide_webdriver:fatal_unhandled', e, {
      level: 'fatal',
      diagTag: __tag,
      key: null,
      stage: 'apply',
      message: 'fatal unhandled error',
      type: __typeBrowser,
      data: { outcome: 'skip', reason: 'fatal_unhandled', rollbackOk: false }
    });
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, false, __tag);
      }
    } catch (eRelease) {
      degrade(__tag + ':guard_release_failed', eRelease, {
        level: 'warn',
        diagTag: __tag,
        key: __flagKey,
        stage: 'rollback',
        message: 'releaseGuardFlag threw after fatal_unhandled',
        type: __typePipeline,
        data: { outcome: 'skip', reason: 'guard_release_failed' }
      });
    }
    return;
  }
};

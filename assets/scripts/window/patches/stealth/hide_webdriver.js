const HideWebdriverPatchModule = function HideWebdriverPatchModule(window) {
  if (window && window.__HIDE_WEBDRIVER_READY__) return;
  const __D = (window && typeof window.__DEGRADE__ === 'function') ? window.__DEGRADE__ : null;
  function __hwDegrade(code, err, extra) {
    try { if (__D) __D(code, err || null, extra || null); } catch (_) {}
  }

  const C = window.CanvasPatchContext;
  if (!C) {
    __hwDegrade('hide_webdriver:canvas_patch_context_missing', new Error('[HideWebdriverPatchModule] CanvasPatchContext missing'), {
      level: 'fatal',
      module: 'hide_webdriver',
      diagTag: 'hide_webdriver',
      surface: 'navigator',
      key: null,
      stage: 'preflight',
      message: 'CanvasPatchContext missing',
      type: 'pipeline missing data',
      data: null
    });
    return;
  }

  const Core = window && window.Core;
  if (!Core || typeof Core.applyTargets !== 'function') {
    __hwDegrade('hide_webdriver:core_missing', new Error('[HideWebdriverPatchModule] Core.applyTargets missing'), {
      level: 'fatal',
      module: 'hide_webdriver',
      diagTag: 'hide_webdriver',
      surface: 'navigator',
      key: null,
      stage: 'preflight',
      message: 'Core.applyTargets missing',
      type: 'pipeline missing data',
      data: null
    });
    return;
  }

  const safeDefine = (function() {
    const sd = (window && typeof window.__safeDefine === 'function') ? window.__safeDefine : null;
    if (typeof sd !== 'function') {
      __hwDegrade('hide_webdriver:safe_define_missing', new Error('[HideWebdriverPatchModule] safeDefine missing'), {
        level: 'fatal',
        module: 'hide_webdriver',
        diagTag: 'hide_webdriver',
        surface: 'navigator',
        key: '__safeDefine',
        stage: 'preflight',
        message: 'safeDefine missing',
        type: 'pipeline missing data',
        data: null
      });
      return null;
    }
    return sd;
  })();
  if (typeof safeDefine !== 'function') return;

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

  function degrade(code, err, extra) {
    try {
      if (typeof window.__DEGRADE__ === 'function') window.__DEGRADE__(code, err, extra);
    } catch (_) {}
  }

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
      degrade(groupTag + ':preflight_failed', e);
      if (groupPolicy === 'throw') throw e;
      return 0;
    }

    if (!Array.isArray(plans) || !plans.length) {
      if (plans && plans.ok === false) {
        const e = new Error('[HideWebdriverPatchModule] group skipped');
        degrade(groupTag + ':group_skipped', e, { reason: plans.reason || null });
      }
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
      return applied.length;
    } catch (e) {
      for (let i = applied.length - 1; i >= 0; i--) {
        const p = applied[i];
        try {
          if (p.origDesc) Object.defineProperty(p.owner, p.key, p.origDesc);
          else delete p.owner[p.key];
        } catch (_) {}
      }
      degrade(groupTag + ':apply_failed', e);
      if (groupPolicy === 'throw') throw e;
      return 0;
    }
  }

  function isAccessorDesc(d) {
    return !!d && (Object.prototype.hasOwnProperty.call(d, 'get') || Object.prototype.hasOwnProperty.call(d, 'set'));
  }

  try {
    const nav = navigator;
    const wdResolved = resolveDescriptor(nav, 'webdriver', { mode: 'proto_chain' });
    if (!wdResolved || !wdResolved.desc) {
      degrade('hide_webdriver:webdriver_missing', null, null);
    } else {
      const wdDesc = cloneDesc(wdResolved.desc);
      if (wdDesc && wdDesc.configurable === false) {
        const e = new TypeError('[HideWebdriverPatchModule] webdriver non-configurable');
        degrade('hide_webdriver:webdriver_non_configurable', e, null);
        return;
      }
      const wdOwner = wdResolved.owner || Object.getPrototypeOf(nav);
      const wdTarget = {
        owner: nav,
        key: 'webdriver',
        resolve: 'proto_chain',
        policy: 'strict',
        wrapLayer: 'named_wrapper_strict',
        diagTag: 'hide_webdriver:webdriver',
        kind: 'accessor',
        getImpl: function getWebdriverImpl() { return false; },
        validThis: function validWebdriverThis(self) {
          return self === nav || self === wdOwner;
        },
        invalidThis: 'native'
      };
      const wdIsData = !!wdDesc && Object.prototype.hasOwnProperty.call(wdDesc, 'value') && !wdDesc.get && !wdDesc.set;
      if (wdIsData) {
        wdTarget.allowShapeChange = true;
      }
      applyTargetGroup('hide_webdriver:webdriver', [wdTarget], 'skip');
    }
  } catch (e) {
    degrade('hide_webdriver:fatal', e, null);
    return;
  }

  try {
    safeDefine(window, '__HIDE_WEBDRIVER_READY__', {
      value: true,
      writable: true,
      configurable: true,
      enumerable: false
    });
  } catch (e) {
    degrade('hide_webdriver:ready_define_failed', e, null);
  }
};

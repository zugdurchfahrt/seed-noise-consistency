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

  const C = window.CanvasPatchContext;
  if (!C) {
    const D = (typeof window.__DEGRADE__ === 'function') ? window.__DEGRADE__ : null;
    if (D && typeof D.diag === 'function') {
      D.diag('warn', 'fonts:canvas_patch_context_missing', {
        module: 'fonts',
        diagTag: 'fonts',
        surface: 'fonts',
        key: null,
        stage: 'preflight',
        message: 'CanvasPatchContext missing',
        data: null,
        type: 'pipeline missing data'
      }, null);
    } else if (typeof D === 'function') {
      D('fonts:canvas_patch_context_missing', null, {
        level: 'warn',
        module: 'fonts',
        diagTag: 'fonts',
        surface: 'fonts',
        key: null,
        stage: 'preflight',
        message: 'CanvasPatchContext missing',
        data: null,
        type: 'pipeline missing data'
      });
    }
    return;
  }

  const Core = window && window.Core;
  if (!Core || typeof Core.applyTargets !== 'function') {
    const D = (typeof window.__DEGRADE__ === 'function') ? window.__DEGRADE__ : null;
    if (D && typeof D.diag === 'function') {
      D.diag('warn', 'fonts:core_apply_targets_missing', {
        module: 'fonts',
        diagTag: 'fonts',
        surface: 'fonts',
        key: null,
        stage: 'preflight',
        message: 'Core.applyTargets missing',
        data: null,
        type: 'pipeline missing data'
      }, null);
    } else if (typeof D === 'function') {
      D('fonts:core_apply_targets_missing', null, {
        level: 'warn',
        module: 'fonts',
        diagTag: 'fonts',
        surface: 'fonts',
        key: null,
        stage: 'preflight',
        message: 'Core.applyTargets missing',
        data: null,
        type: 'pipeline missing data'
      });
    }
    return;
  }

  const __fontTypePipeline = 'pipeline missing data';
  const __fontTypeBrowser = 'browser structure missing data';
  function __fontDiag(level, code, extra, err) {
    try {
      const normalizedLevel = (level === 'info' || level === 'warn' || level === 'error' || level === 'fatal')
        ? level
        : 'info';
      const normalizedCode = String(code || 'fonts');
      const x = (extra && typeof extra === 'object') ? extra : {};
      const normalizedStage = (
        x.stage === 'preflight' ||
        x.stage === 'apply' ||
        x.stage === 'rollback' ||
        x.stage === 'contract' ||
        x.stage === 'hook' ||
        x.stage === 'runtime' ||
        x.stage === 'guard'
      ) ? x.stage : 'runtime';
      const normalizedType = (
        x.type === __fontTypePipeline ||
        x.type === __fontTypeBrowser
      ) ? x.type : __fontTypePipeline;
      const key = (typeof x.key === 'string' || x.key === null) ? x.key : null;
      const diagTag = (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : 'fonts';
      const message = (typeof x.message === 'string' && x.message) ? x.message : normalizedCode;
      const data = Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null;
      const ctx = {
        module: 'fonts',
        diagTag: diagTag,
        surface: 'fonts',
        key: key,
        stage: normalizedStage,
        message: message,
        data: data,
        type: normalizedType
      };
      const D = (typeof window.__DEGRADE__ === 'function') ? window.__DEGRADE__ : null;
      if (D && typeof D.diag === 'function') {
        D.diag(normalizedLevel, normalizedCode, ctx, err || null);
        return;
      }
      if (typeof D === 'function') {
        D(normalizedCode, err || null, {
          level: normalizedLevel,
          module: ctx.module,
          diagTag: ctx.diagTag,
          surface: ctx.surface,
          key: ctx.key,
          stage: ctx.stage,
          message: ctx.message,
          data: ctx.data,
          type: ctx.type
        });
      }
    } catch (diagErr) {
      const D = (typeof window.__DEGRADE__ === 'function') ? window.__DEGRADE__ : null;
      if (typeof D === 'function') {
        D('fonts:diag_adapter_failed', diagErr || null, {
          level: 'warn',
          module: 'fonts',
          diagTag: 'fonts',
          surface: 'fonts',
          key: null,
          stage: 'guard',
          message: 'font diag adapter failed',
          data: null,
          type: __fontTypePipeline
        });
      }
    }
  }
  function __fontDiagPipeline(level, code, extra, err) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    if (typeof x.type !== 'string' || !x.type) x.type = __fontTypePipeline;
    if (typeof x.diagTag !== 'string' || !x.diagTag) x.diagTag = 'fonts';
    __fontDiag(level, code, x, err);
  }
  function __fontDiagBrowser(level, code, extra, err) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    if (typeof x.type !== 'string' || !x.type) x.type = __fontTypeBrowser;
    if (typeof x.diagTag !== 'string' || !x.diagTag) x.diagTag = 'fonts';
    __fontDiag(level, code, x, err);
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
        data: null
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
          data: { reason: plans.reason || null }
        }, e);
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
            data: null
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
            data: null
          }, e);
          throw e;
        }
        p.applied = true;
        done.push(p);
      }
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
            data: null
          }, re);
        }
      }
      __fontDiagBrowser(groupPolicy === 'throw' ? 'error' : 'warn', groupTag + ':apply_failed', {
        stage: 'apply',
        diagTag: groupTag,
        key: groupKey,
        message: 'apply failed',
        data: null
      }, e);
      if (groupPolicy === 'throw') throw (rollbackErr || e);
      return 0;
    }
  }

  // === Fonts module local guard (window & worker) ===
  if (!Array.isArray(window.fontPatchConfigs)) {
    __fontDiagPipeline('warn', 'fonts:configs_missing_or_invalid', {
      stage: 'preflight',
      diagTag: 'fonts',
      key: 'fontPatchConfigs',
      message: 'fontPatchConfigs missing/invalid (skip font patch)',
      data: { typeof: typeof window.fontPatchConfigs }
    }, null);
    return;
  }


  // expose awaitFontsReady in window and in the Worker env
  (function exposeFontsReady(){
    const hasDocFonts = (typeof document === 'object' && document && document.fonts && document.fonts.ready);

    // В window-ветке нам нужна "внешне резолвимая" точка
    if (hasDocFonts) {
      if (!window.awaitFontsReady || typeof window.awaitFontsReady.then !== 'function' || !window.awaitFontsReady.__owned_by_fontpatch) {
        let resolveFn, rejectFn;
        const p = new Promise((res, rej) => { resolveFn = res; rejectFn = rej; });
        p.resolve = resolveFn;
        p.reject  = rejectFn;
        Object.defineProperty(p, '__owned_by_fontpatch', { value: true });
        window.awaitFontsReady = p;
      }
      return;
    }
    // В non-window (worker) НЕ подменяем нативный ready на pending-промис, который никто не резолвит
    if (window.fonts && window.fonts.ready && typeof window.fonts.ready.then === 'function') {
      window.awaitFontsReady = window.fonts.ready;
    } else {
      window.awaitFontsReady = Promise.resolve();
    }
  })();

// font -guard (must run after minimal env validation and after exposeFontsReady)
(() => {
  'use strict';

  // data group: critical runtime promise handle
  try {
    applyTargetGroup('fonts:data:critical', [{
      owner: window,
      key: 'awaitFontsReady',
      kind: 'data',
      wrapLayer: 'descriptor_only',
      value: window.awaitFontsReady,
      allowCreate: true,
      writable: true,
      configurable: true,
      enumerable: true,
      policy: 'throw',
      diagTag: 'fonts:data:awaitFontsReady'
    }], 'throw');
  } catch (e) {
    // policy:'throw' соблюдена (fail-fast для шага), но "наружу" не бросаем: выходим с нативным fallback
    __fontDiagBrowser('fatal', 'fonts:data:critical_failed', {
      stage: 'apply',
      diagTag: 'fonts:data:awaitFontsReady',
      key: 'awaitFontsReady',
      message: 'critical data patch failed (suppressed throw)',
      data: null
    }, e);
    return;
  }

  // data group: optional runtime flags
  const fontsReadyTarget = {
    owner: window,
    key: '__FONTS_READY__',
    kind: 'data',
    wrapLayer: 'descriptor_only',
    allowCreate: true,
    writable: true,
    configurable: true,
    enumerable: true,
    policy: 'skip',
    diagTag: 'fonts:data:ready'
  };
  if (Object.prototype.hasOwnProperty.call(window, '__FONTS_READY__')) {
    fontsReadyTarget.value = window.__FONTS_READY__;
  }
  const fontsErrorTarget = {
    owner: window,
    key: '__FONTS_ERROR__',
    kind: 'data',
    wrapLayer: 'descriptor_only',
    allowCreate: true,
    writable: true,
    configurable: true,
    enumerable: true,
    policy: 'skip',
    diagTag: 'fonts:data:error'
  };
  if (Object.prototype.hasOwnProperty.call(window, '__FONTS_ERROR__')) {
    fontsErrorTarget.value = window.__FONTS_ERROR__;
  }
  applyTargetGroup('fonts:data:flags', [fontsReadyTarget, fontsErrorTarget], 'skip');

  // Глобал рантайма
  const G = (typeof globalThis !== "undefined" ? globalThis : self);

  // FontFaceSet в текущем окружении (window/worker)
  const FFS = (G.document && G.document.fonts) || G.fonts || null;
  if (!FFS) return;

  const proto = Object.getPrototypeOf(FFS);
  if (!proto) return;

  // accessor group: ready
  applyTargetGroup('fonts:accessor', [{
    owner: proto,
    key: 'ready',
    kind: 'accessor',
    wrapLayer: 'named_wrapper',
    policy: 'skip',
    diagTag: 'fonts:accessor:ready',
    getImpl(origGet) {
      return Reflect.apply(origGet, this, []);
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
  let ALLOWED_FAMILIES = null;

  function extractFamily(q) {
    const m = String(q).match(/(?:^|\s)\d+(?:\.\d+)?(?:px|pt|em|rem|%)\b(?:\/\d+(?:\.\d+)?(?:px|pt|em|rem|%))?\s+(.+)$/i);
    const raw = (m ? m[1] : q);
    return raw.split(',')[0].replace(/['"]/g,'').trim().toLowerCase();
  }

  function getAllowedFamilies() {
    if (ALLOWED_FAMILIES) return ALLOWED_FAMILIES;
    const win = (typeof window !== 'undefined') ? window : G;
    const domPlat = win.__NAV_PLATFORM__;
    const cfgs = Array.isArray(win.fontPatchConfigs) ? win.fontPatchConfigs : [];
    const hasPlatformDom = cfgs.some(f => f && typeof f.platform_dom === 'string');
    const filteredCfgs = (domPlat && hasPlatformDom) ? cfgs.filter(f => f.platform_dom === domPlat) : cfgs;
    ALLOWED_FAMILIES = new Set(
      filteredCfgs
        .flatMap(f => [f.cssFamily, f.family, f.name].filter(Boolean))
        .map(s => s.toLowerCase())
    );
    return ALLOWED_FAMILIES;
  }

  const validFontQuery = q => {
    if (!(typeof q === 'string' && q.length <= MAX_LEN && !CTRL.test(q) && SIZED.test(q) && FAMILY.test(q))) {
      return false;
    }
    const fam = extractFamily(q);
    if (!fam) return false;
    if (GENERICS.has(fam)) return true;
    return getAllowedFamilies().has(fam);
  };

  // method group: check + forEach(declare-only)
  applyTargetGroup('fonts:method', [
    {
      owner: proto,
      key: 'check',
      kind: 'method',
      wrapLayer: 'named_wrapper',
      policy: 'skip',
      diagTag: 'fonts:method:check',
      invoke(orig, args) {
        const query = args[0];
        if (throttled()) return false;
        if (!validFontQuery(query)) return false;
        return Reflect.apply(orig, this, args);
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
    wrapLayer: 'named_wrapper',
    policy: 'skip',
    diagTag: 'fonts:promise:load',
    invoke(orig, args) {
      const query = args[0];
      const text = args[1];
      if (throttled()) return Promise.resolve([]);
      if (!validFontQuery(query)) return Promise.resolve([]);
      if (text != null && typeof text !== 'string') return Promise.resolve([]);
      return Reflect.apply(orig, this, args);
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
      data: null
    }, null);
    try {
      if (typeof document === 'object' && document && document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
        window.awaitFontsReady = document.fonts.ready;
      }
    } catch (eRestore) {
      degrade('fonts:await_ready_restore_failed', eRestore);
    }
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
        data: null
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
          font-family: '${testFam}', Helvetica, Arial, sans-serif !important;
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
            document.fonts.add(loaded);
            return fam;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      })
    ).then((results) => {
      const loaded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      // Дожидаемся document.fonts.ready + двойной RAF, затем единый settle()
      return Promise.resolve()
        .then(() => (document.fonts && document.fonts.ready) || Promise.resolve())
        .then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
        .finally(() => {
          if (failed > 0) {
            const first = results.find((r) => r.status === 'rejected');
            const err = first && ('reason' in first) ? first.reason : new Error('font load failed');

            window.__FONTS_READY__ = false;
            try {
              window.__FONTS_ERROR__ = String((err && (err.stack || err.message)) || err);
            } catch (eSet) {
              degrade('fonts:data:set_error_failed', eSet);
            }

            if (typeof window.awaitFontsReady?.reject === 'function') window.awaitFontsReady.reject(err);
            __fontDiagBrowser('warn', 'fonts:load_settled_with_failures', {
              stage: 'runtime',
              diagTag: 'fonts',
              key: 'document.fonts',
              message: 'font load settled with failures',
              data: { loaded: loaded, failed: failed }
            }, err);
            return;
          }

          window.__FONTS_READY__ = true;
          if (typeof window.awaitFontsReady?.resolve === 'function') window.awaitFontsReady.resolve();
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
             data: { loaded: loaded, failed: failed }
           }, null);
         });
    }).catch((e) => {
      // no "наружу": перехватываем неожиданные промис-ошибки и оставляем нативное состояние
      window.__FONTS_READY__ = false;
      try {
        window.__FONTS_ERROR__ = String((e && (e.stack || e.message)) || e);
      } catch (eSet) {
        degrade('fonts:data:set_error_failed', eSet);
      }
      try {
        if (typeof window.awaitFontsReady?.reject === 'function') window.awaitFontsReady.reject(e);
      } catch (eRej) {
        degrade('fonts:await_ready_reject_failed', eRej);
      }
      __fontDiagBrowser('error', 'fonts:load_unexpected_rejection', {
        stage: 'runtime',
        diagTag: 'fonts',
        key: 'document.fonts',
        message: 'unexpected rejection in font load pipeline',
        data: null
      }, e);
    });
  
      // CSS @font-face →Only in the window
  (function injectCss(){
    let css = '';
    for (const f of fonts) {
      const fam = (f.cssFamily || f.family);
      css += `@font-face{font-family:'${fam}';src:url('${f.url}') format('woff2');font-weight:${f.weight||'normal'};font-style:${f.style||'normal'};font-display:swap;}`;
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




}

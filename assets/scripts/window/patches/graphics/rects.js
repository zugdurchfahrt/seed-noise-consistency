const RectsPatchModule = function RectsPatchModule(window) {
  const __MODULE = 'rects';
  const __SURFACE = 'DOM/SVG layout influence for native rect measurements';
  const __FLAG_KEY = '__PATCH_RECTS__';
  const __TYPE_PIPELINE = 'pipeline missing data';
  const C = window && window.FernwehContext;
  const Core = window && window.Core;
  const __loggerRoot = (C && C.__logger && typeof C.__logger === 'object') ? C.__logger : null;
  const __D = (__loggerRoot && typeof __loggerRoot.__DEGRADE__ === 'function') ? __loggerRoot.__DEGRADE__ : null;
  const __diag = (__D && typeof __D.diag === 'function') ? __D.diag.bind(__D) : null;

  function __emit(level, code, extra, err) {
    try {
      const x = (extra && typeof extra === 'object') ? extra : {};
      const ctx = {
        module: __MODULE,
        diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : __MODULE,
        surface: __SURFACE,
        key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
        stage: x.stage,
        message: x.message,
        type: x.type,
        data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null
      };
      if (__diag) return __diag(level, code, ctx, err === undefined ? null : err);
      if (typeof __D === 'function') {
        return __D(code, err === undefined ? null : err, Object.assign({}, ctx, { level }));
      }
    } catch (emitErr) {
      return undefined;
    }
    return undefined;
  }

  let __guardToken = null;
  function __releaseGuard(rollbackOk) {
    try {
      if (Core && typeof Core.releaseGuardFlag === 'function') {
        return Core.releaseGuardFlag(__FLAG_KEY, __guardToken, rollbackOk === true, __MODULE);
      }
    } catch (e) {
      __emit('error', 'rects:guard_release_failed', {
        key: 'guard',
        stage: 'rollback',
        message: 'releaseGuardFlag threw',
        type: __TYPE_PIPELINE,
        data: { outcome: 'throw', reason: 'guard_release_failed', rollbackOk: false }
      }, e);
      throw e;
    }
    return false;
  }

  function __fatal(code, key, message, err) {
    const e = err || new Error('[RectsPatchModule] ' + message);
    __emit('fatal', code, {
      key,
      stage: 'preflight',
      message,
      type: __TYPE_PIPELINE,
      data: { outcome: 'throw', reason: code }
    }, e);
    __releaseGuard(true);
    throw e;
  }

  if (!Core || typeof Core.guardFlag !== 'function') {
    const e = new Error('[RectsPatchModule] Core.guardFlag missing');
    __emit('fatal', 'rects:guard_missing', {
      key: 'guard',
      stage: 'guard',
      message: 'Core.guardFlag missing',
      type: __TYPE_PIPELINE,
      data: { outcome: 'throw', reason: 'missing_dep_core_guard' }
    }, e);
    throw e;
  }

  try {
    __guardToken = Core.guardFlag(__FLAG_KEY, __MODULE);
  } catch (e) {
    __emit('fatal', 'rects:guard_failed', {
      key: 'guard',
      stage: 'guard',
      message: 'guardFlag threw',
      type: __TYPE_PIPELINE,
      data: { outcome: 'throw', reason: 'guard_failed' }
    }, e);
    throw e;
  }
  if (!__guardToken) return 0;

  if (!C || !C.state || typeof C.state !== 'object') {
    __fatal('rects:fernweh_context_state_missing', 'FernwehContext.state', 'FernwehContext.state missing');
  }
  if (!window || !window.document || typeof window.document !== 'object') {
    __fatal('rects:document_missing', 'document', 'document missing');
  }

  const __screenState = (C.state.__SCREEN__ && typeof C.state.__SCREEN__ === 'object')
    ? C.state.__SCREEN__
    : null;
  if (!__screenState) {
    __fatal('rects:screen_state_missing', 'FernwehContext.state.__SCREEN__', 'screen state missing');
  }
  const __screenWidth = Number(__screenState.width);
  const __screenHeight = Number(__screenState.height);
  const __screenDpr = Number(__screenState.dpr);
  if (!Number.isFinite(__screenWidth) || __screenWidth <= 0 ||
      !Number.isFinite(__screenHeight) || __screenHeight <= 0 ||
      !Number.isFinite(__screenDpr) || __screenDpr <= 0) {
    __fatal('rects:screen_metrics_invalid', 'FernwehContext.state.__SCREEN__.width/height/dpr', 'screen metrics invalid');
  }

  const __prngRoot = (Core && Core.__internal && Core.__internal.prng && typeof Core.__internal.prng === 'object')
    ? Core.__internal.prng
    : null;
  if (!__prngRoot || typeof __prngRoot.seed !== 'string' || !__prngRoot.seed ||
      typeof __prngRoot.strToSeed !== 'function' || typeof __prngRoot.mulberry32 !== 'function') {
    __fatal('rects:prng_missing', 'Core.__internal.prng', 'Core PRNG state missing');
  }

  const __stateRoot = C.state;
  const __fontsRoot = (__stateRoot.__FONTS__ && typeof __stateRoot.__FONTS__ === 'object')
    ? __stateRoot.__FONTS__
    : null;
  const __fontsConfig = (__fontsRoot && __fontsRoot.__CONFIG__ && typeof __fontsRoot.__CONFIG__ === 'object')
    ? __fontsRoot.__CONFIG__
    : null;
  const __fontConfigs = (__fontsConfig && Array.isArray(__fontsConfig.configs))
    ? __fontsConfig.configs
    : null;
  if (!__fontConfigs) {
    __fatal('rects:fonts_config_missing', 'FernwehContext.state.__FONTS__.__CONFIG__.configs', 'fonts config missing');
  }

  const __envProfileState = (__stateRoot.__ENV_PROFILE__ && typeof __stateRoot.__ENV_PROFILE__ === 'object')
    ? __stateRoot.__ENV_PROFILE__
    : null;
  const __envPlatformState = (__envProfileState && __envProfileState.__PLATFORM__ && typeof __envProfileState.__PLATFORM__ === 'object')
    ? __envProfileState.__PLATFORM__
    : null;
  const __domPlatform = (__envPlatformState && typeof __envPlatformState.domPlatform === 'string' && __envPlatformState.domPlatform)
    ? __envPlatformState.domPlatform
    : null;

  function __unit(label) {
    const seed = __prngRoot.strToSeed('rects-layout|' + String(label) + '|' + __prngRoot.seed) >>> 0;
    const rng = __prngRoot.mulberry32(seed);
    if (typeof rng !== 'function') {
      throw new Error('[RectsPatchModule] Core.__internal.prng.mulberry32 returned non-function');
    }
    return rng();
  }

  function __roundCssPx(value) {
    return Math.round(Number(value) * 10000) / 10000;
  }

  function __normalizeFamilyName(family) {
    return String(family == null ? '' : family)
      .trim()
      .replace(/^["']|["']$/g, '');
  }

  function __quoteCssString(value) {
    return "'" + String(value)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\r/g, '\\d ')
      .replace(/\n/g, '\\a ')
      .replace(/\f/g, '\\c ')
      + "'";
  }

  function __resolveRectFontFamily() {
    const hasPlatformDom = __fontConfigs.some(function hasPlatformFontConfig(cfg) {
      return cfg && typeof cfg.platform_dom === 'string';
    });
    const scoped = (__domPlatform && hasPlatformDom)
      ? __fontConfigs.filter(function filterPlatformFontConfig(cfg) {
          return cfg && cfg.platform_dom === __domPlatform;
        })
      : __fontConfigs.slice();
    const names = scoped
      .map(function mapFontConfig(cfg) {
        return __normalizeFamilyName(cfg && (cfg.cssFamily || cfg.family || cfg.full_name || cfg.postscript_name));
      })
      .filter(Boolean);
    if (!names.length) {
      __fatal('rects:font_family_missing', 'FernwehContext.state.__FONTS__.__CONFIG__.configs', 'font family list empty');
    }
    const index = Math.floor(__unit('font-family') * names.length) % names.length;
    return names[index];
  }

  const __rectsRoot = (__stateRoot.__RECTS__ && typeof __stateRoot.__RECTS__ === 'object')
    ? __stateRoot.__RECTS__
    : null;
  const __rectsState = (__rectsRoot && __rectsRoot.__STATE__ && typeof __rectsRoot.__STATE__ === 'object')
    ? __rectsRoot.__STATE__
    : null;
  const __rectsConfig = (__rectsRoot && __rectsRoot.__CONFIG__ && typeof __rectsRoot.__CONFIG__ === 'object')
    ? __rectsRoot.__CONFIG__
    : null;
  if (!__rectsRoot || !__rectsState || !__rectsConfig) {
    __fatal('rects:state_missing', 'FernwehContext.state.__RECTS__', 'rects state missing');
  }

  const __measurementFixtureBinding = {
    htmlLayoutGeometryRootId: 'rect-container',
    textGlyphMetricsRootId: 'emoji-container',
    pixelGlyphRenderingRootId: 'pixel-emoji-container',
    svgLayoutGeometryRootId: 'svg-container',
    textGlyphMetricsClass: 'domrect-emoji',
    pixelGlyphRenderingClass: 'pixel-emoji',
    svgTextGlyphMetricsClass: 'svgrect-emoji',
    svgLayoutGeometryTagName: 'svg'
  };
  const __measurementSeedKeys = {
    htmlLayoutGeometryWidth: 'rect-container-width',
    textGlyphMetricsFontSize: 'rect-font-size',
    textGlyphMetricsLetterSpacing: 'rect-letter-spacing'
  };

  function __buildLayoutInfluence(fontFamily) {
    const htmlLayoutWidthDelta = __roundCssPx((1 + Math.floor(__unit(__measurementSeedKeys.htmlLayoutGeometryWidth) * 4)) / __screenDpr);
    const textGlyphFontSizeDelta = __roundCssPx((1 + Math.floor(__unit(__measurementSeedKeys.textGlyphMetricsFontSize) * 3)) / __screenDpr);
    const textGlyphLetterSpacingDelta = __roundCssPx((Math.floor(__unit(__measurementSeedKeys.textGlyphMetricsLetterSpacing) * 3) - 1) / (__screenDpr * 10));
    return {
      fontFamily: __quoteCssString(fontFamily),
      htmlLayoutGeometryWidth: 'calc(1000.099% + ' + htmlLayoutWidthDelta + 'px)',
      textGlyphMetricsFontSize: 'calc(200px + ' + textGlyphFontSizeDelta + 'px)',
      textGlyphMetricsLetterSpacing: String(textGlyphLetterSpacingDelta) + 'px'
    };
  }

  const __layoutInfluence = __buildLayoutInfluence(__resolveRectFontFamily());
  const __layoutStyleRules = {
    htmlLayoutGeometry: [
      { key: 'width', value: __layoutInfluence.htmlLayoutGeometryWidth }
    ],
    textGlyphMetrics: [
      { key: 'font-family', value: __layoutInfluence.fontFamily },
      { key: 'font-size', value: __layoutInfluence.textGlyphMetricsFontSize },
      { key: 'letter-spacing', value: __layoutInfluence.textGlyphMetricsLetterSpacing }
    ],
    svgLayoutGeometry: [
      { key: 'overflow', value: 'visible' }
    ]
  };
  const __styleNodeId = '__fernweh_rects_layout_influence__';
  let __styleAnchorDeferredReported = false;
  let __measurementFixtureDiscoveryReported = false;

  function __buildLayoutInfluenceCss(binding, styles) {
    let css = '';
    css += '#' + binding.htmlLayoutGeometryRootId + '{';
    css += 'width:' + styles.htmlLayoutGeometry[0].value + ';';
    css += '}';
    css += '#' + binding.textGlyphMetricsRootId + ' .' + binding.textGlyphMetricsClass + ',';
    css += '#' + binding.svgLayoutGeometryRootId + ' .' + binding.svgTextGlyphMetricsClass + ',';
    css += '#' + binding.pixelGlyphRenderingRootId + ' .' + binding.pixelGlyphRenderingClass + '{';
    css += 'font-family:' + styles.textGlyphMetrics[0].value + ';';
    css += 'font-size:' + styles.textGlyphMetrics[1].value + ';';
    css += 'letter-spacing:' + styles.textGlyphMetrics[2].value + ';';
    css += '}';
    css += '#' + binding.svgLayoutGeometryRootId + ' ' + binding.svgLayoutGeometryTagName + '{';
    css += 'overflow:' + styles.svgLayoutGeometry[0].value + ';';
    css += '}';
    return css;
  }

  function __installLayoutInfluenceStyle() {
    const doc = window.document;
    const anchor = doc.head || doc.documentElement || doc.body;
    if (typeof doc.createElement !== 'function') {
      __fatal('rects:create_element_missing', 'document.createElement', 'document.createElement missing');
    }
    if (!anchor) {
      if (!__styleAnchorDeferredReported) {
        __styleAnchorDeferredReported = true;
        __emit('warn', 'rects:style_anchor_deferred', {
          stage: 'apply',
          key: 'document.head/documentElement/body',
          message: 'rects style anchor not ready; deferred until document root appears',
          type: __TYPE_PIPELINE,
          data: { outcome: 'return', reason: 'style_anchor_deferred' }
        }, null);
      }
      return 0;
    }
    let styleNode = (typeof doc.getElementById === 'function') ? doc.getElementById(__styleNodeId) : null;
    if (!styleNode) {
      styleNode = doc.createElement('style');
      styleNode.setAttribute('id', __styleNodeId);
      styleNode.setAttribute('data-fernweh', 'rects');
      anchor.appendChild(styleNode);
    }
    const cssText = __buildLayoutInfluenceCss(__measurementFixtureBinding, __layoutStyleRules);
    if (styleNode.textContent !== cssText) {
      styleNode.textContent = cssText;
    }
    return 1;
  }

  function __applyStyleRules(el, rules) {
    if (!el || !rules || !rules.length) return 0;
    let applied = 0;
    for (let i = 0; i < rules.length; i++) {
      applied += __setStyleValue(el, rules[i].key, rules[i].value);
    }
    return applied;
  }

  function __countClassTargets(root, className) {
    if (!root || typeof root.getElementsByClassName !== 'function') return 0;
    const nodes = root.getElementsByClassName(className);
    return nodes ? nodes.length : 0;
  }

  function __setStyleValue(el, key, value) {
    if (!el || !el.style || typeof el.style.setProperty !== 'function') return 0;
    const current = el.style.getPropertyValue(key);
    const priority = el.style.getPropertyPriority(key);
    if (current === value && priority === '') return 0;
    el.style.setProperty(key, value, '');
    return 1;
  }

  function __applyStyleRulesToClass(root, className, rules) {
    if (!root || typeof root.getElementsByClassName !== 'function') return 0;
    const nodes = root.getElementsByClassName(className);
    let applied = 0;
    for (let i = 0; nodes && i < nodes.length; i++) {
      applied += __applyStyleRules(nodes[i], rules);
    }
    return applied;
  }

  function __applyStyleRulesToTag(root, tagName, rules) {
    if (!root || typeof root.getElementsByTagName !== 'function') return 0;
    const nodes = root.getElementsByTagName(tagName);
    let applied = 0;
    for (let i = 0; nodes && i < nodes.length; i++) {
      applied += __applyStyleRules(nodes[i], rules);
    }
    return applied;
  }

  function __applyLayoutInfluence(binding, styles) {
    const doc = window.document;
    let applied = 0;
    const htmlLayoutGeometryRoot = (typeof doc.getElementById === 'function') ? doc.getElementById(binding.htmlLayoutGeometryRootId) : null;
    if (htmlLayoutGeometryRoot) {
      applied += __applyStyleRules(htmlLayoutGeometryRoot, styles.htmlLayoutGeometry);
    }
    const textGlyphMetricsRoot = (typeof doc.getElementById === 'function') ? doc.getElementById(binding.textGlyphMetricsRootId) : null;
    const textGlyphMetricsCount = __countClassTargets(textGlyphMetricsRoot, binding.textGlyphMetricsClass);
    applied += __applyStyleRulesToClass(textGlyphMetricsRoot, binding.textGlyphMetricsClass, styles.textGlyphMetrics);
    const pixelGlyphRenderingRoot = (typeof doc.getElementById === 'function') ? doc.getElementById(binding.pixelGlyphRenderingRootId) : null;
    const pixelGlyphRenderingCount = __countClassTargets(pixelGlyphRenderingRoot, binding.pixelGlyphRenderingClass);
    applied += __applyStyleRulesToClass(pixelGlyphRenderingRoot, binding.pixelGlyphRenderingClass, styles.textGlyphMetrics);
    const svgLayoutGeometryRoot = (typeof doc.getElementById === 'function') ? doc.getElementById(binding.svgLayoutGeometryRootId) : null;
    const svgTextGlyphMetricsCount = __countClassTargets(svgLayoutGeometryRoot, binding.svgTextGlyphMetricsClass);
    applied += __applyStyleRulesToClass(svgLayoutGeometryRoot, binding.svgTextGlyphMetricsClass, styles.textGlyphMetrics);
    const svgLayoutGeometryCount = (svgLayoutGeometryRoot && typeof svgLayoutGeometryRoot.getElementsByTagName === 'function')
      ? svgLayoutGeometryRoot.getElementsByTagName(binding.svgLayoutGeometryTagName).length
      : 0;
    applied += __applyStyleRulesToTag(svgLayoutGeometryRoot, binding.svgLayoutGeometryTagName, styles.svgLayoutGeometry);
    const measurementTargetCount = (htmlLayoutGeometryRoot ? 1 : 0) + textGlyphMetricsCount + pixelGlyphRenderingCount + svgTextGlyphMetricsCount + svgLayoutGeometryCount;
    __rectsState.targets = measurementTargetCount;
    if (applied) {
      __rectsState.applied = Number(__rectsState.applied || 0) + applied;
    }
    if (!__measurementFixtureDiscoveryReported && (htmlLayoutGeometryRoot || textGlyphMetricsCount || pixelGlyphRenderingCount || svgTextGlyphMetricsCount || svgLayoutGeometryCount)) {
      __measurementFixtureDiscoveryReported = true;
      __emit('info', 'rects:measurement_fixtures_discovered', {
        stage: 'runtime',
        key: 'document rect measurement fixtures',
        message: 'rects measurement fixtures discovered',
        type: 'ok',
        data: {
          outcome: 'return',
          htmlLayoutGeometryRoot: !!htmlLayoutGeometryRoot,
          textGlyphMetricsRoot: !!textGlyphMetricsRoot,
          pixelGlyphRenderingRoot: !!pixelGlyphRenderingRoot,
          svgLayoutGeometryRoot: !!svgLayoutGeometryRoot,
          textGlyphMetricsCount,
          pixelGlyphRenderingCount,
          svgTextGlyphMetricsCount,
          svgLayoutGeometryCount,
          measurementTargetCount,
          applied
        }
      }, null);
    }
    return applied;
  }

  function __applyLayoutInfluenceToTargets() {
    return __applyLayoutInfluence(__measurementFixtureBinding, __layoutStyleRules);
  }

  function __installLayoutObserver() {
    const doc = window.document;
    if (typeof window.MutationObserver !== 'function') {
      __fatal('rects:mutation_observer_missing', 'MutationObserver', 'MutationObserver missing');
    }
    let appliedTotal = __applyLayoutInfluenceToTargets();
    const observer = new window.MutationObserver(function rectsLayoutMutationObserver() {
      try {
        __installLayoutInfluenceStyle();
        appliedTotal += __applyLayoutInfluenceToTargets();
      } catch (e) {
        __emit('error', 'rects:layout_influence_apply_failed', {
          stage: 'runtime',
          key: 'MutationObserver',
          message: 'rects target layout influence apply failed',
          type: __TYPE_PIPELINE,
          data: { outcome: 'throw', reason: 'layout_influence_apply_failed' }
        }, e);
        throw e;
      }
    });
    const observeTarget = doc.documentElement || doc;
    observer.observe(observeTarget, { childList: true, subtree: true });
    try {
      if (typeof window.queueMicrotask === 'function') {
        window.queueMicrotask(function rectsLayoutInfluenceMicrotask() {
          __installLayoutInfluenceStyle();
          __applyLayoutInfluenceToTargets();
        });
      }
      if (typeof window.setTimeout === 'function') {
        window.setTimeout(function rectsLayoutInfluenceTimeout() {
          __installLayoutInfluenceStyle();
          __applyLayoutInfluenceToTargets();
        }, 0);
      }
    } catch (e) {
      __emit('error', 'rects:layout_influence_schedule_failed', {
        stage: 'apply',
        key: 'MutationObserver',
        message: 'rects target scan scheduling failed',
        type: __TYPE_PIPELINE,
        data: { outcome: 'throw', reason: 'layout_influence_schedule_failed' }
      }, e);
      throw e;
    }
    return appliedTotal;
  }

  try {
    __rectsState.ready = false;
    __rectsState.status = 'applying';
    __rectsState.reason = 'layout_influence';
    __rectsState.error = null;
    const styleApplied = __installLayoutInfluenceStyle();
    const applied = __installLayoutObserver();
    __rectsState.ready = true;
    __rectsState.status = 'ready';
    __rectsState.reason = 'layout_influence';
    if (!__rectsState.applied) {
      __rectsState.applied = applied;
    }
    __rectsState.error = null;
    __emit('info', 'rects:layout_influence_applied', {
      stage: 'apply',
      key: 'MutationObserver',
      message: 'rects target observer installed; native rect method surfaces preserved',
      type: 'ok',
      data: { outcome: 'return', styleApplied, applied }
    }, null);
    __releaseGuard(true);
    return applied;
  } catch (e) {
    __rectsState.ready = false;
    __rectsState.status = 'error';
    __rectsState.reason = 'layout_influence_failed';
    __rectsState.error = e && e.message ? String(e.message) : String(e);
    __releaseGuard(false);
    throw e;
  }
};

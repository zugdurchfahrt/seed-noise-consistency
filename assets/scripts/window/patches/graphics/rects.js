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

  const __prngState = (Core && Core.__internal && Core.__internal.prng && typeof Core.__internal.prng === 'object')
    ? Core.__internal.prng
    : null;
  const __randSource = (__prngState && __prngState.rand && typeof __prngState.rand.use === 'function')
    ? __prngState.rand
    : null;
  if (!__randSource || typeof __randSource.use !== 'function') {
    __fatal('rects:prng_missing', 'Core.__internal.prng.rand', 'Core PRNG rand source missing');
  }
  const __MODULE_KEY = 'rects';
  
  function __unit(label) {
    let rng = null;
    const key = __MODULE_KEY + '-' + String(label);
    try {
      rng = __randSource.use(key);
    } catch (e) {
      __fatal('rects:prng_use_failed', 'Core.__internal.prng.rand.use', 'Core PRNG rand.use threw error for key ' + key, e);
    }
    if (typeof rng !== 'function') {
      __fatal('rects:prng_invalid', 'Core.__internal.prng.rand.use', 'Core PRNG rand.use returned non-function for key ' + key);
    }
    return rng();
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

  const __measurementScanLimit = Math.floor(Number(__rectsConfig.maxMeasurementScan));
  if (!Number.isFinite(__measurementScanLimit) || __measurementScanLimit <= 0) {
    __fatal('rects:measurement_scan_limit_invalid', 'FernwehContext.state.__RECTS__.__CONFIG__.maxMeasurementScan', 'measurement scan limit invalid');
  }
  const __glyphTextPattern = /[\u00A9\u00AE\u203C-\u3299]|[\uD83C-\uDBFF][\uDC00-\uDFFF]/;
  
  function __buildLayoutInfluence(fontFamily) {
    const htmlLayoutWidthDelta = __roundCssPx((0.1 + __unit('html-layout-geometry-width') * 0.4) / __screenDpr);
    const textGlyphFontSizeDelta = __roundCssPx((1 + Math.floor(__unit('text-glyph-metrics-font-size') * 3)) / __screenDpr);
    const textGlyphLetterSpacingDelta = __roundCssPx((Math.floor(__unit('text-glyph-metrics-letter-spacing') * 3) - 1) / (__screenDpr * 10));
    
    const shadowX = __roundCssPx((__unit('pixel-glyph-rendering-shadow-x') * 0.05 + 0.01) / __screenDpr);
    const shadowY = __roundCssPx((__unit('pixel-glyph-rendering-shadow-y') * 0.05 + 0.01) / __screenDpr);
    const shadowAlpha = (Math.floor(__unit('pixel-glyph-rendering-shadow-alpha') * 5) + 1) / 100;
    const pixelGlyphTextShadow = shadowX + 'px ' + shadowY + 'px 0.01px rgba(0,0,0,' + shadowAlpha + ')';

    return {
      fontFamily: __quoteCssString(fontFamily),
      htmlLayoutGeometryWidth: 'calc(100% + ' + htmlLayoutWidthDelta + 'px)',
      textGlyphMetricsFontSize: 'calc(1em + ' + textGlyphFontSizeDelta + 'px)',
      textGlyphMetricsLetterSpacing: String(textGlyphLetterSpacingDelta) + 'px',
      pixelGlyphTextShadow: pixelGlyphTextShadow
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
    pixelGlyphRendering: [
      { key: 'text-shadow', value: __layoutInfluence.pixelGlyphTextShadow }
    ],
    svgLayoutGeometry: [
      { key: 'overflow', value: 'visible' }
    ]
  };
  let __measurementFixtureDiscoveryReported = false;
  let __visibleRectReadFailureReported = false;

  function __applyStyleRules(el, rules) {
    if (!el || !rules || !rules.length) return 0;
    let applied = 0;
    for (let i = 0; i < rules.length; i++) {
      applied += __setStyleValue(el, rules[i].key, rules[i].value);
    }
    return applied;
  }

  function __setStyleValue(el, key, value) {
    if (!el || !el.style || typeof el.style.setProperty !== 'function') return 0;
    const current = el.style.getPropertyValue(key);
    const priority = el.style.getPropertyPriority(key);
    if (current === value && priority === '') return 0;
    el.style.setProperty(key, value, '');
    return 1;
  }

  function __applyStyleRulesToElements(nodes, rules) {
    let applied = 0;
    for (let i = 0; Array.isArray(nodes) && i < nodes.length; i++) {
      applied += __applyStyleRules(nodes[i], rules);
    }
    return applied;
  }

  function __pushUnique(list, value) {
    if (!value || !Array.isArray(list) || list.indexOf(value) !== -1) return 0;
    list.push(value);
    return 1;
  }

  function __hasVisibleLayoutRect(el) {
    if (!el || typeof el.getClientRects !== 'function') return false;
    try {
      const rects = el.getClientRects();
      for (let i = 0; rects && i < rects.length; i++) {
        const rect = rects[i];
        if (rect && Number(rect.width) > 0 && Number(rect.height) > 0) return true;
      }
    } catch (e) {
      if (!__visibleRectReadFailureReported) {
        __visibleRectReadFailureReported = true;
        __emit('warn', 'rects:measurement_candidate_rect_read_failed', {
          stage: 'runtime',
          key: 'Element.getClientRects',
          message: 'measurement candidate visible rect read failed',
          type: __TYPE_PIPELINE,
          data: { outcome: 'return', reason: 'candidate_rect_read_failed' }
        }, e);
      }
      return false;
    }
    return false;
  }

  function __hasGlyphText(el) {
    if (!el || typeof el.textContent !== 'string' || !el.textContent) return false;
    return __glyphTextPattern.test(el.textContent);
  }

  function __isDeepestGlyphElement(el) {
    if (!__hasGlyphText(el)) return false;
    const children = el.children;
    for (let i = 0; children && i < children.length; i++) {
      if (__hasGlyphText(children[i])) return false;
    }
    return true;
  }

  function __nearestLayoutContainer(el) {
    if (!el) return null;
    let parent = el.parentElement || null;
    for (let depth = 0; parent && depth < 4; depth++) {
      if (__hasVisibleLayoutRect(parent)) return parent;
      parent = parent.parentElement || null;
    }
    const offsetParent = el.offsetParent || null;
    if (offsetParent && __hasVisibleLayoutRect(offsetParent)) return offsetParent;
    return (el.parentElement && __hasVisibleLayoutRect(el.parentElement)) ? el.parentElement : null;
  }

  function __collectMeasurementFixtureCandidates() {
    const doc = window.document;
    if (!doc || typeof doc.getElementsByTagName !== 'function') {
      __fatal('rects:get_elements_by_tag_name_missing', 'document.getElementsByTagName', 'document.getElementsByTagName missing');
    }
    const candidates = {
      htmlLayoutGeometry: [],
      textGlyphMetrics: [],
      pixelGlyphRendering: [],
      svgLayoutGeometry: [],
      scanned: 0,
      svgScanned: 0,
      elementScanned: 0
    };
    const svgNodes = doc.getElementsByTagName('svg');
    for (let i = 0; svgNodes && i < svgNodes.length; i++) {
      candidates.scanned++;
      candidates.svgScanned++;
      const svgNode = svgNodes[i];
      if (__hasVisibleLayoutRect(svgNode)) {
        __pushUnique(candidates.svgLayoutGeometry, svgNode);
        __pushUnique(candidates.htmlLayoutGeometry, __nearestLayoutContainer(svgNode));
      }
    }
    const elements = doc.getElementsByTagName('*');
    for (let i = 0; elements && i < elements.length && candidates.elementScanned < __measurementScanLimit; i++) {
      candidates.scanned++;
      candidates.elementScanned++;
      const el = elements[i];
      if (!__isDeepestGlyphElement(el) || !__hasVisibleLayoutRect(el)) continue;
      __pushUnique(candidates.textGlyphMetrics, el);
      __pushUnique(candidates.pixelGlyphRendering, el);
      __pushUnique(candidates.htmlLayoutGeometry, __nearestLayoutContainer(el));
    }
    return candidates;
  }

  function __collectMeasurementFixtureCandidatesFromNodes(nodes) {
    const candidates = {
      htmlLayoutGeometry: [],
      textGlyphMetrics: [],
      pixelGlyphRendering: [],
      svgLayoutGeometry: [],
      scanned: 0,
      svgScanned: 0,
      elementScanned: 0
    };
    if (!nodes || !nodes.length) return candidates;
    for (let n = 0; n < nodes.length; n++) {
      const root = nodes[n];
      if (!root || root.nodeType !== 1) continue;
      
      if (root.tagName && root.tagName.toLowerCase() === 'svg') {
        if (__hasVisibleLayoutRect(root)) {
          __pushUnique(candidates.svgLayoutGeometry, root);
          __pushUnique(candidates.htmlLayoutGeometry, __nearestLayoutContainer(root));
        }
      } else if (__isDeepestGlyphElement(root) && __hasVisibleLayoutRect(root)) {
        __pushUnique(candidates.textGlyphMetrics, root);
        __pushUnique(candidates.pixelGlyphRendering, root);
        __pushUnique(candidates.htmlLayoutGeometry, __nearestLayoutContainer(root));
      }

      const svgNodes = root.getElementsByTagName ? root.getElementsByTagName('svg') : [];
      for (let i = 0; svgNodes && i < svgNodes.length; i++) {
        candidates.scanned++;
        candidates.svgScanned++;
        const svgNode = svgNodes[i];
        if (__hasVisibleLayoutRect(svgNode)) {
          __pushUnique(candidates.svgLayoutGeometry, svgNode);
          __pushUnique(candidates.htmlLayoutGeometry, __nearestLayoutContainer(svgNode));
        }
      }

      const elements = root.getElementsByTagName ? root.getElementsByTagName('*') : [];
      for (let i = 0; elements && i < elements.length; i++) {
        candidates.scanned++;
        candidates.elementScanned++;
        const el = elements[i];
        if (!__isDeepestGlyphElement(el) || !__hasVisibleLayoutRect(el)) continue;
        __pushUnique(candidates.textGlyphMetrics, el);
        __pushUnique(candidates.pixelGlyphRendering, el);
        __pushUnique(candidates.htmlLayoutGeometry, __nearestLayoutContainer(el));
      }
    }
    return candidates;
  }

  function __applyLayoutInfluence(styles, providedCandidates) {
    const candidates = providedCandidates || __collectMeasurementFixtureCandidates();
    let applied = 0;
    applied += __applyStyleRulesToElements(candidates.htmlLayoutGeometry, styles.htmlLayoutGeometry);
    applied += __applyStyleRulesToElements(candidates.textGlyphMetrics, styles.textGlyphMetrics);
    applied += __applyStyleRulesToElements(candidates.pixelGlyphRendering, styles.pixelGlyphRendering);
    applied += __applyStyleRulesToElements(candidates.svgLayoutGeometry, styles.svgLayoutGeometry);
    const channels = ['htmlLayoutGeometry', 'textGlyphMetrics', 'pixelGlyphRendering', 'svgLayoutGeometry'];
    const channelCounts = {
      htmlLayoutGeometry: candidates.htmlLayoutGeometry.length,
      textGlyphMetrics: candidates.textGlyphMetrics.length,
      pixelGlyphRendering: candidates.pixelGlyphRendering.length,
      svgLayoutGeometry: candidates.svgLayoutGeometry.length
    };
    const measurementTargetCount = channelCounts.htmlLayoutGeometry + channelCounts.textGlyphMetrics + channelCounts.pixelGlyphRendering + channelCounts.svgLayoutGeometry;
    __rectsState.targets = measurementTargetCount;
    if (applied) {
      __rectsState.applied = Number(__rectsState.applied || 0) + applied;
    }
    if (!__measurementFixtureDiscoveryReported && measurementTargetCount > 0) {
      __measurementFixtureDiscoveryReported = true;
      __emit('info', 'rects:measurement_fixtures_discovered', {
        stage: 'runtime',
        key: 'document rect measurement fixtures',
        message: 'rects measurement fixtures discovered',
        type: 'ok',
        data: {
          outcome: 'return',
          candidates: channelCounts,
          channels,
          scanned: candidates.scanned,
          svgScanned: candidates.svgScanned,
          elementScanned: candidates.elementScanned,
          measurementTargetCount,
          applied
        }
      }, null);
    }
    return applied;
  }

  function __applyLayoutInfluenceToCandidates(providedCandidates) {
    return __applyLayoutInfluence(__layoutStyleRules, providedCandidates);
  }

  function __installLayoutObserver() {
    const doc = window.document;
    if (typeof window.MutationObserver !== 'function') {
      __fatal('rects:mutation_observer_missing', 'MutationObserver', 'MutationObserver missing');
    }
    let appliedTotal = __applyLayoutInfluenceToCandidates();
    const observer = new window.MutationObserver(function rectsLayoutMutationObserver(mutations) {
      try {
        const addedNodes = [];
        for (let i = 0; mutations && i < mutations.length; i++) {
          const added = mutations[i].addedNodes;
          for (let j = 0; added && j < added.length; j++) {
            addedNodes.push(added[j]);
          }
        }
        if (addedNodes.length > 0) {
          const candidates = __collectMeasurementFixtureCandidatesFromNodes(addedNodes);
          appliedTotal += __applyLayoutInfluenceToCandidates(candidates);
        }
      } catch (e) {
        __emit('error', 'rects:layout_influence_apply_failed', {
          stage: 'runtime',
          key: 'MutationObserver',
          message: 'rects measurement fixture layout influence apply failed',
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
          __applyLayoutInfluenceToCandidates();
        });
      }
      if (typeof window.setTimeout === 'function') {
        window.setTimeout(function rectsLayoutInfluenceTimeout() {
          __applyLayoutInfluenceToCandidates();
        }, 0);
      }
    } catch (e) {
      __emit('error', 'rects:layout_influence_schedule_failed', {
        stage: 'apply',
        key: 'MutationObserver',
        message: 'rects measurement fixture scan scheduling failed',
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
    const applied = __installLayoutObserver();
    __rectsState.ready = true;
    __rectsState.status = 'ready';
    if (!__rectsState.applied) {
      __rectsState.applied = applied;
    }
    __rectsState.error = null;
    __emit('info', 'rects:layout_influence_applied', {
      stage: 'apply',
      key: 'MutationObserver',
      message: 'rects measurement fixture observer installed; native rect method surfaces preserved',
      type: 'ok',
      data: { outcome: 'return', applied }
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

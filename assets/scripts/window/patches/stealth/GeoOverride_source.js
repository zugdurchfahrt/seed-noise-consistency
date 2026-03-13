(() => {
  const __MODULE = 'GeoOverride';
  const __SURFACE = 'geolocation';
  const __D = window.__DEGRADE__;
  const __diag = (__D && typeof __D.diag === 'function') ? __D.diag.bind(__D) : null;
  const __ALLOWED_STAGES = {
    preflight: true,
    apply: true,
    rollback: true,
    contract: true,
    hook: true,
    runtime: true,
    guard: true
  };

  const __emit = (level, code, ctx, err) => {
    try {
      if (__diag) return __diag(String(level || 'info'), String(code || 'geo'), ctx, err || null);
      if (typeof __D === 'function') {
        return __D(String(code || 'geo'), err || null, Object.assign({}, ctx || {}, { level: String(level || 'info') }));
      }
    } catch (_) {
      return;
    }
  };

  function __codeIncludes(code, token) {
    return String(code || '').indexOf(token) !== -1;
  }

  function __resolveStage(code, stage) {
    if (typeof stage === 'string' && __ALLOWED_STAGES[stage]) return stage;
    if (__codeIncludes(code, 'rollback')) return 'rollback';
    if (__codeIncludes(code, 'invalid_plan_item') || __codeIncludes(code, 'descriptor_postcheck_mismatch')) return 'contract';
    if (__codeIncludes(code, ':apply') || __codeIncludes(code, ':patched')) return 'apply';
    if (__codeIncludes(code, ':preflight') || __codeIncludes(code, '_missing')) return 'preflight';
    if (__codeIncludes(code, 'mask_position_failed')) return 'hook';
    return 'runtime';
  }

  function __resolveType(code, type) {
    if (typeof type === 'string' && type) return type;
    if (code === 'geo:core_missing' || code === 'geo:coords_missing') return 'pipeline missing data';
    if (__codeIncludes(code, 'geolocation_') && __codeIncludes(code, '_missing')) return 'browser structure missing data';
    if (__codeIncludes(code, 'invalid_plan_item') || __codeIncludes(code, 'descriptor_postcheck_mismatch')) return 'contract violation';
    if (__codeIncludes(code, 'rollback')) return 'contract violation';
    if (__codeIncludes(code, ':patched')) return 'ok';
    return 'pipeline missing data';
  }

  function __resolveLevel(code, level) {
    if (typeof level === 'string' && level) return level;
    if (__codeIncludes(code, '_failed')) return 'error';
    if (code === 'geo:patched') return 'info';
    if (__codeIncludes(code, '_skipped') || __codeIncludes(code, '_missing')) return 'warn';
    return 'warn';
  }

  function __resolveOutcome(code, outcome) {
    if (typeof outcome === 'string' && outcome) return outcome;
    if (__codeIncludes(code, 'rollback')) return 'rollback';
    if (__codeIncludes(code, '_skipped') || __codeIncludes(code, '_missing')) return 'skip';
    if (__codeIncludes(code, '_failed')) return 'throw';
    if (__codeIncludes(code, ':patched')) return 'return';
    return 'return';
  }

  function __normalizeData(extra, outcome) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    const src = (x.data && typeof x.data === 'object') ? x.data : {};
    const data = Object.assign({}, src);
    if (!Object.prototype.hasOwnProperty.call(x, 'data')) {
      const passthrough = ['latitude', 'longitude', 'reason', 'policy'];
      for (let i = 0; i < passthrough.length; i++) {
        const key = passthrough[i];
        if (Object.prototype.hasOwnProperty.call(x, key)) data[key] = x[key];
      }
    }
    data.outcome = outcome;
    return data;
  }

  const __tag = __MODULE;
  const __flagKey = '__PATCH_GEOLOCATION__';
  const C = window && window.CanvasPatchContext;
  const Core = window && window.Core;
  function degrade(code, err, extra) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    const stage = __resolveStage(code, x.stage);
    const level = __resolveLevel(code, x.level);
    const outcome = __resolveOutcome(code, x && x.data ? x.data.outcome : null);
    const ctx = {
      module: __MODULE,
      diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : String(code || 'geo'),
      surface: __SURFACE,
      key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
      stage: stage,
      message: (typeof x.message === 'string' && x.message) ? x.message : String(code || 'geo'),
      type: __resolveType(code, x.type),
      data: __normalizeData(x, outcome)
    };
    __emit(level, code, ctx, err || null);
  }

  function cloneDesc(d) {
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
    let plans = [];
    try {
      plans = Core.applyTargets(targets, window.__PROFILE__, []);
    } catch (e) {
      degrade(groupTag + ':preflight_failed', e, {
        stage: 'preflight',
        type: 'pipeline missing data',
        data: { outcome: 'throw', policy: policy || null }
      });
      return 0;
    }
    if (!Array.isArray(plans) || !plans.length) {
      if (plans && plans.ok === false) {
        degrade(groupTag + ':group_skipped', new Error('[GeoOverride] group skipped'), {
          stage: 'preflight',
          message: '[GeoOverride] group skipped',
          type: 'pipeline missing data',
          data: { outcome: 'skip', reason: plans.reason || null, policy: policy || null }
        });
      } else {
        degrade(groupTag + ':group_skipped', null, {
          stage: 'preflight',
          message: '[GeoOverride] empty plan set',
          type: 'pipeline missing data',
          data: { outcome: 'skip', reason: 'empty_plans', policy: policy || null }
        });
      }
      return 0;
    }

    const done = [];
    try {
      for (let i = 0; i < plans.length; i++) {
        const p = plans[i];
        if (!p || p.skipApply) continue;
        if (!p.owner || typeof p.key !== 'string' || !p.nextDesc) {
          const e = new Error('[GeoOverride] invalid plan item');
          degrade(groupTag + ':invalid_plan_item', e, {
            stage: 'contract',
            type: 'contract violation',
            data: { outcome: 'throw', policy: policy || null }
          });
          degrade(groupTag + ':rollback', null, {
            stage: 'rollback',
            message: '[GeoOverride] rollback after invalid plan item',
            type: 'contract violation',
            data: { outcome: 'rollback', policy: policy || null }
          });
          let rollbackErr = null;
          for (let j = done.length - 1; j >= 0; j--) {
            const q = done[j];
            try {
              if (q.origDesc) Object.defineProperty(q.owner, q.key, cloneDesc(q.origDesc));
              else delete q.owner[q.key];
            } catch (re) {
              if (!rollbackErr) rollbackErr = re;
              degrade(groupTag + ':rollback_failed', re, {
                key: q && q.key ? q.key : null,
                stage: 'rollback',
                type: 'contract violation',
                data: { outcome: 'throw', policy: policy || null }
              });
            }
          }
          degrade(groupTag + ':apply_skipped', null, {
            stage: 'apply',
            message: '[GeoOverride] apply skipped after invalid plan item',
            type: 'contract violation',
            data: { outcome: 'skip', reason: 'invalid_plan_item', policy: policy || null }
          });
          return 0;
        }
        Object.defineProperty(p.owner, p.key, p.nextDesc);
        const after = Object.getOwnPropertyDescriptor(p.owner, p.key);
        if (!isSameDescriptor(after, p.nextDesc)) {
          const e = new Error('[GeoOverride] descriptor post-check mismatch');
          degrade(groupTag + ':descriptor_postcheck_mismatch', e, {
            stage: 'contract',
            key: p && p.key ? p.key : null,
            type: 'contract violation',
            data: { outcome: 'throw', policy: policy || null }
          });
          degrade(groupTag + ':rollback', null, {
            stage: 'rollback',
            key: p && p.key ? p.key : null,
            message: '[GeoOverride] rollback after descriptor post-check mismatch',
            type: 'contract violation',
            data: { outcome: 'rollback', policy: policy || null }
          });
          let rollbackErr = null;
          for (let j = done.length - 1; j >= 0; j--) {
            const q = done[j];
            try {
              if (q.origDesc) Object.defineProperty(q.owner, q.key, cloneDesc(q.origDesc));
              else delete q.owner[q.key];
            } catch (re) {
              if (!rollbackErr) rollbackErr = re;
              degrade(groupTag + ':rollback_failed', re, {
                key: q && q.key ? q.key : null,
                stage: 'rollback',
                type: 'contract violation',
                data: { outcome: 'throw', policy: policy || null }
              });
            }
          }
          degrade(groupTag + ':apply_skipped', null, {
            stage: 'apply',
            key: p && p.key ? p.key : null,
            message: '[GeoOverride] apply skipped after descriptor mismatch',
            type: 'contract violation',
            data: { outcome: 'skip', reason: 'descriptor_postcheck_mismatch', policy: policy || null }
          });
          return 0;
        }
        done.push(p);
      }
      return done.length;
    } catch (e) {
      degrade(groupTag + ':rollback', null, {
        stage: 'rollback',
        message: '[GeoOverride] rollback after apply exception',
        type: 'contract violation',
        data: { outcome: 'rollback', policy: policy || null }
      });
      let rollbackErr = null;
      for (let i = done.length - 1; i >= 0; i--) {
        const p = done[i];
        try {
          if (p.origDesc) Object.defineProperty(p.owner, p.key, cloneDesc(p.origDesc));
          else delete p.owner[p.key];
        } catch (re) {
          if (!rollbackErr) rollbackErr = re;
          degrade(groupTag + ':rollback_failed', re, {
            key: p && p.key ? p.key : null,
            stage: 'rollback',
            type: 'contract violation',
            data: { outcome: 'throw', policy: policy || null }
          });
        }
      }
      if (rollbackErr) {
        degrade(groupTag + ':apply_skipped', null, {
          stage: 'apply',
          message: '[GeoOverride] apply skipped due to rollback failure',
          type: 'contract violation',
          data: { outcome: 'skip', reason: 'rollback_failed', policy: policy || null }
        });
        return 0;
      }
      degrade(groupTag + ':apply_failed', e, {
        stage: 'apply',
        type: 'contract violation',
        data: { outcome: 'throw', policy: policy || null }
      });
      return 0;
    }
  }

  function __cloneGeoStateValue(state) {
    if (!state || typeof state !== 'object') return null;
    return {
      latitude: state.latitude,
      longitude: state.longitude
    };
  }

  function __restoreGeoStateValue(state, snapshot) {
    if (!state || typeof state !== 'object') return;
    state.latitude = snapshot ? snapshot.latitude : null;
    state.longitude = snapshot ? snapshot.longitude : null;
  }

  function __ensureGeoState() {
    if (Object.prototype.hasOwnProperty.call(C, '__GEO_STATE__')) {
      return (C.__GEO_STATE__ && typeof C.__GEO_STATE__ === 'object') ? C.__GEO_STATE__ : null;
    }
    const state = {
      latitude: null,
      longitude: null
    };
    Object.defineProperty(C, '__GEO_STATE__', {
      value: state,
      writable: true,
      configurable: true,
      enumerable: false
    });
    return state;
  }

  function __runGeoHidePass() {
    return;
  }

  function patchGeolocation() {
    const geoState = (C && C.__GEO_STATE__ && typeof C.__GEO_STATE__ === 'object') ? C.__GEO_STATE__ : null;
    const lat = geoState ? geoState.latitude : null;
    const lon = geoState ? geoState.longitude : null;
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      degrade('geo:coords_missing', new Error('[GeoOverride] geolocation missing latitude/longitude'), {
        stage: 'preflight',
        message: '[GeoOverride] geolocation missing latitude/longitude',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'coords_missing' }
      });
      return false;
    }

    const nav = navigator;
    const resolveDescriptor = (Core && typeof Core.resolveDescriptor === 'function')
      ? Core.resolveDescriptor
      : function fallbackResolve(owner, key) {
          let cur = owner;
          while (cur) {
            const d = Object.getOwnPropertyDescriptor(cur, key);
            if (d) return { owner: cur, desc: d };
            cur = Object.getPrototypeOf(cur);
          }
          return { owner: owner, desc: null };
        };

    const geolocationResolved = resolveDescriptor(nav, 'geolocation', { mode: 'proto_chain' });
    const geolocationDesc = geolocationResolved && geolocationResolved.desc;
    if (!geolocationDesc || typeof geolocationDesc.get !== 'function') {
      degrade('geo:geolocation_descriptor_missing', new Error('[GeoOverride] geolocation descriptor missing'), {
        stage: 'preflight',
        message: '[GeoOverride] geolocation descriptor missing',
        type: 'browser structure missing data',
        data: { outcome: 'skip', reason: 'descriptor_missing' }
      });
      return false;
    }

    const nativeGeo = Reflect.apply(geolocationDesc.get, nav, []);
    if (!nativeGeo || typeof nativeGeo !== 'object') {
      degrade('geo:geolocation_object_missing', new Error('[GeoOverride] geolocation object missing'), {
        stage: 'preflight',
        message: '[GeoOverride] geolocation object missing',
        type: 'browser structure missing data',
        data: { outcome: 'skip', reason: 'geolocation_object_missing' }
      });
      return false;
    }
    const geoProto = Object.getPrototypeOf(nativeGeo);
    if (!geoProto || (typeof geoProto !== 'object' && typeof geoProto !== 'function')) {
      degrade('geo:geolocation_proto_missing', new Error('[GeoOverride] geolocation prototype missing'), {
        stage: 'preflight',
        message: '[GeoOverride] geolocation prototype missing',
        type: 'browser structure missing data',
        data: { outcome: 'skip', reason: 'geolocation_proto_missing' }
      });
      return false;
    }

    function validGeoThis(self) {
      return !!self && (self === nativeGeo || geoProto.isPrototypeOf(self));
    }

    function maskPosition(pos) {
      if (!pos || typeof pos !== 'object') return pos;
      const coords = pos.coords;
      if (!coords || typeof coords !== 'object') return pos;
      const maskedCoords = Object.create(Object.getPrototypeOf(coords) || Object.prototype);
      const values = {
        latitude: lat,
        longitude: lon,
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        altitudeAccuracy: coords.altitudeAccuracy,
        heading: coords.heading,
        speed: coords.speed
      };
      const keys = Object.keys(values);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        Object.defineProperty(maskedCoords, k, {
          value: values[k],
          writable: false,
          configurable: true,
          enumerable: true
        });
      }
      const maskedPos = Object.create(Object.getPrototypeOf(pos) || Object.prototype);
      Object.defineProperty(maskedPos, 'coords', {
        value: maskedCoords,
        writable: false,
        configurable: true,
        enumerable: true
      });
      Object.defineProperty(maskedPos, 'timestamp', {
        value: pos.timestamp,
        writable: false,
        configurable: true,
        enumerable: true
      });
      return maskedPos;
    }

    function wrapSuccess(success, error) {
      if (typeof success !== 'function') return success;
      return function patchedGeoSuccess(position) {
        let masked = position;
        try {
          masked = maskPosition(position);
        } catch (e) {
          degrade('geo:mask_position_failed', e, {
            stage: 'hook',
            message: '[GeoOverride] failed to mask position',
            type: 'contract violation',
            data: { outcome: 'throw', reason: 'mask_position_failed' }
          });
          masked = position;
        }
        return success(masked);
      };
    }

    const targets = [
      {
        owner: geoProto,
        key: 'getCurrentPosition',
        kind: 'method',
        wrapLayer: 'core_wrapper',
        invokeClass: 'brand_strict',
        policy: 'throw',
        resolve: 'own',
        diagTag: 'geo:getCurrentPosition',
        validThis: validGeoThis,
        invalidThis: 'throw',
        invoke: function invokeGetCurrentPosition(orig, args) {
          const next = Array.prototype.slice.call(args || []);
          next[0] = wrapSuccess(next[0], next[1]);
          return Reflect.apply(orig, this, next);
        }
      },
      {
        owner: geoProto,
        key: 'watchPosition',
        kind: 'method',
        wrapLayer: 'core_wrapper',
        invokeClass: 'brand_strict',
        policy: 'throw',
        resolve: 'own',
        diagTag: 'geo:watchPosition',
        validThis: validGeoThis,
        invalidThis: 'throw',
        invoke: function invokeWatchPosition(orig, args) {
          const next = Array.prototype.slice.call(args || []);
          next[0] = wrapSuccess(next[0], next[1]);
          return Reflect.apply(orig, this, next);
        }
      },
      {
        owner: geoProto,
        key: 'clearWatch',
        kind: 'method',
        wrapLayer: 'core_wrapper',
        invokeClass: 'brand_strict',
        policy: 'throw',
        resolve: 'own',
        diagTag: 'geo:clearWatch',
        validThis: validGeoThis,
        invalidThis: 'throw'
      }
    ];

    try {
      const applied = applyTargetGroup('geo:methods', targets, 'throw');
      if (!applied) {
        degrade('geo:apply_skipped', null, {
          stage: 'apply',
          message: '[GeoOverride] geolocation patch skipped',
          type: 'pipeline missing data',
          data: { outcome: 'skip', reason: 'group_not_applied' }
        });
        return false;
      }
    } catch (e) {
      degrade('geo:apply_failed', e, {
        stage: 'apply',
        message: '[GeoOverride] geolocation patch apply failed',
        type: 'contract violation',
        data: { outcome: 'throw', reason: 'apply_exception' }
      });
      return false;
    }
    degrade('geo:patched', null, {
      stage: 'apply',
      message: '[GeoOverride] geolocation patch applied',
      type: 'ok',
      data: { outcome: 'return', latitude: lat, longitude: lon }
    });
    return true;
  }

  if (!C) {
    degrade('geo:canvas_patch_context_missing', new Error('[GeoOverride] CanvasPatchContext is required'), {
      stage: 'preflight',
      key: 'CanvasPatchContext',
      message: '[GeoOverride] CanvasPatchContext is required',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'canvas_patch_context_missing' }
    });
    return;
  }

  if (!Core) {
    degrade('geo:core_missing', new Error('[GeoOverride] Core is required'), {
      stage: 'preflight',
      key: 'Core',
      message: '[GeoOverride] Core is required',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'core_missing' }
    });
    return;
  }
  if (typeof Core.applyTargets !== 'function') {
    degrade('geo:core_apply_targets_missing', new Error('[GeoOverride] Core.applyTargets is required'), {
      stage: 'preflight',
      key: 'Core.applyTargets',
      message: '[GeoOverride] Core.applyTargets is required',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'core_apply_targets_missing' }
    });
    return;
  }
  if (typeof Core.registerPatchedTarget !== 'function') {
    degrade('geo:core_register_patched_target_missing', new Error('[GeoOverride] Core.registerPatchedTarget is required'), {
      stage: 'preflight',
      key: 'Core.registerPatchedTarget',
      message: '[GeoOverride] Core.registerPatchedTarget is required',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'core_register_patched_target_missing' }
    });
    return;
  }
  if (typeof Core.guardFlag !== 'function') {
    degrade('geo:guard_missing', null, {
      key: __flagKey,
      stage: 'guard',
      message: 'Core.guardFlag missing',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
    });
    return;
  }
  if (typeof Core.resolveDescriptor !== 'function') {
    degrade('geo:core_resolve_descriptor_missing', new Error('[GeoOverride] Core.resolveDescriptor is required'), {
      stage: 'preflight',
      key: 'Core.resolveDescriptor',
      message: '[GeoOverride] Core.resolveDescriptor is required',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'core_resolve_descriptor_missing' }
    });
    return;
  }

  let __guardToken = null;
  try {
    __guardToken = Core.guardFlag(__flagKey, __tag);
  } catch (e) {
    degrade('geo:guard_failed', e, {
      key: __flagKey,
      stage: 'guard',
      message: 'guardFlag threw',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'guard_failed' }
    });
    return;
  }
  if (!__guardToken) return;

  function __releaseGuard(rollbackOk) {
    try {
      if (Core && typeof Core.releaseGuardFlag === 'function') {
        Core.releaseGuardFlag(__flagKey, __guardToken, rollbackOk === true, __tag);
      }
    } catch (e) {
      degrade('geo:guard_release_exception', e, {
        key: __flagKey,
        stage: 'rollback',
        message: 'releaseGuardFlag failed',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_exception' }
      });
    }
  }

  let __geoState = null;
  let __geoStateSnapshot = null;
  let __applyStarted = false;
  try {
    __geoState = __ensureGeoState();
    if (!__geoState) {
      degrade('geo:geo_state_missing', new Error('[GeoOverride] CanvasPatchContext.__GEO_STATE__ is required'), {
        stage: 'preflight',
        key: '__GEO_STATE__',
        message: '[GeoOverride] CanvasPatchContext.__GEO_STATE__ is required',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'geo_state_missing' }
      });
      __releaseGuard(true);
      return;
    }
    __geoStateSnapshot = __cloneGeoStateValue(__geoState);

    const latitude = window.__LATITUDE__;
    const longitude = window.__LONGITUDE__;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      degrade('geo:coords_missing', new Error('[GeoOverride] geolocation missing latitude/longitude'), {
        stage: 'preflight',
        key: '__LATITUDE__/__LONGITUDE__',
        message: '[GeoOverride] geolocation missing latitude/longitude',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'coords_missing' }
      });
      __releaseGuard(true);
      return;
    }

    __geoState.latitude = latitude;
    __geoState.longitude = longitude;
    __runGeoHidePass();
    __applyStarted = true;

    if (!patchGeolocation()) {
      __restoreGeoStateValue(__geoState, __geoStateSnapshot);
      __releaseGuard(true);
      return;
    }
  } catch (e) {
    let rollbackErr = null;
    if (__applyStarted) {
      try {
        __restoreGeoStateValue(__geoState, __geoStateSnapshot);
      } catch (re) {
        rollbackErr = re;
      }
    }
    degrade('geo:fatal', rollbackErr || e, {
      stage: 'apply',
      message: '[GeoOverride] fatal module error',
      type: 'browser structure missing data',
      data: { outcome: 'throw', reason: 'fatal', rollbackOk: !rollbackErr }
    });
    __releaseGuard(!rollbackErr);
    throw (rollbackErr || e);
  }
})();

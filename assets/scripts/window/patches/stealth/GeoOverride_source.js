(() => {
  if (window.__GEO_PATCHED__) return;

  const Core = window && window.Core;
  if (!Core || typeof Core.applyTargets !== 'function') {
    try { if (typeof window.__DEGRADE__ === 'function') window.__DEGRADE__('geo:core_missing', new Error('[GeoOverride] Core.applyTargets is required'), { stage: 'preflight' }); } catch (_) {}
    return;
  }

  const latitude = window.__LATITUDE__;
  const longitude = window.__LONGITUDE__;

  function degrade(code, err, extra) {
    try {
      if (typeof window.__DEGRADE__ === 'function') window.__DEGRADE__(code, err || null, extra || null);
    } catch (_) {}
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
        degrade(groupTag + ':group_skipped', new Error('[GeoOverride] group skipped'), { reason: plans.reason || null });
      }
      return 0;
    }

    const done = [];
    try {
      for (let i = 0; i < plans.length; i++) {
        const p = plans[i];
        if (!p || p.skipApply) continue;
        if (!p.owner || typeof p.key !== 'string' || !p.nextDesc) {
          throw new Error('[GeoOverride] invalid plan item');
        }
        Object.defineProperty(p.owner, p.key, p.nextDesc);
        const after = Object.getOwnPropertyDescriptor(p.owner, p.key);
        if (!isSameDescriptor(after, p.nextDesc)) {
          throw new Error('[GeoOverride] descriptor post-check mismatch');
        }
        done.push(p);
      }
      return done.length;
    } catch (e) {
      let rollbackErr = null;
      for (let i = done.length - 1; i >= 0; i--) {
        const p = done[i];
        try {
          if (p.origDesc) Object.defineProperty(p.owner, p.key, cloneDesc(p.origDesc));
          else delete p.owner[p.key];
        } catch (re) {
          if (!rollbackErr) rollbackErr = re;
          degrade(groupTag + ':rollback_failed', re, { key: p && p.key ? p.key : null });
        }
      }
      if (rollbackErr) {
        if (groupPolicy === 'throw') throw rollbackErr;
        return 0;
      }
      degrade(groupTag + ':apply_failed', e);
      if (groupPolicy === 'throw') throw e;
      return 0;
    }
  }

  function patchGeolocation(lat, lon) {
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      degrade('geo:coords_missing', new Error('[GeoOverride] geolocation missing latitude/longitude'), { stage: 'preflight' });
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
      degrade('geo:geolocation_descriptor_missing', new Error('[GeoOverride] geolocation descriptor missing'), { stage: 'preflight' });
      return false;
    }

    const nativeGeo = Reflect.apply(geolocationDesc.get, nav, []);
    if (!nativeGeo || typeof nativeGeo !== 'object') {
      degrade('geo:geolocation_object_missing', new Error('[GeoOverride] geolocation object missing'), { stage: 'preflight' });
      return false;
    }
    const geoProto = Object.getPrototypeOf(nativeGeo);
    if (!geoProto || (typeof geoProto !== 'object' && typeof geoProto !== 'function')) {
      degrade('geo:geolocation_proto_missing', new Error('[GeoOverride] geolocation prototype missing'), { stage: 'preflight' });
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
          degrade('geo:mask_position_failed', e);
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
      applyTargetGroup('geo:methods', targets, 'throw');
    } catch (e) {
      degrade('geo:apply_failed', e);
      return false;
    }
    degrade('geo:patched', null, { latitude: lat, longitude: lon });
    return true;
  }

  window.patchGeolocation = patchGeolocation;
  if (patchGeolocation(latitude, longitude)) window.__GEO_PATCHED__ = true;
})();

(() => {
  if (window.__GEO_PATCHED__) return;

  const latitude = window.__LATITUDE__;
  const longitude = window.__LONGITUDE__;
  const __geoDegrade = (typeof window.__DEGRADE__ === 'function') ? window.__DEGRADE__ : null;
  const __geoLogArr = Array.isArray(window._myDebugLog) ? window._myDebugLog : null;
  function __geoDiag(level, code, extra, err) {
    if ((level === 'warn' || level === 'error') && typeof __geoDegrade === 'function') {
      __geoDegrade(code || 'geo', err || null, extra || null);
      return;
    }
    try {
      if (__geoLogArr) {
        __geoLogArr.push({
          type: 'geo_' + level,
          code: code || null,
          extra: extra || null,
          error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack || null } : null,
          timestamp: new Date().toISOString()
        });
      }
    } catch (_) {}
  }

  /**
   * Patch geolocation (getCurrentPosition/watchPosition).
   * lat/lon are taken only from pipeline variables.
   */
  function patchGeolocation(lat, lon) {
    if (typeof lat !== "number" || typeof lon !== "number") {
      throw new Error("THW: geolocation missing latitude/longitude");
    }

    function makePosition() {
      return {
        coords: {
          latitude: lat,
          longitude: lon,
          accuracy: 100,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      };
    }

    function makeError(code, message) {
      // минимальный объект ошибки, без новых брендов/конструкторов
      return { code, message };
    }

    const fake = {
      getCurrentPosition(success, error, options) {
        if (this !== fake) throw new TypeError("Illegal invocation");
        if (typeof success !== "function") {
          throw new TypeError("THW: geolocation.getCurrentPosition requires success callback");
        }
        // options игнорируем (как минимум), но сигнатуру поддерживаем
        setTimeout(() => {
          try {
            success(makePosition());
          } catch (e) {
            if (typeof error === "function") error(makeError(0, String(e && e.message ? e.message : e)));
          }
        }, 0);
      },

      watchPosition(success, error, options) {
        if (this !== fake) throw new TypeError("Illegal invocation");
        if (typeof success !== "function") {
          throw new TypeError("THW: geolocation.watchPosition requires success callback");
        }
        const id = setInterval(() => {
          try {
            success(makePosition());
          } catch (e) {
            if (typeof error === "function") error(makeError(0, String(e && e.message ? e.message : e)));
          }
        }, 1000);
        return id;
      },

      clearWatch(id) {
        if (this !== fake) throw new TypeError("Illegal invocation");
        clearInterval(id);
      }
    };

    // prefer prototype (readonly WebIDL attribute semantics), fallback to own only if missing
    const navProto = Object.getPrototypeOf(navigator);
    const dProto = navProto && Object.getOwnPropertyDescriptor(navProto, "geolocation");

    if (dProto && dProto.configurable === false) {
      throw new Error("THW: geolocation non-configurable on prototype");
    }

    if (navProto) {
      Object.defineProperty(navProto, "geolocation", {
        get: function get_geolocation() { return fake; },
        configurable: true,
        enumerable: dProto ? !!dProto.enumerable : false
      });
    } else {
      Object.defineProperty(navigator, "geolocation", {
        get: function get_geolocation() { return fake; },
        configurable: true,
        enumerable: false
      });
    }

    __geoDiag('info', 'geo:patched', { latitude: lat, longitude: lon });
  }

  window.patchGeolocation = patchGeolocation;
  patchGeolocation(latitude, longitude);
  window.__GEO_PATCHED__ = true;
})();

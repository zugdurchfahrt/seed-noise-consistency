const RtcpeerconnectionPatchModule = function RtcpeerconnectionPatchModule(window) {

  const C = window.CanvasPatchContext;
  const G = (typeof globalThis !== 'undefined' && globalThis)
        || (typeof self       !== 'undefined' && self)
        || (typeof window     !== 'undefined' && window)
        || (typeof global     !== 'undefined' && global)
        || {};

  if (!window.__CORE_WINDOW_LOADED__) {
    throw new Error('[RTC] core_window.js not loaded - must load BEFORE RTCPeerConnection.js');
  }

  const safeDefine = (function() {
    const sd = (window && typeof window.__safeDefine === 'function') ? window.__safeDefine : null;
    if (typeof sd !== 'function') {
      throw new Error('[RTC] safeDefine missing');
    }
    return sd;
  })();

  const wrapApply = (function() {
    const wrap = (window && typeof window.__wrapNativeApply === 'function') ? window.__wrapNativeApply : null;
    if (typeof wrap !== 'function') {
      throw new Error('[RTC] __wrapNativeApply missing');
    }
    return wrap;
  })();

  const wrapAcc = (function() {
    const wrap = (window && typeof window.__wrapNativeAccessor === 'function') ? window.__wrapNativeAccessor : null;
    if (typeof wrap !== 'function') {
      throw new Error('[RTC] __wrapNativeAccessor missing');
    }
    return wrap;
  })();

  const Orig = window.RTCPeerConnection;
  if (!Orig) return;

  if (Orig.__PATCH_RTCPEERCONNECTION__) return;
  safeDefine(Orig, '__PATCH_RTCPEERCONNECTION__', {
    value: true,
    writable: false,
    configurable: true,
    enumerable: false
  });
  try {
    if (Object.prototype.hasOwnProperty.call(window, '__PATCH_RTCPEERCONNECTION__')) delete window.__PATCH_RTCPEERCONNECTION__;
  } catch (_) {}

  function filterSDP(sdp) {
    return sdp
      .split('\n')
      .filter(l => !l.startsWith('a=candidate') || l.includes('relay'))
      .join('\n');
  }

  function normalizeIceServers(servers) {
    const out = [];
    for (const s of servers || []) {
      if (!s) continue;
      const list = Array.isArray(s.urls) ? s.urls : (s.url || s.urls ? [s.url || s.urls] : []);
      const urls = [];
      for (let u of list) {
        if (typeof u !== 'string') continue;
        u = u.trim().replace(/#.*$/, '');
        if (!/^(stun|stuns|turn|turns):/i.test(u)) continue;

        const isStun = /^stuns?:/i.test(u);
        if (isStun) {
          u = u.replace(/\?.*$/, '');
        } else {
          const q = u.match(/\?transport=([^&]+)/i);
          if (q && !/^(udp|tcp|tls)$/i.test(q[1])) continue;
        }
        urls.push(u);
      }
      if (!urls.length) continue;
      const entry = { urls };
      if (s.username) entry.username = s.username;
      if (s.credential) entry.credential = s.credential;
      out.push(entry);
    }
    return out;
  }

  // --- preserve originals (prototype-level)
  const origCreateOffer = Orig.prototype.createOffer;
  const origCreateAnswer = Orig.prototype.createAnswer;
  const origSetLocalDescription = Orig.prototype.setLocalDescription;
  const origAddIceCandidate = Orig.prototype.addIceCandidate;
  const origAddEventListener = Orig.prototype.addEventListener;
  const origRemoveEventListener = Orig.prototype.removeEventListener;
  const origSetConfiguration = Orig.prototype.setConfiguration;

  // --- patch prototype methods via Core wrapper (Proxy/apply)
  if (typeof origCreateOffer === 'function') {
    Orig.prototype.createOffer = wrapApply(origCreateOffer, 'createOffer', function(nativeFn, thisArg, args) {
      const p = Reflect.apply(nativeFn, thisArg, args);
      if (!p || typeof p.then !== 'function') return p;
      return p.then(function(desc) {
        if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
        return desc;
      });
    });
  }

  if (typeof origCreateAnswer === 'function') {
    Orig.prototype.createAnswer = wrapApply(origCreateAnswer, 'createAnswer', function(nativeFn, thisArg, args) {
      const p = Reflect.apply(nativeFn, thisArg, args);
      if (!p || typeof p.then !== 'function') return p;
      return p.then(function(desc) {
        if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
        return desc;
      });
    });
  }

  if (typeof origSetLocalDescription === 'function') {
    Orig.prototype.setLocalDescription = wrapApply(origSetLocalDescription, 'setLocalDescription', function(nativeFn, thisArg, args) {
      const desc = args && args.length ? args[0] : undefined;
      if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
      return Reflect.apply(nativeFn, thisArg, args);
    });
  }

  if (typeof origAddIceCandidate === 'function') {
    Orig.prototype.addIceCandidate = wrapApply(origAddIceCandidate, 'addIceCandidate', function(nativeFn, thisArg, args) {
      const candidate = args && args.length ? args[0] : undefined;
      if (candidate && candidate.candidate && !candidate.candidate.includes('relay')) {
        return Promise.resolve();
      }
      return Reflect.apply(nativeFn, thisArg, args);
    });
  }

  // Preserve iceServers normalization without wrapping constructor.
  if (typeof origSetConfiguration === 'function') {
    Orig.prototype.setConfiguration = wrapApply(origSetConfiguration, 'setConfiguration', function(nativeFn, thisArg, args) {
      const cfg = args && args.length ? args[0] : undefined;
      if (cfg && typeof cfg === 'object' && cfg.iceServers) {
        cfg.iceServers = normalizeIceServers(cfg.iceServers);
      }
      return Reflect.apply(nativeFn, thisArg, args);
    });
  }

  // --- onicecandidate accessor (prototype-level)
  try {
    const d = Object.getOwnPropertyDescriptor(Orig.prototype, 'onicecandidate');
    if (!d) throw new TypeError();
    if (d.configurable === false) throw new TypeError();
    if (!(typeof d.get === 'function' || typeof d.set === 'function')) throw new TypeError();
      const handlerMap = (typeof WeakMap === 'function') ? new WeakMap() : null;
      const origGet = d.get;
      const origSet = d.set;

      const get = (typeof origGet === 'function')
        ? wrapAcc(origGet, 'get onicecandidate', function(nativeGet, thisArg, args) {
            if (handlerMap && handlerMap.has(thisArg)) {
              const rec = handlerMap.get(thisArg);
              if (rec && Object.prototype.hasOwnProperty.call(rec, 'orig')) return rec.orig;
            }
            return Reflect.apply(nativeGet, thisArg, args);
          })
        : undefined;

      const set = (typeof origSet === 'function')
        ? wrapAcc(origSet, 'set onicecandidate', function(nativeSet, thisArg, args) {
            const handler = args && args.length ? args[0] : undefined;
            if (typeof handler !== 'function') {
              if (handlerMap) handlerMap.set(thisArg, { orig: handler, wrapped: handler });
              return Reflect.apply(nativeSet, thisArg, args);
            }
            const wrapped = function(e) {
              if (!e || !e.candidate || (e.candidate && e.candidate.candidate && e.candidate.candidate.includes('relay'))) {
                return handler.call(this, e);
              }
            };
            if (handlerMap) handlerMap.set(thisArg, { orig: handler, wrapped });
            return Reflect.apply(nativeSet, thisArg, [wrapped]);
          })
        : undefined;

      Object.defineProperty(Orig.prototype, 'onicecandidate', {
        get,
        set,
        configurable: true,
        enumerable: d ? !!d.enumerable : false
      });
  } catch (e) {
    throw e;
  }

  // --- filter icecandidate listeners
  const __iceListenerMap = (typeof WeakMap === 'function') ? new WeakMap() : null;
  const __iceCapture = function __iceCapture(options) {
    if (options === true) return true;
    if (!options || typeof options !== 'object') return false;
    return !!options.capture;
  };
  const __iceRemember = function __iceRemember(thisArg, handler, capture, wrapped) {
    if (!__iceListenerMap) return;
    let m = __iceListenerMap.get(thisArg);
    if (!m) { m = new Map(); __iceListenerMap.set(thisArg, m); }
    let byHandler = m.get(handler);
    if (!byHandler) { byHandler = new Map(); m.set(handler, byHandler); }
    byHandler.set(capture ? 1 : 0, wrapped);
  };
  const __iceResolve = function __iceResolve(thisArg, handler, capture) {
    if (!__iceListenerMap) return null;
    const m = __iceListenerMap.get(thisArg);
    if (!m) return null;
    const byHandler = m.get(handler);
    if (!byHandler) return null;
    return byHandler.get(capture ? 1 : 0) || null;
  };
  const __iceForget = function __iceForget(thisArg, handler, capture) {
    if (!__iceListenerMap) return;
    const m = __iceListenerMap.get(thisArg);
    if (!m) return;
    const byHandler = m.get(handler);
    if (!byHandler) return;
    byHandler.delete(capture ? 1 : 0);
    if (!byHandler.size) m.delete(handler);
    if (!m.size) __iceListenerMap.delete(thisArg);
  };
  if (typeof origAddEventListener === 'function') {
    Orig.prototype.addEventListener = wrapApply(origAddEventListener, 'addEventListener', function(nativeFn, thisArg, args) {
      const type = args && args.length ? args[0] : undefined;
      const handler = args && args.length > 1 ? args[1] : undefined;
      const options = args && args.length > 2 ? args[2] : undefined;
      if (type === 'icecandidate' && typeof handler === 'function') {
        const capture = __iceCapture(options);
        const once = !!(options && typeof options === 'object' && options.once);
        const wrapped = function(e) {
          if (once) __iceForget(thisArg, handler, capture);
          if (!e || !e.candidate || (e.candidate && e.candidate.candidate && e.candidate.candidate.includes('relay'))) {
            return handler.call(this, e);
          }
          if (e && typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
        };
        __iceRemember(thisArg, handler, capture, wrapped);
        return Reflect.apply(nativeFn, thisArg, [type, wrapped, options]);
      }
      return Reflect.apply(nativeFn, thisArg, args);
    });
  }


  if (typeof origRemoveEventListener === 'function') {
    Orig.prototype.removeEventListener = wrapApply(origRemoveEventListener, 'removeEventListener', function(nativeFn, thisArg, args) {
      const type = args && args.length ? args[0] : undefined;
      const handler = args && args.length > 1 ? args[1] : undefined;
      const options = args && args.length > 2 ? args[2] : undefined;
      if (type === 'icecandidate' && typeof handler === 'function') {
        const capture = __iceCapture(options);
        const wrapped = __iceResolve(thisArg, handler, capture);
        if (wrapped) {
          __iceForget(thisArg, handler, capture);
          return Reflect.apply(nativeFn, thisArg, [type, wrapped, options]);
        }
      }
      return Reflect.apply(nativeFn, thisArg, args);
    });
  }
  console.log('[✔]RTC protection set');
}

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
  if (typeof window.__safeDefine !== 'function' || typeof window.__ensureMarkAsNative !== 'function') {
    throw new Error('[RTC] Core primitives missing - core_window.js failed?');
  }
  const safeDefine = window.__safeDefine;
  const markAsNative = window.__ensureMarkAsNative();
  if (typeof markAsNative !== 'function') {
    throw new Error('[RtcpeerconnectionPatchModule] markAsNative missing');
  }
  const wrapApply = (typeof window.__wrapNativeApply === 'function') ? window.__wrapNativeApply : null;
  const wrapAcc = (typeof window.__wrapNativeAccessor === 'function') ? window.__wrapNativeAccessor : null;
  if (typeof wrapApply !== 'function' || typeof wrapAcc !== 'function') {
    throw new Error('[RTC] Core wrap primitives missing - core_window.js failed?');
  }


  function tryCopyNameLength(wrapped, nativeFn, name) {
    try {
      const nameDesc = Object.getOwnPropertyDescriptor(wrapped, 'name');
      if (nameDesc && nameDesc.configurable) Object.defineProperty(wrapped, 'name', { value: name });
    } catch (_) {}
    try {
      const lenDesc = Object.getOwnPropertyDescriptor(wrapped, 'length');
      if (lenDesc && lenDesc.configurable && nativeFn && typeof nativeFn.length === 'number') {
        Object.defineProperty(wrapped, 'length', { value: nativeFn.length });
      }
    } catch (_) {}
  }

 
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

  // --- patch prototype methods (native invariants preserved)
  const patchedCreateOffer = wrapApply(origCreateOffer, 'createOffer', function(nativeFn, thisArg, args) {
    const p = Reflect.apply(nativeFn, thisArg, args);
    return p.then(function(desc) {
      if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
      return desc;
    });
  });
  Orig.prototype.createOffer = patchedCreateOffer;

  const patchedCreateAnswer = wrapApply(origCreateAnswer, 'createAnswer', function(nativeFn, thisArg, args) {
    const p = Reflect.apply(nativeFn, thisArg, args);
    return p.then(function(desc) {
      if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
      return desc;
    });
  });
  Orig.prototype.createAnswer = patchedCreateAnswer;

  const patchedSetLocalDescription = wrapApply(origSetLocalDescription, 'setLocalDescription', function(nativeFn, thisArg, args) {
    const desc = args && args.length ? args[0] : undefined;
    if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
    return Reflect.apply(nativeFn, thisArg, args);
  });
  Orig.prototype.setLocalDescription = patchedSetLocalDescription;

  const patchedAddIceCandidate = wrapApply(origAddIceCandidate, 'addIceCandidate', function(nativeFn, thisArg, args) {
    const candidate = args && args.length ? args[0] : undefined;
    if (candidate && candidate.candidate && !candidate.candidate.includes('relay')) {
      return Promise.resolve();
    }
    return Reflect.apply(nativeFn, thisArg, args);
  });
  Orig.prototype.addIceCandidate = patchedAddIceCandidate;

  // --- onicecandidate accessor (prototype-level)
  try {
    const d = Object.getOwnPropertyDescriptor(Orig.prototype, 'onicecandidate');
    if (d && d.configurable === false) {
      // cannot redefine
    } else if (d && (typeof d.get === 'function' || typeof d.set === 'function')) {
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
    }
  } catch (_) {
    // если нельзя — не ломаемся, но prototype-патчи выше уже работают
  }

  // --- filter icecandidate listeners
  const patchedAddEventListener = wrapApply(origAddEventListener, 'addEventListener', function(nativeFn, thisArg, args) {
    const type = args && args.length ? args[0] : undefined;
    const handler = args && args.length > 1 ? args[1] : undefined;
    const options = args && args.length > 2 ? args[2] : undefined;
    if (type === 'icecandidate' && typeof handler === 'function') {
      const wrapped = function(e) {
        if (!e || !e.candidate || (e.candidate && e.candidate.candidate && e.candidate.candidate.includes('relay'))) {
          return handler.call(this, e);
        }
        if (e && typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      };
      return Reflect.apply(nativeFn, thisArg, [type, wrapped, options]);
    }
    return Reflect.apply(nativeFn, thisArg, args);
  });
  Orig.prototype.addEventListener = patchedAddEventListener;





  // --- wrapper constructor that preserves prototype chain
  function PatchedRTCPeerConnection(...args) {
    if (!new.target) {
      return Orig.apply(this, args);
    }
    const opts = args[0] && typeof args[0] === 'object' ? { ...args[0] } : {};
    if (opts.iceServers) opts.iceServers = normalizeIceServers(opts.iceServers);
    return Reflect.construct(Orig, [opts, ...args.slice(1)], new.target);
  }
  markAsNative(PatchedRTCPeerConnection, 'RTCPeerConnection');
  tryCopyNameLength(PatchedRTCPeerConnection, Orig, 'RTCPeerConnection');

  PatchedRTCPeerConnection.prototype = Orig.prototype;
  Object.setPrototypeOf(PatchedRTCPeerConnection, Orig);
  window.RTCPeerConnection = PatchedRTCPeerConnection;

  console.log('[✔]RTC protection set');
}

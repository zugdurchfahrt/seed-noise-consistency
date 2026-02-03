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
  const patchedCreateOffer = function createOffer(...args) {
    const p = origCreateOffer.apply(this, args);
    return p.then(function(desc) {
      if (desc && desc.sdp) {
        desc.sdp = desc.sdp
          .split('\n')
          .filter(l => !l.startsWith('a=candidate') || l.includes('relay'))
          .join('\n');
      }
      return desc;
    });
  };
  markAsNative(patchedCreateOffer, 'createOffer');
  tryCopyNameLength(patchedCreateOffer, origCreateOffer, 'createOffer');
  Orig.prototype.createOffer = patchedCreateOffer;

  const patchedCreateAnswer = function createAnswer(...args) {
    const p = origCreateAnswer.apply(this, args);
    return p.then(function(desc) {
      if (desc && desc.sdp) {
        desc.sdp = desc.sdp
          .split('\n')
          .filter(l => !l.startsWith('a=candidate') || l.includes('relay'))
          .join('\n');
      }
      return desc;
    });
  };
  markAsNative(patchedCreateAnswer, 'createAnswer');
  tryCopyNameLength(patchedCreateAnswer, origCreateAnswer, 'createAnswer');
  Orig.prototype.createAnswer = patchedCreateAnswer;

  const patchedSetLocalDescription = function setLocalDescription(desc, ...rest) {
    if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
    return origSetLocalDescription.call(this, desc, ...rest);
  };
  markAsNative(patchedSetLocalDescription, 'setLocalDescription');
  tryCopyNameLength(patchedSetLocalDescription, origSetLocalDescription, 'setLocalDescription');
  Orig.prototype.setLocalDescription = patchedSetLocalDescription;

  const patchedAddIceCandidate = function addIceCandidate(candidate, ...rest) {
    if (candidate && candidate.candidate && !candidate.candidate.includes('relay')) {
      return Promise.resolve();
    }
    return origAddIceCandidate.call(this, candidate, ...rest);
  };
  markAsNative(patchedAddIceCandidate, 'addIceCandidate');
  tryCopyNameLength(patchedAddIceCandidate, origAddIceCandidate, 'addIceCandidate');
  Orig.prototype.addIceCandidate = patchedAddIceCandidate;

  // --- onicecandidate accessor (prototype-level)
  try {
    const d = Object.getOwnPropertyDescriptor(Orig.prototype, 'onicecandidate');
    if (!d || d.configurable) {
      Object.defineProperty(Orig.prototype, 'onicecandidate', {
        set(handler) {
          this._onicecandidate = e => {
            if (!e.candidate || (e.candidate && e.candidate.candidate && e.candidate.candidate.includes('relay'))) {
              handler && handler.call(this, e);
            }
          };
        },
        get() {
          return this._onicecandidate;
        },
        configurable: true,
      });
    }
  } catch (_) {
    // если нельзя — не ломаемся, но prototype-патчи выше уже работают
  }

  // --- filter icecandidate listeners
  const patchedAddEventListener = function addEventListener(type, handler, options) {
    if (type === 'icecandidate' && typeof handler === 'function') {
      const wrapped = e => {
        if (!e.candidate || (e.candidate && e.candidate.candidate && e.candidate.candidate.includes('relay'))) {
          handler.call(this, e);
        } else {
          e.stopImmediatePropagation && e.stopImmediatePropagation();
        }
      };
      return origAddEventListener.call(this, type, wrapped, options);
    }
    return origAddEventListener.call(this, type, handler, options);
  };
  markAsNative(patchedAddEventListener, 'addEventListener');
  tryCopyNameLength(patchedAddEventListener, origAddEventListener, 'addEventListener');
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

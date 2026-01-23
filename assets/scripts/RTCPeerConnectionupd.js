const RtcpeerconnectionPatchModule = function RtcpeerconnectionPatchModule(window) {
  if (window.__PATCH_RTCPEERCONNECTION__) return;
  window.__PATCH_RTCPEERCONNECTION__ = true;
  const C = window.CanvasPatchContext;
  // Global-Alias ​​(reliable in the window and workrs)
  const G = (typeof globalThis !== 'undefined' && globalThis)
        || (typeof self       !== 'undefined' && self)
        || (typeof window     !== 'undefined' && window)
        || (typeof global     !== 'undefined' && global)
        || {};
  
    
    // --- nativization provider (moved from hide_webdriver.js) ---
  function safeDefine(obj, prop, descriptor) {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return;

    const d = Object.getOwnPropertyDescriptor(obj, prop);
    if (d && d.configurable === false) {
      throw new TypeError(`[stealth] safeDefine refused: "${prop}" is non-configurable`);
    }
    if (d) delete obj[prop];

    Object.defineProperty(obj, prop, descriptor);
  }

  // export for consumers (hide_webdriver.js and others)
  if (typeof window.__safeDefine !== 'function') {
    safeDefine(window, '__safeDefine', {
      value: safeDefine,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }

  // ——— Global mask "native" + general WeakMap ———
  if (window.__NativeToString != null && typeof window.__NativeToString !== 'function') {
    throw new Error('[RtcpeerconnectionPatchModule] __NativeToString must be a function');
  }

  const nativeGetOwnProp = Object.getOwnPropertyDescriptor;
  const nativeToString = window.__NativeToString || Function.prototype.toString;

  if (typeof nativeToString !== 'function') {
    throw new Error('[RtcpeerconnectionPatchModule] Function.prototype.toString missing');
  }

  // pin once: never overwrite an already captured native anchor
  if (!window.__NativeToString) {
    Object.defineProperty(window, '__NativeToString', {
      value: nativeToString,
      writable: false,
      configurable: true,
      enumerable: false
    });
  }

  // general WeakMap, available to all modules
  const toStringOverrideMap = (window.__NativeToStringMap instanceof WeakMap)
    ? window.__NativeToStringMap
    : new WeakMap();
  window.__NativeToStringMap = toStringOverrideMap;

  // Unified global function-mask
  function baseMarkAsNative(func, name = "") {
    if (typeof func !== 'function') return func;
    const n = name || func.name || "";
    const label = n ? `function ${n}() { [native code] }` : 'function () { [native code] }';
    toStringOverrideMap.set(func, label);
    return func;
  }

  function ensureMarkAsNative() {
    const existing = (typeof window.markAsNative === 'function') ? window.markAsNative : null;

    if (!existing) {
      baseMarkAsNative.__TOSTRING_BRIDGE__ = true;
      safeDefine(window, 'markAsNative', {
        value: baseMarkAsNative,
        writable: true,
        configurable: true,
        enumerable: false
      });
      return baseMarkAsNative;
    }
    if (existing.__TOSTRING_BRIDGE__) return existing;

    const wrapped = function markAsNative(func, name = "") {
      const out = existing(func, name);
      return baseMarkAsNative(out, name);
    };
    wrapped.__TOSTRING_BRIDGE__ = true;

    safeDefine(window, 'markAsNative', {
      value: wrapped,
      writable: true,
      configurable: true,
      enumerable: false
    });
    return wrapped;
  }

  if (typeof window.__ensureMarkAsNative !== 'function') {
    safeDefine(window, '__ensureMarkAsNative', {
      value: ensureMarkAsNative,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }

  // follow project-wide pattern (nav_total_set/webgpu)
  const markAsNative = (function() {
    const ensure = (typeof window.__ensureMarkAsNative === 'function') ? window.__ensureMarkAsNative : null;
    const m = ensure ? ensure() : window.markAsNative;
    if (typeof m !== 'function') {
      throw new Error('[RtcpeerconnectionPatchModule] markAsNative missing');
    }
    return m;
  })();

  // Function.prototype.toString override (NON-PROXY, non-constructible) reading from the general WeakMap
  if (!window.__TOSTRING_PROXY_INSTALLED__) {
    const toStringDesc = nativeGetOwnProp(Function.prototype, 'toString');

    // non-constructible “method” wrapper (no .prototype), closer to Chromium built-ins
    const toStringWrapped = ({ toString() {
      const receiver = this;
      if (typeof receiver === 'function') {
        const v = toStringOverrideMap.get(receiver);
        if (v !== undefined) return v;
      }
      return Reflect.apply(nativeToString, receiver, arguments);
    }}).toString;

    markAsNative(toStringWrapped, 'toString');

    Object.defineProperty(Function.prototype, 'toString', {
      value: toStringWrapped,
      writable: toStringDesc ? !!toStringDesc.writable : true,
      configurable: toStringDesc ? !!toStringDesc.configurable : true,
      enumerable: toStringDesc ? !!toStringDesc.enumerable : false
    });
    window.__TOSTRING_PROXY_INSTALLED__ = true;
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

  const Orig = window.RTCPeerConnection;
  if (!Orig) return;

  // --- preserve originals (prototype-level)
  const origCreateOffer = Orig.prototype.createOffer;
  const origCreateAnswer = Orig.prototype.createAnswer;
  const origSetLocalDescription = Orig.prototype.setLocalDescription;
  const origAddIceCandidate = Orig.prototype.addIceCandidate;
  const origAddEventListener = Orig.prototype.addEventListener;

  // --- patch prototype methods (native invariants preserved)
  const patchedCreateOffer = function createOffer(...args) {
    return origCreateOffer.apply(this, args).then(desc => {
      if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
      return desc;
    });
  };
  if (markAsNative) { markAsNative(patchedCreateOffer, 'createOffer'); tryCopyNameLength(patchedCreateOffer, origCreateOffer, 'createOffer'); }
  Orig.prototype.createOffer = patchedCreateOffer;

  const patchedCreateAnswer = function createAnswer(...args) {
    return origCreateAnswer.apply(this, args).then(desc => {
      if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
      return desc;
    });
  };
  if (markAsNative) { markAsNative(patchedCreateAnswer, 'createAnswer'); tryCopyNameLength(patchedCreateAnswer, origCreateAnswer, 'createAnswer'); }
  Orig.prototype.createAnswer = patchedCreateAnswer;

  const patchedSetLocalDescription = function setLocalDescription(desc, ...rest) {
    if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
    return origSetLocalDescription.call(this, desc, ...rest);
  };
  if (markAsNative) { markAsNative(patchedSetLocalDescription, 'setLocalDescription'); tryCopyNameLength(patchedSetLocalDescription, origSetLocalDescription, 'setLocalDescription'); }
  Orig.prototype.setLocalDescription = patchedSetLocalDescription;

  const patchedAddIceCandidate = function addIceCandidate(candidate, ...rest) {
    if (candidate && candidate.candidate && !candidate.candidate.includes('relay')) {
      return Promise.resolve();
    }
    return origAddIceCandidate.call(this, candidate, ...rest);
  };
  if (markAsNative) { markAsNative(patchedAddIceCandidate, 'addIceCandidate'); tryCopyNameLength(patchedAddIceCandidate, origAddIceCandidate, 'addIceCandidate'); }
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
  if (markAsNative) { markAsNative(patchedAddEventListener, 'addEventListener'); tryCopyNameLength(patchedAddEventListener, origAddEventListener, 'addEventListener'); }
  Orig.prototype.addEventListener = patchedAddEventListener;





  // Main-thread only (Not executed in workerscope)
  if (typeof window !== 'undefined' && G === window) {
    const WSProto = window.WebSocket && window.WebSocket.prototype;
    if (WSProto) {
      const origClose = WSProto.close;
      // idempotent guard (avoid double-wrapping)
      if (typeof origClose === 'function' && !origClose.__RTCPC_PATCHED__) {
        window._myDebugLog = window._myDebugLog || [];
        const patchedClose = function close(code, reason) {
          // why: Diagnostic closing trace ws
          window._myDebugLog.push({ type: 'websocket-close', code, reason, timestamp: new Date().toISOString() });
          return origClose.call(this, code, reason);
        };
        try { Object.defineProperty(patchedClose, '__RTCPC_PATCHED__', { value: true }); } catch (_) {}
        if (markAsNative) { markAsNative(patchedClose, 'close'); tryCopyNameLength(patchedClose, origClose, 'close'); }
        WSProto.close = patchedClose;
      }
    }
  }

  // --- wrapper constructor that preserves prototype chain
  function PatchedRTCPeerConnection(...args) {
    const opts = args[0] && typeof args[0] === 'object' ? { ...args[0] } : {};
    if (opts.iceServers) opts.iceServers = normalizeIceServers(opts.iceServers);
    return new Orig(opts, ...args.slice(1));
  }
  if (markAsNative) { markAsNative(PatchedRTCPeerConnection, 'RTCPeerConnection'); tryCopyNameLength(PatchedRTCPeerConnection, Orig, 'RTCPeerConnection'); }

  PatchedRTCPeerConnection.prototype = Orig.prototype;
  Object.setPrototypeOf(PatchedRTCPeerConnection, Orig);
  window.RTCPeerConnection = PatchedRTCPeerConnection;

  console.log('[✔]RTC protection set');
}

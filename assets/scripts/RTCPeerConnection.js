const RtcpeerconnectionPatchModule = function RtcpeerconnectionPatchModule(window) {
  if (window.__PATCH_RTCPEERCONNECTION__) return;
  window.__PATCH_RTCPEERCONNECTION__ = true;

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
  Orig.prototype.createOffer = function(...args) {
    return origCreateOffer.apply(this, args).then(desc => {
      if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
      return desc;
    });
  };

  Orig.prototype.createAnswer = function(...args) {
    return origCreateAnswer.apply(this, args).then(desc => {
      if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
      return desc;
    });
  };

  Orig.prototype.setLocalDescription = function(desc, ...rest) {
    if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
    return origSetLocalDescription.call(this, desc, ...rest);
  };

  Orig.prototype.addIceCandidate = function(candidate, ...rest) {
    if (candidate && candidate.candidate && !candidate.candidate.includes('relay')) {
      return Promise.resolve();
    }
    return origAddIceCandidate.call(this, candidate, ...rest);
  };

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
  Orig.prototype.addEventListener = function(type, handler, options) {
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

  // --- wrapper constructor that preserves prototype chain
  function PatchedRTCPeerConnection(...args) {
    const opts = args[0] && typeof args[0] === 'object' ? { ...args[0] } : {};
    if (opts.iceServers) opts.iceServers = normalizeIceServers(opts.iceServers);
    return new Orig(opts, ...args.slice(1));
  }

  PatchedRTCPeerConnection.prototype = Orig.prototype;
  Object.setPrototypeOf(PatchedRTCPeerConnection, Orig);
  window.RTCPeerConnection = PatchedRTCPeerConnection;

  console.log('[✔]RTC protection set');
}

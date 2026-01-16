function RtcpeerconnectionPatchModule() {
  if (!window.__PATCH_RTCPEERCONNECTION__) {
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
        u = u.trim().replace(/#.*$/, ''); // Cut fragments
        if (!/^(stun|stuns|turn|turns):/i.test(u)) continue;

        const isStun = /^stuns?:/i.test(u);
        if (isStun) {
          // STUN: request parameters are not allowed — we cut them off
          u = u.replace(/\?.*$/, '');
        } else {
          // TURN: Allow only ?transport=udp|tcp|tls
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
  window.RTCPeerConnection = function(...args) {
    const opts = args[0] && typeof args[0] === 'object' ? { ...args[0] } : {};
    if (opts.iceServers) opts.iceServers = normalizeIceServers(opts.iceServers);
    const pc = new Orig(opts, ...args.slice(1));

    // --- PATCH createOffer
  pc.createOffer = (...offerArgs) =>
    Orig.prototype.createOffer.apply(pc, offerArgs).then(desc => {
      if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
      return desc;
    });

    // --- PATCH createAnswer
  pc.createAnswer = (...answerArgs) =>
    Orig.prototype.createAnswer.apply(pc, answerArgs).then(desc => {
      if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
      return desc;
    });

    // --- PATCH setLocalDescription (optional, for extra safety)
    pc.setLocalDescription = function(desc, ...rest) {
      if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
      return Orig.prototype.setLocalDescription.call(pc, desc, ...rest);
    };

    // --- PATCH addIceCandidate
    pc.addIceCandidate = function(candidate, ...rest) {
      if (candidate && candidate.candidate && !candidate.candidate.includes('relay')) {
        // We discard non-relay candidates
        return Promise.resolve();
      }
      return Orig.prototype.addIceCandidate.call(pc, candidate, ...rest);
    };

    // --- PATCH onicecandidate (setter)
    Object.defineProperty(pc, 'onicecandidate', {
      set(handler) {
        this._onicecandidate = e => {
          if (
            !e.candidate ||
            (e.candidate && e.candidate.candidate && e.candidate.candidate.includes('relay'))
          ) {
            handler && handler(e);
          }
        };
      },
      get() {
        return this._onicecandidate;
      },
      configurable: true,
    });

    // --- PATCH icecandidate event (for listeners)
    pc.addEventListener('icecandidate', e => {
      if (
        !e.candidate ||
        (e.candidate && e.candidate.candidate && e.candidate.candidate.includes('relay'))
      ) {
        // разрешаем
      } else {
        e.stopImmediatePropagation && e.stopImmediatePropagation();
      }
    }, true);

    return pc;
  };
    console.log('[✔]RTC protection set');
  }
} 
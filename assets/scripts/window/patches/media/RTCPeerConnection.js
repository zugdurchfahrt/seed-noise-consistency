const RtcpeerconnectionPatchModule = function RtcpeerconnectionPatchModule(window) {

  const C = window.CanvasPatchContext;
  const G = (typeof globalThis !== 'undefined' && globalThis)
        || (typeof self       !== 'undefined' && self)
        || (typeof window     !== 'undefined' && window)
        || (typeof global     !== 'undefined' && global)
        || {};
  const __MODULE = 'rtc';
  const __SURFACE = 'rtcp';
  const __FLAG_KEY = '__PATCH_RTCPEERCONNECTION__';
  const __rtcDegrade = (window && typeof window.__DEGRADE__ === 'function') ? window.__DEGRADE__ : null;
  function __rtcDiag(level, code, extra, err) {
    try {
      const x = (extra && typeof extra === 'object') ? extra : {};
      const ctx = {
        module: __MODULE,
        diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : __MODULE,
        surface: __SURFACE,
        key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
        stage: x.stage,
        message: x.message,
        data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
        type: x.type
      };
      if (__rtcDegrade && typeof __rtcDegrade.diag === 'function') {
        __rtcDegrade.diag(String(level || 'info'), String(code || 'rtc'), ctx, err || null);
        return;
      }
      if (typeof __rtcDegrade === 'function') {
        __rtcDegrade(String(code || 'rtc'), err || null, Object.assign({ level: String(level || 'info') }, ctx));
      }
    } catch (emitErr) {
      if (typeof __rtcDegrade === 'function') {
        try {
          __rtcDegrade('rtc:diag_emit_failed', emitErr || null, {
            level: 'warn',
            module: __MODULE,
            diagTag: __MODULE,
            surface: __SURFACE,
            key: '__DEGRADE__',
            stage: 'runtime',
            message: 'rtc diag emit failed',
            type: 'browser structure missing data',
            data: { outcome: 'skip', reason: 'diag_emit_failed' }
          });
        } catch (fallbackErr) {
          return fallbackErr;
        }
      }
      return undefined;
    }
  }

  if (!window.__CORE_WINDOW_LOADED__) {
    __rtcDiag('fatal', 'rtc:core_window_missing', {
      stage: 'preflight',
      key: 'core_window',
      message: 'core_window.js not loaded - must load BEFORE RTCPeerConnection.js',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'missing_dep_core_window' }
    }, new Error('[RTC] core_window.js not loaded'));
    return;
  }

  const __core = window.Core;
  let __guardToken = null;
  if (!__core || typeof __core.guardFlag !== 'function') {
    __rtcDiag('warn', 'rtc:guard_missing', {
      stage: 'guard',
      key: __FLAG_KEY,
      message: 'Core.guardFlag missing',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
    }, null);
    return;
  }
  try {
    __guardToken = __core.guardFlag(__FLAG_KEY, __MODULE);
  } catch (e) {
    __rtcDiag('warn', 'rtc:guard_failed', {
      stage: 'guard',
      key: __FLAG_KEY,
      message: 'guardFlag threw',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'guard_failed' }
    }, e);
    return;
  }
  if (!__guardToken) {
    __rtcDiag('info', 'rtc:already_patched', {
      stage: 'guard',
      key: __FLAG_KEY,
      message: 'already patched (guard)',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'already_patched' }
    }, null);
    return;
  }

  const safeDefine = (function() {
    const sd = (window && typeof window.__safeDefine === 'function') ? window.__safeDefine : null;
    if (typeof sd !== 'function') return null;
    return sd;
  })();
  if (typeof safeDefine !== 'function') {
    __rtcDiag('fatal', 'rtc:safe_define_missing', {
      stage: 'preflight',
      key: '__safeDefine',
      message: 'safeDefine missing',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'missing_dep_safe_define' }
    }, new Error('[RTC] safeDefine missing'));
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__FLAG_KEY, __guardToken, true, __MODULE);
      }
    } catch (releaseErr) {
      __rtcDiag('warn', 'rtc:guard_release_failed', {
        stage: 'guard',
        key: __FLAG_KEY,
        message: 'releaseGuardFlag threw on safeDefine preflight skip',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_failed', rollbackOk: true }
      }, releaseErr);
    }
    return;
  }

  const wrapApply = (function() {
    const wrap = (window && typeof window.__wrapNativeApply === 'function') ? window.__wrapNativeApply : null;
    if (typeof wrap !== 'function') return null;
    return wrap;
  })();
  if (typeof wrapApply !== 'function') {
    __rtcDiag('fatal', 'rtc:wrap_native_apply_missing', {
      stage: 'preflight',
      key: '__wrapNativeApply',
      message: '__wrapNativeApply missing',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'missing_dep_wrap_native_apply' }
    }, new Error('[RTC] __wrapNativeApply missing'));
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__FLAG_KEY, __guardToken, true, __MODULE);
      }
    } catch (releaseErr) {
      __rtcDiag('warn', 'rtc:guard_release_failed', {
        stage: 'guard',
        key: __FLAG_KEY,
        message: 'releaseGuardFlag threw on wrapApply preflight skip',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_failed', rollbackOk: true }
      }, releaseErr);
    }
    return;
  }

  const wrapAcc = (function() {
    const wrap = (window && typeof window.__wrapNativeAccessor === 'function') ? window.__wrapNativeAccessor : null;
    if (typeof wrap !== 'function') return null;
    return wrap;
  })();
  if (typeof wrapAcc !== 'function') {
    __rtcDiag('fatal', 'rtc:wrap_native_accessor_missing', {
      stage: 'preflight',
      key: '__wrapNativeAccessor',
      message: '__wrapNativeAccessor missing',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'missing_dep_wrap_native_accessor' }
    }, new Error('[RTC] __wrapNativeAccessor missing'));
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__FLAG_KEY, __guardToken, true, __MODULE);
      }
    } catch (releaseErr) {
      __rtcDiag('warn', 'rtc:guard_release_failed', {
        stage: 'guard',
        key: __FLAG_KEY,
        message: 'releaseGuardFlag threw on wrapAcc preflight skip',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_failed', rollbackOk: true }
      }, releaseErr);
    }
    return;
  }

  const Orig = window.RTCPeerConnection;
  if (!Orig) {
    __rtcDiag('info', 'rtc:skip_no_api', {
      stage: 'preflight',
      key: 'RTCPeerConnection',
      message: 'RTCPeerConnection not available',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'missing_api' }
    }, null);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__FLAG_KEY, __guardToken, true, __MODULE);
      }
    } catch (releaseErr) {
      __rtcDiag('warn', 'rtc:guard_release_failed', {
        stage: 'guard',
        key: __FLAG_KEY,
        message: 'releaseGuardFlag threw on missing API skip',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_failed', rollbackOk: true }
      }, releaseErr);
    }
    return;
  }

  if (Orig.__PATCH_RTCPEERCONNECTION__) {
    __rtcDiag('info', 'rtc:already_patched_marker', {
      stage: 'guard',
      key: 'RTCPeerConnection',
      message: 'RTCPeerConnection already patched by marker',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'already_patched_marker' }
    }, null);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__FLAG_KEY, __guardToken, true, __MODULE);
      }
    } catch (releaseErr) {
      __rtcDiag('warn', 'rtc:guard_release_failed', {
        stage: 'guard',
        key: __FLAG_KEY,
        message: 'releaseGuardFlag threw on already patched marker skip',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_failed', rollbackOk: true }
      }, releaseErr);
    }
    return;
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

  // --- preserve originals (prototype-level)
  const origCreateOffer = Orig.prototype.createOffer;
  const origCreateAnswer = Orig.prototype.createAnswer;
  const origSetLocalDescription = Orig.prototype.setLocalDescription;
  const origAddIceCandidate = Orig.prototype.addIceCandidate;
  const origAddEventListener = Orig.prototype.addEventListener;
  const origRemoveEventListener = Orig.prototype.removeEventListener;
  const origSetConfiguration = Orig.prototype.setConfiguration;
  const origOnIceDesc = Object.getOwnPropertyDescriptor(Orig.prototype, 'onicecandidate') || null;

  try {
  safeDefine(Orig, '__PATCH_RTCPEERCONNECTION__', {
    value: true,
    writable: false,
    configurable: true,
    enumerable: false
  });
  // --- patch prototype methods via Core wrapper (Proxy/apply)
  if (typeof origCreateOffer === 'function') {
    Orig.prototype.createOffer = wrapApply(origCreateOffer, 'createOffer', function(nativeFn, thisArg, args) {
      let p;
      try {
        p = Reflect.apply(nativeFn, thisArg, args);
      } catch (e) {
        __rtcDiag('warn', 'rtc:createOffer:native_throw', {
          stage: 'runtime',
          key: 'createOffer',
          message: 'native createOffer threw',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'native_throw' }
        }, e);
        throw e;
      }
      if (!p || typeof p.then !== 'function') return p;
      return p.then(function(desc) {
        if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
        return desc;
      });
    });
  }

  if (typeof origCreateAnswer === 'function') {
    Orig.prototype.createAnswer = wrapApply(origCreateAnswer, 'createAnswer', function(nativeFn, thisArg, args) {
      let p;
      try {
        p = Reflect.apply(nativeFn, thisArg, args);
      } catch (e) {
        __rtcDiag('warn', 'rtc:createAnswer:native_throw', {
          stage: 'runtime',
          key: 'createAnswer',
          message: 'native createAnswer threw',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'native_throw' }
        }, e);
        throw e;
      }
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
      try {
        return Reflect.apply(nativeFn, thisArg, args);
      } catch (e) {
        __rtcDiag('warn', 'rtc:setLocalDescription:native_throw', {
          stage: 'runtime',
          key: 'setLocalDescription',
          message: 'native setLocalDescription threw',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'native_throw' }
        }, e);
        throw e;
      }
    });
  }

  if (typeof origAddIceCandidate === 'function') {
    Orig.prototype.addIceCandidate = wrapApply(origAddIceCandidate, 'addIceCandidate', function(nativeFn, thisArg, args) {
      const candidate = args && args.length ? args[0] : undefined;
      if (candidate && candidate.candidate && !candidate.candidate.includes('relay')) {
        return Promise.resolve();
      }
      try {
        return Reflect.apply(nativeFn, thisArg, args);
      } catch (e) {
        __rtcDiag('warn', 'rtc:addIceCandidate:native_throw', {
          stage: 'runtime',
          key: 'addIceCandidate',
          message: 'native addIceCandidate threw',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'native_throw' }
        }, e);
        throw e;
      }
    });
  }

  // Preserve iceServers normalization without wrapping constructor.
  if (typeof origSetConfiguration === 'function') {
    Orig.prototype.setConfiguration = wrapApply(origSetConfiguration, 'setConfiguration', function(nativeFn, thisArg, args) {
      const cfg = args && args.length ? args[0] : undefined;
      if (cfg && typeof cfg === 'object' && cfg.iceServers) {
        cfg.iceServers = normalizeIceServers(cfg.iceServers);
      }
      try {
        return Reflect.apply(nativeFn, thisArg, args);
      } catch (e) {
        __rtcDiag('warn', 'rtc:setConfiguration:native_throw', {
          stage: 'runtime',
          key: 'setConfiguration',
          message: 'native setConfiguration threw',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'native_throw' }
        }, e);
        throw e;
      }
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
            try {
              return Reflect.apply(nativeGet, thisArg, args);
            } catch (e) {
              __rtcDiag('warn', 'rtc:onicecandidate_get:native_throw', {
                stage: 'runtime',
                key: 'onicecandidate',
                message: 'native getter onicecandidate threw',
                type: 'browser structure missing data',
                data: { outcome: 'throw', reason: 'native_throw' }
              }, e);
              throw e;
            }
          })
        : undefined;

      const set = (typeof origSet === 'function')
        ? wrapAcc(origSet, 'set onicecandidate', function(nativeSet, thisArg, args) {
            const handler = args && args.length ? args[0] : undefined;
            if (typeof handler !== 'function') {
              if (handlerMap) handlerMap.set(thisArg, { orig: handler, wrapped: handler });
              try {
                return Reflect.apply(nativeSet, thisArg, args);
              } catch (e) {
                __rtcDiag('warn', 'rtc:onicecandidate_set:native_throw', {
                  stage: 'runtime',
                  key: 'onicecandidate',
                  message: 'native setter onicecandidate threw',
                  type: 'browser structure missing data',
                  data: { outcome: 'throw', reason: 'native_throw' }
                }, e);
                throw e;
              }
            }
            const wrapped = function(e) {
              if (!e || !e.candidate || (e.candidate && e.candidate.candidate && e.candidate.candidate.includes('relay'))) {
                return handler.call(this, e);
              }
            };
            if (handlerMap) handlerMap.set(thisArg, { orig: handler, wrapped });
            try {
              return Reflect.apply(nativeSet, thisArg, [wrapped]);
            } catch (e) {
              __rtcDiag('warn', 'rtc:onicecandidate_set:native_throw', {
                stage: 'runtime',
                key: 'onicecandidate',
                message: 'native setter onicecandidate threw',
                type: 'browser structure missing data',
                data: { outcome: 'throw', reason: 'native_throw' }
              }, e);
              throw e;
            }
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
        try {
          return Reflect.apply(nativeFn, thisArg, [type, wrapped, options]);
        } catch (e) {
          __rtcDiag('warn', 'rtc:addEventListener:native_throw', {
            stage: 'runtime',
            key: 'addEventListener',
            message: 'native addEventListener threw',
            type: 'browser structure missing data',
            data: { outcome: 'throw', reason: 'native_throw' }
          }, e);
          throw e;
        }
      }
      try {
        return Reflect.apply(nativeFn, thisArg, args);
      } catch (e) {
        __rtcDiag('warn', 'rtc:addEventListener:native_throw', {
          stage: 'runtime',
          key: 'addEventListener',
          message: 'native addEventListener threw',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'native_throw' }
        }, e);
        throw e;
      }
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
          try {
            return Reflect.apply(nativeFn, thisArg, [type, wrapped, options]);
          } catch (e) {
            __rtcDiag('warn', 'rtc:removeEventListener:native_throw', {
              stage: 'runtime',
              key: 'removeEventListener',
              message: 'native removeEventListener threw',
              type: 'browser structure missing data',
              data: { outcome: 'throw', reason: 'native_throw' }
            }, e);
            throw e;
          }
        }
      }
      try {
        return Reflect.apply(nativeFn, thisArg, args);
      } catch (e) {
        __rtcDiag('warn', 'rtc:removeEventListener:native_throw', {
          stage: 'runtime',
          key: 'removeEventListener',
          message: 'native removeEventListener threw',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'native_throw' }
        }, e);
        throw e;
      }
    });
  }
  __rtcDiag('info', 'rtc:patched', {
    stage: 'apply',
    key: 'RTCPeerConnection',
    message: 'RTC patch applied',
    type: 'ok',
    data: { outcome: 'return', reason: 'patched' }
  }, null);
  } catch (e) {
    let rollbackErr = null;
    try {
      if (typeof origCreateOffer === 'function') Orig.prototype.createOffer = origCreateOffer;
    } catch (re) {
      if (!rollbackErr) rollbackErr = re;
      __rtcDiag('error', 'rtc:rollback_failed', {
        stage: 'rollback',
        key: 'createOffer',
        message: 'rollback restore failed for createOffer',
        type: 'browser structure missing data',
        data: { outcome: 'rollback', reason: 'restore_createOffer_failed' }
      }, re);
    }
    try {
      if (typeof origCreateAnswer === 'function') Orig.prototype.createAnswer = origCreateAnswer;
    } catch (re) {
      if (!rollbackErr) rollbackErr = re;
      __rtcDiag('error', 'rtc:rollback_failed', {
        stage: 'rollback',
        key: 'createAnswer',
        message: 'rollback restore failed for createAnswer',
        type: 'browser structure missing data',
        data: { outcome: 'rollback', reason: 'restore_createAnswer_failed' }
      }, re);
    }
    try {
      if (typeof origSetLocalDescription === 'function') Orig.prototype.setLocalDescription = origSetLocalDescription;
    } catch (re) {
      if (!rollbackErr) rollbackErr = re;
      __rtcDiag('error', 'rtc:rollback_failed', {
        stage: 'rollback',
        key: 'setLocalDescription',
        message: 'rollback restore failed for setLocalDescription',
        type: 'browser structure missing data',
        data: { outcome: 'rollback', reason: 'restore_setLocalDescription_failed' }
      }, re);
    }
    try {
      if (typeof origAddIceCandidate === 'function') Orig.prototype.addIceCandidate = origAddIceCandidate;
    } catch (re) {
      if (!rollbackErr) rollbackErr = re;
      __rtcDiag('error', 'rtc:rollback_failed', {
        stage: 'rollback',
        key: 'addIceCandidate',
        message: 'rollback restore failed for addIceCandidate',
        type: 'browser structure missing data',
        data: { outcome: 'rollback', reason: 'restore_addIceCandidate_failed' }
      }, re);
    }
    try {
      if (typeof origSetConfiguration === 'function') Orig.prototype.setConfiguration = origSetConfiguration;
    } catch (re) {
      if (!rollbackErr) rollbackErr = re;
      __rtcDiag('error', 'rtc:rollback_failed', {
        stage: 'rollback',
        key: 'setConfiguration',
        message: 'rollback restore failed for setConfiguration',
        type: 'browser structure missing data',
        data: { outcome: 'rollback', reason: 'restore_setConfiguration_failed' }
      }, re);
    }
    try {
      if (typeof origAddEventListener === 'function') Orig.prototype.addEventListener = origAddEventListener;
    } catch (re) {
      if (!rollbackErr) rollbackErr = re;
      __rtcDiag('error', 'rtc:rollback_failed', {
        stage: 'rollback',
        key: 'addEventListener',
        message: 'rollback restore failed for addEventListener',
        type: 'browser structure missing data',
        data: { outcome: 'rollback', reason: 'restore_addEventListener_failed' }
      }, re);
    }
    try {
      if (typeof origRemoveEventListener === 'function') Orig.prototype.removeEventListener = origRemoveEventListener;
    } catch (re) {
      if (!rollbackErr) rollbackErr = re;
      __rtcDiag('error', 'rtc:rollback_failed', {
        stage: 'rollback',
        key: 'removeEventListener',
        message: 'rollback restore failed for removeEventListener',
        type: 'browser structure missing data',
        data: { outcome: 'rollback', reason: 'restore_removeEventListener_failed' }
      }, re);
    }
    try {
      if (origOnIceDesc) Object.defineProperty(Orig.prototype, 'onicecandidate', origOnIceDesc);
      else delete Orig.prototype.onicecandidate;
    } catch (re) {
      if (!rollbackErr) rollbackErr = re;
      __rtcDiag('error', 'rtc:rollback_failed', {
        stage: 'rollback',
        key: 'onicecandidate',
        message: 'rollback restore failed for onicecandidate',
        type: 'browser structure missing data',
        data: { outcome: 'rollback', reason: 'restore_onicecandidate_failed' }
      }, re);
    }
    if (!rollbackErr) {
      try {
        delete Orig.__PATCH_RTCPEERCONNECTION__;
      } catch (re) {
        rollbackErr = re;
        __rtcDiag('error', 'rtc:rollback_failed', {
          stage: 'rollback',
          key: '__PATCH_RTCPEERCONNECTION__',
          message: 'rollback restore failed for marker',
          type: 'browser structure missing data',
          data: { outcome: 'rollback', reason: 'restore_patch_marker_failed' }
        }, re);
      }
    }
    const rollbackOk = !rollbackErr;
    __rtcDiag('fatal', 'rtc:apply_failed', {
      stage: 'apply',
      key: 'RTCPeerConnection',
      message: 'RTC patch apply failed (rolled back)',
      type: 'browser structure missing data',
      data: { outcome: rollbackOk ? 'rollback' : 'throw', reason: 'apply_failed', rollbackOk }
    }, e);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__FLAG_KEY, __guardToken, rollbackOk, __MODULE);
      }
    } catch (releaseErr) {
      __rtcDiag('warn', 'rtc:guard_release_failed', {
        stage: 'guard',
        key: __FLAG_KEY,
        message: 'releaseGuardFlag threw after apply failure',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_failed', rollbackOk: !!rollbackOk }
      }, releaseErr);
    }
    return;
  }
}

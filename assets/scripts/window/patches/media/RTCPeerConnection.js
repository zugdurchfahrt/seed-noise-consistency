const RtcpeerconnectionPatchModule = function RtcpeerconnectionPatchModule(window) {
  const __MODULE = 'rtc';
  const __SURFACE = 'rtcp';
  const __FERNWEH_DIAG__ = function(level, code, extra, err) {
    try {
      const G_ = (typeof globalThis !== 'undefined' && globalThis) || (typeof self !== 'undefined' && self) || (typeof window !== 'undefined' && window) || {};
      if (G_.FernwehContext && G_.FernwehContext.__logger && G_.FernwehContext.__logger.__DEGRADE__ && typeof G_.FernwehContext.__logger.__DEGRADE__.diag === 'function') {
        G_.FernwehContext.__logger.__DEGRADE__.diag(level, code, extra, err);
      } else if (G_.__loggerRoot && G_.__loggerRoot.__DEGRADE__ && typeof G_.__loggerRoot.__DEGRADE__.diag === 'function') {
        G_.__loggerRoot.__DEGRADE__.diag(level, code, extra, err);
      }
    } catch (_) {}
  };



  const C = window.FernwehContext;
  const G = (typeof globalThis !== 'undefined' && globalThis)
        || (typeof self       !== 'undefined' && self)
        || (typeof window     !== 'undefined' && window)
        || (typeof global     !== 'undefined' && global)
        || {};
  const __FLAG_KEY = '__PATCH_RTCPEERCONNECTION__';
  const __loggerRoot = (window && window.FernwehContext && window.FernwehContext.__logger && typeof window.FernwehContext.__logger === 'object')
    ? window.FernwehContext.__logger
    : null;
  if (!(window.Core
        && window.Core.__internal
        && typeof window.Core.__internal === 'object'
        && window.Core.__internal.coreWindowLoaded === true)) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'rtc:core_window_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      key: 'core_window',
      message: 'core_window.js not loaded - must load BEFORE RTCPeerConnection.js',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'missing_dep_core_window' }
    }, new Error('[RTC] core_window.js not loaded')) : undefined);
    return;
  }

  const __core = window.Core;
  let __guardToken = null;
  if (!__core || typeof __core.guardFlag !== 'function') {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:guard_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'guard',
      key: __FLAG_KEY,
      message: 'Core.guardFlag missing',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
    }, null) : undefined);
    return;
  }
  try {
    __guardToken = __core.guardFlag(__FLAG_KEY, __MODULE);
  } catch (e) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:guard_failed', { module: __MODULE, surface: __SURFACE, 
      stage: 'guard',
      key: __FLAG_KEY,
      message: 'guardFlag threw',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'guard_failed' }
    }, e) : undefined);
    return;
  }
  if (!__guardToken) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', 'rtc:already_patched', { module: __MODULE, surface: __SURFACE, 
      stage: 'guard',
      key: __FLAG_KEY,
      message: 'already patched (guard)',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'already_patched' }
    }, null) : undefined);
    return;
  }

  if (!C) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'rtc:fernweh_context_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      key: 'FernwehContext',
      message: 'FernwehContext missing',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'fernweh_context_missing' }
    }, new Error('[RTC] FernwehContext missing')) : undefined);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__FLAG_KEY, __guardToken, true, __MODULE);
      }
    } catch (releaseErr) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:guard_release_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'guard',
        key: __FLAG_KEY,
        message: 'releaseGuardFlag threw on FernwehContext preflight skip',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_failed', rollbackOk: true }
      }, releaseErr) : undefined);
    }
    return;
  }
  const __rtcStateRoot = (C.state && typeof C.state === 'object') ? C.state : null;
  if (!__rtcStateRoot) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'rtc:fernweh_context_state_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      key: 'FernwehContext.state',
      message: 'FernwehContext.state missing',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'fernweh_context_state_missing' }
    }, new Error('[RTC] FernwehContext.state missing')) : undefined);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__FLAG_KEY, __guardToken, true, __MODULE);
      }
    } catch (releaseErr) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:guard_release_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'guard',
        key: __FLAG_KEY,
        message: 'releaseGuardFlag threw on FernwehContext.state preflight skip',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_failed', rollbackOk: true }
      }, releaseErr) : undefined);
    }
    return;
  }
  if (!(__rtcStateRoot.__RTCPeerConnection__ && typeof __rtcStateRoot.__RTCPeerConnection__ === 'object')) {
    Object.defineProperty(__rtcStateRoot, '__RTCPeerConnection__', {
      value: Object.create(null),
      writable: true,
      configurable: true,
      enumerable: false
    });
  }

  const safeDefine = (function() {
    const sd = (__core && typeof __core.__safeDefine === 'function') ? __core.__safeDefine : null;
    if (typeof sd !== 'function') return null;
    return sd;
  })();
  if (typeof safeDefine !== 'function') {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'rtc:safe_define_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      key: 'Core.__safeDefine',
      message: 'Core.__safeDefine missing',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'missing_dep_safe_define' }
    }, new Error('[RTC] safeDefine missing')) : undefined);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__FLAG_KEY, __guardToken, true, __MODULE);
      }
    } catch (releaseErr) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:guard_release_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'guard',
        key: __FLAG_KEY,
        message: 'releaseGuardFlag threw on safeDefine preflight skip',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_failed', rollbackOk: true }
      }, releaseErr) : undefined);
    }
    return;
  }

  const wrapApply = (function() {
    const wrap = (__core && typeof __core.__wrapNativeApply === 'function') ? __core.__wrapNativeApply : null;
    if (typeof wrap !== 'function') return null;
    return wrap;
  })();
  if (typeof wrapApply !== 'function') {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'rtc:wrap_native_apply_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      key: 'Core.__wrapNativeApply',
      message: 'Core.__wrapNativeApply missing',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'missing_dep_wrap_native_apply' }
    }, new Error('[RTC] Core.__wrapNativeApply missing')) : undefined);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__FLAG_KEY, __guardToken, true, __MODULE);
      }
    } catch (releaseErr) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:guard_release_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'guard',
        key: __FLAG_KEY,
        message: 'releaseGuardFlag threw on wrapApply preflight skip',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_failed', rollbackOk: true }
      }, releaseErr) : undefined);
    }
    return;
  }

  const wrapAcc = (function() {
    const wrap = (__core && typeof __core.__wrapNativeAccessor === 'function') ? __core.__wrapNativeAccessor : null;
    if (typeof wrap !== 'function') return null;
    return wrap;
  })();
  if (typeof wrapAcc !== 'function') {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'rtc:wrap_native_accessor_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      key: 'Core.__wrapNativeAccessor',
      message: 'Core.__wrapNativeAccessor missing',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'missing_dep_wrap_native_accessor' }
    }, new Error('[RTC] Core.__wrapNativeAccessor missing')) : undefined);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__FLAG_KEY, __guardToken, true, __MODULE);
      }
    } catch (releaseErr) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:guard_release_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'guard',
        key: __FLAG_KEY,
        message: 'releaseGuardFlag threw on wrapAcc preflight skip',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_failed', rollbackOk: true }
      }, releaseErr) : undefined);
    }
    return;
  }

  const Orig = window.RTCPeerConnection;
  if (!Orig) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', 'rtc:skip_no_api', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      key: 'RTCPeerConnection',
      message: 'RTCPeerConnection not available',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'missing_api' }
    }, null) : undefined);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__FLAG_KEY, __guardToken, true, __MODULE);
      }
    } catch (releaseErr) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:guard_release_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'guard',
        key: __FLAG_KEY,
        message: 'releaseGuardFlag threw on missing API skip',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_failed', rollbackOk: true }
      }, releaseErr) : undefined);
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
  function __rtcMarkNative(fn, nativeName, key) {
    if (typeof fn !== 'function') return fn;
    return fn;
  }

  try {
  safeDefine(Orig, '__PATCH_RTCPEERCONNECTION__', {
    value: true,
    writable: false,
    configurable: true,
    enumerable: false
  });
  // --- patch prototype methods via Core wrapper (Proxy/apply)
  if (typeof origCreateOffer === 'function') {
    const wrappedCreateOffer = wrapApply(origCreateOffer, 'createOffer', function(nativeFn, thisArg, args) {
      let p;
      try {
        p = Reflect.apply(nativeFn, thisArg, args);
      } catch (e) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:createOffer:native_throw', { module: __MODULE, surface: __SURFACE, 
          stage: 'runtime',
          key: 'createOffer',
          message: 'native createOffer threw',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'native_throw' }
        }, e) : undefined);
        throw e;
      }
      if (!p || typeof p.then !== 'function') return p;
      return p.then(function(desc) {
        if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
        return desc;
      });
    });
    __rtcMarkNative(wrappedCreateOffer, 'createOffer', 'createOffer');
    Orig.prototype.createOffer = wrappedCreateOffer;
  }

  if (typeof origCreateAnswer === 'function') {
    const wrappedCreateAnswer = wrapApply(origCreateAnswer, 'createAnswer', function(nativeFn, thisArg, args) {
      let p;
      try {
        p = Reflect.apply(nativeFn, thisArg, args);
      } catch (e) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:createAnswer:native_throw', { module: __MODULE, surface: __SURFACE, 
          stage: 'runtime',
          key: 'createAnswer',
          message: 'native createAnswer threw',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'native_throw' }
        }, e) : undefined);
        throw e;
      }
      if (!p || typeof p.then !== 'function') return p;
      return p.then(function(desc) {
        if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
        return desc;
      });
    });
    __rtcMarkNative(wrappedCreateAnswer, 'createAnswer', 'createAnswer');
    Orig.prototype.createAnswer = wrappedCreateAnswer;
  }

  if (typeof origSetLocalDescription === 'function') {
    const wrappedSetLocalDescription = wrapApply(origSetLocalDescription, 'setLocalDescription', function(nativeFn, thisArg, args) {
      const desc = args && args.length ? args[0] : undefined;
      if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp);
      try {
        return Reflect.apply(nativeFn, thisArg, args);
      } catch (e) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:setLocalDescription:native_throw', { module: __MODULE, surface: __SURFACE, 
          stage: 'runtime',
          key: 'setLocalDescription',
          message: 'native setLocalDescription threw',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'native_throw' }
        }, e) : undefined);
        throw e;
      }
    });
    __rtcMarkNative(wrappedSetLocalDescription, 'setLocalDescription', 'setLocalDescription');
    Orig.prototype.setLocalDescription = wrappedSetLocalDescription;
  }

  if (typeof origAddIceCandidate === 'function') {
    const wrappedAddIceCandidate = wrapApply(origAddIceCandidate, 'addIceCandidate', function(nativeFn, thisArg, args) {
      const candidate = args && args.length ? args[0] : undefined;
      if (candidate && candidate.candidate && !candidate.candidate.includes('relay')) {
        return Promise.resolve();
      }
      try {
        return Reflect.apply(nativeFn, thisArg, args);
      } catch (e) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:addIceCandidate:native_throw', { module: __MODULE, surface: __SURFACE, 
          stage: 'runtime',
          key: 'addIceCandidate',
          message: 'native addIceCandidate threw',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'native_throw' }
        }, e) : undefined);
        throw e;
      }
    });
    __rtcMarkNative(wrappedAddIceCandidate, 'addIceCandidate', 'addIceCandidate');
    Orig.prototype.addIceCandidate = wrappedAddIceCandidate;
  }

  // Preserve iceServers normalization without wrapping constructor.
  if (typeof origSetConfiguration === 'function') {
    const wrappedSetConfiguration = wrapApply(origSetConfiguration, 'setConfiguration', function(nativeFn, thisArg, args) {
      const cfg = args && args.length ? args[0] : undefined;
      if (cfg && typeof cfg === 'object' && cfg.iceServers) {
        cfg.iceServers = normalizeIceServers(cfg.iceServers);
      }
      try {
        return Reflect.apply(nativeFn, thisArg, args);
      } catch (e) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:setConfiguration:native_throw', { module: __MODULE, surface: __SURFACE, 
          stage: 'runtime',
          key: 'setConfiguration',
          message: 'native setConfiguration threw',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'native_throw' }
        }, e) : undefined);
        throw e;
      }
    });
    __rtcMarkNative(wrappedSetConfiguration, 'setConfiguration', 'setConfiguration');
    Orig.prototype.setConfiguration = wrappedSetConfiguration;
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
              (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:onicecandidate_get:native_throw', { module: __MODULE, surface: __SURFACE, 
                stage: 'runtime',
                key: 'onicecandidate',
                message: 'native getter onicecandidate threw',
                type: 'browser structure missing data',
                data: { outcome: 'throw', reason: 'native_throw' }
              }, e) : undefined);
              throw e;
            }
          })
        : undefined;
      __rtcMarkNative(get, 'get onicecandidate', 'onicecandidate');

      const set = (typeof origSet === 'function')
        ? wrapAcc(origSet, 'set onicecandidate', function(nativeSet, thisArg, args) {
            const handler = args && args.length ? args[0] : undefined;
            if (typeof handler !== 'function') {
              if (handlerMap) handlerMap.set(thisArg, { orig: handler, wrapped: handler });
              try {
                return Reflect.apply(nativeSet, thisArg, args);
              } catch (e) {
                (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:onicecandidate_set:native_throw', { module: __MODULE, surface: __SURFACE, 
                  stage: 'runtime',
                  key: 'onicecandidate',
                  message: 'native setter onicecandidate threw',
                  type: 'browser structure missing data',
                  data: { outcome: 'throw', reason: 'native_throw' }
                }, e) : undefined);
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
              (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:onicecandidate_set:native_throw', { module: __MODULE, surface: __SURFACE, 
                stage: 'runtime',
                key: 'onicecandidate',
                message: 'native setter onicecandidate threw',
                type: 'browser structure missing data',
                data: { outcome: 'throw', reason: 'native_throw' }
              }, e) : undefined);
              throw e;
            }
          })
        : undefined;
      __rtcMarkNative(set, 'set onicecandidate', 'onicecandidate');

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
    const wrappedAddEventListener = wrapApply(origAddEventListener, 'addEventListener', function(nativeFn, thisArg, args) {
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
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:addEventListener:native_throw', { module: __MODULE, surface: __SURFACE, 
            stage: 'runtime',
            key: 'addEventListener',
            message: 'native addEventListener threw',
            type: 'browser structure missing data',
            data: { outcome: 'throw', reason: 'native_throw' }
          }, e) : undefined);
          throw e;
        }
      }
      try {
        return Reflect.apply(nativeFn, thisArg, args);
      } catch (e) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:addEventListener:native_throw', { module: __MODULE, surface: __SURFACE, 
          stage: 'runtime',
          key: 'addEventListener',
          message: 'native addEventListener threw',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'native_throw' }
        }, e) : undefined);
        throw e;
      }
    });
    __rtcMarkNative(wrappedAddEventListener, 'addEventListener', 'addEventListener');
    Orig.prototype.addEventListener = wrappedAddEventListener;
  }


  if (typeof origRemoveEventListener === 'function') {
    const wrappedRemoveEventListener = wrapApply(origRemoveEventListener, 'removeEventListener', function(nativeFn, thisArg, args) {
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
            (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:removeEventListener:native_throw', { module: __MODULE, surface: __SURFACE, 
              stage: 'runtime',
              key: 'removeEventListener',
              message: 'native removeEventListener threw',
              type: 'browser structure missing data',
              data: { outcome: 'throw', reason: 'native_throw' }
            }, e) : undefined);
            throw e;
          }
        }
      }
      try {
        return Reflect.apply(nativeFn, thisArg, args);
      } catch (e) {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:removeEventListener:native_throw', { module: __MODULE, surface: __SURFACE, 
          stage: 'runtime',
          key: 'removeEventListener',
          message: 'native removeEventListener threw',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'native_throw' }
        }, e) : undefined);
        throw e;
      }
    });
    __rtcMarkNative(wrappedRemoveEventListener, 'removeEventListener', 'removeEventListener');
    Orig.prototype.removeEventListener = wrappedRemoveEventListener;
  }
  (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', 'rtc:patched', { module: __MODULE, surface: __SURFACE, 
    stage: 'apply',
    key: 'RTCPeerConnection',
    message: 'RTC patch applied',
    type: 'ok',
    data: { outcome: 'return', reason: 'patched' }
  }, null) : undefined);
  } catch (e) {
    let rollbackErr = null;
    try {
      if (typeof origCreateOffer === 'function') Orig.prototype.createOffer = origCreateOffer;
    } catch (re) {
      if (!rollbackErr) rollbackErr = re;
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'rtc:rollback_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'rollback',
        key: 'createOffer',
        message: 'rollback restore failed for createOffer',
        type: 'browser structure missing data',
        data: { outcome: 'rollback', reason: 'restore_createOffer_failed' }
      }, re) : undefined);
    }
    try {
      if (typeof origCreateAnswer === 'function') Orig.prototype.createAnswer = origCreateAnswer;
    } catch (re) {
      if (!rollbackErr) rollbackErr = re;
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'rtc:rollback_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'rollback',
        key: 'createAnswer',
        message: 'rollback restore failed for createAnswer',
        type: 'browser structure missing data',
        data: { outcome: 'rollback', reason: 'restore_createAnswer_failed' }
      }, re) : undefined);
    }
    try {
      if (typeof origSetLocalDescription === 'function') Orig.prototype.setLocalDescription = origSetLocalDescription;
    } catch (re) {
      if (!rollbackErr) rollbackErr = re;
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'rtc:rollback_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'rollback',
        key: 'setLocalDescription',
        message: 'rollback restore failed for setLocalDescription',
        type: 'browser structure missing data',
        data: { outcome: 'rollback', reason: 'restore_setLocalDescription_failed' }
      }, re) : undefined);
    }
    try {
      if (typeof origAddIceCandidate === 'function') Orig.prototype.addIceCandidate = origAddIceCandidate;
    } catch (re) {
      if (!rollbackErr) rollbackErr = re;
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'rtc:rollback_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'rollback',
        key: 'addIceCandidate',
        message: 'rollback restore failed for addIceCandidate',
        type: 'browser structure missing data',
        data: { outcome: 'rollback', reason: 'restore_addIceCandidate_failed' }
      }, re) : undefined);
    }
    try {
      if (typeof origSetConfiguration === 'function') Orig.prototype.setConfiguration = origSetConfiguration;
    } catch (re) {
      if (!rollbackErr) rollbackErr = re;
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'rtc:rollback_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'rollback',
        key: 'setConfiguration',
        message: 'rollback restore failed for setConfiguration',
        type: 'browser structure missing data',
        data: { outcome: 'rollback', reason: 'restore_setConfiguration_failed' }
      }, re) : undefined);
    }
    try {
      if (typeof origAddEventListener === 'function') Orig.prototype.addEventListener = origAddEventListener;
    } catch (re) {
      if (!rollbackErr) rollbackErr = re;
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'rtc:rollback_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'rollback',
        key: 'addEventListener',
        message: 'rollback restore failed for addEventListener',
        type: 'browser structure missing data',
        data: { outcome: 'rollback', reason: 'restore_addEventListener_failed' }
      }, re) : undefined);
    }
    try {
      if (typeof origRemoveEventListener === 'function') Orig.prototype.removeEventListener = origRemoveEventListener;
    } catch (re) {
      if (!rollbackErr) rollbackErr = re;
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'rtc:rollback_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'rollback',
        key: 'removeEventListener',
        message: 'rollback restore failed for removeEventListener',
        type: 'browser structure missing data',
        data: { outcome: 'rollback', reason: 'restore_removeEventListener_failed' }
      }, re) : undefined);
    }
    try {
      if (origOnIceDesc) Object.defineProperty(Orig.prototype, 'onicecandidate', origOnIceDesc);
      else delete Orig.prototype.onicecandidate;
    } catch (re) {
      if (!rollbackErr) rollbackErr = re;
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'rtc:rollback_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'rollback',
        key: 'onicecandidate',
        message: 'rollback restore failed for onicecandidate',
        type: 'browser structure missing data',
        data: { outcome: 'rollback', reason: 'restore_onicecandidate_failed' }
      }, re) : undefined);
    }
    if (!rollbackErr) {
      try {
        delete Orig.__PATCH_RTCPEERCONNECTION__;
      } catch (re) {
        rollbackErr = re;
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', 'rtc:rollback_failed', { module: __MODULE, surface: __SURFACE, 
          stage: 'rollback',
          key: '__PATCH_RTCPEERCONNECTION__',
          message: 'rollback restore failed for marker',
          type: 'browser structure missing data',
          data: { outcome: 'rollback', reason: 'restore_patch_marker_failed' }
        }, re) : undefined);
      }
    }
    const rollbackOk = !rollbackErr;
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'rtc:apply_failed', { module: __MODULE, surface: __SURFACE, 
      stage: 'apply',
      key: 'RTCPeerConnection',
      message: 'RTC patch apply failed (rolled back)',
      type: 'browser structure missing data',
      data: { outcome: rollbackOk ? 'rollback' : 'throw', reason: 'apply_failed', rollbackOk }
    }, e) : undefined);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__FLAG_KEY, __guardToken, rollbackOk, __MODULE);
      }
    } catch (releaseErr) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'rtc:guard_release_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'guard',
        key: __FLAG_KEY,
        message: 'releaseGuardFlag threw after apply failure',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_failed', rollbackOk: !!rollbackOk }
      }, releaseErr) : undefined);
    }
    return;
  }
}

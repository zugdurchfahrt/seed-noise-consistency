
    // ——— Globals Bootstrap ———
    window.__GLOBAL_SEED                = "85dc6f3078654739b8b2ba5152f70562";
    window.__EXPECTED_CLIENT_HINTS      = {"platform": "Windows", "brands": [{"brand": "Not)A;Brand", "version": "8"}, {"brand": "Chromium", "version": "137"}, {"brand": "Google Chrome", "version": "137"}], "mobile": false, "architecture": "x86", "bitness": "64", "model": "", "platformVersion": "15.0.0", "fullVersionList": [{"brand": "Not)A;Brand", "version": "8.0.0.0"}, {"brand": "Chromium", "version": "137.0.7151.119"}, {"brand": "Google Chrome", "version": "137.0.7151.119"}], "uaFullVersion": "137.0.7151.119", "sec_ch_ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"137\", \"Google Chrome\";v=\"137\"", "sec_ch_ua_full_version_list": "\"Not)A;Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"137.0.7151.119\", \"Google Chrome\";v=\"137.0.7151.119\"", "sec_ch_ua_model": "", "sec_ch_ua_form_factors": ["Desktop"], "deviceMemory": 4, "hardwareConcurrency": 4, "wow64": false, "languages": ["de-DE", "de"], "language": "de-DE", "formFactors": ["Desktop"], "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/apng,image/webp,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"};
    window.__NAV_PLATFORM__             = "Win32";
    window.__GENERATED_PLATFORM         = "Windows";
    window.__GENERATED_PLATFORM_VERSION = "15.0.0";
    window.__USER_AGENT                 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36";
    window.__VENDOR                     = "Google Inc.";
    window.__LATITUDE__                 = 50.1169;
    window.__LONGITUDE__                = 8.6837;
    window.__TIMEZONE__                 = "Europe/Berlin";
    window.__OFFSET_MINUTES__           = 60;
    window.__WIDTH                      = 2560;
    window.__HEIGHT                     = 1440;
    window.__COLOR_DEPTH                = 24;
    window.__DPR                        = 1.25;
    window.__primaryLanguage            = "de-DE";
    window.__normalizedLanguages        = ["de-DE", "de"];
    window.__cpu                        = 4;
    window.__memory                     = 4;
    window.__WEBGL_RENDERER__           = "WebKit WebGL";
    window.__WEBGL_VENDOR__             = "WebKit";
    window.__WEBGL_UNMASKED_VENDOR__    = "Google Inc. (NVIDIA)";
    window.__WEBGL_UNMASKED_RENDERER__  = "ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 (0x2184) Direct3D11 vs_5_0 ps_5_0, D3D11)";
    window.__GPU_TYPE__                 = "discrete";
    window.__GPU_ARCHITECTURE__         = "turing";
    window.__GPU_VENDOR__               = "nvidia";
    window.__DEVICES_LABELS             = {"audioinput": "Fifine K669B", "videoinput": "Razer Kiyo", "audiooutput": "Grado SR80x"};
    window.__FULL_VERSION_LIST          = [{"brand": "Not)A;Brand", "version": "8.0.0.0"}, {"brand": "Chromium", "version": "137.0.7151.119"}, {"brand": "Google Chrome", "version": "137.0.7151.119"}];
    window.__UA_FULL_VERSION            = "137.0.7151.119";
    window.__PLUGIN_PROFILES__          = [{"name": "Chrome PDF Viewer", "filename": "internal-pdf-viewer", "description": "", "mimeTypes": [{"type": "application/pdf", "suffixes": "pdf", "description": "PDF document"}]}];
    window.__PLUGIN_MIMETYPES__         = [{"type": "application/pdf", "suffixes": "pdf", "description": "PDF document"}];
    
;
function LOGGingModule() {
  if (!window.__PATCH_MYTYPER__) {
    window.__PATCH_MYTYPER__ = true;

    const global = window;
    const C = (global.CanvasPatchContext = global.CanvasPatchContext || {});
    const G =
      (typeof globalThis !== "undefined" && globalThis) ||
      (typeof self !== "undefined" && self) ||
      (typeof window !== "undefined" && window) ||
      {};

    // ===== 0) Central store: ONLY window._myDebugLog (no logError / no DB) =====
    global._myDebugLog = global._myDebugLog || [];
    G._myDebugLog = global._myDebugLog;

    // Debug flag (respect false)
    G.__DEBUG__ =
      typeof global.__DEBUG__ !== "undefined" ? global.__DEBUG__ : true;

    // Save original console methods
    const origConsole = {
      log: console.log && console.log.bind(console),
      warn: console.warn && console.warn.bind(console),
      error: console.error && console.error.bind(console),
      info: console.info && console.info.bind(console),
      debug: console.debug && console.debug.bind(console),
      trace: console.trace && console.trace.bind(console),
    };

    // Supported logging levels
    const LOG_LEVELS = ["error", "warn", "log", "info", "debug", "trace"];
    G._logLevel = global._logLevel || "log";

    function levelAllows(currentLevel, eventLevel) {
      const idx = LOG_LEVELS.indexOf(currentLevel);
      const safeIdx = idx >= 0 ? idx : LOG_LEVELS.indexOf("log");
      const allowed = LOG_LEVELS.slice(0, safeIdx + 1);
      return allowed.indexOf(eventLevel) !== -1;
    }

    // ===== 1) Make everything JSON-serializable =====
    function safeTag(v) {
      try {
        return Object.prototype.toString.call(v);
      } catch (_) {
        return "[object Unknown]";
      }
    }

    function isHostLikeTag(tag) {
      return /\[object (Window|Document|HTML.*|SVG.*|Media.*|WebGL.*|Canvas.*|Offscreen.*|ImageData|Plugin|PluginArray|MimeType|MimeTypeArray)\]/.test(
        tag
      );
    }

    function normalizeForJSON(value, seen) {
      try {
        if (value === null || typeof value === "undefined") return value;
        const t = typeof value;

        if (t === "string" || t === "number" || t === "boolean") return value;

        if (t === "function") {
          return "[Function " + (value.name || "anonymous") + "]";
        }

        if (value instanceof Error) {
          return {
            __type: "Error",
            name: value.name,
            message: value.message,
            stack: value.stack || null,
          };
        }

        const tag = safeTag(value);
        if (isHostLikeTag(tag)) return tag;

        if (t !== "object") return String(value);

        // Cycles
        if (!seen) seen = new WeakSet();
        if (seen.has(value)) return "[Circular]";
        seen.add(value);

        // Arrays
        if (Array.isArray(value)) {
          const outArr = new Array(value.length);
          for (let i = 0; i < value.length; i++) {
            outArr[i] = normalizeForJSON(value[i], seen);
          }
          return outArr;
        }

        // Plain objects only: keep enumerable keys
        const out = {};
        for (const k in value) {
          try {
            out[k] = normalizeForJSON(value[k], seen);
          } catch (_) {
            out[k] = "[Unserializable]";
          }
        }
        return out;
      } catch (_) {
        return safeTag(value);
      }
    }

    function safeStringify(value) {
      try {
        return JSON.stringify(normalizeForJSON(value), null, 2);
      } catch (_) {
        try {
          return String(value);
        } catch (__e) {
          return safeTag(value);
        }
      }
    }

    function pushEntry(entry) {
      try {
        global._myDebugLog.push(entry);
      } catch (_) {}
    }

    // ===== 2) Core logger: pushLog (console + errors) =====
    function pushLog(level, args, withStack, module) {
      try {
        if (!levelAllows(G._logLevel, level)) return;

        const normArgs = normalizeForJSON(args);
        const msgParts = [];
        if (args && args.length) {
          for (let i = 0; i < args.length; i++) {
            // keep message readable but safe
            try {
              const a = args[i];
              if (typeof a === "string") msgParts.push(a);
              else msgParts.push(safeTag(a));
            } catch (_) {
              msgParts.push("[Unserializable]");
            }
          }
        }

        const e = {
          type: "console",
          level: level,
          module: module || "global",
          message: msgParts.join(" "),
          expanded: normArgs, // always JSON-safe
          timestamp: new Date().toISOString(),
        };

        if (withStack) {
          try {
            const st = new Error().stack;
            e.stack = st ? String(st) : null;
          } catch (_) {
            e.stack = null;
          }
        }

        pushEntry(e);
      } catch (_) {}
    }

    // ===== 3) Patch console.* (single source of truth) =====
    for (const level of LOG_LEVELS) {
      const orig = origConsole[level];
      if (!orig) continue;

      console[level] = function () {
        try {
          const args = Array.prototype.slice.call(arguments);

          // keep your existing filter
          for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (typeof a === "string" && a.indexOf("undetected chromedriver") !== -1) {
              return;
            }
          }

          pushLog(
            level,
            args,
            level === "error" || level === "warn" || level === "log",
            "console"
          );

          if (G.__DEBUG__) {
            orig.apply(console, args);
          }
        } catch (e) {
          try {
            window._myDebugLog = window._myDebugLog || [];
            window._myDebugLog.push({
              type: "logger_internal",
              where: "console_patch",
              message: (e && e.message) ? String(e.message) : String(e),
              stack: (e && e.stack) ? String(e.stack) : null,
              timestamp: new Date().toISOString()
            });
          } catch (_) {}
        }
      };
    }

    // ===== 4) Module logger window.log (no double logging) =====
    global._logConfig = global._logConfig || {
      global: { enabled: true, level: "log" },
      WEBGLlogger: { enabled: true, level: "log" },
      CanvasLogger: { enabled: true, level: "debug" },
      Contextlogger: { enabled: true, level: "debug" },
      Navigatorlogger: { enabled: true, level: "debug" },
      WRKlogger: { enabled: true, level: "debug" },
    };

    global.log = function (module, level) {
      try {
        const args = Array.prototype.slice.call(arguments, 2);
        const config = global._logConfig[module] || global._logConfig.global;
        if (!config || !config.enabled) return;
        if (!levelAllows(config.level, level)) return;

        // Output to DevTools without recursion through patched console
        const prefix = "%c[" + module + "]%c";
        const style1 =
          "color:#fff;background:#0070f3;border-radius:2px;padding:2px 4px;";
        const style2 = "color:inherit;";
        const callArgs = [prefix, style1, style2].concat(args);

        const orig = origConsole[level] || origConsole.log;
        if (orig) orig.apply(console, callArgs);

        // Store entry
        pushLog(level, args, level === "error" || level === "warn" || level === "log", module);
      } catch (_) {}
    };

    // ===== 5) Uncaught errors + unhandled rejections (consistent, no logError) =====

    // 5.1 window.onerror (script errors)
    global.onerror = function (message, source, lineno, colno, error) {
      try {
        pushEntry({
          type: "onerror",
          message: typeof message === "string" ? message : safeStringify(message),
          source: source || null,
          lineno: typeof lineno === "number" ? lineno : null,
          colno: typeof colno === "number" ? colno : null,
          stack: error && error.stack ? String(error.stack) : null,
          timestamp: new Date().toISOString(),
        });
      } catch (_) {}
      return false; // do not swallow (DevTools still shows it)
    };

    // 5.2 resource errors (capture=true catches <script src> load fails etc.)
    global.addEventListener(
      "error",
      function (e) {
        try {
          // If it has e.error, window.onerror already recorded it; avoid duplicates
          if (e && e.error) return;

          const target = e && e.target ? e.target : null;
          const url =
            target && (target.src || target.href) ? (target.src || target.href) : null;

          pushEntry({
            type: "resource_error",
            message: e && e.message ? String(e.message) : "Resource error",
            source: url,
            timestamp: new Date().toISOString(),
          });
        } catch (_) {}
      },
      true
    );

    // 5.3 unhandled promise rejections
    global.addEventListener("unhandledrejection", function (event) {
      try {
        const reason = event ? event.reason : null;
        pushEntry({
          type: "unhandledrejection",
          message:
            reason && reason.message ? String(reason.message) : String(reason),
          stack: reason && reason.stack ? String(reason.stack) : null,
          timestamp: new Date().toISOString(),
        });
      } catch (_) {}
    });

    // 5.4 worker-context only (avoid breaking window.postMessage signature)
    // If this code is ever injected into a Worker, we still record worker errors locally.
    try {
      const isWorker =
        typeof global.document === "undefined" &&
        typeof global.window === "undefined" &&
        typeof global.importScripts === "function";

      if (isWorker && typeof global.addEventListener === "function") {
        global.addEventListener("error", function (e) {
          try {
            pushEntry({
              type: "worker_error",
              message: e && e.message ? String(e.message) : "Worker error",
              filename: e && e.filename ? String(e.filename) : null,
              lineno: typeof (e && e.lineno) === "number" ? e.lineno : null,
              colno: typeof (e && e.colno) === "number" ? e.colno : null,
              timestamp: new Date().toISOString(),
            });
          } catch (_) {}
        });

        global.addEventListener("unhandledrejection", function (event) {
          try {
            const reason = event ? event.reason : null;
            pushEntry({
              type: "worker_unhandledrejection",
              message:
                reason && reason.message ? String(reason.message) : String(reason),
              stack: reason && reason.stack ? String(reason.stack) : null,
              timestamp: new Date().toISOString(),
            });
          } catch (_) {}
        });
      }
    } catch (_) {}

    // ===== 6) Export helper (in-session) =====
    global.exportMyDebugLog = function () {
      try {
        const data = JSON.stringify(global._myDebugLog, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "my_debug_log.json";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
          try {
            document.body.removeChild(a);
          } catch (_) {}
          try {
            URL.revokeObjectURL(url);
          } catch (_) {}
        }, 5500);
      } catch (_) {}
    };
  }
}

;
function RtcpeerconnectionPatchModule() {
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

;
function HideWebdriverPatchModule() {

  function safeDefine(obj, prop, descriptor) {
    try {
      if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return;
      if (Object.prototype.hasOwnProperty.call(obj, prop)) delete obj[prop];
      Object.defineProperty(obj, prop, descriptor);
    } catch (e) {
      console.warn(`[stealth] safeDefine failed for ${prop}:`, e);
    }
  }

  // ——— Global mask "native" + general WeakMap ———
  const nativeToString = window.__NativeToString || Function.prototype.toString;
  window.__NativeToString = nativeToString;
  const nativeGetOwnProp = Object.getOwnPropertyDescriptor;

  // general WeakMap, available to all modules
  const toStringOverrideMap = (window.__NativeToStringMap instanceof WeakMap)
    ? window.__NativeToStringMap
    : new WeakMap();
  window.__NativeToStringMap = toStringOverrideMap;

  // Unified global function-mask
  function baseMarkAsNative(func, name = "") {
    if (typeof func !== 'function') return func;
    try {
      const n = name || func.name || "";
      const label = n ? `function ${n}() { [native code] }` : 'function () { [native code] }';
      toStringOverrideMap.set(func, label);
    } catch (_) {}
    return func;
  }
  function ensureMarkAsNative() {
    const existing = (typeof window.markAsNative === 'function') ? window.markAsNative : null;
    if (!existing) {
      baseMarkAsNative.__TOSTRING_BRIDGE__ = true;
      window.markAsNative = baseMarkAsNative;
      return baseMarkAsNative;
    }
    if (existing.__TOSTRING_BRIDGE__) return existing;
    const wrapped = function markAsNative(func, name = "") {
      const out = existing(func, name);
      return baseMarkAsNative(out, name);
    };
    wrapped.__TOSTRING_BRIDGE__ = true;
    window.markAsNative = wrapped;
    return wrapped;
  }
  if (!window.__ensureMarkAsNative) window.__ensureMarkAsNative = ensureMarkAsNative;
  const markAsNative = ensureMarkAsNative();

  // compatibility with the old name (do not change the structure of the calls below)
  function fakeNative(func, name = "") { return markAsNative(func, name); }

  // Single Proxy for Function.prototype.toString, reading from the general WeakMap
  if (!window.__TOSTRING_PROXY_INSTALLED__) {
    const toStringDesc = nativeGetOwnProp(Function.prototype, 'toString');
    const toStringProxy = new Proxy(nativeToString, {
      apply(target, thisArg, args) {
        // IMPORTANT: do not touch WeakMap for primitives/null/undefined
        if (thisArg !== null) {
          const t = typeof thisArg;
          if (t === 'function' || t === 'object') {
            // Single WeakMap lookup (faster than has()+get())
            const v = toStringOverrideMap.get(thisArg);
            if (v !== undefined) return v;
          }
        }
        // preserve native TypeError + semantics
        const argsList = args || [];
        // fast-path only when receiver is a Function (brand check requirement)
        if (typeof thisArg === 'function' && argsList.length === 0) return target.call(thisArg);
        return Reflect.apply(target, thisArg, argsList);
      }
    });


    // make proxy look native via the same mechanism
    markAsNative(toStringProxy, 'toString');

    Object.defineProperty(Function.prototype, 'toString', {
      value: toStringProxy,
      writable: toStringDesc ? !!toStringDesc.writable : true,
      configurable: toStringDesc ? !!toStringDesc.configurable : true,
      enumerable: toStringDesc ? !!toStringDesc.enumerable : false
    });
    window.__TOSTRING_PROXY_INSTALLED__ = true;
  }


  // window.external protection
  try {
    Object.defineProperty(window, 'external', {
      get: fakeNative(() => {
        const fakeExternal = {};
        Object.defineProperty(fakeExternal, 'toString', {
          value: fakeNative(() => '[object External]', 'toString'),
          configurable: true,
          enumerable: false
        });
        return fakeExternal;
      }, "get external"),
      configurable: true,
      enumerable: false
    });
  } catch (e) {
    console.warn("[stealth] external patch failed:", e);
  }

  //  chrome.runtime protection -may not work in chrome
  try {
    const desc = Object.getOwnPropertyDescriptor(window, "chrome");

    if (!desc) {
      Object.defineProperty(window, 'chrome', {
        get: fakeNative(() => ({}), 'get chrome'),
        configurable: true
      });
    } else if (desc.configurable) {
      const chromeProxy = new Proxy(window.chrome, {
        get(target, prop) {
          if (prop === 'runtime' || prop === 'loadTimes') return undefined;
          return Reflect.get(target, prop);
        },
        has(target, prop) {
          if (prop === 'runtime' || prop === 'loadTimes') return false;
          return prop in target;
        },
        getOwnPropertyDescriptor(target, prop) {
          if (prop === 'runtime' || prop === 'loadTimes') return undefined;
          return Object.getOwnPropertyDescriptor(target, prop);
        }
      });

      Object.defineProperty(window, 'chrome', {
        get: fakeNative(() => chromeProxy, 'get chrome'),
        configurable: true
      });
    } else {
  //    console.info("[stealth] window.chrome защищён (configurable: false), патч невозможен");
    }
  } catch (e) {
    console.warn("[stealth] chrome.runtime patch failed:", e);
  }

  const proto = Navigator.prototype;

  // navigator.webdriver → undefined
  safeDefine(proto, 'webdriver', {
    get: fakeNative(() => undefined, "get webdriver"),
    configurable: true,
    enumerable: false
  });

  // Object.getOwnPropertyDescriptor
  Object.getOwnPropertyDescriptor = (function(nativeGOPD){
    function getOwnPropertyDescriptor(obj, prop) {
      if ((obj === navigator || obj === Navigator.prototype) && prop === 'webdriver') return undefined;
      return nativeGOPD(obj, prop);
    }
    markAsNative(getOwnPropertyDescriptor, 'getOwnPropertyDescriptor');
    return getOwnPropertyDescriptor;
  })(nativeGetOwnProp);

  // Reflect.has
  Reflect.has = (function(nativeHas){
    function has(target, prop) {
      if (target === navigator && prop === 'webdriver') return false;
      return nativeHas(target, prop);
    }
    markAsNative(has, 'has');
    return has;
  })(Reflect.has);

  // Object.hasOwn
  const realHasOwn = Object.hasOwn;
  Object.hasOwn = (function(nativeHasOwn){
    function hasOwn(obj, prop) {
      if (obj === navigator && prop === 'webdriver') return false;
      return nativeHasOwn(obj, prop);
    }
    markAsNative(hasOwn, 'hasOwn');
    return hasOwn;
  })(realHasOwn);
}

;
(function () {
  'use strict';
  function EnvParamsPatchModule() {
    'use strict';
    // Global-Alias ​​(reliable in the window and workrs)
    const G = (typeof globalThis !== 'undefined' && globalThis)
          || (typeof self       !== 'undefined' && self)
          || (typeof window     !== 'undefined' && window)
          || (typeof global     !== 'undefined' && global)
          || {};

    // Idempotent‑guard For the whole module
    if (G.__PATCH_ENVPARAMS__) return; // why: Protection against re -initialization
    G.__PATCH_ENVPARAMS__ = true;
    G._myDebugLog = G._myDebugLog || [];

    // Fallbacks (do not interfere, if already defined)
    if (typeof G.mulberry32 !== 'function') {
      G.mulberry32 = function (seed) {
        return function () {
          let t = (seed += 0x6d2b79f5);
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      };
    }
    if (typeof G.strToSeed !== 'function') {
      G.strToSeed = function (str) {
        let h = 5381; str = String(str);
        for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
        return h >>> 0;
      };
    }

    // Utilities
    function toBool(v) {
      if (typeof v === 'boolean') return v;
      if (typeof v === 'number') return v !== 0;
      if (typeof v === 'string') return /^(1|true|yes|on)$/i.test(v.trim());
      return false;
    }
    function maskSeed(s, keep) {
      s = String(s); const n = s.length; const k = Math.max(2, Math.min(keep || 4, Math.floor(n / 4)));
      return (n <= 2 * k) ? '"' + s + '" (len ' + n + ')' : '"' + s.slice(0, k) + '…' + s.slice(-k) + '" (len ' + n + ')';
    }

    //Lazy initialization of rand (does not tear the bandl if seed arrives later)
    let timer = null, attemptsLeft = 150; // ~3 сек при 20ms

    function installRand() {
      if (G.rand && G.rand.__marker === 'envrand' && typeof G.rand.use === 'function') return true;
      if (typeof G.__GLOBAL_SEED !== 'string' || !G.__GLOBAL_SEED) return false; // why: waiting for the seed

      const LOG_SEED = toBool(G.__LOG_SEED);
      const LOG_POOLS = toBool(G.__LOG_POOLS);
      if (LOG_SEED) { try { console.log('[PRNG] __GLOBAL_SEED detected:', maskSeed(G.__GLOBAL_SEED)); } catch (_) {} }

      const ROOT = '__RAND_SEED_POOL__';
      const pools = Object.create(null);

      function getRng(label) {
        const key = String(label == null ? 'default' : label);
        let rng = pools[key];
        if (!rng) {
          const material = ROOT + '|' + key + '|' + String(G.__GLOBAL_SEED);
          const numericSeed = G.strToSeed(material);
          if (LOG_POOLS) { try { console.log('[PRNG] pool created:', key); } catch (_) {} }
          rng = pools[key] = G.mulberry32(numericSeed);
        }
        return rng;
      }

      const rand = {
        use(label) { return getRng(label); },
        next(label) { return getRng(label)(); },
        reset(label) {
          if (typeof label === 'undefined') {
            for (const k in pools) if (Object.prototype.hasOwnProperty.call(pools, k)) delete pools[k];
            return true;
          }
          const key = String(label);
          if (Object.prototype.hasOwnProperty.call(pools, key)) { delete pools[key]; return true; }
          return false;
        },
        __marker: 'envrand',
        __version: '1.1.1'
      };

      Object.freeze(rand);

      try {
        Object.defineProperty(G, 'rand', { value: rand, writable: false, configurable: false, enumerable: true });
      } catch (_) {
        G.rand = rand;
      }
      return true;
    }

    (function boot() {
      try {
        if (installRand()) return; // Everything is ready
        timer = setInterval(function () {
          try {
            if (installRand() || --attemptsLeft <= 0) { clearInterval(timer); timer = null; }
          } catch (e) {
            clearInterval(timer); timer = null; try { console.error('[PRNG] init failed:', e && e.message); } catch (_) {}
          }
        }, 20);
      } catch (e) {
        try { console.error('[PRNG] boot failed:', e && e.message); } catch (_) { }
      }
    })();

    // Main‑thread only (Not executed in workerscope)
    if (typeof window !== 'undefined' && G === window) {
      const WSProto = window.WebSocket && window.WebSocket.prototype;
      if (WSProto) {
        const origClose = WSProto.close;
        window._myDebugLog = window._myDebugLog || [];
        WSProto.close = function (code, reason) {
          // why:Diagnostic closing trace ws
          window._myDebugLog.push({ type: 'websocket-close', code, reason, timestamp: new Date().toISOString() });
          return typeof origClose === 'function' ? origClose.call(this, code, reason) : undefined;
        };
      }
    }

    try { console.log('[ENV] EnvParamsPatchModule ready'); } catch (_) {}
  }

  // Function export*
  const G = (typeof globalThis !== 'undefined' && globalThis)
        || (typeof self       !== 'undefined' && self)
        || (typeof window     !== 'undefined' && window)
        || (typeof global     !== 'undefined' && global)
        || {};

  if (typeof G.EnvParamsPatchModule !== 'function') {
    try {
      Object.defineProperty(G, 'EnvParamsPatchModule', {
        value: EnvParamsPatchModule,
        writable: false,
        configurable: false,
        enumerable: true
      });
    } catch {
      G.EnvParamsPatchModule = EnvParamsPatchModule;
    }
  }
})();

// *A global property is made unchangable to prevent other code from accidentally/intentionally overwriting the function.
// This isn't "patching your function," but rather protecting it from changes after it's declared.
// Adding a function to the global object once makes it protected, allowing any other code or module to access it without risk of being accidentally overwritten.
// This is the standard approach for modules that can run in different environments (window/worker/).
;
function NavTotalSetPatchModule() {
  if (!window.__PATCH_NAVTOTALSET__) {
    window.__PATCH_NAVTOTALSET__ = true;

    const C = window.CanvasPatchContext;
      if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — module registration is not available');
    const G = (typeof globalThis !== 'undefined' && globalThis)
      || (typeof self !== 'undefined' && self)
      || (typeof window !== 'undefined' && window)
      || {};

    // basic random from the existing seed initialization
    const R = window.rand.use('nav');
    if (typeof R !== 'function') {
      throw new Error('[NavTotalSetPatchModule] "R" is not initialized');
    }
    const mark = (() => {
      const ensure = (typeof window.__ensureMarkAsNative === 'function') ? window.__ensureMarkAsNative : null;
      const fn = ensure ? ensure() : window.markAsNative;
      if (typeof fn !== 'function') {
        throw new Error('[NavTotalSetPatchModule] markAsNative missing');
      }
      return fn;
    })();
    // ---- Hard consistency for platform ----
    // ——— A. Input/meta ———
    const meta          = window.__EXPECTED_CLIENT_HINTS || {};
    const navPlat       = window.__NAV_PLATFORM__;     // 'Win32' | 'MacIntel'
    const gen           = window.__GENERATED_PLATFORM; // "Windows" | "macOS"
    const userAgent     = window.__USER_AGENT;
    const vendor        = window.__VENDOR;
    const mem           = Number(window.__memory);
    const cpu           = Number(window.__cpu);
    const dpr           = Number(window.__DPR);
    const width         = Number(window.__WIDTH  ?? (window.screen && window.screen.width));
    const height        = Number(window.__HEIGHT ?? (window.screen && window.screen.height));
    const devicesLabels = window.__DEVICES_LABELS;
    const colorDepth    = Number(window.__COLOR_DEPTH);
    const orientationDom = window.__ORIENTATION ?? ((height >= width) ? 'portrait-primary' : 'landscape-primary')

    // strictness & diagnostics
    const STRICT        = (window.__NAV_PATCH_STRICT__ !== undefined) ? !!window.__NAV_PATCH_STRICT__ : true;
    const DEBUG         = !!window.__NAV_PATCH_DEBUG__;

    // mapping helpers (OS <-> DOM)
    const asDom = (os) => os === 'Windows' ? 'Win32' : (os === 'macOS' ? 'MacIntel' : os);
    const asOS  = (dom) => dom === 'Win32' ? 'Windows' : (dom === 'MacIntel' ? 'macOS' : dom);
    const looksDom = (v) => v === 'Win32' || v === 'MacIntel';

    // guards (inputs must be present)
    if (!gen)            throw new Error('[nav_total_set] GENERATED_PLATFORM missing');
    if (!navPlat)        throw new Error('[nav_total_set] NAV_PLATFORM__ missing');

    // normalize/validate CH.platform (must be OS-string)
    let chPlatform = meta.platform || gen;
    if (looksDom(chPlatform)) {
      const normalized = asOS(chPlatform);
      if (STRICT) {
        throw new Error(`[nav_total_set] CH.platform '${chPlatform}' is DOM-like; expected OS-string (e.g. 'Windows'/'macOS')`);
      } else {
        console.warn(`[nav_total_set] normalizing CH.platform '${chPlatform}' → '${normalized}'`);
        chPlatform = normalized;
      }
    }

    const expectedNavPlat = asDom(gen);
    if (navPlat !== expectedNavPlat) {
      const msg = `[nav_total_set] NAV_PLATFORM__ (${navPlat}) inconsistent with ${gen} (expected ${expectedNavPlat})`;
      if (STRICT) throw new Error(msg); else console.warn(msg);
    }
    const navPlatformOut = STRICT ? navPlat : expectedNavPlat;
    if (!window.__COLOR_DEPTH) console.warn("[uaData] Color_Depth is not defined, set by default", colorDepth);

    // ——— B. Safe helpers ———
    const navProto = Object.getPrototypeOf(navigator);
    function safeDefineAcc(target, key, getter, { enumerable = false } = {}) {
      if (!target || (typeof target !== 'object' && typeof target !== 'function')) {
        throw new TypeError(`[nav_total_set] ${key}: invalid target`);
      }
      const d = Object.getOwnPropertyDescriptor(target, key);
      if (d && d.configurable === false) {
        throw new TypeError(`[nav_total_set] ${key}: non-configurable`);
      }
      const isData = d && Object.prototype.hasOwnProperty.call(d, 'value') && !d.get && !d.set;
      if (isData) {
        const value = (typeof getter === 'function') ? getter.call(target) : getter;
        Object.defineProperty(target, key, {
          value,
          writable: d ? !!d.writable : true,
          configurable: true,
          enumerable: d ? !!d.enumerable : !!enumerable
        });
        return true;
      }
      let getFn = getter;
      if (typeof getter === 'function' && getter.name === '') {
        const acc = ({ get [key]() { return getter.call(this); } });
        getFn = Object.getOwnPropertyDescriptor(acc, key).get;
      }
      Object.defineProperty(target, key, {
        get: mark(getFn, `get ${key}`),
        set: d && d.set,
        configurable: true,
        enumerable: d ? !!d.enumerable : !!enumerable
      });
      return true;
    }

    function defineAccWithFallback(objOrProto, key, getter, { enumerable = false } = {}) {
      // use for non-critical fields; для E/F/G Do not use(см. ниже)
      if (safeDefineAcc(objOrProto, key, getter, { enumerable })) return true;
      throw new TypeError(`[nav_total_set] failed to define ${key}`);
    }
    function redefineAcc(proto, key, getImpl) {
      const d = Object.getOwnPropertyDescriptor(proto, key);
      if (d && d.configurable === false) {
        throw new TypeError(`[nav_total_set] ${key}: non-configurable`);
      }
      const isData = d && Object.prototype.hasOwnProperty.call(d, 'value') && !d.get && !d.set;
      if (isData) {
        const value = (typeof getImpl === 'function') ? getImpl.call(proto) : getImpl;
        Object.defineProperty(proto, key, {
          value,
          writable: d ? d.writable : true,
          configurable: d ? d.configurable : true,
          enumerable: d ? d.enumerable : false
        });
        return;
      }
      Object.defineProperty(proto, key, {
        get: mark(getImpl, `get ${key}`),
        set: d && d.set,
        configurable: d ? d.configurable : true,
        enumerable: d ? d.enumerable : false
      });
    }

    // Critical - only a prototype (without a phallback)
    const critical = new Set(['userAgent','platform','vendor','appVersion']);
    (function patchCriticalOnProto(){
      const patch = (key, getter) => {
        const d = Object.getOwnPropertyDescriptor(navProto, key);
        if (!d) throw new TypeError(`[nav_total_set] ${key}: descriptor missing`);
      // Important: like native - not enumerable
      const ok = (redefineAcc(navProto, key, getter, { enumerable: false }), true);
      if (ok === false) throw new TypeError(`[nav_total_set] failed to define ${key}`);
      };
      patch('userAgent', () => userAgent);
      patch('platform',  () => navPlatformOut);
      patch('vendor',    () => vendor);
      patch('appVersion', () => (userAgent.split("Mozilla/")[1]));
    })();

    // rest
    const navigatorPatches = [
      ['productSub',           () => "20030107"],
      ['maxTouchPoints',       () => 0],
      ['buildID',              () => "20230501"],
      ['globalPrivacyControl', () => false],
      ['vendorSub',            () => ""]
    ];
    navigatorPatches.forEach(([prop, getter]) => {
      if (critical.has(prop)) return; // just in case
      defineAccWithFallback(navProto, prop, getter);
    });

    // ——— D. devicePixelRatio & screen.* ———
    // dpr: first we try to redefine own in window (often own), then — prototype
    (function () {
      const desc = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');
      if (desc && desc.configurable !== false) {
        Object.defineProperty(window, 'devicePixelRatio', { get: mark(() => dpr, 'get devicePixelRatio'), configurable: true });
        return;
      }
      redefineAcc(Window.prototype, 'devicePixelRatio', () => dpr);
    })();

    // screen.* — First try prototype, in case of refuse — own window.screen
    (function () {
      const scrProto = Screen && Screen.prototype;
      const setScreen = (k, get) => {
        redefineAcc(scrProto, k, get);
      };
      setScreen('width',       () => width);
      setScreen('height',      () => height);
      setScreen('colorDepth',  () => colorDepth);
      setScreen('pixelDepth',  () => colorDepth);
      setScreen('availWidth',  () => width);
      setScreen('availHeight', () => height);
      const orientationObj = window.screen && window.screen.orientation;
      const orientationProto = orientationObj && Object.getPrototypeOf(orientationObj);
      if (orientationProto && orientationProto !== Object.prototype) {
        const typeDesc = Object.getOwnPropertyDescriptor(orientationProto, 'type');
        if (typeDesc && typeDesc.configurable) {
          Object.defineProperty(orientationProto, 'type', {
            get: mark(() => orientationDom, 'get type'),
            set: typeDesc.set,
            configurable: typeDesc.configurable,
            enumerable: typeDesc.enumerable
          });
        }
        const angleDesc = Object.getOwnPropertyDescriptor(orientationProto, 'angle');
        if (angleDesc && angleDesc.configurable) {
          Object.defineProperty(orientationProto, 'angle', {
            get: mark(() => 0, 'get angle'),
            set: angleDesc.set,
            configurable: angleDesc.configurable,
            enumerable: angleDesc.enumerable
          });
        }
      }
    })();

    // oscpu (только если есть в прототипе)
    if ('oscpu' in navProto) {
      defineAccWithFallback(navProto, 'oscpu', () => undefined);
    }
    // ——— E. userAgentData (low + high entropy) ———
    if ('userAgentData' in navigator) {
      const nativeUAD = navigator.userAgentData;
      if (!nativeUAD) throw new Error('THW: window navigator.userAgentData missing');
      const uadProto = Object.getPrototypeOf(nativeUAD);
      if (!uadProto) throw new Error('THW: window navigator.userAgentData proto missing');
      const dBrands = Object.getOwnPropertyDescriptor(uadProto, 'brands');
      const dMobile = Object.getOwnPropertyDescriptor(uadProto, 'mobile');
      const dPlatform = Object.getOwnPropertyDescriptor(uadProto, 'platform');
      if (!dBrands || !dMobile || !dPlatform) {
        throw new Error('THW: window navigator.userAgentData descriptor missing');
      }
      Object.defineProperties(uadProto, {
        brands: {
          get: mark(function getBrands(){
            if (!Array.isArray(meta.brands) || !meta.brands.length) throw new Error('THW: uaData.brands missing');
            return meta.brands;
          }, 'get brands'),
          enumerable: true,
          configurable: true
        },
        mobile: {
          get: mark(function getMobile(){
            if (typeof meta.mobile !== 'boolean') throw new Error('THW: uaData.mobile missing');
            return meta.mobile;
          }, 'get mobile'),
          enumerable: true,
          configurable: true
        },
        platform: {
          get: mark(function getPlatform(){
            if (typeof chPlatform !== 'string' || !chPlatform) throw new Error('THW: uaData.platform missing');
            return chPlatform;
          }, 'get platform'),
          enumerable: true,
          configurable: true
        }
      });
      const deep = v => v == null ? v : JSON.parse(JSON.stringify(v));
      const getFullVersionList = mark(function getFullVersionList(){
        if (!Array.isArray(meta.fullVersionList) || !meta.fullVersionList.length) {
          throw new Error('THW: uaData.fullVersionList missing');
        }
        return deep(meta.fullVersionList);
      }, 'get fullVersionList');
      const dFull = Object.getOwnPropertyDescriptor(uadProto, 'fullVersionList')
        || Object.getOwnPropertyDescriptor(nativeUAD, 'fullVersionList')
        || { configurable: true, enumerable: false };
      Object.defineProperty(uadProto, 'fullVersionList', {
        get: getFullVersionList,
        enumerable: dFull.enumerable,
        configurable: dFull.configurable
      });
      const getUaFullVersion = mark(function getUaFullVersion(){
        if (typeof meta.uaFullVersion !== 'string' || !meta.uaFullVersion) {
          throw new Error('THW: uaData.uaFullVersion missing');
        }
        return meta.uaFullVersion;
      }, 'get uaFullVersion');
      const dUaFull = Object.getOwnPropertyDescriptor(uadProto, 'uaFullVersion')
        || Object.getOwnPropertyDescriptor(nativeUAD, 'uaFullVersion')
        || { configurable: true, enumerable: false };
      Object.defineProperty(uadProto, 'uaFullVersion', {
        get: getUaFullVersion,
        enumerable: dUaFull.enumerable,
        configurable: dUaFull.configurable
      });
      function dropOwnIfConfigurable(obj, key) {
        const ownDesc = Object.getOwnPropertyDescriptor(obj, key);
        if (ownDesc && ownDesc.configurable) {
          try { delete obj[key]; } catch {}
        }
      }
      function defineUadProtoMethod(proto, key, fn, desc) {
        const d = desc || Object.getOwnPropertyDescriptor(proto, key);
        Object.defineProperty(proto, key, {
          value: fn,
          configurable: d ? d.configurable : true,
          enumerable: d ? d.enumerable : false,
          writable: d && Object.prototype.hasOwnProperty.call(d, 'writable') ? d.writable : true
        });
      }

      const getHighEntropyValues = mark(function getHighEntropyValues(keys) {
          if (!Array.isArray(keys)) throw new Error('THW: bad keys');
          const map = {
            architecture: meta.architecture,
            bitness: meta.bitness,
            model: meta.model,
            brands: meta.brands,
            mobile: meta.mobile,
            platform: chPlatform,
            platformVersion: meta.platformVersion,
            uaFullVersion: meta.uaFullVersion,
            fullVersionList: meta.fullVersionList,
            deviceMemory: mem,
            hardwareConcurrency: cpu,
            wow64: meta.wow64,
            formFactors: meta.formFactors
          };
          const result = {};
          for (const hint of keys) {
            if (typeof hint !== 'string' || !hint) throw new Error('THW: bad keys');
            if (!(hint in map)) throw new Error(`THW: missing highEntropy.${hint}`);
            const val = map[hint];
            if (val === undefined || val === null) throw new Error(`THW: missing highEntropy.${hint}`);
            if (typeof val === 'string' && !val && hint !== 'model') throw new Error(`THW: missing highEntropy.${hint}`);
            if (Array.isArray(val) && !val.length) throw new Error(`THW: missing highEntropy.${hint}`);
            result[hint] = val;
          }
          return Promise.resolve(result);
        }, 'getHighEntropyValues');
      const ghevDesc = Object.getOwnPropertyDescriptor(uadProto, 'getHighEntropyValues');
      if (!ghevDesc) {
        throw new Error('THW: uaData.getHighEntropyValues descriptor missing');
      }
      dropOwnIfConfigurable(nativeUAD, 'getHighEntropyValues');
      defineUadProtoMethod(uadProto, 'getHighEntropyValues', getHighEntropyValues, ghevDesc);


      const toJSON = mark(function toJSON() {return { platform: this.platform, brands: this.brands, mobile: this.mobile };}, 'toJSON');
      const toJsonDesc = Object.getOwnPropertyDescriptor(uadProto, 'toJSON');
      if (!toJsonDesc) {
        throw new Error('THW: uaData.toJSON descriptor missing');
      }
      dropOwnIfConfigurable(nativeUAD, 'toJSON');
      defineUadProtoMethod(uadProto, 'toJSON', toJSON, toJsonDesc);

    // IMPORTANT: getter — on PROTOTYPE, without own-fallback
    const dUaData = Object.getOwnPropertyDescriptor(navProto, 'userAgentData');
    if (!dUaData) throw new TypeError('[nav_total_set] userAgentData descriptor missing');
    const okUaData = (redefineAcc(navProto, 'userAgentData', function get_userAgentData(){ return nativeUAD; }, { enumerable: false }), true);
    if (okUaData === false) throw new TypeError('[nav_total_set] failed to define userAgentData');
    const uadTag = Object.prototype.toString.call(nativeUAD);
    if (uadTag === '[object Object]') throw new Error('THW: window navigator.userAgentData tag');
    const uadCtor = Object.getPrototypeOf(nativeUAD) && Object.getPrototypeOf(nativeUAD).constructor;
    if (!uadCtor || uadCtor.name === 'Object') throw new Error('THW: window navigator.userAgentData proto');
    console.info('userAgentData.toJSON correctly implemented');
    }

    // ——— F. deviceMemory/hardwareConcurrency ———
    const okDeviceMemory = (Object.getOwnPropertyDescriptor(navProto,'deviceMemory') ?
      (redefineAcc(navProto, 'deviceMemory', () => mem, { enumerable: true }), true) :
      safeDefineAcc(navProto, 'deviceMemory', () => mem, { enumerable: true }));
    if (okDeviceMemory === false) throw new TypeError('[nav_total_set] failed to define deviceMemory');

    const okHardwareConcurrency = (Object.getOwnPropertyDescriptor(navProto,'hardwareConcurrency') ?
      (redefineAcc(navProto, 'hardwareConcurrency', () => cpu, { enumerable: true }), true) :
      safeDefineAcc(navProto, 'hardwareConcurrency', () => cpu, { enumerable: true }));
    if (okHardwareConcurrency === false) throw new TypeError('[nav_total_set] failed to define hardwareConcurrency');

    // ——— G. language(s) ———
    const okLanguage = (Object.getOwnPropertyDescriptor(navProto,'language') ?
      (redefineAcc(navProto, 'language', () => window.__primaryLanguage, { enumerable: true }), true) :
      safeDefineAcc(navProto, 'language', () => window.__primaryLanguage,  { enumerable: true }));
    if (okLanguage === false) throw new TypeError('[nav_total_set] failed to define language');

    const okLanguages = (Object.getOwnPropertyDescriptor(navProto,'languages') ?
      (redefineAcc(navProto, 'languages', () => window.__normalizedLanguages, { enumerable: true }), true) :
      safeDefineAcc(navProto, 'languages', () => window.__normalizedLanguages, { enumerable: true }));
    if (okLanguages === false) throw new TypeError('[nav_total_set] failed to define languages');

    // ——— H. permissions.query ———
    if ('permissions' in navigator && navigator.permissions && typeof navigator.permissions.query === 'function') {
      const permProto = Object.getPrototypeOf(navigator.permissions) || navigator.permissions;
      const permDesc = Object.getOwnPropertyDescriptor(permProto, 'query')
        || Object.getOwnPropertyDescriptor(navigator.permissions, 'query');
      if (!permDesc) throw new TypeError('[nav_total_set] permissions.query descriptor missing');
      const origQuery = permDesc.value || navigator.permissions.query;
      if (typeof origQuery !== 'function') throw new TypeError('[nav_total_set] permissions.query original missing');
      const patchedQueryRaw = ({ query(parameters) {
        const isPermThis = (this === navigator.permissions || this === permProto);
        if (!isPermThis) {
          return origQuery.call(this, parameters);
        }
        if (!parameters || typeof parameters !== 'object') {
          return Promise.resolve({ state: 'prompt', onchange: null });
        }
        const name = parameters && parameters.name;
        if (name === 'persistent-storage')
          return Promise.resolve({ state: 'granted', onchange: null });
        if (['geolocation', 'camera', 'audiooutput', 'microphone', 'notifications'].includes(name))
          return Promise.resolve({ state: 'prompt', onchange: null });
        return origQuery.call(this, parameters);
      } }).query;
      const patchedQuery = mark(patchedQueryRaw, 'query');
      Object.defineProperty(permProto, 'query', {
        value: patchedQuery,
        configurable: permDesc.configurable,
        enumerable: permDesc.enumerable,
        writable: permDesc.writable
      });
    }

    // ——— I. mediaDevices.enumerateDevices ———
    if (navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function') {
      const mediaProto = Object.getPrototypeOf(navigator.mediaDevices) || navigator.mediaDevices;
      const mediaDesc = Object.getOwnPropertyDescriptor(mediaProto, 'enumerateDevices')
        || Object.getOwnPropertyDescriptor(navigator.mediaDevices, 'enumerateDevices');
      if (!mediaDesc) throw new TypeError('[nav_total_set] mediaDevices.enumerateDevices descriptor missing');
      const origEnumerate = mediaDesc.value || navigator.mediaDevices.enumerateDevices;
      if (typeof origEnumerate !== 'function') throw new TypeError('[nav_total_set] mediaDevices.enumerateDevices original missing');
      const patchedEnumerateRaw = ({ async enumerateDevices() {
        const isMediaThis = (this === navigator.mediaDevices || this === mediaProto);
        if (!isMediaThis) {
          return origEnumerate.call(this);
        }
        const generateHexId = (len = 64) => {
          let s = '';
          for (let i = 0; i < len; ++i) s += Math.floor(R() * 16).toString(16);
          return s;
        };
        const groupId = generateHexId(64);
        return [
          { kind: 'audioinput',  label: devicesLabels.audioinput,  deviceId: generateHexId(64), groupId },
          { kind: 'videoinput',  label: devicesLabels.videoinput,  deviceId: generateHexId(64), groupId },
          { kind: 'audiooutput', label: devicesLabels.audiooutput, deviceId: generateHexId(64), groupId: generateHexId(64) }
        ];
      } }).enumerateDevices;
      const patchedEnumerate = mark(patchedEnumerateRaw, 'enumerateDevices');
      Object.defineProperty(mediaProto, 'enumerateDevices', {
        value: patchedEnumerate,
        configurable: mediaDesc.configurable,
        enumerable: mediaDesc.enumerable,
        writable: mediaDesc.writable
      });
    }

    // ——— J. storage.estimate & webkitTemporaryStorage ———
    if (navigator.storage && typeof navigator.storage.estimate === 'function') {
      const storageProto = Object.getPrototypeOf(navigator.storage) || navigator.storage;
      const storageDesc = Object.getOwnPropertyDescriptor(storageProto, 'estimate')
        || Object.getOwnPropertyDescriptor(navigator.storage, 'estimate');
      if (!storageDesc) throw new TypeError('[nav_total_set] storage.estimate descriptor missing');
      // Конфигурация: берём из глобалов (как и прочие параметры в модуле), иначе безопасные дефолты
      const QUOTA_MB   = Number(window.__STORAGE_QUOTA_MB   ?? 120);
      const USED_PCT   = Math.max(0, Math.min(100, Number(window.__STORAGE_USED_PCT ?? 3))); // ~3% занято
      const quotaBytes = Math.floor(QUOTA_MB * 1024 * 1024);
      let usageBytes   = Math.max(0, Math.floor(quotaBytes * USED_PCT / 100));

      // Monotonous “jitter” of usage within a few KB, on R(), so as not to break the module’s entropy
      const tickUsage = mark(function tickUsage() {
        usageBytes = Math.min(quotaBytes - 4096, usageBytes + Math.floor(R() * 4096));
      }, 'tickUsage');

      const origEstimate = storageDesc.value || navigator.storage.estimate;
      if (typeof origEstimate !== 'function') throw new TypeError('[nav_total_set] storage.estimate original missing');
      const patchedEstimateRaw = ({ estimate() {
        const isStorageThis = (this === navigator.storage || this === storageProto);
        if (!isStorageThis) {
          return origEstimate.call(this);
        }
        tickUsage();
        return Promise.resolve({ quota: quotaBytes, usage: usageBytes });
      } }).estimate;
      Object.defineProperty(storageProto, 'estimate', {
        configurable: storageDesc.configurable,
        enumerable: storageDesc.enumerable,
        writable: storageDesc.writable,
        value: mark(patchedEstimateRaw, 'estimate')
      });       
      if (navigator.webkitTemporaryStorage) {
        const tmpProto = Object.getPrototypeOf(navigator.webkitTemporaryStorage) || navigator.webkitTemporaryStorage;
        const tmpDesc = Object.getOwnPropertyDescriptor(tmpProto, 'queryUsageAndQuota')
          || Object.getOwnPropertyDescriptor(navigator.webkitTemporaryStorage, 'queryUsageAndQuota');
        if (!tmpDesc) throw new TypeError('[nav_total_set] webkitTemporaryStorage.queryUsageAndQuota descriptor missing');
        const patchedQueryUsage = mark(function (success, error) {
          try { tickUsage(); success(usageBytes, quotaBytes); }
          catch (e) {
            console.error('[nav_total_set][Caught]', e);
            if (typeof error === 'function') error(e); }
        }, 'queryUsageAndQuota');
        Object.defineProperty(tmpProto, 'queryUsageAndQuota', {
          configurable: tmpDesc.configurable,
          enumerable: tmpDesc.enumerable,
          writable: tmpDesc.writable,
          value: patchedQueryUsage
        });
      }

      // Consistent “persistence”
      if (typeof navigator.storage.persist   === 'function') {
        const persistDesc = Object.getOwnPropertyDescriptor(storageProto, 'persist')
          || Object.getOwnPropertyDescriptor(navigator.storage, 'persist');
        if (!persistDesc) throw new TypeError('[nav_total_set] storage.persist descriptor missing');
        Object.defineProperty(storageProto, 'persist', {
          configurable: persistDesc.configurable,
          enumerable: persistDesc.enumerable,
          writable: persistDesc.writable,
          value: mark(function persist()   { return Promise.resolve(true); }, 'persist')
        });
      }
      if (typeof navigator.storage.persisted === 'function') {
        const persistedDesc = Object.getOwnPropertyDescriptor(storageProto, 'persisted')
          || Object.getOwnPropertyDescriptor(navigator.storage, 'persisted');
        if (!persistedDesc) throw new TypeError('[nav_total_set] storage.persisted descriptor missing');
        Object.defineProperty(storageProto, 'persisted', {
          configurable: persistedDesc.configurable,
          enumerable: persistedDesc.enumerable,
          writable: persistedDesc.writable,
          value: mark(function persisted() { return Promise.resolve(true); }, 'persisted')
        });
      }
    }

      // ———  JS heap sizing from deviceMemory ———
    const perfProto = (window.Performance && Performance.prototype) || Object.getPrototypeOf(performance);
    if (perfProto) {
      // if-стиль: патчим только если dm валиден
      const dm0 = Number(navigator.deviceMemory);
      if (typeof dm0 === 'number' && isFinite(dm0)) {

        const heapFromDM = mark(function heapFromDM(dm) {
          // dm: 0.25, 0.5, 1, 2, 4, 8, …
          if (!(typeof dm === 'number' && isFinite(dm))) return null;
          if (dm <= 0.5) return 512  * 1024 * 1024;   // ~512MB
          if (dm <= 1)   return 768  * 1024 * 1024;   // ~768MB
          if (dm <= 2)   return 1536 * 1024 * 1024;   // ~1.5GB
          if (dm <= 4)   return 3072 * 1024 * 1024;   // ~3GB
          return 4096 * 1024 * 1024;                  // cap ~4GB для dm ≥ 8
        }, 'heapFromDM');

        const getMemory = mark(function () {
          // читаем dm каждый раз — «жёсткая» привязка к текущему realm
          const dm = Number(navigator.deviceMemory);
          const limit = heapFromDM(dm);
          if (limit == null) {
            // dm нелегален → не вмешиваемся (оставляем натив/предыдущее)
            const d = Object.getOwnPropertyDescriptor(perfProto, 'memory')
                    || Object.getOwnPropertyDescriptor(performance, 'memory');
            return d && d.get ? d.get.call(performance) : undefined;
          }
          const total = Math.floor(limit * 0.25);
          const used  = Math.min(total - 1, Math.floor(total * (0.40 + 0.15 * R())));
          return { jsHeapSizeLimit: limit, totalJSHeapSize: total, usedJSHeapSize: used };
        }, 'get memory');

        try {
          // first try patch prototype, if rejected — try own on instance
          redefineAcc(perfProto, 'memory', getMemory);
        } catch (_) {
          console.error('[nav_total_set][Caught]', _);
          try {
            Object.defineProperty(performance, 'memory', { get: getMemory, configurable: true });
          } catch (__) {
            console.error('[nav_total_set][Caught]', __);
            throw _;
          }
        }
      }
    }

    // ——— K. WebAuthn (stub) ———
    if (!window.PublicKeyCredential) {
      window.PublicKeyCredential = mark(function PublicKeyCredential() {}, 'PublicKeyCredential');
      Object.defineProperty(PublicKeyCredential, 'isUserVerifyingPlatformAuthenticatorAvailable', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: mark(function isUserVerifyingPlatformAuthenticatorAvailable() { return Promise.resolve(true); },
             'isUserVerifyingPlatformAuthenticatorAvailable')
      });
    }
    if (navigator.credentials) {
      const origCreate = navigator.credentials.create;
      const origGet    = navigator.credentials.get;
      const credProto = Object.getPrototypeOf(navigator.credentials) || navigator.credentials;
      const createDesc = Object.getOwnPropertyDescriptor(credProto, 'create')
        || Object.getOwnPropertyDescriptor(navigator.credentials, 'create');
      const getDesc = Object.getOwnPropertyDescriptor(credProto, 'get')
        || Object.getOwnPropertyDescriptor(navigator.credentials, 'get');
      if (!createDesc) throw new TypeError('[nav_total_set] credentials.create descriptor missing');
      if (!getDesc) throw new TypeError('[nav_total_set] credentials.get descriptor missing');
      const patchedCreate = mark(function create(options) {
        if (options && options.publicKey) {
          return origCreate ? origCreate.call(this, options) : Promise.resolve(new PublicKeyCredential());
        }
        return origCreate ? origCreate.call(this, options) : Promise.resolve(undefined);
      }, 'create');
      const patchedGet = mark(function get(options) {
        if (options && options.publicKey) {
          return origGet ? origGet.call(this, options) : Promise.resolve(new PublicKeyCredential());
        }
        return origGet ? origGet.call(this, options) : Promise.resolve(undefined);
      }, 'get');
      Object.defineProperty(credProto, 'create', {
        configurable: createDesc.configurable,
        enumerable: createDesc.enumerable,
        writable: createDesc.writable,
        value: patchedCreate
      });
      Object.defineProperty(credProto, 'get', {
        configurable: getDesc.configurable,
        enumerable: getDesc.enumerable,
        writable: getDesc.writable,
        value: patchedGet
      });
    }
    console.log('Web Auth API mock applied');

    // ——— L. Plugins & MimeTypes ———
    const profiles = Array.isArray(window.__PLUGIN_PROFILES__) ? window.__PLUGIN_PROFILES__ : [];
      function safeString(val) { return (typeof val === 'symbol' || typeof val === 'undefined') ? '' : String(val); }

      const fakeMimeTypes = [];
      profiles.forEach((pl, pi) =>
        (pl.mimeTypes || []).forEach(mt => {
          const d = (typeof mt === 'string') ? { type: mt, suffixes: '', description: '' } : mt;
          fakeMimeTypes.push({
            type:        safeString(d.type),
            suffixes: safeString(d.suffixes ?? ''),
            description: safeString(d.description ?? ''),
            pluginIndex: pi
          });
        })
      );

      const fakePlugins = profiles.map((pl, i) => ({
        name:        safeString(pl.name),
        filename:    safeString(pl.filename),
        description: safeString(pl.description),
        mimeTypes:   fakeMimeTypes.filter(m => m.pluginIndex === i)
      }));

      // --- Caching (one instance per page) ---
      let __PLUGIN_ARRAY_SINGLETON__ = null;
      let __MIMETYPE_ARRAY_SINGLETON__ = null;
      let __MIME_OBJECTS_SINGLETON__ = null;

      // 4.3. PluginArray (enumerable fields, compatible with JSON/assign)
      function createPluginArray(plugins) {
        if (__PLUGIN_ARRAY_SINGLETON__) return __PLUGIN_ARRAY_SINGLETON__;

        const arr = [];
        const mimeObjects = [];
        for (let i = 0; i < plugins.length; i++) {
          const p = plugins[i];
          const itemMethod = ({ item(index) { return this[index] || null; } }).item;
          const namedItemMethod = ({ namedItem(type) {
            for (let j = 0; j < this.length; j++) if (this[j]?.type === type) return this[j];
            return null;
          } }).namedItem;

          // Create a ?plugin? with strictly enumerable properties
          const pluginObj = Object.create(Plugin.prototype, {
            name:        { value: String(p.name),        enumerable: true,  configurable: true },
            filename:    { value: String(p.filename),    enumerable: true,  configurable: true },
            description: { value: String(p.description), enumerable: true,  configurable: true },
            length:      { value: p.mimeTypes.length,    enumerable: true,  configurable: true },
            item: {
              value: mark(itemMethod, 'item'),
              enumerable: false, configurable: true
            },
            namedItem: {
              value: mark(namedItemMethod, 'namedItem'),
              enumerable: false, configurable: true
            }
          });

          // mime-??????? (enumerable ????, enabledPlugin ? ?? pluginObj)
          for (let j = 0; j < p.mimeTypes.length; j++) {
            const m = p.mimeTypes[j];
            const mimeObj = Object.create(MimeType.prototype, {
              type:         { value: String(m.type),        enumerable: true, configurable: true },
              suffixes: { value: String(m.suffixes ?? ''),enumerable: true, configurable: true },
              description: { value: String(m.description ?? ''), enumerable: true, configurable: true },
              enabledPlugin:{ value: pluginObj,             enumerable: true, configurable: true }
            });
            // index on the plugin itself ? enumerable
            Object.defineProperty(pluginObj, String(j), { value: mimeObj, enumerable: true, configurable: true });
            mimeObjects.push(mimeObj);
          }

          arr.push(pluginObj);
        }

        // array of plugins
        const pluginArray = Object.create(PluginArray.prototype, {
          length:    { value: arr.length, enumerable: true, configurable: true },
          item:      { value: mark(({ item(index) { return pluginArray[String(index)] || null; } }).item, 'item'), enumerable: false, configurable: true },
          namedItem: { value: mark(({ namedItem(name) { for (let i = 0; i < arr.length; i++) if (pluginArray[String(i)]?.name === name) return pluginArray[String(i)]; return null; } }).namedItem, 'namedItem'), enumerable: false, configurable: true }
        });

        // Indexes ? enumerable + named props (non-enumerable)
        for (let i = 0; i < arr.length; i++) {
          const pluginObj = arr[i];
          Object.defineProperty(pluginArray, String(i), { value: pluginObj, enumerable: true, configurable: true });
          const pname = pluginObj && pluginObj.name;
          if (pname) {
            Object.defineProperty(pluginArray, pname, { value: pluginObj, enumerable: false, configurable: true });
          }
        }

        __MIME_OBJECTS_SINGLETON__ = mimeObjects;
        __PLUGIN_ARRAY_SINGLETON__ = pluginArray;
        return pluginArray;
      }

      // MimeTypeArray (in same time - for case of direct circulation)
      function createMimeTypeArray(plugins) {
        if (__MIMETYPE_ARRAY_SINGLETON__) return __MIMETYPE_ARRAY_SINGLETON__;

        createPluginArray(plugins);
        const mimes = Array.isArray(__MIME_OBJECTS_SINGLETON__) ? __MIME_OBJECTS_SINGLETON__ : [];
        const mimeArray = Object.create(MimeTypeArray.prototype, {
          length:    { value: mimes.length, enumerable: true, configurable: true },
          item:      { value: mark(({ item(index) { return mimeArray[String(index)] || null; } }).item, 'item'), enumerable: false, configurable: true },
          namedItem: { value: mark(({ namedItem(type) { return mimeArray[type] || null; } }).namedItem, 'namedItem'), enumerable: false, configurable: true }
        });

        for (let i = 0; i < mimes.length; i++) {
          const mimeObj = mimes[i];
          Object.defineProperty(mimeArray, String(i), { value: mimeObj, enumerable: true, configurable: true });
          const type = mimeObj && mimeObj.type;
          if (type) {
            Object.defineProperty(mimeArray, type, { value: mimeObj, enumerable: false, configurable: true });
          }
        }

        __MIMETYPE_ARRAY_SINGLETON__ = mimeArray;
        return mimeArray;
      }

      // Getters - like in ORIG: enumerable: true
      safeDefineAcc(navProto, 'plugins', () => createPluginArray(fakePlugins), { enumerable: true });
      safeDefineAcc(navProto, 'mimeTypes', () => createMimeTypeArray(fakePlugins), { enumerable: true });

    //  ——— Debug information to console ———
  if (G.__DEBUG__) {
    console.group("Client Hints Debug");
    console.log("meta:", meta);
    const hasUAD = ('userAgentData' in navigator);
    console.log("navigator.userAgentData:", hasUAD ? navigator.userAgentData : undefined);
    if (!hasUAD) {
      console.log("navigator.userAgentData unavailable (secureContext:", G.isSecureContext, ")");
    }
    console.log("navigator.language(s):", navigator.language, navigator.languages);
    console.log("navigator.deviceMemory:", navigator.deviceMemory);
    console.log("navigator.hardwareConcurrency:", navigator.hardwareConcurrency);
    if (navigator.connection) {
      console.log("navigator.connection:", {
        saveData: navigator.connection.saveData,
        effectiveType: navigator.connection.effectiveType
      });
    }
    console.groupEnd();
    console.info('Client Hints and Navigator setting applied in JS');
  }
  }
}

;
// 1) Источник снапшотов
function EnvBus(G){
  function envSnapshot(){
    const nav = G.navigator;
    let langs = G.__normalizedLanguages;
    if (!Array.isArray(langs)) {
      if (typeof langs === 'string') langs = [langs];
      else throw new Error('EnvBus: __normalizedLanguages missing');
    }
    const lang     = (typeof G.__primaryLanguage === 'string') ? G.__primaryLanguage : null;
    if (!lang) throw new Error('EnvBus: __primaryLanguage missing');
    const ua       = G.__USER_AGENT;
    const vendor   = G.__VENDOR;
    if (typeof ua !== 'string' || !ua) throw new Error('EnvBus: __USER_AGENT missing');
    if (typeof vendor !== 'string') throw new Error('EnvBus: __VENDOR missing');
    const dpr      = (typeof G.__DPR === 'number' && G.__DPR > 0) ? +G.__DPR : null;
    if (!dpr) throw new Error('EnvBus: __DPR missing');
    const cpu      = (G.__cpu != null) ? G.__cpu : null;
    const mem      = (G.__memory != null) ? G.__memory : null;
    if (cpu == null) throw new Error('EnvBus: __cpu missing');
    if (mem == null) throw new Error('EnvBus: __memory missing');
    const timeZone = G.__TIMEZONE__;
    if (!timeZone) throw new Error('EnvBus: __TIMEZONE__ missing');

    // ЕДИНЫЙ источник CH: берем подготовленный (__EXPECTED_CLIENT_HINTS)
    let ch = null;
    if (G.__EXPECTED_CLIENT_HINTS && typeof G.__EXPECTED_CLIENT_HINTS === 'object') {
      ch = G.__EXPECTED_CLIENT_HINTS;
    } else {
      throw new Error('EnvBus: __EXPECTED_CLIENT_HINTS missing');
    }

    // низкоэнтропийные — ровно как вы уже именуете: uaData
    const uaData = ch ? (() => {
      if (typeof ch.platform !== 'string' || !ch.platform) {
        throw new Error('THW: uaData.platform missing');
      }
      let brandsSrc = null;
      if (Array.isArray(ch.brands)) {
        brandsSrc = ch.brands;
      } else if (Array.isArray(ch.fullVersionList)) {
        brandsSrc = ch.fullVersionList;
      } else {
        throw new Error('THW: uaData.brands missing');
      }
      const brands = brandsSrc.map(x => {
        if (!x || typeof x !== 'object') throw new Error('THW: uaData.brand entry');
        const brand = (typeof x.brand === 'string' && x.brand) ? x.brand
                    : (typeof x.name === 'string' && x.name) ? x.name
                    : null;
        if (!brand) throw new Error('THW: uaData.brand missing');
        let versionRaw = null;
        if (typeof x.version === 'string') {
          if (!x.version) throw new Error('THW: uaData.brand version missing');
          versionRaw = x.version;
        } else if (typeof x.version === 'number' && Number.isFinite(x.version)) {
          versionRaw = String(x.version);
        } else {
          throw new Error('THW: uaData.brand version missing');
        }
        const major = String(versionRaw).split('.')[0];
        if (!major) throw new Error('THW: uaData.brand version missing');
        return { brand, version: major };
      });
      return { platform: ch.platform, brands, mobile: !!ch.mobile };
    })() : null;
    if (!uaData) throw new Error('EnvBus: uaData missing');

    if (!G.__UACH_HE_READY__) throw new Error('EnvBus: high entropy not ready');
    if (!G.__LAST_UACH_HE__ || typeof G.__LAST_UACH_HE__ !== 'object') {
      throw new Error('EnvBus: high entropy missing');
    }
    const HE_KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
    const he = {};
    for (const k of HE_KEYS) {
      if (!(k in G.__LAST_UACH_HE__)) throw new Error(`EnvBus: high entropy missing ${k}`);
      const v = G.__LAST_UACH_HE__[k];
      if (v === undefined || v === null) throw new Error(`EnvBus: high entropy bad ${k}`);
      if (k === 'fullVersionList' && !Array.isArray(v)) {
        throw new Error('EnvBus: high entropy bad fullVersionList');
      }
      if (typeof v === 'string');
      if (Array.isArray(v) && !v.length) throw new Error(`EnvBus: high entropy bad ${k}`);
      he[k] = v;
    }
    uaData.he = he;

    const seed = String(G && G.__GLOBAL_SEED);
    // Алиасы для совместимости с воркер-патчем
    return {
      ua, vendor, language: lang, languages: langs, dpr, cpu, mem, timeZone,
      uaData,
      uaCH: uaData,
      highEntropy: he,
      hardwareConcurrency: cpu,
      deviceMemory: mem,
      seed
    };
  }

  function syncShared(port){ const snap = envSnapshot(); port.start(); port.postMessage({ __ENV_SYNC__: { envSnapshot: snap } }); }
  function syncDedicated(worker){ const snap = envSnapshot(); worker.postMessage({ __ENV_SYNC__: { envSnapshot: snap } }); }
  return { envSnapshot, syncShared, syncDedicated };
}


// 2) Хаб (инициализация без записи в глобал): вернёт объект hub
function EnvHub_init(G){
  if (typeof BroadcastChannel !== 'function') {
    throw new Error('EnvHub: BroadcastChannel missing');
  }
  const bc = new BroadcastChannel('__ENV_SYNC__');
  const state = { snap: null };
  const hub = {
    v: 1000001,
    __OWNS_WORKER__: false,
    __OWNS_SHARED__: false,
    __OWNS_SW__:     false,
    getSnapshot(){ return state.snap; },
    publish(snap){
      if (!snap || typeof snap !== 'object') throw new Error('EnvHub: publish missing snapshot');
      state.snap = snap;
      bc.postMessage({ __ENV_SYNC__: { envSnapshot: snap } });
    },
    subscribe(fn){
      if (typeof fn !== 'function') throw new Error('EnvHub: subscribe requires function');
      const h = ev=>{ fn(ev?.data?.__ENV_SYNC__?.envSnapshot); };
      bc.addEventListener('message',h);
      return ()=>bc.removeEventListener('message',h);
    },
    installWorkerNavMirror(scope){
      if (!scope) throw new Error('EnvHub: installWorkerNavMirror missing scope');
      scope.__ENV_HUB__ = hub;
    }
  };
  return hub;
}


// 2a) Обёртка для вызова из бандла
function EnvHubPatchModule(G){
  const hub = EnvHub_init(G);
  G.__ENV_HUB__ = hub;   // здесь фикс: записываем в глобал один раз
}

// 3) Установка оверрайдов (Worker/Shared/SW).Используем SafeWorkerOverride.
function WorkerOverrides_install(G, hub) {
  const already = G.Worker && (G.Worker.__ENV_WRAPPED__ === true || String(G.Worker).includes('WrappedWorker'));
  if (!already) SafeWorkerOverride(G);

  if (G.SharedWorker) {
    const alreadySW = !!(G.SharedWorker && G.SharedWorker.__ENV_WRAPPED__ === true);
    if (!alreadySW) SafeSharedWorkerOverride(G);
  }
  ServiceWorkerOverride(G);
}


// 4) Публикация стартового снапшота
function EnvPublishSnapshotModule(G){
  const EB = EnvBus(G);
  const snap = EB.envSnapshot();
  if (!G.__ENV_HUB__ || typeof G.__ENV_HUB__.publish !== 'function') {
    throw new Error('EnvPublish: hub missing');
  }
  G.__ENV_HUB__.publish(snap);
}


// === env-worker-bridge (главный бандл) ===
(function setupEnvBridge(global){
  const BR = (global.__ENV_BRIDGE__ = global.__ENV_BRIDGE__ || {});

function mkModuleWorkerSource(snapshot, absUrl){
  if (!snapshot || typeof snapshot !== 'object') throw new Error('THW: mkModuleWorkerSource bad snapshot');
  if (typeof absUrl !== 'string' || !absUrl) throw new Error('THW: mkModuleWorkerSource bad absUrl');
  const patchUrl = global.__ENV_BRIDGE__ && global.__ENV_BRIDGE__.urls && global.__ENV_BRIDGE__.urls.workerPatchModule;
  if (typeof patchUrl !== 'string' || !patchUrl) throw new Error('THW: mkModuleWorkerSource bad workerPatchModule url');
  const SNAP = JSON.stringify(snapshot);
  const USER = JSON.stringify(absUrl);
  const PATCH_URL = JSON.stringify(patchUrl);
  return `
    (async function(){
      'use strict';
      self.__GW_BOOTSTRAP__ = true;
      const __requireSnap = s => {
        if (!s || typeof s !== 'object') throw new Error('UACHPatch: no snapshot');
        if (typeof s.language !== 'string' || !s.language) throw new Error('UACHPatch: bad language');
        if (!Array.isArray(s.languages)) throw new Error('UACHPatch: bad languages');
        if (!Number.isFinite(Number(s.deviceMemory))) throw new Error('UACHPatch: bad deviceMemory');
        if (!Number.isFinite(Number(s.hardwareConcurrency))) throw new Error('UACHPatch: bad hardwareConcurrency');
        if (!s.uaData && !s.uaCH) throw new Error('UACHPatch: missing userAgentData');
        const he = (s.uaData && s.uaData.he) || (s.uaCH && s.uaCH.he) || s.highEntropy || (s.uaCH && s.uaCH.highEntropy);
        if (!he || typeof he !== 'object') throw new Error('UACHPatch: missing highEntropy');
        const KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
        for (const k of KEYS) {
          if (!(k in he)) throw new Error('UACHPatch: missing highEntropy.' + k);
          const v = he[k];
          if (v === undefined || v === null) throw new Error('UACHPatch: bad highEntropy.' + k);
          if (typeof v === 'string');
          if (Array.isArray(v) && !v.length) throw new Error('UACHPatch: bad highEntropy.' + k);
        }
        return s;
      };
      self.__applyEnvSnapshot__ = s => {
        if (self.__ENV_SNAP_APPLIED__ === s) return;
        self.__lastSnap__ = __requireSnap(s);
        self.__ENV_SNAP_APPLIED__ = s;
      };
      self.__applyEnvSnapshot__(${SNAP});
      if (!self.__ENV_SYNC_BC_INSTALLED__) {
        if (typeof BroadcastChannel !== 'function') throw new Error('UACHPatch: BroadcastChannel missing');
        self.__ENV_SYNC_BC_INSTALLED__ = true;
        const bc = new BroadcastChannel('__ENV_SYNC__');
        bc.onmessage = ev => { const s = ev?.data?.__ENV_SYNC__?.envSnapshot; if (s) self.__applyEnvSnapshot__(s); };
      }
      // <<< ВПЕЧАТАННЫЙ URL ПАТЧА >>>
      const PATCH_URL = ${PATCH_URL};
      if (!PATCH_URL) throw new Error('UACHPatch: missing workerPatchModule URL');
      await import(PATCH_URL);
      if (typeof self.installWorkerUACHMirror !== 'function') throw new Error('UACHPatch: installWorkerUACHMirror missing');
      self.installWorkerUACHMirror();
      if (!self.__WORKER_PATCH_LOADED__) throw new Error('UACHPatch: patch marker missing');
      if (!self.__UACH_MIRROR_INSTALLED__) throw new Error('UACHPatch: mirror not installed');
      // Применяем снимок СЕЙЧАС, уже через реализацию патча:
      if (!self.__applyEnvSnapshot__ || !self.__lastSnap__) throw new Error('UACHPatch: snapshot not applied');
      self.__applyEnvSnapshot__(self.__lastSnap__);
      // Только ПОСЛЕ зеркала грузим пользовательский код:
      const USER = ${USER};
      if (!USER || typeof USER !== 'string') throw new Error('UACHPatch: missing user module URL');
      await import(USER);
      if (typeof self.postMessage === 'function') {
        self.postMessage({ __ENV_USER_URL_LOADED__: USER });
      }
    })();
    export {};
    //# sourceURL=worker_module_bootstrap.js
  `;
}




function mkClassicWorkerSource(snapshot, absUrl){
  if (!snapshot || typeof snapshot !== 'object') throw new Error('THW: mkClassicWorkerSource bad snapshot');
  if (typeof absUrl !== 'string' || !absUrl) throw new Error('THW: mkClassicWorkerSource bad absUrl');
  const patchUrl = global.__ENV_BRIDGE__ && global.__ENV_BRIDGE__.urls && global.__ENV_BRIDGE__.urls.workerPatchClassic;
  if (typeof patchUrl !== 'string' || !patchUrl) throw new Error('THW: mkClassicWorkerSource bad workerPatchClassic url');
  const SNAP = JSON.stringify(snapshot);
  const USER = JSON.stringify(absUrl);
  const PATCH_URL = JSON.stringify(patchUrl);
  return `
    (function(){
      'use strict';
      self.__GW_BOOTSTRAP__ = true;
      var __requireSnap = function(s){
        if (!s || typeof s !== 'object') throw new Error('UACHPatch: no snapshot');
        if (typeof s.language !== 'string' || !s.language) throw new Error('UACHPatch: bad language');
        if (!Array.isArray(s.languages)) throw new Error('UACHPatch: bad languages');
        if (!Number.isFinite(Number(s.deviceMemory))) throw new Error('UACHPatch: bad deviceMemory');
        if (!Number.isFinite(Number(s.hardwareConcurrency))) throw new Error('UACHPatch: bad hardwareConcurrency');
        if (!s.uaData && !s.uaCH) throw new Error('UACHPatch: missing userAgentData');
        const he = (s.uaData && s.uaData.he) || (s.uaCH && s.uaCH.he) || s.highEntropy || (s.uaCH && s.uaCH.highEntropy);
        if (!he || typeof he !== 'object') throw new Error('UACHPatch: missing highEntropy');
        const KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
        for (const k of KEYS) {
          if (!(k in he)) throw new Error('UACHPatch: missing highEntropy.' + k);
          const v = he[k];
          if (v === undefined || v === null) throw new Error('UACHPatch: bad highEntropy.' + k);
          if (typeof v === 'string');
          if (Array.isArray(v) && !v.length) throw new Error('UACHPatch: bad highEntropy.' + k);
        }
        return s;
      };
      self.__applyEnvSnapshot__ = function(s){
        if (self.__ENV_SNAP_APPLIED__ === s) return;
        self.__lastSnap__ = __requireSnap(s);
        self.__ENV_SNAP_APPLIED__ = s;
      };
      self.__applyEnvSnapshot__(${SNAP});
      if (!self.__ENV_SYNC_BC_INSTALLED__) {
        if (typeof BroadcastChannel !== 'function') throw new Error('UACHPatch: BroadcastChannel missing');
        self.__ENV_SYNC_BC_INSTALLED__ = true;
        const bc = new BroadcastChannel('__ENV_SYNC__');
        bc.onmessage = function(ev){ var s = ev && ev.data && ev.data.__ENV_SYNC__ && ev.data.__ENV_SYNC__.envSnapshot; if (s) self.__applyEnvSnapshot__(s); };
      }
      // <<< ВПЕЧАТАННЫЙ URL ПАТЧА >>>
      const PATCH_URL = ${PATCH_URL};
      if (!PATCH_URL) throw new Error('UACHPatch: missing workerPatchClassic URL');
      importScripts(PATCH_URL);
      if (typeof self.installWorkerUACHMirror !== 'function') throw new Error('UACHPatch: installWorkerUACHMirror missing');
      self.installWorkerUACHMirror();
      if (!self.__WORKER_PATCH_LOADED__) throw new Error('UACHPatch: patch marker missing');
      if (!self.__UACH_MIRROR_INSTALLED__) throw new Error('UACHPatch: mirror not installed');
      // Применяем снимок СЕЙЧАС, уже через реализацию патча:
      if (!self.__applyEnvSnapshot__ || !self.__lastSnap__) throw new Error('UACHPatch: snapshot not applied');
      self.__applyEnvSnapshot__(self.__lastSnap__);
      var __isModuleURL = function(u){
        if (typeof u !== 'string' || !u) return false;
        if (/\\.mjs(?:$|[?#])/i.test(u)) return true;
        if (/[?&]type=module(?:&|$)/i.test(u)) return true;
        if (/[?&]module(?:&|$)/i.test(u)) return true;
        if (/#module\\b/i.test(u)) return true;
        if (u.slice(0, 5) === 'data:') {
          return /;module\\b/i.test(u) || /\\bmodule\\b/i.test(u.slice(0, 80));
        }
        return false;
      };
      var USER = ${USER};
      if (!USER || typeof USER !== 'string') throw new Error('UACHPatch: missing user script URL');
      if (__isModuleURL(USER)) {
        return import(USER).then(function(){
          if (typeof self.postMessage === 'function') {
            self.postMessage({ __ENV_USER_URL_LOADED__: USER });
          }
        });
      }
      try {
        importScripts(USER);
      } catch (e) {
        return import(USER).then(function(){
          if (typeof self.postMessage === 'function') {
            self.postMessage({ __ENV_USER_URL_LOADED__: USER });
          }
        });
      }
      if (typeof self.postMessage === 'function') {
        self.postMessage({ __ENV_USER_URL_LOADED__: USER });
      }
    })();
    //# sourceURL=worker_classic_bootstrap.js
  `;
}


  // Паблик-API для main
  function publishSnapshot(snap){
    if (typeof BroadcastChannel !== 'function') {
      throw new Error('EnvPublish: BroadcastChannel missing');
    }
    const bc = new BroadcastChannel('__ENV_SYNC__');
    bc.postMessage({ __ENV_SYNC__: { envSnapshot: snap } });
  }
  if (BR.mkModuleWorkerSource && BR.mkModuleWorkerSource !== mkModuleWorkerSource) {
    throw new Error('EnvBridge: mkModuleWorkerSource already set');
  }
  if (BR.mkClassicWorkerSource && BR.mkClassicWorkerSource !== mkClassicWorkerSource) {
    throw new Error('EnvBridge: mkClassicWorkerSource already set');
  }
  if (BR.publishSnapshot && BR.publishSnapshot !== publishSnapshot) {
    throw new Error('EnvBridge: publishSnapshot already set');
  }
  if (BR.envSnapshot && BR.envSnapshot !== EnvBus(global).envSnapshot) {
    throw new Error('EnvBridge: envSnapshot already set');
  }
  BR.mkModuleWorkerSource  = mkModuleWorkerSource;
  BR.mkClassicWorkerSource = mkClassicWorkerSource;
  BR.publishSnapshot       = publishSnapshot;
  BR.envSnapshot           = EnvBus(global).envSnapshot;
})(window);


// === SafeWorkerOverride (Dedicated) ===
function requireWorkerSnapshot(snap, label) {
  if (!snap || typeof snap !== 'object') {
    if (label) {
      throw new Error(`[WorkerOverride] missing snapshot (${label})`);
    }
    throw new Error('[WorkerOverride] missing snapshot');
  }
  if (typeof snap.language !== 'string' || !snap.language) throw new Error('[WorkerOverride] snapshot.language missing');
  if (!Array.isArray(snap.languages)) throw new Error('[WorkerOverride] snapshot.languages missing');
  if (!Number.isFinite(Number(snap.deviceMemory))) throw new Error('[WorkerOverride] snapshot.deviceMemory missing');
  if (!Number.isFinite(Number(snap.hardwareConcurrency))) throw new Error('[WorkerOverride] snapshot.hardwareConcurrency missing');
  if (!Number.isFinite(Number(snap.dpr))) throw new Error('[WorkerOverride] snapshot.dpr missing');
  if (!snap.uaData && !snap.uaCH) throw new Error('[WorkerOverride] snapshot.uaData missing');
  const he = (snap.uaData && snap.uaData.he) || (snap.uaCH && snap.uaCH.he) || snap.highEntropy || (snap.uaCH && snap.uaCH.highEntropy);
  if (!he || typeof he !== 'object') throw new Error('[WorkerOverride] snapshot.highEntropy missing');
  const KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
  for (const k of KEYS) {
    if (!(k in he)) throw new Error(`[WorkerOverride] snapshot.highEntropy.${k} missing`);
    const v = he[k];
    if (v === undefined || v === null) throw new Error(`[WorkerOverride] snapshot.highEntropy.${k} missing`);
    if (typeof v === 'string');
    if (Array.isArray(v) && !v.length) throw new Error(`[WorkerOverride] snapshot.highEntropy.${k} missing`);
  }
  return snap;
}

function installBlobURLStore(G) {
  if (!G || !G.URL || typeof G.URL.createObjectURL !== 'function') return;
  if (G.__BLOB_URL_STORE__) return;
  const store = new Map();
  Object.defineProperty(G, '__BLOB_URL_STORE__', { value: store, configurable: false, writable: false });
  if (typeof G.markAsNative !== 'function') {
    throw new Error('[WorkerOverride] markAsNative missing');
  }
  const mark = G.markAsNative;
  const nativeCreate = G.URL.createObjectURL;
  const nativeRevoke = G.URL.revokeObjectURL;
  const createWrapped = mark(function createObjectURL(obj){
    const url = nativeCreate.call(G.URL, obj);
    if (obj && typeof obj === 'object') store.set(url, obj);
    return url;
  }, 'createObjectURL');
  const revokeWrapped = mark(function revokeObjectURL(url){
    if (store.has(url)) store.delete(url);
    return nativeRevoke.call(G.URL, url);
  }, 'revokeObjectURL');
  const dCreate = Object.getOwnPropertyDescriptor(G.URL, 'createObjectURL');
  const dRevoke = Object.getOwnPropertyDescriptor(G.URL, 'revokeObjectURL');
  if (dCreate && dCreate.configurable === false && dCreate.writable === false) {
    throw new Error('[WorkerOverride] URL.createObjectURL not writable');
  }
  if (dRevoke && dRevoke.configurable === false && dRevoke.writable === false) {
    throw new Error('[WorkerOverride] URL.revokeObjectURL not writable');
  }
  Object.defineProperty(G.URL, 'createObjectURL', Object.assign({}, dCreate, { value: createWrapped }));
  Object.defineProperty(G.URL, 'revokeObjectURL', Object.assign({}, dRevoke, { value: revokeWrapped }));
}

function resolveUserScriptURL(G, absUrl, label) {
  if (typeof absUrl !== 'string' || !absUrl) return absUrl;
  if (absUrl.slice(0, 5) !== 'blob:') return absUrl;
  const store = G && G.__BLOB_URL_STORE__;
  if (!store || !store.has(absUrl)) {
    const l = label ? ` (${label})` : '';
    throw new Error(`[WorkerOverride] blob URL missing from store${l}`);
  }
  const blob = store.get(absUrl);
  const fresh = G.URL.createObjectURL(blob);
  return fresh;
}

function isProbablyModuleWorkerURL(absUrl) {
  if (typeof absUrl !== 'string' || !absUrl) return false;
  if (/\.mjs(?:$|[?#])/i.test(absUrl)) return true;
  if (/[?&]type=module(?:&|$)/i.test(absUrl)) return true;
  if (/[?&]module(?:&|$)/i.test(absUrl)) return true;
  if (/#module\\b/i.test(absUrl)) return true;
  if (absUrl.slice(0, 5) === 'data:') {
    return /;module\\b/i.test(absUrl) || /\\bmodule\\b/i.test(absUrl.slice(0, 80));
  }
  return false;
}

function resolveWorkerType(absUrl, opts, label) {
  const hasType = !!(opts && (typeof opts === 'object' || typeof opts === 'function') && ('type' in opts));
  const t = hasType ? opts.type : undefined;
  if (hasType && t !== 'module' && t !== 'classic') {
    const l = label ? ` (${label})` : '';
    throw new Error(`[WorkerOverride] invalid worker type${l}`);
  }
  const isModuleURL = isProbablyModuleWorkerURL(absUrl);
  if (t === 'classic' && isModuleURL) {
    const l = label ? ` (${label})` : '';
    throw new Error(`[WorkerOverride] module worker URL with classic type${l}`);
  }
  return (t === 'module' || (!hasType && isModuleURL)) ? 'module' : 'classic';
}

function definePatchedValue(target, key, value, label) {
  const d = Object.getOwnPropertyDescriptor(target, key)
    || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target) || {}, key);
  if (!d) {
    throw new Error(`[WorkerOverride] ${label || key} descriptor missing`);
  }
  Object.defineProperty(target, key, {
    value,
    configurable: d.configurable,
    enumerable: d.enumerable,
    writable: d.writable
  });
}


function SafeWorkerOverride(G){
  if (!G || !G.Worker) throw new Error('[WorkerOverride] Worker missing');
  if (G.Worker.__ENV_WRAPPED__) return;
  installBlobURLStore(G);
  const NativeWorker = G.Worker;

  const mark = G.markAsNative;
  if (typeof mark !== 'function') {
    throw new Error('[WorkerOverride] markAsNative missing');
  }

  const WrappedWorker = mark(function Worker(url, opts) {
  const abs = new URL(url, location.href).href;
  const workerType = resolveWorkerType(abs, opts, 'Worker');
  const bridge = G.__ENV_BRIDGE__;
  if (!bridge || typeof bridge.mkClassicWorkerSource !== 'function') {
    console.error('[WorkerOverride] __ENV_BRIDGE__ not ready, refusing to create unpatched Worker');
    throw new Error('[WorkerOverride] __ENV_BRIDGE__ not ready; refusing to create unpatched Worker');
  }
  if (typeof bridge.mkModuleWorkerSource !== 'function') {
    throw new Error('[WorkerOverride] mkModuleWorkerSource missing');
  }
  if (typeof bridge.publishSnapshot !== 'function') {
    throw new Error('[WorkerOverride] publishSnapshot missing');
  }
  if (typeof bridge.envSnapshot !== 'function') {
    throw new Error('[WorkerOverride] envSnapshot missing');
  }
  const snap = requireWorkerSnapshot(bridge.envSnapshot(), 'create');
  G.__lastSnap__ = snap;
  bridge.publishSnapshot(snap);

  const userURL = resolveUserScriptURL(G, abs, 'Worker');
  const src = workerType === 'module'
    ? bridge.mkModuleWorkerSource(snap, userURL)
    : bridge.mkClassicWorkerSource(snap, userURL);

  const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
  let w;
  try {
    w = new NativeWorker(blobURL, { ...(opts), type: workerType });
  } finally {
    URL.revokeObjectURL(blobURL);
  }
  if (w && typeof w.addEventListener === 'function') {
    const onMsg = ev => {
      const data = ev && ev.data;
      const loaded = data && typeof data === 'object' && typeof data.__ENV_USER_URL_LOADED__ === 'string'
        ? data.__ENV_USER_URL_LOADED__
        : null;

      if (loaded) {
        // скрываем внутренний сигнал от внешних слушателей (важно для creepjs workers.js)
        try { ev.stopImmediatePropagation(); ev.stopPropagation(); } catch(_) {}

        // revoke нужен только когда мы реально пересоздавали blob-url
        if (loaded === userURL && userURL !== abs) {
          try { URL.revokeObjectURL(userURL); } catch(_) {}
        }

        w.removeEventListener('message', onMsg);
      }
    };
    w.addEventListener('message', onMsg);
  }
  return w;
}, 'Worker');

  definePatchedValue(G, 'Worker', WrappedWorker, 'Worker');

  G.Worker.__ENV_WRAPPED__ = true;
    // маркер для диагностики
  if (G.__DEBUG__) {
    try { G.__PATCHED_SAFE_WORKER__ = true; console.info('SafeWorker installed'); } catch(_){}
}
}
window.SafeWorkerOverride = SafeWorkerOverride;


// === SafeSharedWorkerOverride (Shared) ===
function SafeSharedWorkerOverride(G){
  if (!G || !G.SharedWorker) throw new Error('[SharedWorkerOverride] SharedWorker missing');
  if (G.SharedWorker.__ENV_WRAPPED__) return;
  installBlobURLStore(G);
  const NativeShared = G.SharedWorker;

  const mark = G.markAsNative;
  if (typeof mark !== 'function') {
    throw new Error('[SharedWorkerOverride] markAsNative missing');
  }

  const WrappedSharedWorker = mark(function SharedWorker(url, nameOrOpts) {
    const abs = new URL(url, location.href).href;
    const hasOpts = !!(nameOrOpts && (typeof nameOrOpts === 'object' || typeof nameOrOpts === 'function'));
    const bridge = G.__ENV_BRIDGE__;
    if (!bridge || typeof bridge.mkClassicWorkerSource !== 'function') {
      console.error('[SharedWorkerOverride] __ENV_BRIDGE__ not ready, refusing to create unpatched SharedWorker');
      throw new Error('[SharedWorkerOverride] __ENV_BRIDGE__ not ready; refusing to create unpatched SharedWorker');
    }
    if (typeof bridge.mkModuleWorkerSource !== 'function') {
      throw new Error('[SharedWorkerOverride] mkModuleWorkerSource missing');
    }
    if (typeof bridge.publishSnapshot !== 'function') {
      throw new Error('[SharedWorkerOverride] publishSnapshot missing');
    }
    if (typeof bridge.envSnapshot !== 'function') {
      throw new Error('[SharedWorkerOverride] envSnapshot missing');
    }
    const snap = requireWorkerSnapshot(bridge.envSnapshot(), 'create');
    G.__lastSnap__ = snap;
    bridge.publishSnapshot(snap);
    const workerType = resolveWorkerType(abs, hasOpts ? nameOrOpts : null, 'SharedWorker');
    const userURL = resolveUserScriptURL(G, abs, 'SharedWorker');
    const src = workerType === 'module'
      ? bridge.mkModuleWorkerSource(snap, userURL)
      : bridge.mkClassicWorkerSource(snap, userURL);
    const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));

    try {
      if (hasOpts) {
        return new NativeShared(blobURL, { ...(nameOrOpts || {}), type: workerType });
      }
      return new NativeShared(blobURL, nameOrOpts);
    } finally {
      URL.revokeObjectURL(blobURL);
    }
  }, 'SharedWorker');
  definePatchedValue(G, 'SharedWorker', WrappedSharedWorker, 'SharedWorker');
  G.SharedWorker.__ENV_WRAPPED__ = true;
  if (G.__DEBUG__) {
    try { G.__PATCHED_SHARED_WORKER__ = true; console.info('SharedWorker installed'); } catch(_){}
}
}
window.SafeSharedWorkerOverride = SafeSharedWorkerOverride;



// ===== ServiceWorker override (allow self/infra; block others; hub-friendly) =====
function ServiceWorkerOverride(G){
  'use strict';
  if (!G || !G.navigator) {
    if (G && G.__DEBUG__) {
      try { console.info('ServiceWorkerOverride: navigator missing'); } catch(_){}
    }
    return;
  }
  if (G.isSecureContext === false) {
    return;
  }
  if (!('serviceWorker' in G.navigator)) {
    if (G.__DEBUG__) {
      try { console.info('ServiceWorkerOverride: navigator.serviceWorker missing'); } catch(_){}
    }
    return;
  }
  if (!G.navigator.serviceWorker) {
    if (G.__DEBUG__) {
      try { console.info('ServiceWorkerOverride: navigator.serviceWorker unavailable'); } catch(_){}
    }
    return;
  }

  // --- Идемпотентная проверка: если уже обёрнуто — выходим (без HUB-флагов)
  try {
    const sw    = G.navigator.serviceWorker;
    const proto = Object.getPrototypeOf(sw) || sw;
    const fn    = proto && proto.register;
    // Check three methods at once
    const already =
      (typeof fn === 'function' &&
       (fn.__ENV_WRAPPED__ === true || /\bWrappedServiceWorkerRegister\b/.test(String(fn)))) &&
      (typeof (proto && proto.getRegistrations) === 'function' &&
       (proto.getRegistrations.__ENV_WRAPPED__ === true || /\bWrappedSWGetRegistrations\b/.test(String(proto.getRegistrations)))) &&
      (typeof (proto && proto.getRegistration) === 'function' &&
       (proto.getRegistration.__ENV_WRAPPED__ === true || /\bWrappedSWGetRegistration\b/.test(String(proto.getRegistration))));
    if (already) {
      if (G.__DEBUG__) {
        try { G.__PATCHED_SERVICE_WORKER__ = true; console.info('ServiceWorker already installed'); } catch(_){}
      }
      return;
    }
  } catch(_) {}

  const SWC   = G.navigator.serviceWorker;
  const proto = Object.getPrototypeOf(SWC) || SWC;
  const mark = G.markAsNative;
  if (typeof mark !== 'function') {
    throw new Error('[ServiceWorkerOverride] markAsNative missing');
  }

  const Native = {
    register:         proto.register,
    getRegistration:  proto.getRegistration,
    getRegistrations: proto.getRegistrations,
  };

  // ---- режим/политика
  const MODE       = (G.__SW_FILTER_MODE__ ?? 'off');
  const ALLOW_SELF = !!G.__SW_ALLOW_SELF__;
  const EXTRA      = Array.isArray(G.__SW_ALLOW_HOSTS__) ? G.__SW_ALLOW_HOSTS__ : [];
  const FAKE_ON_BLOCK = !!G.__SW_FAKE_ON_BLOCK__;
  const INFRA_ALLOW = Array.isArray(G.__SW_INFRA_ALLOW__) ? G.__SW_INFRA_ALLOW__ : [
    /(?:^|\.)cloudflare\.com$/i,
    /(?:^|\.)challenge\.cloudflare\.com$/i,
    /(?:^|\.)challenges\.cloudflare\.com$/i,
    /(?:^|\.)akamaihd\.net$/i,
    /(?:^|\.)perimeterx\.net$/i,
    /(?:^|\.)hcaptcha\.com$/i,
    /(?:^|\.)recaptcha\.net$/i,
  ];

  const wantFilter = () => MODE !== 'off';
  const wantClean  = () => MODE === 'clean';
  const wantFake   = () => MODE === 'fake' || FAKE_ON_BLOCK;


  const hostOf = (u, base) => {
    try {
      return new URL(u, base || G.location.href).hostname.toLowerCase();
    } catch (e) {
      const emsg =
        (e && typeof e === 'object' && 'message' in e) ? e.message : String(e);
      throw new Error(
        `THW: hostOf failed (u=${String(u)}, base=${String(base)}): ${emsg}`
      );
    }
  };

  const isSelf  = (h) => !!h && (h === (G.location.hostname).toLowerCase());
  const inList  = (h, arr) => arr.some(x => x instanceof RegExp ? x.test(h)
                                                                : (h === String(x).toLowerCase()) ||
                                                                  h.endsWith('.' + String(x).toLowerCase()));
  const isAllowed = (url, scope) => {
    if (!wantFilter()) return true;
    const h = hostOf(url) || hostOf(scope);
    if (!h) return false;
    if (INFRA_ALLOW.some(rx => rx.test(h))) return true;
    if (ALLOW_SELF && isSelf(h)) return true;
    return inList(h, EXTRA);
  };

  // ---- безопасные заглушки
  const CLEANED = new Set();

  function makeFakeServiceWorker(scriptURL, scope) {
    if (typeof scriptURL !== 'string' || !scriptURL) {
      throw new Error('THW: makeFakeServiceWorker missing scriptURL');
    }
    if (typeof scope !== 'string' || !scope) {
      throw new Error('THW: makeFakeServiceWorker missing scope');
    }
    return {
      scriptURL,
      state: 'activated',
      onstatechange: null,
      postMessage() { throw new Error('THW: ServiceWorker.postMessage'); },
      addEventListener() { throw new Error('THW: ServiceWorker.addEventListener'); },
      removeEventListener() { throw new Error('THW: ServiceWorker.removeEventListener'); }
    };
  }

  function makeFakeRegistration(options, scriptURL) {
    if (!options || typeof options !== 'object') {
      throw new Error('THW: makeFakeRegistration missing options');
    }
    const scope = options.scope;
    if (typeof scope !== 'string' || !scope) {
      throw new Error('THW: makeFakeRegistration missing options.scope');
    }
    const active = makeFakeServiceWorker(scriptURL, scope);
    return {
      scope, installing: null, waiting: null, active,
      navigationPreload: {
        enable: async () => { throw new Error('THW: navigationPreload.enable'); },
        disable: async () => { throw new Error('THW: navigationPreload.disable'); },
        getState: async () => { throw new Error('THW: navigationPreload.getState'); }
      },
      addEventListener() { throw new Error('THW: registration.addEventListener'); },
      removeEventListener() { throw new Error('THW: registration.removeEventListener'); },
      update: async () => { throw new Error('THW: registration.update'); },
      unregister: async () => { throw new Error('THW: registration.unregister'); }
    };
  }


  // ---- register ----
  if (typeof Native.register === 'function') {
    const desc = Object.getOwnPropertyDescriptor(proto, 'register');
    if (!desc || desc.configurable === false || desc.writable === false) {
      throw new Error(`[ServiceWorkerOverride] register not configurable: ${JSON.stringify(desc)}`);
    }
    const WrappedServiceWorkerRegister = mark(function register(url, opts){
      if (!isAllowed(url, (opts && opts.scope))) {
        if (wantFake()) return Promise.resolve(makeFakeRegistration(opts, String(url)));
        const Err = (typeof DOMException === 'function')
          ? new DOMException('ServiceWorker register blocked by policy', 'SecurityError')
          : new Error('ServiceWorker register blocked by policy');
        return Promise.reject(Err);
      }
      return Native.register.apply(this, arguments);
    }, 'register');
    try { Object.defineProperty(WrappedServiceWorkerRegister, 'name', { value: 'WrappedServiceWorkerRegister' }); } catch(_){}
    WrappedServiceWorkerRegister.__ENV_WRAPPED__ = true;
    Object.defineProperty(proto, 'register', {
      configurable: desc.configurable,
      enumerable: desc.enumerable,
      writable: desc.writable,
      value: WrappedServiceWorkerRegister
    });
  }

  // ---- getRegistrations ----
  if (typeof Native.getRegistrations === 'function') {
    const desc = Object.getOwnPropertyDescriptor(proto, 'getRegistrations');
    if (!desc || desc.configurable === false || desc.writable === false) {
      throw new Error(`[ServiceWorkerOverride] getRegistrations not configurable: ${JSON.stringify(desc)}`);
    }
    const WrappedSWGetRegistrations = mark(async function getRegistrations(){
      const regs = await Native.getRegistrations.apply(this, arguments);
      if (!wantFilter()) return regs;
      const out = [];
      for (const r of regs || []) {
        const sc  = (r && r.scope) || '/';
        const url = (r && r.active && r.active.scriptURL) || sc;
        if (isAllowed(url, sc)) {
          out.push(r);
        } else {
          if (wantClean() && !CLEANED.has(sc)) {
            try { await r.unregister(); } catch(_) {}
            CLEANED.add(sc);
          }
          if (wantFake()) out.push(makeFakeRegistration({ scope: sc }, url));
        }
      }
      return out;
    }, 'getRegistrations');
    try { Object.defineProperty(WrappedSWGetRegistrations, 'name', { value: 'WrappedSWGetRegistrations' }); } catch(_){}
    WrappedSWGetRegistrations.__ENV_WRAPPED__ = true;
    Object.defineProperty(proto, 'getRegistrations', {
      configurable: desc.configurable, enumerable: desc.enumerable, writable: desc.writable, value: WrappedSWGetRegistrations
    });
  }

  // ---- getRegistration ----
  if (typeof Native.getRegistration === 'function') {
    const desc = Object.getOwnPropertyDescriptor(proto, 'getRegistration');
    if (!desc || desc.configurable === false || desc.writable === false) {
      throw new Error(`[ServiceWorkerOverride] getRegistration not configurable: ${JSON.stringify(desc)}`);
    }
    const WrappedSWGetRegistration = mark(async function getRegistration(scope){
      const r = await Native.getRegistration.apply(this, arguments);
      if (!r) return wantFake() && wantFilter() ? makeFakeRegistration({ scope }) : r;
      if (!wantFilter()) return r;

      const sc  = r.scope || scope || '/';
      const url = (r.active && r.active.scriptURL) || sc;
      if (isAllowed(url, sc)) return r;

      if (wantClean() && !CLEANED.has(sc)) {
        try { await r.unregister(); } catch(_) {}
        CLEANED.add(sc);
      }
      return wantFake() ? makeFakeRegistration({ scope: sc }, url) : undefined;
    }, 'getRegistration');
    try { Object.defineProperty(WrappedSWGetRegistration, 'name', { value: 'WrappedSWGetRegistration' }); } catch(_){}
    WrappedSWGetRegistration.__ENV_WRAPPED__ = true;
    Object.defineProperty(proto, 'getRegistration', {
      configurable: desc.configurable, enumerable: desc.enumerable, writable: desc.writable, value: WrappedSWGetRegistration
    });
  }

  //Diagnostics
  if (G.__DEBUG__) {
    try { G.__PATCHED_SERVICE_WORKER__ = true; console.info('ServiceWorker installed'); } catch(_){}
}
}
window.ServiceWorkerOverride = ServiceWorkerOverride;



// --- mirror fonts readiness to worker/globalThis (Offscreen/Worker) ---
(function mirrorFontsReadyOnce() {
  const G = (typeof globalThis !== 'undefined' && globalThis)
    || (typeof self       !== 'undefined' && self)
    || (typeof window     !== 'undefined' && window)
    || (typeof global     !== 'undefined' && global)
    || {};
  if (!G) return;

  const p = G.__fontsReady || G.awaitFontsReady;
  if (G.__FONTS_READY__) return;
  if (p && typeof p.then === 'function') {
    p.then(() => {
      if (G.__FONTS_READY__) return;
      G.__FONTS_READY__ = true;
      try { G.dispatchEvent && G.dispatchEvent(new Event('fontsready')); } catch (_) {}
    }).catch(() => {
      // даже при ошибке считаем готовым, чтобы не залипли хуки
      G.__FONTS_READY__ = true;
      try { G.dispatchEvent && G.dispatchEvent(new Event('fontsready')); } catch (_) {}
    });
  }
})();


// === WorkerPatchHooks: оркестратор ===
(function WorkerPatchHooks(G){
  if (!G || G.WorkerPatchHooks) return;

  // 1) Hub (идемпотентно, без сайд-эффектов)
  function initHub(){
    const hub = G.__ENV_HUB__ || EnvHubPatchModule(G) || G.__ENV_HUB__;
    if (!hub) throw new Error('[WorkerInit] EnvHub missing');
    return hub;
  }

  // 2) Overrides (Worker/Shared/SW) — после Hub
  function installOverrides(){
    const hub = initHub();
    WorkerOverrides_install(G, hub);
    return hub;
  }

  // 3) Первый снапшот (LE) из текущего состояния
  function snapshotOnce(){
    const snap = EnvBus(G).envSnapshot();
    if (!G.__ENV_HUB__ || typeof G.__ENV_HUB__.publish !== 'function') {
      throw new Error('[WorkerInit] hub missing');
    }
    G.__ENV_HUB__.publish(snap);
    return snap;
  }

  // 4) HE-догонка (не блокирует загрузку, без «N»/«Nav»)
  function snapshotHE(keys){
    if (G.__UACH_HE_PROMISE__) return G.__UACH_HE_PROMISE__;
    const UAD = G.navigator && G.navigator.userAgentData;
    const KEYS = Array.isArray(keys) && keys.length
      ? keys
      : ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','formFactors','wow64'];
    if (!UAD || typeof UAD.getHighEntropyValues !== 'function') {
      const meta = G.__EXPECTED_CLIENT_HINTS;
      if (!meta || typeof meta !== 'object') {
        throw new Error('[WorkerInit] userAgentData missing');
      }
      const he = {};
      for (const k of KEYS) {
        if (!(k in meta)) throw new Error(`[WorkerInit] high entropy missing ${k}`);
        const v = meta[k];
        if (v === undefined || v === null) throw new Error(`[WorkerInit] high entropy bad ${k}`);
        if (typeof v === 'string');
        if (Array.isArray(v) && !v.length) throw new Error(`[WorkerInit] high entropy bad ${k}`);
        he[k] = v;
      }
      G.__LAST_UACH_HE__ = he;
      G.__UACH_HE_READY__ = true;
      const p = Promise.resolve(he);
      G.__UACH_HE_PROMISE__ = p;
      return p;
    }
    const p = UAD.getHighEntropyValues(KEYS).then(he => {
      if (!he || typeof he !== 'object') throw new Error('[WorkerInit] high entropy missing');
      for (const k of KEYS) {
        if (!(k in he)) throw new Error(`[WorkerInit] high entropy missing ${k}`);
        const v = he[k];
        if (v === undefined || v === null) throw new Error(`[WorkerInit] high entropy bad ${k}`);
        if (typeof v === 'string');
        if (Array.isArray(v) && !v.length) throw new Error(`[WorkerInit] high entropy bad ${k}`);
      }
      G.__LAST_UACH_HE__ = he;
      G.__UACH_HE_READY__ = true;
      return he;
    });
    G.__UACH_HE_PROMISE__ = p;
    return p;
  }

  // 5) Полный сценарий
  function initAll(opts){
    const o = Object.assign({ publishHE: true, heKeys: null }, opts);
    installOverrides();        // Hub → Overrides
    if (o.publishHE) {
      return snapshotHE(o.heKeys).then(() => snapshotOnce());
    }
    return snapshotOnce();
  }

  // 6) Diagnostics
  function diag(){
    if (!G.__DEBUG__) return {};
    const BR = G.__ENV_BRIDGE__;
    return {
      hasHub:        !!G.__ENV_HUB__,
      workerWrapped: !!(G.Worker && (G.Worker.__ENV_WRAPPED__ || /WrappedWorker/.test(String(G.Worker)))),
      sharedWrapped: !!(G.SharedWorker && G.SharedWorker.__ENV_WRAPPED__),
      swWrapped:     !!G.__PATCHED_SERVICE_WORKER__,
      bridge: {
        mkClassic: typeof BR.mkClassicWorkerSource === 'function',
        mkModule:  typeof BR.mkModuleWorkerSource  === 'function',
        publish:   typeof BR.publishSnapshot       === 'function',
        envSnap:   typeof BR.envSnapshot           === 'function'
      }
    };
  }
  G.WorkerPatchHooks = { initHub, installOverrides, snapshotOnce, snapshotHE, initAll, diag };
  window.WorkerPatchHooks = G.WorkerPatchHooks;
  if (G.__DEBUG__) {
    console.info('[WorkerInit] WorkerPatchHooks ready');
  }
})(window);

;
function ScreenPatchModule() {
  if (!window.__PATCH_SCREEN__) {
  window.__PATCH_SCREEN__ = true;
  
  const C = window.CanvasPatchContext;
  if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — module registration is not available');
    
  const SCREEN_WIDTH  = window.__WIDTH;
  const SCREEN_HEIGHT = window.__HEIGHT;
  const COLOR_DEPTH   = window.__COLOR_DEPTH;
  const DPR           = Number(window.__DPR);
  
  function safeDefine(obj, prop, descriptor) {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return;
    const d = Object.getOwnPropertyDescriptor(obj, prop);
    if (d && d.configurable === false) {
      throw new TypeError(`[Screen] ${prop} non-configurable`);
    }
    if (Object.prototype.hasOwnProperty.call(obj, prop)) delete obj[prop];
    Object.defineProperty(obj, prop, descriptor);
  }
  function makeNamedGetter(prop, getter) {
    if (typeof getter === 'function' && getter.name) return getter;
    const acc = ({ get [prop]() { return getter.call(this); } });
    return Object.getOwnPropertyDescriptor(acc, prop).get;
  }
  function redefineProp(target, prop, getterOrValue) {
    const d = Object.getOwnPropertyDescriptor(target, prop);
    if (!d) throw new Error(`[Screen] ${prop} descriptor missing`);
    if (d.configurable === false) throw new Error(`[Screen] ${prop} non-configurable`);
    const isData = Object.prototype.hasOwnProperty.call(d, 'value') && !d.get && !d.set;
    if (isData) {
      const value = (typeof getterOrValue === 'function') ? getterOrValue.call(target) : getterOrValue;
      Object.defineProperty(target, prop, {
        value,
        writable: !!d.writable,
        configurable: !!d.configurable,
        enumerable: !!d.enumerable
      });
      return;
    }
    if (typeof d.get !== 'function') throw new Error(`[Screen] ${prop} getter missing`);
    const getFn = (typeof getterOrValue === 'function')
      ? makeNamedGetter(prop, getterOrValue)
      : makeNamedGetter(prop, function(){ return getterOrValue; });
    Object.defineProperty(target, prop, {
      get: getFn,
      set: d.set,
      configurable: d.configurable,
      enumerable: d.enumerable
    });
  }
  function chooseTarget(obj, proto, prop) {
    if (obj && Object.getOwnPropertyDescriptor(obj, prop)) return obj;
    if (proto && Object.getOwnPropertyDescriptor(proto, prop)) return proto;
    return null;
  }

  const mqlMatches = new WeakMap();
  const mqlProto = (typeof MediaQueryList !== 'undefined' && MediaQueryList.prototype) ? MediaQueryList.prototype : null;
  if (mqlProto) {
    const matchesDesc = Object.getOwnPropertyDescriptor(mqlProto, 'matches');
    if (matchesDesc && typeof matchesDesc.get === 'function' && matchesDesc.configurable) {
      const origMatchesGet = matchesDesc.get;
      Object.defineProperty(mqlProto, 'matches', {
        get: function matches() {
          if (mqlMatches.has(this)) return mqlMatches.get(this);
          return origMatchesGet.call(this);
        },
        set: matchesDesc.set,
        configurable: matchesDesc.configurable,
        enumerable: matchesDesc.enumerable
      });
    }
  }

  const origMatchMedia = window.matchMedia;
  window.matchMedia = function (query) {
    let matches = true;

    
    const deviceW = query.match(/\(device-width:\s*(\d+)px\)/);
    if (deviceW) matches = matches && SCREEN_WIDTH === parseInt(deviceW[1], 10);

    const deviceH = query.match(/\(device-height:\s*(\d+)px\)/);
    if (deviceH) matches = matches && SCREEN_HEIGHT === parseInt(deviceH[1], 10);
    
    const maxW = query.match(/\(max-width:\s*(\d+)px\)/);
    if (maxW) matches = matches && SCREEN_WIDTH <= parseInt(maxW[1], 10);
    const minW = query.match(/\(min-width:\s*(\d+)px\)/);
    if (minW) matches = matches && SCREEN_WIDTH >= parseInt(minW[1], 10);
    const maxH = query.match(/\(max-height:\s*(\d+)px\)/);
    if (maxH) matches = matches && SCREEN_HEIGHT <= parseInt(maxH[1], 10);
    const minH = query.match(/\(min-height:\s*(\d+)px\)/);
    if (minH) matches = matches && SCREEN_HEIGHT >= parseInt(minH[1], 10);

    // aspect-ratio safe
    const aspectRatio = query.match(/\(aspect-ratio:\s*(\d+)\/(\d+)\)/);
    if (aspectRatio && typeof SCREEN_WIDTH === 'number' && typeof SCREEN_HEIGHT === 'number') {
      const wInt = parseInt(aspectRatio[1], 10);
      const hInt = parseInt(aspectRatio[2], 10);
      matches = matches && (SCREEN_WIDTH * hInt === SCREEN_HEIGHT * wInt);
    } else if (aspectRatio) {
      matches = false;
    }
    const maxAspectRatio = query.match(/\(max-aspect-ratio:\s*(\d+)\/(\d+)\)/);
    if (maxAspectRatio) {
      const wInt = parseInt(maxAspectRatio[1], 10);
      const hInt = parseInt(maxAspectRatio[2], 10);
      matches = matches && (SCREEN_WIDTH * hInt <= SCREEN_HEIGHT * wInt);
    }
    const minAspectRatio = query.match(/\(min-aspect-ratio:\s*(\d+)\/(\d+)\)/);
    if (minAspectRatio) {
      const wInt = parseInt(minAspectRatio[1], 10);
      const hInt = parseInt(minAspectRatio[2], 10);
      matches = matches && (SCREEN_WIDTH * hInt >= SCREEN_HEIGHT * wInt);
    }

    const orientation = query.match(/\(orientation:\s*(portrait|landscape)\)/);
    if (orientation) {
      const actual = (SCREEN_WIDTH > SCREEN_HEIGHT) ? "landscape" : "portrait";
      matches = matches && actual === orientation[1];
    }
    const actualOrientationDom = (SCREEN_WIDTH > SCREEN_HEIGHT) ? "landscape-primary" : "portrait-primary";
    window.__ORIENTATION = actualOrientationDom;

    const color = query.match(/\(color:\s*(\d+)\)/);
    if (color) {
      matches = matches && COLOR_DEPTH === parseInt(color[1], 10);
    }

    const resolution = query.match(/\(resolution:\s*(\d+)dpi\)/);
    if (resolution) {
      const dpi = 96 * DPR;
      matches = matches && dpi === parseInt(resolution[1], 10);
    }

    const mql = origMatchMedia.call(this, query);
    if (mql && (typeof mql === 'object' || typeof mql === 'function')) {
      try { mqlMatches.set(mql, matches); } catch {}
    }
    return mql;
  };

  //  screen и orientation ──
  const screenObj = window.screen;
  const screenProto = screenObj && Object.getPrototypeOf(screenObj);
  if (screenObj && screenProto && screenProto !== Object.prototype) {
    const setScreen = (k, get) => {
      const target = chooseTarget(screenObj, screenProto, k);
      if (!target) throw new Error(`[Screen] ${k} descriptor missing`);
      redefineProp(target, k, get);
    };
    setScreen('width', () => SCREEN_WIDTH);
    setScreen('height', () => SCREEN_HEIGHT);
    setScreen('availWidth', () => SCREEN_WIDTH);
    setScreen('availHeight', () => SCREEN_HEIGHT);
    setScreen('colorDepth', () => COLOR_DEPTH);
    setScreen('pixelDepth', () => COLOR_DEPTH);
    setScreen('availLeft', () => 0);
    setScreen('availTop', () => 0);
  }
  const orientationObj = screenObj && screenObj.orientation;
  const orientationProto = orientationObj && Object.getPrototypeOf(orientationObj);
  if (orientationObj && orientationProto && orientationProto !== Object.prototype) {
    const setOrientation = (k, get) => {
      const target = chooseTarget(orientationObj, orientationProto, k);
      if (!target) throw new Error(`[Screen] orientation.${k} descriptor missing`);
      redefineProp(target, k, get);
    };
    try { setOrientation('type', () => (SCREEN_WIDTH > SCREEN_HEIGHT ? "landscape-primary" : "portrait-primary")); }
    catch (e) { console.warn('[Screen] orientation.type redefine failed:', e); }
    try { setOrientation('angle', () => 0); }
    catch (e) { console.warn('[Screen] orientation.angle redefine failed:', e); }
  }

  // inner/outerWidth/Height
  ["innerWidth", "innerHeight", "outerWidth", "outerHeight"].forEach(prop => {
    safeDefine(window, prop, {
      get: () => (prop.endsWith("Width") ? SCREEN_WIDTH : SCREEN_HEIGHT),
      configurable: true,
      enumerable: true
    });
  });

  //  visualViewport 
  if (window.visualViewport) {
    safeDefine(window.visualViewport, "width", {
      get: () => SCREEN_WIDTH,
      configurable: true,
      enumerable: true
    });
    safeDefine(window.visualViewport, "height", {
      get: () => SCREEN_HEIGHT,
      configurable: true,
      enumerable: true
    });
    safeDefine(window.visualViewport, "offsetLeft", {
      get: () => 0,
      configurable: true,
      enumerable: true
    });
    safeDefine(window.visualViewport, "offsetTop", {
      get: () => 0,
      configurable: true,
      enumerable: true
    });
    //  viewport:
    safeDefine(window.visualViewport, "scale", {
      get: () => 1,
      configurable: true,
      enumerable: true
    });
    safeDefine(window.visualViewport, "pageLeft", {
      get: () => 0,
      configurable: true,
      enumerable: true
    });
    safeDefine(window.visualViewport, "pageTop", {
      get: () => 0,
      configurable: true,
      enumerable: true
    });
  }

  // — make screen serializable
  safeDefine(window.screen, "toJSON", {
    value: () => ({
      width:        SCREEN_WIDTH,
      height:       SCREEN_HEIGHT,
      availWidth:   SCREEN_WIDTH,
      availHeight:  SCREEN_HEIGHT,
      colorDepth:   COLOR_DEPTH,
      pixelDepth:   COLOR_DEPTH,
      devicePixelRatio: DPR
    }),
    writable:    false,
    enumerable:  false,
    configurable: true
  });

  // — make visualViewport serializable
  if (window.visualViewport) {
    safeDefine(window.visualViewport, "toJSON", {
      value: () => ({
        width:      SCREEN_WIDTH,
        height:     SCREEN_HEIGHT,
        scale:      window.visualViewport.scale,
        pageLeft:   window.visualViewport.pageLeft,
        pageTop:    window.visualViewport.pageTop
      }),
      writable:    false,
      enumerable:  false,
      configurable: true
    });
  }


  // clientWidth / clientHeight for <html> ──
  const clientWidthDesc = Object.getOwnPropertyDescriptor(Element.prototype, 'clientWidth');
  const origClientWidth = clientWidthDesc && clientWidthDesc.get;
  redefineProp(Element.prototype, 'clientWidth', function clientWidth() {
    if (this === document.documentElement || this === document.body) return SCREEN_WIDTH;
    if (typeof origClientWidth === 'function') return origClientWidth.call(this);
    return SCREEN_WIDTH;
  });
  const clientHeightDesc = Object.getOwnPropertyDescriptor(Element.prototype, 'clientHeight');
  const origClientHeight = clientHeightDesc && clientHeightDesc.get;
  redefineProp(Element.prototype, 'clientHeight', function clientHeight() {
    if (this === document.documentElement || this === document.body) return SCREEN_HEIGHT;
    if (typeof origClientHeight === 'function') return origClientHeight.call(this);
    return SCREEN_HEIGHT;
  });



  document.addEventListener("DOMContentLoaded", () => {
    console.log("[Screen] patched screen/viewport:", {
      html:   { width:  document.documentElement.clientWidth,  height: document.documentElement.clientHeight },
      window: { width:  window.innerWidth,  height: window.innerHeight },
      screen: { width:  window.screen.width,  height: window.screen.height }
    });
  });

  // log after DOM ready for document & div
  document.addEventListener("DOMContentLoaded", () => {
    console.log("[Screen] document & div client sizes →", {
      html: {
        width:  document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
      },
      div: {
        width:  document.querySelector("div")?.clientWidth,
        height: document.querySelector("div")?.clientHeight
      }
    });
  });
  
  console.log('[Screen] patches applied');
  } 
}
  

;
window.fontPatchConfigs = [{"name": "W32_0_6e9c33_1", "family": "Condensed", "url": "data:font/woff2;base64,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", "fallback": "W32_0_6e9c33_1", "platform_id": 3, "platform_dom": "Win32", "weight": "normal", "style": "normal"}, {"name": "W32_0_81eb35", "family": "Verdana", "url": "data:font/woff2;base64,d09GMgABAAAAABnkABIAAAAAgTgAABmAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFG8GYBU2FotgAIRQCGQJo0gREAqBpUCBix8SlBgBNgIkA4MsC4FYAAQgBYVdB4F9DIFdGwRyNcrNLtwOiNpc+fySccxJ3I4URcRejCLYONCg4Cjx/39PKodUEy5p2WD/IDusFBpsqxI9hmdUGB4Q+I2MKigyV+Q+MXDFVA//Qk5e4dujfkLsgYuK95oYlHCS3wrDR9S4YZM/erS5mtX9WThBRCBu0aOWV90cJditOd1ewoPSd/iCSS78f1HECUZ73SgYMcU8eh2hsU9y4f9jrvfc97L7gaEpcrbEFolsp5IVk62j8dUELn8/py9XlTL+EJcA5cBN2AnJwk0pAl09N+N4vv3cLC/yiNe/68TlJmYpYI3QCAkKatl67/+xOdlXkiwcTiBFkmBTeYTDofHjw3T1vZAAASLEielmZueLWnnqnXVWN1deVdzgObAD8HuvzgZ/IPx/39znTHKlnUSoEgUKBPbDwO7mA+f6otw/4YrCkDrhCkLB///OVg8pkmHEM0h6TrB0xPLwPk6wDPh7qGZQvS3egnfAi1iKiAbxINbiu51dz579eiuWr311GLhkAdn8v7Xy071jCk8y71JLg/1Bt5+5eswVj0OY79TDHV4woKfHfRV0anvz4LzS0wBdBKndHpIwosKAbTcodUu3v14hA41RCp7//mJHttqq6e8kuHCFEgzEE3zjFylbzP5lQnyFPL1qpMNoAp6Q4BBOk+ARHiM0U3OWDfUe0XHUqReOQKpms0mb3Ww5B9uDHFL7xEln0lz7DMKhAmQFqEkT2Ff2x/+8lCSEfGH9g27MOszFg8OWs/D8O+2N+lpR7Gz30VY4qYT+jlMYcTSyfiTPG6XMtlam/LPy/K0NkGUBeAFnAWj5B7vpP1C9taCl1BZIqBEHBocPEIsEsJSLnxUUH8DmOt1gyLwVQZzu1O2PoQoxO9+JPDFpv702zNWevcTSCIFB0/sHwMpLqzQxf2Gxj9+6IsGmp3YCOEu+0Qe9hoPB832Q36SushmLCZxFdfW8gz/yBAhg7/YUqGf20Jx5X3tEnuq7Fl5Yf5ROcBXdrA5dpo9k+5/+D+nS+nDphF5GDG2U2WOSxSybRQ4rc2xtZ+lysHKycbHHzcPRXs4OHxc/twBPgkK8HeZri/BDAiGQgiihpoVbGBEsFA6PICBbRDVJ6MgUDBVLw3UU3xAjJC5BlCR1ilyXpiQjS5WjyYt2QaymKJ6SsoSKpCpu1vBVdQ2CJlGLpE2eHUqFhUEhqjBNhC7KWLF9E2dKcElyS/FI867MzrJ8cvzyAgqCKXZJqKQsrCKiKqomlno3xHOwBEQSKhUMLt2ETIaUBeRQ8qGbUUixijglvHIEokpLqglZjaJO1YhG12xDK2Zqs3Ric3S5YHt6guoDAoBRgYCiwTANx/ZC4IKEwkMTYIiNJfXAkYNHoCBSkWiTTO9GQWWgMdFZGOzJ5HRhYXNxeLj8yRN04hMICUVEYmLJlEg7AKQyMjm5gkK5lHunUlGraTS0Wjrd0u+NQc9oYDIym2Jpq7mVzcJu5bBx2uNqt6OFx8nr4nPHL+DpoLdZyCfsFyFOVIyk44AmCVJJsqSkyWUoOkvZkKOSp05BkaZLtHVlOhX6VNUY1Bm7wVTTZNZiSVuHVZete+xVfY4MDDmNuIy5e8JTMeXNzJzPgt9SYK4Ey9Y2QrbCdiL2ovMgVnJ0EneWcAFcwXXb0R3ygD0RL9QbWx87+MR9Eb5JP9T63d4f7Z9hKso0eEFsF/8GqaYj6InkuATUe8EPD/+fjXQZMmXJliNXnnw2dg5OLm4eXj5+AUEhYREIgUShMVgcnkAkkSlUmqiYuISklLSMrJy8gqKSsooqFzcPLx+/gKCQsIiomLiEpJS0jKycvIKikrKKqpq6hqaWRJaSnhUTnvd6mSGop6ML78UCDtNYyGelA3v8nqXIh0KIRNH/APXD4QnyouDX6/dRooduNAoM/lAuvzPYmw4ycRpjSfB7vY+pumw9ANvGPAbGFPuuct/68UHTeOUI+MopE0V8OOiWA6oNtDj11vf2dfNnKsrTwI1wiyd4izfHR8E8Ds7WWHA+IpHGkcj+jdI3ozmEKP1IwJ9JqaVR8aamuT4+PijM9SaCteg8t9dIrKIPu4phWvhKZ4ao4txU8/gPAz53ZxVDSOSfDppnFWOoGDrZKqaQYnhLPAlGKKk/Mf6S1I+hx/GCoIWUdjd1TabXCSz8k8DSMyIp/s1yFWlYxeyKD7wGbxj0csK/pNT+uidlCbsEbx2FccA+V0TkpMhMHi9HAS9dkUWsYg1WosWfZyFs1ha2dqZud+Sfnv4oK9ltTzBMw9jXVhdPNE1nrU+5f5ms8EQR5QWskQrVPiqt2Ne4obiKrowNS5HFWcURdqfBuyJzsFk4l7r2cOFu172ntNf7Fn4C+L8ShAyJcERAHbknSpOeWtAw0F9hITnBh4DYwr1UWvbKQkVD/UoUMibikSDZiftU6bTPLLLkyH5dNRlSEWpo6K3dG6VN71q48eD+ygvpE/4IEOzAfah02EcWUWJEv4pDJkQyUqQ7dZ8pnfW5RZ4C+a+KkCVRjgrVrtzXStd9Y9GkRfOrNmRHdAPSa3jfLz3ww8WIMaOvJpBTMYs5i57fL0uv/HqxYcvmqx3kXhziyKmP9+fSF39d3Lhz++oB85n7v3IRAFw6kw8rOICVLMBH0Bdk/kDuGgBAPuj4EwAAZ37muNxGiah/I1jaAjzhkoZM36Rh7NX0Eg+9luCdQIGdyFbBIeOx0uYu5QIgW8V4A4XOmHqDlc5goHOBzYLJQnNHcaha/2lY3oCko2q0EmPEvBHE0g0rUBAyL4MUCC2SN8AE2mAGzQBKqUCm6sibMEMeoLHN6NaVrLGAvmFQcqe8jB3ZHoYGLUCFTQQR2U/v9ycQEB7CKvN0Oh3O4Haf83dys/xApl/u5rt8QN59vKUHbP94W4JDxKZnUgSTpo+eVE6S28eP3JOnMuXWp4/h0RNbqOpMmFiV8Tzxxs+YVstWiWXy8ZZiiCSRJtDrTCWauv3jrPgPcS8qLgcY8gRb27vsHfP2SkPRKU1iYOssKCQfbzmLNwqBcFcFtcEicNU8V95fpHUfGuWKXifOrROLAMUAu85q0/MI9NhXOCwhDKkjFdPaqA+RprSLxKcpUbDuQ9EEPYuNPsVy+pXOyfzmrOmZtyKgCdigGA4FSSbbJndIkqW1iKAZj9y0Uz7jUyMpphHskEmh9ZqRc+InWOCc2YHP4GYf67X504wZ5WPR/Dq7WXDcPUpga3nW08nuB+YBELW0sC3awfY4jTO6nFxySiTkxjGmV0kcELsrAwaj/n1ooBWdVSuBsQjzuEwCoREgmURkO1tyh2dgjKX1ROJp98P8MTCgKJQEGx9laOSYi0Q1O1uq2IM1AfjhWPaRwBZ0advqXFi+dBSqAKtUWCTQ9OvwZWHI7bVK3Rm1vcsrx6RgBwpuG8tiN2oVm00AV1lrLp3inS7M6hkl3Dm0k2HDC+ceeQ1ZdDWUVQU2lKDycmXC5tFIAk4JmULrrze5sXohY0OLRSlFQKN5LEYVwaPYbQ9aMgMQtkjOz7khqu7nwxK8lg6fPrYhh6egL2mSBdbbzQpfnVpE2k1HXfxBwq3qhFo2giKiZnVn8UEDiVLJb3RcuMVwH11pq3otHtQEzxm9q4bUocC97AEaL01Bwl/MOrilJ8nPQAxTn8C78qTHgksp55BppGDShUDZWezDo6pIr4I/bPDML3nlZXc1/NMYacFlZwgvnnXthBPkyYmN/SG+0MUjWGSBCyR/Fygxj2nbfxj/p/YvRB4X2LBVrDrYHIaQ3r/3u9oc2EHEorJCIu4ITOg2hYidibixzY6ASMpEEtixMWUEOklDVfH6GfNQ1ixKaaevSwGiNLo/FfhSvkWDF0A2qC66r6shM1+zmPf5BfDtAEazokqxCS4HkCEIBb8s3Hgw7nK1HOUFUx7npaJIZ/2NBe6YyE35eJHKPJoxTQFQiHqZXi5R1e9xH7qrjd+LrXa1KM5ZStOxEjYr9w/RcV/W49eHsFZ86b7Ih45fg0q0leqoLq16PVJ780W5G5l3rD8BPELitj7dRJe5cMj8KE+R74yCzKRzhQvMFJyl0+kRp8PPLZCdUR0/sRI472EwFq/OsFHpz0Q+sFXsDG1NNXm63Vn+CdnTm0WwTD22cejhHFrEVYk0qwRekNaIvu0IE8CsL+3aCIwjKi9Sb9aA0cIUHXGj39f6D55boVoEKd2DFm7sTmHS1BEGL83M6IhK3co+RztlLm5CwkSN+jlTMppGi4qlKS/RboVMB8/MtJZwmZQG84N3BVtx1gjJXYFg6nhl9k5s6xXovpa0TaWwVPr2Qss0eKjC2KzpluX9OPCjl1VMb7zwW5pRLvoUF/TMEZw9izTecI8IO4nMEPsWWqR6bv2uayOQ/yN7RYay8ljYJRzsoQZf+Vmepx4TVRo8JZ4dgWkuIaB9+PJUYj4qj3q3XZnfRKU9CD5g6jjb/I+T6YCqEJGdO2xVVlrbHD1kjVAwbKM2CZJ+X8uksAGDTGCe05ihWUfsyfUcNK5VWJCksfWBdaYzE9khDa7bXNcJ9I/HbjOGW3Eczgq+ebL7LQWJkpTfWCwuKp/1fGC0k1YC2DSSorygSe14hVpFJIKxYRB4I6FBsujpNUdNWJoASECWow7vI7eosBKGdRbXVNxXxJgafdubK6+NQJJ64uelPExW+qRjs22M2zgYxIWcIn+CLB1zXCvMWLkMrpJrBB29pZ5x6i85NXDPms+ujNM4LEsZzKpQf3kLed0bvgkXxD16wxbzWxxGpttE2OL8cySd2gBDdF+MzCqkKTBDdQgYKnl6qyY3onhXi1Z4/u/wB3mdG1y5PzJSpudirLn2cJ68p1qpJdvhU6ZJQQm3irTAPAlzxtBl56NaA21OeRgFyXt5TEdhgvlaJ24Mx9LNnZYI61fkxA8/kCzRj0ylR40xMcycNmCal7W4+GIBQfUfstP6jfEGwuEd3rR4E45oFqf9NMhGZuIkhgpQAdADyg8s6woxfdayEZ5GTFq4SDm1LAOuU0jM8rX44JHVnzYY+8/XvXXbs257EoH8CvlUsIiurtZKTzO3sVNiLcRmbEidIYOvehH4aHmjvY535+3/YV2bRgGEM0Pk6zodESPaSPedurb719fF/v3xR6u0MxsBJiKcdp+ym1I62dHI7dBgxR1DT3zGdOeos7wjvgJoNv/141k6mrDJYXUDJPRx/oJZYX/ApKPTTnyYdPRXJ3f8MeyNVQqHMGj6X2VJAvjl1Aop2ocEh/Qyn8QPibttRoGUunpfRK8GwjbChkJEkHi9HVskoFZvQh7hzK6X54RMuMhIsEiN/+GB0odVccT042FhxQMs1rwm5jUeHgExafBQmyGgIqYjlYGlFzY8jgTxFPjlMoWe/d0XE266/RSszFPPeQpqXMqfi3DpZluDHcPSbTW4IS7ry1zlKk+5z32e8/CBh8G5ieiWmsXQcMQ99UpDjxBcuTWiW5GEnDKwsshZlz7I+RMXGLgMj9cgZ7p6KdT7C7s+Oqib5iQ2xmYIz+zwauGSiRsHp1cW9zl5vLhPQHDbVCutBCQkkKKf1Ncuq5bT5b3DM5ec7PX1ueuGgJ3bZ99zig/s3Vx0VWs0lr76eCF1FdLQhJ7b5sTBVRf1DbdU7spqCUuCiZofJ2YeIjH1opAk1dSKdPtkGJ00jqZ3qcNqEm6dQpRW8qsFWEulX/aTSCEGICcSnogllHhzsmhd2E+e4FvatrFAcRQx/JFs2ET5jQP+y7gkkhhXsuY4xhiL3QS0X2kcwMEDMfQ8yKeDBCBA0EnOReVWXqV1unQX7ZYKCREqLFTBsrM6QlOGvjIR6+Lmbhv8usTjFQv0y6SPcRTRjQ/eKLQoR5YkiJOSpmIhCmMnUFsBaCEyNp9Yi4R2tXSS+qhhOKq696fRKcDj8xFBfQWFK+KaMbS9N50IISBdiclQ9REZObPHOqARblV0xACNGyR09uNievJAaMVVDihoYi+gUdifc8b0T3gY1Ru6XizTge4UXIpTnZgLNyylPJNxv8b31Smj8pWlhyKiSmnMy0pIjinRaE3Bj4py4tDGB8QUZUX6AxkRRxEpncMfouH305FET5Cf580d+5b2uNAOHLLP0EyitBNoMq4H5Z9tJB6a66eVMPxunJlJ9jYhd1w5uCXJ8rGKiPOT6Uhk5HvTcuGWGSV8ygbNysjnui3pFiXwmR6NeFMkeH4LJYaQT4mGe2dmnxgUyWV3RkS5t3N+NKlvegQOsC+0cPYDg3dhYAdhpuyDc4+4QGvxIC5PP16qjSsreid6u/nbzMZ7YWAWSMe8ZnPu7XvVW2n/2DP5xQAWwMEqqE8FLRrOWXlFwaxFLc4eEFsSPWlhqU+x/TTUMO6Y4SV5x9J8lLMWC7vwPkgDIDSww1i0zmUkz1mmirCj2MTbALnrlGgRRhjo5LEFWWpP+7MWe9wwTrjeL83BsSHoXMJE/WZ6kiHHcNV01zU+B65D4j3+ci9NuupNrY/ccb05Tpfbe21z4mi1h2uG/A7QGzc28mGeAy70R+sLY8kzYwhxIga0UEkWaUMvuYfSFmeuxGH8c6wEnbIPQGxKsed4457vdqE3tbmmFngw8bt0RArIwayqWgADTJakGQ9KMGdmE1IGIK8yszOA/51RwtKuYoihw0HkSWB0oqjdA9BcC8+EzqfjnAyCM8CA8C6tCESfNaW4zKsIQ1rOo1HrFxEWPQJaoxX5j5QQrJG8BVURRe9Rn695to+uH2qRnKqhQigelIiwyFyV5Sl7ikovy9qrZubF+fzGk6W9Ur05M2EwOtMZWBd7IcAXky/IGIhl9q2xK/8oTPTt/0T7LuAfXCDeieZJqBSHy48C25Qr1gykf0/xot7vlI9qk9GUZkUsFvvwtNJyTQI4moKalB7+2FTi1KwLJsMMD3583OIYZ+OwnJcSYBXxI4pSXGf0WMmtn1ldKrdIfTzlfIuwflz994Rwlu7bzx7PRDqRyH6QFNeUhVdXQsO/4mTCBSWhK7NuKG4CI8IQTcT4m27u9LEuMj+JAwoOjlh3pSRsSuqCYmIXjVgv09DUIBKZ27A/R/p0jQ9D54v7Ucw5FbJcTatsHFjp8IZGa645WkQXPiACs6xDFGhqskf6YvN/F2SQ2SjZxS6s2VG9MnRRPlKLEojY2cIj6jnE4rszducxosKP2DyVpGvGA29qVdRkGqPQx0UTakK1TBm3K1au2t/o02lX5PBK9arqNPAZ0Myq60JQH6waVpGRivTPi+rEtXH4dsPx8MD3FfMoquY6xMPzDmr4YAzmO6lDsRrW95UVhVb8ReTcR94XcHk83e1Q+p2heMa/kzG+UsGlun1YWxHmBle98ilW1Ygl2ldJ4KTi3QBMZjJequ+tjJOMhXnO8vwdkokVFo9a1WApepdF0ZnscVTJFBeY7vIHeY0jl+Ulzbq4zESWG5xJmjguTYEe4lHeqNQoUa6KrBR5byc0PrzK897Xvk1/RNyuPbw1YI3Q0keGok5npEuM0/GSONLdDOGCDEowc/U7mo+nOPgkWQOaWIGuZAeGSBC+cgaqlFDyQtBOySAkK2OEo6aSfeJC/4mi3Qg7a+2j5//dAwBOjjH/3KiOM93hwh8roAfZxMSyczl5wpGJz3gkPuEk/oM4/piD+ryLnIy8ynHEKQXdfbzhDmtS++OKO9Yguec0OaYdBWR2p3ipMj/wKL01rd+mvtvsCbNY9ctJr5y9+cFbd11MPzrSRsUWLhYex+dkserb7a2zhJvHpI3LV3R7UXjfElM1c+C2c1RfmtGlhBvqdro3qVceec+HBSvziAWwVx0f4zoEy+XJI+BQNqQPQL/O0YATWl2LQTrLOP2vm6qHfX9QU5qNlvgxlUvGS9rlLT6Tkv7EwaxET8/HUuo/LNm0DM/tMZVz9e1nZPwUgALw+x7kKHKDCGqDrUkJHij+BaOEV8hKGpXohlGSHaJkd4hiHhClfkKU9gVRhjdkpRGV9cBQjh+ohoDSbRsCpdcuBEq/fQiUQQcQKCNPIFAmXsCAU8WXkx8cn+c25E+6NZiEBd5ljb4D+LJoKSxxpd/exUIWY/jiZ7yD/oGfB0w6VgqviqjsOSMML0DqD25ZMd24n/A40ymujnrPsUwRfre8ft8t/20FlY1fN8pNCH4Ry7QKyEehz+RYjL4BuEF40itlOQGYdJEXTME3ACgZBgBIIQBlleF0kTP4zp3Qjx8mSoZpoglMdzqKgVyzxYQKJ2JSjkNihgLXR8uR8sNpnhEe+ZxEk+2P6GqHxED9qBMTqsdwLRmemWKG5rHz2eQYMq4wylDf0EbLBCZjZG5mLg+IUUVFIRMdGwA4jnMn5MUl5VVwnAxmb7+tZiTO5nWEXqqpbtHo0yNzGNAjgWKJfDyZH/njZRFm4E4ylc7G87vQAe4DU9r+qQINrG6QuPVmFeI5mWOmC9zYr3TBuwIAboKxcNvZ4Ppwag6G5qYyWmbWQj2OD3UUvj3MgZ2IJZ+WsIKSlRjGPB28JedBK2u15BkgRV0+7WfSqNjdZg1AwBi0B3RMzK0cAWtDgZqGdcTlKDRrVnY0NTC11XYZB4Ykhs0RuKu2i8QVY+Rf85UsmrCbUrqCf+574K57jrrtjpPz58TI/GPbshytWTRj2pghvdpri7E/mcsIqqry+w1ZEuStjtbphxjjltED7/sdyxoD8uq8GdQRmoWBi5tHiIQnfpZAdF6ROKtEqjJ5nkKZlWrnS7lfAA==", "fallback": "W32_0_81eb35", "platform_id": 3, "platform_dom": "Win32", "weight": "normal", "style": "normal"}, {"name": "W32_0_94f037", "family": "VisioraX", "url": "data:font/woff2;base64,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", "fallback": "W32_0_94f037", "platform_id": 3, "platform_dom": "Win32", "weight": "normal", "style": "normal"}, {"name": "W32_18_242efe", "family": "Candara", "url": "data:font/woff2;base64,d09GMgABAAAAABtQAAwAAAAAT0gAABr8AAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmAWi2AAhEIKvAisewE2AiQDgzgTw14LgV4ABCAFg3gHggQbCEY3ZF4L4tztAPR1+2cvMqi7Vb7ALm4RxSTM/v//k5KOIYNhA0T1/fW6gRSPyO5dlRohnMhRcW3lEqNw7Lm7ZMje4m6J5sM0DEefTQ7cm74NwaaBo41rgvKWB06YxtDnhSkXdfL1PhKSinrhr3bdU10Zk7g3+koS3ETu2kvoIJS7uCzJlDtv8HPObcmqNeKUHlJjlfTrn1Ol8BcsRp46lEugNzvKY0w0FfVtHoRs0gGFhmfRljAPyCZ/QKmCj7lgNk3DA87AcV5j7pHdv7O8vT3ofRolmFzUShWACupSAa6MLlV4/vvDPO//3U06cEJeORNsYDseomATrRVoKRUsWO7isQtDmu0RMWzb2IeIMtDuf38AkAOnm+g9P+C0D8AN0+s47iYlzQqAqbV2IT5JPL+InezuicpHhkiSzBAKjUimlC8VGpGhAP79vWqCsFNc1j2tfCDpAt07T2l9CgxxC81mi7bEYX4DenuevzyAaVaWr+1Vmz7TG1L4KAHlBTDiVQn/n57pykYdG2UkYBXAr0zzO5KrziCLZrroDKR/Q8fiD1BiZ954yWYbmb9Yzfi/pSJmzKk7rc/9OtObE0JubP7V3twJeXlhhBDC5vPhZT8zu1nIrbfOuUiJ3DUpspUOoHOQPpH3f05pUPnPctZJVhlPxoSlor91WL9WkPjwasA22B8aJP/PczC1cx7QJfwEnRCiAk0woCjzxPJgOpnwgHBGs/6nJlW5ys4s72AAC6BBqBEi/dF67T9SSu2w1LF0peuYAQygwcHBwZ2B+I9LZ8d2VxwSV1Dg3U9+W95PGLljr7BzYW+PwxnkUkVZhMIICzxv9zzJNycrtZMBWsC6vZknOzlJpdR8kP4sFhDLw/f3pu6dM3/8zQPeJrjEK1Lqm4spnUq1RGQDGPVQ1iyYAFiGsQvAxDC2+f06hIDKySkdWGshmXlbGSpWLOV4TtScJMpJSbqmu0RwhWqEEMZ8H/O4Y8wPALdQtB0D+LQ5ANsur6A7+UVg+5j/YtOmhmO1Yt+4vV2a1WPhPgAEANDD/g5ALMiuKH4Luv8CQcm/SpySq1Hzp5MMGpOetTYjvw6Ty+KxC2wQJzuYK4QnVKCwDReUFSFYpBBRQtM7tjgwkwAhwShI9DLQDBaGg+MRCSsi0yUUGU3BpK6GTdNxDDyTkLU2MdUhcck8Sv4G1JSQJqKLGSWbMpMzlpytMKzcyiipNtaYaE3rtjdLHMyNFibL5l2sElZrm43dtmNPu3hoz4PzEQUbIuMilBiQgKWbQbE5WoFRYqsW4WIwHiGgxNhyUrQgkxSKml5Di7J0jqFm1mzLiuzYeo6B27gTL2LmWwRWYdvuosAhdsID4AQX8RsLkaiKLddfwpCWcuk19adtuJbvChv7jzTIozJVt83vfTFWy9a62/62H+bpuDr3ul/vx/N6v779f84vAAbEQUTwIuQzSsFoOBOxJPtEcWgeI8QuJz7yEkEmKkkrqw+KRtVpRvoalnvTamYzt7fYpXm36rH67EHOusNbb8QfCyaFG01vYkACSqGyzeHrAlGiKqx6G3zXEjrSmmqzW3q7Y+xZB67jnvjNWXARXaVue5fXD8VT9dJ670dffQ0/0x8ITq9BlBblMB4vbLQWyZYdxa1u8+bdNwIzbO2OZid2Ey/t31DRJPsJwA0QAIBIBALoGq8TAGI9hWDkP/P/Jagkjc5gstgcLk9AkGAhQoUJFyGSIBQGRyBRaAwWhycQSWQKlUZnMFlsDpfHFwhFYolUJlfY2cMRSBQAQmgMFocnEElkCpVGZzBZbA6XxxeI/hhxsD0CObEVCHw/hQEmkiuUMlGnagHoBIxa5a4XfrxVAiDWXfdzB7/Pu4MmeYeETyU9hxaBy7v4cPBeLALoN0JgA8K9iHfHQxi0nsTEeaBalOOctBICpuB2uJ/8JqTdyeaI8vdzAeBVCMsoY/E8WBq6oQczISydUio5pdy2LU/nqs65yssZJd2u03Au7Eh3gWG7phpw6vGxYFJazJa6Hgi1TSHFQ2EoRNS+hRt0vkEFdXg9o+5Sz5ifcF3T5KYemjlmU5giNGxDsPm0RqrcRDBiD7y+Ys4+3tsI8K20d5kzbV2cK0X1RFB6wfzDHPPJ+HnRKA6BCmJlI8uliO5qhI8ASa7rpou6O4U+43qMZE7fwrElORJygeoDYmSL0mIX2RXGd04YlXxIPTpRdsHYt3ivEwZbUrfvOVyQByIaXZ+j2Gt6Ac/q1UXpywyWIJAypUgL+iPvCe1kXmpwlk3Wha532TODiCUY9aU8Gxi3gq4knrJFnJa4/9wF2qhvbyI9MsTckAQRdyMXApIlpqjjU4nt9bG2cJhR8nJ5Ylf9jiMr2hY3GKaKh8U4yUNWjRdNkfu4apXMrnZ9rk0FoodZnbAX9qVvvciT2K1hk6WHftV6gRxtkCwTjWoosk+MvVFsIK4dIb7XI5R1c30CwVjPvPku7yAFAGEd/yrFHu2bgdSfQAObq3Oy80ghDBRvlWDS2LX+b0b/giQU3Es3F3+L6U048mVqB5d0k2EGxYyied/11gb7hnq4gtSvh88j+6Yo2qq5mMcCi83Nlcc6wTIQ4mFWk1TRS8cy8ezXOPnuCda71rLYrazUIxPVMBY1pUoKNymKapEBGh0ia1gouvZqE0fiwRu3WHnIBdBSiTEX3qBlVudDK2qSX/YuLZ4X7wceVS+eyPUjatkUyrsh/rV8++MNNIjzIzcocaS0KLWBMusXnbOWaJpG2TAxFL4SyhWMVMJfosa0YqKpfMeCDNXiYSBXff11YxHThWWRZkN0MyopkeLrgXTtxw3hXOfqqnvqghbMESM51annX4+d7E50TXjONBdvCKf1rUpRuSle0NP1TEVRmrRSxnTpyzowWDXLbl4+EkkKhR0H4iT8u1ZDEkBIhvmg1LO2aOWUruwbPpLaz4TWlzkFfmi0iUcZeH5krjGN9fWgc2O6JZlK8RzahNMNzQtVx4vcgMNGtA82zLWjBZ0VpLawfpAd6MR0ktbiNfcYLSz18FB4aZM2ZOq/Kj+ZoTzHp8i5X0/PyYMw0LzVXxfDao4hjdmfGqUMTclgw4ECo7lEeDeU0w0qOeAwzkxL6pnIgVnM3wKdnJIqbNO9zGU+P6tcCLryVu29tNi091cVImNk0/UoO6Oe9rKE0MYp9fvcbPibTW1IErXWszvRE4HQfdQRLjCPmTAkr54uVYob9abedf/BrMwdhumbiMjQ/7QjfUoIFCskmwyc+H2oPB/GX5OLxhEVDQuBCkD1YGC+RJ09O82jEJigG9h7Zq9KvEaY34wpXq1WGnCbdyDZZ00/qaaCznA1j669QamGoZ2fLYJ4KAYQwr6uWIjPvTpRi5GUduq0Vm/+FGbsKZHZn/9OWOFsGFWEjrxiZCCeDArCo8Oxkpli7Vw4jlE7UWj9QFs7mQjmh500STduM1bHDKVnCFEMxNtev+xK38y2MbJAa265Ttr88EHVoEpR9d3UkC4XoeOkl3Zu11KkBv742BKsKU5FzMVIpkvFp0jy4bj6kj1j1fFcjMoqcuA0iHBKyBBw0SSlV69PEfEUMqGrTSSkYmhEYQhFwRhp7bL0jEUi5ul4SDeNDLdHkMbSmM1WwXRzcwrYZiy0958fqiZrgnlEKrfysBNTjo7LEjQejeWvkLFDBvM0SzMchdDu54GosPS+JURHApoIYTRGLNZQgJk2YofMGTxKXaNWx6PLudGIQN3aPmIRS7ohgtCF8TIMqRYAVBeiHpqSABOh88wJSYvme+9oNiqBqJ96PFSbflbP0+u6isUJfv8fU6jqx6cYQh0QEwVETnuhw3/BiEIpEvKEQrxYLDbB0r3M34GTPzeEYRiQ/6bV/tH9+PO9/bEcgJBTJZbRxEfm1lY6oqmNMJqdtNOx5/OiqBJrdaO/PvKU1UYR53ez2aL5f10lSLC52UAy5DNop77xq/E7h9crH64sC0+hLVmDZ0UqIT0rp75rpt9xyf1dnEjTSYcgMfn4tqQkGFUmmtQm437XaHKu/BfICAzpN87+7AQJjk9bSYZk8bZO/P6TyTZ6gTsjrWbAyGnhfFSGKdCWnJ06xQfoQUWoOfCCH85GkRAccc7BK0ZG5FY/Yl60jWbFy5nl84OtVAC2uEybhhBbH+VUlq5gPrrl8T6VfWbR1XiHRB5Y23Bi0spVnJ0nRvgmjvdfYzkrZP3Sjkdo8Y77qHrF1OzV+LduOyUe/bdCuWKWz9so4G7D0RmVJrnzZqNwMnm/qt4jGuUqVKzbwIwdvTBvbjWL2tbgixTRyr90Rw1A8tCZmos4dzPYD+mml7cbVbSerNfeaUEdyXDTLxI6i4g2b5uHJtlT3d3T3XtDMFuKrI+ti7Jr8RtscY2x+inVm0sLGIZxvXRkLhtyrtnhDzb4r2Q9yO84PvL4CLAZ7cP0+aBWV7JhO39sxLGRlS6OQQLBZjxzHeVZFjvZw3NCD6KH+7+kZHFfdfLXg7kjeBj8nXKp1+vO4mG9hlVCd2z+Nsnz7a5y4SxG1yO6Mg7iMxIJ9790ad2IV/YT3cnWWfpo7NiBqJAfLO5168bfj78cauMNt1dFzObeS+M/pAIKYpuT9rVSisZNieRmkvbNHvabAxK4U0U0J7KE5RBH0eilk8nxKVhYaAFP6lwxITJpt6xv7Wpd90XZl3ZxnCG3uA/il8ufyxbkBt5PPSSiO6oCCyQj5Gx9sET80OfnV64X3ZehatmGbSDDWA+b6w+5fhhFvzTUnxM7sK4tyLjA2wlrXx/0vE8mVzaVajLFu7TeS6evcNt4Dk8fWROSBDyNX27mSCu17dZdvbF+NOkYBtIVNqMxGzV2BZtO33uB9JmDfptxPAef59LZV8DI3C03YjzP3FL5/Wfv650ul1VaddD4CPsRsP7TfNGqwtCSy8mlBGzG+jB9PCXsQgfSEi0auVCvHcTSJ5sivwEHL+ve0Rmx0SFsG8ioMqc8xQXACh3utFl1ZzeprYqOqlFRZ3nAdTPCC+5dugOBNXDxr0Gj7QMDvN5RGVnee3Old6Xfg0y5j33XDLeVu2B+ZfMGB3pwSHePF4f7C5oYdegMFiuwBHifiPoQFS0OqbPp99URi7ccIupp7rHuDe/XGXH0mPUV6F3arhOGhUHt/N7a8D0ExRtPaqPu8lmcbTjcCa2tt6vA3cB+51bjTz85eAcH2+lvvGMRotUdurzZUK/Fd5L0Fb3K3QktHlFx8rLw5MHWDHPghbHFi37MRj2FZ0/ss3USjJTgsW7K33tV3VJzeMO1x0F95himsc/+JcwCUkhnnxZBgonDhlcs1uCr3yH2X092p9/OPh8RXrF/9QeDbbi0eqOue2JUmzt1nThGIqF3c3D9cqrfOE90f63tTzD2s5Gj6RdoOnV/NqvnjYt+JfQbUCeKtHnWX8Y118qp2VWiO8q8qlF2X9jx/mWX/zEV78z9SIkT3y1Stq65Q6DyeLFyqnSTt+TZv4TDjBt39pSVv+MTqjoAXB43OwD42qJXMjH9YSdg5uApx//pSwOnnSXJ/hBCp8ft850SHXAqNzetmNOoJA1a04f0J+W130dLHlV5mMYmuKM2fJz3hvvgQf8kBwIpNBbt+fOWO3mxnUeL6oNqovv9WhxhB2nZbjONOlCeBlKgNnDRi/v9Njo2uOO2YdyExdP07/31s7P/w/IEDY8RbHZGCetI4JOBlJ7blBcFFwYQqAZRk5RVZQMHF98ZPhYnRwjkBVoC5EnbglCJqb9HQ1hVKGU4OawHAciufPU9HsVE7qVgQUH6c445WcdtEagCUzUKhmJgOsHLsHLDgDFS4bM56vQ+J/+O3q7THbq+InGrAqRqYfQa9rEMGDGOtPZG1AnRKsPO5Cw04X5o6kfup8LP/JqNHPSp6gv6htyIfILJiS6wrcC6DXrQBJ85ci4IKpQiKq5IyjgRXV4qDP7pX1RWVNVUO3bf8ffVInrYyuGCc1fi193M1wtQ9RyMZt+CAwoJzDtitNLwXsuENlKHma5d+ghneBnGhdutQlsTmx4ShJTtuQNx5MSZS0FrUXIxkZRqZl4q3DRHJQejsHSxuvf/Xt3+tg7btUUEqnjugMKhfRJJ6aKJ1dKujdSRwjdd6/Rc1Ic7w8usEfqbTLD0kZrmton1MmyNYhhs2OrHg3dfwMAwMAwGg8W6gMFgw+zHjz+1aWqkXurwkEe6IPlAFHpfwKVIGOZoSx/vdXU+fXPu7fOFn3sxmEvh5SULhsIF8mL7rA8uuZzLj3gVzRVXXHE90e67EIkmWkQ00ToXERW3Ek+85wUxMTGxN4Nu87nlllvuun9ece+4olISYvL1uI4IVMWCHVBILI9WGkQt2NntedyH98jN47r5OI/3KwKnhK+8JBMoLC1M/X1ah4gIVPG1gSZRlWmcTIx5ssZwx9PCnx4EFskISx+n7nmu5/liegOKgBRW87KBOLRGIgjdO9KZ9HleqDnPNwS+6ZrRc2qzaRrnDC8TJwSTmaevH881CbfN92WIoKp9Yv1q0KihA2HhyjHXetuIDy4K3XfvRAfqSJ6QnuFcCiKMiMVEYmrGDJuwzVHJviztutdf39d1cRWBDvCNKgmQhWzkGHzTxeQ75DwEaQVIapU0dW/z2/t088477/FdfRSBKkhUMBQD87yMAB8uwdc5DofDh3/IH9FPHOAgWNrYHMHNh9wmwVTSV6ndmkS/YoIgCIIgCIIgCIIgiPZUS5jaBarAVCFgNW5SQRmVpuVO8DopZVh5cheyXClpDTY9aD7pFJKx7wCOnDhzKXAYgkaQYpCYKjJTlmgyRyXHqIClmCr3vZ77dWlSp06dOnXq1GnU3KBpXqgKBSoYioHphCDDnecPNKe5Dy9o0pzmP4rWK++2Png7kw6d6Wjx/qYIdshA0sN0kQrRUKVpqZYKJ3hc/0DqadRHO+XxB0uOEJwr5tMpHTrTOck0t7UPVA/1jx99+vSjhQVB83kFfB66BpFHtLDP2hpayGcQQgghhBBCCAXVOUIIIdTLGowxA7u/LOxLwyEbzRGjGS1uxIgRI0aNd3LGgrG7xnedYDWY1IyGHZn27kZHlQwnV+DCmlbMmk0PET6RCZLaEweOnYgzlwKHIVjUSzGRmJogS5A56hyzGbttvFB3xk+bzDKT73QOhXK9AvQ8Z2tmM2u+oV851cWC1cikTuhA5apckLNizaYHhyCrPXPgeKYDOfKQgWMHSOTI/bcXI/erF8m5GPms1E6OEirvKwl1ikO8BJ0uUS2DNN3MMpwQcrk/mvI4n5sy7CwRFAqFQo060TWO27p+roOCCoZiYApWFgNBPkW/XsZ/4lCGhJu6AKmXWhBdmJ5D+eRUjaz/AjahmaNrgn63AmbJsdezH0WACkbVGrX+28c6wEGk4jR9zaqybZ3oXMkn17E+4YVkhkRzVDLNwlSVdp4Dz99LaNewr8x5CxcRfe12fdsB0mFko6qxIUneG1GPcCKoH9CPxZ/c7GfqV2S7c+J8726f4Be9fTN0FfC7f+jvT9FTo+9i015c2NWSXJG1RhvuaQz3hA6lo9Y5rgsMbCvMNHLMWGOJmAIJ21x7Mq5/Evq3VBpV7uqRavqq3Y6+b+vPq13/r6SK5w4dkUhIFy3tutbokevj5WQCaq/57srWW1HiyGSF+GS5ODghT9xkzvMxQj5R8q3uIlYAne55XyOfrnnp9B5w5MW5Txe+Xfl3+y3GyA+q9N2KbkVykTMsJYN9jngnduTRuY+TMKw/AAByjPEXyPuS4ACLwCoA45oLACDiKA2OL7JACe8PAcajJRAiEjJKquPwKA8OYWolsHMyDyEOWHXH5xychfn19fN7XgDn93rxUCm3ovnaHIEYCMRYW3+szQ7oZrueejvVsk6XTB8PkxN/A7BoAliwYPFdro9DAtEyqmubPkbmY9zuAQL6ZtOqo9bDzHodW89+5wV71qwf5AQBU9N0W9MRKJp2oB1omqZpOs1xZdKsAMaRcWQYhmEYhmWzG7twO6c9LziN3evFg1yvAEu6a4zbkgsat0g35z0vOI/b68VDjdyWksP2aNcmb/AiIEVL4/P2hknckxh3WXsSkklW62WSFXApWTQkJShBCR7lnRMCpsRksqWP1Zk0t6X0pd1JP3fTpTPpigtK8wvSSCddTHrTuCv9rElzJj1BNb7bUrYRjyJQRYYqBOxQgaSFdJEKyDA0ZZ3XdQjJCMkIJxMJVWSeyZYsIyMjm0wktCB8WjRBk/s1V8zNi/a8mMh1+V4vJv91hHcqySdXzB9/FuuCoBNasecV0RTEFMX7PIWKYl+8aRRTHM0ZXg4VVCSbzt5SVORTVI5ESUlJQklCSUlJSUlJWfU8airnKmPSI1pQXRN6Tp1JoZrqAlq4Be8TqPHV0r2u78cUtA5JEgXpoqX7dDofuy8eauS25GcNP17CC/z2PWzjl4O4PtJe4NdTP0LBi4pj5LXiO/VZbodgrthOaOVI5lfQOWz48LLwo0zdxfudAAAAAAAAAAAAAAAAAAAAAAAAAvUrAAAAAAAAAAAAqmy7/0/sorwBRUBKpYZuIA0RAfpZvmxneyi74PANFw+/adzuBibXLkAP2D5Q00zb7u3f7Ga3mB27il5mt8/vW8EpZrcSitktYvcg4yAkJeMsfZy6/aa0z5n9xUUFQzEwnRBkODm54FhxkMJnc9TOZooO66bDy9euOThkSBYyvO1TEARBEARBEARBEPKjeYsUgtoLAAAAAAAAgKAyAAB5XlJLnw+TJEmSJEkpqgHN9JQ3eoFeC1lCkiRpRvn6v4AkSeq1TGvXHMqZHWPy36C8nDuGjS3YtubtwxQlWkyJS8gaX6nNlh1YdGS++ebH/FnSjw5/99rlbqT/Ohmfz+fz+Xw+n8//EwRgUQ0GAAC5eWO5qBXEgPoYZ/SJSN4+tfuMLqfx6SqeVWFaLgoaqDemMfQx3aI+EW1Zn4q0P1h3IXj3vK9eYa7fLxhq/cft39/983x8iQrOP+XL27Ldxn4t/+8xn28RYa6/+tij1SV67PzZ/z/5EaH+mAsHzvzxAwo16q1Ab730lmOAWj20qr827rdHKPotUqk4qUF6a5Tj+ei6ENR5P/1nafycy0jb0NjIgCf9Let72FB9tHBh1aqTZqD+BuitJ5f86usAke7OWo+0+6v3zVoM0P9ca0w0tkHeNkBuTs2p81+PgU9d/3aNWnMsmnbFQ8889sRTv81YU0UFD3/ZDwA=", "fallback": "W32_18_242efe", "platform_id": 3, "platform_dom": "Win32", "weight": "normal", "style": "normal"}, {"name": "W32_1_530409", "family": "Lucida Sans", "url": "data:font/woff2;base64,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", "fallback": "W32_1_530409", "platform_id": 3, "platform_dom": "Win32", "weight": "normal", "style": "normal"}, {"name": "W32_1_55dc9c", "family": "Visage", "url": "data:font/woff2;base64,d09GMgABAAAAABJUAAoAAAAAKkgAABIFAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmAAglIKxBCxXgE2AiQDgnwLgUAABCAFhDYHgWcboh+jomzUSiKqMxcBf3GQDZnHhg2hI9y0kc9O4uVt1HXNhX5vceJh9w8BAtflCBlye/7Jzfo43zA+JsfE0iARAziDpQ0GBdRRsEIEKxi5kARTMQ7rkPyNuCGWrXrPtOJdTK2Y9FvSzfZqtro9reiL/7ulCQT6c5Uk3Ldq5zZXoYZq1d6MB4TbjJuRIwgubVKLVb7jEETsUhp4AANYmgY0oAFrv4L/k179e5vjTLLgN1qhgrvgQOR2muTK5K6Eqw+5koIP4z3+FugGrlW96VSAet3rvf9/c6WdFJCPbIW6k32+wlfI5P9N5jLZ2eVCjjDZw80ecJMCgGN8flNAEgp9X21dlajSlZaEFlVZTTi1psnmL5jaEF021l8jAwjjoD4AgMVvBatBKChtDWUAEIz6l8BeYEE+HIAQP3MYBCEPErxK+UQmA6zEwsrQT55XCxhhgeDkHCA4jDwGt34yHGs5UoK56WYYPBS65+BgqwutdARbOTEBgMSRZeLWxJzx/9LLf2ZPUAZKEVPKmVLYlKc4P/sSp8sVyiSKViWnpKalZ2RmZTPqnBma3DytTp9fUMgWFRuMJaVl5RWVJvPMKou1uqa2rr7BZqemZ2RmZefA7RecDG79nPq8qeMywoaZPHR0J5Q6rudAyePOf1eWnxMKyEP/09FiSljytpbz378PSACM/yBvJmCG3hxHZ9nYagAtXC9pwqIPW5v0ABBkAFkKW54wraAuqhyiSvWxcE3dJZHOurWMtFIZmDIMIt8tqtgrW9lpSUwoizLOm6lMOugKfvr7EaDqlKEbiOiyy9A6vlupsBk1k6DJXiKfo6LbLDzwSDcF0TFTmDF7umHajrjLMbUPQMDO43xuqh0FTTYSCbHhDFgdumH9iEQBLejEyEVbmGIFtGu4/WyPgPmECHq65iaItyj4K50CSYzXRCQaDw4aKX696Rrjp9FggnZB3VeTg6E3bP2pL3/TiBVmxinLIhJtx/jAkbl/0MdmWJ9GjP8I5rALPML+axw5a1kTcSsZjg0jlbUS5FOXp4uKiAslVho5ScFCGGUozmo3Hl8qHSQFVfDhPOYPxUHcUSMm3tVjPL55x4WD2P3qOrTzbAO0PykYZ14q9+z4YTBTYUsUq9D2quHSyiw9xUo/3EK/mr9zdYURhbvufRRdTryZg90PVIwq6KyOEKhQUS4zmqASV1UI/D+u1za1TZPgjxzXj+lSduCVs1FwJAhaOSTa0Y8spFiRqJ6QWuLCdAD9pwBrxCO2JjwduQv0qW+iXMwvOV9lF5oQzlziwwCBElW/XmOCKjx/9SZXosZ/o1vIbYaxrvJ/ib4CF5Xq0+kp6mpDRubuG8hLWEC9PTzPY1AZZABFTHw2Oz0uWpb8QtVXQIwJqVYsL8DFZAQFchVvflONLSBnnuLZfToXoYfAiJDvqxvbvi7Clir4KN0E1cP/NqGYy9DvPLsPwO7xN6SCyAvox1r8ZLeQ85kkQHfMvcOFkq+k8/muC+NjDBvGgF0zEmQC0lTCFjFIIC8f96N1tyB2m+MhfWIBtN/brEe4owSC7Hl4WRvz+YRh3TfkT+UG4bGwGeHbnkxg7nOW6IsrY+GLStlQEOKmz9S3ijmZPFENYP3F8QU6WHyu43kctpDYSNBQ+uOEg1M0oELrz0EA6slKLGABHDQaPWFnp16OgcYa1kY9dPR4gimgG6eV89s/RJ4/FoEAjoVUkoZSYxzTsunj421PMujfVs4m5Ho5ZEsN8jQST5lk8727itSEkn/K6uRGL7WHjvDp7yHa3nppxP/EHLIuHAuyFH2kd7/c8iEVggdpo3kXjl8DHywxSBpMEf4K1pWRPXDEOs6V02OnYKHwHzY22Z/GDWKLl2StTkfqpkusSGKMnWB5+IEQslT+0nRaeuLMS4N0PFVlkDty9NQzMUMcEkfdy0feHzlJwUpOuarIp4C+YL7xFG8QRgFLVUTvJXqjdkymEoFFJcYww2RCclkNuWt3eA+q6F3vI3rPV2ndssKsIJpn8sYdbEiuzIBf6HXfXVb8zNwyrS/DHpchWfQOFNY4YjMmTVAjgJNtvlOpDgLILFtfFO7npAwEhRigd8aspR5E0nA+gNjUwMEKBPBYpUXbz94d5QQmC5ONu0Qi5EJ9IAb0S4CnG0D8Bo7leTjLoQyPon7VSlMFSEybfDk5Gn2xVQlLuSRQhegkOkwCWLovnGEPszg8ufcFsGZ805YCKghcvR08nXltGOPhjyW5MG/f9XyzohBObKXqKruR8xVGUPpInTEqppaWrcvOHmEMg+EXW0u82+FZGbHoN4cKIQRO0wjSwxlFdCzxa7pEX/P8qCidMZm8oDnn1lDkc/s88FVALEVA30jSxHaJ4C1RdOsv4wGUD/xHShmhpiRq2ueSoAUy70GES8RSx62Qr4DNc+w4+2nJswXVOUgmM14ub2lBIkBVuAx+BNmzawGwG4sjGYoZQY8URwT6lACJoi/lhlXpttd5KbRE0BIbZYCaw11X8C/prv1K/ijCZX5CYtumbZvaYQCSsNpoF68up80vuZIY0vRif2B3AW1z0Zr5vkmuKf0v7g78tBRo5x+LoMs3DBT3dhLdOr7QvTxNYXHT91dDdfXf/1twrub4UovyA3kPQF20Go8w/JSTJnqHRRZ+iethQXFd0HitlVOtN4Oo2cbUnYsv+NmPRmZtSyY+bhz1pR68On/XKuEQIhAb1nrmQiDHpL2ECKR/rBkVY57ssvgMYl10XAapI6Qzis3EJ3a+5ZTS4qbo4u5JpaT/KFASLJLZdB/OchcdW4fjMVdxw7CDv4YI1EI1aTyIQIflbAa06OgGlavwQd2Fpp96v9hzKiv93TY+cZ8E3h++PwyTDBAOQOYTAIO9RXXvl3EBRJTFyiU22oBpDncBKo0eQATq+37mBeGmf517d5lQ04cINKA4s9D122PjRZF4sw9g9+gB+gzn/O325Kq2sX0gIA22PgkRI0nzlHxq2vmzBtLBUQp1v3OzMyO2OplTFJw4ziiq3CpGIp7FqUDidT3ZGtdr18j7PTpyHp/ID11ccfctvPAdWnvjPr3Y7lKCmZ9bdJcB9bEL9SHC0T4GPno4erkW6JI3ziICGSNgy4yynCA8JjvFSCY4sw2gKlguthdcy63hVOZR/CEJZhJeIDqtgWjG9tloV2Eg40kPGrC5aCgnH1qU4P926cIknSBWKm1h7v1ErvBNZ8AdshcRgMzYsw6Kwxs/mC0MLoLzhk0n864tcakYWa6fSE5lL9lX4vqERITEJAQCAx63i2b6dOwmVeuBFdPQfkDMWJ6uUmleNVEseWCR0vI4ZC7deXyndhwESjVXK3Tc54eEMIiVja+734xI5LG7a3fdRtr8E8jcSHAtN/5VgN3KhxSs13Cm3vmOle3W0cvRr44iSCLC6FWXa6/S86t92L5QJdkHc458dCTsgc1FD8f4Rnwj6VfxW+5vcGU8O63hUr3KAHZdVQmiwnUDCe/bQRDiqTTrrp2RDU5zHxGLcZk/UmJRlIkYcrUbGMPKd207pPxzDP83Noc6USDgnga0U9TuQOZgy08MI4gcANi16UMVShAhtAzQ39xKPOg4s1IkrwJ8RrmLBG/PweB4M7/FuIOj4mEqaUr7vw94T6ONVirjE2gY+mGkoZB9b/YXz5W7r3Pa4bI9xRc0cPCMziT0IgL1SPc9NnX41D/8dHqNbS1U7o0o5FdflPGP6Zbp6D/B27EEGRz17Q4Sjc7zKzOWrUcEGvJSlsCTCb2dkgi/AXSiX9+u+mBKt3UzIhDZmnO7+qsDOHnVkLkwjUQE2hxx9Z0npkAsKoZ2EGiSqFAktgINwSICyUDPZHvTbACJN0mtcwY3r0+u8T9wcJRZ0LXiXhVIwFUcl07WPHv9Ryty2FnNWo9Ihpj520pdX2iFiXJQqy9HuA01QC0M3Yj4JmYsdcmmIn6ERCSqoxyhPvzjonD9jTJqYf+fcPs6r84iTNPTaE7gGY8sj7RYPeSkteAIhI5RLwCU0GrtxqpGpMHTF/YtSvC/9iHTX9u0LX6wjuLpnN6tf2bc3Wn+9lVBmdAr0rBj0uMjEyOSEZ/W4bYOjqqrUfHvMkpdsk15aOxPfOwZNUdS8LjVYRis9I42Ol5I4i8w8LCGzABM16FF/oRPvRl+WXcHWLS6eBlzcVn63BKXKjnyl6o/0yDX9d7XWZ5It7AJuE2us+6biXsajiGJvk32yiCEKOFGgAhGccWnQsc1dYj/in8u4UOG5mOmpg+2kOtUY7Kgy5FVevbNQuZ3WfMrE11vuJVPXhOefnj91LwORCLrNbDzpSRETQGRMyN6JhkhgAqGZKAA3rTwtLVGxQvguwzAbkW4L9uN434sXl4jSfWpEYaTp3UJzE9TDEUDRRT9e4GSHJPJwdNNV0233Ts4ajAUksK1EG8o8o0hXPfJBC017uzYK/gYgrCO29jFhOevsGZn+itB5BXYiBewlhk9j+a9tlDKX2tc5soiWuNiME33BZleIBrx/XrNldhUsH7o92XmhSiK7II5Me6JNA9UlCqKA6FvoLZ64+zyqYEpRpCQrS61qR6T2EWj1OidIC13cBTJngxks2K7Wz3qSnDArp9y6tsxBlgdMT1Dicjr2MPeOJZpA6vrAEBV1HMF9q340xoV393P27nosBhsv8yUeGXxIQZGYIxGdL9OtPs2HEckatkS7xQKH9RsKvksYlPEbgbg7osgWvFZI9z+ar72L+xj1HTbJTUdQAQoi5dBWcC1SmcsQ+KEAF7S2xgNa9TV5+x1ulqy936hCQJi+6U6TkdR4a75aUTfvtotgrlj93tEgGfqApKZzbJ1s7Lka5G9lmy32JXcTom/Jncx+2sHfQJQMIA88yVlSXHffdYbhutg72u8i5Od/vZNUcCzKQ/vw1tH2c4lefWzE7sJ1yY24IKFx87A3ts1FZ0FWbCsTN0TaWuEo3AcknpwiM84wFqXvlkV/fcXFn4xQW+qXvRfdRW8pj66vYbt0bw6accY1GB1/+UCBl5OhhbYV0zWwVGOvlQYZ2LGY8edWnqOJ6s7Y5Nre+/pLE8kuh4BlrqsDmMByZOpMWz/onQVd7R8D83U1/ypu3iJkLQxw9v9geMWewFQ5vqdqIInQ/biwYjTucBcD2AXtRhjoOixDhdNMFi8ChQH6niqfO50LgJeYFhckYQTzR3/NCSVHm8djRqsXnK1/nraExBEgacudCkz6ZtitkvlDMpPKAcOHgVyV7ywBw2vi7ULxQweR2Off5/vQ2PRa7iDL7sOjOYeuTK1d0+ALzhm8vjXKQJ+aLZPxUCeugaT5W2NjHXf7P7/JNE3LYhAg9vZQyKnePTbdfsmAgVdu9DSs138Z3Cb3l9Ym3EEhFvUgzsyDG0S/zn4edQR3tyW76fF/zigvLycu/Whb1ZMHu5r4QOBL84dmitiI0wLh34Q9GrBH6/gv+sfF2NvOsX6hzjFwTH13RXaA+C6P9szs0H2/x/CgkntAIAwHnwV0frPq4Ch4gEc0YZm/1PXWWwG2bmOfZ+CYkBpqG9ZwfvWePlBYiNF47zSjxQieSK5J4fzf//uMd775vrYehnYRxrQDpqNb5H8qNvy6WurXMVD+4v+H8n/pTc2vnl+DffrT23kv43ttIuyYXXO6oB+9fT7lGmMyHQni9BLhlAyFAOwCf4UiP3HM09C45QQFzIFk4lcHtKlhLpLT5lE+DbCLJYoh+JiWJ6ytqVYhD/A0+VHYwpRuZniKPxK3IG5kBSqyk2rlh45/T+9j39XufzBL3aca3N87ZKVnpkZafa1cJY6RwDP/hIYciqyfGpYyflm4hBC6c1zU7Ux3Tkbqd4nl8anuec2L25Lb87OzswDteZbiDOfTL0KFbzmarGYy/9jp7GrV8Uqk0atbCUY5YqyVmgw2vAWs4RWI0u6vO12mXLUWGZN02ZqNA5Z4LWoVI1cOC1hoWGwDO+zcpaSWcCPeaWSnYbacqy1sdVFHsYjoMdLoy4/8jUnUO9xggIb00mhVfK4/K8BFMMJ0pWXCwFauAiRokSLEStOPAmpqaZJIJNoOjkFpSQUmkqyFKnSpMuQKUs2hlqOGTRy5dHS0ctXoBCrSDEDoxKlypSrUMnEbKYqFlbVatSqU6+BjV2jWZo4/NtsTnPMLS9a8ZP/AQAA", "fallback": "W32_1_55dc9c", "platform_id": 3, "platform_dom": "Win32", "weight": "bold", "style": "normal"}, {"name": "W32_1_6e9c33", "family": "Franklin Gothic Medium", "url": "data:font/woff2;base64,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", "fallback": "W32_1_6e9c33", "platform_id": 3, "platform_dom": "Win32", "weight": "normal", "style": "normal"}, {"name": "W32_1_7bd89d", "family": "Viretta", "url": "data:font/woff2;base64,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", "fallback": "W32_1_7bd89d", "platform_id": 3, "platform_dom": "Win32", "weight": "normal", "style": "normal"}, {"name": "W32_1_e2681a", "family": "NeoMono", "url": "data:font/woff2;base64,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", "fallback": "W32_1_e2681a", "platform_id": 3, "platform_dom": "Win32", "weight": "normal", "style": "normal"}, {"name": "W32_1_ec9852", "family": "QuantumSans", "url": "data:font/woff2;base64,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", "fallback": "W32_1_ec9852", "platform_id": 3, "platform_dom": "Win32", "weight": "normal", "style": "normal"}, {"name": "W32_2_6f2e8b", "family": "PrimeSans", "url": "data:font/woff2;base64,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", "fallback": "W32_2_6f2e8b", "platform_id": 3, "platform_dom": "Win32", "weight": "normal", "style": "normal"}, {"name": "W32_2_7dc3f7", "family": "GravitaPro", "url": "data:font/woff2;base64,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", "fallback": "W32_2_7dc3f7", "platform_id": 3, "platform_dom": "Win32", "weight": "normal", "style": "normal"}, {"name": "W32_56_6e9c33", "family": "ZenithMono", "url": "data:font/woff2;base64,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", "fallback": "W32_56_6e9c33", "platform_id": 3, "platform_dom": "Win32", "weight": "bold", "style": "normal"}, {"name": "alt5_6f2e8b73", "family": "VisioraX", "url": "data:font/woff2;base64,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", "fallback": "alt5_6f2e8b73", "platform_id": 3, "platform_dom": "Win32", "weight": "normal", "style": "normal"}];
;
function FontPatchModule(window) {
  const C = window.CanvasPatchContext;
  if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — registration is not allowed');
  // === Fonts module local guard (window & worker) ===
  if (!Array.isArray(window.fontPatchConfigs))
    throw new Error('[FontPatch] fontPatchConfigs must be an array (from Python)');


  // expose awaitFontsReady in window and in the Worker env
  (function exposeFontsReady(){
    if (typeof document === 'object' && document && document.fonts) {
      window.awaitFontsReady = document.fonts.ready;
    } else if (typeof window.fonts !== 'undefined' && window.fonts && window.fonts.ready) {
      window.awaitFontsReady = window.fonts.ready;
    } else {
      window.awaitFontsReady = Promise.resolve();
    }
    // Единая «внешне резолвимая» точка; не плодим разные промисы по ходу
    if (!window.awaitFontsReady || typeof window.awaitFontsReady.then !== 'function' || !window.awaitFontsReady.__owned_by_fontpatch) {
      let resolveFn;
      const p = new Promise(res => (resolveFn = res));
      p.resolve = resolveFn;
      Object.defineProperty(p, '__owned_by_fontpatch', { value: true });
      window.awaitFontsReady = p;
    }
  })();

  // Patch API FontFaceSet (Safe in window and in Worker if FontFaceSet avaiable)
  (function patchFontFaceSetAPI(){
    if (typeof window.FontFaceSet !== 'function') return;
    const proto = window.FontFaceSet.prototype;
    if (proto.__FONTFACESET_PATCHED) return;
    Object.defineProperty(proto, '__FONTFACESET_PATCHED', { value: true });
    ['load','check','forEach'].forEach(name => {
      const desc = Object.getOwnPropertyDescriptor(proto, name);
      if (!desc || typeof desc.value !== 'function') return;
    });
    const readyDesc = Object.getOwnPropertyDescriptor(proto, 'ready');
    if (readyDesc && typeof readyDesc.get === 'function') {
      Object.defineProperty(proto, 'ready', {
        get() { try { return readyDesc.get.call(this); } catch { return Promise.resolve(this); } },
        configurable: true
      });
    }
  })();

  const domPlat = window.__NAV_PLATFORM__;
  if (!domPlat) throw new Error('[FontPatch] __NAV_PLATFORM__ is missing (run NavTotalSetPatchModule first)');

  const fonts = window.fontPatchConfigs.filter(f => f.platform_dom === domPlat);
  if (!fonts.length) {
    console.warn('[FontPatch] filtered fonts = 0 for', domPlat);
  } else {
    console.log('[FontPatch] filtered fonts =', fonts.length, 'for', domPlat);
  }




  // --- DOM override for quick macOS check (optional, debugging) ---
  (function () {
    // в worker’е документа нет — выходим
    if (typeof document === 'undefined') return;

    const domPlat = window.__NAV_PLATFORM__;
    if (!domPlat) throw new Error('[FontPatch] __NAV_PLATFORM__ is missing (ensure NavTotalSetPatchModule runs first)');

    // строго только под macOS и только если есть что применять
    function run() {
      if (domPlat !== 'MacIntel') return;

      const fonts = (window.fontPatchConfigs || []).filter(f => f.platform_dom === domPlat);
      if (!fonts.length) {
        console.warn('[FontPatch] filtered fonts = 0 for', domPlat);
        return;
      }

      const testFam = (fonts[0].cssFamily || fonts[0].family);
      if (!testFam) return;

      // idempotent: не плодим несколько <style id="force-font-override">
      let el = document.getElementById('force-font-override');
      if (!el) {
        el = document.createElement('style');
        el.id = 'force-font-override';
        // вставляем в head, если он уже есть; иначе — в documentElement/body
        const parent =
          document.head ||
          document.documentElement ||
          document.body;
        if (!parent) {
          // если DOM ещё не готов (редкий случай), оставим через RAF следующему тику
          requestAnimationFrame(run);
          return;
        }
        parent.appendChild(el);
      }

      el.textContent = `
        :root, body, * {
          font-family: '${testFam}', Helvetica, Arial, sans-serif !important;
          font-synthesis: none !important;
        }`;
      console.log('[FontPatch] DOM override style applied for', domPlat, '→', testFam);
    }

    // дождаться готовности DOM, чтобы не ловить appendChild на null
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      run();
    }
})();


  // ===  window branch (DOM exist here) ====
  if (typeof document === 'object' && document) {
    // load and register in document.fonts
    Promise.allSettled(fonts.map(f => {
      const fam = (f.cssFamily || f.family);
      const ff  = new FontFace(fam, `url("${f.url}") format("woff2")`, {
        weight: f.weight || 'normal',
        style:  f.style  || 'normal',
        display: 'swap'
      });
      return ff.load().then(loaded => { document.fonts.add(loaded); return fam; });
    })).then(results => {
      const loaded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      // Дожидаемся document.fonts.ready + двойной RAF, затем единый resolve()
      Promise.resolve()
        .then(() => (document && document.fonts && document.fonts.ready) || Promise.resolve())
        .then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
        .finally(() => {
          window.__FONTS_READY__ = true;
          if (typeof window.awaitFontsReady?.resolve === 'function') {
            window.awaitFontsReady.resolve();
          }
          window.dispatchEvent && window.dispatchEvent(new Event('fontsready'));
        });
      console.log(`[FontPatch] window: ${loaded} loaded, ${failed} failed`);
    });

      // CSS @font-face →Only in the window
  (function injectCss(){
    let css = '';
    for (const f of fonts) {
      const fam = (f.cssFamily || f.family);
      css += `@font-face{font-family:'${fam}';src:url('${f.url}') format('woff2');font-weight:${f.weight||'normal'};font-style:${f.style||'normal'};font-display:swap;}`;
    }
    const tagId = 'font-patch-styles';
    const apply = () => {
      let styleEl = document.getElementById(tagId) || document.createElement('style');
      styleEl.id = tagId;
      (document.head || document.documentElement || document.body).appendChild(styleEl);
      styleEl.textContent = css;
    };

    // НОВОЕ: не ждём строго DOMContentLoaded — пробуем как только появляется контейнер
    if (document.readyState === 'loading') {
      const tryApply = () => {
        if (document.head || document.documentElement || document.body) apply();
        else requestAnimationFrame(tryApply);
      };
      tryApply();
    } else {
      apply();
    }
  })();
}


// font -guard
(() => {
  'use strict';

  // Глобал рантайма
  const G = (typeof globalThis !== "undefined" ? globalThis : self);

  // === Tunables (локальные, регулируем «на месте», без глобальных флагов) ===
  // окно тика (мс)
  let FFS_TICK_MS   = 16;
  // лимит вызовов на тик в штатном режиме
  let FFS_LIM_RUN   = 40;   // было 8 → слишком мало, даёт «6 fonts»
  // «разгон» на старте: даём детектору сделать больше вызовов
  let FFS_BOOT_MS   = 180;  // длительность разгона (мс)
  let FFS_LIM_BOOT  = 96;   // лимит на тик в период разгона

  // FontFaceSet в текущем окружении (window/worker)
  const FFS = (G.document && G.document.fonts) || G.fonts || null;
  if (!FFS) {
    throw new Error("[FontModule] FontFaceSet API not available in this environment");
  }
  if (FFS.__FONT_GUARD__) return;
  Object.defineProperty(FFS, '__FONT_GUARD__', { value: true, configurable: false });

  const origCheck = FFS.check.bind(FFS);
  const origLoad  = FFS.load.bind(FFS);

  const now = (G.performance && typeof G.performance.now === 'function')
    ? () => G.performance.now.call(G.performance)
    : () => Date.now();

  // --- троттлер ---
  const T0 = now();
  let calls = 0;
  let ts    = 0;
  const throttled = () => {
    const t = now();
    const TMS = FFS_TICK_MS | 0;              // окно тика
    if (t - ts > TMS) { calls = 0; ts = t; }
    const inBoot = (t - T0) < FFS_BOOT_MS;    // первые ~180 мс
    const LIM = inBoot ? FFS_LIM_BOOT : FFS_LIM_RUN;
    // строгий лимит (fix off-by-one)
    return (calls++ >= LIM);
  };

  // inbound "trash" validator
  const MAX_LEN = 256;
  const CTRL = /[\u0000-\u001F]/;
  const SIZED  = /\b-?\d+(?:\.\d+)?(?:px|pt|em|rem|%)\b/i;
  const FAMILY = /"[^"]+"|'[^']+'|\b[a-z0-9][\w\- ]{1,}\b/i;

  // --- allow-list, синхронизированный с генератором ---
  const GENERICS = new Set(['serif','sans-serif','monospace','cursive','fantasy','system-ui']);
  let ALLOWED_FAMILIES = null; // лениво соберём при первом обращении

  function extractFamily(q) {
    // первая family из шортхенда: "italic bold 12px/14px 'My Font', Arial, sans-serif"
    const m = String(q).match(/(?:^|\s)\d+(?:\.\d+)?(?:px|pt|em|rem|%)\b(?:\/\d+(?:\.\d+)?(?:px|pt|em|rem|%))?\s+(.+)$/i);
    const raw = (m ? m[1] : q);
    return raw.split(',')[0].replace(/['"]/g,'').trim().toLowerCase();
  }

  function getAllowedFamilies() {
    if (ALLOWED_FAMILIES) return ALLOWED_FAMILIES;
    const win = (typeof window !== 'undefined') ? window : G;
    const domPlat = win.__NAV_PLATFORM__;
    const cfgs = Array.isArray(win.fontPatchConfigs) ? win.fontPatchConfigs : [];
    ALLOWED_FAMILIES = new Set(
      (domPlat ? cfgs.filter(f => f.platform_dom === domPlat) : cfgs)
        .flatMap(f => [f.cssFamily, f.family, f.name, f.fallback].filter(Boolean))
        .map(s => s.toLowerCase())
    );
    return ALLOWED_FAMILIES;
  }

  const validFontQuery = q => {
    if (!(typeof q === 'string' && q.length <= MAX_LEN && !CTRL.test(q) && SIZED.test(q) && FAMILY.test(q))) {
      return false;
    }
    const fam = extractFamily(q);
    if (!fam) return false;
    if (GENERICS.has(fam)) return true;             // всегда пропускаем generics
    return getAllowedFamilies().has(fam);           // и только те, что реально есть в fontPatchConfigs
  };

  FFS.check = function check(query) {
    if (throttled()) return false;
    if (!validFontQuery(query)) return false;
    try { return origCheck(query); } catch { return false; }
  };

  FFS.load = function load(query, text) {
    if (throttled()) return Promise.resolve([]);
    if (!validFontQuery(query)) return Promise.resolve([]);
    if (text != null && typeof text !== 'string') return Promise.resolve([]);
    return origLoad(query, text).catch(() => []);
  };
})();


}



;
function CanvasPatchModule(window) {
  const C  = window.CanvasPatchContext || (window.CanvasPatchContext = {});
    if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — registratio not available');
  const G = (typeof globalThis !== 'undefined' && globalThis)
    || (typeof self !== 'undefined' && self)
    || (typeof window !== 'undefined' && window)
    || {};
      
  // === MODULE INITIALIZATION ===
  // Создаём <canvas> (идемпотентно) и разделяем DOM/Offscreen пути
  // Состояние модуля (общий контекст)
  C.state = C.state || { domReady: false, offscreenReady: false };

  // создаём скрытый HTML-canvas в окне
  function _ensureDomOnce() {
    if (C.state.domReady) return;
    if (typeof document === 'undefined' || !document.body) return; // нет DOM — выходим
    if (window.canvas && window.canvas.parentNode) {
      C.state.domReady = true;
      return;
    }
    const screenWidth = window.__WIDTH;
    const screenHeight = window.__HEIGHT;
    if (!Number.isFinite(screenWidth) || !Number.isFinite(screenHeight)) {
      throw new Error('[CanvasPatch] screenWidth / screenHeight not set');
    }
    const div = document.createElement('div');
    const u = mulberry32(strToSeed(__GLOBAL_SEED + '|canvasId'))();
    div.id = 'canvas_01' + u.toString(36).slice(2, 10);

    div.style.position = 'fixed';
    div.style.left = '-997px';
    div.style.top = '0';
    div.style.width = '1px';
    div.style.height = '1px';
    div.style.opacity = '0';
    div.style.pointerEvents = 'none';
    (document.body || document.documentElement).appendChild(div);

    const canvas = document.createElement('canvas');
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    canvas.style.width = screenWidth + 'px';
    canvas.style.height = screenHeight + 'px';
    canvas.style.display = 'block';
    canvas.style.background = 'transparent';
    div.appendChild(canvas);

    window.canvas = canvas;
    window.div = div;
    C.state.domReady = true;
  }

  // создаём OffscreenCanvas (и в окне, и в воркере)
  function _ensureOffscreenOnce() {
    if (C.state.offscreenReady) return;
    if (typeof window.OffscreenCanvas === 'undefined') return;
    const screenWidth = window.__WIDTH;
    const screenHeight = window.__HEIGHT;
    if (!Number.isFinite(screenWidth) || !Number.isFinite(screenHeight)) {
      throw new Error('[CanvasPatch] screenWidth / screenHeight not set');
    }
    if (!window.offscreenCanvas) {
      window.offscreenCanvas = new window.OffscreenCanvas(screenWidth, screenHeight);
    }
    C.state.offscreenReady = true;
  }

  // Воркеру нужен Offscreen без ожидания DOM; в окне — это тоже безопасно
  _ensureOffscreenOnce();

  // Фасад для окна: создаёт DOM и гарантирует Offscreen (идемпотентно)
  function realInit() {
    _ensureDomOnce();
    _ensureOffscreenOnce();
    console.log('[CanvasPatchModule] realInit done, window.canvas set:', window.canvas);
  }

  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', realInit, { once: true });
  } else if (typeof document !== 'undefined') {
    realInit();
  }

    // ===== stable noise helper (module-scope) =====
  function __stableNoise__(key, a, b){
    //The ONLY source: __GLOBAL_SEED + key -> mulberry32(strToSeed(...))
    const G = (typeof globalThis !== 'undefined' && globalThis)
          || (typeof self !== 'undefined' && self)
          || (typeof window !== 'undefined' && window)
          || {};
    if (typeof G.__GLOBAL_SEED !== 'string' || !G.__GLOBAL_SEED)
      throw new Error('[PRNG] __GLOBAL_SEED is required');
    if (typeof G.strToSeed !== 'function' || typeof G.mulberry32 !== 'function')
      throw new Error('[PRNG] strToSeed/mulberry32 are required');
    const base = 'seed:' + G.__GLOBAL_SEED + '|key:' + String(key);
    const seed = G.strToSeed(base) >>> 0;
    const u  = G.mulberry32(seed)();   // deterministical and order-independently
    return a + (b - a) * u;
  }

  function q256(v){ return Math.round(v * 256) / 256; }

  function makeCanvas(w, h) {
    // быстрая нормализация размеров
    w = w | 0; h = h | 0; if (w <= 0 || h <= 0) return null;

    // 1) предпочитаем OffscreenCanvas, если доступен
    if (typeof OffscreenCanvas !== 'undefined') {
      try { return new OffscreenCanvas(w, h); } catch {}
    if (typeof document !== 'undefined') { const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
    }
    
    // 2) фолбэк: DOM <canvas>
    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      return c;
    }

    // 3) среда без обоих вариантов
    return null;
  }

  function get2DProto(ctx) {
    // pick exact proto for brand-safe native calls
    if (typeof OffscreenCanvasRenderingContext2D !== 'undefined' && ctx instanceof OffscreenCanvasRenderingContext2D) {
      return OffscreenCanvasRenderingContext2D.prototype;
    }
    if (typeof CanvasRenderingContext2D !== 'undefined' && ctx instanceof CanvasRenderingContext2D) {
      return CanvasRenderingContext2D.prototype;
    }
    // fallback: whatever the engine reports
    return Object.getPrototypeOf(ctx);
  }

  function nativeGetImageData(P, ctx, x, y, w, h) {
    const fn = P && typeof P.getImageData === 'function' ? P.getImageData : ctx.getImageData;
    return fn.call(ctx, x, y, w, h);
  }
  function nativePutImageData(P, ctx, img, x, y) {
    const fn = P && typeof P.putImageData === 'function' ? P.putImageData : ctx.putImageData;
    return fn.call(ctx, img, x, y);
  }
  function nativeDrawImage(P, ctx, src, dx, dy) {
    const fn = P && typeof P.drawImage === 'function' ? P.drawImage : ctx.drawImage;
    return fn.call(ctx, src, dx, dy);
  }
  function nativeTranslate(P, ctx, x, y) {
    const fn = P && typeof P.translate === 'function' ? P.translate : ctx.translate;
    return fn.call(ctx, x, y);
  }
  function nativeSetTransform(P, ctx, a, b, c, d, e, f) {
    const fn = P && typeof P.setTransform === 'function' ? P.setTransform : ctx.setTransform;
    return fn.call(ctx, a, b, c, d, e, f);
  }

  const __CNV_CFG__ = {
    epsBasePPX: 512,
    epsJitterFactor: 0.5,
    edgeGain: 4.0,
    maskBlurPasses: 1,
    flatMeanThreshold: 0.02,
    epsScale: 0,          // анизотр. масштаб (опц.)
    linearBlend: false ,    // гамма-корректное смешивание (опц.)
    dxPx: 0.10,      // амплитуда X (px)
    dyPx: 0.10,      // амплитуда Y (px)
  };

  // --- Джиттер: порядок-независимый, кэш по (op,w,h,dpr) ---
  const JIT_CACHE = (typeof globalThis !== 'undefined' && globalThis.__JIT_CACHE__ instanceof Map)
    ? globalThis.__JIT_CACHE__
    : (typeof globalThis !== 'undefined'
        ? (globalThis.__JIT_CACHE__ = new Map())
        : new Map());

  function __getJitter__(op, w, h, dpr, cfg = __CNV_CFG__) {
    w |= 0;
    h |= 0;
    dpr = (typeof dpr === 'number' && dpr > 0) ? +dpr
      : (typeof devicePixelRatio === 'number' && devicePixelRatio > 0) ? +devicePixelRatio
      : (typeof globalThis !== 'undefined' && typeof globalThis.__DPR === 'number' && globalThis.__DPR > 0) ? +globalThis.__DPR
      : undefined;
    if (!(typeof dpr === 'number' && dpr > 0)) {
      throw new TypeError('__getJitter__: DPR is undefined or invalid');
    }
    const key = `${op}:${w}x${h}@${Math.round((dpr) * 1024)}`;

    const cached = JIT_CACHE.get(key); if (cached) return cached;

    const basePPX = (cfg && cfg.epsBasePPX);
    const jitterK = (cfg && cfg.epsJitterFactor != null) ? cfg.epsJitterFactor : 0.5;
    const base = 1 / (basePPX * dpr);

    const mag = base * (1 + jitterK * __stableNoise__(`${key}|m`, 0, 1));
    const ang = 2 * Math.PI * __stableNoise__(`${key}|a`, 0, 1);
    const v = { epsX: Math.cos(ang) * mag, epsY: Math.sin(ang) * mag };

    JIT_CACHE.set(key, v);
    return v;
  }

  function boxBlurMask(m, w, h) {
    const tmp = new Float32Array(m.length);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let acc = 0, cnt = 0;
        for (let yy = y - 1; yy <= y + 1; yy++) {
          if (yy < 0 || yy >= h) continue;
          const yOff = yy * w;
          for (let xx = x - 1; xx <= x + 1; xx++) {
            if (xx < 0 || xx >= w) continue;
            acc += m[yOff + xx]; cnt++;
          }
        }
        tmp[y * w + x] = acc / cnt;
      }
    }
    m.set(tmp);
  }

  // edge-aware ресемпл с микроджиттером; возвращает ImageData
  function __resampleWithJitter__(img, label, cfg = __CNV_CFG__) {
    if (!img || !img.data || !img.width || !img.height) return img;
    const w = img.width | 0, h = img.height | 0; if (!w || !h) return img;
    const dpr = (typeof devicePixelRatio === 'number' && devicePixelRatio > 0)
      ? +devicePixelRatio
      : ((typeof globalThis !== 'undefined' && typeof globalThis.__DPR === 'number' && globalThis.__DPR > 0)
          ? +globalThis.__DPR
          : undefined);
    const { epsX, epsY } = __getJitter__(label, w, h, dpr);

    const C1 = makeCanvas(w, h), C2 = makeCanvas(w, h);
    if (!C1 || !C2) return img;
    const ctx1 = C1.getContext('2d', { willReadFrequently: true });
    const ctx2 = C2.getContext('2d', { willReadFrequently: true });
    if (!ctx1 || !ctx2) return img;

    const P1 = get2DProto(ctx1), P2 = get2DProto(ctx2);
    try { ctx2.imageSmoothingEnabled = true; } catch {}
    nativePutImageData(P1, ctx1, img, 0, 0);
    nativeSetTransform(P2, ctx2, 1, 0, 0, 1, 0, 0);
    nativeTranslate(P2, ctx2, q256(epsX), q256(epsY));
    nativeDrawImage(P2, ctx2, C1, 0, 0);
    const res = nativeGetImageData(P2, ctx2, 0, 0, w, h);

    const src = img.data, dst = res.data;
    const mask = new Float32Array(w * h);
    let sum = 0;
    for (let y = 0; y < h; y++) {
      const yo = y * w;
      for (let x = 0; x < w; x++) {
        const i4 = (yo + x) << 2;
        const l  = 0.2126 * src[i4] + 0.7152 * src[i4 + 1] + 0.0722 * src[i4 + 2];
        const xr = (x + 1 < w) ? ((yo + x + 1) << 2) : i4;
        const yd = (y + 1 < h) ? (((y + 1) * w + x) << 2) : i4;
        const lr = 0.2126 * src[xr] + 0.7152 * src[xr + 1] + 0.0722 * src[xr + 2];
        const ld = 0.2126 * src[yd] + 0.7152 * src[yd + 1] + 0.0722 * src[yd + 2];
        let m = ((Math.abs(l - lr) + Math.abs(l - ld)) / 255) * ((cfg && cfg.edgeGain) || 4.0);
        if (m > 1) m = 1; mask[yo + x] = m; sum += m;
      }
    }
    const mean = sum / (w * h);
    if (mean < ((cfg && cfg.flatMeanThreshold) ?? 0.02)) return img;

    const blurPasses = (cfg && cfg.maskBlurPasses) | 0;
    for (let p = 0; p < blurPasses; p++) boxBlurMask(mask, w, h);

    const out = new Uint8ClampedArray(src.length);
    for (let i = 0; i < out.length; i += 4) {
      const m = mask[i >> 2];
      if (m > 0) {
        out[i]     = src[i]     + (dst[i]     - src[i])     * m;
        out[i + 1] = src[i + 1] + (dst[i + 1] - src[i + 1]) * m;
        out[i + 2] = src[i + 2] + (dst[i + 2] - src[i + 2]) * m;
      } else {
        out[i]     = src[i];
        out[i + 1] = src[i + 1];
        out[i + 2] = src[i + 2];
      }
      out[i + 3] = src[i + 3];
    }
    return new ImageData(out, w, h);
  }

  // --- 2D ImageData noise hook ---
  function patch2DNoise(img, type) {
    if (type !== '2d' || !img || !img.data || !img.width || !img.height) return img;
    const w = img.width | 0, h = img.height | 0; if (!w || !h) return img;
    const cfg = (typeof globalThis !== 'undefined' && globalThis.CanvasPatchHooks && globalThis.CanvasPatchHooks.resampleCfg)
            || (typeof __CNV_CFG__ !== 'undefined' ? __CNV_CFG__ : {})
            || {};
    const dpr = (typeof devicePixelRatio === 'number' && devicePixelRatio > 0)
      ? +devicePixelRatio
      : ((typeof globalThis !== 'undefined' && typeof globalThis.__DPR === 'number' && globalThis.__DPR > 0)
          ? +globalThis.__DPR
          : undefined);
    const { epsX, epsY } = __getJitter__('img:2d', w, h, dpr);

    const C1 = makeCanvas(w, h), C2 = makeCanvas(w, h);
    if (!C1 || !C2) return img;
    const ctx1 = C1.getContext('2d', { willReadFrequently: true });
    const ctx2 = C2.getContext('2d', { willReadFrequently: true });
    if (!ctx1 || !ctx2) return img;
    const P1 = get2DProto(ctx1), P2 = get2DProto(ctx2);

    try { ctx2.imageSmoothingEnabled = true; } catch {}
    nativePutImageData(P1, ctx1, img, 0, 0);
    nativeSetTransform(P2, ctx2, 1, 0, 0, 1, 0, 0);
    nativeTranslate(P2, ctx2, q256(epsX), q256(epsY));
    nativeDrawImage(P2, ctx2, C1, 0, 0);
    const res = nativeGetImageData(P2, ctx2, 0, 0, w, h);

    const src = img.data, dst = res.data;
    const mask = new Float32Array(w * h);
    let sumMask = 0;
    for (let y = 0; y < h; y++) {
      const yOff = y * w;
      for (let x = 0; x < w; x++) {
        const i4 = (yOff + x) << 2;
        const l  = 0.2126 * src[i4] + 0.7152 * src[i4 + 1] + 0.0722 * src[i4 + 2];
        const xr = (x + 1 < w) ? ((yOff + x + 1) << 2) : i4;
        const yd = (y + 1 < h) ? (((y + 1) * w + x) << 2) : i4;
        const lr = 0.2126 * src[xr] + 0.7152 * src[xr + 1] + 0.0722 * src[xr + 2];
        const ld = 0.2126 * src[yd] + 0.7152 * src[yd + 1] + 0.0722 * src[yd + 2];
        const dx = Math.abs(l - lr) / 255; const dy = Math.abs(l - ld) / 255;
        let m = (dx + dy) * (cfg.edgeGain ?? 4.0);
        if (m > 1) m = 1; mask[yOff + x] = m; sumMask += m;
      }
    }
    if (sumMask / (w * h) < (cfg.flatMeanThreshold ?? 0.02)) return img;

    const blurPasses = (cfg.maskBlurPasses ?? 1) | 0;
    for (let p = 0; p < blurPasses; p++) boxBlurMask(mask, w, h);

    const out = new Uint8ClampedArray(src.length);
    for (let i = 0; i < out.length; i += 4) {
      const m = mask[i >> 2];
      if (m > 0) {
        out[i]     = src[i]     + (dst[i]     - src[i])     * m;
        out[i + 1] = src[i + 1] + (dst[i + 1] - src[i + 1]) * m;
        out[i + 2] = src[i + 2] + (dst[i + 2] - src[i + 2]) * m;
      } else {
        out[i]     = src[i];
        out[i + 1] = src[i + 1];
        out[i + 2] = src[i + 2];
      }
      out[i + 3] = src[i + 3];
    }
    return new ImageData(out, w, h);
  }

  //  addCanvasNoise()
  function addCanvasNoise(imageData, dx = 0, dy = 0) {
    const G = (typeof globalThis !== 'undefined' && globalThis)
      || (typeof self !== 'undefined' && self)
      || (typeof window !== 'undefined' && window)
      || {};
    try {
      const cfg = (G.CanvasPatchHooks && G.CanvasPatchHooks.noiseCfg) || {};
      const density  = Number.isFinite(cfg.density)  ? cfg.density  : 0.08;
      const strength = Number.isFinite(cfg.strength) ? cfg.strength : 0.75;
      const mono = !!cfg.mono;

      if (!imageData || !imageData.data || !imageData.width || !imageData.height) return;
      const w = imageData.width | 0;
      const h = imageData.height | 0;
      if (!w || !h) return;

      const data = imageData.data;
      const dpr = (typeof devicePixelRatio === 'number' && devicePixelRatio > 0)
        ? +devicePixelRatio
        : ((typeof globalThis !== 'undefined' && typeof globalThis.__DPR === 'number' && globalThis.__DPR > 0)
            ? +globalThis.__DPR
            : undefined);
            
      const cnv  = (this && this.canvas) ? this.canvas : null;
      const cid  = (() => {
        try { const cw = cnv && cnv.width, ch = cnv && cnv.height; return `cnv@${cw}x${ch}@${(Math.round(dpr * 1024))}`; }
        catch { return `cnv@${w}x${h}@${(Math.round(dpr * 1024))}`; }
      })();
      const baseKey = `px|${w}x${h}|${cid}|dx:${dx|0},dy:${dy|0}`;

      for (let y = 0, i = 0; y < h; y++) {
        const ay = (dy|0) + y;
        for (let x = 0; x < w; x++, i += 4) {
          const ax = (dx|0) + x;

          const gate = __stableNoise__(`${baseKey}|x:${ax},y:${ay}|g`, 0, 1);
          if (gate > density) continue;

          if (mono) {
            const d  = __stableNoise__(`${baseKey}|x:${ax},y:${ay}|mono`, -strength, +strength);
            let r = data[i] + d, g = data[i+1] + d, b = data[i+2] + d;
            data[i]   = r < 0 ? 0 : r > 255 ? 255 : r;
            data[i+1] = g < 0 ? 0 : g > 255 ? 255 : g;
            data[i+2] = b < 0 ? 0 : b > 255 ? 255 : b;
          } else {
            const dr = __stableNoise__(`${baseKey}|x:${ax},y:${ay}|r`, -strength, +strength);
            const dg = __stableNoise__(`${baseKey}|x:${ax},y:${ay}|g`, -strength, +strength);
            const db = __stableNoise__(`${baseKey}|x:${ax},y:${ay}|b`, -strength, +strength);
            let r = data[i] + dr, g = data[i+1] + dg, b = data[i+2] + db;
            data[i]   = r < 0 ? 0 : r > 255 ? 255 : r;
            data[i+1] = g < 0 ? 0 : g > 255 ? 255 : g;
            data[i+2] = b < 0 ? 0 : b > 255 ? 255 : b;
          }
        }
      }
    } catch { /* silent */ }
  }

  function measureTextNoiseHook(res, text, font) {
    if (!res) return null;
    const txt  = String(text ?? '');
    const fRaw = (typeof font === 'string' && font.trim())
      ? font
      : (this && typeof this.font === 'string' && this.font.trim()) ? this.font : '16px sans-serif';
    const fStr = fRaw.replace(/\s+/g, ' ');
    const mm = fStr.match(/(\d+(?:\.\d+)?)px/i);
    const px = mm ? parseFloat(mm[1]) : 16;
    const len = txt.length >>> 0;
    const baseWidth = Math.max(1, 0.6 * px * len);
    const approx = {
      width:   baseWidth,
      ascent:  0.8 * px,
      descent: 0.2 * px,
      left:    0,
      right:   baseWidth,
      fAscent: 0.8 * px,
      fDescent:0.2 * px
    };

    // Don't make any noise here, otherwise  "width" will ruin the consistency
    const dpr = (typeof devicePixelRatio === 'number' && devicePixelRatio > 0)
      ? +devicePixelRatio
      : ((typeof globalThis !== 'undefined' && typeof globalThis.__DPR === 'number' && globalThis.__DPR > 0)
          ? +globalThis.__DPR
          : undefined);

    const key = `${fStr}\u241F${txt}\u241F${dpr}`;
    const widthNoise = 0;
    return { key, approx, widthNoise };
  }

  //  Proxy TextMetrics
  function applyMeasureTextHook(nativeMetrics, text, font) {
    try {
      const info = measureTextNoiseHook.call(this, nativeMetrics, text, font);
      if (!info || typeof info !== 'object') return nativeMetrics;
      const C  = window.CanvasPatchContext || (window.CanvasPatchContext = {});
      const TM = C.__TextMetrics__ || (C.__TextMetrics__ = { cache: new Map() });
      const key = (typeof info.key === 'string' && info.key.length) ? info.key : null;
      return new Proxy(nativeMetrics, {
        get(t, p) {
          if (key) {
            const cached = TM.cache.get(key);
            if (cached && typeof cached[p] === 'number') return cached[p];
          }
          let v = Reflect.get(t, p, t);
          if (!(typeof v === 'number' && isFinite(v))) {
            const a = info.approx || {};
            if (p === 'width')                          v = a.width   ?? 1;
            else if (p === 'actualBoundingBoxAscent')   v = a.ascent  ?? 0;
            else if (p === 'actualBoundingBoxDescent')  v = a.descent ?? 0;
            else if (p === 'fontBoundingBoxAscent')     v = a.fAscent ?? 0;
            else if (p === 'fontBoundingBoxDescent')    v = a.fDescent?? 0;
            else if (p === 'actualBoundingBoxLeft')     v = a.left    ?? 0;
            else if (p === 'actualBoundingBoxRight')    v = a.right   ?? 0;
            else if (p === 'emHeightAscent')            v = a.ascent  ?? 0;
            else if (p === 'emHeightDescent')           v = a.descent ?? 0;
            else v = 0;
          }
          const out = (p === 'width') ? (v + (info.widthNoise || 0)) : v;
          if (key && typeof out === 'number' && isFinite(out)) {
            const rec = TM.cache.get(key) || {};
            rec[p] = out;
            TM.cache.set(key, rec);
          }
          return out;
        },
        has: (t,p) => p in t,
      });
    } catch(_) {}
    return nativeMetrics;
  }

  // ===== fillTextNoiseHook  =====
  function fillTextNoiseHook(text, x, y, ...rest) {
    const font = (this && this.font) || '';
    const keyx = `fx|${font}\u241F${text}`;
    const keyy = `fy|${font}\u241F${text}`;
    const dx = __stableNoise__(keyx, -(__CNV_CFG__.dxPx), (__CNV_CFG__.dxPx));
    const dy = __stableNoise__(keyy, -(__CNV_CFG__.dyPx), (__CNV_CFG__.dyPx));
    return [text, x + dx, y + dy, ...rest];
  }

  // ===== strokeTextNoiseHook  =====
  function strokeTextNoiseHook(text, x, y, ...rest) {
    const font = (this && this.font) || '';
    const keyx = `sx|${font}\u241F${text}`;
    const keyy = `sy|${font}\u241F${text}`;
    const dx = __stableNoise__(keyx, -(__CNV_CFG__.dxPx), (__CNV_CFG__.dxPx));
    const dy = __stableNoise__(keyy, -(__CNV_CFG__.dyPx), (__CNV_CFG__.dyPx));
    return [text, x + dx, y + dy, ...rest];
  }

  function fillRectNoiseHook(x, y, w, h){
    return [ q256(x), q256(y), q256(w), q256(h) ];
  }

  // --- toBlob noise injection hook (HTMLCanvasElement) ---
  async function patchToBlobInjectNoise(blob, ...args) {
    // 1) Ничего не делать, если blob пустой или не image/*
    if (!blob || !(blob instanceof Blob)) return;

      const typeArg = (typeof args[0] === 'string')
        ? args[0]
        : (args[0] && typeof args[0] === 'object' ? args[0].type : undefined);

      const quality = (typeof args[1] === 'number')
        ? args[1]
        : (args[0] && typeof args[0] === 'object' ? args[0].quality : undefined);

      const mime = (typeArg || blob.type || 'image/png').toLowerCase();
      if (!/^image\/(png|jpeg|webp)$/.test(mime)) return;

      // 2) Декодируем Blob в ImageBitmap (с опциями); если опции не поддерживаются — фолбэк без них
      let bmp;
      try {
        if (typeof createImageBitmap === 'function') {
          try {
            bmp = await createImageBitmap(blob, {
              colorSpaceConversion: 'none',
              premultiplyAlpha: 'premultiply',
            });
          } catch {
            // некоторые окружения игнорируют/не понимают опции — пробуем без них
            bmp = await createImageBitmap(blob);
          }
        } else {
          // (опциональный фолбэк – можно опустить)
          const url = URL.createObjectURL(blob);
          bmp = await new Promise((res, rej) => {
            const i = new Image();
            i.onload = () => res(i);
            i.onerror = rej;
            i.src = url;
          });
          URL.revokeObjectURL(url);
          // тут bmp = HTMLImageElement (без bmp.close)
        }

        const w = (bmp.width || bmp.naturalWidth || 0) | 0;
        const h = (bmp.height || bmp.naturalHeight || 0) | 0;
        if (!w || !h) return;

        // 3) Scratch-канвас
        const sc = makeCanvas(w, h);
        if (!sc) return;
        const sctx = sc.getContext('2d', { willReadFrequently: true });
        if (!sctx) return;
        sctx.imageSmoothingEnabled = false;

        // 4) Кладём bitmap на scratch
        sctx.drawImage(bmp, 0, 0);

        // 5) Единый resample + jitter (вариант B)
        const img = sctx.getImageData(0, 0, w, h);
        const j   = __resampleWithJitter__(img, 'encode', __CNV_CFG__);
        sctx.putImageData(j, 0, 0);

        // 6) Ре-энкод Blob
        const q = (/^image\/(jpeg|webp)$/i.test(mime) && typeof quality === 'number')
          ? Math.min(1, Math.max(0, quality))
          : undefined;

        if (typeof sc.convertToBlob === 'function') {
          return await sc.convertToBlob({ type: mime, quality: q });
        }
        return await new Promise(r => sc.toBlob(r, mime, q));
    } finally {
      try { bmp && bmp.close && bmp.close(); } catch {}
    }
  }

  // IHDR-патч PNG для Offscreen/HTML convertToBlob (Promise-ветка) + выравнивание шума с toBlob/toDataURL
  async function patchConvertToBlobInjectNoise(blob, options) {
    if (!blob) return;

      const reqType = (options && options.type) || blob.type || 'image/png';
      const mime = String(reqType).toLowerCase();

      // 1) Сначала попытаемся сделать decode → __resampleWithJitter__('encode') → re-encode,
      //    чтобы Offscreen дал тот же результат, что toBlob/toDataURL.
      let bmp;
      try {
        if (typeof createImageBitmap === 'function') {
          try {
            bmp = await createImageBitmap(blob, {
              colorSpaceConversion: 'none',
              premultiplyAlpha: 'premultiply',
            });
          } catch {
            bmp = await createImageBitmap(blob);
          }
        }

        if (bmp) {
          const w = (bmp.width || bmp.naturalWidth || 0) | 0;
          const h = (bmp.height || bmp.naturalHeight || 0) | 0;
          if (w && h) {
            const sc = makeCanvas(w, h);
            if (sc) {
              const sctx = sc.getContext('2d', { willReadFrequently: true });
              if (sctx) {
                try { sctx.imageSmoothingEnabled = false; } catch {}
                sctx.drawImage(bmp, 0, 0);
                const img = sctx.getImageData(0, 0, w, h);
                const j   = __resampleWithJitter__(img, 'encode', __CNV_CFG__); // тот же label, что у toBlob/toDataURL
                sctx.putImageData(j, 0, 0);

                // Ре-энкодим в тот же форм-фактор (PNG предпочтительно; другие как есть)
                if (typeof sc.convertToBlob === 'function') {
                  return await sc.convertToBlob({ type: mime });
                }
                return await new Promise(r => sc.toBlob(r, mime));
              }
            }
          }
        }
      } finally {
        try { bmp && bmp.close && bmp.close(); } catch {}
      }

      // 2) Старый IHDR-путь (PNG only) — сохраняем как fallback, чтобы не ломать совместимость
      if (!/^image\/png$/i.test(mime)) return;
      const MAX_DIM = 0x7fffffff;
      const targetW = clampInt((typeof globalThis !== 'undefined' ? globalThis._NEW_WIDTH  : undefined) ?? this?.width,  1, MAX_DIM);
      const targetH = clampInt((typeof globalThis !== 'undefined' ? globalThis._NEW_HEIGHT : undefined) ?? this?.height, 1, MAX_DIM);
      if (!targetW || !targetH) return;

      const u8 = new Uint8Array(await blob.arrayBuffer());

      // 4) валидация PNG + IHDR(len=13)
      if (!isPngWithIhdr(u8)) return;

      writeBE(u8, 16, targetW >>> 0);
      writeBE(u8, 20, targetH >>> 0);
      const crc = crc32(u8, 12, 12 + 4 + 13);
      writeBE(u8, 12 + 4 + 13, crc >>> 0);

      // 6) возвращаем новый Blob с тем же типом
    return new Blob([u8], { type: 'image/png' });

    // --- helpers ---
    function clampInt(v, min, max) {
      v = Number.isFinite(v) ? Math.floor(v) : min;
      if (v < min) v = min; if (v > max) v = max; return v | 0;
    }
    function isPngWithIhdr(bytes) {
      // сигнатура PNG
      const sig = [137,80,78,71,13,10,26,10];
      for (let i=0;i<8;i++) if (bytes[i]!==sig[i]) return false;
      const len = (bytes[8]<<24)|(bytes[9]<<16)|(bytes[10]<<8)|bytes[11];
      if (len !== 13) return false;
      if (String.fromCharCode(bytes[12],bytes[13],bytes[14],bytes[15]) !== 'IHDR') return false;
      return true;
    }
    function writeBE(a, off, v) {
      a[off  ] = (v >>> 24) & 255;
      a[off+1] = (v >>> 16) & 255;
      a[off+2] = (v >>>  8) & 255;
      a[off+3] = (v >>>  0) & 255;
    }
    function getCrcTable() {
      const G = (typeof globalThis !== 'undefined' && globalThis)
        || (typeof self !== 'undefined' && self)
        || (typeof window !== 'undefined' && window)
        || {};
      if (G._crcTable) return G._crcTable;
      const t = new Uint32Array(256);
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        t[n] = c >>> 0;
      }
      G._crcTable = t;
      return t;
    }
    function crc32(arr, from, toExcl) {
      const tab = getCrcTable();
      let crc = ~0 >>> 0;
      for (let i = from; i < toExcl; i++) crc = (tab[(crc ^ arr[i]) & 0xFF] ^ (crc >>> 8)) >>> 0;
      return (~crc) >>> 0;
    }
  }


// --- IHDR patch (для masterToDataURLHook) ---
/**
 * Синхронный хук для dataURL/HTMLCanvasElement.
 * OffscreenCanvas — не поддерживается (нет sync toDataURL).
 */
  function patchCanvasIHDR(input, newW, newH) {
    const MAX_DIM = 0x7fffffff;
    const W = Math.max(1, Math.min(Math.floor(newW), MAX_DIM))|0;
    const H = Math.max(1, Math.min(Math.floor(newH), MAX_DIM))|0;

    let base64;
    if (typeof input === 'string' && input.startsWith('data:image/png')) {
      base64 = input.split(',')[1];
    } else if (typeof HTMLCanvasElement !== 'undefined' && input instanceof HTMLCanvasElement) {
      const G = (typeof globalThis !== 'undefined' && globalThis)
        || (typeof self !== 'undefined' && self)
        || (typeof window !== 'undefined' && window)
        || {};
      const safeInvoke = (typeof G.__canvasSafeInvoke__ === 'function')
        ? G.__canvasSafeInvoke__
        : ((fn, tgt, args) => fn.apply(tgt, args));
      const GUARD='__isChain_toDataURL';
      const prev = input[GUARD]; input[GUARD] = true;
      try {
        const url = safeInvoke(HTMLCanvasElement.prototype.toDataURL, input, ['image/png']);
        base64 = url.split(',')[1];
      } finally {
        input[GUARD] = prev;
      }
    } else {
      throw new TypeError('[patchCanvasIHDRSync] Unsupported input type for sync path');
    }

    const bin = atob(base64);
    const buf = new Uint8Array(bin.length);
    for (let i=0;i<bin.length;i++) buf[i] = bin.charCodeAt(i);

    // PNG + IHDR
    const sig=[137,80,78,71,13,10,26,10];
    for (let i=0;i<8;i++) if (buf[i]!==sig[i]) return 'data:image/png;base64,'+base64;
    const len=((buf[8]<<24)|(buf[9]<<16)|(buf[10]<<8)|buf[11]); if (len!==13) return 'data:image/png;base64,'+base64;
    if (String.fromCharCode(buf[12],buf[13],buf[14],buf[15])!=='IHDR') return 'data:image/png;base64,'+base64;

    // write W/H
    buf.set([ (W>>>24)&255,(W>>>16)&255,(W>>>8)&255,(W)&255 ], 16);
    buf.set([ (H>>>24)&255,(H>>>16)&255,(H>>>8)&255,(H)&255 ], 20);

    // CRC
    const G = (typeof globalThis !== 'undefined' && globalThis)
      || (typeof self !== 'undefined' && self)
      || (typeof window !== 'undefined' && window)
      || {};

    const tab = (function(){ if (G._crcTable) return G._crcTable;
      const t=new Uint32Array(256); for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); t[n]=c>>>0;} return (G._crcTable=t);
    })();
    let crc=~0>>>0;
    for (let i=12;i<12+4+13;i++) crc=(tab[(crc^buf[i])&255]^(crc>>>8))>>>0;
    crc=(~crc)>>>0;
    const crcOff=12+4+13;
    buf.set([ (crc>>>24)&255,(crc>>>16)&255,(crc>>>8)&255,(crc)&255 ], crcOff);

    // back to dataURL
    let s='',CH=0x8000; for(let i=0;i<buf.length;i+=CH) s+=String.fromCharCode.apply(null,buf.subarray(i,i+CH));
    return 'data:image/png;base64,'+btoa(s);
  }

  // Шумим ДО кодирования: снимаем пиксели, добавляем детерминированный микрошум,
  // кодируем на временном canvas, оригинал canvas не мутируем.
  function patchToDataURLInjectNoise(res, type, quality) {
    const mime = type || 'image/png';
    if (type && !/^image\//i.test(type)) return res;
    const canvas = this;
    const isCanvas =
      (typeof HTMLCanvasElement   !== 'undefined' && canvas instanceof HTMLCanvasElement) ||
      (typeof OffscreenCanvas     !== 'undefined' && canvas instanceof OffscreenCanvas);

    if (!isCanvas) return res;

    const w = canvas.width >>> 0;
    const h = canvas.height >>> 0;
    if (!w || !h) return res;

    function get2dRF(cnv) {
      if (!cnv || !cnv.getContext) return null;
      if (cnv.__tduCtx2dRF && cnv.__tduCtx2dRF.canvas === cnv) return cnv.__tduCtx2dRF;
      let ctx = null;
      ctx = cnv.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;
      try { Object.defineProperty(cnv, '__tduCtx2dRF', { value: ctx }); } catch(_) {}
      return ctx;
    }

    // 1) Снимаем пиксели, добавляем детерминированный микрошум, кладём обратно
    const ctx = get2dRF(canvas);
    if (!ctx) return res;
    try {
      const img = ctx.getImageData(0, 0, w, h);
      const j   = __resampleWithJitter__(img, 'encode', __CNV_CFG__);
      if (j && j.data && j.width === w && j.height === h) {
        ctx.putImageData(j, 0, 0);
      }
    } catch(_) { /* тихий фолбэк на исходный res */ }

    // Снимок без мутаций
    const snap = ctx.getImageData(0, 0, w, h);

    // Усиленная быстрая сигнатура (FNV-1a, выборка с шагом)
    let u8 = snap.data;
    let len = u8.length >>> 0;

    // адаптивный шаг: чем больше буфер, тем крупнее stride
    const stride = (len >= 1<<19) ? 32
                : (len >= 1<<17) ? 16
                : (len >= 1<<15) ? 8
                : 4;

    // FNV-1a 32-bit
    let hsh = 0x811c9dc5 >>> 0;
    for (let i = 0; i < len; i += stride) {
      hsh ^= u8[i];
      // умножение на 16777619 (без BigInt)
      hsh = (hsh + ((hsh<<1) + (hsh<<4) + (hsh<<7) + (hsh<<8) + (hsh<<24))) >>> 0;
    }

    // домешаем хвост (последние до 16 байт) — полезно для гладких картинок
    for (let i = len - Math.min(stride, 16); i < len && i >= 0; i++) {
      hsh ^= u8[i];
      hsh = (hsh + ((hsh<<1) + (hsh<<4) + (hsh<<7) + (hsh<<8) + (hsh<<24))) >>> 0;
    }

    // привяжем к геометрии: разные (w,h) → разные сигнатуры
    const sig = (hsh ^ (w << 1) ^ (h << 17)) >>> 0;

    // per-canvas кэш
    const key = `v2:${sig}|${mime}|${quality ?? ''}`;
    canvas.__tduCache = canvas.__tduCache || new Map();
    if (canvas.__tduCache.has(key)) return canvas.__tduCache.get(key);

    // snap: ImageData исходного канваса
    const sc = (typeof document !== 'undefined' && document.createElement)
      ? (() => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; })()
      : null;
    if (!sc) return res;

    const sctx = sc.getContext('2d', { willReadFrequently: true });
    if (!sctx) return res;
    sctx.imageSmoothingEnabled = false;
    // единый edge-aware ресэмпл с микроджиттером (вариант B: шум при кодировании)
    const buf = __resampleWithJitter__(snap, 'encode', __CNV_CFG__); // ImageData
    sctx.putImageData(buf, 0, 0);


    // GUARD от рекурсии
    const GUARD = '__isChain_toDataURL';
    const prev = sc[GUARD];
    sc[GUARD] = true;
    let out;
    try {
      // Всегда HTMLCanvasElement → синхронный путь
      out = sc.toDataURL(mime, quality);
    } finally {
      sc[GUARD] = prev;
    }

    canvas.__tduCache.set(key, out);
    canvas.__tduLastSig = sig;
    return out;
  }
    

  // === HOOK FUNCTIONS ===
  function applyDrawImageHook(origDrawImage, ...args) {
    const a = args.slice();
    // normalize numeric args
    if (a.length === 3) { a[1] = q256(a[1]); a[2] = q256(a[2]); }
    else if (a.length === 5) { a[1] = q256(a[1]); a[2] = q256(a[2]); a[3] = q256(a[3]); a[4] = q256(a[4]); }
    else if (a.length === 9) { a[5] = q256(a[5]); a[6] = q256(a[6]); a[7] = q256(a[7]); a[8] = q256(a[8]); }

    // perform original draw
    const res = origDrawImage.apply(this, a);
    const ctx = this;
    const cnv = ctx.canvas || ctx;
    if (!cnv || !cnv.width || !cnv.height) return res;

    // reentrancy guard per canvas
    const __GUARD__ = Symbol.for('cnv.guard');
    if (cnv[__GUARD__]) return res;
    cnv[__GUARD__] = true;

    try {
      // compute affected region from normalized args
      let dx, dy, dw, dh;
      if (a.length === 3) {
        const img = a[0];
        dx = a[1]; dy = a[2];
        const iw = (img && (img.naturalWidth || img.videoWidth || img.width))  || cnv.width;
        const ih = (img && (img.naturalHeight || img.videoHeight || img.height)) || cnv.height;
        dw = iw; dh = ih;
      } else if (a.length === 5) {
        dx = a[1]; dy = a[2]; dw = a[3]; dh = a[4];
      } else if (a.length === 9) {
        dx = a[5]; dy = a[6]; dw = a[7]; dh = a[8];
      } else {
        return res;
      }

      // clamp to integers and canvas bounds
      dx = Math.trunc(dx); dy = Math.trunc(dy);
      dw = Math.max(1, Math.floor(dw)); dh = Math.max(1, Math.floor(dh));
      const cw = cnv.width | 0, ch = cnv.height | 0;
      if (dx < 0) { dw += dx; dx = 0; }
      if (dy < 0) { dh += dy; dy = 0; }
      if (dx >= cw || dy >= ch) return res;
      if (dx + dw > cw) dw = Math.max(1, cw - dx);
      if (dy + dh > ch) dh = Math.max(1, ch - dy);
      if (dw <= 0 || dh <= 0) return res;

      // read the region; CORS-tainted surfaces will throw
      let imgData;
      try {
        imgData = ctx.getImageData(dx, dy, dw, dh);
      } catch {
        return res; // leave as is on taint
      }

    } finally {
      cnv[__GUARD__] = false;
    }

    return res;
  }

  // Хук для master-цепочки toDataURL: оставляем синхронным (цепь sync)
  function patchCanvasIHDRHook(res, type, quality, newWidth, newHeight) {
    if (type !== 'image/png') return res;
    if (!newWidth || !newHeight) return res;
    // синхронная цепочка master → синхронный IHDR-патчер
    return patchCanvasIHDR(res || this, newWidth, newHeight);
  }

  // master-хук, который вызывает noise-инъекцию и затем IHDR-патчер
  function masterToDataURLHook(res, type, quality) {
    if (typeof patchToDataURLInjectNoise === 'function') {
      res = patchToDataURLInjectNoise.call(this, res, type, quality);
    }
    if (type === 'image/png' && typeof patchCanvasIHDRHook === 'function') {
      const newWidth  = window._NEW_WIDTH  || this.width;
      const newHeight = window._NEW_HEIGHT || this.height;
      if ((newWidth|0)!==(this.width|0) || (newHeight|0)!==(this.height|0)) {
        res = patchCanvasIHDRHook.call(this, res, type, quality, newWidth, newHeight);
      }
    }
    return res;
  }


// --- final export ---
window.CanvasPatchHooks = {
  patch2DNoise,
  patchToDataURLInjectNoise,
  patchCanvasIHDRHook,
  masterToDataURLHook,
  patchToBlobInjectNoise,
  patchConvertToBlobInjectNoise,
  measureTextNoiseHook,
  applyMeasureTextHook,
  fillTextNoiseHook,
  strokeTextNoiseHook,
  fillRectNoiseHook,
  addCanvasNoise,
  applyDrawImageHook
};
}

;
function WEBglDICKts(window) {
    if (!window.__PATCH_WEBSTORAGE__) {
    window.__PATCH_WEBSTORAGE__ = true;
    const C = window.CanvasPatchContext;
    if (!C) {
        throw new Error('[CanvasPatch] CanvasPatchContext is undefined — no futher execution');
    }
    
    // === WHITELIST (use YOR device specification list)===
    window.__WEBGL_PARAM_WHITELIST__ = [
    0x1F00,
    0x1F01,
    WebGLRenderingContext.DEPTH_BUFFER_BIT,
    WebGLRenderingContext.STENCIL_BUFFER_BIT,
    WebGLRenderingContext.COLOR_BUFFER_BIT,
    WebGLRenderingContext.POINTS,
    WebGLRenderingContext.LINES,
    WebGLRenderingContext.LINE_LOOP,
    WebGLRenderingContext.LINE_STRIP,
    WebGLRenderingContext.TRIANGLES,
    WebGLRenderingContext.TRIANGLE_STRIP,
    WebGLRenderingContext.TRIANGLE_FAN,
    WebGLRenderingContext.ZERO,
    WebGLRenderingContext.ONE,
    WebGLRenderingContext.SRC_COLOR,
    WebGLRenderingContext.ONE_MINUS_SRC_COLOR,
    WebGLRenderingContext.SRC_ALPHA,
    WebGLRenderingContext.ONE_MINUS_SRC_ALPHA,
    WebGLRenderingContext.DST_ALPHA,
    WebGLRenderingContext.ONE_MINUS_DST_ALPHA,
    WebGLRenderingContext.DST_COLOR,
    WebGLRenderingContext.ONE_MINUS_DST_COLOR,
    WebGLRenderingContext.SRC_ALPHA_SATURATE,
    WebGLRenderingContext.FUNC_ADD,
    WebGLRenderingContext.BLEND_EQUATION,
    WebGLRenderingContext.BLEND_EQUATION_RGB,
    WebGLRenderingContext.BLEND_EQUATION_ALPHA,
    WebGLRenderingContext.FUNC_SUBTRACT,
    WebGLRenderingContext.FUNC_REVERSE_SUBTRACT,
    WebGLRenderingContext.BLEND_DST_RGB,
    WebGLRenderingContext.BLEND_SRC_RGB,
    WebGLRenderingContext.BLEND_DST_ALPHA,
    WebGLRenderingContext.BLEND_SRC_ALPHA,
    WebGLRenderingContext.CONSTANT_COLOR,
    WebGLRenderingContext.ONE_MINUS_CONSTANT_COLOR,
    WebGLRenderingContext.CONSTANT_ALPHA,
    WebGLRenderingContext.ONE_MINUS_CONSTANT_ALPHA,
    WebGLRenderingContext.BLEND_COLOR,
    WebGLRenderingContext.ARRAY_BUFFER,
    WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,
    WebGLRenderingContext.ARRAY_BUFFER_BINDING,
    WebGLRenderingContext.ELEMENT_ARRAY_BUFFER_BINDING,
    WebGLRenderingContext.STREAM_DRAW,
    WebGLRenderingContext.STATIC_DRAW,
    WebGLRenderingContext.DYNAMIC_DRAW,
    WebGLRenderingContext.BUFFER_SIZE,
    WebGLRenderingContext.BUFFER_USAGE,
    WebGLRenderingContext.CURRENT_VERTEX_ATTRIB,
    WebGLRenderingContext.FRONT,
    WebGLRenderingContext.BACK,
    WebGLRenderingContext.FRONT_AND_BACK,
    WebGLRenderingContext.TEXTURE_2D,
    WebGLRenderingContext.CULL_FACE,
    WebGLRenderingContext.BLEND,
    WebGLRenderingContext.DITHER,
    WebGLRenderingContext.STENCIL_TEST,
    WebGLRenderingContext.DEPTH_TEST,
    WebGLRenderingContext.SCISSOR_TEST,
    WebGLRenderingContext.POLYGON_OFFSET_FILL,
    WebGLRenderingContext.SAMPLE_ALPHA_TO_COVERAGE,
    WebGLRenderingContext.SAMPLE_COVERAGE,
    WebGLRenderingContext.NO_ERROR,
    WebGLRenderingContext.INVALID_ENUM,
    WebGLRenderingContext.INVALID_VALUE,
    WebGLRenderingContext.INVALID_OPERATION,
    WebGLRenderingContext.OUT_OF_MEMORY,
    WebGLRenderingContext.CW,
    WebGLRenderingContext.CCW,
    WebGLRenderingContext.LINE_WIDTH,
    WebGLRenderingContext.ALIASED_POINT_SIZE_RANGE,
    WebGLRenderingContext.ALIASED_LINE_WIDTH_RANGE,
    WebGLRenderingContext.CULL_FACE_MODE,
    WebGLRenderingContext.FRONT_FACE,
    WebGLRenderingContext.DEPTH_RANGE,
    WebGLRenderingContext.DEPTH_WRITEMASK,
    WebGLRenderingContext.DEPTH_CLEAR_VALUE,
    WebGLRenderingContext.DEPTH_FUNC,
    WebGLRenderingContext.STENCIL_CLEAR_VALUE,
    WebGLRenderingContext.STENCIL_FUNC,
    WebGLRenderingContext.STENCIL_FAIL,
    WebGLRenderingContext.STENCIL_PASS_DEPTH_FAIL,
    WebGLRenderingContext.STENCIL_PASS_DEPTH_PASS,
    WebGLRenderingContext.STENCIL_REF,
    WebGLRenderingContext.STENCIL_VALUE_MASK,
    WebGLRenderingContext.STENCIL_WRITEMASK,
    WebGLRenderingContext.STENCIL_BACK_FUNC,
    WebGLRenderingContext.STENCIL_BACK_FAIL,
    WebGLRenderingContext.STENCIL_BACK_PASS_DEPTH_FAIL,
    WebGLRenderingContext.STENCIL_BACK_PASS_DEPTH_PASS,
    WebGLRenderingContext.STENCIL_BACK_REF,
    WebGLRenderingContext.STENCIL_BACK_VALUE_MASK,
    WebGLRenderingContext.STENCIL_BACK_WRITEMASK,
    WebGLRenderingContext.VIEWPORT,
    WebGLRenderingContext.SCISSOR_BOX,
    WebGLRenderingContext.COLOR_CLEAR_VALUE,
    WebGLRenderingContext.COLOR_WRITEMASK,
    WebGLRenderingContext.UNPACK_ALIGNMENT,
    WebGLRenderingContext.PACK_ALIGNMENT,
    WebGLRenderingContext.MAX_TEXTURE_SIZE,
    WebGLRenderingContext.MAX_VIEWPORT_DIMS,
    WebGLRenderingContext.SUBPIXEL_BITS,
    WebGLRenderingContext.RED_BITS,
    WebGLRenderingContext.GREEN_BITS,
    WebGLRenderingContext.BLUE_BITS,
    WebGLRenderingContext.ALPHA_BITS,
    WebGLRenderingContext.DEPTH_BITS,
    WebGLRenderingContext.STENCIL_BITS,
    WebGLRenderingContext.POLYGON_OFFSET_UNITS,
    WebGLRenderingContext.POLYGON_OFFSET_FACTOR,
    WebGLRenderingContext.TEXTURE_BINDING_2D,
    WebGLRenderingContext.SAMPLE_BUFFERS,
    WebGLRenderingContext.SAMPLES,
    WebGLRenderingContext.SAMPLE_COVERAGE_VALUE,
    WebGLRenderingContext.SAMPLE_COVERAGE_INVERT,
    WebGLRenderingContext.COMPRESSED_TEXTURE_FORMATS,
    WebGLRenderingContext.DONT_CARE,
    WebGLRenderingContext.FASTEST,
    WebGLRenderingContext.NICEST,
    WebGLRenderingContext.GENERATE_MIPMAP_HINT,
    WebGLRenderingContext.BYTE,
    WebGLRenderingContext.UNSIGNED_BYTE,
    WebGLRenderingContext.SHORT,
    WebGLRenderingContext.UNSIGNED_SHORT,
    WebGLRenderingContext.INT,
    WebGLRenderingContext.UNSIGNED_INT,
    WebGLRenderingContext.FLOAT,
    WebGLRenderingContext.DEPTH_COMPONENT,
    WebGLRenderingContext.ALPHA,
    WebGLRenderingContext.RGB,
    WebGLRenderingContext.RGBA,
    WebGLRenderingContext.LUMINANCE,
    WebGLRenderingContext.LUMINANCE_ALPHA,
    WebGLRenderingContext.UNSIGNED_SHORT_4_4_4_4,
    WebGLRenderingContext.UNSIGNED_SHORT_5_5_5_1,
    WebGLRenderingContext.UNSIGNED_SHORT_5_6_5,
    WebGLRenderingContext.FRAGMENT_SHADER,
    WebGLRenderingContext.VERTEX_SHADER,
    WebGLRenderingContext.MAX_VERTEX_ATTRIBS,
    WebGLRenderingContext.MAX_VERTEX_UNIFORM_VECTORS,
    WebGLRenderingContext.MAX_VARYING_VECTORS,
    WebGLRenderingContext.MAX_COMBINED_TEXTURE_IMAGE_UNITS,
    WebGLRenderingContext.MAX_VERTEX_TEXTURE_IMAGE_UNITS,
    WebGLRenderingContext.MAX_TEXTURE_IMAGE_UNITS,
    WebGLRenderingContext.MAX_FRAGMENT_UNIFORM_VECTORS,
    WebGLRenderingContext.SHADER_TYPE,
    WebGLRenderingContext.DELETE_STATUS,
    WebGLRenderingContext.LINK_STATUS,
    WebGLRenderingContext.VALIDATE_STATUS,
    WebGLRenderingContext.ATTACHED_SHADERS,
    WebGLRenderingContext.ACTIVE_UNIFORMS,
    WebGLRenderingContext.ACTIVE_ATTRIBUTES,
    WebGLRenderingContext.SHADING_LANGUAGE_VERSION,
    WebGLRenderingContext.CURRENT_PROGRAM,
    WebGLRenderingContext.NEVER,
    WebGLRenderingContext.LESS,
    WebGLRenderingContext.EQUAL,
    WebGLRenderingContext.LEQUAL,
    WebGLRenderingContext.GREATER,
    WebGLRenderingContext.NOTEQUAL,
    WebGLRenderingContext.GEQUAL,
    WebGLRenderingContext.ALWAYS,
    WebGLRenderingContext.KEEP,
    WebGLRenderingContext.REPLACE,
    WebGLRenderingContext.INCR,
    WebGLRenderingContext.DECR,
    WebGLRenderingContext.INVERT,
    WebGLRenderingContext.INCR_WRAP,
    WebGLRenderingContext.DECR_WRAP,
    WebGLRenderingContext.VENDOR,
    WebGLRenderingContext.RENDERER,
    WebGLRenderingContext.VERSION,
    WebGLRenderingContext.NEAREST,
    WebGLRenderingContext.LINEAR,
    WebGLRenderingContext.NEAREST_MIPMAP_NEAREST,
    WebGLRenderingContext.LINEAR_MIPMAP_NEAREST,
    WebGLRenderingContext.NEAREST_MIPMAP_LINEAR,
    WebGLRenderingContext.LINEAR_MIPMAP_LINEAR,
    WebGLRenderingContext.TEXTURE_MAG_FILTER,
    WebGLRenderingContext.TEXTURE_MIN_FILTER,
    WebGLRenderingContext.TEXTURE_WRAP_S,
    WebGLRenderingContext.TEXTURE_WRAP_T,
    WebGLRenderingContext.TEXTURE,
    WebGLRenderingContext.TEXTURE_CUBE_MAP,
    WebGLRenderingContext.TEXTURE_BINDING_CUBE_MAP,
    WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X,
    WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X,
    WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y,
    WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z,
    WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    WebGLRenderingContext.MAX_CUBE_MAP_TEXTURE_SIZE,
    WebGLRenderingContext.TEXTURE0,
    WebGLRenderingContext.TEXTURE1,
    WebGLRenderingContext.TEXTURE2,
    WebGLRenderingContext.TEXTURE3,
    WebGLRenderingContext.TEXTURE4,
    WebGLRenderingContext.TEXTURE5,
    WebGLRenderingContext.TEXTURE6,
    WebGLRenderingContext.TEXTURE7,
    WebGLRenderingContext.TEXTURE8,
    WebGLRenderingContext.TEXTURE9,
    WebGLRenderingContext.TEXTURE10,
    WebGLRenderingContext.TEXTURE11,
    WebGLRenderingContext.TEXTURE12,
    WebGLRenderingContext.TEXTURE13,
    WebGLRenderingContext.TEXTURE14,
    WebGLRenderingContext.TEXTURE15,
    WebGLRenderingContext.TEXTURE16,
    WebGLRenderingContext.TEXTURE17,
    WebGLRenderingContext.TEXTURE18,
    WebGLRenderingContext.TEXTURE19,
    WebGLRenderingContext.TEXTURE20,
    WebGLRenderingContext.TEXTURE21,
    WebGLRenderingContext.TEXTURE22,
    WebGLRenderingContext.TEXTURE23,
    WebGLRenderingContext.TEXTURE24,
    WebGLRenderingContext.TEXTURE25,
    WebGLRenderingContext.TEXTURE26,
    WebGLRenderingContext.TEXTURE27,
    WebGLRenderingContext.TEXTURE28,
    WebGLRenderingContext.TEXTURE29,
    WebGLRenderingContext.TEXTURE30,
    WebGLRenderingContext.TEXTURE31,
    WebGLRenderingContext.ACTIVE_TEXTURE,
    WebGLRenderingContext.REPEAT,
    WebGLRenderingContext.CLAMP_TO_EDGE,
    WebGLRenderingContext.MIRRORED_REPEAT,
    WebGLRenderingContext.FLOAT_VEC2,
    WebGLRenderingContext.FLOAT_VEC3,
    WebGLRenderingContext.FLOAT_VEC4,
    WebGLRenderingContext.INT_VEC2,
    WebGLRenderingContext.INT_VEC3,
    WebGLRenderingContext.INT_VEC4,
    WebGLRenderingContext.BOOL,
    WebGLRenderingContext.BOOL_VEC2,
    WebGLRenderingContext.BOOL_VEC3,
    WebGLRenderingContext.BOOL_VEC4,
    WebGLRenderingContext.FLOAT_MAT2,
    WebGLRenderingContext.FLOAT_MAT3,
    WebGLRenderingContext.FLOAT_MAT4,
    WebGLRenderingContext.SAMPLER_2D,
    WebGLRenderingContext.SAMPLER_CUBE,
    WebGLRenderingContext.VERTEX_ATTRIB_ARRAY_ENABLED,
    WebGLRenderingContext.VERTEX_ATTRIB_ARRAY_SIZE,
    WebGLRenderingContext.VERTEX_ATTRIB_ARRAY_STRIDE,
    WebGLRenderingContext.VERTEX_ATTRIB_ARRAY_TYPE,
    WebGLRenderingContext.VERTEX_ATTRIB_ARRAY_NORMALIZED,
    WebGLRenderingContext.VERTEX_ATTRIB_ARRAY_POINTER,
    WebGLRenderingContext.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING,
    WebGLRenderingContext.IMPLEMENTATION_COLOR_READ_TYPE,
    WebGLRenderingContext.IMPLEMENTATION_COLOR_READ_FORMAT,
    WebGLRenderingContext.COMPILE_STATUS,
    WebGLRenderingContext.LOW_FLOAT,
    WebGLRenderingContext.MEDIUM_FLOAT,
    WebGLRenderingContext.HIGH_FLOAT,
    WebGLRenderingContext.LOW_INT,
    WebGLRenderingContext.MEDIUM_INT,
    WebGLRenderingContext.HIGH_INT,
    WebGLRenderingContext.FRAMEBUFFER,
    WebGLRenderingContext.RENDERBUFFER,
    WebGLRenderingContext.RGBA4,
    WebGLRenderingContext.RGB5_A1,
    WebGLRenderingContext.RGB565,
    WebGLRenderingContext.DEPTH_COMPONENT16,
    WebGLRenderingContext.STENCIL_INDEX8,
    WebGLRenderingContext.DEPTH_STENCIL,
    WebGLRenderingContext.RENDERBUFFER_WIDTH,
    WebGLRenderingContext.RENDERBUFFER_HEIGHT,
    WebGLRenderingContext.RENDERBUFFER_INTERNAL_FORMAT,
    WebGLRenderingContext.RENDERBUFFER_RED_SIZE,
    WebGLRenderingContext.RENDERBUFFER_GREEN_SIZE,
    WebGLRenderingContext.RENDERBUFFER_BLUE_SIZE,
    WebGLRenderingContext.RENDERBUFFER_ALPHA_SIZE,
    WebGLRenderingContext.RENDERBUFFER_DEPTH_SIZE,
    WebGLRenderingContext.RENDERBUFFER_STENCIL_SIZE,
    WebGLRenderingContext.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE,
    WebGLRenderingContext.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME,
    WebGLRenderingContext.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL,
    WebGLRenderingContext.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE,
    WebGLRenderingContext.COLOR_ATTACHMENT0,
    WebGLRenderingContext.DEPTH_ATTACHMENT,
    WebGLRenderingContext.STENCIL_ATTACHMENT,
    WebGLRenderingContext.DEPTH_STENCIL_ATTACHMENT,
    WebGLRenderingContext.NONE,
    WebGLRenderingContext.FRAMEBUFFER_COMPLETE,
    WebGLRenderingContext.FRAMEBUFFER_INCOMPLETE_ATTACHMENT,
    WebGLRenderingContext.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT,
    WebGLRenderingContext.FRAMEBUFFER_INCOMPLETE_DIMENSIONS,
    WebGLRenderingContext.FRAMEBUFFER_UNSUPPORTED,
    WebGLRenderingContext.FRAMEBUFFER_BINDING,
    WebGLRenderingContext.RENDERBUFFER_BINDING,
    WebGLRenderingContext.MAX_RENDERBUFFER_SIZE,
    WebGLRenderingContext.INVALID_FRAMEBUFFER_OPERATION,
    WebGLRenderingContext.UNPACK_FLIP_Y_WEBGL,
    WebGLRenderingContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
    WebGLRenderingContext.CONTEXT_LOST_WEBGL,
    WebGLRenderingContext.UNPACK_COLORSPACE_CONVERSION_WEBGL,
    WebGLRenderingContext.BROWSER_DEFAULT_WEBGL,
    WebGLRenderingContext.RGB8,
    WebGLRenderingContext.RGBA8,
    WebGL2RenderingContext.DEPTH_BUFFER_BIT,
    WebGL2RenderingContext.STENCIL_BUFFER_BIT,
    WebGL2RenderingContext.COLOR_BUFFER_BIT,
    WebGL2RenderingContext.POINTS,
    WebGL2RenderingContext.LINES,
    WebGL2RenderingContext.LINE_LOOP,
    WebGL2RenderingContext.LINE_STRIP,
    WebGL2RenderingContext.TRIANGLES,
    WebGL2RenderingContext.TRIANGLE_STRIP,
    WebGL2RenderingContext.TRIANGLE_FAN,
    WebGL2RenderingContext.ZERO,
    WebGL2RenderingContext.ONE,
    WebGL2RenderingContext.SRC_COLOR,
    WebGL2RenderingContext.ONE_MINUS_SRC_COLOR,
    WebGL2RenderingContext.SRC_ALPHA,
    WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA,
    WebGL2RenderingContext.DST_ALPHA,
    WebGL2RenderingContext.ONE_MINUS_DST_ALPHA,
    WebGL2RenderingContext.DST_COLOR,
    WebGL2RenderingContext.ONE_MINUS_DST_COLOR,
    WebGL2RenderingContext.SRC_ALPHA_SATURATE,
    WebGL2RenderingContext.FUNC_ADD,
    WebGL2RenderingContext.BLEND_EQUATION,
    WebGL2RenderingContext.BLEND_EQUATION_RGB,
    WebGL2RenderingContext.BLEND_EQUATION_ALPHA,
    WebGL2RenderingContext.FUNC_SUBTRACT,
    WebGL2RenderingContext.FUNC_REVERSE_SUBTRACT,
    WebGL2RenderingContext.BLEND_DST_RGB,
    WebGL2RenderingContext.BLEND_SRC_RGB,
    WebGL2RenderingContext.BLEND_DST_ALPHA,
    WebGL2RenderingContext.BLEND_SRC_ALPHA,
    WebGL2RenderingContext.CONSTANT_COLOR,
    WebGL2RenderingContext.ONE_MINUS_CONSTANT_COLOR,
    WebGL2RenderingContext.CONSTANT_ALPHA,
    WebGL2RenderingContext.ONE_MINUS_CONSTANT_ALPHA,
    WebGL2RenderingContext.BLEND_COLOR,
    WebGL2RenderingContext.ARRAY_BUFFER,
    WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER,
    WebGL2RenderingContext.ARRAY_BUFFER_BINDING,
    WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER_BINDING,
    WebGL2RenderingContext.STREAM_DRAW,
    WebGL2RenderingContext.STATIC_DRAW,
    WebGL2RenderingContext.DYNAMIC_DRAW,
    WebGL2RenderingContext.BUFFER_SIZE,
    WebGL2RenderingContext.BUFFER_USAGE,
    WebGL2RenderingContext.CURRENT_VERTEX_ATTRIB,
    WebGL2RenderingContext.FRONT,
    WebGL2RenderingContext.BACK,
    WebGL2RenderingContext.FRONT_AND_BACK,
    WebGL2RenderingContext.TEXTURE_2D,
    WebGL2RenderingContext.CULL_FACE,
    WebGL2RenderingContext.BLEND,
    WebGL2RenderingContext.DITHER,
    WebGL2RenderingContext.STENCIL_TEST,
    WebGL2RenderingContext.DEPTH_TEST,
    WebGL2RenderingContext.SCISSOR_TEST,
    WebGL2RenderingContext.POLYGON_OFFSET_FILL,
    WebGL2RenderingContext.SAMPLE_ALPHA_TO_COVERAGE,
    WebGL2RenderingContext.SAMPLE_COVERAGE,
    WebGL2RenderingContext.NO_ERROR,
    WebGL2RenderingContext.INVALID_ENUM,
    WebGL2RenderingContext.INVALID_VALUE,
    WebGL2RenderingContext.INVALID_OPERATION,
    WebGL2RenderingContext.OUT_OF_MEMORY,
    WebGL2RenderingContext.CW,
    WebGL2RenderingContext.CCW,
    WebGL2RenderingContext.LINE_WIDTH,
    WebGL2RenderingContext.ALIASED_POINT_SIZE_RANGE,
    WebGL2RenderingContext.ALIASED_LINE_WIDTH_RANGE,
    WebGL2RenderingContext.CULL_FACE_MODE,
    WebGL2RenderingContext.FRONT_FACE,
    WebGL2RenderingContext.DEPTH_RANGE,
    WebGL2RenderingContext.DEPTH_WRITEMASK,
    WebGL2RenderingContext.DEPTH_CLEAR_VALUE,
    WebGL2RenderingContext.DEPTH_FUNC,
    WebGL2RenderingContext.STENCIL_CLEAR_VALUE,
    WebGL2RenderingContext.STENCIL_FUNC,
    WebGL2RenderingContext.STENCIL_FAIL,
    WebGL2RenderingContext.STENCIL_PASS_DEPTH_FAIL,
    WebGL2RenderingContext.STENCIL_PASS_DEPTH_PASS,
    WebGL2RenderingContext.STENCIL_REF,
    WebGL2RenderingContext.STENCIL_VALUE_MASK,
    WebGL2RenderingContext.STENCIL_WRITEMASK,
    WebGL2RenderingContext.STENCIL_BACK_FUNC,
    WebGL2RenderingContext.STENCIL_BACK_FAIL,
    WebGL2RenderingContext.STENCIL_BACK_PASS_DEPTH_FAIL,
    WebGL2RenderingContext.STENCIL_BACK_PASS_DEPTH_PASS,
    WebGL2RenderingContext.STENCIL_BACK_REF,
    WebGL2RenderingContext.STENCIL_BACK_VALUE_MASK,
    WebGL2RenderingContext.STENCIL_BACK_WRITEMASK,
    WebGL2RenderingContext.VIEWPORT,
    WebGL2RenderingContext.SCISSOR_BOX,
    WebGL2RenderingContext.COLOR_CLEAR_VALUE,
    WebGL2RenderingContext.COLOR_WRITEMASK,
    WebGL2RenderingContext.UNPACK_ALIGNMENT,
    WebGL2RenderingContext.PACK_ALIGNMENT,
    WebGL2RenderingContext.MAX_TEXTURE_SIZE,
    WebGL2RenderingContext.MAX_VIEWPORT_DIMS,
    WebGL2RenderingContext.SUBPIXEL_BITS,
    WebGL2RenderingContext.RED_BITS,
    WebGL2RenderingContext.GREEN_BITS,
    WebGL2RenderingContext.BLUE_BITS,
    WebGL2RenderingContext.ALPHA_BITS,
    WebGL2RenderingContext.DEPTH_BITS,
    WebGL2RenderingContext.STENCIL_BITS,
    WebGL2RenderingContext.POLYGON_OFFSET_UNITS,
    WebGL2RenderingContext.POLYGON_OFFSET_FACTOR,
    WebGL2RenderingContext.TEXTURE_BINDING_2D,
    WebGL2RenderingContext.SAMPLE_BUFFERS,
    WebGL2RenderingContext.SAMPLES,
    WebGL2RenderingContext.SAMPLE_COVERAGE_VALUE,
    WebGL2RenderingContext.SAMPLE_COVERAGE_INVERT,
    WebGL2RenderingContext.COMPRESSED_TEXTURE_FORMATS,
    WebGL2RenderingContext.DONT_CARE,
    WebGL2RenderingContext.FASTEST,
    WebGL2RenderingContext.NICEST,
    WebGL2RenderingContext.GENERATE_MIPMAP_HINT,
    WebGL2RenderingContext.BYTE,
    WebGL2RenderingContext.UNSIGNED_BYTE,
    WebGL2RenderingContext.SHORT,
    WebGL2RenderingContext.UNSIGNED_SHORT,
    WebGL2RenderingContext.INT,
    WebGL2RenderingContext.UNSIGNED_INT,
    WebGL2RenderingContext.FLOAT,
    WebGL2RenderingContext.DEPTH_COMPONENT,
    WebGL2RenderingContext.ALPHA,
    WebGL2RenderingContext.RGB,
    WebGL2RenderingContext.RGBA,
    WebGL2RenderingContext.LUMINANCE,
    WebGL2RenderingContext.LUMINANCE_ALPHA,
    WebGL2RenderingContext.UNSIGNED_SHORT_4_4_4_4,
    WebGL2RenderingContext.UNSIGNED_SHORT_5_5_5_1,
    WebGL2RenderingContext.UNSIGNED_SHORT_5_6_5,
    WebGL2RenderingContext.FRAGMENT_SHADER,
    WebGL2RenderingContext.VERTEX_SHADER,
    WebGL2RenderingContext.MAX_VERTEX_ATTRIBS,
    WebGL2RenderingContext.MAX_VERTEX_UNIFORM_VECTORS,
    WebGL2RenderingContext.MAX_VARYING_VECTORS,
    WebGL2RenderingContext.MAX_COMBINED_TEXTURE_IMAGE_UNITS,
    WebGL2RenderingContext.MAX_VERTEX_TEXTURE_IMAGE_UNITS,
    WebGL2RenderingContext.MAX_TEXTURE_IMAGE_UNITS,
    WebGL2RenderingContext.MAX_FRAGMENT_UNIFORM_VECTORS,
    WebGL2RenderingContext.SHADER_TYPE,
    WebGL2RenderingContext.DELETE_STATUS,
    WebGL2RenderingContext.LINK_STATUS,
    WebGL2RenderingContext.VALIDATE_STATUS,
    WebGL2RenderingContext.ATTACHED_SHADERS,
    WebGL2RenderingContext.ACTIVE_UNIFORMS,
    WebGL2RenderingContext.ACTIVE_ATTRIBUTES,
    WebGL2RenderingContext.SHADING_LANGUAGE_VERSION,
    WebGL2RenderingContext.CURRENT_PROGRAM,
    WebGL2RenderingContext.NEVER,
    WebGL2RenderingContext.LESS,
    WebGL2RenderingContext.EQUAL,
    WebGL2RenderingContext.LEQUAL,
    WebGL2RenderingContext.GREATER,
    WebGL2RenderingContext.NOTEQUAL,
    WebGL2RenderingContext.GEQUAL,
    WebGL2RenderingContext.ALWAYS,
    WebGL2RenderingContext.KEEP,
    WebGL2RenderingContext.REPLACE,
    WebGL2RenderingContext.INCR,
    WebGL2RenderingContext.DECR,
    WebGL2RenderingContext.INVERT,
    WebGL2RenderingContext.INCR_WRAP,
    WebGL2RenderingContext.DECR_WRAP,
    WebGL2RenderingContext.VENDOR,
    WebGL2RenderingContext.RENDERER,
    WebGL2RenderingContext.VERSION,
    WebGL2RenderingContext.NEAREST,
    WebGL2RenderingContext.LINEAR,
    WebGL2RenderingContext.NEAREST_MIPMAP_NEAREST,
    WebGL2RenderingContext.LINEAR_MIPMAP_NEAREST,
    WebGL2RenderingContext.NEAREST_MIPMAP_LINEAR,
    WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR,
    WebGL2RenderingContext.TEXTURE_MAG_FILTER,
    WebGL2RenderingContext.TEXTURE_MIN_FILTER,
    WebGL2RenderingContext.TEXTURE_WRAP_S,
    WebGL2RenderingContext.TEXTURE_WRAP_T,
    WebGL2RenderingContext.TEXTURE,
    WebGL2RenderingContext.TEXTURE_CUBE_MAP,
    WebGL2RenderingContext.TEXTURE_BINDING_CUBE_MAP,
    WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X,
    WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X,
    WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y,
    WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z,
    WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    WebGL2RenderingContext.MAX_CUBE_MAP_TEXTURE_SIZE,
    WebGL2RenderingContext.TEXTURE0,
    WebGL2RenderingContext.TEXTURE1,
    WebGL2RenderingContext.TEXTURE2,
    WebGL2RenderingContext.TEXTURE3,
    WebGL2RenderingContext.TEXTURE4,
    WebGL2RenderingContext.TEXTURE5,
    WebGL2RenderingContext.TEXTURE6,
    WebGL2RenderingContext.TEXTURE7,
    WebGL2RenderingContext.TEXTURE8,
    WebGL2RenderingContext.TEXTURE9,
    WebGL2RenderingContext.TEXTURE10,
    WebGL2RenderingContext.TEXTURE11,
    WebGL2RenderingContext.TEXTURE12,
    WebGL2RenderingContext.TEXTURE13,
    WebGL2RenderingContext.TEXTURE14,
    WebGL2RenderingContext.TEXTURE15,
    WebGL2RenderingContext.TEXTURE16,
    WebGL2RenderingContext.TEXTURE17,
    WebGL2RenderingContext.TEXTURE18,
    WebGL2RenderingContext.TEXTURE19,
    WebGL2RenderingContext.TEXTURE20,
    WebGL2RenderingContext.TEXTURE21,
    WebGL2RenderingContext.TEXTURE22,
    WebGL2RenderingContext.TEXTURE23,
    WebGL2RenderingContext.TEXTURE24,
    WebGL2RenderingContext.TEXTURE25,
    WebGL2RenderingContext.TEXTURE26,
    WebGL2RenderingContext.TEXTURE27,
    WebGL2RenderingContext.TEXTURE28,
    WebGL2RenderingContext.TEXTURE29,
    WebGL2RenderingContext.TEXTURE30,
    WebGL2RenderingContext.TEXTURE31,
    WebGL2RenderingContext.ACTIVE_TEXTURE,
    WebGL2RenderingContext.REPEAT,
    WebGL2RenderingContext.CLAMP_TO_EDGE,
    WebGL2RenderingContext.MIRRORED_REPEAT,
    WebGL2RenderingContext.FLOAT_VEC2,
    WebGL2RenderingContext.FLOAT_VEC3,
    WebGL2RenderingContext.FLOAT_VEC4,
    WebGL2RenderingContext.INT_VEC2,
    WebGL2RenderingContext.INT_VEC3,
    WebGL2RenderingContext.INT_VEC4,
    WebGL2RenderingContext.BOOL,
    WebGL2RenderingContext.BOOL_VEC2,
    WebGL2RenderingContext.BOOL_VEC3,
    WebGL2RenderingContext.BOOL_VEC4,
    WebGL2RenderingContext.FLOAT_MAT2,
    WebGL2RenderingContext.FLOAT_MAT3,
    WebGL2RenderingContext.FLOAT_MAT4,
    WebGL2RenderingContext.SAMPLER_2D,
    WebGL2RenderingContext.SAMPLER_CUBE,
    WebGL2RenderingContext.VERTEX_ATTRIB_ARRAY_ENABLED,
    WebGL2RenderingContext.VERTEX_ATTRIB_ARRAY_SIZE,
    WebGL2RenderingContext.VERTEX_ATTRIB_ARRAY_STRIDE,
    WebGL2RenderingContext.VERTEX_ATTRIB_ARRAY_TYPE,
    WebGL2RenderingContext.VERTEX_ATTRIB_ARRAY_NORMALIZED,
    WebGL2RenderingContext.VERTEX_ATTRIB_ARRAY_POINTER,
    WebGL2RenderingContext.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING,
    WebGL2RenderingContext.IMPLEMENTATION_COLOR_READ_TYPE,
    WebGL2RenderingContext.IMPLEMENTATION_COLOR_READ_FORMAT,
    WebGL2RenderingContext.COMPILE_STATUS,
    WebGL2RenderingContext.LOW_FLOAT,
    WebGL2RenderingContext.MEDIUM_FLOAT,
    WebGL2RenderingContext.HIGH_FLOAT,
    WebGL2RenderingContext.LOW_INT,
    WebGL2RenderingContext.MEDIUM_INT,
    WebGL2RenderingContext.HIGH_INT,
    WebGL2RenderingContext.FRAMEBUFFER,
    WebGL2RenderingContext.RENDERBUFFER,
    WebGL2RenderingContext.RGBA4,
    WebGL2RenderingContext.RGB5_A1,
    WebGL2RenderingContext.RGB565,
    WebGL2RenderingContext.DEPTH_COMPONENT16,
    WebGL2RenderingContext.STENCIL_INDEX8,
    WebGL2RenderingContext.DEPTH_STENCIL,
    WebGL2RenderingContext.RENDERBUFFER_WIDTH,
    WebGL2RenderingContext.RENDERBUFFER_HEIGHT,
    WebGL2RenderingContext.RENDERBUFFER_INTERNAL_FORMAT,
    WebGL2RenderingContext.RENDERBUFFER_RED_SIZE,
    WebGL2RenderingContext.RENDERBUFFER_GREEN_SIZE,
    WebGL2RenderingContext.RENDERBUFFER_BLUE_SIZE,
    WebGL2RenderingContext.RENDERBUFFER_ALPHA_SIZE,
    WebGL2RenderingContext.RENDERBUFFER_DEPTH_SIZE,
    WebGL2RenderingContext.RENDERBUFFER_STENCIL_SIZE,
    WebGL2RenderingContext.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE,
    WebGL2RenderingContext.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME,
    WebGL2RenderingContext.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL,
    WebGL2RenderingContext.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE,
    WebGL2RenderingContext.COLOR_ATTACHMENT0,
    WebGL2RenderingContext.DEPTH_ATTACHMENT,
    WebGL2RenderingContext.STENCIL_ATTACHMENT,
    WebGL2RenderingContext.DEPTH_STENCIL_ATTACHMENT,
    WebGL2RenderingContext.NONE,
    WebGL2RenderingContext.FRAMEBUFFER_COMPLETE,
    WebGL2RenderingContext.FRAMEBUFFER_INCOMPLETE_ATTACHMENT,
    WebGL2RenderingContext.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT,
    WebGL2RenderingContext.FRAMEBUFFER_INCOMPLETE_DIMENSIONS,
    WebGL2RenderingContext.FRAMEBUFFER_UNSUPPORTED,
    WebGL2RenderingContext.FRAMEBUFFER_BINDING,
    WebGL2RenderingContext.RENDERBUFFER_BINDING,
    WebGL2RenderingContext.MAX_RENDERBUFFER_SIZE,
    WebGL2RenderingContext.INVALID_FRAMEBUFFER_OPERATION,
    WebGL2RenderingContext.UNPACK_FLIP_Y_WEBGL,
    WebGL2RenderingContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
    WebGL2RenderingContext.CONTEXT_LOST_WEBGL,
    WebGL2RenderingContext.UNPACK_COLORSPACE_CONVERSION_WEBGL,
    WebGL2RenderingContext.BROWSER_DEFAULT_WEBGL,
    WebGL2RenderingContext.READ_BUFFER,
    WebGL2RenderingContext.UNPACK_ROW_LENGTH,
    WebGL2RenderingContext.UNPACK_SKIP_ROWS,
    WebGL2RenderingContext.UNPACK_SKIP_PIXELS,
    WebGL2RenderingContext.PACK_ROW_LENGTH,
    WebGL2RenderingContext.PACK_SKIP_ROWS,
    WebGL2RenderingContext.PACK_SKIP_PIXELS,
    WebGL2RenderingContext.COLOR,
    WebGL2RenderingContext.DEPTH,
    WebGL2RenderingContext.STENCIL,
    WebGL2RenderingContext.RED,
    WebGL2RenderingContext.RGB8,
    WebGL2RenderingContext.RGBA8,
    WebGL2RenderingContext.RGB10_A2,
    WebGL2RenderingContext.TEXTURE_BINDING_3D,
    WebGL2RenderingContext.UNPACK_SKIP_IMAGES,
    WebGL2RenderingContext.UNPACK_IMAGE_HEIGHT,
    WebGL2RenderingContext.TEXTURE_3D,
    WebGL2RenderingContext.TEXTURE_WRAP_R,
    WebGL2RenderingContext.MAX_3D_TEXTURE_SIZE,
    WebGL2RenderingContext.UNSIGNED_INT_2_10_10_10_REV,
    WebGL2RenderingContext.MAX_ELEMENTS_VERTICES,
    WebGL2RenderingContext.MAX_ELEMENTS_INDICES,
    WebGL2RenderingContext.TEXTURE_MIN_LOD,
    WebGL2RenderingContext.TEXTURE_MAX_LOD,
    WebGL2RenderingContext.TEXTURE_BASE_LEVEL,
    WebGL2RenderingContext.TEXTURE_MAX_LEVEL,
    WebGL2RenderingContext.MIN,
    WebGL2RenderingContext.MAX,
    WebGL2RenderingContext.DEPTH_COMPONENT24,
    WebGL2RenderingContext.MAX_TEXTURE_LOD_BIAS,
    WebGL2RenderingContext.TEXTURE_COMPARE_MODE,
    WebGL2RenderingContext.TEXTURE_COMPARE_FUNC,
    WebGL2RenderingContext.CURRENT_QUERY,
    WebGL2RenderingContext.QUERY_RESULT,
    WebGL2RenderingContext.QUERY_RESULT_AVAILABLE,
    WebGL2RenderingContext.STREAM_READ,
    WebGL2RenderingContext.STREAM_COPY,
    WebGL2RenderingContext.STATIC_READ,
    WebGL2RenderingContext.STATIC_COPY,
    WebGL2RenderingContext.DYNAMIC_READ,
    WebGL2RenderingContext.DYNAMIC_COPY,
    WebGL2RenderingContext.MAX_DRAW_BUFFERS,
    WebGL2RenderingContext.DRAW_BUFFER0,
    WebGL2RenderingContext.DRAW_BUFFER1,
    WebGL2RenderingContext.DRAW_BUFFER2,
    WebGL2RenderingContext.DRAW_BUFFER3,
    WebGL2RenderingContext.DRAW_BUFFER4,
    WebGL2RenderingContext.DRAW_BUFFER5,
    WebGL2RenderingContext.DRAW_BUFFER6,
    WebGL2RenderingContext.DRAW_BUFFER7,
    WebGL2RenderingContext.DRAW_BUFFER8,
    WebGL2RenderingContext.DRAW_BUFFER9,
    WebGL2RenderingContext.DRAW_BUFFER10,
    WebGL2RenderingContext.DRAW_BUFFER11,
    WebGL2RenderingContext.DRAW_BUFFER12,
    WebGL2RenderingContext.DRAW_BUFFER13,
    WebGL2RenderingContext.DRAW_BUFFER14,
    WebGL2RenderingContext.DRAW_BUFFER15,
    WebGL2RenderingContext.MAX_FRAGMENT_UNIFORM_COMPONENTS,
    WebGL2RenderingContext.MAX_VERTEX_UNIFORM_COMPONENTS,
    WebGL2RenderingContext.SAMPLER_3D,
    WebGL2RenderingContext.SAMPLER_2D_SHADOW,
    WebGL2RenderingContext.FRAGMENT_SHADER_DERIVATIVE_HINT,
    WebGL2RenderingContext.PIXEL_PACK_BUFFER,
    WebGL2RenderingContext.PIXEL_UNPACK_BUFFER,
    WebGL2RenderingContext.PIXEL_PACK_BUFFER_BINDING,
    WebGL2RenderingContext.PIXEL_UNPACK_BUFFER_BINDING,
    WebGL2RenderingContext.FLOAT_MAT2x3,
    WebGL2RenderingContext.FLOAT_MAT2x4,
    WebGL2RenderingContext.FLOAT_MAT3x2,
    WebGL2RenderingContext.FLOAT_MAT3x4,
    WebGL2RenderingContext.FLOAT_MAT4x2,
    WebGL2RenderingContext.FLOAT_MAT4x3,
    WebGL2RenderingContext.SRGB,
    WebGL2RenderingContext.SRGB8,
    WebGL2RenderingContext.SRGB8_ALPHA8,
    WebGL2RenderingContext.COMPARE_REF_TO_TEXTURE,
    WebGL2RenderingContext.RGBA32F,
    WebGL2RenderingContext.RGB32F,
    WebGL2RenderingContext.RGBA16F,
    WebGL2RenderingContext.RGB16F,
    WebGL2RenderingContext.VERTEX_ATTRIB_ARRAY_INTEGER,
    WebGL2RenderingContext.MAX_ARRAY_TEXTURE_LAYERS,
    WebGL2RenderingContext.MIN_PROGRAM_TEXEL_OFFSET,
    WebGL2RenderingContext.MAX_PROGRAM_TEXEL_OFFSET,
    WebGL2RenderingContext.MAX_VARYING_COMPONENTS,
    WebGL2RenderingContext.TEXTURE_2D_ARRAY,
    WebGL2RenderingContext.TEXTURE_BINDING_2D_ARRAY,
    WebGL2RenderingContext.R11F_G11F_B10F,
    WebGL2RenderingContext.UNSIGNED_INT_10F_11F_11F_REV,
    WebGL2RenderingContext.RGB9_E5,
    WebGL2RenderingContext.UNSIGNED_INT_5_9_9_9_REV,
    WebGL2RenderingContext.TRANSFORM_FEEDBACK_BUFFER_MODE,
    WebGL2RenderingContext.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS,
    WebGL2RenderingContext.TRANSFORM_FEEDBACK_VARYINGS,
    WebGL2RenderingContext.TRANSFORM_FEEDBACK_BUFFER_START,
    WebGL2RenderingContext.TRANSFORM_FEEDBACK_BUFFER_SIZE,
    WebGL2RenderingContext.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN,
    WebGL2RenderingContext.RASTERIZER_DISCARD,
    WebGL2RenderingContext.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS,
    WebGL2RenderingContext.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS,
    WebGL2RenderingContext.INTERLEAVED_ATTRIBS,
    WebGL2RenderingContext.SEPARATE_ATTRIBS,
    WebGL2RenderingContext.TRANSFORM_FEEDBACK_BUFFER,
    WebGL2RenderingContext.TRANSFORM_FEEDBACK_BUFFER_BINDING,
    WebGL2RenderingContext.RGBA32UI,
    WebGL2RenderingContext.RGB32UI,
    WebGL2RenderingContext.RGBA16UI,
    WebGL2RenderingContext.RGB16UI,
    WebGL2RenderingContext.RGBA8UI,
    WebGL2RenderingContext.RGB8UI,
    WebGL2RenderingContext.RGBA32I,
    WebGL2RenderingContext.RGB32I,
    WebGL2RenderingContext.RGBA16I,
    WebGL2RenderingContext.RGB16I,
    WebGL2RenderingContext.RGBA8I,
    WebGL2RenderingContext.RGB8I,
    WebGL2RenderingContext.RED_INTEGER,
    WebGL2RenderingContext.RGB_INTEGER,
    WebGL2RenderingContext.RGBA_INTEGER,
    WebGL2RenderingContext.SAMPLER_2D_ARRAY,
    WebGL2RenderingContext.SAMPLER_2D_ARRAY_SHADOW,
    WebGL2RenderingContext.SAMPLER_CUBE_SHADOW,
    WebGL2RenderingContext.UNSIGNED_INT_VEC2,
    WebGL2RenderingContext.UNSIGNED_INT_VEC3,
    WebGL2RenderingContext.UNSIGNED_INT_VEC4,
    WebGL2RenderingContext.INT_SAMPLER_2D,
    WebGL2RenderingContext.INT_SAMPLER_3D,
    WebGL2RenderingContext.INT_SAMPLER_CUBE,
    WebGL2RenderingContext.INT_SAMPLER_2D_ARRAY,
    WebGL2RenderingContext.UNSIGNED_INT_SAMPLER_2D,
    WebGL2RenderingContext.UNSIGNED_INT_SAMPLER_3D,
    WebGL2RenderingContext.UNSIGNED_INT_SAMPLER_CUBE,
    WebGL2RenderingContext.UNSIGNED_INT_SAMPLER_2D_ARRAY,
    WebGL2RenderingContext.DEPTH_COMPONENT32F,
    WebGL2RenderingContext.DEPTH32F_STENCIL8,
    WebGL2RenderingContext.FLOAT_32_UNSIGNED_INT_24_8_REV,
    WebGL2RenderingContext.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING,
    WebGL2RenderingContext.FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE,
    WebGL2RenderingContext.FRAMEBUFFER_ATTACHMENT_RED_SIZE,
    WebGL2RenderingContext.FRAMEBUFFER_ATTACHMENT_GREEN_SIZE,
    WebGL2RenderingContext.FRAMEBUFFER_ATTACHMENT_BLUE_SIZE,
    WebGL2RenderingContext.FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE,
    WebGL2RenderingContext.FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE,
    WebGL2RenderingContext.FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE,
    WebGL2RenderingContext.FRAMEBUFFER_DEFAULT,
    WebGL2RenderingContext.UNSIGNED_INT_24_8,
    WebGL2RenderingContext.DEPTH24_STENCIL8,
    WebGL2RenderingContext.UNSIGNED_NORMALIZED,
    WebGL2RenderingContext.DRAW_FRAMEBUFFER_BINDING,
    WebGL2RenderingContext.READ_FRAMEBUFFER,
    WebGL2RenderingContext.DRAW_FRAMEBUFFER,
    WebGL2RenderingContext.READ_FRAMEBUFFER_BINDING,
    WebGL2RenderingContext.RENDERBUFFER_SAMPLES,
    WebGL2RenderingContext.FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER,
    WebGL2RenderingContext.MAX_COLOR_ATTACHMENTS,
    WebGL2RenderingContext.COLOR_ATTACHMENT1,
    WebGL2RenderingContext.COLOR_ATTACHMENT2,
    WebGL2RenderingContext.COLOR_ATTACHMENT3,
    WebGL2RenderingContext.COLOR_ATTACHMENT4,
    WebGL2RenderingContext.COLOR_ATTACHMENT5,
    WebGL2RenderingContext.COLOR_ATTACHMENT6,
    WebGL2RenderingContext.COLOR_ATTACHMENT7,
    WebGL2RenderingContext.COLOR_ATTACHMENT8,
    WebGL2RenderingContext.COLOR_ATTACHMENT9,
    WebGL2RenderingContext.COLOR_ATTACHMENT10,
    WebGL2RenderingContext.COLOR_ATTACHMENT11,
    WebGL2RenderingContext.COLOR_ATTACHMENT12,
    WebGL2RenderingContext.COLOR_ATTACHMENT13,
    WebGL2RenderingContext.COLOR_ATTACHMENT14,
    WebGL2RenderingContext.COLOR_ATTACHMENT15,
    WebGL2RenderingContext.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE,
    WebGL2RenderingContext.MAX_SAMPLES,
    WebGL2RenderingContext.HALF_FLOAT,
    WebGL2RenderingContext.RG,
    WebGL2RenderingContext.RG_INTEGER,
    WebGL2RenderingContext.R8,
    WebGL2RenderingContext.RG8,
    WebGL2RenderingContext.R16F,
    WebGL2RenderingContext.R32F,
    WebGL2RenderingContext.RG16F,
    WebGL2RenderingContext.RG32F,
    WebGL2RenderingContext.R8I,
    WebGL2RenderingContext.R8UI,
    WebGL2RenderingContext.R16I,
    WebGL2RenderingContext.R16UI,
    WebGL2RenderingContext.R32I,
    WebGL2RenderingContext.R32UI,
    WebGL2RenderingContext.RG8I,
    WebGL2RenderingContext.RG8UI,
    WebGL2RenderingContext.RG16I,
    WebGL2RenderingContext.RG16UI,
    WebGL2RenderingContext.RG32I,
    WebGL2RenderingContext.RG32UI,
    WebGL2RenderingContext.VERTEX_ARRAY_BINDING,
    WebGL2RenderingContext.R8_SNORM,
    WebGL2RenderingContext.RG8_SNORM,
    WebGL2RenderingContext.RGB8_SNORM,
    WebGL2RenderingContext.RGBA8_SNORM,
    WebGL2RenderingContext.SIGNED_NORMALIZED,
    WebGL2RenderingContext.COPY_READ_BUFFER,
    WebGL2RenderingContext.COPY_WRITE_BUFFER,
    WebGL2RenderingContext.COPY_READ_BUFFER_BINDING,
    WebGL2RenderingContext.COPY_WRITE_BUFFER_BINDING,
    WebGL2RenderingContext.UNIFORM_BUFFER,
    WebGL2RenderingContext.UNIFORM_BUFFER_BINDING,
    WebGL2RenderingContext.UNIFORM_BUFFER_START,
    WebGL2RenderingContext.UNIFORM_BUFFER_SIZE,
    WebGL2RenderingContext.MAX_VERTEX_UNIFORM_BLOCKS,
    WebGL2RenderingContext.MAX_FRAGMENT_UNIFORM_BLOCKS,
    WebGL2RenderingContext.MAX_COMBINED_UNIFORM_BLOCKS,
    WebGL2RenderingContext.MAX_UNIFORM_BUFFER_BINDINGS,
    WebGL2RenderingContext.MAX_UNIFORM_BLOCK_SIZE,
    WebGL2RenderingContext.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS,
    WebGL2RenderingContext.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS,
    WebGL2RenderingContext.UNIFORM_BUFFER_OFFSET_ALIGNMENT,
    WebGL2RenderingContext.ACTIVE_UNIFORM_BLOCKS,
    WebGL2RenderingContext.UNIFORM_TYPE,
    WebGL2RenderingContext.UNIFORM_SIZE,
    WebGL2RenderingContext.UNIFORM_BLOCK_INDEX,
    WebGL2RenderingContext.UNIFORM_OFFSET,
    WebGL2RenderingContext.UNIFORM_ARRAY_STRIDE,
    WebGL2RenderingContext.UNIFORM_MATRIX_STRIDE,
    WebGL2RenderingContext.UNIFORM_IS_ROW_MAJOR,
    WebGL2RenderingContext.UNIFORM_BLOCK_BINDING,
    WebGL2RenderingContext.UNIFORM_BLOCK_DATA_SIZE,
    WebGL2RenderingContext.UNIFORM_BLOCK_ACTIVE_UNIFORMS,
    WebGL2RenderingContext.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES,
    WebGL2RenderingContext.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER,
    WebGL2RenderingContext.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER,
    WebGL2RenderingContext.INVALID_INDEX,
    WebGL2RenderingContext.MAX_VERTEX_OUTPUT_COMPONENTS,
    WebGL2RenderingContext.MAX_FRAGMENT_INPUT_COMPONENTS,
    WebGL2RenderingContext.MAX_SERVER_WAIT_TIMEOUT,
    WebGL2RenderingContext.OBJECT_TYPE,
    WebGL2RenderingContext.SYNC_CONDITION,
    WebGL2RenderingContext.SYNC_STATUS,
    WebGL2RenderingContext.SYNC_FLAGS,
    WebGL2RenderingContext.SYNC_FENCE,
    WebGL2RenderingContext.SYNC_GPU_COMMANDS_COMPLETE,
    WebGL2RenderingContext.UNSIGNALED,
    WebGL2RenderingContext.SIGNALED,
    WebGL2RenderingContext.ALREADY_SIGNALED,
    WebGL2RenderingContext.TIMEOUT_EXPIRED,
    WebGL2RenderingContext.CONDITION_SATISFIED,
    WebGL2RenderingContext.WAIT_FAILED,
    WebGL2RenderingContext.SYNC_FLUSH_COMMANDS_BIT,
    WebGL2RenderingContext.VERTEX_ATTRIB_ARRAY_DIVISOR,
    WebGL2RenderingContext.ANY_SAMPLES_PASSED,
    WebGL2RenderingContext.ANY_SAMPLES_PASSED_CONSERVATIVE,
    WebGL2RenderingContext.SAMPLER_BINDING,
    WebGL2RenderingContext.RGB10_A2UI,
    WebGL2RenderingContext.INT_2_10_10_10_REV,
    WebGL2RenderingContext.TRANSFORM_FEEDBACK,
    WebGL2RenderingContext.TRANSFORM_FEEDBACK_PAUSED,
    WebGL2RenderingContext.TRANSFORM_FEEDBACK_ACTIVE,
    WebGL2RenderingContext.TRANSFORM_FEEDBACK_BINDING,
    WebGL2RenderingContext.TEXTURE_IMMUTABLE_FORMAT,
    WebGL2RenderingContext.MAX_ELEMENT_INDEX,
    WebGL2RenderingContext.TEXTURE_IMMUTABLE_LEVELS,
    WebGL2RenderingContext.TIMEOUT_IGNORED,
    WebGL2RenderingContext.MAX_CLIENT_WAIT_TIMEOUT_WEBGL
    ];
    // Object.freeze(window.__WEBGL_PARAM_WHITELIST__);
        
    window.__EXTENSIONS_WHITELIST__ = [
    "EXT_clip_control",
    "EXT_color_buffer_float",
    "EXT_color_buffer_half_float",
    "EXT_conservative_depth",
    "EXT_depth_clamp",
    "EXT_disjoint_timer_query_webgl2",
    "EXT_float_blend",
    "EXT_polygon_offset_clamp",
    "EXT_render_snorm",
    "EXT_texture_compression_bptc",
    "EXT_texture_compression_rgtc",
    "EXT_texture_filter_anisotropic",
    "EXT_texture_mirror_clamp_to_edge",
    "EXT_texture_norm16",
    "KHR_parallel_shader_compile",
    "NV_shader_noperspective_interpolation",
    "OES_draw_buffers_indexed",
    "OES_sample_variables",
    "OES_shader_multisample_interpolation",
    "OES_texture_float_linear",
    "OVR_multiview2",
    "WEBGL_blend_func_extended",
    "WEBGL_clip_cull_distance",
    "WEBGL_compressed_texture_s3tc",
    "WEBGL_compressed_texture_s3tc_srgb",
    "WEBGL_debug_renderer_info",
    "WEBGL_debug_shaders",
    "WEBGL_lose_context",
    "WEBGL_multi_draw",
    "WEBGL_polygon_mode",
    "WEBGL_provoking_vertex",
    "WEBGL_stencil_texturing"
    ];
    // Object.freeze(window.__EXTENSIONS_WHITELIST__);
    console.log('[WebGLPatchModule] Whitelist loaded');
}}  



;
function WebglPatchModule(window) {
  if (!window.__PATCH_WEBGL__) {
    window.__PATCH_WEBGL__ = true;
    const C = window.CanvasPatchContext;
    if (!C) throw new Error(' WebglPatchModule] CanvasPatchContext is undefined — registration is not available');
    // basic random from the existing seed initialization
    const R = window.rand.use('webgl');
    if (typeof R !== 'function') {
      throw new Error('[WebGLPatchModule] "R" is not initialized');
    }
    
    
    // Internal marker: avoid leaving visible properties on native functions/prototypes
    const __webglShaderSourcePatchedProtos__ = (typeof WeakSet === 'function') ? new WeakSet() : null;
    function noiseAt(x, y, w, h) {
      const mix = (((x*73856093) ^ (y*19349663) ^ (w*83492791) ^ (h*2654435761)) >>> 0);
      const r = R()
      return ((r - 0.5) * 3) | 0;       // integral shift [-1..+1]
    }

    // 1) VENDOR/RENDERER replacement
  function webglGetParameterMask(orig, pname, ...args) {
    let dbg = null;
    try { dbg = this.getExtension('WEBGL_debug_renderer_info'); } catch(e){}
    if (dbg) {
        if (pname === dbg.UNMASKED_VENDOR_WEBGL)   return window.__WEBGL_UNMASKED_VENDOR__;
        if (pname === dbg.UNMASKED_RENDERER_WEBGL) return window.__WEBGL_UNMASKED_RENDERER__;
    }
    if (pname === this.VENDOR   || pname === 0x1F00) return window.__WEBGL_VENDOR__;
    if (pname === this.RENDERER || pname === 0x1F01) return window.__WEBGL_RENDERER__;
    //others - do not touch
    return;  // undefined → The original will work out
    }
  // 2) Хук «whitelist-фильтра»
  function webglWhitelistParameterHook(orig, pname, ...args) {
    const wl = Array.isArray(window.__WEBGL_PARAM_WHITELIST__)
      ? window.__WEBGL_PARAM_WHITELIST__ : [];

    //Allowed parameters - we let the original (patchMethodThen it will call orig)
    if (wl.length === 0 || wl.includes(pname)) {
      return; // undefined → pass-through to orig.apply(this, args)
    }
    // We mask prohibited parameters like driver answer (without throw)
    return; // driver-like: error as null
  }
    // === 2. getSupportedExtensions ===
  function webglGetSupportedExtensionsPatch(orig, ...args) {
    const whitelist = Array.isArray(window.__EXTENSIONS_WHITELIST__)
      ? window.__EXTENSIONS_WHITELIST__ : [];

    const res = orig.apply(this, args);
    if (!Array.isArray(res)) return res;

    return res.filter(ext => whitelist.includes(ext));
  }

  function webglGetExtensionPatch(orig, name, ...rest) {
    const whitelist = Array.isArray(window.__EXTENSIONS_WHITELIST__)
      ? window.__EXTENSIONS_WHITELIST__ : [];
    if (!whitelist.includes(name)) return null;
    const res = orig.call(this, name, ...rest);
    //  WEBGL_debug_renderer_info
    if (name === 'WEBGL_debug_renderer_info' &&
        res && typeof res === 'object' &&
        !res.WebGLInstance_DebugInfoPatched__) {

      if (typeof res.getParameter === 'function') {
        const origGetParameter = res.getParameter;
        res.getParameter = function(pname) {
          if (pname === this.UNMASKED_VENDOR_WEBGL)
            return window.__WEBGL_UNMASKED_VENDOR__;
          if (pname === this.UNMASKED_RENDERER_WEBGL)
            return window.__WEBGL_UNMASKED_RENDERER__;
          return origGetParameter.call(this, pname);
        };
      }
      res.WebGLInstance_DebugInfoPatched__ = true;
    }
    return res;
  }

  // === 4.context patch (shaderSource → selective downgrade) ===
  function webglGetContextPatch(res, kind, ...args) {
    // If already patched or empty, immediately return
    if (!res || res.WebGLInstance_GPUPatched__) return res;

    const proto = Object.getPrototypeOf(res);
    if (kind && ['webgl', 'experimental-webgl', 'webgl2'].includes(kind)) {
            if (proto && proto.shaderSource && !(__webglShaderSourcePatchedProtos__ && __webglShaderSourcePatchedProtos__.has(proto))) {
        const orig = proto.shaderSource;
        // НИЧЕГО НЕ МЕНЯЕМ ЗДЕСЬ — вся precision-политика уедет в webglShaderSourceHook
        const wrapped = ({ shaderSource(shader, src) {
          return orig.call(this, shader, src);
        } }).shaderSource;
        if (typeof window.markAsNative === 'function') { try { window.markAsNative(wrapped, 'shaderSource'); } catch {} }
        proto.shaderSource = wrapped;
        if (__webglShaderSourcePatchedProtos__) __webglShaderSourcePatchedProtos__.add(proto);
      }
res.WebGLInstance_GPUPatched__ = true;
    }
    return res;
  }

  // === 5) anti‑FP hooks  ===
  function webglReadPixelsHook(orig, x, y, w, h, format, type, buffer) {
    const r = orig.call(this, x, y, w, h, format, type, buffer);
    if (!buffer) return r;
    for (let row=0, i=0; row<h; row++){
      for (let col=0; col<w; col++, i+=4){
        const v = noiseAt(col,row,w,h);
        buffer[i]   += v;
        buffer[i+1] += v;
        buffer[i+2] += v;
      }
    }
    return r;
  }

  function webglGetShaderPrecisionFormatHook(orig, shaderType, precisionType) {
    const res = orig.call(this, shaderType, precisionType);
    if (!res) return res;
    const v = (R() - 0.5);
    return {
      rangeMin: Math.round(res.rangeMin + v),
      rangeMax: Math.round(res.rangeMax + v),
      precision: Math.round(res.precision + v)
    };
  }

  function webglShaderSourceHook(orig, shader, src) {
    if (typeof src !== 'string') return; // undefined → patchMethod Calls orig(shader, src)

    try {
      // Unified precision policy by default: vertex="mediump", fragment="highp"
      // You can redefine through window._precisionPolicy = { vertex, fragment, mode }
      // mode: "float-only" (только precision-строки) | "smart"(by default: precision-strings + safe fallback \bhighp\b)
      const pol   = (typeof window !== 'undefined' && window._precisionPolicy) || {};
      const vPol  = String(pol.vertex   || 'mediump').toLowerCase();
      const fPol  = String(pol.fragment || 'highp').toLowerCase();
      const mode  = String(pol.mode     || 'smart').toLowerCase();

      const type = this.getShaderParameter(shader, this.SHADER_TYPE);
      //Helper for replacement precision-strings (+ при "smart" — общий fallback)
      const applyPolicy = (source, targetPrec) => {
        let out = source
          .replace(/\bprecision\s+highp\s+float\b/g, `precision ${targetPrec} float`)
          .replace(/\bprecision\s+highp\s+int\b/g,   `precision ${targetPrec} int`);
        if (mode !== 'float-only') {
          // safe fallback for old shadeers, where it 'highp' could be found
          out = out.replace(/\bhighp\b/g, targetPrec);
        }
        return out;
      };

      if (type === this.VERTEX_SHADER) {
        // We only degrade VERTEX (anti-FP of geometries), We do not touch the palette
        const downgraded = applyPolicy(src, vPol);
        return [shader, downgraded];
      }

      if (type === this.FRAGMENT_SHADER) {
        //By default, we do not touch the fragment, so as not to get banding/small palette
        if (fPol !== 'highp') {
          const adjusted = applyPolicy(src, fPol);
          return [shader, adjusted];
        }
        // otherwise - unchanged
        return; // undefined → pass-through
      }

      // Other types - unchanged
      return;

    } catch (_) {
      // for any malfunction case - return the original without modifications
      return;
    }
  }

  function webglGetUniformHook(orig, program, location) {
    const res = orig.call(this, program, location);
    if (typeof res === 'number' && typeof R === 'function') {
      return res + (R() - 0.5) * 1e-4;
    }
    return res;
  }

  // === 6.export hooks to context.js ===
  window.webglHooks = {
    webglGetParameterMask,
    webglWhitelistParameterHook,
    webglGetSupportedExtensionsPatch,
    webglGetExtensionPatch,
    webglGetContextPatch,
    webglReadPixelsHook,
    webglGetShaderPrecisionFormatHook,
    webglShaderSourceHook,
    webglGetUniformHook
  };
    console.log('[WebGLPatchModule] WebglPatchModule applied');
}
}













// **
// Why so?

// patchMethod in the context of WebGL when patching getParameter first takes result = orig(this, args) and passes it to the hook as the first argument.
// If the hook returns undefined, patchMethod continues the cycle and ultimately returns result (the original response).
// If the hook returns null or any other value, that value will be substituted for the original.






;
// WebgpuWL.js
function WebgpuWLBootstrap() {
  if (!window.__WEBGPU_WHITELIST__) {
  window.__WEBGPU_WHITELIST__ = true;

  const C = window.CanvasPatchContext;
    if (!C) throw new Error('[WebGPUPatch] CanvasPatchContext is undefined — no further execution');

  // === FEATURES WHITELIST (use YOR device specification list) ===
  const STABLE_FEATURES = [
    'depth-clip-control',
    'depth32float-stencil8',
    'texture-compression-bc',
    'texture-compression-etc2',
    'texture-compression-astc',
    'timestamp-query',
    'indirect-first-instance',
    'shader-f16',
    'rg11b10ufloat-renderable',
    'bgra8unorm-storage',
    'float32-filterable',
    'float32-blendable',
  ];
  const EXPERIMENTAL_FEATURES = [
    'clip-distances','dual-source-blending','subgroups','subgroups-f16',
    'texture-component-swizzle','texture-formats-tier1','texture-formats-tier2',
    'chromium-experimental-timestamp-query-inside-passes',
    'chromium-experimental-subgroups',
    'chromium-experimental-subgroup-uniform-control-flow',
    'chromium-experimental-multi-draw-indirect',
    'chromium-experimental-unorm16-texture-formats',
    'chromium-experimental-snorm16-texture-formats',
    'chromium-experimental-primitive-id'
  ];
  window.__WEBGPU_FEATURES_WHITELIST__ = [
    ...STABLE_FEATURES,
    ...(window.__ALLOW_CHROMIUM_EXPERIMENTAL__ ? EXPERIMENTAL_FEATURES : [])
  ];

  // === LIMITS WHITELIST (use Only YOR device specification) ===
  window.__WEBGPU_LIMITS_WHITELIST__ = [
    'maxTextureDimension1D','maxTextureDimension2D','maxTextureDimension3D',
    'maxTextureArrayLayers','maxBindGroups','maxBindingsPerBindGroup',
    'maxDynamicUniformBuffersPerPipelineLayout','maxDynamicStorageBuffersPerPipelineLayout',
    'maxSampledTexturesPerShaderStage','maxSamplersPerShaderStage',
    'maxStorageBuffersPerShaderStage','maxStorageTexturesPerShaderStage',
    'maxUniformBuffersPerShaderStage','maxUniformBufferBindingSize',
    'maxStorageBufferBindingSize','minUniformBufferOffsetAlignment',
    'minStorageBufferOffsetAlignment','maxVertexBuffers','maxBufferSize',
    'maxVertexAttributes','maxVertexBufferArrayStride',
    'maxInterStageShaderVariables','maxColorAttachments',
    'maxColorAttachmentBytesPerSample','maxComputeWorkgroupStorageSize',
    'maxComputeInvocationsPerWorkgroup','maxComputeWorkgroupSizeX',
    'maxComputeWorkgroupSizeY','maxComputeWorkgroupSizeZ',
    'maxComputeWorkgroupsPerDimension'
  ];

  // === TEXTURE FORMATS WHITELIST (as it is, without "guessing") ===
  window.__WEBGPU_FORMATS_WHITELIST__ = window.__WEBGPU_FORMATS_WHITELIST__ || [
    'r8unorm','r8snorm','r8uint','r8sint',
    'rg8unorm','rg8snorm','rg8uint','rg8sint',
    'rgba8unorm','rgba8unorm-srgb','rgba8snorm','rgba8uint','rgba8sint',
    'bgra8unorm','bgra8unorm-srgb',
    'r16uint','r16sint','r16float',
    'rg16uint','rg16sint','rg16float',
    'rgba16uint','rgba16sint','rgba16float',
    'r32uint','r32sint','r32float',
    'rg32uint','rg32sint','rg32float',
    'rgba32uint','rgba32sint','rgba32float',
    'rgb10a2unorm','rgb10a2uint','rg11b10ufloat','rgb9e5ufloat',
    'depth16unorm','depth24plus','depth24plus-stencil8','depth32float','stencil8',
    'bc1-rgba-unorm','bc1-rgba-unorm-srgb','bc2-rgba-unorm','bc2-rgba-unorm-srgb',
    'bc3-rgba-unorm','bc3-rgba-unorm-srgb','bc4-r-unorm','bc4-r-snorm',
    'bc5-rg-unorm','bc5-rg-snorm','bc6h-rgb-ufloat','bc6h-rgb-float',
    'bc7-rgba-unorm','bc7-rgba-unorm-srgb',
    'etc2-rgb8unorm','etc2-rgb8unorm-srgb','etc2-rgb8a1unorm','etc2-rgb8a1unorm-srgb',
    'etc2-rgba8unorm','etc2-rgba8unorm-srgb','eac-r11unorm','eac-r11snorm',
    'eac-rg11unorm','eac-rg11snorm',
    'astc-4x4-unorm','astc-4x4-unorm-srgb','astc-5x4-unorm','astc-5x4-unorm-srgb',
    'astc-5x5-unorm','astc-5x5-unorm-srgb','astc-6x5-unorm','astc-6x5-unorm-srgb',
    'astc-6x6-unorm','astc-6x6-unorm-srgb','astc-8x5-unorm','astc-8x5-unorm-srgb',
    'astc-8x6-unorm','astc-8x6-unorm-srgb','astc-8x8-unorm','astc-8x8-unorm-srgb',
    'astc-10x5-unorm','astc-10x5-unorm-srgb','astc-10x6-unorm','astc-10x6-unorm-srgb',
    'astc-10x8-unorm','astc-10x8-unorm-srgb','astc-10x10-unorm','astc-10x10-unorm-srgb',
    'astc-12x10-unorm','astc-12x10-unorm-srgb','astc-12x12-unorm','astc-12x12-unorm-srgb'
  ];

  // === Snapshot helper ===
  window.__collectWebGPUSnapshot__ = async function collectWebGPUSnapshot() {
    if (!('gpu' in navigator)) return { error: 'WebGPU not available' };
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' })
                  || await navigator.gpu.requestAdapter();
    if (!adapter) return { error: 'No adapter' };

    let adapterInfo = null;
    if (typeof adapter.requestAdapterInfo === 'function') {
      try { adapterInfo = await adapter.requestAdapterInfo(); } catch (_) {}
    }

    const device = await adapter.requestDevice();

    // combine the native features of the adapter and device, then filter WL
    const nativeFeatures = new Set([ ...adapter.features, ...device.features ]);
    const features = (window.__WEBGPU_FEATURES_WHITELIST__ || [])
      .filter(f => nativeFeatures.has(f));

    const pickLimits = (limits) => {
      const out = {};
      for (const k of (window.__WEBGPU_LIMITS_WHITELIST__ || [])) {
        if (k in limits) out[k] = limits[k];
      }
      return out;
    };
    const adapterLimits = pickLimits(adapter.limits || {});
    const deviceLimits  = pickLimits(device.limits || {});

    const formats = (window.__WEBGPU_FORMATS_WHITELIST__ || []).slice();
    const preferredCanvasFormat = navigator.gpu.getPreferredCanvasFormat();

    const summary = {
      preferredCanvasFormat,
      isFallbackAdapter: adapter.isFallbackAdapter ?? null
    };

    return (window.__WEBGPU_SNAPSHOT__ = {
      adapterInfo, features, formats,
      adapterLimits, deviceLimits, summary
    });
  };
}
  console.log('[WebGPUPatchModule] WL ready & snapshot installed');
}

;
function WebGPUPatchModule() {
  if (!window.__PATCH_WEBGPU__) {
    window.__PATCH_WEBGPU__ = true;
    const C = window.CanvasPatchContext;
      if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — module is registration is not available');
    const markNative = (function() {
      const ensure = typeof window.__ensureMarkAsNative === 'function'
        ? window.__ensureMarkAsNative
        : null;
      const m = ensure ? ensure() : window.markAsNative;
      if (typeof m !== 'function') {
        throw new Error('[WebGPUPatchModule] markAsNative missing');
      }
      return m;
    })();
    const definePatchedValue = (target, key, value, label) => {
      const d = Object.getOwnPropertyDescriptor(target, key)
        || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target) || {}, key);
      if (!d) throw new Error(`[WebGPU] ${label || key} descriptor missing`);
      Object.defineProperty(target, key, {
        value,
        configurable: d.configurable,
        enumerable: d.enumerable,
        writable: d.writable
      });
    };

     // --- Определение браузера ---
    function getBrowser() {
        const ua = navigator.userAgent;
        if (/Safari/.test(ua) && !/Chrome/.test(ua)) return "safari";
        if (/Edg\//.test(ua)) return "edge";
        if (/Chrome/.test(ua)) return "chrome";
        return "other";
    }

    const WHITELISTS = {
        chrome: { ADAPTER: [
            "vendor","description","architecture","device","label",
            "name","adapterType","driverVersion","isFallbackAdapter",
            "limits","features","requestDevice"
        ], DEVICE: [
            "limits","features","label","lost","createTexture",
        ]},
        edge:   { ADAPTER: [
            "vendor","description","architecture","device","label",
            "adapterType","driverVersion","isFallbackAdapter",
            "limits","features","requestDevice"
        ], DEVICE: [
            "limits","features","label","lost","createTexture",
        ]},
        safari: { ADAPTER: [
            "vendor","description","device","label",
            "adapterType","isFallbackAdapter","limits","features",
            "requestDevice"
        ], DEVICE: [
            "limits","features","label","createTexture",
        ]},
        other:  { ADAPTER: [
            "vendor","description","device","label","limits","features",
            "requestDevice"
        ], DEVICE: [
            "limits","features","createTexture","then"
        ]}
    };
    const browser = getBrowser();
    const ADAPTER_WHITELIST = WHITELISTS[browser]?.ADAPTER || WHITELISTS.other.ADAPTER;
    const DEVICE_WHITELIST  = WHITELISTS[browser]?.DEVICE  || WHITELISTS.other.DEVICE;

    // ===  Система логирования  ===
    if (!window.__WEBGPU_LOGS__) window.__WEBGPU_LOGS__ = [];
    function logAccess(type, prop) {
      if (prop === 'then') return; // избегаем шума от Promise
      (window.__WEBGPU_LOGS__ || (window.__WEBGPU_LOGS__ = []))
        .push({ type, prop, time: Date.now() });
      if (window.__DEBUG__) console.warn(`[WebGPU][${type}] access: ${String(prop)}`);
    }
  
    // Хелперы пересечения множеств (используемся ТОЛЬКО для features)
    function __toSet(x){
      return new Set(Array.isArray(x) ? x : (x instanceof Set ? Array.from(x) : []));
    }
    function __intersectSets(a,b){
      const A = __toSet(a); const B = __toSet(b); const out = new Set();
      for (const v of A) if (B.has(v)) out.add(v);
      return out;
    }
    // Примечание по Texture Format Capabilities:
    // в рамках интеграции ИТЕРАТО-блока мы НЕ меняем поведение createTexture и не вводим новые поля,
    // а лишь сохраняем текущую логику ORIGwebgpu.js. WL форматов (если объявлен где-то глобально)
    // остаётся внешним фильтром; поведение не изменяется.
    // === ▲▲▲ Конец интеграции блоков из ITERATOwebgpu.js ▲▲▲ ===

    // --- Патч-параметры ---
    function getVendor()        { return window.__GPU_VENDOR__; }
    function getDescription()   { return "empty" }
    function getLimits()        { return window.__WEBGPU_LIMITS_WHITELIST__; }
    // function getLimits()        { return window.__WEBGPU_LIMITS_WHITELIST__  || window.__WEBGL_LIMITS__ || { maxTextureDimension2D: 8192 }; }
    function getFeatures()      { return  window.__WEBGPU_FEATURES_WHITELIST__; }
    // function getFeatures()      { return window.__WEBGPU_FEATURES__|| window.__WEBGL_FEATURES__|| ["texture-compression-bc"]; }
    function getLabel()         { return getDescription(); }
    function getAdapterType()   { return window.__GPU_TYPE__; }
    // function getDriverVersion() { return "24.5.1"; }
    function getIsFallbackAdapter() {return false;}
    function getName()          { return getDescription(); }

    const patch = {
        vendor:            getVendor(),
        description:       getDescription(),
        architecture:      window.__GPU_ARCHITECTURE__,
        device:            window.__WEBGPU_DEVICE__,
        label:             getLabel(),
        name:              getName(),
        adapterType:       getAdapterType(),
        // driverVersion:     getDriverVersion(),
        type:              getAdapterType(),
        isFallbackAdapter: getIsFallbackAdapter(),
        limits:            getLimits(),
        features:          getFeatures()
    };

    if (!window.__WEBGPU_LOGS__) window.__WEBGPU_LOGS__ = [];
    function logNonWhiteList(type, prop) {
        if (prop === "then") return;
        window.__WEBGPU_LOGS__.push({ type, prop, time: Date.now() });
        console.warn(`[WebGPU][${type}] Non-whitelisted property accessed: ${prop}`);
    }


    // === AdapterInfo: сборка с приоритетом твоих глобалов ===
    function __buildAdapterInfo(nativeInfo) {
      const info = nativeInfo && typeof nativeInfo === 'object' ? nativeInfo : {};
      // Берём ровно те ключи, которые ты уже согласуешь глобалами:
      const v  = (window.__GPU_VENDOR__ ?? info.vendor) || undefined;
      const a  = (window.__GPU_ARCHITECTURE__ ?? info.architecture) || undefined;
      const d  = (window.__WEBGPU_DEVICE__ ?? info.device) || undefined;
      const ds = ("empty" /* твой getDescription() */) || info.description || undefined;
      const t  = (window.__GPU_TYPE__ ?? info.type) || undefined;

      // isFallbackAdapter — по Chromium сейчас false
      const isFB = false;

      // Остальное не трогаем (если драйвер не дал — остаётся undefined):
      return {
        vendor: v,
        architecture: a,
        device: d,
        description: ds,
        type: t,
        isFallbackAdapter: isFB,
        driver: info.driver,
        backend: info.backend,
        memoryHeaps: info.memoryHeaps,
        d3dShaderModel: info.d3dShaderModel,
        vkDriverVersion: info.vkDriverVersion,
        subgroupMatrixConfigs: info.subgroupMatrixConfigs,
        subgroupMaxSize: info.subgroupMaxSize,
        subgroupMinSize: info.subgroupMinSize
      };
    }

// === блоки Adapter Features / Texture Format Capabilities ===

// Универсальный ридер свойств с биндингом функций
  function getProp(target, prop, receiver) {
    try {
      const val = Reflect.get(target, prop, receiver);
      return typeof val === 'function' ? val.bind(target) : val;
    } catch { return undefined; }
  }

  // WL по фичам (Adapter Features) + гарантия core features
  const __WL_FEATURES__ = new Set(Array.isArray(window.__WEBGPU_FEATURES_WHITELIST__)
    ? window.__WEBGPU_FEATURES_WHITELIST__ : []);
  for (const cf of ['depth-clip-control','depth32float-stencil8','texture-compression-bc']) {
    __WL_FEATURES__.add(cf);
  }

  // WL по лимитам + гарантия core limits
  const __WL_LIMITS__ = new Set(Array.isArray(window.__WEBGPU_LIMITS_WHITELIST__)
    ? window.__WEBGPU_LIMITS_WHITELIST__ : []);
  for (const cl of ['maxTextureDimension1D','maxTextureDimension2D','maxTextureDimension3D','maxBindGroups']) {
    __WL_LIMITS__.add(cl);
  }

  // === Limits: WL-маскирование поверх нативного объекта (сохраняем бренд) ===
  const __MaskedLimitsCache__ = new WeakMap();
  function __maskLimits(nativeLimits) {
    if (!nativeLimits || typeof nativeLimits !== 'object' || __WL_LIMITS__.size === 0) return nativeLimits;
    if (__MaskedLimitsCache__.has(nativeLimits)) return __MaskedLimitsCache__.get(nativeLimits);

    const proxy = new Proxy(nativeLimits, {
      getPrototypeOf(target) { return Reflect.getPrototypeOf(target); },
      get(target, prop) {
        return (__WL_LIMITS__.has(prop) && prop in target)
          ? Reflect.get(target, prop)
          : undefined;
      },
      has(target, prop) { return __WL_LIMITS__.has(prop) && (prop in target); },
      ownKeys(target)   { return Reflect.ownKeys(target).filter(k => __WL_LIMITS__.has(k)); },
      getOwnPropertyDescriptor(target, prop) {
        if (!__WL_LIMITS__.has(prop) || !Reflect.has(target, prop)) return undefined;
        const d = Reflect.getOwnPropertyDescriptor(target, prop);
        if (!d) return undefined;
        return { ...d, configurable: false, writable: false, enumerable: true };
      },
      set() { return false; },
      defineProperty() { return false; },
      deleteProperty() { return false; }
    });

    __MaskedLimitsCache__.set(nativeLimits, proxy);
    return proxy;
  }


const __MaskedFeaturesCache__ = new WeakMap();

// === Features: прокси без смены типа GPUSupportedFeatures (бренд + «нативный» вид функций)
function __maskFeatures(nativeFeatures) {
  if (!nativeFeatures || __WL_FEATURES__.size === 0) return nativeFeatures;

  // ➜ КЭШ: возвращаем один и тот же прокси для одного и того же объекта
  if (__MaskedFeaturesCache__.has(nativeFeatures)) {
    return __MaskedFeaturesCache__.get(nativeFeatures);
  }

  const hasNative = nativeFeatures.has.bind(nativeFeatures);
  const allowed = new Set();
  for (const f of nativeFeatures) if (__WL_FEATURES__.has(f)) allowed.add(f);

  const proxy = new Proxy(nativeFeatures, {
    getPrototypeOf(target) { return Reflect.getPrototypeOf(target); },
    get(target, prop) {
      if (prop === 'has') {
        return markNative((k) => __WL_FEATURES__.has(k) && hasNative(k), 'has');
      }
      if (prop === 'forEach') {
        return markNative((cb, thisArg) => { for (const v of allowed) cb.call(thisArg, v, v, target); }, 'forEach');
      }
      if (prop === Symbol.iterator || prop === 'values' || prop === 'keys') {
        const name = prop === 'keys' ? 'keys' : 'values';
        const iter = function* () { for (const v of allowed) yield v; };
        return markNative(iter, name);
      }
      if (prop === 'entries') {
        const iter = function* () { for (const v of allowed) yield [v, v]; };
        return markNative(iter, 'entries');
      }
      if (prop === 'size') return allowed.size;
      return Reflect.get(target, prop);
    }
  });

  __MaskedFeaturesCache__.set(nativeFeatures, proxy);
  return proxy;
}



  // --- Патч navigator.gpu.requestAdapter (внутри — патч requestDevice) ---
  if (navigator.gpu?.requestAdapter) {
    const origRequestAdapter = navigator.gpu.requestAdapter.bind(navigator.gpu);

    const patchedRequestAdapter = async function requestAdapter(options = {}, ...rest) {
      const adapter = await origRequestAdapter(options, ...rest);
      if (!adapter) return null;

      const origRequestDevice = adapter.requestDevice.bind(adapter);
      const origRequestAdapterInfo = typeof adapter.requestAdapterInfo === 'function'
        ? adapter.requestAdapterInfo.bind(adapter)
        : null;

      // — единичный вызов + кеш для .info / requestAdapterInfo()
      let __adapterInfoValue;
      const __adapterInfoPromise = (async () => {
        try {
          const native = origRequestAdapterInfo ? await origRequestAdapterInfo()
                                                : (adapter.info || {});
          const built = __buildAdapterInfo(native);
          __adapterInfoValue = built;
          return built;
        } catch {
          const built = __buildAdapterInfo(adapter.info || {});
          __adapterInfoValue = built;
          return built;
        }
      })();

      // Патчируем requestDevice и маскируем как «нативный»
      // авто-включение фич, если адаптер их поддерживает (безопасное пересечение)
      const __AUTO_ENABLE_ON_DEVICE__ = ['texture-compression-bc','texture-compression-etc2','texture-compression-astc'];

      const patchedRequestDevice = async function requestDevice(options = {}, ...rest) {
        const opts = (options && typeof options === 'object') ? { ...options } : {};
        const req = new Set(Array.isArray(opts.requiredFeatures) ? opts.requiredFeatures : []);

    // авто-добавление только реально поддерживаемых адаптером фич
      for (const f of __AUTO_ENABLE_ON_DEVICE__) {
        try { if (adapter.features && adapter.features.has(f)) req.add(f); } catch {}
      }
      if (req.size > 0) opts.requiredFeatures = Array.from(req);

      const dev = await origRequestDevice(opts, ...rest);
      if (!dev) return null;

      // тени-геттеры без смены бренда
      try {
        const maskedFeatures = __maskFeatures(dev.features);
        Object.defineProperty(dev, 'features', {
          configurable: true,
          get: markNative(function get_features(){ return maskedFeatures; }, 'get features')
        });
      } catch {}

      try {
        const maskedLimits = __maskLimits(dev.limits || {});
        Object.defineProperty(dev, 'limits', {
          configurable: true,
          get: markNative(function get_limits(){ return maskedLimits; }, 'get limits')
        });
      } catch {}

      try {
        Object.defineProperty(dev, 'label', {
          configurable: true,
          get: markNative(function get_label(){ return patch.label; }, 'get label')
        });
      } catch {}

      return dev; // возвращаем нативный GPUDevice (бренд сохраняем)
    };

    definePatchedValue(adapter, 'requestDevice', markNative(patchedRequestDevice, 'requestDevice'), 'adapter.requestDevice');


      // Прокси адаптера
      const handler = {
        get(target, prop, receiver) {
          logAccess('adapter', prop);
          if (!ADAPTER_WHITELIST.includes(prop)) logNonWhiteList("adapter", prop);

          if (prop === 'limits')   return __maskLimits(target.limits || {});
          if (prop === 'features') return __maskFeatures(target.features);
          if (prop === 'requestAdapterInfo') {
            return markNative(function requestAdapterInfo() { return __adapterInfoPromise; }, 'requestAdapterInfo');
          }
          if (prop === 'info') {
            return (target.info ? (__adapterInfoValue ?? __buildAdapterInfo(target.info || {})) : undefined);
          }
          if (prop === 'label') return patch.label;

          return getProp(target, prop, receiver);
        }
      };

      return new Proxy(adapter, handler);
    };
    definePatchedValue(navigator.gpu, 'requestAdapter', markNative(patchedRequestAdapter, 'requestAdapter'), 'navigator.gpu.requestAdapter');
  
};
console.log(`[WebGPU] Patched requestAdapter/requestDevice for browser: ${browser}`);
}
} // ✅ Эта закрывающая скобка завершает функцию корректно

;
function AudioContextModule() {
  if (!window.__PATCH_AUDIOCONTEXT__) {
  window.__PATCH_AUDIOCONTEXT__ = true;
  const C = window.CanvasPatchContext;
    if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — module registration is not available');
  const R = window.rand.use('audio');
  const AUDIO_NOISE_ENABLED = false;

  // 1. get original values for sampleRate/baseLatency
  let nativeSampleRate = 44100, nativeBaseLatency = 0.0029;
  const ctx = window.AudioContext ? new window.AudioContext() : new window.OfflineAudioContext(1, 1, 44100);
  nativeSampleRate = ctx.sampleRate;
  if ('baseLatency' in ctx) nativeBaseLatency = ctx.baseLatency;
  ctx.close && ctx.close();

  // 2. Actual list of classes for patch (AudioContext + OfflineAudioContext + webkit aliases)
  const CTX_CLASSES = [
    window.AudioContext,
    window.webkitAudioContext,
    window.OfflineAudioContext,
    window.webkitOfflineAudioContext
  ].filter(Boolean);

  for (const CTX of CTX_CLASSES) {
    const proto = CTX.prototype;

    // 3. We only patch sampleRate/baseLatency (getter does not break fingerprint)
    Object.defineProperty(proto, 'sampleRate', {
      get() { return nativeSampleRate; },
      configurable: true
    });
    if ('baseLatency' in proto) {
      Object.defineProperty(proto, 'baseLatency', {
        get() { return nativeBaseLatency; },
        configurable: true
      });
    }

    // 4. patch createBuffer: We rolled the input and throw the error as in the original
  if (typeof AudioContext.prototype.createBuffer === 'function') {
      const origCreateBuffer = AudioContext.prototype.createBuffer;
      AudioContext.prototype.createBuffer = function(numOfChannels, length, sampleRate) {
          if (length < 0 || sampleRate <= 0) throw new RangeError('Invalid length or sampleRate for AudioBuffer');
          return origCreateBuffer.call(this, numOfChannels, length, sampleRate);
      };
      console.log('[AudioContextPatch] Patched createBuffer on AudioContext');
  }
  // 5. patch AnalyserNode (preserveing invariants)
  if (typeof proto.createAnalyser === 'function') {
    const origCreateAnalyser = proto.createAnalyser;
    proto.createAnalyser = function () {
      const analyser = origCreateAnalyser.call(this);

      // --- Byte Spectrum: discrete ±1/0 with compensation of the summ ---
      const origByte = analyser.getByteFrequencyData.bind(analyser);
      analyser.getByteFrequencyData = function (array) {
        origByte(array);
        if (!AUDIO_NOISE_ENABLED) return;
        let delta = 0;
        const n = array.length | 0;
        for (let i = 0; i < n; i++) {
          const r = R();
          let d = (r < 1/3) ? -1 : (r > 2/3 ? 1 : 0);
          const v = array[i], nv = v + d;
          if (nv >= 0 && nv <= 255) { array[i] = nv; delta += d; }
        }
        if (delta !== 0) {
          if (delta > 0) { // take away
            for (let i = 0; i < n && delta > 0; i++) if (array[i] > 0) { array[i] -= 1; delta--; }
          } else { // add
            delta = -delta;
            for (let i = 0; i < n && delta > 0; i++) if (array[i] < 255) { array[i] += 1; delta--; }
          }
        }
      };

      // --- Float Spectrum: pair of zero summary noise, without going out for [min,max] ---
      const origFloat = analyser.getFloatFrequencyData.bind(analyser);
      analyser.getFloatFrequencyData = function (array) {
        origFloat(array);
        if (!AUDIO_NOISE_ENABLED) return;
        const lo = (typeof this.minDecibels === 'number') ? this.minDecibels : -100;
        const hi = (typeof this.maxDecibels === 'number') ? this.maxDecibels : -30;
        const n  = array.length | 0;
        if (!n) return;

        //The amplitude of the noise expressed through its own parameters of the node
        const range = Math.max(1e-9, hi - lo);
        const baseAmp = range * (typeof this.smoothingTimeConstant === 'number' ? this.smoothingTimeConstant : 0.8)
                              / Math.max(1, this.fftSize || 2048);

        // pair scheme: delta_i = -delta_j => the amount is exactly 0; additionly, limiting the local gap to the boundaries
        const tiny = range / 1e6; //technically "do not touch" the edge - from the same units as the data
        for (let i = 0, j = n - 1; i < j; i++, j--) {
          const vi = array[i], vj = array[j];
          // local permited step so as not to touch the boundaries
          const lim_i = Math.max(0, Math.min(vi - lo, hi - vi) - tiny);
          const lim_j = Math.max(0, Math.min(vj - lo, hi - vj) - tiny);
          const amp   = Math.min(baseAmp, lim_i, lim_j);
          if (amp <= 0) continue;

          const d = (R() - 0.5) * 2 * amp; // Symmetric noise
          array[i] = vi + d;
          array[j] = vj - d;               // Antinoise - total is 0

          //numerical error insurance at the very edges
          if (array[i] < lo) array[i] = lo; else if (array[i] > hi) array[i] = hi;
          if (array[j] < lo) array[j] = lo; else if (array[j] > hi) array[j] = hi;
        }
        //The odd middle — without noise (as not to break the zero amount)
      };

      // --- Byte time-domain: paired±1 (The sum preserved) carefully [0..255] ---
      const origByteTD = analyser.getByteTimeDomainData?.bind(analyser);
      if (typeof origByteTD === 'function') {
        analyser.getByteTimeDomainData = function (array) {
          origByteTD(array);
          if (!AUDIO_NOISE_ENABLED) return;
          const n = array.length | 0;
          for (let i = 0, j = n - 1; i < j; i++, j--) {
            const vi = array[i], vj = array[j];
            //Choose a sign so that not one goes beyond
            let s = (R() < 0.5) ? 1 : -1;
            const can_i = (vi + s) >= 0 && (vi + s) <= 255;
            const can_j = (vj - s) >= 0 && (vj - s) <= 255;
            if (can_i && can_j) {
              array[i] = vi + s;
              array[j] = vj - s; // сумма по паре = 0
            } else {
              // пробуем обратный знак
              s = -s;
              const can_i2 = (vi + s) >= 0 && (vi + s) <= 255;
              const can_j2 = (vj - s) >= 0 && (vj - s) <= 255;
              if (can_i2 && can_j2) {
                array[i] = vi + s;
                array[j] = vj - s;
              }
              // If not, we miss a couple
            }
          }
        };
      }

      // --- Float time-domain: pair zero-summary noise within [-1..1] ---
      const origFloatTD = analyser.getFloatTimeDomainData?.bind(analyser);
      if (typeof origFloatTD === 'function') {
        analyser.getFloatTimeDomainData = function (array) {
          origFloatTD(array);
          if (!AUDIO_NOISE_ENABLED) return;
          const n = array.length | 0;
          if (!n) return;

          // amplitude "from content": The wider the current scope, the more you can make noise,
          // normalize through fftSize/smoothingTimeConstant
          let vmin = Infinity, vmax = -Infinity;
          for (let k = 0; k < n; k++) { const v = array[k]; if (v < vmin) vmin = v; if (v > vmax) vmax = v; }
          const span   = Math.max(1e-9, vmax - vmin);
          const base   = (typeof this.smoothingTimeConstant === 'number' ? this.smoothingTimeConstant : 0.8);
          const amp0   = span * base / Math.max(1, this.fftSize || 2048);
          const lo = -1, hi = 1;
          const tiny = 1 / 1e6;

          for (let i = 0, j = n - 1; i < j; i++, j--) {
            const vi = array[i], vj = array[j];
            const lim_i = Math.max(0, Math.min(vi - lo, hi - vi) - tiny);
            const lim_j = Math.max(0, Math.min(vj - lo, hi - vj) - tiny);
            const amp   = Math.min(amp0, lim_i, lim_j);
            if (amp <= 0) continue;

            const d = (R() - 0.5) * 2 * amp;
            array[i] = vi + d;
            array[j] = vj - d;

            if (array[i] < lo) array[i] = lo; else if (array[i] > hi) array[i] = hi;
            if (array[j] < lo) array[j] = lo; else if (array[j] > hi) array[j] = hi;
          }
        };
      }

      return analyser;
    };
  }


  // 6.Patch OfflineAudioContext (add noise)
  if (typeof OfflineAudioContext.prototype.startRendering === 'function') {
      const origStartRendering = OfflineAudioContext.prototype.startRendering;
      OfflineAudioContext.prototype.startRendering = function(...args) {
          return origStartRendering.apply(this, args).then(buffer => {
              //add Noise, if necessary
              return addNoiseToRenderBuffer(buffer);
          });
      };
  }

  // 7. noise in renderBuffer
  function addNoiseToRenderBuffer(buffer) {
      if (!buffer || typeof buffer.getChannelData !== 'function') return buffer;
      if (!AUDIO_NOISE_ENABLED) return buffer;
      for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
          const data = buffer.getChannelData(ch);
          for (let i = 0; i < data.length; i++) {
              // Can be combined - part is more likely, part with less
              if (R() < 0.1) data[i] += (R() - 0.5) * 0.005;
              if (ch === 0 && R() < 0.025) data[i] += (R() - 0.5) * 0.003;
          }
      }
      return buffer;
  }
}
}} 

;

// === CONTEXT PATCH MODULE ===
function ContextPatchModule(window) {
  const C = window.CanvasPatchContext = window.CanvasPatchContext || {};
  'use strict';
  const global = window;
  if (global.CanvasPatchContext && global.CanvasPatchContext.__READY__) {
    return; // in case is already initialized
  }

  C.__READY__ = true;

  // === 0. Utilities ===
  const NOP = () => {};

  const patchedMethods = new WeakSet();
  const markAsNative = (function() {
    const ensure = global && typeof global.__ensureMarkAsNative === 'function'
      ? global.__ensureMarkAsNative
      : null;
    const m = ensure ? ensure() : (global && global.markAsNative);
    if (typeof m !== 'function') {
      throw new Error('[ContextPatch] markAsNative missing');
    }
    return function(fn, name) {
      return m(fn, name);
    };
  })();

  function guardInstance(proto, self){
    try { return self && (self instanceof proto.constructor || self instanceof proto.constructor.prototype.constructor); }
    catch { return false; }
  }

  function safeInvoke(orig, self, args, proto, method){
    try {
      return orig.apply(self, args);
    } catch (e) {
      // Illegal invocation fallback
      if (proto && typeof proto[method] === 'function') {
        try { return proto[method].call(self, ...args); } catch {}
      }
      throw e;
    }
  }

  function getHooks(){
    return (typeof global !== 'undefined' && global.CanvasPatchHooks) ? global.CanvasPatchHooks : null;
  }

  function definePatchedMethod(proto, method, value) {
    const d = Object.getOwnPropertyDescriptor(proto, method);
    if (!d) {
      throw new Error(`[ContextPatch] descriptor missing for ${method}`);
    }
    Object.defineProperty(proto, method, {
      value,
      configurable: d ? !!d.configurable : true,
      enumerable: d ? !!d.enumerable : false,
      writable: d ? !!d.writable : true
    });
  }

  // === 1.Hook registries (Initialization of arrays) ===
  C.htmlCanvasGetContextHooks           = C.htmlCanvasGetContextHooks          || [];
  C.htmlCanvasToDataURLHooks            = C.htmlCanvasToDataURLHooks           || [];
  C.htmlCanvasToBlobHooks               = C.htmlCanvasToBlobHooks              || [];

  C.offscreenGetContextHooks            = C.offscreenGetContextHooks           || [];
  C.offscreenConvertToBlobHooks         = C.offscreenConvertToBlobHooks        || [];

  C.ctx2DGetContextHooks                = C.ctx2DGetContextHooks               || [];
  C.ctx2DMeasureTextHooks               = C.ctx2DMeasureTextHooks              || [];
  C.ctx2DFillTextHooks                  = C.ctx2DFillTextHooks                 || [];
  C.ctx2DStrokeTextHooks                = C.ctx2DStrokeTextHooks               || [];
  C.ctx2DFillRectHooks                  = C.ctx2DFillRectHooks                 || [];
  C.ctx2DDrawImageHooks                 = C.ctx2DDrawImageHooks                || [];
  C.canvas2DNoiseHooks                  = C.canvas2DNoiseHooks                 || [];

  C.webglGetParameterHooks              = C.webglGetParameterHooks             || [];
  C.webglGetSupportedExtensionsHooks    = C.webglGetSupportedExtensionsHooks   || [];
  C.webglGetExtensionHooks              = C.webglGetExtensionHooks             || [];
  C.webglGetContextHooks                = C.webglGetContextHooks               || [];
  C.webglReadPixelsHooks                = C.webglReadPixelsHooks               || [];
  C.webglGetShaderPrecisionFormatHooks  = C.webglGetShaderPrecisionFormatHooks || [];
  C.webglShaderSourceHooks              = C.webglShaderSourceHooks             || [];
  C.webglGetUniformHooks                = C.webglGetUniformHooks               || [];

  // === 2. Registrars ===
  C.registerHtmlCanvasGetContextHook          = fn => (typeof fn === 'function') && C.htmlCanvasGetContextHooks.push(fn);
  C.registerHtmlCanvasToDataURLHook           = fn => (typeof fn === 'function') && C.htmlCanvasToDataURLHooks.push(fn);
  C.registerHtmlCanvasToBlobHook              = fn => (typeof fn === 'function') && C.htmlCanvasToBlobHooks.push(fn);

  C.registerOffscreenGetContextHook           = fn => (typeof fn === 'function') && C.offscreenGetContextHooks.push(fn);
  C.registerOffscreenConvertToBlobHook        = fn => (typeof fn === 'function') && C.offscreenConvertToBlobHooks.push(fn);

  C.registerCtx2DGetContextHook               = fn => (typeof fn === 'function') && C.ctx2DGetContextHooks.push(fn);
  C.registerCtx2DMeasureTextHook              = fn => (typeof fn === 'function') && C.ctx2DMeasureTextHooks.push(fn);
  C.registerCtx2DFillTextHook                 = fn => (typeof fn === 'function') && C.ctx2DFillTextHooks.push(fn);
  C.registerCtx2DStrokeTextHook               = fn => (typeof fn === 'function') && C.ctx2DStrokeTextHooks.push(fn);
  C.registerCtx2DFillRectHook                 = fn => (typeof fn === 'function') && C.ctx2DFillRectHooks.push(fn);
  C.registerCtx2DDrawImageHook                = fn => (typeof fn === 'function') && C.ctx2DDrawImageHooks.push(fn);
  C.registerCtx2DAddNoiseHook                 = fn => (typeof fn === 'function') && C.canvas2DNoiseHooks.push(fn);

  C.registerWebGLGetContextHook               = fn => (typeof fn === 'function') && C.webglGetContextHooks.push(fn);
  C.registerWebGLGetParameterHook             = fn => (typeof fn === 'function') && C.webglGetParameterHooks.push(fn);
  C.registerWebGLGetSupportedExtensionsHook   = fn => (typeof fn === 'function') && C.webglGetSupportedExtensionsHooks.push(fn);
  C.registerWebGLGetExtensionHook             = fn => (typeof fn === 'function') && C.webglGetExtensionHooks.push(fn);
  C.registerWebGLReadPixelsHook               = fn => (typeof fn === 'function') && C.webglReadPixelsHooks.push(fn);
  C.registerWebGLGetShaderPrecisionFormatHook = fn => (typeof fn === 'function') && C.webglGetShaderPrecisionFormatHooks.push(fn);
  C.registerWebGLShaderSourceHook             = fn => (typeof fn === 'function') && C.webglShaderSourceHooks.push(fn);
  C.registerWebGLGetUniformHook               = fn => (typeof fn === 'function') && C.webglGetUniformHooks.push(fn);

  // === 3. Patch utilities ===
  function chain(proto, method, hooks){
    if (!proto || typeof proto[method] !== 'function' || !(hooks && hooks.length)) return false;
    const orig = proto[method];
    if (patchedMethods.has(orig)) return false;

    const wrapped = (method === 'toDataURL')
      ? ({ toDataURL(type, quality) {
          const flag = '__isChain_' + method;
          if (this && this[flag]) return Reflect.apply(orig, this, arguments);
          if (this) this[flag] = true;
          try {
            let patchedArgs = Array.prototype.slice.call(arguments);
            for (const hook of hooks){
              if (typeof hook !== 'function') continue;
              try {
                const next = hook.apply(this, patchedArgs);
                if (next && Array.isArray(next)) patchedArgs = next;
              } catch (e) {
                if (global.__DEBUG__) console.error(`[CHAIN HOOK ERROR ${method}]`, e);
              }
            }
            const out = Reflect.apply(orig, this, patchedArgs);
            let res = out;
            for (const hook of hooks){
              try {
                const r = hook.call(this, res, ...patchedArgs);
                if (typeof r === 'string') res = r;
              } catch (e) {
                if (global.__DEBUG__) console.error(`[CHAIN POST ERROR ${method}]`, e);
              }
            }
            return res;
          } finally {
            if (this) this[flag] = false;
          }
        } }).toDataURL
      : ({ [method]() {
          const flag = '__isChain_' + method;
          if (this && this[flag]) return Reflect.apply(orig, this, arguments);
          if (this) this[flag] = true;
          try {
            let patchedArgs = Array.prototype.slice.call(arguments);
            for (const hook of hooks){
              if (typeof hook !== 'function') continue;
              try {
                const next = hook.apply(this, patchedArgs);
                if (next && Array.isArray(next)) patchedArgs = next;
              } catch (e) {
                if (global.__DEBUG__) console.error(`[CHAIN HOOK ERROR ${method}]`, e);
              }
            }
            return Reflect.apply(orig, this, patchedArgs);
          } finally {
            if (this) this[flag] = false;
          }
        } })[method];

    const patched = markAsNative(wrapped, method);
    definePatchedMethod(proto, method, patched);
    patchedMethods.add(patched);
    return true;
  }

  // === WEBGL PATCHING ===
  function patchMethod(proto, method, hooks) {
      if (!proto)                              { console.warn(`[patchMethod] proto is not defined: ${method}`); return false; }
      if (typeof proto[method] !== 'function') { console.warn(`[patchMethod] not a function: ${method}`); return false; }
      if (patchedMethods.has(proto[method]))   { console.warn(`[patchMethod] already patched: ${method}`); return false; }
      if (!hooks?.length)                      { console.warn(`[patchMethod] no hooks: ${method}`); return false; }

      const orig = proto[method];
      const guard = (typeof WeakSet === 'function') ? new WeakSet() : null;

      function invoke(self, argsLike) {
          // Preserve native Illegal invocation / brand check errors
          const isObj = (self !== null) && (typeof self === 'object' || typeof self === 'function');
          const args = Array.isArray(argsLike) ? argsLike : Array.prototype.slice.call(argsLike);

          if (guard && isObj) {
              if (guard.has(self)) return orig.apply(self, args);
              guard.add(self);
          }

          try {
              if (typeof guardInstance === "function" && !guardInstance(proto, self))
                  return orig.apply(self, args);

              let patched = args;
              for (const hook of hooks) {
                  if (typeof hook !== 'function') continue;
                  try {
                      const res = hook.apply(self, [orig, ...patched]);

                      // override console logging
                      if (res !== undefined && !Array.isArray(res)) {
                          if (global.__DEBUG__ && !(global._logConfig && global._logConfig.WEBGLlogger === false))
                              console.warn('[patchMethod override]', method, hook.name || 'anon', res);
                          return res; // result substitution
                      }

                      // argument substitution
                      if (Array.isArray(res)) {
                          patched = res;
                          continue;
                      }

                  } catch (e) {
                      console.error(`[patchMethod] hook error ${method} (${hook.name || 'anon'}):`, e);
                  }
              }
              return orig.apply(self, patched);

          } finally {
              if (guard && isObj) guard.delete(self);
          }
      }

      // IMPORTANT: use MethodDefinition functions to match native (non-constructible, no "prototype")
      const wrappedRaw = (function(){
          switch (orig.length) {
              case 0: return ({ [method]() { return invoke(this, arguments); } })[method];
              case 1: return ({ [method](a0) { return invoke(this, arguments); } })[method];
              case 2: return ({ [method](a0, a1) { return invoke(this, arguments); } })[method];
              case 7: return ({ [method](a0, a1, a2, a3, a4, a5, a6) { return invoke(this, arguments); } })[method];
              default: return ({ [method](...a) { return invoke(this, a); } })[method];
          }
      })();

      const wrapped = markAsNative(wrappedRaw, method);

      definePatchedMethod(proto, method, wrapped);
      patchedMethods.add(wrapped);

      return true;
    }

  function chainAsync(proto, method, hooksGetter){
    if (!proto || typeof proto[method] !== 'function') return false;
    const orig = proto[method];
    if (patchedMethods.has(orig)) return false;

    const getHooksList = () => (typeof hooksGetter === 'function') ? hooksGetter() : [];
    const applyHooks = (self, blob, args) => {
      let b = blob;
      const hooks = getHooksList();
      if (hooks && hooks.length) {
        for (const hook of hooks) {
          const r = hook.call(self, b, ...args);
          if (r instanceof Blob) b = r;
        }
      }
      return b;
    };

    if (method === 'toBlob') {
      const wrapped = ({ toBlob(callback, type, quality) {
        const args = arguments;
        if (typeof callback === 'function') {
          const done = (blob) => callback(applyHooks(this, blob, args));
          return Reflect.apply(orig, this, [done].concat(Array.prototype.slice.call(args, 1)));
        }
        return new Promise((resolve, reject) => {
          try {
            const done = (blob) => {
              try { resolve(applyHooks(this, blob, args)); }
              catch (e) { reject(e); }
            };
            Reflect.apply(orig, this, [done].concat(Array.prototype.slice.call(args, 1)));
          } catch (e) { reject(e); }
        });
      } }).toBlob;
      const patched = markAsNative(wrapped, method);
      definePatchedMethod(proto, method, patched);
      patchedMethods.add(patched);
      return true;
    }

    if (method === 'convertToBlob') {
      const wrapped = ({ convertToBlob(options) {
        const args = arguments;
        const p = Reflect.apply(orig, this, args);
        if (!(p && typeof p.then === 'function')) return p;
        const hooks = getHooksList();
        if (!(hooks && hooks.length)) return p;
        return p.then((blob) => applyHooks(this, blob, args));
      } }).convertToBlob;
      const patched = markAsNative(wrapped, method);
      definePatchedMethod(proto, method, patched);
      patchedMethods.add(patched);
      return true;
    }

    const wrapped = ({ [method]() {
      const args = arguments;
      const p = Reflect.apply(orig, this, args);
      if (!(p && typeof p.then === 'function')) return p;
      const hooks = getHooksList();
      if (!(hooks && hooks.length)) return p;
      return p.then((blob) => applyHooks(this, blob, args));
    } })[method];
    const patched = markAsNative(wrapped, method);
    definePatchedMethod(proto, method, patched);
    patchedMethods.add(patched);
    return true;
  }

  // === 4. Proxy foe CanvasRenderingContext2D (Safe wrap) ===
  function createSafeCtxProxy(ctx){
    if (!ctx || typeof CanvasRenderingContext2D === 'undefined' || !(ctx instanceof CanvasRenderingContext2D)) return ctx;

    const proto = CanvasRenderingContext2D.prototype;

    const ORIG = {
      getImageData: proto.getImageData,
      putImageData: proto.putImageData,
      drawImage:    proto.drawImage,
      measureText:  proto.measureText,
      fillText:     proto.fillText,
      strokeText:   proto.strokeText,
      fillRect:     proto.fillRect
    };

    const guard = { getImageData: false };

    const handler = {
      get(target, prop){
        // Special methods interception
        if (prop === 'getImageData' && ORIG.getImageData){
          const wrapped = function(...args){
            if (guard.getImageData) return safeInvoke(ORIG.getImageData, target, args, proto, 'getImageData');
            guard.getImageData = true;
            try {
              if (args.length >= 4){
                let [x, y, w, h] = args;
                const cw = (this && this.canvas && this.canvas.width)  || 0;
                const ch = (this && this.canvas && this.canvas.height) || 0;
                x |= 0; y |= 0; w |= 0; h |= 0;
                if (x < 0) x = 0; if (y < 0) y = 0;
                if (x + w > cw) w = Math.max(1, cw - x);
                if (y + h > ch) h = Math.max(1, ch - y);
                const img = safeInvoke(ORIG.getImageData, target, [x, y, w, h], proto, 'getImageData');
                // No post-processing: the equality of ways is guaranteed that
                // that we are "noisy" only when changing canvas (DRAWIMAGE, etc.)
                return img;
              }
              return safeInvoke(ORIG.getImageData, target, args, proto, 'getImageData');
            } finally {
              guard.getImageData = false;
            }
          };
          return markAsNative(wrapped, 'getImageData');
        }

        if (prop === 'measureText' && ORIG.measureText){
          const wrapped = function(text, ...rest){
            const txt = String(text ?? '');
            const m = safeInvoke(ORIG.measureText, target, [txt, ...rest], proto, 'measureText');
            try {
              const H = getHooks();
              const fontStr = (typeof this?.font === 'string' && this.font.trim()) ? this.font : '16px sans-serif';
              if (H && typeof H.applyMeasureTextHook === 'function'){
                return H.applyMeasureTextHook.call(this, m, txt, fontStr) ?? m;
              }
              if (H && typeof H.measureTextNoiseHook === 'function'){
                return H.measureTextNoiseHook.call(this, m, txt, fontStr) ?? m;
              }
            } catch {}
            return m;
          };
          return markAsNative(wrapped, 'measureText');
        }

        if (prop === 'fillText' && ORIG.fillText){
          const H = getHooks();
          if (H && typeof H.applyFillTextHook === 'function'){
            const wrapped = function(...args){
              return H.applyFillTextHook.call(this, ORIG.fillText.bind(target), ...args);
            };
            return markAsNative(wrapped, 'fillText');
          }
          const wrapped = function(text, x, y, ...rest){
            try {
              let a = [text, x, y, ...rest];
              const H = getHooks();
              const hook = H && H.fillTextNoiseHook;
              if (typeof hook === 'function') a = hook.apply(this, a) || a;
              return safeInvoke(ORIG.fillText, target, a, proto, 'fillText');
            } catch {
              return safeInvoke(ORIG.fillText, target, [text, x, y, ...rest], proto, 'fillText');
            }
          };
          return markAsNative(wrapped, 'fillText');
        }
    
        if (prop === 'fillRect' && ORIG.fillRect){
          const H = getHooks();
          const wrapped = function(x, y, w, h){
            try {
              if (H && typeof H.fillRectNoiseHook === 'function') {
                const a = H.fillRectNoiseHook.call(this, x, y, w, h);
                if (Array.isArray(a)) return safeInvoke(ORIG.fillRect, target, a, proto, 'fillRect');
              }
            } catch {}
            return safeInvoke(ORIG.fillRect, target, [x, y, w, h], proto, 'fillRect');
          };
          return markAsNative(wrapped, 'fillRect');
        }

        if (prop === 'strokeText' && ORIG.strokeText){
          const H = getHooks();
          if (H && typeof H.applyStrokeTextHook === 'function'){
            const wrapped = function(...args){
              return H.applyStrokeTextHook.call(this, ORIG.strokeText.bind(target), ...args);
            };
            return markAsNative(wrapped, 'strokeText');
          }
          const wrapped = function(text, x, y, ...rest){
            try {
              let a = [text, x, y, ...rest];
              const H = getHooks();
              const hook = H && H.strokeTextNoiseHook;
              if (typeof hook === 'function') a = hook.apply(this, a) || a;
              return safeInvoke(ORIG.strokeText, target, a, proto, 'strokeText');
            } catch {
              return safeInvoke(ORIG.strokeText, target, [text, x, y, ...rest], proto, 'strokeText');
            }
          };
          return markAsNative(wrapped, 'strokeText');
        }

        if (prop === 'drawImage' && ORIG.drawImage){
          const H = getHooks();
          if (H && typeof H.applyDrawImageHook === 'function'){
            const wrapped = function(...args){
              return H.applyDrawImageHook.call(this, ORIG.drawImage.bind(target), ...args);
            };
            return markAsNative(wrapped, 'drawImage');
          }
          const wrapped = function(...args){
            return safeInvoke(ORIG.drawImage, target, args, proto, 'drawImage');
          };
          return markAsNative(wrapped, 'drawImage');
        }

      // other functions - a safe call; Properties - as is
        const orig = Reflect.get(target, prop, target);
        if (typeof orig === 'function'){
          const wrapped = function(...args){
            try { return safeInvoke(orig, target, args, proto, prop); }
            catch { try { return safeInvoke(orig, target, args, proto, prop); } catch { return undefined; } }
          };
          return markAsNative(wrapped, String(prop));
        }
        try { return orig; } catch { return undefined; }
      },
      set(target, prop, value){ return Reflect.set(target, prop, value, target); },
      getOwnPropertyDescriptor(target, prop){ return Object.getOwnPropertyDescriptor(target, prop); },
      defineProperty(target, prop, desc){ return Reflect.defineProperty(target, prop, desc); },
      setPrototypeOf(target, proto){ return Reflect.setPrototypeOf(target, proto); }
    };

    return new Proxy(ctx, handler);
  }

  // === 5. getContext interception for HTMLCanvasElement/OffscreenCanvas ===
  function chainGetContext(proto, method, htmlHooks, ctx2dHooks, webglHooks){
    if (!proto || typeof proto[method] !== 'function') return false;
    const orig = proto[method];
    if (patchedMethods.has(orig)) return false;

    const wrapped = ({ getContext(contextId, contextAttributes) {
      const args = arguments;
      const type = args[0];
      const rest = Array.prototype.slice.call(args, 1);
      const res = Reflect.apply(orig, this, args);
      let ctx = res;

      try {
        if (type === '2d' && ctx){
          ctx = createSafeCtxProxy(ctx);
          // call hight level hooks
          for (const hook of (ctx2dHooks || [])){
            try { ctx = hook.call(this, ctx, type, ...rest) || ctx; } catch {}
          }
        }
        if (/^webgl/.test(String(type))){
          for (const hook of (webglHooks || [])){
            try { hook.call(this, ctx, type, ...rest); } catch {}
          }
        }
        for (const hook of (htmlHooks || [])){
          try { hook.call(this, ctx, type, ...rest); } catch {}
        }
      } catch {}

      return ctx;
    } }).getContext;

    const patched = markAsNative(wrapped, method);
    definePatchedMethod(proto, method, patched);
    patchedMethods.add(patched);
    return true;
  }

  // === 6. applying of patches===
  C.applyCanvasElementPatches = function(){
    let applied = 0, total = 0;
    total++; if (chain(HTMLCanvasElement.prototype, 'toDataURL', this.htmlCanvasToDataURLHooks)) applied++;
    total++; if (chainAsync(HTMLCanvasElement.prototype, 'toBlob', () => this.htmlCanvasToBlobHooks)) applied++;
    total++; if (chainGetContext(
      HTMLCanvasElement.prototype,
      'getContext',
      this.htmlCanvasGetContextHooks,
      this.ctx2DGetContextHooks,
      this.webglGetContextHooks
    )) applied++;
    if (global.__DEBUG__) console.log(`[CanvasPatch] Canvas element patches: applied ${applied} из ${total}`);
    return applied;
  };

  C.applyOffscreenPatches = function(){
    const Ctx = this;
    let applied = 0, total = 0;
    if (typeof OffscreenCanvas !== 'undefined'){
      total++; if (chainAsync(OffscreenCanvas.prototype, 'convertToBlob', () => Ctx.offscreenConvertToBlobHooks)) applied++;
      total++; if (chainGetContext(
        OffscreenCanvas.prototype,
        'getContext',
        Ctx.offscreenGetContextHooks,
        Ctx.ctx2DGetContextHooks,
        Ctx.webglGetContextHooks
      )) applied++;
    }
    if (global.__DEBUG__) console.log(`[CanvasPatch] Offscreen patches: applied ${applied} из ${total}`);
    return applied;
  };

  C.applyWebGLContextPatches = function () {
      let applied = 0, total = 0;
      const list = [
        [typeof WebGLRenderingContext !== "undefined" ? WebGLRenderingContext.prototype : null, "getParameter", this.webglGetParameterHooks],
        [typeof WebGLRenderingContext !== "undefined" ? WebGLRenderingContext.prototype : null, "getSupportedExtensions", this.webglGetSupportedExtensionsHooks],
        [typeof WebGLRenderingContext !== "undefined" ? WebGLRenderingContext.prototype : null, "getExtension", this.webglGetExtensionHooks],
        [typeof WebGLRenderingContext !== "undefined" ? WebGLRenderingContext.prototype : null, "readPixels", this.webglReadPixelsHooks],
        [typeof WebGLRenderingContext !== "undefined" ? WebGLRenderingContext.prototype : null, "getShaderPrecisionFormat", this.webglGetShaderPrecisionFormatHooks],
        [typeof WebGLRenderingContext !== "undefined" ? WebGLRenderingContext.prototype : null, "shaderSource", this.webglShaderSourceHooks],
        [typeof WebGLRenderingContext !== "undefined" ? WebGLRenderingContext.prototype : null, "getUniform", this.webglGetUniformHooks],
        [typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null, "getParameter", this.webglGetParameterHooks],
        [typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null, "getSupportedExtensions", this.webglGetSupportedExtensionsHooks],
        [typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null, "getExtension", this.webglGetExtensionHooks],
        [typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null, "readPixels", this.webglReadPixelsHooks],
        [typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null, "getShaderPrecisionFormat", this.webglGetShaderPrecisionFormatHooks],
        [typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null,  "shaderSource", this.webglShaderSourceHooks],
        [typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null, "getUniform", this.webglGetUniformHooks]
      ];
      for (const [proto, m, hooks] of list) {
        if (!proto) continue;
        total++;
        if (patchMethod(proto, m, hooks)) applied++;
      }
      console.log(`[CanvasPatch] WebGL context patches: applied ${applied} из ${total}`);
      return applied;
    };

  // === 3. REGISTER HOOK FUNCTIONS ===
  C.registerHtmlCanvasToBlobHook              = fn => typeof fn === 'function' && C.htmlCanvasToBlobHooks.push(fn);
  C.registerHtmlCanvasToDataURLHook           = fn => typeof fn === 'function' && C.htmlCanvasToDataURLHooks.push(fn);
  C.registerOffscreenConvertToBlobHook        = fn => typeof fn === 'function' && C.offscreenConvertToBlobHooks.push(fn);
  C.registerCtx2DGetContextHook               = fn => typeof fn === 'function' && C.ctx2DGetContextHooks.push(fn);
  C.registerCtx2DMeasureTextHook              = fn => typeof fn === 'function' && C.ctx2DMeasureTextHooks.push(fn);
  C.registerCtx2DFillTextHook                 = fn => typeof fn === 'function' && C.ctx2DFillTextHooks.push(fn);
  C.registerCtx2DStrokeTextHook               = fn => typeof fn === 'function' && C.ctx2DStrokeTextHooks.push(fn);
  C.registerCtx2DFillRectHook                 = fn => typeof fn === 'function' && C.ctx2DFillRectHooks.push(fn);
  C.registerCtx2DDrawImageHook                = fn => typeof fn === 'function' && C.ctx2DDrawImageHooks.push(fn);
  C.registerCtx2DAddNoiseHook                 = fn => typeof fn === 'function' && C.canvas2DNoiseHooks.push(fn);
  C.registerWebGLGetContextHook               = fn => typeof fn === 'function' && C.webglGetContextHooks.push(fn);
  C.registerWebGLGetParameterHook             = fn => typeof fn === 'function' && C.webglGetParameterHooks.push(fn);
  C.registerWebGLGetSupportedExtensionsHook   = fn => typeof fn === 'function' && C.webglGetSupportedExtensionsHooks.push(fn);
  C.registerWebGLGetExtensionHook             = fn => typeof fn === 'function' && C.webglGetExtensionHooks.push(fn);
  C.registerWebGLReadPixelsHook               = fn => typeof fn === 'function' && C.webglReadPixelsHooks.push(fn);
  C.registerWebGLGetShaderPrecisionFormatHook = fn => typeof fn === 'function' && C.webglGetShaderPrecisionFormatHooks.push(fn);
  C.registerWebGLShaderSourceHook             = fn => typeof fn === 'function' && C.webglShaderSourceHooks.push(fn);
  C.registerWebGLGetUniformHook               = fn => typeof fn === 'function' && C.webglGetUniformHooks.push(fn);

  // === 4. FINAL REGISTRATION ===
  function registerAllHooks() {
    const C = window.CanvasPatchContext;
    if (!C) return;

    // 1) We guarantee the presence of registers
    window.CanvasPatchHooks = window.CanvasPatchHooks || {};
    window.webglHooks       = window.webglHooks       || {};

    // 2) We take aliases after initialization
    const H = window.CanvasPatchHooks;
    const webglHooks = window.webglHooks;

    // 3) Validation of the availability of exports Canvas-hooks (from CanvasPatchModule)
    [
      'patch2DNoise','patchToDataURLInjectNoise','patchCanvasIHDRHook','masterToDataURLHook',
      'patchToBlobInjectNoise','patchConvertToBlobInjectNoise',
      'measureTextNoiseHook','fillTextNoiseHook','strokeTextNoiseHook','fillRectNoiseHook',
      'applyDrawImageHook','addCanvasNoise'
    ].forEach(name => {
      if (typeof H[name] !== 'function') {
        throw new Error(`[CanvasPatch] Hook ${name} not defined in CanvasPatchHooks`);
      }
    });

    // 4) Registration Canvas 2D
    if (C.registerHtmlCanvasToDataURLHook)    C.registerHtmlCanvasToDataURLHook(H.masterToDataURLHook);
    if (C.registerHtmlCanvasToBlobHook)       C.registerHtmlCanvasToBlobHook(H.patchToBlobInjectNoise);
    if (C.registerOffscreenConvertToBlobHook) C.registerOffscreenConvertToBlobHook(H.patchConvertToBlobInjectNoise);
    if (C.registerCtx2DMeasureTextHook)       C.registerCtx2DMeasureTextHook(H.measureTextNoiseHook);
    if (C.registerCtx2DFillTextHook)          C.registerCtx2DFillTextHook(H.fillTextNoiseHook);
    if (C.registerCtx2DStrokeTextHook)        C.registerCtx2DStrokeTextHook(H.strokeTextNoiseHook);
    if (C.registerCtx2DFillRectHook)          C.registerCtx2DFillRectHook(H.fillRectNoiseHook);
    if (C.registerCtx2DDrawImageHook)         C.registerCtx2DDrawImageHook(H.applyDrawImageHook);
    if (C.registerCtx2DAddNoiseHook)          C.registerCtx2DAddNoiseHook(H.addCanvasNoise);

    // 5) Validation of availability WebGL-hooks
    [
      'webglGetParameterMask',
      'webglWhitelistParameterHook',
      'webglGetSupportedExtensionsPatch',
      'webglGetExtensionPatch',
      'webglGetContextPatch',
      'webglReadPixelsHook',
      'webglGetShaderPrecisionFormatHook',
      'webglShaderSourceHook',
      'webglGetUniformHook'
    ].forEach(fn => {
      if (typeof webglHooks[fn] !== 'function') {
        throw new Error(`Функция ${fn} не определена в webglHooks!`);
      }
    });

    // 6) WebGL-hooks regisgration
    if (C.registerWebGLGetParameterHook) {          C.registerWebGLGetParameterHook(webglHooks.webglGetParameterMask);
                                                    C.registerWebGLGetParameterHook(webglHooks.webglWhitelistParameterHook);
    }
    if (C.registerWebGLGetSupportedExtensionsHook)   C.registerWebGLGetSupportedExtensionsHook(webglHooks.webglGetSupportedExtensionsPatch);
    if (C.registerWebGLGetExtensionHook)             C.registerWebGLGetExtensionHook(webglHooks.webglGetExtensionPatch);
    if (C.registerWebGLGetContextHook)               C.registerWebGLGetContextHook(webglHooks.webglGetContextPatch);
    if (C.registerWebGLReadPixelsHook)               C.registerWebGLReadPixelsHook(webglHooks.webglReadPixelsHook);
    if (C.registerWebGLGetShaderPrecisionFormatHook) C.registerWebGLGetShaderPrecisionFormatHook(webglHooks.webglGetShaderPrecisionFormatHook);
    if (C.registerWebGLShaderSourceHook)             C.registerWebGLShaderSourceHook(webglHooks.webglShaderSourceHook);
    if (C.registerWebGLGetUniformHook)               C.registerWebGLGetUniformHook(webglHooks.webglGetUniformHook);

    // 7) Apply context patches after hooks registration
    // Idempotent: protected by patchedMethods WeakSet inside ContextPatchModule
    if (typeof C.applyCanvasElementPatches === 'function') C.applyCanvasElementPatches();
    if (typeof C.applyOffscreenPatches === 'function')     C.applyOffscreenPatches();
    if (typeof C.applyWebGLContextPatches === 'function')  C.applyWebGLContextPatches();
  }
    // export registerAllHooks for applying in main.py
window.registerAllHooks = registerAllHooks;

}(typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : globalThis));

;
/**
 * headers_interceptor.js
 *
 * Патчит fetch и XHR, инжектируя заголовки по профилю.
 * Важно:
 *  - API экспортируется ВСЕГДА: window.HeadersInterceptor = { ... }
 *  - Патч сети применяется ТОЛЬКО когда готовы зависимости (CanvasPatchContext + window.__HEADERS__)
 *  - Повторный вызов HeadersInterceptor(window) безопасен (idempotent guard)
 */

function HeadersInterceptor(window) {
  'use strict';
  const LOG_PREFIX = '[headers_interceptor.js]';
  const DEBUG = !!window.__HEADERS_DEBUG__;

  // --------------------------- У Т И Л И Т Ы -----------------------------
  const ORIGIN = window.location.origin;

  function dlog() {
    if (DEBUG) console.debug.apply(console, [LOG_PREFIX].concat([].slice.call(arguments)));
  }

  /** Безопасный разбор URL c базой location.href */
  function toURLLike(input) {
    try {
      if (input instanceof URL) return input;
      if (typeof input === 'string') return new URL(input, window.location.href);
      if (input && typeof input.url === 'string') return new URL(input.url, window.location.href);
    } catch (_) {}
    return null;
  }

  function getHost(input) {
    const u = toURLLike(input);
    return u ? u.hostname.toLowerCase() : '';
  }

  function getOrigin(input) {
    const u = toURLLike(input);
    return u ? u.origin : '';
  }

  function isSameOrigin(input) {
    return getOrigin(input) === ORIGIN;
  }

  /** Сопоставление по суффиксу домена с учётом границы точки */
  function hostMatchesSuffix(host, suffix) {
    if (!host || !suffix) return false;
    const h = host.toLowerCase();
    let s = suffix.toLowerCase();
    if (s[0] !== '.') s = `.${s}`;
    return h === s.slice(1) || h.endsWith(s);
  }

  // --- Heuristic: определяем ресурс, который нельзя трогать (иначе риск taint/ломаем цвета)
  function isLikelyImageURL(u) {
    try {
      const url = (u instanceof URL) ? u
        : (typeof u === 'string') ? new URL(u, window.location.href)
        : (u && typeof u.url === 'string') ? new URL(u.url, window.location.href)
        : null;
      if (!url) return false;
      const p = url.pathname.toLowerCase();
      return /\.(png|jpe?g|webp|gif|avif|bmp|ico|svg)$/.test(p);
    } catch { return false; }
  }

  function isLikelyFontURL(u) {
    try {
      const url = (u instanceof URL) ? u
        : (typeof u === 'string') ? new URL(u, window.location.href)
        : (u && typeof u.url === 'string') ? new URL(u.url, window.location.href)
        : null;
      if (!url) return false;
      const p = url.pathname.toLowerCase();
      return /\.(woff2|woff|ttf|otf|eot)$/.test(p);
    } catch { return false; }
  }

  function isLikelyMediaURL(u) {
    try {
      const url = (u instanceof URL) ? u
        : (typeof u === 'string') ? new URL(u, window.location.href)
        : (u && typeof u.url === 'string') ? new URL(u.url, window.location.href)
        : null;
      if (!url) return false;
      const p = url.pathname.toLowerCase();
      return /\.(mp4|webm|ogg|mp3|wav|m4a)$/.test(p);
    } catch { return false; }
  }

  function isImageFontMediaRequest(req, targetURL) {
    try {
      const accept = req && req.headers && req.headers.get ? (req.headers.get('accept') || '') : '';
      if (/\bimage\//i.test(accept) || /\bfont\/|application\/font/i.test(accept) || /\bvideo\/|\baudio\//i.test(accept)) {
        return true;
      }
    } catch {}
    return isLikelyImageURL(targetURL || req) || isLikelyFontURL(targetURL || req) || isLikelyMediaURL(targetURL || req);
  }

  // --------------------------- К О Н Ф И Г -------------------------------

  const SAFE_LISTED = new Set([
    'accept-language',
  ]);

  // Эти заголовки допускаем ТОЛЬКО от движка/CDP, не из JS
  const CDP_ONLY = new Set(['accept', 'accept-language']);

  const IGNORED_SUFFIXES = new Set([
    '.google.com', '.yandex.ru', '.github.io', '.gstatic.com', '.chatgpt.com',
    '.facebook.com', '.doubleclick.net', '.apple.com', '.windowsupdate.com',
    '.microsoft.com',
    // Antibot Challenge
    '.cloudflare.com', '.challenge.cloudflare.com', '.challenges.cloudflare.com',
    '.akamaihd.net', '.perimeterx.net',
    '.hcaptcha.com', '.recaptcha.net'
  ]);

  const ALLOW_SUFFIXES = new Set([
    // пусто по умолчанию — управляется через API addAllow()
  ]);

  // --- API (ДОЛЖЕН БЫТЬ ДОСТУПЕН ДАЖЕ ЕСЛИ ПАТЧ ПОКА НЕЛЬЗЯ ПРИМЕНИТЬ) ---
  let headerProfile = 'min';

  function setProfile(name) {
    if (name === 'min' || name === 'default' || name === 'full') {
      headerProfile = name;
      return true;
    }
    console.warn(`${LOG_PREFIX} unknown header profile: ${name}`);
    return false;
  }

  function normSuffix(s) {
    if (!s) return '';
    s = String(s).trim();
    if (!s) return '';
    return s[0] === '.' ? s : '.' + s;
  }

  function addAllow(s) {
    const v = normSuffix(s);
    if (v) ALLOW_SUFFIXES.add(v);
  }

  function addIgnore(s) {
    const v = normSuffix(s);
    if (v) IGNORED_SUFFIXES.add(v);
  }

  function listAllow() {
    return Array.from(ALLOW_SUFFIXES);
  }

  function listIgnore() {
    return Array.from(IGNORED_SUFFIXES);
  }

  window.HeadersInterceptor = {
    setProfile,
    addAllow,
    addIgnore,
    listAllow,
    listIgnore,
  };

  // --------------------------- ГЕЙТ НА ИНИТ -------------------------------

  const C = window.CanvasPatchContext;
  if (!C) {
    console.warn(`${LOG_PREFIX} CanvasPatchContext is not ready — skipping headers patch for now`);
    return; // API уже экспортирован
  }

  const RAW_H = (window.__HEADERS__ && typeof window.__HEADERS__ === 'object') ? window.__HEADERS__ : null;
  if (!RAW_H) {
    console.warn(`${LOG_PREFIX} window.__HEADERS__ is missing/invalid — skipping headers patch for now`);
    return; // API уже экспортирован; main.py вызовет HeadersInterceptor(window) повторно после инжекта
  }

  // idempotent guard: допускаем повторный вызов, но патчим сеть только 1 раз
  if (window.__HEADERS_INTERCEPTOR_INSTALLED__) return;
  window.__HEADERS_INTERCEPTOR_INSTALLED__ = true;

  const HEADER_PROFILES = {
    min: [],
    // By default inject nothing from JS — headers come natively through CDP
    default: [],
    // Полный можно включать вручную; Accept/Accept-Language игнорируются (см. CDP_ONLY)
    full: Object.keys(RAW_H),
  };

  /** Собираем объект: {name: value} по выбранным ключам из window.__HEADERS__ */
  function getProfiledHeaders(profileName) {
    const allowKeys = HEADER_PROFILES[profileName || headerProfile] || [];
    const out = {};
    for (const k of allowKeys) {
      if (k in RAW_H) {
        const kl = String(k).toLowerCase();
        if (!CDP_ONLY.has(kl)) out[k] = RAW_H[k];
      }
    }
    return out;
  }

  function isIgnoredHost(host) {
    if (!host) return false;
    for (const sfx of IGNORED_SUFFIXES) {
      if (hostMatchesSuffix(host, sfx)) return true;
    }
    return false;
  }

  function isAllowedHost(host) {
    if (!host) return false;
    for (const sfx of ALLOW_SUFFIXES) {
      if (hostMatchesSuffix(host, sfx)) return true;
    }
    return false;
  }

  /**
   * same-origin: можно профиль целиком
   * cross-origin + allow-list: профиль целиком
   * cross-origin + not-allowed: только safelisted
   */
  function filterHeadersForCors(target, headersObj) {
    const same = isSameOrigin(target);
    const host = getHost(target);
    const allowed = isAllowedHost(host);

    if (!same && !allowed) {
      const filtered = {};
      for (const k in headersObj) {
        if (Object.prototype.hasOwnProperty.call(headersObj, k)) {
          if (SAFE_LISTED.has(String(k).toLowerCase())) filtered[k] = headersObj[k];
          else dlog('Blocked non-safelisted header for cross-origin', host, k);
        }
      }
      return filtered;
    }
    return headersObj;
  }

  function buildMergedHeaders(target, baseHeaders, profileHeaders) {
    const normalizedBase = new Headers(baseHeaders || undefined);
    const toInject = filterHeadersForCors(target, profileHeaders);
    for (const k in toInject) {
      if (Object.prototype.hasOwnProperty.call(toInject, k)) {
        try { normalizedBase.set(k, String(toInject[k])); } catch (e) { dlog('Failed to set header', k, e); }
      }
    }
    return normalizedBase;
  }

  // ----------------------------- fetch -----------------------------------
  const _fetch = window.fetch;
  window.fetch = async function patchedFetch(input, init) {
    try {
      const baseReq = (input instanceof Request) ? input : new Request(input, init);
      const targetURL = toURLLike(baseReq.url);
      const host = targetURL ? targetURL.host : getHost(baseReq.url);

      if (isIgnoredHost(host)) return _fetch.call(this, baseReq);
      if (isImageFontMediaRequest(baseReq, targetURL)) return _fetch.call(this, baseReq);

      const same = isSameOrigin(baseReq.url);
      if (baseReq.mode === 'no-cors' && !same && !isAllowedHost(host)) return _fetch.call(this, baseReq);

      const profiled = getProfiledHeaders(headerProfile);
      if (!Object.keys(profiled).length) return _fetch.call(this, baseReq);

      const mergedHeaders = buildMergedHeaders(baseReq.url, baseReq.headers, profiled);

      // если ничего реально не поменялось — короткий путь
      let changed = false;
      for (const [k, v] of mergedHeaders.entries()) {
        if (!baseReq.headers.has(k) || baseReq.headers.get(k) !== v) { changed = true; break; }
      }
      if (!changed) return _fetch.call(this, baseReq);

      const finalReq = new Request(baseReq, { headers: mergedHeaders });
      return _fetch.call(this, finalReq);
    } catch (e) {
      console.warn(`${LOG_PREFIX} fetch patch error:`, e);
      return _fetch.apply(this, arguments);
    }
  };

  // ----------------------------- XHR -------------------------------------
  const XHR_STATE = new WeakMap();
  const XHROpen = XMLHttpRequest.prototype.open;
  const XHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    try {
      XHR_STATE.set(this, { method: String(method || 'GET').toUpperCase(), url: String(url || '') });
    } catch {}
    return XHROpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function () {
    try {
      const state = XHR_STATE.get(this) || {};
      const url = state.url || '';
      const host = getHost(url);

      if (isLikelyImageURL(url) || isLikelyFontURL(url) || isLikelyMediaURL(url)) return XHRSend.apply(this, arguments);
      if (isIgnoredHost(host)) return XHRSend.apply(this, arguments);

      const profiled = getProfiledHeaders(headerProfile);
      const allowedToInject = filterHeadersForCors(url, profiled);

      for (const k in allowedToInject) {
        if (Object.prototype.hasOwnProperty.call(allowedToInject, k)) {
          try { this.setRequestHeader(k, String(allowedToInject[k])); } catch (e) { dlog('XHR failed setRequestHeader', k, e); }
        }
      }
    } catch (e) {
      console.warn(`${LOG_PREFIX} XHR patch error:`, e);
    }
    return XHRSend.apply(this, arguments);
  };

  console.log(`${LOG_PREFIX} patch loaded. Header profile: ${headerProfile}`);
}

;

            LOGGingModule(window);
            RtcpeerconnectionPatchModule(window);
            HideWebdriverPatchModule(window);
            EnvParamsPatchModule(window);
            NavTotalSetPatchModule(window);
            ScreenPatchModule(window);
            FontPatchModule(window);
            CanvasPatchModule(window);
            WEBglDICKts(window);
            WebglPatchModule(window);
            WebgpuWLBootstrap(window);
            WebGPUPatchModule(window);
            AudioContextModule(window);
            ContextPatchModule(window);
            HeadersInterceptor(window);
           // —————— Register all hooks here ——————//
            if (typeof registerAllHooks === 'function') registerAllHooks();
            (function applyAllPatchesCustomOrder(win) {
                const C = win.CanvasPatchContext; if (!C) return;
                if (C.applyCanvasElementPatches) C.applyCanvasElementPatches();
                if (C.applyOffscreenPatches)     C.applyOffscreenPatches();
                if (C.applyCtx2DContextPatches)  C.applyCtx2DContextPatches();
                if (C.applyWebGLContextPatches)  C.applyWebGLContextPatches();
            // ——— Worker env diagnostics ———//
            console.info('[DIAG]', window.WorkerPatchHooks.diag && window.WorkerPatchHooks.diag());
            })(window);
            
//# sourceURL=page_bundle.js
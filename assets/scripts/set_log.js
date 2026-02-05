const LOGGingModule = function LOGGingModule() {
    if (!window.__PATCH_MYTYPER__) {
    window.__PATCH_MYTYPER__ = true;

    const global = window;
    const C = (global.CanvasPatchContext = global.CanvasPatchContext || {});
    const G =
      (typeof globalThis !== "undefined" && globalThis) ||
      (typeof self !== "undefined" && self) ||
      (typeof window !== "undefined" && window) ||
      {};

    // ===== 0) Central store: ONLY window._myDebugLo  =====
    if (!Array.isArray(global._myDebugLog)) global._myDebugLog = [];
    G._myDebugLog = global._myDebugLog;

    // Debug flag (respect false)
    G.__DEBUG__ =
      typeof global.__DEBUG__ !== "undefined" ? global.__DEBUG__ : true;
      // typeof global.__DEBUG__ !== "undefined" ? global.__DEBUG__ : false;

    window.env = window.env || {};
    window.env.DEBUG_DEGRADES = true;   // включить
    // window.env.DEBUG_DEGRADES = false; // выключить
    const env = window.env;


    // Save original console methods
    const origConsole = {
      log: console.log && console.log.bind(console),
      warn: console.warn && console.warn.bind(console),
      error: console.error && console.error.bind(console),
      info: console.info && console.info.bind(console),
      debug: console.debug && console.debug.bind(console),
      trace: console.trace && console.trace.bind(console),
    };

    function getLoggerGuard() {
      if (!G.__LOGGER_GUARD__) {
        Object.defineProperty(G, "__LOGGER_GUARD__", {
          value: { count: 0, last: null, lastAt: null },
          writable: true,
          configurable: true,
          enumerable: false
        });
      }
      return G.__LOGGER_GUARD__;
    }

    function recordLoggerError(err, where) {
      const guard = getLoggerGuard();
      guard.count++;
      guard.lastAt = Date.now();
      guard.last = {
        where: where ? String(where) : "unknown",
        message: (err && err.message) ? String(err.message) : String(err),
        stack: (err && err.stack) ? String(err.stack) : null
      };

      if (Array.isArray(global._myDebugLog)) {
        pushEntry({
          type: "logger_guard",
          where: guard.last.where,
          message: guard.last.message,
          stack: guard.last.stack,
          timestamp: new Date().toISOString()
        });
      }
    }


    function guardedApply(fn, self, args, where) {
      try {
        return Reflect.apply(fn, self, args);
      } catch (err) {
        recordLoggerError(err, where);
        throw err;
      }
    }

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

        if (t === "string") {
          // Avoid huge "data:" payloads (canvas/audio/etc) in logs: they bloat JSON and skew perf timings.
          if (value.indexOf("data:") === 0) return "[DataURL len=" + value.length + "]";
          if (value.indexOf("blob:") === 0) return "[BlobURL]";
          return value;
        }
        if (t === "number" || t === "boolean") return value;

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
      } catch (e) {
        // ВАЖНО: не вызывать __DEGRADE__ отсюда, если __DEGRADE__ пишет через pushEntry,
        // иначе рекурсия по пути ошибок (само-логирование логгера).
        // (если очень надо сигналить — делай это через origConsole.* или просто молчи)
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          throw e;
        }
      }
    }


    // ===== 2.5) Swallowed/degrade marker (explicit) =====
    G.__DEGRADE__ = function (code, err, extra) {
      try {
        if (typeof pushEntry !== "function") {
          if (env && env.DEBUG_DEGRADES) throw new TypeError();
          return;
        }
        pushEntry({
          type: "degrade",
          code: code ? String(code) : "unknown",
          error: err instanceof Error ? {
            name: err.name,
            message: err.message,
            stack: err.stack || null,
          } : (err ? safeStringify(err) : null),
          extra: extra ? normalizeForJSON(extra) : null,
          timestamp: new Date().toISOString(),
        });
        } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
            if (origConsole && origConsole.error) {
            try { origConsole.error(e); } catch (_) {}
            }
            throw e;
        }
        }
    };
    global.__DEGRADE__ = G.__DEGRADE__;




    // ===== 2) Core logger: pushLog (console + errors) =====
    function pushLog(level, args, withStack, module) {
      try {
        if (!levelAllows(G._logLevel, level)) return;

        const normArgs = normalizeForJSON(args);
        const msgParts = [];
        if (args && args.length) {
          for (let i = 0; i < args.length; i++) {
            try {
              const a = args[i];
              if (typeof a === "string") {
                if (a.indexOf("data:") === 0) msgParts.push("[DataURL len=" + a.length + "]");
                else if (a.indexOf("blob:") === 0) msgParts.push("[BlobURL]");
                else msgParts.push(a);
              } else msgParts.push(safeTag(a));
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
          expanded: normArgs,
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

        pushEntry(e); // <-- обязательно вернуть
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          if (typeof __DEGRADE__ === "function") __DEGRADE__("pushLog", e);
          throw e;
        }
      }
    }

    // ===== 3) Patch console.* (single source of truth) =====
    for (const level of LOG_LEVELS) {
      const orig = origConsole[level];
      if (!orig) continue;

      console[level] = function () {
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
          guardedApply(orig, console, args, "console." + level);
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
      if (orig) guardedApply(orig, console, callArgs, "log." + level);

      // Store entry
      pushLog(level, args, level === "error" || level === "warn" || level === "log", module);
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
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          if (typeof __DEGRADE__ === "function") __DEGRADE__("onerror", e);
          throw e;
        }
      }
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
        } catch (e) {
          if (env && env.DEBUG_DEGRADES) {
            if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
            if (typeof __DEGRADE__ === "function") __DEGRADE__("resource_error", e);
            throw e;
          }
        }
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
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          if (typeof __DEGRADE__ === "function") __DEGRADE__("unhandledrejection", e);
          throw e;
        }
      }
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
          } catch (e) {
            if (env && env.DEBUG_DEGRADES) {
              if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
              if (typeof __DEGRADE__ === "function") __DEGRADE__("worker_error", e);
              throw e;
            }
          }
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
          } catch (e) {
            if (env && env.DEBUG_DEGRADES) {
              if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
              if (typeof __DEGRADE__ === "function") __DEGRADE__("worker_unhandledrejection", e);
              throw e;
            }
          }
        });
      }
    } catch (e) {
      if (env && env.DEBUG_DEGRADES) {
        if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
        if (typeof __DEGRADE__ === "function") __DEGRADE__("worker_context", e);
        throw e;
      }
    }

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
          } catch (e) {
            if (env && env.DEBUG_DEGRADES) {
              if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
              if (typeof __DEGRADE__ === "function") __DEGRADE__("exportMyDebugLog", e);
              throw e;
            }
          }
          try {
            URL.revokeObjectURL(url);
          } catch (e) {
            if (env && env.DEBUG_DEGRADES) {
              if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
              if (typeof __DEGRADE__ === "function") __DEGRADE__("exportMyDebugLog", e);
              throw e;
            }
          }
        }, 5500);
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          if (typeof __DEGRADE__ === "function") __DEGRADE__("exportMyDebugLog", e);
          throw e;
        }
      }
    };




    // ===== 7) One-click toggles (no markers) =====
    global.DEBUG_ALL_ON = function () {
      try {
        global.__DEBUG__ = true;
        global._logLevel = "trace";
        if (global._logConfig) {
          for (const k in global._logConfig) {
            global._logConfig[k].enabled = true;
            global._logConfig[k].level = "trace";
          }
        }
        if (typeof global.__DEGRADE__ === "function") {
          global.__DEGRADE__("DEBUG_ALL_ON", null);
        }
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          if (typeof __DEGRADE__ === "function") __DEGRADE__("DEBUG_ALL_ON", e);
          throw e;
        }
      }
    };

    global.DEBUG_ALL_OFF = function () {
      try {
        global.__DEBUG__ = false;
        global._logLevel = "error";
        if (global._logConfig) {
          for (const k in global._logConfig) {
            global._logConfig[k].enabled = false;
          }
        }
        if (typeof global.__DEGRADE__ === "function") {
          global.__DEGRADE__("DEBUG_ALL_OFF", null);
        }
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          if (typeof __DEGRADE__ === "function") __DEGRADE__("DEBUG_ALL_OFF", e);
          throw e;
        }
      }
    };

    global.DEBUG_ALL_TOGGLE = function () {
      try {
        if (global.__DEBUG__) global.DEBUG_ALL_OFF();
        else global.DEBUG_ALL_ON();
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          if (typeof __DEGRADE__ === "function") __DEGRADE__("DEBUG_ALL_TOGGLE", e);
          throw e;
        }
      }
    };

  

      // after all logger globals are assigned:
      Object.defineProperty(window, "_myDebugLog", { value: window._myDebugLog, writable:true, configurable:true, enumerable:false });
      Object.defineProperty(window, "_logLevel",   { value: window._logLevel,   writable:true, configurable:true, enumerable:false });
      Object.defineProperty(window, "_logConfig",  { value: window._logConfig,  writable:true, configurable:true, enumerable:false });
      Object.defineProperty(window, "__DEBUG__",   { value: window.__DEBUG__,   writable:true, configurable:true, enumerable:false });
      Object.defineProperty(window, "__DEGRADE__", { value: window.__DEGRADE__, writable:false, configurable:true, enumerable:false });
      Object.defineProperty(window, "log",         { value: window.log,         writable:false, configurable:true, enumerable:false });
      Object.defineProperty(window, "exportMyDebugLog", { value: window.exportMyDebugLog, writable:false, configurable:true, enumerable:false });
      Object.defineProperty(window, "DEBUG_ALL_ON",     { value: window.DEBUG_ALL_ON,     writable:false, configurable:true, enumerable:false });
      Object.defineProperty(window, "DEBUG_ALL_OFF",    { value: window.DEBUG_ALL_OFF,    writable:false, configurable:true, enumerable:false });
      Object.defineProperty(window, "DEBUG_ALL_TOGGLE", { value: window.DEBUG_ALL_TOGGLE, writable:false, configurable:true, enumerable:false });


    }

}

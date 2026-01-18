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

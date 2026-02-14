const LOGGingModule = function LOGGingModule() {
    const G =
      (typeof globalThis !== "undefined" && globalThis) ||
      (typeof self !== "undefined" && self) ||
      (typeof window !== "undefined" && window) ||
      {};
    const W = (typeof window !== "undefined" && window) ? window : null;

    if (!G.__PATCH_MYTYPER__) {
    G.__PATCH_MYTYPER__ = true;

    const global = G;
    const C = ((W || G).CanvasPatchContext = (W || G).CanvasPatchContext || {});

    // ===== 0) Central store: private buffer only =====
    const STORE = new WeakMap();
    const FALLBACK_BUF = [];
    let degradeFn = null;

    function _buf() {
      const key = degradeFn || G.__DEGRADE__;
      if (typeof key !== "function") return FALLBACK_BUF;
      if (!STORE.has(key)) STORE.set(key, []);
      return STORE.get(key);
    }

    function _guardPush(entry) {
      try { _buf().push(entry); } catch (_) {}
    }


    // Debug flag (respect false)
    G.__DEBUG__ =
      typeof global.__DEBUG__ !== "undefined" ? global.__DEBUG__ : true;
      // typeof global.__DEBUG__ !== "undefined" ? global.__DEBUG__ : false;

    global.env = global.env || {};
    // Toggle for *logger self-diagnostics visibility*.
    // IMPORTANT: must not change runtime behavior by throwing from the logger.
    global.env.DEBUG_DEGRADES = true;   // включить
    // global.env.DEBUG_DEGRADES = false; // выключить
    const env = global.env;


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

      _guardPush({
        type: "logger_guard",
        logger_guard: true,
        where: guard.last.where,
        message: guard.last.message,
        stack: guard.last.stack,
        timestamp: new Date().toISOString()
      });

      
    }


    function guardedApply(fn, self, args, where) {
      try {
        return Reflect.apply(fn, self, args);
      } catch (err) {
        recordLoggerError(err, where);
        // Logging must never become a runtime crash source.
        return undefined;
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

    const SERIAL_LIMITS = {
      depth: 3,
      keys: 32,
      array: 64,
      string: 512,
      metaKeys: 8
    };

    function clampString(value) {
      const s = String(value);
      if (s.length <= SERIAL_LIMITS.string) return s;
      return s.slice(0, SERIAL_LIMITS.string) + `...[len=${s.length}]`;
    }

    function isPlainObject(value) {
      if (!value || typeof value !== "object") return false;
      let proto;
      try {
        proto = Object.getPrototypeOf(value);
      } catch (_) {
        return false;
      }
      return proto === Object.prototype || proto === null;
    }

    function metadataSnapshot(value, tag) {
      const out = { __type: "snapshot", tag: tag || safeTag(value) };
      try {
        const ctor = value && value.constructor && value.constructor.name;
        if (typeof ctor === "string" && ctor) out.ctor = ctor;
      } catch (_) {}
      try {
        if (typeof value === "function") out.name = value.name || "anonymous";
      } catch (_) {}
      try {
        if (value && typeof value === "object") {
          if (typeof value.length === "number" && isFinite(value.length)) out.length = value.length;
          const keys = Object.keys(value);
          out.keys = keys.slice(0, SERIAL_LIMITS.metaKeys);
          if (keys.length > SERIAL_LIMITS.metaKeys) out.keys_truncated = keys.length - SERIAL_LIMITS.metaKeys;
        }
      } catch (_) {}
      return out;
    }

    function normalizeForJSON(value, seen, depth) {
      try {
        const lvl = typeof depth === "number" ? depth : 0;
        if (value === null || typeof value === "undefined") return value;
        const t = typeof value;

        if (t === "string") {
          if (value.indexOf("data:") === 0) return "[DataURL len=" + value.length + "]";
          if (value.indexOf("blob:") === 0) return "[BlobURL]";
          return clampString(value);
        }
        if (t === "number" || t === "boolean") return value;
        if (t === "bigint") return String(value) + "n";
        if (t === "symbol") return String(value);

        if (t === "function") {
          return metadataSnapshot(value, safeTag(value));
        }

        if (value instanceof Error) {
          return {
            __type: "Error",
            name: clampString(value.name || "Error"),
            message: clampString(value.message || ""),
            stack: value.stack ? clampString(value.stack) : null,
          };
        }

        const tag = safeTag(value);
        if (isHostLikeTag(tag)) return metadataSnapshot(value, tag);

        if (t !== "object") return clampString(value);

        // Cycles
        if (!seen) seen = new WeakSet();
        if (seen.has(value)) return "[Circular]";
        seen.add(value);

        if (lvl >= SERIAL_LIMITS.depth) return metadataSnapshot(value, tag);

        // Arrays
        if (Array.isArray(value)) {
          const lim = Math.min(value.length, SERIAL_LIMITS.array);
          const outArr = new Array(lim);
          for (let i = 0; i < lim; i++) {
            outArr[i] = normalizeForJSON(value[i], seen, lvl + 1);
          }
          if (value.length > lim) outArr.push(`[... ${value.length - lim} more items]`);
          return outArr;
        }

        if (!isPlainObject(value)) return metadataSnapshot(value, tag);

        const out = {};
        const keys = Object.keys(value);
        const lim = Math.min(keys.length, SERIAL_LIMITS.keys);
        for (let i = 0; i < lim; i++) {
          const k = keys[i];
          try {
            out[k] = normalizeForJSON(value[k], seen, lvl + 1);
          } catch (_) {
            out[k] = "[Unserializable]";
          }
        }
        if (keys.length > lim) out.__truncated_keys__ = keys.length - lim;
        return out;
      } catch (_) {
        return metadataSnapshot(value, safeTag(value));
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
        _buf().push(entry);
      } catch (e) {
        // ВАЖНО: не вызывать __DEGRADE__ отсюда, если __DEGRADE__ пишет через pushEntry,
        // иначе рекурсия по пути ошибок (само-логирование логгера).
        // (если очень надо сигналить — делай это через origConsole.* или просто молчи)
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          // Keep last-known logger failure in memory; never throw outward from the logger.
          try { recordLoggerError(e, "pushEntry"); } catch (_) {}
        }
      }
    }


    // ===== 2.5) Swallowed/degrade marker (explicit) =====
    G.__DEGRADE__ = function (code, err, extra) {
    degradeFn = G.__DEGRADE__;
      try {
        if (typeof pushEntry !== "function") {
          if (env && env.DEBUG_DEGRADES) {
            const te = new TypeError("[set_log] pushEntry is missing");
            try { recordLoggerError(te, "__DEGRADE__:pushEntry_missing"); } catch (_) {}
            if (origConsole && origConsole.error) { try { origConsole.error(te); } catch (_) {} }
          }
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
            try { recordLoggerError(e, "__DEGRADE__"); } catch (_) {}
        }
        }
    };

    Object.defineProperty(G.__DEGRADE__, "getBuffer", {
      value() {
        return _buf().slice();
      },
      enumerable: false,
      writable: false,
      configurable: false
    });

    /**
     * window.__DEGRADE__.diag(level, code, ctx, err?)
     *
     * Единый вход для диагностических событий всех модулей.
     *
     * @param {string} level - 'info'|'warn'|'error'|'fatal'
     * @param {string} code - идентификатор события
     * @param {object} ctx - plain-object контекст: module, diagTag, surface, key, stage, message, data, type
     * @param {Error} [err] - опциональная ошибка
     *
     * Записывает в shape: { type:'degrade', code, error, extra:{ level, type, ... }, timestamp }.
     * Fail-safe: не бросает исключения и не пишет в console.
     */
    Object.defineProperty(G.__DEGRADE__, "diag", {
      value(level, code, ctx, err) {
        try {
          const validLevels = ["info", "warn", "error", "fatal"];
          const rawLevel = String(level || "info");
          const normalizedLevel = validLevels.indexOf(rawLevel) !== -1 ? rawLevel : "info";
          const normalizedCode = String(code || "unknown");

          let safeCtx = ctx;
          if (!isPlainObject(safeCtx)) {
            safeCtx = {};
          }


      const validTypes = ["pipeline missing data", "browser structure missing data"];
      const rawType = (safeCtx && typeof safeCtx.type === "string") ? safeCtx.type : "";
      const validatedType = validTypes.indexOf(rawType) !== -1 ? rawType : "pipeline missing data";

      let dataIn = safeCtx && safeCtx.data;
      if (rawType && validatedType !== rawType) {
        if (dataIn && typeof dataIn === "object") {
          try { dataIn = Object.assign({}, dataIn, { _badType: rawType }); }
          catch (_) { dataIn = { _badType: rawType }; }
        } else {
          dataIn = { _badType: rawType };
        }
      }
      const safeData = normalizeForJSON(dataIn);

      const extraObj = {
        level: normalizedLevel,
        type: validatedType,
        module: (typeof safeCtx.module === "string") ? safeCtx.module : undefined,
        diagTag: (typeof safeCtx.diagTag === "string") ? safeCtx.diagTag : undefined,
        surface: (typeof safeCtx.surface === "string") ? safeCtx.surface : undefined,
        key: (typeof safeCtx.key === "string") ? safeCtx.key : undefined,
        stage: (typeof safeCtx.stage === "string") ? safeCtx.stage : undefined,
        message: (typeof safeCtx.message === "string") ? safeCtx.message : undefined,
        data: safeData
      };

      G.__DEGRADE__(normalizedCode, err, extraObj);

      } catch (e) { try { recordLoggerError(e, "diag"); } catch (_) {} }

    },
    enumerable: false,
    writable: false,
    configurable: false
  });
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
          // Do not call __DEGRADE__ here (it writes through pushEntry); avoid recursion.
          try { recordLoggerError(e, "pushLog"); } catch (_) {}
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
          try { recordLoggerError(e, "onerror"); } catch (_) {}
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
            try { recordLoggerError(e, "resource_error"); } catch (_) {}
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
          try { recordLoggerError(e, "unhandledrejection"); } catch (_) {}
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
               try { recordLoggerError(e, "worker_error"); } catch (_) {}
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
               try { recordLoggerError(e, "worker_unhandledrejection"); } catch (_) {}
             }
           }
         });
      }
     } catch (e) {
       if (env && env.DEBUG_DEGRADES) {
         if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
         try { recordLoggerError(e, "worker_context"); } catch (_) {}
       }
     }

    // ===== 6) Export helper (in-session) =====
    global.exportMyDebugLog = function () {
      try {
        if (typeof document === "undefined" || !document) return;
        const list = (typeof G.__DEGRADE__ === "function" && typeof G.__DEGRADE__.getBuffer === "function")
          ? G.__DEGRADE__.getBuffer()
          : [];
        const data = JSON.stringify(list, null, 2);
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
              try { recordLoggerError(e, "exportMyDebugLog:removeChild"); } catch (_) {}
            }
          }
          try {
            URL.revokeObjectURL(url);
          } catch (e) {
            if (env && env.DEBUG_DEGRADES) {
              if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
              try { recordLoggerError(e, "exportMyDebugLog:revokeObjectURL"); } catch (_) {}
            }
          }
        }, 5500);
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          try { recordLoggerError(e, "exportMyDebugLog"); } catch (_) {}
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
          try { recordLoggerError(e, "DEBUG_ALL_ON"); } catch (_) {}
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
          try { recordLoggerError(e, "DEBUG_ALL_OFF"); } catch (_) {}
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
          try { recordLoggerError(e, "DEBUG_ALL_TOGGLE"); } catch (_) {}
        }
      }
    };

    // Logger self-diagnostics mode toggles (controls verbosity, not runtime throws)
    global.DEBUG_DEGRADES_ON = function () {
      try {
        global.env = global.env || {};
        global.env.DEBUG_DEGRADES = true;
        if (typeof global.__DEGRADE__ === "function") global.__DEGRADE__("DEBUG_DEGRADES_ON", null);
      } catch (e) {
        if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
        try { recordLoggerError(e, "DEBUG_DEGRADES_ON"); } catch (_) {}
      }
    };

    global.DEBUG_DEGRADES_OFF = function () {
      try {
        global.env = global.env || {};
        global.env.DEBUG_DEGRADES = false;
        if (typeof global.__DEGRADE__ === "function") global.__DEGRADE__("DEBUG_DEGRADES_OFF", null);
      } catch (e) {
        if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
        try { recordLoggerError(e, "DEBUG_DEGRADES_OFF"); } catch (_) {}
      }
    };

    global.DEBUG_DEGRADES_TOGGLE = function () {
      try {
        global.env = global.env || {};
        global.env.DEBUG_DEGRADES = !global.env.DEBUG_DEGRADES;
        if (typeof global.__DEGRADE__ === "function") global.__DEGRADE__("DEBUG_DEGRADES_TOGGLE", null, { enabled: !!global.env.DEBUG_DEGRADES });
      } catch (e) {
        if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
        try { recordLoggerError(e, "DEBUG_DEGRADES_TOGGLE"); } catch (_) {}
      }
    };

  

      // after all logger globals are assigned (Window realm only):
      if (W) {
        Object.defineProperty(W, "_logLevel",   { value: W._logLevel,   writable:true, configurable:true, enumerable:false });
        Object.defineProperty(W, "_logConfig",  { value: W._logConfig,  writable:true, configurable:true, enumerable:false });
        Object.defineProperty(W, "__DEBUG__",   { value: W.__DEBUG__,   writable:true, configurable:true, enumerable:false });
        Object.defineProperty(W, "__DEGRADE__", { value: W.__DEGRADE__, writable:false, configurable:true, enumerable:false });
        Object.defineProperty(W, "log",         { value: W.log,         writable:false, configurable:true, enumerable:false });
        Object.defineProperty(W, "exportMyDebugLog", { value: W.exportMyDebugLog, writable:false, configurable:true, enumerable:false });
        Object.defineProperty(W, "DEBUG_ALL_ON",     { value: W.DEBUG_ALL_ON,     writable:false, configurable:true, enumerable:false });
        Object.defineProperty(W, "DEBUG_ALL_OFF",    { value: W.DEBUG_ALL_OFF,    writable:false, configurable:true, enumerable:false });
        Object.defineProperty(W, "DEBUG_ALL_TOGGLE", { value: W.DEBUG_ALL_TOGGLE, writable:false, configurable:true, enumerable:false });
      }


    }

}

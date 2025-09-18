function LOGGingModule() {
  if (!window.__PATCH_MYTYPER__) {
      window.__PATCH_MYTYPER__ = true;   
      const global = window;
      const C = global.CanvasPatchContext = global.CanvasPatchContext || {};
      //Global JS log
      window._myDebugLog = window._myDebugLog || [];
      //Debug flag
      window.__DEBUG__ = window.__DEBUG__ || true;
      // Centralized log table
      window._logConfig = {
        global:           { enabled: true,  level: 'log'  },
        WEBGLlogger:      { enabled: true,  level: 'log'  },
        CanvasLogger:     { enabled: true,  level: 'debug'},
        Contextlogger:    { enabled: true,  level: 'debug'  },
        // FFJL:           { enabled: false, level: 'error' },
        // ...добавляй новые
      };
      // Supported logging levels 
      const LOG_LEVELS = ['error', 'warn', 'log', 'info', 'debug', 'trace'];
      window._logLevel = window._logLevel || 'log'; // Глобальный уровень 
      window._logConfig.WEBGLlogger = false;

      // log control:
      // Disable logs for webgl
      // window._logConfig.WebglPatchModule.enabled = false;
      // Turn on for Canvas on Debug
      // window._logConfig.CanvasPatchModule.enabled = true;
      // window._logConfig.CanvasPatchModule.level = 'debug';

      window.log = function(module, level, ...args) {
        const config = window._logConfig[module] || window._logConfig.global;
        if (!config.enabled) return;
        const allowed = LOG_LEVELS.slice(0, LOG_LEVELS.indexOf(config.level) + 1);
        if (!allowed.includes(level)) return;
        
      //  Formatting
      const prefix = `%c[${module}]%c`;
      const style1 = 'color: #fff; background: #0070f3; border-radius: 2px; padding: 2px 4px;';
      const style2 = 'color: inherit;';
      console[level](prefix, style1, style2, ...args);
        
        //Перечень подключенных модулей
      const LOGGING_SRC = {
        LGG:     'LOGGingModule',
        WEBGL:   'WebglPatchModule',
        CANVAS:  'CanvasPatchModule',
        NAV:     'NavTotalSetPatchModule',
        CNTXT:   'ContextPatchModule',
        FONT:    'FontPatchModule',
        HDRS:    'HeadersInterceptorModule',
        GPUP:    'WebGPUPatchModule',
        FNT:     'FontPatchGuard',
        AUDIO:   'AudioPatchModule',
        SCREEN:  'ScreenPatchModule',
        // etc.
      };

			// Stack of logs
			window._myDebugLog = window._myDebugLog || [];
			window._myDebugLog.push({
				type: 'console',
				level,
				module,
				message: args.map(safeStringify).join(' '),
        expanded: args.length === 1 ? args[0] : args,  // объект(ы) без сериализации
				timestamp: new Date().toISOString(),
				stack: (level === 'error' || level === 'warn')
					? (new Error().stack.split('\n').slice(1).join(' | '))
					: undefined,
				caller: (new Error().stack.split('\n')[2] || '').trim(),
				file: ((new Error().stack.match(/(https?:\/\/[^\s\)]+)/) || [])[1]),
				// customFields: (extra && typeof extra === 'object') ? extra : undefined,
			});
      };
      
      
      // _myDebugLog keeps records, exportMyDebugLog() unloads them in JSON.
      // To "take a snapshot" of the "expanded" version directly into this log from the console, it is enough, for example, in the console:
      // log('UA', 'debug', Object.getOwnPropertyDescriptors(navigator.userAgentData));
      // log('CANVAS', 'debug', Object.getOwnPropertyDescriptors(document.createElement('canvas').getContext('2d')));
      // log('NAV', 'debug', navigator.languages);
      // Все эти "снимки" окажутся в _myDebugLog и с полем message (короткая строка), и с полем expanded (полный JSON-массив).
      // Then  call exportMyDebugLog() → and unload into a file my_debug_log.json With expanded data.

      //save the original console methods
      const origConsole = {
        log:   console.log.bind(console),
        warn:  console.warn.bind(console),
        error: console.error.bind(console),
        info:  console.info.bind(console),
        debug: console.debug.bind(console),
        trace: console.trace.bind(console),
      };
    // Logging function
    function safeStringify(value) {
      try {
        // Primitives and functions are safe
        if (value === null || value === undefined) return String(value);
        const t = typeof value;
        if (t === 'string' || t === 'number' || t === 'boolean') return String(value);
        if (t === 'function') return `[Function ${value.name || 'anonymous'}]`;

        if (value && value instanceof Error) return `[Error ${value.name}: ${value.message}]`;

        // DOM‑nodes and other "host objects" - a short class name
        const tag = Object.prototype.toString.call(value); // [object Something]
        // Do not serialize the host objects: Return the short tag
        if (/\[object (Window|Document|HTML|SVG|Media|WebGL|Canvas|Offscreen|ImageData|Plugin|PluginArray|MimeType|MimeTypeArray)\]/.test(tag)) return tag;

        
        // SAFE serialization: FLAT JSON (regular objects/arrays only)
        if (t === 'object') {
          try {
            const seen = new WeakSet();
            const json = JSON.stringify(value, (k, v) => {
              // Functions and errors are already processed above - here we duplicate insurance
              if (typeof v === 'function') return `[Function ${v.name || 'anonymous'}]`;
              if (v && v instanceof Error) return { name: v.name, message: v.message };

              // torn off the cycles
              if (v && typeof v === 'object') {
                // host-Objects - a short tag at once
                const tt = Object.prototype.toString.call(v);
                if (/\[object (Window|Document|HTML|SVG|Media|WebGL|Canvas|Offscreen|ImageData|Plugin|PluginArray|MimeType|MimeTypeArray)\]/.test(tt)) return tt;

                if (seen.has(v)) return '[Circular]';
                seen.add(v);
              }
              return v;
          }, 2); //  pretty-print intendation
            return json;
          } catch (_) {
            return tag;
          }
        }

        // In other cases - a string representation in log
        return String(value);
      } catch (_) {
        // Any unexpected - safe tag
        return Object.prototype.toString.call(value);
      }
    }

    // === Service Helpers (unloading, filtering)
    window.exportMyDebugLog = function () {
      const data = safeStringify(window._myDebugLog);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my_debug_log.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 5500);
    };

    // === Capture uncaught errors and unhandled promise rejections ===
    window.addEventListener('error', function (e) {
      try {
        console.error('[UncaughtError]', e.message, e.error && e.error.stack ? e.error.stack : e.error);
      } catch (_) {}
    });

    window.addEventListener('unhandledrejection', function (e) {
      try {
        console.error('[UnhandledPromiseRejection]', e.reason);
      } catch (_) {}
    });

		function pushLog(level, args, withStack) {
			try {
				const allowedLevels = LOG_LEVELS.slice(0, LOG_LEVELS.indexOf(window._logLevel) + 1);
				if (!allowedLevels.includes(level)) return;
				const msg = args.map(safeStringify).join(' ');
				const entry = {
					type: 'console',
					level,
					message: msg,
          expanded: args.length === 1 ? args[0] : args,  // Object (s) without serialization
					timestamp: new Date().toISOString()
				};
				if (withStack) {
					entry.stack = new Error().stack;
				}
				if (!window._myDebugLog) window._myDebugLog = [];
				window._myDebugLog.push(entry);
			} catch (e) {
				// fail-safe, do not break the flow
			}
		}

    // console patching
    for (const level of LOG_LEVELS) {
      console[level] = function (...args) {
        pushLog(level, args, level === 'log');
        if (window.__DEBUG__) {
          origConsole[level](...args);
        }
      };
    }
    window._logLevel = window._logLevel || 'log';
  }
}




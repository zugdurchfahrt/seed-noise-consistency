(function() {
  window.patchTimeZone = function patchTimeZone() {
    if (window.__TZ_PATCHED__) return;

    const timezone = window.__TIMEZONE__;
    const offsetMinutes = window.__OFFSET_MINUTES__;

    const spoofedLocales = Array.isArray(window.__normalizedLanguages)
      ? window.__normalizedLanguages
      : (typeof window.__normalizedLanguages === 'string' ? [window.__normalizedLanguages] : null);

    const spoofedLocale = spoofedLocales ? spoofedLocales[0] : null;

    function diag(code, err, extra) {
      try {
        if (typeof window.__DEGRADE__ === "function") {
          window.__DEGRADE__(code, err || null, extra || null);
        }
      } catch (_) {}
      try {
        if (err) console.warn("[patchTimeZone]", code, err, extra || "");
        else console.warn("[patchTimeZone]", code, extra || "");
      } catch (_) {}
    }

    const safeDefine =
      (window && typeof window.__safeDefine === "function")
        ? window.__safeDefine
        : function (obj, prop, desc) { Object.defineProperty(obj, prop, desc); };

    function redefineValue(obj, prop, value) {
      const d = Object.getOwnPropertyDescriptor(obj, prop);
      safeDefine(obj, prop, {
        value,
        writable: d ? !!d.writable : true,
        configurable: d ? !!d.configurable : true,
        enumerable: d ? !!d.enumerable : false,
      });
    }

    function ensureMarkAsNative() {
      const ensure = (window && typeof window.__ensureMarkAsNative === "function") ? window.__ensureMarkAsNative : null;
      const m = ensure ? ensure() : null;
      if (typeof m === "function") return m;
      return null;
    }

    function wrapCtor(orig, name, patchArgs) {
      if (typeof orig !== "function") {
        throw new Error("THW: Intl ctor missing");
      }
      const wrapped = new Proxy(orig, {
        apply(target, thisArg, argList) {
          const a = patchArgs(argList || []);
          return Reflect.apply(target, thisArg, a);
        },
        construct(target, argList, newTarget) {
          const a = patchArgs(argList || []);
          return Reflect.construct(target, a, newTarget || target);
        }
      });
      try {
        const mark = ensureMarkAsNative();
        if (mark) mark(wrapped, name || orig.name || "");
      } catch (_) {}
      return wrapped;
    }

    // Soft-fail with observability: skip patch if we cannot prove correctness/compatibility.
    if (!timezone || typeof timezone !== "string") {
      diag("tz:missing_timezone", null);
      return;
    }
    if (typeof offsetMinutes !== "number") {
      diag("tz:missing_offsetMinutes", null, { timezone });
      return;
    }
    if (!spoofedLocales || !spoofedLocales.length || typeof spoofedLocale !== "string" || !spoofedLocale) {
      diag("tz:missing_normalizedLanguages", null, { timezone });
      return;
    }

    const __wrapNativeApply = (window && typeof window.__wrapNativeApply === "function") ? window.__wrapNativeApply : null;
    if (typeof __wrapNativeApply !== "function") {
      diag("tz:missing_wrapNativeApply", null, { timezone });
      return;
    }

    // IMPORTANT: do not patch getTimezoneOffset as a constant (DST),
    // but require consistency "right now" before installing wrappers.
    if (typeof Date.prototype.getTimezoneOffset === "function") {
      const nowOff = (new Date()).getTimezoneOffset();
      if (nowOff !== -offsetMinutes) {
        diag("tz:offset_mismatch_skip", null, { nowOff, expected: -offsetMinutes, timezone });
        return;
      }
    } else {
      diag("tz:missing_getTimezoneOffset", null, { timezone });
      return;
    }

    const restores = [];
    function pushRestore(fn) { restores.push(fn); }
    function rollback() {
      for (let i = restores.length - 1; i >= 0; i--) {
        try { restores[i](); } catch (_) {}
      }
    }

    function rememberValue(obj, prop) {
      const d = Object.getOwnPropertyDescriptor(obj, prop);
      pushRestore(() => {
        try {
          if (d) safeDefine(obj, prop, d);
        } catch (_) {}
      });
      return d;
    }

    function rememberProtoValue(obj, prop) {
      const d = Object.getOwnPropertyDescriptor(obj, prop);
      pushRestore(() => {
        try {
          if (d) safeDefine(obj, prop, d);
        } catch (_) {}
      });
      return d;
    }

    // ---- Intl.DateTimeFormat: default locales + принудительный timeZone ----
    try {
      rememberValue(Intl, "DateTimeFormat");
      const OrigDTF = Intl.DateTimeFormat;
      const PatchedDTF = wrapCtor(OrigDTF, "DateTimeFormat", (argList) => {
        let locales = (argList.length >= 1) ? argList[0] : undefined;
        let options = (argList.length >= 2) ? argList[1] : undefined;
        if (locales == null) locales = spoofedLocales;
        if (options == null) options = { timeZone: timezone };
        else options = Object.assign({}, options, { timeZone: timezone });
        return [locales, options];
      });
      redefineValue(Intl, "DateTimeFormat", PatchedDTF);

      // Ensure resolvedOptions().timeZone is consistent with the forced timezone.
      if (OrigDTF && OrigDTF.prototype && typeof OrigDTF.prototype.resolvedOptions === "function") {
        const proto = OrigDTF.prototype;
        rememberProtoValue(proto, "resolvedOptions");
        const origResolved = proto.resolvedOptions;
        const wrappedResolved = __wrapNativeApply(origResolved, "resolvedOptions", (target, thisArg, argList) => {
          const ro = Reflect.apply(target, thisArg, argList || []);
          try {
            if (ro && typeof ro === "object") ro.timeZone = timezone;
          } catch (_) {}
          return ro;
        });
        redefineValue(proto, "resolvedOptions", wrappedResolved);
      }

      // ---- Intl.NumberFormat: default locales ----
      if (Intl.NumberFormat) {
        rememberValue(Intl, "NumberFormat");
        const OrigNF = Intl.NumberFormat;
        const PatchedNF = wrapCtor(OrigNF, "NumberFormat", (argList) => {
          let locales = (argList.length >= 1) ? argList[0] : undefined;
          const options = (argList.length >= 2) ? argList[1] : undefined;
          if (locales == null) locales = spoofedLocales;
          return [locales, options];
        });
        redefineValue(Intl, "NumberFormat", PatchedNF);
      }

      // ---- Intl.Collator: default locales ----
      if (Intl.Collator) {
        rememberValue(Intl, "Collator");
        const OrigCol = Intl.Collator;
        const PatchedCol = wrapCtor(OrigCol, "Collator", (argList) => {
          let locales = (argList.length >= 1) ? argList[0] : undefined;
          const options = (argList.length >= 2) ? argList[1] : undefined;
          if (locales == null) locales = spoofedLocales;
          return [locales, options];
        });
        redefineValue(Intl, "Collator", PatchedCol);
      }

      // For other Intl.* keep only resolvedOptions().locale mask.
      function patchIntlResolvedOptions(proto, fields) {
        const origResolvedOptions = proto.resolvedOptions;
        if (typeof origResolvedOptions !== "function") return;
        rememberProtoValue(proto, "resolvedOptions");
        const wrappedResolvedOptions = __wrapNativeApply(origResolvedOptions, "resolvedOptions", (target, thisArg, argList) => {
          const options = Reflect.apply(target, thisArg, argList || []);
          try {
            fields.forEach(([field, value]) => {
              try { options[field] = value; } catch (_) {}
            });
          } catch (_) {}
          return options;
        });
        redefineValue(proto, "resolvedOptions", wrappedResolvedOptions);
      }

      [
        Intl.ListFormat,
        Intl.PluralRules,
        Intl.RelativeTimeFormat,
        Intl.DisplayNames
      ].forEach(IntlClass => {
        if (IntlClass && IntlClass.prototype && typeof IntlClass.prototype.resolvedOptions === "function") {
          patchIntlResolvedOptions(IntlClass.prototype, [['locale', spoofedLocale]]);
        }
      });

      // ---- Date.prototype.toLocale* : default locales + timeZone ----
      rememberProtoValue(Date.prototype, "toLocaleString");
      rememberProtoValue(Date.prototype, "toLocaleDateString");
      rememberProtoValue(Date.prototype, "toLocaleTimeString");

      const origToLocaleString = Date.prototype.toLocaleString;
      const origToLocaleDateString = Date.prototype.toLocaleDateString;
      const origToLocaleTimeString = Date.prototype.toLocaleTimeString;

      const wrappedToLocaleString = __wrapNativeApply(origToLocaleString, "toLocaleString", (target, thisArg, argList) => {
        let locales = (argList && argList.length >= 1) ? argList[0] : undefined;
        let options = (argList && argList.length >= 2) ? argList[1] : undefined;
        if (locales == null) locales = spoofedLocales;
        options = Object.assign({}, options, { timeZone: timezone });
        return Reflect.apply(target, thisArg, [locales, options]);
      });
      const wrappedToLocaleDateString = __wrapNativeApply(origToLocaleDateString, "toLocaleDateString", (target, thisArg, argList) => {
        let locales = (argList && argList.length >= 1) ? argList[0] : undefined;
        let options = (argList && argList.length >= 2) ? argList[1] : undefined;
        if (locales == null) locales = spoofedLocales;
        options = Object.assign({}, options, { timeZone: timezone });
        return Reflect.apply(target, thisArg, [locales, options]);
      });
      const wrappedToLocaleTimeString = __wrapNativeApply(origToLocaleTimeString, "toLocaleTimeString", (target, thisArg, argList) => {
        let locales = (argList && argList.length >= 1) ? argList[0] : undefined;
        let options = (argList && argList.length >= 2) ? argList[1] : undefined;
        if (locales == null) locales = spoofedLocales;
        options = Object.assign({}, options, { timeZone: timezone });
        return Reflect.apply(target, thisArg, [locales, options]);
      });

      redefineValue(Date.prototype, "toLocaleString", wrappedToLocaleString);
      redefineValue(Date.prototype, "toLocaleDateString", wrappedToLocaleDateString);
      redefineValue(Date.prototype, "toLocaleTimeString", wrappedToLocaleTimeString);

      window.__TZ_PATCHED__ = true;
      console.log("patchTimeZone: applied:", timezone, offsetMinutes, spoofedLocale);
    } catch (e) {
      rollback();
      diag("tz:apply_failed", e, { timezone, offsetMinutes });
      return;
    }
  };
})();

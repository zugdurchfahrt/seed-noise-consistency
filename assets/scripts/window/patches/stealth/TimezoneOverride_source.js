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

    // Fail-fast for critical prerequisites.
    if (!timezone || typeof timezone !== "string") {
      diag("tz:missing_timezone", null);
      throw new Error("[patchTimeZone] missing timezone");
    }
    if (typeof offsetMinutes !== "number") {
      diag("tz:missing_offsetMinutes", null, { timezone });
      throw new Error("[patchTimeZone] missing offsetMinutes");
    }
    if (!spoofedLocales || !spoofedLocales.length || typeof spoofedLocale !== "string" || !spoofedLocale) {
      diag("tz:missing_normalizedLanguages", null, { timezone });
      throw new Error("[patchTimeZone] missing normalizedLanguages");
    }

    const __coreApplyTargets = (window && window.Core && typeof window.Core.applyTargets === "function")
      ? window.Core.applyTargets
      : null;
    if (typeof __coreApplyTargets !== "function") {
      diag("tz:missing_core_applyTargets", null, { timezone });
      throw new Error("[patchTimeZone] missing Core.applyTargets");
    }
    const __wrapNativeCtor = (window && typeof window.__wrapNativeCtor === "function") ? window.__wrapNativeCtor : null;
    if (typeof __wrapNativeCtor !== "function") {
      diag("tz:missing_wrapNativeCtor", null, { timezone });
      throw new Error("[patchTimeZone] missing __wrapNativeCtor");
    }

    function sameDesc(actual, expected) {
      if (!actual || !expected) return false;
      const keys = ["configurable", "enumerable", "writable", "value", "get", "set"];
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (Object.prototype.hasOwnProperty.call(expected, k)) {
          if (actual[k] !== expected[k]) return false;
        }
      }
      return true;
    }

    function applyCoreTargetsGroup(groupTag, targets, policy) {
      let plans = [];
      try {
        plans = __coreApplyTargets(targets, window.__PROFILE__, []);
      } catch (e) {
        diag(groupTag + ":preflight_failed", e);
        throw e;
      }
      if (!Array.isArray(plans) || !plans.length) {
        const reason = plans && plans.reason ? plans.reason : "group_skipped";
        diag(groupTag + ":" + reason, null);
        throw new Error("[patchTimeZone] core plan skipped");
      }
      const applied = [];
      try {
        for (let i = 0; i < plans.length; i++) {
          const p = plans[i];
          if (!p || p.skipApply) continue;
          if (!p.owner || typeof p.key !== "string" || !p.nextDesc) {
            throw new Error("[patchTimeZone] invalid core plan item");
          }
          Object.defineProperty(p.owner, p.key, p.nextDesc);
          const after = Object.getOwnPropertyDescriptor(p.owner, p.key);
          if (!sameDesc(after, p.nextDesc)) {
            throw new Error("[patchTimeZone] descriptor post-check mismatch");
          }
          applied.push(p);
        }
      } catch (e) {
        let rollbackErr = null;
        for (let i = applied.length - 1; i >= 0; i--) {
          const p = applied[i];
          try {
            if (p.origDesc) Object.defineProperty(p.owner, p.key, p.origDesc);
            else delete p.owner[p.key];
          } catch (re) {
            if (!rollbackErr) rollbackErr = re;
            diag(groupTag + ":rollback_failed", re, { key: p.key || null });
          }
        }
        if (rollbackErr) {
          throw rollbackErr;
        }
        diag(groupTag + ":apply_failed", e);
        throw e;
      }
      return applied.length;
    }

    function redefineValue(obj, prop, value, diagTag) {
      const d = Object.getOwnPropertyDescriptor(obj, prop);
      const applied = applyCoreTargetsGroup(diagTag || ("tz:redefineValue:" + prop), [{
        owner: obj,
        key: prop,
        kind: "data",
        policy: "throw",
        diagTag: diagTag || ("tz:redefineValue:" + prop),
        value,
        writable: d ? !!d.writable : true,
        configurable: d ? !!d.configurable : true,
        enumerable: d ? !!d.enumerable : false
      }], "throw");
      if (applied !== 1) {
        throw new Error("[patchTimeZone] redefineValue failed: " + String(prop));
      }
    }

    // IMPORTANT: do not patch getTimezoneOffset as a constant (DST),
    // but require consistency "right now" before installing wrappers.
    if (typeof Date.prototype.getTimezoneOffset === "function") {
      const nowOff = (new Date()).getTimezoneOffset();
      if (nowOff !== -offsetMinutes) {
        diag("tz:offset_mismatch", null, { nowOff, expected: -offsetMinutes, timezone });
        throw new Error("[patchTimeZone] timezone offset mismatch");
      }
    } else {
      diag("tz:missing_getTimezoneOffset", null, { timezone });
      throw new Error("[patchTimeZone] Date.prototype.getTimezoneOffset missing");
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
      const PatchedDTF = __wrapNativeCtor(OrigDTF, "DateTimeFormat", (argList) => {
        let locales = (argList.length >= 1) ? argList[0] : undefined;
        let options = (argList.length >= 2) ? argList[1] : undefined;
        if (locales == null) locales = spoofedLocales;
        if (options == null) options = { timeZone: timezone };
        else options = Object.assign({}, options, { timeZone: timezone });
        return [locales, options];
      });
      redefineValue(Intl, "DateTimeFormat", PatchedDTF, "tz:DateTimeFormat");

      // Ensure resolvedOptions().timeZone is consistent with the forced timezone.
      if (OrigDTF && OrigDTF.prototype && typeof OrigDTF.prototype.resolvedOptions === "function") {
        const proto = OrigDTF.prototype;
        rememberProtoValue(proto, "resolvedOptions");
        applyCoreTargetsGroup("tz:DateTimeFormat:resolvedOptions", [{
          owner: proto,
          key: "resolvedOptions",
          kind: "method",
          invokeClass: "brand_strict",
          policy: "throw",
          diagTag: "tz:DateTimeFormat:resolvedOptions",
          validThis(self) {
            try { return !!(self && self instanceof OrigDTF); } catch (_) { return false; }
          },
          invalidThis: "native",
          invoke(orig, args) {
            const ro = Reflect.apply(orig, this, args || []);
            try {
              if (ro && typeof ro === "object") ro.timeZone = timezone;
            } catch (_) {}
            return ro;
          }
        }], "throw");
      }

      // ---- Intl.NumberFormat: default locales ----
      if (Intl.NumberFormat) {
        rememberValue(Intl, "NumberFormat");
        const OrigNF = Intl.NumberFormat;
        const PatchedNF = __wrapNativeCtor(OrigNF, "NumberFormat", (argList) => {
          let locales = (argList.length >= 1) ? argList[0] : undefined;
          const options = (argList.length >= 2) ? argList[1] : undefined;
          if (locales == null) locales = spoofedLocales;
          return [locales, options];
        });
        redefineValue(Intl, "NumberFormat", PatchedNF, "tz:NumberFormat");
      }

      // ---- Intl.Collator: default locales ----
      if (Intl.Collator) {
        rememberValue(Intl, "Collator");
        const OrigCol = Intl.Collator;
        const PatchedCol = __wrapNativeCtor(OrigCol, "Collator", (argList) => {
          let locales = (argList.length >= 1) ? argList[0] : undefined;
          const options = (argList.length >= 2) ? argList[1] : undefined;
          if (locales == null) locales = spoofedLocales;
          return [locales, options];
        });
        redefineValue(Intl, "Collator", PatchedCol, "tz:Collator");
      }

      // For other Intl.* keep only resolvedOptions().locale mask.
      function patchIntlResolvedOptions(proto, fields) {
        const origResolvedOptions = proto.resolvedOptions;
        if (typeof origResolvedOptions !== "function") return;
        rememberProtoValue(proto, "resolvedOptions");
        applyCoreTargetsGroup("tz:IntlResolvedOptions", [{
          owner: proto,
          key: "resolvedOptions",
          kind: "method",
          invokeClass: "brand_strict",
          policy: "throw",
          diagTag: "tz:IntlResolvedOptions",
          validThis(self) {
            try { return !!(self && self.constructor && self.constructor.prototype && self.constructor.prototype.isPrototypeOf(self)); } catch (_) { return false; }
          },
          invalidThis: "native",
          invoke(orig, args) {
            const options = Reflect.apply(orig, this, args || []);
            try {
              fields.forEach(([field, value]) => {
                try { options[field] = value; } catch (_) {}
              });
            } catch (_) {}
            return options;
          }
        }], "throw");
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
      if (typeof origToLocaleString !== "function" || typeof origToLocaleDateString !== "function" || typeof origToLocaleTimeString !== "function") {
        throw new Error("[patchTimeZone] Date.toLocale* originals missing");
      }
      applyCoreTargetsGroup("tz:Date:toLocale*", [
        {
          owner: Date.prototype,
          key: "toLocaleString",
          kind: "method",
          invokeClass: "brand_strict",
          policy: "throw",
          diagTag: "tz:Date:toLocaleString",
          validThis(self) {
            try { return !!(self && self instanceof Date); } catch (_) { return false; }
          },
          invalidThis: "native",
          invoke(orig, args) {
            let locales = (args && args.length >= 1) ? args[0] : undefined;
            let options = (args && args.length >= 2) ? args[1] : undefined;
            if (locales == null) locales = spoofedLocales;
            options = Object.assign({}, options, { timeZone: timezone });
            return Reflect.apply(orig, this, [locales, options]);
          }
        },
        {
          owner: Date.prototype,
          key: "toLocaleDateString",
          kind: "method",
          invokeClass: "brand_strict",
          policy: "throw",
          diagTag: "tz:Date:toLocaleDateString",
          validThis(self) {
            try { return !!(self && self instanceof Date); } catch (_) { return false; }
          },
          invalidThis: "native",
          invoke(orig, args) {
            let locales = (args && args.length >= 1) ? args[0] : undefined;
            let options = (args && args.length >= 2) ? args[1] : undefined;
            if (locales == null) locales = spoofedLocales;
            options = Object.assign({}, options, { timeZone: timezone });
            return Reflect.apply(orig, this, [locales, options]);
          }
        },
        {
          owner: Date.prototype,
          key: "toLocaleTimeString",
          kind: "method",
          invokeClass: "brand_strict",
          policy: "throw",
          diagTag: "tz:Date:toLocaleTimeString",
          validThis(self) {
            try { return !!(self && self instanceof Date); } catch (_) { return false; }
          },
          invalidThis: "native",
          invoke(orig, args) {
            let locales = (args && args.length >= 1) ? args[0] : undefined;
            let options = (args && args.length >= 2) ? args[1] : undefined;
            if (locales == null) locales = spoofedLocales;
            options = Object.assign({}, options, { timeZone: timezone });
            return Reflect.apply(orig, this, [locales, options]);
          }
        }
      ], "throw");

      window.__TZ_PATCHED__ = true;
      console.log("patchTimeZone: applied:", timezone, offsetMinutes, spoofedLocale);
    } catch (e) {
      rollback();
      diag("tz:apply_failed", e, { timezone, offsetMinutes });
      throw e;
    }
  };
})();

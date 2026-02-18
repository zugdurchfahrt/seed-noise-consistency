(function() {
  window.patchTimeZone = function patchTimeZone() {
    if (window.__TZ_PATCHED__) return;

    const timezone = window.__TIMEZONE__;
    const offsetMinutes = window.__OFFSET_MINUTES__;

    const spoofedLocales = Array.isArray(window.__normalizedLanguages)
      ? window.__normalizedLanguages
      : (typeof window.__normalizedLanguages === 'string' ? [window.__normalizedLanguages] : null);

    const spoofedLocale = spoofedLocales ? spoofedLocales[0] : null;

    const d = window.__DEGRADE__;
    const __tzTypePipeline = "pipeline missing data";
    const __tzTypeBrowser = "browser structure missing data";
    function diag(level, code, extra, err) {
      if (typeof d !== "function") return;
      const rawLevel = String(level || "info");
      const normalizedCode = (typeof code === "string" && code) ? code : "tz:diag";
      const x = (extra && typeof extra === "object") ? extra : {};
      const rawStage = (typeof x.stage === "string" && x.stage) ? x.stage : "apply";
      const normalizedStage = (
        rawStage === "preflight" ||
        rawStage === "apply" ||
        rawStage === "rollback" ||
        rawStage === "contract" ||
        rawStage === "hook" ||
        rawStage === "runtime" ||
        rawStage === "guard"
      ) ? rawStage : "apply";
      const rawType = (typeof x.type === "string" && x.type) ? x.type : "";
      const normalizedType = (rawType === __tzTypePipeline || rawType === __tzTypeBrowser) ? rawType : undefined;
      const ctxKey = (typeof x.key === "string" || x.key === null) ? x.key : undefined;
      const ctxMessage = (typeof x.message === "string" && x.message)
        ? x.message
        : ((err && typeof err.message === "string" && err.message) ? err.message : normalizedCode);
      const ctx = Object.assign({
        module: "tz",
        diagTag: (typeof x.diagTag === "string" && x.diagTag) ? x.diagTag : "tz",
        surface: (typeof x.surface === "string" && x.surface) ? x.surface : "timezone",
        key: ctxKey,
        stage: normalizedStage,
        message: ctxMessage,
        data: x
      }, x);
      if (typeof normalizedType === "string") ctx.type = normalizedType;
      if (typeof d.diag === "function") {
        d.diag(rawLevel, normalizedCode, ctx, err || null);
        return;
      }
      d(normalizedCode, err || null, ctx);
    }
    function diagPipeline(level, code, extra, err) {
      const x = (extra && typeof extra === "object") ? extra : {};
      if (typeof x.type !== "string" || !x.type) x.type = __tzTypePipeline;
      if (typeof x.diagTag !== "string" || !x.diagTag) x.diagTag = "tz";
      diag(level, code, x, err);
    }
    function diagBrowser(level, code, extra, err) {
      const x = (extra && typeof extra === "object") ? extra : {};
      if (typeof x.type !== "string" || !x.type) x.type = __tzTypeBrowser;
      if (typeof x.diagTag !== "string" || !x.diagTag) x.diagTag = "tz";
      diag(level, code, x, err);
    }

    const safeDefine =
      (window && typeof window.__safeDefine === "function")
        ? window.__safeDefine
        : function (obj, prop, desc) { Object.defineProperty(obj, prop, desc); };

    // Fail-fast for critical prerequisites.
    if (!timezone || typeof timezone !== "string") {
      diagPipeline("error", "tz:missing_timezone", { stage: "preflight" }, null);
      throw new Error("[patchTimeZone] missing timezone");
    }
    if (typeof offsetMinutes !== "number") {
      diagPipeline("error", "tz:missing_offsetMinutes", { stage: "preflight", timezone }, null);
      throw new Error("[patchTimeZone] missing offsetMinutes");
    }
    if (!spoofedLocales || !spoofedLocales.length || typeof spoofedLocale !== "string" || !spoofedLocale) {
      diagPipeline("error", "tz:missing_normalizedLanguages", { stage: "preflight", timezone }, null);
      throw new Error("[patchTimeZone] missing normalizedLanguages");
    }

    const __coreApplyTargets = (window && window.Core && typeof window.Core.applyTargets === "function")
      ? window.Core.applyTargets
      : null;
    if (typeof __coreApplyTargets !== "function") {
      diagBrowser("warn", "tz:missing_core_applyTargets", { stage: "preflight", timezone }, null);
      throw new Error("[patchTimeZone] missing Core.applyTargets");
    }
    const __wrapNativeCtor = (window && typeof window.__wrapNativeCtor === "function") ? window.__wrapNativeCtor : null;
    if (typeof __wrapNativeCtor !== "function") {
      diagBrowser("warn", "tz:missing_wrapNativeCtor", { stage: "preflight", timezone }, null);
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
      const Core = window && window.Core;
      if (!Core || typeof Core.applyTargets !== "function") {
        const e = new Error("[patchTimeZone] missing Core.applyTargets");
        diagBrowser("error", groupTag + ":missing_core_applyTargets", { stage: "preflight" }, e);
        throw e;
      }
      const coreRegisterPatchedTarget = (typeof Core.registerPatchedTarget === "function")
        ? Core.registerPatchedTarget
        : null;
      if (typeof coreRegisterPatchedTarget !== "function") {
        const e = new Error("[patchTimeZone] missing Core.registerPatchedTarget");
        diagBrowser("error", groupTag + ":missing_core_registerPatchedTarget", { stage: "preflight" }, e);
        throw e;
      }
      try {
        plans = Core.applyTargets(targets, window.__PROFILE__, []);
      } catch (e) {
        diagPipeline("error", groupTag + ":preflight_failed", { stage: "preflight" }, e);
        throw e;
      }
      if (!Array.isArray(plans) || !plans.length) {
        const reason = plans && plans.reason ? plans.reason : "group_skipped";
        diagPipeline("warn", groupTag + ":" + reason, { stage: "preflight" }, null);
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

        // Registry/dedup invariant: only register after full group apply succeeded.
        for (let i = 0; i < applied.length; i++) {
          const p = applied[i];
          coreRegisterPatchedTarget(p.owner, p.key);
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
            diagBrowser("error", groupTag + ":rollback_failed", { stage: "rollback", key: p.key || null }, re);
          }
        }
        if (rollbackErr) {
          throw rollbackErr;
        }
        diagPipeline("error", groupTag + ":apply_failed", { stage: "apply" }, e);
        throw e;
      }
      return applied.length;
    }

    function redefineValue(obj, prop, value, diagTag) {
      const d = Object.getOwnPropertyDescriptor(obj, prop);
      const isFn = (typeof value === "function");
      const t = {
        owner: obj,
        key: prop,
        kind: "data",
        policy: "throw",
        diagTag: diagTag || ("tz:redefineValue:" + prop),
        value,
        writable: d ? !!d.writable : true,
        configurable: d ? !!d.configurable : true,
        enumerable: d ? !!d.enumerable : false
      };
      if (isFn) {
        // Wrapper-target (function value) must declare wrapperClass explicitly (CORE 4.0).
        t.wrapperClass = "core_proxy";
      } else {
        // Data-only descriptor path (CORE 4.0).
        t.wrapLayer = "descriptor_only";
      }
      const applied = applyCoreTargetsGroup(diagTag || ("tz:redefineValue:" + prop), [t], "throw");
      if (applied !== 1) {
        throw new Error("[patchTimeZone] redefineValue failed: " + String(prop));
      }
    }

    // IMPORTANT: do not patch getTimezoneOffset as a constant (DST),
    // but require consistency "right now" before installing wrappers.
    if (typeof Date.prototype.getTimezoneOffset === "function") {
      const nowOff = (new Date()).getTimezoneOffset();
      if (nowOff !== -offsetMinutes) {
        diagPipeline("error", "tz:offset_mismatch", { stage: "apply", nowOff, expected: -offsetMinutes, timezone }, null);
        throw new Error("[patchTimeZone] timezone offset mismatch");
      }
    } else {
      diagBrowser("warn", "tz:missing_getTimezoneOffset", { stage: "preflight", timezone }, null);
      throw new Error("[patchTimeZone] Date.prototype.getTimezoneOffset missing");
    }

    const restores = [];
    function pushRestore(fn) { restores.push(fn); }
    function rollback(reasonTag) {
      for (let i = restores.length - 1; i >= 0; i--) {
        try {
          restores[i]();
        } catch (e) {
          diagBrowser("error", (reasonTag || "tz:rollback") + ":restore_failed", { stage: "rollback" }, e);
        }
      }
    }

    function rememberValue(obj, prop) {
      const d = Object.getOwnPropertyDescriptor(obj, prop);
      pushRestore(() => {
        if (d) safeDefine(obj, prop, d);
      });
      return d;
    }

    function rememberProtoValue(obj, prop) {
      const d = Object.getOwnPropertyDescriptor(obj, prop);
      pushRestore(() => {
        if (d) safeDefine(obj, prop, d);
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
          wrapLayer: "named_wrapper",
          invokeClass: "brand_strict",
          policy: "throw",
          diagTag: "tz:DateTimeFormat:resolvedOptions",
          validThis(self) {
            try { return !!(self && self instanceof OrigDTF); } catch (_) { return false; }
          },
          invalidThis: "throw",
          invoke(orig, args) {
            const ro = Reflect.apply(orig, this, args || []);
            try {
              if (ro && typeof ro === "object") ro.timeZone = timezone;
            } catch (e) {
              diagBrowser("error", "tz:DateTimeFormat:resolvedOptions:post_failed", { stage: "hook", timezone }, e);
            }
            return ro;
          }
        }], "throw");
      }

      function patchIntlCtorDefaultLocales(ctorName) {
        if (!Intl || typeof Intl[ctorName] !== "function") return;
        rememberValue(Intl, ctorName);
        const OrigCtor = Intl[ctorName];
        const PatchedCtor = __wrapNativeCtor(OrigCtor, ctorName, (argList) => {
          let locales = (argList.length >= 1) ? argList[0] : undefined;
          const options = (argList.length >= 2) ? argList[1] : undefined;
          if (locales == null) locales = spoofedLocales;
          return [locales, options];
        });
        redefineValue(Intl, ctorName, PatchedCtor, "tz:" + ctorName);
      }

      // ---- Intl constructors: default locales ----
      patchIntlCtorDefaultLocales("NumberFormat");
      patchIntlCtorDefaultLocales("Collator");
      patchIntlCtorDefaultLocales("ListFormat");
      patchIntlCtorDefaultLocales("PluralRules");
      patchIntlCtorDefaultLocales("RelativeTimeFormat");
      patchIntlCtorDefaultLocales("DisplayNames");

      // For other Intl.* keep only resolvedOptions().locale mask.
      function patchIntlResolvedOptions(proto, fields) {
        const origResolvedOptions = proto.resolvedOptions;
        if (typeof origResolvedOptions !== "function") return;
        rememberProtoValue(proto, "resolvedOptions");
        applyCoreTargetsGroup("tz:IntlResolvedOptions", [{
          owner: proto,
          key: "resolvedOptions",
          kind: "method",
          wrapLayer: "named_wrapper",
          invokeClass: "brand_strict",
          policy: "throw",
          diagTag: "tz:IntlResolvedOptions",
          validThis(self) {
            try { return !!(self && self.constructor && self.constructor.prototype && self.constructor.prototype.isPrototypeOf(self)); } catch (_) { return false; }
          },
          invalidThis: "throw",
          invoke(orig, args) {
            const options = Reflect.apply(orig, this, args || []);
            try {
              fields.forEach(([field, value]) => {
                try { options[field] = value; } catch (e) {
                  diagBrowser("error", "tz:IntlResolvedOptions:post_failed", { stage: "hook", field, timezone }, e);
                }
              });
            } catch (e) {
              diagBrowser("error", "tz:IntlResolvedOptions:post_failed", { stage: "hook", timezone }, e);
            }
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
          wrapLayer: "named_wrapper",
          invokeClass: "brand_strict",
          policy: "throw",
          diagTag: "tz:Date:toLocaleString",
          validThis(self) {
            try { return !!(self && self instanceof Date); } catch (_) { return false; }
          },
          invalidThis: "throw",
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
          wrapLayer: "named_wrapper",
          invokeClass: "brand_strict",
          policy: "throw",
          diagTag: "tz:Date:toLocaleDateString",
          validThis(self) {
            try { return !!(self && self instanceof Date); } catch (_) { return false; }
          },
          invalidThis: "throw",
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
          wrapLayer: "named_wrapper",
          invokeClass: "brand_strict",
          policy: "throw",
          diagTag: "tz:Date:toLocaleTimeString",
          validThis(self) {
            try { return !!(self && self instanceof Date); } catch (_) { return false; }
          },
          invalidThis: "throw",
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
      diagPipeline("info", "tz:applied", { stage: "apply", timezone, offsetMinutes: Number(offsetMinutes), locale: spoofedLocale }, null);
    } catch (e) {
      rollback("tz:apply_failed");
      diagPipeline("error", "tz:apply_failed", { stage: "apply", timezone, offsetMinutes }, e);
      throw e;
    }
  };
})();

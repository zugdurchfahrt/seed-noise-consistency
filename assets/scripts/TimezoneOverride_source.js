(function() {
  window.patchTimeZone = function patchTimeZone() {
    if (window.__TZ_PATCHED__) return;
    window.__TZ_PATCHED__ = true;

    const timezone = window.__TIMEZONE__;
    const offsetMinutes = window.__OFFSET_MINUTES__;

    const spoofedLocales = Array.isArray(window.__normalizedLanguages)
      ? window.__normalizedLanguages
      : (typeof window.__normalizedLanguages === 'string' ? [window.__normalizedLanguages] : null);

    const spoofedLocale = spoofedLocales ? spoofedLocales[0] : null;

    // fail-fast: без валидных входов цель не достигнута
    if (!timezone || typeof timezone !== "string") {
      throw new Error("THW: patchTimeZone missing timezone");
    }
    if (typeof offsetMinutes !== "number") {
      throw new Error("THW: patchTimeZone missing offsetMinutes");
    }
    if (!spoofedLocales || !spoofedLocales.length || typeof spoofedLocale !== "string" || !spoofedLocale) {
      throw new Error("THW: patchTimeZone missing normalizedLanguages");
    }

    // IMPORTANT: не патчим getTimezoneOffset константой (DST), но проверяем консистентность "на сейчас"
    if (typeof Date.prototype.getTimezoneOffset === "function") {
      const nowOff = (new Date()).getTimezoneOffset();
      if (nowOff !== -offsetMinutes) {
        throw new Error(`THW: getTimezoneOffset mismatch now=${nowOff} expected=${-offsetMinutes}`);
      }
    } else {
      throw new Error("THW: Date.prototype.getTimezoneOffset missing");
    }

    // ---- Intl.DateTimeFormat: default locales + принудительный timeZone ----
    const OrigDTF = Intl.DateTimeFormat;
    function PatchedDTF(locales, options) {
      if (locales == null) locales = spoofedLocales;
      if (options == null) options = { timeZone: timezone };
      else options = Object.assign({}, options, { timeZone: timezone });

      const dtf = new OrigDTF(locales, options);

      const originalResolvedOptions = dtf.resolvedOptions.bind(dtf);
      dtf.resolvedOptions = () => {
        const ro = originalResolvedOptions();
        ro.timeZone = timezone;
        return ro;
      };
      return dtf;
    }
    PatchedDTF.prototype = OrigDTF.prototype;
    Intl.DateTimeFormat = PatchedDTF;

    // ---- Intl.NumberFormat: default locales ----
    if (Intl.NumberFormat) {
      const OrigNF = Intl.NumberFormat;
      function PatchedNF(locales, options) {
        if (locales == null) locales = spoofedLocales;
        return new OrigNF(locales, options);
      }
      PatchedNF.prototype = OrigNF.prototype;
      Intl.NumberFormat = PatchedNF;
    }

    // ---- Intl.Collator: default locales ----
    if (Intl.Collator) {
      const OrigCol = Intl.Collator;
      function PatchedCol(locales, options) {
        if (locales == null) locales = spoofedLocales;
        return new OrigCol(locales, options);
      }
      PatchedCol.prototype = OrigCol.prototype;
      Intl.Collator = PatchedCol;
    }

    // Для остальных Intl.* оставляем только "маску" locale в resolvedOptions,
    // чтобы не вводить новые конструкции/слои (и не переписывать поведение format()).
    function patchIntlResolvedOptions(prototype, fields) {
      const origResolvedOptions = prototype.resolvedOptions;
      prototype.resolvedOptions = function() {
        const options = origResolvedOptions.call(this);
        fields.forEach(([field, value]) => (options[field] = value));
        return options;
      };
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
    const origToLocaleString = Date.prototype.toLocaleString;
    const origToLocaleDateString = Date.prototype.toLocaleDateString;
    const origToLocaleTimeString = Date.prototype.toLocaleTimeString;

    Date.prototype.toLocaleString = function(locales, options) {
      if (locales == null) locales = spoofedLocales;
      options = Object.assign({}, options, { timeZone: timezone });
      return origToLocaleString.call(this, locales, options);
    };
    Date.prototype.toLocaleDateString = function(locales, options) {
      if (locales == null) locales = spoofedLocales;
      options = Object.assign({}, options, { timeZone: timezone });
      return origToLocaleDateString.call(this, locales, options);
    };
    Date.prototype.toLocaleTimeString = function(locales, options) {
      if (locales == null) locales = spoofedLocales;
      options = Object.assign({}, options, { timeZone: timezone });
      return origToLocaleTimeString.call(this, locales, options);
    };

    console.log("patchTimeZone: applied:", timezone, offsetMinutes, spoofedLocale);
  };
})();

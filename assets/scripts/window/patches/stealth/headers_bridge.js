(function () {
  const g = window;
  const __MODULE = 'headers_bridge';
  const __SURFACE = 'network';
  function defineHiddenValue(owner, key, value) {
    Object.defineProperty(owner, key, {
      value: value,
      writable: true,
      configurable: true,
      enumerable: false
    });
    return owner[key];
  }
  function __emit(level, code, ctx, err) {
    const __loggerRoot = (g && g.FernwehContext && g.FernwehContext.__logger && typeof g.FernwehContext.__logger === 'object')
      ? g.FernwehContext.__logger
      : null;
    const d = (__loggerRoot && typeof __loggerRoot.__DEGRADE__ === 'function') ? __loggerRoot.__DEGRADE__ : null;
    if (typeof d !== 'function') return;
    const e = err instanceof Error
      ? err
      : (err == null ? null : new Error(String(err)));
    if (typeof d.diag === 'function') {
      d.diag(level, code, ctx, e);
      return;
    }
    d(code, e, Object.assign({}, ctx, { level: level || 'info' }));
  }
  function emitDegrade(level, code, err, extra) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    const ctx = {
      module: __MODULE,
      diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : __MODULE,
      surface: __SURFACE,
      key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
      stage: (typeof x.stage === 'string' && x.stage) ? x.stage : 'apply',
      message: (typeof x.message === 'string' && x.message) ? x.message : String(code || __MODULE),
      data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
      type: (typeof x.type === 'string' && x.type) ? x.type : 'pipeline missing data'
    };
    return __emit(level, code, ctx, err);
  }
  // Starting ignore list for CDP interceptor: challenge domains are not touched
  const CH_PASS = ['.cloudflare.com','.challenge.cloudflare.com','.akamaihd.net','.perimeterx.net','.hcaptcha.com','.recaptcha.net'];
  function norm(s){ return !s ? s : (s[0] === "." ? s : "." + s); }
  function ensureHeadersState() {
    const C = (g && g.FernwehContext && typeof g.FernwehContext === 'object')
      ? g.FernwehContext
      : null;
    if (!C) throw new Error('headers_bridge: FernwehContext missing');
    const stateRoot = (C.state && typeof C.state === 'object') ? C.state : null;
    if (!stateRoot) throw new Error('headers_bridge: FernwehContext.state missing');
    const headersRoot = (stateRoot.__HEADERS__ && typeof stateRoot.__HEADERS__ === 'object')
      ? stateRoot.__HEADERS__
      : defineHiddenValue(stateRoot, '__HEADERS__', Object.create(null));
    if (!headersRoot || typeof headersRoot !== 'object') {
      throw new Error('headers_bridge: FernwehContext.state.__HEADERS__ missing');
    }
    const headersState = (headersRoot.__STATE__ && typeof headersRoot.__STATE__ === 'object')
      ? headersRoot.__STATE__
      : defineHiddenValue(headersRoot, '__STATE__', Object.create(null));
    if (!headersState || typeof headersState !== 'object') {
      throw new Error('headers_bridge: FernwehContext.state.__HEADERS__.__STATE__ missing');
    }
    if (!Array.isArray(headersState.allowSuffixes)) defineHiddenValue(headersState, 'allowSuffixes', []);
    if (!Array.isArray(headersState.ignoreSuffixes)) defineHiddenValue(headersState, 'ignoreSuffixes', []);
    if (typeof headersState.bridgeReady !== 'boolean') defineHiddenValue(headersState, 'bridgeReady', false);
    return headersState;
  }
  function wire(){
    const api = g.HeadersInterceptor;
    if (!api) return;
    let headersState;
    try {
      headersState = ensureHeadersState();
    } catch (e) {
      emitDegrade('warn', 'headers_bridge:init:preflight:headers_state_missing', e, {
        stage: 'preflight',
        surface: 'FernwehContext.state.__HEADERS__.__STATE__',
        key: 'FernwehContext.state.__HEADERS__.__STATE__',
        message: 'FernwehContext.state.__HEADERS__.__STATE__ missing',
        data: {
          outcome: 'skip',
          reason: 'headers_state_missing',
          missing: 'FernwehContext.state.__HEADERS__.__STATE__'
        }
      });
      return;
    }
    const allowBase = Array.isArray(headersState.allowSuffixes) ? headersState.allowSuffixes.map(norm).filter(Boolean) : [];
    const ignoreBase = Array.isArray(headersState.ignoreSuffixes) ? headersState.ignoreSuffixes.map(norm).filter(Boolean) : [];
    // 1) Поднять актуальные наборы из JS-интерсептора
    const allowFromJs  = (api.listAllow?.()  || []).map(norm);
    const ignoreFromJs = (api.listIgnore?.() || []).map(norm);

    headersState.allowSuffixes = Array.from(new Set([...allowBase, ...allowFromJs]));
    headersState.ignoreSuffixes = Array.from(new Set([...CH_PASS.map(norm), ...ignoreBase, ...ignoreFromJs]));

    // 2) Обернуть методы, чтобы любые дальнейшие изменения синхронизировались
    const _addAllow  = api.addAllow?.bind(api);
    const _addIgnore = api.addIgnore?.bind(api);

    if (_addAllow) {
      api.addAllow = function(s){
        try { _addAllow(s); } finally {
          s = norm(s);
          if (s && !headersState.allowSuffixes.includes(s)) headersState.allowSuffixes.push(s);
        }
      };
    }
    if (_addIgnore) {
      api.addIgnore = function(s){
        try { _addIgnore(s); } finally {
          s = norm(s);
          if (s && !headersState.ignoreSuffixes.includes(s)) headersState.ignoreSuffixes.push(s);
        }
      };
    }
    headersState.bridgeReady = true;
    emitDegrade('info', 'headers_bridge:init:apply:ready', null, {
      key: 'FernwehContext.state.__HEADERS__.__STATE__',
      message: 'CDP bridge ready',
      data: {
        allowCount: Array.isArray(headersState.allowSuffixes) ? headersState.allowSuffixes.length : 0,
        ignoreCount: Array.isArray(headersState.ignoreSuffixes) ? headersState.ignoreSuffixes.length : 0
      }
    });
  }

  if (document.readyState === "complete" || document.readyState === "interactive") wire();
  else g.addEventListener("DOMContentLoaded", wire);
})();
//# sourceURL=headers_bridge.js

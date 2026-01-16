const url = URL.createObjectURL(new Blob([`
  (function(){
    function pickDesc(obj, key){
      const p = Object.getPrototypeOf(obj);
      const own = Object.getOwnPropertyDescriptor(obj, key);
      const proto = p && Object.getOwnPropertyDescriptor(p, key);
      return {
        key,
        own: !!own,
        proto: !!proto,
        ownDesc: own ? { enumerable: own.enumerable, configurable: own.configurable, hasGet: !!own.get, hasSet: !!own.set } : null,
        protoDesc: proto ? { enumerable: proto.enumerable, configurable: proto.configurable, hasGet: !!proto.get, hasSet: !!proto.set,
          getToString: proto.get ? Function.prototype.toString.call(proto.get) : null,
          getName: proto.get ? proto.get.name : null,
          getLen: proto.get ? proto.get.length : null
        } : null,
      };
    }

    const nav = navigator;
    const proto = Object.getPrototypeOf(nav);

    const out = {
      navProtoCtor: proto && proto.constructor ? proto.constructor.name : null,
      keys: [
        pickDesc(nav,'language'),
        pickDesc(nav,'languages'),
        pickDesc(nav,'deviceMemory'),
        pickDesc(nav,'hardwareConcurrency'),
        pickDesc(nav,'userAgentData'),
      ],
      uad: (function(){
        const u = nav.userAgentData;
        if (!u) return { exists:false };
        return {
          exists:true,
          tag: Object.prototype.toString.call(u),
          protoCtor: Object.getPrototypeOf(u) && Object.getPrototypeOf(u).constructor ? Object.getPrototypeOf(u).constructor.name : null,
          hasGetHE: typeof u.getHighEntropyValues === 'function',
          getHEToString: typeof u.getHighEntropyValues === 'function' ? Function.prototype.toString.call(u.getHighEntropyValues) : null,
        };
      })(),
      snap: (function(){
        try { return self.__lastSnap__ || null; } catch(e){ return null; }
      })(),
    };

    Promise.resolve()
      .then(async()=>{
        const u = navigator.userAgentData;
        if (!u || typeof u.getHighEntropyValues !== 'function') return { he:null, heErr:'no uad.getHighEntropyValues' };
        try {
          const he = await u.getHighEntropyValues(["architecture","bitness","model","platformVersion","uaFullVersion","fullVersionList","wow64"]);
          return { he, heKeys: Object.keys(he) };
        } catch(e){
          return { he:null, heErr: (e && e.message) ? e.message : String(e) };
        }
      })
      .then(extra=>{
        out.he = extra;
        postMessage(out);
      });
  })();
`], {type:'text/javascript'}));

const w = new Worker(url);
w.onmessage = e => console.log('[WK DIAG]', e.data);
w.onerror = e => console.error('[WK DIAG ERR]', e.message);

e => console.error('[WK DIAG ERR]', e.message)
d21c31bf-dd6d-41a4-887c-91563af028ca:360 [UACHPatch] installed {core: true, mirror: true, scope: true}core: truemirror: truescope: true[[Prototype]]: Object
page_bundle.js:75 [WK DIAG] {__ENV_USER_URL_LOADED__: 'blob:https://abrahamjuliot.github.io/cafc71b1-4119-498b-8ff3-e693c0047069'}__ENV_USER_URL_LOADED__: "blob:https://abrahamjuliot.github.io/cafc71b1-4119-498b-8ff3-e693c0047069"[[Prototype]]: Object
page_bundle.js:75 [WK DIAG] {navProtoCtor: 'WorkerNavigator', keys: Array(5), uad: {…}, snap: {…}, he: {…}}he: he: architecture: "x86"bitness: "64"fullVersionList: Array(3)0: brand: "Not)A;Brand"version: "8.0.0.0"[[Prototype]]: Object1: brand: "Chromium"version: "135.0.7049.42"[[Prototype]]: Object2: brand: "Google Chrome"version: "135.0.7049.42"[[Prototype]]: Objectlength: 3[[Prototype]]: Array(0)model: ""platformVersion: "10.0.0"uaFullVersion: "135.0.7049.42"wow64: false[[Prototype]]: ObjectheKeys: Array(7)0: "architecture"1: "bitness"2: "model"3: "platformVersion"4: "uaFullVersion"5: "fullVersionList"6: "wow64"length: 7[[Prototype]]: Array(0)[[Prototype]]: Objectkeys: Array(5)0: key: "language"own: falseownDesc: nullproto: trueprotoDesc: configurable: trueenumerable: truegetLen: 0getName: "getLanguage"getToString: "function get language() { [native code] }"hasGet: truehasSet: false[[Prototype]]: Object[[Prototype]]: Object1: key: "languages"own: falseownDesc: nullproto: trueprotoDesc: configurable: trueenumerable: truegetLen: 0getName: "getLanguages"getToString: "function get languages() { [native code] }"hasGet: truehasSet: false[[Prototype]]: Object[[Prototype]]: Object2: key: "deviceMemory"own: falseownDesc: nullproto: trueprotoDesc: configurable: trueenumerable: truegetLen: 0getName: "getDeviceMemory"getToString: "function get deviceMemory() { [native code] }"hasGet: truehasSet: false[[Prototype]]: Object[[Prototype]]: Object3: key: "hardwareConcurrency"own: falseownDesc: nullproto: trueprotoDesc: configurable: trueenumerable: truegetLen: 0getName: "getHardwareConcurrency"getToString: "function get hardwareConcurrency() { [native code] }"hasGet: truehasSet: false[[Prototype]]: Object[[Prototype]]: Object4: key: "userAgentData"own: falseownDesc: nullproto: trueprotoDesc: {enumerable: false, configurable: true, hasGet: true, hasSet: false, getToString: 'function get userAgentData() { [native code] }', …}configurable: trueenumerable: falsegetLen: 0getName: "getUserAgentData"getToString: "function get userAgentData() { [native code] }"hasGet: truehasSet: false[[Prototype]]: Object[[Prototype]]: Objectlength: 5[[Prototype]]: Array(0)navProtoCtor: "WorkerNavigator"snap: cpu: 8deviceMemory: 8dpr: 1.25hardwareConcurrency: 8highEntropy: architecture: "x86"bitness: "64"formFactors: Array(1)0: "Desktop"length: 1[[Prototype]]: Array(0)fullVersionList: Array(3)0: {brand: 'Not)A;Brand', version: '8.0.0.0'}brand: "Not)A;Brand"version: "8.0.0.0"[[Prototype]]: Object1: {brand: 'Chromium', version: '135.0.7049.42'}2: {brand: 'Google Chrome', version: '135.0.7049.42'}length: 3[[Prototype]]: Array(0)model: ""platformVersion: "10.0.0"uaFullVersion: "135.0.7049.42"wow64: false[[Prototype]]: Objectlanguage: "de-DE"languages: Array(2)0: "de-DE"1: "de"length: 2[[Prototype]]: Array(0)mem: 8seed: "017f74c28118488784a7b2b0421a4a45"timeZone: "Europe/Berlin"ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"uaCH: brands: Array(3)0: {brand: 'Not)A;Brand', version: '8'}brand: "Not)A;Brand"version: "8"[[Prototype]]: Object1: {brand: 'Chromium', version: '135'}2: {brand: 'Google Chrome', version: '135'}length: 3[[Prototype]]: Array(0)he: architecture: "x86"bitness: "64"formFactors: Array(1)0: "Desktop"length: 1[[Prototype]]: Array(0)fullVersionList: Array(3)0: {brand: 'Not)A;Brand', version: '8.0.0.0'}1: {brand: 'Chromium', version: '135.0.7049.42'}2: {brand: 'Google Chrome', version: '135.0.7049.42'}length: 3[[Prototype]]: Array(0)model: ""platformVersion: "10.0.0"uaFullVersion: "135.0.7049.42"wow64: false[[Prototype]]: Objectmobile: falseplatform: "Windows"[[Prototype]]: ObjectuaData: brands: Array(3)0: {brand: 'Not)A;Brand', version: '8'}brand: "Not)A;Brand"version: "8"[[Prototype]]: Object1: {brand: 'Chromium', version: '135'}2: {brand: 'Google Chrome', version: '135'}length: 3[[Prototype]]: Array(0)he: architecture: "x86"bitness: "64"formFactors: Array(1)0: "Desktop"length: 1[[Prototype]]: Array(0)fullVersionList: Array(3)0: brand: "Not)A;Brand"version: "8.0.0.0"[[Prototype]]: Object1: brand: "Chromium"version: "135.0.7049.42"[[Prototype]]: Object2: brand: "Google Chrome"version: "135.0.7049.42"[[Prototype]]: Objectlength: 3[[Prototype]]: Array(0)model: ""platformVersion: "10.0.0"uaFullVersion: "135.0.7049.42"wow64: false[[Prototype]]: Objectmobile: falseplatform: "Windows"[[Prototype]]: Objectvendor: "Google Inc."[[Prototype]]: Objectuad: exists: truegetHEToString: "function getHighEntropyValues() { [native code] }"hasGetHE: trueprotoCtor: "NavigatorUAData"tag: "[object NavigatorUAData]"[[Prototype]]: Object[[Prototype]]: Object

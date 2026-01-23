Local
Exception
:
TypeError: Function.prototype.toString requires that 'this' be a Function at Object.toString (<anonymous>) at Object.toString [as apply] (page_bundle.js:158:24) at spawnErr (<https://abrahamjuliot.github.io/creepjs/creep.js:1:173328>) at g6 (<https://abrahamjuliot.github.io/creepjs/creep.js:1:170738>) at gW (<https://abrahamjuliot.github.io/creepjs/creep.js:1:173277>) at <https://abrahamjuliot.github.io/creepjs/creep.js:1:175832> at Array.forEach (<anonymous>) at searchLies (<https://abrahamjuliot.github.io/creepjs/creep.js:1:175492>) at gQ (<https://abrahamjuliot.github.io/creepjs/creep.js:1:176861>) at <https://abrahamjuliot.github.io/creepjs/creep.js:1:180228>
message
:
"Function.prototype.toString requires that 'this' be a Function"
stack
:
"TypeError: Function.prototype.toString requires that 'this' be a Function\n    at Object.toString (<anonymous>)\n    at Object.toString [as apply] (page_bundle.js:158:24)\n    at spawnErr (<https://abrahamjuliot.github.io/creepjs/creep.js:1:173328)\n>    at g6 (<https://abrahamjuliot.github.io/creepjs/creep.js:1:170738)\n>    at gW (<https://abrahamjuliot.github.io/creepjs/creep.js:1:173277)\n>    at <https://abrahamjuliot.github.io/creepjs/creep.js:1:175832\n>    at Array.forEach (<anonymous>)\n    at searchLies (<https://abrahamjuliot.github.io/creepjs/creep.js:1:175492)\n>    at gQ (<https://abrahamjuliot.github.io/creepjs/creep.js:1:176861)\n>    at <https://abrahamjuliot.github.io/creepjs/creep.js:1:180228>"
[[Prototype]]
:
Error
constructor
:
ƒ TypeError()
message
:
""
name
:
"TypeError"
[[Prototype]]
:
Object
this
:
Object
apply
:
ƒ toString(target, thisArg, args)
length
:
3
name
:
"toString"
prototype
:
{}
arguments
:
Arguments(3) [ƒ, {…}, Array(0), callee: ƒ, Symbol(Symbol.iterator): ƒ]
caller
:
null
[[FunctionLocation]]
:
page_bundle.js:149
[[Prototype]]
:
ƒ ()
[[Scopes]]
:
Scopes[3]
[[Prototype]]
:
Object
args
:
Array(0)
length
:
0
[[Prototype]]
:
Array(0)
target
:
ƒ toString()
length
:
0
name
:
"toString"
arguments
:
(...)
caller
:
(...)
[[Prototype]]
:
ƒ ()
[[Scopes]]
:
Scopes[0]
thisArg
:
[[Prototype]]
:
Proxy(Function)
Closure (RtcpeerconnectionPatchModule)
Orig
:
ƒ RTCPeerConnection()
baseMarkAsNative
:
ƒ baseMarkAsNative(func, name = "")
__TOSTRING_BRIDGE__
:
true
length
:
1
name
:
"baseMarkAsNative"
prototype
:
{}
arguments
:
null
caller
:
null
[[FunctionLocation]]
:
page_bundle.js:87
[[Prototype]]
:
ƒ ()
[[Scopes]]
:
Scopes[3]
filterSDP
:
ƒ filterSDP(sdp)
normalizeIceServers
:
ƒ normalizeIceServers(servers)
length
:
1
name
:
"normalizeIceServers"
prototype
:
{}
arguments
:
null
caller
:
null
[[FunctionLocation]]
:
page_bundle.js:194
[[Prototype]]
:
ƒ ()
[[Scopes]]
:
Scopes[3]
origAddEventListener
:
ƒ addEventListener()
origAddIceCandidate
:
ƒ addIceCandidate()
origCreateAnswer
:
ƒ createAnswer()
origCreateOffer
:
ƒ createOffer()
origSetLocalDescription
:
ƒ setLocalDescription()
safeDefine
:
ƒ safeDefine(obj, prop, descriptor)
toStringOverrideMap
:
WeakMap
[[Entries]]
0
:
{async function getRegistration(scope){ const r = await Native.getRegistration.apply(this, arguments); if (!r) return wantFake() && wantFilter() ? makeFakeRegistration({ scope }) : r; if (!wantFilter()) return r; const sc = r.scope || scope || '/'; const url = (r.active && r.active.scriptURL) || sc; if (isAllowed(url, sc)) return r; if (wantClean() && !CLEANED.has(sc)) { try { await r.unregister(); } catch(_) {} CLEANED.add(sc); } return wantFake() ? makeFakeRegistration({ scope: sc }, url) : undefined; } => "function getRegistration() { [native code] }"}
1
:
{function createAnswer(...args) { return origCreateAnswer.apply(this, args).then(desc => { if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp); return desc; }); } => "function createAnswer() { [native code] }"}
2
:
{async function requestAdapter(options = {}, ...rest) { const adapter = await origRequestAdapter(options, ...rest); if (!adapter) return null; const origRequestDevice = adapter.requestDevice.bind(adapter); const origRequestAdapterInfo = typeof adapter.requestAdapterInfo === 'function' ? adapter.requestAdapterInfo.bind(adapter) : null; // — единичный вызов + кеш для .info / requestAdapterInfo() let __adapterInfoValue; const __adapterInfoPromise = (async () => { try { const native = origRequestAdapterInfo ? await origRequestAdapterInfo() : (adapter.info || {}); const built = __buildAdapterInfo(native); __adapterInfoValue = built; return built; } catch { const built = __buildAdapterInfo(adapter.info || {}); __adapterInfoValue = built; return built; } })(); // Патчируем requestDevice и маскируем как «нативный» // авто-включение фич, если адаптер их поддерживает (безопасное пересечение) const __AUTO_ENABLE_ON_DEVICE__ = ['texture-compression-bc','texture-compression-etc2','texture-compression-astc']; const patchedRequestDevice = async function requestDevice(options = {}, ...rest) { const opts = (options && typeof options === 'object') ? { ...options } : {}; const req = new Set(Array.isArray(opts.requiredFeatures) ? opts.requiredFeatures : []); // авто-добавление только реально поддерживаемых адаптером фич for (const f of __AUTO_ENABLE_ON_DEVICE__) { try { if (adapter.features && adapter.features.has(f)) req.add(f); } catch {} } if (req.size > 0) opts.requiredFeatures = Array.from(req); const dev = await origRequestDevice(opts, ...rest); if (!dev) return null; // тени-геттеры без смены бренда try { const maskedFeatures = __maskFeatures(dev.features); Object.defineProperty(dev, 'features', { configurable: true, get: markNative(function get_features(){ return maskedFeatures; }, 'get features') }); } catch {} try { const maskedLimits = __maskLimits(dev.limits || {}); Object.defineProperty(dev, 'limits', { configurable: true, get: markNative(function get_limits(){ return maskedLimits; }, 'get limits') }); } catch {} try { Object.defineProperty(dev, 'label', { configurable: true, get: markNative(function get_label(){ return patch.label; }, 'get label') }); } catch {} return dev; // возвращаем нативный GPUDevice (бренд сохраняем) }; definePatchedValue(adapter, 'requestDevice', markNative(patchedRequestDevice, 'requestDevice'), 'adapter.requestDevice'); // Прокси адаптера const handler = { get(target, prop, receiver) { logAccess('adapter', prop); if (!ADAPTER_WHITELIST.includes(prop)) logNonWhiteList("adapter", prop); if (prop === 'limits') return __maskLimits(target.limits || {}); if (prop === 'features') return __maskFeatures(target.features); if (prop === 'requestAdapterInfo') { return markNative(function requestAdapterInfo() { return __adapterInfoPromise; }, 'requestAdapterInfo'); } if (prop === 'info') { return (target.info ? (__adapterInfoValue ?? __buildAdapterInfo(target.info || {})) : undefined); } if (prop === 'label') return patch.label; return getProp(target, prop, receiver); } }; return new Proxy(adapter, handler); } => "function requestAdapter() { [native code] }"}
3
:
{() => window.__normalizedLanguages => "function get languages() { [native code] }"}
4
:
{estimate() { const isStorageThis = (this === navigator.storage || this === storageProto); if (!isStorageThis) { return origEstimate.call(this); } tickUsage(); return Promise.resolve({ quota: quotaBytes, usage: usageBytes }); } => "function estimate() { [native code] }"}
5
:
{function create(options) { if (options && options.publicKey) { return origCreate ? origCreate.call(this, options) : Promise.resolve(new PublicKeyCredential()); } return origCreate ? origCreate.call(this, options) : Promise.resolve(undefined); } => "function create() { [native code] }"}
6
:
{function addEventListener(type, handler, options) { if (type === 'icecandidate' && typeof handler === 'function') { const wrapped = e => { if (!e.candidate || (e.candidate && e.candidate.candidate && e.candidate.candidate.includes('relay'))) { handler.call(this, e); } else { e.stopImmediatePropagation && e.stopImmediatePropagation(); } }; return origAddEventListener.call(this, type, wrapped, options); } return origAddEventListener.call(this, type, handler, options); } => "function addEventListener() { [native code] }"}
7
:
{function getBrands(){ if (!Array.isArray(meta.brands) || !meta.brands.length) throw new Error('THW: uaData.brands missing'); return meta.brands; } => "function get brands() { [native code] }"}
8
:
{function wrapped() { return implFn.apply(this, arguments); } => "function has() { [native code] }"}
9
:
{[method](a0, a1, a2, a3, a4, a5, a6) { return invoke(this, arguments); } => "function readPixels() { [native code] }"}
10
:
{function () { // читаем dm каждый раз — «жёсткая» привязка к текущему realm const dm = Number(navigator.deviceMemory); const limit = heapFromDM(dm); if (limit == null) { // dm нелегален → не вмешиваемся (оставляем натив/предыдущее) const d = Object.getOwnPropertyDescriptor(perfProto, 'memory') || Object.getOwnPropertyDescriptor(performance, 'memory'); return d && d.get ? d.get.call(performance) : undefined; } const total = Math.floor(limit * 0.25); const used = Math.min(total - 1, Math.floor(total * (0.40 + 0.15 * R()))); return { jsHeapSizeLimit: limit, totalJSHeapSize: total, usedJSHeapSize: used }; } => "function get memory() { [native code] }"}
11
:
{function persisted() { return Promise.resolve(true); } => "function persisted() { [native code] }"}
12
:
{get [key]() { return getter.call(this); } => "function get vendorSub() { [native code] }"}
13
:
{Proxy(Function) => "function toString() { [native code] }"}
14
:
{get [key]() { return getter.call(this); } => "function get plugins() { [native code] }"}
15
:
{function addIceCandidate(candidate, ...rest) { if (candidate && candidate.candidate && !candidate.candidate.includes('relay')) { return Promise.resolve(); } return origAddIceCandidate.call(this, candidate, ...rest); } => "function addIceCandidate() { [native code] }"}
16
:
{() => dpr => "function get devicePixelRatio() { [native code] }"}
17
:
{() => cpu => "function get hardwareConcurrency() { [native code] }"}
18
:
{[method](a0) { return invoke(this, arguments); } => "function getExtension() { [native code] }"}
19
:
{[method](a0, a1) { return invoke(this, arguments); } => "function getShaderPrecisionFormat() { [native code] }"}
20
:
{[method](a0, a1) { return invoke(this, arguments); } => "function getUniform() { [native code] }"}
21
:
{function getFullVersionList(){ if (!Array.isArray(meta.fullVersionList) || !meta.fullVersionList.length) { throw new Error('THW: uaData.fullVersionList missing'); } return deep(meta.fullVersionList); } => "function get fullVersionList() { [native code] }"}
22
:
{() => vendor => "function get vendor() { [native code] }"}
23
:
{function getMobile(){ if (typeof meta.mobile !== 'boolean') throw new Error('THW: uaData.mobile missing'); return meta.mobile; } => "function get mobile() { [native code] }"}
24
:
{function getUaFullVersion(){ if (typeof meta.uaFullVersion !== 'string' || !meta.uaFullVersion) { throw new Error('THW: uaData.uaFullVersion missing'); } return meta.uaFullVersion; } => "function get uaFullVersion() { [native code] }"}
25
:
{() => userAgent => "function get userAgent() { [native code] }"}
26
:
{[method](a0, a1, a2, a3, a4, a5, a6) { return invoke(this, arguments); } => "function readPixels() { [native code] }"}
27
:
{function createOffer(...args) { return origCreateOffer.apply(this, args).then(desc => { if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp); return desc; }); } => "function createOffer() { [native code] }"}
28
:
{async enumerateDevices() { const isMediaThis = (this === navigator.mediaDevices || this === mediaProto); if (!isMediaThis) { return origEnumerate.call(this); } const generateHexId = (len = 64) => { let s = ''; for (let i = 0; i < len; ++i) s += Math.floor(R() * 16).toString(16); return s; }; const groupId = generateHexId(64); return [ { kind: 'audioinput', label: devicesLabels.audioinput, deviceId: generateHexId(64), groupId }, { kind: 'videoinput', label: devicesLabels.videoinput, deviceId: generateHexId(64), groupId }, { kind: 'audiooutput', label: devicesLabels.audiooutput, deviceId: generateHexId(64), groupId: generateHexId(64) } ]; } => "function enumerateDevices() { [native code] }"}
29
:
{[method](a0) { return invoke(this, arguments); } => "function getExtension() { [native code] }"}
30
:
{[method](a0, a1) { return invoke(this, arguments); } => "function shaderSource() { [native code] }"}
31
:
{function close(code, reason) { // why: Diagnostic closing trace ws window._myDebugLog.push({ type: 'websocket-close', code, reason, timestamp: new Date().toISOString() }); return origClose.call(this, code, reason); } => "function close() { [native code] }"}
32
:
{() => undefined => "function get webdriver() { [native code] }"}
33
:
{[method]() { return invoke(this, arguments); } => "function getSupportedExtensions() { [native code] }"}
34
:
{function getPlatform(){ if (typeof chPlatform !== 'string' || !chPlatform) throw new Error('THW: uaData.platform missing'); return chPlatform; } => "function get platform() { [native code] }"}
35
:
{[method](a0, a1) { return invoke(this, arguments); } => "function shaderSource() { [native code] }"}
36
:
{function get(options) { if (options && options.publicKey) { return origGet ? origGet.call(this, options) : Promise.resolve(new PublicKeyCredential()); } return origGet ? origGet.call(this, options) : Promise.resolve(undefined); } => "function get() { [native code] }"}
37
:
{function SharedWorker(url, nameOrOpts) { const abs = new URL(url, location.href).href; // Normalize 2nd arg to an options object (always), so `type` is never lost const hasOptsObj = !!(nameOrOpts && (typeof nameOrOpts === 'object' || typeof nameOrOpts === 'function')) && (typeof nameOrOpts !== 'string'); const name = (typeof nameOrOpts === 'string') ? nameOrOpts : (hasOptsObj && typeof nameOrOpts.name === 'string' ? nameOrOpts.name : undefined); const optsForResolve = hasOptsObj ? nameOrOpts : (name !== undefined ? { name } : null); const workerType = resolveWorkerType(abs, optsForResolve, 'SharedWorker'); const bridge = G.__ENV_BRIDGE__; if (!bridge || typeof bridge.mkClassicWorkerSource !== 'function') { console.error('[SharedWorkerOverride] __ENV_BRIDGE__ not ready, refusing to create unpatched SharedWorker'); throw new Error('[SharedWorkerOverride] __ENV_BRIDGE__ not ready; refusing to create unpatched SharedWorker'); } if (typeof bridge.mkModuleWorkerSource !== 'function') { throw new Error('[SharedWorkerOverride] mkModuleWorkerSource missing'); } if (typeof bridge.publishSnapshot !== 'function') { throw new Error('[SharedWorkerOverride] publishSnapshot missing'); } if (typeof bridge.envSnapshot !== 'function') { throw new Error('[SharedWorkerOverride] envSnapshot missing'); } const snap = requireWorkerSnapshot(bridge.envSnapshot(), 'create'); G.__lastSnap__ = snap; bridge.publishSnapshot(snap); const userURL = resolveUserScriptURL(G, abs, 'SharedWorker'); const src = (workerType === 'module') ? bridge.mkModuleWorkerSource(snap, userURL) : bridge.mkClassicWorkerSource(snap, userURL); const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' })); let sw; try { // Always pass options-object so `type` definitely reaches the browser. const finalOpts = hasOptsObj ? { ...(nameOrOpts || {}) } : {}; if (name !== undefined) finalOpts.name = name; finalOpts.type = workerType; sw = new NativeShared(blobURL, finalOpts); } finally { URL.revokeObjectURL(blobURL); } // Post-create resync via BroadcastChannel (avoids interfering with user port messaging) try { bridge && bridge.publishSnapshot && bridge.publishSnapshot(snap); } catch(_) {} return sw; } => "function SharedWorker() { [native code] }"}
38
:
{get [key]() { return getter.call(this); } => "function get maxTouchPoints() { [native code] }"}
39
:
{query(parameters) { const isPermThis = (this === navigator.permissions || this === permProto); if (!isPermThis) { return origQuery.call(this, parameters); } if (!parameters || typeof parameters !== 'object') { return Promise.resolve({ state: 'prompt', onchange: null }); } const name = parameters && parameters.name; if (name === 'persistent-storage') return Promise.resolve({ state: 'granted', onchange: null }); if (['geolocation', 'camera', 'audiooutput', 'microphone', 'notifications'].includes(name)) return Promise.resolve({ state: 'prompt', onchange: null }); return origQuery.call(this, parameters); } => "function query() { [native code] }"}
40
:
{function createObjectURL(obj){ const url = nativeCreate.call(G.URL, obj); if (obj && typeof obj === 'object') store.set(url, obj); return url; } => "function createObjectURL() { [native code] }"}
41
:
{function toJSON() {return { platform: this.platform, brands: this.brands, mobile: this.mobile };} => "function toJSON() { [native code] }"}
42
:
{[method](a0, a1) { return invoke(this, arguments); } => "function getShaderPrecisionFormat() { [native code] }"}
43
:
{function revokeObjectURL(url){ if (store.has(url)) store.delete(url); return nativeRevoke.call(G.URL, url); } => "function revokeObjectURL() { [native code] }"}
44
:
{() => navPlatformOut => "function get platform() { [native code] }"}
45
:
{() => { const fakeExternal = {}; Object.defineProperty(fakeExternal, 'toString', { value: markAsNative(() => '[object External]', 'toString'), configurable: true, enumerable: false }); return fakeExternal; } => "function get external() { [native code] }"}
46
:
{[method](a0) { return invoke(this, arguments); } => "function getParameter() { [native code] }"}
47
:
{function setLocalDescription(desc, ...rest) { if (desc && desc.sdp) desc.sdp = filterSDP(desc.sdp); return origSetLocalDescription.call(this, desc, ...rest); } => "function setLocalDescription() { [native code] }"}
48
:
{function get_userAgentData(){ return nativeUAD; } => "function get userAgentData() { [native code] }"}
49
:
{convertToBlob(options) { const args = arguments; const p = Reflect.apply(orig, this, args); if (!(p && typeof p.then === 'function')) return p; const hooks = getHooksList(); if (!(hooks && hooks.length)) return p; return p.then((blob) => applyHooks(this, blob, args)); } => "function convertToBlob() { [native code] }"}
50
:
{function Worker(url, opts) { const abs = new URL(url, location.href).href; const workerType = resolveWorkerType(abs, opts, 'Worker'); const bridge = G.__ENV_BRIDGE__; if (!bridge || typeof bridge.mkClassicWorkerSource !== 'function') { console.error('[WorkerOverride] __ENV_BRIDGE__ not ready, refusing to create unpatched Worker'); throw new Error('[WorkerOverride] __ENV_BRIDGE__ not ready; refusing to create unpatched Worker'); } if (typeof bridge.mkModuleWorkerSource !== 'function') { throw new Error('[WorkerOverride] mkModuleWorkerSource missing'); } if (typeof bridge.publishSnapshot !== 'function') { throw new Error('[WorkerOverride] publishSnapshot missing'); } if (typeof bridge.envSnapshot !== 'function') { throw new Error('[WorkerOverride] envSnapshot missing'); } const snap = requireWorkerSnapshot(bridge.envSnapshot(), 'create'); G.__lastSnap__ = snap; bridge.publishSnapshot(snap); const userURL = resolveUserScriptURL(G, abs, 'Worker'); const src = workerType === 'module' ? bridge.mkModuleWorkerSource(snap, userURL) : bridge.mkClassicWorkerSource(snap, userURL); const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' })); let w; try { w = new NativeWorker(blobURL, { ...(opts), type: workerType }); } finally { URL.revokeObjectURL(blobURL); } if (w && typeof w.addEventListener === 'function') { const onMsg = ev => { const data = ev && ev.data; const loaded = data && typeof data === 'object' && typeof data.__ENV_USER_URL_LOADED__ === 'string' ? data.__ENV_USER_URL_LOADED__ : null; if (loaded) { // скрываем внутренний сигнал от внешних слушателей (важно для creepjs workers.js) try { ev.stopImmediatePropagation(); ev.stopPropagation(); } catch(_) {} // revoke нужен только когда мы реально пересоздавали blob-url if (loaded === userURL && userURL !== abs) { try { URL.revokeObjectURL(userURL); } catch(_) {} } w.removeEventListener('message', onMsg); } }; w.addEventListener('message', onMsg); } return w; } => "function Worker() { [native code] }"}
51
:
{async function getRegistrations(){ const regs = await Native.getRegistrations.apply(this, arguments); if (!wantFilter()) return regs; const out = []; for (const r of regs || []) { const sc = (r && r.scope) || '/'; const url = (r && r.active && r.active.scriptURL) || sc; if (isAllowed(url, sc)) { out.push(r); } else { if (wantClean() && !CLEANED.has(sc)) { try { await r.unregister(); } catch(_) {} CLEANED.add(sc); } if (wantFake()) out.push(makeFakeRegistration({ scope: sc }, url)); } } return out; } => "function getRegistrations() { [native code] }"}
52
:
{function tickUsage() { usageBytes = Math.min(quotaBytes - 4096, usageBytes + Math.floor(R() _4096)); } => "function tickUsage() { [native code] }"}
53
:
{function register(url, opts){ if (!isAllowed(url, (opts && opts.scope))) { if (wantFake()) return Promise.resolve(makeFakeRegistration(opts, String(url))); const Err = (typeof DOMException === 'function') ? new DOMException('ServiceWorker register blocked by policy', 'SecurityError') : new Error('ServiceWorker register blocked by policy'); return Promise.reject(Err); } // ServiceWorker.register must stay as network scriptURL (blob/data are unsupported). if (arguments.length >= 2) return Native.register.call(this, url, opts); return Native.register.call(this, url); } => "function register() { [native code] }"}
54
:
{function (success, error) { try { tickUsage(); success(usageBytes, quotaBytes); } catch (e) { console.error('[nav_total_set][Caught]', e); if (typeof error === 'function') error(e); } } => "function queryUsageAndQuota() { [native code] }"}
55
:
{function persist() { return Promise.resolve(true); } => "function persist() { [native code] }"}
56
:
{function PatchedRTCPeerConnection(...args) { const opts = args[0] && typeof args[0] === 'object' ? { ...args[0] } : {}; if (opts.iceServers) opts.iceServers = normalizeIceServers(opts.iceServers); return new Orig(opts, ...args.slice(1)); } => "function RTCPeerConnection() { [native code] }"}
57
:
{getContext(contextId, contextAttributes) { const args = arguments; const type = args[0]; const rest = Array.prototype.slice.call(args, 1); const res = Reflect.apply(orig, this, args); let ctx = res; try { if (type === '2d' && ctx){ ctx = createSafeCtxProxy(ctx); // call hight level hooks for (const hook of (ctx2dHooks || [])){ try { ctx = hook.call(this, ctx, type, ...rest) || ctx; } catch {} } } if (/^webgl/.test(String(type))){ for (const hook of (webglHooks || [])){ try { hook.call(this, ctx, type, ...rest); } catch {} } } for (const hook of (htmlHooks || [])){ try { hook.call(this, ctx, type, ...rest); } catch {} } } catch {} return ctx; } => "function getContext() { [native code] }"}
58
:
{function getHighEntropyValues(keys) { if (!Array.isArray(keys)) throw new Error('THW: bad keys'); const map = { architecture: meta.architecture, bitness: meta.bitness, model: meta.model, brands: meta.brands, mobile: meta.mobile, platform: chPlatform, platformVersion: meta.platformVersion, uaFullVersion: meta.uaFullVersion, fullVersionList: meta.fullVersionList, deviceMemory: mem, hardwareConcurrency: cpu, wow64: meta.wow64, formFactors: meta.formFactors }; const result = {}; for (const hint of keys) { if (typeof hint !== 'string' || !hint) throw new Error('THW: bad keys'); if (!(hint in map)) throw new Error(`THW: missing highEntropy.${hint}`); const val = map[hint]; if (val === undefined || val === null) throw new Error(`THW: missing highEntropy.${hint}`); if (typeof val === 'string' && !val && hint !== 'model') throw new Error(`THW: missing highEntropy.${hint}`); if (Array.isArray(val) && !val.length) throw new Error(`THW: missing highEntropy.${hint}`); result[hint] = val; } return Promise.resolve(result); } => "function getHighEntropyValues() { [native code] }"}
59
:
{[method]() { return invoke(this, arguments); } => "function getSupportedExtensions() { [native code] }"}
60
:
{toDataURL(type, quality) { const self = this; const isObj = self !== null && (typeof self === 'object' || typeof self === 'function'); if (self && self[flag]) return Reflect.apply(orig, self, arguments); if (inProgress && isObj) { if (inProgress.has(self)) return Reflect.apply(orig, self, arguments); inProgress.add(self); } else { if (self) self[flag] = true; } try { let patchedArgs = Array.prototype.slice.call(arguments); for (const hook of hooks){ if (typeof hook !== 'function') continue; try { const next = hook.apply(this, patchedArgs); if (next && Array.isArray(next)) patchedArgs = next; } catch (e) { if (global.__DEBUG__) console.error(`[CHAIN HOOK ERROR ${method}]`, e); } } const out = Reflect.apply(orig, this, patchedArgs); let res = out; for (const hook of hooks){ try { const r = hook.call(this, res, ...patchedArgs); if (typeof r === 'string') res = r; } catch (e) { if (global.__DEBUG__) console.error(`[CHAIN POST ERROR ${method}]`, e); } } return res; } finally { if (inProgress && isObj) { inProgress.delete(self); } else { if (self) self[flag] = false; } } } => "function toDataURL() { [native code] }"}
61
:
{function wrapped() { return implFn.apply(this, arguments); } => "function getOwnPropertyDescriptor() { [native code] }"}
62
:
{() => { const pfx = "Mozilla/"; return (typeof userAgent === "string" && userAgent.indexOf(pfx) === 0) ? userAgent.slice(pfx.length) : userAgent; } => "function get appVersion() { [native code] }"}
63
:
{get [key]() { return getter.call(this); } => "function get mimeTypes() { [native code] }"}
64
:
{[method](a0, a1) { return invoke(this, arguments); } => "function getUniform() { [native code] }"}
65
:
{toBlob(callback, type, quality) { const args = arguments; if (typeof callback === 'function') { const done = (blob) => callback(applyHooks(this, blob, args)); return Reflect.apply(orig, this, [done].concat(Array.prototype.slice.call(args, 1))); } return new Promise((resolve, reject) => { try { const done = (blob) => { try { resolve(applyHooks(this, blob, args)); } catch (e) { reject(e); } }; Reflect.apply(orig, this, [done].concat(Array.prototype.slice.call(args, 1))); } catch (e) { reject(e); } }); } => "function toBlob() { [native code] }"}
66
:
{getContext(contextId, contextAttributes) { const args = arguments; const type = args[0]; const rest = Array.prototype.slice.call(args, 1); const res = Reflect.apply(orig, this, args); let ctx = res; try { if (type === '2d' && ctx){ ctx = createSafeCtxProxy(ctx); // call hight level hooks for (const hook of (ctx2dHooks || [])){ try { ctx = hook.call(this, ctx, type, ...rest) || ctx; } catch {} } } if (/^webgl/.test(String(type))){ for (const hook of (webglHooks || [])){ try { hook.call(this, ctx, type, ...rest); } catch {} } } for (const hook of (htmlHooks || [])){ try { hook.call(this, ctx, type, ...rest); } catch {} } } catch {} return ctx; } => "function getContext() { [native code] }"}
67
:
{function heapFromDM(dm) { // dm: 0.25, 0.5, 1, 2, 4, 8, … if (!(typeof dm === 'number' && isFinite(dm))) return null; if (dm <= 0.5) return 512_ 1024 _1024; // ~512MB if (dm <= 1) return 768_ 1024 _1024; // ~768MB if (dm <= 2) return 1536_ 1024 _1024; // ~1.5GB if (dm <= 4) return 3072_ 1024 _1024; // ~3GB return 4096_ 1024 * 1024; // cap ~4GB для dm ≥ 8 } => "function heapFromDM() { [native code] }"}
68
:
{get [key]() { return getter.call(this); } => "function get productSub() { [native code] }"}
69
:
{() => mem => "function get deviceMemory() { [native code] }"}
70
:
{() => window.__primaryLanguage => "function get language() { [native code] }"}
71
:
{[method](a0) { return invoke(this, arguments); } => "function getParameter() { [native code] }"}
[[Prototype]]
:
WeakMap
window
:
Window {0: Window, window: Window, self: Window, document: document, name: '', location: Location, …}
Script
AudioContextModule
:
ƒ AudioContextModule(window)
CanvasPatchModule
:
ƒ CanvasPatchModule(window)
ContextPatchModule
:
ƒ ContextPatchModule(window)
HeadersInterceptor
:
ƒ HeadersInterceptor(window)
HideWebdriverPatchModule
:
ƒ HideWebdriverPatchModule(window)
LOGGingModule
:
ƒ LOGGingModule()
NavTotalSetPatchModule
:
ƒ NavTotalSetPatchModule(window)
RtcpeerconnectionPatchModule
:
ƒ RtcpeerconnectionPatchModule(window)
ScreenPatchModule
:
ƒ ScreenPatchModule(window)
WEBglDICKts
:
ƒ WEBglDICKts(window)
WebGPUPatchModule
:
ƒ WebGPUPatchModule(window)
WebglPatchModule
:
ƒ WebglPatchModule(window)
WebgpuWLBootstrap
:
ƒ WebgpuWLBootstrap(window)
WrkModule
:
ƒ WrkModule(window)
Window
Global

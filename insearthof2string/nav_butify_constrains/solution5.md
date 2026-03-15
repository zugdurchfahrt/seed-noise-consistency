1. Ожидаемый контракт для hide_webdriver.js и  GPU.requestAdapter

2. Что реально делает код
В main.py bundle собирается в жёстком порядке: сначала core_window.js, потом hide_webdriver.js, заметно позже WebgpuWL.js, и только после него webgpu.js. В main.py сначала публикуется worker bootstrap, а page bundle целиком ставится на Page.addScriptToEvaluateOnNewDocument в main.py. Значит оба интересующих surface живут в window-path и используют уже готовый Core.

Trace: Navigator.webdriver Модуль hide_webdriver.js резолвит webdriver по proto_chain, запрещает instance-owner и non-configurable descriptor, затем собирает target с kind: 'accessor', policy: 'strict', wrapLayer: 'named_wrapper_strict', validThis, invalidThis: 'native' в hide_webdriver.js. Дальше он идёт в Core.applyTargets(...) через applyTargetGroup в hide_webdriver.js.

В core_window это проходит через preflight в core_window.js: strict accessor обязан быть named_wrapper_strict, а при таком wrapLayer resolve принудительно держится на proto_chain в core_window.js. Потом patchAccessor в core_window.js строит strict accessor contract, не идёт в core_wrapper, выставляет wrapperClass = 'synthetic_named' в core_window.js, и для getter вызывает wrapGetter(...) в core_window.js. В wrapGetter для не-core_wrapper путь всегда named/synthetic: создаётся именованный getter и только markAsNative(...) в core_window.js. Для invalid receiver срабатывает onInvalidThis(...), который сначала пытается Reflect.apply(origGet, self, args) и тем самым сохраняет native throw path в core_window.js. Важный факт: __wrapStrictAccessor в этой трассе не участвует.

Trace: GPU.requestAdapter WebgpuWL.js не патчит requestAdapter; он только до основного патча вызывает нативный navigator.gpu.requestAdapter(...) для snapshot/whitelist в WebgpuWL.js. Сам патч живёт в webgpu.js: target для requestAdapter задаётся как kind: 'promise_method', wrapLayer: 'named_wrapper', invokeClass: 'brand_strict', allowNamedWrapperBrandStrict: true, validThis: self === gpu, invalidThis: 'throw'.

В core_window preflight допускает этот путь только из-за allowNamedWrapperBrandStrict: true: обычное правило требует core_wrapper, но здесь есть явное исключение в core_window.js. Затем patchPromiseMethod в core_window.js ставит requiresStrictThis = true, но при invalid receiver всё равно сначала идёт через onInvalidThis(orig, ...) и значит пытается вызвать оригинальный native method с тем же receiver в core_window.js. Поскольку wrapLayer здесь named_wrapper, а не core_wrapper, реальный wrapper строится не через __wrapNativeApply, а через buildPromiseMethodWrapperByArity(...) + markAsNative(...) в core_window.js. То есть и тут wrapperClass фактически synthetic_named, а не core_proxy.



Нормативный внешний слой:

WebDriver Working Draft от 6 февраля 2026: Navigator includes NavigatorAutomationInformation, readonly attribute boolean webdriver, WorkerNavigator не должен его экспонировать, getter возвращает состояние webdriver-active flag. Источник: W3C WebDriver.
Web IDL Living Standard, updated 11 January 2026: regular attributes экспонируются на interface prototype object; для regular readonly attribute дескриптор создаётся как accessor-property с [[Enumerable]]: true, [[Configurable]]: true если attribute не unforgeable; getter на invalid this бросает TypeError, если нет [LegacyLenientThis]. Источник: Web IDL Standard.
ECMAScript задаёт descriptor/proxy/toString инварианты, но не говорит, какой именно ваш wrapLayer надо выбрать. Источники: ECMAScript spec, Function.prototype.toString, Proxy invariants.
Фактический Chromium shape:

Chromium web test для enabled-state проверяет, что webdriver есть в navigator, значение truthy, а дескриптор на Object.getPrototypeOf(navigator) имеет configurable: true, enumerable: true, set === undefined. Источник: Chromium blink web test result.
Chromium test для disabled-state проверяет обратное: если feature не включена, свойства нет в prototype chain и navigator.webdriver === undefined. Источник: Chromium navigator_webdriver disabled test.
MDN как справочник поверх этого фиксирует Chrome-side trigger conditions: --enable-automation, --headless, либо --remote-debugging-port=0. Источник: MDN Navigator.webdriver.
Главный вывод:

внешний норматив + Chromium факт подтверждают surface-контракт navigator.webdriver как regular readonly Web IDL attribute на Navigator.prototype, с boolean-return, enumerable/configurable accessor shape и TypeError на bad receiver;
они не подтверждают ни strict_accessor_gateway, ни named_wrapper_strict, ни synthetic_named, ни core_proxy;
это ужевнутренний implementation choicee.


Для обоих surface статическая трасса в текущем nav_butify одна и та же по смыслу: патч проходит через Core.applyTargets, но финальная обёртка не proxy-native, а synthetic_named с markAsNative. markAsNative здесь пишет label только во внутренние WeakMap (toStringOverrideMap/toStringProxyTargetMap) в core_window.js и core_window.js, при этом публичный Function.prototype.toString не переписывается, а только публикуется __CORE_TOSTRING_STATE__ в core_window.js. Поэтому статически именно эти два API хорошо объясняют вашу контрольную точку: descriptor/receiver/apply path у них по коду выглядит удержанным, а наблюдаемая проблема window-scope логично концентрируется в bucket failed toString.

В текущем trace для Navigator.webdriver и GPU.requestAdapter есть не только штатный pipeline, но и как минимум несколько ненормативных вмешательств, которые нельзя считать нейтральными. Они не вытекают из внешнего контракта surface и не являются ожидаемым поведением движка; это прикладные обходы архитектурных ограничений. Поэтому любые результаты этого прогона относятся не к “чистому pipeline”, а к конфигурации pipeline + compensating shims. Сам факт их наличия уже означает отклонение от целевой модели и должен быть зафиксирован как ограничение интерпретации.

По этому trace как минимум два таких отклонения очевидны. 
Первое: WebgpuWL.js вызывает navigator.gpu.requestAdapter() ещё до того, как основной патч GPU.requestAdapter ставится в webgpu.js, потому что в orchestration main.py whitelist-модуль загружается раньше основного webgpu-модуля. Это не просто “техническая зависимость”: это ранний побочный runtime-вызов целевого API до его штатной обёртки. 
Второе: core_window.js строит отдельную toString-инфраструктуру с WeakMap-labeling, __CORE_TOSTRING_STATE__, __ensureMarkAsNative, bridge-target mapping и даже reuse parent-state в core_window.js. 
Это тоже не нормативная часть surface-контракта, а компенсирующий механизм, введённый для маскировки synthetic wrappers. 
Такие вещи обычно не считаются допустимой “нормой реализации”; это признаки того, что архитектура не даёт нативный path сама по себе и её приходится поддерживать обходными средствами.

Итоговый вывод : в этой контрольной точке результаты стабильны и воспроизводимы, но  Они являются резельтатом "бортьбы с неверной архитектуой" и полученыпутем ненормативных проектных обходов, как минимум в webgpu-orchestration и toString-bridge слое Core. 
Следовательно, эти обходы должны быть РЕлиизОВАНЫ в архитекртуе pipeline, вместо борбы с ней, исключив design deviations / compensating shims, .



Задача :  эти обходы должны быть РЕлиизОВАНЫ в архитекртуе pipeline, вместо борбы с ней, исключив design deviations / compensating shims .
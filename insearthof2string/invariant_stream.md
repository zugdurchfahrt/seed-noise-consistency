Дисклеймер - я сейчас работаю не из оснвной  версии репо, а из копии которая была сделана сегодня после того, как мы с тобой  логирование для замыкания правили. То есть это не то, что было вот сейчас, это немножко другая версия, потому что те правки меня никакие не убедили, я их посмотрел, я их практически все откатил, и я их сохранил, конечно, но я их откатил, потому что они неубедительные мне показались тк Я не вижу результата. И к тому же они ломают контекст,. Но не суть. Вот это версия репо, в которой я сейчас прислал тебе logreverse\assets\scripts\window\patches\stealth\hide_webdriver.js Вот это сейчас в моменте актуальная вот эта.


Пожалуйста, сформулируй из всего множества методтчскх документов, собери
1) краткую сводку по logreverse\assets\scripts\window\patches\stealth\hide_webdriver.js., 
вот этот вот у нас есть отдельный целый модуль из одного фактиески объекта. 
ожидаемый Layer-контракт,и  выбора формы обёртки? То есть, какие у него контракт ивариантов  какой у него, gateway, какие у него, значит, все его ожидаемые поведения в пайплайне. Просто сводку сделай, чтобы было понятнее. 
 Пунктом 2, всё то же самое, но только как он прописанс в исполниельных документах, прописан в модуле, в core_window.js, logreverse\tools\tools_native_check\PROXY_MECHANICS_REGISTRY.md, что от него ожидает код н и как он у нас практически в модуле обрабатывается.
 То есть ожидание и реальность. 
Номер 3 — это, собственно говоря нормативные ссылки на следющие данные:
нормативный внешний слой ( brand/invocation semantics,  descriptor/proxy invariants.) 
фактический Chromium shape( Vendor/runtime fact)
specs: конкретный контракт surface.
 нужно поднять вот те самые источники, про которые мы с тобой говорили выше, и посмотреть там. 
И на выходе должно получиться три описания, что ли, три подхода., пути,  И по-хорошему они даже быть в гармании. По-хорошему. А вот разницу мы увидим.

Разберу это как три слоя для одного surface navigator.webdriver в logreverse: ожидаемый контракт из методологии, фактическая реализация в коде/registry/Core, и внешний нормативный слой со спецификациями и Chromium-фактом. Сначала сниму локальные точки входа и затем подниму первоисточники.

Локальная картина уже видна: hide_webdriver.js пытается вести себя как strict scalar accessor surface, но в копии logreverse код и документы опять расходятся по самому wrapLayer. Я доберу ещё точку входа в main.py и валидатор registry, потом сведу всё в формат “ожидание / фактическая реализация / внешний норматив”.

Ниже свёл именно для `logreverse`-копии, без правок кода.

**1. Ожидаемый контракт для `hide_webdriver.js`**
По методологическим документам это surface класса `strict scalar accessor`: `Navigator.webdriver`, owner `Navigator.prototype`, descriptor kind `accessor`, sync, return `boolean`, receiver-sensitive getter, native bad-receiver path должен сохраняться. Это зафиксировано в [Surface_srandart.md](/c:/55555/switch/Evensteam/Samples4Context/Surface_srandart.md#L10) и [Surface_target_matrix.md](/c:/55555/switch/Evensteam/Samples4Context/Surface_target_matrix.md#L30).

Общий ожидаемый layer-contract такой:
- target выбирается по `kind/accessor + policy/strict + resolve/proto_chain`, а не по “модуль stealth”.
- define делается на реальном `descriptorOwner`, с сохранением `enumerable/configurable/get/set` из исходного дескриптора.
- invalid receiver не маскируется значением `false`; должен идти native engine throw/rethrow.
- `Function.prototype.toString`-маскировка должна идти только через Core bridge, без локального toString-моста в модуле.
- apply должен быть атомарным: preflight -> plan -> define -> post-check -> registry -> rollback on failure -> diag.

Но в самих методологических docs уже есть конфликт по форме обёртки:
- [Surface_srandart.md](/c:/55555/switch/Evensteam/Samples4Context/Surface_srandart.md#L13) и [Surface_target_matrix.md](/c:/55555/switch/Evensteam/Samples4Context/Surface_target_matrix.md#L30) ожидают `strict_accessor_gateway`.
- [CORE2.0-vCurrent.md](/c:/55555/switch/Evensteam/Samples4Context/CORE2.0-vCurrent.md#L152) в явном норм-контракте говорит, что strict accessor должен идти через `wrapLayer='named_wrapper_strict' + policy='strict'`.
То есть даже “ожидание” у вас сейчас не монолитное: invariant-set общий, а label/path уже расходится.

**2. Что в `logreverse` реально делает код**
Точка входа правильная: `core_window.js` грузится раньше `hide_webdriver.js` в [main.py](/c:/55555/switch/Evensteam/logreverse/main.py#L366). Сам модуль в [hide_webdriver.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/patches/stealth/hide_webdriver.js) делает ожидаемый pipeline-периметр: проверяет `CanvasPatchContext`, `Core`, guard, делает `resolveDescriptor(..., 'proto_chain')`, запрещает instance-owner и non-configurable, строит один target, затем прогоняет `applyTargets`, свой `defineProperty` post-check, rollback и `registerPatchedTarget`.

Практический target у него такой:
- `kind: 'accessor'`
- `policy: 'strict'`
- `wrapLayer: 'strict_accessor_gateway'`
- `invalidThis: 'native'`
- `getImpl -> false`
Смотри [hide_webdriver.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/patches/stealth/hide_webdriver.js#L387).

Ключевая реальность: текущий `Core` в этой копии такой target не поддерживает. В [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L949) `normalizeWrapLayer` принимает только `descriptor_only`, `named_wrapper`, `named_wrapper_strict`, `core_wrapper`. Дальше в [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L1868) жёстко зашито: `kind=accessor` + `policy='strict'` требует именно `named_wrapper_strict`. Значит `hide_webdriver.js` в `logreverse` сейчас методологически написан под один Core-контракт, а исполняется против другого. Это не “тонкая проблема”, это прямой contract mismatch.

Документы исполнения тоже расходятся:
- registry в [PROXY_MECHANICS_REGISTRY.md](/c:/55555/switch/Evensteam/logreverse/tools/tools_native_check/PROXY_MECHANICS_REGISTRY.md#L134) ожидает для `Navigator.webdriver` `strict_accessor_gateway`.
- статический валидатор в [validate_proxy_mechanics_registry.ps1](/c:/55555/switch/Evensteam/logreverse/tools/tools_native_check/validate_proxy_mechanics_registry.ps1#L62) тоже требует, чтобы Core принимал `strict_accessor_gateway`.
- но этот же валидатор вообще смотрит в `sunami\...`, а не в `logreverse\...`: [validate_proxy_mechanics_registry.ps1](/c:/55555/switch/Evensteam/logreverse/tools/tools_native_check/validate_proxy_mechanics_registry.ps1#L58). То есть он не является валидным proof для текущей копии.

Итог по п.2:
- ожидание docs/registry: `strict_accessor_gateway`
- реальность module: тоже `strict_accessor_gateway`
- реальность Core: только `named_wrapper_strict`
- реальность validator: проверяет другой путь и ещё смотрит не в ту копию

**3. Внешний нормативный слой и Chromium fact**
Здесь первоисточники уже внешние, и они хорошо согласуются по самому surface, но не говорят ничего про ваши локальные label'ы `strict_accessor_gateway`/`named_wrapper_strict`.

Нормативный внешний слой:
- WebDriver Working Draft от 6 февраля 2026: `Navigator` includes `NavigatorAutomationInformation`, `readonly attribute boolean webdriver`, `WorkerNavigator` не должен его экспонировать, getter возвращает состояние `webdriver-active flag`. Источник: [W3C WebDriver](https://www.w3.org/TR/webdriver/).
- Web IDL Living Standard, updated 11 January 2026: regular attributes экспонируются на interface prototype object; для regular readonly attribute дескриптор создаётся как accessor-property с `[[Enumerable]]: true`, `[[Configurable]]: true` если attribute не unforgeable; getter на invalid `this` бросает `TypeError`, если нет `[LegacyLenientThis]`. Источник: [Web IDL Standard](https://webidl.spec.whatwg.org/).
- ECMAScript задаёт descriptor/proxy/toString инварианты, но не говорит, какой именно ваш wrapLayer надо выбрать. Источники: [ECMAScript spec](https://tc39.es/ecma262/), [Function.prototype.toString](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-function.prototype.tostring), [Proxy invariants](https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver).

Фактический Chromium shape:
- Chromium web test для enabled-state проверяет, что `webdriver` есть в `navigator`, значение truthy, а дескриптор на `Object.getPrototypeOf(navigator)` имеет `configurable: true`, `enumerable: true`, `set === undefined`. Источник: [Chromium blink web test result](https://chromium.googlesource.com/chromium/src/%2B/66.0.3359.158/third_party/WebKit/LayoutTests/navigator_webdriver/navigator_webdriver_enabled.html).
- Chromium test для disabled-state проверяет обратное: если feature не включена, свойства нет в prototype chain и `navigator.webdriver === undefined`. Источник: [Chromium navigator_webdriver disabled test](https://chromium.googlesource.com/experimental/chromium/src/%2B/refs/tags/88.0.4324.153/third_party/blink/web_tests/navigator_webdriver/navigator_webdriver.html).
- MDN как справочник поверх этого фиксирует Chrome-side trigger conditions: `--enable-automation`, `--headless`, либо `--remote-debugging-port=0`. Источник: [MDN Navigator.webdriver](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/webdriver).

Главный вывод:
- внешний норматив + Chromium факт подтверждают surface-контракт `navigator.webdriver` как regular readonly Web IDL attribute на `Navigator.prototype`, с boolean-return, enumerable/configurable accessor shape и TypeError на bad receiver;
- они не подтверждают ни `strict_accessor_gateway`, ни `named_wrapper_strict`, ни `synthetic_named`, ни `core_proxy`;
- это уже ваш внутренний implementation choice, и именно он в `logreverse` сейчас разъехался между docs/module/Core.

Если хочешь, следующим сообщением я могу сделать ещё более жёсткую табличку именно для `hide_webdriver`:
`внешняя норма -> Chromium fact -> ожидание docs -> фактический код -> конфликт -> что из этого доказано / не доказано`.


я тебе лог-документ сначала не дал, чтобы не искажать восприятие. Вот так вот у нас реализуется, видишь, испронение по факт..\ то есть как бы задача-то о чем стоит? Чтобы отталкиваясь от твоих вот, значит, очень хороших заключений, нужно привести в целом его путь к вот этим вот, значит, требованиям, не принимая во внимание, что там говорит Core, как бы фактура внешняя говорит так, значит, вскоре нужно прописать так же. То есть мы обратным образом правим. Вот какойtбудет требование. У
 тебя сейчас будет задача вот этот путь, который ты сейчас рассказалки включитьт его ожидаемый путь по внешнему источнику в нашу механику(не только файл proxy machaics,а  в цлеом реалтищация)., работы


Не принимая во внимание никакие методологии наши, только внещние перечесленные тобой источники, внешние, а вот это всё рнаше  для тебя сейчас не существует. 
Ты просто прописываешь в механике пайплана(модуль, прокси+мехагники,Core) как им ождаетсяо его повеедегие. Вот, если такие пути существуют, ты вписываешь его в эти пути. Если их не существует, ты создаёшь путь такой, чтобы оно работало.,или меняешь  путь apply один на лругой, И всё, и в конце он должен встать у нас, и ошибки эти, которые там прописаны, они тоже прописаны мной, тобой. Это всё можно поправить. Так что сейчас пока один элемент, я думаю, это не сильно много работы. Ну, в смысле, это подъёмно. Вот, так что на выходе мы должны получить, значит, установленный метод, который не будет вызывать, значит, ни ошибок ни у нас, ни снаружи.

Сейчас проверю webdr.json вместе с реальным hide_webdriver.js и core_window.js, чтобы не править путь вслепую. Дальше внесу минимальные изменения в active-path logreverse: module + Core + registry/validator только в той части, которая нужна для navigator.webdriver.

Симптом по webdr.json точный: это не “внешний контракт неясен”, а банальный разрыв path-contract. Модуль просит strict_accessor_gateway, а текущий Core этого пути не знает, поэтому preflight падает ещё до самой surface-логики. Проверяю, хватает ли существующего named_wrapper_strict для внешнего webdriver-контракта, чтобы не плодить новый путь без необходимости.

Решение беру по минимальному рабочему пути: не ломать модуль под старый Core, а научить текущий Core принимать gateway-лейблы, которые уже использует активный код (strict_accessor_gateway и, заодно, object_return_gateway). Для webdriver этого достаточно, потому что внешний контракт требует strict accessor behavior, а не конкретного внутреннего label. Перед правками ещё быстро проверяю, использует ли текущий logreverse эти gateway-лейблы ещё где-то.

В logreverse уже лежит core_window1003.js, где эти gateway-лейблы реализованы. Это полезно: не нужно изобретать path, можно перенести минимальный рабочий кусок в текущий core_window.js и не гадать с нуля. Сейчас сниму только релевантные места оттуда.

У core_window1003.js уже есть именно тот недостающий кусок: gateway-лейблы, unified accessor checks и специальная ветка wrapGetter -> __wrapStrictAccessor. Я перенесу только этот контрактный минимум в текущий core_window.js, чтобы hide_webdriver встал на существующий внешний shape без нового архитектурного слоя.

Вношу две точечные правки. Первая: довожу Core до уже используемых accessor-gateway labels, чтобы hide_webdriver не падал в preflight на unsupported wrapLayer. Вторая: перевожу локальный validator этой копии на logreverse, чтобы он проверял текущую реальность, а не соседний sunami.

Патч не наложился из-за дрейфа текущего файла. Снимаю точные участки вокруг patchAccessor и preflightTarget, чтобы переложить изменения без догадок и не зацепить лишнее.

Добираю точный хвост patchAccessor: там тоже есть strict-ветка, и её надо перекинуть на unified accessor-gateway без случайного пропуска. После этого уже можно будет свести preflight и path целиком.

Core-path уже перенёс. Проверяю, не осталось ли для этого элемента внутренних разрывов: символы strict_accessor_gateway/object_return_gateway теперь должны читаться Core’ом, а validator должен смотреть в logreverse, не в соседнюю копию. После этого либо добью мелкие документные хвосты, либо остановлюсь на рабочем минимуме.

Правки встали. Прогоняю локальный static validator этой копии. Это не докажет runtime в браузере, но покажет, не оставили ли мы внутренний self-contradiction в logreverse по registry/Core/module path для webdriver.

Полный validator этой копии провалился, но не на webdriver: он упёрся в старые unrelated ожидания по toString и nav_total_set. Для текущей задачи это означает, что общий validator уже давно не локален к одному surface, поэтому я отдельно сниму точные lines по webdriver-path и зафиксирую именно их.

Добираю одну техническую проверку: синтаксис core_window.js после переноса gateway-ветки. Полный validator уже показал unrelated legacy gaps, поэтому отдельно проверю именно parse-able JS и наличие новой ветки wrapGetter -> __wrapStrictAccessor.

Исправил именно тот разрыв, который виден в [webdr.json](/c:/55555/switch/Evensteam/bin/webdr.json#L8): `hide_webdriver` шёл в `Core.applyTargets` с `wrapLayer='strict_accessor_gateway'`, а текущий `Core` этот label не принимал. Поэтому path падал ещё в `preflight`, до runtime surface-логики.

В [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L949) я добавил поддержку `strict_accessor_gateway` и `object_return_gateway` как accessor-gateway labels, а в [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L1270) routed unified accessor-gateway через `__wrapStrictAccessor`. Дальше в [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L1450) и [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L1893) preflight/patchAccessor теперь рассматривают gateway как нормальный strict accessor path: strict policy, proto-chain, descriptor-required, no `setImpl`, no `core_wrapper` для этого surface. Сам [hide_webdriver.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/patches/stealth/hide_webdriver.js#L387) я не менял: его target уже был внешне корректно сформулирован.

Ещё перевёл локальный validator этой копии на `logreverse`, а не на соседний `sunami`: [validate_proxy_mechanics_registry.ps1](/c:/55555/switch/Evensteam/logreverse/tools/tools_native_check/validate_proxy_mechanics_registry.ps1#L58), [validate_proxy_mechanics_registry.ps1](/c:/55555/switch/Evensteam/logreverse/tools/tools_native_check/validate_proxy_mechanics_registry.ps1#L111). И поправил scope в [PROXY_MECHANICS_REGISTRY.md](/c:/55555/switch/Evensteam/logreverse/tools/tools_native_check/PROXY_MECHANICS_REGISTRY.md#L4), чтобы он соответствовал текущей копии.

Проверка:
- `core_window.js` проходит JS parse через `node`: `ok`.
- Точечные признаки нового path на месте: gateway labels, unified `wrapGetter -> __wrapStrictAccessor`, accessor-gateway preflight.
- Полный `validate_proxy_mechanics_registry.ps1` всё ещё падает, но уже на unrelated legacy drift по `toString` и `nav_total_set`, не на `webdriver`.

Внешняя опора для этого пути остаётся той же: [W3C WebDriver](https://www.w3.org/TR/webdriver/), [Web IDL](https://webidl.spec.whatwg.org/), [Chromium webdriver test](https://chromium.googlesource.com/chromium/src/%2B/66.0.3359.158/third_party/WebKit/LayoutTests/navigator_webdriver/navigator_webdriver_enabled.html).

Если продолжать, следующий разумный шаг: отдельно добить runtime-проверку именно `navigator.webdriver` и потом уже чистить оставшиеся unrelated validator gaps.



результат по webdriver - положитеьный
bin\wd5.json

Задача 1



**Формулировка задачи**

Исходный лог-bin\6688.txt.

Необходимо, опираясь на ранее сформулированные выводы и **исключительно на нормативынм внешние источники и их фактическое описание поведения методов/объектов**, привести текущую реализацию к ожидаемому нативному поведению. Внутренние методологии, договорённости и ограничения системы на данном этапе **не принимаются во внимание**.

Работа выполняется **в обратном направлении**:
вместо подгонки внешней логики под текущую архитектуру нужно адаптировать существующую механику так, чтобы она соответствовала внешним требованиям.

**Область изменений**

Корректировка должна затрагивать **весь рабочий пайплайн**, включая:

* модульную реализацию,
* Proxy-механику,
* Core,
* связанные механизмы применения (`apply`) и инициализации.

При этом:

1. Если в текущей механике **уже существует путь исполнения**, соответствующий ожидаемому поведению — он должен быть использован и встроен в pipeline.
2. Если такого пути **не существует**, он должен быть создан.
3. Если существующий путь применения (`apply`) противоречит требуемому поведению — допускается **его замена или перестройка**.

**Цель**

На выходе должна получиться корректно установленная реализация метода, которая:

* соответствует поведению, описанному во внешних источниках,
* интегрирована в существующий pipeline,
* не вызывает ошибок ни во внутренней системе, ни во внешней среде.




**Формулировка задачи на анализ и верификацию**

Необходимо провести проверку работы **валидатора, proxy-механики ** на соответствие ранее заданному контракту поведения методов. 


Проверка должна включать:

1. **Верификацию реализации методов**
   — соответствует ли их фактический путь исполнения внешним нормативным требованиям (wrapperClass, gateway-путь, descriptor-установка, native-first вызов и т.д.), как это описано в registry механик.  

2. **Верификацию корректности оценки валидатора**
   — правильно ли валидатор классифицирует нарушения,
   — корректно ли применяет правила registry,

   — не возникают ли ложные срабатывания или пропуски.

Например, в текущем логе валидатор сообщает о 12 нарушениях и трёх проблемных файлах, включая `core_window.js` и `nav_total_set.js`.  лог - ogreverse\logs\brandmauer.log 

**Цель**

Подтвердить, что:

* механика proxy-путей реализована корректно,
* валидатор **правильно интерпретирует registry-контракт**,
* итоговый лог является **достоверной оценкой состояния системы**, а не следствием ошибок самой проверки.



**Findings**
- `webdriver` сейчас в порядке. В [wd5.json](/c:/55555/switch/Evensteam/bin/wd5.json#L1) есть только `hide_webdriver:ready`, без деградаций apply/preflight.
- Лог `brandmauer` не является чистой внешне-нормативной оценкой. Он оценивает соответствие внутреннему registry/validator snapshot. Это видно по самим правилам: в [validate_proxy_mechanics_registry.ps1](/c:/55555/switch/Evensteam/logreverse/tools/tools_native_check/validate_proxy_mechanics_registry.ps1#L77) и [validate_proxy_mechanics_registry.ps1](/c:/55555/switch/Evensteam/logreverse/tools/tools_native_check/validate_proxy_mechanics_registry.ps1#L128) зашиты конкретные regex-паттерны реализации, а не внешние spec-контракты.
- `brandmauer.log` сам по себе уже показывает scope drift: заявлен `scanned_root=...assets\scripts`, но как violation включён [validate_proxy_mechanics_registry.ps1](/c:/55555/switch/Evensteam/logreverse/tools/tools_native_check/validate_proxy_mechanics_registry.ps1) вне этого root. Смотри [brandmauer.log](/c:/55555/switch/Evensteam/logreverse/logs/brandmauer.log#L1) и [brandmauer.log](/c:/55555/switch/Evensteam/logreverse/logs/brandmauer.log#L34). Значит итоговый лог не полностью надёжен как отчёт о фактической области сканирования.
- По `nav_total_set.js` validator в целом правильно ловит drift относительно registry, но это drift именно от registry, а не обязательно от внешних specs. Registry ждёт `strict_accessor_gateway` / `object_return_gateway` и local named-wrapper path для `permissions.query`, `enumerateDevices`, `storage.estimate` в [PROXY_MECHANICS_REGISTRY.md](/c:/55555/switch/Evensteam/logreverse/tools/tools_native_check/PROXY_MECHANICS_REGISTRY.md#L141), [PROXY_MECHANICS_REGISTRY.md](/c:/55555/switch/Evensteam/logreverse/tools/tools_native_check/PROXY_MECHANICS_REGISTRY.md#L145), [PROXY_MECHANICS_REGISTRY.md](/c:/55555/switch/Evensteam/logreverse/tools/tools_native_check/PROXY_MECHANICS_REGISTRY.md#L148). Реальный код идёт иначе: `named_wrapper_strict` для strict accessors и `Core.applyTargets(... kind:'promise_method', wrapLayer:'named_wrapper' ...)` для методов в [nav_total_set.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/patches/navigator/nav_total_set.js#L852), [nav_total_set.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/patches/navigator/nav_total_set.js#L1794), [nav_total_set.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/patches/navigator/nav_total_set.js#L1895), [nav_total_set.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/patches/navigator/nav_total_set.js#L2032), а `plugins/mimeTypes` вообще через `safeDefineAcc + __wrapGetter` в [nav_total_set.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/patches/navigator/nav_total_set.js#L2553).
- По `core_window.js` три brandmauer-срабатывания тоже в основном про внутренний policy snapshot: iframe oracle и public `Proxy(nativeToString, {apply})` реально есть в [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L111), [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L632), а validator/registry их запрещают. Но это не прямое внешнее spec-правило само по себе.
- Единственное место из этого набора, которое похоже на реальный внешний contract-risk: synthetic invalid-this в `__wrapStrictAccessor` сейчас делает просто `throw new TypeError()` в [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L499), тогда как orig-get branch делегирует native getter через `Reflect.apply(...)` в [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L464). Это уже похоже на возможный drift от Web IDL bad-receiver semantics, а не только от внутренней методологии.

**External Contract**
- Web IDL задаёт базовый shape regular attributes: они живут на interface prototype object как accessor-properties, `[[Enumerable]]: true`, `[[Configurable]]: true`, а invalid `this` без `LegacyLenientThis` должен приводить к `TypeError`. Источник: Web IDL Standard, секции про attributes и prototype binding: <https://webidl.spec.whatwg.org/>
- `Permissions.query()` внешне обязан быть `Promise<PermissionStatus>` и при ошибке преобразования descriptor-а возвращать rejected promise с тем же exception. Источник: Permissions spec и MDN: <https://www.w3.org/TR/2021/WD-permissions-20211028/#dom-permissions-query>, <https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query>
- `MediaDevices.enumerateDevices()` внешне обязан возвращать `Promise` с массивом `MediaDeviceInfo`/`InputDeviceInfo`; список устройств и labels зависит от permission state. Источник: MDN: <https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices>, <https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo>
- `StorageManager.estimate()` внешне обязан возвращать `Promise<StorageEstimate>` с `usage` и `quota`; при failure/internal error идёт `TypeError`. Источник: Storage Standard: <https://storage.spec.whatwg.org/>
- ECMAScript задаёт инварианты `Proxy` и `Function.prototype.toString`, но не диктует ваши локальные labels вроде `strict_accessor_gateway` или запрет iframe-oracle как таковой. Источники: <https://tc39.es/ecma262/>, <https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-function.prototype.tostring>

**Verdict**
- `brandmauer.log` достоверен как отчёт о расхождениях между текущим кодом и внутренним registry/validator snapshot.
- `brandmauer.log` недостоверен как отчёт о внешней “нативности” в чистом виде: значимая часть правил там implementation-specific, а не spec-derived.
- `validate_proxy_mechanics_registry.ps1` не “интерпретирует registry”, а жёстко regex-проверяет конкретные паттерны файлов. Поэтому он ловит drift snapshot-а, но не умеет отделить внешне допустимую альтернативную реализацию от реальной поломки.
- По внешнему контракту из текущих 12 нарушений наиболее содержательное место для дальнейшей проверки/правки: `__wrapStrictAccessor` synthetic invalid-this branch в [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L499). Остальные 11 сейчас в основном выглядят как внутренний drift registry/validator против active code, а не как уже доказанная поломка по внешним specs.

Если продолжать по этой задаче, следующий правильный шаг: не править вслепую `nav_total_set.js`, а сначала разделить все 12 пунктов на две корзины:
- `externally grounded`
- `registry-only drift`

После этого уже можно точечно решать, что менять в коде, а что в validator/registry.


Проведи аудит `core_window.js:67-912` 


Необходимо, опираясь на ранее сформулированные выводы и **исключительно на нормативынм внешние источники и их фактическое описание поведения методов/объектов**, привести текущую реализацию к ожидаемому нативному поведению. Внутренние методологии, договорённости и ограничения системы на данном этапе **не принимаются во внимание**.

Работа выполняется **в обратном направлении**:
вместо подгонки внешней логики под текущую архитектуру нужно адаптировать существующую механику так, чтобы она соответствовала внешним требованиям.

Цель: не предложить “лучшую архитектуру”, а определить, **какая форма реализации этого блока допустима** с точки зрения ожидаемого нативного поведения движка для `Function.prototype.toString`, Proxy/descriptor-инвариантов, receiver/this-contract и stealth-минимизации заметности среды.

## Источники
- ECMAScript spec: инварианты `Proxy`, `[[Get]]`, `[[DefineOwnProperty]]`, `Function.prototype.toString`, descriptor semantics.
  Источник: `tc39.es/ecma262`
- Web IDL: brand checks, platform objects, interface members, invocation semantics, `Illegal invocation`-класс проблем.
  Источник: `webidl.spec.whatwg.org`
- WHATWG/W3C/API specs: конкретный контракт surface.
  Примеры: Permissions, Storage, WebGPU, Web Audio.
- MDN: не нормативный первоисточник, а практический справочник/индексатор поверх спецификаций и поведения браузеров.
- Chromium/Blink docs + реальное поведение Chromium: когда спецификация не даёт достаточно для shape/details/runtime behavior.

## Что требуется установить

1. Определи класс решения:
- A. публичный `Function.prototype.toString` не должен патчиться вообще;
- B. публичный `Function.prototype.toString` может патчиться, но только если по коду доказано сохранение всех инвариантов;
- C. допустимы оба варианта, но для разных методов/объектов;
- D. по текущему коду допустимая форма не доказана, есть внутренне противоречивый dual-path.

2. Проверь внутреннюю согласованность блока:
- нет ли противоречия между policy “keep native `Function.prototype.toString` unchanged” и фактической установкой `new Proxy(nativeToString, { apply })`;
- не создаются ли параллельные/вторичные toString-механики;
- не расходятся ли bridge-state, label-state и публичная поверхность.

3. Проверь жёсткие инварианты:
- brand behavior для non-function receiver у `Function.prototype.toString`;
- native-forward через `Reflect.apply`;
- descriptor flags и descriptor-shape;
- prototype/function/proxy invariants;
- отсутствие `Illegal invocation` из-за потери receiver;
- отсутствие симптомов класса:
  - `failed descriptor`
  - `failed own property`
  - `failed descriptor keys`
  - `failed prototype in function`
  - `failed class extends`
  - `failed incompatible proxy error`
  - `failed at reflect set proto`

4. Проверка только по секциям:

- `Global mask "native" + general WeakMap`
- `Unified global function-mask`
- `centralized native-shaped wrappers (Proxy/apply)`


### A. `Global mask "native" + general WeakMap`
- является ли это единым bridge-state, а не вторым policy-engine;
- не создаётся ли второй независимый toString-bridge;
- согласованы ли `overrideMap`, `proxyTargetMap`, `nativeToString`, `currentToString`, `oracleToString`;
- нет ли silent-swallow / fallback без явной классификации;
- нет ли недоказанного reuse parent/iframe-state.

### B. `Unified global function-mask`
- действительно ли `markAsNative` только регистрирует native-label/bridge metadata;
- не становится ли он источником “orig” или суррогатного native-path;
- не вносит ли он side effects в публичные дескрипторы/прототипы;
- не создаёт ли ложное ощущение “bridge already installed”.

### C. `centralized native-shaped wrappers (Proxy/apply)`
Проверить отдельно:
- `__wrapNativeApply`
- `__wrapNativeCtor`
- `__wrapNativeAccessor`
- `__wrapStrictAccessor`

Для каждого:
- сохраняется ли receiver/this-contract;
- не ломается ли brand-check;
- не создаётся ли incompatible proxy surface;
- не меняется ли prototype/descriptor behavior;
- не утекают ли служебные ошибки наружу;
- нет ли silent-swallow.

Правильная цепочка доказательства должна быть такой:

1. Внешний норматив.
Например: Web IDL требует brand/invocation semantics, ECMAScript задаёт descriptor/proxy invariants.

2. Vendor/runtime fact.
Например: в Chromium surface реально accessor на таком-то owner, bad receiver даёт такой-то native throw, return object имеет такой-то shape.

3. Наш implementation choice.
Например: из-за этого мы выбираем `descriptor_only`, `named_wrapper`, `core_wrapper` или не трогаем вовсе.


## Формат ответа
Строго в виде:
Diff + комментарии - какой класс решения допустим;



**Формулировка задачи**

Исходный лог 
Global mask "native" + general WeakMap —
 Unified global function-mask
 centralized native-shaped wrappers (Proxy/apply) ---
Необходимо, опираясь на ранее сформулированные выводы и **исключительно на нормативынм внешние источники и их фактическое описание поведения методов/объектов**, привести текущую реализацию к ожидаемому нативному поведению. Внутренние методологии, договорённости и ограничения системы на данном этапе **не принимаются во внимание**.

Работа выполняется **в обратном направлении**:
вместо подгонки внешней логики под текущую архитектуру нужно адаптировать существующую механику так, чтобы она соответствовала внешним требованиям.

**Область изменений**

Корректировка должна затрагивать **весь рабочий пайплайн**, включая:

* Proxy-механику,
* связанные механизмы применения (apply) и инициализации.

При этом:

1. Если в текущей механике **уже существует путь исполнения**, соответствующий ожидаемому поведению — он должен быть использован и встроен в pipeline.
2. Если такого пути **не существует**, он должен быть создан.
3. Если существующий путь применения (apply) противоречит требуемому поведению — допускается **его замена или перестройка**.

**Цель**

На выходе должны получиться корректно установленные контракты инваринтов:

* соответствующие поведению, описанному во внешних источниках,
* не вызывают ошибок ни во внутренней системе, ни во внешней среде.


\


Проверю именно блок core_window.js (line 67), разложу его по трём секциям и сопоставлю только с внешними источниками: ECMAScript, Web IDL, MDN/Chromium. Сначала сниму локальный контекст по коду, потом подниму нормативные источники и сведу это в Diff + комментарии без внутренних методологий.

Diff

core_window.js (line 73)
Сейчас nativeToString берётся по нескольким независимым путям: локальный Function.prototype.toString, shared-state из window.__CORE_TOSTRING_STATE__, parent-state, iframe-oracle.
Внешне доказуемая форма здесь только одна: один bridge-target на realm, без недоказанного reuse из parent/iframe, либо вообще без публичного патча Function.prototype.toString.
Комментарий: это не единый bridge-state, а dual-path/tri-path. ECMAScript определяет поведение Function.prototype.toString, но не даёт основания считать parent/iframe источник эквивалентным текущему realm. Для stealth это ещё и лишняя наблюдаемая механика. Основание: ECMAScript Function.prototype.toString, Proxy invariants, Web IDL не требуют таких обходных источников.
Источники: https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-function.prototype.tostring, https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
core_window.js (line 243)
Сейчас bridge-state публикуется наружу через window.__CORE_TOSTRING_STATE__, а фабрика маркировки через window.__ensureMarkAsNative.
Внешними источниками не доказана необходимость публичных служебных слотов на window; это отдельная наблюдаемая поверхность, не часть native behavior.
Комментарий: это не ломает ECMAScript напрямую, но противоречит stealth-минимизации. Для внешнего контракта допустимо только если недоступность/неотличимость доказана, а здесь прямой доступ есть.
core_window.js (line 212)
baseMarkAsNative не просто хранит metadata, а синтезирует публичный surrogate-label вида function X() { [native code] }.
Внешне допустим только metadata-bridge; суррогатный public output допустим лишь если доказано совпадение с engine output для всех классов callable.
Комментарий: по ECMAScript шаги для Function.prototype.toString различают source-text functions, built-ins и просто callable objects. Текущая строкогенерация этого не покрывает: не доказаны accessor names, bound/native names, symbol/computed names, async/generator/class forms, callable proxies. Значит markAsNative здесь уже второй policy-engine, а не нейтральный registry.
Источники: https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-function.prototype.tostring, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/toString
core_window.js (line 632)
Блок декларирует режим “keep existing Function.prototype.toString”, но при отсутствии shared-state фактически ставит публичный new Proxy(nativeToString, { apply }).
Допустимая внешне форма тут только одна из двух: либо вообще не патчить публичный Function.prototype.toString, либо патчить, но с полностью доказанным сохранением алгоритма ES и V8-observable behavior.
Комментарий: по текущему коду доказательства нет. Есть явное внутреннее противоречие между “keep native unchanged” и фактической установкой proxy. Descriptor flags здесь сохранены корректно, brand-check для non-function receiver тоже форвардится корректно через Reflect.apply, но точное поведение toString для всех callable не доказано.
Источники: https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-function.prototype.tostring, https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object.defineproperty, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Called_on_incompatible_type
core_window.js (line 340)
__wrapNativeApply и core_window.js (line 385) __wrapNativeCtor строят callable/constructable proxy и затем маскируют его через bridge/label maps.
Внешне допустимы только как оболочки, которые не меняют native receiver/construct semantics и не требуют отдельной публичной toString-магии для своей легитимации.
Комментарий: сами по себе эти фабрики частично соблюдают инварианты: нет трогания descriptor flags, __wrapNativeCtor честно форвардит Reflect.apply/Reflect.construct, constructibility наследуется от target. Но __wrapNativeApply не гарантирует brand/receiver contract сам по себе: это целиком переложено на applyImpl. Значит factory корректна только условно, не по факту блока.
core_window.js (line 435)
__wrapNativeAccessor как alias на __wrapNativeApply допустим только когда bad-receiver путь идёт через реальный native getter/setter.
Внешне это нормальная форма только для native-forward branch.
Комментарий: в orig-get path у __wrapStrictAccessor это соблюдено, потому что bad receiver уходит в Reflect.apply(origGet, thisArg, ...), что согласуется с Web IDL brand/invocation semantics.
core_window.js (line 499)
В synthetic path __wrapStrictAccessor при invalid this делает throw new TypeError().
Внешне ожидаемое поведение: bad receiver должен идти через native getter / native engine throw path, а не через синтетический пустой TypeError.
Комментарий: это самый жёсткий внешний mismatch в аудируемом блоке. Web IDL regular attribute getter при receiver, не реализующем интерфейс, должен дать TypeError; но здесь не сохранён vendor/runtime fact: теряется нативное сообщение, возможный stack-shape и engine-specific classification. Для V8-совместимости нужен native-forward, а не synthetic throw.
Источники: https://webidl.spec.whatwg.org/#es-attributes, https://webidl.spec.whatwg.org/#es-operations, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Called_on_incompatible_type
core_window.js (line 687)
В публичном toString apply есть fallback “залогировать и вернуть native”.
Silent-swallow здесь нет, но есть behavior-changing recovery path.
Комментарий: это не нарушает fail-fast как таковой, потому что диагностика есть. Но с внешней точки зрения такой fallback допустим только если доказано, что он возвращает ровно тот же результат, который дал бы движок без внутренней ошибки. Для map/bridge ошибок это не доказано глобально, лишь локально предполагается.
Комментарии
По текущему блоку допустимый класс решения для реализации в его нынешнем виде: D. Внутри одного участка одновременно существуют две несовместимые модели: “публичный Function.prototype.toString не трогаем” и “публичный Function.prototype.toString подменяем proxy-обёрткой”. Плюс есть параллельные механики overrideMap, proxyTargetMap, __coreBridgeTarget__, shared-state, parent-state и iframe-oracle.

Если смотреть не на текущий код, а на то, что вообще допустимо по внешним источникам, то верхняя граница допустимости здесь B: публичный Function.prototype.toString можно патчить только при полном доказательстве сохранения ES-алгоритма, brand behavior, descriptor shape, proxy invariants и Chromium-observable output. По этому блоку такого доказательства нет. Самый надёжный внешний путь здесь ближе к A/B-гибриду: не плодить вторичные toString-механики и не синтезировать bad-receiver errors вручную.

Жёсткий итог по секциям:

Global mask + WeakMap: не единый bridge-state, а противоречивый multi-source bridge.
Unified global function-mask: это уже не metadata-only, а источник суррогатного public output.
centralized wrappers: __wrapNativeCtor и native-forward ветки условно допустимы; synthetic ветка core_window.js (line 499) внешне недопустима.
Источники:

https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-function.prototype.tostring
https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object.defineproperty
https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-proxy-object-internal-methods-and-internal-slots-defineownproperty-p-desc
https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
https://webidl.spec.whatwg.org/#es-attributes
https://webidl.spec.whatwg.org/#es-operations
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/toString
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Called_on_incompatible_type


`core_window.js` только по секциям:

- `Global mask "native" + general WeakMap`
- `Unified global function-mask`
- `centralized native-shaped wrappers (Proxy/apply)`
 не толь 67 строка

**Diff + комментарии**

**1. `Global mask "native" + general WeakMap`**  
Точка входа секции: [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L68), [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L243)

- `Current`: `nativeToString` собирается из `window.__CORE_TOSTRING_STATE__`, затем из `parent.__CORE_TOSTRING_STATE__`, затем из iframe-oracle, затем из текущего realm.
- `Expected by external sources`: допустим только один доказанный realm-native bridge, либо отсутствие публичного bridge вообще.
- Комментарий: это не единый bridge-state, а несколько конкурирующих источников истины. Ни ECMAScript, ни Web IDL не дают основания считать parent-state или iframe `Function.prototype.toString` нормативным source-of-truth для текущего realm. Это уже отдельная stealth-механика, не вытекающая из внешнего контракта.

- `Current`: наружу публикуется `window.__CORE_TOSTRING_STATE__`.
- `Expected`: внешний контракт не требует публичного служебного state.
- Комментарий: это не прямое нарушение spec, но это лишняя наблюдаемая поверхность. Для stealth-минимизации такое допустимо только если доказано, что surface неотличим и не используется как второй policy-engine. Здесь это не доказано.

- `Current`: `overrideMap` и `proxyTargetMap` работают как самостоятельная глобальная toString-инфраструктура.
- `Expected`: допустим metadata-bridge, но не параллельная публичная модель поведения.
- Комментарий: фактически это уже отдельный interpreter для `Function.prototype.toString`, а не просто registry.

**Класс решения для секции:** `D`  
По текущей форме допустимость не доказана: секция содержит внутренне противоречивый multi-source bridge.

---

**2. `Unified global function-mask`**  
Точка входа секции: [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L211), [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L258)

- `Current`: `baseMarkAsNative` генерирует строку вида `function X() { [native code] }` и пишет её в `overrideMap`.
- `Expected by external sources`: допустимо только если доказано совпадение с engine output для всех callable-форм.
- Комментарий: этого доказательства нет. ES `Function.prototype.toString` различает builtin/native, source-text functions, accessor names, class/generator/async forms, callable proxies. Простая строкогенерация этого не покрывает. Значит `markAsNative` здесь не “только регистрация metadata”, а источник суррогатного public output.

- `Current`: `ensureMarkAsNative` публикуется как `window.__ensureMarkAsNative`.
- `Expected`: внешними источниками не требуется экспорт фабрики native-label.
- Комментарий: это усиливает зависимость других частей pipeline от локальной маскировочной инфраструктуры. То есть секция становится не bridge-helper, а центром альтернативного `toString`-policy.

- `Current`: `markAsNative` не меняет публичные дескрипторы напрямую.
- `Expected`: это хорошо, но недостаточно.
- Комментарий: side effects здесь в основном не дескрипторные, а semantic: подмена результата `Function.prototype.toString` через label-state.

**Класс решения для секции:** `D`  
В виде metadata-only секция была бы ближе к `B`; в текущем виде это уже второй policy-engine.

---

**3. `centralized native-shaped wrappers (Proxy/apply)`**  
Точка входа секции: [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L267), экспорт обёрток: [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L509)

**`__wrapNativeApply`**  
Точка: [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L340)

- `Current`: создаёт `Proxy(nativeFn, { apply })`, а затем маскирует его через bridge/label maps.
- `Expected`: допустимо только если receiver/brand contract сохраняется самим `applyImpl` и если proxy surface не требует отдельной `toString`-магии для легитимации.
- Комментарий: фабрика сама по себе не гарантирует brand behavior. Она делегирует это в `applyImpl`. Поэтому она условно допустима, но не доказана как безопасная форма “по умолчанию”.

**`__wrapNativeCtor`**  
Точка: [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L385)

- `Current`: использует `Reflect.apply` и `Reflect.construct`.
- `Expected`: это внешне корректный способ сохранять call/construct semantics.
- Комментарий: эта из четырёх секций выглядит наиболее близко к допустимой. Prototype/construct-path не переписывается вручную, а форвардится через native mechanisms. Но зависимость от `markAsNative` всё равно оставляет вторичный public toString-path.

**`__wrapNativeAccessor`**  
Точка: [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L435)

- `Current`: это thin-wrapper поверх `__wrapNativeApply`.
- `Expected`: допустимо только если invalid receiver уходит в реальный native getter/setter.
- Комментарий: сама по себе форма нормальная; корректность зависит не от неё, а от конкретной accessor-ветки выше.

**`__wrapStrictAccessor``origGet` branch**  
Точка: [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L447), [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L464)

- `Current`: если есть `origGet`, bad receiver форвардится через `Reflect.apply(target, thisArg, ...)`.
- `Expected`: это соответствует внешнему требованию сохранять native bad-receiver/brand path.
- Комментарий: эта ветка внешне допустима.

**`__wrapStrictAccessor` synthetic branch**  
Точка: [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L476), [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L499)

- `Current`: при invalid `this` делает `throw new TypeError()`.
- `Expected`: bad receiver должен идти через native bridge/engine throw, а не через synthetic `TypeError`.
- Комментарий: это самый жёсткий внешний mismatch во всём блоке. Web IDL требует TypeError-класс на invalid receiver, но vendor/runtime fact важен тоже: сообщение, stack-shape, engine path должны оставаться нативными. Здесь этого нет.

**Общий вывод по wrapper-секции:**  
- `__wrapNativeCtor`: ближе всего к `B`
- `__wrapNativeApply`: условно `B`, но только при доказанном `applyImpl`
- `__wrapNativeAccessor`: условно `B`
- `__wrapStrictAccessor`: `C`, потому что `origGet`-ветка допустима, synthetic-ветка нет

---

**Итоговый класс решения**
Для этих трёх секций вместе допустимый класс по текущему коду: `D`.

Причина:
- есть противоречие между идеей “не трогать публичный native toString” и фактической зависимостью всего wrapper-layer от surrogate toString-system;
- есть параллельные механики `overrideMap / proxyTargetMap / __coreBridgeTarget__ / shared-state / iframe-oracle`;
- synthetic invalid-this в [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js#L499) внешне не доказан и выглядит недопустимым.

Если отталкиваться только от внешних источников, допустимая форма здесь не “любой proxy-path”, а более узкая:
- один realm-consistent bridge или отсутствие публичного `Function.prototype.toString` patch;
- native-forward для brand/invocation semantics;
- отсутствие synthetic engine-errors там, где можно пройти через native receiver-path.

Источники:
- <https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-function.prototype.tostring>
- <https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object.defineproperty>
- <https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver>
- <https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-proxy-object-internal-methods-and-internal-slots-defineownproperty-p-desc>
- <https://webidl.spec.whatwg.org/#es-attributes>
- <https://webidl.spec.whatwg.org/#es-operations>
- <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/toString>
- <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Called_on_incompatible_type>


В этой задаче правок не было. Ты запросил аудит, и я дал только выводы по секциям. Код ни в [logreverse/core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js), ни в [sunami/core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js) в этом ходе не менялся.

Если хочешь, следующим сообщением я уже внесу именно минимальные правки. Но нужно одно уточнение: править в [sunami/core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js) или в [logreverse/core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js)?


В [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L80) внесены точечные правки по тем секциям, которые мы разбирали.

Что изменено:
- Убрал cross-realm sourcing для `Function.prototype.toString`: больше нет reuse из `parent.__CORE_TOSTRING_STATE__` и iframe-oracle. `nativeToString` теперь берётся только из текущего realm/shared local state. Это видно в [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L80) и [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L120).
- Убрал oracle-based rewrap check, который был завязан на iframe-path. Теперь блок установки `toString` не опирается на внешний iframe oracle: [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L510).
- В synthetic-ветке `__wrapStrictAccessor` bad receiver больше не делает synthetic `new TypeError()`, а форвардится в native bridge target через `Reflect.apply(...)`: [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L420).

Проверка:
- `node` parse для [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js) прошёл: `ok`.
- По grep больше нет `iframeOracleToString`/`parentState` в этом блоке.
- Браузерный runtime я не запускал, так что поведение в живом Chromium ещё не проверено.


мы же праиили hide_wevdirver... В этом репо, да? Верно? Потому что смотрю на файлы, они все созданы как бы разом при скачивании, и как будто бы он и не менялся, или что-то я это не понимаю,...



Да, но не сам [hide_webdriver.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/patches/stealth/hide_webdriver.js).

Что реально было тогда:
- В `logreverse` правился [core_window.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/core/core_window.js), чтобы `hide_webdriver.js` смог пройти свой путь с `wrapLayer: 'strict_accessor_gateway'`.
- Ещё правились [validate_proxy_mechanics_registry.ps1](/c:/55555/switch/Evensteam/logreverse/tools/tools_native_check/validate_proxy_mechanics_registry.ps1) и [PROXY_MECHANICS_REGISTRY.md](/c:/55555/switch/Evensteam/logreverse/tools/tools_native_check/PROXY_MECHANICS_REGISTRY.md).

Сам [hide_webdriver.js](/c:/55555/switch/Evensteam/logreverse/assets/scripts/window/patches/stealth/hide_webdriver.js) я не менял, поэтому по дате/виду он может выглядеть как “не тронутый”. Проблема была не в модуле, а в том, что его target-path не принимал Core.

Если хочешь, я могу сразу показать точные строки в `logreverse/core_window.js`, которые тогда были добавлены под `hide_webdriver`.

тоест ь учитывач что я перетащил тот файл сюда, то о долден вкобчать все измененич?


Да. Если ты перетащил тот уже исправленный [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js) из `logreverse`, то в нём должны были уже приехать именно те изменения, которые делали `webdriver`-path рабочим.

Но есть важная оговорка: после этого я уже отдельно правил этот же файл в `sunami` по другой задаче, не по `hide_webdriver`:
- убрал cross-realm/iframe sourcing для `Function.prototype.toString`
- поправил synthetic bad-receiver path в `__wrapStrictAccessor`

То есть сейчас в [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js) должны быть:
- и прежние изменения под `hide_webdriver` из `logreverse`
- и новые локальные правки по `toString`/strict accessor, которые я только что внёс в `sunami`

Если хочешь, я могу прямо сейчас быстро проверить в этом `sunami/core_window.js`, что там всё ещё есть поддержка `strict_accessor_gateway`/`object_return_gateway`, то есть что webdriver-фикс действительно не потерялся.


Ошибок никаких нету. Всё хорошо, мы с тобой молодцы,починили, hide_webdriver? только вот "Function.toString" с этим не согласна почему-то очень сильно.  И я когда тебя спрашивал про анализ, вот я об этом и спрашивал, что почему вот некоторые, видишь, там вот GPUagapter,  еще что-то, они вот чувствитеьно очень вот к этому относятся. 
Установить, Почему оно вот так происходит? По какой причине? И эта причина лежит там где-то в файле `core_window.js`:

- нет ли противоречия между policy “keep native `Function.prototype.toString` unchanged” и фактической установкой `new Proxy(nativeToString, { apply })`;
- не создаются ли параллельные/вторичные toString-механики;
- не расходятся ли bridge-state, label-state и публичная поверхность.
- brand behavior для non-function receiver у `Function.prototype.toString`;
- native-forward через `Reflect.apply`;
- descriptor flags и descriptor-shape;
- prototype/function/proxy invariants;
- отсутствие `Illegal invocation` из-за потери receiver;
- отсутствие симптомов класса:
  - `failed descriptor`
  - `failed own property`
  - `failed descriptor keys`
  - `failed prototype in function`
  - `failed class extends`
  - `failed incompatible proxy error`
  - `failed at reflect set proto`





Проведи аудит `sunami\assets\scripts\window\core\core_window.js`:

- `Global mask "native" + general WeakMap`
- `Unified global function-mask`
- `centralized native-shaped wrappers (Proxy/apply)`

Цель: определить,  опираясь на  **нормативынм внешние источники и их фактическое описание поведения методов/объектов**,  **какая форма реализации  допустима** с точки зрения ожидаемого нативного поведения движка для `Function.prototype.toString`, Proxy/descriptor-инвариантов, receiver/this-contract и stealth-минимизации заметности среды.
Внутренние методологии,  и ограничения системы на данном этапе **не принимаются во внимание**.

Работа выполняется **в обратном направлении**:
вместо подгонки внешней логики под текущую архитектуру нужно адаптировать существующую механику так, чтобы она соответствовала внешним требованиям.

## Источники
- ECMAScript spec: инварианты `Proxy`, `[[Get]]`, `[[DefineOwnProperty]]`, `Function.prototype.toString`, descriptor semantics.
  Источник: `tc39.es/ecma262`
- Web IDL: brand checks, platform objects, interface members, invocation semantics, `Illegal invocation`-класс проблем.
  Источник: `webidl.spec.whatwg.org`
- WHATWG/W3C/API specs: конкретный контракт surface.
  Примеры: Permissions, Storage, WebGPU, Web Audio.
- MDN: не нормативный первоисточник, а практический справочник/индексатор поверх спецификаций и поведения браузеров.
- Chromium/Blink docs + реальное поведение Chromium: когда спецификация не даёт достаточно для shape/details/runtime behavior.

## Что требуется установить
Необходимо,привести текущую реализацию к ожидаемому нативному поведению.


1. Проверь внутреннюю согласованность:
- нет ли противоречия между policy “keep native `Function.prototype.toString` unchanged” и фактической установкой `new Proxy(nativeToString, { apply })`;
- не создаются ли параллельные/вторичные toString-механики;
- не расходятся ли bridge-state, label-state и публичная поверхность.

2. Проверь жёсткие инварианты:
- brand behavior для non-function receiver у `Function.prototype.toString`;
- native-forward через `Reflect.apply`;
- descriptor flags и descriptor-shape;
- prototype/function/proxy invariants;
- отсутствие `Illegal invocation` из-за потери receiver;
- отсутствие симптомов класса:
  - `failed descriptor`
  - `failed own property`
  - `failed descriptor keys`
  - `failed prototype in function`
  - `failed class extends`
  - `failed incompatible proxy error`
  - `failed at reflect set proto`

3. Определи решения:
- A. публичный `Function.prototype.toString` не должен патчиться вообще;
- B. публичный `Function.prototype.toString` может патчиться, но только если по коду доказано сохранение всех инвариантов;
- C. допустимы оба варианта, но для разных методов/объектов;
- D. по текущему коду допустимая форма не доказана, есть внутренне противоречивый dual-path.

### A. `Global mask "native" + general WeakMap`
- является ли это единым bridge-state, а не вторым policy-engine;
- не создаётся ли второй независимый toString-bridge;
- согласованы ли `overrideMap`, `proxyTargetMap`, `nativeToString`, `currentToString`, `oracleToString`;
- нет ли silent-swallow / fallback без явной классификации;
- нет ли недоказанного reuse parent/iframe-state.

### B. `Unified global function-mask`
- действительно ли `markAsNative` только регистрирует native-label/bridge metadata;
- не становится ли он источником “orig” или суррогатного native-path;
- не вносит ли он side effects в публичные дескрипторы/прототипы;
- не создаёт ли ложное ощущение “bridge already installed”.

### C. `centralized native-shaped wrappers (Proxy/apply)`
Проверить отдельно:
- `__wrapNativeApply`
- `__wrapNativeCtor`
- `__wrapNativeAccessor`
- `__wrapStrictAccessor`

Для каждого:
- сохраняется ли receiver/this-contract;
- не ломается ли brand-check;
- не создаётся ли incompatible proxy surface;
- не меняется ли prototype/descriptor behavior;
- не утекают ли служебные ошибки наружу;
- нет ли silent-swallow.

Правильная цепочка доказательства должна быть такой:

1. Внешний норматив.
Например: Web IDL требует brand/invocation semantics, ECMAScript задаёт descriptor/proxy invariants.

2. Vendor/runtime fact.
Например: в Chromium surface реально accessor на таком-то owner, bad receiver даёт такой-то native throw, return object имеет такой-то shape.

3. Наш implementation choice.
Например: из-за этого мы выбираем `descriptor_only`, `named_wrapper`, `core_wrapper` или не трогаем вовсе.


## Формат ответа
Подготовить отчет и план правок




**Формулировка задачи**

Исходный лог 
Global mask "native" + general WeakMap —
 Unified global function-mask
 centralized native-shaped wrappers (Proxy/apply) ---
Необходимо, опираясь на ранее сформулированные выводы и **исключительно на нормативынм внешние источники и их фактическое описание поведения методов/объектов**, привести текущую реализацию к ожидаемому нативному поведению. Внутренние методологии, договорённости и ограничения системы на данном этапе **не принимаются во внимание**.

Работа выполняется **в обратном направлении**:
вместо подгонки внешней логики под текущую архитектуру нужно адаптировать существующую механику так, чтобы она соответствовала внешним требованиям.

**Область изменений**

Корректировка должна затрагивать **весь рабочий пайплайн**, включая:

* Proxy-механику,
* связанные механизмы применения (apply) и инициализации.

При этом:

1. Если в текущей механике **уже существует путь исполнения**, соответствующий ожидаемому поведению — он должен быть использован и встроен в pipeline.
2. Если такого пути **не существует**, он должен быть создан.
3. Если существующий путь применения (apply) противоречит требуемому поведению — допускается **его замена или перестройка**.

**Цель**

На выходе должны получиться корректно установленные контракты инваринтов:

* соответствующие поведению, описанному во внешних источниках,
* не вызывают ошибок ни во внутренней системе, ни во внешней среде.

**Отчёт**

1. Главная причина чувствительности `GPUAdapter` и похожих surface не в `hide_webdriver`, а в том, что `core_window` делает публичный `Function.prototype.toString` зависимым от внутреннего `overrideMap/proxyTargetMap` bridge. Это видно в [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L132), [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L494), а `webgpu.js` в это время патчит `GPUAdapter` accessors/methods через `core_wrapper` и strict receiver-path в [webgpu.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/patches/graphics/webgpu.js#L856) и [webgpu.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/patches/graphics/webgpu.js#L989). В результате любые `GPUAdapter.info/features/limits/requestAdapter` становятся завязаны не только на Web IDL contract, но и на внутреннюю `toString`-маскировку.

2. Внутреннее противоречие есть. Блок пишет “keep existing `Function.prototype.toString`”, но при отсутствии shared-state всё равно ставит `new Proxy(nativeToString, { apply })` в [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L484) и [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L494). То есть policy “native unchanged” и фактическая реализация расходятся. Это уже не `A`, и для `B` доказательства недостаточно.

3. `Global mask "native" + general WeakMap` не является чистым bridge-state. `toStringOverrideMap` и `toStringProxyTargetMap` в [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L83) и [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L86) формируют второй policy-engine поверх нативного `toString`. После моих предыдущих правок parent/iframe reuse убран, и это хорошо, но вторичный bridge всё равно остался.

4. `Unified global function-mask` не ограничивается metadata. `baseMarkAsNative` в [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L133) синтезирует surrogate native string. По внешним источникам это допустимо только если доказано совпадение с engine output для всех callable-форм. Здесь это не доказано для proxy-wrapped functions, synthetic getters, Web IDL accessors, bound/generator/async/class-like форм. Поэтому `markAsNative` сейчас не “маркирует”, а реально влияет на публичную поверхность.

5. По жёстким инвариантам ситуация смешанная.
- Brand для non-function receiver у публичного `Function.prototype.toString` форвардится корректно через `Reflect.apply` в [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L497).
- Descriptor flags `Function.prototype.toString` сохраняются и перепроверяются в [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L576) и [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L591).
- `Reflect.setPrototypeOf(toString, currentProto)` проверяется в [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L618), то есть один риск-класс контролируется.
- Но prototype/function/proxy invariants в целом не доказаны, потому что публичная функция остаётся `Proxy`, а не native builtin object.

6. `centralized native-shaped wrappers` допустимы неравномерно.
- `__wrapNativeCtor` в [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L306) наиболее корректен: `Reflect.apply` и `Reflect.construct` сохраняют call/construct semantics.
- `__wrapNativeApply` в [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L261) безопасен только условно: brand/receiver contract тут не гарантирован фабрикой, а полностью переложен на `applyImpl`.
- `__wrapNativeAccessor` в [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L356) допустим только когда invalid receiver уходит в реальный native getter/setter.
- `__wrapStrictAccessor` в [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L368) стал лучше после правки: synthetic bad-receiver теперь идёт через `Reflect.apply(syntheticBridgeTarget, ...)` в [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L420). Но сама ветка всё ещё строит synthetic getter и потом маскирует его через общий `toString` bridge, то есть полностью нативной она не становится.

7. Почему особенно чувствителен `GPUAdapter`. WebGPU surfaces в [webgpu.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/patches/graphics/webgpu.js#L856) и [webgpu.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/patches/graphics/webgpu.js#L989) это Web IDL platform object accessors/methods. У них очень жёсткие ожидания: owner на prototype, implementation-check, native bad-receiver, builtin/native `toString` shape. Как только поверх них ставится proxy-wrapper, любая проверка `Function.prototype.toString`, `Object.getOwnPropertyDescriptor`, prototype/construct/proxy probes становится намного чувствительнее. Именно поэтому такие surface ломаются раньше “обычных” JS-методов.

8. `2stu.json` подтверждает именно этот класс проблемы, но это старый лог. В нём есть старый `hide_webdriver:wrap_layer_unsupported` в [2stu.json](/c:/55555/switch/Evensteam/bin/2stu.json#L67), и он уже неактуален. Актуальная часть для текущего вопроса это V8-style `Function.prototype.toString requires that 'this' be a Function` и proxy-related console errors в [2stu.json](/c:/55555/switch/Evensteam/bin/2stu.json#L954) и [2stu.json](/c:/55555/switch/Evensteam/bin/2stu.json#L855). То есть `webdriver` не источник, а `toString/proxy` bucket.

**Решение**
Для текущего кода класс решения: `D`.

Причина простая:
- публичный `Function.prototype.toString` уже патчится;
- `markAsNative` уже источник surrogate public output;
- `bridge-state`, `label-state` и публичная поверхность не совпадают;
- часть инвариантов сохранена, но полное сохранение observable behavior для `B` не доказано.

Теоретически допустимый целевой класс с точки зрения внешних источников:
- либо `A`: публичный `Function.prototype.toString` не патчить вообще;
- либо очень жёсткий `B`, но только если удаётся доказать полное совпадение с native behavior для всех wrapper surfaces.
По текущей механике ближе и реалистичнее `A`, чем `B`.

**План правок**
1. Убрать публичную подмену `Function.prototype.toString` из [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L494) и оставить нативный realm `toString` неизменённым.
2. Деградировать `overrideMap/proxyTargetMap` до internal metadata only: они не должны определять публичный результат `Function.prototype.toString`.
3. Оставить `__wrapNativeCtor` как допустимый путь для construct/call surfaces, а `__wrapNativeApply` и `__wrapNativeAccessor` использовать только там, где есть доказанный native-forward receiver-path.
4. Для Web IDL surfaces типа `GPUAdapter` минимизировать proxy-observable path: сначала опираться на `origGet`/`orig` и native-forward, synthetic getter-path использовать только как крайний случай и только с native bridge target.
5. После этого отдельно прогнать именно proxy/toString bucket на тех surfaces, которые сейчас чувствительны: `GPUAdapter.info`, `GPUAdapter.features`, `GPUAdapter.limits`, `navigator.gpu.requestAdapter`.

Источники:
- ECMAScript `Function.prototype.toString`: <https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-function.prototype.tostring>
- ECMAScript Proxy `[[Get]]`: <https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver>
- ECMAScript Proxy `[[DefineOwnProperty]]`: <https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-proxy-object-internal-methods-and-internal-slots-defineownproperty-p-desc>
- Web IDL attributes: <https://webidl.spec.whatwg.org/#es-attributes>
- Web IDL operations: <https://webidl.spec.whatwg.org/#es-operations>
- MDN `Function.prototype.toString`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/toString>
- MDN incompatible receiver errors: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Called_on_incompatible_type>
- MDN `GPUAdapter`: <https://developer.mozilla.org/en-US/docs/Web/API/GPUAdapter>
- MDN `GPU.requestAdapter()`: <https://developer.mozilla.org/en-US/docs/Web/API/GPU/requestAdapter>

Если продолжать, следующий практический шаг один: я могу уже не анализировать, а внести первую реальную правку по этому плану в `sunami/core_window.js` и начать с удаления публичного proxy-install для `Function.prototype.toString`.


Убрать публичную подмену Function.prototype.toString из core_window.js (line 494) и оставить нативный realm toString неизменённым.
Деградировать overrideMap/proxyTargetMap до internal metadata only: они не должны определять публичный результат Function.prototype.toString.
Оставить __wrapNativeCtor как допустимый путь для construct/call surfaces, а __wrapNativeApply и __wrapNativeAccessor использовать только там, где есть доказанный native-forward receiver-path.
Для Web IDL surfaces типа GPUAdapter минимизировать proxy-observable path: сначала опираться на origGet/orig и native-forward, synthetic getter-path использовать только как крайний случай и только с native bridge targe


Сейчас меняю именно механику toString и wrapper-path в core_window.js, а не hide_webdriver. Сначала дособеру, где __wrapNativeApply/__wrapNativeAccessor реально используются в sunami, чтобы не сломать те места, где нет native-forward path, и потом внесу точечные правки в core_window.js и при необходимости в webgpu.js.

Картина по зависимостям понятна: __wrapNativeApply/__wrapNativeAccessor используются не только в webgpu, а в общем Core-path для core_wrapper, плюс отдельно в RTC/AudioContext/context. Поэтому я не буду просто “вырубать” эти фабрики. Правка пойдёт уже в логику применения: публичный toString убираем, metadata оставляем внутренней, а core_wrapper для Web IDL surface сузим до native-forward path, чтобы не плодить proxy-observable поведение там, где есть origGet/orig.

Упрямое место уже видно в самом Core: brand_strict и часть invoke/accessor путей сейчас жёстко тянут core_wrapper, а core_wrapper внутри почти всегда приводит к proxy-observable wrapper. Поэтому правка не сведётся к “выключить один Proxy”: нужно ещё ослабить связку brand_strict => core_wrapper там, где native-forward уже реализуем через named/synthetic wrapper без публичного toString моста.

План уже точный: в core_window.js убираю сам публичный Function.prototype.toString proxy-install и связанные probe/bridge-checks, а в webgpu.js переведу GPUAdapter accessors и requestAdapter на named/native-forward path без core_wrapper. Для этого ещё нужна маленькая правка в Core: brand_strict должен уметь брать invalidThis: 'native', а не жёстко синтезировать throw.

Вношу сами правки. Они будут в двух местах: core_window.js и webgpu.js. Смысл изменений узкий: Function.prototype.toString остаётся нативным, а GPUAdapter/requestAdapter уходят с core_wrapper на named/native-forward путь.

Правки на месте. Сейчас прогоню быстрые структурные проверки: синтаксис обоих файлов и ключевые признаки, что Function.prototype.toString больше не переписывается, а webgpu реально ушёл с core_wrapper на named/native-forward path.

В [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L431) я убрал публичную подмену `Function.prototype.toString`: больше нет `new Proxy(nativeToString, { apply })`, установки через `Object.defineProperty(Function.prototype, 'toString', ...)` и связанных install/rollback/probe веток. `overrideMap/proxyTargetMap` остались только как внутренняя metadata для bridge/wrapper bookkeeping и больше не определяют публичный результат `Function.prototype.toString`.

Дальше я сузил receiver-path в Core: для `method` и `promise_method` теперь уважается явно заданный `invalidThis`, даже при `brand_strict`, в [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L1477) и [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js#L1603). И перевёл `GPUAdapter`/`navigator.gpu.requestAdapter` с proxy-observable `core_wrapper` на named/native-forward path в [webgpu.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/patches/graphics/webgpu.js#L857), [webgpu.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/patches/graphics/webgpu.js#L884), [webgpu.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/patches/graphics/webgpu.js#L916), [webgpu.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/patches/graphics/webgpu.js#L989): accessors теперь `named_wrapper_strict + policy: 'strict' + invalidThis: 'native'`, а `requestAdapter` идёт через `named_wrapper` с `allowNamedWrapperBrandStrict: true` и `invalidThis: 'native'`.

Проверка:
- оба файла парсятся через `node`: `ok`
- в [core_window.js](/c:/55555/switch/Evensteam/sunami/assets/scripts/window/core/core_window.js) больше нет публичной установки `Function.prototype.toString`
- `webgpu.js` показывает новый named/native-forward path для `GPUAdapter`

Браузерный прогон я не делал, поэтому реальный effect на `2stu.json`/CreepJS ещё не подтверждён. Следующий практический шаг уже один: прогнать тот же сценарий и посмотреть, ушёл ли именно `Function.toString`-bucket на `GPUAdapter`.



Так, опять какая-то выходит нескладуха,,  опять черный ящик, н епонятно, чему подчиняющийся,  поэтому это репо пока оставим как контрольную точку и пойдем сюда

\nav_butify

а теперь следи за руками.
Определённо и без любых степеней предположения. Это абсолютно железные факты .Данная конфигурация выдаёт мне...75 protope ошибок, ищ них 36 - это 9х4 равно 36 ошибки 4 методо в workerscope итогоп имеем 39 что буквально совпадает с 197 API properties analyzed in 51.7ms (39 corrupted) тоесть по 1 ошибке на апи, упашвих апи нет. Это так?

По одной арифметике: да, `75 - 36 = 39`, и это численно совпадает с `39 corrupted`.

Но как железный факт вывод `по 1 ошибке на API` из этого пока не следует. Для этого должны быть одновременно доказаны две вещи:
- эти `36` действительно ровно `9 API x 4 worker-scope`,
- оставшиеся `39` относятся к `39` разным API, без дублей по одному и тому же API.

Тогда да, формула будет такая:
- `75 total prototype errors`
- `36 worker-derived duplicates`
- `39 unique corrupted API`
- `0 fully dropped API`, если в отчёте действительно сказано `197 analyzed` и не сказано `missing/skipped/dropped`

Сейчас проблема в другом: в `nav_butify` я не нашёл сам артефакт с фразой `197 API properties analyzed in 51.7ms (39 corrupted)`, то есть по репо это пока не подтверждено документально. Поэтому точный ответ такой:

- как арифметическая гипотеза: `да`
- как уже доказанный факт по текущим найденным файлам: `пока нет, не доказано`

Если хочешь, следующий шаг простой: ты показываешь сам конкретный вывод/лог с `75` и `197 ... (39 corrupted)`, и я сразу раскладываю его без предположений в таблицу:
`total errors -> worker duplicates -> unique APIs -> dropped APIs / not dropped APIs`.


Да, по этому логу уже можно зафиксировать несколько жёстких фактов.

В [my_debug_log_2026-03-15T093437.168.json](/c:/Users/upolz/Downloads/my_debug_log_2026-03-15T093437.168.json#L2329) стоит `totalLies: 75`. В [my_debug_log_2026-03-15T093437.168.json](/c:/Users/upolz/Downloads/my_debug_log_2026-03-15T093437.168.json#L2501) видно, что `workerScope.lied = 4`, и под `workerScope.lies.proto` ровно 4 API:
`WorkerNavigator.deviceMemory`, `WorkerNavigator.hardwareConcurrency`, `WorkerNavigator.language`, `WorkerNavigator.languages`. У каждого из них по 9 proto-меток, значит worker-блок действительно даёт `4 x 9 = 36`.

Дальше арифметика совпадает точно:
- `75 totalLies - 36 worker proto lies = 39`
- и это численно равно строке [my_debug_log_2026-03-15T093437.168.json](/c:/Users/upolz/Downloads/my_debug_log_2026-03-15T093437.168.json#L3022): `197 API properties analyzed in 51.7ms (39 corrupted)`

Но две оговорки важны:
- из файла доказано `75 totalLies`, а не буквально `75 prototype errors`
- из одного этого совпадения ещё не следует как железный факт, что это именно `1 ошибка на 1 API`; для этого надо отдельно проверить, что оставшиеся 39 относятся к 39 разным API, без дублей

То есть итог сейчас такой:
- `36 worker proto lies` — доказано
- `39 remaining` — доказано
- совпадение с `39 corrupted` — доказано
- `no dropped APIs` — пока не доказано напрямую
- `ровно 1 corrupted entry на API` — пока не доказано напрямую

Если хочешь, следующим ходом я вытащу из этого же лога список всех 39 corrupted API и тогда уже скажу без допущений: уникальные они или нет.

Конкрктно в этой среде это не носит нименования "ошибка",  у него уже есть, я сделал прототипс, есть, тест такой у него есть. Там у него немного другой набор, но по существу это то же самое. Я поэтому так назвал ошибки прототипов. У него они тут называется lies,  они здесь у него не называются именно "ошибками". Здесь вот конкретно в этой среде, но практически это ошибка контракта. Правильно понимаю? Просто тут нужно понимать, как бы, с какого угла зрения ты смотришь на это дело. Смотришь с точки зрения анализатора или с точки зрения документации и спецификации смотришь? тут на под ошибкой понимается  исключение Exception, а я под ошибкой полнимаю Exception + ошибки инварантов, тут оги идут по категрии lie, но существа вопороса это не меняяет. согласен?


Да, согласен.

Здесь просто два разных языка описания одного класса проблем:

- с точки зрения анализатора CreepJS это `lies`
- с точки зрения контрактов/спеков это `contract violations` / `invariant violations`
- с точки зрения runtime это уже отдельный подкласс: `exceptions`, `throws`, `illegal invocation` и т.д.

То есть твоя формулировка корректна:
в этой среде `lie` не обязательно означает `Exception`, но по существу это всё равно ошибка контракта, потому что surface ведёт себя не так, как ожидается по descriptor/prototype/toString/brand/invocation semantics.

Именно поэтому полезно разделять:
- `runtime error`: был `throw` / `TypeError` / `Illegal invocation`
- `contract error`: `failed descriptor`, `failed own property`, `failed prototype in function`, `failed toString`
- `analyzer label`: всё это у него сворачивается в `lies`

Так что да: если ты говоришь “ошибки прототипов” как про нарушения инвариантов, а не только про `Exception`, это нормальная и по сути точная постановка.

То есть итого мы сейчас стоим на точке, когда у меня значит есть по одной ошибке на API и сломанных, которые не включились вообще. То есть получили как раз такие эксепшен. Таких API у меня нет. Согласен? Ну, в том случае с тем, что мне дает анализатор. Я же дальше не лезу туда. Он прогнал меня, нашел у меня 197API и вот такой у меня выдал результат. Согласны все, да?


Да, если держаться строго рамки того, что сообщил анализатор, то текущая формулировка такая:

- проанализировано `197 API properties`
- из них `39 corrupted`
- API, которые “не включились вообще” и выпали из анализа, в этом отчёте не видно
- значит на уровне отчёта анализатора у тебя сейчас `39 проблемных API`, а не набор `missing/dropped API`

Но я бы одну фразу уточнил:
не `по одной ошибке на API`, а `по одному corrupted API-entry на API` в итоговой сводке анализатора. Потому что внутри одного API у него может быть несколько `lies` сразу. Это уже видно на `workerScope`: один API там несёт сразу 9 lie-меток.

То есть итоговая корректная формула:
- с точки зрения анализатора: `197 analyzed`, `39 corrupted`, `0 явно выпавших API`
- с точки зрения контрактов: это `39 API с нарушением контракта`
- не обязательно `39 одиночных низкоуровневых ошибок`, а именно `39 corrupted surfaces`

И в этом смысле да, на текущей точке мы с тобой согласны.


Почти, но с одной важной поправкой.

По [1503.json](/c:/55555/switch/Evensteam/bin/1503.json) картина жёстко такая:
- всего `43` API-entry
- суммарно `75` lie-меток
- `4` worker API
- у них суммарно `36` lie-меток
- значит у каждого worker API не по `4`, а по `9` lie-меток
- остальные `39` API имеют суммарно `39` lie-меток, то есть там действительно `по одной` на API

Это подтверждается счётом:
- `distribution: 1 => 39`
- `distribution: 9 => 4`

И по самим ключам видно:
- `WorkerGlobalScope.WorkerNavigator.deviceMemory` → `9`
- `WorkerGlobalScope.WorkerNavigator.hardwareConcurrency` → `9`
- `WorkerGlobalScope.WorkerNavigator.language` → `9`
- `WorkerGlobalScope.WorkerNavigator.languages` → `9`

Итог:
- да, твой общий вывод подтверждается
- но точная формула такая: `4 worker API x 9 lies = 36`, а не `по 4 ошибки на API`
- все остальные `39` API действительно идут `по одной lie-метке на API`

То есть в этой выборке структура ровно такая:
- `4` тяжело сломанных worker API
- `39` остальных corrupted API с одиночным нарушением
- всего `43` corrupted API-entry и `75` lie-меток

Да. Тогда формулировка корректная:

- `4` worker API по `9` lie-меток = `36`
- остальные `39` API по `1` lie-метке = `39`
- всего `43` corrupted API-entry и `75` lies

Это полностью подтверждается [1503.json](/c:/55555/switch/Evensteam/bin/1503.json).

по 9 оштибок на 4 апи, тоесть,  4 апи по  9 ошбок это как-то  очень похоже на формулировки чеширского кота
Да, звучит криво. Нормально это формулируется так:

- `4 worker API`, и у каждого по `9` нарушений контракта
- или: `на 4 worker API приходится 36 lie-меток`
- или совсем коротко: `worker-блок = 4 surfaces x 9 violations`

То есть не “4 API по 9 ошибок” как скороговорка, а:
`четыре API, каждый с девятью нарушениями`.

Если хочешь, я могу сразу привести всю итоговую сводку по этому логу в одном аккуратном абзаце, без таких двусмысленных формулировок.

Просто важно иметь чёткое, ясное понимание без утверждениций и длпущегиц которые мы не можем подтвердить.  Никак вообще. И без установления того, что эти вещи действительно являются верными и неоспоримыми никем. Имеется в виду в моменте эти утверждения, да? То есть они как бы принимаются нами и подтверждаются какими-то внешним независимыми от нас данными. То есть не то, что мы посчитали и договорились, но чтобы «третья, есть какая-то сторона, от  нас независимая, и она с нашими данными соглашается». Пока что так и есть. подтвердаешь?

Да, подтверждаю, но с важной границей.

В моменте у нас есть не “мы так решили”, а независимый внешний артефакт анализа:
- [1503.json](/c:/55555/switch/Evensteam/bin/1503.json)
- [my_debug_log_2026-03-15T093437.168.json](/c:/Users/upolz/Downloads/my_debug_log_2026-03-15T093437.168.json)

Именно они сейчас подтверждают факты:
- `43` corrupted API-entry
- из них `4` worker API с `9` lie-метками каждый
- остальные `39` API с `1` lie-меткой каждый
- всего `75` lies

То есть да: на текущем шаге у нас есть внешнее, независимое от наших рассуждений подтверждение именно этих чисел и этой раскладки.

Но граница такая:
- это подтверждено `анализатором`
- это не то же самое, что уже подтверждено `спецификацией` или `Chromium docs`

Иными словами:
- как факт о текущем состоянии среды по внешнему логу: `да, подтверждено`
- как факт о причине и нормативной интерпретации: `ещё нет, это следующий слой анализа`

В этих пределах твоя постановка сейчас точная.
Хирургический патч hide_webdriver.js ( Ниже — точечная замена двух участков: установка Function.prototype.toString перепрошивка Object.getOwnPropertyDescriptor / Reflect.has / Object.hasOwn 4.1. Заменить блок установки Function.prototype.toString Было (Proxy) — см. текущий файл hide_webdriver Станет (без Proxy, с корректной обработкой примитивов): // Single wrapper for Function.prototype.toString, reading from the general WeakMap if (!window.__TOSTRING_PROXY_INSTALLED__) { function toString() { // IMPORTANT: do not touch WeakMap for primitives/null/undefined const t = typeof this; const isObj = (this !== null) && (t === 'function' || t === 'object'); if (isObj && toStringOverrideMap.has(this)) { return toStringOverrideMap.get(this); } // preserve native TypeError + semantics return nativeToString.call(this); } // make wrapper look native via the same mechanism markAsNative(toString, 'toString'); Object.defineProperty(Function.prototype, 'toString', { value: toString, writable: true, configurable: true, enumerable: false }); window.__TOSTRING_PROXY_INSTALLED__ = true; } Это напрямую чинит “failed object toString error” и сильно снижает вероятность “reflect set proto / recursion”. 4.2. Заменить Proxy-перепрошивку built-in’ов на узкие врапперы (и “нативить” их) Сейчас Proxy на Object.getOwnPropertyDescriptor, Reflect.has, Object.hasOwn hide_webdriver . Предлагаю заменить на врапперы (без Proxy), чтобы: минимизировать footprint, не ломать инварианты Proxy, маскировать через markAsNative. // Object.getOwnPropertyDescriptor (narrow wrapper) Object.getOwnPropertyDescriptor = (function(nativeGOPD){ function getOwnPropertyDescriptor(obj, prop) { if (obj === navigator && prop === 'webdriver') return undefined; return nativeGOPD(obj, prop); } markAsNative(getOwnPropertyDescriptor, 'getOwnPropertyDescriptor'); return getOwnPropertyDescriptor; })(nativeGetOwnProp); // Reflect.has (narrow wrapper) Reflect.has = (function(nativeHas){ function has(target, prop) { if (target === navigator && prop === 'webdriver') return false; return nativeHas(target, prop); } markAsNative(has, 'has'); return has; })(Reflect.has); // Object.hasOwn (narrow wrapper) const realHasOwn = Object.hasOwn; Object.hasOwn = (function(nativeHasOwn){ function hasOwn(obj, prop) { if (obj === navigator && prop === 'webdriver') return false; return nativeHasOwn(obj, prop); } markAsNative(hasOwn, 'hasOwn'); return hasOwn; })(realHasOwn); Почему это “целесообразно”, убираем Proxy-аномалии (частая причина “reflect set proto” и тестов на “proxy-детект”), оставляем только точечный эффект под webdriver, функции можно маскировать тем же markAsNative, т.е. они красиво вписываются в общую механику nav_total_set nav_total_set . Рекомендованные минимальные правки (3 строки + 1 условие) Вставь/замени ровно это: safeDefine: if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return; Object.getOwnPropertyDescriptor wrapper: if ((obj === navigator || obj === Navigator.prototype) && prop === 'webdriver') return undefined; И всё. Это даст: реальное выставление Navigator.prototype.webdriver, отсутствие “failed object toString error”, меньше шансов рекурсий/аномалий, чем у Proxy-версий, и логическую согласованность с nav_total_set.js.
1 task in progress


Хирургический патч hide_webdriver.js (
Ниже — точечная замена двух участков:
установка Function.prototype.toString
перепрошивка Object.getOwnPropertyDescriptor / Reflect.has / Object.hasOwn
4.1. Заменить блок установки Function.prototype.toString
Было (Proxy) — см. текущий файл
hide_webdriver

Станет (без Proxy, с корректной обработкой примитивов):
 // Single wrapper for Function.prototype.toString, reading from the general WeakMap
  if (!window.__TOSTRING_PROXY_INSTALLED__) {
    function toString() {
      // IMPORTANT: do not touch WeakMap for primitives/null/undefined
      const t = typeof this;
      const isObj = (this !== null) && (t === 'function' || t === 'object');

      if (isObj && toStringOverrideMap.has(this)) {
        return toStringOverrideMap.get(this);
      }
      // preserve native TypeError + semantics
      return nativeToString.call(this);
    }

    // make wrapper look native via the same mechanism
    markAsNative(toString, 'toString');

    Object.defineProperty(Function.prototype, 'toString', {
      value: toString,
      writable: true,
      configurable: true,
      enumerable: false
    });

    window.__TOSTRING_PROXY_INSTALLED__ = true;
  }

Это напрямую чинит “failed object toString error” и сильно снижает вероятность “reflect set proto / recursion”.

4.2. Заменить Proxy-перепрошивку built-in’ов на узкие врапперы (и “нативить” их)
Сейчас Proxy на Object.getOwnPropertyDescriptor, Reflect.has, Object.hasOwn
hide_webdriver
.
Предлагаю заменить на врапперы (без Proxy), чтобы:
минимизировать footprint,
не ломать инварианты Proxy,
маскировать через markAsNative.
 // Object.getOwnPropertyDescriptor (narrow wrapper)
  Object.getOwnPropertyDescriptor = (function(nativeGOPD){
    function getOwnPropertyDescriptor(obj, prop) {
      if (obj === navigator && prop === 'webdriver') return undefined;
      return nativeGOPD(obj, prop);
    }
    markAsNative(getOwnPropertyDescriptor, 'getOwnPropertyDescriptor');
    return getOwnPropertyDescriptor;
  })(nativeGetOwnProp);

  // Reflect.has (narrow wrapper)
  Reflect.has = (function(nativeHas){
    function has(target, prop) {
      if (target === navigator && prop === 'webdriver') return false;
      return nativeHas(target, prop);
    }
    markAsNative(has, 'has');
    return has;
  })(Reflect.has);

  // Object.hasOwn (narrow wrapper)
  const realHasOwn = Object.hasOwn;
  Object.hasOwn = (function(nativeHasOwn){
    function hasOwn(obj, prop) {
      if (obj === navigator && prop === 'webdriver') return false;
      return nativeHasOwn(obj, prop);
    }
    markAsNative(hasOwn, 'hasOwn');
    return hasOwn;
  })(realHasOwn);

Почему это “целесообразно”, 
убираем Proxy-аномалии (частая причина “reflect set proto” и тестов на “proxy-детект”),
оставляем только точечный эффект под webdriver,
функции можно маскировать тем же markAsNative, т.е. они красиво вписываются в общую механику nav_total_set
 nav_total_set
.
Рекомендованные минимальные правки (3 строки + 1 условие)
Вставь/замени ровно это:
safeDefine:


if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return;

Object.getOwnPropertyDescriptor wrapper:


if ((obj === navigator || obj === Navigator.prototype) && prop === 'webdriver') return undefined;

И всё. Это даст:
реальное выставление Navigator.prototype.webdriver,


отсутствие “failed object toString error”,


меньше шансов рекурсий/аномалий, чем у Proxy-версий,


и логическую согласованность с nav_total_set.js.

Replaced the Proxy-based hooks with narrow wrappers and tightened type handling so the toString override no longer touches primitives. Updated safeDefine to allow function targets and adjusted the webdriver descriptor masking to cover Navigator.prototype too, keeping behavior aligned with your nav_total_set expectations.

Details:

hide_webdriver.js now installs a non-Proxy Function.prototype.toString wrapper that checks for primitives, uses nativeToString.call, and is masked via markAsNative.
hide_webdriver.js replaces Proxy rewrites of Object.getOwnPropertyDescriptor, Reflect.has, and Object.hasOwn with narrow wrappers masked through markAsNative.
hide_webdriver.js updates safeDefine to accept function objects and extends the descriptor check to (navigator || Navigator.prototype).
If you want, I can:

add a small self-check snippet for webdriver detection behavior
align other modules to the same non-Proxy pattern
{
    "Function.toString": [
        "failed class extends error",
        "failed toString",
        "failed \"prototype\" in function",
        "failed descriptor",
        "failed own property",
        "failed descriptor keys",
        "failed own property names",
        "failed own keys names",
        "failed at incompatible proxy error",
        "failed at toString incompatible proxy error",
        "failed at instanceof check error"
    ],
    "AnalyserNode.fftSize": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "AnalyserNode.frequencyBinCount": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "AnalyserNode.getByteFrequencyData": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "AnalyserNode.getByteTimeDomainData": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "AnalyserNode.getFloatFrequencyData": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "AnalyserNode.getFloatTimeDomainData": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "AnalyserNode.maxDecibels": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "AnalyserNode.minDecibels": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "AnalyserNode.smoothingTimeConstant": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "AudioBuffer.copyFromChannel": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "AudioBuffer.getChannelData": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "BiquadFilterNode.getFrequencyResponse": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "CanvasRenderingContext2D.fillText": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "CanvasRenderingContext2D.font": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "CanvasRenderingContext2D.getImageData": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "CanvasRenderingContext2D.getLineDash": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "CanvasRenderingContext2D.isPointInPath": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "CanvasRenderingContext2D.isPointInStroke": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "CanvasRenderingContext2D.measureText": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "CanvasRenderingContext2D.quadraticCurveTo": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "CanvasRenderingContext2D.strokeText": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "CSSStyleDeclaration.setProperty": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.getDate": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.getDay": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.getFullYear": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.getHours": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.getMinutes": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.getMonth": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.getTime": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.getTimezoneOffset": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.setDate": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.setFullYear": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.setHours": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.setMilliseconds": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.setMonth": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.setSeconds": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.setTime": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.toDateString": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.toJSON": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.toLocaleDateString": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.toLocaleString": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.toLocaleTimeString": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.toString": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.toTimeString": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Date.valueOf": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "GPU.requestAdapter": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DateTimeFormat.format": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DateTimeFormat.formatRange": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DateTimeFormat.formatToParts": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DateTimeFormat.resolvedOptions": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Document.createElement": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Document.createElementNS": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Document.getElementById": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Document.getElementsByClassName": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Document.getElementsByName": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Document.getElementsByTagName": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Document.getElementsByTagNameNS": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Document.referrer": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Document.write": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Document.writeln": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DOMRect.height": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DOMRect.width": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DOMRect.x": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DOMRect.y": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DOMRectReadOnly.bottom": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DOMRectReadOnly.height": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DOMRectReadOnly.left": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DOMRectReadOnly.right": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DOMRectReadOnly.toJSON": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DOMRectReadOnly.top": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DOMRectReadOnly.width": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DOMRectReadOnly.x": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "DOMRectReadOnly.y": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Element.append": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Element.getBoundingClientRect": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Element.getClientRects": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Element.insertAdjacentElement": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Element.insertAdjacentHTML": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Element.insertAdjacentText": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Element.prepend": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Element.replaceWith": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Element.setAttribute": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "FontFace.family": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "FontFace.load": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "FontFace.status": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "HTMLCanvasElement.captureStream": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "HTMLCanvasElement.getContext": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "HTMLCanvasElement.height": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "HTMLCanvasElement.toBlob": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "HTMLCanvasElement.toDataURL": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "HTMLCanvasElement.transferControlToOffscreen": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "HTMLCanvasElement.width": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "HTMLElement.offsetHeight": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "HTMLElement.offsetWidth": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "HTMLIFrameElement.contentDocument": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "HTMLIFrameElement.contentWindow": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "IntersectionObserverEntry.boundingClientRect": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "IntersectionObserverEntry.intersectionRect": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "IntersectionObserverEntry.rootBounds": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.acos": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.acosh": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.asinh": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.atan": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.atan2": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.atanh": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.cbrt": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.cos": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.cosh": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.exp": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.expm1": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.log": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.log10": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.log1p": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.sin": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.sinh": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.sqrt": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.tan": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Math.tanh": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "MediaDevices.enumerateDevices": [
        "failed toString",
        "failed object toString error",
        "failed at toString incompatible proxy error"
    ],
    "MediaDevices.getDisplayMedia": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "MediaDevices.getUserMedia": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Navigator.appCodeName": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Navigator.appName": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Navigator.appVersion": [
        "failed descriptor.value undefined"
    ],
    "Navigator.buildID": [
        "failed descriptor.value undefined"
    ],
    "Navigator.connection": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Navigator.deviceMemory": [
        "failed descriptor.value undefined"
    ],
    "Navigator.getBattery": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Navigator.getGamepads": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Navigator.gpu": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Navigator.hardwareConcurrency": [
        "failed descriptor.value undefined",
        "does not match worker scope"
    ],
    "Navigator.language": [
        "failed descriptor.value undefined"
    ],
    "Navigator.languages": [
        "failed descriptor.value undefined"
    ],
    "Navigator.maxTouchPoints": [
        "failed descriptor.value undefined"
    ],
    "Navigator.mimeTypes": [
        "failed undefined properties",
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Navigator.platform": [
        "failed descriptor.value undefined"
    ],
    "Navigator.plugins": [
        "failed undefined properties",
        "failed toString",
        "failed at toString incompatible proxy error",
        "invalid mimetype"
    ],
    "Navigator.product": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Navigator.productSub": [
        "failed descriptor.value undefined"
    ],
    "Navigator.sendBeacon": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Navigator.serviceWorker": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Navigator.storage": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Navigator.userAgent": [
        "failed descriptor.value undefined"
    ],
    "Navigator.vendor": [
        "failed descriptor.value undefined"
    ],
    "Navigator.vendorSub": [
        "failed descriptor.value undefined"
    ],
    "Navigator.webdriver": [
        "failed descriptor.value undefined"
    ],
    "Node.appendChild": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Node.insertBefore": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Node.replaceChild": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "OffscreenCanvas.convertToBlob": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "OffscreenCanvas.getContext": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "OffscreenCanvasRenderingContext2D.font": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "OffscreenCanvasRenderingContext2D.getImageData": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "OffscreenCanvasRenderingContext2D.getLineDash": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "OffscreenCanvasRenderingContext2D.isPointInPath": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "OffscreenCanvasRenderingContext2D.isPointInStroke": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "OffscreenCanvasRenderingContext2D.measureText": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "OffscreenCanvasRenderingContext2D.quadraticCurveTo": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Permissions.query": [
        "failed class extends error",
        "failed toString",
        "failed \"prototype\" in function",
        "failed descriptor",
        "failed own property",
        "failed descriptor keys",
        "failed own property names",
        "failed own keys names",
        "failed at incompatible proxy error",
        "failed at toString incompatible proxy error",
        "failed at instanceof check error"
    ],
    "Range.getBoundingClientRect": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Range.getClientRects": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "RelativeTimeFormat.resolvedOptions": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Screen.availHeight": [
        "failed descriptor.value undefined"
    ],
    "Screen.availLeft": [
        "failed descriptor.value undefined"
    ],
    "Screen.availTop": [
        "failed descriptor.value undefined"
    ],
    "Screen.availWidth": [
        "failed descriptor.value undefined"
    ],
    "Screen.colorDepth": [
        "failed descriptor.value undefined"
    ],
    "Screen.height": [
        "failed descriptor.value undefined"
    ],
    "Screen.isExtended": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Screen.onchange": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Screen.orientation": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "Screen.pixelDepth": [
        "failed descriptor.value undefined"
    ],
    "Screen.width": [
        "failed descriptor.value undefined"
    ],
    "StorageManager.estimate": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "SVGRect.height": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "SVGRect.width": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "SVGRect.x": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "SVGRect.y": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "SVGTextContentElement.getComputedTextLength": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "SVGTextContentElement.getExtentOfChar": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "SVGTextContentElement.getSubStringLength": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "TextMetrics.actualBoundingBoxAscent": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "TextMetrics.actualBoundingBoxDescent": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "TextMetrics.actualBoundingBoxLeft": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "TextMetrics.actualBoundingBoxRight": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "TextMetrics.alphabeticBaseline": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "TextMetrics.fontBoundingBoxAscent": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "TextMetrics.fontBoundingBoxDescent": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "TextMetrics.hangingBaseline": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "TextMetrics.ideographicBaseline": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "TextMetrics.width": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "WebGLRenderingContext.bufferData": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "WebGLRenderingContext.getParameter": [
        "failed class extends error",
        "failed toString",
        "failed \"prototype\" in function",
        "failed descriptor",
        "failed own property",
        "failed descriptor keys",
        "failed own property names",
        "failed own keys names",
        "failed at incompatible proxy error",
        "failed at toString incompatible proxy error",
        "failed at instanceof check error"
    ],
    "WebGLRenderingContext.readPixels": [
        "failed class extends error",
        "failed toString",
        "failed \"prototype\" in function",
        "failed descriptor",
        "failed own property",
        "failed descriptor keys",
        "failed own property names",
        "failed own keys names",
        "failed at incompatible proxy error",
        "failed at toString incompatible proxy error",
        "failed at instanceof check error"
    ],
    "WebGL2RenderingContext.bufferData": [
        "failed toString",
        "failed at toString incompatible proxy error"
    ],
    "WebGL2RenderingContext.getParameter": [
        "failed class extends error",
        "failed toString",
        "failed \"prototype\" in function",
        "failed descriptor",
        "failed own property",
        "failed descriptor keys",
        "failed own property names",
        "failed own keys names",
        "failed at incompatible proxy error",
        "failed at toString incompatible proxy error",
        "failed at instanceof check error"
    ],
    "WebGL2RenderingContext.readPixels": [
        "failed class extends error",
        "failed toString",
        "failed \"prototype\" in function",
        "failed descriptor",
        "failed own property",
        "failed descriptor keys",
        "failed own property names",
        "failed own keys names",
        "failed at incompatible proxy error",
        "failed at toString incompatible proxy error",
        "failed at instanceof check error"
    ],
    "AudioBuffer": [
        "sample noise detected"
    ]
}


я понять не могу,оно что такое резкое несовместимая ни с одним модулем что ли? вот только я это все делаю и все у меня сразу ломается старая версия работает нормально но она не чинится ни в какую вообще вот только тогда ты менял предыдущие да она работает а это нет я не могу понять почему то сразу же все модули вылетают 400 ошибок а не 80

Просто ты должен понимать что по существу я вообще вернулся к самому самому началу то есть эти изменения которые  я вчера делал каждый  они все нерабочие, и  вернулся к коминту ba40a6b2ee4be886a9fd20b5075f870a79dcd4d4 который от 18 аж сентября, вообще ни одна понимаешь я когда хочу все-таки этот опыт использование
 они все нерабочие и некорректно функционирующие я хочу  использовать эти наработки потому что они в в целом в вреном наравлени были сделан, только я не могу их  интегрировать полностью вот в чем дело, надо надо целиком где по проекту посмотреть сколько и где раз это все взаимодействует соединяется похоже загрузки по ходу работы и уже конфидент на все это интегрировать просто надо все "коннекторы" сделать такие небольшие как то так интегрировать везде везде где связка markAsNative ↔ toString есть, и корректным образом синхронизировать не только  с nav_total_set.jsиа везде, чтобы починить связку markAsNative ↔ toString, что они корректо работали совместо.

I'm preparing to inspect relevant files and commits to understand current markAsNative and toString usage, focusing on WeakMap storage and multi-module overrides, aiming to propose a consistent approach that shares state across window and workers.

Identifying inconsistent toString patches and map usage

I've found that multiple modules patch toString and use markAsNative with differing assumptions about the WeakMap and native toString references, causing recursion and proxy-related errors. Next, I'll analyze nav_total_set.js and webgpu.js to clarify where conflicts arise and target unifying markAsNative validation and toString wrapping.


The toString override likely happens outside nav_total_set, so I'll check webgpu.js and related files for other hooking implementation.


Noticed that while main code removed Proxy from Function.prototype.toString, the worker patch still uses it, possibly leaking into window context and triggering detection errors for many DOM methods due to toString being a Proxy. Next, I'll search for all Proxy uses to identify others causing these errors.

Confirming multiple toString Proxy patches

Planning to search for markers like "TOSTRING_PROXY_INSTALLED" and direct Proxy assignments to Function.prototype.toString across scripts to find all modules patching toString with Proxy beyond hide_webdriver.



The worker patch relies on a self-executing script that throws if run outside a worker, so it might error if bundled in window context. To unify behavior, I’ll create a shared utility to install the toString wrapper consistently in both contexts, ensuring function-only enforcement in markAsNative and preventing Proxy detection mismatches.

Assessing markAsNative type checks and toString wrapper conflicts

Current markAsNative lacks strict function checks, causing risk if non-functions are passed; updating it to silently ignore non-functions avoids breakage. The toString wrapper should guard by verifying typeof this === 'function' to prevent primitive errors, aligning with function-only map storage. There's a risk that capturing nativeToString too early or from an already patched source causes inconsistencies, so centralizing nativeToString globally could ensure all modules reference the true native method and avoid cascade failures.


MarkAsNative and toString patch implementations differ between window and worker contexts, causing detection failures and errors; unifying these across all modules could fix the systemic mismatch the user noted.

Planning to compare older hide_webdriver implementation

Preparing to inspect a past commit of hide_webdriver.js to understand connector and hooking changes affecting toString and markAsNative integration.


The error indicating incompatible Proxy on toString conflicts with the new patch replacing Proxy with a wrapper, suggesting some detection still sees Proxy or expects native toString. The old commit uses Proxy but reportedly works, so the error list likely corresponds to the new patch, hinting that other code may still involve Proxy or detection methods haven't fully adapted to the wrapper approach.

Planning global native utilities integration

The user wants to unify markAsNative and the toString wrapper across all modules to avoid load-order and compatibility issues. I'll propose creating a shared initializer that installs the native toString wrapper and markAsNative exactly once, then update all patches and modules to use this helper, ensuring consistent behavior regardless of load order or environment (window or worker).


I'm checking how wrk.js uses markAsNative, focusing on whether it patches toString or uses maps, to understand its integration requirements and ensure compatibility with Worker-related APIs.


Planning to create a small utility function that ensures markAsNative and the toString patch are installed per module, embedding it where needed across multiple modules without relying on a shared module system to avoid missing definitions and ensure consistency.

Searching for module execution calls

Planning to locate where patch modules are invoked by searching for their function calls in the assets directory to understand the load order and integration points.



Planning a helper to ensure a global original toString reference and WeakMap coexist, enabling markAsNative to sync across modules without breaking existing usage and keeping the original toString intact for wrappers.

Refining global markAsNative synchronization

Planning to wrap an existing global markAsNative to keep toString override map in sync without breaking behavior, plus implementing a shared ensureMarkAsNative helper to install or reuse markAsNative and a centralized WeakMap across modules for robust integration and minimal errors.



The markAsNative function is loaded correctly, so its absence is unlikely the cause. The error involving incompatible Proxy in Function.prototype.toString suggests some detection is still seeing toString as a Proxy, possibly from the worker patch, even though Proxy was removed in the main context. This hints the detection might be testing toString in ways that expose a mismatch or leftover proxy wrapper. Next, I'll verify if any code resets toString to a Proxy after the removal, especially checking worker-related patches.

Planning unified helpers for toString and markAsNative

The detection errors might stem from inconsistent toString wrappers and markAsNative usage across window and worker contexts. I'm outlining creating robust, global helpers—like __ensureMarkAsNative and a shared toString wrapper—that modules can call to avoid duplication and Proxy reliance. Next, I’ll inspect wrk.js for toString-related code and validate integrating a shared native_utils helper early via main.py to unify behavior project-wide.


The worker patch uses a separate toString map and Proxy for markAsNative, causing possible detection inconsistencies if tests run in workers. Aligning the worker patch’s toString handling with the main hide_webdriver patch could resolve this.

Planning unified toString and markAsNative patch

I’m designing coordinated updates to hide_webdriver and worker patches to replace Proxy-based toString wrappers with a shared wrapper using a global WeakMap and to synchronize markAsNative accordingly. This includes safer detection of existing markAsNative, robust original toString caching, and consistent patch installation across main and worker contexts to resolve detection errors and ensure all modules share the same native masking logic.

Confirming consistent markAsNative usage across modules

markAsNative is only defined in hide_webdriver and consumed by key modules; updating hide_webdriver and worker patch to share toString wrappers and native masking covers all uses without modifying consumers, ensuring consistent native detection handling project-wide.

Edited
hide_webdriver.js
  // ——— Global mask "native" + general WeakMap ———
  const nativeToString = Function.prototype.toString;
  const nativeToString = window.__NativeToString || Function.prototype.toString;
  window.__NativeToString = nativeToString;
  const nativeGetOwnProp = Object.getOwnPropertyDescriptor;
  // general WeakMap, available to all modules
  const toStringOverrideMap = (window.__NativeToStringMap =
    window.__NativeToStringMap || new WeakMap());
  const toStringOverrideMap = (window.__NativeToStringMap instanceof WeakMap)
    ? window.__NativeToStringMap
    : new WeakMap();
  window.__NativeToStringMap = toStringOverrideMap;

  // Unified global function-mask
  function markAsNative(func, name = "") {
  function baseMarkAsNative(func, name = "") {
    if (typeof func !== 'function') return func;
    try {
      const n = name || func.name || "";
      toStringOverrideMap.set(func, `function ${n}() { [native code] }`);
      const label = n ? `function ${n}() { [native code] }` : 'function () { [native code] }';
      toStringOverrideMap.set(func, label);
    } catch (_) {}
  }
  if (!window.markAsNative) window.markAsNative = markAsNative;
  const markAsNative = (() => {
    const existing = (typeof window.markAsNative === 'function') ? window.markAsNative : null;
    if (!existing) {
      baseMarkAsNative.__TOSTRING_BRIDGE__ = true;
      return baseMarkAsNative;
    }
    if (existing.__TOSTRING_BRIDGE__) return existing;
    const wrapped = function markAsNative(func, name = "") {
      const out = existing(func, name);
      return baseMarkAsNative(out, name);
    };
    wrapped.__TOSTRING_BRIDGE__ = true;
    return wrapped;
  })();
  if (!window.markAsNative || window.markAsNative !== markAsNative) window.markAsNative = markAsNative;

I'm confirming that markAsNative is defined before fakeNative and that its internal use of baseMarkAsNative and map is consistent, then planning to check the hide_webdriver section for any related issues.


Noticing the comment about "Single Proxy for Function.prototype.toString" is outdated, I'll revise it to "Single wrapper for Function.prototype.toString" for clarity and consistency with the current usage of markAsNative.

Edited
hide_webdriver.js

  // Single Proxy for Function.prototype.toString, reading from the general WeakMap
  // Single wrapper for Function.prototype.toString, reading from the general WeakMap
  if (!window.__TOSTRING_PROXY_INSTALLED__) {
I'm preparing to replace the existing toString patch in WORKER_PATCH_SRC.js by removing the Proxy check and updating the code from the nativeToString assignment through the markAsNative export for a cleaner, revised patch.

Ensuring indentation in patch

I'm focusing on preserving correct indentation while crafting the updated patch code.

Edited
WORKER_PATCH_SRC.js

    const nativeToString = Function.prototype.toString;
    const nativeToString = self.__NativeToString || Function.prototype.toString;
    if (typeof nativeToString !== 'function') {
    }
    if (self.__NativeToStringMap && !(self.__NativeToStringMap instanceof WeakMap)) {
      throw new Error('UACHPatch: NativeToStringMap invalid');
    }
    const toStringMap = self.__NativeToStringMap || new WeakMap();
    if (!self.__NativeToString) self.__NativeToString = nativeToString;

    const toStringMap = (self.__NativeToStringMap instanceof WeakMap)
      ? self.__NativeToStringMap
      : new WeakMap();
    self.__NativeToStringMap = toStringMap;

    const existingMarkAsNative = (typeof self.markAsNative === 'function') ? self.markAsNative : null;
    const markAsNative = (func, name) => {
      if (typeof func !== 'function') throw new Error('UACHPatch: markAsNative requires function');
      if (typeof func !== 'function') return func;
      const out = existingMarkAsNative ? existingMarkAsNative(func, name) : func;
      const n = name || func.name;
      if (n) {
        toStringMap.set(func, `function ${n}() { [native code] }`);
      } else {
        toStringMap.set(func, 'function () { [native code] }');
      }
      const target = (typeof out === 'function') ? out : func;
      try {
        const n = name || target.name || "";
        const label = n ? `function ${n}() { [native code] }` : 'function () { [native code] }';
        toStringMap.set(target, label);
      } catch (_) {}
      return out;
    if (!self.__TOSTRING_PROXY_INSTALLED__) {
      if (typeof Proxy !== 'function') throw new Error('UACHPatch: Proxy missing');
      Function.prototype.toString = new Proxy(nativeToString, {
        apply(target, thisArg, args) {
          if (typeof thisArg === 'function' && toStringMap.has(thisArg)) {
            return toStringMap.get(thisArg);
          }
          return target.apply(thisArg, args);
      function toString() {
        // IMPORTANT: do not touch WeakMap for primitives/null/undefined
        const t = typeof this;
        const isObj = (this !== null) && (t === 'function' || t === 'object');

        if (isObj && toStringMap.has(this)) {
          return toStringMap.get(this);
        }
        // preserve native TypeError + semantics
        return nativeToString.call(this);
      }

      // make wrapper look native via the same mechanism
      markAsNative(toString, 'toString');

      Object.defineProperty(Function.prototype, 'toString', {
        value: toString,
        writable: true,
        configurable: true,
        enumerable: false
      });

The user’s errors likely stem from inconsistent toString/markAsNative behavior between window and worker, plus Proxy toString and markAsNative map mismatches, all without new non-ASCII code additions. We unified toString and markAsNative logic across window and worker, now limiting markAsNative to functions and avoiding throws, using a global native toString wrapper. We'll specify changed files and suggest the user verify by running browser console checks or a small sanity snippet, noting possible wrk.js or load order adjustments.

Explaining synchronized toString and markAsNative

The markAsNative/toString logic is now unified between window and worker using a shared map and a wrapper relying on the original native toString stored in __NativeToString. Changes affect hide_webdriver.js and WORKER_PATCH_SRC.js. markAsNative bridges existing entries and no longer throws. The worker patch dropped Proxy toString for this consistent wrapper.

Note: profile.json is modified but I did not change it—please confirm if this is expected or if it should be ignored.

Suggestions:

Run your fingerprint test again and check Function.prototype.toString outputs.
If errors persist, share top error stacks and environment details.
Optionally, to avoid load order issues, small helpers can be added in other modules (nav_total_set.js, context.js, webgpu.js, wrk.js) to enforce markAsNative presence safely. Other modules remain unchanged.

I've already modified the worker patch file but will hold off further worker changes per instructions. Should I revert the worker patch now to keep the script consistent, or leave it as is while focusing on the main script adjustments?

Связал markAsNative ↔ toString единым способом для window и worker: теперь оба контекста используют один и тот же WeakMap и один и тот же non‑Proxy wrapper на Function.prototype.toString, чтобы избежать разъезда и «proxy‑детектов».

Детали по изменениям:

hide_webdriver.js — сохранил оригинальный Function.prototype.toString в window.__NativeToString, нормализовал __NativeToStringMap, и сделал мост, который синхронизирует любой уже существующий markAsNative с общей WeakMap.
WORKER_PATCH_SRC.js — заменил Proxy‑перепрошивку Function.prototype.toString на такой же wrapper, как в window, и привязал markAsNative к общей WeakMap без броска ошибок на не‑функциях.
Отдельно: вижу изменённый profile.json, я его не трогал. Это ожидаемо или нужно игнорировать/отложить?

Если хочешь, следующий шаг:

Прогнать твой тест и прислать топ‑10 ошибок (с текстом и контекстом), чтобы понять, что осталось.
Я добавлю маленький ensureMarkAsNative в nav_total_set.js, context.js, webgpu.js, wrk.js, чтобы они не падали при любом порядке загрузки.
2 files changed
+59
-26
Undo

Review
WORKER_PATCH_SRC.js
+33
-19
hide_webdriver.js
+26
-7
Я предлагаю пока не браться сразу за ворокера там много других модулей ни один модуль не подключен , потом врокера, это самое сложное это у него отдельная вообще отдельные скоуп, у него всё отдельно это большая работа у сначала надо восстаность конситентнотб  скрипта, Принимая во внимание наши доработки исследования, а вот потом заниматься воркером


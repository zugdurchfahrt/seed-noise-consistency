(() => {
  "use strict";

  const keys = ["platform", "hardwareConcurrency", "vendor", "productSub", "vendorSub", "maxTouchPoints", "webdriver", "Element.clientWidth",   "VisualViewport.width", "VisualViewport.height", "MediaQueryList.matches",  "Element.clientWidth", "Element.clientHeight"];
  const nav = navigator;
  const navProto = Object.getPrototypeOf(nav);
  const coreInternal = window.Core && window.Core.__internal && typeof window.Core.__internal === "object"
    ? window.Core.__internal
    : null;
  const coreToStringState = coreInternal && coreInternal.coreToStringState && typeof coreInternal.coreToStringState === "object"
    ? coreInternal.coreToStringState
    : null;
  const proxyTargetMap = coreToStringState && coreToStringState.proxyTargetMap instanceof WeakMap
    ? coreToStringState.proxyTargetMap
    : null;

  function safeCall(fn, finalizer) {
    try {
      return { ok: true, value: fn() };
    } catch (error) {
      return { ok: false, error };
    } finally {
      try {
        if (typeof finalizer === "function") finalizer();
      } catch (_) {}
    }
  }

  function errorShape(error) {
    if (!error) return null;
    return {
      name: error && error.name ? String(error.name) : "Error",
      message: error && error.message ? String(error.message) : String(error)
    };
  }

  function findDescriptor(root, key) {
    let current = root;
    while (current) {
      const desc = Object.getOwnPropertyDescriptor(current, key);
      if (desc) return { owner: current, desc };
      current = Object.getPrototypeOf(current);
    }
    return { owner: null, desc: null };
  }

  function ownerLabel(owner) {
    if (!owner) return null;
    try {
      const ctor = owner.constructor;
      if (ctor && ctor.name) return ctor.name + ".prototype";
    } catch (_) {}
    return Object.prototype.toString.call(owner);
  }

  function bridgeKind(fn) {
    if (typeof fn !== "function") return "not_function";
    if (!proxyTargetMap) return "native_or_untracked";
    const target = proxyTargetMap.get(fn);
    if (typeof target === "function" && target !== fn) return "proxy_carrier";
    return "native_or_untracked";
  }

  const rows = keys.map((key) => {
    const resolved = findDescriptor(navProto, key);
    const desc = resolved.desc;
    const getter = desc && typeof desc.get === "function" ? desc.get : null;
    const good = getter ? safeCall(() => Reflect.apply(getter, nav, [])) : { ok: false, error: new Error("getter missing") };
    const bad = getter ? safeCall(() => Reflect.apply(getter, {}, [])) : { ok: false, error: new Error("getter missing") };
    const text = getter ? safeCall(() => Function.prototype.toString.call(getter)) : { ok: false, error: new Error("getter missing") };
    const nativeProto = getter ? Object.getPrototypeOf(getter) : null;
    const objectCreateToString = getter
      ? safeCall(() => Object.create(getter).toString())
      : { ok: false, error: new Error("getter missing") };
    const setProtoRecursion = getter
      ? safeCall(
          () => Object.setPrototypeOf(getter, Object.create(getter)).toString(),
          () => { if (nativeProto) Object.setPrototypeOf(getter, nativeProto); }
        )
      : { ok: false, error: new Error("getter missing") };

    return {
      key,
      descriptorOwner: ownerLabel(resolved.owner),
      descriptorShape: desc ? {
        configurable: !!desc.configurable,
        enumerable: !!desc.enumerable,
        hasGetter: typeof desc.get === "function",
        hasSetter: typeof desc.set === "function",
        hasValue: Object.prototype.hasOwnProperty.call(desc, "value")
      } : null,
      getterKind: bridgeKind(getter),
      toString: text.ok ? String(text.value) : null,
      goodValue: good.ok ? good.value : null,
      goodError: good.ok ? null : errorShape(good.error),
      badError: bad.ok ? null : errorShape(bad.error),
      objectCreateToStringError: objectCreateToString.ok ? null : errorShape(objectCreateToString.error),
      setProtoRecursionError: setProtoRecursion.ok ? null : errorShape(setProtoRecursion.error)
    };
  });

  console.group("[accessor inspect] platform + hardwareConcurrency");
  console.table(rows.map((row) => ({
    key: row.key,
    descriptorOwner: row.descriptorOwner,
    getterKind: row.getterKind,
    toStringHasNativeCode: typeof row.toString === "string" && row.toString.indexOf("[native code]") !== -1,
    goodError: row.goodError ? row.goodError.name : null,
    badError: row.badError ? row.badError.name + ": " + row.badError.message : null,
    objectCreateToStringError: row.objectCreateToStringError ? row.objectCreateToStringError.name + ": " + row.objectCreateToStringError.message : null,
    setProtoRecursionError: row.setProtoRecursionError ? row.setProtoRecursionError.name + ": " + row.setProtoRecursionError.message : null
  })));
  rows.forEach((row) => console.log(row.key, row));
  console.groupEnd();

  return rows;
})();

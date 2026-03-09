<#
USAGE
  - From repo root:
      pwsh -File .\Samples4Context\validate_proxy_mechanics_registry.ps1
  - From Samples4Context/:
      pwsh -File .\validate_proxy_mechanics_registry.ps1

WHAT IT GUARANTEES (STATIC CHECKS)
  - Ensures Core still contains expected Proxy mechanics invariants used by the docs/registry:
      sunami\assets\scripts\window\core\core_window.js
  - Spot-checks current method-gateway modules for explicit/non-explicit wrapLayer usage expectations.

NOT A RUNTIME TEST
  - This script only regex-checks file contents (accumulate-mode; prints all "ASSERT FAILED: ..." findings before exit 1).
  - If it fails after legitimate refactors/renames in Core, update the patterns/messages here or in the registry/doc.

EXPECTED OUTPUT
  - On success: "OK: validate_proxy_mechanics_registry.ps1"
#>

$ErrorActionPreference = "Stop"
$script:Findings = New-Object System.Collections.Generic.List[string]

function Add-Finding {
  param(
    [Parameter(Mandatory = $true)][string]$Message,
    [Parameter(Mandatory = $true)][string]$Pattern
  )
  $script:Findings.Add("ASSERT FAILED: $Message (pattern: $Pattern)")
}

function Assert-Contains {
  param(
    [Parameter(Mandatory = $true)][string]$Text,
    [Parameter(Mandatory = $true)][string]$Pattern,
    [Parameter(Mandatory = $true)][string]$Message
  )
  if ($Text -notmatch $Pattern) {
    Add-Finding -Message $Message -Pattern $Pattern
  }
}

function Assert-NotContains {
  param(
    [Parameter(Mandatory = $true)][string]$Text,
    [Parameter(Mandatory = $true)][string]$Pattern,
    [Parameter(Mandatory = $true)][string]$Message
  )
  if ($Text -match $Pattern) {
    Add-Finding -Message $Message -Pattern $Pattern
  }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
# This script lives in `sunami/tools/tools_native_check/`; repo root is three levels above.
$repo = Resolve-Path (Join-Path $root "..\\..\\..") | Select-Object -ExpandProperty Path

$coreWindowPath = Join-Path $repo "sunami\\assets\\scripts\\window\\core\\core_window.js"
$coreText = Get-Content -Path $coreWindowPath -Raw

# --- Core invariants this document relies on ---
Assert-Contains -Text $coreText -Pattern "function\s+normalizeWrapLayer\b" -Message "Core must define normalizeWrapLayer"
Assert-Contains -Text $coreText -Pattern "'descriptor_only'" -Message "normalizeWrapLayer must accept descriptor_only"
Assert-Contains -Text $coreText -Pattern "'named_wrapper'" -Message "normalizeWrapLayer must accept named_wrapper"
Assert-Contains -Text $coreText -Pattern "'named_wrapper_strict'" -Message "normalizeWrapLayer must accept named_wrapper_strict"
Assert-Contains -Text $coreText -Pattern "'core_wrapper'" -Message "normalizeWrapLayer must accept core_wrapper"
Assert-NotContains -Text $coreText -Pattern "v\s*===\s*undefined\s*\|\|\s*v\s*===\s*null\s*\|\|\s*v\s*===\s*''\)\s*return\s*'auto'" -Message "normalizeWrapLayer must not default to auto"
Assert-Contains -Text $coreText -Pattern "if\s*\(v\s*===\s*'auto'\)\s*return\s*'wrap_layer_auto_forbidden'" -Message "wrapLayer=auto must be forbidden in registry-contracts"
Assert-Contains -Text $coreText -Pattern "wrapLayer auto forbidden" -Message "Core must expose wrapLayer auto forbidden contract"

# strict policy is supported as a separate mode (do not assert runtime throwing behavior here)
Assert-Contains -Text $coreText -Pattern "function\s+normalizePolicy\b" -Message "Core must define normalizePolicy"
Assert-Contains -Text $coreText -Pattern "v\s*===\s*'throw'\s*\|\|\s*v\s*===\s*'strict'" -Message "normalizePolicy must accept strict"

# bridge-state only: no iframe oracle, no public Proxy-toString install
Assert-NotContains -Text $coreText -Pattern "createElement\(\s*['""]iframe['""]\s*\)" -Message "Core must not create iframe oracle path for toString"
Assert-Contains -Text $coreText -Pattern "const\s+nativeToString\s*=\s*resolveToStringBridgeTarget\(nativeToStringCandidate\)\s*\|\|\s*resolveToStringBridgeTarget\(currentRealmToString\)\s*\|\|\s*null" -Message "Core must resolve nativeToString from shared state or current realm"
Assert-Contains -Text $coreText -Pattern "__CORE_TOSTRING_STATE__" -Message "Core must publish shared __CORE_TOSTRING_STATE__ bridge-state"
Assert-Contains -Text $coreText -Pattern "if\s*\(typeof\s+window\.__ensureMarkAsNative\s*!==\s*'function'\)" -Message "Core must publish __ensureMarkAsNative provider"
Assert-NotContains -Text $coreText -Pattern "const\s+toString\s*=\s*new\s+Proxy\s*\(\s*nativeToString\s*,\s*\{" -Message "Core must not install public Proxy(nativeToString,{apply}) bridge"

# method/promise_method still keep explicit invokeClass strictness variable
Assert-Contains -Text $coreText -Pattern "const\s+requiresStrictThis\s*=\s*invokeClass\s*!==\s*'normal'" -Message "patchMethod must define requiresStrictThis based on invokeClass"

# __wrapNativeApply must delegate receiver/forwarding to applyImpl
Assert-Contains -Text $coreText -Pattern "function\s+__wrapNativeApply\b" -Message "__wrapNativeApply must exist"
Assert-Contains -Text $coreText -Pattern "return\s+applyImpl\(target,\s*thisArg,\s*argList\);" -Message "__wrapNativeApply apply-trap must call applyImpl(target,thisArg,argList)"

# strict accessor synthetic invalid-this path must delegate to native bridge target
Assert-Contains -Text $coreText -Pattern "return\s+Reflect\.apply\(syntheticBridgeTarget,\s*thisArg,\s*argList\s*\|\|\s*\[\]\);" -Message "__wrapStrictAccessor synthetic invalid-this path must rethrow through native bridge target"

# applyTargets preflight must reject descriptor_only for method/promise_method
Assert-Contains -Text $coreText -Pattern "descriptor_only unsupported for method kind|descriptor_only unsupported for non-data kind" -Message "applyTargets must reject wrapLayer=descriptor_only for method/promise_method"

# --- context.js: current bucket split must stay explicit ---
$context = Get-Content -Path (Join-Path $repo "sunami\\assets\\scripts\\window\\core\\context.js") -Raw
Assert-Contains -Text $context -Pattern "definePatchedMethod missing wrapLayer" -Message "context.js must keep explicit wrapLayer guard in definePatchedMethod"
Assert-Contains -Text $context -Pattern "(?s)function\s+patchMethod\b.*?corePreflight\(proto,\s*method,\s*'method',\s*'context:webgl:patchMethod',\s*\{\s*wrapLayer:\s*'named_wrapper',\s*policy:\s*'throw'\s*\}\)" -Message "context.js webgl patchMethod must pass explicit named_wrapper contract into corePreflight"
Assert-NotContains -Text $context -Pattern "corePreflight\(proto,\s*method,\s*'method',\s*'context:webgl:patchMethod'\s*\)" -Message "context.js webgl patchMethod must not rely on implicit corePreflight wrapLayer selection"
Assert-Contains -Text $context -Pattern "(?s)function\s+chain\b.*?markAsNative\(wrapped,\s*method\).*?definePatchedMethod\(proto,\s*method,\s*patched,\s*\{\s*wrapLayer:\s*'named_wrapper',\s*policy:\s*'throw'\s*\}\)" -Message "context.js sync canvas public wrappers must stay on explicit named_wrapper path"
Assert-Contains -Text $context -Pattern "(?s)function\s+chainAsync\b.*?method === 'toBlob'.*?definePatchedMethod\(proto,\s*method,\s*patched,\s*\{\s*wrapLayer:\s*'named_wrapper',\s*policy:\s*'throw'\s*\}\).*?method === 'convertToBlob'.*?definePatchedMethod\(proto,\s*method,\s*patched,\s*\{\s*wrapLayer:\s*'named_wrapper',\s*policy:\s*'throw'\s*\}\)" -Message "context.js async canvas public wrappers must stay on explicit named_wrapper path"
Assert-Contains -Text $context -Pattern "(?s)function\s+createSafeCtxProxy\b.*?patchOnce\('getImageData'" -Message "context.js ctx2d read-path must stay inside createSafeCtxProxy gateway"
Assert-Contains -Text $context -Pattern "(?s)function\s+patchOnce\b.*?definePatchedMethod\(proto,\s*method,\s*wrapped,\s*\{\s*wrapLayer:\s*'core_wrapper',\s*policy:\s*'throw',\s*invokeClass:\s*'brand_strict'\s*\}\)" -Message "context.js ctx2d gateway methods must keep explicit core_wrapper + brand_strict path"
Assert-Contains -Text $context -Pattern "return real ctx \(brand-safe\)\. No Proxy\." -Message "context.js getContext path must keep brand-safe real-context return contract"
Assert-Contains -Text $context -Pattern "(?s)function\s+chainGetContext\b.*?markAsNative\(wrapped,\s*method\).*?definePatchedMethod\(proto,\s*method,\s*patched,\s*\{\s*wrapLayer:\s*'named_wrapper',\s*policy:\s*'throw'\s*\}\)" -Message "context.js getContext public wrapper must stay on explicit named_wrapper path"

# --- Module spot-checks for doc/registry method-gateway markers ---
$hideWd = Get-Content -Path (Join-Path $repo "sunami\\assets\\scripts\\window\\patches\\stealth\\hide_webdriver.js") -Raw
Assert-Contains -Text $hideWd -Pattern "wrapLayer\s*:\s*'named_wrapper_strict'" -Message "hide_webdriver.js must set wrapLayer=named_wrapper_strict (CORE2.0 strict accessor contract)"
Assert-Contains -Text $hideWd -Pattern "policy\s*:\s*'strict'" -Message "hide_webdriver.js must set policy=strict for strict accessor contract"
Assert-NotContains -Text $hideWd -Pattern "wrapLayer\s*:\s*'auto'" -Message "hide_webdriver.js must not use wrapLayer=auto"

$uad = Get-Content -Path (Join-Path $repo "sunami\\assets\\scripts\\window\\patches\\navigator\\override_ua_data.js") -Raw
Assert-Contains -Text $uad -Pattern "wrapLayer\s*:\s*'core_wrapper'" -Message "override_ua_data.js must set wrapLayer=core_wrapper for strict receiver/accessor targets"
Assert-NotContains -Text $uad -Pattern "wrapLayer\s*:\s*'auto'" -Message "override_ua_data.js must not use wrapLayer=auto"

$geo = Get-Content -Path (Join-Path $repo "sunami\\assets\\scripts\\window\\patches\\stealth\\GeoOverride_source.js") -Raw
Assert-Contains -Text $geo -Pattern "wrapLayer\s*:\s*'core_wrapper'" -Message "GeoOverride_source.js must set wrapLayer=core_wrapper for brand_strict Geolocation methods (no implicit auto)"
Assert-NotContains -Text $geo -Pattern "wrapLayer\s*:\s*'auto'" -Message "GeoOverride_source.js must not use wrapLayer=auto"

$webgpu = Get-Content -Path (Join-Path $repo "sunami\\assets\\scripts\\window\\patches\\graphics\\webgpu.js") -Raw
Assert-Contains -Text $webgpu -Pattern "wrapLayer\s*:\s*'core_wrapper'" -Message "webgpu.js must set wrapLayer=core_wrapper for brand_strict and strict-receiver targets (no implicit auto)"
Assert-NotContains -Text $webgpu -Pattern "wrapLayer\s*:\s*'auto'" -Message "webgpu.js must not use wrapLayer=auto"

$navTotal = Get-Content -Path (Join-Path $repo "sunami\\assets\\scripts\\window\\patches\\navigator\\nav_total_set.js") -Raw
Assert-Contains -Text $navTotal -Pattern "wrapLayer\s*:\s*'named_wrapper'" -Message "nav_total_set.js must include named_wrapper wrapLayer (documented as synthetic_named)"
Assert-Contains -Text $navTotal -Pattern "wrapLayer\s*:\s*'descriptor_only'" -Message "nav_total_set.js must include descriptor_only wrapLayer (documented as native_descriptor data-path)"
Assert-Contains -Text $navTotal -Pattern "wrapLayer\s*:\s*'core_wrapper'" -Message "nav_total_set.js must include core_wrapper wrapLayer (documented as core_proxy)"
Assert-Contains -Text $navTotal -Pattern "__wrapStrictAccessor|__wrapGetter" -Message "nav_total_set.js must keep current strict accessor helper path after core invalid-this update"
Assert-Contains -Text $navTotal -Pattern "const\s+patchedQuery\s*=\s*__navMark\(\(\{\s*query\(parameters\)" -Message "nav_total_set.js permissions.query must stay on local marked named-wrapper path"
Assert-Contains -Text $navTotal -Pattern "Object\.defineProperty\(permOwner,\s*'query',\s*permNextDesc\)" -Message "nav_total_set.js permissions.query must keep direct descriptor install path"
Assert-Contains -Text $navTotal -Pattern "const\s+patchedEnumerateDevices\s*=\s*__navMark\(\(\{\s*enumerateDevices\(\)" -Message "nav_total_set.js mediaDevices.enumerateDevices must stay on local marked named-wrapper path"
Assert-Contains -Text $navTotal -Pattern "Object\.defineProperty\(mediaOwner,\s*'enumerateDevices',\s*mediaNextDesc\)" -Message "nav_total_set.js mediaDevices.enumerateDevices must keep direct descriptor install path"
Assert-Contains -Text $navTotal -Pattern "const\s+patchedEstimate\s*=\s*__navMark\(\(\{\s*estimate\(\)" -Message "nav_total_set.js storage.estimate must stay on local marked named-wrapper path"
Assert-Contains -Text $navTotal -Pattern "Object\.defineProperty\(storageOwner,\s*'estimate',\s*storageNextDesc\)" -Message "nav_total_set.js storage.estimate must keep direct descriptor install path"
Assert-Contains -Text $navTotal -Pattern "(?s)nav_total_set:userAgentData\.getHighEntropyValues.*?wrapLayer\s*:\s*'core_wrapper'" -Message "nav_total_set.js userAgentData.getHighEntropyValues must stay on explicit core_wrapper path"
Assert-Contains -Text $navTotal -Pattern "(?s)nav_total_set:userAgentData\.toJSON.*?wrapLayer\s*:\s*'core_wrapper'" -Message "nav_total_set.js userAgentData.toJSON must stay on explicit core_wrapper path"

$tz = Get-Content -Path (Join-Path $repo "sunami\\assets\\scripts\\window\\patches\\stealth\\TimezoneOverride_source.js") -Raw
Assert-Contains -Text $tz -Pattern "__wrapNativeCtor" -Message "TimezoneOverride_source.js must use __wrapNativeCtor for Intl ctor surfaces"
Assert-Contains -Text $tz -Pattern "createNativeShapedMethod" -Message "TimezoneOverride_source.js must use createNativeShapedMethod for method surfaces"
Assert-Contains -Text $tz -Pattern '(?s)createNativeShapedMethod\("resolvedOptions".*?Reflect\.apply\(origResolvedOptions,\s*this,\s*\[\]\)' -Message "TimezoneOverride_source.js resolvedOptions patches must stay on native-shaped local method path"
Assert-Contains -Text $tz -Pattern '(?s)createNativeShapedMethod\("toLocaleString".*?Reflect\.apply\(origToLocaleString,\s*this,\s*\[locales,\s*options\]\)' -Message "TimezoneOverride_source.js Date.prototype.toLocaleString must keep native-shaped local method path"
Assert-Contains -Text $tz -Pattern '(?s)createNativeShapedMethod\("toLocaleDateString".*?Reflect\.apply\(origToLocaleDateString,\s*this,\s*\[locales,\s*options\]\)' -Message "TimezoneOverride_source.js Date.prototype.toLocaleDateString must keep native-shaped local method path"
Assert-Contains -Text $tz -Pattern '(?s)createNativeShapedMethod\("toLocaleTimeString".*?Reflect\.apply\(origToLocaleTimeString,\s*this,\s*\[locales,\s*options\]\)' -Message "TimezoneOverride_source.js Date.prototype.toLocaleTimeString must keep native-shaped local method path"

if ($script:Findings.Count -gt 0) {
  $script:Findings | ForEach-Object { Write-Host $_ }
  exit 1
}

Write-Host "OK: validate_proxy_mechanics_registry.ps1"

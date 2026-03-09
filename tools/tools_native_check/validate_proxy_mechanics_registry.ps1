<#
USAGE
  - From repo root:
      pwsh -File .\Samples4Context\validate_proxy_mechanics_registry.ps1
  - From Samples4Context/:
      pwsh -File .\validate_proxy_mechanics_registry.ps1

WHAT IT GUARANTEES (STATIC CHECKS)
  - Ensures Core still contains expected Proxy mechanics invariants used by the docs/registry:
      sunami\assets\scripts\window\core\core_window.js
  - Spot-checks a few modules for explicit/non-explicit wrapLayer usage expectations.

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
Assert-Contains -Text $coreText -Pattern "v\s*===\s*undefined\s*\|\|\s*v\s*===\s*null\s*\|\|\s*v\s*===\s*''\)\s*return\s*'auto'" -Message "normalizeWrapLayer must default to auto"

# strict policy is supported as a separate mode (do not assert runtime throwing behavior here)
Assert-Contains -Text $coreText -Pattern "function\s+normalizePolicy\b" -Message "Core must define normalizePolicy"
Assert-Contains -Text $coreText -Pattern "v\s*===\s*'throw'\s*\|\|\s*v\s*===\s*'strict'" -Message "normalizePolicy must accept strict"

# accessor/method/promise_method path: auto => core_wrapper
Assert-Contains -Text $coreText -Pattern "const\s+useCoreWrapper\s*=\s*wrapLayer\s*===\s*'core_wrapper'\s*\|\|\s*wrapLayer\s*===\s*'auto'" -Message "Core must map auto => core_wrapper (cross-realm toString contract)"

# method/promise_method still keep explicit invokeClass strictness variable
Assert-Contains -Text $coreText -Pattern "const\s+requiresStrictThis\s*=\s*invokeClass\s*!==\s*'normal'" -Message "patchMethod must define requiresStrictThis based on invokeClass"

# __wrapNativeApply must delegate receiver/forwarding to applyImpl
Assert-Contains -Text $coreText -Pattern "function\s+__wrapNativeApply\b" -Message "__wrapNativeApply must exist"
Assert-Contains -Text $coreText -Pattern "return\s+applyImpl\(target,\s*thisArg,\s*argList\);" -Message "__wrapNativeApply apply-trap must call applyImpl(target,thisArg,argList)"

# Function.prototype.toString bridge must remain Proxy(nativeToString,{apply}) and use Reflect.apply pass-through
Assert-Contains -Text $coreText -Pattern "const\s+toString\s*=\s*new\s+Proxy\s*\(\s*nativeToString\s*,\s*\{" -Message "Core must install toString via Proxy(nativeToString,{apply})"
Assert-Contains -Text $coreText -Pattern "if\s*\(typeof\s+thisArg\s*!==\s*'function'\)\s*\{\s*return\s+Reflect\.apply\(target,\s*thisArg,\s*argList\);" -Message "toString bridge must forward non-function thisArg to native via Reflect.apply"

# applyTargets preflight must reject descriptor_only for method/promise_method
Assert-Contains -Text $coreText -Pattern "descriptor_only unsupported for method kind|descriptor_only unsupported for non-data kind" -Message "applyTargets must reject wrapLayer=descriptor_only for method/promise_method"

# --- Module spot-checks for doc 'noncompliant auto' markers ---
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

if ($script:Findings.Count -gt 0) {
  $script:Findings | ForEach-Object { Write-Host $_ }
  exit 1
}

Write-Host "OK: validate_proxy_mechanics_registry.ps1"

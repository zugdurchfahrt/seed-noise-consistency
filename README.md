Browser Anti-Fingerprinting pipeline (Python + JavaScript) based on seed-based patches for Canvas/WebGL/WebGPU/Fonts/Headers  

Русская версия: см. Readme_RUS.md

What this project is about
The system has been designed to evaluate and mitigate modern browser fingerprinting surfaces (Canvas, WebGL, Fonts, Client Hints, Headers, etc.).

Architecture
Python (Selenium + undetected_chromedriver) + JavaScript patches (modules) injection via CDP to control fingerprint surfaces (Canvas 2D/OffscreenCanvas, WebGL/WebGPU, Fonts, UA-CH/Headers), a proxy application is available as a switchable option.

Ethics & scope

The tools are intended for testing, debugging and research purposes only. Do not use to bypass security controls or violate site policies or laws.
This is a privacy research tool and detector resilience tester. Remember that you are responsible for how you use it.

Important disclaimer

This is not a "silver bullet" or an anonymity toolkit. Modern FP techniques (TLS fingerprints, behavioral checks, WebGL/WebGPU constraints, AudioContext API updates, etc.) can correlate sessions and reveal environments even with patches. Partial control of the surface does not provide full anonymity.

Project goals

Examine the browser "from the inside" to identify the APIs in use and any data-leak channels that are employed.
Understand how fonts, WebGL, Client Hints, plug-ins and other components affect the fingerprint.
Maintain oversight of fingerprinting and its replication through profiling and network layer management.

Configuration & principles

There is no hardcoding: the values of the variables are not hardwired when it is possible; instead, they are compiled into dictionaries and exported to window.__*. Then, they are assigned to the respective profile/navigator object and etc. fields.
MDN/Chromium compatibility: hooks (try to) stay within native API boundaries.
__GLOBAL_SEED / DPR / device metrics: synchronized through initialization variables.


Project status

Research / non-commercial; released “as is”. No stability guarantees.
Built by a single author — scenario/OS coverage is limited. Forks and contributions are welcome.
See Issues/TODO for applicability limitations.
Executed only on Windows + ProtonVPN (OpenVPN CLI). Other OS/VPNs not tested.
Freeze date: 2025-09-11 (docs & fixes will be considered).
In sum, the pipeline is being initialised and the script is being executed. The designated tasks are being carried out, just several surfaces have been patched.

License

The Unlicense (Public Domain). Copyright and related rights are waived
to the extent possible. You may copy, modify, publish, use, compile, sell,
and distribute, with or without attribution. Software is provided “AS IS”.

Requirements

OS: Windows 10/11 (batch files and VPN assume Windows).
Python: 3.12 (3.11+ recommended).

3rd-party

OpenVPN installed locally (default path is set in vpn module, can be changed).
mitmproxy (in requirements.txt).
Chrome/Chromium — local copy of Chrome for Testing used, path configured in main.py.
All Python deps are pinned in requirements.txt.


Run modes

With mitmproxy (main.py)

✔ Easier browsing without immediate challenges.

✔ CORS/headers/Client Hints direct visibility.

✖ Requires installing/setting up mitmproxy.

✖ Detectors may identify mitmproxy TLS fingerprints as not "native".



Without mitmproxy (main_no_proxy.py)

✔ Fewer external deps.

✖ Harder for real browsing due to CORS constraints, useful as a “pure API/JS” model.

Note: VPN usage is enforced in both modes; the script was not run/tested without VPN.




Issues/TODO

 Synchronize window ↔ WorkerScope from the start (language(s), hardwareConcurrency, deviceMemory, userAgentData via Hub; getters on WorkerNavigator.prototype).

 Integrate getClientRects / getBoundingClientRect proxying.

 Polish toBlob / convertToBlob hooks to avoid Illegal invocation on edge cases.

 Fix Adapter “core-features-and-limits” for WebGPU.

 Switch hooks patching to prototypes (not instances) + correct descriptors.

 Implement TLS fingerprint rotation via OpenSSL.

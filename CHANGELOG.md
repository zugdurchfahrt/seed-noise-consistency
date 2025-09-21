# Changelog


21.09.2025
## \[Unreleased\]

### Added

-   set_log.js  - The "G.__DEBUG__" debug flag now works properly, and setting it to "false" stops JavaScript logging. Unfortunately, however, the log still displays the Undetected chromedriver notification.


### Changed

-   Language detection functions have been improved. The detection of English as a second language  has been removed. The function now returns only the language(s) based on geographic location.
-   vpn_utils.py — The DNS dependency in "sanity-check" has been removed from connect(). TThis eliminates a 10–15-second “freeze” during DNS resolution.

### Fixed

-   Various minor fixes and improvements.


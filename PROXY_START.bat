@echo off
cd /d C:\YOUR\FOLDER\PATH
call C:\YOUR_VENV\PATH\venv\Scripts\activate.bat

REM Run mitmproxy in a separate window with a log
start "mitmproxy" cmd /k "mitmproxy -s handle_cors_addon.py -v > proxy_error_log.txt 2>&1"

REM Wait 2 seconds to ensure proxy starts
timeout /t 2

REM Enter the name of the python script to run
set /p scriptname=Enter script name:

REM Run python script
python %scriptname%

pause

@echo off
cd /d C:\55555\switch\your_folder
call C:\55555\switch\venv\Scripts\activate.bat

REM Запусти mitmproxy в отдельном окне с логом
start "mitmproxy" cmd /k "mitmproxy -s handle_cors_addon.py -v > proxy_error_log.txt 2>&1"

REM Жди 1 секунды для гарантированного запуска прокси
timeout /t 1

REM Введи имя python-скрипта для запуска
set /p scriptname=Введите имя скрипта (например, myscript.py):

REM Запусти python-скрипт
python %scriptname%

pause

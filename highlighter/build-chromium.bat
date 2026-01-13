@echo off
REM Build script for Chrome/Edge extension
echo Building Keyword Highlighter for Chrome/Edge...

REM Copy Chromium manifest
copy /Y manifest.chromium.json manifest.json

echo.
echo Chrome/Edge build ready!
echo To install:
echo 1. Open Chrome/Edge and go to chrome://extensions/ or edge://extensions/
echo 2. Enable "Developer mode"
echo 3. Click "Load unpacked"
echo 4. Select this directory
echo.
pause

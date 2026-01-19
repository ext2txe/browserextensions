@echo off
REM ========================================
REM Switch All Extensions to Chromium
REM ========================================
echo.
echo ========================================
echo Switching ALL Extensions to Chromium
echo ========================================
echo.

REM Extensions with dual manifests
set "EXTENSIONS=highlighter history-search-extension jobpostanalysis listnavigator loadmore udemy_search"

for %%E in (%EXTENSIONS%) do (
    if exist "%%E\manifest-cr.json" (
        echo [%%E] Switching to Chromium...
        copy /Y "%%E\manifest-cr.json" "%%E\manifest.json" >nul
        if errorlevel 1 (
            echo   [ERROR] Failed to switch %%E
        ) else (
            echo   [OK] Chromium manifest active
        )
    ) else (
        echo [%%E] No Chromium manifest found - skipping
    )
    echo.
)

echo.
echo ========================================
echo All extensions switched to Chromium!
echo ========================================
echo.
echo Next steps:
echo 1. Open Chrome/Edge
echo 2. Go to chrome://extensions or edge://extensions
echo 3. Enable "Developer mode"
echo 4. Click "Reload" on each extension
echo.
echo Extensions should now show [CR] in their names
echo.
pause

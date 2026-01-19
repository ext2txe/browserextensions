@echo off
REM ========================================
REM Switch All Extensions to Firefox
REM ========================================
echo.
echo ========================================
echo Switching ALL Extensions to Firefox
echo ========================================
echo.

REM Extensions with dual manifests
set "EXTENSIONS=highlighter history-search-extension jobpostanalysis listnavigator loadmore udemy_search"

for %%E in (%EXTENSIONS%) do (
    if exist "%%E\manifest-ff.json" (
        echo [%%E] Switching to Firefox...
        copy /Y "%%E\manifest-ff.json" "%%E\manifest.json" >nul
        if errorlevel 1 (
            echo   [ERROR] Failed to switch %%E
        ) else (
            echo   [OK] Firefox manifest active
        )
    ) else (
        echo [%%E] No Firefox manifest found - skipping
    )
    echo.
)

echo.
echo ========================================
echo All extensions switched to Firefox!
echo ========================================
echo.
echo Next steps:
echo 1. Open Firefox
echo 2. Go to about:debugging#/runtime/this-firefox
echo 3. Reload each extension
echo.
echo Extensions should now show [FF] in their names
echo.
pause

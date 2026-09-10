@echo off
setlocal

REM ============================================================
REM  Playwright Daily Auto-Push Script
REM  Runs: typecheck -> tests -> tracker -> commit -> push
REM  Logs everything to Desktop\playwright-push.log
REM ============================================================

REM cd to the folder where this .bat file lives (works from any location)
cd /d "%~dp0"

set LOGFILE=%~dp0playwright-push.log

echo. >> "%LOGFILE%"
echo ============================================================ >> "%LOGFILE%"
echo Run at: %date% %time% >> "%LOGFILE%"
echo Working dir: %CD% >> "%LOGFILE%"
echo ============================================================ >> "%LOGFILE%"

REM ---------- Step 1: Type check ----------
echo [1/5] Typecheck >> "%LOGFILE%"
call npm run typecheck >> "%LOGFILE%" 2>&1
if errorlevel 1 (
    echo FAILED: typecheck >> "%LOGFILE%"
    endlocal
    exit /b 1
)

REM ---------- Step 2: Run Playwright tests ----------
echo [2/5] Tests >> "%LOGFILE%"
call npm test >> "%LOGFILE%" 2>&1
if errorlevel 1 (
    echo FAILED: tests >> "%LOGFILE%"
    endlocal
    exit /b 1
)

REM ---------- Step 3: Regenerate dashboard ----------
echo [3/5] Tracker >> "%LOGFILE%"
call npm run track >> "%LOGFILE%" 2>&1
if errorlevel 1 (
    echo FAILED: tracker >> "%LOGFILE%"
    endlocal
    exit /b 1
)

REM ---------- Step 4: Commit everything ----------
echo [4/5] Commit >> "%LOGFILE%"
git add . >> "%LOGFILE%" 2>&1
git commit -m "auto-push: %date% %time%" --allow-empty >> "%LOGFILE%" 2>&1
if errorlevel 1 (
    echo WARNING: nothing to commit (continuing) >> "%LOGFILE%"
)

REM ---------- Step 5: Push to GitHub ----------
echo [5/5] Push >> "%LOGFILE%"
git push >> "%LOGFILE%" 2>&1
if errorlevel 1 (
    echo FAILED: git push >> "%LOGFILE%"
    endlocal
    exit /b 1
)

echo SUCCESS: pushed at %date% %time% >> "%LOGFILE%"
echo ============================================================ >> "%LOGFILE%"
endlocal
exit /b 0
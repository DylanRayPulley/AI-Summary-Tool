@echo off
setlocal

REM Change to the directory where this script lives
cd /d "%~dp0"

echo.
echo === AI Note Assistant ===

REM Ensure dependencies are installed
if not exist "node_modules" (
  echo node_modules not found. Running npm install, this may take a while...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo npm install failed. Press any key to exit.
    pause >nul
    exit /b 1
  )
)

REM Ensure a production build exists
if not exist ".next" (
  echo Production build not found. Running npm run build...
  call npm.cmd run build
  if errorlevel 1 (
    echo.
    echo Build failed. Press any key to exit.
    pause >nul
    exit /b 1
  )
)

echo Starting server on http://localhost:3000 ...
start "" "http://localhost:3000"
call npm.cmd run start
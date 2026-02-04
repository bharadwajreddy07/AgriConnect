@echo off
echo ========================================
echo Restarting AgriMart Backend Server
echo ========================================
echo.
echo Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting backend server...
cd /d "%~dp0"
node server.js

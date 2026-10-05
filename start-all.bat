@echo off
title PERFORMX - Employee Performance Management System
echo ==========================================================
echo   PERFORMX - Launching Backend and Frontend Services
echo ==========================================================
echo.
echo Launching Spring Boot backend on http://localhost:8080 ...
start "PERFORMX Backend" cmd /c "%~dp0run-backend.bat"

echo Waiting 5 seconds for backend initialization...
timeout /t 5 /nobreak >nul

echo Launching React frontend on http://localhost:5173 ...
start "PERFORMX Frontend" cmd /c "%~dp0run-frontend.bat"

echo.
echo ==========================================================
echo   Services Launched!
echo   Open your browser at: http://localhost:5173
echo ==========================================================
pause

@echo off
title PERFORMX Frontend (Vite + React)
echo ===================================================
echo   Starting PERFORMX Frontend on http://localhost:5173
echo ===================================================
cd /d "%~dp0performx-frontend"
call npm run dev
pause

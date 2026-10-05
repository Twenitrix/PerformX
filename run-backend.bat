@echo off
title PERFORMX Backend (Spring Boot 3)
echo ===================================================
echo   Starting PERFORMX Backend API on http://localhost:8080
echo   H2 Console: http://localhost:8080/h2-console
echo ===================================================
cd /d "%~dp0performx-backend"
call "..\.tools\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
pause

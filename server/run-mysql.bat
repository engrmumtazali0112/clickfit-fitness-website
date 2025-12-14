@echo off
echo ========================================
echo Starting ClickFit with MySQL Database
echo ========================================
echo.

REM Check if another server is running
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 3000 is already in use!
    echo Killing existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    echo ✅ Killed existing process.
)

echo Creating MySQL environment file...
(
    echo DATABASE_TYPE=mysql
    echo DATABASE_HOST=localhost
    echo DATABASE_USERNAME=clickfit_user
    echo DATABASE_PASSWORD=ClickFit2024!
    echo DATABASE_NAME=clickfit_db
    echo PORT=3000
) > .env

echo.
echo 🚀 Starting server with MySQL...
echo.
nodemon server.js

pause
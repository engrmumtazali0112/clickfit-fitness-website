@echo off
cd /d "%~dp0server"

echo ========================================
echo CLICKFIT QUICK START
echo ========================================
echo.
echo Choose database type:
echo 1. MySQL (Local Development)
echo 2. Turso (Vercel/Production)
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    call run-mysql.bat
) else if "%choice%"=="2" (
    call run-turso.bat
) else (
    echo Invalid choice. Using default (MySQL)...
    call run-mysql.bat
) 
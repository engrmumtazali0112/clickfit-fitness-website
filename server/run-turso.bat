@echo off
echo ========================================
echo Starting ClickFit with Turso Database
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

echo Creating Turso environment file...
(
    echo DATABASE_TYPE=turso
    echo TURSO_DATABASE_URL=libsql://clickfit-db-vercel-icfg-sg2aam83vn0bjlnpfwmileet.aws-us-east-1.turso.io
    echo TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjU3NDUwMzQsImlkIjoiMmM1YzUyZjEtOTQ0Ny00YzQ4LWFiYTEtN2MyNTczYTA3NTY0IiwicmlkIjoiNzBmNDUwNGUtZGZjZS00MTIyLTkzZmEtN2M4MzY3MWU2NDI0In0.CqujQOilROckiSRfPATQ5RFqPE0mHTvZOQh0HHo-3zg8c0DEOjcXLpUeZPTDp17_Yh-v5ONBcdLLMvflUWg_Bg
    echo PORT=3000
) > .env

echo.
echo 🚀 Starting server with Turso...
echo.
nodemon server.js

pause
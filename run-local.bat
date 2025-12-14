@echo off
echo Starting ClickFit with MySQL (Local)...
echo.
cd server
copy .env.local .env
npm start
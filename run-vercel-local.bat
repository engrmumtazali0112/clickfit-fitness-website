@echo off
echo Testing ClickFit with Turso (Local)...
echo.
cd server
copy .env.vercel .env
npm start
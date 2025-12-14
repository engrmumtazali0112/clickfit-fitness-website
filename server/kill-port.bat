@echo off
echo Killing process on port 3000...

FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3000') DO (
    echo Found PID: %%P
    taskkill /PID %%P /F
)

echo Done!
echo Now you can run: npm start
pause
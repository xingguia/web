@echo off
echo Stopping existing services...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM nginx.exe >nul 2>&1

echo Starting Nginx...
cd /d "D:\nginx-1.24.0"
start nginx.exe

echo Starting Node.js Backend...
cd /d "D:\webqimo"
start "Mini Ecommerce API" cmd /k "npm start"

echo ==========================================
echo Services Restarted Successfully!
echo Please refresh your browser (Ctrl + F5)
echo ==========================================
pause
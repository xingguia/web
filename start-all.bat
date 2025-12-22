@echo off
echo ==========================================
echo      Mini E-Commerce Startup Script
echo ==========================================

echo [1/4] Checking MySQL Service...
sc query MySQL80 >nul 2>&1
if %errorlevel% neq 0 (
    echo MySQL service not found or not running. Trying to start...
    net start MySQL80
) else (
    echo MySQL is running.
)

echo [2/4] Starting Nginx...
cd /d "D:\nginx-1.24.0"
start nginx.exe
echo Nginx started.

echo [3/4] Starting Node.js Backend...
cd /d "D:\webqimo"
start "Mini Ecommerce API" cmd /k "npm start"
echo Node.js backend started in a new window.

echo [4/4] Starting cpolar (Intranet Penetration)...
cd /d "Z:\cpolar内网穿透"
start "cpolar Tunnel" cmd /k "cpolar http 80"
echo cpolar started in a new window.

echo ==========================================
echo      All Services Started! 🚀
echo      - API: http://localhost:3000
echo      - Website (Local): http://localhost
echo      - Check cpolar window for Public URL
echo ==========================================
pause

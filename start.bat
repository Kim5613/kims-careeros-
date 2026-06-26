@echo off
cd /d D:\AI\hr-platform
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
rmdir /s /q node_modules\.prisma >nul 2>&1
call npm run dev

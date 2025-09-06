@echo off
echo ========================================
echo    学生违纪表彰通报系统 - 开发模式
echo ========================================
echo.

echo 🚀 启动开发环境...
echo 📱 将同时启动Vue开发服务器和Electron应用
echo.

set ELECTRON_SHOW_DEV_TOOLS=true
call npm run electron:dev

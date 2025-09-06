@echo off
echo ========================================
echo    学生违纪表彰通报系统 - 构建脚本
echo ========================================
echo.

echo 🔄 开始构建应用...
echo.

echo 📦 安装依赖...
call npm install

echo.
echo 🏗️ 构建Vue应用...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vue应用构建失败
    pause
    exit /b 1
)

echo.
echo 📱 打包Electron应用...
call npm run electron:pack

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Electron应用打包失败
    pause
    exit /b 1
)

echo.
echo ✅ 构建完成！
echo 📂 安装包位置: dist_electron\
echo.

pause

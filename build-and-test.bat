@echo off
echo ========================================
echo    构建并测试Electron应用
echo ========================================
echo.

echo 🧹 清理旧文件...
if exist "dist" rmdir /s /q "dist"
if exist "dist_electron" rmdir /s /q "dist_electron"

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
echo 📁 检查构建文件...
if not exist "dist\index.html" (
    echo ❌ 找不到 dist\index.html
    pause
    exit /b 1
) else (
    echo ✅ 找到 dist\index.html
)

echo.
echo 🔧 测试Electron（开发模式）...
timeout /t 3 /nobreak
call npm run electron

echo.
echo 📱 打包Electron应用...
call npm run electron:pack

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Electron应用打包失败
    pause
    exit /b 1
)

echo.
echo ✅ 构建和打包完成！
echo 📂 安装包位置: dist_electron\
echo.

pause

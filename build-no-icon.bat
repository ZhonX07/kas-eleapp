@echo off
echo ========================================
echo    快速构建 - 无自定义图标版本
echo ========================================
echo.

echo 🔄 开始构建应用（使用默认图标）...
echo.

echo 📦 检查依赖...
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
echo 📱 打包Electron应用（无自定义图标）...
call npm run electron:pack

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Electron应用打包失败
    echo.
    echo 💡 可能的解决方案：
    echo 1. 运行 prepare-icons.bat 准备图标文件
    echo 2. 或修改 package.json 移除图标配置
    pause
    exit /b 1
)

echo.
echo ✅ 构建完成！
echo 📂 安装包位置: dist_electron\
echo ⚠️  使用了默认Electron图标
echo.

pause

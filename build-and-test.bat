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

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

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
    echo ❌ 找不到 dist\index.html，Vue构建可能失败
    echo 当前目录内容:
    dir /B
    if exist "dist" (
        echo dist目录内容:
        dir dist /B
    )
    pause
    exit /b 1
) else (
    echo ✅ 找到 dist\index.html
    echo 📋 dist目录内容:
    dir dist /B
)

echo.
echo 🔧 检查关键文件...
if not exist "main.cjs" (
    echo ❌ 找不到 main.cjs
    pause
    exit /b 1
) else (
    echo ✅ 找到 main.cjs
)

if not exist "preload.js" (
    echo ❌ 找不到 preload.js
    pause
    exit /b 1
) else (
    echo ✅ 找到 preload.js
)

echo.
echo 🔧 创建临时图标文件（如果需要）...
if not exist "build" mkdir build
if not exist "build\icon.ico" (
    echo 创建默认图标文件...
    echo. > "build\icon.ico"
)

echo.
echo 📱 打包Electron应用...
call npm run electron:pack

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Electron应用打包失败
    echo 可能的原因:
    echo 1. dist目录不存在或为空
    echo 2. 图标文件不符合要求
    echo 3. 配置文件有误
    pause
    exit /b 1
)

echo.
echo 📋 检查打包结果...
if exist "dist_electron\win-unpacked" (
    echo ✅ 打包目录存在
    echo 打包目录内容:
    dir "dist_electron\win-unpacked" /B
    
    echo.
    echo 检查关键文件:
    if exist "dist_electron\win-unpacked\main.cjs" (
        echo ✅ main.cjs 存在
    ) else (
        echo ❌ main.cjs 不存在
    )
    
    if exist "dist_electron\win-unpacked\preload.js" (
        echo ✅ preload.js 存在
    ) else (
        echo ❌ preload.js 不存在
    )
    
    if exist "dist_electron\win-unpacked\dist\index.html" (
        echo ✅ dist\index.html 存在
    ) else (
        echo ❌ dist\index.html 不存在
    )
    
    if exist "dist_electron\win-unpacked\resources\app\dist\index.html" (
        echo ✅ resources\app\dist\index.html 存在
    ) else (
        echo ❌ resources\app\dist\index.html 不存在
    )
    
) else (
    echo ❌ 打包失败 - dist_electron\win-unpacked 目录不存在
    echo 检查错误日志...
    pause
    exit /b 1
)

echo.
echo ✅ 构建和打包完成！
echo 📂 安装包位置: dist_electron\
echo 🚀 查找可执行文件...

for %%f in ("dist_electron\win-unpacked\*.exe") do (
    echo 找到可执行文件: %%f
    echo 准备测试启动...
    timeout /t 2 /nobreak
    start "" "%%f"
    echo 应用已启动，请检查是否正常运行
    goto :found
)

echo ⚠️ 未找到.exe文件
:found

echo.
pause

@echo off
echo ========================================
echo          调试构建过程
echo ========================================

echo 1. 检查当前目录文件...
dir /B

echo.
echo 2. 清理旧文件...
if exist dist rmdir /s /q dist
if exist dist_electron rmdir /s /q dist_electron

echo.
echo 3. 构建Vue应用...
call npm run build

echo.
echo 4. 检查构建结果...
if exist dist (
    echo ✅ dist目录存在
    echo dist目录内容:
    dir dist /B
    if exist "dist\index.html" (
        echo ✅ index.html文件存在
    ) else (
        echo ❌ index.html文件不存在
    )
) else (
    echo ❌ dist目录不存在
    echo 构建可能失败
    pause
    exit /b 1
)

echo.
echo 5. 打包Electron应用...
call npm run electron:pack

echo.
echo 6. 检查打包结果...
if exist "dist_electron\win-unpacked" (
    echo ✅ 打包目录存在
    echo 打包目录内容:
    dir "dist_electron\win-unpacked" /B
    
    if exist "dist_electron\win-unpacked\dist" (
        echo ✅ dist文件夹已打包
        dir "dist_electron\win-unpacked\dist" /B
    ) else (
        echo ❌ dist文件夹未打包
    )
) else (
    echo ❌ 打包失败
)

echo.
echo 调试完成，按任意键退出...
pause

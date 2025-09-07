@echo off
echo ========================================
echo    清理进程和锁定文件
echo ========================================
echo.

echo ? 查找可能锁定文件的进程...
tasklist /fi "imagename eq electron.exe" /fo table
tasklist /fi "imagename eq 学生违纪表彰通报系统.exe" /fo table

echo.
echo ? 正在关闭可能的残留进程...
taskkill /f /im electron.exe 2>nul
taskkill /f /im 学生违纪表彰通报系统.exe 2>nul

echo.
echo ?? 清理打包目录...
if exist "dist_electron" (
    rmdir /s /q "dist_electron"
    echo ? 清理完成
) else (
    echo ?? 没有找到 dist_electron 目录
)

echo.
echo ? 建议在执行打包前:
echo 1. 确保所有应用实例已关闭
echo 2. 重启 VS Code 或命令行
echo 3. 运行 npm run electron:pack
echo.

pause

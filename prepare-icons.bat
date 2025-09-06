@echo off
echo ========================================
echo     准备应用图标文件
echo ========================================
echo.

if not exist "build" mkdir build

echo 正在检查图标文件...
echo.

set ICON_MISSING=0

if not exist "build\icon.ico" (
    echo ❌ 缺少 Windows 图标: build\icon.ico
    set ICON_MISSING=1
)

if not exist "build\icon.icns" (
    echo ❌ 缺少 macOS 图标: build\icon.icns
    set ICON_MISSING=1
)

if not exist "build\icon.png" (
    echo ❌ 缺少 Linux 图标: build\icon.png
    set ICON_MISSING=1
)

if %ICON_MISSING%==1 (
    echo.
    echo 🔧 建议的解决方案：
    echo.
    echo 1. 访问在线图标生成器：
    echo    https://www.icoconverter.com/
    echo.
    echo 2. 上传一个 512x512 的 PNG 图片
    echo.
    echo 3. 下载生成的图标文件：
    echo    - icon.ico ^(Windows^)
    echo    - icon.icns ^(macOS^)
    echo    - icon.png ^(Linux^)
    echo.
    echo 4. 将文件放置在 build\ 目录中
    echo.
    echo 5. 重新运行构建命令
    echo.
    echo 或者，您可以暂时去掉图标配置，使用默认图标。
    echo.
    pause
) else (
    echo ✅ 所有图标文件已就绪！
    echo.
)

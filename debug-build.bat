@echo off
echo ========================================
echo          调试构建过程
echo ========================================

echo 1. 检查当前目录文件...
echo 当前目录: %CD%
dir /B

echo.
echo 2. 检查package.json配置...
if exist "package.json" (
    echo ✅ package.json 存在
    findstr "\"main\":" package.json
    findstr "\"build\":" package.json
) else (
    echo ❌ package.json 不存在
    pause
    exit /b 1
)

echo.
echo 3. 清理旧文件...
if exist dist rmdir /s /q dist
if exist dist_electron rmdir /s /q dist_electron

echo.
echo 4. 检查依赖...
call npm list --depth=0

echo.
echo 5. 构建Vue应用...
echo 开始Vue构建...
call npm run build

echo.
echo 6. 详细检查构建结果...
if exist dist (
    echo ✅ dist目录存在
    echo dist目录大小和内容:
    dir dist
    
    if exist "dist\index.html" (
        echo ✅ index.html文件存在
        echo 📄 index.html 详细信息:
        dir "dist\index.html"
        echo.
        echo 📄 index.html 前几行内容:
        type "dist\index.html" | more /n +1
    ) else (
        echo ❌ index.html文件不存在
    )
    
    echo.
    echo 检查其他关键文件:
    if exist "dist\assets" (
        echo ✅ assets目录存在
        dir "dist\assets" /B
    ) else (
        echo ⚠️ assets目录不存在
    )
) else (
    echo ❌ dist目录不存在 - Vue构建失败
    echo 检查构建错误...
    pause
    exit /b 1
)

echo.
echo 7. 检查Electron配置...
if exist "main.cjs" (
    echo ✅ main.cjs 存在
) else (
    echo ❌ main.cjs 不存在
)

if exist "preload.js" (
    echo ✅ preload.js 存在
) else (
    echo ❌ preload.js 不存在
)

echo.
echo 8. 准备打包...
echo 创建build目录（如果需要）...
if not exist "build" mkdir build

echo.
echo 9. 执行Electron打包...
echo 打包命令: npm run electron:pack
call npm run electron:pack

echo.
echo 10. 详细检查打包结果...
if exist "dist_electron" (
    echo ✅ dist_electron目录存在
    echo dist_electron目录内容:
    dir "dist_electron" /B
    
    if exist "dist_electron\win-unpacked" (
        echo ✅ win-unpacked目录存在
        echo win-unpacked目录内容:
        dir "dist_electron\win-unpacked" /B
        
        echo.
        echo 检查文件结构层次:
        echo [根目录文件]
        dir "dist_electron\win-unpacked\*.cjs" "dist_electron\win-unpacked\*.json" "dist_electron\win-unpacked\*.exe" 2>nul
        
        echo.
        echo [dist目录]
        if exist "dist_electron\win-unpacked\dist" (
            echo ✅ dist文件夹存在于根目录
            dir "dist_electron\win-unpacked\dist" /B
        ) else (
            echo ❌ dist文件夹不存在于根目录
        )
        
        echo.
        echo [resources目录结构]
        if exist "dist_electron\win-unpacked\resources" (
            echo ✅ resources目录存在
            if exist "dist_electron\win-unpacked\resources\app" (
                echo ✅ resources\app目录存在
                if exist "dist_electron\win-unpacked\resources\app\dist" (
                    echo ✅ resources\app\dist目录存在
                    dir "dist_electron\win-unpacked\resources\app\dist" /B
                ) else (
                    echo ❌ resources\app\dist目录不存在
                }
            ) else (
                echo ❌ resources\app目录不存在
            }
        ) else (
            echo ❌ resources目录不存在
        }
        
    ) else (
        echo ❌ win-unpacked目录不存在
    }
) else (
    echo ❌ dist_electron目录不存在 - 打包完全失败
)

echo.
echo 11. 查找可执行文件...
if exist "dist_electron\win-unpacked" (
    echo 搜索.exe文件...
    dir "dist_electron\win-unpacked\*.exe" /B 2>nul && (
        echo ✅ 找到可执行文件
    ) || (
        echo ❌ 未找到.exe文件
    }
) else (
    echo 无法搜索 - 目录不存在
)

echo.
echo ================================
echo 调试完成！
echo ================================
echo 如果构建成功，可执行文件应该在:
echo dist_electron\win-unpacked\
echo.
echo 如果失败，请检查上面的错误信息
echo ================================
pause

@echo off
echo ========================================
echo    ������̺������ļ�
echo ========================================
echo.

echo ? ���ҿ��������ļ��Ľ���...
tasklist /fi "imagename eq electron.exe" /fo table
tasklist /fi "imagename eq ѧ��Υ�ͱ���ͨ��ϵͳ.exe" /fo table

echo.
echo ? ���ڹرտ��ܵĲ�������...
taskkill /f /im electron.exe 2>nul
taskkill /f /im ѧ��Υ�ͱ���ͨ��ϵͳ.exe 2>nul

echo.
echo ?? ������Ŀ¼...
if exist "dist_electron" (
    rmdir /s /q "dist_electron"
    echo ? �������
) else (
    echo ?? û���ҵ� dist_electron Ŀ¼
)

echo.
echo ? ������ִ�д��ǰ:
echo 1. ȷ������Ӧ��ʵ���ѹر�
echo 2. ���� VS Code ��������
echo 3. ���� npm run electron:pack
echo.

pause

@echo off
chcp 65001 > nul
echo ======================================================
echo   🚀 កម្មវិធីជំនួយ Upload កូដទៅកាន់ GitHub
echo   (English for Education Studies I LMS)
echo ======================================================
echo.

cd /d "%~dp0"

echo ថតបច្ចុប្បន្ន: %CD%
echo.

set /p REPO_URL="សូមចម្លង Link GitHub Repository របស់អ្នកមក Paste ទីនេះ រួចចុច Enter: "

if "%REPO_URL%"=="" (
    echo [ERROR] អ្នកមិនទាន់បានបញ្ចូល Link GitHub ឡើយ!
    pause
    exit /b
)

echo.
echo កំពុងភ្ជាប់ទៅកាន់ GitHub...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main

echo.
echo កំពុង Upload (Push) កូដឡើងទៅ GitHub...
echo ប្រសិនបើមានផ្ទាំង browser លោតឡើង សូមចុច "Sign in with your browser"
echo.

git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ======================================================
    echo   🎉 អបអរសាទរ! កូដត្រូវបាន Upload ឡើង GitHub ជោគជ័យ ១០០%!
    echo ======================================================
) else (
    echo ======================================================
    echo   ⚠️ មានបញ្ហាក្នុងការ Push! សូមពិនិត្យមើល Link ឬការ Login GitHub។
    echo ======================================================
)
echo.
pause


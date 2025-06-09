@echo off
REM Deployment test script for GitHub Pages (Windows)

echo 🚀 Testing GitHub Pages deployment setup...

REM Check if build directory exists
if exist "out\" (
    echo ✅ Build directory exists
) else (
    echo ❌ Build directory missing - run 'npm run build' first
    exit /b 1
)

REM Check for .nojekyll file
if exist "out\.nojekyll" (
    echo ✅ .nojekyll file exists
) else (
    echo ⚠️  .nojekyll file missing - GitHub Pages may not serve assets correctly
    echo. > out\.nojekyll
    echo ✅ Created .nojekyll file
)

REM Check for index.html
if exist "out\index.html" (
    echo ✅ index.html exists
) else (
    echo ❌ index.html missing
    exit /b 1
)

REM Check for CSS files
if exist "out\_next\static\css\*.css" (
    echo ✅ CSS files found
) else (
    echo ❌ CSS files missing
    exit /b 1
)

REM Check for JS files
if exist "out\_next\static\chunks\*.js" (
    echo ✅ JavaScript files found
) else (
    echo ❌ JavaScript files missing
    exit /b 1
)

REM Check asset prefix in index.html
findstr /C:"/GitScore-Copilot/_next" "out\index.html" >nul
if %errorlevel% == 0 (
    echo ✅ Asset prefix configured correctly
) else (
    echo ⚠️  Asset prefix may not be configured correctly
)

echo 🎉 Deployment test completed successfully!
echo 📝 Next steps:
echo    1. Commit and push your changes
echo    2. Check GitHub Actions workflow
echo    3. Verify GitHub Pages settings (Source: GitHub Actions)
echo    4. Site will be available at: https://yourusername.github.io/GitScore-Copilot

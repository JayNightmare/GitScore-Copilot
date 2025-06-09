#!/bin/bash
# Deployment test script for GitHub Pages

echo "🚀 Testing GitHub Pages deployment setup..."

# Check if build directory exists
if [ -d "out" ]; then
    echo "✅ Build directory exists"
else
    echo "❌ Build directory missing - run 'npm run build' first"
    exit 1
fi

# Check for .nojekyll file
if [ -f "out/.nojekyll" ]; then
    echo "✅ .nojekyll file exists"
else
    echo "⚠️  .nojekyll file missing - GitHub Pages may not serve assets correctly"
    touch out/.nojekyll
    echo "✅ Created .nojekyll file"
fi

# Check for index.html
if [ -f "out/index.html" ]; then
    echo "✅ index.html exists"
else
    echo "❌ index.html missing"
    exit 1
fi

# Check for CSS files
if ls out/_next/static/css/*.css 1> /dev/null 2>&1; then
    echo "✅ CSS files found"
else
    echo "❌ CSS files missing"
    exit 1
fi

# Check for JS files
if ls out/_next/static/chunks/*.js 1> /dev/null 2>&1; then
    echo "✅ JavaScript files found"
else
    echo "❌ JavaScript files missing"
    exit 1
fi

# Check asset prefix in index.html
if grep -q "/GitScore-Copilot/_next" out/index.html; then
    echo "✅ Asset prefix configured correctly"
else
    echo "⚠️  Asset prefix may not be configured correctly"
fi

echo "🎉 Deployment test completed successfully!"
echo "📝 Next steps:"
echo "   1. Commit and push your changes"
echo "   2. Check GitHub Actions workflow"
echo "   3. Verify GitHub Pages settings (Source: GitHub Actions)"
echo "   4. Site will be available at: https://yourusername.github.io/GitScore-Copilot"

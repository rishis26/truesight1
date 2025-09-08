#!/bin/bash

echo "🚀 trueSight Deployment Script"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ dist folder not found after build"
    exit 1
fi

echo "📁 Build output:"
ls -la dist/

echo ""
echo "🎉 Deployment ready!"
echo "================================"
echo "📂 Deploy the 'dist' folder to your hosting service"
echo "🌐 Or run 'npm start' to serve locally on port 3000"
echo ""
echo "📋 Next steps:"
echo "1. Upload 'dist' folder to your hosting service"
echo "2. Or run: npm start"
echo "3. Access at: http://localhost:3000"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"

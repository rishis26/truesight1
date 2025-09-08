#!/bin/bash

# Start the development server with proper network configuration
echo "Starting trueSight Threat Detection System..."
echo "Server will be available at:"
echo "  Local: http://localhost:5173"
echo "  Network: http://[your-ip]:5173"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the development server
echo "Starting development server..."
npm run dev

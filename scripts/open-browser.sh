#!/bin/bash

# Open Browser Script for Resume Scanner
# This script opens the web application in a browser with optimal settings

echo "🚀 Opening Resume Scanner in browser..."

# Check if frontend server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Frontend server is not running on port 3000"
    echo "💡 Starting frontend server..."
    cd frontend && yarn dev --port 3000 &
    sleep 5
fi

# Check if backend server is running
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "⚠️  Backend server is not running on port 8000"
    echo "💡 You may need to start the backend server separately"
fi

# Open browser with optimal settings
echo "🌐 Opening browser..."

# Try Chrome first
if command -v google-chrome &> /dev/null; then
    google-chrome --new-window --window-position=100,100 --window-size=1400,900 http://localhost:3000
elif command -v google-chrome-stable &> /dev/null; then
    google-chrome-stable --new-window --window-position=100,100 --window-size=1400,900 http://localhost:3000
elif [ -d "/Applications/Google Chrome.app" ]; then
    open -a "Google Chrome" --args --new-window --window-position=100,100 --window-size=1400,900 http://localhost:3000
# Try Edge
elif command -v microsoft-edge &> /dev/null; then
    microsoft-edge --new-window --window-position=100,100 --window-size=1400,900 http://localhost:3000
elif [ -d "/Applications/Microsoft Edge.app" ]; then
    open -a "Microsoft Edge" --args --new-window --window-position=100,100 --window-size=1400,900 http://localhost:3000
# Try Firefox
elif command -v firefox &> /dev/null; then
    firefox --new-window --width=1400 --height=900 http://localhost:3000
elif [ -d "/Applications/Firefox.app" ]; then
    open -a "Firefox" --args --new-window --width=1400 --height=900 http://localhost:3000
# Fallback to default browser
else
    echo "🔍 Using default browser..."
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:3000
    elif command -v open &> /dev/null; then
        open http://localhost:3000
    else
        echo "❌ No suitable browser found"
        echo "💡 Please open http://localhost:3000 manually"
        exit 1
    fi
fi

echo "✅ Browser opened successfully!"
echo "🌐 URL: http://localhost:3000"
echo "💡 Tip: Use Cursor's debug panel for advanced debugging features"

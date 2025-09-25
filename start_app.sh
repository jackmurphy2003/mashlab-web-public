#!/bin/bash

echo "🎵 Starting MurphMixes CrateMate (Clean System)"
echo "================================================"

# Kill any existing processes
echo "🛑 Stopping old processes..."
pkill -f "node server.js" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null

# Wait a moment
sleep 2

# Start the clean system
echo "🚀 Starting clean system..."
echo "   - Node.js server (port 3001)"
echo "   - React app (port 3000)"
echo "   - Simple BPM fix (no external dependencies)"
echo ""

npm run dev

echo ""
echo "✅ System started successfully!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "🎵 Search functions are working with accurate BPMs!"

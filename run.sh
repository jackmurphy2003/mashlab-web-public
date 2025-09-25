#!/bin/bash

# MurphMixes CrateMate v1.2 Startup Script

echo "🎚️ Starting MurphMixes CrateMate v1.2..."

# Set Spotify credentials
export SPOTIPY_CLIENT_ID="4eb490047d4b443d89fa324ccfa33f3b"
export SPOTIPY_CLIENT_SECRET="046e259deff44902abc30d8fd2095fff"
export SPOTIPY_REDIRECT_URI="http://127.0.0.1:8503/callback"

echo "✅ Spotify credentials set!"
echo "   Client ID: ${SPOTIPY_CLIENT_ID:0:8}..."
echo "   Client Secret: ${SPOTIPY_CLIENT_SECRET:0:8}..."
echo "   Redirect URI: $SPOTIPY_REDIRECT_URI"
echo ""

# Clear Spotify cache for fresh start
rm -f .spotipy_cache
echo "🗑️  Cleared Spotify cache for fresh start"

# Run Streamlit on port 8503
echo "🚀 Starting Streamlit on http://127.0.0.1:8503"
echo "   Press Ctrl+C to stop the server"
echo ""

# Start Streamlit in background and open browser
streamlit run app.py --server.port 8503 --server.address 127.0.0.1 &
STREAMLIT_PID=$!

# Wait a moment for Streamlit to start
sleep 3

# Open browser automatically
echo "🌐 Opening browser..."
open http://127.0.0.1:8503

# Wait for Streamlit process
wait $STREAMLIT_PID

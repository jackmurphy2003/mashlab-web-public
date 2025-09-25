#!/bin/bash

echo "🎵 Starting MurphMixes with Spotify OAuth"
echo "=========================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "📝 Please create a .env file with:"
    echo "SPOTIPY_CLIENT_ID=your_spotify_client_id_here"
    echo "SPOTIPY_CLIENT_SECRET=your_spotify_client_secret_here"
    echo ""
    echo "🔗 Get your credentials from: https://developer.spotify.com/dashboard"
    echo "📋 Don't forget to add redirect URI: http://localhost:3000/callback"
    exit 1
fi

# Test OAuth setup
echo "🔧 Testing OAuth setup..."
python3 test_oauth.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ OAuth setup verified!"
    echo ""
    echo "🚀 Starting app..."
    echo "   URL: http://localhost:3000"
    echo "   Click 'Login with Spotify' to get audio features!"
    echo ""
    
    # Load environment variables and start app
    export $(cat .env | xargs)
    npm run dev
else
    echo ""
    echo "❌ OAuth setup failed. Please check your configuration."
    exit 1
fi

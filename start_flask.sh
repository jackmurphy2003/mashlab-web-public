#!/bin/bash

echo "🚀 Starting Flask backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing Flask dependencies..."
pip install -r requirements_flask.txt

# Set environment variables for development
export PREVIEW_SHARED_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2"
export FRONTEND_ORIGIN="http://localhost:3000"
export PORT=5000

echo "🌐 Starting Flask server on http://localhost:5000"
echo "📝 Environment:"
echo "   PREVIEW_SHARED_SECRET: Set"
echo "   FRONTEND_ORIGIN: http://localhost:3000"
echo "   PORT: 5000"

# Start Flask app
python flask_app.py

#!/usr/bin/env python3
"""
Test script to verify Spotify OAuth setup
"""

import os
from dotenv import load_dotenv
from spotify_oauth import SpotifyOAuth, init_spotify_auth

# Load environment variables
load_dotenv()

def test_oauth_setup():
    """Test the OAuth setup"""
    print("🔧 Testing Spotify OAuth Setup")
    print("=" * 40)
    
    # Check environment variables
    client_id = os.getenv("SPOTIPY_CLIENT_ID")
    client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        print("❌ Missing environment variables:")
        print("   - SPOTIPY_CLIENT_ID")
        print("   - SPOTIPY_CLIENT_SECRET")
        print("\n📝 Please set these in your .env file")
        print("\n🔧 Example .env file:")
        print("SPOTIPY_CLIENT_ID=your_spotify_client_id_here")
        print("SPOTIPY_CLIENT_SECRET=your_spotify_client_secret_here")
        print("SPOTIFY_REDIRECT_URI=http://localhost:3000/callback")
        return False
    
    print("✅ Environment variables found")
    
    # Test OAuth initialization
    try:
        oauth = SpotifyOAuth()
        print("✅ OAuth class initialized successfully")
        
        # Test authorization URL generation
        auth_url, state = oauth.get_authorization_url()
        print("✅ Authorization URL generated")
        print(f"   State: {state[:20]}...")
        print(f"   URL: {auth_url[:50]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ OAuth setup failed: {str(e)}")
        return False

def test_imports():
    """Test that all required modules can be imported"""
    print("\n📦 Testing Imports")
    print("=" * 20)
    
    try:
        import streamlit as st
        print("✅ streamlit imported")
    except ImportError as e:
        print(f"❌ streamlit import failed: {e}")
        return False
    
    try:
        from requests_oauthlib import OAuth2Session
        print("✅ requests_oauthlib imported")
    except ImportError as e:
        print(f"❌ requests_oauthlib import failed: {e}")
        return False
    
    try:
        from spotify_oauth import SpotifyOAuth
        print("✅ spotify_oauth imported")
    except ImportError as e:
        print(f"❌ spotify_oauth import failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🎵 Spotify OAuth Test Suite")
    print("=" * 50)
    
    # Test imports first
    if not test_imports():
        print("\n❌ Import tests failed. Please install missing dependencies.")
        exit(1)
    
    # Test OAuth setup
    if test_oauth_setup():
        print("\n✅ All tests passed!")
        print("\n🎯 Next steps:")
        print("1. Run: streamlit run app.py")
        print("2. Click 'Login with Spotify'")
        print("3. Grant permissions")
        print("4. Enjoy full audio features!")
    else:
        print("\n❌ OAuth setup failed. Please check your configuration.")
        exit(1)

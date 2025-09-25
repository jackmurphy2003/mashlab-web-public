import os
import json
import time
import streamlit as st
from requests_oauthlib import OAuth2Session
from urllib.parse import urlencode
import base64
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class SpotifyOAuth:
    def __init__(self):
        self.client_id = os.getenv("SPOTIPY_CLIENT_ID")
        self.client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")
        
        # Get redirect URI from environment or use default
        self.redirect_uri = os.getenv("SPOTIFY_REDIRECT_URI", "http://localhost:3000/callback")
        
        self.scope = [
            "user-read-private",
            "user-read-email",
            "playlist-read-private",
            "playlist-read-collaborative",
            "user-library-read",
            "user-top-read"
        ]
        
        # Spotify API endpoints
        self.auth_url = "https://accounts.spotify.com/authorize"
        self.token_url = "https://accounts.spotify.com/api/token"
        
    def get_authorization_url(self):
        """Generate authorization URL for Spotify OAuth"""
        oauth = OAuth2Session(
            client_id=self.client_id,
            redirect_uri=self.redirect_uri,
            scope=self.scope
        )
        
        authorization_url, state = oauth.authorization_url(self.auth_url)
        return authorization_url, state
    
    def get_token_from_code(self, authorization_response):
        """Exchange authorization code for access token"""
        oauth = OAuth2Session(
            client_id=self.client_id,
            redirect_uri=self.redirect_uri
        )
        
        # Create basic auth header
        basic_auth = base64.b64encode(
            f"{self.client_id}:{self.client_secret}".encode()
        ).decode()
        
        token = oauth.fetch_token(
            token_url=self.token_url,
            authorization_response=authorization_response,
            headers={"Authorization": f"Basic {basic_auth}"}
        )
        
        return token
    
    def refresh_token(self, refresh_token):
        """Refresh access token using refresh token"""
        oauth = OAuth2Session(client_id=self.client_id)
        
        # Create basic auth header
        basic_auth = base64.b64encode(
            f"{self.client_id}:{self.client_secret}".encode()
        ).decode()
        
        token = oauth.refresh_token(
            token_url=self.token_url,
            refresh_token=refresh_token,
            headers={"Authorization": f"Basic {basic_auth}"}
        )
        
        return token

def init_spotify_auth():
    """Initialize Spotify OAuth authentication"""
    if 'spotify_oauth' not in st.session_state:
        st.session_state.spotify_oauth = SpotifyOAuth()
    
    return st.session_state.spotify_oauth

def get_user_token():
    """Get valid user access token, refreshing if necessary"""
    oauth = init_spotify_auth()
    
    # Check if we have a token in session
    if 'spotify_token' in st.session_state:
        token = st.session_state.spotify_token
        expires_at = token.get('expires_at', 0)
        
        # Check if token is expired (with 60 second buffer)
        if time.time() < expires_at - 60:
            return token['access_token']
        
        # Token expired, try to refresh
        if 'refresh_token' in token:
            try:
                new_token = oauth.refresh_token(token['refresh_token'])
                st.session_state.spotify_token = new_token
                return new_token['access_token']
            except Exception as e:
                st.error(f"Failed to refresh token: {str(e)}")
                # Clear invalid token
                if 'spotify_token' in st.session_state:
                    del st.session_state.spotify_token
    
    return None

def handle_oauth_callback():
    """Handle OAuth callback and store token"""
    oauth = init_spotify_auth()
    
    # Get the current URL parameters
    query_params = st.experimental_get_query_params()
    
    if 'code' in query_params:
        try:
            # Reconstruct the authorization response URL
            code = query_params['code'][0]
            state = query_params.get('state', [''])[0]
            
            # Create the authorization response URL
            auth_response = f"{oauth.redirect_uri}?code={code}"
            if state:
                auth_response += f"&state={state}"
            
            # Exchange code for token
            token = oauth.get_token_from_code(auth_response)
            
            # Store token in session
            st.session_state.spotify_token = token
            
            # Clear URL parameters
            st.experimental_set_query_params()
            
            st.success("Successfully authenticated with Spotify!")
            st.rerun()
            
        except Exception as e:
            st.error(f"Authentication failed: {str(e)}")
            st.experimental_set_query_params()

def show_login_button():
    """Show Spotify login button"""
    oauth = init_spotify_auth()
    
    if st.button("🔐 Login with Spotify", type="primary"):
        auth_url, state = oauth.get_authorization_url()
        
        # Store state for verification
        st.session_state.oauth_state = state
        
        # Redirect to Spotify
        st.markdown(f"""
        <meta http-equiv="refresh" content="0;url={auth_url}">
        """, unsafe_allow_html=True)
        
        st.info("Redirecting to Spotify for authentication...")

def show_logout_button():
    """Show logout button"""
    if st.button("🚪 Logout"):
        # Clear all Spotify-related session state
        keys_to_clear = ['spotify_token', 'oauth_state']
        for key in keys_to_clear:
            if key in st.session_state:
                del st.session_state[key]
        
        st.success("Logged out successfully!")
        st.rerun()

def is_authenticated():
    """Check if user is authenticated with Spotify"""
    token = get_user_token()
    return token is not None

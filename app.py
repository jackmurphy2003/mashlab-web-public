import streamlit as st
import sqlite3
import os
import pandas as pd
from spotipy import Spotify
from spotipy.oauth2 import SpotifyClientCredentials
from spotify_oauth import get_user_token, handle_oauth_callback, show_login_button, show_logout_button, is_authenticated

# ============ Configuration ============
st.set_page_config(
    page_title="MashLab",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ============ Database ============
def get_conn():
    conn = sqlite3.connect('murphmixes.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tracks (
            track_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            key_int INTEGER,
            mode_int INTEGER,
            energy REAL,
            camelot TEXT,
            url TEXT,
            album_art TEXT,
            source TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Add missing columns if they don't exist
    try:
        conn.execute("ALTER TABLE tracks ADD COLUMN album_art TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    try:
        conn.execute("ALTER TABLE tracks ADD COLUMN source TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    try:
        conn.execute("ALTER TABLE tracks ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    conn.commit()
    conn.close()

# ============ Spotify Integration ============
@st.cache_data
def get_spotify_client():
    """Get Spotify client with caching."""
    cid = os.getenv("SPOTIPY_CLIENT_ID")
    sec = os.getenv("SPOTIPY_CLIENT_SECRET")
    
    if not all([cid, sec]):
        return None
    
    try:
        auth_manager = SpotifyClientCredentials(client_id=cid, client_secret=sec)
        sp = Spotify(auth_manager=auth_manager)
        return sp
    except Exception as e:
        st.error(f"Spotify authentication failed: {str(e)}")
        return None

def get_user_spotify_client():
    """Get Spotify client with user authentication for audio features."""
    user_token = get_user_token()
    if not user_token:
        return None
    
    try:
        # Create a custom auth manager that uses the user token
        from spotipy.oauth2 import SpotifyOAuth
        auth_manager = SpotifyOAuth(
            client_id=os.getenv("SPOTIPY_CLIENT_ID"),
            client_secret=os.getenv("SPOTIPY_CLIENT_SECRET"),
            redirect_uri="http://localhost:3000/callback",
            scope="user-read-private user-read-email playlist-read-private playlist-read-collaborative user-library-read user-top-read"
        )
        auth_manager._token = {
            'access_token': user_token,
            'token_type': 'Bearer',
            'expires_in': 3600
        }
        
        sp = Spotify(auth_manager=auth_manager)
        return sp
    except Exception as e:
        st.error(f"User Spotify authentication failed: {str(e)}")
        return None

# ============ Core Functions ============
def search_tracks(query, limit=25):
    """Search tracks using Spotipy with market='US'."""
    sp = get_spotify_client()
    if not sp:
        return []
    
    try:
        results = sp.search(q=query, type='track', limit=limit, market='US')
        return results['tracks']['items']
    except Exception as e:
        st.error(f"Spotify search failed: {str(e)}")
        return []

def get_audio_features_map(sp, ids):
    """Get audio features for multiple tracks via batch API call."""
    if not sp or not ids:
        return {}
    
    try:
        features = sp.audio_features(ids)
        return {f['id']: f for f in features if f}
    except Exception as e:
        st.error(f"Failed to get audio features: {str(e)}")
        return {}

# ============ Music Theory ============
KEYS = ["C", "C♯/D♭", "D", "E♭", "E", "F", "F♯/G♭", "G", "A♭", "A", "B♭", "B"]

def musical_key_name(key_int, mode_int):
    """Get musical key name from key_int and mode_int."""
    if key_int is None or mode_int is None:
        return "—"
    return f"{KEYS[key_int]} {'major' if mode_int == 1 else 'min'}"

def to_camelot(key_int, mode_int):
    """Convert key and mode to Camelot notation using formula: ((key_int + 3) % 12) + 1."""
    if key_int is None or mode_int is None:
        return ""
    
    # Calculate camelot number using formula from spec
    camelot_number = ((key_int + 3) % 12) + 1
    camelot_letter = "B" if mode_int == 1 else "A"  # Major = B, Minor = A
    
    return f"{camelot_number}{camelot_letter}"

# ============ Database Operations ============
def in_db(track_id):
    """Check if track exists in database."""
    conn = get_conn()
    cursor = conn.execute("SELECT 1 FROM tracks WHERE track_id = ?", (track_id,))
    exists = cursor.fetchone() is not None
    conn.close()
    return exists

def add_track(row):
    """Add track to database with source field."""
    conn = get_conn()
    conn.execute("""
        INSERT OR REPLACE INTO tracks 
        (track_id, title, artist, key_int, mode_int, energy, camelot, url, album_art, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        row['track_id'],
        row['title'],
        row['artist'],
        row.get('key_int'),
        row.get('mode_int'),
        row.get('energy'),
        row.get('camelot'),
        row.get('url'),
        row.get('album_art'),
        'spotify'
    ))
    conn.commit()
    conn.close()

def db_list_tracks():
    """Get all tracks from the database."""
    conn = get_conn()
    # Check if created_at column exists
    try:
        cursor = conn.execute("SELECT * FROM tracks ORDER BY created_at DESC")
    except sqlite3.OperationalError:
        # If created_at doesn't exist, just select all without ordering
        cursor = conn.execute("SELECT * FROM tracks")
    tracks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return tracks

# ============ Main App ============
def main():
    # Initialize
    init_db()
    
    # Handle OAuth callback
    handle_oauth_callback()
    
    # Inject CSS using st.markdown with proper HTML structure
    st.markdown("""
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
        :root {
          --bg: #0C1022;
          --panel: #0E1530;
          --panelBorder: #1A2348;
          --rowHover: #121A3A;
          --textPrimary: #E8EDFF;
          --textSecondary: #96A0C2;
          --muted: #6F7BA6;
          --accent: #8A7CFF;
          --accentSoft: rgba(138,124,255,0.12);
          --focusRing: rgba(138,124,255,0.45);
          --danger: #FF5C5C;
          --divider: rgba(255,255,255,0.06);
          --inputBg: #0F1836;
          --inputBorder: #222C55;
          --inputPlaceholder: #7E88AF;
          --badge: #0B1432;
        }
        
        html, body, .stApp { 
          background: var(--bg) !important; 
          color: var(--textPrimary) !important; 
          font-family: 'Inter', system-ui, -apple-system, 'SF Pro', Arial, sans-serif !important;
        }
        
        .block-container { 
          max-width: 1120px !important; 
          padding: 32px !important;
          margin: 0 auto !important;
        }
        
        .mash-card { 
          background: var(--panel) !important; 
          border: 1px solid var(--panelBorder) !important;
          border-radius: 16px !important; 
          box-shadow: 0 8px 24px rgba(0,0,0,0.25) !important;
          padding: 24px !important;
        }
        
        .mash-logo { 
          font-family: 'Inter', sans-serif !important; 
          font-weight: 700 !important; 
          font-size: 22px !important; 
          color: var(--textPrimary) !important;
          letter-spacing: 0.08em !important;
        }
        
        .mash-tabs { 
          display: flex !important; 
          gap: 28px !important; 
          align-items: center !important; 
          color: var(--textSecondary) !important; 
        }
        
        .mash-tab { 
          font-weight: 500 !important; 
          font-size: 16px !important; 
          cursor: pointer !important;
          transition: color 0.2s ease !important;
        }
        
        .mash-tab:hover { 
          color: var(--textPrimary) !important; 
        }
        
        .mash-tab-active { 
          color: var(--textPrimary) !important; 
          position: relative !important; 
        }
        
        .mash-tab-active:after { 
          content: "" !important; 
          position: absolute !important; 
          left: 0 !important; 
          right: 0 !important; 
          height: 2px !important; 
          bottom: -8px !important;
          background: var(--accent) !important; 
          border-radius: 2px !important; 
        }
        
        .mash-input { 
          background: var(--inputBg) !important; 
          border: 1px solid var(--inputBorder) !important; 
          color: var(--textPrimary) !important; 
          height: 48px !important; 
          border-radius: 12px !important; 
          padding: 0 16px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 16px !important;
        }
        
        .mash-input:focus {
          outline: none !important;
          box-shadow: 0 0 0 3px var(--focusRing) !important;
        }
        
        .mash-placeholder { 
          color: var(--inputPlaceholder) !important; 
        }
        
        .mash-btn-outline { 
          background: var(--accentSoft) !important;
          border: 1px solid var(--accent) !important; 
          color: var(--textPrimary) !important; 
          height: 40px !important; 
          padding: 0 16px !important; 
          border-radius: 999px !important;
          font-family: 'Inter', sans-serif !important;
          font-weight: 500 !important;
          font-size: 14px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        
        .mash-btn-outline:hover { 
          background: var(--accent) !important; 
          color: #0B0F22 !important; 
        }
        
        .mash-btn-outline:disabled {
          background: var(--accent) !important;
          color: #0B0F22 !important;
          cursor: not-allowed !important;
        }
        
        .mash-table-header {
          color: var(--muted) !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          letter-spacing: 0.08em !important;
          border-bottom: 1px solid var(--divider) !important;
          padding: 12px 8px !important;
        }
        
        .mash-table-row { 
          padding: 8px !important; 
          border-bottom: 1px solid var(--divider) !important;
          transition: background-color 0.2s ease !important;
          height: 72px !important;
          display: flex !important;
          align-items: center !important;
        }
        
        .mash-table-row:hover { 
          background: var(--rowHover) !important; 
          border-radius: 8px !important;
        }
        
        .mash-idx { 
          color: var(--muted) !important; 
          font-weight: 600 !important; 
          font-size: 13px !important;
          width: 40px !important;
        }
        
        .mash-track { 
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          width: 420px !important;
        }
        
        .mash-cover { 
          width: 44px !important; 
          height: 44px !important; 
          border-radius: 10px !important;
          object-fit: cover !important;
        }
        
        .mash-track-info {
          display: flex !important;
          flex-direction: column !important;
          gap: 2px !important;
        }
        
        .mash-title { 
          color: var(--textPrimary) !important; 
          font-weight: 600 !important; 
          font-size: 16px !important;
          line-height: 1.2 !important;
        }
        
        .mash-subtitle { 
          color: var(--textSecondary) !important; 
          font-weight: 500 !important; 
          font-size: 13px !important;
          line-height: 1.2 !important;
        }
        
        .mash-artist { 
          color: var(--textPrimary) !important; 
          font-weight: 500 !important; 
          font-size: 14px !important;
          width: 220px !important;
        }
        
        .mash-bpm { 
          color: var(--textPrimary) !important; 
          font-weight: 500 !important; 
          font-size: 14px !important;
          width: 90px !important;
        }
        
        .mash-key { 
          color: var(--textPrimary) !important; 
          font-weight: 500 !important; 
          font-size: 14px !important;
          width: 120px !important;
        }
        
        .mash-action {
          width: 160px !important;
          display: flex !important;
          justify-content: flex-end !important;
        }
        </style>
    </head>
    <body>
    </body>
    </html>
    """, unsafe_allow_html=True)
    
    # Main card container
    with st.container():
        st.markdown('<div class="mash-card">', unsafe_allow_html=True)
        
        # Header strip
        col1, col2, col3 = st.columns([1, 1, 1])
        with col1:
            st.markdown('<div class="mash-logo">MASHLAB</div>', unsafe_allow_html=True)
        with col2:
            st.markdown("""
            <div class="mash-tabs">
                <div class="mash-tab mash-tab-active">Search</div>
                <div class="mash-tab">Library</div>
                <div class="mash-tab">Recommender</div>
                <div class="mash-tab">Mashups</div>
            </div>
            """, unsafe_allow_html=True)
        with col3:
            # Authentication status
            if is_authenticated():
                st.success("✅ Authenticated with Spotify")
                show_logout_button()
            else:
                st.warning("⚠️ Not authenticated")
                show_login_button()
        
        # Search bar row
        st.markdown('<div style="height: 16px;"></div>', unsafe_allow_html=True)  # Vertical rhythm
        
        col1, col2 = st.columns([3, 1])
        with col1:
            q = st.text_input("Search", placeholder="Search for a track...", key="query_box", label_visibility="collapsed")
        with col2:
            search_disabled = not (q or "").strip()
            if st.button("Search", disabled=search_disabled, key="search_btn"):
                q_clean = (q or "").strip()
                if not q_clean:
                    st.warning("Type something to search.")
                else:
                    # Check if Spotify is available
                    sp = get_spotify_client()
                    if not sp:
                        st.warning("Spotify is not available. Search is disabled.")
                        return
                    
                    # Search with spinner
                    with st.spinner("Searching..."):
                        # Search tracks
                        raw_results = search_tracks(q_clean, limit=25)
                        
                        if not raw_results:
                            st.warning("No search results found. Try a different search term.")
                            return
                        
                        # Get track IDs for audio features
                        track_ids = [track['id'] for track in raw_results if track.get('id')]
                        
                        # Try to get audio features with user authentication first
                        features_map = {}
                        if is_authenticated():
                            user_sp = get_user_spotify_client()
                            if user_sp:
                                features_map = get_audio_features_map(user_sp, track_ids)
                                if features_map:
                                    st.success("✅ Audio features retrieved with user authentication")
                        
                        # Fallback to client credentials if no user auth or features failed
                        if not features_map:
                            st.warning("⚠️ Audio features not available. Please login with Spotify for full functionality.")
                            # You can still show results without audio features
                        
                        # Process results
                        processed_results = []
                        for i, track in enumerate(raw_results, 1):
                            track_id = track.get('id')
                            if not track_id:
                                continue
                            
                            features = features_map.get(track_id, {})
                            
                            # Extract data
                            key_int = features.get('key')
                            mode_int = features.get('mode')
                            
                            # Get album art
                            album_art = None
                            if track.get('album') and track['album'].get('images'):
                                album_art = track['album']['images'][0]['url']
                            
                            processed_results.append({
                                'index': i,
                                'track_id': track_id,
                                'title': track.get('name', ''),
                                'artist': ', '.join(a['name'] for a in (track.get('artists') or [])),
                                'key_int': key_int,
                                'mode_int': mode_int,
                                'key_name': musical_key_name(key_int, mode_int),
                                'url': (track.get('external_urls') or {}).get('spotify', ''),
                                'album_art': album_art
                            })
                        
                        st.session_state.search_results = processed_results
                        st.toast(f"Found {len(processed_results)} tracks!")
        
        # Divider
        st.markdown('<div style="height: 20px;"></div>', unsafe_allow_html=True)
        
        # Table headers
        if 'search_results' in st.session_state and st.session_state.search_results:
            st.markdown("""
            <div style="display: flex; align-items: center; padding: 12px 8px; border-bottom: 1px solid var(--divider);">
                <div class="mash-table-header" style="width: 40px;">#</div>
                <div class="mash-table-header" style="width: 420px;">Track</div>
                <div class="mash-table-header" style="width: 220px;">Artist</div>

                <div class="mash-table-header" style="width: 120px;">Key</div>
                <div class="mash-table-header" style="width: 160px; text-align: right;"></div>
            </div>
            """, unsafe_allow_html=True)
            
            # Table rows
            for r in st.session_state.search_results:
                # Check if track is already in library
                already_added = in_db(r['track_id'])
                
                # Create row HTML
                row_html = f"""
                <div class="mash-table-row">
                    <div class="mash-idx">{r["index"]}</div>
                    <div class="mash-track">
                        <img src="{r.get('album_art', '')}" class="mash-cover" onerror="this.style.display='none'">
                        <div class="mash-track-info">
                            <div class="mash-title">{r["title"]}</div>
                            <div class="mash-subtitle">{r["artist"]}</div>
                        </div>
                    </div>
                    <div class="mash-artist">{r["artist"]}</div>

                    <div class="mash-key">{r["key_name"]}</div>
                    <div class="mash-action">
                """
                
                if already_added:
                    row_html += '<button class="mash-btn-outline" disabled>Added</button>'
                else:
                    row_html += f'<button class="mash-btn-outline" onclick="addTrack_{r["track_id"]}()">Add to Library</button>'
                
                row_html += '</div></div>'
                
                st.markdown(row_html, unsafe_allow_html=True)
                
                # Handle add button click
                if not already_added:
                    if st.button("Add to Library", key=f"add_{r['track_id']}", help="Add to Library"):
                        add_track(r)
                        st.toast(f"Added {r['artist']} — {r['title']}", icon="✅")
                        st.rerun()
        
        st.markdown('</div>', unsafe_allow_html=True)  # Close mash-card

if __name__ == "__main__":
    main()

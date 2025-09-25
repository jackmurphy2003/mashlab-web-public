import streamlit as st
import sqlite3
import os
import pandas as pd
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth

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
            bpm REAL,
            key_int INTEGER,
            mode_int INTEGER,
            energy REAL,
            camelot TEXT,
            url TEXT,
            album_art TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.execute("""
        CREATE TABLE IF NOT EXISTS mashups (
            mashup_id INTEGER PRIMARY KEY AUTOINCREMENT,
            left_track_id TEXT,
            right_track_id TEXT,
            left_title TEXT,
            left_artist TEXT,
            left_bpm REAL,
            left_key_int INTEGER,
            left_mode_int INTEGER,
            left_camelot TEXT,
            left_url TEXT,
            right_title TEXT,
            right_artist TEXT,
            right_bpm REAL,
            right_key_int INTEGER,
            right_mode_int INTEGER,
            right_camelot TEXT,
            right_url TEXT,
            score REAL,
            reason TEXT,
            tags TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (left_track_id) REFERENCES tracks (track_id),
            FOREIGN KEY (right_track_id) REFERENCES tracks (track_id)
        )
    """)
    
    # Add album_art column if it doesn't exist
    try:
        conn.execute("ALTER TABLE tracks ADD COLUMN album_art TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    conn.commit()
    conn.close()

# ============ Spotify Integration ============
def get_spotify():
    cid = os.getenv("SPOTIPY_CLIENT_ID")
    sec = os.getenv("SPOTIPY_CLIENT_SECRET")
    redirect = os.getenv("SPOTIPY_REDIRECT_URI")
    
    if not all([cid, sec, redirect]):
        return None
    
    auth = SpotifyOAuth(
        client_id=cid,
        client_secret=sec,
        redirect_uri=redirect,
        scope="user-read-email playlist-read-private playlist-read-collaborative user-library-read",
        open_browser=False,
        cache_path=".spotipy_cache"
    )
    
    try:
        sp = Spotify(auth_manager=auth)
        # Test the connection
        sp.current_user()
        return sp
    except:
        return None

# ============ Core Functions ============
def fetch_spotify_search(query: str, limit: int = 20):
    """Search Spotify for tracks."""
    sp = get_spotify()
    if not sp:
        return []
    
    try:
        results = sp.search(q=query, type='track', limit=limit)
        return results['tracks']['items']
    except Exception as e:
        st.error(f"Spotify search failed: {str(e)}")
        return []

def get_audio_features(track_ids):
    """Get audio features for multiple tracks."""
    sp = get_spotify()
    if not sp or not track_ids:
        return {}
    
    try:
        features = sp.audio_features(track_ids)
        return {f['id']: f for f in features if f}
    except:
        return {}

def fetch_features_or_preview(sp, tracks):
    """Fetch audio features for tracks."""
    if not tracks:
        return []
    
    # Get track IDs
    track_ids = [t['id'] for t in tracks if t.get('id')]
    
    # Try to get audio features from Spotify
    features_map = get_audio_features(track_ids)
    
    results = []
    for track in tracks:
        track_id = track.get('id')
        if not track_id:
            continue
        
        # Get features from Spotify
        features = features_map.get(track_id, {})
        
        # Extract data
        bpm = features.get('tempo')
        key_int = features.get('key')
        mode_int = features.get('mode')
        energy = features.get('energy')
        
        # Generate camelot notation
        camelot = to_camelot(key_int, mode_int) if (key_int is not None and mode_int is not None) else ""
        
        # Get album art
        album_art = None
        if track.get('album') and track['album'].get('images'):
            album_art = track['album']['images'][0]['url']
        
        results.append({
            'track_id': track_id,
            'title': track.get('name', ''),
            'artist': ', '.join(a['name'] for a in (track.get('artists') or [])),
            'bpm': bpm,
            'key_int': key_int,
            'mode_int': mode_int,
            'energy': energy,
            'camelot': camelot,
            'url': (track.get('external_urls') or {}).get('spotify', ''),
            'album_art': album_art,
            'preview_url': track.get('preview_url')
        })
    
    return results

# ============ Database Operations ============
def db_add_track(track_data):
    """Add a track to the database."""
    conn = get_conn()
    conn.execute("""
        INSERT OR REPLACE INTO tracks 
        (track_id, title, artist, bpm, key_int, mode_int, energy, camelot, url, album_art)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        track_data['track_id'],
        track_data['title'],
        track_data['artist'],
        track_data.get('bpm'),
        track_data.get('key_int'),
        track_data.get('mode_int'),
        track_data.get('energy'),
        track_data.get('camelot'),
        track_data.get('url'),
        track_data.get('album_art')
    ))
    conn.commit()
    conn.close()

def db_list_tracks():
    """Get all tracks from the database."""
    conn = get_conn()
    cursor = conn.execute("SELECT * FROM tracks ORDER BY created_at DESC")
    tracks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return tracks

def db_list_mashups():
    """Get all mashups from the database."""
    conn = get_conn()
    cursor = conn.execute("SELECT * FROM mashups ORDER BY created_at DESC")
    mashups = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return mashups

# ============ Music Theory ============
KEYS = ["C", "C♯/D♭", "D", "D♯/E♭", "E", "F", "F♯/G♭", "G", "G♯/A♭", "A", "A♯/B♭", "B"]

def to_camelot(key_int, mode_int):
    """Convert key and mode to Camelot notation."""
    if key_int is None or mode_int is None:
        return ""
    
    # Camelot wheel mapping
    camelot_major = ["8B", "3B", "10B", "5B", "12B", "7B", "2B", "9B", "4B", "11B", "6B", "1B"]
    camelot_minor = ["8A", "3A", "10A", "5A", "12A", "7A", "2A", "9A", "4A", "11A", "6A", "1A"]
    
    if mode_int == 1:  # Major
        return camelot_major[key_int]
    else:  # Minor
        return camelot_minor[key_int]

# ============ Main App ============
def main():
    # Initialize
    init_db()
    
    # Header
    st.markdown("""
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
            <h1 style="color: #ffffff; font-family: 'Montserrat', sans-serif; margin-bottom: 0.5rem;">🧪 MashLab</h1>
            <p style="color: #a0a0a0; margin: 0;">DJ Mashup Laboratory • Search shows BPM+Key immediately. Add to Library.</p>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Set dark background
    st.markdown("""
    <style>
    .stApp {
        background-color: #050812;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 2rem;
    }
    .stTabs [data-baseweb="tab"] {
        background-color: #0f1420;
        border-radius: 8px 8px 0px 0px;
        color: #ffffff;
        padding: 1rem 2rem;
    }
    .stTabs [aria-selected="true"] {
        background-color: #1a1f2e;
        color: #8b5cf6;
    }
    </style>
    """, unsafe_allow_html=True)
    
    sp = get_spotify()
    
    tabs = st.tabs(["🔎 Search", "📚 Library", "🧭 Recommender", "🎛 Mashups"])
    
    # ---------- Search ----------
    with tabs[0]:
        st.subheader("Search for tracks")
        
        # Search input
        col1, col2 = st.columns([3, 1])
        with col1:
            q = st.text_input("Search for a track...", placeholder="e.g., The Weeknd Blinding Lights", key="query_box")
        with col2:
            search_disabled = not (q or "").strip()
            if st.button("Search", type="primary", disabled=search_disabled, key="search_btn"):
                q_clean = (q or "").strip()
                if not q_clean:
                    st.warning("Type something to search first.")
                else:
                    try:
                        # Initialize search state
                        if 'search_results' not in st.session_state:
                            st.session_state.search_results = []
                            st.session_state.search_query = ""
                            st.session_state.results_shown = 0
                        
                        # If it's a new search, reset everything
                        if st.session_state.search_query != q_clean:
                            st.session_state.search_query = q_clean
                            st.session_state.results_shown = 0
                            
                            # Fetch initial results
                            raw = fetch_spotify_search(q_clean, 20)
                            # Include album art in each item
                            for it in raw:
                                try:
                                    if it.get("album") and it["album"].get("images"):
                                        it["album_art"] = it["album"]["images"][0]["url"]
                                    else:
                                        it["album_art"] = None
                                except:
                                    it["album_art"] = None
                            
                            results = fetch_features_or_preview(sp, raw)
                            st.session_state.search_results = results
                            
                    except Exception as e:
                        st.error(f"Spotify search failed. Try again.\n\n{str(e)}")
                        st.session_state.search_query = ""
        
        # Show results
        if 'search_results' in st.session_state and st.session_state.search_results:
            results_to_show = st.session_state.search_results[:st.session_state.results_shown + 10]
            query = st.session_state.search_query
            
            st.subheader(f"Results for '{query}'")
            
            # Results table
            for i, r in enumerate(results_to_show, 1):
                with st.container(border=True):
                    col1, col2, col3, col4, col5, col6 = st.columns([0.5, 2, 1, 0.8, 0.8, 1])
                    
                    with col1:
                        # Album cover
                        album_art_url = r.get('album_art')
                        if album_art_url:
                            st.image(album_art_url, width=50)
                        else:
                            st.markdown("🎵")
                    
                    with col2:
                        st.write(f"**{r['title']}**")
                        st.write(f"*{r['artist']}*")
                    
                    with col3:
                        st.write(f"**{r['artist']}**")
                    
                    with col4:
                        bpm = round(r['bpm'], 1) if r['bpm'] else '—'
                        st.write(f"**{bpm}**")
                    
                    with col5:
                        key_text = (
                            f"{KEYS[int(r['key_int'])]} {'Major' if r['mode_int'] == 1 else 'Minor'}"
                            if (r['key_int'] is not None and r['mode_int'] is not None)
                            else "—"
                        )
                        st.write(f"**{key_text}**")
                        camelot_text = (
                            to_camelot(r['key_int'], r['mode_int'])
                            if (r['key_int'] is not None and r['mode_int'] is not None)
                            else ""
                        )
                        if camelot_text:
                            st.caption(f"*{camelot_text}*")
                    
                    with col6:
                        if st.button("Add to Library", key=f"add_{r['track_id']}"):
                            try:
                                db_add_track(r)
                                st.toast(f"Added {r['artist']} — {r['title']}", icon="✅")
                            except Exception as e:
                                st.error(f"Failed to add: {str(e)}")
            
            # Show More button
            if len(st.session_state.search_results) > st.session_state.results_shown + 10:
                if st.button("Show More Results", type="primary", key="show_more"):
                    st.session_state.results_shown += 10
                    st.rerun()
        else:
            st.info("Search for tracks to see results here.")
    
    # ---------- Library ----------
    with tabs[1]:
        st.subheader("Library — your curated tracks")
        
        # Load tracks
        tracks = db_list_tracks()
        df = pd.DataFrame(tracks)
        
        if df.empty:
            st.info("No tracks in your library yet. Search for tracks and add them to get started.")
        else:
            # Export button
            st.download_button(
                "Export Library CSV",
                data=df.to_csv(index=False).encode("utf-8"),
                file_name="mashlab_library.csv",
                mime="text/csv"
            )
            
            # Library table
            for i, row in df.iterrows():
                with st.container(border=True):
                    col1, col2, col3, col4, col5, col6, col7 = st.columns([0.5, 1, 1, 0.8, 0.8, 0.8, 1])
                    
                    with col1:
                        # Album cover
                        album_art = row.get('album_art', '')
                        if album_art:
                            st.image(album_art, width=50)
                        else:
                            st.markdown("🎵")
                    
                    with col2:
                        st.write(f"**{row['artist']}**")
                    
                    with col3:
                        st.write(f"**{row['title']}**")
                    
                    with col4:
                        bpm = round(row['bpm'], 1) if pd.notnull(row['bpm']) else '—'
                        st.write(f"**{bpm}**")
                    
                    with col5:
                        key_text = (
                            f"{KEYS[int(row['key_int'])]} {'Major' if int(row['mode_int']) == 1 else 'Minor'}"
                            if (pd.notnull(row['key_int']) and pd.notnull(row['mode_int']))
                            else "—"
                        )
                        st.write(f"**{key_text}**")
                    
                    with col6:
                        camelot = row['camelot'] if row['camelot'] else "—"
                        st.write(f"**{camelot}**")
                    
                    with col7:
                        if st.button("Play in Spotify", key=f"play_{row['track_id']}"):
                            st.link_button("🎵 Open in Spotify", row['url'])
    
    # ---------- Recommender ----------
    with tabs[2]:
        st.subheader("Recommender — generate ideas from Library")
        st.info("This feature will be implemented next.")
    
    # ---------- Mashups ----------
    with tabs[3]:
        st.subheader("Mashups — your saved pairs")
        st.info("This feature will be implemented next.")

if __name__ == "__main__":
    main()

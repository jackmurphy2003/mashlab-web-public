from __future__ import annotations
import os, urllib.parse, re
from typing import Optional, Dict, Any
import requests
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

GETSONGBPM_BASE = "https://api.getsong.co"

def _clean(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"\s*\([^)]*\)", "", s)  # drop (...) like (feat. X)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()

class BPMApiResolver:
    """
    Fetch BPM from GetSongBPM only. If no definitive numeric tempo is found,
    return '-' (string). Never guess or compute locally.
    """
    def __init__(self, market: str = "US"):
        load_dotenv(override=True)
        cid = os.getenv("SPOTIFY_CLIENT_ID")
        cs  = os.getenv("SPOTIFY_CLIENT_SECRET")
        if not cid or not cs:
            raise RuntimeError("Missing SPOTIFY_CLIENT_ID/SECRET")
        self.sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=cid, client_secret=cs))
        self.market = market
        self.gsbpm_key = os.getenv("GETSONGBPM_API_KEY")
        if not self.gsbpm_key:
            raise RuntimeError("Missing GETSONGBPM_API_KEY")

    def get_bpm(self, *, query: Optional[str] = None, uri: Optional[str] = None) -> str:
        """
        Return BPM as a string. If not available or ambiguous, return "-".
        """
        meta = self._resolve_track_meta(query=query, uri=uri)
        if not meta: 
            return "-"
        bpm = self._fetch_bpm_getsongbpm(title=meta["title"], artist=meta["artist"])
        return bpm if bpm is not None else "-"

    # ----- internals -----
    def _resolve_track_meta(self, *, query: Optional[str], uri: Optional[str]) -> Optional[Dict[str, Any]]:
        try:
            if uri:
                t = self.sp.track(uri)
            elif query:
                res = self.sp.search(q=query, type="track", limit=1, market=self.market)
                items = (res.get("tracks", {}) or {}).get("items", []) or []
                if not items: 
                    return None
                t = self.sp.track(items[0]["id"])
            else:
                return None
            title = t.get("name") or ""
            artists = ", ".join(a["name"] for a in t.get("artists", []) or [])
            return {"title": title, "artist": artists}
        except Exception:
            return None

    def _fetch_bpm_getsongbpm(self, *, title: str, artist: str) -> Optional[str]:
        # Step 1: search for both song & artist
        lookup = f"song:{title} artist:{artist}"
        url = f"{GETSONGBPM_BASE}/search/?type=both&lookup={urllib.parse.quote_plus(lookup)}"
        try:
            r = requests.get(url, headers={"X-API-KEY": self.gsbpm_key}, timeout=12)
            if r.status_code != 200:
                return None
            data = (r.json() or {}).get("search") or []
        except Exception:
            return None
        if not data:
            return None

        # Find a result that reasonably matches title & artist without guessing beyond basic cleaning
        ct, ca = _clean(title), _clean(artist)
        picked_id = None
        for row in data:
            r_title = _clean(row.get("title", ""))
            r_artist = _clean(", ".join(a.get("name","") for a in row.get("artist",[]) or []))
            if r_title == ct and (ca in r_artist or r_artist in ca):
                picked_id = row.get("id")
                break
        if picked_id is None:
            # If nothing exact, do NOT guess. Fail
            return None

        # Step 2: get the actual BPM data for the picked track
        url = f"{GETSONGBPM_BASE}/song/{picked_id}/"
        try:
            r = requests.get(url, headers={"X-API-KEY": self.gsbpm_key}, timeout=12)
            if r.status_code != 200:
                return None
            song_data = r.json() or {}
        except Exception:
            return None

        # Extract BPM - only return if it's a valid numeric tempo
        bpm = song_data.get("bpm")
        if bpm is None or not isinstance(bpm, (int, float)) or bpm <= 0:
            return None
        return str(int(bpm))

# CLI interface for testing
if __name__ == "__main__":
    import sys
    import argparse
    
    parser = argparse.ArgumentParser(description="Get BPM from GetSongBPM API")
    parser.add_argument("query", nargs="?", help="Search query (artist - title)")
    parser.add_argument("--uri", help="Spotify URI")
    parser.add_argument("--market", default="US", help="Market for Spotify search")
    
    args = parser.parse_args()
    
    if not args.query and not args.uri:
        print("Error: Must provide either query or --uri")
        sys.exit(1)
    
    try:
        resolver = BPMApiResolver(market=args.market)
        bpm = resolver.get_bpm(query=args.query, uri=args.uri)
        print(bpm)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

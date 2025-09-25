# 🎵 MurphMixes CrateMate - BPM Resolver System

## 🚀 Quick Start

### Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your Spotify API credentials and GetSongBPM API key

# Test the BPM resolver
python bpm_api_resolver.py "Khalid - Location"

# Start the application
npm run dev
```

## 🎯 New BPM Resolver System

The BPM system has been completely rebuilt to use a **single, reliable API** for BPM detection.

### ✅ What's New

- **🎚️ GetSongBPM API** - Uses the GetSongBPM API for accurate BPM detection
- **🔄 No Local Analysis** - No librosa, essentia, or local audio processing
- **📊 Simple & Reliable** - Returns "-" when BPM is not available
- **💾 No Caching** - Direct API calls for fresh data
- **🔧 CLI Interface** - Easy testing and debugging

### 🗑️ What's Removed

- ❌ `bpm_resolver.py` - Old complex resolver
- ❌ `bpm_sources.py` - Multiple source system
- ❌ `lib/bpm_cache.py` - Caching system
- ❌ `lib/bpm_database.py` - Local database
- ❌ All librosa/essentia dependencies
- ❌ Local audio analysis
- ❌ BPM normalization/guessing
- ❌ Confidence scoring

## 🎵 BPM Resolver Usage

### Command Line

```bash
# Search by query
python bpm_api_resolver.py "Artist - Title"

# Use Spotify URI
python bpm_api_resolver.py --uri spotify:track:XXXXXXXX

# Test with market
python bpm_api_resolver.py "Khalid - Location" --market US
```

### Programmatic

```python
from bpm_api_resolver import BPMApiResolver

resolver = BPMApiResolver()
bpm = resolver.get_bpm(query="Khalid - Location")

print(f"BPM: {bpm}")  # Returns BPM as string or "-" if not found
```

## 🔧 Integration

The new BPM resolver is integrated into:

- **Search Tab** - Automatic BPM detection for search results
- **Library Tab** - BPM display for library tracks
- **Mashups** - BPM-based compatibility scoring

## 📋 Requirements

### Environment Variables (.env)
```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
GETSONGBPM_API_KEY=your_getsongbpm_key
```

### Python Dependencies (requirements.txt)
```
requests
python-dotenv
spotipy
```

## 🎵 How It Works

1. **Track Resolution** - Uses Spotify API to get track metadata
2. **GetSongBPM Search** - Searches GetSongBPM API for the track
3. **Exact Matching** - Only returns BPM for exact title/artist matches
4. **Simple Output** - Returns BPM as string or "-" if not found

The system never guesses, normalizes, or computes BPM locally. It only returns definitive BPM values from the GetSongBPM API.

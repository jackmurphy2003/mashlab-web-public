# Spotify Integration Setup

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# NextAuth Configuration (if using NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback/spotify


# Base URL for API calls
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Get your Client ID and Client Secret
4. Add `http://localhost:3000/api/auth/callback/spotify` to your Redirect URIs

## Authentication Implementation

The current implementation uses client credentials flow for simplicity. To implement user authentication:

1. Install NextAuth.js: `npm install next-auth`
2. Create `pages/api/auth/[...nextauth].ts` with Spotify provider
3. Update `lib/spotify.ts` to use `getServerSession()` instead of client credentials

## Features Implemented

✅ **Filter Updates:**
- Removed Popularity, Energy, Danceability filters
- Kept: BPM (always on), Key toggle, Artist toggle, Genre toggle, Exclude same artist, Explicit-free, Year range

✅ **Spotify Integration:**
- Artist autocomplete via `/api/spotify/search-artist`
- Playlist selection via `/api/spotify/me/playlists`
- Audio features hydration
- Artist genres hydration
- Results sorted by popularity (desc)

✅ **API Routes:**
- `/api/spotify/search-artist` - Artist search
- `/api/spotify/audio-features` - Audio features
- `/api/spotify/artists` - Artist metadata
- `/api/spotify/me/playlists` - User playlists
- `/api/spotify/playlists/[id]/tracks` - Playlist tracks
- `/api/mashups/search` - Core search with filtering

✅ **UI Components:**
- Updated FilterRail with trimmed filters
- ArtistAutocomplete with server-backed search
- PlaylistSelector for multi-select playlists
- ResultsTable with popularity column

## Usage

1. Set up environment variables
2. Start the development server: `npm start`
3. Navigate to Mashups → Build
4. Select a seed track
5. Choose source (Spotify/Playlists)
6. Configure filters
7. Search for mashup partners

## Notes

- Currently uses client credentials flow (no user auth)
- Library/Collections sources return empty (not implemented)
- All Spotify sources work with full filtering and pagination
- Results are sorted by popularity descending
- Pagination: 10 results per page, cap at 100

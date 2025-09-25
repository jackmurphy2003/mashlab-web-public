# Spotify OAuth Authentication Setup

## 🎯 What This Solves

The Spotify API's audio features and analysis endpoints require **user authentication** (OAuth flow) rather than client credentials. This setup enables:

✅ **Full Audio Features Access** - BPM, Key, Energy, Danceability, etc.  
✅ **User Playlists** - Access to private and collaborative playlists  
✅ **User Library** - Access to saved tracks  
✅ **Audio Analysis** - Detailed track analysis data  

## 🔧 Setup Steps

### 1. Spotify Developer Dashboard Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app or use existing one
3. Get your **Client ID** and **Client Secret**
4. **IMPORTANT**: Add redirect URI to your app settings:
   ```
   http://localhost:3000/callback
   ```

### 2. Environment Variables

Create a `.env` file in your project root:

```bash
# Spotify API Configuration
SPOTIPY_CLIENT_ID=your_spotify_client_id_here
SPOTIPY_CLIENT_SECRET=your_spotify_client_secret_here

# Spotify OAuth Redirect URI (for your app)
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

### 3. Install Dependencies

```bash
python3 -m pip install requests-oauthlib
```

### 4. Run the Application

```bash
streamlit run app.py
```

## 🔐 Authentication Flow

### First Time Setup
1. Click **"🔐 Login with Spotify"** button
2. You'll be redirected to Spotify's authorization page
3. Grant permissions for the requested scopes
4. You'll be redirected back to the app
5. Success! You're now authenticated

### What Happens After Login
- ✅ Access token is stored in session
- ✅ Token automatically refreshes when expired
- ✅ Audio features are now available
- ✅ User playlists can be accessed

### Logout
- Click **"🚪 Logout"** to clear authentication
- Session tokens are removed
- You'll need to re-authenticate for audio features

## 🎵 Available Features

### With Authentication ✅
- **Audio Features**: BPM, Key, Energy, Danceability, etc.
- **Audio Analysis**: Detailed track analysis
- **User Playlists**: Private and collaborative playlists
- **User Library**: Saved tracks
- **User Top Tracks**: Personal top tracks

### Without Authentication ⚠️
- **Basic Search**: Track search still works
- **Track Info**: Basic track metadata
- **No Audio Features**: BPM, Key, etc. will be missing
- **No User Data**: Can't access playlists or library

## 🔧 Technical Details

### OAuth Scopes Requested
- `user-read-private` - Access to user profile
- `user-read-email` - Access to user email
- `playlist-read-private` - Access to private playlists
- `playlist-read-collaborative` - Access to collaborative playlists
- `user-library-read` - Access to saved tracks
- `user-top-read` - Access to top tracks

### Token Management
- **Access Token**: Valid for 1 hour
- **Refresh Token**: Automatically refreshes access token
- **Session Storage**: Tokens stored in Streamlit session state
- **Automatic Refresh**: Handled transparently

### Security
- Tokens are stored in session state (not persistent)
- No tokens are logged or exposed
- HTTPS required for production

## 🚨 Troubleshooting

### "URL not secure" Warning
This is **normal for local development**! Here's why:

- **Local Development**: Uses `http://localhost:3000` (not secure)
- **Production**: Should use `https://yourdomain.com` (secure)
- **Spotify Accepts**: Both localhost and HTTPS URLs for development

**Solution**: This warning is expected and safe to ignore for local development.

### "Authentication failed" Error
1. Check your Client ID and Secret are correct
2. Verify redirect URI is set to `http://localhost:3000/callback`
3. Ensure you're running on port 3000

### "Audio features not available" Warning
1. Make sure you're logged in with Spotify
2. Check that the login was successful
3. Try logging out and back in

### Redirect URI Mismatch
- Spotify app settings must include: `http://localhost:3000/callback`
- No trailing slashes
- Must match exactly

### Token Refresh Issues
- Tokens automatically refresh when expired
- If refresh fails, you'll need to log in again
- Check your internet connection

## 🎯 Next Steps

Once authenticated, you can:
1. **Search tracks** with full audio features
2. **Access user playlists** for mashup sources
3. **Get detailed analysis** for better matching
4. **Build more sophisticated** mashup algorithms

## 📝 Notes

- Authentication is per-session (clears when you close the app)
- Tokens are automatically managed
- No persistent storage of credentials
- Works with both development and production environments
- **HTTP localhost is safe for development** - the "not secure" warning is expected

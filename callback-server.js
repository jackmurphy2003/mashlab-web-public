const express = require('express');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle OAuth callback directly
app.get('/callback', async (req, res) => {
  try {
    console.log('🔐 OAuth callback received:', req.query);
    
    const { code, error } = req.query;
    
    if (error) {
      console.log('❌ OAuth error:', error);
      return res.redirect('http://localhost:3000/?auth=error');
    }
    
    if (!code) {
      console.log('❌ No authorization code received');
      return res.redirect('http://localhost:3000/?auth=error');
    }
    
    console.log('🔄 Exchanging code for token...');
    
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = 'http://localhost:3000/callback';
    
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });
    
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    
    console.log('📡 Token response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.log('❌ Token exchange failed:', errorText);
      return res.redirect('http://localhost:3000/?auth=error');
    }
    
    const tokenData = await tokenResponse.json();
    console.log('✅ Token exchange successful');
    
    // Store token in the main server (we'll need to implement this)
    // For now, redirect to the main server with the token
    const tokenParams = new URLSearchParams({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || '',
      expires_in: tokenData.expires_in || 3600
    });
    
    console.log('🔄 Redirecting to React app with token...');
    res.redirect(`http://localhost:3000/?auth=success&${tokenParams.toString()}`);
    
  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    res.redirect('http://localhost:3000/?auth=error');
  }
});

app.listen(PORT, () => {
  console.log(`🎵 Callback server running on http://127.0.0.1:${PORT}`);
  console.log(`📋 This matches your Spotify app redirect URI configuration`);
});

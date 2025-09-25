let cachedToken: { access_token: string; expires_at: number } | null = null;

export async function getSpotifyAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expires_at - 30 > now) return cachedToken.access_token;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
  });
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error("Failed to fetch Spotify token");
  const json = await res.json();
  cachedToken = {
    access_token: json.access_token,
    expires_at: Math.floor(Date.now() / 1000) + json.expires_in,
  };
  return cachedToken.access_token;
}

export async function spotifyGet(path: string) {
  const token = await getSpotifyAccessToken();
  const r = await fetch(`https://api.spotify.com${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`Spotify GET ${path} failed`);
  return r.json();
}

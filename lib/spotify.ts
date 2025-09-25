export type SpotifyToken = { access_token: string; token_type: string; expires_in?: number };

export async function getSpotifyAccessToken(req?: any): Promise<string> {
  // If NextAuth is present:
  //   const session = await getServerSession(authOptions);
  //   return session?.accessToken as string;
  // Otherwise, throw with a helpful message.
  throw new Error("Implement getSpotifyAccessToken() using your auth solution (e.g., NextAuth Spotify provider).");
}

async function sfetch(url: string, token: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {})
    },
    cache: "no-store"
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Spotify error ${res.status} ${res.statusText}: ${t}`);
  }
  return res.json();
}

export async function searchTracks(token: string, q: string, limit = 50, offset = 0) {
  const encoded = new URLSearchParams({ q, type: "track", limit: String(limit), offset: String(offset) });
  return sfetch(`https://api.spotify.com/v1/search?${encoded}`, token);
}

export async function searchArtists(token: string, q: string, limit = 10) {
  const encoded = new URLSearchParams({ q, type: "artist", limit: String(limit) });
  return sfetch(`https://api.spotify.com/v1/search?${encoded}`, token);
}

export async function audioFeatures(token: string, ids: string[]) {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 100) chunks.push(ids.slice(i, i + 100));
  const all: any[] = [];
  for (const c of chunks) {
    const qs = new URLSearchParams({ ids: c.join(",") });
    const r = await sfetch(`https://api.spotify.com/v1/audio-features?${qs}`, token);
    all.push(...(r.audio_features || []));
  }
  return all;
}

export async function artistsMeta(token: string, ids: string[]) {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));
  const all: any[] = [];
  for (const c of chunks) {
    const qs = new URLSearchParams({ ids: c.join(",") });
    const r = await sfetch(`https://api.spotify.com/v1/artists?${qs}`, token);
    all.push(...(r.artists || []));
  }
  return all;
}

export async function myPlaylists(token: string, limit = 50) {
  const r = await sfetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}`, token);
  return r.items || [];
}

export async function playlistTracks(token: string, playlistId: string, max = 1000) {
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;
  const items: any[] = [];
  while (url && items.length < max) {
    const r = await sfetch(url, token);
    items.push(...(r.items || []));
    url = r.next;
  }
  return items;
}

export function noteFromKey(keyNum?: number | null, mode?: 0|1|null): string | null {
  if (keyNum == null || mode == null) return null;
  const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  return `${notes[keyNum % 12]} ${mode === 1 ? "major" : "minor"}`;
}

function lower(s?: string | null) { return (s || "").toLowerCase().trim(); }
export function normalizeGenres(list?: string[]) { return (list || []).map(lower).filter(Boolean); }

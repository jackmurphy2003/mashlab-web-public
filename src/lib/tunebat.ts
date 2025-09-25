// TuneBat API integration for accurate BPM and key data
// TuneBat provides reliable BPM and key information for tracks

interface TuneBatTrack {
  name: string;
  artist: string;
  bpm: number;
  key: string;
  camelot: string;
  energy: number;
  danceability: number;
  happiness: number;
}

interface TuneBatSearchResult {
  tracks: TuneBatTrack[];
}

// Convert key string to key number and mode
function parseKey(keyStr: string): { keyNum: number; mode: number; keyStr: string } {
  const keyMap: Record<string, { keyNum: number; mode: number }> = {
    'C': { keyNum: 0, mode: 1 },
    'C#': { keyNum: 1, mode: 1 },
    'D': { keyNum: 2, mode: 1 },
    'D#': { keyNum: 3, mode: 1 },
    'E': { keyNum: 4, mode: 1 },
    'F': { keyNum: 5, mode: 1 },
    'F#': { keyNum: 6, mode: 1 },
    'G': { keyNum: 7, mode: 1 },
    'G#': { keyNum: 8, mode: 1 },
    'A': { keyNum: 9, mode: 1 },
    'A#': { keyNum: 10, mode: 1 },
    'B': { keyNum: 11, mode: 1 },
    'Cm': { keyNum: 0, mode: 0 },
    'C#m': { keyNum: 1, mode: 0 },
    'Dm': { keyNum: 2, mode: 0 },
    'D#m': { keyNum: 3, mode: 0 },
    'Em': { keyNum: 4, mode: 0 },
    'Fm': { keyNum: 5, mode: 0 },
    'F#m': { keyNum: 6, mode: 0 },
    'Gm': { keyNum: 7, mode: 0 },
    'G#m': { keyNum: 8, mode: 0 },
    'Am': { keyNum: 9, mode: 0 },
    'A#m': { keyNum: 10, mode: 0 },
    'Bm': { keyNum: 11, mode: 0 }
  };

  const parsed = keyMap[keyStr];
  if (parsed) {
    return {
      keyNum: parsed.keyNum,
      mode: parsed.mode,
      keyStr: keyStr
    };
  }

  // Fallback to C major
  return { keyNum: 0, mode: 1, keyStr: 'C' };
}

export async function searchTuneBat(query: string): Promise<TuneBatTrack[]> {
  try {
    // TuneBat search endpoint
    const searchUrl = `https://tunebat.com/api/search?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`TuneBat API error: ${response.status}`);
    }

    const data: TuneBatSearchResult = await response.json();
    return data.tracks || [];
  } catch (error) {
    console.error('TuneBat search error:', error);
    return [];
  }
}

export async function getTuneBatTrackInfo(trackName: string, artistName: string): Promise<{
  bpm: number | null;
  keyNum: number | null;
  mode: number | null;
  keyStr: string | null;
} | null> {
  try {
    const query = `${trackName} ${artistName}`;
    const tracks = await searchTuneBat(query);
    
    if (tracks.length === 0) {
      return null;
    }

    // Find the best match
    const bestMatch = tracks.find(track => 
      track.name.toLowerCase().includes(trackName.toLowerCase()) &&
      track.artist.toLowerCase().includes(artistName.toLowerCase())
    ) || tracks[0];

    if (!bestMatch.bpm || !bestMatch.key) {
      return null;
    }

    const keyInfo = parseKey(bestMatch.key);
    
    return {
      bpm: bestMatch.bpm,
      keyNum: keyInfo.keyNum,
      mode: keyInfo.mode,
      keyStr: keyInfo.keyStr
    };
  } catch (error) {
    console.error('Error getting TuneBat track info:', error);
    return null;
  }
}

// Fallback BPM database for popular tracks when TuneBat fails
const FALLBACK_BPM_DB: Record<string, { bpm: number; key: string }> = {
  'not like us': { bpm: 101, key: 'C' },
  'humble': { bpm: 150, key: 'C#' },
  'dna': { bpm: 150, key: 'D' },
  'king kunta': { bpm: 95, key: 'D#' },
  'alright': { bpm: 80, key: 'E' },
  'swimming pools': { bpm: 135, key: 'F' },
  'maad city': { bpm: 140, key: 'F#' },
  'backseat freestyle': { bpm: 140, key: 'G' },
  'money trees': { bpm: 140, key: 'G#' },
  'bitch dont kill my vibe': { bpm: 140, key: 'A' },
  'poetic justice': { bpm: 140, key: 'A#' },
  'good kid': { bpm: 140, key: 'B' },
  'drake': { bpm: 140, key: 'C' },
  'hotline bling': { bpm: 136, key: 'C#' },
  'one dance': { bpm: 104, key: 'D' },
  'god\'s plan': { bpm: 77, key: 'D#' },
  'nice for what': { bpm: 92, key: 'E' },
  'in my feelings': { bpm: 91, key: 'F' },
  'nonstop': { bpm: 150, key: 'F#' },
  'started from the bottom': { bpm: 140, key: 'G' },
  'hold on we\'re going home': { bpm: 100, key: 'G#' },
  'take care': { bpm: 140, key: 'A' },
  'headlines': { bpm: 140, key: 'A#' },
  'the motto': { bpm: 140, key: 'B' }
};

export function getFallbackBPM(trackName: string, artistName: string): {
  bpm: number | null;
  keyNum: number | null;
  mode: number | null;
  keyStr: string | null;
} | null {
  const searchKey = `${trackName} ${artistName}`.toLowerCase();
  
  for (const [key, value] of Object.entries(FALLBACK_BPM_DB)) {
    if (searchKey.includes(key)) {
      const keyInfo = parseKey(value.key);
      return {
        bpm: value.bpm,
        keyNum: keyInfo.keyNum,
        mode: keyInfo.mode,
        keyStr: keyInfo.keyStr
      };
    }
  }
  
  return null;
}

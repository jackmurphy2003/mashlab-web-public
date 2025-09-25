import { NextApiRequest, NextApiResponse } from 'next';
import { getSpotifyAccessToken } from '../../../lib/spotify';
import { resolveTempoKeyFromAnalysis, mapKeyToStr } from '../../../lib/tempoKey';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Database helper
async function getDb() {
  return open({
    filename: path.join(process.cwd(), 'murphmixes.db'),
    driver: sqlite3.Database
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { spotifyId } = req.body as { spotifyId: string };
    
    if (!spotifyId) {
      return res.status(400).json({ error: 'Missing spotifyId' });
    }

    const db = await getDb();

    // 1) USER OVERRIDE WINS
    const existingOverride = await db.get(
      'SELECT * FROM user_overrides WHERE spotify_id = ?',
      [spotifyId]
    );
    
    if (existingOverride) {
      const { bpm, key_num, mode } = existingOverride;
      return res.json({
        source: "user",
        bpm, key_num, mode, key_str: mapKeyToStr(key_num, mode),
        confidence: 1.0, flags: { user_verified: true }
      });
    }

    // 2) CACHE?
    const cached = await db.get(
      'SELECT * FROM track_metrics WHERE spotify_id = ?',
      [spotifyId]
    );
    
    if (cached) {
      return res.json({ 
        source: "cache", 
        ...cached,
        flags: cached.flags ? JSON.parse(cached.flags) : {},
        raw: cached.raw ? JSON.parse(cached.raw) : {}
      });
    }

    // 3) SPOTIFY ANALYSIS + FEATURES
    const token = await getSpotifyAccessToken();
    
    // Get audio analysis
    const anaResponse = await fetch(`https://api.spotify.com/v1/audio-analysis/${spotifyId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    
    if (!anaResponse.ok) {
      throw new Error(`Spotify analysis failed: ${anaResponse.status}`);
    }
    
    const ana = await anaResponse.json();
    const resolved = resolveTempoKeyFromAnalysis(ana);

    // fallback: features key/tempo if analysis missing
    if (resolved.bpm == null || resolved.key_num == null) {
      const featResponse = await fetch(`https://api.spotify.com/v1/audio-features/${spotifyId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });
      
      if (featResponse.ok) {
        const feat = await featResponse.json();
        if (resolved.bpm == null && typeof feat?.tempo === "number") {
          resolved.bpm = feat.tempo;
        }
        if (resolved.key_num == null && typeof feat?.key === "number" && (feat.mode === 0 || feat.mode === 1)) {
          resolved.key_num = feat.key; 
          resolved.mode = feat.mode;
          resolved.key_str = mapKeyToStr(feat.key, feat.mode);
        }
      }
    }

    // 4) Persist to database
    const payload = {
      spotify_id: spotifyId,
      bpm: resolved.bpm,
      key_num: resolved.key_num,
      mode: resolved.mode,
      key_str: resolved.key_str,
      source: "resolver:v1",
      confidence: resolved.confidence,
      flags: JSON.stringify(resolved.flags),
      raw: JSON.stringify({ spotifyAnalysis: true }) // add snapshots if you like
    };
    
    await db.run(`
      INSERT OR REPLACE INTO track_metrics 
      (spotify_id, bpm, key_num, mode, key_str, source, confidence, flags, raw, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      payload.spotify_id,
      payload.bpm,
      payload.key_num,
      payload.mode,
      payload.key_str,
      payload.source,
      payload.confidence,
      payload.flags,
      payload.raw
    ]);

    await db.close();

    return res.json({ 
      source: "resolver", 
      ...payload,
      flags: resolved.flags,
      raw: { spotifyAnalysis: true }
    });

  } catch (error) {
    console.error('Tempo/Key resolve error:', error);
    return res.status(500).json({ error: 'Failed to resolve tempo/key' });
  }
}

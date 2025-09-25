import { NextApiRequest, NextApiResponse } from 'next';
import { mapKeyToStr } from '../../../lib/tempoKey';
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
  const db = await getDb();

  try {
    if (req.method === 'POST') {
      // Set user override
      const { spotifyId, bpm, key_num, mode, reason } = req.body as {
        spotifyId: string;
        bpm?: number;
        key_num?: number;
        mode?: number;
        reason?: string;
      };

      if (!spotifyId) {
        return res.status(400).json({ error: 'Missing spotifyId' });
      }

      await db.run(`
        INSERT OR REPLACE INTO user_overrides 
        (spotify_id, bpm, key_num, mode, reason, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [spotifyId, bpm || null, key_num || null, mode || null, reason || null]);

      await db.close();

      return res.json({ 
        ok: true, 
        key_str: mapKeyToStr(key_num, mode) 
      });

    } else if (req.method === 'DELETE') {
      // Clear user override
      const { spotifyId } = req.body as { spotifyId: string };

      if (!spotifyId) {
        return res.status(400).json({ error: 'Missing spotifyId' });
      }

      await db.run(
        'DELETE FROM user_overrides WHERE spotify_id = ?',
        [spotifyId]
      );

      await db.close();

      return res.json({ ok: true });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('User override error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to update override' });
  }
}

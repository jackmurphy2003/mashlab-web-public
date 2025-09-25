import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Open the SQLite database
    const db = await open({
      filename: 'murphmixes.db',
      driver: sqlite3.Database
    });

    // Get all tracks from the database
    const tracks = await db.all(`
      SELECT 
        track_id as spotify_id,
        title as name,
        artist as artist_primary_name,
        artist as artist_primary_id, -- Using artist name as ID for now
        '' as album_id,
        '' as album_name,
        album_art as cover_url,
        bpm,
        key_int as key_num,
        mode_int as mode,
        camelot as key_str,
        '' as genres,
        created_at as date_added
      FROM tracks 
      ORDER BY created_at DESC
    `);

    await db.close();

    return res.status(200).json(tracks);
  } catch (error) {
    console.error('Error fetching library data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

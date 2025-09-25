import { NextApiRequest, NextApiResponse } from 'next';
import { getSpotifyAccessToken, searchTracks } from '../../../lib/spotify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const q = req.query.q as string || "";
    const limit = Number(req.query.limit || 50);
    const offset = Number(req.query.offset || 0);
    const token = await getSpotifyAccessToken();
    const r = await searchTracks(token, q, limit, offset);
    return res.json(r);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
}

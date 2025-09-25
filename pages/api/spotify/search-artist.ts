import { NextApiRequest, NextApiResponse } from 'next';
import { getSpotifyAccessToken, searchArtists } from '../../../lib/spotify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const q = req.query.q as string || "";
    const token = await getSpotifyAccessToken();
    const r = await searchArtists(token, q, 10);
    const items = (r.artists?.items || []).map((a: any) => ({
      id: a.id, 
      name: a.name, 
      genres: a.genres || [], 
      image: a.images?.[0]?.url || null
    }));
    return res.json({ items });
  } catch (error) {
    console.error('Artist search error:', error);
    return res.status(500).json({ error: 'Failed to search artists' });
  }
}

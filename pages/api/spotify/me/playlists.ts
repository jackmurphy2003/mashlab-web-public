import { NextApiRequest, NextApiResponse } from 'next';
import { getSpotifyAccessToken, myPlaylists } from '../../../../lib/spotify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = await getSpotifyAccessToken();
    const r = await myPlaylists(token, 50);
    const items = r.map((p: any) => ({ id: p.id, name: p.name }));
    return res.json({ items });
  } catch (error) {
    console.error('Playlists error:', error);
    return res.status(500).json({ error: 'Failed to fetch playlists' });
  }
}

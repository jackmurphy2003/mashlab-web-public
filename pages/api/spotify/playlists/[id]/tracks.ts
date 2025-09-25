import { NextApiRequest, NextApiResponse } from 'next';
import { getSpotifyAccessToken, playlistTracks } from '../../../../../lib/spotify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid playlist ID' });
    }

    const token = await getSpotifyAccessToken();
    const items = await playlistTracks(token, id);
    // flatten to track ids, skipping local files
    const tracks = items.map((it: any) => it.track).filter((t: any) => t && t.id);
    return res.json({ items: tracks });
  } catch (error) {
    console.error('Playlist tracks error:', error);
    return res.status(500).json({ error: 'Failed to fetch playlist tracks' });
  }
}

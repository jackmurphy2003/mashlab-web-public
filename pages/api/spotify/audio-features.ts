import { NextApiRequest, NextApiResponse } from 'next';
import { getSpotifyAccessToken, audioFeatures } from '../../../lib/spotify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ids = (req.query.ids as string || "").split(",").filter(Boolean);
    const token = await getSpotifyAccessToken();
    const r = await audioFeatures(token, ids);
    return res.json({ audio_features: r });
  } catch (error) {
    console.error('Audio features error:', error);
    return res.status(500).json({ error: 'Failed to fetch audio features' });
  }
}

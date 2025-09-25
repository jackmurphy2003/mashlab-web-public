import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage for saved mashups (in production, use a database)
let savedMashups: any[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { seedId, partnerId, source, criteria } = req.body;

    if (!seedId || !partnerId || !source || !criteria) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newMashup = {
      id: `mashup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      seedId,
      partnerId,
      source,
      criteria,
      createdAt: new Date().toISOString()
    };

    savedMashups.push(newMashup);

    res.status(200).json({ ok: true, id: newMashup.id });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Export for use in other endpoints
export { savedMashups };

import type { NextApiRequest, NextApiResponse } from 'next';
import { savedMashups } from './save';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      const items = savedMashups
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(Number(offset), Number(offset) + Number(limit));

      res.status(200).json({ 
        items, 
        total: savedMashups.length 
      });
    } catch (error) {
      console.error('Get saved error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: 'Missing ids array' });
      }

      // Remove mashups by id
      const idsToRemove = new Set(ids);
      const originalLength = savedMashups.length;
      savedMashups.splice(0, savedMashups.length, ...savedMashups.filter(m => !idsToRemove.has(m.id)));

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Delete saved error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

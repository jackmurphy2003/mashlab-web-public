import type { NextApiRequest, NextApiResponse } from "next";
import { serverFetch } from "../../../lib/serverFetch";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  
  try {
    const r = await serverFetch("/api/mashups/search", { 
      method: "POST", 
      body: JSON.stringify(req.body) 
    });
    const body = await r.text();
    res.status(r.status).send(body);
  } catch (error) {
    console.error("Mashups search proxy error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  
  const ok = req.body?.code === process.env.PREVIEW_CODE;
  if (!ok) return res.status(401).json({ ok: false });
  
  // httpOnly cookie for gate
  res.setHeader("Set-Cookie", `ml_preview=ok; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60*60*24*7}`);
  return res.json({ ok: true });
}

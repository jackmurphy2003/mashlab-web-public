import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Set-Cookie", `ml_preview=; HttpOnly; Path=/; Max-Age=0`);
  res.redirect("/access");
}

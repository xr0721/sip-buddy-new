import { generateSipRecommendations } from '../src/server/geminiService.js';

export default async function handler(req: any, res: any) {
  // Support CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // use original body
      }
    }

    const payload = await generateSipRecommendations(body || {});
    return res.status(200).json(payload);
  } catch (error: any) {
    console.error('Vercel API error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate recommendations',
    });
  }
}

import { DRINK_REFERENCES } from '../src/data/drinkReferences.js';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    total: DRINK_REFERENCES.length,
    drinks: DRINK_REFERENCES,
  });
}

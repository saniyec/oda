// api/config.js — serves public Supabase config to the frontend
// The anon key is safe to expose; it's locked down by Row Level Security
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(`
window.SUPABASE_URL = ${JSON.stringify(process.env.SUPABASE_URL || '')};
window.SUPABASE_ANON_KEY = ${JSON.stringify(process.env.SUPABASE_ANON_KEY || '')};
  `.trim());
}

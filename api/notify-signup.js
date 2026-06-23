// api/notify-signup.js
// Receives signup/payment notifications from landing page and paywall
// Saves to Supabase + optionally sends email notification

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, lang, plan, source, ts } = req.body || {};
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Save to pending_signups table in Supabase
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/pending_signups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          email,
          name: name || '',
          plan: plan || '₺299/ay',
          lang: lang || 'tr',
          source: source || 'landing',
          created_at: ts || new Date().toISOString(),
          status: 'pending',
        }),
      });
    } catch (e) {
      console.error('Supabase save failed:', e.message);
    }
  }

  // Send email notification to you (using a simple fetch to an email service)
  // For now just logs — add your email service here when ready
  const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'merhaba@oda.clinic';
  console.log(`[notify-signup] New signup: ${name} <${email}> | plan: ${plan} | source: ${source}`);

  // If you want email notifications, add Resend/SendGrid/etc here:
  // const RESEND_KEY = process.env.RESEND_API_KEY;
  // if (RESEND_KEY) { ... }

  return res.status(200).json({ ok: true });
}

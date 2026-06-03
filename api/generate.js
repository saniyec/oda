export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method Not Allowed" } });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: { message: "ANTHROPIC_API_KEY not set." } });
  }

  // ── AUTH CHECK: require a valid Supabase session token ──
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return res.status(401).json({ error: { message: "Unauthorized." } });
  }

  // Verify the token against Supabase
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    const verify = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_SERVICE_KEY,
      }
    });
    if (!verify.ok) {
      return res.status(401).json({ error: { message: "Invalid session. Please log in again." } });
    }
  }

  const { system, messages, max_tokens = 1600 } = req.body;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens,
        system,
        messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: err.message || "Network error." } });
  }
}

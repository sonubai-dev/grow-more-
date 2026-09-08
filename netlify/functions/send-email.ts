export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await req.json();
    const apiKey = process.env.RESEND_API_KEY || '';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'ZellonAI <onboarding@resend.dev>';
    const toRecipients = Array.isArray(payload.to) ? payload.to : [payload.to];

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: payload.from || fromEmail,
        to: toRecipients,
        subject: payload.subject || 'ZellonAI Notification',
        html: payload.html || '<p>ZellonAI Notification</p>',
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

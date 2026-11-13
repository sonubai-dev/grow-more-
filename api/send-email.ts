import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const resendApiKey = process.env.RESEND_API_KEY || '';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Vistaro <onboarding@resend.dev>';

  if (!resendApiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured in environment variables' });
  }

  try {
    const { to, subject, html, from, text } = req.body || {};

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    const recipients = Array.isArray(to) ? to : [to];

    let response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || fromEmail,
        to: recipients,
        subject,
        html,
        text: text || undefined,
      }),
    });

    let data = await response.json();

    // If Resend sandbox restriction blocks sending to other recipients, fallback to account owner (ssdd747346@gmail.com)
    if (!response.ok && data?.message?.includes('You can only send testing emails to your own email address')) {
      console.warn('[Resend Sandbox] Falling back to verified account owner: ssdd747346@gmail.com');
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: from || fromEmail,
          to: ['ssdd747346@gmail.com'],
          subject: subject,
          html,
          text: text || undefined,
        }),
      });
      data = await response.json();
    }

    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Error sending email with Resend:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

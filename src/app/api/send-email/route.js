export async function POST(request) {
  try {
    const body = await request.json();
    const { to, subject, text, html, template_params, template_id } = body || {};

    if (!to || !subject || !(text || html || template_params)) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, text/html or template_params' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Prefer EmailJS server API when configured
    const EMAILJS_USER_ID = process.env.EMAILJS_USER_ID;
    const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
    const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;

    const templateToUse = template_id || EMAILJS_TEMPLATE_ID;

    if (EMAILJS_USER_ID && EMAILJS_SERVICE_ID && templateToUse) {
      // send via EmailJS server API
      const payload = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: templateToUse,
        user_id: EMAILJS_USER_ID,
        template_params: template_params || { to_email: to, subject: subject, message: text || '' },
      };

      // Prefer using a private key (access token) when available for server-side
      // requests; EmailJS accepts an `accessToken` param for stronger auth.
      if (process.env.EMAILJS_PRIVATE_KEY) {
        payload.accessToken = process.env.EMAILJS_PRIVATE_KEY;
      }

      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error('EmailJS server send failed', res.status, t);
        return new Response(JSON.stringify({ error: 'Email provider rejected request' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Fallback to SendGrid if configured
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    if (SENDGRID_API_KEY) {
      const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: process.env.SENDGRID_FROM || 'no-reply@example.com', name: process.env.SENDGRID_FROM_NAME || 'No Reply' },
          subject: subject,
          content: [
            { type: 'text/plain', value: text || '' },
            ...(html ? [{ type: 'text/html', value: html }] : []),
          ],
        }),
      });

      if (!sgRes.ok) {
        const t = await sgRes.text();
        console.error('SendGrid error:', sgRes.status, t);
        return new Response(JSON.stringify({ error: 'Email provider rejected request' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    console.warn('send-email called but no email provider configured (EMAILJS or SENDGRID)');
    return new Response(JSON.stringify({ error: 'Email provider not configured' }), { status: 501, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('send-email error', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

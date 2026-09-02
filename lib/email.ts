import 'server-only';
import { Resend } from 'resend';

/**
 * Sends the magic sign-in link via Resend.
 *
 * Config (Doppler/Railway env):
 *   - RESEND_API_KEY      → your Resend API key (required to actually send)
 *   - LINK_HUB_MAIL_FROM  → the From address, e.g. "LeaderPass <no-reply@leaderpass.com>"
 *                           (defaults to Resend's onboarding sender for first tests)
 *
 * Returns true if an email was sent; false if RESEND_API_KEY isn't set (the
 * caller then falls back to the dev shortcut). Throws only on a real send error.
 */
export async function sendMagicLink(to: string, link: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const from = process.env.LINK_HUB_MAIL_FROM?.trim() || 'LeaderPass <onboarding@resend.dev>';
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to,
    subject: 'Your LeaderPass sign-in link',
    text: [
      'Sign in to your LeaderPass video library:',
      '',
      link,
      '',
      'This link expires in 20 minutes. If you did not request it, you can ignore this email.',
    ].join('\n'),
    html: magicLinkHtml(link),
  });

  if (error) {
    throw new Error(typeof error === 'string' ? error : error.message ?? 'email send failed');
  }
  return true;
}

function magicLinkHtml(link: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#0c1218;font-family:'Hanken Grotesk',Helvetica,Arial,sans-serif;color:#f4eee2;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0c1218;padding:32px 0;">
      <tr><td align="center">
        <table role="presentation" width="440" cellpadding="0" cellspacing="0" style="max-width:440px;background:#121a22;border:1px solid rgba(146,166,185,0.34);border-radius:16px;padding:32px;">
          <tr><td>
            <div style="width:44px;height:44px;border-radius:11px;background:#dbaf5f;text-align:center;line-height:44px;font-weight:700;color:#0d1319;font-size:20px;">▶</div>
            <h1 style="font-size:20px;font-weight:700;color:#fff9ef;margin:22px 0 8px;">Your video library</h1>
            <p style="font-size:15px;line-height:1.5;color:#c4b8a8;margin:0 0 24px;">Click below to sign in. No password needed.</p>
            <a href="${link}" style="display:inline-block;background:#dbaf5f;color:#0d1319;font-weight:700;font-size:15px;text-decoration:none;padding:12px 22px;border-radius:9px;">Sign in →</a>
            <p style="font-size:12.5px;line-height:1.5;color:#9d9287;margin:24px 0 0;">This link expires in 20 minutes. If you didn&rsquo;t request it, you can ignore this email.</p>
          </td></tr>
        </table>
        <p style="font-size:11px;color:#6f685d;margin:18px 0 0;">LeaderPass</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

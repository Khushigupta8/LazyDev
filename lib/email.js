import 'server-only';

/**
 * Transactional emails for enquiries.
 * - clientEmail: thank-you sent to the person who filled in the enquiry form
 * - ownerEmail:  "new enquiry" alert sent to you (settings.email)
 * Sending uses Resend (https://resend.com) through its REST API. Without RESEND_API_KEY nothing
 * is sent, so the site keeps working exactly as before.
 * Templates are table-based with inline styles so they render in Gmail, Outlook and Apple Mail.
 */

const C = {
  cream: '#f5e9e2',
  paper: '#faf4ef',
  blush: '#ead2c8',
  wine: '#4a1421',
  rose: '#b37e6b',
  text: '#3d1019',
  muted: '#866a6c',
  line: '#e3cbbf',
};
const DISPLAY = "'Italiana', 'Didot', 'Bodoni MT', Georgia, serif";
const SANS = "'Jost', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const nl2br = (v) => esc(v).replace(/\r?\n/g, '<br>');
const firstName = (name) => String(name || '').trim().split(/\s+/)[0] || 'there';

function button(href, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="background:${C.wine};border-radius:999px;">
      <a href="${esc(href)}" style="display:inline-block;padding:14px 32px;font-family:${SANS};font-size:12px;letter-spacing:3px;text-transform:uppercase;color:${C.cream};text-decoration:none;">${esc(label)}</a>
    </td></tr></table>`;
}

function detailRows(rows) {
  return rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) => `<tr>
        <td valign="top" style="padding:12px 0;border-bottom:1px solid ${C.line};width:120px;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.rose};">${esc(k)}</td>
        <td valign="top" style="padding:12px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:15px;line-height:1.6;color:${C.text};">${v}</td>
      </tr>`,
    )
    .join('');
}

/** Shared frame: logo header, cream card, footer with contact details. */
function layout({ preheader, kicker, title, body, settings, siteUrl }) {
  const brand = esc(settings.brandName || 'Khushii Labs');
  const logo = siteUrl ? `<img src="${esc(siteUrl)}/brand/icon.png" width="56" height="56" alt="${brand}" style="display:block;margin:0 auto 14px;border:0;border-radius:50%;">` : '';
  const contact = [
    settings.email && `<a href="mailto:${esc(settings.email)}" style="color:${C.muted};text-decoration:none;">${esc(settings.email)}</a>`,
    settings.phone && esc(settings.phone),
    settings.location && esc(settings.location),
  ].filter(Boolean).join(' &nbsp;·&nbsp; ');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Italiana&family=Jost:wght@400;500&family=Pinyon+Script&display=swap" rel="stylesheet">
<style>
  @media (max-width: 620px) {
    .card { padding: 36px 24px !important; }
    .h1 { font-size: 34px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.cream};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};">
  <tr><td align="center" style="padding:40px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
      <tr><td align="center" style="padding-bottom:28px;">
        ${logo}
        <div style="font-family:${DISPLAY};font-size:26px;letter-spacing:6px;text-transform:uppercase;color:${C.wine};">${brand}</div>
      </td></tr>
      <tr><td class="card" style="background:${C.paper};border:1px solid ${C.line};border-radius:4px;padding:48px 44px;">
        <div style="text-align:center;font-family:${SANS};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${C.rose};">${esc(kicker)}</div>
        <div style="text-align:center;padding:14px 0 6px;"><span style="display:inline-block;width:54px;height:1px;background:${C.rose};vertical-align:middle;"></span><span style="font-family:${DISPLAY};color:${C.rose};padding:0 10px;">&#10022;</span><span style="display:inline-block;width:54px;height:1px;background:${C.rose};vertical-align:middle;"></span></div>
        <h1 class="h1" style="margin:12px 0 28px;text-align:center;font-family:${DISPLAY};font-weight:400;font-size:40px;line-height:1.15;color:${C.wine};">${esc(title)}</h1>
        ${body}
      </td></tr>
      <tr><td align="center" style="padding:28px 12px 0;font-family:${SANS};font-size:12px;line-height:1.8;color:${C.muted};">
        ${contact}
        ${siteUrl ? `<br><a href="${esc(siteUrl)}" style="color:${C.rose};text-decoration:none;">${esc(siteUrl.replace(/^https?:\/\//, ''))}</a>` : ''}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

const p = (html) => `<p style="margin:0 0 18px;font-family:${SANS};font-size:16px;line-height:1.75;color:${C.text};">${html}</p>`;

/** Thank-you email to the person who sent the enquiry. */
export function clientEmail(enquiry, settings, siteUrl) {
  const owner = settings.ownerName || settings.brandName || 'Khushii Labs';
  const steps = [
    ['01', 'I read your brief', 'I personally go through everything you shared and reply within 24 hours.'],
    ['02', 'A relaxed call', 'We talk through your business, goals and the kind of website you need, with no pressure.'],
    ['03', 'Your fixed quote', 'You receive a clear, fixed price and timeline before any work begins.'],
  ];
  const body = `
    ${p(`Hi ${esc(firstName(enquiry.name))},`)}
    ${p(`Thank you for reaching out. Your enquiry has landed safely with me, and I’m already looking forward to learning more about ${enquiry.company ? esc(enquiry.company) : 'your project'}.`)}
    <div style="margin:32px 0 8px;font-family:${SANS};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${C.wine};font-weight:500;">What happens next</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      ${steps.map(([n, t, d]) => `<tr>
        <td valign="top" style="width:56px;padding:16px 0;border-bottom:1px solid ${C.line};font-family:${DISPLAY};font-size:30px;line-height:1;color:${C.rose};">${n}</td>
        <td valign="top" style="padding:16px 0;border-bottom:1px solid ${C.line};">
          <div style="font-family:${SANS};font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:500;color:${C.wine};">${t}</div>
          <div style="padding-top:4px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.muted};">${d}</div>
        </td></tr>`).join('')}
    </table>
    <div style="margin:0 0 8px;font-family:${SANS};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${C.wine};font-weight:500;">Your enquiry</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
      ${detailRows([
        ['Service', esc(enquiry.service)],
        ['Website type', esc(enquiry.budget)],
        ['Timeline', esc(enquiry.timeline)],
        ['Message', nl2br(enquiry.message)],
      ])}
    </table>
    ${p('If you think of anything else, simply reply to this email. It comes straight to me.')}
    <div style="padding-top:8px;font-family:${SANS};font-size:16px;color:${C.text};">Warmly,</div>
    <div style="font-family:'Pinyon Script', 'Snell Roundhand', 'Apple Chancery', Georgia, serif;font-size:36px;line-height:1.3;color:${C.wine};">${esc(owner)}</div>
    <div style="font-family:${SANS};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${C.rose};">${esc(settings.ownerRole || '')}</div>`;

  return {
    subject: `Thank you for your enquiry, ${firstName(enquiry.name)}`,
    html: layout({ preheader: 'Your enquiry is in. You’ll hear back within 24 hours.', kicker: 'Enquiry received', title: 'Thank you for reaching out', body, settings, siteUrl }),
  };
}

/** Alert to the site owner about a new enquiry. */
export function ownerEmail(enquiry, settings, siteUrl) {
  const when = new Date(enquiry.createdAt || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
  const replySubject = encodeURIComponent(`Re: your ${enquiry.service || 'website'} enquiry`);
  const body = `
    ${p(`<strong style="font-weight:500;">${esc(enquiry.name)}</strong> just sent an enquiry${enquiry.service ? ` about <strong style="font-weight:500;">${esc(enquiry.service)}</strong>` : ''}.`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 32px;">
      ${detailRows([
        ['Name', esc(enquiry.name)],
        ['Email', `<a href="mailto:${esc(enquiry.email)}" style="color:${C.wine};">${esc(enquiry.email)}</a>`],
        ['Phone', enquiry.phone && `<a href="tel:${esc(enquiry.phone.replace(/[^\d+]/g, ''))}" style="color:${C.wine};">${esc(enquiry.phone)}</a>`],
        ['Company', esc(enquiry.company)],
        ['Service', esc(enquiry.service)],
        ['Website type', esc(enquiry.budget)],
        ['Timeline', esc(enquiry.timeline)],
        ['Received', esc(when)],
        ['Message', nl2br(enquiry.message)],
      ])}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
      ${button(`mailto:${enquiry.email}?subject=${replySubject}`, `Reply to ${firstName(enquiry.name)}`)}
      ${siteUrl ? `<div style="padding-top:16px;"><a href="${esc(siteUrl)}/admin" style="font-family:${SANS};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${C.rose};">Open in admin panel</a></div>` : ''}
    </td></tr></table>`;

  return {
    subject: `New enquiry from ${enquiry.name}${enquiry.service ? ` · ${enquiry.service}` : ''}`,
    html: layout({ preheader: `${enquiry.name}: ${String(enquiry.message).slice(0, 90)}`, kicker: 'New enquiry', title: 'You have a new enquiry', body, settings, siteUrl }),
  };
}

/** Send one email via Resend. Returns false (without throwing) when email isn't configured. */
export async function sendEmail({ to, subject, html, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from || !to) return false;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html, ...(replyTo && { reply_to: replyTo }) }),
  });
  if (!res.ok) throw new Error(`Email failed (${res.status}): ${await res.text()}`);
  return true;
}

/** Send both enquiry emails. Errors are logged, never thrown, so the form always succeeds. */
export async function sendEnquiryEmails(enquiry, settings, siteUrl) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.warn('[email] RESEND_API_KEY / EMAIL_FROM not set: enquiry saved to the admin panel but no emails were sent');
    return;
  }
  const owner = process.env.EMAIL_TO || settings.email;
  const jobs = [
    sendEmail({ to: enquiry.email, replyTo: settings.email, ...clientEmail(enquiry, settings, siteUrl) }),
    sendEmail({ to: owner, replyTo: enquiry.email, ...ownerEmail(enquiry, settings, siteUrl) }),
  ];
  for (const r of await Promise.allSettled(jobs)) {
    if (r.status === 'rejected') console.error('[email]', r.reason?.message || r.reason);
  }
}

export const SAMPLE_ENQUIRY = {
  name: 'Priya Sharma',
  email: 'priya@example.com',
  phone: '+91 98765 43210',
  company: 'Bloom Studio',
  service: 'Website Design',
  budget: 'Online store',
  timeline: 'Within a month',
  message: 'Hi! We’re a small florist in Pune and want a website that feels as pretty as our bouquets.\nWe’d love online orders too.',
  createdAt: new Date().toISOString(),
};

import Link from 'next/link';
import { connection } from 'next/server';
import { getSiteData } from '@/lib/db';
import { pageMeta } from '@/lib/site';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Divider } from '@/components/Ornament';

const UPDATED = '16 October 2026';

export async function generateMetadata() {
  await connection();
  const { settings } = await getSiteData();
  return pageMeta({
    settings,
    title: 'Privacy Policy',
    path: '/privacy-policy',
    description: `How ${settings.brandName} collects, uses and protects the personal information you share through this website and its enquiry form.`,
  });
}

export default async function PrivacyPolicyPage() {
  await connection();
  const { settings } = await getSiteData();
  const brand = settings.brandName;
  const email = settings.email;
  const contact = email ? <a href={`mailto:${email}`}>{email}</a> : <Link href="/#contact">the contact form</Link>;

  return (
    <section className="page-hero legal">
      <div className="container">
        <Breadcrumbs items={[{ name: 'Privacy Policy', path: '/privacy-policy' }]} />
        <h1 className="page-title">Privacy Policy</h1>
        <Divider />
        <p className="page-sub">Last updated {UPDATED}</p>

        <div className="legal-body">
          <p>
            This policy explains what personal information {brand} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects when you visit this website or send
            an enquiry, why we collect it and the choices you have.
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li>
              <strong>Enquiry form:</strong> your name, email address and message, plus anything else you choose to add (phone or WhatsApp
              number, brand or company, the service, website type and timeline you are interested in).
            </li>
            <li>
              <strong>Usage data:</strong> if analytics is enabled, Google Analytics collects pages visited, approximate location, device and
              browser details through cookies. Our hosting provider also keeps short-lived server logs (such as IP address) for security.
            </li>
          </ul>

          <h2>How we use it</h2>
          <ul>
            <li>To reply to your enquiry, prepare a quote and deliver the project you ask for.</li>
            <li>To send you a confirmation email when you submit the form.</li>
            <li>To understand how the website is used and improve it.</li>
            <li>To protect the website from spam and abuse.</li>
          </ul>
          <p>We never sell your personal information or use it for unrelated marketing.</p>

          <h2>Who we share it with</h2>
          <p>Only with the service providers that run this website, each acting on our behalf:</p>
          <ul>
            <li>Vercel (website hosting) and Supabase (secure database where enquiries are stored).</li>
            <li>Resend (sending the enquiry confirmation and notification emails).</li>
            <li>Google Analytics (anonymous visitor statistics), when enabled.</li>
          </ul>
          <p>We may also disclose information if required by law.</p>

          <h2>Cookies</h2>
          <p>
            The public website does not use advertising cookies. Google Analytics, when enabled, sets cookies to count visits. You can block or
            delete cookies in your browser settings, or install the{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              Google Analytics opt-out add-on
            </a>
            .
          </p>

          <h2>How long we keep it</h2>
          <p>
            Enquiries are kept for as long as needed to respond and, if we work together, for the length of the project and any legal or
            accounting period after it. You can ask us to delete your enquiry at any time.
          </p>

          <h2>Your rights</h2>
          <p>
            You can ask to see, correct or delete the personal information we hold about you, or withdraw your consent to us contacting you.
            Email {contact} and we will respond within 30 days.
          </p>

          <h2>Security</h2>
          <p>Data is sent over HTTPS and stored with access restricted to the site owner. No method of transmission is 100% secure, but we take reasonable care to protect it.</p>

          <h2>Changes</h2>
          <p>We may update this policy from time to time. The date at the top shows when it last changed.</p>

          <h2>Contact</h2>
          <p>
            Questions about this policy? Email {contact}
            {settings.location ? ` (${settings.location})` : ''}, or go back to the <Link href="/">home page</Link> or the{' '}
            <Link href="/work">portfolio</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}

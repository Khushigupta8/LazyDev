import { connection } from 'next/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import JsonLd from '@/components/JsonLd';
import Analytics from '@/components/Analytics';
import { getSiteData } from '@/lib/db';
import { SITE_URL, absoluteUrl } from '@/lib/site';

export async function generateMetadata() {
  await connection();
  const { settings } = await getSiteData();
  return {
    title: { default: `${settings.brandName} | Website Design & Development`, template: `%s · ${settings.brandName}` },
    description: settings.heroSubtitle,
    icons: { icon: '/brand/icon.png', apple: '/brand/icon.png' },
    // Google Search Console: set GOOGLE_SITE_VERIFICATION to the content="" value of the HTML-tag method
    ...(process.env.GOOGLE_SITE_VERIFICATION && { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }),
  };
}

function organizationSchema(settings) {
  const sameAs = ['instagram', 'linkedin', 'behance'].map((k) => settings[k]).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: settings.brandName,
    url: SITE_URL,
    logo: absoluteUrl('/brand/icon.png'),
    image: absoluteUrl('/og-image.png'),
    description: settings.heroSubtitle,
    founder: settings.ownerName ? { '@type': 'Person', name: settings.ownerName, jobTitle: settings.ownerRole } : undefined,
    email: settings.email || undefined,
    telephone: settings.phone || undefined,
    areaServed: 'Worldwide',
    sameAs: sameAs.length ? sameAs : undefined,
    contactPoint: settings.email
      ? { '@type': 'ContactPoint', contactType: 'sales', email: settings.email, telephone: settings.phone || undefined, url: absoluteUrl('/#contact') }
      : undefined,
  };
}

export default async function SiteLayout({ children }) {
  await connection();
  const { settings, projects } = await getSiteData();
  return (
    <>
      <JsonLd data={organizationSchema(settings)} />
      <div className="bg-noise" aria-hidden="true" />
      <Nav brandName={settings.brandName} />
      <main>{children}</main>
      <Footer settings={settings} projects={projects} />
      <Reveal />
      <Analytics />
    </>
  );
}

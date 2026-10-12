import { connection } from 'next/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { readDb, getSiteData } from '@/lib/db';

export async function generateMetadata() {
  await connection();
  const { settings } = await readDb();
  return {
    title: { default: `${settings.brandName} | Website Design & Development`, template: `%s · ${settings.brandName}` },
    description: settings.heroSubtitle,
    icons: { icon: '/brand/icon.png', apple: '/brand/icon.png' },
  };
}

export default async function SiteLayout({ children }) {
  await connection();
  const { settings } = await readDb();
  return (
    <>
      <div className="bg-noise" aria-hidden="true" />
      <Nav brandName={settings.brandName} />
      <main>{children}</main>
      <Footer settings={settings} projects={(await getSiteData()).projects} />
      <Reveal />
    </>
  );
}

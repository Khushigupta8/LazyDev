import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Divider } from '@/components/Ornament';
import { getSiteData } from '@/lib/db';
import { OG_IMAGE } from '@/lib/site';

export const metadata = {
  title: 'Page not found · Khushii Labs',
  description: 'This page does not exist or has moved. Browse the Khushii Labs portfolio, services or get in touch.',
  robots: { index: false, follow: true },
  openGraph: { title: 'Page not found · Khushii Labs', images: [OG_IMAGE] },
};

export default async function NotFound() {
  const { settings, projects } = await getSiteData();
  return (
    <>
      <div className="bg-noise" aria-hidden="true" />
      <Nav brandName={settings.brandName} />
      <main className="notfound">
        <p className="eyebrow">Error 404</p>
        <h1 className="page-title">Not found</h1>
        <Divider />
        <p>This page doesn&apos;t exist or has moved. Try one of these instead:</p>
        <ul className="notfound-links">
          <li><Link href="/work">Portfolio</Link></li>
          <li><Link href="/#services">Services</Link></li>
          <li><Link href="/#faq">FAQ</Link></li>
          <li><Link href="/#contact">Contact</Link></li>
        </ul>
        <Link href="/" className="btn btn-wine">
          Back to home
        </Link>
      </main>
      <Footer settings={settings} projects={projects} />
    </>
  );
}

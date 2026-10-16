import Link from 'next/link';
import { connection } from 'next/server';
import { getSiteData } from '@/lib/db';
import { pageMeta } from '@/lib/site';
import WorkGrid from '@/components/WorkGrid';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Divider, Sparkle } from '@/components/Ornament';

export async function generateMetadata() {
  await connection();
  const { settings } = await getSiteData();
  return pageMeta({
    settings,
    title: 'Portfolio',
    path: '/work',
    description: `Selected website projects by ${settings.brandName}: custom full-stack builds and WordPress websites for brands, studios and small businesses. View screenshots and visit the live sites.`,
  });
}

export default async function WorkPage() {
  await connection();
  const { projects } = await getSiteData();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs items={[{ name: 'Portfolio', path: '/work' }]} />
          <p className="eyebrow">
            <Sparkle size={9} /> Selected projects <Sparkle size={9} />
          </p>
          <h1 className="page-title">Portfolio</h1>
          <Divider />
          <p className="page-sub">Custom full-stack builds and WordPress websites for brands I love working with. Shopify stores coming soon.</p>
        </div>
      </section>
      <section className="band">
        <div className="container">
          <WorkGrid projects={projects} showFilters upcoming={['Shopify']} />
        </div>
      </section>
      <section className="section">
        <div className="container cta">
          <h2 className="col-title">
            <span /> Have a project in mind? <span />
          </h2>
          <p className="page-sub">
            See <Link href="/#services">what I offer</Link>, <Link href="/#process">how we&apos;ll work together</Link> and{' '}
            <Link href="/#faq">answers to common questions</Link>.
          </p>
          <Link href="/#contact" className="btn btn-wine">
            Let&apos;s talk
          </Link>
        </div>
      </section>
    </>
  );
}

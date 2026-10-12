import Link from 'next/link';
import { connection } from 'next/server';
import { getSiteData } from '@/lib/db';
import WorkGrid from '@/components/WorkGrid';
import { Divider, Sparkle } from '@/components/Ornament';

export const metadata = { title: 'Portfolio' };

export default async function WorkPage() {
  await connection();
  const { projects } = await getSiteData();
  return (
    <>
      <section className="page-hero">
        <div className="container">
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
          <Link href="/#contact" className="btn btn-wine">
            Let&apos;s talk
          </Link>
        </div>
      </section>
    </>
  );
}

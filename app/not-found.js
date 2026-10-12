import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <main className="notfound">
      <p className="eyebrow">Error 404</p>
      <h1 className="page-title">Not found</h1>
      <p>This page doesn&apos;t exist or has moved.</p>
      <Link href="/" className="btn btn-wine">
        Back to home
      </Link>
    </main>
  );
}

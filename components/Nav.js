'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/#work', label: 'Work' },
  { href: '/#services', label: 'Services' },
  { href: '/#process', label: 'Process' },
  { href: '/#reviews', label: 'Reviews' },
  { href: '/work', label: 'Portfolio' },
];

export default function Nav({ brandName }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={'nav' + (scrolled ? ' scrolled' : '') + (open ? ' open' : '')}>
      <div className="container nav-inner">
        <Link href="/" className="logo" aria-label={brandName + ' home'}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-nav.webp" alt={brandName} width={480} height={210} />
        </Link>
        <nav className="nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? 'active' : ''} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/#contact" className="nav-cta" onClick={() => setOpen(false)}>
            Let&apos;s talk
          </Link>
        </nav>
        <button className="nav-toggle" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

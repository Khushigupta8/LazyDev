'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** Adds the "in" class to every .reveal element as it scrolls into view. */
export default function Reveal() {
  const pathname = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    const observe = () => document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
    observe();
    // Catch elements rendered later (e.g. filtered portfolio cards)
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
  return null;
}

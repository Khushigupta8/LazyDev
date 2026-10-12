'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const Mascot3D = dynamic(() => import('./Mascot3D'), { ssr: false });

/** Loads the 3D mascot in the browser only, and pauses rendering when it is off-screen. */
export default function MascotStage({ variant = 'hero', className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '150px' });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={'mascot-stage ' + className} aria-hidden="true">
      <div className="mascot-glow" />
      <Mascot3D variant={variant} active={visible} />
    </div>
  );
}

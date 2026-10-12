'use client';

import { useEffect, useId, useRef } from 'react';

const W = 1400;
const MID = 250;

// Three copies of the word ride on sine-wave paths that keep changing shape,
// so the title ripples like a ribbon: a solid layer plus two outline "ghosts".
const LAYERS = [
  { cls: 'ghost back', amp: 46, freq: 2.2, speed: 1.0, off: 2.1, dy: 26 },
  { cls: 'solid', amp: 12, freq: 1.4, speed: 0.55, off: 0, dy: 0 },
  { cls: 'ghost front', amp: 34, freq: 1.8, speed: 0.8, off: 4.2, dy: -14 },
];

function wave(amp, phase, freq, dy) {
  let d = '';
  for (let x = -60; x <= W + 60; x += 10) {
    const y = MID + dy + Math.sin((x / W) * Math.PI * freq + phase) * amp;
    d += (x === -60 ? 'M' : 'L') + x + ' ' + y.toFixed(1) + ' ';
  }
  return d;
}

export default function WarpTitle({ text, className = '' }) {
  const id = useId().replace(/:/g, '');
  const paths = useRef([]);
  const long = text.length >= 6; // long words are stretched edge to edge; short ones are centred

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const draw = (s) =>
      LAYERS.forEach((l, i) => {
        const amp = l.amp * (0.55 + 0.45 * Math.sin(s * 0.45 + l.off));
        paths.current[i]?.setAttribute('d', wave(amp, s * l.speed + l.off, l.freq, l.dy));
      });
    if (reduce) {
      draw(0);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (t) => {
      draw((t - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg className={'warp ' + className} viewBox={`0 40 ${W} 280`} role="img" aria-label={text}>
      <defs>
        {LAYERS.map((l, i) => (
          <path key={i} id={`${id}-p${i}`} ref={(el) => (paths.current[i] = el)} d={wave(l.amp * 0.6, l.off, l.freq, l.dy)} />
        ))}
      </defs>
      {LAYERS.map((l, i) => (
        <text key={i} className={l.cls} aria-hidden="true" textAnchor={long ? 'start' : 'middle'}>
          {long ? (
            <textPath href={`#${id}-p${i}`} startOffset="110" textLength={W - 160} lengthAdjust="spacingAndGlyphs">
              {text}
            </textPath>
          ) : (
            <textPath href={`#${id}-p${i}`} startOffset="50%">
              {text}
            </textPath>
          )}
        </text>
      ))}
    </svg>
  );
}

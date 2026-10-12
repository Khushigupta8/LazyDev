'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon';
import WarpTitle from './WarpTitle';
import ProjectModal, { ProjectShot } from './ProjectModal';

const AUTO_SPEED = 5; // degrees per second
const MIN_CARDS = 18;

function LogoMark({ size = 96 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="50" cy="50" r="44" strokeWidth="5" />
      <path d="M38 34 22 50l16 16M62 34l16 16-16 16" />
    </svg>
  );
}

/** Builds the ring of cards: projects, services and a few brand cards, repeated to fill the wheel. */
function useCards(projects, services, brandName) {
  return useMemo(() => {
    // Alternate projects and services, then drop the brand cards in between so colours stay mixed
    const s = services.filter((x) => x.status === 'active');
    const max = Math.max(projects.length, s.length);
    const base = [];
    for (let i = 0; i < max; i++) {
      if (projects[i]) base.push({ type: 'project', project: projects[i], index: i });
      if (s[i]) base.push({ type: 'service', service: s[i] });
    }
    const extras = [
      { at: 2, card: { type: 'statement', lines: ['Design', 'Build', 'Launch'] } },
      { at: 4, card: { type: 'brand' } },
      { at: 7, card: { type: 'brand-word', brandName } },
    ];
    extras.forEach(({ at, card }, k) => base.splice(Math.min(at + k, base.length), 0, card));
    // Repeat the whole pattern a whole number of times so the seam never shows duplicates side by side
    const repeats = Math.max(1, Math.ceil(MIN_CARDS / base.length));
    const out = [];
    for (let r = 0; r < repeats; r++) out.push(...base);
    return out.map((c, i) => ({ ...c, key: i }));
  }, [projects, services, brandName]);
}

function Card({ card }) {
  switch (card.type) {
    case 'project':
      return (
        <div className="card card-project">
          <ProjectShot project={card.project} index={card.index} />
          <div className="card-caption">
            <span>{card.project.category}</span>
            <strong>{card.project.title}</strong>
          </div>
        </div>
      );
    case 'service':
      return (
        <div className="card card-service">
          <span className="card-corner">{card.service.tag || 'Service'}</span>
          <Icon name={card.service.icon} size={44} strokeWidth={1.4} />
          <div>
            <strong>{card.service.title}</strong>
            {card.service.price && <span>{card.service.price}</span>}
          </div>
        </div>
      );
    case 'brand':
      return (
        <div className="card card-brand">
          <span className="tri up" />
          <LogoMark />
          <span className="tri down" />
        </div>
      );
    case 'statement':
      return (
        <div className="card card-statement">
          {card.lines.map((l) => (
            <strong key={l}>{l}</strong>
          ))}
          <span>Websites that work.</span>
        </div>
      );
    default:
      return (
        <div className="card card-word">
          <span>Studio</span>
          <strong>{card.brandName}</strong>
          <span>Est. {new Date().getFullYear()}</span>
        </div>
      );
  }
}

export default function Hero({ settings, projects, services }) {
  const cards = useCards(projects, services, settings.brandName);
  const wheelRef = useRef(null);
  const cardRefs = useRef([]);
  const ctrl = useRef({ angle: 0, vel: AUTO_SPEED, target: AUTO_SPEED, dragging: false, moved: 0 });
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const c = ctrl.current;
    if (reduce) c.vel = c.target = 0;
    const n = cards.length;
    const step = 360 / n;
    let radius = 900;
    const measure = () => {
      const w = wheelRef.current?.clientWidth || 1200;
      radius = w < 700 ? 560 : Math.min(1000, Math.max(760, w * 0.6));
      wheelRef.current?.style.setProperty('--radius', radius + 'px');
    };
    measure();
    window.addEventListener('resize', measure);

    let raf;
    let last = performance.now();
    const tick = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!c.dragging) {
        c.vel += (c.target - c.vel) * Math.min(1, dt * 1.6);
        c.angle += c.vel * dt;
      }
      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const a = ((((c.angle + i * step) % 360) + 540) % 360) - 180;
        const near = Math.max(0, 1 - Math.abs(a) / 18);
        el.style.transform = `rotate(${a.toFixed(2)}deg) translateY(${-radius}px) scale(${(0.92 + near * 0.16).toFixed(3)})`;
        el.style.zIndex = String(200 - Math.round(Math.abs(a)));
        el.style.visibility = Math.abs(a) > 70 ? 'hidden' : 'visible';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Arrow buttons elsewhere in the hero give the wheel a push
    const onSpin = (e) => (c.vel = (e.detail || 1) * 120);
    window.addEventListener('wheel:spin', onSpin);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.removeEventListener('wheel:spin', onSpin);
    };
  }, [cards.length]);

  // Drag / swipe to spin
  const drag = useRef({ x: 0, t: 0 });
  const onPointerDown = (e) => {
    const c = ctrl.current;
    c.dragging = true;
    c.moved = 0;
    drag.current = { x: e.clientX, t: performance.now() };
  };
  const onPointerMove = (e) => {
    const c = ctrl.current;
    if (!c.dragging) return;
    const now = performance.now();
    const dx = e.clientX - drag.current.x;
    const deg = dx * 0.07;
    c.angle += deg;
    c.moved += Math.abs(dx);
    c.vel = (deg / Math.max(1, now - drag.current.t)) * 1000;
    drag.current = { x: e.clientX, t: now };
  };
  const endDrag = () => {
    const c = ctrl.current;
    if (!c.dragging) return;
    c.dragging = false;
    c.vel = Math.max(-240, Math.min(240, c.vel));
  };
  const spin = (dir) => window.dispatchEvent(new CustomEvent('wheel:spin', { detail: dir }));

  return (
    <section className="hero">
      <div className="hero-marks" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <i key={i} />
        ))}
      </div>

      <div className="hero-head container">
        <div className="hero-label">
          {settings.heroKicker
            .replace(/\*/g, '')
            .split(' ')
            .reduce((rows, w, i) => {
              const r = Math.min(1, Math.floor(i / 2));
              (rows[r] = rows[r] || []).push(w);
              return rows;
            }, [])
            .map((r, i) => (
              <span key={i}>{r.join(' ')}</span>
            ))}
        </div>

        <div className="hero-title">
          <span className="hero-bar" aria-hidden="true" />
          <h1 className="sr-only">{settings.heroWord}</h1>
          <WarpTitle text={settings.heroWord} />
        </div>

        <button className="hero-arrow left" onClick={() => spin(-1)} aria-label="Spin cards left" />
        <button className="hero-arrow right" onClick={() => spin(1)} aria-label="Spin cards right" />

        <div className="hero-meta">
          <span>{settings.brandName}</span>
          <span className="hero-tagline">{settings.heroTagline}</span>
          <span>Web design &amp; development</span>
        </div>
      </div>

      <div
        className="wheel"
        ref={wheelRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onMouseEnter={() => (ctrl.current.target = AUTO_SPEED * 0.35)}
        onMouseLeave={() => (ctrl.current.target = AUTO_SPEED)}
      >
        <div className="wheel-pivot">
          {cards.map((card, i) => (
            <div
              key={card.key}
              className="wheel-card"
              ref={(el) => (cardRefs.current[i] = el)}
              onClick={() => {
                if (ctrl.current.moved > 6) return;
                if (card.type === 'project') setOpen(card);
                else document.getElementById(card.type === 'service' ? 'services' : 'contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Card card={card} />
            </div>
          ))}
        </div>

        <a href="#intro" className="dial" aria-label="Scroll down">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <path id="dialPath" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
            </defs>
            <text>
              <textPath href="#dialPath">
                {`${settings.brandName} • Websites • Design • Development • `.toUpperCase()}
              </textPath>
            </text>
          </svg>
          <span className="dial-center">
            <i />
            Scroll
          </span>
        </a>
      </div>

      {open && <ProjectModal project={open.project} index={open.index} onClose={() => setOpen(null)} />}
    </section>
  );
}

import Link from 'next/link';
import { connection } from 'next/server';
import { getSiteData } from '@/lib/db';
import Icon from '@/components/Icon';
import Portrait from '@/components/Portrait';
import WorkGrid from '@/components/WorkGrid';
import EnquiryForm from '@/components/EnquiryForm';
import { Divider, Laurel, Sparkle, Sprig } from '@/components/Ornament';

const STEPS = [
  { title: 'Discover', text: 'A relaxed call about your business, goals and budget. You get a fixed quote within 24 hours.' },
  { title: 'Design', text: 'I design every page around your brand and refine it with you until it feels exactly right.' },
  { title: 'Develop', text: 'Clean, fast code that looks beautiful on every screen and is ready for Google from day one.' },
  { title: 'Launch', text: 'Your site goes live, I show you how to edit it, and I stay on hand whenever you need me.' },
];

const FAQS = [
  ['How much does a website cost?', 'It depends on the kind of website you want: the number of pages, features like online payments or bookings, and how custom the design is. After a short call you receive a fixed, transparent quote with no hidden costs.'],
  ['How long does it take?', 'Most business websites launch in two to three weeks. Online stores and larger projects usually take four to eight.'],
  ['Can I update the website myself?', 'Yes. I build on easy-to-use platforms or include a simple admin panel, and walk you through it before handover.'],
  ['Do you handle hosting, domains and maintenance?', 'I can set up hosting and your domain, and offer monthly care plans for updates, backups and small changes.'],
  ['Do you offer graphic design and marketing?', 'Graphic design and digital marketing are launching soon, so you’ll be able to get everything in one place.'],
];

export default async function HomePage() {
  await connection();
  const { settings, services, projects } = await getSiteData();
  const active = services.filter((s) => s.status === 'active');
  const soon = services.filter((s) => s.status === 'coming-soon');
  const highlights = (settings.highlights || []).filter((h) => h.title);
  const clients = [...new Map(projects.filter((p) => p.client).map((p) => [p.client, p])).values()].slice(0, 6);
  const kicker = String(settings.heroKicker || '').replace(/\*/g, '');

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="container">
          <div className="hero-top">
            <span>{kicker}</span>
            <span className="hero-top-line" aria-hidden="true">
              <i />
              <Sparkle size={10} />
            </span>
            <span className="hero-top-right">
              Designing
              <br />
              Websites
              <br />
              Building experiences
            </span>
          </div>

          <h1 className="hero-word" aria-label={settings.heroWord}>
            {[...String(settings.heroWord)].map((ch, i) => (
              <span key={i} style={{ animationDelay: 0.1 + i * 0.07 + 's' }} aria-hidden="true">
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </h1>

          <div className="hero-grid">
            <div className="hero-copy">
              <p className="role">{settings.ownerRole}</p>
              <Divider />
              <p className="hero-intro">{settings.heroSubtitle}</p>
              <p className="signature">{settings.ownerName}</p>
              {settings.location && <p className="based">Based in {settings.location}</p>}
              <div className="hero-actions">
                <a href="#contact" className="btn btn-wine">
                  {settings.ctaLabel}
                </a>
                <a href="#work" className="link-line">
                  View my work
                </a>
              </div>
            </div>
            <div className="hero-photo">
              <Sprig className="sprig-hero" />
              <Portrait photo={settings.photo} name={settings.ownerName} />
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURED WORK ================= */}
      <section className="band" id="work">
        <div className="container">
          <h2 className="band-title reveal">
            <Sparkle size={10} /> Featured work <Sparkle size={10} />
          </h2>
          <WorkGrid projects={projects} limit={3} />
          <div className="band-foot reveal">
            <Link href="/work" className="link-line light">
              See all projects
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SERVICES + HIGHLIGHTS ================= */}
      <section className="section" id="services">
        <div className="container two-col">
          <div className="reveal">
            <h2 className="col-title">
              <span /> What I do <span />
            </h2>
            <ul className="svc-list">
              {active.map((s) => (
                <li key={s.id}>
                  <span className="svc-icon">
                    <Icon name={s.icon} size={18} strokeWidth={1.3} />
                  </span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.description}</p>
                  </div>
                </li>
              ))}
              {soon.map((s) => (
                <li key={s.id} className="soon">
                  <span className="svc-icon">
                    <Icon name={s.icon} size={18} strokeWidth={1.3} />
                  </span>
                  <div>
                    <h3>
                      {s.title} <em>Coming soon</em>
                    </h3>
                    <p>{s.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="svc-note">
              Pricing depends on the kind of website you want. Share your idea and you&apos;ll get a fixed quote after a short call.
            </p>
          </div>

          {highlights.length > 0 && (
            <div className="reveal">
              <h2 className="col-title">
                <span /> Why clients choose me <span />
              </h2>
              <ul className="hl-list">
                {highlights.map((h) => (
                  <li key={h.title}>
                    <span className="laurel">
                      <Laurel size={44} />
                    </span>
                    <div>
                      <h3>{h.title}</h3>
                      {h.text && <p>{h.text}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {clients.length > 0 && (
          <div className="container clients reveal">
            <h2 className="col-title">
              <span /> Brands I&apos;ve worked with <span />
            </h2>
            <ul>
              {clients.map((p) => (
                <li key={p.client}>
                  <strong>{p.client}</strong>
                  <small>{p.category}</small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ================= PROCESS ================= */}
      <section className="section process" id="process">
        <div className="container">
          <h2 className="col-title reveal">
            <span /> How we&apos;ll work together <span />
          </h2>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="reveal" style={{ transitionDelay: i * 90 + 'ms' }}>
                <span className="step-no">0{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="section" id="faq">
        <div className="container faq-wrap">
          <h2 className="col-title reveal">
            <span /> Questions &amp; answers <span />
          </h2>
          <div className="faq reveal">
            {FAQS.map(([q, a], i) => (
              <details key={q} open={i === 0}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section className="contact" id="contact">
        <div className="container">
          <div className="contact-top">
            <Portrait photo={settings.photo} name={settings.ownerName} className="round" />
            <div className="contact-info reveal">
              <h2 className="band-title left">Let&apos;s create something extraordinary</h2>
              <ul className="contact-list">
                {settings.email && (
                  <li>
                    <span className="ci"><Icon name="mail" size={15} /></span>
                    <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  </li>
                )}
                {settings.phone && (
                  <li>
                    <span className="ci"><Icon name="phone" size={15} /></span>
                    <a href={`tel:${settings.phone.replace(/\s/g, '')}`}>{settings.phone}</a>
                  </li>
                )}
                {settings.whatsapp && (
                  <li>
                    <span className="ci"><Icon name="whatsapp" size={15} /></span>
                    <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                      Chat on WhatsApp
                    </a>
                  </li>
                )}
                {settings.location && (
                  <li>
                    <span className="ci"><Icon name="pin" size={15} /></span>
                    <span>{settings.location}</span>
                  </li>
                )}
              </ul>
            </div>
            {settings.quote && (
              <blockquote className="quote reveal">
                <span aria-hidden="true">&ldquo;</span>
                {settings.quote}
                <cite>{settings.ownerName}</cite>
              </blockquote>
            )}
          </div>

          <div className="contact-form reveal">
            <p className="form-intro">Tell me about your project. I reply within one working day.</p>
            <EnquiryForm services={services} />
          </div>
        </div>
      </section>
    </>
  );
}

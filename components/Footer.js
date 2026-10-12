import Link from 'next/link';
import Icon from './Icon';
import { Sparkle } from './Ornament';

export default function Footer({ settings, projects = [] }) {
  const socials = ['instagram', 'linkedin', 'behance'].filter((k) => settings[k]);
  const live = projects.filter((p) => p.url);
  return (
    <footer className="footer">
      <div className="footer-brand">
        <Link href="/" aria-label={settings.brandName + ' home'}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-full.webp" alt={`${settings.brandName}: websites, brands, ideas, real impact`} width={1000} height={573} loading="lazy" />
        </Link>
      </div>
      {live.length > 0 && (
        <div className="container footer-work">
          <p className="footer-work-title">Live projects</p>
          <ul>
            {live.map((p) => (
              <li key={p.id}>
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  {p.title} <Icon name="external" size={11} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="footer-bar">
        <p className="footer-motto">
          <Sparkle size={9} /> Strategy <i>·</i> Creativity <i>·</i> Purpose <Sparkle size={9} />
        </p>
        <div className="container footer-inner">
          <p>
            © {new Date().getFullYear()} {settings.brandName}
          </p>
          <nav className="footer-links">
            <Link href="/#work">Work</Link>
            <Link href="/#services">Services</Link>
            <Link href="/work">Portfolio</Link>
            <Link href="/#contact">Contact</Link>
          </nav>
          {socials.length > 0 ? (
            <div className="socials">
              {socials.map((k) => (
                <a key={k} href={settings[k]} target="_blank" rel="noopener noreferrer" aria-label={k}>
                  <Icon name={k} size={16} />
                </a>
              ))}
            </div>
          ) : (
            <p>{settings.ownerName}</p>
          )}
        </div>
      </div>
    </footer>
  );
}

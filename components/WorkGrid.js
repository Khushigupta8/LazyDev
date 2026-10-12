'use client';

import { useMemo, useState } from 'react';
import Icon from './Icon';
import ProjectModal, { ProjectShot } from './ProjectModal';

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

/**
 * Project cards with optional category filters.
 * `upcoming` adds "coming soon" categories (e.g. Shopify) with a placeholder card.
 */
export default function WorkGrid({ projects, showFilters = false, limit, upcoming: upcomingAll = [] }) {
  const [filter, setFilter] = useState('All');
  const [active, setActive] = useState(null);

  const categories = useMemo(() => ['All', ...new Set(projects.map((p) => p.category).filter(Boolean))], [projects]);
  // A "coming soon" category disappears automatically once a real project uses it
  const upcoming = upcomingAll.filter((u) => !categories.includes(u));

  let list = filter === 'All' ? projects : projects.filter((p) => p.category === filter);
  if (limit) {
    const featured = list.filter((p) => p.featured);
    list = (featured.length ? featured : list).slice(0, limit);
  }
  const soonCards = upcoming.filter((u) => filter === 'All' || filter === u);

  return (
    <>
      {showFilters && (categories.length > 2 || upcoming.length > 0) && (
        <div className="filters">
          {categories.map((c) => (
            <button key={c} className={'filter' + (c === filter ? ' active' : '')} onClick={() => setFilter(c)}>
              {c}
              {c !== 'All' && <em>{projects.filter((p) => p.category === c).length}</em>}
            </button>
          ))}
          {upcoming.map((u) => (
            <button key={u} className={'filter soon' + (u === filter ? ' active' : '')} onClick={() => setFilter(u)}>
              {u} <em>Soon</em>
            </button>
          ))}
        </div>
      )}

      <div className="work-grid">
        {list.length === 0 && soonCards.length === 0 && <p className="empty">New projects are on their way. Check back soon.</p>}
        {list.map((p, i) => {
          const index = projects.indexOf(p);
          return (
            <article key={p.id} className="work-card reveal" style={{ transitionDelay: (i % 3) * 80 + 'ms' }}>
              <button className="work-open" onClick={() => setActive(p)} aria-label={`View details of ${p.title}`}>
                <div className="work-shot">
                  <ProjectShot project={p} index={index} />
                  <span className="work-view">
                    View details <Icon name="arrow" size={14} />
                  </span>
                </div>
                <div className="work-meta">
                  <h3>{p.title}</h3>
                  <span className="work-cat">{[p.category, p.year].filter(Boolean).join(' / ')}</span>
                </div>
              </button>
              {p.url && (
                <a className="work-visit" href={p.url} target="_blank" rel="noopener noreferrer">
                  Visit live site <Icon name="external" size={12} />
                </a>
              )}
            </article>
          );
        })}
        {soonCards.map((u) => (
          <article key={u} className="work-card soon-card reveal">
            <div className="work-shot">
              <div className="shot-placeholder tone-1">
                <span>{u}</span>
              </div>
            </div>
            <div className="work-meta">
              <h3>{u} stores</h3>
              <span className="work-cat">Coming soon</span>
            </div>
          </article>
        ))}
      </div>

      {active && <ProjectModal project={active} index={projects.indexOf(active)} onClose={() => setActive(null)} />}
    </>
  );
}

export { hostOf };

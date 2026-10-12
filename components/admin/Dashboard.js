'use client';

import { useEffect, useState } from 'react';
import Icon from '../Icon';
import { api, StatusPill, timeAgo } from './shared';

export default function Dashboard({ go }) {
  const [s, setS] = useState(null);

  useEffect(() => {
    api('/api/admin/stats').then(setS).catch(() => {});
  }, []);

  if (!s) return <div className="adm-loading inline"><span className="adm-spinner" /></div>;

  const cards = [
    { label: 'New enquiries', value: s.newEnquiries, icon: 'inbox', tone: 'pink', to: 'enquiries' },
    { label: 'In progress', value: s.inProgress, icon: 'bolt', tone: 'amber', to: 'enquiries' },
    { label: 'Projects won', value: s.won, icon: 'crown', tone: 'green', to: 'enquiries' },
    { label: 'Portfolio items', value: s.projects, icon: 'briefcase', tone: 'lavender', to: 'projects' },
  ];

  return (
    <div className="adm-stack">
      <section className="adm-hello">
        <div>
          <h2>Welcome back</h2>
          <p>
            You received <strong>{s.thisWeek}</strong> enquir{s.thisWeek === 1 ? 'y' : 'ies'} this week and have{' '}
            <strong>{s.enquiries}</strong> in total.
          </p>
        </div>
        <div className="adm-row">
          <button className="adm-btn primary" onClick={() => go('projects')}>
            <Icon name="plus" size={16} /> Add a project
          </button>
          <button className="adm-btn" onClick={() => go('services')}>
            Manage services
          </button>
        </div>
      </section>

      <section className="adm-stats">
        {cards.map((c) => (
          <button key={c.label} className={'adm-stat ' + c.tone} onClick={() => go(c.to)}>
            <span className="adm-stat-icon"><Icon name={c.icon} size={20} /></span>
            <strong>{c.value}</strong>
            <span>{c.label}</span>
          </button>
        ))}
      </section>

      <section className="adm-card">
        <header className="adm-card-head">
          <h3>Latest enquiries</h3>
          <button className="adm-btn sm" onClick={() => go('enquiries')}>View all</button>
        </header>
        {s.recent.length === 0 ? (
          <p className="adm-empty">No enquiries yet. They will show up here as soon as someone fills in your contact form.</p>
        ) : (
          <ul className="adm-recent">
            {s.recent.map((e) => (
              <li key={e.id} onClick={() => go('enquiries')}>
                <span className="adm-avatar">{e.name.slice(0, 1).toUpperCase()}</span>
                <div>
                  <strong>{e.name}</strong>
                  <span>{e.service || 'General enquiry'} · {e.email}</span>
                </div>
                <StatusPill status={e.status} />
                <time>{timeAgo(e.createdAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

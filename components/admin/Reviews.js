'use client';

import { useEffect, useState } from 'react';
import Icon from '../Icon';
import { api, toast, timeAgo } from './shared';

const FILTERS = [
  { id: 'pending', label: 'Waiting' },
  { id: 'approved', label: 'On website' },
  { id: 'hidden', label: 'Hidden' },
  { id: 'all', label: 'All' },
];
const PILL = { pending: ['Waiting', 'pink'], approved: ['On website', 'green'], hidden: ['Hidden', 'grey'] };

const Stars = ({ rating }) => (
  <span className="adm-stars" aria-label={`${rating} out of 5 stars`}>
    {'★'.repeat(rating)}
    <i>{'★'.repeat(5 - rating)}</i>
  </span>
);

export default function Reviews({ onChange }) {
  const [list, setList] = useState(null);
  const [filter, setFilter] = useState('pending');

  const load = () => api('/api/admin/reviews').then(setList).catch((e) => toast(e.message, 'error'));
  useEffect(() => {
    load();
  }, []);

  async function setStatus(r, status) {
    try {
      await api('/api/admin/reviews/' + r.id, { method: 'PATCH', body: { status } });
      toast(status === 'approved' ? 'Review is now on your website' : 'Review hidden');
      load();
      onChange?.();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function remove(r) {
    if (!confirm(`Delete the review from ${r.name}?`)) return;
    await api('/api/admin/reviews/' + r.id, { method: 'DELETE' });
    toast('Review deleted');
    load();
    onChange?.();
  }

  if (!list) return <div className="adm-loading inline"><span className="adm-spinner" /></div>;
  const shown = filter === 'all' ? list : list.filter((r) => r.status === filter);
  const count = (id) => (id === 'all' ? list.length : list.filter((r) => r.status === id).length);

  return (
    <div className="adm-stack">
      <div className="adm-toolbar">
        <p className="adm-muted">
          Clients leave reviews from the form on your home page. New reviews wait here and only appear on the website once you
          <strong> approve</strong> them.
        </p>
        <div className="adm-tabs">
          {FILTERS.map((f) => (
            <button key={f.id} className={filter === f.id ? 'active' : ''} onClick={() => setFilter(f.id)}>
              {f.label}<em>{count(f.id)}</em>
            </button>
          ))}
        </div>
      </div>

      <div className="adm-card flush">
        {shown.length === 0 ? (
          <p className="adm-empty">
            {filter === 'pending' ? 'No reviews waiting for approval.' : 'No reviews here yet.'}
          </p>
        ) : (
          <ul className="adm-reviews">
            {shown.map((r) => (
              <li key={r.id}>
                <div className="adm-review-head">
                  <div>
                    <strong>{r.name}</strong>
                    <span>
                      {[r.role, r.service, r.email].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  <span className={'adm-pill ' + PILL[r.status][1]}>{PILL[r.status][0]}</span>
                </div>
                <Stars rating={r.rating} />
                <p className="adm-review-text">{r.message}</p>
                <div className="adm-row between">
                  <time className="adm-muted">{timeAgo(r.createdAt)}</time>
                  <div className="adm-row">
                    {r.status !== 'approved' && (
                      <button className="adm-btn sm primary" onClick={() => setStatus(r, 'approved')}>
                        <Icon name="check" size={15} /> Approve
                      </button>
                    )}
                    {r.status !== 'hidden' && (
                      <button className="adm-btn sm" onClick={() => setStatus(r, 'hidden')}>
                        <Icon name="eye" size={15} /> Hide
                      </button>
                    )}
                    <button className="adm-btn sm danger" onClick={() => remove(r)} aria-label="Delete">
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

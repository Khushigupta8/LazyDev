'use client';

import { useEffect, useState } from 'react';
import Icon from '../Icon';

/** fetch wrapper: JSON in/out, throws on error, broadcasts 401s */
export async function api(url, { method = 'GET', body, raw } = {}) {
  const opts = { method, headers: {} };
  if (raw) opts.body = raw;
  else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !url.endsWith('/login')) window.dispatchEvent(new Event('adm:unauthorized'));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export function toast(message, type = 'ok') {
  window.dispatchEvent(new CustomEvent('adm:toast', { detail: { message, type, id: Math.random() } }));
}

export function ToastHost() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const on = (e) => {
      setItems((list) => [...list, e.detail]);
      setTimeout(() => setItems((list) => list.filter((x) => x.id !== e.detail.id)), 3200);
    };
    window.addEventListener('adm:toast', on);
    return () => window.removeEventListener('adm:toast', on);
  }, []);
  return (
    <div className="adm-toasts">
      {items.map((t) => (
        <div key={t.id} className={'adm-toast ' + t.type}>
          <Icon name={t.type === 'error' ? 'close' : 'check'} size={16} />
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="adm-modal">
      <div className="adm-modal-bg" onClick={onClose} />
      <div className={'adm-modal-card' + (wide ? ' wide' : '')}>
        <header>
          <h2>{title}</h2>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

export const STATUS = {
  new: { label: 'New', cls: 'pink' },
  'in-progress': { label: 'In progress', cls: 'amber' },
  won: { label: 'Won', cls: 'green' },
  closed: { label: 'Closed', cls: 'grey' },
};

export function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.new;
  return <span className={'adm-pill ' + s.cls}>{s.label}</span>;
}

export function fmtDate(iso, withTime) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

export function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  if (s < 604800) return Math.floor(s / 86400) + 'd ago';
  return fmtDate(iso);
}

export const splitList = (v) => String(v || '').split(',').map((x) => x.trim()).filter(Boolean);

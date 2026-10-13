'use client';

import { useEffect, useMemo, useState } from 'react';
import Icon from '../Icon';
import { api, toast, Modal, StatusPill, STATUS, fmtDate, timeAgo } from './shared';

export default function Enquiries({ onChange }) {
  const [list, setList] = useState(null);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);

  const load = () => api('/api/admin/enquiries').then(setList).catch((e) => toast(e.message, 'error'));
  useEffect(() => {
    load();
  }, []);

  const shown = useMemo(() => {
    if (!list) return [];
    const term = q.trim().toLowerCase();
    return list.filter(
      (e) =>
        (filter === 'all' || e.status === filter) &&
        (!term || [e.name, e.email, e.company, e.service, e.message, e.phone].join(' ').toLowerCase().includes(term))
    );
  }, [list, filter, q]);

  async function update(id, patch) {
    try {
      const item = await api('/api/admin/enquiries/' + id, { method: 'PATCH', body: patch });
      setList((l) => l.map((x) => (x.id === id ? item : x)));
      if (open?.id === id) setOpen(item);
      onChange?.();
      return item;
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  async function remove(id) {
    if (!confirm('Delete this enquiry permanently?')) return;
    await api('/api/admin/enquiries/' + id, { method: 'DELETE' });
    setList((l) => l.filter((x) => x.id !== id));
    setOpen(null);
    onChange?.();
    toast('Enquiry deleted');
  }

  if (!list) return <div className="adm-loading inline"><span className="adm-spinner" /></div>;

  const counts = { all: list.length };
  Object.keys(STATUS).forEach((k) => (counts[k] = list.filter((e) => e.status === k).length));

  return (
    <div className="adm-stack">
      <div className="adm-toolbar">
        <div className="adm-tabs">
          {['all', ...Object.keys(STATUS)].map((k) => (
            <button key={k} className={filter === k ? 'active' : ''} onClick={() => setFilter(k)}>
              {k === 'all' ? 'All' : STATUS[k].label} <em>{counts[k]}</em>
            </button>
          ))}
        </div>
        <div className="adm-row">
          <div className="adm-search">
            <Icon name="search" size={16} />
            <input placeholder="Search enquiries…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <a className="adm-btn" href="/api/admin/enquiries/export">
            <Icon name="download" size={16} /> Export CSV
          </a>
        </div>
      </div>

      <div className="adm-card flush">
        {shown.length === 0 ? (
          <p className="adm-empty">{list.length ? 'No enquiries match this filter.' : 'No enquiries yet. Share your website and they will roll in ✨'}</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Service</th>
                  <th>Website type</th>
                  <th>Status</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((e) => (
                  <tr key={e.id} onClick={() => setOpen(e)} className={e.status === 'new' ? 'unread' : ''}>
                    <td>
                      <strong>{e.name}</strong>
                      <span>{e.email}</span>
                    </td>
                    <td>{e.service || '-'}</td>
                    <td>{e.budget || '-'}</td>
                    <td><StatusPill status={e.status} /></td>
                    <td title={fmtDate(e.createdAt, true)}>{timeAgo(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && <Detail e={open} onClose={() => setOpen(null)} update={update} remove={remove} />}
    </div>
  );
}

function Detail({ e, onClose, update, remove }) {
  const [notes, setNotes] = useState(e.notes || '');
  const wa = e.phone ? e.phone.replace(/\D/g, '') : '';

  return (
    <Modal title={e.name} onClose={onClose} wide>
      <div className="adm-detail">
        <div className="adm-detail-grid">
          <Field label="Email" value={<a href={`mailto:${e.email}`}>{e.email}</a>} />
          <Field label="Phone" value={e.phone || '-'} />
          <Field label="Company" value={e.company || '-'} />
          <Field label="Service" value={e.service || '-'} />
          <Field label="Website type" value={e.budget || '-'} />
          <Field label="Timeline" value={e.timeline || '-'} />
          <Field label="Received" value={fmtDate(e.createdAt, true)} />
          <Field
            label="Status"
            value={
              <select value={e.status} onChange={(ev) => update(e.id, { status: ev.target.value }).then(() => toast('Status updated'))}>
                {Object.entries(STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            }
          />
        </div>
        <div className="adm-message">
          <span className="adm-label">Message</span>
          <p>{e.message}</p>
        </div>
        <label className="adm-field">
          <span className="adm-label">Private notes</span>
          <textarea rows={3} value={notes} onChange={(ev) => setNotes(ev.target.value)} placeholder="Call scheduled for Monday, sent quote…" />
        </label>
        <div className="adm-row between">
          <div className="adm-row">
            <a className="adm-btn primary" href={`mailto:${e.email}?subject=${encodeURIComponent('Re: your website enquiry')}`}>
              <Icon name="mail" size={16} /> Reply by email
            </a>
            {wa && (
              <a className="adm-btn" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" size={16} /> WhatsApp
              </a>
            )}
            <button className="adm-btn" onClick={() => update(e.id, { notes }).then((r) => r && toast('Notes saved'))}>
              Save notes
            </button>
          </div>
          <button className="adm-btn danger" onClick={() => remove(e.id)}>
            <Icon name="trash" size={16} /> Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <span className="adm-label">{label}</span>
      <div className="adm-value">{value}</div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Icon, { ICON_CHOICES } from '../Icon';
import { api, toast, Modal, splitList } from './shared';

const STATUS_LABEL = { active: 'Active', 'coming-soon': 'Coming soon', hidden: 'Hidden' };
const EMPTY = { title: '', tag: '', icon: 'sparkle', description: '', features: [], price: '', status: 'active', order: 99 };

export default function Services() {
  const [list, setList] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = () => api('/api/admin/services').then(setList).catch((e) => toast(e.message, 'error'));
  useEffect(() => {
    load();
  }, []);

  async function remove(s) {
    if (!confirm(`Delete the "${s.title}" service?`)) return;
    await api('/api/admin/services/' + s.id, { method: 'DELETE' });
    toast('Service deleted');
    load();
  }

  async function quickStatus(s, status) {
    await api('/api/admin/services/' + s.id, { method: 'PUT', body: { ...s, status } });
    toast(`${s.title} is now ${STATUS_LABEL[status].toLowerCase()}`);
    load();
  }

  if (!list) return <div className="adm-loading inline"><span className="adm-spinner" /></div>;

  return (
    <div className="adm-stack">
      <div className="adm-toolbar">
        <p className="adm-muted">
          Add new offerings any time (graphic design, marketing…). Set a service to <strong>Coming soon</strong> to tease it, or <strong>Active</strong> to launch it.
        </p>
        <button className="adm-btn primary" onClick={() => setEditing({ ...EMPTY, order: list.length + 1 })}>
          <Icon name="plus" size={16} /> Add service
        </button>
      </div>

      <div className="adm-card flush">
        <ul className="adm-svc-list">
          {list.map((s) => (
            <li key={s.id}>
              <span className={'adm-svc-icon ' + s.status}><Icon name={s.icon} size={20} /></span>
              <div className="adm-svc-text">
                <strong>{s.title}</strong>
                <span>{s.description}</span>
              </div>
              <span className="adm-svc-price">{s.price || '-'}</span>
              <select value={s.status} onChange={(e) => quickStatus(s, e.target.value)} aria-label="Status">
                {Object.entries(STATUS_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <div className="adm-row">
                <button className="adm-btn sm" onClick={() => setEditing(s)}><Icon name="edit" size={15} /> Edit</button>
                <button className="adm-btn sm danger" onClick={() => remove(s)} aria-label="Delete"><Icon name="trash" size={15} /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {editing && (
        <ServiceForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ServiceForm({ initial, onClose, onSaved }) {
  const [s, setS] = useState({ ...initial, features: (initial.features || []).join(', ') });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...s, features: splitList(s.features) };
      if (initial.id) await api('/api/admin/services/' + initial.id, { method: 'PUT', body });
      else await api('/api/admin/services', { method: 'POST', body });
      toast(initial.id ? 'Service updated' : 'Service added');
      onSaved();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={initial.id ? 'Edit service' : 'Add service'} onClose={onClose}>
      <form className="adm-form" onSubmit={save}>
        <div className="adm-form-grid">
          <label>Service name*<input value={s.title} onChange={set('title')} required placeholder="Graphic Design" /></label>
          <label>Card label<input value={s.tag} onChange={set('tag')} placeholder="Design" /></label>
        </div>
        <div>
          <span className="adm-label">Icon</span>
          <div className="adm-icon-picker">
            {ICON_CHOICES.map((name) => (
              <button type="button" key={name} className={s.icon === name ? 'active' : ''} onClick={() => setS({ ...s, icon: name })} title={name}>
                <Icon name={name} size={20} />
              </button>
            ))}
          </div>
        </div>
        <label>Short description<textarea rows={3} value={s.description} onChange={set('description')} /></label>
        <label>Features (comma separated)<input value={s.features} onChange={set('features')} placeholder="Logo design, Brand kit, Social posts" /></label>
        <div className="adm-form-grid three">
          <label>Price text<input value={s.price} onChange={set('price')} placeholder="From ₹5,000" /></label>
          <label>
            Status
            <select value={s.status} onChange={set('status')}>
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <label>Order<input type="number" value={s.order} onChange={set('order')} /></label>
        </div>
        <div className="adm-row end">
          <button type="button" className="adm-btn" onClick={onClose}>Cancel</button>
          <button className="adm-btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save service'}</button>
        </div>
      </form>
    </Modal>
  );
}

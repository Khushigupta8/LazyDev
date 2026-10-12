'use client';

import { useEffect, useState } from 'react';
import Icon from '../Icon';
import { api, toast, Modal, splitList } from './shared';

const EMPTY = { title: '', client: '', category: '', year: String(new Date().getFullYear()), url: '', image: '', description: '', tags: [], featured: true, hidden: false, order: 99 };

export default function Projects() {
  const [list, setList] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = () => api('/api/admin/projects').then(setList).catch((e) => toast(e.message, 'error'));
  useEffect(() => {
    load();
  }, []);

  async function remove(p) {
    if (!confirm(`Delete "${p.title}" from your portfolio?`)) return;
    await api('/api/admin/projects/' + p.id, { method: 'DELETE' });
    toast('Project deleted');
    load();
  }

  if (!list) return <div className="adm-loading inline"><span className="adm-spinner" /></div>;
  const categories = [...new Set(list.map((p) => p.category).filter(Boolean))];

  return (
    <div className="adm-stack">
      <div className="adm-toolbar">
        <p className="adm-muted">Showcase the websites you&apos;ve built. Featured projects appear on the home page.</p>
        <button className="adm-btn primary" onClick={() => setEditing({ ...EMPTY, order: list.length + 1 })}>
          <Icon name="plus" size={16} /> Add project
        </button>
      </div>

      {list.length === 0 ? (
        <div className="adm-card"><p className="adm-empty">No projects yet. Add your first website!</p></div>
      ) : (
        <div className="adm-proj-grid">
          {list.map((p) => (
            <article key={p.id} className={'adm-proj' + (p.hidden ? ' is-hidden' : '')}>
              <div className="adm-proj-shot">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" />
                ) : (
                  <span>{p.client || p.title}</span>
                )}
                <div className="adm-proj-flags">
                  {p.featured && <em className="adm-pill pink">Featured</em>}
                  {p.hidden && <em className="adm-pill grey">Hidden</em>}
                </div>
              </div>
              <div className="adm-proj-body">
                <small>{[p.category, p.year].filter(Boolean).join(' · ')}</small>
                <h3>{p.title}</h3>
                <div className="adm-row">
                  <button className="adm-btn sm" onClick={() => setEditing(p)}>
                    <Icon name="edit" size={15} /> Edit
                  </button>
                  {p.url && (
                    <a className="adm-btn sm" href={p.url} target="_blank" rel="noopener noreferrer">
                      <Icon name="external" size={15} />
                    </a>
                  )}
                  <button className="adm-btn sm danger" onClick={() => remove(p)} aria-label="Delete">
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <ProjectForm
          initial={editing}
          categories={categories}
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

function ProjectForm({ initial, categories, onClose, onSaved }) {
  const [p, setP] = useState({ ...initial, tags: (initial.tags || []).join(', ') });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (k) => (e) => setP({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { url } = await api('/api/admin/upload', { method: 'POST', raw: fd });
      setP((prev) => ({ ...prev, image: url }));
      toast('Image uploaded');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...p, tags: splitList(p.tags) };
      if (initial.id) await api('/api/admin/projects/' + initial.id, { method: 'PUT', body });
      else await api('/api/admin/projects', { method: 'POST', body });
      toast(initial.id ? 'Project updated' : 'Project added');
      onSaved();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={initial.id ? 'Edit project' : 'Add project'} onClose={onClose} wide>
      <form className="adm-form" onSubmit={save}>
        <div className="adm-form-grid">
          <label>Project title*<input value={p.title} onChange={set('title')} required placeholder="Bloom & Co. Florist" /></label>
          <label>Client name<input value={p.client} onChange={set('client')} placeholder="Bloom & Co." /></label>
          <label>
            Category
            <input value={p.category} onChange={set('category')} list="cat-list" placeholder="Business Website" />
            <datalist id="cat-list">
              {['Business Website', 'E-commerce', 'Web App', 'Landing Page', 'Portfolio', 'Blog', ...categories].filter((v, i, a) => a.indexOf(v) === i).map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label>Year<input value={p.year} onChange={set('year')} placeholder="2026" /></label>
          <label className="span2">Live website URL<input value={p.url} onChange={set('url')} placeholder="https://example.com" type="url" /></label>
        </div>

        <div className="adm-upload">
          <div className="adm-upload-preview">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt="" />
            ) : (
              <span>No screenshot yet</span>
            )}
          </div>
          <div className="adm-upload-side">
            <span className="adm-label">Screenshot</span>
            <p className="adm-muted">Upload a full-page or above-the-fold screenshot (PNG/JPG/WEBP, max 4 MB). 1600×1050 looks best.</p>
            <label className="adm-btn">
              <Icon name="download" size={16} /> {uploading ? 'Uploading…' : 'Upload image'}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={upload} hidden />
            </label>
            <input value={p.image} onChange={set('image')} placeholder="…or paste an image URL" />
          </div>
        </div>

        <label>Description<textarea rows={4} value={p.description} onChange={set('description')} placeholder="What you built, challenges solved, results achieved…" /></label>
        <div className="adm-form-grid">
          <label>Tags (comma separated)<input value={p.tags} onChange={set('tags')} placeholder="Next.js, SEO, E-commerce" /></label>
          <label>Display order<input type="number" value={p.order} onChange={set('order')} /></label>
        </div>
        <div className="adm-row">
          <label className="adm-check"><input type="checkbox" checked={p.featured} onChange={set('featured')} /> Feature on home page</label>
          <label className="adm-check"><input type="checkbox" checked={p.hidden} onChange={set('hidden')} /> Hide from website</label>
        </div>
        <div className="adm-row end">
          <button type="button" className="adm-btn" onClick={onClose}>Cancel</button>
          <button className="adm-btn primary" disabled={busy || uploading}>{busy ? 'Saving…' : 'Save project'}</button>
        </div>
      </form>
    </Modal>
  );
}

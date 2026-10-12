'use client';

import { useEffect, useState } from 'react';
import Icon from '../Icon';
import { api, toast } from './shared';

const GROUPS = [
  {
    title: 'Brand & hero',
    hint: 'The big hero section at the top of your home page.',
    fields: [
      ['brandName', 'Business name'],
      ['heroWord', 'Giant hero word (e.g. PORTFOLIO or WEBSITES)'],
      ['heroKicker', 'Small line in the top corner'],
      ['heroTagline', 'Small line under the giant word'],
      ['heroSubtitle', 'Short introduction next to your photo', 'textarea'],
      ['ctaLabel', 'Main button text'],
    ],
  },
  {
    title: 'About you',
    hint: 'Your name is shown as a signature under the introduction.',
    fields: [
      ['ownerName', 'Your name'],
      ['ownerRole', 'Your role (e.g. Web Designer & Developer)'],
      ['quote', 'Quote shown in the contact section', 'textarea'],
    ],
  },
  {
    title: 'Contact details',
    hint: 'Shown next to the enquiry form.',
    fields: [
      ['email', 'Email'],
      ['phone', 'Phone'],
      ['whatsapp', 'WhatsApp number (with country code)'],
      ['location', 'Location'],
    ],
  },
  {
    title: 'Social links',
    hint: 'Full URLs. Leave blank to hide.',
    fields: [
      ['instagram', 'Instagram URL'],
      ['linkedin', 'LinkedIn URL'],
      ['behance', 'Behance / Dribbble URL'],
    ],
  },
];

export default function Settings({ onAccountChange }) {
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/api/admin/settings')
      .then((d) => setS({ ...d, highlights: [...(d.highlights || []), ...Array(4).fill({ title: '', text: '' })].slice(0, 4) }))
      .catch((e) => toast(e.message, 'error'));
  }, []);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/api/admin/settings', { method: 'PUT', body: s });
      toast('Settings saved. Your website is updated');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (!s) return <div className="adm-loading inline"><span className="adm-spinner" /></div>;

  const setHighlight = (i, k, v) => setS({ ...s, highlights: s.highlights.map((x, j) => (j === i ? { ...x, [k]: v } : x)) });

  return (
    <div className="adm-stack">
      <form className="adm-stack" onSubmit={save}>
        {GROUPS.map((g) => (
          <section key={g.title} className="adm-card">
            <header className="adm-card-head">
              <div>
                <h3>{g.title}</h3>
                <p className="adm-muted">{g.hint}</p>
              </div>
            </header>
            <div className="adm-form-grid">
              {g.fields.map(([k, label, type]) => (
                <label key={k} className={type === 'textarea' ? 'span2' : ''}>
                  {label}
                  {type === 'textarea' ? (
                    <textarea rows={3} value={s[k] || ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} />
                  ) : (
                    <input value={s[k] || ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} />
                  )}
                </label>
              ))}
            </div>
          </section>
        ))}

        <section className="adm-card">
          <header className="adm-card-head">
            <div>
              <h3>Your photo</h3>
              <p className="adm-muted">
                Shown in the arch at the top and in the contact section. Use a well-lit portrait (at least 1200px tall) on a plain
                background. A cut-out PNG with the background removed looks best.
              </p>
            </div>
          </header>
          <PhotoField value={s.photo} onChange={(photo) => setS({ ...s, photo })} />
        </section>

        <section className="adm-card">
          <header className="adm-card-head">
            <div>
              <h3>Highlights</h3>
              <p className="adm-muted">Up to 4 reasons to choose you, shown next to your services. Only list things that are true.</p>
            </div>
          </header>
          <div className="adm-stats-edit">
            {s.highlights.map((h, i) => (
              <div key={i} className="adm-form-grid">
                <label>Title<input value={h.title} onChange={(e) => setHighlight(i, 'title', e.target.value)} placeholder="Fixed, transparent pricing" /></label>
                <label>Short note<input value={h.text} onChange={(e) => setHighlight(i, 'text', e.target.value)} placeholder="You know the cost upfront." /></label>
              </div>
            ))}
          </div>
        </section>

        <div className="adm-row end sticky-save">
          <button className="adm-btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save website settings'}</button>
        </div>
      </form>

      <Account onAccountChange={onAccountChange} />
    </div>
  );
}

function PhotoField({ value, onChange }) {
  const [uploading, setUploading] = useState(false);

  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { url } = await api('/api/admin/upload', { method: 'POST', raw: fd });
      onChange(url);
      toast('Photo uploaded. Click “Save website settings” to publish it');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="adm-upload">
      <div className="adm-upload-preview portrait">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" />
        ) : (
          <span>No photo yet</span>
        )}
      </div>
      <div className="adm-upload-side">
        <label className="adm-btn">
          <Icon name="download" size={16} /> {uploading ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} hidden />
        </label>
        {value && (
          <button type="button" className="adm-btn danger" onClick={() => onChange('')}>
            <Icon name="trash" size={16} /> Remove photo
          </button>
        )}
      </div>
    </div>
  );
}

function Account({ onAccountChange }) {
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = Object.fromEntries(new FormData(form));
    if (d.next !== d.confirm) return toast('New passwords do not match', 'error');
    setBusy(true);
    try {
      await api('/api/admin/password', { method: 'POST', body: d });
      form.reset();
      toast('Login details updated');
      onAccountChange?.();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="adm-card" onSubmit={submit}>
      <header className="adm-card-head">
        <div>
          <h3>Admin login</h3>
          <p className="adm-muted">Change your username or password. Use at least 8 characters.</p>
        </div>
      </header>
      <div className="adm-form-grid">
        <label>Username (optional)<input name="username" placeholder="Leave blank to keep current" autoComplete="username" /></label>
        <label>Current password*<input name="current" type="password" required autoComplete="current-password" /></label>
        <label>New password*<input name="next" type="password" required minLength={8} autoComplete="new-password" /></label>
        <label>Confirm new password*<input name="confirm" type="password" required minLength={8} autoComplete="new-password" /></label>
      </div>
      <div className="adm-row end">
        <button className="adm-btn primary" disabled={busy}>{busy ? 'Updating…' : 'Update login'}</button>
      </div>
    </form>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import Icon from '../Icon';
import Dashboard from './Dashboard';
import Enquiries from './Enquiries';
import Projects from './Projects';
import Services from './Services';
import Settings from './Settings';
import { api, ToastHost, toast } from './shared';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'enquiries', label: 'Enquiries', icon: 'inbox' },
  { id: 'projects', label: 'Portfolio', icon: 'briefcase' },
  { id: 'services', label: 'Services', icon: 'sparkle' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

function Login({ onDone }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/admin/login', { method: 'POST', body: Object.fromEntries(new FormData(e.currentTarget)) });
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-login">
      <form className="adm-login-card" onSubmit={submit}>
        <span className="adm-logo-mark big">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/icon.png" alt="" />
        </span>
        <h1>Welcome back</h1>
        <p className="adm-muted">Sign in to manage your website</p>
        <label>
          Username
          <input name="username" autoComplete="username" defaultValue="admin" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" required autoFocus />
        </label>
        {error && <p className="adm-error">{error}</p>}
        <button className="adm-btn primary block" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <a href="/" className="adm-back">← Back to website</a>
      </form>
    </div>
  );
}

export default function AdminApp() {
  const [me, setMe] = useState(null); // null = loading, false = logged out
  const [tab, setTab] = useState('dashboard');
  const [newCount, setNewCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadMe = useCallback(async () => {
    try {
      setMe(await api('/api/admin/me'));
    } catch {
      setMe(false);
    }
  }, []);

  const refreshCount = useCallback(async () => {
    try {
      const s = await api('/api/admin/stats');
      setNewCount(s.newEnquiries);
    } catch {}
  }, []);

  useEffect(() => {
    loadMe();
    const fromHash = window.location.hash.slice(1);
    if (TABS.some((t) => t.id === fromHash)) setTab(fromHash);
  }, [loadMe]);

  useEffect(() => {
    if (me) refreshCount();
  }, [me, tab, refreshCount]);

  // Any 401 from the API drops back to the login screen
  useEffect(() => {
    const onUnauthed = () => setMe(false);
    window.addEventListener('adm:unauthorized', onUnauthed);
    return () => window.removeEventListener('adm:unauthorized', onUnauthed);
  }, []);

  function go(id) {
    setTab(id);
    setMenuOpen(false);
    window.history.replaceState(null, '', '#' + id);
  }

  async function logout() {
    await api('/api/admin/logout', { method: 'POST' }).catch(() => {});
    setMe(false);
    toast('Signed out');
  }

  if (me === null) return <div className="adm-loading"><span className="adm-spinner" /></div>;
  if (me === false) return (<><Login onDone={loadMe} /><ToastHost /></>);

  const Panel = { dashboard: Dashboard, enquiries: Enquiries, projects: Projects, services: Services, settings: Settings }[tab];

  return (
    <div className={'adm' + (menuOpen ? ' menu-open' : '')}>
      <aside className="adm-side">
        <div className="adm-brand">
          <span className="adm-logo-mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/icon.png" alt="" />
          </span>
          <div>
            <strong>LazyDev</strong>
            <small>Admin panel</small>
          </div>
        </div>
        <nav className="adm-nav">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => go(t.id)}>
              <Icon name={t.icon} size={19} />
              <span>{t.label}</span>
              {t.id === 'enquiries' && newCount > 0 && <em className="adm-badge">{newCount}</em>}
            </button>
          ))}
        </nav>
        <div className="adm-side-foot">
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-link">
            <Icon name="eye" size={18} /> View website
          </a>
          <button className="adm-link" onClick={logout}>
            <Icon name="logout" size={18} /> Sign out
          </button>
        </div>
      </aside>
      <div className="adm-scrim" onClick={() => setMenuOpen(false)} />

      <div className="adm-main">
        <header className="adm-top">
          <button className="adm-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Icon name="menu" size={22} />
          </button>
          <h1>{TABS.find((t) => t.id === tab).label}</h1>
          <span className="adm-user">
            <span className="adm-avatar">{me.username.slice(0, 1).toUpperCase()}</span>
            {me.username}
          </span>
        </header>
        <div className="adm-content">
          {me.isDefaultPassword && tab !== 'settings' && (
            <div className="adm-alert">
              <Icon name="shield" size={20} />
              <span>You are using the default password. Please change it before going live.</span>
              <button className="adm-btn sm" onClick={() => go('settings')}>Change now</button>
            </div>
          )}
          <Panel go={go} onChange={refreshCount} onAccountChange={loadMe} />
        </div>
      </div>
      <ToastHost />
    </div>
  );
}

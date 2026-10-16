'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon from './Icon';

const WEBSITE_TYPES = ['One-page website', 'Business website (multi-page)', 'Online store', 'Custom web app', 'Not sure yet'];
const TIMELINES = ['ASAP', 'Within a month', '1 to 3 months', 'Just exploring'];

export default function EnquiryForm({ services }) {
  const [state, setState] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setError('');
    if (!data.name.trim() || !data.message.trim()) return setError('Please share your name and a short message.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return setError('Please enter a valid email address.');

    setState('sending');
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong');
      setState('done');
    } catch (err) {
      setError(err.message);
      setState('idle');
    }
  }

  if (state === 'done') {
    return (
      <div className="form-card form-success">
        <div className="success-icon">
          <Icon name="heart" size={34} />
        </div>
        <h3>Thank you, lovely!</h3>
        <p>Your enquiry is in. We&apos;ll get back to you within one business day.</p>
        <button className="btn btn-ghost" onClick={() => setState('idle')}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={onSubmit} noValidate>
      <div className="row2">
        <label>
          Your name*
          <input name="name" maxLength={120} placeholder="Ananya Sharma" required />
        </label>
        <label>
          Email*
          <input name="email" type="email" maxLength={160} placeholder="you@brand.com" required />
        </label>
      </div>
      <div className="row2">
        <label>
          Phone / WhatsApp
          <input name="phone" maxLength={40} placeholder="+91 98765 43210" />
        </label>
        <label>
          Brand / Company
          <input name="company" maxLength={160} placeholder="Your brand name" />
        </label>
      </div>
      <label>
        What do you need?
        <select name="service" defaultValue="">
          <option value="">Choose a service</option>
          {services.map((s) => (
            <option key={s.id} value={s.title}>
              {s.title}
              {s.status === 'coming-soon' ? ' (coming soon)' : ''}
            </option>
          ))}
          <option value="Something else">Something else</option>
        </select>
      </label>
      <div className="row2">
        <label>
          Website type
          {/* Stored in the `budget` field so older enquiries keep working */}
          <select name="budget" defaultValue="">
            <option value="">Select a type</option>
            {WEBSITE_TYPES.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
        <label>
          Timeline
          <select name="timeline" defaultValue="">
            <option value="">When do you need it?</option>
            {TIMELINES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Tell us about your project*
        <textarea name="message" rows={4} maxLength={5000} placeholder="A few lines about your brand and what you'd love to build…" required />
      </label>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="btn btn-primary btn-block" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Send enquiry'} <Icon name="arrow" size={18} />
      </button>
      <p className="form-legal">
        Your details are only used to reply to your enquiry. See the <Link href="/privacy-policy">privacy policy</Link>.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

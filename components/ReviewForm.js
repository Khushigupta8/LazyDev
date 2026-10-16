'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon from './Icon';

const LABELS = ['', 'Poor', 'Okay', 'Good', 'Great', 'Loved it'];

export default function ReviewForm({ services }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);

  async function onSubmit(e) {
    e.preventDefault();
    const data = { ...Object.fromEntries(new FormData(e.currentTarget)), rating };
    setError('');
    if (!data.name.trim() || data.message.trim().length < 10) return setError('Please add your name and a few words about your experience.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return setError('Please enter a valid email address.');

    setState('sending');
    try {
      const res = await fetch('/api/reviews', {
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

  if (!open) {
    return (
      <div className="review-cta">
        <p>Worked with me? I&apos;d love to hear how it went.</p>
        <button className="btn btn-light" onClick={() => setOpen(true)}>
          Leave a review <Icon name="star" size={16} />
        </button>
      </div>
    );
  }

  if (state === 'done') {
    return (
      <div className="form-card form-success">
        <div className="success-icon">
          <Icon name="heart" size={34} />
        </div>
        <h3>Thank you so much!</h3>
        <p>Your review is in. It will appear here once it has been checked.</p>
      </div>
    );
  }

  return (
    <form className="form-card review-form" onSubmit={onSubmit} noValidate>
      <fieldset className="star-pick">
        <legend>Your rating*</legend>
        <div>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              className={n <= rating ? 'on' : ''}
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              aria-pressed={n === rating}
            >
              ★
            </button>
          ))}
          <span>{LABELS[rating]}</span>
        </div>
      </fieldset>
      <div className="row2">
        <label>
          Your name*
          <input name="name" maxLength={80} placeholder="Ananya Sharma" required />
        </label>
        <label>
          Email* (never shown)
          <input name="email" type="email" maxLength={160} placeholder="you@brand.com" required />
        </label>
      </div>
      <div className="row2">
        <label>
          Role / Company
          <input name="role" maxLength={120} placeholder="Founder, Bloom Studio" />
        </label>
        <label>
          What did you get?
          <select name="service" defaultValue="">
            <option value="">Choose a service</option>
            {services.map((s) => (
              <option key={s.id} value={s.title}>{s.title}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Your review*
        <textarea name="message" rows={4} maxLength={1500} placeholder="How was working together? What did you love about the result?" required />
      </label>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="btn btn-primary btn-block" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Submit review'} <Icon name="arrow" size={18} />
      </button>
      <p className="form-legal">
        Your name, role and review may be shown on this website. See the <Link href="/privacy-policy">privacy policy</Link>.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

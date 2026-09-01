'use client';
import { useState } from 'react';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSent(true);
      // dev only: the API returns the link so you can click through without email
      setDevLink(data.devLink ?? null);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div>
        <p style={{ color: 'var(--muted)' }}>
          If <b style={{ color: 'var(--text)' }}>{email}</b> has access, a sign-in link is on its way.
        </p>
        {devLink && (
          <p className="muted" style={{ marginTop: 12 }}>
            dev shortcut:&nbsp;<a href={devLink} style={{ color: 'var(--accent-strong)' }}>open the magic link →</a>
          </p>
        )}
      </div>
    );
  }

  return (
    <form className="rowform" onSubmit={submit}>
      <input
        className="input"
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email"
      />
      <button className="btn btn-gold" type="submit" disabled={busy}>
        {busy ? 'Sending…' : 'Email me a link'}
      </button>
    </form>
  );
}

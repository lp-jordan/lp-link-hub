import { redirect } from 'next/navigation';
import { sessionEmail } from '@/lib/auth';
import { hubsForEmail } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function Home() {
  const email = sessionEmail();
  if (!email) redirect('/signin');

  const hubs = hubsForEmail(email);
  if (hubs.length === 0) {
    return (
      <div className="shell">
        <div className="empty">This sign-in has no video library yet. Ask your LeaderPass contact.</div>
      </div>
    );
  }
  // one hub → straight in; many → switcher
  if (hubs.length === 1) redirect(`/h/${hubs[0].id}`);

  return (
    <div className="shell">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="sec-eyebrow">Signed in as {email}</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '6px 0 4px', color: 'var(--text-strong)' }}>Choose a hub</h1>
      </div>
      {hubs.map((h) => (
        <a key={h.id} href={`/h/${h.id}`} className="hcard">
          <span className="hi" aria-hidden>
            <svg viewBox="0 0 24 24" strokeWidth={1.7}>
              <rect x="3" y="4" width="8" height="7" rx="1.5" /><rect x="13" y="4" width="8" height="7" rx="1.5" />
              <rect x="3" y="14" width="8" height="6" rx="1.5" /><rect x="13" y="14" width="8" height="6" rx="1.5" />
            </svg>
          </span>
          <span>
            <span className="hh" style={{ display: 'block' }}>{h.name}</span>
            <span className="hm">{h.owner_label}</span>
          </span>
          <span className="arrow" aria-hidden>
            <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
          </span>
        </a>
      ))}
    </div>
  );
}

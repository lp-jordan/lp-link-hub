'use client';
import { useMemo, useState } from 'react';
import type { LibraryVideo } from '@/lib/types';

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export function Library({
  hubName,
  subtitle,
  videos,
  showBack,
}: {
  hubName: string;
  subtitle: string;
  videos: LibraryVideo[];
  showBack: boolean;
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'az' | 'dur'>('az');

  const shown = useMemo(() => {
    const q = query.toLowerCase();
    const list = videos.filter((v) => v.title.toLowerCase().includes(q));
    list.sort((a, b) => (sort === 'dur' ? b.duration_s - a.duration_s : a.title.localeCompare(b.title)));
    return list;
  }, [videos, query, sort]);

  return (
    <>
      <div className="lib-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {showBack && (
            <a className="back" href="/" aria-label="Switch hub">
              <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" /></svg>
            </a>
          )}
          <div style={{ minWidth: 0 }}>
            <div className="t">{hubName}</div>
            <div className="s">{subtitle}</div>
          </div>
        </div>
        <div className="controls">
          <div className="search">
            <svg viewBox="0 0 24 24" strokeWidth={2}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" aria-label="Search videos" />
          </div>
          <select className="sortsel" value={sort} onChange={(e) => setSort(e.target.value as 'az' | 'dur')} aria-label="Sort">
            <option value="az">A–Z</option>
            <option value="dur">Duration</option>
          </select>
          <a href="/api/auth/signout" className="signout">Sign out</a>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="empty">{videos.length === 0 ? 'No Videos Live' : `No videos match “${query}”.`}</div>
      ) : (
        <div className="vlist">
          {shown.map((v) => (
            <div className="vitem" key={v.token}>
              <a className="vt" href={`/v/${v.token}`} aria-label={`Play ${v.title}`}>
                {v.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="vt-thumb" src={v.thumbnail_url} alt="" loading="lazy" />
                )}
                <span className="dur">{fmt(v.duration_s)}</span>
              </a>
              <div className="vmeta">
                <h3><a href={`/v/${v.token}`}>{v.title}</a></h3>
                <span className="d">{fmt(v.duration_s)}</span>
              </div>
              <ShareButton token={v.token} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ShareButton({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    const url = `${window.location.origin}/v/${token}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard may be blocked; still show feedback */
    }
    setDone(true);
    setTimeout(() => setDone(false), 1700);
  }
  return (
    <button className={`share-btn${done ? ' done' : ''}`} onClick={copy}>
      {done ? (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
          Copied
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="2.6" /><circle cx="6" cy="12" r="2.6" /><circle cx="18" cy="19" r="2.6" /><path d="M8.3 10.8l7.4-4.3M8.3 13.2l7.4 4.3" /></svg>
          Share
        </>
      )}
    </button>
  );
}

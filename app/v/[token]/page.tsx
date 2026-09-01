import { notFound } from 'next/navigation';
import { videoByToken, recordView } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Public share landing — no auth. The forwardable /v/{token} link opens here.
 * Video plays from Cloudflare Stream (default player, no comments).
 */
export default function WatchPage({ params }: { params: { token: string } }) {
  const video = videoByToken(params.token);
  if (!video) notFound();

  recordView(params.token); // future analytics; safe no-op-ish

  // Cloudflare Stream default embed player.
  const src = `https://iframe.videodelivery.net/${video.cf_stream_uid}?primaryColor=%23dbaf5f&letterboxColor=%2305080b`;

  return (
    <div className="player">
      <div className="urlbar">
        <span style={{ color: 'var(--green)' }}>🔒</span>
        <span className="u"><b style={{ color: 'var(--muted-soft)', fontWeight: 400 }}>hub.leaderpass.com</b>/v/{params.token}</span>
      </div>
      <div className="ptitle">{video.title}</div>
      <div className="stage">
        <div className="screen">
          <iframe
            src={src}
            title={video.title}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

import { notFound } from 'next/navigation';
import { videoByToken, recordView } from '@/lib/db';
import { PlayerTitle } from '@/components/PlayerTitle';

export const dynamic = 'force-dynamic';

// Public sample clips used only for placeholder (demo-uid-*) assets so a
// walkthrough has something that actually plays. Real assets use Cloudflare.
const DEMO_SAMPLES = [
  'ForBiggerBlazes',
  'ForBiggerEscapes',
  'ForBiggerFun',
  'ForBiggerJoyrides',
  'ForBiggerMeltdowns',
].map((n) => `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/${n}.mp4`);

/**
 * Public share landing — no auth. The forwardable /v/{token} link opens here.
 * Real videos play from Cloudflare Stream (default player, no comments).
 * Placeholder (demo) assets play a public sample clip instead.
 */
export default function WatchPage({ params }: { params: { token: string } }) {
  const video = videoByToken(params.token);
  if (!video) notFound();

  recordView(params.token);

  const isDemo = video.cf_stream_uid.startsWith('demo');
  const cfSrc = `https://iframe.videodelivery.net/${video.cf_stream_uid}?primaryColor=%23dbaf5f&letterboxColor=%2305080b`;
  const demoSrc = DEMO_SAMPLES[params.token.charCodeAt(0) % DEMO_SAMPLES.length];

  return (
    <div className="player">
      <div className="stage">
        <div className="screen-wrap">
          <PlayerTitle title={video.title} />
          {isDemo && (
            <span
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                zIndex: 4,
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: 'var(--accent-strong)',
                background: 'rgba(5,8,11,0.6)',
                border: '1px solid rgba(219,175,95,0.4)',
                borderRadius: 100,
                padding: '3px 9px',
              }}
            >
              Demo
            </span>
          )}
          <div className="screen">
            {isDemo ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={demoSrc}
                controls
                autoPlay
                muted
                loop
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <iframe
                src={cfSrc}
                title={video.title}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { redirect, notFound } from 'next/navigation';
import { sessionEmail } from '@/lib/auth';
import { getHub, emailCanAccess, hubVideos, hubsForEmail } from '@/lib/db';
import { Library } from '@/components/Library';

export const dynamic = 'force-dynamic';

export default function HubPage({ params }: { params: { hubId: string } }) {
  const email = sessionEmail();
  if (!email) redirect('/signin');

  const hub = getHub(params.hubId);
  if (!hub) notFound();
  // access is per-hub: being logged in is not enough
  if (!emailCanAccess(params.hubId, email)) redirect('/');

  const videos = hubVideos(params.hubId);
  const multiHub = hubsForEmail(email).length > 1;

  return (
    <div className="shell">
      <Library
        hubName={hub.name}
        subtitle={`${videos.length} video${videos.length === 1 ? '' : 's'} · signed in as ${email}`}
        videos={videos}
        showBack={multiHub}
      />
    </div>
  );
}

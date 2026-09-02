'use client';
import { useEffect, useState } from 'react';

/**
 * The video title, overlaid on the player. Visible on load and whenever the
 * viewer moves the pointer, then fades out after a few idle seconds so it isn't
 * sitting on top of the video the whole time. (Pointer-idle rather than a real
 * "play" event, because the Cloudflare player is a cross-origin iframe we can't
 * inspect — this works the same for the demo clip and real videos.)
 */
export function PlayerTitle({ title }: { title: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const show = () => {
      setVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), 3500);
    };
    show();
    window.addEventListener('mousemove', show);
    window.addEventListener('touchstart', show, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', show);
      window.removeEventListener('touchstart', show);
    };
  }, []);

  return <div className={`ptitle${visible ? '' : ' hidden'}`}>{title}</div>;
}

import type { IngestHubPayload } from './types';

/**
 * Dev-only sample data — the same three scenarios as the prototype:
 *  - orlando@blackbird.co can access 2 hubs (→ switcher)
 *  - asset a1 lives in 3 hubs with a different title + token in each
 *  - a LeaderPass showcase mixes videos from 3 different clients
 * cf_stream_uid values are placeholders; swap for real Stream UIDs.
 * (Pure data — db.ts consumes this via seedIfEmpty so there's no import cycle.)
 */
const A = {
  a1: { lpos_name: 'Brand Film (2026)', cf_stream_uid: 'demo-uid-a1', duration_s: 168 },
  a2: { lpos_name: 'CEO Welcome', cf_stream_uid: 'demo-uid-a2', duration_s: 96 },
  a3: { lpos_name: 'Culture Reel', cf_stream_uid: 'demo-uid-a3', duration_s: 185 },
  a4: { lpos_name: 'Founder Story', cf_stream_uid: 'demo-uid-a4', duration_s: 132 },
  a6: { lpos_name: 'Summit Keynote', cf_stream_uid: 'demo-uid-a6', duration_s: 281 },
};

export const SAMPLE_HUBS: IngestHubPayload[] = [
  {
    hub: { id: 'h1', name: 'Steve — Highlights', owner_label: 'Steve Molyneux', owner_type: 'person' },
    access_emails: ['orlando@blackbird.co'],
    items: [
      { asset_id: 'a1', client_title: 'Vanguard Brand Film', share_token: 'qy7k2m9x', asset: A.a1 },
      { asset_id: 'a4', client_title: 'Harbor Founder Story', share_token: 'h4n8ra2c', asset: A.a4 },
    ],
  },
  {
    hub: { id: 'h2', name: 'Vanguard Wealth', owner_label: 'Vanguard Wealth', owner_type: 'client' },
    access_emails: ['orlando@blackbird.co', 'priya@vanguardwealth.com'],
    items: [
      { asset_id: 'a1', client_title: '2026 Brand Film', share_token: 'w6ptx3ke', asset: A.a1 },
      { asset_id: 'a2', client_title: 'CEO Welcome', share_token: 'm2djf9qs', asset: A.a2 },
      { asset_id: 'a3', client_title: 'Life at Vanguard', share_token: 'b7l4hn6y', asset: A.a3 },
    ],
  },
  {
    hub: { id: 'h3', name: 'LeaderPass — Client Showcase', owner_label: 'LeaderPass', owner_type: 'leaderpass' },
    access_emails: ['team@leaderpass.com'],
    items: [
      { asset_id: 'a1', client_title: 'Vanguard — Brand Film', share_token: 'zc5v8ktr', asset: A.a1 },
      { asset_id: 'a4', client_title: 'Harbor & Vine — Founder', share_token: 'k3n7wq2p', asset: A.a4 },
      { asset_id: 'a6', client_title: 'Northwind — Summit Keynote', share_token: 'x9m4rt6d', asset: A.a6 },
    ],
  },
  {
    hub: { id: 'h4', name: 'Northwind Capital', owner_label: 'Northwind Capital', owner_type: 'client' },
    access_emails: ['dev@northwind.com'],
    items: [{ asset_id: 'a6', client_title: 'Q3 Summit Keynote', share_token: 'p2v8hn5c', asset: A.a6 }],
  },
];

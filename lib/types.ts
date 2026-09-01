export type OwnerType = 'client' | 'person' | 'leaderpass';

export interface Asset {
  id: string;
  lpos_name: string;
  cf_stream_uid: string;
  duration_s: number;
}

export interface Hub {
  id: string;
  name: string;
  owner_label: string;
  owner_type: OwnerType;
  updated_at: string;
}

export interface HubItem {
  hub_id: string;
  asset_id: string;
  client_title: string;
  share_token: string;
  sort_order: number;
}

/** A hub_item joined to its asset — the shape the library + player render. */
export interface LibraryVideo {
  token: string;
  title: string;
  duration_s: number;
  cf_stream_uid: string;
}

/** Payload LPOS pushes to POST /api/ingest on save. Full replace per hub. */
export interface IngestHubPayload {
  hub: {
    id: string;
    name: string;
    owner_label: string;
    owner_type: OwnerType;
  };
  access_emails: string[];
  items: Array<{
    asset_id: string;
    client_title: string;
    share_token: string;
    // asset fields so the client DB can mirror what it needs to play the video
    asset: {
      lpos_name: string;
      cf_stream_uid: string;
      duration_s: number;
    };
  }>;
}

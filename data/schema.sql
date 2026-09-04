-- LP Link Hub — client-app DB (owns a projection of LPOS hub data).
-- LPOS is the source of truth and pushes rows here via POST /api/ingest on save.
-- This app never writes hub structure itself; it only reads (plus optional view_events).

PRAGMA journal_mode = WAL;

-- Finished videos, mirrored from LPOS assets. Only fields this app needs to play them.
CREATE TABLE IF NOT EXISTS assets (
  id             TEXT PRIMARY KEY,          -- LPOS assetId
  lpos_name      TEXT NOT NULL,             -- internal name (reference only; clients see hub_items.client_title)
  cf_stream_uid  TEXT NOT NULL,             -- Cloudflare Stream UID (what actually plays)
  duration_s     INTEGER NOT NULL DEFAULT 0,
  thumbnail_url  TEXT,                      -- Cloudflare frame thumbnail (per-video); null falls back to a gradient
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Standalone containers. NOT derived from a client.
CREATE TABLE IF NOT EXISTS hubs (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  owner_label  TEXT NOT NULL,               -- cosmetic: a client, a person, or "LeaderPass"
  owner_type   TEXT NOT NULL CHECK (owner_type IN ('client','person','leaderpass')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Who can log in. Independent of owner and of contents.
CREATE TABLE IF NOT EXISTS hub_access_emails (
  hub_id  TEXT NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
  email   TEXT NOT NULL,                     -- store lowercased
  PRIMARY KEY (hub_id, email)
);
CREATE INDEX IF NOT EXISTS idx_access_email ON hub_access_emails(email);

-- Membership: an asset placed in a hub. client_title + share_token live HERE
-- (the same asset in two hubs can have a different title and a different link).
CREATE TABLE IF NOT EXISTS hub_items (
  hub_id        TEXT NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
  asset_id      TEXT NOT NULL REFERENCES assets(id),
  client_title  TEXT NOT NULL,
  share_token   TEXT NOT NULL UNIQUE,        -- public link: /v/{share_token}
  sort_order    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (hub_id, asset_id)
);
CREATE INDEX IF NOT EXISTS idx_items_token ON hub_items(share_token);

-- Optional, future: per-link view analytics (no schema change needed to turn on).
CREATE TABLE IF NOT EXISTS view_events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  share_token  TEXT NOT NULL,
  viewed_at    TEXT NOT NULL DEFAULT (datetime('now')),
  referrer     TEXT
);

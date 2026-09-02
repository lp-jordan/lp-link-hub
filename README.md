# LP Link Hub

Client-facing **finished-video delivery** app. A client signs in with a magic link, browses their hub(s), and copies a share link to any single video. The share link (`/v/{token}`) is public and forwardable, and plays straight from Cloudflare Stream (no comments).

This is the thin front-end (deploys to Railway at `hub.leaderpass.com`). **LPOS is the source of truth** for hubs — it pushes hub data here via `POST /api/ingest`. This app owns only a read projection (its own SQLite DB) plus optional view analytics.

Design/spec: `../docs/link-hub-spec.md` · Prototype: https://claude.ai/code/artifact/f6898623-8c97-41b4-8cc1-873ab24a352d

## What a hub is

A standalone container — **not** derived from a client. Three independent things:
- **who can log in** — `hub_access_emails` (e.g. Steve's hub, Orlando's email)
- **what's inside** — `hub_items` (videos from any project / any client)
- **owner label** — cosmetic (`client` / `person` / `leaderpass`)

`client_title` + `share_token` live on the membership (`hub_items`), so the same asset can appear in two hubs with a different title and a different link. An email on several hubs gets a **hub switcher** after login.

## Run it

```bash
cp .env.example .env.local   # then edit the secrets
npm install                  # builds better-sqlite3 (native)
npm run dev                  # http://localhost:4310
```

On first run the DB is created and **dev-seeded** (skipped when `NODE_ENV=production`). Try these sign-in emails:
- `orlando@blackbird.co` — access to **2 hubs** → hub switcher
- `team@leaderpass.com` — the cross-client LeaderPass showcase
- `priya@vanguardwealth.com` — a single hub

The magic-link email isn't wired yet — in dev the sign-in link is printed to the server console **and** returned to the sign-in form as a "dev shortcut" link. To reset data, delete `data/*.sqlite`.

## Layout

```
app/
  page.tsx                 # post-login: 0 → empty, 1 → redirect to hub, many → switcher
  signin/                  # magic-link request form
  h/[hubId]/page.tsx       # a hub's library (access-checked)
  v/[token]/page.tsx       # PUBLIC share landing → Cloudflare Stream player
  api/auth/request         # POST {email} → mint + "email" magic link
  api/auth/callback        # GET ?token → start session
  api/ingest               # POST (x-lpos-token) → LPOS pushes hub projection
lib/
  db.ts                    # SQLite access + upsertHubFromLpos()
  auth.ts                  # HMAC magic-link + session cookie (no deps)
  types.ts, seed.ts
data/schema.sql            # assets / hubs / hub_access_emails / hub_items / view_events
```

## Env

| var | purpose |
|---|---|
| `LINK_HUB_DB` | path to the SQLite file (Railway: a mounted volume) |
| `LINK_HUB_SECRET` | HMAC secret for magic-link tokens + session cookies |
| `LPOS_INGEST_TOKEN` | shared secret LPOS sends on `POST /api/ingest` (`x-lpos-token`) |
| `NEXT_PUBLIC_APP_ORIGIN` | public origin, for building magic-link URLs |
| `LINK_HUB_DEMO` | set to `1` for a walkthrough instance — see Demo mode below |
| `RESEND_API_KEY` | Resend API key — required to actually email magic links (without it, dev prints the link) |
| `LINK_HUB_MAIL_FROM` | From address, e.g. `LeaderPass <no-reply@leaderpass.com>` (defaults to Resend's onboarding sender) |

## Demo mode

Set `LINK_HUB_DEMO=1` to turn any instance (including production) into a self-contained walkthrough — no email sender or real Cloudflare video required:

- The sample hubs are seeded on boot (idempotent).
- The sign-in page shows **one-click demo logins** (Orlando → 2 hubs / LeaderPass showcase / Priya) that bypass the magic-link email via `GET /api/auth/demo?email=…` (hard-gated behind the flag — 404 otherwise).
- Placeholder (`demo-uid-*`) videos play a public sample clip instead of Cloudflare, and the player shows a **DEMO** badge.

Unset the flag (or leave it unset) and none of this activates — the real magic-link + Cloudflare paths are untouched.

## Not built yet (see spec §open questions)

- Real magic-link email sender
- The LPOS side that calls `/api/ingest` on hub save
- Cloudflare `allowedOrigins` backfill for the Railway host (→ later, signed URLs)
- Real Cloudflare Stream UIDs (seed uses `demo-uid-*` placeholders)

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**RAdAR** (`radarpin.me`) — a Spanish-language social music PWA. Users connect Spotify or Last.fm to broadcast what they're listening to, see what others nearby are playing, and chat anonymously. No build system, no bundler, no npm. Pure HTML/CSS/JS deployed to Cloudflare Pages as static files.

## Deployment

```bash
# No build step — deploy as-is.
# Preview locally with any static file server:
npx serve .
# or
python3 -m http.server 8080
```

Deploy by pushing to `main` — Cloudflare Pages auto-deploys from GitHub.

## File Map

| File | Purpose |
|------|---------|
| `index.html` | Marketing/landing page — CRT grain aesthetic, dark |
| `app.html` | The PWA itself — all app logic lives here |
| `admin.html` | Password-protected admin dashboard, `noindex` |
| `sw.js` | Service worker — cache name `radar-v52` |
| `manifest.json` | PWA manifest (`start_url: ./app.html`) |
| `netlify.toml` | Cache headers (HTML: no-cache, assets: immutable, SW: no-cache) |

`preview.html`, `gen-icons.html`, `gen-og.html`, `index-v2.html` are dev/utility pages — not part of the live product.

## Architecture: `app.html`

Everything is self-contained in one file: styles inline in `<style>`, logic in `<script>`.

**Backend**: `const SERVER = 'https://radar-mvp.onrender.com'` (separate repo). The frontend calls:
- `GET /health` — warm-up ping on load
- `GET /nearby?userId=&lat=&lng=&...` — feed of nearby listeners
- `GET /notifications?userId=` and `GET /my-chats?userId=`
- `POST /lastfm/session` and `GET /lastfm/now-playing?username=`
- `GET /lastfm/login?redirect=` — OAuth redirect
- `POST /spotify/refresh` — renews the Spotify access token (`{ userId, spotifyKey }`)
- Spotify API called directly from the client (`https://api.spotify.com/v1/me/player`)

**State**: A single global `S` object holds all runtime state (`S.userId`, `S.spotifyToken`, `S.lastfmUsername`, `S.mySong`, `S.feed`, `S.notifications`, `S.chats`, etc.). Auth is persisted to `localStorage` under the key `radar_auth` via `saveAuth()` / `loadAuth()`.

**Screens**: `listen` → `feed` → `inbox` → `chat`. Switched by `setScreen(name)`. `render()` dispatches to per-screen renderers.

**Updates**: `startPolling(uid, token, lfUser)` runs `refreshAll()` every 15s via `setInterval`. Chat messages have their own `startChatPolling` interval.

**Responsive layout**:
- Mobile (<768px): single column, bottom bar with "now playing" pill
- Tablet (768–1023px): wider single column
- Desktop (≥1024px): CSS grid with `grid-template-areas: "topbar topbar" / "feed side"` — `renderDesktop()` builds a different DOM structure

## Design Tokens

CSS custom properties are defined per-file (not shared). Core values used everywhere:

```css
--accent: #e8ff47;     /* yellow-green — primary CTA color */
--ink:    #0c0c0c;     /* near-black background */
--text:   #f5f0e8;     /* warm white body text */
```

Fonts: **Poppins** (UI, weight 400/700/900) + **IBM Plex Mono** (landing page only).

## Service Worker

Cache name is `radar-v52`. Two-page architecture:
- `/app.html` or `/app` → serves cached `./app` (canonical URL — Cloudflare Pages redirects `/app.html` → `/app`)
- All other paths (landing page, etc.) → NOT intercepted by SW, browser fetches from network directly
- `./app` is pre-cached (not `./app.html`) to avoid caching a redirect response (`redirected: true` causes WebKit/Safari to throw "Response served by service worker has redirections")

Auth callback URLs (`?access_token=`, `?lastfm_token=`, etc.) land in the address bar; `handleCallback()` reads them from `window.location.search`. Bump the cache version in `sw.js` after deploying changes that must bust the cache.

## Auth Flow

1. **Spotify**: OAuth redirect via backend → `?access_token=` + `?spotify_key=` params on return → stored in `S.spotifyToken` / `S.spotifyKey`
2. **Last.fm**: OAuth redirect via `SERVER/lastfm/login` → `?lastfm_token=` param on return → exchanged for session via `POST /lastfm/session`
3. **Spotify token TTL**: 3500s (`SPOTIFY_TOKEN_TTL`). When it expires the token is renewed silently via `POST /spotify/refresh` (backend holds the `refresh_token` in Firestore `spotify_tokens/{userId}`; `S.spotifyKey` authorizes the call). The user is only asked to reconnect if that fails — Spotify expires refresh tokens after 6 months.
   Use `hasSpotify()` — not `S.spotifyToken` — to check for a live Spotify session, since the token is briefly null while renewing.
4. No email/password — userId is either the Spotify user ID or the Last.fm username.
5. OAuth redirect URI sent to backend is always `window.location.origin + '/app'` (canonical, avoids Cloudflare redirect loop).
6. **Spotify quota**: the API quota is counted per *developer account*. On `429` both frontend and backend back off until `Retry-After` (`S.spotifyQuotaUntil` / `spotifyQuota.blockedUntil`) instead of retrying. `/update-location` returns `spotify: { status: 'ok' | 'nothing' | 'reauth' | 'quota' }`.
7. **Quota saving**: if the frontend already resolved a song it sends it in the request body and the backend skips its own `/me/player` call — only one Spotify request per user per cycle.

## Key Constraints

- **No build tooling** — don't introduce npm, webpack, or any bundler. Keep it a single HTML file per page.
- **Spanish UI copy** — all user-facing text is in Spanish (Chile locale, `es_CL`). Keep it that way.
- **SW cache version** — if you add or rename a cached asset, bump the version in `sw.js` to force cache invalidation.
- **Hard-coded design tokens** — tokens are duplicated across `index.html` and `app.html`. When changing colors/fonts, update both files.
- **Backend is separate** — this repo is frontend-only. The Render.com backend is not here.
- **Cloudflare Pages pretty URLs** — `/app.html` redirects to `/app`. Always use `/app` as the canonical URL in SW and OAuth redirects.

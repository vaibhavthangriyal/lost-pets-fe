# Pawprint web app

Next.js web client for the lost-pets backend. Visitors can browse posts; signed-in users can publish posts, comment, change their posts' status, and save alert preferences.

## Run locally

Requires Node.js 20.9 or newer.

1. Set up and start MongoDB and the NestJS API as described in `../lost-pets-backend/README.md` (default `http://localhost:3000`).
2. Run `npm install`, then `npm run dev` in this directory.
3. Open `http://localhost:3001`.

Next.js proxies `/api/*` to the backend. To use another backend origin, copy `.env.example` to `.env.local`, set `BACKEND_ORIGIN`, and restart Next.js. The backend origin must be reachable from the Next.js server. If deploying behind a proxy, use HTTPS and configure the origin appropriately.

The backend currently prints email OTP codes to its console in development; it does not deliver them by email or SMS. The web app accepts public photo URLs, as direct photo uploads are not yet implemented. Alert settings are stored, but neither push notifications nor automatic location tracking are implemented. Nearby browsing uses a one-time browser location lookup and also works without signing in. Public posts expose their submitted coordinates and public comments.
# lost-pets-fe

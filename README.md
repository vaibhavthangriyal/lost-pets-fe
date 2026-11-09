# Pawprint web app

Next.js web client for the lost-pets backend. Visitors can browse posts; signed-in users can publish posts, comment, change their posts' status, and save alert preferences.

## Implemented major features

- **Public community feed:** browse and filter lost-pet, sighting, and found-stray posts, load more results, and view post details without an account.
- **Map and nearby search:** display loaded lost-pet and sighting posts on an OpenStreetMap map; optionally use the browser's current location and a selected radius.
- **OTP sign-in:** sign in through the backend's email OTP flow to create posts and comments. The current backend only outputs development codes to its console.
- **Posts and comments:** create the three post types, view and add public comments, let the post owner reply to comments, and let the owner resolve or reopen a post.
- **My pets:** privately add, view, edit, and remove saved pet profiles.
- **My files:** select a file, upload it through a signed GCS URL, confirm it, retry confirmation, and request a signed download link.
- **Alert preferences:** save or remove an alert location, radius, and post types; no notifications are sent yet.

## Current limitations

Production OTP delivery, push notifications, and automatic background location updates are not implemented. Pet and post forms still use external photo URLs; files in **My files** cannot yet be attached to them. Saved pets are private, while post locations and comments are public.

Signed-in users can use **My files** to upload directly to the private GCS bucket, confirm uploads, retry confirmation, and obtain signed download links. The backend GCS configuration and bucket CORS must be set first. This private library does not yet attach files to pet profiles or public posts.

The interactive map shows lost-pet and sighting posts from the currently loaded list, including resolved posts (shown faded). Filters and the nearby radius also apply to the map; use “Load more posts” to add more markers. Map tiles are provided by OpenStreetMap, which receives tile requests from visitors' browsers.

## Run locally

Requires Node.js 20.9 or newer.

1. Set up and start MongoDB and the NestJS API as described in `../backend/README.md` (default `http://localhost:3000`).
2. Run `npm install`, then `npm run dev` in this directory.
3. Open `http://localhost:3001`.

Next.js proxies `/api/*` to the backend. To use another backend origin, copy `.env.example` to `.env.local`, set `BACKEND_ORIGIN`, and restart Next.js. The backend origin must be reachable from the Next.js server. If deploying behind a proxy, use HTTPS and configure the origin appropriately.

The backend currently prints email OTP codes to its console in development; it does not deliver them by email or SMS. Post and pet forms accept public photo URLs rather than attachments from the private upload library. Nearby browsing uses a one-time browser location lookup and also works without signing in.
# lost-pets-fe

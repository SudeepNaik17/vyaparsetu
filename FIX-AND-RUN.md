# Registration/API fix

The UI sends registration to `/api/auth/register`. Next.js forwards it to the backend on port 4000. When that backend cannot start, Next.js returns a plain-text error, which caused the misleading "Backend returned an invalid response" message.

Fixed:
- Restored `backend/scripts/local.js` so `dev:local` starts a persistent local MongoDB replica set and then the API. Previously it only imported server.js and relied on the configured hosted database.
- Added graceful shutdown and kept local database files across restarts.
- Improved frontend messages for unavailable or misconfigured APIs.
- Normalized a trailing slash in BACKEND_URL.

## Start on Windows

Extract the ZIP into a new folder. In a terminal in that folder:

```powershell
cd backend
npm ci
npm run dev:local
```

Wait for `Backend ready on http://127.0.0.1:4000`. The first run downloads MongoDB and can take a few minutes. Keep this terminal running.

In a second terminal in the extracted folder:

```powershell
cd frontend
npm ci
npm run dev
```

Open http://127.0.0.1:3100/register.

Local registration needs no hosted MongoDB credentials or Groq key. Local mode saves records under `backend/.local-data-mongo/` and uses a separate database from any hosted account. Keep that folder to retain your local records.

## Use your existing hosted database

Copy your existing backend/.env into the new backend folder, or fill in .env.example and save as .env. Run `npm start` in backend instead of `npm run dev:local`. Wait for the backend-ready message; resolve any database/credentials error printed in that terminal first. Existing hosted accounts remain in that hosted database.

If your backend runs elsewhere, copy frontend/.env.example to frontend/.env.local and set BACKEND_URL to its origin, such as http://127.0.0.1:4000 (without /api). Restart the frontend after changes. Check http://127.0.0.1:4000/health to confirm that the backend is ready.

The ZIP excludes credentials, generated Next.js output, dependencies, and test databases. Keep your existing .env privately; add its Groq key to the backend if you want AI features.

## Verified

- Frontend: 7 tests passed; production build passed.
- Backend: 12 tests passed.
- Registration through the Next.js proxy: HTTP 201.
- Login through the proxy: HTTP 200, including after restarting the local database.


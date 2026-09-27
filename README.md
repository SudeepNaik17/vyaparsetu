# VyaparSetu — connected frontend and backend

This version connects the supplied Next.js UI to the Express/MongoDB backend and replaces the demo AI parser with Groq-backed transcription and intent interpretation.

## Start locally

Use Node.js 20.19+ (Node 22 or 24 recommended).

First install both applications:

```sh
cd backend
npm ci
cd ../frontend
npm ci
```

Create `backend/.env` from `backend/.env.example`. Configure:

- `GROQ_API_KEY`: your Groq key, on the backend only.
- `JWT_SECRET`: a random secret of at least 32 characters.
- `MONGO_URI`: your MongoDB replica-set URI for normal operation. MongoDB Atlas supports the transactions used by this app.

No real credentials are included in this download. The original ZIP's `.env` is deliberately excluded.

For a local development database, run this in one terminal:

```sh
cd backend
npm run dev:local
```

This launches a real MongoDB replica set on port **27028**, and the API on **4000**. The MongoDB binary is downloaded on first use. Local development records live in `backend/.local-data-mongo/`. This unauthenticated database is for local development only; do not expose it to the internet. Stop it with Ctrl+C.

For your own configured replica set instead:

```sh
cd backend
npm start
```

In another terminal:

```sh
cd frontend
npm run dev
```

Open **http://127.0.0.1:3100/register**. Create an account, add products and customers, and start recording sales. The new application uses port 3100 so it can run alongside the old frontend preview on port 3000.

The frontend proxies `/api/*` to `http://127.0.0.1:4000`. Override this with the server-only `BACKEND_URL` setting in `frontend/.env.local` when needed. Do not put Groq credentials in a `NEXT_PUBLIC_*` variable.

## Connected features

- Registration and login using the UI's mobile number and 4-digit PIN; PIN hashes are stored with bcrypt. Existing email/password accounts can still use the API's login contract.
- Products, inventory additions, customers, cash/UPI/credit sales, and udhaar payments use real API endpoints and MongoDB records.
- Sales atomically deduct stock, save the bill, and update customer and credit balances. Concurrent requests cannot oversell.
- Dashboard totals, recent activity, stock notifications, reports, top products, payment summaries, and CSV exports are derived from saved records.
- Profile, language, theme, notification preferences, and PIN changes are saved on the backend. PIN changes invalidate earlier tokens.
- Support requests and optional image/audio attachments are saved to the backend and shown in the support history.
- Errors are surfaced in the UI. Failed requests are not reported as successful saves.

There is no browser storage. The bearer token is held only in memory, so refreshing requires logging in again. Your database records and account settings remain saved.

## AI flow

1. Record up to 60 seconds of audio, or type a request in English, Hindi, or Kannada.
2. Audio is transcribed through Groq. The backend sends the requested text and relevant shop context to the configured model.
3. The model proposes one action, answers a read-only question, or asks for clarification. It does not execute business writes.
4. The server validates the proposal against the authenticated shop and stores a 15-minute review draft.
5. The user reviews the details and selects **Confirm & save**.
6. A transaction rechecks stock and ownership, executes the operation, and consumes the draft. Repeated confirmation returns the same result without saving again.

Supported actions: add a product, add stock to an existing product, record a sale, add a customer, and create udhaar. Read-only answers can use current inventory, customer balances, and today's sales/profit. Missing or ambiguous details should produce a clarification; an unknown product is not silently replaced by sample data.

To edit a proposal, select **Edit request**, change the text, and create a fresh review. The frontend never edits a confirmed draft or invents confidence percentages.

Groq API key/model errors, rate limits, network failures, microphone denial, and unsupported audio formats return visible errors. Typed input remains available when microphone capture fails. Provider integration follows [Groq's API reference](https://console.groq.com/docs/api-reference) and [speech-to-text documentation](https://console.groq.com/docs/speech-to-text).

## Validation

```sh
cd backend
npm test
cd ../frontend
npm test
npm run build
```

Backend integration tests use an isolated real MongoDB replica set. They cover authentication, ownership isolation, mass-assignment protection, invalid-sale rollback, credit payments, concurrent stock sales, all AI write types, duplicate and expired AI confirmations, settings, attachments, reports, and PIN revocation. They do not call or validate the live Groq model.

Frontend tests cover record mapping, the authenticated API client, server-issued draft detection, validators, and absence of browser persistence.

## Deployment and remaining configuration

- The supplied archive had a placeholder `MONGO_URI`; replace it before running against your hosted database.
- Live AI requires a valid Groq key, an available model, and outbound HTTPS access to Groq.
- The frontend now needs a Next.js runtime for API proxying; it is no longer a standalone static export. Use `npm run build` then `npm start` in `frontend/`.
- Run the backend with a reachable MongoDB replica set and a stable JWT secret. Set allowed CORS origins and use HTTPS in production.
- An automated forgotten-PIN/OTP service, actual call/WhatsApp support contact, scheduled notifications, and message delivery are not included in the supplied backend. The app does not pretend to send messages. Udhaar actions now record payments rather than displaying a fake Send action.
- Notification preferences are stored, and stock alerts are displayed in-app; external notification delivery requires a provider.
- The AI context currently includes at most 500 products and 500 customers. A larger shop should add server-side retrieval instead of expanding the prompt indefinitely.
- Local rate limiting is process-local. A multi-instance deployment should use a shared limiter and a verified phone/OTP authentication policy.

Both application folders retain the original component/feature structure. `frontend/src/services/` is the API boundary; business validation and writes live in `backend/src/services/`.

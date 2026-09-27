# VyaparSetu

**VyaparSetu** is an AI-assisted small-shop management platform built with **Next.js, Express.js, MongoDB, and Groq**.

It connects a real business-management dashboard with backend APIs for inventory, sales, customers, Udhaar, reports, settings, and AI-assisted business actions.

> **Live App:** https://vyaparsetu-pied.vercel.app/home

---

## 🚀 Features

### 🏪 Shop Management

- Product and inventory management
- Add stock to existing products
- Customer management
- Cash, UPI, and credit sales
- Udhaar / customer credit tracking
- Udhaar payment recording
- Dashboard statistics
- Recent activity
- Low-stock notifications
- Reports and CSV exports
- Top-product and payment summaries

### 🔐 Authentication & Security

- Mobile number + 4-digit PIN registration/login
- Existing email/password API login support
- PIN hashing with `bcrypt`
- JWT authentication
- Shop/account ownership isolation
- Mass-assignment protection
- PIN changes invalidate previous tokens
- Server-side validation before business writes
- No browser localStorage/sessionStorage for authentication

---

# 🤖 AI Assistant

VyaparSetu includes a Groq-powered AI workflow.

Users can:

- Type requests in English, Hindi, or Kannada
- Record up to 60 seconds of voice input
- Transcribe audio using Groq speech-to-text
- Ask questions about current shop data
- Request supported business operations
- Review AI-generated actions before they are saved

## Supported AI Actions

- Add a product
- Add stock to an existing product
- Record a sale
- Add a customer
- Create Udhaar

## Read-only AI Queries

The AI can access current shop information for:

- Inventory
- Customer balances
- Today's sales
- Today's profit

---

# 🛡️ AI Safety Flow

AI-generated business operations are **not executed immediately**.

```text
User Request
     ↓
Text / Voice
     ↓
Groq AI
     ↓
Action Proposal
     ↓
Server Validation
     ↓
15-Minute Review Draft
     ↓
User Reviews
     ↓
Confirm & Save
     ↓
Transaction Rechecks Stock / Ownership
     ↓
MongoDB Write
```

This prevents the AI from silently changing business data.

Repeated confirmation of the same draft is handled safely without saving the operation twice.

---

# 🧠 Current AI Architecture

The current implementation uses **Groq as the AI provider**.

It is implemented as a controlled AI-assistance workflow rather than allowing the model to directly execute arbitrary database operations.

The backend:

1. Receives the user's text or transcription.
2. Builds relevant shop context.
3. Sends the request to the configured Groq model.
4. Interprets the model's proposed operation or answer.
5. Validates the proposal against the authenticated shop.
6. Creates a temporary review draft for write operations.
7. Requires explicit user confirmation.
8. Rechecks business constraints inside a database transaction.
9. Executes the approved operation.
10. Consumes the draft to prevent duplicate execution.

> The current application is not presented as a fully autonomous multi-agent system. Multi-agent planning, agent-to-agent delegation, autonomous tool selection, and iterative agent verification are future extensions.

---

# 🏗️ Tech Stack

## Frontend

* Next.js
* React
* JavaScript / TypeScript
* Server-side API proxy
* `frontend/src/services/` as the API boundary

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Transaction-based business operations

## AI

* Groq API
* Groq Speech-to-Text
* Configurable Groq Chat Model

## Development

* Node.js 20.19+
* Node.js 22 or 24 recommended
* npm

---

# 📁 Project Structure

```text
vyaparsetu-home-ai/
│
├── backend/
│   ├── .cache/
│   ├── .local-data-mongo/
│   ├── node_modules/
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── model/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── tests/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── server.js
│
├── frontend/
│   ├── .next-dev/
│   ├── node_modules/
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── context/
│   │   ├── data/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── tests/
│   ├── .env.example
│   ├── .gitignore
│   ├── jsconfig.json
│   ├── next.config.mjs
│   ├── package.json
│   ├── package-lock.json
│   ├── FIX-AND-RUN.md
│   └── README.md
│
└── README.md
```

---

# ⚙️ Local Setup

## Requirements

Install:

* Node.js 20.19+
* npm

Node.js 22 or 24 is recommended.

---

## 1. Install Dependencies

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd ../frontend
npm run dev
```

---

# 🔑 Environment Variables

Create:

```text
backend/.env
```

from:

```text
backend/.env.example
```

Configure:

```env
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_random_secret_at_least_32_characters
MONGO_URI=your_mongodb_replica_set_uri
PORT=4000
GROQ_MODEL=openai/gpt-oss-120b
GROQ_TRANSCRIBE_MODEL=whisper-large-v3-turbo
CORS_ORIGIN=frontend url
```

### Important

Never expose:

```text
GROQ_API_KEY
MONGO_URI
JWT_SECRET
```

through a `NEXT_PUBLIC_*` frontend variable.

---

# 🗄️ Local MongoDB Development

For local development:

```bash
cd backend
npm run dev
```

This starts:

```text
MongoDB Replica Set → Port 27028
API                  → Port 4000
```

Local records are stored under:

```text
backend/.local-data-mongo/
```

The MongoDB binary is downloaded on first use.

> The local unauthenticated MongoDB instance is intended only for local development. Do not expose it to the internet.

Stop the development process with:

```text
Ctrl + C
```

---

# 🌐 Using Your Own MongoDB

Configure:

```env
MONGO_URI=your_mongodb_replica_set_uri
```

inside:

```text
backend/.env
```

Then run:

```bash
cd backend
npm start
```

The backend runs on:

```text
http://127.0.0.1:4000
```

---

# 💻 Start the Frontend

In another terminal:

```bash
cd frontend
npm run dev
```

Open:

```text
http://127.0.0.1:3100/register
```

Create an account and start using the application.

The frontend proxies:

```text
/api/*
```

to:

```text
http://127.0.0.1:4000
```

If required, configure the server-only frontend setting in:

```text
frontend/.env.local
```

```env
BACKEND_URL=http://127.0.0.1:4000
```

Do not put Groq credentials in frontend `NEXT_PUBLIC_*` variables.

---

# 🔄 Application Architecture

```text
                 Next.js Frontend
                        │
                        │ /api/*
                        ▼
                 Express Backend
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
 Authentication      Business          AI Layer
                     Services
        │               │                │
        └───────────────┼────────────────┘
                        ▼
                    MongoDB
```

---

# 🤖 AI Request Architecture

```text
User
 │
 ├── Text
 │
 └── Voice
       │
       ▼
Groq Speech-to-Text
       │
       ▼
AI Interpretation
       │
       ├── Read-only Answer
       │
       └── Business Action
                │
                ▼
         Server Validation
                │
                ▼
          Review Draft
                │
                ▼
          User Confirmation
                │
                ▼
        MongoDB Transaction
```

---

# 🎙️ Voice AI

The user can record up to 60 seconds of audio.

```text
Voice Input
     ↓
Groq Speech-to-Text
     ↓
Transcribed Request
     ↓
AI Interpretation
     ↓
Answer / Action Proposal
```

Typed input remains available when microphone capture fails.

Supported language input includes:

* English
* Hindi
* Kannada

---

# 📊 Dashboard & Reports

Dashboard information is derived from saved backend records.

Available information includes:

* Sales totals
* Profit
* Recent activity
* Inventory status
* Stock notifications
* Top products
* Payment summaries
* Reports
* CSV exports

The application does not use fake success responses for failed business operations.

---

# 💳 Sales & Inventory Consistency

Sales are handled through database transactions.

```text
Sale
 ↓
Stock Validation
 ↓
Stock Deduction
 ↓
Bill Creation
 ↓
Customer Update
 ↓
Credit Balance Update
```

If the operation fails, the transaction is rolled back.

Concurrent sales are protected against overselling.

---

# 👤 Profile & Settings

The backend persists:

* Profile information
* Language preference
* Theme
* Notification preferences
* PIN changes

Changing the PIN invalidates previous authentication tokens.

---

# 🆘 Support

Support requests can include optional:

* Images
* Audio attachments

Submitted support requests are stored by the backend and displayed in support history.

The supplied implementation does **not** pretend to send WhatsApp/SMS/call notifications.

---

# 🧪 Testing

## Backend

```bash
cd backend
npm test
```

Backend integration tests cover:

* Authentication
* Ownership isolation
* Mass-assignment protection
* Invalid-sale rollback
* Credit payments
* Concurrent stock sales
* AI write operations
* Duplicate AI confirmations
* Expired AI confirmations
* Settings
* Attachments
* Reports
* PIN revocation

Backend tests do not call or validate the live Groq model.

## Frontend

```bash
cd frontend
npm test
```

## Production Build

```bash
cd frontend
npm run build
```

---

# 🚀 Production Deployment

The frontend requires a Next.js runtime because it uses API proxying.

Build the frontend:

```bash
cd frontend
npm run build
```

Start it:

```bash
npm start
```

The backend should run with:

* A reachable MongoDB replica set
* A stable JWT secret
* A valid Groq API key
* Appropriate CORS configuration
* HTTPS in production

---

# ⚠️ Current Limitations

The supplied implementation does not currently include:

* Automated forgotten-PIN/OTP service
* Actual WhatsApp support messaging
* Automated phone-call support
* Scheduled external notifications
* External message delivery
* Fully autonomous multi-agent orchestration

Notification preferences are stored and stock alerts are displayed inside the application, but external notification delivery requires a provider.

The AI context currently includes at most approximately:

```text
500 Products
500 Customers
```

For a larger shop, server-side retrieval should be introduced instead of continuously expanding the prompt.

Local rate limiting is process-local. A multi-instance production deployment should use shared rate limiting and a verified phone/OTP authentication policy.

---

# 🔮 Future Agentic AI Roadmap

The next version of VyaparSetu can extend the current AI assistant into a multi-agent business operating system.

```text
                         USER
                           │
                           ▼
                  ┌─────────────────┐
                  │ SUPERVISOR      │
                  │ AGENT           │
                  └────────┬────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
       SALES AGENT    INVENTORY AGENT  FINANCE AGENT
            │              │              │
            └──────────────┼──────────────┘
                           ▼
                    ANALYST AGENT
                           │
                           ▼
                     CRITIC AGENT
                           │
                           ▼
                    DECISION AGENT
                           │
                           ▼
                     ACTION AGENT
                           │
                           ▼
                        TOOLS
                           │
                           ▼
                       MongoDB
                           │
                           ▼
                    VERIFICATION
                           │
                           └──────► RE-PLAN
```

The future system could:

* Understand high-level business goals
* Break goals into smaller tasks
* Delegate tasks to specialist agents
* Exchange structured results between agents
* Investigate missing information
* Critique proposed decisions
* Select and use controlled tools
* Request approval for sensitive actions
* Execute approved actions
* Verify the resulting state
* Re-plan when results differ from expectations

This would extend VyaparSetu from an AI-assisted shop-management application into a **multi-agent autonomous business operations platform**.

---

# 🔐 Security Notes

Never commit these files or secrets to Git:

```text
.env
.env.local
GROQ_API_KEY
MONGO_URI
JWT_SECRET
```

Use secure environment variables or secret storage in production.

Do not expose the local MongoDB development instance to the internet.

---

# 📜 License

Add the project's chosen license before public distribution.

---

# 👨‍💻 Project

**VyaparSetu**

AI-powered business management for small shops.

> Manage smarter. Sell better. Grow faster.

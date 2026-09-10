# Client Request Desk

A multi-tenant app where local business teams manage customer requests, qualify them, and convert approved requests into work items.

Built for the Junior Full Stack Developer assignment.

---

## Setup

This project is not deployed. To run it locally:

```bash
# 1. Clone the repo
git clone https://github.com/omdeep132-a11y/Client-Request-Desk.git
cd Client-Request-Desk

# 2. Backend setup
cd Back-end
npm install
cp .env.example .env
# Edit .env and add your own MongoDB URI and JWT secret
npm run seed
npm run dev
# -> Server on http://localhost:3000

# 3. Frontend setup (in a second terminal)
cd ../Front-end
npm install
npm run dev
# -> App on http://localhost:5173
```

Open `http://localhost:5173`. Log in as any of these users:

| Email | Workspace |
| --- | --- |
| alice@acme.test | Acme Plumbing |
| bob@bright.test | Bright Electrical |
| carol@coastal.test | Coastal HVAC |
| dave@summit.test | Summit Roofing |
| erin@metro.test | Metro Cleaning |

No password. This is intentional (see "Authentication" below).

---

## Tech stack

### Backend (`Back-end/`)

**Runtime dependencies:**

| Package | Version | Purpose |
| --- | --- | --- |
| express | ^5.2.1 | HTTP server and routing |
| mongoose | ^9.9.5 | MongoDB ODM |
| dotenv | ^17.4.2 | Load `.env` into `process.env` |
| jsonwebtoken | ^9.0.3 | Sign and verify JWTs |
| cors | ^2.8.5 | Allow the frontend to call the API |

**Dev dependencies:**

| Package | Version | Purpose |
| --- | --- | --- |
| nodemon | ^3.1.14 | Auto-restart server on file changes |
| jest | ^29.7.0 | Test runner |
| supertest | ^7.0.0 | HTTP assertions for Express |
| mongodb-memory-server | ^10.0.0 | In-memory MongoDB for tests |

**Installation:**

```bash
cd Back-end

# Runtime deps
npm install express mongoose dotenv jsonwebtoken cors

# Dev deps
npm install --save-dev nodemon jest supertest mongodb-memory-server
```

### Frontend (`Front-end/`)

**Runtime dependencies:**

| Package | Version | Purpose |
| --- | --- | --- |
| react | ^18.x | UI library |
| react-dom | ^18.x | React DOM renderer |
| react-router-dom | ^6.x | Client-side routing |
| axios | ^1.x | HTTP client |

**Dev dependencies:**

| Package | Version | Purpose |
| --- | --- | --- |
| vite | ^5.x | Build tool and dev server |
| @vitejs/plugin-react | ^4.x | React support for Vite |
| tailwindcss | ^4.x | Utility-first CSS |
| @tailwindcss/vite | ^4.x | Tailwind Vite plugin |
| vitest | ^2.x | Test runner |
| jsdom | ^25.x | Browser environment for tests |
| @testing-library/react | ^16.x | Render React components in tests |
| @testing-library/jest-dom | ^6.x | Custom matchers (e.g. `toBeInTheDocument`) |
| @testing-library/user-event | ^14.x | Simulate user interactions |
| eslint | ^9.x | Code linting |

**Installation:**

```bash
cd Front-end

# Runtime deps
npm install axios react-router-dom

# Dev deps (Tailwind)
npm install -D tailwindcss @tailwindcss/vite

# Dev deps (tests)
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Note:** React, React DOM, and Vite are already installed by the Vite project template. You only add the packages above after running `npm create vite@latest Front-end -- --template react`.

---

## Architecture

Monorepo with two independent projects:

```
Client-Request-Desk/
├── Back-end/                    Node + Express + MongoDB
│   ├── src/
│   │   ├── server.js            entry: dotenv -> connectDB -> listen
│   │   ├── app.js               express wiring: cors, json, routes
│   │   ├── DB/db.js             mongoose connection
│   │   ├── Models/              Workspace, User, Request, WorkItem, Activity
│   │   ├── middleware/auth.js   JWT verification
│   │   ├── controllers/         business logic
│   │   ├── routes/              URL -> controller mapping
│   │   └── scripts/seed.js      seed command
│   └── tests/                   Jest + Supertest tests
│
└── Front-end/                   React + Vite + Tailwind
    └── src/
        ├── api/client.js        axios + auth interceptor
        ├── context/             AuthContext (login state)
        ├── utils/               date formatting, status colors
        ├── atoms/               Button, Input, Badge, Spinner
        ├── molecules/           StatusBadge, ConfirmDialog, states
        ├── organisms/           Navbar, RequestTable, RequestForm, ActivityTimeline
        └── pages/               Login, List, Detail, Create, Edit
```

**Backend request flow:**

```
Request -> routes/*.js -> middleware/auth.js -> controllers/*.js -> Models -> MongoDB
```

**Frontend structure:** atomic design (`atoms` -> `molecules` -> `organisms` -> `pages`).

---

## Key decisions

### 1. MongoDB + Mongoose instead of PostgreSQL/SQLite

The spec allows equivalent stacks "when explained."

**Why Mongo:** flexible schema during rapid iteration, native support for the `unique: true` constraint I rely on for duplicate prevention, and MongoDB Atlas gives a free hosted instance without Docker.

**Trade-off:** no migrations, no cross-document transactions in this project. For a single-tenant-per-request model this is fine.

### 2. Mock authentication (no passwords)

The spec says: "Provide a simple login **or** a documented mock authentication mechanism."

`POST /api/auth/login` accepts an email and returns a JWT. The frontend lists the 5 seeded users in a dropdown. No password, no signup, no email verification.

### 3. JWT in localStorage

The simplest client-side storage that survives page reloads. Axios interceptor attaches it to every request automatically.

**Trade-off:** vulnerable to XSS. `httpOnly` cookies would be safer.

### 4. Return 404, not 403, for cross-workspace access

Every workspace-scoped query filters by `workspaceId: req.user.workspaceId`. If a user requests another workspace's record, the query returns `null` and the controller responds `404 Not Found`.

**Why 404 and not 403:** a 403 would tell the attacker "this record exists, just not for you." A 404 leaks nothing. This is the correct production pattern for tenant isolation.

**Tested:** `Back-end/tests/isolation.test.js`.

### 5. Duplicate conversion prevention via unique index

`WorkItem.requestId` has `unique: true`. If a conversion is attempted twice, MongoDB rejects the second insert with error code `11000`. The controller catches this and returns **409 Conflict**.

**Why not "check then insert":** that has a race condition. Two simultaneous requests both check, both pass, both insert. The unique index is enforced atomically by MongoDB.

**Tested:** `Back-end/tests/duplicateConversion.test.js`.

### 6. `workspaceId` comes from the JWT, never from the request body

On `POST /api/requests`, the controller sets `workspaceId: req.user.workspaceId`. If a malicious client sends `{ workspaceId: "someone-else" }` in the body, it's ignored — the field isn't in the whitelist.

---

## Assumptions and trade-offs

**Assumptions:**

- **One user per workspace.** The spec says "one user per workspace," so I didn't build a user management UI. Users are created by the seed script.
- **Customers are free text.** A `Request` has a `customerName` string, not a reference to a `Customer` model.
- **Three statuses only** — `NEW`, `QUALIFIED`, `CLOSED`. Enforced by the schema's `enum`.
- **No delete endpoint.** The spec asked for list, create, view, update.

**Trade-offs:**

- **No real password hashing.** Mock auth for speed.
- **No rate limiting.** A production system would add it on `/api/auth/login`.
- **No pagination.** Lists return all requests in a workspace.
- **No `Customer` entity.** Free-text names.
- **No CSRF protection.** JWT in `Authorization` header, not cookies.

---

## What I would improve with more time

**Security:**

1. **Real authentication** — bcrypt-hashed passwords, email verification, password reset flow.
2. **`httpOnly` cookies** instead of localStorage for the token, to prevent XSS token theft.
3. **Rate limiting** on `POST /api/auth/login`.
4. **Input sanitization** — strip HTML from `notes` and `customerName`.
5. **CORS allowlist** — currently `cors()` allows all origins.

**Reliability:**

1. **Transactions** for the convert flow — currently `WorkItem.create` and `Activity.create` are separate writes.
2. **Retry logic** on transient DB errors.
3. **Health check endpoint** for monitoring.

**Features:**

1. **`Customer` model** with unique email.
2. **Pagination** on list endpoints.
3. **Search** by customer name.
4. **User management** — invites, multiple users per workspace.
5. **Real-time updates** via WebSockets.

**Engineering:**

1. **TypeScript** — the spec preferred it. I chose JavaScript for speed.
2. **More tests** — integration tests covering the whole flow.
3. **Docker Compose** — one command to start everything.
4. **CI/CD** — GitHub Actions running `npm test` on every push.

---

## AI tools used and how I reviewed their output

I used Claude (via chat) as a code reviewer and pairing partner during development.

**What I used it for:**

- Debugging specific errors (e.g. `MissingSchemaError: Schema hasn't been registered for model Workspace` — because `Models/Workspace.js` was never required before `.populate()` was called).
- Explaining concepts (how JWT verification works, why 404 beats 403 for tenant isolation, why a unique index beats a check-then-insert pattern).
- Reviewing small snippets for correctness before committing.

**What I reviewed carefully:**

- Every API path — verified each frontend `api.get/post/patch` call against the actual route in `Back-end/src/routes/`.
- Every response field — the frontend reads `request.customerName`, so the backend must return exactly that field name. I tested each endpoint in Postman and compared shapes.
- Error handling — the 404 vs 403 decision, the 409 for duplicate conversion, the 401 for invalid tokens. Each was tested manually in Postman.
- Workspace isolation — I wrote `tests/isolation.test.js` myself to prove the query pattern works.
- Timezone handling — dates were shifting by a day because Mongoose interpreted plain `"2026-10-15"` strings in local time. Fixed by converting to midnight UTC on the frontend and formatting with `timeZone: "UTC"` when displaying.

**What I did not do:** I did not let any AI tool commit code without me reading it. Every file in this repo was reviewed before commit.

---

## Commands

### Backend (`Back-end/`)

```bash
npm install              # install all dependencies
cp .env.example .env     # create .env (then edit it)
npm run seed             # populate the database with sample data
npm run dev              # start the dev server (port 3000, hot reload)
npm start                # start the production server
npm test                 # run tests (Jest + Supertest, 9 tests)
```

### Frontend (`Front-end/`)

```bash
npm install              # install all dependencies
npm run dev              # start Vite dev server (port 5173)
npm run build            # production build -> dist/
npm run preview          # preview the production build
npm test                 # run tests (Vitest, 5 tests)
```

### Environment variables

**`Back-end/.env`** (not committed):

```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=your_long_random_secret
PORT=3000
```

**`Back-end/.env.example`** (committed, placeholders only):

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=replace_with_a_long_random_string
PORT=3000
```

The frontend has no `.env` — the API URL is hardcoded to `http://localhost:3000/api` in `src/api/client.js`.

---

## API reference

Base URL: `http://localhost:3000/api`

All endpoints except `POST /auth/login` require `Authorization: Bearer <token>`.

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| POST | `/auth/login` | `{ email }` | `{ token, user }` |
| GET | `/auth/me` | — | `{ id, email, name, workspace }` |
| GET | `/requests` | — (optional `?status=`) | `[request, ...]` |
| POST | `/requests` | `{ customerName, service, scheduledDate, notes? }` | `request` (201) |
| GET | `/requests/:id` | — | `request` |
| PATCH | `/requests/:id` | `{ customerName?, service?, scheduledDate?, notes?, status? }` | `request` |
| POST | `/requests/:id/convert` | — | `workItem` (201) |
| GET | `/requests/:id/activity` | — | `[activity, ...]` |

**Status codes:**

- `200` — OK
- `201` — Created
- `400` — Validation error (invalid input, invalid status, non-QUALIFIED conversion)
- `401` — Missing or invalid token
- `404` — Not found, or cross-workspace access (intentional)
- `409` — Duplicate conversion (request already converted)
- `500` — Server error

---

## Test coverage

**Backend (9 tests, all passing):**

```
tests/isolation.test.js
  - returns 404 when Bob reads Alice's request
  - returns 404 when Bob updates Alice's request
  - returns 404 when Bob converts Alice's request
  - returns 404 when Bob reads Alice's activity
  - Bob's own list doesn't include Alice's requests

tests/duplicateConversion.test.js
  - first conversion returns 201
  - second conversion on the same request returns 409
  - only one work item exists after two conversion attempts
  - converting a NEW request returns 400
```

**Frontend (5 tests, all passing):**

```
src/molecules/ConfirmDialog.test.jsx
  - shows customer, service and date when open
  - does not render when closed
  - calls onConfirm when Confirm is clicked
  - calls onCancel when Cancel is clicked
  - disables buttons and shows 'Creating...' when loading
```

Run with `npm test` in each folder.

**Testing setup files:**

- `Back-end/jest.config.js` — Jest config with `testEnvironment: "node"` and setup file.
- `Back-end/tests/setup.js` — spins up `mongodb-memory-server`, sets `JWT_SECRET`, wipes collections between tests.
- `Front-end/src/test/setup.js` — imports `@testing-library/jest-dom` for extra matchers.
- `Front-end/vite.config.js` — has a `test` block for Vitest with `environment: "jsdom"`.

---

## How the assignment requirements are met

| Requirement | Where |
| --- | --- |
| Seed 2 workspaces + 1 user each + sample requests | `Back-end/src/scripts/seed.js` (creates 5 workspaces, 5 users, 25 requests) |
| Simple login / documented mock auth | `Back-end/src/controllers/authController.js` + `Front-end/src/pages/LoginPage.jsx` |
| List, create, view, update APIs | `Back-end/src/routes/requests.js` |
| Statuses NEW, QUALIFIED, CLOSED | `Back-end/src/Models/Request.js` (enum) |
| Convert qualified request to work item | `Back-end/src/controllers/requestController.js` — `convert` |
| Workspace isolation | Every controller query filters by `workspaceId: req.user.workspaceId`; returns 404 |
| Input validation + useful errors | Controllers return specific 400/401/404/409 with `{ error }` bodies |
| Human-confirmed conversion (customer, service, date) | `Front-end/src/molecules/ConfirmDialog.jsx` |
| Reject non-QUALIFIED conversion | Controller checks status -> 400 |
| Prevent duplicate conversion | `WorkItem.requestId` unique index -> E11000 -> 409 |
| Activity entry on conversion | `Activity.create` in convert controller |
| Frontend: list + status filtering | `RequestListPage.jsx` + `StatusFilter.jsx` |
| Frontend: details + activity timeline | `RequestDetailPage.jsx` + `ActivityTimeline.jsx` |
| Frontend: create + edit form | `RequestForm.jsx` reused by `RequestCreatePage.jsx` and `RequestEditPage.jsx` |
| Frontend: confirmed conversion flow | `ConfirmDialog.jsx` + `handleConvert` |
| Frontend: loading, empty, validation, API error states | `LoadingState.jsx`, `EmptyState.jsx`, `ErrorState.jsx`, inline errors in `RequestForm` |
| DB schema + seed command | 5 Mongoose models + `npm run seed` |
| Backend tests: isolation + duplicate | `tests/isolation.test.js`, `tests/duplicateConversion.test.js` |
| Frontend test: important interaction | `src/molecules/ConfirmDialog.test.jsx` |
| `.env.example` + no committed secrets | `Back-end/.env.example`; `.env` in `.gitignore` |
| Install/dev/test/build commands | This README |

---

## Repo structure at a glance

```
Client-Request-Desk/
├── README.md                    <- you are here
├── .gitignore
│
├── Back-end/
│   ├── .env                     <- NOT committed
│   ├── .env.example             <- committed
│   ├── .gitignore
│   ├── package.json
│   ├── jest.config.js
│   ├── src/
│   │   ├── server.js
│   │   ├── app.js
│   │   ├── DB/db.js
│   │   ├── Models/              (5 files)
│   │   ├── middleware/auth.js
│   │   ├── controllers/         (2 files)
│   │   ├── routes/              (2 files)
│   │   └── scripts/seed.js
│   └── tests/
│       ├── setup.js
│       ├── isolation.test.js
│       └── duplicateConversion.test.js
│
└── Front-end/
    ├── .gitignore
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/client.js
        ├── context/AuthContext.jsx
        ├── utils/               (2 files)
        ├── test/setup.js
        ├── atoms/               (5 files)
        ├── molecules/           (6 files + 1 test)
        ├── organisms/           (5 files)
        └── pages/               (6 files)
```

---


# Solvia Administration Centrale

Enterprise administration platform for the Solvia ecosystem.

## Quick Start

```bash
git clone <repository>
cd solvia-admin
cp backend/.env.example backend/.env
# Edit backend/.env and set JWT_SECRET to a strong random value
docker compose up
```

Then open http://localhost:3000 and sign in with:

| Role             | Email                   | Password           |
|------------------|-------------------------|--------------------|
| Super Admin      | admin@solvia.io         | Admin@Solvia2026!  |
| Security Analyst | analyst@solvia.io       | Demo@Solvia2026!   |
| Auditor          | auditor@solvia.io       | Demo@Solvia2026!   |

## Requirements

- Node.js 22+
- Docker and Docker Compose
- (Optional) PostgreSQL 17 and Redis 7 for local dev without Docker

## Local Development (without Docker)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit `backend/.env` and set at minimum:
- `JWT_SECRET` — generate with `openssl rand -base64 64`
- `DATABASE_URL` — your PostgreSQL connection string
- `DATABASE_DIRECT_URL` — same as `DATABASE_URL` for local dev
- `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` — your Redis connection

### 3. Start infrastructure

```bash
docker compose up postgres redis -d
```

### 4. Run database migrations

```bash
cd backend
npx prisma migrate deploy
```

### 5. Seed the database

```bash
npx prisma db seed
```

This creates roles, permissions, security rules, system settings, and demo accounts.

### 6. Start the platform

```bash
# Terminal 1 — backend (port 3001)
npm run dev:backend

# Terminal 2 — frontend (port 3000)
npm run dev:frontend
```

### 7. Sign in

Open http://localhost:3000 and sign in with `admin@solvia.io` / `Admin@Solvia2026!`.

## Docker (Production)

The full platform runs with a single command:

```bash
cp backend/.env.example .env
# Edit .env and set JWT_SECRET
docker compose up --build
```

Services:
- **Frontend** → http://localhost:3000
- **Backend** → http://localhost:3001
- **API Docs** → http://localhost:3001/api/docs
- **PostgreSQL** → localhost:5432
- **Redis** → localhost:6379

On first startup, the backend automatically runs `prisma migrate deploy`.

To seed demo data after startup:
```bash
docker compose exec backend npx prisma db seed
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3001` | Server port |
| `NODE_ENV` | No | `development` | Environment |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `DATABASE_DIRECT_URL` | Yes | — | Direct PostgreSQL URL (same as DATABASE_URL locally) |
| `REDIS_HOST` | No | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `REDIS_PASSWORD` | No | — | Redis password |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed CORS origin |
| `JWT_SECRET` | **Yes** | — | JWT signing secret (min 64 chars) |
| `JWT_ACCESS_TOKEN_EXPIRATION` | No | `15m` | Access token TTL |
| `JWT_REFRESH_TOKEN_EXPIRATION` | No | `30d` | Refresh token TTL |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:3001/api/v1` | Backend API base URL |

## Project Structure

```
solvia-admin/
├── frontend/              # Next.js App Router frontend
│   └── src/
│       ├── app/           # Pages (login, dashboard, security, settings)
│       ├── components/    # UI components + layout
│       ├── services/      # API services (auth, dashboard, security, settings)
│       ├── hooks/         # React Query hooks
│       ├── store/         # Zustand state (auth)
│       └── types/         # TypeScript types
├── backend/               # NestJS backend
│   ├── prisma/            # Schema and migrations
│   └── src/modules/
│       ├── auth/          # JWT, 2FA, session management
│       ├── users/         # User lifecycle management
│       ├── rbac/          # Roles and permissions
│       ├── audit/         # Audit log
│       ├── dashboard/     # Aggregated metrics
│       ├── security-ops/  # SOC: alerts, incidents, risk scoring
│       └── system-settings/
└── docs/                  # Specifications
```

## Available Roles

| Role | Permissions |
|------|-------------|
| `SUPER_ADMIN` | Full platform access |
| `SECURITY_ANALYST` | Security, alerts, incidents, audit |
| `AUDITOR` | Read-only: audit, security, users |

## Security Operations Center

The platform includes an enterprise-grade SOC with:

- **Alert Detection Engine** — runs every 5 minutes, evaluates 6 security rules against audit events
- **Risk Scoring Engine** — runs hourly, calculates per-user risk scores (0–100)
- **Alert Deduplication** — fingerprint-based dedup, increments occurrence count
- **Alert Correlation** — detects multi-alert threat patterns (credential attack, privilege escalation, administrative abuse)
- **Incident Automation** — auto-creates incidents when alert severity exceeds rule threshold

Manual triggers via API:
```
POST /api/v1/security/monitoring/detect
POST /api/v1/security/monitoring/recalculate-risks
```

## API Documentation

Swagger UI is available at http://localhost:3001/api/docs when the backend is running.

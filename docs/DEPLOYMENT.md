# SmartSpend — Production Deployment Runbook

## 1. Overview

This document specifies the end-to-end deployment procedure for SmartSpend across cloud infrastructure (Node.js API, PostgreSQL) and Android mobile release packaging (EAS Build / Local APK).

---

## 2. Infrastructure Architecture

```
                                  +------------------------------------+
                                  |         Google Play Store          |
                                  |      SmartSpend Android App        |
                                  +-----------------+------------------+
                                                    |
                                                    | TLS 1.3 (HTTPS)
                                                    v
                                  +-----------------+------------------+
                                  |     Cloudflare / NGINX Ingress     |
                                  |     Reverse Proxy + SSL Term       |
                                  +-----------------+------------------+
                                                    |
                                                    v
                                  +-----------------+------------------+
                                  |       Docker Swarm / ECS /         |
                                  |     SmartSpend Node.js API         |
                                  +-----------------+------------------+
                                                    |
                                                    | Connection Pooler
                                                    v
                                  +-----------------+------------------+
                                  |    Managed PostgreSQL 16 (AWS RDS, |
                                  |         Neon, or Supabase)         |
                                  +------------------------------------+
```

---

## 3. Backend Deployment

### 3.1 Production Environment Variables (`.env.production`)
Ensure the following variables are securely injected via secret management:

| Variable | Description | Example / Requirement |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment identifier | `production` |
| `PORT` | API listen port | `4000` |
| `DATABASE_URL` | Pooled PostgreSQL connection string | `postgresql://user:pass@ep-db.cloud.neon.tech/smartspend?sslmode=require` |
| `JWT_ACCESS_SECRET` | Secret for HMAC signing access tokens | Minimum 64-char cryptographically random hex |
| `JWT_REFRESH_SECRET`| Secret for refresh tokens | Minimum 64-char cryptographically random hex |
| `AI_PROVIDER` | Active LLM adapter | `gemini`, `openai`, or `none` |
| `GEMINI_API_KEY` | Server-side Gemini API key | Secure token (never exposed to client) |

### 3.2 Running via Docker
```bash
# Build and start services in background
docker compose -f infra/docker-compose.yml up -d --build

# Verify healthy status
docker compose -f infra/docker-compose.yml ps
```

### 3.3 Database Migration Procedure
Prior to starting new application instances, run the migration script:
```bash
# Apply pending migrations
pnpm db:migrate

# Seed system categories if initializing fresh instance
pnpm db:seed
```

---

## 4. Android Release Packaging (Mobile App)

### 4.1 EAS Build Workflow (Recommended)
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Configure project:
   ```bash
   cd apps/mobile
   eas build:configure
   ```
3. Generate signed Android App Bundle (AAB):
   ```bash
   eas build --platform android --profile production
   ```

### 4.2 Local Standalone APK Generation
```bash
cd apps/mobile
npx expo run:android --variant release
```

---

## 5. Health Monitoring & Operational Alerts

- **Liveness Probe**: `GET /api/v1/health` returns `200 OK` with `{ status: "ok", database: "connected" }`.
- **Log Aggregation**: Structured JSON logs are streamed to stdout for collection via CloudWatch or Datadog. Passwords and tokens are strictly redacted.

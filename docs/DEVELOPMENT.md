# SmartSpend — Developer Onboarding & Local Setup Guide

## 1. Prerequisites

Ensure your development workstation has:
- **Node.js**: v20.x or v22.x LTS
- **Package Manager**: `pnpm` (v9+) or `npm` (v10+)
- **PostgreSQL**: v15+ (or Docker)
- **Android Development**: Android Studio with Android SDK Platform 34 and an active Android Virtual Device (AVD).

---

## 2. Quickstart Step-by-Step

### Step 1: Install Dependencies
From the repository root:
```bash
pnpm install
```

### Step 2: Configure Environment Variables
Copy the template:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` matches your local or Docker PostgreSQL instance.

### Step 3: Start PostgreSQL
Using Docker:
```bash
docker compose -f infra/docker-compose.yml up -d postgres
```

### Step 4: Generate Prisma Client & Seed Development Data
```bash
# Generate Prisma Client
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Seed categories and demo fintech transactions
pnpm db:seed
```

### Step 5: Start the Backend API
```bash
pnpm dev:api
```
The API is active at:
- Local: `http://localhost:4000/api/v1`
- Health: `http://localhost:4000/api/v1/health`

### Step 6: Start the Mobile Application
In a separate terminal:
```bash
pnpm dev:mobile
```
- Press **`a`** to launch on connected Android emulator or device.
- Press **`w`** to open the responsive web preview in your browser.

---

## 3. Network Architecture for Multi-Device & Mobile

SmartSpend's mobile API client (`apps/mobile/src/services/api.ts`) automatically resolves:
- **Physical Phone / Cross-Device**: Checks `EXPO_PUBLIC_API_URL` first (e.g. `http://<YOUR_LAN_IP>:4000/api/v1`).
- **Android Virtual Device (AVD Emulator)**: Falls back to `http://10.0.2.2:4000/api/v1` (which maps to host machine port 4000).
- **Web Browser**: Uses `http://localhost:4000/api/v1` (or relative reverse proxy `/api`).

For detailed multi-device testing options (Expo Go, Expo Tunnel, USB ADB reverse, web browser access, and APK build), consult the main [README.md](../README.md).

---

## 4. Running Tests & Quality Verification

```bash
# Run Backend Unit & Integration Tests (Vitest)
pnpm test

# Run TypeScript Typecheck across all packages
pnpm typecheck

# Build All Packages
pnpm build
```

---

## 5. Troubleshooting

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| `Network Error` on Android emulator | Trying to connect to `localhost:4000` | Ensure `api.ts` uses `10.0.2.2:4000` for Android platforms (configured by default). |
| `Database probe failed` | PostgreSQL is not running | Run `docker compose -f infra/docker-compose.yml up -d postgres`. |
| Script execution disabled in PowerShell | Windows execution policy | Run `powershell -ExecutionPolicy Bypass` or run commands via `pnpm.cmd` / `npm.cmd`. |

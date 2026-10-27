# SmartSpend — Production-Grade AI-Powered Expense & Budget Manager

SmartSpend is an AI-powered personal expense tracking, budgeting, and financial intelligence application engineered with a modern full-stack architecture:
- **Mobile Frontend**: React Native, Expo, TypeScript (Strict), Expo Router, and Custom Neo-Fintech Design Tokens.
- **Backend API**: Node.js, Express, TypeScript (Strict), Zod validation, and OpenAPI specifications.
- **Database**: PostgreSQL with Prisma ORM, 3NF normalized schema, and integer minor units (paise) for absolute monetary precision.
- **AI Copilot**: Server-side provider-independent adapter with deterministic financial pre-aggregation and zero-hallucination guardrails.
- **Monorepo**: pnpm workspaces (`apps/mobile`, `apps/api`, `packages/shared`).

---

## 🌟 Key Features

1. **Tactile & Ergonomic Mobile UI**
   - **Home Dashboard**: Live Safe Monthly Balance (`₹16,550.00`), pacing bar (`63%` spent), Today's Spending pace vs daily target (`₹840.00` / `₹1,200.00`), and recent transaction ledger.
   - **Tactile Keypad Entry**: Full numeric keypad (`0-9`, `.`, `⌫`) with quick preset chips (`+₹50`, `+₹100`, `+₹500`, `+₹1,000`), expense/income switcher, category carousel, and payment method chips.
   - **Activity & Search**: Real-time multi-field search (merchants, notes, tags), date grouping (*Today*, *Yesterday*, date headers), filter chips, and statement CSV export.
   - **Analytics & Insights**: 2×2 metric grid, 7-day spending pace bar chart with daily target threshold line, category distribution bars, and upcoming subscription autopays.
   - **Budgets Tab**: Overall monthly spending limit controls, safe daily pace calculation, and category-level limits with alert thresholds.
   - **Profile & Settings**: Dark/Light mode switcher, preferred currency (`INR ₹`), timezone, audio/haptic clicks toggle, encrypted archive export, and account deletion.

2. **Interactive Modals & Tools**
   - **AI Financial Copilot**: Conversational chat with suggested query chips (*"Can I afford dinner tonight?"*, *"Where did most of my money go this month?"*), backed by live database numbers or deterministic rule engine.
   - **Scan UPI Simulator**: Laser scanning viewfinder animation with quick sample QR presets (*Blue Tokai*, *Uber Premier*, *Blinkit Groceries*).
   - **Notifications Center**: In-app alert history (budget threshold warnings, subscription autopay reminders) with unread counter.

3. **Deterministic Financial Integrity**
   - Authoritative daily allowance calculation:
     $$\text{Daily Allowance} = \frac{\max(0, \text{Budget Limit} - \text{MTD Expenses})}{\max(1, \text{Days Remaining})}$$
   - Exact integer minor units: All amounts stored and computed in **paise** (`1 INR = 100 paise`), preventing floating-point rounding drift.

---

## 📁 Repository Structure

```
smartspend/
├── apps/
│   ├── mobile/               # React Native + Expo Android Mobile App
│   │   ├── app/              # Expo Router File-Based Navigation
│   │   │   ├── (auth)/       # Login, Register, Forgot Password
│   │   │   ├── (tabs)/       # Home, Activity, Insights, Budgets, Profile
│   │   │   ├── modal/        # Add Transaction, AI Assistant, Scan UPI, Notifications
│   │   │   ├── onboarding/   # Introduction Carousel
│   │   │   └── _layout.tsx   # Root navigation stack & providers
│   │   ├── src/
│   │   │   ├── components/   # UI Design System (CurrencyText, TransactionRow, Keypad, etc.)
│   │   │   ├── theme/        # Design Tokens (#172033, #F7F8F5, #B8F36B)
│   │   │   ├── services/     # API Client with Android 10.0.2.2 auto-resolution
│   │   │   └── hooks/        # React Query hooks (useDashboard, useTransactions)
│   │   ├── assets/           # App icons, splash, and adaptive icons
│   │   └── package.json
│   │
│   └── api/                  # Node.js + Express + Prisma REST API
│       ├── src/              # Layered controllers, services, repositories
│       ├── prisma/           # PostgreSQL schema & seed script
│       ├── tests/            # Vitest unit & integration test suites
│       └── package.json
│
├── packages/
│   └── shared/               # Shared TypeScript types, Zod schemas, constants, and money utils
│
├── docs/                     # Technical documentation suite
│   ├── PRD.md                # Product Requirements Document
│   ├── ARCHITECTURE.md       # Full-Stack System Architecture
│   ├── DATABASE.md           # PostgreSQL Data Dictionary & ERD
│   ├── API.md                # REST API Specification (/api/v1)
│   ├── SECURITY.md           # Security & Cryptography Guidelines
│   ├── TESTING.md            # Testing Strategy & Verification Matrix
│   ├── DEPLOYMENT.md         # Production Deployment Runbook
│   └── DEVELOPMENT.md        # Developer Setup Guide
│
├── infra/
│   ├── docker/               # Production API Dockerfile
│   └── docker-compose.yml    # PostgreSQL + Express API composition
│
├── scripts/                  # Development automation scripts
├── .env.example              # Documented environment variable template
├── pnpm-workspace.yaml       # Monorepo configuration
├── tsconfig.base.json        # Shared TypeScript strict configuration
└── package.json              # Workspace scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20+ or v22+
- **pnpm**: v9+ (or `npm`)
- **Docker** (optional, for running local PostgreSQL)

### 2. Environment Configuration
Copy the template to create your `.env`:
```bash
cp .env.example .env
```

### 3. Run PostgreSQL & Backend via Docker (Recommended)
```bash
docker compose -f infra/docker-compose.yml up -d
```
The API is live at `http://localhost:4000/api/v1`.

### 4. Run Services Locally
```bash
# 1. Install all monorepo dependencies
pnpm install

# 2. Seed development database
pnpm db:seed

# 3. Start Backend API Server
pnpm dev:api

# 4. In a second terminal, start Expo Mobile Application
pnpm dev:mobile
```

- In the Expo terminal, press **`a`** to open on your Android Emulator.
- Press **`w`** to open the web responsive preview in your browser.

> [!NOTE]
> Inside an Android Emulator, `localhost` maps to the virtual device itself. SmartSpend automatically resolves `http://10.0.2.2:4000/api/v1` for Android and `http://localhost:4000/api/v1` for Web.

---

## 🧪 Testing & Verification

```bash
# Run Backend Vitest Test Suite (Unit & Integration tests)
pnpm test

# Run TypeScript strict type-check across all workspaces
pnpm typecheck

# Build all packages
pnpm build
```

---

## 📚 Documentation Quicklinks

- [Product Requirements Document (PRD)](file:///c:/Users/vuppa/Documents/projects/Smart-Spend/docs/PRD.md)
- [System Architecture](file:///c:/Users/vuppa/Documents/projects/Smart-Spend/docs/ARCHITECTURE.md)
- [Database Schema & ERD](file:///c:/Users/vuppa/Documents/projects/Smart-Spend/docs/DATABASE.md)
- [REST API Specification](file:///c:/Users/vuppa/Documents/projects/Smart-Spend/docs/API.md)
- [Security & Authorization](file:///c:/Users/vuppa/Documents/projects/Smart-Spend/docs/SECURITY.md)
- [Testing Matrix](file:///c:/Users/vuppa/Documents/projects/Smart-Spend/docs/TESTING.md)
- [Deployment Runbook](file:///c:/Users/vuppa/Documents/projects/Smart-Spend/docs/DEPLOYMENT.md)
- [Developer Onboarding](file:///c:/Users/vuppa/Documents/projects/Smart-Spend/docs/DEVELOPMENT.md)

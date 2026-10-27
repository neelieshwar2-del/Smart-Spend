# SmartSpend — Phased Implementation Roadmap & Execution Plan

## 1. Roadmap Overview & Timeline

This roadmap details the engineering execution strategy for SmartSpend, moving systematically from architecture and planning through production deployment.

```
[Phase 0: Inspect & Plan] ➔ [Phase 1: Foundation] ➔ [Phase 2: UI & Design System]
        ➔ [Phase 3: Backend & DB] ➔ [Phase 4: Financial Engine]
        ➔ [Phase 5: AI Copilot] ➔ [Phase 6: Integration]
        ➔ [Phase 7: Security & Verification] ➔ [Phase 8: Deployment]
```

---

## 2. Phase-by-Phase Milestones

### Phase 0 — Inspect, Plan & Architecture (Completed)
- [x] Comprehensive repository audit (existing web prototype, Express backend, Prisma schema).
- [x] Product Requirements Document ([`docs/PRD.md`](./PRD.md)).
- [x] System Architecture Document ([`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)).
- [x] Database Architecture & Data Dictionary ([`docs/DATABASE.md`](./DATABASE.md)).
- [x] REST API Specification ([`docs/API.md`](./API.md)).
- [x] Security & Authorization Specification ([`docs/SECURITY.md`](./SECURITY.md)).
- [x] Testing Strategy & Verification Matrix ([`docs/TESTING.md`](./TESTING.md)).

---

### Phase 1 — Application Foundation Setup
- [ ] Initialize React Native / Expo TypeScript project with Expo Router and strict type checking.
- [ ] Establish design system tokens (`colors.ts`, `spacing.ts`, `typography.ts`).
- [ ] Verify backend TypeScript build and configuration (`backend/tsconfig.json`).
- [ ] Implement database seed script (`backend/prisma/seed.ts`) with default categories and mock transactions for initial onboarding.
- [ ] Ensure frontend and backend dev scripts start cleanly.

---

### Phase 2 — Complete Android UI & Design System
- [ ] Implement Root Layout and theme providers with Android safe-area and status bar support.
- [ ] Implement Bottom Navigation tabs (Home, Insights, Activity, Profile).
- [ ] **Home Dashboard**:
  - Spend limit card with neon lime accent, dynamic safe balance computation, and animated progress ring.
  - Quick action buttons (Add Expense, Scan UPI, AI Assistant).
  - Today's spending pacing indicator vs. daily target.
  - Recent transactions list and top category cards.
- [ ] **Add Transaction Sheet**:
  - Tactile numeric keypad with decimal point, backspace, and quick preset increment chips (`+₹50`, `+₹100`, `+₹500`, `+₹1,000`).
  - Expense vs. Income switcher.
  - Category carousel with icons.
  - Payment method chips (UPI, Cash, Debit, Credit).
- [ ] **Activity & Ledger Screen**:
  - Live search bar and filter chips.
  - Date-grouped transactions list.
  - Transaction detail sheet with Edit and Delete capabilities.
  - CSV export trigger.
- [ ] **Insights & Trends Screen**:
  - Weekly and monthly spending trend bar chart with target threshold line.
  - Category distribution visualizer.
  - Upcoming recurring subscriptions card.
- [ ] **Profile & Settings Screen**:
  - Currency selector, timezone selector, theme switcher.
  - Budget limit slider / input.
  - Privacy controls (Data Export, Delete Account).
- [ ] **AI Assistant & Modals**:
  - Conversational chat interface with financial suggestion chips.
  - Scan UPI simulator with laser animation.
  - In-app notification center.

---

### Phase 3 — Backend & Database Hardening
- [ ] Complete Prisma seed script with default categories (`Food & Dining`, `Groceries`, `Transport`, `Shopping`, `Bills & Utility`, `Entertainment`, `Health`, `Salary`, `Investment`).
- [ ] Enforce user ownership on all database queries.
- [ ] Implement dual-token JWT authentication with family rotation and refresh token revocation.
- [ ] Ensure integer paise conversions are strictly enforced across all inputs and outputs.

---

### Phase 4 — Authoritative Financial Engine
- [ ] Implement deterministic daily allowance calculation:
  $$\text{Daily Allowance} = \frac{\max(0, \text{Budget Limit} - \text{MTD Expenses})}{\max(1, \text{Days Remaining})}$$
- [ ] Implement budget warning threshold engine (`safe`, `warning`, `critical`, `exceeded`).
- [ ] Verify edge cases (leap years, month transitions, 0 days left, budget exceeded).

---

### Phase 5 — Server-Side AI Copilot & Grounding
- [ ] Server-side AI adapter supporting Google Gemini and OpenAI with environment configuration.
- [ ] Context grounding: Pre-aggregates user financial metrics before invoking LLM.
- [ ] Zero-hallucination guardrails: Model never computes balances or executes arbitrary database queries.
- [ ] Resilient offline/no-key fallback: Deterministic fintech rule engine answers questions accurately when API key is not provisioned.

---

### Phase 6 — Full Integration
- [ ] Integrate React Native Expo app with backend `/api/v1` endpoints using TanStack Query.
- [ ] Store authentication tokens in `expo-secure-store`.
- [ ] Implement automatic token refresh on `401 Unauthorized` responses.
- [ ] Connect transaction creation, editing, and deletion to immediate query invalidation and optimistic UI updates.
- [ ] Test network connectivity for Android emulator (`10.0.2.2`) and physical devices (`HOST_LAN_IP`).

---

### Phase 7 — Testing & Verification
- [ ] Run backend Vitest integration test suite (auth, transactions, budgets, recurring, analytics, notifications, AI).
- [ ] Verify cross-user data isolation tests.
- [ ] Test mobile user interactions and numeric keypad behavior.
- [ ] Verify financial totals reconcile exactly with transaction records.

---

### Phase 8 — Deployment & Release Readiness
- [ ] Production `.env.example` with documented security secrets.
- [ ] Dockerfile and Docker Compose configuration for backend and PostgreSQL.
- [ ] Database migration and backup procedures.
- [ ] Android build documentation (EAS build / local APK generation).
- [ ] Final definition-of-done sign-off.

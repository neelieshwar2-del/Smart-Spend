# SmartSpend — Product Requirements Document (PRD)

## 1. Executive Summary

**SmartSpend** is an AI-powered personal expense tracking and budgeting Android application engineered for modern consumers, college students, and working professionals. Managing daily finances across multiple payment modalities (UPI, cash, debit cards, credit cards) often results in fragmented tracking, category underestimation, and unexpected month-end deficits. 

SmartSpend solves this by providing a friction-free, tactile mobile interface paired with a deterministic financial calculation engine and an intelligent server-side AI financial copilot.

---

## 2. Core Vision & Principles

1. **Deterministic Financial Integrity**: Financial figures, daily allowances, budget pacing, and balances must be computed strictly via authoritative backend algorithms using exact integer arithmetic (paise). LLMs explain and contextualize data; they never compute or invent financial facts.
2. **Absolute Data Isolation & Security**: User financial data is private and strictly partitioned. Multi-tenant isolation is enforced at the database query level on every operation.
3. **Frictionless Mobile-First Logging**: Adding an expense must be completed in under 5 seconds with an ergonomic numeric keypad, quick preset chips, auto-categorization suggestions, and instant visual validation.
4. **Transparent Computations**: Every single metric on the dashboard (Remaining Safe Balance, Daily Target, Burn Rate) is traceable to explicit user transactions and budget parameters.
5. **Resilient AI Graceful Degradation**: The core application functions seamlessly offline and without external LLM provider connectivity using deterministic algorithmic insights.

---

## 3. User Personas & Target Audience

| Persona | Demographics & Context | Primary Pain Points | SmartSpend Solution |
| :--- | :--- | :--- | :--- |
| **Aarav (Student)** | 20 yrs, living in hostel, fixed monthly allowance via UPI & cash | Runs out of budget by mid-month; forgets small tea/snack expenses | Tactile keypad with +₹50/+₹100 chips; real-time "Safe Daily Allowance" indicator |
| **Priya (Young Professional)** | 26 yrs, salaried, multiple credit cards + UPI auto-debits | Loses track of recurring subscriptions and dining out | Auto-categorization, recurring subscription manager, pacing alerts |
| **Vikram (Freelancer / Gig Worker)** | 32 yrs, variable cash flow, mixed business & personal spending | Inconsistent income timing and high cognitive load reviewing bank statements | Cash flow analytics, CSV statement exports, AI spending query engine |

---

## 4. Design System & UX Standards

The visual design follows a clean, minimalist neo-fintech aesthetic engineered for high legibility, calm decision-making, and rapid tactile interaction.

### 4.1 Design Tokens

- **Primary Text**: `#172033` (Deep midnight slate)
- **Primary Background**: `#F7F8F5` (Off-white alabaster)
- **Card Background**: `#FFFFFF` (Pure white)
- **Brand Accent**: `#B8F36B` (Vibrant neo-lime)
- **Secondary Text**: `#737B8C` (Muted cool gray)
- **Border / Divider**: `#E7EAE3` (Subtle boundary stroke)
- **Expense Warning / Negative**: `#D95C5C` (Soft crimson)
- **Positive / Income / Safe Status**: `#267548` (Forest emerald)
- **Dark Theme Surfaces**: `#0F172A` / `#1E293B` with high-contrast text

### 4.2 Ergonomics & Layout
- **Spacing Scale**: 8 dp base grid (`8`, `16`, `24`, `32`, `40` dp).
- **Corner Radii**: Cards 16–24 dp; buttons/pills 12–16 dp or full pill (999 dp).
- **Touch Targets**: Minimum 48×48 dp interactive hit area for all buttons, chips, and keypad keys.
- **Typography**: System font (Roboto on Android / SF Pro on iOS / Inter), clear typographic scale with tabular numbers for currency.

---

## 5. Information Architecture & Navigation

The mobile application utilizes a 4-tab bottom navigation structure anchored by a prominent quick-action modal:

1. **Home (Dashboard)**:
   - Monthly Spend Limit card with lime accent, remaining safe balance, and animated progress ring/bar.
   - Today's Spending card with pacing indicator vs. recommended daily allowance.
   - Quick Action bar: Add Expense, Scan UPI, AI Assistant, View Reports.
   - Contextual smart financial insight pill.
   - Recent transaction ledger (last 5 entries).
   - Top spending category breakdown.

2. **Insights (Analytics & Trends)**:
   - Period selector: *Week*, *Month*, *Quarter*, *Year*.
   - 2×2 metric grid: Total Expenses, Daily Average, Top Category, Net Savings.
   - Weekly/monthly spending trend chart with target threshold line.
   - Category distribution bar/donut visualizer.
   - Upcoming subscription obligations tracker.

3. **Activity (Ledger & History)**:
   - Search bar across merchant names, notes, and tags.
   - Multi-filter carousel: All, Categories, Payment Methods (UPI, Cash, Cards), Expense/Income.
   - Date-grouped transaction cards (Today, Yesterday, Date header).
   - Transaction Detail Sheet: Edit, Delete, Duplicate, Categorize.
   - One-touch CSV export.

4. **Profile & Settings**:
   - User identity, avatar, membership badge.
   - Currency configuration (`INR ₹`, `USD $`, `EUR €`, `GBP £`).
   - Timezone configuration (e.g., `Asia/Kolkata`).
   - Budget configuration (Set monthly spend limit, pacing algorithm).
   - Theme toggle (Light / Dark / System default).
   - Sound / Haptic feedback toggle.
   - Data privacy controls: Export JSON/CSV, Request Account Deletion.

5. **Add Transaction Sheet / Screen**:
   - Segmented toggle: Expense vs. Income.
   - Hero numeric display with dedicated keypad (0–9, decimal, backspace).
   - Quick increment chips: `+₹50`, `+₹100`, `+₹500`, `+₹1,000`.
   - Category carousel with intuitive icons.
   - Merchant/Title input with autocomplete and clear button.
   - Payment method chips (UPI, Cash, Debit Card, Credit Card).
   - Anti-duplicate submission guard.

6. **AI Financial Assistant Modal**:
   - Conversational chat interface grounded strictly in user's verified database transactions.
   - Suggested query prompts (*"Where did most of my money go this week?"*, *"Can I afford dinner tonight?"*, *"Which subscriptions are active?"*).
   - Response rendering with formatted currency callouts and actionable tips.

---

## 6. Functional Specifications

### 6.1 Authentication & Profile
- Registration with Name, Email, and strong Password (minimum 8 characters).
- Password hashed via Argon2id / Bcrypt (work factor 12).
- Dual-token session management: 15-minute access JWT and 7-day refresh JWT stored securely in device storage (`SecureStore`).
- Token rotation and family revocation on reuse detection.

### 6.2 Transaction Management
- CRUD operations with optimistic local updates and backend reconciliation.
- Precision monetary storage in integer minor units (paise: `1 INR = 100 paise`).
- Idempotency key support on creation to prevent duplicate network submissions.
- Support for categorization, merchant tagging, timestamps, payment methods, and notes.

### 6.3 Budgeting & Pacing Engine
- Configurable overall monthly budget limit and optional category-specific limits.
- Authoritative daily allowance calculation:
  $$\text{Daily Allowance} = \frac{\max(0, \text{Budget Limit} - \text{Month-to-Date Expenses})}{\max(1, \text{Days Remaining in Period})}$$
- Dynamic warning thresholds: `Safe` (<70%), `Warning` (70–90%), `Critical` (90–99%), `Exceeded` (≥100%).

### 6.4 Recurring Payments & Subscriptions
- Recurring rule definitions: Daily, Weekly, Monthly, Yearly.
- Next due date tracking, active status toggling, and projected monthly cost aggregation.
- Distinguishes scheduled reminders from posted transactions.

### 6.5 Grounded AI Copilot
- Backend-mediated queries only; no direct LLM access to raw database or client keys.
- Query pipeline:
  1. Authenticate user session.
  2. Query user aggregates via deterministic repository methods.
  3. Formulate minimal privacy-redacted prompt context.
  4. Query LLM provider (or fallback to rule-based fintech analysis engine).
  5. Validate structured response schema using Zod.
  6. Return factual, helpful answer with cited numerical data.

---

## 7. Non-Functional Requirements

- **Performance**: P95 API response time under 120ms; cold app launch to interactive under 1.5s.
- **Availability**: Offline-first transaction caching; queued sync on reconnection.
- **Accessibility**: Screen reader compatible, minimum 4.5:1 contrast ratio, scalable font support.
- **Security**: OWASP Mobile Top 10 compliance, no sensitive logs, rate-limited auth endpoints.

# SmartSpend — System Architecture Document

## 1. System Overview

SmartSpend follows a modern decoupled, layered full-stack architecture optimized for low-latency mobile interactions, absolute data integrity, and secure AI-driven financial insights.

```
+-------------------------------------------------------------------------+
|                         ANDROID MOBILE FRONTEND                         |
|  Expo / React Native | TypeScript Strict | Expo Router | Design Tokens  |
|  TanStack Query | React Hook Form + Zod | SecureStore | Lucide Icons   |
+------------------------------------+------------------------------------+
                                     |
                                     | HTTPS / JSON (REST API /api/v1)
                                     v
+------------------------------------+------------------------------------+
|                         NODE.JS / EXPRESS BACKEND                       |
|  +-------------------------------------------------------------------+  |
|  | Middleware: Helmet, CORS, RateLimiter, JWT Auth, Error Handler     |  |
|  +-------------------------------------------------------------------+  |
|  | Controllers: Request parsing, Zod Validation, HTTP mapping        |  |
|  +-------------------------------------------------------------------+  |
|  | Services: Business logic, Auth, Transactions, Budgets, Analytics  |  |
|  +-------------------------------------------------------------------+  |
|  | Authoritative Financial Calculation Engine (Integer Paise Math)   |  |
|  +-------------------------------------------------------------------+  |
|  | AI Provider Adapter: Context grounding, Prompt Guard, Fallback    |  |
|  +-------------------------------------------------------------------+  |
|  | Repositories & Prisma ORM: Data mapping, Transactions, Ownership   |  |
|  +-------------------------------------------------------------------+  |
+------------------------------------+------------------------------------+
                                     |
                                     | Prisma Client / Connection Pooling
                                     v
+------------------------------------+------------------------------------+
|                    POSTGRESQL RELATIONAL DATABASE                       |
|  Normalized Tables: Users, RefreshTokens, Transactions, Budgets,         |
|  Categories, RecurringRules, Notifications, AiInsights                   |
+-------------------------------------------------------------------------+
```

---

## 2. Android Frontend Architecture

The mobile client is built on **React Native with Expo** using strict-mode TypeScript and modular components.

### 2.1 File & Directory Organization
```
frontend/ (or mobile root)
├── app/                      # Expo Router file-based navigation
│   ├── (auth)/               # Unauthenticated routes (login, register, welcome)
│   ├── (tabs)/               # Main bottom-tab navigation
│   │   ├── index.tsx         # Dashboard / Home Screen
│   │   ├── insights.tsx      # Analytics & Trends Screen
│   │   ├── activity.tsx      # Transaction Ledger & Search Screen
│   │   └── profile.tsx       # User Profile & App Settings Screen
│   ├── modal/                # Modal screens
│   │   ├── add-expense.tsx   # Tactile Keypad Add/Edit Transaction
│   │   ├── ai-assistant.tsx  # Grounded Financial Copilot Chat
│   │   ├── scan-upi.tsx      # QR Code / UPI Simulator
│   │   └── notifications.tsx # In-app notification center
│   └── _layout.tsx           # Root navigation stack and providers
├── src/
│   ├── components/           # Reusable UI widgets
│   │   ├── common/           # Button, Card, Input, Badge, Pill, Avatar
│   │   ├── dashboard/        # BudgetCard, TodayCard, RecentList, QuickActions
│   │   ├── transactions/     # Keypad, CategoryCarousel, TransactionItem
│   │   └── charts/           # BarChart, DonutProgress, PacingMeter
│   ├── theme/                # Centralized design tokens and palette
│   │   ├── colors.ts         # Tokens (#172033, #F7F8F5, #B8F36B, etc.)
│   │   ├── typography.ts     # Font sizes, line heights, weights
│   │   ├── spacing.ts        # 8dp grid spacing definitions
│   │   └── index.ts          # Unified theme provider
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts        # Session, login, logout, token refresh
│   │   ├── useTransactions.ts# React Query hooks for transaction CRUD
│   │   ├── useBudgets.ts     # React Query hooks for budget calculations
│   │   └── useHaptics.ts     # Native tactile feedback triggers
│   ├── services/             # API client and local persistence
│   │   ├── api.ts            # Typed Axios/Fetch client with interceptors
│   │   ├── storage.ts        # SecureStore (tokens) & AsyncStorage (preferences)
│   │   └── offline.ts        # Optimistic queue and offline cache manager
│   └── types/                # Shared TypeScript contracts & schemas
└── package.json
```

### 2.2 Network & Host Configuration for Android
Inside an Android Emulator, `localhost` resolves to the emulator virtual device itself. The API client dynamically resolves:
- **Android Emulator**: `http://10.0.2.2:4000/api/v1`
- **Physical Device / Expo Go**: `http://<HOST_LAN_IP>:4000/api/v1`
- **Production**: `https://api.smartspend.app/api/v1`

---

## 3. Backend Architecture

The backend is structured under an enterprise Clean Architecture paradigm with strict separation of concerns:

### 3.1 Directory Organization
```
backend/
├── src/
│   ├── config/               # Zod-validated environment configuration
│   ├── middlewares/          # Auth, Error, Rate Limiting, Request Loggers
│   ├── modules/              # Domain feature slices
│   │   ├── auth/             # Authentication, JWT rotation, Password hashing
│   │   ├── categories/       # System & custom transaction categories
│   │   ├── transactions/     # Transaction ledger, CRUD, filtering, CSV
│   │   ├── budgets/          # Budget configuration & dashboard calculation
│   │   ├── recurring/        # Subscription rules & due dates
│   │   ├── analytics/        # Time-series aggregation & comparisons
│   │   ├── notifications/    # In-app alerts and threshold warnings
│   │   └── ai/               # Grounded copilot, prompt guards, fallbacks
│   ├── prisma/               # Prisma Client singleton & connection pooling
│   ├── types/                # Express extensions, global interfaces
│   ├── utils/                # Money (paise), Dates, JWT, Crypto
│   ├── app.ts                # Express application factory
│   └── server.ts             # Process lifecycle, graceful shutdown
├── prisma/
│   ├── schema.prisma         # Normalized database definition
│   └── seed.ts               # Default categories and sample fintech records
└── package.json
```

### 3.2 Request Lifecycle
1. **Network Layer**: Encrypted HTTPS request enters Node.js.
2. **Security & Parsing**: `Helmet` attaches security headers; `cors` verifies origins; `express.json` parses body with 1MB limit.
3. **Authentication Middleware**: `auth.middleware.ts` parses `Bearer <token>`, verifies signature via `JWT_ACCESS_SECRET`, attaches decoded `userId` to `req.user`. If token is invalid or expired, immediately aborts with `401 Unauthorized`.
4. **Validation**: Route middleware validates request params, query, and body against strongly typed `Zod` schemas. Malformed inputs return `400 Bad Request` with structured error details.
5. **Controller Layer**: Unpacks validated inputs and delegates to domain Services.
6. **Service Layer**: Executes business rules, calls the Authoritative Financial Calculation Engine, and orchestrates repository calls.
7. **Repository Layer**: Executes parameterized Prisma queries scoped strictly to `where: { userId }`.
8. **Error & Response Formatting**: Centralized error middleware captures exceptions and outputs a standardized JSON envelope:
   ```json
   {
     "success": true,
     "data": { ... },
     "meta": { ... }
   }
   ```

---

## 4. Authoritative Financial Calculation Engine

To prevent discrepancies between client platforms and AI hallucinations, all financial arithmetic is executed exclusively in the backend domain layer using **integer minor units (paise)**:

1. **Storage Unit**: All monetary fields (`amount`, `amountLimit`, `netCashFlow`) are stored as signed 64-bit integers representing paise (`1 INR = 100 paise`).
2. **No Binary Floating-Point Drift**: Arithmetic operations $(+, -, \times)$ are computed on integers. Conversions to display strings occur solely at the API serialization boundary.
3. **Core Financial Formulas**:
   - **Month-to-Date Expense**: $\sum \text{amount}$ for type = `expense` where $\text{transactionDate} \in [\text{startOfMonth}, \text{now}]$.
   - **Remaining Safe Budget**:
     $$\text{Remaining} = \text{Budget Limit} - \text{Total MTD Eligible Expenses}$$
   - **Safe Daily Allowance**:
     $$\text{Daily Allowance} = \frac{\max(0, \text{Remaining Safe Budget})}{\max(1, \text{Total Days in Month} - \text{Current Day} + 1)}$$
   - **Budget Consumption Ratio**:
     $$\text{Burn Ratio} = \frac{\text{Total MTD Expenses}}{\text{Budget Limit}} \times 100\%$$
   - **Today's Pacing Buffer**:
     $$\text{Buffer} = \text{Daily Allowance} - \text{Today's Spent}$$

---

## 5. AI Copilot & Grounding Architecture

The SmartSpend AI Copilot is engineered with **Zero-Hallucination Guardrails**:

1. **Step 1: Session Verification**: Authenticates the requesting user.
2. **Step 2: Deterministic Pre-Aggregation**: Backend executes native database aggregations for current month spend, category breakdowns, and active budgets.
3. **Step 3: Sanitization & Context Formulation**: User questions and transaction notes are sanitized to neutralize prompt injection vectors (e.g., stripping system prompt overrides).
4. **Step 4: LLM Invocation with Strict System Prompt**:
   - The LLM is provided explicit aggregated numbers as immutable context facts.
   - The LLM is instructed: *"You are SmartSpend AI, a friendly financial assistant. Use ONLY the supplied financial figures. Never calculate balances independently. If asked for data outside the context, politely clarify."*
5. **Step 5: Output Schema Validation**: Responses are parsed and checked against a Zod schema containing `{ answer: string, actionableTip: string, categoryHighlights: string[] }`.
6. **Step 6: Resilient Fallback Engine**: If no LLM API key is provisioned (`AI_PROVIDER="none"`), the backend activates the built-in deterministic rule engine that pattern-matches user intents (affordability, category totals, pacing) and formats authoritative responses instantly.

# SmartSpend — Testing Strategy and Verification Matrix

## 1. Testing Strategy Overview

Financial applications demand exhaustive verification. Our testing architecture follows a 4-tier verification model:

```
          / \
         /   \      E2E User Journeys (Android / Device Flow)
        /     \
       /-------\    HTTP Integration Tests (Supertest + Express API)
      /         \
     /-----------\  Domain Engine Property Tests (Financial Math & Pacing)
    /             \
   /---------------\ Unit Tests (Schemas, Cryptography, Money Utilities)
```

---

## 2. Test Suites & Coverage Matrix

### 2.1 Backend Unit & Utilities Tests
| Suite | Focus | Target Assertions |
| :--- | :--- | :--- |
| `money.test.ts` | Currency conversion | `rupeesToPaise(450.50) === 45050`, zero floating point drift, precision rounding |
| `password.test.ts` | Password hashing | Salt generation, bcrypt verification, timing attack resilience |
| `jwt.test.ts` | Token lifecycle | Correct payload signing, expiry enforcement, malformed token rejection |

### 2.2 Financial Calculation Engine Tests
| Scenario | Inputs | Expected Output |
| :--- | :--- | :--- |
| **Normal Pacing** | Budget: ₹45,000, MTD Spent: ₹28,450, 5 days left | Remaining: ₹16,550, Daily Allowance: ₹3,310, Status: `safe` |
| **Exceeded Budget**| Budget: ₹30,000, MTD Spent: ₹32,000, 10 days left| Remaining: ₹0, Daily Allowance: ₹0, Status: `exceeded` |
| **Zero Days Left** | Budget: ₹20,000, MTD Spent: ₹15,000, Last day of month | Remaining: ₹5,000, Daily Allowance: ₹5,000, Divisor safe guard ($\ge 1$) |
| **No Budget Set**  | No active budget configured | `hasBudget: false`, displays total income/expense without false warnings |

### 2.3 API Integration Tests (Supertest + Vitest)
The backend test suite includes 8 comprehensive test files in `backend/tests/`:

1. **`health.test.ts`**: Verifies `/api/v1/health` and database probe.
2. **`auth.test.ts`**:
   - User registration with valid data returns `201` and tokens.
   - Duplicate email registration returns `409 Conflict`.
   - Login with incorrect password returns `401 Unauthorized`.
   - Token refresh rotates token; reuse of old token revokes family.
   - Authenticated `/api/v1/auth/me` returns current user.
3. **`transactions.test.ts`**:
   - Create transaction in paise returns `201` and formatted INR.
   - List transactions with pagination and date filters.
   - Edit transaction updates amounts and categories.
   - Delete transaction removes record from database.
   - **Cross-user isolation**: User B cannot view or delete User A's transaction.
4. **`budgets.test.ts`**:
   - Set monthly budget limit.
   - Dashboard returns reconciled numbers matching transactions.
   - Updating budget immediately alters daily allowance and pacing metrics.
5. **`analytics.test.ts`**:
   - Time-series daily spending matches sum of daily transactions.
   - Category breakdown percentages accurately sum to 100%.
6. **`recurring.test.ts`**:
   - Creates subscription rule with frequency and next due date.
   - Toggle active status updates processing state.
7. **`notifications.test.ts`**:
   - In-app notification creation on threshold breach.
   - Marking notifications as read decrements unread counter.
8. **`ai.test.ts`**:
   - AI chat returns grounded response with user's verified financial metrics.
   - Validates that AI assistant functions seamlessly when `AI_PROVIDER="none"` (deterministic fallback).

---

## 3. Frontend & Mobile Verification Strategy

### 3.1 Component & Interaction Tests
- Numeric Keypad: Verifies decimal handling (single decimal point allowed), backspace, and quick preset addition chips (`+₹50`, `+₹100`, etc.).
- Form Validation: Ensures submission is blocked if amount is zero or category is unselected.
- Optimistic Updates: Verifies that saving an expense updates the local ledger instantly while awaiting backend confirmation.

### 3.2 Android Device / Emulator Checklist
- Status Bar: Proper translucent/light-content theming matching Android specifications.
- Safe Area Insets: Notch and navigation pill offsets correctly applied.
- Keyboard Handling: Numeric keypad dismisses cleanly; form fields scroll above soft keyboard (`KeyboardAvoidingView`).
- Back Button: Android hardware back button cleanly closes modals and navigates back.
- Network Adaptation: Dynamic resolution of `10.0.2.2` (Android emulator) vs. LAN IP (physical phone).

---

## 4. Test Execution Commands

```bash
# Backend Test Suite (Vitest)
cd backend
npm test

# Type Check Backend
cd backend
npm run build

# Type Check Frontend
cd frontend
npx tsc --noEmit
```

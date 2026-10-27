# SmartSpend — REST API Specification (`/api/v1`)

## 1. Overview & Conventions

All endpoints are versioned under `/api/v1`. Communication is strictly over HTTPS using JSON payloads.

### 1.1 Authentication Header
Authenticated routes require a Bearer token:
```http
Authorization: Bearer <accessToken>
```

### 1.2 Standard Response Envelope
All successful requests return HTTP `200` or `201` with:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-27T10:00:00.000Z",
    "requestId": "req_cuid_12345"
  }
}
```

### 1.3 Standard Error Envelope
Failed requests return HTTP `400`, `401`, `403`, `404`, `409`, or `500` with:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Transaction amount must be a positive integer in paise",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be greater than 0"
      }
    ]
  }
}
```

---

## 2. API Endpoint Directory

### 2.1 Health Check
- **`GET /api/v1/health`**
  - **Description**: Probes service status, database connectivity, and system uptime.
  - **Auth**: Public
  - **Response**:
    ```json
    {
      "success": true,
      "status": "ok",
      "database": "connected",
      "uptime": 1420
    }
    ```

---

### 2.2 Authentication & User Lifecycle
- **`POST /api/v1/auth/register`**
  - **Body**: `{ "name": "Rohan Sharma", "email": "rohan@example.com", "password": "Password123", "currency": "INR", "timezone": "Asia/Kolkata" }`
  - **Response**: Returns created user profile and session token pair (`accessToken`, `refreshToken`).

- **`POST /api/v1/auth/login`**
  - **Body**: `{ "email": "rohan@example.com", "password": "Password123" }`
  - **Response**: Returns authenticated user profile and session tokens.

- **`POST /api/v1/auth/refresh`**
  - **Body**: `{ "refreshToken": "jwt_token_string" }`
  - **Response**: Rotates refresh token and issues fresh `accessToken`. Revokes family on reuse.

- **`POST /api/v1/auth/logout`**
  - **Auth**: Required
  - **Body**: `{ "refreshToken": "jwt_token_string" }`
  - **Response**: Invalidates the active session token family.

- **`GET /api/v1/auth/me`**
  - **Auth**: Required
  - **Response**: Returns active user record and system preferences.

---

### 2.3 Categories
- **`GET /api/v1/categories`**
  - **Auth**: Required
  - **Query**: `type=expense|income`
  - **Response**: Array of system default categories and user's custom categories.

- **`POST /api/v1/categories`**
  - **Auth**: Required
  - **Body**: `{ "name": "Fitness", "icon": "dumbbell", "color": "#10B981", "type": "expense" }`

- **`DELETE /api/v1/categories/:id`**
  - **Auth**: Required
  - **Behavior**: Safe deletion. Fails with `400` if active transactions reference this category.

---

### 2.4 Transactions & Ledger
- **`GET /api/v1/transactions`**
  - **Auth**: Required
  - **Query Parameters**:
    - `page` (default `1`), `limit` (default `20`)
    - `startDate`, `endDate` (ISO 8601 strings)
    - `categoryId`
    - `type` (`expense` | `income`)
    - `paymentMethod` (`UPI`, `Cash`, `Debit Card`, `Credit Card`)
    - `search` (matches `title`, `merchant`, `note`)
  - **Response**: Paginated transactions list with pagination metadata.

- **`POST /api/v1/transactions`**
  - **Auth**: Required
  - **Body**:
    ```json
    {
      "amount": 45000,
      "type": "expense",
      "categoryId": "cat_cuid_food",
      "title": "Blue Tokai Coffee",
      "merchant": "Blue Tokai Roasters",
      "paymentMethod": "UPI",
      "transactionDate": "2026-10-27T10:30:00.000Z",
      "note": "Filter coffee with team"
    }
    ```
  - **Response**: Created transaction record with formatted Rupee values.

- **`GET /api/v1/transactions/:id`**
  - **Auth**: Required
  - **Response**: Detailed transaction record. Returns `404` if not found or unauthorized.

- **`PUT /api/v1/transactions/:id`**
  - **Auth**: Required
  - **Body**: Editable fields (`amount`, `title`, `categoryId`, `paymentMethod`, `note`).

- **`DELETE /api/v1/transactions/:id`**
  - **Auth**: Required
  - **Response**: `{ "success": true, "message": "Transaction deleted successfully" }`

- **`GET /api/v1/transactions/export`**
  - **Auth**: Required
  - **Query**: `month=2026-10`
  - **Response**: CSV file stream containing standard banking statement columns.

---

### 2.5 Budgets & Financial Summary
- **`GET /api/v1/budgets/dashboard`**
  - **Auth**: Required
  - **Response**: Comprehensive pre-calculated financial metrics:
    - `summary`: totalIncome, totalExpenses, netCashFlow (paise & formatted)
    - `monthlyBudget`: amountLimit, totalSpent, remainingSafe, dailyAllowance, percentageUsed, warningStatus
    - `todaySpending`: todaySpent, dailyTarget, percentageOfAllowance, bufferRemaining, onTrack
    - `topCategories`: Top spending categories with percentage allocations
    - `recentTransactions`: Last 5 transactions
    - `smartTip`: Algorithmic financial advice based on real numbers

- **`POST /api/v1/budgets`**
  - **Auth**: Required
  - **Body**: `{ "amountLimit": 4500000, "period": "monthly", "name": "Monthly Limit" }`
  - **Response**: Configured budget record.

---

### 2.6 Analytics & Trends
- **`GET /api/v1/analytics/overview`**
  - **Auth**: Required
  - **Query**: `period=this_month|last_month|custom`
  - **Response**: High-level spending totals, daily averages, and category concentrations.

- **`GET /api/v1/analytics/daily`**
  - **Auth**: Required
  - **Query**: `days=7|30`
  - **Response**: Time-series array `{ "date": "2026-10-21", "amount": 84000, "formatted": "₹840.00" }`

- **`GET /api/v1/analytics/categories`**
  - **Auth**: Required
  - **Response**: Category distribution with counts and totals for donut/bar visualization.

---

### 2.7 Recurring Subscriptions
- **`GET /api/v1/recurring`**
  - **Auth**: Required
  - **Response**: All recurring rules with next due dates and total monthly projected cost.

- **`POST /api/v1/recurring`**
  - **Auth**: Required
  - **Body**: `{ "title": "Netflix Premium", "amount": 64900, "categoryId": "cat_sub", "frequency": "monthly", "nextDueDate": "2026-11-04" }`

- **`PATCH /api/v1/recurring/:id/toggle`**
  - **Auth**: Required
  - **Response**: Updates `isActive` status.

---

### 2.8 Notifications
- **`GET /api/v1/notifications`**
  - **Auth**: Required
  - **Response**: In-app notifications with unread count.

- **`POST /api/v1/notifications/read-all`**
  - **Auth**: Required
  - **Response**: Marks all notifications as read.

---

### 2.9 AI Assistant
- **`POST /api/v1/ai/chat`**
  - **Auth**: Required
  - **Body**: `{ "message": "Can I afford dinner tonight?" }`
  - **Response**:
    ```json
    {
      "success": true,
      "data": {
        "answer": "Yes! You have ₹640 safe to spend today and a remaining cushion of ₹16,550 across the last 5 days of this month. A dinner under ₹640 keeps you 100% on track!",
        "model": "smartspend-fintech-engine",
        "metrics": {
          "totalExpense": "₹28,450.00",
          "remainingBudget": "₹16,550.00",
          "topCategory": "Food & Dining"
        }
      }
    }
    ```

- **`GET /api/v1/ai/insights`**
  - **Auth**: Required
  - **Response**: List of saved proactive insights.

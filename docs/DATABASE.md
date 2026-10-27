# SmartSpend — Database Architecture & Data Dictionary

## 1. Relational Database Overview

SmartSpend uses **PostgreSQL** managed through **Prisma ORM**. The schema is strictly normalized (3NF), enforces multi-tenant ownership at the schema level, indexes key time-series and search vectors, and uses integer minor units for all monetary computations.

---

## 2. Monetary Precision Standard: Integer Paise

### 2.1 The Floating-Point Problem
In standard binary floating point (`IEEE 754` used by JavaScript `Number`), values such as `0.1 + 0.2` equal `0.30000000000000004`. Accumulating fractional floating point operations over thousands of financial transactions causes ledger balance drift, reconciliation failures, and rounding bugs.

### 2.2 The SmartSpend Solution
1. **Integer Minor Units**: All monetary values in the database are stored as **Paise** (`1 INR = 100 paise`) in 64-bit integer columns (`Int` in Prisma / `BIGINT` or `INTEGER` in PostgreSQL).
   - ₹450.50 is stored as `45050`.
   - ₹1,000.00 is stored as `100000`.
   - ₹0.75 is stored as `75`.
2. **Deterministic Rounding**: Any external floating-point conversion is rounded deterministically:
   $$\text{paise} = \text{Math.round}(\text{rupees} \times 100)$$
   $$\text{rupees} = \frac{\text{paise}}{100}$$
3. **No Database Fractional Storage**: No `FLOAT`, `DOUBLE`, or approximate numeric types are permitted for balance or amount columns.

---

## 3. Entity-Relationship Model (ERD)

```
       +------------------+
       |       User       |
       +--------+---------+
                | 1
                |
   +------------+------------+---------------+--------------+--------------+
   | N          | N          | N             | N            | N            | N
+--+---+    +---+---+    +---+---+       +---+---+      +---+---+      +---+---+
|RefreshToken| |Category| |Budget |       |Txn    |      |Recur  |      |Notif  |
+------+    +---+---+    +-------+       +---+---+      +---+---+      +-------+
                | 1                          |              |
                +----------------------------+--------------+
                                         (references)
```

---

## 4. Normalized Data Dictionary

### 4.1 Table: `User`
Stores root account credentials and localized user preferences.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` (CUID/UUID) | `PRIMARY KEY` | Unique user identifier |
| `name` | `String` | `NOT NULL` | Display name (e.g., "Rohan Sharma") |
| `email` | `String` | `UNIQUE, NOT NULL` | Login email address (lowercase normalized) |
| `passwordHash` | `String` | `NOT NULL` | Argon2id / Bcrypt hash string |
| `currency` | `String` | `DEFAULT 'INR'` | ISO 4217 currency code |
| `timezone` | `String` | `DEFAULT 'Asia/Kolkata'` | IANA timezone identifier |
| `createdAt` | `DateTime` | `DEFAULT NOW()` | Account creation timestamp |
| `updatedAt` | `DateTime` | `AUTO UPDATE` | Last profile update timestamp |

**Indexes**:
- `@@index([email])`

---

### 4.2 Table: `RefreshToken`
Tracks active cryptographic session tokens with family rotation for intrusion detection.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `PRIMARY KEY` | Unique record ID |
| `userId` | `String` | `FK -> User.id (CASCADE)` | Associated user |
| `hashedToken` | `String` | `UNIQUE, NOT NULL` | SHA-256 hash of the issued refresh token |
| `family` | `String` | `NOT NULL` | Session family identifier |
| `expiresAt` | `DateTime` | `NOT NULL` | Refresh token expiration timestamp |
| `revokedAt` | `DateTime` | `NULLABLE` | Revocation timestamp if logged out or reused |
| `createdAt` | `DateTime` | `DEFAULT NOW()` | Token issuance timestamp |

**Indexes**:
- `@@index([userId])`
- `@@index([family])`

---

### 4.3 Table: `Category`
Represents transaction groupings. System defaults (`userId = null`) are visible to all; user custom categories are private.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `PRIMARY KEY` | Unique category ID |
| `userId` | `String` | `FK -> User.id (CASCADE), NULL` | Owner ID (null for system presets) |
| `name` | `String` | `NOT NULL` | Display name (e.g., "Food & Dining") |
| `icon` | `String` | `DEFAULT 'receipt'` | Lucide icon identifier |
| `color` | `String` | `DEFAULT '#555e74'` | Hex color code |
| `type` | `String` | `DEFAULT 'expense'` | Category type: `expense` or `income` |
| `isDefault` | `Boolean` | `DEFAULT false` | True if seeded system default |
| `createdAt` | `DateTime` | `DEFAULT NOW()` | Creation timestamp |

**Constraints & Indexes**:
- `@@unique([userId, name, type])`
- `@@index([userId])`

---

### 4.4 Table: `Transaction`
The immutable primary financial ledger entry.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `PRIMARY KEY` | Unique transaction ID |
| `userId` | `String` | `FK -> User.id (CASCADE)` | Owning user ID |
| `type` | `String` | `DEFAULT 'expense'` | `expense` or `income` |
| `amount` | `Int` | `NOT NULL` | Value in integer paise (`45000` = ₹450.00) |
| `categoryId` | `String` | `FK -> Category.id (RESTRICT)`| Assigned category |
| `title` | `String` | `NOT NULL` | Transaction title or payee |
| `merchant` | `String` | `NULLABLE` | Merchant / Business name |
| `note` | `String` | `NULLABLE` | User remarks or invoice notes |
| `transactionDate` | `DateTime`| `DEFAULT NOW()` | Effective date and time of expense |
| `paymentMethod` | `String` | `DEFAULT 'UPI'` | `UPI`, `Cash`, `Debit Card`, `Credit Card` |
| `isRecurring` | `Boolean` | `DEFAULT false` | Flag if generated via recurring rule |
| `recurringRuleId` | `String` | `FK -> RecurringRule.id (SET NULL)`| Link to originating rule |
| `createdAt` | `DateTime` | `DEFAULT NOW()` | Record insertion timestamp |
| `updatedAt` | `DateTime` | `AUTO UPDATE` | Record edit timestamp |

**Indexes**:
- `@@index([userId, transactionDate])` (Optimizes ledger pagination & month range queries)
- `@@index([userId, categoryId])` (Optimizes category breakdown aggregations)
- `@@index([userId, type])` (Optimizes cash flow income/expense filters)

---

### 4.5 Table: `Budget`
Stores monthly and category-level spending limits.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `PRIMARY KEY` | Unique budget ID |
| `userId` | `String` | `FK -> User.id (CASCADE)` | Owning user ID |
| `name` | `String` | `NOT NULL` | Budget title (e.g., "Monthly Overall") |
| `amountLimit` | `Int` | `NOT NULL` | Limit in integer paise (`4500000` = ₹45,000) |
| `period` | `String` | `DEFAULT 'monthly'` | Budget period: `monthly` or `weekly` |
| `categoryId` | `String` | `FK -> Category.id (SET NULL)`| Null for overall budget; set for category |
| `startDate` | `DateTime` | `NOT NULL` | Period start (e.g., 1st of month) |
| `endDate` | `DateTime` | `NOT NULL` | Period end (e.g., last day of month) |
| `createdAt` | `DateTime` | `DEFAULT NOW()` | Creation timestamp |
| `updatedAt` | `DateTime` | `AUTO UPDATE` | Modification timestamp |

**Indexes**:
- `@@index([userId, startDate, endDate])`

---

### 4.6 Table: `RecurringRule`
Tracks subscription and recurring payment obligations.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `PRIMARY KEY` | Unique rule ID |
| `userId` | `String` | `FK -> User.id (CASCADE)` | Owning user ID |
| `title` | `String` | `NOT NULL` | Subscription title (e.g., "Netflix") |
| `amount` | `Int` | `NOT NULL` | Amount in integer paise |
| `categoryId` | `String` | `FK -> Category.id (RESTRICT)`| Assigned category |
| `frequency` | `String` | `DEFAULT 'monthly'` | `daily`, `weekly`, `monthly`, `yearly` |
| `interval` | `Int` | `DEFAULT 1` | Interval multiplier |
| `nextDueDate` | `DateTime` | `NOT NULL` | Next projected payment date |
| `endDate` | `DateTime` | `NULLABLE` | Optional expiry date |
| `isActive` | `Boolean` | `DEFAULT true` | Subscription active status |
| `createdAt` | `DateTime` | `DEFAULT NOW()` | Creation timestamp |
| `updatedAt` | `DateTime` | `AUTO UPDATE` | Update timestamp |

**Indexes**:
- `@@index([userId, isActive, nextDueDate])`

---

### 4.7 Table: `Notification`
Stores in-app alert history (budget warnings, recurring reminders).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `PRIMARY KEY` | Notification record ID |
| `userId` | `String` | `FK -> User.id (CASCADE)` | Target user ID |
| `type` | `String` | `NOT NULL` | `BUDGET_WARNING`, `RECURRING_DUE`, etc. |
| `title` | `String` | `NOT NULL` | Notification header |
| `message` | `String` | `NOT NULL` | Detail description |
| `readAt` | `DateTime` | `NULLABLE` | Timestamp when read by user |
| `createdAt` | `DateTime` | `DEFAULT NOW()` | Generation timestamp |

**Indexes**:
- `@@index([userId, readAt])`

---

### 4.8 Table: `AiInsight`
Persists verified financial insights generated for user dashboard.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `PRIMARY KEY` | Record ID |
| `userId` | `String` | `FK -> User.id (CASCADE)` | Target user ID |
| `type` | `String` | `DEFAULT 'spending_summary'`| Insight category |
| `content` | `String` | `NOT NULL` | Explanation text |
| `metadata` | `String` | `NULLABLE` | JSON stringified contextual metrics |
| `createdAt` | `DateTime` | `DEFAULT NOW()` | Creation timestamp |

**Indexes**:
- `@@index([userId, createdAt])`

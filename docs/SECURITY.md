# SmartSpend — Security, Privacy, and Authorization Specification

## 1. Security Architecture Principles

Financial applications manage highly confidential user data. SmartSpend enforces zero-trust architecture at every boundary:

1. **Client Identity Principle**: The client can never assert or supply its own `userId`. Identity is derived solely from a cryptographically signed, unexpired JWT verified on the server.
2. **Strict Ownership Invariant**: Every database operation (select, insert, update, delete) must explicitly constrain queries by `userId`.
3. **No Credential Exposure**: Passwords, refresh tokens, and AI API keys are never stored in plaintext or logged.
4. **Defense in Depth**: Layered validation across network (TLS, Helmet, CORS), transport (JWT, Rate Limiting), application (Zod schemas), and persistence (PostgreSQL constraints).

---

## 2. Authentication & Session Security

### 2.1 Password Hashing
- Algorithm: **Bcrypt with 12 salt rounds** (or Argon2id where supported).
- Work factor ensures resilience against GPU brute-force cracking while maintaining low latency (<150ms) for login operations.
- Minimum password requirements: 8 characters, requiring alphanumeric characters.

### 2.2 Dual-Token Architecture & Rotation
```
Client                          Backend                         Database
  |                                |                               |
  |--- POST /auth/login ---------->|                               |
  |<-- { accessJWT, refreshJWT } --| (Store hashed token family) ->|
  |                                |                               |
  |--- GET /transactions --------->| (Verify accessJWT in memory)  |
  |<-- 200 OK ---------------------|                               |
  |                                |                               |
  | (15 mins later - token expired)|                               |
  |--- POST /auth/refresh -------->| (Check hash in DB)            |
  |    with refreshJWT             | (Rotate: invalidate old token)|
  |<-- { newAccess, newRefresh } --| (Save new token in family) -->|
```

1. **Short-Lived Access Token**:
   - Lifetime: **15 minutes**.
   - Contains: `{ userId, email, exp, iat }`.
   - Verified statelessly in memory using HMAC SHA-256 (`JWT_ACCESS_SECRET`).
2. **Refresh Token Family & Intrusion Detection**:
   - Lifetime: **7 days**.
   - The database stores **only a cryptographic SHA-256 hash** of the refresh token.
   - **Reuse Detection**: If a revoked refresh token is presented, the backend assumes a replay attack, immediately revokes the **entire token family**, and invalidates all active sessions for that user.

---

## 3. Multi-Tenant Authorization & Cross-User Data Isolation

### 3.1 Strict Authorization Invariant
Any attempt to access or modify a resource belonging to another user must fail with a strict `404 Not Found` or `403 Forbidden` response.

```typescript
// SECURE PATTERN ENFORCED ACROSS ALL REPOSITORIES
async findById(userId: string, transactionId: string) {
  return prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId: userId // ENFORCED TENANT BOUNDARY
    }
  });
}
```

### 3.2 Automated Cross-User Boundary Testing
Automated integration tests explicitly create User A and User B:
- User B attempts to `GET /api/v1/transactions/:userA_txnId` -> must return `404 Not Found`.
- User B attempts to `DELETE /api/v1/budgets/:userA_budgetId` -> must return `404 Not Found`.
- User B attempts to fetch AI insights -> receives only User B metrics.

---

## 4. Input Validation & Injection Protections

### 4.1 SQL & NoSQL Injection Defenses
- All database interactions use Prisma ORM's parameterized query builder.
- Raw SQL queries (`$queryRaw`) are restricted to parameter-less system probes (`SELECT 1`).

### 4.2 API Request Sanitization
- Every HTTP route is gated behind a Zod schema validation middleware.
- String fields are trimmed, normalized, and length-constrained.
- Monetary inputs are validated as non-negative integer paise.

### 4.3 AI Prompt Injection Defenses
1. **Context Redaction**: User notes or descriptions are treated as untrusted data and strictly bounded inside clear data delimiters.
2. **Explicit Instruction Boundaries**: System prompts instruct the LLM to ignore user instructions that attempt to override system rules, reveal API keys, or compute balances.
3. **Structured Response Enforcement**: The LLM output is parsed against a strict Zod contract; any prompt attempt to output arbitrary executable code or markdown scripts is discarded.

---

## 5. Mobile Device Security & Storage

### 5.1 Sensitive Credential Storage
- On Android, `accessToken` and `refreshToken` are stored in **Android Keystore-backed `expo-secure-store`**.
- Non-sensitive UI flags (e.g., active tab, theme preference) are stored in `AsyncStorage`.
- No financial figures, cached ledgers, or credentials are left unencrypted in shared storage.

### 5.2 Network Security Configuration
- Production builds enforce TLS 1.3 with certificate validation.
- Cleartext HTTP traffic is disabled in production Android manifests.

---

## 6. Privacy & Data Governance (GDPR / DPDP Compliance)

1. **Right to Access & Data Portability**: Users can trigger `GET /api/v1/account/export` to receive a complete, portable JSON/CSV archive of all their transactions, categories, budgets, and recurring rules.
2. **Right to Erasure (Account Deletion)**: Calling `DELETE /api/v1/account` triggers a database transaction that deletes the user record and cascades deletions across all linked transactions, tokens, budgets, notifications, and AI insights.
3. **Audit Logging & Redaction**: Structured server logs redact Authorization headers, passwords, and sensitive banking metadata.

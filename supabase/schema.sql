-- ==============================================================================
-- SmartSpend Supabase Schema & Initial Setup
-- Compatible with Prisma ORM & Supabase PostgreSQL Database
-- ==============================================================================

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. User Table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- 2. Refresh Token Table (Rotational JWT Refresh Tokens)
CREATE TABLE IF NOT EXISTS "RefreshToken" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "hashedToken" TEXT NOT NULL UNIQUE,
    "family" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX IF NOT EXISTS "RefreshToken_family_idx" ON "RefreshToken"("family");

-- 3. Category Table (System Defaults + User Custom Categories)
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'receipt',
    "color" TEXT NOT NULL DEFAULT '#555e74',
    "type" TEXT NOT NULL DEFAULT 'expense',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Category_userId_idx" ON "Category"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_userId_name_type_key" ON "Category"("userId", "name", "type");

-- 4. Recurring Rule Table (Subscriptions & Recurring Bills)
CREATE TABLE IF NOT EXISTS "RecurringRule" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "amount" INTEGER NOT NULL, -- Stored in paise (integer minor units, e.g. 64900 = ₹649.00)
    "categoryId" TEXT NOT NULL REFERENCES "Category"("id") ON DELETE RESTRICT,
    "frequency" TEXT NOT NULL DEFAULT 'monthly', -- 'daily' | 'weekly' | 'monthly' | 'yearly'
    "interval" INTEGER NOT NULL DEFAULT 1,
    "nextDueDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "RecurringRule_userId_isActive_nextDueDate_idx" ON "RecurringRule"("userId", "isActive", "nextDueDate");

-- 5. Transaction Table (Core Ledger)
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL DEFAULT 'expense', -- 'expense' | 'income'
    "amount" INTEGER NOT NULL, -- Stored in paise (e.g. 45000 = ₹450.00)
    "categoryId" TEXT NOT NULL REFERENCES "Category"("id") ON DELETE RESTRICT,
    "title" TEXT NOT NULL,
    "merchant" TEXT,
    "note" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT NOT NULL DEFAULT 'UPI', -- 'UPI' | 'Cash' | 'Debit Card' | 'Credit Card' | 'Net Banking'
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringRuleId" TEXT REFERENCES "RecurringRule"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Transaction_userId_transactionDate_idx" ON "Transaction"("userId", "transactionDate");
CREATE INDEX IF NOT EXISTS "Transaction_userId_categoryId_idx" ON "Transaction"("userId", "categoryId");
CREATE INDEX IF NOT EXISTS "Transaction_userId_type_idx" ON "Transaction"("userId", "type");

-- 6. Budget Table (Monthly and Category-level Spending Limits)
CREATE TABLE IF NOT EXISTS "Budget" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "amountLimit" INTEGER NOT NULL, -- Stored in paise (e.g. 4500000 = ₹45,000.00)
    "period" TEXT NOT NULL DEFAULT 'monthly',
    "categoryId" TEXT REFERENCES "Category"("id") ON DELETE SET NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Budget_userId_startDate_endDate_idx" ON "Budget"("userId", "startDate", "endDate");

-- 7. Notification Table
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- 8. AI Insight Table
CREATE TABLE IF NOT EXISTS "AiInsight" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL DEFAULT 'spending_summary',
    "content" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AiInsight_userId_createdAt_idx" ON "AiInsight"("userId", "createdAt");

-- 9. Default System Category Seeds
INSERT INTO "Category" ("id", "userId", "name", "icon", "color", "type", "isDefault")
VALUES
    ('cat_food', NULL, 'Food & Dining', 'utensils', '#F59E0B', 'expense', true),
    ('cat_groceries', NULL, 'Groceries', 'shopping-cart', '#10B981', 'expense', true),
    ('cat_transport', NULL, 'Transport', 'car', '#3B82F6', 'expense', true),
    ('cat_shopping', NULL, 'Shopping', 'shopping-bag', '#EC4899', 'expense', true),
    ('cat_bills', NULL, 'Bills & Utilities', 'zap', '#8B5CF6', 'expense', true),
    ('cat_entertainment', NULL, 'Entertainment', 'film', '#F43F5E', 'expense', true),
    ('cat_health', NULL, 'Health & Fitness', 'heart', '#06B6D4', 'expense', true),
    ('cat_education', NULL, 'Education', 'book', '#6366F1', 'expense', true),
    ('cat_salary', NULL, 'Salary', 'briefcase', '#22C55E', 'income', true),
    ('cat_freelance', NULL, 'Freelance', 'laptop', '#14B8A6', 'income', true),
    ('cat_investments', NULL, 'Investments', 'trending-up', '#84CC16', 'income', true)
ON CONFLICT ("id") DO NOTHING;

-- 10. Enable Row Level Security (RLS) & Policies (Supabase Security Best Practice)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Budget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecurringRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AiInsight" ENABLE ROW LEVEL SECURITY;

-- Allow public read on default system categories
DROP POLICY IF EXISTS "Allow public read on default categories" ON "Category";
CREATE POLICY "Allow public read on default categories"
ON "Category"
FOR SELECT
USING ("isDefault" = true);

-- Service role access for private backend tables (blocks anonymous internet queries)
CREATE POLICY "Service role access on User" ON "User" FOR ALL TO service_role USING (true);
CREATE POLICY "Service role access on RefreshToken" ON "RefreshToken" FOR ALL TO service_role USING (true);
CREATE POLICY "Service role access on Transaction" ON "Transaction" FOR ALL TO service_role USING (true);
CREATE POLICY "Service role access on Budget" ON "Budget" FOR ALL TO service_role USING (true);
CREATE POLICY "Service role access on RecurringRule" ON "RecurringRule" FOR ALL TO service_role USING (true);
CREATE POLICY "Service role access on Notification" ON "Notification" FOR ALL TO service_role USING (true);
CREATE POLICY "Service role access on AiInsight" ON "AiInsight" FOR ALL TO service_role USING (true);


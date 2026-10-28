-- ==============================================================================
-- SmartSpend — Row Level Security (RLS) & Policies
-- Resolves Supabase Linter: 0013_rls_disabled_in_public & 0008_rls_enabled_no_policy
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Budget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecurringRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AiInsight" ENABLE ROW LEVEL SECURITY;

-- 2. Category Policies: Public can read system default categories
DROP POLICY IF EXISTS "Allow public read on default categories" ON "Category";
CREATE POLICY "Allow public read on default categories"
ON "Category"
FOR SELECT
USING ("isDefault" = true);

-- 3. Service Role Policies for Private Tables (Resolves 'RLS Enabled No Policy' INFO)
-- Grants explicit access to service_role while keeping public/anon access completely blocked

DROP POLICY IF EXISTS "Service role access on User" ON "User";
CREATE POLICY "Service role access on User" ON "User" FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role access on RefreshToken" ON "RefreshToken";
CREATE POLICY "Service role access on RefreshToken" ON "RefreshToken" FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role access on Transaction" ON "Transaction";
CREATE POLICY "Service role access on Transaction" ON "Transaction" FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role access on Budget" ON "Budget";
CREATE POLICY "Service role access on Budget" ON "Budget" FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role access on RecurringRule" ON "RecurringRule";
CREATE POLICY "Service role access on RecurringRule" ON "RecurringRule" FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role access on Notification" ON "Notification";
CREATE POLICY "Service role access on Notification" ON "Notification" FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role access on AiInsight" ON "AiInsight";
CREATE POLICY "Service role access on AiInsight" ON "AiInsight" FOR ALL TO service_role USING (true);

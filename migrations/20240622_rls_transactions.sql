/*
  Migration: Enable Row Level Security on transactions and define policies
*/

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy: admin can SELECT/INSERT/UPDATE/DELETE any row
CREATE POLICY "admin_full_access" ON public.transactions
    FOR ALL
    TO public
    USING (auth.role() = 'admin');

-- Policy: financial can SELECT and INSERT rows, and UPDATE ONLY their own rows (owner_id)
CREATE POLICY "financial_access" ON public.transactions
    FOR SELECT, INSERT, UPDATE
    TO public
    USING (
        auth.role() = 'financial' AND (
            (SELECT (owner_id = auth.uid()))
        )
    WITH CHECK (
        auth.role() = 'financial' AND (
            (INSERTING AND (owner_id = auth.uid())) OR
            (UPDATING AND (owner_id = auth.uid()))
        )
    );

-- Policy: members can SELECT rows they own
CREATE POLICY "member_select" ON public.transactions
    FOR SELECT
    TO public
    USING (auth.role() = 'member' AND owner_id = auth.uid());

-- Ensure default deny
ALTER TABLE public.transactions FORCE ROW LEVEL SECURITY;

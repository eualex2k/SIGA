/*
  Migration: add receipt_path column to finance_transactions table
*/

ALTER TABLE public.finance_transactions
  ADD COLUMN receipt_path TEXT;

-- Enable RLS if not already enabled (already done in other migration)
-- Policy to allow owner or admin to read the receipt_path
CREATE POLICY receipt_access ON public.finance_transactions
  FOR SELECT USING (auth.role() = 'admin' OR user_id = auth.uid());

/* Ensure default deny */
ALTER TABLE public.finance_transactions FORCE ROW LEVEL SECURITY;

/*
  Migration: audit_logs table – only INSERT allowed, no UPDATE/DELETE
*/

-- Ensure audit_logs exists (if not already created by other migrations)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action text NOT NULL,
  user_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: admin can SELECT all rows
CREATE POLICY "admin_select" ON public.audit_logs
    FOR SELECT
    TO public
    USING (auth.role() = 'admin');

-- Policy: users can INSERT their own logs (any role)
CREATE POLICY "user_insert" ON public.audit_logs
    FOR INSERT
    TO public
    WITH CHECK (true);

-- No UPDATE or DELETE policies – they are denied by default

-- Force RLS
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

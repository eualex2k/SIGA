/*
  Migration: Enable Row Level Security on members and define policies
*/

-- Enable RLS on members
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Policy: admin can SELECT/INSERT/UPDATE/DELETE any member
CREATE POLICY "admin_full_access" ON public.members
    FOR ALL
    TO public
    USING (auth.role() = 'admin');

-- Policy: member can SELECT/UPDATE only their own record (user_id column)
CREATE POLICY "member_self" ON public.members
    FOR SELECT, UPDATE
    TO public
    USING (auth.role() = 'member' AND user_id = auth.uid())
    WITH CHECK (auth.role() = 'member' AND user_id = auth.uid());

-- Force RLS
ALTER TABLE public.members FORCE ROW LEVEL SECURITY;

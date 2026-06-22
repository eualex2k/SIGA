create table public.membership_payments (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid references public.members(id) not null,
  amount numeric not null,
  payment_date date not null,
  receipt_path text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
ALTER TABLE public.membership_payments ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "admin_full" ON public.membership_payments
  FOR ALL
  TO public
  USING (auth.role() = 'admin');

-- Financial can insert and view own member payments
CREATE POLICY "financial_access" ON public.membership_payments
  FOR SELECT, INSERT
  TO public
  USING (auth.role() = 'financial');

-- Members can view their own payments
CREATE POLICY "member_view" ON public.membership_payments
  FOR SELECT
  TO public
  USING (auth.role() = 'member' AND member_id = auth.uid());

ALTER TABLE public.membership_payments FORCE ROW LEVEL SECURITY;

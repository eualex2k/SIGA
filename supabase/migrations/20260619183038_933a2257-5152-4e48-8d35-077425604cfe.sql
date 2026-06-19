
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin','manager','member');
CREATE TYPE public.associate_status AS ENUM ('active','inactive','suspended');
CREATE TYPE public.fee_status AS ENUM ('pending','paid','overdue','cancelled');
CREATE TYPE public.transaction_type AS ENUM ('income','expense');
CREATE TYPE public.movement_type AS ENUM ('in','out');
CREATE TYPE public.shift_status AS ENUM ('scheduled','completed','missed','cancelled');

-- ============ UTIL: updated_at ============
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles_admin_manage" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ AUTO PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member') ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ ASSOCIATES ============
CREATE TABLE public.associates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  cpf text UNIQUE,
  rg text,
  phone text,
  email text,
  address text,
  city text DEFAULT 'Uiraúna',
  state text DEFAULT 'PB',
  birth_date date,
  join_date date NOT NULL DEFAULT current_date,
  status public.associate_status NOT NULL DEFAULT 'active',
  monthly_fee numeric(10,2) NOT NULL DEFAULT 50.00,
  photo_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.associates TO authenticated;
GRANT ALL ON public.associates TO service_role;
ALTER TABLE public.associates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "associates_all_authenticated" ON public.associates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_associates_updated BEFORE UPDATE ON public.associates FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX idx_associates_status ON public.associates(status);
CREATE INDEX idx_associates_name ON public.associates(full_name);

-- ============ MONTHLY FEES ============
CREATE TABLE public.monthly_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  associate_id uuid NOT NULL REFERENCES public.associates(id) ON DELETE CASCADE,
  reference_month date NOT NULL,
  amount numeric(10,2) NOT NULL,
  due_date date NOT NULL,
  paid_date date,
  status public.fee_status NOT NULL DEFAULT 'pending',
  payment_method text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(associate_id, reference_month)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_fees TO authenticated;
GRANT ALL ON public.monthly_fees TO service_role;
ALTER TABLE public.monthly_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fees_all_authenticated" ON public.monthly_fees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_fees_updated BEFORE UPDATE ON public.monthly_fees FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX idx_fees_associate ON public.monthly_fees(associate_id);
CREATE INDEX idx_fees_status ON public.monthly_fees(status);
CREATE INDEX idx_fees_due ON public.monthly_fees(due_date);

-- ============ FINANCE CATEGORIES ============
CREATE TABLE public.finance_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type public.transaction_type NOT NULL,
  color text DEFAULT '#dc2626',
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_categories TO authenticated;
GRANT ALL ON public.finance_categories TO service_role;
ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fincat_all_authenticated" ON public.finance_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ FINANCE TRANSACTIONS ============
CREATE TABLE public.finance_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.transaction_type NOT NULL,
  amount numeric(10,2) NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES public.finance_categories(id) ON DELETE SET NULL,
  transaction_date date NOT NULL DEFAULT current_date,
  associate_id uuid REFERENCES public.associates(id) ON DELETE SET NULL,
  fee_id uuid REFERENCES public.monthly_fees(id) ON DELETE SET NULL,
  payment_method text,
  reference text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_transactions TO authenticated;
GRANT ALL ON public.finance_transactions TO service_role;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fintx_all_authenticated" ON public.finance_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_fintx_date ON public.finance_transactions(transaction_date DESC);
CREATE INDEX idx_fintx_type ON public.finance_transactions(type);

-- ============ INVENTORY ITEMS ============
CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  unit text DEFAULT 'un',
  quantity int NOT NULL DEFAULT 0,
  min_quantity int NOT NULL DEFAULT 5,
  unit_cost numeric(10,2),
  location text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_items TO authenticated;
GRANT ALL ON public.inventory_items TO service_role;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv_all_authenticated" ON public.inventory_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_inv_updated BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ INVENTORY MOVEMENTS ============
CREATE TABLE public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  type public.movement_type NOT NULL,
  quantity int NOT NULL CHECK (quantity > 0),
  reason text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_movements TO authenticated;
GRANT ALL ON public.inventory_movements TO service_role;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invmov_all_authenticated" ON public.inventory_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger to update inventory quantity on movement
CREATE OR REPLACE FUNCTION public.tg_inv_apply_movement()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.type = 'in' THEN
    UPDATE public.inventory_items SET quantity = quantity + NEW.quantity WHERE id = NEW.item_id;
  ELSE
    UPDATE public.inventory_items SET quantity = GREATEST(0, quantity - NEW.quantity) WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_inv_movement AFTER INSERT ON public.inventory_movements FOR EACH ROW EXECUTE FUNCTION public.tg_inv_apply_movement();

-- ============ STAFF (colaboradores) ============
CREATE TABLE public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  cpf text UNIQUE,
  phone text,
  email text,
  role_title text,
  hourly_rate numeric(10,2) NOT NULL DEFAULT 0,
  hire_date date NOT NULL DEFAULT current_date,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff TO authenticated;
GRANT ALL ON public.staff TO service_role;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_all_authenticated" ON public.staff FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_staff_updated BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ SHIFTS ============
CREATE TABLE public.shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  shift_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  hours numeric(5,2),
  location text,
  status public.shift_status NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shifts TO authenticated;
GRANT ALL ON public.shifts TO service_role;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shifts_all_authenticated" ON public.shifts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_shifts_date ON public.shifts(shift_date);
CREATE INDEX idx_shifts_staff ON public.shifts(staff_id);

-- ============ STAFF PAYMENTS ============
CREATE TABLE public.staff_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  reference_month date NOT NULL,
  amount numeric(10,2) NOT NULL,
  paid_date date,
  hours_worked numeric(6,2),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_payments TO authenticated;
GRANT ALL ON public.staff_payments TO service_role;
ALTER TABLE public.staff_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "spay_all_authenticated" ON public.staff_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ AUDIT LOGS ============
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_select_admin" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR user_id = auth.uid());
CREATE POLICY "audit_insert_own" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ SEED: default finance categories ============
INSERT INTO public.finance_categories (name, type, color, icon) VALUES
  ('Mensalidades','income','#16a34a','wallet'),
  ('Doações','income','#0ea5e9','heart'),
  ('Eventos','income','#f59e0b','calendar'),
  ('Outros (receita)','income','#64748b','plus'),
  ('Equipamentos','expense','#dc2626','wrench'),
  ('Uniformes','expense','#ea580c','shirt'),
  ('Combustível','expense','#a16207','fuel'),
  ('Manutenção','expense','#7c3aed','tool'),
  ('Pagamento de Pessoal','expense','#be123c','users'),
  ('Outros (despesa)','expense','#475569','minus');

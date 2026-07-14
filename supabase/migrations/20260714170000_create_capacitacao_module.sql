-- ==========================================
-- CENTRO DE CAPACITAÇÃO ABCUNA
-- MÓDULO DE TREINAMENTOS
-- ==========================================


-- ============ ENUMS ============

CREATE TYPE public.course_status AS ENUM (
  'draft',
  'active',
  'inactive'
);

CREATE TYPE public.class_status AS ENUM (
  'planning',
  'open',
  'running',
  'finished',
  'cancelled'
);

CREATE TYPE public.enrollment_status AS ENUM (
  'pending',
  'confirmed',
  'completed',
  'cancelled'
);

CREATE TYPE public.certificate_status AS ENUM (
  'pending',
  'issued',
  'cancelled'
);


-- ============ COURSE CATEGORIES ============

CREATE TABLE public.course_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


GRANT SELECT, INSERT, UPDATE, DELETE 
ON public.course_categories 
TO authenticated;

GRANT ALL 
ON public.course_categories 
TO service_role;


ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;


CREATE POLICY "course_categories_all_authenticated"
ON public.course_categories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


CREATE TRIGGER trg_course_categories_updated
BEFORE UPDATE ON public.course_categories
FOR EACH ROW
EXECUTE FUNCTION public.tg_set_updated_at();



-- ============ COURSES ============

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  category_id uuid REFERENCES public.course_categories(id)
  ON DELETE SET NULL,

  name text NOT NULL,

  description text,

  workload_hours integer NOT NULL DEFAULT 0,

  price numeric(10,2) NOT NULL DEFAULT 0,

  status public.course_status NOT NULL DEFAULT 'draft',

  created_at timestamptz NOT NULL DEFAULT now(),

  updated_at timestamptz NOT NULL DEFAULT now()
);


GRANT SELECT, INSERT, UPDATE, DELETE
ON public.courses
TO authenticated;


GRANT ALL
ON public.courses
TO service_role;


ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;


CREATE POLICY "courses_all_authenticated"
ON public.courses
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);



CREATE TRIGGER trg_courses_updated
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.tg_set_updated_at();



CREATE INDEX idx_courses_category
ON public.courses(category_id);


CREATE INDEX idx_courses_status
ON public.courses(status);
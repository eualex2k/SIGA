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


-- ============ INSTRUCTORS ============

CREATE TABLE public.instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  full_name text NOT NULL,

  cpf text UNIQUE,

  phone text,

  email text,

  specialty text,

  bio text,

  photo_url text,

  active boolean NOT NULL DEFAULT true,

  created_at timestamptz NOT NULL DEFAULT now(),

  updated_at timestamptz NOT NULL DEFAULT now()
);


GRANT SELECT, INSERT, UPDATE, DELETE
ON public.instructors
TO authenticated;

GRANT ALL
ON public.instructors
TO service_role;


ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;


CREATE POLICY "instructors_all_authenticated"
ON public.instructors
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);



CREATE TRIGGER trg_instructors_updated
BEFORE UPDATE ON public.instructors
FOR EACH ROW
EXECUTE FUNCTION public.tg_set_updated_at();



CREATE INDEX idx_instructors_name
ON public.instructors(full_name);



-- ============ INSTRUCTOR COURSES ============

CREATE TABLE public.instructor_courses (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  instructor_id uuid NOT NULL
  REFERENCES public.instructors(id)
  ON DELETE CASCADE,

  course_id uuid NOT NULL
  REFERENCES public.courses(id)
  ON DELETE CASCADE,

  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(instructor_id, course_id)
);


GRANT SELECT, INSERT, UPDATE, DELETE
ON public.instructor_courses
TO authenticated;

GRANT ALL
ON public.instructor_courses
TO service_role;


ALTER TABLE public.instructor_courses ENABLE ROW LEVEL SECURITY;


CREATE POLICY "instructor_courses_all_authenticated"
ON public.instructor_courses
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);



-- ============ TECHNICAL SUPERVISORS ============

CREATE TABLE public.technical_supervisors (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  full_name text NOT NULL,

  registration text,

  council text,

  phone text,

  email text,

  specialty text,

  active boolean NOT NULL DEFAULT true,

  created_at timestamptz NOT NULL DEFAULT now(),

  updated_at timestamptz NOT NULL DEFAULT now()
);



GRANT SELECT, INSERT, UPDATE, DELETE
ON public.technical_supervisors
TO authenticated;

GRANT ALL
ON public.technical_supervisors
TO service_role;


ALTER TABLE public.technical_supervisors ENABLE ROW LEVEL SECURITY;


CREATE POLICY "technical_supervisors_all_authenticated"
ON public.technical_supervisors
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);



CREATE TRIGGER trg_technical_supervisors_updated
BEFORE UPDATE ON public.technical_supervisors
FOR EACH ROW
EXECUTE FUNCTION public.tg_set_updated_at();



-- ============ CLASS GROUPS ============

CREATE TABLE public.class_groups (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  course_id uuid NOT NULL
  REFERENCES public.courses(id)
  ON DELETE CASCADE,


  technical_supervisor_id uuid
  REFERENCES public.technical_supervisors(id)
  ON DELETE SET NULL,


  name text NOT NULL,


  start_date date,

  end_date date,


  location text,


  vacancies integer DEFAULT 0,


  status public.class_status NOT NULL DEFAULT 'planning',


  created_at timestamptz NOT NULL DEFAULT now(),

  updated_at timestamptz NOT NULL DEFAULT now()
);



GRANT SELECT, INSERT, UPDATE, DELETE
ON public.class_groups
TO authenticated;

GRANT ALL
ON public.class_groups
TO service_role;



ALTER TABLE public.class_groups ENABLE ROW LEVEL SECURITY;


CREATE POLICY "class_groups_all_authenticated"
ON public.class_groups
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);



CREATE TRIGGER trg_class_groups_updated
BEFORE UPDATE ON public.class_groups
FOR EACH ROW
EXECUTE FUNCTION public.tg_set_updated_at();



CREATE INDEX idx_class_groups_course
ON public.class_groups(course_id);


CREATE INDEX idx_class_groups_status
ON public.class_groups(status);



-- ============ CLASS INSTRUCTORS ============

CREATE TABLE public.class_instructors (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),


  class_id uuid NOT NULL
  REFERENCES public.class_groups(id)
  ON DELETE CASCADE,


  instructor_id uuid NOT NULL
  REFERENCES public.instructors(id)
  ON DELETE CASCADE,


  created_at timestamptz NOT NULL DEFAULT now(),


  UNIQUE(class_id, instructor_id)

);



GRANT SELECT, INSERT, UPDATE, DELETE
ON public.class_instructors
TO authenticated;


GRANT ALL
ON public.class_instructors
TO service_role;



ALTER TABLE public.class_instructors ENABLE ROW LEVEL SECURITY;



CREATE POLICY "class_instructors_all_authenticated"
ON public.class_instructors
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
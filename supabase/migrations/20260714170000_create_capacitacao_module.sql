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

-- ============ STUDENTS ============

CREATE TABLE public.students (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  associate_id uuid
  REFERENCES public.associates(id)
  ON DELETE SET NULL,

  full_name text NOT NULL,

  cpf text UNIQUE,

  rg text,

  birth_date date,

  phone text,

  email text,

  address text,

  city text DEFAULT 'Uiraúna',

  state text DEFAULT 'PB',

  source text,

  photo_url text,

  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),

  updated_at timestamptz NOT NULL DEFAULT now()

);


GRANT SELECT, INSERT, UPDATE, DELETE
ON public.students
TO authenticated;


GRANT ALL
ON public.students
TO service_role;


ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;


CREATE POLICY "students_all_authenticated"
ON public.students
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);



CREATE TRIGGER trg_students_updated
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.tg_set_updated_at();



CREATE INDEX idx_students_name
ON public.students(full_name);


CREATE INDEX idx_students_cpf
ON public.students(cpf);



-- ============ ENROLLMENTS ============

CREATE TABLE public.enrollments (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),


  student_id uuid NOT NULL
  REFERENCES public.students(id)
  ON DELETE CASCADE,


  class_id uuid NOT NULL
  REFERENCES public.class_groups(id)
  ON DELETE CASCADE,


  enrollment_date date NOT NULL DEFAULT current_date,


  status public.enrollment_status NOT NULL DEFAULT 'pending',


  final_grade numeric(5,2),


  notes text,


  created_at timestamptz NOT NULL DEFAULT now(),


  updated_at timestamptz NOT NULL DEFAULT now(),


  UNIQUE(student_id, class_id)

);



GRANT SELECT, INSERT, UPDATE, DELETE
ON public.enrollments
TO authenticated;


GRANT ALL
ON public.enrollments
TO service_role;



ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;



CREATE POLICY "enrollments_all_authenticated"
ON public.enrollments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);



CREATE TRIGGER trg_enrollments_updated
BEFORE UPDATE ON public.enrollments
FOR EACH ROW
EXECUTE FUNCTION public.tg_set_updated_at();



CREATE INDEX idx_enrollments_student
ON public.enrollments(student_id);


CREATE INDEX idx_enrollments_class
ON public.enrollments(class_id);



-- ============ ATTENDANCE RECORDS ============

CREATE TABLE public.attendance_records (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),


  enrollment_id uuid NOT NULL
  REFERENCES public.enrollments(id)
  ON DELETE CASCADE,


  attendance_date date NOT NULL,


  present boolean NOT NULL DEFAULT false,


  observation text,


  created_at timestamptz NOT NULL DEFAULT now()

);



GRANT SELECT, INSERT, UPDATE, DELETE
ON public.attendance_records
TO authenticated;


GRANT ALL
ON public.attendance_records
TO service_role;



ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;



CREATE POLICY "attendance_all_authenticated"
ON public.attendance_records
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);



CREATE INDEX idx_attendance_enrollment
ON public.attendance_records(enrollment_id);



-- ============ ASSESSMENTS ============

CREATE TABLE public.assessments (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),


  enrollment_id uuid NOT NULL
  REFERENCES public.enrollments(id)
  ON DELETE CASCADE,


  grade numeric(5,2),


  passed boolean DEFAULT false,


  comments text,


  created_at timestamptz NOT NULL DEFAULT now(),


  updated_at timestamptz NOT NULL DEFAULT now(),


  UNIQUE(enrollment_id)

);



GRANT SELECT, INSERT, UPDATE, DELETE
ON public.assessments
TO authenticated;


GRANT ALL
ON public.assessments
TO service_role;



ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;



CREATE POLICY "assessments_all_authenticated"
ON public.assessments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);



CREATE TRIGGER trg_assessments_updated
BEFORE UPDATE ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION public.tg_set_updated_at();


-- ============ CERTIFICATES ============

CREATE TABLE public.certificates (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),


  enrollment_id uuid NOT NULL
  REFERENCES public.enrollments(id)
  ON DELETE CASCADE,


  certificate_code text NOT NULL UNIQUE,

  verification_hash text UNIQUE,

  issue_date date NOT NULL DEFAULT current_date,


  status public.certificate_status NOT NULL DEFAULT 'pending',


  certificate_url text,


  created_at timestamptz NOT NULL DEFAULT now(),


  updated_at timestamptz NOT NULL DEFAULT now()


);



GRANT SELECT, INSERT, UPDATE, DELETE
ON public.certificates
TO authenticated;


GRANT ALL
ON public.certificates
TO service_role;



ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;



CREATE POLICY "certificates_all_authenticated"
ON public.certificates
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);



CREATE TRIGGER trg_certificates_updated
BEFORE UPDATE ON public.certificates
FOR EACH ROW
EXECUTE FUNCTION public.tg_set_updated_at();



CREATE INDEX idx_certificates_code
ON public.certificates(certificate_code);



-- ============ STUDENT CARDS ============

CREATE TABLE public.student_cards (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),


  student_id uuid NOT NULL
  REFERENCES public.students(id)
  ON DELETE CASCADE,


  card_number text UNIQUE,


  issue_date date NOT NULL DEFAULT current_date,


  expiration_date date,


  qr_code text,


  active boolean NOT NULL DEFAULT true,


  created_at timestamptz NOT NULL DEFAULT now(),


  updated_at timestamptz NOT NULL DEFAULT now()


);



GRANT SELECT, INSERT, UPDATE, DELETE
ON public.student_cards
TO authenticated;


GRANT ALL
ON public.student_cards
TO service_role;



ALTER TABLE public.student_cards ENABLE ROW LEVEL SECURITY;



CREATE POLICY "student_cards_all_authenticated"
ON public.student_cards
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);



CREATE TRIGGER trg_student_cards_updated
BEFORE UPDATE ON public.student_cards
FOR EACH ROW
EXECUTE FUNCTION public.tg_set_updated_at();



CREATE INDEX idx_student_cards_number
ON public.student_cards(card_number);



-- ============ COURSE PAYMENTS ============

CREATE TABLE public.course_payments (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),


  enrollment_id uuid NOT NULL
  REFERENCES public.enrollments(id)
  ON DELETE CASCADE,


  amount numeric(10,2) NOT NULL,


  payment_date date DEFAULT current_date,


  payment_method text,


  status text DEFAULT 'pending',


  reference text,


  notes text,


  created_at timestamptz NOT NULL DEFAULT now()


);



GRANT SELECT, INSERT, UPDATE, DELETE
ON public.course_payments
TO authenticated;


GRANT ALL
ON public.course_payments
TO service_role;



ALTER TABLE public.course_payments ENABLE ROW LEVEL SECURITY;



CREATE POLICY "course_payments_all_authenticated"
ON public.course_payments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);



CREATE INDEX idx_course_payments_enrollment
ON public.course_payments(enrollment_id);



-- ============ COURSE FILES ============

CREATE TABLE public.course_files (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),


  course_id uuid
  REFERENCES public.courses(id)
  ON DELETE CASCADE,


  class_id uuid
  REFERENCES public.class_groups(id)
  ON DELETE CASCADE,


  name text NOT NULL,


  file_type text,


  file_url text NOT NULL,


  description text,


  created_at timestamptz NOT NULL DEFAULT now()

);



GRANT SELECT, INSERT, UPDATE, DELETE
ON public.course_files
TO authenticated;


GRANT ALL
ON public.course_files
TO service_role;



ALTER TABLE public.course_files ENABLE ROW LEVEL SECURITY;



CREATE POLICY "course_files_all_authenticated"
ON public.course_files
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);



CREATE INDEX idx_course_files_course
ON public.course_files(course_id);



-- ============ TRAINING DOCUMENTS ============

CREATE TABLE public.training_documents (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),


  name text NOT NULL,


  document_type text,


  file_url text NOT NULL,


  course_id uuid
  REFERENCES public.courses(id)
  ON DELETE SET NULL,


  class_id uuid
  REFERENCES public.class_groups(id)
  ON DELETE SET NULL,


  created_at timestamptz NOT NULL DEFAULT now()


);



GRANT SELECT, INSERT, UPDATE, DELETE
ON public.training_documents
TO authenticated;


GRANT ALL
ON public.training_documents
TO service_role;



ALTER TABLE public.training_documents ENABLE ROW LEVEL SECURITY;



CREATE POLICY "training_documents_all_authenticated"
ON public.training_documents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);



-- ============ CAPACITATION AUDIT LOG ============

CREATE TABLE public.training_audit_logs (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),


  user_id uuid
  REFERENCES auth.users(id)
  ON DELETE SET NULL,


  action text NOT NULL,


  entity text,


  entity_id uuid,


  metadata jsonb,


  created_at timestamptz NOT NULL DEFAULT now()

);



GRANT SELECT, INSERT
ON public.training_audit_logs
TO authenticated;


GRANT ALL
ON public.training_audit_logs
TO service_role;



ALTER TABLE public.training_audit_logs ENABLE ROW LEVEL SECURITY;



CREATE POLICY "training_audit_insert"
ON public.training_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);



CREATE POLICY "training_audit_select"
ON public.training_audit_logs
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(),'admin')
  OR user_id = auth.uid()
);
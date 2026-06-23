-- Migration: add competencies column to associates table
ALTER TABLE public.associates
ADD COLUMN competencies jsonb;

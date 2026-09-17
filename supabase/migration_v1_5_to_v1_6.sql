-- ============================================================
-- MIGRAÇÃO v1.5 -> v1.6
-- Remove o campo de restrição alimentar do RSVP.
-- ============================================================

alter table if exists public.rsvps
  drop column if exists meal_notes;

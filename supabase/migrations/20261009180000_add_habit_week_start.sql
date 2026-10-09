alter table public.habits
  add column if not exists week_starts_on smallint not null default 1
  check (week_starts_on in (0, 1));

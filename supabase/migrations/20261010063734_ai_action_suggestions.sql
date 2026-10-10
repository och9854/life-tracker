alter table public.habits
  add column if not exists source_entry_id uuid references public.journal_entries(id) on delete set null;

create table public.ai_action_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_id uuid not null references public.journal_entries(id) on delete cascade,
  entry_version integer not null check (entry_version > 0),
  suggestions jsonb not null,
  model text not null,
  created_at timestamptz not null default now(),
  unique (user_id, entry_id, entry_version)
);

create index ai_action_suggestions_owner_created
  on public.ai_action_suggestions(user_id, created_at desc);

alter table public.ai_action_suggestions enable row level security;
revoke all on public.ai_action_suggestions from anon, authenticated;

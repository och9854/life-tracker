create table public.action_items (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 300),
  due_date date,
  completed_at timestamptz,
  source_entry_id uuid references public.journal_entries(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index action_items_owner_open on public.action_items(user_id, completed_at, due_date);

create table public.habits (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  weekly_target smallint not null default 1 check (weekly_target between 1 and 7),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.habit_completions (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  completed_on date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_on)
);
create index habit_completions_owner_date on public.habit_completions(user_id, completed_on desc);

alter table public.action_items enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
revoke all on public.action_items, public.habits, public.habit_completions from anon, authenticated;
grant select, insert, update, delete on public.action_items, public.habits, public.habit_completions to authenticated;

create policy "Own action items" on public.action_items for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Own habits" on public.habits for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Own habit completions" on public.habit_completions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

alter table public.habits add column if not exists cadence text not null default 'week' check (cadence in ('week', 'month'));
alter table public.habit_completions add column if not exists count integer not null default 1 check (count > 0);

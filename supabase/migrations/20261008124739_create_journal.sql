create table public.journal_entries (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  entry_date date not null,
  title text not null default '' check (char_length(title) <= 200),
  body text not null default '' check (char_length(body) <= 200000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0)
);

create index journal_entries_owner_date on public.journal_entries(user_id, entry_date desc);
alter table public.journal_entries enable row level security;
revoke all on public.journal_entries from anon, authenticated;
grant select, insert, update on public.journal_entries to authenticated;

create policy "Read own entries" on public.journal_entries for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Create own entries" on public.journal_entries for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Update own entries" on public.journal_entries for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create function public.save_journal_entry(
  p_id uuid, p_date date, p_title text, p_body text, p_version integer
) returns setof public.journal_entries
language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_version = 0 then
    return query insert into public.journal_entries(id, user_id, entry_date, title, body)
      values (p_id, auth.uid(), p_date, p_title, p_body)
      on conflict (id) do nothing returning *;
  else
    return query update public.journal_entries
      set entry_date = p_date, title = p_title, body = p_body,
          updated_at = now(), version = version + 1
      where id = p_id and user_id = auth.uid() and version = p_version
      returning *;
  end if;
  if not found then
    raise exception 'Entry changed elsewhere' using errcode = '40001';
  end if;
end;
$$;

revoke all on function public.save_journal_entry(uuid, date, text, text, integer) from public, anon;
grant execute on function public.save_journal_entry(uuid, date, text, text, integer) to authenticated;

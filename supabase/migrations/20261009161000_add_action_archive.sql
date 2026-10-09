alter table public.action_items add column archived_at timestamptz;
create index action_items_owner_archive on public.action_items(user_id, archived_at, created_at desc);

drop policy if exists "Own action items" on public.action_items;

create policy "Own action items" on public.action_items for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      source_entry_id is null
      or exists (
        select 1
        from public.journal_entries source_entry
        where source_entry.id = action_items.source_entry_id
          and source_entry.user_id = (select auth.uid())
      )
    )
  );

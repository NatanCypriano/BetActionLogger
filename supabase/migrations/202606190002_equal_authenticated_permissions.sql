-- During the personal MVP, operator and manager are labels for navigation only.
-- Every authenticated user receives the same maximum application permissions,
-- while database integrity rules still protect action history and closed cycles.

drop policy if exists "profiles_select_own_or_manager" on public.profiles;
drop policy if exists "profiles_update_own_or_manager" on public.profiles;
drop policy if exists "action_types_select_active_or_manager" on public.action_types;
drop policy if exists "action_types_insert_manager" on public.action_types;
drop policy if exists "action_types_update_manager" on public.action_types;
drop policy if exists "action_entries_select_own_or_manager" on public.action_entries;
drop policy if exists "action_entries_insert_own" on public.action_entries;
drop policy if exists "action_entries_void_own_open" on public.action_entries;
drop policy if exists "settlement_cycles_select_manager" on public.settlement_cycles;
drop policy if exists "settlement_cycles_insert_manager" on public.settlement_cycles;
drop policy if exists "settlement_cycles_update_manager" on public.settlement_cycles;

create or replace function public.protect_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.id <> new.id then
    raise exception 'profile id cannot be changed';
  end if;

  return new;
end;
$$;

create policy "profiles_select_authenticated"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "profiles_insert_authenticated"
  on public.profiles
  for insert
  to authenticated
  with check (true);

create policy "profiles_update_authenticated"
  on public.profiles
  for update
  to authenticated
  using (true)
  with check (true);

create policy "action_types_select_authenticated"
  on public.action_types
  for select
  to authenticated
  using (true);

create policy "action_types_insert_authenticated"
  on public.action_types
  for insert
  to authenticated
  with check (true);

create policy "action_types_update_authenticated"
  on public.action_types
  for update
  to authenticated
  using (true)
  with check (true);

create policy "action_entries_select_authenticated"
  on public.action_entries
  for select
  to authenticated
  using (true);

create policy "action_entries_insert_authenticated"
  on public.action_entries
  for insert
  to authenticated
  with check (actor_id = auth.uid() and status = 'confirmed');

create policy "action_entries_void_authenticated_open"
  on public.action_entries
  for update
  to authenticated
  using (
    status = 'confirmed'
    and not public.action_entry_is_in_closed_cycle(occurred_at)
  )
  with check (
    status = 'voided'
    and void_reason is not null
    and length(btrim(void_reason)) > 0
  );

create policy "settlement_cycles_select_authenticated"
  on public.settlement_cycles
  for select
  to authenticated
  using (true);

create policy "settlement_cycles_insert_authenticated"
  on public.settlement_cycles
  for insert
  to authenticated
  with check (true);

create policy "settlement_cycles_update_authenticated"
  on public.settlement_cycles
  for update
  to authenticated
  using (true)
  with check (true);

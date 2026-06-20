-- A voided entry may be restored or permanently removed while its period remains open.
-- The trigger, rather than the client, remains the source of truth for valid transitions.

alter table public.action_types
  add column has_note_field boolean not null default true;

comment on column public.action_types.has_note_field is
  'Whether the optional note field is displayed when this action type is registered.';

drop policy if exists "action_entries_void_authenticated_open" on public.action_entries;

create policy "action_entries_update_authenticated_open"
  on public.action_entries
  for update
  to authenticated
  using (
    status in ('confirmed', 'voided')
    and not public.action_entry_is_in_closed_cycle(occurred_at)
  )
  with check (
    status in ('confirmed', 'voided')
    and not public.action_entry_is_in_closed_cycle(occurred_at)
  );

create policy "action_entries_delete_voided_authenticated_open"
  on public.action_entries
  for delete
  to authenticated
  using (
    status = 'voided'
    and not public.action_entry_is_in_closed_cycle(occurred_at)
  );

create or replace function public.prepare_action_entry_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_price integer;
  show_note_field boolean;
begin
  if auth.uid() is null then
    raise exception 'authenticated user is required';
  end if;

  select unit_price_cents, has_note_field
    into current_price, show_note_field
  from public.action_types
  where id = new.action_type_id
    and active = true;

  if current_price is null then
    raise exception 'action type is inactive or not found';
  end if;

  new.actor_id = auth.uid();
  new.unit_price_cents_snapshot = current_price;
  new.status = 'confirmed';
  new.voided_at = null;
  new.voided_by = null;
  new.void_reason = null;

  if not show_note_field then
    new.note = null;
  end if;

  return new;
end;
$$;

create or replace function public.protect_action_entry_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if public.action_entry_is_in_closed_cycle(old.occurred_at) then
      raise exception 'action entries in closed cycles are immutable';
    end if;

    if old.status <> 'voided' then
      raise exception 'only voided action entries can be deleted';
    end if;

    return old;
  end if;

  if public.action_entry_is_in_closed_cycle(old.occurred_at) then
    raise exception 'action entries in closed cycles are immutable';
  end if;

  if new.actor_id is distinct from old.actor_id
    or new.action_type_id is distinct from old.action_type_id
    or new.occurred_at is distinct from old.occurred_at
    or new.unit_price_cents_snapshot is distinct from old.unit_price_cents_snapshot
    or new.created_at is distinct from old.created_at
    or new.note is distinct from old.note then
    raise exception 'core action entry fields are immutable';
  end if;

  if old.status = 'confirmed' then
    if new.status <> 'voided' then
      raise exception 'confirmed action entries can only be voided';
    end if;

    if new.void_reason is null or length(btrim(new.void_reason)) = 0 then
      raise exception 'void reason is required';
    end if;

    new.voided_at = now();
    new.voided_by = auth.uid();
    return new;
  end if;

  if old.status = 'voided' then
    if new.status <> 'confirmed' then
      raise exception 'voided action entries can only be restored or deleted';
    end if;

    new.voided_at = null;
    new.voided_by = null;
    new.void_reason = null;
    return new;
  end if;

  raise exception 'unsupported action entry status transition';
end;
$$;

create or replace function public.prepare_settlement_cycle_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  calculated_actions integer;
  calculated_total bigint;
begin
  if tg_op = 'UPDATE' then
    if old.status = 'paid' then
      raise exception 'paid cycles are immutable';
    end if;

    if new.period_start <> old.period_start or new.period_end <> old.period_end then
      raise exception 'settlement cycle periods are immutable';
    end if;

    if old.status = 'open' and new.status not in ('open', 'closed') then
      raise exception 'open cycles can only be closed';
    end if;

    if old.status = 'closed' and new.status not in ('open', 'closed', 'paid') then
      raise exception 'closed cycles can only be reopened or marked as paid';
    end if;
  end if;

  if new.status = 'paid' and (tg_op = 'INSERT' or old.status <> 'closed') then
    raise exception 'only closed cycles can be marked as paid';
  end if;

  if new.status = 'open' then
    new.total_actions = null;
    new.total_cents = null;
    new.closed_at = null;
    new.closed_by = null;
    new.paid_at = null;
    new.payment_note = null;
    return new;
  end if;

  if new.status = 'closed' and (tg_op = 'INSERT' or old.status = 'open') then
    select count(*), coalesce(sum(unit_price_cents_snapshot), 0)
      into calculated_actions, calculated_total
    from public.action_entries
    where status = 'confirmed'
      and occurred_at >= (new.period_start::timestamp at time zone 'America/Sao_Paulo')
      and occurred_at < (new.period_end::timestamp at time zone 'America/Sao_Paulo');

    new.total_actions = calculated_actions;
    new.total_cents = calculated_total;
    new.closed_at = now();
    new.closed_by = auth.uid();
    new.paid_at = null;
    new.payment_note = null;
    return new;
  end if;

  if new.status = 'closed' then
    new.total_actions = old.total_actions;
    new.total_cents = old.total_cents;
    new.closed_at = old.closed_at;
    new.closed_by = old.closed_by;
    new.paid_at = null;
    return new;
  end if;

  new.total_actions = old.total_actions;
  new.total_cents = old.total_cents;
  new.closed_at = old.closed_at;
  new.closed_by = old.closed_by;
  new.paid_at = now();
  return new;
end;
$$;

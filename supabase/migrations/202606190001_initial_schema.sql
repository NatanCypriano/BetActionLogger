create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create type public.app_role as enum ('operator', 'manager');
create type public.action_status as enum ('confirmed', 'voided');
create type public.settlement_status as enum ('open', 'closed', 'paid');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.app_role not null default 'operator',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.action_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint action_types_name_not_blank check (length(btrim(name)) > 0),
  constraint action_types_description_length check (description is null or length(description) <= 240)
);

create unique index action_types_name_lower_key on public.action_types (lower(name));

create table public.action_entries (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id),
  action_type_id uuid not null references public.action_types(id),
  occurred_at timestamptz not null,
  unit_price_cents_snapshot integer not null check (unit_price_cents_snapshot >= 0),
  note text,
  status public.action_status not null default 'confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  voided_at timestamptz,
  voided_by uuid references public.profiles(id),
  void_reason text,
  constraint action_entries_note_length check (note is null or length(note) <= 280),
  constraint action_entries_void_reason_required check (
    (status = 'confirmed' and voided_at is null and voided_by is null and void_reason is null)
    or
    (status = 'voided' and voided_at is not null and voided_by is not null and length(btrim(void_reason)) > 0)
  )
);

create table public.settlement_cycles (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  status public.settlement_status not null default 'open',
  total_actions integer,
  total_cents bigint,
  closed_at timestamptz,
  closed_by uuid references public.profiles(id),
  paid_at timestamptz,
  payment_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint settlement_cycles_period_order check (period_end > period_start),
  constraint settlement_cycles_payment_note_length check (payment_note is null or length(payment_note) <= 500),
  constraint settlement_cycles_closed_fields check (
    (status = 'open' and closed_at is null and closed_by is null and total_actions is null and total_cents is null and paid_at is null)
    or
    (status in ('closed', 'paid') and closed_at is not null and closed_by is not null and total_actions is not null and total_cents is not null)
  ),
  constraint settlement_cycles_paid_fields check (
    (status <> 'paid' and paid_at is null)
    or
    (status = 'paid' and paid_at is not null)
  )
);

alter table public.settlement_cycles
  add constraint settlement_cycles_no_overlap
  exclude using gist (daterange(period_start, period_end, '[)') with &&);

create index profiles_role_idx on public.profiles(role);
create index action_types_active_idx on public.action_types(active);
create index action_entries_actor_occurred_idx on public.action_entries(actor_id, occurred_at desc);
create index action_entries_type_idx on public.action_entries(action_type_id);
create index action_entries_status_idx on public.action_entries(status);
create index settlement_cycles_period_idx on public.settlement_cycles(period_start, period_end);
create index settlement_cycles_status_idx on public.settlement_cycles(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_manager(user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'manager'
  );
$$;

create or replace function public.action_entry_is_in_closed_cycle(entry_occurred_at timestamptz)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.settlement_cycles
    where status in ('closed', 'paid')
      and entry_occurred_at >= (period_start::timestamp at time zone 'America/Sao_Paulo')
      and entry_occurred_at < (period_end::timestamp at time zone 'America/Sao_Paulo')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.email, 'Usuário'))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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

  if old.role <> new.role and not public.is_manager(auth.uid()) then
    raise exception 'only managers can change profile roles';
  end if;

  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger profiles_protect_changes
  before update on public.profiles
  for each row execute function public.protect_profile_changes();

create or replace function public.prepare_action_entry_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_price integer;
begin
  if auth.uid() is null then
    raise exception 'authenticated user is required';
  end if;

  select unit_price_cents
    into current_price
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

  return new;
end;
$$;

create trigger action_entries_prepare_insert
  before insert on public.action_entries
  for each row execute function public.prepare_action_entry_insert();

create or replace function public.protect_action_entry_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'action entries cannot be deleted';
  end if;

  if public.action_entry_is_in_closed_cycle(old.occurred_at) then
    raise exception 'action entries in closed cycles are immutable';
  end if;

  if old.status <> 'confirmed' then
    raise exception 'only confirmed entries can be changed';
  end if;

  if new.actor_id <> old.actor_id
    or new.action_type_id <> old.action_type_id
    or new.occurred_at <> old.occurred_at
    or new.unit_price_cents_snapshot <> old.unit_price_cents_snapshot
    or new.created_at <> old.created_at then
    raise exception 'core action entry fields are immutable';
  end if;

  if new.status <> 'voided' then
    raise exception 'action entries can only be voided';
  end if;

  if new.void_reason is null or length(btrim(new.void_reason)) = 0 then
    raise exception 'void reason is required';
  end if;

  new.voided_at = now();
  new.voided_by = auth.uid();
  return new;
end;
$$;

create trigger action_entries_set_updated_at
  before update on public.action_entries
  for each row execute function public.set_updated_at();

create trigger action_entries_protect_changes
  before update or delete on public.action_entries
  for each row execute function public.protect_action_entry_changes();

create trigger action_types_set_updated_at
  before update on public.action_types
  for each row execute function public.set_updated_at();

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
  if tg_op = 'UPDATE' and old.status = 'paid' then
    raise exception 'paid cycles are immutable';
  end if;

  if tg_op = 'UPDATE' and old.status = 'closed' and new.status not in ('closed', 'paid') then
    raise exception 'closed cycles cannot be reopened';
  end if;

  if new.status = 'paid' and (tg_op = 'INSERT' or old.status <> 'closed') then
    raise exception 'only closed cycles can be marked as paid';
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
  end if;

  if new.status = 'paid' then
    new.total_actions = old.total_actions;
    new.total_cents = old.total_cents;
    new.closed_at = old.closed_at;
    new.closed_by = old.closed_by;
    new.paid_at = now();
  end if;

  return new;
end;
$$;

create trigger settlement_cycles_prepare_write
  before insert or update on public.settlement_cycles
  for each row execute function public.prepare_settlement_cycle_write();

create trigger settlement_cycles_set_updated_at
  before update on public.settlement_cycles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.action_types enable row level security;
alter table public.action_entries enable row level security;
alter table public.settlement_cycles enable row level security;

create policy "profiles_select_own_or_manager"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_manager(auth.uid()));

create policy "profiles_update_own_or_manager"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid() or public.is_manager(auth.uid()))
  with check (id = auth.uid() or public.is_manager(auth.uid()));

create policy "action_types_select_active_or_manager"
  on public.action_types
  for select
  to authenticated
  using (active = true or public.is_manager(auth.uid()));

create policy "action_types_insert_manager"
  on public.action_types
  for insert
  to authenticated
  with check (public.is_manager(auth.uid()));

create policy "action_types_update_manager"
  on public.action_types
  for update
  to authenticated
  using (public.is_manager(auth.uid()))
  with check (public.is_manager(auth.uid()));

create policy "action_entries_select_own_or_manager"
  on public.action_entries
  for select
  to authenticated
  using (actor_id = auth.uid() or public.is_manager(auth.uid()));

create policy "action_entries_insert_own"
  on public.action_entries
  for insert
  to authenticated
  with check (actor_id = auth.uid() and status = 'confirmed');

create policy "action_entries_void_own_open"
  on public.action_entries
  for update
  to authenticated
  using (
    actor_id = auth.uid()
    and status = 'confirmed'
    and not public.action_entry_is_in_closed_cycle(occurred_at)
  )
  with check (
    actor_id = auth.uid()
    and status = 'voided'
    and void_reason is not null
    and length(btrim(void_reason)) > 0
  );

create policy "settlement_cycles_select_manager"
  on public.settlement_cycles
  for select
  to authenticated
  using (public.is_manager(auth.uid()));

create policy "settlement_cycles_insert_manager"
  on public.settlement_cycles
  for insert
  to authenticated
  with check (public.is_manager(auth.uid()));

create policy "settlement_cycles_update_manager"
  on public.settlement_cycles
  for update
  to authenticated
  using (public.is_manager(auth.uid()))
  with check (public.is_manager(auth.uid()));

insert into public.action_types (name, description, unit_price_cents)
values
  ('Depósito', 'Ação operacional de depósito.', 0),
  ('Saque', 'Ação operacional de saque.', 0),
  ('Outra ação', 'Ação operacional configurável.', 0)
on conflict do nothing;

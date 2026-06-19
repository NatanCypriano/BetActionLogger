-- Keep the operator action field intentionally small for the MVP.
-- Historical entries keep their action_type_id and price snapshot unchanged.

update public.action_types
set
  name = 'Outro',
  description = coalesce(description, 'Ação operacional livre.'),
  active = true
where lower(name) = lower('Outra ação')
  and not exists (
    select 1
    from public.action_types
    where lower(name) = lower('Outro')
  );

insert into public.action_types (name, description, unit_price_cents, active)
values
  ('Verificação', 'Ação operacional de verificação.', 0, true),
  ('Depósito', 'Ação operacional de depósito.', 0, true),
  ('Saque', 'Ação operacional de saque.', 0, true),
  ('Outro', 'Ação operacional livre.', 0, true)
on conflict do nothing;

update public.action_types
set active = true
where lower(name) in (
  lower('Verificação'),
  lower('Depósito'),
  lower('Saque'),
  lower('Outro')
);

update public.action_types
set active = false
where lower(name) = lower('Outra ação');

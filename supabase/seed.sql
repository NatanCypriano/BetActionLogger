insert into public.action_types (name, description, unit_price_cents)
values
  ('Verificação', 'Ação operacional de verificação.', 0),
  ('Depósito', 'Ação operacional de depósito.', 0),
  ('Saque', 'Ação operacional de saque.', 0),
  ('Outro', 'Ação operacional livre.', 0)
on conflict do nothing;

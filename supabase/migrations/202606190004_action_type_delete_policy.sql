-- Action types can be deleted from the shared system settings screen.
-- Existing action entries still protect historical integrity through the FK.

create policy "action_types_delete_authenticated"
  on public.action_types
  for delete
  to authenticated
  using (true);

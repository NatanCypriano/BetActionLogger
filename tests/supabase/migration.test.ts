import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202606190001_initial_schema.sql"),
  "utf8"
);
const equalPermissionsMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202606190002_equal_authenticated_permissions.sql"),
  "utf8"
);
const actionTypesMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202606190003_predefined_action_types.sql"),
  "utf8"
);
const actionTypeDeleteMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202606190004_action_type_delete_policy.sql"),
  "utf8"
);
const actionEntryWorkflowMigration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202606200001_restore_voided_entries_reopen_cycles_and_notes.sql"
  ),
  "utf8"
);

describe("initial Supabase migration", () => {
  it("enables RLS on every exposed table", () => {
    for (const table of ["profiles", "action_types", "action_entries", "settlement_cycles"]) {
      expect(migration).toContain(`alter table public.${table} enable row level security;`);
    }
  });

  it("uses database triggers for actor and price snapshots", () => {
    expect(migration).toContain("new.actor_id = auth.uid();");
    expect(migration).toContain("new.unit_price_cents_snapshot = current_price;");
    expect(migration).toContain("create trigger action_entries_prepare_insert");
  });

  it("blocks destructive action entry changes and closed cycle edits", () => {
    expect(migration).toContain("action entries cannot be deleted");
    expect(migration).toContain("action entries in closed cycles are immutable");
    expect(migration).toContain("action_entries_void_own_open");
  });

  it("calculates cycle ranges from Sao Paulo local dates", () => {
    expect(migration).toContain("period_start::timestamp at time zone 'America/Sao_Paulo'");
    expect(migration).toContain("period_end::timestamp at time zone 'America/Sao_Paulo'");
  });

  it("keeps manager authorization in protected profiles instead of user metadata", () => {
    expect(migration).toContain("from public.profiles");
    expect(migration).not.toContain("raw_user_meta_data");
  });

  it("relaxes MVP permissions equally for authenticated operator and manager roles", () => {
    expect(equalPermissionsMigration).toContain(
      'create policy "action_types_insert_authenticated"'
    );
    expect(equalPermissionsMigration).toContain(
      'create policy "settlement_cycles_update_authenticated"'
    );
    expect(equalPermissionsMigration).toContain(
      'create policy "action_entries_void_authenticated_open"'
    );
    expect(equalPermissionsMigration).not.toContain("public.is_manager(auth.uid())");
    expect(equalPermissionsMigration).not.toContain("only managers can change profile roles");
  });

  it("seeds the standard action types", () => {
    for (const actionName of ["Verificação", "Depósito", "Saque", "Outro"]) {
      expect(actionTypesMigration).toContain(actionName);
    }

    expect(actionTypesMigration).toContain("lower(name) = lower('Outra ação')");
  });

  it("allows authenticated users to delete unused action types", () => {
    expect(actionTypeDeleteMigration).toContain(
      'create policy "action_types_delete_authenticated"'
    );
    expect(actionTypeDeleteMigration).toContain("for delete");
    expect(actionTypeDeleteMigration).toContain("to authenticated");
  });

  it("allows only voided open entries to be restored or permanently deleted", () => {
    expect(actionEntryWorkflowMigration).toContain(
      'create policy "action_entries_delete_voided_authenticated_open"'
    );
    expect(actionEntryWorkflowMigration).toContain("only voided action entries can be deleted");
    expect(actionEntryWorkflowMigration).toContain(
      "voided action entries can only be restored or deleted"
    );
    expect(actionEntryWorkflowMigration).toContain("new.void_reason = null;");
  });

  it("keeps notes configurable and clears totals when an unpaid cycle is reopened", () => {
    expect(actionEntryWorkflowMigration).toContain(
      "add column has_note_field boolean not null default true;"
    );
    expect(actionEntryWorkflowMigration).toContain("if not show_note_field then");
    expect(actionEntryWorkflowMigration).toContain("new.note = null;");
    expect(actionEntryWorkflowMigration).toContain(
      "closed cycles can only be reopened or marked as paid"
    );
    expect(actionEntryWorkflowMigration).toContain("new.total_actions = null;");
    expect(actionEntryWorkflowMigration).toContain("new.closed_at = null;");
  });
});

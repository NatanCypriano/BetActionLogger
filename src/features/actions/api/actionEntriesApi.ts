import { supabase } from "@/lib/supabase";
import type { ActionEntryFormValues } from "@/features/actions/schemas/actionEntrySchema";
import type { ActionEntryWithType } from "@/features/actions/types";
import { getSaoPauloMonthBounds } from "@/features/actions/utils/month";

type ActionEntryRowWithType = {
  action_type_id: string;
  action_types: { name: string } | { name: string }[] | null;
  actor_id: string;
  id: string;
  note: string | null;
  occurred_at: string;
  status: "confirmed" | "voided";
  unit_price_cents_snapshot: number;
  void_reason: string | null;
  voided_at: string | null;
};

function mapActionEntry(row: ActionEntryRowWithType): ActionEntryWithType {
  const actionType = Array.isArray(row.action_types) ? row.action_types[0] : row.action_types;

  return {
    action_type_id: row.action_type_id,
    action_type_name: actionType?.name ?? "Tipo removido",
    actor_id: row.actor_id,
    id: row.id,
    note: row.note,
    occurred_at: row.occurred_at,
    status: row.status,
    unit_price_cents_snapshot: row.unit_price_cents_snapshot,
    void_reason: row.void_reason,
    voided_at: row.voided_at
  };
}

export async function createActionEntry(values: ActionEntryFormValues): Promise<void> {
  const { error } = await supabase.from("action_entries").insert({
    action_type_id: values.actionTypeId,
    note: values.note ?? null,
    occurred_at: values.occurredAt.toISOString()
  });

  if (error) {
    throw new Error("Não foi possível registrar a ação.");
  }
}

export async function fetchOwnCurrentMonthEntries(): Promise<ActionEntryWithType[]> {
  const now = new Date();
  const bounds = getSaoPauloMonthBounds(now.getFullYear(), now.getMonth() + 1);

  return fetchEntriesByRange(bounds.startIso, bounds.endIso);
}

export async function fetchManagerEntriesByRange(
  startIso: string,
  endIso: string
): Promise<ActionEntryWithType[]> {
  return fetchEntriesByRange(startIso, endIso);
}

async function fetchEntriesByRange(
  startIso: string,
  endIso: string
): Promise<ActionEntryWithType[]> {
  const { data, error } = await supabase
    .from("action_entries")
    .select(
      "id, actor_id, action_type_id, occurred_at, unit_price_cents_snapshot, note, status, voided_at, void_reason, action_types(name)"
    )
    .gte("occurred_at", startIso)
    .lt("occurred_at", endIso)
    .order("occurred_at", { ascending: false });

  if (error) {
    throw new Error("Não foi possível carregar as ações.");
  }

  return (data ?? []).map((row) => mapActionEntry(row as ActionEntryRowWithType));
}

export async function voidActionEntry(id: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from("action_entries")
    .update({
      status: "voided",
      void_reason: reason
    })
    .eq("id", id);

  if (error) {
    throw new Error("Não foi possível anular a ação.");
  }
}

import { supabase } from "@/lib/supabase";
import type { ActionType } from "@/features/actions/types";
import type { ActionTypeFormValues } from "@/features/actions/schemas/actionTypeSchema";

export async function fetchActiveActionTypes(): Promise<ActionType[]> {
  const { data, error } = await supabase
    .from("action_types")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar os tipos de ação.");
  }

  return data ?? [];
}

export async function fetchAllActionTypes(): Promise<ActionType[]> {
  const { data, error } = await supabase
    .from("action_types")
    .select("*")
    .order("active", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar os tipos de ação.");
  }

  return data ?? [];
}

export async function createActionType(values: ActionTypeFormValues): Promise<void> {
  const { error } = await supabase.from("action_types").insert({
    description: values.description ?? null,
    has_note_field: values.hasNoteField,
    name: values.name,
    unit_price_cents: values.unitPriceCents
  });

  if (error) {
    throw new Error("Não foi possível criar o tipo de ação.");
  }
}

export async function updateActionType(id: string, values: ActionTypeFormValues): Promise<void> {
  const { error } = await supabase
    .from("action_types")
    .update({
      description: values.description ?? null,
      has_note_field: values.hasNoteField,
      name: values.name,
      unit_price_cents: values.unitPriceCents
    })
    .eq("id", id);

  if (error) {
    throw new Error("Não foi possível atualizar o tipo de ação.");
  }
}

export async function setActionTypeActive(id: string, active: boolean): Promise<void> {
  const { error } = await supabase.from("action_types").update({ active }).eq("id", id);

  if (error) {
    throw new Error("Não foi possível alterar o status do tipo de ação.");
  }
}

export async function deleteActionType(id: string): Promise<void> {
  const { error } = await supabase.from("action_types").delete().eq("id", id);

  if (error) {
    throw new Error(
      "Não foi possível excluir o tipo. Tipos já usados em ações não podem ser excluídos."
    );
  }
}

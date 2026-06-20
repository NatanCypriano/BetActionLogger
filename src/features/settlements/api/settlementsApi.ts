import { supabase } from "@/lib/supabase";
import type { SettlementCycle } from "@/features/settlements/types";

export async function fetchCycleByPeriod(
  periodStart: string,
  periodEnd: string
): Promise<SettlementCycle | null> {
  const { data, error } = await supabase
    .from("settlement_cycles")
    .select("*")
    .eq("period_start", periodStart)
    .eq("period_end", periodEnd)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar o ciclo.");
  }

  return data;
}

export async function closeCycle(periodStart: string, periodEnd: string): Promise<void> {
  const existing = await fetchCycleByPeriod(periodStart, periodEnd);

  if (existing) {
    const { error } = await supabase
      .from("settlement_cycles")
      .update({ status: "closed" })
      .eq("id", existing.id);

    if (error) {
      throw new Error("Não foi possível fechar o ciclo.");
    }

    return;
  }

  const { error } = await supabase.from("settlement_cycles").insert({
    period_end: periodEnd,
    period_start: periodStart,
    status: "closed"
  });

  if (error) {
    throw new Error("Não foi possível fechar o ciclo.");
  }
}

export async function reopenCycle(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("settlement_cycles")
    .update({ status: "open" })
    .eq("id", id)
    .eq("status", "closed")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    throw new Error("Não foi possível reabrir o ciclo.");
  }
}

export async function markCycleAsPaid(id: string, paymentNote?: string): Promise<void> {
  const { error } = await supabase
    .from("settlement_cycles")
    .update({
      payment_note: paymentNote ?? null,
      status: "paid"
    })
    .eq("id", id);

  if (error) {
    throw new Error("Não foi possível marcar o ciclo como pago.");
  }
}

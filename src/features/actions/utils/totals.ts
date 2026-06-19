import type { ActionEntryWithType, EntryGroup } from "@/features/actions/types";

export function sumCents(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function calculateEntryTotals(entries: readonly ActionEntryWithType[]) {
  const confirmed = entries.filter((entry) => entry.status === "confirmed");

  return {
    count: confirmed.length,
    totalCents: sumCents(confirmed.map((entry) => entry.unit_price_cents_snapshot))
  };
}

export function groupEntriesByType(entries: readonly ActionEntryWithType[]): EntryGroup[] {
  const groups = new Map<string, EntryGroup>();

  entries
    .filter((entry) => entry.status === "confirmed")
    .forEach((entry) => {
      const existing = groups.get(entry.action_type_id);

      if (existing) {
        existing.count += 1;
        existing.totalCents += entry.unit_price_cents_snapshot;
        return;
      }

      groups.set(entry.action_type_id, {
        actionTypeId: entry.action_type_id,
        actionTypeName: entry.action_type_name,
        count: 1,
        totalCents: entry.unit_price_cents_snapshot
      });
    });

  return Array.from(groups.values()).sort((left, right) =>
    left.actionTypeName.localeCompare(right.actionTypeName, "pt-BR")
  );
}

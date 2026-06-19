import { describe, expect, it } from "vitest";

import type { ActionEntryWithType } from "@/features/actions/types";
import {
  calculateEntryTotals,
  groupEntriesByType,
  sumCents
} from "@/features/actions/utils/totals";

function entry(
  id: string,
  actionTypeId: string,
  actionTypeName: string,
  cents: number,
  status: "confirmed" | "voided" = "confirmed"
): ActionEntryWithType {
  return {
    action_type_id: actionTypeId,
    action_type_name: actionTypeName,
    actor_id: "actor-id",
    id,
    note: null,
    occurred_at: "2026-06-19T12:00:00.000Z",
    status,
    unit_price_cents_snapshot: cents,
    void_reason: status === "voided" ? "duplicado" : null,
    voided_at: status === "voided" ? "2026-06-19T13:00:00.000Z" : null
  };
}

describe("totals", () => {
  it("sums integer cents without floating point arithmetic", () => {
    expect(sumCents([10, 20, 35])).toBe(65);
  });

  it("ignores voided entries in totals", () => {
    const result = calculateEntryTotals([
      entry("1", "deposit", "Depósito", 150),
      entry("2", "withdraw", "Saque", 275),
      entry("3", "deposit", "Depósito", 999, "voided")
    ]);

    expect(result).toEqual({
      count: 2,
      totalCents: 425
    });
  });

  it("groups confirmed entries by action type", () => {
    const result = groupEntriesByType([
      entry("1", "withdraw", "Saque", 200),
      entry("2", "deposit", "Depósito", 150),
      entry("3", "deposit", "Depósito", 300),
      entry("4", "deposit", "Depósito", 999, "voided")
    ]);

    expect(result).toEqual([
      {
        actionTypeId: "deposit",
        actionTypeName: "Depósito",
        count: 2,
        totalCents: 450
      },
      {
        actionTypeId: "withdraw",
        actionTypeName: "Saque",
        count: 1,
        totalCents: 200
      }
    ]);
  });
});

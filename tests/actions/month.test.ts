import { describe, expect, it } from "vitest";

import {
  addMonths,
  formatMonthLabel,
  getSaoPauloMonthBounds
} from "@/features/actions/utils/month";

describe("month utilities", () => {
  it("calculates Sao Paulo month bounds as UTC instants with exclusive end", () => {
    const result = getSaoPauloMonthBounds(2026, 6);

    expect(result).toEqual({
      endIso: "2026-07-01T03:00:00.000Z",
      periodEndDate: "2026-07-01",
      periodStartDate: "2026-06-01",
      startIso: "2026-06-01T03:00:00.000Z"
    });
  });

  it("moves across year boundaries", () => {
    expect(addMonths({ month: 12, year: 2026 }, 1)).toEqual({ month: 1, year: 2027 });
    expect(addMonths({ month: 1, year: 2026 }, -1)).toEqual({ month: 12, year: 2025 });
  });

  it("formats month labels in Brazilian Portuguese", () => {
    expect(formatMonthLabel({ month: 6, year: 2026 })).toBe("junho de 2026");
  });
});

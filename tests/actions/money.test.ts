import { describe, expect, it } from "vitest";

import { formatCurrencyCents } from "@/features/actions/utils/money";

describe("formatCurrencyCents", () => {
  it("formats BRL from integer cents", () => {
    expect(formatCurrencyCents(0)).toBe("R$ 0,00");
    expect(formatCurrencyCents(5)).toBe("R$ 0,05");
    expect(formatCurrencyCents(123456)).toBe("R$ 1.234,56");
  });

  it("keeps negative values explicit", () => {
    expect(formatCurrencyCents(-150)).toBe("R$ -1,50");
  });
});

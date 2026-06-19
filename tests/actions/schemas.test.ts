import { describe, expect, it } from "vitest";

import { actionEntrySchema } from "@/features/actions/schemas/actionEntrySchema";
import { actionTypeSchema } from "@/features/actions/schemas/actionTypeSchema";
import { signInSchema } from "@/features/auth/schemas/signInSchema";

describe("zod schemas", () => {
  it("validates action entry form boundaries", () => {
    const result = actionEntrySchema.safeParse({
      actionTypeId: "0a9b82c3-6809-4956-a820-8e6b74689053",
      note: "ok",
      occurredAt: new Date("2026-06-19T12:00:00.000Z")
    });

    expect(result.success).toBe(true);
  });

  it("rejects overly long action notes", () => {
    const result = actionEntrySchema.safeParse({
      actionTypeId: "0a9b82c3-6809-4956-a820-8e6b74689053",
      note: "x".repeat(281),
      occurredAt: new Date("2026-06-19T12:00:00.000Z")
    });

    expect(result.success).toBe(false);
  });

  it("requires non-negative integer cents for action types", () => {
    expect(
      actionTypeSchema.safeParse({
        description: "",
        name: "Depósito",
        unitPriceCents: 125
      }).success
    ).toBe(true);

    expect(
      actionTypeSchema.safeParse({
        name: "Depósito",
        unitPriceCents: 12.5
      }).success
    ).toBe(false);
  });

  it("validates login credentials shape", () => {
    expect(
      signInSchema.safeParse({ email: "operador@example.com", password: "123456" }).success
    ).toBe(true);
    expect(signInSchema.safeParse({ email: "x", password: "1" }).success).toBe(false);
  });
});

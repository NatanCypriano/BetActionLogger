import { z } from "zod";

export const actionEntrySchema = z.object({
  actionTypeId: z.string().uuid("Escolha um tipo de ação."),
  note: z
    .string()
    .trim()
    .max(280, "Use no máximo 280 caracteres.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  occurredAt: z.date()
});

export type ActionEntryFormValues = z.infer<typeof actionEntrySchema>;

import { z } from "zod";

export const actionTypeSchema = z.object({
  description: z
    .string()
    .trim()
    .max(240, "Use no máximo 240 caracteres.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  name: z.string().trim().min(2, "Informe o nome.").max(80, "Use no máximo 80 caracteres."),
  unitPriceCents: z.coerce
    .number({ invalid_type_error: "Informe um valor em centavos." })
    .int("Informe centavos inteiros.")
    .min(0, "O valor não pode ser negativo.")
    .max(1_000_000, "Valor acima do limite do MVP.")
});

export type ActionTypeFormValues = z.infer<typeof actionTypeSchema>;

import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(6, "Informe a senha.")
});

export type SignInFormValues = z.infer<typeof signInSchema>;

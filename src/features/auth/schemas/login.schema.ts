import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Ingresa un correo válido.").trim(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

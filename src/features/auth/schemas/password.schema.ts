import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.email("Ingresa un correo válido.").trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  confirm_password: z.string(),
  password: z.string()
    .min(8, "Usa al menos 8 caracteres.")
    .regex(/[a-z]/, "Incluye una letra minúscula.")
    .regex(/[A-Z]/, "Incluye una letra mayúscula.")
    .regex(/[0-9]/, "Incluye un número."),
}).superRefine((data, context) => {
  if (data.password !== data.confirm_password) context.addIssue({
    code: "custom", message: "Las contraseñas no coinciden.", path: ["confirm_password"],
  });
});

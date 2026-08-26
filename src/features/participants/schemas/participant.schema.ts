import { z } from "zod";

const optionalText = z.string().trim().max(250, "Usa como máximo 250 caracteres.");

export const participantFormSchema = z.object({
  address: optionalText,
  company: optionalText,
  email: z.email("Ingresa un correo válido.").trim().toLowerCase(),
  first_names: z.string().trim().min(2, "Ingresa los nombres.").max(120, "Los nombres no pueden superar 120 caracteres."),
  job_title: z.string().trim().min(2, "Ingresa el cargo.").max(150, "El cargo no puede superar 150 caracteres."),
  last_names: z.string().trim().min(2, "Ingresa los apellidos.").max(120, "Los apellidos no pueden superar 120 caracteres."),
  phone: z.string().trim().transform((value) => value.replace(/[\s-]/g, ""))
    .refine((value) => /^\+?[0-9]{7,15}$/.test(value), "Ingresa un celular válido."),
  ruc: z.string().trim().refine((value) => !value || /^[0-9]{11}$/.test(value), "El RUC debe tener 11 dígitos."),
});

import { z } from "zod";

export const profileSchema = z.object({
  address: z.string().trim().max(300),
  company: z.string().trim().max(180),
  first_names: z.string().trim().min(2, "Ingresa tus nombres.").max(120),
  job_title: z.string().trim().min(2, "Ingresa tu cargo.").max(160),
  last_names: z.string().trim().min(2, "Ingresa tus apellidos.").max(120),
  phone: z.string().trim().transform((value) => value.replace(/[\s-]/g, ""))
    .refine((value) => /^[0-9]{9,15}$/.test(value), "Ingresa un celular válido."),
  ruc: z.string().trim(),
}).superRefine((data, context) => {
  if (data.ruc && !/^[0-9]{11}$/.test(data.ruc)) context.addIssue({
    code: "custom", message: "El RUC debe tener 11 dígitos.", path: ["ruc"],
  });
});

import { z } from "zod";

const optionalText = (maximum: number) => z.string().trim().max(maximum, `Usa como máximo ${maximum} caracteres.`);

export const registerSchema = z.object({
  address: optionalText(300),
  company: optionalText(180),
  confirm_password: z.string(),
  document_number: z.string().trim().toUpperCase(),
  document_type: z.enum(["dni", "ce"]),
  email: z.email("Ingresa un correo válido.").trim().toLowerCase(),
  first_names: z.string().trim().min(2, "Ingresa tus nombres.").max(120, "Los nombres no pueden superar 120 caracteres."),
  job_title: z.string().trim().min(2, "Ingresa tu cargo.").max(160, "El cargo no puede superar 160 caracteres."),
  last_names: z.string().trim().min(2, "Ingresa tus apellidos.").max(120, "Los apellidos no pueden superar 120 caracteres."),
  password: z.string()
    .min(8, "Usa al menos 8 caracteres.")
    .regex(/[a-z]/, "Incluye una letra minúscula.")
    .regex(/[A-Z]/, "Incluye una letra mayúscula.")
    .regex(/[0-9]/, "Incluye un número."),
  phone: z.string().trim().transform((value) => value.replace(/[\s-]/g, ""))
    .refine((value) => /^[0-9]{9,15}$/.test(value), "Ingresa un celular válido."),
  ruc: z.string().trim(),
}).superRefine((data, context) => {
  const validDocument = data.document_type === "dni"
    ? /^[0-9]{8}$/.test(data.document_number)
    : /^[A-Z0-9]{6,20}$/.test(data.document_number);
  if (!validDocument) context.addIssue({
    code: "custom",
    message: data.document_type === "dni" ? "El DNI debe tener 8 dígitos." : "El CE debe tener entre 6 y 20 caracteres.",
    path: ["document_number"],
  });
  if (data.ruc && !/^[0-9]{11}$/.test(data.ruc)) context.addIssue({
    code: "custom", message: "El RUC debe tener 11 dígitos.", path: ["ruc"],
  });
  if (data.password !== data.confirm_password) context.addIssue({
    code: "custom", message: "Las contraseñas no coinciden.", path: ["confirm_password"],
  });
});

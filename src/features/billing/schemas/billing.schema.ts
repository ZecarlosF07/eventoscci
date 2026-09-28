import { z } from "zod";

export const billingSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("boleta"), document: z.string().trim().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos."),
    name: z.string().trim().min(2, "Ingresa los nombres y apellidos.").max(250, "Usa como máximo 250 caracteres.") }),
  z.object({ type: z.literal("factura"), document: z.string().trim().regex(/^\d{11}$/, "El RUC debe tener 11 dígitos."),
    name: z.string().trim().min(2, "Ingresa la razón social.").max(250, "Usa como máximo 250 caracteres."),
    address: z.string().trim().min(2, "Ingresa la dirección fiscal.").max(250, "Usa como máximo 250 caracteres.") }),
]);

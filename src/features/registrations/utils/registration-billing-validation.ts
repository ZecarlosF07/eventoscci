import { registrationFormSchema } from "@/features/registrations/schemas/registration.schema";
import type { RegistrationInput } from "@/features/registrations/types/registration.types";

export function validateRegistrationWithBilling(input: RegistrationInput, price: number) {
  return registrationFormSchema.superRefine((data, context) => {
    if (price > 0 && !data.billing) context.addIssue({ code: "custom", path: ["billing", "document"], message: "Completa los datos para la boleta o factura." });
  }).safeParse({ ...input, billing: price > 0 ? input.billing : null });
}

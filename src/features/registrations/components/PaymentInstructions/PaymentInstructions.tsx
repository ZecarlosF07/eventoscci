import type { PaymentInstructionsProps } from "@/features/registrations/components/PaymentInstructions/types/payment-instructions.types";

export function PaymentInstructions({ note }: PaymentInstructionsProps) {
  return (
    <section aria-label="Cómo realizar el pago" className="rounded-2xl border border-cci-300 bg-white p-4 text-cci-950">
      <p className="text-base font-bold">Cómo realizar el pago</p>
      <p className="mt-2 whitespace-pre-line text-base leading-relaxed [overflow-wrap:anywhere]">{note}</p>
    </section>
  );
}

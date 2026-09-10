import { Checkbox } from "@/components/atoms/Checkbox";
import type { CertificateInterestFieldProps } from "@/features/registrations/components/CertificateInterestField/types/certificate-interest-field.types";
import { formatRegistrationPrice } from "@/features/registrations/utils/registration-formatters";

export function CertificateInterestField({
  generalPrice,
  memberPrice,
  registrationType,
}: CertificateInterestFieldProps) {
  const price = registrationType === "member" ? memberPrice : generalPrice;

  return (
    <section className="rounded-2xl border border-cci-200 bg-cci-50 p-4 sm:p-5">
      <label className="flex cursor-pointer items-start gap-3" htmlFor="request_certificate">
        <Checkbox className="mt-1 shrink-0" id="request_certificate" name="request_certificate" />
        <span>
          <strong className="block text-base text-cci-950">
            Sí, deseo solicitar el certificado digital
          </strong>
          <span className="mt-1 block text-sm leading-6 text-slate-600">
            Tarifa aplicable: <strong>{formatRegistrationPrice(price)}</strong>. Registraremos tu
            interés y podrás continuar la coordinación después de inscribirte.
          </span>
        </span>
      </label>
    </section>
  );
}

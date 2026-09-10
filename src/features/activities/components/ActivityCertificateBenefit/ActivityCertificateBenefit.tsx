import { Badge } from "@/components/atoms/Badge";
import { Text } from "@/components/atoms/Text";
import type { ActivityCertificateBenefitProps } from "@/features/activities/components/ActivityCertificateBenefit/types/activity-certificate-benefit.types";
import { formatActivityPrice } from "@/features/activities/utils/activity-formatters";

export function ActivityCertificateBenefit({
  generalPrice,
  isActivityFree,
  memberPrice,
  mode,
}: ActivityCertificateBenefitProps) {
  if (mode === "none") return null;

  if (mode === "included") {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <Badge variant="success">Certificado incluido</Badge>
        <Text className="mt-2" size="sm">
          Está incluido en tu participación y se emitirá a quienes registren asistencia.
        </Text>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-cci-200 bg-cci-50 p-4">
      <Badge>Certificado digital opcional</Badge>
      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-600">General</span>
          <strong className="block text-base text-cci-950">{formatActivityPrice(generalPrice)}</strong>
        </div>
        <div>
          <span className="text-slate-600">Asociados</span>
          <strong className="block text-base text-cci-950">{formatActivityPrice(memberPrice)}</strong>
        </div>
      </div>
      <Text className="mt-3" size="sm">
        {isActivityFree
          ? "La participación es gratuita. El certificado digital es opcional y tiene costo."
          : "El certificado digital es opcional y tiene un costo adicional."}
        {" "}Puedes solicitarlo ahora o después de participar.
      </Text>
    </section>
  );
}

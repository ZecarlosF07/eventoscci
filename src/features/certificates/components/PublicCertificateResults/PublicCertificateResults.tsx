import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { PublicCertificateCard } from "@/features/certificates/components/PublicCertificateCard";
import type { PublicCertificateResultsProps } from "@/features/certificates/components/PublicCertificateResults/types/public-certificate-results.types";

export function PublicCertificateResults({ certificates, participantName }: PublicCertificateResultsProps) {
  return (
    <section aria-labelledby="certificate-results-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Historial institucional</p>
          <Heading className="mt-2" id="certificate-results-title" level={2}>{participantName ?? "Certificados encontrados"}</Heading>
          <Text className="mt-2">Encontramos {certificates.length} {certificates.length === 1 ? "certificado emitido" : "certificados emitidos"}.</Text>
        </div>
      </div>
      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {certificates.map((certificate) => <PublicCertificateCard certificate={certificate} key={certificate.access_token} />)}
      </div>
    </section>
  );
}

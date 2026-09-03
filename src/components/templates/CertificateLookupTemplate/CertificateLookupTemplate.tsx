import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { CertificateLookupTemplateProps } from "@/components/templates/CertificateLookupTemplate/types/certificate-lookup-template.types";
import { PublicCertificateSearch } from "@/features/certificates/components/PublicCertificateSearch";

export function CertificateLookupTemplate({ accountHref, accountLabel }: CertificateLookupTemplateProps) {
  return (
    <div className="bg-cci-50">
      <section className="relative overflow-hidden bg-cci-950 px-5 py-14 text-white sm:px-8 sm:py-20">
        <div className="absolute -right-24 -top-32 size-96 rounded-full border border-cci-lime/30" />
        <div className="absolute -right-8 -top-16 size-64 rounded-full border border-white/10" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cci-lime">Certificación CCI</p>
          <Heading className="mt-4 text-white" level={1}>Mis certificados</Heading>
          <Text className="mx-auto mt-5 max-w-2xl text-white/70" size="lg">
            Ingresa tu DNI para consultar todos los certificados emitidos por la Cámara de Comercio de Ica.
          </Text>
        </div>
      </section>
      <PublicCertificateSearch accountHref={accountHref} accountLabel={accountLabel} />
    </div>
  );
}

import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { MyCertificatesList } from "@/features/certificates/components/MyCertificatesList";
import { getMyCertificates } from "@/features/certificates/queries/get-my-certificates";

export default async function CampusCertificatesPage() {
  const certificates = await getMyCertificates();
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cci-600">Campus Virtual</p>
        <Heading className="mt-2" level={1}>Mis certificados</Heading>
        <Text className="mt-3">Consulta y descarga tus certificados institucionales.</Text>
      </header>
      <MyCertificatesList certificates={certificates} />
    </div>
  );
}

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { FoundationOverview } from "@/components/organisms/FoundationOverview";
import type { FoundationTemplateProps } from "@/components/templates/FoundationTemplate/types/foundation-template.types";

export function FoundationTemplate({
  foundation,
}: FoundationTemplateProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <section className="max-w-3xl">
        <Badge>Hito 1</Badge>
        <Heading className="mt-5" level={1}>
          Base técnica para eventos y formación
        </Heading>
        <Text className="mt-6" size="lg">
          Una sola plataforma preparada para el portal público, el Campus
          Virtual y la administración de la Cámara de Comercio de Ica.
        </Text>
      </section>
      <div className="mt-12">
        <FoundationOverview foundation={foundation} />
      </div>
    </div>
  );
}

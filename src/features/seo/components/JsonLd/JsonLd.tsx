import type { JsonLdProps } from "@/features/seo/types/seo.types";
import { serializeJsonLd } from "@/features/seo/utils/json-ld";

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      type="application/ld+json"
    />
  );
}

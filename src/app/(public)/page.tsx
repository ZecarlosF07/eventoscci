import { FoundationTemplate } from "@/components/templates/FoundationTemplate";
import { getFoundationStatus } from "@/features/foundation/services/get-foundation-status";

export default async function HomePage() {
  const foundation = await getFoundationStatus();

  return <FoundationTemplate foundation={foundation} />;
}

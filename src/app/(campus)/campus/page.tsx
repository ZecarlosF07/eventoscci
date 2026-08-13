import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { requireActiveAccount } from "@/features/auth/services/account-guards";

export default async function CampusPage() {
  const account = await requireActiveAccount();
  return (
    <div className="space-y-8">
      <SectionHeading description="Tu cuenta ya está vinculada a la identidad institucional que conservará cursos, progreso y certificados." eyebrow="Campus Virtual" title={`Bienvenido, ${account.person.first_names}`} />
      <section className="rounded-3xl border border-slate-200 bg-white p-7"><Heading level={2}>Cuenta preparada</Heading><Text className="mt-3">La gestión académica se habilitará en el siguiente hito. Mientras tanto, puedes revisar y actualizar tus datos personales.</Text></section>
    </div>
  );
}

import type { Metadata } from "next";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { requireActiveAccount } from "@/features/auth/services/account-guards";
import { ProfileForm } from "@/features/users/components/ProfileForm";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function CampusProfilePage() {
  const account = await requireActiveAccount();
  return <div className="space-y-7"><SectionHeading description="Actualiza tus datos de contacto. El documento, el correo de acceso y el rol están protegidos." eyebrow="Cuenta" title="Mi perfil" /><ProfileForm profile={account.person} /></div>;
}

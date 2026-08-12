import { WorkspaceShell } from "@/components/templates/WorkspaceShell";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <WorkspaceShell
      area="Administración"
      description="La autenticación administrativa mínima se incorporará antes de habilitar mutaciones."
    >
      {children}
    </WorkspaceShell>
  );
}

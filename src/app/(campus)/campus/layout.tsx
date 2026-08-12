import { WorkspaceShell } from "@/components/templates/WorkspaceShell";

export default function CampusLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <WorkspaceShell
      area="Campus Virtual"
      description="La autenticación y los cursos se implementarán en los hitos correspondientes."
    >
      {children}
    </WorkspaceShell>
  );
}

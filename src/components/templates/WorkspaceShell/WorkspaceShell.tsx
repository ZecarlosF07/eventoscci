import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { WorkspaceShellProps } from "@/components/templates/WorkspaceShell/types/workspace-shell.types";

export function WorkspaceShell({
  area,
  children,
  description,
}: WorkspaceShellProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <div>
            <Badge>Área preparada</Badge>
            <Heading className="mt-2" level={3}>
              {area}
            </Heading>
            <Text size="sm">{description}</Text>
          </div>
          <Link
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            href="/"
          >
            Volver al inicio
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        {children}
      </main>
    </div>
  );
}

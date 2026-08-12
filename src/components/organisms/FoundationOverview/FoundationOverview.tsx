import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { ConnectionNotice } from "@/components/molecules/ConnectionNotice";
import { StatCard } from "@/components/molecules/StatCard";
import type { FoundationOverviewProps } from "@/components/organisms/FoundationOverview/types/foundation-overview.types";

export function FoundationOverview({
  foundation,
}: FoundationOverviewProps) {
  return (
    <section className="space-y-8">
      <ConnectionNotice
        message={foundation.message}
        status={foundation.status}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          detail="Entidades transversales creadas mediante migración."
          label="Tablas del núcleo"
          value={4}
        />
        <StatCard
          detail="Registros públicos activos recuperados desde Supabase."
          label="Categorías"
          value={foundation.categories.length}
        />
        <StatCard
          detail="Perfiles reutilizables disponibles para futuros módulos."
          label="Expositores"
          value={foundation.speakers.length}
        />
      </div>
      {foundation.status === "connected" ? (
        <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 lg:grid-cols-2">
          <div>
            <Heading level={3}>Categorías iniciales</Heading>
            <div className="mt-4 flex flex-wrap gap-2">
              {foundation.categories.map((category) => (
                <Badge key={category.id}>{category.name}</Badge>
              ))}
            </div>
          </div>
          <div>
            <Heading level={3}>Expositores de prueba</Heading>
            <div className="mt-4 space-y-2">
              {foundation.speakers.map((speaker) => (
                <Text key={speaker.id} size="sm">
                  {speaker.first_names} {speaker.last_names}
                  {speaker.organization ? ` · ${speaker.organization}` : ""}
                </Text>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

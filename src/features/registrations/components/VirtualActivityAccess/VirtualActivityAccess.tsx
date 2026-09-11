import { Badge } from "@/components/atoms/Badge";
import { Text } from "@/components/atoms/Text";
import type { VirtualActivityAccessProps } from "@/features/registrations/components/VirtualActivityAccess/types/virtual-activity-access.types";
import { formatActivityDate } from "@/features/activities/utils/activity-formatters";

export function VirtualActivityAccess({
  modality,
  sessions,
  venueAddress,
  venueName,
  venueReference,
  virtualAccessUrl,
}: VirtualActivityAccessProps) {
  return (
    <section className="mt-6 rounded-2xl border border-cci-200 bg-cci-50 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cci-950 text-white">
          <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
            <path d="M5 6h14v10H5zM9 20h6M12 16v4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            <path d="m10 9 4 2-4 2V9Z" fill="currentColor" />
          </svg>
        </span>
        <div>
          <Badge variant="success">Acceso confirmado</Badge>
          <h2 className="mt-2 text-lg font-bold text-cci-950">Acceso virtual</h2>
          <Text className="mt-1" size="sm">
            Usa este enlace para ingresar a {sessions.length > 1 ? "las sesiones" : "la sesión"} de la actividad.
          </Text>
        </div>
      </div>

      {sessions.length ? (
        <ul className="mt-4 space-y-2 border-t border-cci-200 pt-4 text-sm text-slate-700">
          {sessions.map((session) => (
            <li key={session.starts_at}>
              <strong>{session.label ? `${session.label}: ` : ""}</strong>
              {formatActivityDate(session.starts_at)}
            </li>
          ))}
        </ul>
      ) : null}

      {modality === "hybrid" && venueName ? (
        <div className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-700">
          <p className="font-bold text-cci-950">También puedes asistir presencialmente</p>
          <p className="mt-1">{venueName}{venueAddress ? ` · ${venueAddress}` : ""}</p>
          {venueReference ? <p className="mt-1 text-slate-500">{venueReference}</p> : null}
        </div>
      ) : null}

      <a
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-cci-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-cci-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime sm:w-auto"
        href={virtualAccessUrl}
        rel="noreferrer"
        target="_blank"
      >
        Ingresar a la actividad virtual
        <span aria-hidden="true">↗</span>
      </a>
      <Text className="mt-3" size="sm">No compartas este enlace fuera de tu inscripción.</Text>
    </section>
  );
}

import Link from "next/link";

import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import type { RegistrationAdminFilters } from "@/features/registrations/types/registration.types";
import { getActivityParticipationRoute } from "@/features/participation/utils/participation-routes";

function selectedStatus(filters: RegistrationAdminFilters): string {
  return filters.status ?? filters.statusScope ?? "active";
}

export function ActivityRegistrationFilters({ filters }: { filters: RegistrationAdminFilters }) {
  const pathname = getActivityParticipationRoute(filters.activityId ?? "");
  return (
    <form className="grid gap-3 rounded-2xl border border-cci-100 bg-white p-4 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_170px_170px_210px_auto_auto]" method="get">
      <Input defaultValue={filters.query} name="q" placeholder="Nombre, documento, correo o celular" type="search" />
      <Select aria-label="Estado de inscripción" defaultValue={selectedStatus(filters)} name="estado">
        <option value="active">Activas</option>
        <option value="pending">Por verificar</option>
        <option value="confirmed">Confirmadas</option>
        <option value="cancelled">Canceladas</option>
        <option value="all">Historial completo</option>
      </Select>
      <Select aria-label="Tipo de inscripción" defaultValue={filters.registrationType ?? ""} name="tipo">
        <option value="">General y asociados</option>
        <option value="general">Público general</option>
        <option value="member">Asociado CCI</option>
      </Select>
      <Select aria-label="Solicitud de certificado" defaultValue={filters.certificateRequest ?? ""} name="certificado">
        <option value="">Todas</option>
        <option value="pending">Pendientes de seguimiento</option>
        <option value="requested">Solicitadas</option>
      </Select>
      <button className="min-h-11 rounded-xl bg-cci-950 px-5 text-sm font-bold text-white hover:bg-cci-800" type="submit">Aplicar</button>
      <Link className="flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold hover:bg-cci-50" href={pathname}>Limpiar</Link>
    </form>
  );
}

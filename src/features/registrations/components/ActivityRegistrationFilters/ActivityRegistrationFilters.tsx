import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { AutoFilterForm } from "@/features/admin-filters/components/AutoFilterForm";
import { PARTICIPANT_PROFILE_LABELS } from "@/features/registrations/constants/registration.constants";
import type { RegistrationAdminFilters, ActivityRegistrationFiltersProps } from "@/features/registrations/types/registration.types";

function selectedStatus(filters: RegistrationAdminFilters): string {
  return filters.status ?? filters.statusScope ?? "active";
}

export function ActivityRegistrationFilters({ filters, total }: ActivityRegistrationFiltersProps) {
  return (
    <AutoFilterForm total={total} className="md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_220px_200px]" defaults={{ estado: "active" }} moreFilters={{ names: ["certificado", "perfil"], children: <>
      <label className="text-sm font-semibold">Perfil<Select defaultValue={filters.profile ?? ""} name="perfil"><option value="">Todos</option><option value="professional">{PARTICIPANT_PROFILE_LABELS.professional}</option><option value="student">Estudiante</option></Select></label>
      <label className="text-sm font-semibold">Certificado
        <Select aria-label="Estado comercial del certificado" defaultValue={filters.certificateRequest ?? ""} name="certificado">
          <option value="">Todas</option><option value="not_requested">Sin solicitar</option><option value="payment_pending">Pago pendiente</option><option value="payment_verified">Pago verificado</option><option value="ready_to_issue">Listos para emitir</option>
        </Select>
      </label>
    </> }}>
      <Input defaultValue={filters.query} name="q" aria-label="Buscar inscripción" placeholder="Nombre, documento, correo, código o RUC" type="search" />
      <Select aria-label="Estado de inscripción" defaultValue={selectedStatus(filters)} name="estado">
        <option value="active">Activas</option>
        <option value="pending">Pendientes de confirmación</option>
        <option value="confirmed">Confirmadas</option>
        <option value="cancelled">Canceladas</option>
        <option value="all">Historial completo</option>
      </Select>
      <Select aria-label="Tipo de inscripción" defaultValue={filters.registrationType ?? ""} name="tipo">
        <option value="">General y asociados</option>
        <option value="general">Público general</option>
        <option value="member">Asociado CCI</option>
      </Select>
      {filters.profile === "student" && filters.registrationType === "member" ? <p className="col-span-full text-sm text-amber-800" role="status">El perfil estudiante utiliza público general. Cambia el tipo de inscripción o el perfil para consultar resultados.</p> : null}
      {filters.status && filters.status !== "confirmed" && filters.certificateRequest === "ready_to_issue" ? <p className="col-span-full text-sm text-amber-800" role="status">Para estar listo para emitir, el participante debe tener inscripción confirmada y asistencia registrada. Cambia el estado o el filtro de certificado.</p> : null}
    </AutoFilterForm>
  );
}

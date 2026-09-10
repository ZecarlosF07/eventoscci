import Link from "next/link";

import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { ROUTES } from "@/constants/routes";
import type { RegistrationActivityOption, RegistrationAdminFilters } from "@/features/registrations/types/registration.types";

export function PendingRegistrationFilters({ activities, filters }: { activities: RegistrationActivityOption[]; filters: RegistrationAdminFilters }) {
  return (
    <form className="grid gap-3 rounded-2xl border border-cci-100 bg-white p-4 lg:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_160px_auto_auto]" method="get">
      <Input defaultValue={filters.query} name="q" placeholder="Nombre, documento, correo o celular" type="search" />
      <Select aria-label="Actividad" defaultValue={filters.activityId ?? ""} name="actividad"><option value="">Todas las actividades</option>{activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.title}</option>)}</Select>
      <Select aria-label="Tipo" defaultValue={filters.registrationType ?? ""} name="tipo"><option value="">General y asociados</option><option value="general">Público general</option><option value="member">Asociado CCI</option></Select>
      <button className="min-h-11 rounded-xl bg-cci-950 px-5 text-sm font-bold text-white hover:bg-cci-800" type="submit">Aplicar</button>
      <Link className="flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold hover:bg-cci-50" href={ROUTES.adminPendingPayments}>Limpiar</Link>
    </form>
  );
}

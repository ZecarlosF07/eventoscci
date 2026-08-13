import type { RegistrationAdminItem } from "@/features/registrations/types/registration.types";

const REGISTRATION_LABELS = { cancelled: "Cancelado", confirmed: "Confirmado", pending: "Preinscrito" } as const;
const ATTENDANCE_LABELS = { absent: "No asistió", attended: "Asistió", pending: "Pendiente" } as const;

function csvCell(value: string | number | null): string {
  let text = value === null ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function registrationsToCsv(registrations: RegistrationAdminItem[]): string {
  const headers = [
    "Actividad", "Tipo de documento", "Documento", "Nombres", "Apellidos",
    "Correo", "Celular", "Cargo", "Empresa", "RUC", "Tipo de inscripción",
    "Estado", "Asistencia", "Código", "Precio registrado",
  ];
  const rows = registrations.map((item) => [
    item.activity.title,
    item.person.document_type.toUpperCase(),
    item.person.document_number,
    item.person.first_names,
    item.person.last_names,
    item.person.email,
    item.person.phone,
    item.person.job_title,
    item.company_snapshot,
    item.ruc_snapshot,
    item.registration_type === "member" ? "Asociado" : "General",
    REGISTRATION_LABELS[item.status],
    ATTENDANCE_LABELS[item.attendance[0]?.status ?? "pending"],
    item.registration_code,
    item.price_snapshot,
  ]);
  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}

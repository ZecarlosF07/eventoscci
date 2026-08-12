import { Badge } from "@/components/atoms/Badge";
import { Text } from "@/components/atoms/Text";
import type { ConnectionNoticeProps } from "@/components/molecules/ConnectionNotice/types/connection-notice.types";

const STATUS_CONTENT = {
  connected: { label: "Conectado", variant: "success" },
  error: { label: "Error de conexión", variant: "warning" },
  unconfigured: { label: "Pendiente de configuración", variant: "neutral" },
} as const;

export function ConnectionNotice({
  message,
  status,
}: ConnectionNoticeProps) {
  const content = STATUS_CONTENT[status];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Text className="font-semibold text-slate-950">Estado de Supabase</Text>
        <Text className="mt-1" size="sm">
          {message}
        </Text>
      </div>
      <Badge variant={content.variant}>{content.label}</Badge>
    </div>
  );
}

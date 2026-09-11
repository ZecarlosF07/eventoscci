import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import type { ActivityVirtualAccessFieldsProps } from "@/features/activities/components/ActivityVirtualAccessFields/types/activity-virtual-access-fields.types";

export function ActivityVirtualAccessFields({
  defaultValue,
  error,
  modality,
  published,
}: ActivityVirtualAccessFieldsProps) {
  if (modality === "in_person") {
    return <input name="virtual_url" type="hidden" value="" />;
  }

  return (
    <FormField
      error={error}
      hint={published ? "Se enviará solo a participantes confirmados." : "Puedes completarlo antes de publicar."}
      label="Enlace virtual"
      name="virtual_url"
      required={published}
    >
      <Input
        defaultValue={defaultValue ?? ""}
        id="virtual_url"
        name="virtual_url"
        placeholder="https://…"
        required={published}
        type="url"
      />
    </FormField>
  );
}

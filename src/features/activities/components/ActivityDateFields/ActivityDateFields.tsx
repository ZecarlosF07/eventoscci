"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import type { ActivityDateFieldItem, ActivityDateFieldsProps } from "@/features/activities/components/ActivityDateFields/types/activity-date-fields.types";
import type { ActivityDateInput } from "@/features/activities/types/activity-form.types";

const EMPTY_DATE: ActivityDateInput = {
  ends_at: "",
  label: "",
  sort_order: 0,
  starts_at: "",
};

export function ActivityDateFields({ initialDates }: ActivityDateFieldsProps) {
  const initialItems = initialDates.length ? initialDates : [EMPTY_DATE];
  const nextFieldId = useRef(initialItems.length);
  const [dates, setDates] = useState<ActivityDateFieldItem[]>(() =>
    initialItems.map((date, index) => ({ ...date, fieldId: `initial-${index}` })),
  );

  function addDate() {
    const fieldId = `added-${nextFieldId.current++}`;
    setDates((current) => [...current, { ...EMPTY_DATE, fieldId, sort_order: current.length }]);
  }

  function removeDate(index: number) {
    setDates((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-4">
      {dates.map((date, index) => (
        <div className="grid gap-4 rounded-2xl border border-cci-100 p-4 md:grid-cols-3" key={date.fieldId}>
          <input name="date_sort_order" type="hidden" value={index} />
          <div className="flex items-center justify-between gap-4 md:col-span-3">
            <strong className="text-sm text-cci-950">Fecha {index + 1}</strong>
            {dates.length > 1 ? (
              <Button className="min-h-9 px-3" onClick={() => removeDate(index)} variant="subtle">
                Quitar fecha
              </Button>
            ) : null}
          </div>
          <FormField label="Etiqueta" name={`date_label_${index}`}>
            <Input
              defaultValue={date.label}
              id={`date_label_${index}`}
              name="date_label"
              placeholder={`Día ${index + 1}`}
            />
          </FormField>
          <FormField label="Inicio" name={`date_starts_at_${index}`} required>
            <Input
              defaultValue={date.starts_at}
              id={`date_starts_at_${index}`}
              name="date_starts_at"
              required
              type="datetime-local"
            />
          </FormField>
          <FormField label="Fin" name={`date_ends_at_${index}`}>
            <Input
              defaultValue={date.ends_at}
              id={`date_ends_at_${index}`}
              name="date_ends_at"
              type="datetime-local"
            />
          </FormField>
        </div>
      ))}
      <Button onClick={addDate} variant="secondary">
        Agregar fecha
      </Button>
    </div>
  );
}

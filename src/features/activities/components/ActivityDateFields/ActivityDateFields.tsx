"use client";

import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import type { ActivityDateFieldsProps } from "@/features/activities/components/ActivityDateFields/types/activity-date-fields.types";
import type { ActivityDateInput } from "@/features/activities/types/activity-form.types";

const EMPTY_DATE: ActivityDateInput = {
  ends_at: "",
  label: "",
  sort_order: 0,
  starts_at: "",
};

export function ActivityDateFields({ initialDates }: ActivityDateFieldsProps) {
  const [dates, setDates] = useState(
    initialDates.length ? initialDates : [EMPTY_DATE],
  );

  function addDate() {
    setDates((current) => [...current, { ...EMPTY_DATE, sort_order: current.length }]);
  }

  function removeDate(index: number) {
    setDates((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-4">
      {dates.map((date, index) => (
        <div className="grid gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-4" key={`${date.starts_at}-${index}`}>
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
          <FormField label="Orden" name={`date_sort_order_${index}`}>
            <Input
              defaultValue={date.sort_order}
              id={`date_sort_order_${index}`}
              min="0"
              name="date_sort_order"
              type="number"
            />
          </FormField>
          <div className="flex items-end gap-2">
            <FormField label="Fin" name={`date_ends_at_${index}`}>
              <Input
                defaultValue={date.ends_at}
                id={`date_ends_at_${index}`}
                name="date_ends_at"
                type="datetime-local"
              />
            </FormField>
            {dates.length > 1 ? (
              <Button className="mb-0.5" onClick={() => removeDate(index)} variant="subtle">
                Quitar
              </Button>
            ) : null}
          </div>
        </div>
      ))}
      <Button onClick={addDate} variant="secondary">
        Agregar fecha
      </Button>
    </div>
  );
}

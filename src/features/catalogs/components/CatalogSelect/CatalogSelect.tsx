"use client";

import { useState } from "react";

import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import { CatalogQuickCreateDialog } from "@/features/catalogs/components/CatalogQuickCreateDialog";
import type { CatalogSelectProps } from "@/features/catalogs/components/CatalogSelect/types/catalog-select.types";

export function CatalogSelect({ defaultValue = "", error, kind, label, name, options: initialOptions, required }: CatalogSelectProps) {
  const [options, setOptions] = useState(initialOptions);
  const [value, setValue] = useState(defaultValue);

  return (
    <FormField error={error} label={label} name={name} required={required}>
      <div className="space-y-2">
        <Select id={name} name={name} onChange={(event) => setValue(event.target.value)} required={required} value={value}>
          <option value="">Selecciona una opción</option>
          {options.map((option) => <option key={option.id} value={option.id}>{option.label}{option.description ? ` · ${option.description}` : ""}</option>)}
        </Select>
        <CatalogQuickCreateDialog kind={kind} onCreated={(option) => { setOptions((current) => [...current, option]); setValue(option.id); }} />
      </div>
    </FormField>
  );
}

"use client";

import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Textarea } from "@/components/atoms/Textarea";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { FormField } from "@/components/molecules/FormField";
import type { ModuleFormProps } from "@/features/courses/components/ModuleForm/types/module-form.types";
import { saveModuleAction } from "@/features/courses/mutations/course-content.actions";
import { usePersistentAction } from "@/hooks/use-persistent-action";

export function ModuleForm({ courseId, defaultSortOrder = 0, module }: ModuleFormProps) {
  const { onSubmit, pending, state } = usePersistentAction(saveModuleAction, {});
  const fieldSuffix = module?.id ?? "new";
  return (
    <form className="space-y-5" method="post" onSubmit={onSubmit}>
      <input name="course_id" type="hidden" value={courseId} /><input name="id" type="hidden" value={module?.id ?? ""} />
      <FormField error={state.errors?.title?.[0]} label="Título del módulo" name={`module_title_${fieldSuffix}`} required><Input defaultValue={module?.title} id={`module_title_${fieldSuffix}`} name="title" placeholder="Ej. Fundamentos de gestión comercial" required /></FormField>
      <FormField error={state.errors?.description?.[0]} hint="Ayuda al alumno a entender qué aprenderá en esta sección." label="Descripción" name={`module_description_${fieldSuffix}`}><Textarea defaultValue={module?.description ?? ""} id={`module_description_${fieldSuffix}`} name="description" /></FormField>
      <div className="grid gap-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-end">
        <FormField error={state.errors?.sortOrder?.[0]} hint="0 aparece primero." label="Posición" name={`module_order_${fieldSuffix}`}><Input defaultValue={module?.sort_order ?? defaultSortOrder} id={`module_order_${fieldSuffix}`} min="0" name="sort_order" type="number" /></FormField>
        <Label className="flex min-h-11 items-center gap-2"><Checkbox defaultChecked={module?.is_published} name="is_published" /> Visible para alumnos</Label>
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-cci-100 pt-5 sm:flex-row sm:items-center sm:justify-between"><FormActionNotice compact message={state.message} success={state.success} /><Button className="w-full sm:w-auto" disabled={pending} type="submit">{pending ? "Guardando…" : module ? "Guardar módulo" : "Crear módulo"}</Button></div>
    </form>
  );
}

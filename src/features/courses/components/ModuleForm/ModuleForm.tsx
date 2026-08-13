"use client";

import { useActionState } from "react";
import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { saveModuleAction } from "@/features/courses/mutations/course-content.actions";
import type { ModuleFormProps } from "@/features/courses/components/ModuleForm/types/module-form.types";

export function ModuleForm({ courseId, module }: ModuleFormProps) {
  const [state, action, pending] = useActionState(saveModuleAction, {});
  const fieldSuffix = module?.id ?? "new";
  return <form action={action} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[1fr_120px_auto]">
    <input name="course_id" type="hidden" value={courseId} /><input name="id" type="hidden" value={module?.id ?? ""} />
    <div className="space-y-3"><FormField error={state.errors?.title?.[0]} label="Título del módulo" name={`module_title_${fieldSuffix}`}><Input defaultValue={module?.title} id={`module_title_${fieldSuffix}`} name="title" required /></FormField><FormField label="Descripción" name={`module_description_${fieldSuffix}`}><Textarea defaultValue={module?.description ?? ""} id={`module_description_${fieldSuffix}`} name="description" /></FormField><Label className="flex items-center gap-2"><Checkbox defaultChecked={module?.is_published} name="is_published" /> Visible para alumnos</Label>{state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}</div>
    <FormField label="Orden" name={`module_order_${fieldSuffix}`}><Input defaultValue={module?.sort_order ?? 0} id={`module_order_${fieldSuffix}`} min="0" name="sort_order" type="number" /></FormField>
    <div className="flex items-end"><Button disabled={pending} type="submit">{pending ? "Guardando…" : module ? "Actualizar" : "Agregar"}</Button></div>
  </form>;
}

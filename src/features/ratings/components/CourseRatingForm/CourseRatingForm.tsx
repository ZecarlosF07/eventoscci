"use client";

import { useActionState } from "react";

import { Button } from "@/components/atoms/Button";
import { Heading } from "@/components/atoms/Heading";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import {
  deleteCourseRatingAction,
  saveCourseRatingAction,
} from "@/features/ratings/mutations/rating.actions";
import type { CourseRatingFormProps } from "@/features/ratings/types/rating.types";

export function CourseRatingForm({ courseId, rating }: CourseRatingFormProps) {
  const [state, action, pending] = useActionState(saveCourseRatingAction, {});
  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
      <Heading level={2}>¿Cómo calificarías este curso?</Heading>
      <form action={action} className="space-y-5">
        <input name="course_id" type="hidden" value={courseId} />
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">Valoración</legend>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <label className="cursor-pointer" key={value}>
                <input className="peer sr-only" defaultChecked={rating?.rating === value} name="rating" required type="radio" value={value} />
                <span className="inline-flex size-11 items-center justify-center rounded-xl border border-slate-300 text-xl text-slate-400 peer-checked:border-slate-950 peer-checked:bg-slate-950 peer-checked:text-white">★</span>
              </label>
            ))}
          </div>
          {state.errors?.rating?.[0] ? <p className="mt-2 text-sm text-rose-700">{state.errors.rating[0]}</p> : null}
        </fieldset>
        <FormField error={state.errors?.comment?.[0]} label="Comentario (opcional)" name="rating_comment">
          <Textarea defaultValue={rating?.comment ?? ""} id="rating_comment" maxLength={2000} name="comment" />
        </FormField>
        {state.message ? <p className={state.success ? "text-sm font-medium text-emerald-700" : "text-sm font-medium text-rose-700"}>{state.message}</p> : null}
        <div className="flex flex-wrap gap-3">
          <Button disabled={pending} type="submit">{pending ? "Guardando…" : rating ? "Actualizar valoración" : "Guardar valoración"}</Button>
        </div>
      </form>
      {rating ? (
        <form action={deleteCourseRatingAction.bind(null, courseId)}>
          <Button type="submit" variant="secondary">Retirar valoración</Button>
        </form>
      ) : null}
    </section>
  );
}

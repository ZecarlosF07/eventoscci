"use client";

import { Button } from "@/components/atoms/Button";
import { Heading } from "@/components/atoms/Heading";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import {
  deleteCourseRatingAction,
  saveCourseRatingAction,
} from "@/features/ratings/mutations/rating.actions";
import type { CourseRatingFormProps } from "@/features/ratings/types/rating.types";
import { usePersistentAction } from "@/hooks/use-persistent-action";

export function CourseRatingForm({ courseId, rating, tone = "light" }: CourseRatingFormProps) {
  const { onSubmit, pending, state } = usePersistentAction(saveCourseRatingAction, {});
  return (
    <section className={tone === "dark" ? "space-y-4 rounded-3xl border border-white/10 bg-[#111614] p-6" : "space-y-4 rounded-3xl border border-cci-100 bg-white p-6"}>
      <Heading className={tone === "dark" ? "text-white" : undefined} level={2}>¿Cómo calificarías este curso?</Heading>
      <form className="space-y-5" method="post" onSubmit={onSubmit}>
        <input name="course_id" type="hidden" value={courseId} />
        <fieldset>
          <legend className={tone === "dark" ? "mb-2 text-sm font-medium text-slate-300" : "mb-2 text-sm font-medium text-slate-700"}>Valoración</legend>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <label className="cursor-pointer" key={value}>
                <input className="peer sr-only" defaultChecked={rating?.rating === value} name="rating" required type="radio" value={value} />
                <span className="inline-flex size-11 items-center justify-center rounded-xl border border-slate-300 text-xl text-slate-400 peer-checked:border-slate-950 peer-checked:bg-cci-950 peer-checked:text-white">★</span>
              </label>
            ))}
          </div>
          {state.errors?.rating?.[0] ? <p className="mt-2 text-sm text-rose-700">{state.errors.rating[0]}</p> : null}
        </fieldset>
        <FormField error={state.errors?.comment?.[0]} label="Comentario (opcional)" name="rating_comment" tone={tone}>
          <Textarea className={tone === "dark" ? "border-white/15 bg-[#171e1b] text-white focus:border-cci-lime focus:ring-cci-lime/20" : undefined} defaultValue={rating?.comment ?? ""} id="rating_comment" maxLength={2000} name="comment" />
        </FormField>
        <FormActionNotice message={state.message} success={state.success} />
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

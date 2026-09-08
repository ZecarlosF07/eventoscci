"use client";

import { useState, useTransition } from "react";
import type { FormEventHandler } from "react";

import { saveActivityAction } from "@/features/activities/mutations/activity.actions";
import { discardStagedActivityMedia, stageActivityMedia } from "@/features/activities/services/activity-media-upload.client";
import type { ActivityFormState } from "@/features/activities/types/activity-form.types";

export function useActivityFormSubmission(initialState: ActivityFormState) {
  const [state, setState] = useState(initialState);
  const [pending, startTransition] = useTransition();
  const [uploadLabel, setUploadLabel] = useState<string | null>(null);

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const staged = await stageActivityMedia(formData, ({ current, total }) => {
        setUploadLabel(`Subiendo imagen ${current} de ${total}…`);
      });
      if (!staged.ok) {
        setUploadLabel(null);
        setState((current) => ({ ...current, errors: staged.errors, message: "Revisa las imágenes seleccionadas." }));
        return;
      }
      try {
        setUploadLabel(null);
        setState(await saveActivityAction(state, staged.formData));
      } finally {
        setUploadLabel(null);
        await discardStagedActivityMedia(staged.stagedPaths);
      }
    });
  };

  return { onSubmit, pending, state, uploadLabel };
}

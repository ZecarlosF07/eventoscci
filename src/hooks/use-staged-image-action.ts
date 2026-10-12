"use client";

import { useState, useTransition } from "react";
import type { FormEventHandler } from "react";

import {
  discardStagedFormImages,
  stageFormImages,
} from "@/features/media/services/stage-form-images.client";
import type {
  StagedImageActionOptions,
  StagedImageActionState,
} from "@/types/staged-image-action.types";

export function useStagedImageAction<State extends StagedImageActionState>({
  action,
  bucket,
  fields,
  initialState,
}: StagedImageActionOptions<State>) {
  const [state, setState] = useState(initialState);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      setUploading(true);
      const staged = await stageFormImages(formData, bucket, fields);
      if (!staged.ok) {
        setUploading(false);
        setState((current) => ({
          ...current,
          errors: { ...current.errors, ...staged.errors },
          message: "Revisa las imágenes seleccionadas.",
        }));
        return;
      }
      try {
        setUploading(false);
        setState(await action(state, staged.formData));
      } finally {
        setUploading(false);
        await discardStagedFormImages(bucket, staged.paths);
      }
    });
  };

  return { onSubmit, pending, state, uploading };
}

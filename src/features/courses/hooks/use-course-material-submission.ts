"use client";

import { useState, useTransition } from "react";
import type { FormEventHandler } from "react";

import { saveMaterialAction } from "@/features/courses/mutations/course-material.actions";
import {
  discardStagedCourseMaterials,
  stageCourseMaterial,
} from "@/features/courses/services/stage-course-material.client";
import type { MaterialFormState } from "@/features/courses/types/course-content.types";

export function useCourseMaterialSubmission() {
  const [state, setState] = useState<MaterialFormState>({});
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      setUploading(true);
      const staged = await stageCourseMaterial(formData);
      if (!staged.ok) {
        setUploading(false);
        setState({ errors: staged.errors, message: "Revisa el archivo seleccionado." });
        return;
      }
      try {
        setUploading(false);
        setState(await saveMaterialAction(state, staged.formData));
      } finally {
        setUploading(false);
        await discardStagedCourseMaterials(staged.paths);
      }
    });
  };

  return { onSubmit, pending, state, uploading };
}

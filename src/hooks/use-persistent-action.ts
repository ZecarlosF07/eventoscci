"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";

import type {
  PersistentActionResult,
  StatefulServerAction,
} from "@/types/persistent-action.types";

export function usePersistentAction<State>(
  action: StatefulServerAction<State>,
  initialState: State,
): PersistentActionResult<State> {
  const [state, setState] = useState(initialState);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => setState(await action(state, formData)));
  }

  return { onSubmit, pending, state };
}

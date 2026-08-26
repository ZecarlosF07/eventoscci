import type { FormEventHandler } from "react";

export type StatefulServerAction<State> = (
  previousState: State,
  formData: FormData,
) => Promise<State>;

export interface PersistentActionResult<State> {
  onSubmit: FormEventHandler<HTMLFormElement>;
  pending: boolean;
  state: State;
}

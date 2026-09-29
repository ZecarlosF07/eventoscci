"use client";

import { useEffect, useState } from "react";

import type { AdminDetailFetcher, AdminDetailState } from "@/features/admin-details/types/admin-detail.types";

/** Independent, cancellable detail loading; never reuse another request's response. */
export function useAdminDetail<T>(activityId: string, requestId: string, fetcher: AdminDetailFetcher<T>) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<AdminDetailState<T>>({ key: "", data: null, error: "" });
  const resourceKey = `${activityId}/${requestId}/${attempt}`;
  useEffect(() => {
    const controller = new AbortController();
    fetcher(activityId, requestId, controller.signal).then((data) => {
      if (!controller.signal.aborted) setState({ key: resourceKey, data, error: "" });
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setState({ key: resourceKey, data: null, error: error instanceof Error ? error.message : "No se pudo cargar el detalle." });
    });
    return () => controller.abort();
  }, [activityId, requestId, resourceKey, fetcher]);
  const current = state.key === resourceKey ? state : { data: null, error: "" };
  return { ...current, reload: () => setAttempt((previous) => previous + 1) };
}

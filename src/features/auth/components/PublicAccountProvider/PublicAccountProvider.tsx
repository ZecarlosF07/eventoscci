"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type {
  PublicAccountContextValue,
  PublicAccountProviderProps,
} from "@/features/auth/types/public-account.types";

const PublicAccountContext = createContext<PublicAccountContextValue>({
  account: null,
  isLoading: true,
});

export function PublicAccountProvider({ children }: PublicAccountProviderProps) {
  const [state, setState] = useState<PublicAccountContextValue>({ account: null, isLoading: true });

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/account", { cache: "no-store", signal: controller.signal })
      .then(async (response) => response.ok ? response.json() : { account: null })
      .then((payload: { account: PublicAccountContextValue["account"] }) => {
        setState({ account: payload.account, isLoading: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ account: null, isLoading: false });
      });
    return () => controller.abort();
  }, []);

  const value = useMemo(() => state, [state]);
  return <PublicAccountContext.Provider value={value}>{children}</PublicAccountContext.Provider>;
}

export function usePublicAccount(): PublicAccountContextValue {
  return useContext(PublicAccountContext);
}

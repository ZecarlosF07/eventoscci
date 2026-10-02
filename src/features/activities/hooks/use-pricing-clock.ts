"use client";

import { useEffect, useState } from "react";

const MAX_TIMER_MS = 2_147_483_647;

export function usePricingClock(deadline?: string | null, initialNow?: number) {
  const [now, setNow] = useState(() => initialNow ?? Date.now());
  useEffect(() => {
    const update = () => setNow(Date.now());
    let timer: number | undefined;
    const schedule = () => {
      const remaining = deadline ? Date.parse(deadline) - Date.now() : 0;
      if (remaining > 0) timer = window.setTimeout(() => { update(); schedule(); }, Math.min(remaining + 10, MAX_TIMER_MS));
    };
    const initialTimer = window.setTimeout(update, 0);
    schedule();
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(initialTimer);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [deadline]);
  return now;
}

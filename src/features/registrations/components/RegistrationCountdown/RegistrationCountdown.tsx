"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { RegistrationCountdownProps } from "@/features/registrations/types/registration-countdown.types";
import { getCountdownParts } from "@/features/registrations/utils/registration-countdown";

const LABELS = ["Días", "Horas", "Min", "Seg"] as const;

export function RegistrationCountdown({
  deadline,
  initialNow,
}: RegistrationCountdownProps) {
  const router = useRouter();
  const deadlineTimestamp = new Date(deadline).getTime();
  const [now, setNow] = useState(initialNow);
  const refreshed = useRef(false);
  const countdown = getCountdownParts(deadlineTimestamp, now);

  useEffect(() => {
    if (!countdown) {
      if (!refreshed.current) {
        refreshed.current = true;
        router.refresh();
      }
      return;
    }

    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, [countdown, router]);

  if (!countdown) {
    return <p aria-live="polite" className="font-semibold text-white">Inscripciones cerradas</p>;
  }

  const values = [countdown.days, countdown.hours, countdown.minutes, countdown.seconds];
  return (
    <section aria-label="Tiempo restante para inscribirse">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-lime">Inscripciones cierran en</p>
      <div aria-hidden="true" className="mt-3 grid grid-cols-4 gap-2">
        {values.map((value, index) => (
          <div className="rounded-xl bg-white/10 px-2 py-3 text-center ring-1 ring-white/10" key={LABELS[index]}>
            <strong className="block text-xl tabular-nums text-white">{String(value).padStart(2, "0")}</strong>
            <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-wide text-white/60">{LABELS[index]}</span>
          </div>
        ))}
      </div>
      <span className="sr-only">La inscripción permanece abierta hasta la fecha indicada.</span>
    </section>
  );
}

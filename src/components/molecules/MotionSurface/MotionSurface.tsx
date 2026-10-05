"use client";

import { useEffect, useRef } from "react";

import { BANNER_MOTIONS, CARD_REVEAL, CARD_REVEAL_DELAYS } from "@/components/molecules/MotionSurface/constants/decorative-motion.constants";
import type { MotionSurfaceProps } from "@/components/molecules/MotionSurface/types/motion-surface.types";
import { startDecorativeMotion } from "@/components/molecules/MotionSurface/utils/start-decorative-motion";

export function MotionSurface({ animationOrder = 0, children, className, mode }: MotionSurfaceProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const delay = CARD_REVEAL_DELAYS[animationOrder] ?? CARD_REVEAL_DELAYS[2];
    const motions = mode === "banner" ? BANNER_MOTIONS : [{ ...CARD_REVEAL, options: { ...CARD_REVEAL.options, delay } }];
    return startDecorativeMotion(ref.current, motions, mode === "banner");
  }, [animationOrder, mode]);

  if (mode === "card") return <article className={className} data-motion-state="static" ref={(node) => { ref.current = node; }}>{children}</article>;
  return <div className={className} data-motion-state="static" ref={(node) => { ref.current = node; }}>{children}</div>;
}

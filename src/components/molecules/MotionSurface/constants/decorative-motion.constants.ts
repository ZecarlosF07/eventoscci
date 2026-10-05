import type { DecorativeMotion } from "@/components/molecules/MotionSurface/types/motion-surface.types";

export const MOTION_PREFERENCE = "(prefers-reduced-motion: reduce)";
export const BANNER_PAUSE_CONTROL_ID = "pause-banner-motion";
export const CARD_REVEAL_DELAYS = [0, 90, 180];
export const CARD_REVEAL: DecorativeMotion = {
  keyframes: [{ opacity: 0, transform: "translateY(18px) scale(0.985)" }, { opacity: 1, transform: "translateY(0) scale(1)" }],
  options: { duration: 600, easing: "cubic-bezier(0.22,1,0.36,1)", fill: "both" },
};

export const BANNER_MOTIONS: DecorativeMotion[] = [
  {
    selector: '[data-banner-halo="primary"]',
    keyframes: [{ transform: "translate(-25%, -20%)" }, { transform: "translate(25%, 20%)" }],
    options: { duration: 2500, easing: "ease-in-out", iterations: Infinity, direction: "alternate" },
  },
  {
    selector: '[data-banner-halo="secondary"]',
    keyframes: [{ transform: "translate(25%, 20%)" }, { transform: "translate(-25%, -20%)" }],
    options: { duration: 3000, easing: "ease-in-out", iterations: Infinity, direction: "alternate" },
  },
  {
    selector: '[data-banner-led="top"]',
    keyframes: [{ transform: "translateX(-100%)" }, { transform: "translateX(200%)" }],
    options: { duration: 1800, easing: "linear", iterations: Infinity },
  },
  {
    selector: '[data-banner-led="bottom"]',
    keyframes: [{ transform: "translateX(200%)" }, { transform: "translateX(-100%)" }],
    options: { duration: 2400, easing: "linear", iterations: Infinity },
  },
];

import type { ReactNode } from "react";

export interface DecorativeMotion {
  selector?: string;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

export interface MotionSurfaceProps {
  children: ReactNode;
  className: string;
  mode: "banner" | "card";
  animationOrder?: number;
}

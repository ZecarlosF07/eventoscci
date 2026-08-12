import type { HTMLAttributes } from "react";

export type TextElement = "p" | "span";
export type TextSize = "sm" | "md" | "lg";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextElement;
  size?: TextSize;
}

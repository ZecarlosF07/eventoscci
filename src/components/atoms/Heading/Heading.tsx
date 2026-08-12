import { createElement } from "react";

import type { HeadingProps } from "@/components/atoms/Heading/types/heading.types";
import { classNames } from "@/utils/class-names";

const LEVEL_STYLES = {
  1: "text-4xl font-semibold tracking-tight sm:text-5xl",
  2: "text-2xl font-semibold tracking-tight sm:text-3xl",
  3: "text-lg font-semibold",
  4: "text-base font-semibold",
};

export function Heading({
  children,
  className,
  level = 2,
}: HeadingProps) {
  return createElement(
    `h${level}`,
    { className: classNames("text-slate-950", LEVEL_STYLES[level], className) },
    children,
  );
}

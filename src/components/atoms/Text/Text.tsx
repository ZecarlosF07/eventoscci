import { createElement } from "react";

import type { TextProps } from "@/components/atoms/Text/types/text.types";
import { classNames } from "@/utils/class-names";

const SIZE_STYLES = {
  lg: "text-lg leading-8",
  md: "text-base leading-7",
  sm: "text-sm leading-6",
};

export function Text({
  as = "p",
  className,
  size = "md",
  ...props
}: TextProps) {
  return createElement(as, {
    className: classNames("text-slate-600", SIZE_STYLES[size], className),
    ...props,
  });
}

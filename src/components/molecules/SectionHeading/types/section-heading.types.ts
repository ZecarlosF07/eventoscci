import type { HeadingProps } from "@/components/atoms/Heading/types/heading.types";

export interface SectionHeadingProps {
  description?: string;
  eyebrow?: string;
  level?: HeadingProps["level"];
  title: string;
}

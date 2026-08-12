import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { SectionHeadingProps } from "@/components/molecules/SectionHeading/types/section-heading.types";

export function SectionHeading({
  description,
  eyebrow,
  title,
}: SectionHeadingProps) {
  return (
    <div className="max-w-2xl space-y-3">
      {eyebrow ? (
        <Text
          className="font-semibold uppercase tracking-[0.18em] text-slate-500"
          size="sm"
        >
          {eyebrow}
        </Text>
      ) : null}
      <Heading level={2}>{title}</Heading>
      {description ? <Text>{description}</Text> : null}
    </div>
  );
}

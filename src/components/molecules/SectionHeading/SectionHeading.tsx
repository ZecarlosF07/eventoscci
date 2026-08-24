import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { SectionHeadingProps } from "@/components/molecules/SectionHeading/types/section-heading.types";

export function SectionHeading({
  description,
  eyebrow,
  level = 1,
  title,
}: SectionHeadingProps) {
  return (
    <div className="max-w-2xl space-y-3">
      {eyebrow ? (
        <Text
          className="font-bold uppercase tracking-[0.18em] text-cci-600"
          size="sm"
        >
          {eyebrow}
        </Text>
      ) : null}
      <Heading level={level}>{title}</Heading>
      {description ? <Text>{description}</Text> : null}
    </div>
  );
}

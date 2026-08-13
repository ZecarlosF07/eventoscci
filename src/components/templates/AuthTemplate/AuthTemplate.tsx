import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { AuthTemplateProps } from "@/components/templates/AuthTemplate/types/auth-template.types";

export function AuthTemplate({ children, description, eyebrow = "Campus Virtual CCI", footer, title }: AuthTemplateProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl justify-center px-5 py-12 sm:px-8 sm:py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <Text className="font-semibold uppercase tracking-[0.18em]" size="sm">{eyebrow}</Text>
        <Heading className="mt-3" level={1}>{title}</Heading>
        <Text className="mt-3 mb-8">{description}</Text>
        {children}
        {footer ? <div className="mt-7 border-t border-slate-200 pt-6 text-sm text-slate-600">{footer}</div> : null}
      </div>
    </section>
  );
}

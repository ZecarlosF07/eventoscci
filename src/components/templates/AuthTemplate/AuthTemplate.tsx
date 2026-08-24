import { BrandLogo } from "@/components/atoms/BrandLogo";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { AuthTemplateProps } from "@/components/templates/AuthTemplate/types/auth-template.types";

export function AuthTemplate({ children, description, eyebrow = "Campus Virtual CCI", footer, title }: AuthTemplateProps) {
  return (
    <section className="mx-auto grid w-full max-w-7xl overflow-hidden bg-white lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[0.8fr_1.2fr] lg:rounded-[2rem] lg:shadow-xl lg:shadow-cci-950/8 xl:my-10">
      <div className="relative hidden overflow-hidden bg-cci-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <BrandLogo className="w-48" light preload />
        <div className="relative z-10">
          <p className="font-display text-4xl leading-tight">Tu crecimiento continúa aquí.</p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">Accede a cursos, progreso académico y certificados con el respaldo de la Cámara de Comercio de Ica.</p>
        </div>
        <div aria-hidden="true" className="absolute -bottom-32 -right-24 size-96 rounded-full border border-cci-lime/35" />
        <div aria-hidden="true" className="absolute -bottom-20 -right-12 size-72 rounded-full border border-cci-lime/20" />
      </div>
      <div className="flex items-center px-5 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-2xl">
          <div className="mb-8 lg:hidden"><BrandLogo className="w-44" preload /></div>
          <Text className="font-bold uppercase tracking-[0.18em] text-cci-600" size="sm">{eyebrow}</Text>
          <Heading className="mt-3" level={1}>{title}</Heading>
          <Text className="mb-8 mt-3">{description}</Text>
          {children}
          {footer ? <div className="mt-7 border-t border-cci-100 pt-6 text-sm text-slate-600 [&_a]:text-cci-800 [&_a]:underline-offset-4 [&_a]:hover:underline">{footer}</div> : null}
        </div>
      </div>
    </section>
  );
}

import { Heading } from "@/components/atoms/Heading";
import type { HomePageTemplateProps } from "@/components/templates/HomePageTemplate/types/home-page-template.types";
import { HomeActivitySection } from "@/features/home/components/HomeActivitySection";
import { HomeCourseSection } from "@/features/home/components/HomeCourseSection";
import { HomeHero } from "@/features/home/components/HomeHero";
import { HomeSearch } from "@/features/home/components/HomeSearch";

export function HomePageTemplate({ content }: HomePageTemplateProps) {
  return (
    <div>
      <HomeHero activities={[...content.events, ...content.trainings]} />
      <HomeSearch />
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-2 sm:px-8 sm:pb-16">
        <HomeActivitySection activities={content.events} description="Encuentros para conectar con la comunidad empresarial." href="/eventos" title="Próximos eventos en Ica, Perú" />
        <HomeActivitySection activities={content.trainings} description="Aprendizaje práctico para ti y tu empresa." href="/capacitaciones" title="Capacitaciones destacadas" />
        <HomeCourseSection />
        <section className="mt-6 rounded-2xl border border-cci-100 bg-cci-100 p-5 sm:p-6 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-2xl">
            <Heading level={2}>Más oportunidades para los asociados CCI</Heading>
            <p className="mt-2 text-sm leading-6 text-slate-700">Accede a precios preferenciales y encuentros exclusivos.</p>
          </div>
          <a className="mt-4 inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-cci-950 px-5 text-sm font-bold text-white hover:bg-cci-800 lg:mt-0" href="https://camaraica.org.pe/formulario-asociados/" rel="noreferrer" target="_blank">Quiero asociarme</a>
        </section>
      </div>
    </div>
  );
}

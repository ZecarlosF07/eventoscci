import { Heading } from "@/components/atoms/Heading";
import type { HomePageTemplateProps } from "@/components/templates/HomePageTemplate/types/home-page-template.types";
import { HomeActivitySection } from "@/features/home/components/HomeActivitySection";
import { HomeCourseSection } from "@/features/home/components/HomeCourseSection";
import { HomeHero } from "@/features/home/components/HomeHero";
import { HomeSearch } from "@/features/home/components/HomeSearch";

export function HomePageTemplate({ content }: HomePageTemplateProps) {
  return (
    <div>
      <HomeHero activity={content.featuredActivity} />
      <HomeSearch />
      <div className="mx-auto max-w-[90rem] px-5 pb-20 pt-2 sm:px-8 sm:pt-4">
        <HomeActivitySection activities={content.events} description="Encuentros para conectar con oportunidades, conocimiento y comunidad empresarial." href="/eventos" title="Próximos eventos" />
        <HomeActivitySection activities={content.trainings} description="Experiencias prácticas para fortalecer tus capacidades y las de tu empresa." href="/capacitaciones" title="Capacitaciones destacadas" />
        <HomeCourseSection />
        <section className="mt-16 overflow-hidden rounded-[2rem] border border-cci-100 bg-cci-100 px-6 py-10 sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cci-600">Comunidad empresarial</p>
            <Heading className="mt-3" level={2}>Más oportunidades para los asociados CCI</Heading>
            <p className="mt-4 leading-7 text-slate-700">Accede a tarifas preferenciales y actividades exclusivas dentro de una red que impulsa el desarrollo empresarial de Ica.</p>
          </div>
          <a className="mt-7 inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-cci-950 px-5 text-sm font-bold text-white hover:bg-cci-800 lg:mt-0" href="https://camaraica.org.pe/formulario-asociados/" rel="noreferrer" target="_blank">Quiero asociarme</a>
        </section>
      </div>
    </div>
  );
}

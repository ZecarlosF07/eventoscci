import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import type { HomeHeroProps } from "@/features/home/components/HomeHero/types/home-hero.types";
import { ACTIVITY_TYPE_LABELS } from "@/features/activities/constants/activity.constants";
import {
  getActivityBannerUrl,
  getModalityLabel,
  getNextActivityDate,
} from "@/features/activities/utils/activity-formatters";
import { getPublicActivityRoute } from "@/features/activities/utils/activity-routes";

const HERO_DATE_FORMATTER = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "long",
  timeZone: "America/Lima",
  year: "numeric",
});

const HERO_TIME_FORMATTER = new Intl.DateTimeFormat("es-PE", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Lima",
});

export function HomeHero({ activity }: HomeHeroProps) {
  const bannerUrl = activity ? getActivityBannerUrl(activity.banner_path) : null;
  const nextDate = activity ? getNextActivityDate(activity.dates) : null;
  const nextDateValue = nextDate ? new Date(nextDate.starts_at) : null;

  return (
    <section className="overflow-hidden bg-cci-950 text-white">
      <div className="mx-auto grid max-w-[90rem] lg:min-h-[34rem] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex flex-col justify-center px-5 py-12 sm:px-8 lg:px-12 lg:py-14">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cci-lime">
            {activity ? "Próxima actividad" : "Eventos y formación CCI"}
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            {activity ? activity.title : "Conecta, aprende y haz crecer tu empresa"}
          </h1>
          <p className="mt-4 line-clamp-2 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
            {activity?.short_description ??
              "Descubre encuentros empresariales, capacitaciones prácticas y cursos para avanzar junto a la Cámara de Comercio de Ica."}
          </p>
          {activity ? (
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge className="bg-white/10 text-white ring-white/15">{ACTIVITY_TYPE_LABELS[activity.type]}</Badge>
              <Badge className="bg-white/10 text-white ring-white/15">{getModalityLabel(activity.modality)}</Badge>
              {activity.category ? <Badge className="bg-white/10 text-white ring-white/15">{activity.category.name}</Badge> : null}
            </div>
          ) : null}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cci-lime px-5 text-sm font-bold text-cci-950 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              href={activity ? getPublicActivityRoute(activity.type, activity.slug) : "/eventos"}
            >
              {activity ? "Ver actividad" : "Explorar eventos"} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className={`relative min-h-[19rem] overflow-hidden lg:min-h-full ${bannerUrl ? "bg-cci-900" : "bg-cci-950"}`}>
          {bannerUrl ? (
            <>
              <Image alt={`Portada de ${activity?.title ?? "actividad CCI"}`} className="object-cover" fill preload sizes="(min-width: 1024px) 55vw, 100vw" src={bannerUrl} />
              <div className="absolute inset-0 bg-gradient-to-t from-cci-950/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-cci-950/25 lg:via-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center px-8 py-10 sm:px-12 lg:px-16" aria-hidden="true">
              <div className="w-full border-l border-cci-lime/40 pl-7 sm:pl-10">
                {nextDateValue ? (
                  <>
                    <div className="flex items-center gap-3 text-cci-lime">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-cci-lime text-cci-950">
                        <svg fill="none" height="20" viewBox="0 0 24 24" width="20">
                          <path d="M7 3v3M17 3v3M4.5 9.5h15M6.5 5h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                        </svg>
                      </span>
                      <p className="text-xs font-bold uppercase tracking-[0.2em]">Próxima fecha</p>
                    </div>
                    <p className="mt-5 text-2xl font-semibold capitalize text-white sm:text-3xl">
                      {HERO_DATE_FORMATTER.format(nextDateValue)}
                    </p>
                    <p className="mt-2 text-lg text-white/65">A las {HERO_TIME_FORMATTER.format(nextDateValue)}</p>
                  </>
                ) : (
                  <p className="max-w-md text-2xl font-semibold leading-tight text-white/75 sm:text-3xl">Nuevas oportunidades para conectar y aprender.</p>
                )}
              </div>
            </div>
          )}

          {bannerUrl && nextDateValue ? (
            <div className="absolute left-5 top-5 flex items-center gap-4 rounded-2xl border border-white/15 bg-cci-950/88 p-3.5 shadow-xl backdrop-blur-md sm:left-6 sm:top-6 sm:p-4">
              <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cci-lime text-cci-950">
                <svg fill="none" height="20" viewBox="0 0 24 24" width="20">
                  <path d="M7 3v3M17 3v3M4.5 9.5h15M6.5 5h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-cci-lime">Próxima fecha</p>
                <p className="mt-1 text-sm font-semibold capitalize text-white sm:text-base">{HERO_DATE_FORMATTER.format(nextDateValue)} · {HERO_TIME_FORMATTER.format(nextDateValue)}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

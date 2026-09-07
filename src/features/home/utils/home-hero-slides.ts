import { ROUTES } from "@/constants/routes";
import type { ActivityListItem } from "@/features/activities/types/activity.types";
import { createActivityCarouselSlides } from "@/features/catalog/utils/catalog-carousel";
import type { CatalogCarouselSlide } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-hero-carousel.types";

const EDITORIAL_SLIDES: CatalogCarouselSlide[] = [
  {
    badge: "Agenda empresarial",
    bannerUrl: null,
    ctaLabel: "Explorar eventos",
    description: "Encuentra espacios para conectar con profesionales, empresas y nuevas oportunidades de negocio.",
    href: ROUTES.events,
    id: "home-editorial-events",
    kindLabel: "Conecta con el ecosistema empresarial",
    meta: "Encuentros y experiencias CCI",
    priceLabel: "",
    title: "Haz crecer tu red y descubre nuevas oportunidades.",
    visualMode: "feature",
  },
  {
    badge: "Formación práctica",
    bannerUrl: null,
    ctaLabel: "Ver capacitaciones",
    description: "Fortalece tus capacidades con experiencias prácticas pensadas para profesionales y empresas.",
    href: ROUTES.trainings,
    id: "home-editorial-trainings",
    kindLabel: "Impulsa tus capacidades",
    meta: "Aprendizaje para aplicar y avanzar",
    priceLabel: "",
    title: "Aprende hoy lo que tu crecimiento necesita mañana.",
    visualMode: "feature",
  },
  {
    badge: "Campus virtual",
    bannerUrl: null,
    ctaLabel: "Descubrir cursos",
    description: "Accede a formación grabada, avanza a tu propio ritmo y conserva tus logros en el Campus CCI.",
    href: ROUTES.courses,
    id: "home-editorial-courses",
    kindLabel: "Aprende a tu ritmo",
    meta: "Cursos y certificación CCI",
    priceLabel: "",
    title: "Convierte el conocimiento en nuevas posibilidades.",
    visualMode: "feature",
  },
];

export function createHomeHeroSlides(activities: ActivityListItem[]): CatalogCarouselSlide[] {
  const activitySlides = createActivityCarouselSlides(activities);
  return activitySlides.length ? activitySlides : EDITORIAL_SLIDES;
}

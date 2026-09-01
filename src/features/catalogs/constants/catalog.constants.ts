import type { CatalogKind } from "@/features/catalogs/types/catalog.types";

export const CATALOG_ROUTE_SEGMENTS: Record<CatalogKind, string> = {
  categories: "categorias",
  contacts: "contactos",
  speakers: "ponentes",
  venues: "lugares",
};

export const CATALOG_TITLES: Record<CatalogKind, string> = {
  categories: "Categorías",
  contacts: "Contactos de atención",
  speakers: "Ponentes e instructores",
  venues: "Lugares",
};

export const CATALOG_DESCRIPTIONS: Record<CatalogKind, string> = {
  categories: "Organiza los temas utilizados en eventos y capacitaciones.",
  contacts: "Reutiliza responsables, WhatsApp y correo de atención.",
  speakers: "Administra perfiles compartidos entre actividades y cursos.",
  venues: "Centraliza direcciones y mapas de las sedes físicas.",
};

export const CATALOG_KINDS = Object.keys(CATALOG_ROUTE_SEGMENTS) as CatalogKind[];

export function getCatalogKind(segment: string): CatalogKind | null {
  return CATALOG_KINDS.find((kind) => CATALOG_ROUTE_SEGMENTS[kind] === segment) ?? null;
}

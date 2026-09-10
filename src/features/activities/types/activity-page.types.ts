import type {
  ActivityAdminFilters,
  ActivityFilters,
  ActivityStatus,
  ActivityType,
} from "@/features/activities/types/activity.types";

export interface PublicCatalogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export interface ActivityDetailPageProps {
  params: Promise<{ slug: string }>;
}

export interface AdminActivityListPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export interface AdminActivityEditPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parsePublicFilters(
  params: Record<string, string | string[] | undefined>,
): ActivityFilters {
  const modality = firstValue(params.modalidad);
  const price = firstValue(params.precio);
  return {
    category: firstValue(params.categoria),
    date: firstValue(params.fecha),
    modality:
      modality === "in_person" || modality === "virtual" || modality === "hybrid"
        ? modality
        : undefined,
    price: price === "free" || price === "paid" ? price : undefined,
    query: firstValue(params.q),
    page: Math.max(1, Number(firstValue(params.pagina) ?? 1) || 1),
  };
}

export function hasPublicActivityFilters(filters: ActivityFilters): boolean {
  return Boolean(filters.category || filters.date || filters.modality || filters.price || filters.query);
}

export function parseAdminFilters(
  params: Record<string, string | string[] | undefined>,
  type: ActivityType,
): ActivityAdminFilters {
  const status = firstValue(params.estado);
  const view: ActivityAdminFilters["view"] = firstValue(params.vista) === "archivados" || status === "archived"
    ? "archived"
    : "active";
  const allowedStatuses: ActivityStatus[] = [
    "archived",
    "cancelled",
    "draft",
    "finished",
    "published",
  ];
  return {
    page: Math.max(1, Number(firstValue(params.pagina) ?? 1) || 1),
    query: firstValue(params.q),
    status: view === "active" && allowedStatuses.includes(status as ActivityStatus) && status !== "archived"
      ? (status as ActivityStatus)
      : undefined,
    type,
    view,
  };
}

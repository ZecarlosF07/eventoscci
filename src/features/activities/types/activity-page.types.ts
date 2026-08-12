import type {
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
  };
}

export function parseAdminFilters(
  params: Record<string, string | string[] | undefined>,
  type: ActivityType,
) {
  const status = firstValue(params.estado);
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
    status: allowedStatuses.includes(status as ActivityStatus)
      ? (status as ActivityStatus)
      : undefined,
    type,
  };
}

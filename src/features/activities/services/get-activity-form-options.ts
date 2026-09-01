import "server-only";

import { getCatalogOptions } from "@/features/catalogs/queries/get-catalog-options";

export async function getActivityFormOptions() {
  return getCatalogOptions();
}

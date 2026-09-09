import type { Metadata } from "next";

import { SearchResultsTemplate } from "@/components/templates/SearchResultsTemplate";
import { getGlobalSearchResults } from "@/features/search/queries/get-global-search-results";
import type { GlobalSearchPageProps } from "@/features/search/types/search.types";
import { buildNoIndexMetadata } from "@/features/seo/services/build-page-metadata";

export const metadata: Metadata = buildNoIndexMetadata("Buscar", true);

export default async function SearchPage({ searchParams }: GlobalSearchPageProps) {
  const params = await searchParams;
  const queryValue = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = queryValue?.trim() ?? "";
  const results = await getGlobalSearchResults(query);

  return <SearchResultsTemplate query={query} results={results} />;
}

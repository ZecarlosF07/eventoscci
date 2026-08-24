import type { Metadata } from "next";

import { SearchResultsTemplate } from "@/components/templates/SearchResultsTemplate";
import { getGlobalSearchResults } from "@/features/search/queries/get-global-search-results";
import type { GlobalSearchPageProps } from "@/features/search/types/search.types";

export const metadata: Metadata = {
  description: "Busca eventos, capacitaciones y cursos de la Cámara de Comercio de Ica.",
  title: "Buscar",
};

export default async function SearchPage({ searchParams }: GlobalSearchPageProps) {
  const params = await searchParams;
  const queryValue = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = queryValue?.trim() ?? "";
  const results = await getGlobalSearchResults(query);

  return <SearchResultsTemplate query={query} results={results} />;
}

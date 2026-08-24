import type { GlobalSearchResults } from "@/features/search/types/search.types";

export interface SearchResultsTemplateProps {
  query: string;
  results: GlobalSearchResults;
}

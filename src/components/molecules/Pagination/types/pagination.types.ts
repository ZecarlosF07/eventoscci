export interface PaginationProps {
  page: number;
  pageCount: number;
  pathname: string;
  searchParams?: Record<string, string | undefined>;
}

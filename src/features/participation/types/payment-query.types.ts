export interface PaymentFilterQuery<T> {
  eq: (column: string, value: string) => T;
  gt: (column: string, value: number) => T;
  ilike: (column: string, pattern: string) => T;
}

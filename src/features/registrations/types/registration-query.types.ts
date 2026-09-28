export interface RegistrationFilterQuery<T> {
  eq: (column: string, value: string) => T;
  in: (column: string, values: string[]) => T;
  is: (column: string, value: null) => T;
  not: (column: string, operator: string, value: null) => T;
  or: (filters: string) => T;
  ilike: (column: string, pattern: string) => T;
}

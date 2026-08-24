export interface ProductionVariable {
  kind: "secret" | "public";
  name: string;
  url?: boolean;
}

export interface SmokeExpectation {
  contains?: string;
  path: string;
  status: number;
}

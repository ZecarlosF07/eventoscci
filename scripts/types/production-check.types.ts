export interface ProductionVariable {
  kind: "secret" | "public";
  name: string;
  url?: boolean;
}

export interface SmokeExpectation {
  path: string;
  status: number;
}

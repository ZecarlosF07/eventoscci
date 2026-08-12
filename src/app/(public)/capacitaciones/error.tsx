"use client";

import { Button } from "@/components/atoms/Button";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { CatalogErrorProps } from "@/app/types/catalog-error.types";

export default function TrainingsError({ reset }: CatalogErrorProps) {
  return <div className="space-y-4 py-20 text-center"><Heading level={2}>No pudimos cargar las capacitaciones</Heading><Text>Inténtalo nuevamente en unos momentos.</Text><Button onClick={reset}>Reintentar</Button></div>;
}

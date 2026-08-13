"use client";

import type { ErrorPageProps } from "@/app/types/error-page.types";
import { Button } from "@/components/atoms/Button";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";

export default function AdminError({ error, reset }: ErrorPageProps) {
  console.error("Error en el módulo administrativo.", error);
  return <div className="rounded-3xl border border-rose-200 bg-white p-8"><Heading level={1}>No pudimos completar la consulta</Heading><Text className="mt-3">Reintenta la operación. No se muestran detalles internos de base de datos.</Text><Button className="mt-6" onClick={reset}>Reintentar</Button></div>;
}

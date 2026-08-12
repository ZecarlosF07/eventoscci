"use client";

import type { ErrorPageProps } from "@/app/types/error-page.types";
import { Button } from "@/components/atoms/Button";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  console.error("Error de renderizado en la aplicación.", error);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
      <Heading level={1}>No pudimos cargar esta sección</Heading>
      <Text className="mt-4">
        Intenta nuevamente. Si el problema continúa, revisa la conexión y los
        registros de la aplicación.
      </Text>
      <div className="mt-8">
        <Button onClick={reset}>Reintentar</Button>
      </div>
    </main>
  );
}

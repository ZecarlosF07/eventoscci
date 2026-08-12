import Link from "next/link";

import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
      <Heading level={1}>Página no encontrada</Heading>
      <Text className="mt-4">
        La dirección solicitada no existe o todavía no forma parte de este hito.
      </Text>
      <Link
        className="mt-8 inline-flex w-fit rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        href="/"
      >
        Volver al inicio
      </Link>
    </main>
  );
}

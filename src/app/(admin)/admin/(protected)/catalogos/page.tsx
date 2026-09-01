import Link from "next/link";

import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import {
  CATALOG_DESCRIPTIONS,
  CATALOG_KINDS,
  CATALOG_ROUTE_SEGMENTS,
  CATALOG_TITLES,
} from "@/features/catalogs/constants/catalog.constants";

export default function CatalogsPage() {
  return <div className="space-y-7"><SectionHeading description="Centraliza la información repetitiva para crear actividades y cursos con menos trabajo." eyebrow="Datos reutilizables" title="Catálogos" /><div className="grid gap-5 sm:grid-cols-2">{CATALOG_KINDS.map((kind) => <Link className="group rounded-3xl border border-cci-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cci-300 hover:shadow-lg" href={`/admin/catalogos/${CATALOG_ROUTE_SEGMENTS[kind]}`} key={kind}><span className="grid size-11 place-items-center rounded-2xl bg-cci-lime font-bold text-cci-950">→</span><Heading className="mt-5 group-hover:text-cci-700" level={3}>{CATALOG_TITLES[kind]}</Heading><Text className="mt-2" size="sm">{CATALOG_DESCRIPTIONS[kind]}</Text></Link>)}</div></div>;
}

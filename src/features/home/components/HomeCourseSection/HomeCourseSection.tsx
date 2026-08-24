import Link from "next/link";

import { Heading } from "@/components/atoms/Heading";
import { HomeCampusVideo } from "@/features/home/components/HomeCampusVideo";

export function HomeCourseSection() {
  return (
    <section aria-label="Campus Virtual CCI" className="py-8 sm:py-10">
      <div className="mx-auto max-w-[90rem]">
        <div className="relative overflow-hidden rounded-[2rem] bg-cci-lime p-2 sm:p-3">
          <span aria-hidden="true" className="absolute -right-16 -top-32 size-72 rounded-full border border-cci-950/15" />
          <span aria-hidden="true" className="absolute -right-3 -top-24 size-56 rounded-full border border-cci-950/10" />
          <Heading className="relative mx-auto max-w-6xl px-4 py-5 text-2xl leading-tight text-cci-950 sm:px-6 sm:py-6 sm:text-3xl lg:text-4xl" level={2}>
            Convierte el conocimiento en oportunidades para tu empresa
          </Heading>
          <div className="relative mx-auto max-w-6xl">
            <HomeCampusVideo />
          </div>
          <div className="relative flex justify-center pb-3 pt-5 sm:pb-4 sm:pt-6">
            <Link className="inline-flex min-h-12 items-center gap-2 rounded-full bg-cci-950 px-6 text-sm font-bold text-white shadow-lg shadow-cci-950/15 transition hover:-translate-y-0.5 hover:bg-cci-800 hover:shadow-xl" href="/cursos">
              Explorar cursos <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

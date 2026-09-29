import { Spinner } from "@/components/atoms/Spinner";

export function PaymentDetailLoading() {
  return <div aria-busy="true" className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
    <Spinner className="size-8 motion-reduce:animate-none" label="Cargando detalle…" />
    <p aria-hidden="true" className="text-sm font-medium text-slate-600">Cargando detalle…</p>
  </div>;
}

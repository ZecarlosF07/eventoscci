import { SITE_CONFIG } from "@/config/site";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-8 text-sm text-slate-500 sm:px-8">
        <p className="font-medium text-slate-700">{SITE_CONFIG.organization}</p>
        <p>Fundación técnica del sistema de eventos y formación.</p>
      </div>
    </footer>
  );
}

import type { ResponsiveTableFrameProps } from "@/components/molecules/ResponsiveTableFrame/types/responsive-table-frame.types";

export function ResponsiveTableFrame({ children, className = "", label }: ResponsiveTableFrameProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-cci-100 bg-white ${className}`}>
      <p className="border-b border-cci-100 bg-cci-50 px-4 py-2 text-xs text-slate-500 sm:hidden">
        Desliza horizontalmente para ver todos los datos.
      </p>
      <div
        aria-label={label}
        className="overflow-x-auto overscroll-x-contain outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cci-lime"
        role="region"
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}

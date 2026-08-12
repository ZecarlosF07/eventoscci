import type { TextareaProps } from "@/components/atoms/Textarea/types/textarea.types";
import { classNames } from "@/utils/class-names";

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={classNames(
        "min-h-28 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100",
        className,
      )}
      {...props}
    />
  );
}

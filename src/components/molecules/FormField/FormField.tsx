import { Label } from "@/components/atoms/Label";
import { Text } from "@/components/atoms/Text";
import type { FormFieldProps } from "@/components/molecules/FormField/types/form-field.types";

export function FormField({
  children,
  error,
  hint,
  label,
  name,
  required,
  tone = "light",
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className={tone === "dark" ? "text-slate-200" : undefined} htmlFor={name}>
        {label}
        {required ? <span className="ml-1 text-rose-700">*</span> : null}
      </Label>
      {children}
      {hint && !error ? <Text className={tone === "dark" ? "text-slate-400" : undefined} size="sm">{hint}</Text> : null}
      {error ? (
        <p className="text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

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
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required ? <span className="ml-1 text-rose-700">*</span> : null}
      </Label>
      {children}
      {hint && !error ? <Text size="sm">{hint}</Text> : null}
      {error ? (
        <p className="text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

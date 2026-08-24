import type { ButtonProps } from "@/components/atoms/Button/types/button.types";
import { classNames } from "@/utils/class-names";

const VARIANT_STYLES = {
  primary:
    "bg-cci-950 text-white shadow-sm hover:bg-cci-800 hover:shadow-md focus-visible:outline-cci-lime",
  secondary:
    "border border-cci-200 bg-white text-cci-950 hover:border-cci-400 hover:bg-cci-50 focus-visible:outline-cci-800",
  subtle:
    "bg-cci-100 text-cci-950 hover:bg-cci-200 focus-visible:outline-cci-800",
};

export function Button({
  className,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(
        "inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_STYLES[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}

"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/atoms/Button";
import type { SubmitButtonProps } from "@/components/atoms/SubmitButton/types/submit-button.types";

export function SubmitButton({
  children,
  disabled,
  pendingLabel,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} disabled={disabled || pending} type="submit">
      {pending ? pendingLabel : children}
    </Button>
  );
}

import type { ButtonProps } from "@/components/atoms/Button/types/button.types";

export interface SubmitButtonProps extends Omit<ButtonProps, "type"> {
  pendingLabel: string;
}

import type { SkeletonProps } from "@/components/atoms/Skeleton/types/skeleton.types";
import { classNames } from "@/utils/class-names";

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={classNames(
        "animate-pulse rounded-lg bg-slate-200",
        className,
      )}
      {...props}
    />
  );
}

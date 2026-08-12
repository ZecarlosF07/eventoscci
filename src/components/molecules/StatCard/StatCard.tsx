import { Text } from "@/components/atoms/Text";
import type { StatCardProps } from "@/components/molecules/StatCard/types/stat-card.types";

export function StatCard({ detail, label, value }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Text className="font-medium text-slate-500" size="sm">
        {label}
      </Text>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <Text className="mt-2" size="sm">
        {detail}
      </Text>
    </article>
  );
}

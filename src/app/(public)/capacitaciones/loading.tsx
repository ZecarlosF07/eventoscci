import { Skeleton } from "@/components/atoms/Skeleton";

export default function TrainingsLoading() {
  return <div className="grid gap-6 py-16 md:grid-cols-3"><Skeleton className="h-96" /><Skeleton className="h-96" /><Skeleton className="h-96" /></div>;
}

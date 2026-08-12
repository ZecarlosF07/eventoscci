import { Skeleton } from "@/components/atoms/Skeleton";

export default function AdminActivitiesLoading() {
  return <div className="space-y-5"><Skeleton className="h-24" /><Skeleton className="h-16" /><Skeleton className="h-96" /></div>;
}

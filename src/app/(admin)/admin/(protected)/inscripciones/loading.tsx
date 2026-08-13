import { Skeleton } from "@/components/atoms/Skeleton";

export default function RegistrationsLoading() {
  return <div className="space-y-5"><Skeleton className="h-20" /><Skeleton className="h-40" /><Skeleton className="h-96" /></div>;
}

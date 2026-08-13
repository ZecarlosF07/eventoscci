import { Skeleton } from "@/components/atoms/Skeleton";
export default function MyCoursesLoading() { return <div className="space-y-6"><Skeleton className="h-12 w-1/2" /><div className="grid gap-6 md:grid-cols-3"><Skeleton className="h-96" /><Skeleton className="h-96" /></div></div>; }

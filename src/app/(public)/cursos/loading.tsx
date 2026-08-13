import { Skeleton } from "@/components/atoms/Skeleton";
export default function CoursesLoading() { return <div className="space-y-6 py-16"><Skeleton className="h-12 w-2/3" /><div className="grid gap-6 md:grid-cols-3"><Skeleton className="h-96" /><Skeleton className="h-96" /><Skeleton className="h-96" /></div></div>; }

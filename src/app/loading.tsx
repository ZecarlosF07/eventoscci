import { Skeleton } from "@/components/atoms/Skeleton";

export default function LoadingPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-5 px-5 py-20 sm:px-8">
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-14 max-w-2xl" />
      <Skeleton className="h-28 w-full" />
    </main>
  );
}

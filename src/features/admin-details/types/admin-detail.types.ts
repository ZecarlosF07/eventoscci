export interface AdminDetailState<T> { key: string; data: T | null; error: string }
export type AdminDetailFetcher<T> = (activityId: string, requestId: string, signal: AbortSignal) => Promise<T>;

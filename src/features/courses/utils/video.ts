import type { Lesson } from "@/features/courses/types/course.types";
import type { VideoSource } from "@/features/courses/types/course-content.types";

export function normalizeVideoAssetId(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, "");
}

export function getLessonVideoSource(lesson: Lesson, signedStorageUrl?: string): VideoSource | null {
  if (lesson.video_provider === "youtube" && lesson.video_asset_id) {
    return { kind: "embed", url: `https://www.youtube-nocookie.com/embed/${normalizeVideoAssetId(lesson.video_asset_id)}` };
  }
  if (lesson.video_provider === "vimeo" && lesson.video_asset_id) {
    return { kind: "embed", url: `https://player.vimeo.com/video/${normalizeVideoAssetId(lesson.video_asset_id)}` };
  }
  if (lesson.video_provider === "external" && lesson.video_asset_id?.startsWith("https://")) {
    return { kind: "native", url: lesson.video_asset_id };
  }
  if (lesson.video_provider === "supabase" && signedStorageUrl) {
    return { kind: "native", url: signedStorageUrl };
  }
  return null;
}

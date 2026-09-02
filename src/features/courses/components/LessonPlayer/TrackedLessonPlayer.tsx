"use client";

import { Text } from "@/components/atoms/Text";
import type { TrackedLessonPlayerProps } from "@/features/courses/components/LessonPlayer/types/lesson-player.types";
import { NativeLessonVideo } from "@/features/courses/components/NativeLessonVideo";
import { VimeoLessonVideo } from "@/features/courses/components/VimeoLessonVideo";
import { YouTubeLessonVideo } from "@/features/courses/components/YouTubeLessonVideo";
import { getLessonVideoSource, normalizeVideoAssetId } from "@/features/courses/utils/video";
import { LessonProgressBadge } from "@/features/progress/components/LessonProgressBadge";
import { ProgressBar } from "@/features/progress/components/ProgressBar";
import { useLessonProgress } from "@/features/progress/hooks/useLessonProgress";

export function TrackedLessonPlayer({
  durationSeconds,
  enrollmentId,
  initialCourseProgressPercent,
  initialProgress,
  lesson,
  onProgressChange,
  signedStorageUrl,
}: TrackedLessonPlayerProps) {
  const controller = useLessonProgress({
    durationSeconds,
    enrollmentId,
    initialCourseProgressPercent,
    initialProgress,
    lessonId: lesson.id,
    onProgressChange,
  });
  const source = getLessonVideoSource(lesson, signedStorageUrl);
  const trackerProps = {
    initialPositionSeconds: initialProgress?.last_position_seconds ?? 0,
    onEnded: controller.onEnded,
    onPause: controller.onPause,
    onPlay: controller.onPlay,
    onTimeChange: controller.onTimeChange,
    title: lesson.title,
  };

  let player = null;
  if (lesson.video_provider === "youtube" && lesson.video_asset_id) {
    player = (
      <YouTubeLessonVideo
        {...trackerProps}
        videoId={normalizeVideoAssetId(lesson.video_asset_id)}
      />
    );
  } else if (lesson.video_provider === "vimeo" && lesson.video_asset_id) {
    const videoId = Number(normalizeVideoAssetId(lesson.video_asset_id));
    if (Number.isSafeInteger(videoId)) {
      player = <VimeoLessonVideo {...trackerProps} videoId={videoId} />;
    }
  } else if (source?.kind === "native") {
    player = <NativeLessonVideo {...trackerProps} sourceUrl={source.url} />;
  }

  return (
    <div className="space-y-4">
      {player ?? (
        <div className="flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-black p-8 text-center">
          <Text className="text-slate-400">No se pudo cargar este proveedor de video.</Text>
        </div>
      )}
      <div className="rounded-2xl border border-white/10 bg-[#111614] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <LessonProgressBadge
            isCompleted={controller.progress.isCompleted}
            progressPercent={controller.progress.progressPercent}
          />
          <Text className="text-slate-400" size="sm">
            {controller.isSaving ? "Guardando avance…" : "Avance sincronizado"}
          </Text>
        </div>
        <ProgressBar
          className="mt-3"
          label="Progreso de esta clase"
          tone="dark"
          value={controller.progress.progressPercent}
        />
        <Text className="mt-2 text-slate-400" size="sm">
          Avance general del curso: {Math.round(controller.progress.courseProgressPercent)}%
        </Text>
        {controller.saveError ? (
          <Text className="mt-3 text-amber-800" size="sm">{controller.saveError}</Text>
        ) : null}
      </div>
    </div>
  );
}

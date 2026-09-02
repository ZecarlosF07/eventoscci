import { Text } from "@/components/atoms/Text";
import { TrackedLessonPlayer } from "@/features/courses/components/LessonPlayer/TrackedLessonPlayer";
import type { LessonPlayerProps } from "@/features/courses/components/LessonPlayer/types/lesson-player.types";
import { getLessonVideoSource } from "@/features/courses/utils/video";

export function LessonPlayer(props: LessonPlayerProps) {
  const source = getLessonVideoSource(props.lesson, props.signedStorageUrl);
  if (!source) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-black p-8 text-center text-white">
        <Text className="text-slate-400">El video todavía no está disponible.</Text>
      </div>
    );
  }

  if (!props.lesson.duration_seconds) {
    return (
      <div className="space-y-3">
        {source.kind === "embed" ? (
          <div className="aspect-video overflow-hidden rounded-2xl bg-black">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
              referrerPolicy="strict-origin-when-cross-origin"
              src={source.url}
              title={props.lesson.title}
            />
          </div>
        ) : (
          <video className="aspect-video w-full rounded-2xl bg-black" controls src={source.url} />
        )}
        <Text className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-amber-200" size="sm">
          Esta clase necesita una duración configurada para registrar el progreso.
        </Text>
      </div>
    );
  }

  return <TrackedLessonPlayer {...props} durationSeconds={props.lesson.duration_seconds} />;
}

import { Text } from "@/components/atoms/Text";
import type { LessonPlayerProps } from "@/features/courses/components/LessonPlayer/types/lesson-player.types";
import { getLessonVideoSource } from "@/features/courses/utils/video";

export function LessonPlayer({ lesson, signedStorageUrl }: LessonPlayerProps) {
  const source = getLessonVideoSource(lesson, signedStorageUrl);
  if (!source) return <div className="flex aspect-video items-center justify-center rounded-2xl bg-slate-950 p-8 text-center text-white"><Text className="text-slate-300">El video todavía no está disponible.</Text></div>;
  if (source.kind === "embed") return <div className="aspect-video overflow-hidden rounded-2xl bg-black"><iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full" referrerPolicy="strict-origin-when-cross-origin" src={source.url} title={lesson.title} /></div>;
  return <video className="aspect-video w-full rounded-2xl bg-black" controls preload="metadata" src={source.url}>Tu navegador no puede reproducir este video.</video>;
}

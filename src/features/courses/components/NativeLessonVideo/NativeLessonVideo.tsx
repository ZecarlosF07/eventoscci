"use client";

import { useRef } from "react";

import type { NativeLessonVideoProps } from "@/features/courses/components/NativeLessonVideo/types/native-lesson-video.types";

export function NativeLessonVideo({
  initialPositionSeconds,
  onEnded,
  onPause,
  onPlay,
  onTimeChange,
  sourceUrl,
}: NativeLessonVideoProps) {
  const hasResumedRef = useRef(false);

  return (
    <video
      className="aspect-video w-full rounded-2xl bg-black"
      controls
      onEnded={(event) => {
        onTimeChange(event.currentTarget.duration);
        onEnded();
      }}
      onLoadedMetadata={(event) => {
        if (hasResumedRef.current || initialPositionSeconds <= 0) return;
        event.currentTarget.currentTime = Math.min(
          initialPositionSeconds,
          event.currentTarget.duration,
        );
        hasResumedRef.current = true;
      }}
      onPause={onPause}
      onPlay={onPlay}
      onTimeUpdate={(event) => onTimeChange(event.currentTarget.currentTime)}
      preload="metadata"
      src={sourceUrl}
    >
      Tu navegador no puede reproducir este video.
    </video>
  );
}

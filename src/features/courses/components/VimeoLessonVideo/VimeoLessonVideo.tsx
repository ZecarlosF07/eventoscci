"use client";

import Player from "@vimeo/player";
import { useEffect, useRef } from "react";

import type { VimeoLessonVideoProps } from "@/features/courses/components/VimeoLessonVideo/types/vimeo-lesson-video.types";

export function VimeoLessonVideo({
  initialPositionSeconds,
  onEnded,
  onPause,
  onPlay,
  onTimeChange,
  title,
  videoId,
}: VimeoLessonVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const player = new Player(containerRef.current, {
      byline: false,
      id: videoId,
      responsive: true,
      title: false,
    });
    player.on("play", onPlay);
    player.on("pause", (event) => {
      onTimeChange(event.seconds);
      onPause();
    });
    player.on("ended", (event) => {
      onTimeChange(event.seconds);
      onEnded();
    });
    player.on("timeupdate", (event) => onTimeChange(event.seconds));
    if (initialPositionSeconds > 0) {
      void player.ready().then(() => player.setCurrentTime(initialPositionSeconds));
    }

    return () => {
      void player.destroy();
    };
  }, [initialPositionSeconds, onEnded, onPause, onPlay, onTimeChange, videoId]);

  return (
    <div
      aria-label={title}
      className="aspect-video overflow-hidden rounded-2xl bg-black [&_iframe]:h-full [&_iframe]:w-full"
      ref={containerRef}
    />
  );
}

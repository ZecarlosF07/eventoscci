"use client";

import { useEffect, useRef } from "react";

import type {
  YouTubeLessonVideoProps,
  YouTubePlayerInstance,
  YouTubePlayerStateEvent,
} from "@/features/courses/components/YouTubeLessonVideo/types/youtube-lesson-video.types";
import { loadYouTubeApi } from "@/features/courses/components/YouTubeLessonVideo/utils/load-youtube-api";

const YOUTUBE_PROGRESS_POLL_MS = 1_000;

export function YouTubeLessonVideo({
  initialPositionSeconds,
  onEnded,
  onPause,
  onPlay,
  onTimeChange,
  title,
  videoId,
}: YouTubeLessonVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let player: YouTubePlayerInstance | null = null;
    let pollId: number | null = null;
    let disposed = false;

    const stopPolling = () => {
      if (pollId === null) return;
      window.clearInterval(pollId);
      pollId = null;
    };
    const handleStateChange = (event: YouTubePlayerStateEvent) => {
      const state = window.YT?.PlayerState;
      if (!state) return;
      if (event.data === state.PLAYING) {
        onPlay();
        stopPolling();
        pollId = window.setInterval(
          () => onTimeChange(event.target.getCurrentTime()),
          YOUTUBE_PROGRESS_POLL_MS,
        );
      }
      if (event.data === state.PAUSED) {
        onTimeChange(event.target.getCurrentTime());
        stopPolling();
        onPause();
      }
      if (event.data === state.ENDED) {
        onTimeChange(event.target.getCurrentTime());
        stopPolling();
        onEnded();
      }
    };

    void loadYouTubeApi().then((api) => {
      if (disposed || !containerRef.current) return;
      player = new api.Player(containerRef.current, {
        events: {
          onReady: (event) => {
            if (initialPositionSeconds > 0) {
              event.target.seekTo(initialPositionSeconds, true);
            }
          },
          onStateChange: handleStateChange,
        },
        height: "100%",
        host: "https://www.youtube-nocookie.com",
        playerVars: { playsinline: 1, rel: 0 },
        videoId,
        width: "100%",
      });
    });

    return () => {
      disposed = true;
      stopPolling();
      player?.destroy();
    };
  }, [initialPositionSeconds, onEnded, onPause, onPlay, onTimeChange, videoId]);

  return (
    <div
      aria-label={title}
      className="aspect-video overflow-hidden rounded-2xl bg-black"
      ref={containerRef}
    />
  );
}

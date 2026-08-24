"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  MAX_CONTIGUOUS_PLAYBACK_GAP_SECONDS,
  PROGRESS_PERSIST_INTERVAL_MS,
} from "@/features/progress/constants/progress.constants";
import { updateLessonProgress } from "@/features/progress/mutations/update-lesson-progress";
import type {
  LessonProgressController,
  LessonProgressState,
  UseLessonProgressOptions,
} from "@/features/progress/types/progress.types";
import { clampVideoPosition } from "@/features/progress/utils/progress";

function createInitialState(options: UseLessonProgressOptions): LessonProgressState {
  return {
    courseProgressPercent: options.initialCourseProgressPercent,
    isCompleted: options.initialProgress?.is_completed ?? false,
    lastPositionSeconds: options.initialProgress?.last_position_seconds ?? 0,
    progressPercent: options.initialProgress?.progress_percent ?? 0,
    watchedSeconds: options.initialProgress?.watched_seconds ?? 0,
  };
}

export function useLessonProgress(
  options: UseLessonProgressOptions,
): LessonProgressController {
  const router = useRouter();
  const [progress, setProgress] = useState(() => createInitialState(options));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const completionRefreshRef = useRef(false);
  const dirtyRef = useRef(false);
  const isPlayingRef = useRef(false);
  const isSavingRef = useRef(false);
  const lastPositionRef = useRef(progress.lastPositionSeconds);
  const previousPlaybackPositionRef = useRef<number | null>(null);
  const viewedSecondsRef = useRef(new Set<number>());
  const watchedSecondsRef = useRef(progress.watchedSeconds);

  const persistProgress = useCallback(async () => {
    if (!dirtyRef.current || isSavingRef.current) return;
    const snapshot = {
      lastPositionSeconds: lastPositionRef.current,
      watchedSeconds: watchedSecondsRef.current,
    };
    dirtyRef.current = false;
    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const result = await updateLessonProgress({
        enrollmentId: options.enrollmentId,
        lastPositionSeconds: snapshot.lastPositionSeconds,
        lessonId: options.lessonId,
        watchedSeconds: snapshot.watchedSeconds,
      });
      setProgress(result);
      setSaveError(null);
      if (result.courseCompletionReady && !completionRefreshRef.current) {
        completionRefreshRef.current = true;
        router.refresh();
      }
      if (result.watchedSeconds < snapshot.watchedSeconds) dirtyRef.current = true;
    } catch {
      dirtyRef.current = true;
      setSaveError("Tu video continúa, pero el avance aún no pudo guardarse.");
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [options.enrollmentId, options.lessonId, router]);

  const onTimeChange = useCallback((positionSeconds: number) => {
    const position = clampVideoPosition(positionSeconds, options.durationSeconds);
    const previousPosition = previousPlaybackPositionRef.current;
    lastPositionRef.current = position;
    previousPlaybackPositionRef.current = positionSeconds;
    dirtyRef.current = true;

    if (!isPlayingRef.current) return;
    if (previousPosition === null) {
      const currentSecond = Math.min(position, options.durationSeconds - 1);
      if (!viewedSecondsRef.current.has(currentSecond)) {
        viewedSecondsRef.current.add(currentSecond);
        watchedSecondsRef.current = Math.min(
          watchedSecondsRef.current + 1,
          options.durationSeconds,
        );
      }
      return;
    }
    const gap = positionSeconds - previousPosition;
    if (gap < 0 || gap > MAX_CONTIGUOUS_PLAYBACK_GAP_SECONDS) return;

    const firstSecond = Math.max(Math.floor(previousPosition), 0);
    const lastSecond = Math.min(Math.floor(positionSeconds), options.durationSeconds - 1);
    let addedSeconds = 0;
    for (let second = firstSecond; second <= lastSecond; second += 1) {
      if (viewedSecondsRef.current.has(second)) continue;
      viewedSecondsRef.current.add(second);
      addedSeconds += 1;
    }
    if (!addedSeconds) return;
    watchedSecondsRef.current = Math.min(
      watchedSecondsRef.current + addedSeconds,
      options.durationSeconds,
    );
  }, [options.durationSeconds]);

  const onPlay = useCallback(() => {
    isPlayingRef.current = true;
    previousPlaybackPositionRef.current = null;
  }, []);

  const onPause = useCallback(() => {
    isPlayingRef.current = false;
    previousPlaybackPositionRef.current = null;
    void persistProgress();
  }, [persistProgress]);

  const onEnded = useCallback(() => {
    isPlayingRef.current = false;
    lastPositionRef.current = options.durationSeconds;
    dirtyRef.current = true;
    void persistProgress();
  }, [options.durationSeconds, persistProgress]);

  useEffect(() => {
    const interval = window.setInterval(
      () => void persistProgress(),
      PROGRESS_PERSIST_INTERVAL_MS,
    );
    const handlePageHide = () => void persistProgress();
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pagehide", handlePageHide);
      void persistProgress();
    };
  }, [persistProgress]);

  return {
    isSaving,
    onEnded,
    onPause,
    onPlay,
    onTimeChange,
    progress,
    saveError,
  };
}

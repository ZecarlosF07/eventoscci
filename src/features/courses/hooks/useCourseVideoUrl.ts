"use client";

import { useEffect, useRef, useState } from "react";

import { COURSE_VIDEO_BUCKET } from "@/features/courses/constants/course.constants";
import type { Lesson } from "@/features/courses/types/course.types";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface CourseVideoUrlState {
  error?: string;
  isLoading: boolean;
  url?: string;
}

export function useCourseVideoUrl(lesson?: Lesson): CourseVideoUrlState {
  const cache = useRef(new Map<string, string>());
  const storagePath = lesson?.video_provider === "supabase" ? lesson.video_storage_path : null;
  const [state, setState] = useState<CourseVideoUrlState & { path?: string }>({ isLoading: false });

  useEffect(() => {
    if (!storagePath) return;
    const cached = cache.current.get(storagePath);
    if (cached) {
      Promise.resolve().then(() => setState({ isLoading: false, path: storagePath, url: cached }));
      return;
    }
    let active = true;
    const client = createBrowserSupabaseClient();
    void client.storage.from(COURSE_VIDEO_BUCKET).createSignedUrl(storagePath, 3600).then(({ data, error }) => {
      if (error || !data?.signedUrl) throw error ?? new Error("URL no disponible");
      cache.current.set(storagePath, data.signedUrl);
      if (active) setState({ isLoading: false, path: storagePath, url: data.signedUrl });
    }).catch(() => {
      if (active) setState({ error: "No fue posible abrir el video privado.", isLoading: false, path: storagePath });
    });
    return () => { active = false; };
  }, [storagePath]);

  if (!storagePath) return { isLoading: false };
  return state.path === storagePath ? state : { isLoading: true };
}

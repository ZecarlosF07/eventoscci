"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { loadStudentQuiz } from "@/features/quizzes/queries/get-student-quiz.client";
import type { LoadedStudentQuiz, StudentQuizLoadState } from "@/features/quizzes/types/student-quiz-loader.types";

export function useStudentQuiz(courseId: string, moduleId?: string): StudentQuizLoadState {
  const cache = useRef(new Map<string, LoadedStudentQuiz>());
  const [state, setState] = useState<Omit<StudentQuizLoadState, "recordAttempt"> & { moduleId?: string }>({ isLoading: false });

  useEffect(() => {
    if (!moduleId) return;
    const cached = cache.current.get(moduleId);
    if (cached) {
      Promise.resolve().then(() => setState({ data: cached, isLoading: false, moduleId }));
      return;
    }
    let active = true;
    void loadStudentQuiz(courseId, moduleId).then((data) => {
      cache.current.set(moduleId, data);
      if (active) setState({ data, isLoading: false, moduleId });
    }).catch((error: unknown) => {
      if (active) setState({ error: error instanceof Error ? error.message : "No fue posible cargar la evaluación.", isLoading: false, moduleId });
    });
    return () => { active = false; };
  }, [courseId, moduleId]);

  const recordAttempt = useCallback((attempt: LoadedStudentQuiz["attempts"][number]) => {
    if (!moduleId) return;
    const current = cache.current.get(moduleId);
    if (!current) return;
    const data = { ...current, attempts: [attempt, ...current.attempts] };
    cache.current.set(moduleId, data);
    setState({ data, isLoading: false, moduleId });
  }, [moduleId]);

  if (!moduleId) return { isLoading: false, recordAttempt };
  return state.moduleId === moduleId ? { ...state, recordAttempt } : { isLoading: true, recordAttempt };
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { CourseLearningHeader } from "@/features/courses/components/CourseLearningHeader";
import { CourseLearningSidebar } from "@/features/courses/components/CourseLearningSidebar";
import { CourseLearningStage } from "@/features/courses/components/CourseLearningStage";
import type { CourseLearningPanel, CourseLearningSelection, CourseLearningWorkspaceProps } from "@/features/courses/types/course-learning.types";
import { getCourseLearningUrl, getInitialLearningSelection, mergeLessonProgress } from "@/features/courses/utils/course-learning";
import type { LessonProgressUpdateResult } from "@/features/progress/types/progress.types";
import type { QuizAttemptResult } from "@/features/quizzes/types/quiz.types";
import { getInstructorName } from "@/features/courses/utils/course-formatters";

export function CourseLearningWorkspace({
  content,
  initialPanel = "curriculum",
  requestedLessonId,
  requestedQuizModuleId,
}: CourseLearningWorkspaceProps) {
  const input = useMemo(() => ({ lessons: content.lessons, modules: content.modules, progress: content.lessonProgress, quizzes: content.quizSummaries }), [content]);
  const [selection, setSelection] = useState<CourseLearningSelection | null>(() => getInitialLearningSelection({ ...input, requestedLessonId, requestedQuizModuleId }));
  const [activePanel, setActivePanel] = useState<CourseLearningPanel>(initialPanel);
  const [progress, setProgress] = useState(content.lessonProgress);
  const [progressPercent, setProgressPercent] = useState(content.enrollment.progress_percent);
  const [quizSummaries, setQuizSummaries] = useState(content.quizSummaries);
  const initialized = useRef(false);

  const replaceUrl = useCallback((nextSelection: CourseLearningSelection | null, panel: CourseLearningPanel) => {
    window.history.replaceState(null, "", getCourseLearningUrl(content.course.id, nextSelection, panel));
  }, [content.course.id]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    replaceUrl(selection, activePanel);
  }, [activePanel, replaceUrl, selection]);

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActivePanel(params.get("panel") === "recursos" ? "resources" : "curriculum");
      setSelection(getInitialLearningSelection({ ...input, requestedLessonId: params.get("clase") ?? undefined, requestedQuizModuleId: params.get("quiz") ?? undefined }));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [input]);

  const selectContent = (next: CourseLearningSelection) => {
    setSelection(next);
    setActivePanel("curriculum");
    window.history.pushState(null, "", getCourseLearningUrl(content.course.id, next));
  };
  const changePanel = (panel: CourseLearningPanel) => {
    setActivePanel(panel);
    replaceUrl(selection, panel);
  };
  const updateProgress = useCallback((lessonId: string, result: LessonProgressUpdateResult) => {
    const lesson = content.lessons.find((item) => item.id === lessonId);
    setProgress((current) => mergeLessonProgress(current, content.enrollment.id, lessonId, lesson?.duration_seconds ?? null, result));
    setProgressPercent(result.courseProgressPercent);
  }, [content.enrollment.id, content.lessons]);
  const updateQuiz = useCallback((moduleId: string, result: QuizAttemptResult) => {
    setQuizSummaries((current) => current.map((quiz) => quiz.moduleId === moduleId ? {
      ...quiz,
      attemptCount: quiz.attemptCount + 1,
      bestScore: Math.max(quiz.bestScore ?? 0, result.scorePercent),
      isPassed: quiz.isPassed || result.isPassed,
    } : quiz));
  }, []);
  const currentContent = { ...content, enrollment: { ...content.enrollment, progress_percent: progressPercent } };
  const primary = content.instructors.find((instructor) => instructor.isPrimary) ?? content.instructors[0];

  return (
    <div className="space-y-6">
      <CourseLearningHeader content={currentContent} progressPercent={progressPercent} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <main className="min-w-0 space-y-6">
          <CourseLearningStage content={currentContent} onProgressChange={updateProgress} onQuizAttempt={updateQuiz} progress={progress} selection={selection} />
          <details className="rounded-3xl border border-white/10 bg-[#111614] p-3 lg:hidden">
            <summary className="cursor-pointer px-2 py-3 font-bold text-white focus-visible:outline-2 focus-visible:outline-cci-lime">Abrir temario y recursos</summary>
            <div className="mt-2"><CourseLearningSidebar activePanel={activePanel} content={currentContent} onPanelChange={changePanel} onSelect={selectContent} progress={progress} quizSummaries={quizSummaries} selection={selection} /></div>
          </details>
          {primary ? <section className="rounded-2xl border border-white/10 bg-[#111614] p-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-cci-lime">Instructor</p><Heading className="mt-2 text-white" level={3}>{getInstructorName(primary.speaker.first_names, primary.speaker.last_names)}</Heading>{primary.speaker.professional_title ? <Text className="mt-1 text-slate-300">{primary.speaker.professional_title}</Text> : null}{primary.speaker.bio ? <Text className="mt-3 line-clamp-4 text-slate-400" size="sm">{primary.speaker.bio}</Text> : null}</section> : null}
        </main>
        <aside className="sticky top-6 hidden lg:block"><CourseLearningSidebar activePanel={activePanel} content={currentContent} onPanelChange={changePanel} onSelect={selectContent} progress={progress} quizSummaries={quizSummaries} selection={selection} /></aside>
      </div>
    </div>
  );
}

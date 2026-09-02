"use client";

import { useCallback } from "react";

import { Heading } from "@/components/atoms/Heading";
import { Spinner } from "@/components/atoms/Spinner";
import { Text } from "@/components/atoms/Text";
import { LessonPlayer } from "@/features/courses/components/LessonPlayer";
import { useCourseVideoUrl } from "@/features/courses/hooks/useCourseVideoUrl";
import type { CourseLearningStageProps } from "@/features/courses/types/course-learning.types";
import { StudentQuizForm } from "@/features/quizzes/components/StudentQuizForm";
import { useStudentQuiz } from "@/features/quizzes/hooks/useStudentQuiz";
import type { LessonProgressUpdateResult } from "@/features/progress/types/progress.types";

export function CourseLearningStage({
  content,
  onProgressChange,
  onQuizAttempt,
  progress,
  selection,
}: CourseLearningStageProps) {
  const lesson = selection?.kind === "lesson"
    ? content.lessons.find((item) => item.id === selection.lessonId)
    : undefined;
  const quizModuleId = selection?.kind === "quiz" ? selection.moduleId : undefined;
  const video = useCourseVideoUrl(lesson);
  const quiz = useStudentQuiz(content.course.id, quizModuleId);
  const handleProgressChange = useCallback((result: LessonProgressUpdateResult) => {
    if (lesson) onProgressChange(lesson.id, result);
  }, [lesson, onProgressChange]);

  if (!selection) {
    return <div className="grid min-h-80 place-items-center rounded-3xl border border-white/10 bg-black p-8 text-center text-white"><Text className="text-slate-400">Este curso todavía no tiene clases o evaluaciones publicadas.</Text></div>;
  }
  if (selection.kind === "quiz") {
    if (quiz.isLoading) return <LoadingStage label="Cargando evaluación…" />;
    if (quiz.error || !quiz.data) return <ErrorStage message={quiz.error ?? "La evaluación no está disponible."} />;
    return (
      <section className="rounded-3xl border border-white/10 bg-[#111614] p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-lime">Evaluación del módulo</p>
        <Heading className="mt-2 text-white" level={2}>{quiz.data.quiz.title}</Heading>
        {quiz.data.quiz.description ? <Text className="mt-2 text-slate-400">{quiz.data.quiz.description}</Text> : null}
        <p className="mt-3 text-sm font-semibold text-cci-lime">Nota mínima: {quiz.data.quiz.passingScore}%</p>
        <div className="mt-6"><StudentQuizForm initialAttempts={quiz.data.attempts} onAttemptSubmitted={(result) => { quiz.recordAttempt(result); onQuizAttempt(selection.moduleId, result); }} quiz={quiz.data.quiz} tone="dark" /></div>
      </section>
    );
  }
  if (!lesson) return <ErrorStage message="La clase seleccionada ya no está disponible." />;
  if (video.isLoading) return <LoadingStage label="Preparando video…" />;
  return (
    <section className="space-y-5">
      {video.error ? <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200" role="alert">{video.error}</p> : null}
      <LessonPlayer
        enrollmentId={content.enrollment.id}
        initialCourseProgressPercent={content.enrollment.progress_percent}
        initialProgress={progress.find((item) => item.lesson_id === lesson.id)}
        key={lesson.id}
        lesson={lesson}
        onProgressChange={handleProgressChange}
        signedStorageUrl={video.url}
      />
      <div className="rounded-2xl border border-white/10 bg-[#111614] p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cci-lime">Clase actual</p>
        <Heading className="mt-2 text-white" level={2}>{lesson.title}</Heading>
        {lesson.description ? <Text className="mt-3 whitespace-pre-line leading-7 text-slate-400">{lesson.description}</Text> : null}
      </div>
    </section>
  );
}

function LoadingStage({ label }: { label: string }) {
  return <div className="grid aspect-video place-items-center rounded-3xl border border-white/10 bg-black text-white"><span className="flex items-center gap-3"><Spinner />{label}</span></div>;
}

function ErrorStage({ message }: { message: string }) {
  return <div className="grid min-h-80 place-items-center rounded-3xl border border-rose-400/20 bg-rose-400/10 p-8 text-center text-rose-200" role="alert">{message}</div>;
}

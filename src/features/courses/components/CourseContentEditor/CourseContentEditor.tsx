"use client";

import Link from "next/link";
import type { FormEvent, ReactNode } from "react";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { LessonForm } from "@/features/courses/components/LessonForm";
import { ModuleForm } from "@/features/courses/components/ModuleForm";
import { deleteLessonAction, deleteModuleAction } from "@/features/courses/mutations/course-content.actions";
import type { CourseContentEditorProps } from "@/features/courses/types/course-content.types";

export function CourseContentEditor({ courseId, lessons, modules, onSelect, selection }: CourseContentEditorProps) {
  if (selection.kind === "new_module") {
    return <EditorPanel eyebrow="Estructura" title="Crear nuevo módulo"><Text className="mb-6">Agrupa clases relacionadas. Podrás añadir las clases después de guardar el módulo.</Text><ModuleForm courseId={courseId} defaultSortOrder={modules.length} /></EditorPanel>;
  }
  const courseModule = modules.find((module) => module.id === selection.moduleId);
  if (!courseModule) return null;
  const moduleLessons = lessons.filter((lesson) => lesson.module_id === courseModule.id);
  if (selection.kind === "new_lesson") {
    return <EditorPanel eyebrow={courseModule.title} title="Agregar clase"><Text className="mb-6">Configura el contenido y enlaza el video. La clase puede mantenerse como borrador hasta estar lista.</Text><LessonForm courseId={courseId} defaultSortOrder={moduleLessons.length} moduleId={courseModule.id} /></EditorPanel>;
  }
  if (selection.kind === "lesson") {
    const lesson = lessons.find((item) => item.id === selection.lessonId);
    if (!lesson) return null;
    return (
      <EditorPanel eyebrow={courseModule.title} title={lesson.title}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Badge variant={lesson.is_published ? "success" : "warning"}>{lesson.is_published ? "Visible para alumnos" : "Borrador"}</Badge><DeleteForm action={deleteLessonAction.bind(null, courseId, lesson.id)} label="Eliminar clase" message="¿Eliminar esta clase? El progreso histórico se conservará, pero dejará de aparecer en el curso." /></div>
        <LessonForm courseId={courseId} lesson={lesson} moduleId={courseModule.id} />
      </EditorPanel>
    );
  }
  return (
    <EditorPanel eyebrow="Configuración del módulo" title={courseModule.title}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Badge variant={courseModule.is_published ? "success" : "warning"}>{courseModule.is_published ? "Visible para alumnos" : "Borrador"}</Badge>
        <div className="flex flex-wrap items-center gap-4"><Link className="text-sm font-semibold text-cci-700 underline" href={`/admin/cursos/${courseId}/modulos/${courseModule.id}/quiz`}>Gestionar evaluación</Link><DeleteForm action={deleteModuleAction.bind(null, courseId, courseModule.id)} label="Eliminar módulo" message="¿Eliminar este módulo y ocultar todas sus clases del curso?" /></div>
      </div>
      <ModuleForm courseId={courseId} module={courseModule} />
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-cci-50 p-5"><div><p className="font-semibold text-cci-950">{moduleLessons.length} clases en este módulo</p><Text size="sm">Selecciona una clase en el temario para editarla.</Text></div><button className="rounded-xl bg-cci-950 px-4 py-3 text-sm font-semibold text-white hover:bg-cci-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime" onClick={() => onSelect({ kind: "new_lesson", moduleId: courseModule.id })} type="button">+ Agregar clase</button></div>
    </EditorPanel>
  );
}

function EditorPanel({ children, eyebrow, title }: { children: ReactNode; eyebrow: string; title: string }) {
  return <section className="min-w-0 rounded-3xl border border-cci-100 bg-white p-5 sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-cci-600">{eyebrow}</p><Heading className="mt-2" level={2}>{title}</Heading><div className="mt-6">{children}</div></section>;
}

function DeleteForm({ action, label, message }: { action: () => void; label: string; message: string }) {
  function confirmDelete(event: FormEvent<HTMLFormElement>) { if (!window.confirm(message)) event.preventDefault(); }
  return <form action={action} onSubmit={confirmDelete}><button className="text-sm font-semibold text-rose-700 hover:underline" type="submit">{label}</button></form>;
}

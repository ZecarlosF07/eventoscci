import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { LessonForm } from "@/features/courses/components/LessonForm";
import { ModuleForm } from "@/features/courses/components/ModuleForm";
import { deleteLessonAction, deleteModuleAction } from "@/features/courses/mutations/course-content.actions";
import type { CourseContentManagerProps } from "@/features/courses/types/course-content.types";

export function CourseContentManager({ courseId, lessons, modules }: CourseContentManagerProps) {
  return <div className="space-y-7">
    <section className="space-y-4"><Heading level={2}>Nuevo módulo</Heading><ModuleForm courseId={courseId} /></section>
    {!modules.length ? <div className="rounded-2xl border border-dashed p-8 text-center"><Text>Este curso todavía no tiene módulos.</Text></div> : modules.map((module) => {
      const moduleLessons = lessons.filter((lesson) => lesson.module_id === module.id);
      return <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5" key={module.id}>
        <div className="flex items-center justify-between gap-3"><Heading level={2}>{module.title}</Heading><form action={deleteModuleAction.bind(null, courseId, module.id)}><button className="text-sm font-semibold text-rose-700" type="submit">Eliminar módulo</button></form></div>
        <ModuleForm courseId={courseId} module={module} />
        <div className="space-y-3"><Heading level={3}>Clases</Heading>{moduleLessons.map((lesson) => <div className="space-y-2" key={lesson.id}><LessonForm courseId={courseId} lesson={lesson} moduleId={module.id} /><form action={deleteLessonAction.bind(null, courseId, lesson.id)} className="text-right"><button className="text-sm font-semibold text-rose-700" type="submit">Eliminar clase</button></form></div>)}<LessonForm courseId={courseId} moduleId={module.id} /></div>
      </section>;
    })}
  </div>;
}

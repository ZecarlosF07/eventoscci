"use client";

import { useState } from "react";

import { CourseContentEditor } from "@/features/courses/components/CourseContentEditor";
import { CourseContentTree } from "@/features/courses/components/CourseContentTree";
import type { CourseContentManagerProps, CourseEditorSelection } from "@/features/courses/types/course-content.types";

export function CourseContentManager(props: CourseContentManagerProps) {
  const [selection, setSelection] = useState<CourseEditorSelection>(() => props.modules[0]
    ? { kind: "module", moduleId: props.modules[0].id }
    : { kind: "new_module" });
  const resolvedSelection = isSelectionAvailable(selection, props)
    ? selection
    : props.modules[0]
      ? { kind: "module", moduleId: props.modules[0].id } as const
      : { kind: "new_module" } as const;

  return (
    <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)] xl:items-start">
      <CourseContentTree {...props} onSelect={setSelection} selection={resolvedSelection} />
      <CourseContentEditor {...props} onSelect={setSelection} selection={resolvedSelection} />
    </div>
  );
}

function isSelectionAvailable(selection: CourseEditorSelection, props: CourseContentManagerProps) {
  if (selection.kind === "new_module") return true;
  if (!props.modules.some((module) => module.id === selection.moduleId)) return false;
  return selection.kind !== "lesson" || props.lessons.some((lesson) => lesson.id === selection.lessonId);
}

"use client";
import { Button } from "@/components/atoms/Button";
import { Heading } from "@/components/atoms/Heading";
export default function CoursesError({ reset }: { error: Error; reset: () => void }) { return <div className="space-y-4 py-20 text-center"><Heading level={1}>No pudimos cargar los cursos</Heading><Button onClick={reset}>Intentar nuevamente</Button></div>; }

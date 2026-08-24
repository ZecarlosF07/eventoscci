import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Text } from "@/components/atoms/Text";
import { FormField } from "@/components/molecules/FormField";
import type { CourseStudentsTableProps } from "@/features/courses/components/CourseStudentsTable/types/course-students-table.types";
import { COURSE_ENROLLMENT_STATUS_LABELS } from "@/features/courses/constants/course.constants";
import {
  grantCourseAccessAction,
  revokeCourseAccessAction,
} from "@/features/courses/mutations/course-enrollment.actions";
import { formatCoursePrice } from "@/features/courses/utils/course-formatters";
import { ProgressBar } from "@/features/progress/components/ProgressBar";

export function CourseStudentsTable({
  course,
  people,
  query,
  students,
}: CourseStudentsTableProps) {
  return (
    <div className="space-y-7">
      <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-[1fr_auto]">
        <FormField hint="Documento, nombre o correo." label="Buscar persona" name="q">
          <Input defaultValue={query} id="q" name="q" />
        </FormField>
        <div className="flex items-end"><Button type="submit">Buscar</Button></div>
      </form>

      {people.length ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Resultados</h2>
          {people.map((person) => (
            <form
              action={grantCourseAccessAction}
              className="grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-[1fr_150px_150px_auto]"
              key={person.id}
            >
              <input name="course_id" type="hidden" value={course.id} />
              <input name="person_id" type="hidden" value={person.id} />
              <div>
                <p className="font-semibold">{person.first_names} {person.last_names}</p>
                <Text size="sm">{person.document_number} · {person.email}</Text>
                {!person.has_account ? <Badge variant="warning">Sin cuenta Campus</Badge> : null}
              </div>
              <Select name="registration_type">
                <option value="general">General</option>
                <option value="member">Asociado</option>
              </Select>
              <Input
                min="0"
                name="price_snapshot"
                placeholder="Precio automático"
                step="0.01"
                type="number"
              />
              <Button type="submit">Habilitar</Button>
            </form>
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Alumnos habilitados</h2>
        {!students.length ? <Text>Aún no hay alumnos matriculados.</Text> : null}
        {students.map((student) => (
          <div className="rounded-2xl border border-slate-200 bg-white p-4" key={student.enrollmentId}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {student.person.first_names} {student.person.last_names}
                </p>
                <Text size="sm">{student.person.document_number} · {student.person.email}</Text>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={student.status === "active" ? "success" : "warning"}>
                    {COURSE_ENROLLMENT_STATUS_LABELS[student.status]}
                  </Badge>
                  <Badge>{student.registrationType === "member" ? "Asociado" : "General"}</Badge>
                  <Badge>{formatCoursePrice(student.priceSnapshot)}</Badge>
                </div>
                <ProgressBar
                  className="mt-4 max-w-md"
                  label="Seguimiento académico"
                  value={student.progressPercent}
                />
              </div>
              {student.status !== "revoked" ? (
                <form action={revokeCourseAccessAction} className="flex gap-2">
                  <input name="course_id" type="hidden" value={course.id} />
                  <input name="enrollment_id" type="hidden" value={student.enrollmentId} />
                  <Input
                    aria-label="Motivo de revocación"
                    name="reason"
                    placeholder="Motivo"
                    required
                  />
                  <Button type="submit" variant="secondary">Revocar</Button>
                </form>
              ) : (
                <Text size="sm">{student.revocationReason}</Text>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

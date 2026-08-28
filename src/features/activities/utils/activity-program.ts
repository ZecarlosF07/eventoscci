export function getLegacyActivityProgram(
  program: string | null,
  syllabus: string | null,
): string | null {
  const sections = [program, syllabus]
    .map((value) => value?.trim() ?? "")
    .filter(Boolean)
    .filter((value, index, values) =>
      values.findIndex((candidate) => candidate.toLocaleLowerCase("es-PE") === value.toLocaleLowerCase("es-PE")) === index,
    );

  return sections.length ? sections.join("\n\n") : null;
}

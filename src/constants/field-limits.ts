export const FIELD_LIMITS = {
  activityContactLabel: 120,
  activityDuration: 100,
  activitySlug: 220,
  activityTitle: 300,
  categoryName: 100,
  categorySlug: 120,
  certificateSignerName: 200,
  certificateTemplateName: 150,
  contentTitle: 200,
  courseDuration: 100,
  courseSlug: 220,
  courseTitle: 200,
  documentNumber: 20,
  personName: 120,
  phone: 30,
  venueName: 160,
} as const;

export function maximumCharactersMessage(maximum: number): string {
  return `Usa como máximo ${maximum} caracteres.`;
}

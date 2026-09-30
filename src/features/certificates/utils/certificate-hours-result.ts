export function certificateHoursResultMessage(completed: number, remainingCount?: number, detail?: string) {
  const summary = `${completed} certificados corregidos en esta ejecución.`;
  if (remainingCount === undefined) return `${summary} No se pudo verificar cuántos quedan pendientes; actualiza la página antes de reintentar.${detail ? ` ${detail}` : ""}`;
  if (remainingCount > 0) return `${summary} Quedan ${remainingCount} pendientes.${detail ? ` ${detail}` : " Puedes reanudar la corrección."}`;
  return `${summary} Corrección completada: no quedan certificados pendientes.`;
}

# Progreso académico del Campus

## Fuente confiable

El navegador registra posición y segundos reproducidos, pero no decide el porcentaje ni la
finalización. La mutation TypeScript invoca:

```text
update_lesson_progress(
  enrollment_id,
  lesson_id,
  last_position_seconds,
  watched_seconds
)
```

PostgreSQL valida que la matrícula pertenezca al usuario autenticado, continúe habilitada y
corresponda al curso de una clase publicada. La duración siempre se obtiene de `lessons`.

La RPC limita a 30 segundos el incremento reconocido en una sola llamada. Un trigger contrasta
además el incremento con el tiempo transcurrido desde el guardado anterior, con tolerancia para
reproducción acelerada. El cliente persiste cada 15 segundos, al pausar, al terminar y al abandonar la vista. Nunca envía
`progress_percent`, `is_completed` ni `completed_at`.

## Cálculos

- Una clase se completa automáticamente desde el 90 %.
- `last_position_seconds` puede retroceder para permitir repasar el video.
- `watched_seconds`, `progress_percent`, `is_completed` y `completed_at` no regresan.
- El avance del curso es el promedio de las clases obligatorias publicadas y activas.
- Las clases opcionales y los materiales no modifican el avance general.
- `check_course_completion()` exige todas las clases obligatorias y, cuando existan, todos los
  quizzes publicados aprobados. Al cumplirlos cambia la matrícula a `completed`, fija el avance en
  100 % y reserva el certificado automático de manera idempotente.

## Proveedores de video

- Los archivos externos y de Supabase usan eventos del elemento HTML `video`.
- YouTube usa IFrame Player API y consulta la posición una vez por segundo durante la reproducción.
- Vimeo usa el SDK oficial `@vimeo/player` y sus eventos de reproducción.

Los tres proveedores reanudan desde la posición persistida. Si una clase no tiene
`duration_seconds`, el video continúa disponible, pero la interfaz advierte que no puede registrar
avance hasta que el administrador configure una duración válida.

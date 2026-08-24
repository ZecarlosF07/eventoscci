# Contenido del Campus Virtual

## Videos

El Hito 7 mantiene el proveedor desacoplado por clase mediante:

- `video_provider`;
- `video_asset_id`;
- `video_storage_path`.

Proveedores admitidos por el reproductor inicial:

- `youtube`: `video_asset_id` contiene el ID del video;
- `vimeo`: `video_asset_id` contiene el ID del video;
- `external`: `video_asset_id` contiene una URL HTTPS reproducible;
- `supabase`: `video_storage_path` contiene una ruta privada del bucket `course-videos`.

El bucket `course-videos` es privado. Su estructura esperada es:

```text
{course_id}/{archivo}
```

La aplicación genera una URL firmada únicamente después de validar la matrícula. La elección de un proveedor definitivo puede realizarse posteriormente sin modificar el modelo académico.

El seguimiento y la reanudación de estos proveedores están documentados en
[`progreso-campus.md`](./progreso-campus.md).

Los quizzes opcionales por módulo y su integración con la aprobación académica están documentados
en [`quizzes-campus.md`](./quizzes-campus.md).

## Portadas y materiales

- `course-banners` es público y almacena únicamente portadas.
- `course-materials` es privado y almacena archivos generales del curso.
- Los enlaces externos se guardan en `external_url` y no se duplican en Storage.
- Los archivos y enlaces pertenecen al curso, nunca a una clase.
- Consultar materiales no modifica el progreso académico.

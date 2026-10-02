# HITO 17 — USUARIOS INTERNOS Y ACTIVIDADES A CARGO

## Plataforma Digital de Eventos, Capacitaciones y Cursos
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

Este hito incorpora un módulo **Usuarios** para administrar cuentas internas y convierte la responsabilidad de una actividad en un permiso efectivo. El «Contacto de atención» que se elige en un evento o capacitación seguirá siendo el dato público de atención; un vínculo privado con una cuenta interna determinará quién puede gestionar esa actividad.

```text
Administrador completo crea o reactiva la cuenta y vincula sus contactos
→ responsable crea una actividad con uno de sus contactos o recibe una asignación
→ gestiona únicamente esa actividad y su participación
→ el administrador completo conserva la visión institucional y puede reasignarla
```

El rol existente `administrator` será **Administrador completo**; `operator` será **Responsable de actividades**. Las cuentas `operator` actuales pasarán al alcance limitado cuando se implemente este hito: no conservarán por compatibilidad el acceso operativo global descrito en el Hito 11. Visitantes, estudiantes y reglas comerciales de los Hitos 15 y 16 no cambian.

Este documento define una **implementación futura**. Su creación no habilita cuentas, no modifica permisos vigentes y no aplica migraciones.

---

# 2. Objetivo

Permitir que el administrador completo cree y mantenga usuarios internos, y que cada responsable trabaje con sus propios eventos y capacitaciones sin acceder a datos, cobros o archivos de actividades ajenas, aun cuando intente abrir una URL directa o llamar una RPC.

La entrega deberá abarcar interfaz, Supabase Auth, identidad institucional, asignación, RLS, funciones, consultas, exportaciones y Storage. Ocultar opciones del menú no constituye control de acceso.

---

# 3. Decisiones funcionales y límites

- `administrator` ve todas las actividades y gestiona usuarios, contactos, catálogos y módulos globales. Solo este rol crea o vincula contactos responsables, reasigna actividades y cambia roles o contraseñas desde el panel.
- `operator` ve y gestiona **eventos y capacitaciones** asociados a cualquiera de sus contactos activos: creación, edición, publicación, cancelación o archivo según reglas actuales, inscripciones, solicitudes, pagos, comprobantes, asistencia y certificados de la actividad. No puede apropiarse de una actividad cambiando su contacto ni seleccionar uno de otra cuenta.
- El responsable podrá crear desde el formulario un **lugar, expositor o categoría** que quedará disponible como catálogo compartido. No podrá editar, desactivar o borrar entradas globales ni abrir el módulo Catálogos. Su contacto de atención debe haber sido creado o vinculado previamente por el administrador completo.
- El responsable no tendrá acceso a Cursos, Directorio global, Usuarios, Notificaciones globales ni administración de plantillas de certificados. Podrá seleccionar plantillas existentes y consultar los participantes necesarios dentro de sus actividades. Las notificaciones automáticas seguirán procesándose con el servicio existente; su revisión global corresponderá al administrador completo.
- Las fichas personales de `people` son compartidas entre actividades. Solo el administrador completo podrá corregir administrativamente nombres, documento, correo, celular y demás datos comunes. El responsable consultará los participantes de sus actividades y operará sus inscripciones, pagos, asistencia y certificados, sin editar la ficha común ni acceder a las participaciones de esa persona en actividades ajenas. Las correcciones conservarán auditoría y no reescribirán snapshots históricos. Esta restricción administrativa no cambia los flujos públicos ni del Campus.
- El registro público o del Campus no creará cuentas internas. El módulo solo gestionará roles internos; no convertirá una cuenta `student` en `operator` o `administrator` ni duplicará una cuenta del Campus con el mismo correo.
- Cada actividad tendrá **un único responsable operativo** mediante su contacto vinculado. El contacto público y la cuenta interna son conceptos distintos: un contacto podrá estar vinculado a una sola cuenta y una cuenta podrá tener varios contactos. El contacto seguirá mostrando su nombre, WhatsApp y correo públicos sin exponer su vínculo interno. Una actividad con contacto sin vínculo quedará gestionada únicamente por el administrador completo hasta asignarla.
- Una vez utilizado, el contacto conservará su cuenta vinculada, incluso si esta se desactiva. Para reasignar una actividad, el administrador completo elegirá otro contacto en **esa actividad**, con auditoría; el cambio transferirá su acceso de inmediato sin alterar otras actividades que usen el contacto anterior. Una cuenta desactivada no conservará acceso aunque sus contactos sigan vinculados.
- Se permitirá dar de alta, activar o cambiar al rol de responsable sin contactos vinculados. Verá una explicación y no podrá crear ni gestionar actividades hasta tener un contacto activo vinculado; esta misma regla se aplicará al cambiar de administrador completo a responsable.

El público podrá continuar viendo actividades publicadas según las reglas del portal. «Solo ve sus actividades» se refiere a la administración y a los datos internos, no a ocultar del sitio público los eventos publicados de otros responsables.

---

# 4. Persistencia, identidad y asignación

Crear una relación **privada** entre `activity_contacts` y `user_accounts`, con unicidad por contacto e índices para resolver las actividades de cada cuenta. No añadir el identificador de la cuenta a los datos del contacto expuestos públicamente. Conservar `activities.contact_id` como referencia del contacto seleccionado y como fuente de la asignación; no deducir permisos de nombres, teléfono, autor de creación ni correo en cada consulta.

El primer vínculo podrá establecerse para contactos existentes sin cuenta vinculada. Una vez que un contacto vinculado se haya utilizado en una actividad, su vínculo no podrá sustituirse ni eliminarse, tampoco tras la desactivación de la cuenta. Las reasignaciones modificarán `activities.contact_id` de las actividades seleccionadas y registrarán actividad, contactos y cuentas anteriores y nuevos; no cambiarán masivamente la cuenta del contacto. Los contactos y vínculos de las demás actividades, incluidas las históricas, se conservarán.

En la migración inicial y al crear una cuenta interna, vincular automáticamente contactos existentes solo si `lower(trim(contact.email))` coincide con el correo de **una única cuenta interna activa**. No usar coincidencias aproximadas. Contactos sin correo, con coincidencia ambigua o asociados a otra cuenta permanecerán sin vínculo nuevo y se presentarán al administrador para revisión manual. No sobrescribir un vínculo explícito. Cambios posteriores de correo no transferirán permisos de forma automática.

Reutilizar una fila de `people` por documento cuando corresponda y no tenga una cuenta existente, sin sobrescribir silenciosamente datos de inscripciones previas. Mostrar la identidad encontrada para confirmación administrativa; rechazar documentos o correos en conflicto y cuentas `student` existentes, aunque estén desactivadas. Si existe una cuenta interna desactivada, el alta ofrecerá **reactivar esa misma cuenta**, revisar su rol y restablecer su contraseña; conservará identidad, identificador de Auth, contactos, historial y auditoría. Una cuenta interna activa dirigirá a su ficha. No crear una segunda cuenta para la misma identidad ni convertir cuentas del Campus mediante este flujo.

Para una cuenta nueva, la creación de Auth y la vinculación institucional no son una sola transacción: crear primero una cuenta Auth **sin permisos de aplicación**, completar después persona, `user_accounts` y contactos mediante una operación validada y auditada. Si falla el segundo paso, no declarar el alta exitosa; intentar limpiar la cuenta Auth recién creada y, si la limpieza falla, dejarla identificada como no vinculada e incapaz de entrar, con recuperación administrativa explícita. La reactivación de una cuenta existente no ejecutará la creación ni la limpieza de una cuenta Auth nueva.

La desactivación no borrará cuentas, contactos, auditorías, cobros ni inscripciones. Antes de desactivar una cuenta interna con actividades a cargo, exigir reasignar únicamente **sus actividades vigentes**, no las de otras cuentas ni actividades ajenas con contacto sin vínculo. La operación comprobará esta condición en PostgreSQL y que permanezca al menos un `administrator` activo, incluso con acciones concurrentes. Nadie podrá desactivarse ni reducir su propio rol desde el módulo. El alta, la activación y el cambio a `operator` podrán completarse sin contactos; eso no concederá acceso a actividades.

Para esta comprobación, una actividad será vigente con los siguientes criterios, compartidos por interfaz, servidor y PostgreSQL:

- Excluir registros eliminados y actividades con estado `archived`, `cancelled` o `finished`.
- Incluir los borradores aunque sus fechas hayan pasado, y las actividades restantes sin sesiones no eliminadas.
- Para las publicadas con sesiones, incluir próximas y en curso mientras el fin de su última sesión no eliminada sea posterior al momento de la operación. Si una sesión no tiene hora de fin, usar el término de ese día en `America/Lima`, representado por la medianoche del día siguiente. Al alcanzar ese fin, dejará de ser vigente para la desactivación, aunque siga publicada. La visibilidad listada o no listada no cambiará este criterio.

Las actividades terminadas conservarán su contacto y vínculo históricos y **no bloquearán la desactivación aunque tengan cobros o tandas de certificados pendientes**. El administrador completo podrá completar esas operaciones. Al reactivar una cuenta, recuperará solo las actividades que todavía le correspondan por sus contactos activos; las reasignadas a otra cuenta no volverán automáticamente.

Registrar actor, usuario o contacto afectado, valor anterior y nuevo, fecha y motivo cuando corresponda. **Nunca** auditar el texto de una contraseña.

---

# 5. Módulo Usuarios y experiencia administrativa

El módulo, visible solo para `administrator`, tendrá listado con búsqueda por nombre, correo y documento; filtros de rol y estado; ficha de contactos vinculados y actividades a cargo; alta, edición de rol, activación, desactivación, reasignación y restablecimiento de contraseña. Diferenciar con palabras claras «Administrador completo» y «Responsable de actividades». Las acciones sensibles mostrarán confirmación y resultado específico; conservarán valores y foco ante errores.

Si el alta encuentra una cuenta interna desactivada, mostrar su ficha y ofrecer la reactivación explícita, con revisión del rol y restablecimiento de contraseña; no crear otra cuenta al reenviar el formulario. Una cuenta sin contactos tendrá un estado explicativo. Antes de desactivar, mostrar las actividades vigentes de esa cuenta que necesitan otro contacto y separar las terminadas cuyo trabajo pendiente asumirá el administrador completo.

Para el alta, solicitar tipo y número de documento, nombres, apellidos, correo, celular, cargo, rol, contraseña y confirmación. El administrador establecerá la contraseña y la compartirá por un canal seguro externo. Validar su fortaleza conforme a la configuración vigente de Auth; no enviarla en correo, mostrarla después del alta, incluirla en URLs, analítica, logs ni respuestas persistidas. El restablecimiento administrativo establecerá una **nueva** contraseña; no existe una función para recuperar la anterior. La página administrativa del responsable no tendrá acción de cambio de contraseña.

Esta última es una **regla del panel, no una prohibición absoluta de Supabase Auth**: el servicio permite operaciones propias de recuperación y cambio de contraseña. El hito no prometerá impedirlas sin un rediseño de autenticación fuera de su alcance. No modificar la recuperación existente del Campus solo para aparentar esa restricción.

Al crear una actividad, el responsable verá exclusivamente sus contactos activos, no eliminados y vinculados; con uno solo, podrá aparecer preseleccionado. Si no tiene ninguno, verá una explicación y no podrá guardar ni gestionar actividades hasta que el administrador completo vincule uno. Al editar, el contacto responsable será visible pero no modificable para él. El administrador completo podrá seleccionar contactos y reasignar desde el contexto de la actividad o del usuario, modificando solo las actividades seleccionadas con una sola regla de permisos y auditoría. No ofrecer la sustitución de la cuenta de un contacto ya utilizado.

La navegación y el resumen del responsable mostrarán únicamente su operación. Los filtros, contadores y paginación se calcularán en servidor **después de aplicar el alcance**. En tablas de participantes, pagos o certificados, los enlaces no conducirán a páginas globales prohibidas; los datos necesarios se abrirán en el contexto autorizado de la actividad. Las exportaciones Excel mantendrán filtros y columnas actuales, pero incluirán solo registros de actividades autorizadas.

La interfaz seguirá `.agents/rules.md`: componentes pequeños por `feature` (máximo 170 líneas), tipos e interfaces separados, lógica en utilidades o servicios, Tailwind sin CSS específico, validación explícita y diseño sobrio. Antes de codificar, revisar la documentación de Next.js 16 instalada en `node_modules/next/dist/docs/`; no crear `middleware.ts`.

---

# 6. Seguridad de extremo a extremo

Definir en PostgreSQL una función central y aplicar la misma regla en interfaz y servidor: la cuenta y la identidad de `people` deben permanecer habilitadas y no eliminadas. Un `administrator` habilitado tendrá acceso completo; un `operator` habilitado accederá únicamente a eventos y capacitaciones cuyo contacto esté activo, no eliminado y explícitamente vinculado a su cuenta. Un contacto sin vínculo no concederá permisos al responsable. Para crear, el `operator` deberá usar uno de sus contactos autorizados; para actualizar no podrá cambiar ese contacto. No usar el alias general `is_active_admin()` como única comprobación de una operación por actividad.

Revisar y ajustar RLS, permisos y RPC de actividades, fechas, expositores, personas vinculadas, inscripciones individuales y grupales, padrón cuando corresponda, pagos, datos para comprobantes, asistencia, sugerencias, certificados y vistas agregadas. Los módulos globales quedarán reservados a `administrator`, salvo la **creación controlada** de lugares, expositores y categorías desde el formulario de una actividad propia. Los totales y las exportaciones no revelarán registros de otras actividades ni mediante paginación, búsqueda o filtros.

La lectura contextual de una persona no habilitará su modificación por `operator`. Reservar al administrador completo las correcciones administrativas de `people`, tanto por formulario como por RPC y escritura directa; la autorización de una inscripción propia no se propagará a la ficha común ni a los registros ajenos de esa persona.

Cada página administrativa, Server Action y Route Handler invocado por una persona, incluidas las operaciones que usen `service_role`, volverá a verificar identidad, rol y pertenencia a la actividad antes de consultar o mutar datos. Las RPC antiguas y enlaces directos tampoco podrán eludir esta comprobación. Los procesos automáticos existentes autenticarán su identidad de servicio mediante sus mecanismos actuales y conservarán únicamente los privilegios necesarios; no dependerán de una sesión humana ni habilitarán el acceso global del responsable. `user_accounts` no dará al responsable un listado de otros usuarios internos. Mantener separadas las políticas de lectura pública necesarias para el portal y el acceso interno sensible.

Restringir Storage: cargas temporales de imágenes asociadas a quien las sube, archivos definitivos ligados a una actividad autorizada y certificados accesibles únicamente por las rutas y permisos existentes. No permitir que un responsable mueva, sustituya o elimine archivos de otra actividad cambiando una ruta. La entrega automática de notificaciones conservará los privilegios del servicio, pero el responsable no obtendrá acceso al buzón global.

La creación y el restablecimiento de credenciales usarán exclusivamente código de servidor y la API administrativa de Supabase Auth tras verificar `administrator`. Los secretos nunca llegarán al navegador. La desactivación bloqueará de inmediato el acceso a datos internos por las comprobaciones de cuenta activa, sin depender de que expire la sesión del navegador.

---

# 7. Compatibilidad y despliegue futuro

La migración de permisos cambia deliberadamente el alcance de las cuentas `operator` preexistentes. Antes de activarla, inventariar dichas cuentas y los contactos sin vínculo, asegurar al menos un administrador completo activo y completar las asignaciones necesarias. Coordinar la migración restrictiva y el frontend para no dejar una ventana en que la nueva interfaz o las rutas antiguas concedan acceso global. No alterar datos históricos, precios, cupos, pases gratuitos, pagos, certificados ni la visibilidad pública de actividades.

Crear las migraciones en `supabase/migrations`, con RLS y permisos mínimos para toda tabla o función nueva y pruebas SQL transaccionales. Revisar `supabase db push --linked --dry-run`, aplicar sin seeds, regenerar tipos con `yarn types:db:linked` y comprobar el estado posterior. Este hito documental **no ejecuta** esos pasos.

---

# 8. Pruebas y aceptación de la implementación futura

- Dos responsables con contactos y actividades distintos: cada uno crea una actividad propia, gestiona solo sus inscripciones, pagos, asistencia y certificados; el administrador completo ve ambas. Probar evento, capacitación, borrador, no listado, finalizado y actividad sin fecha.
- Intentar acceder a una actividad ajena por menú, enlace guardado, ID cambiado en URL, Route Handler, RPC, vista, exportación Excel y ruta de Storage. Confirmar ausencia de datos ajenos también en búsqueda, conteos, paginación y métricas.
- Crear categorías, lugares y expositores desde el formulario propio; impedir edición, borrado y acceso al catálogo global. Restringir plantillas, directorio, cursos, usuarios, notificaciones y padrón según rol sin romper el flujo público ni los Hitos 15 y 16.
- Probar alta nueva, persona existente sin cuenta, documento/correo en conflicto, cuenta `student` existente activa o desactivada, fallo entre Auth y base, reintento, rol cambiado y contraseña restablecida. Reactivar una cuenta interna desactivada desde el alta conservando su identificador, contactos, historial y auditoría, sin crear otro usuario. Verificar que no aparezcan contraseñas en auditoría, logs o correo.
- Dar de alta, activar y cambiar al rol `operator` sin contactos: explicar el estado y bloquear creación y gestión de actividades hasta la vinculación. Comprobar que un contacto inactivo o eliminado, una cuenta inactiva o una identidad eliminada no concedan acceso.
- Vincular automáticamente por correo exacto y único; dejar sin enlace coincidencias ambiguas o inexistentes; vincular manualmente y conservar el vínculo de contactos ya utilizados. Reasignar una actividad entre dos que comparten contacto, comprobar revocación/concesión inmediata únicamente en ella y conservar la otra actividad y su atribución histórica. Intentar sustituir o eliminar el vínculo de un contacto usado y cambiar el contacto propio desde formulario y RPC.
- Desactivar solo después de reasignar las actividades vigentes de la cuenta afectada. Probar borrador con fecha pasada, ausencia de sesiones, múltiples sesiones, actividad no listada, fin exacto y sesión sin hora de fin en Lima; excluir eliminadas, archivadas, canceladas y finalizadas. Las actividades ajenas sin vínculo no bloquearán la operación. Conservar el histórico y permitir que el administrador complete cobros y tandas de certificados de actividades terminadas, sin exigir reasignarlas. Rechazar autodesactivación, autorreducción, último administrador y operaciones concurrentes que dejarían el sistema sin administrador.
- Registrar una misma persona en actividades de dos responsables distintos: ambos consultan solo su contexto; solo el administrador completo puede corregir su ficha común por panel, RPC o escritura directa. Comprobar auditoría y conservación de snapshots históricos, sin alterar los flujos públicos ni del Campus.
- Revisar teclado, foco, mensajes, contraste y vistas de **390 × 844, 768 × 1024 y 1440 × 900**. Ejecutar pruebas unitarias y SQL, `yarn lint`, `yarn typecheck`, `yarn build` y `git diff --check`. Registrar ambiente, fecha, commit y evidencia real en la matriz.

---

# 9. Definition of Done

El hito estará implementado cuando un administrador completo pueda crear, reactivar y mantener cuentas internas y contactos, reasignar actividades individualmente y restablecer contraseñas desde Usuarios; un responsable pueda crear y operar sus propios eventos y capacitaciones; y las consultas, RPC, exportaciones y archivos impidan de forma verificable el acceso a cualquier actividad ajena. Cada actividad tendrá un único responsable mediante su contacto y los vínculos de contactos utilizados serán estables. Permitir responsables sin contacto con estado explicativo, reservar al administrador las correcciones personales comunes y reactivar cuentas existentes sin duplicarlas. La desactivación deberá exigir reasignación únicamente de las actividades vigentes de la cuenta afectada, conservar el historial y permitir al administrador completar operaciones pendientes de las terminadas, además de proteger al último administrador.

Será incorrecto si un filtro de menú es la única barrera, si un contacto sin vínculo concede acceso por semejanza de nombre, si una cuenta `operator` conserva consultas globales o edita fichas personales comunes, si una RPC antigua o un archivo omite el control por actividad, si reasignar una actividad modifica otras o sustituye el vínculo de un contacto utilizado, si se duplica una cuenta desactivada, si un cambio de rol o contraseña se realiza sin auditoría, o si el sistema afirma impedir la recuperación propia de Supabase Auth sin haber cambiado realmente su modelo de autenticación.

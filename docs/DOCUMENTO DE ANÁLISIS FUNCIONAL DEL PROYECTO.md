# DOCUMENTO DE ANÁLISIS FUNCIONAL DEL PROYECTO

## Plataforma Digital de Eventos, Capacitaciones y Cursos de la Cámara de Comercio de Ica

**Estado del documento:** Definición funcional del MVP  
**Etapa:** Análisis y levantamiento de requerimientos  
**Institución:** Cámara de Comercio de Ica

---

# 1. Descripción global del proyecto

La Cámara de Comercio de Ica requiere implementar una plataforma digital que centralice la difusión, inscripción y gestión de sus eventos, capacitaciones y cursos grabados.

Actualmente, una parte importante de estos procesos se desarrolla de forma manual, lo que genera mayor carga operativa, dispersión de información, dificultades para mantener un historial de participantes y una experiencia poco eficiente para las personas interesadas en las actividades de la institución.

La nueva plataforma buscará convertirse en el punto central desde el cual cualquier persona pueda conocer las actividades organizadas por la Cámara de Comercio de Ica, consultar información detallada, inscribirse en eventos o capacitaciones y acceder a un catálogo de cursos virtuales grabados.

La plataforma tendrá además una función administrativa, permitiendo a la Cámara gestionar las actividades publicadas, participantes, inscripciones, asistencia, certificados, cursos, expositores y usuarios.

El proyecto se plantea inicialmente como un **Producto Mínimo Viable (MVP)**.

El propósito del MVP no será incorporar todas las funcionalidades posibles desde el inicio, sino desarrollar el conjunto mínimo de funciones que permita que la plataforma pueda utilizarse efectivamente en las operaciones reales de la Cámara.

En esta etapa no se considera la definición de tecnologías, arquitectura de software, infraestructura, servidores, proveedores, lenguajes de programación o mecanismos técnicos de implementación.

El presente documento se concentra exclusivamente en:

- necesidades de los usuarios;
- alcance funcional;
- procesos;
- reglas de negocio;
- experiencia del usuario;
- administración;
- comportamiento esperado del sistema.

---

# 2. Problema actual

Actualmente la gestión de eventos y capacitaciones de la Cámara de Comercio de Ica depende en gran medida de procesos manuales.

Esto puede involucrar actividades como:

- publicación manual de información;
- recepción de consultas;
- registro de interesados;
- confirmación de participantes;
- organización de listas;
- control de participantes;
- comunicación individual;
- gestión de certificados;
- seguimiento de personas que anteriormente participaron en actividades.

El proceso manual dificulta que la institución pueda mantener información centralizada y reutilizable.

Asimismo, la Cámara desea incorporar una nueva línea de formación mediante cursos grabados, para lo cual el modelo de inscripción simple utilizado en eventos no resulta suficiente, ya que un alumno necesita mantener acceso permanente a sus cursos, progreso, evaluaciones y certificados.

Por esta razón se requiere una plataforma que resuelva ambos escenarios sin obligar a los usuarios de eventos a atravesar procesos innecesarios.

---

# 3. Objetivo general

Desarrollar una plataforma digital institucional que permita informar, publicar, gestionar e inscribir participantes en eventos y capacitaciones de la Cámara de Comercio de Ica, así como ofrecer cursos grabados mediante un campus virtual con cuentas permanentes de usuario.

La plataforma deberá reducir la dependencia de procesos manuales y mejorar tanto la experiencia del participante como la capacidad de gestión interna de la Cámara.

---

# 4. Objetivos específicos

La plataforma deberá permitir:

1. Centralizar la publicación de eventos, capacitaciones y cursos grabados.

2. Facilitar que cualquier persona pueda descubrir las actividades disponibles.

3. Permitir la inscripción rápida en eventos y capacitaciones sin necesidad de crear una cuenta.

4. Diferenciar actividades gratuitas y actividades con costo.

5. Diferenciar participantes del público general y asociados de la Cámara.

6. Permitir a la Cámara gestionar preinscritos, confirmados y participantes.

7. Registrar asistencia en eventos y capacitaciones.

8. Emitir certificados a los participantes que correspondan.

9. Crear un campus virtual para cursos grabados.

10. Mantener cuentas permanentes para alumnos de cursos.

11. Permitir habilitar múltiples cursos sobre la misma cuenta.

12. Mantener el progreso académico de cada alumno.

13. Incorporar evaluaciones sencillas mediante quizzes.

14. Mantener un historial institucional de participantes y expositores.

15. Reducir procesos manuales sin incorporar todavía funcionalidades de alto costo o complejidad que no sean indispensables para el MVP.

---

# 5. Principio general de la solución

La plataforma será percibida públicamente como un único ecosistema institucional.

Tendrá tres grandes tipos de contenido:

- Eventos.
- Capacitaciones.
- Cursos grabados.

Sin embargo, funcionalmente existirán dos experiencias principales.

## 5.1 Eventos y capacitaciones

Funcionarán bajo una experiencia de acceso público.

Una persona podrá:

- consultar información;
- revisar fechas;
- revisar precios;
- conocer al expositor;
- inscribirse;

sin necesidad de crear una cuenta.

El objetivo es mantener una barrera de entrada mínima.

## 5.2 Cursos grabados

Funcionarán bajo una experiencia de campus virtual.

El alumno deberá disponer de una cuenta con correo electrónico y contraseña.

La cuenta permitirá conservar:

- cursos habilitados;
- progreso;
- evaluaciones;
- certificados;
- historial.

---

# 6. Tipos de usuario

## 6.1 Visitante

Persona que ingresa a la plataforma sin autenticarse.

Podrá:

- consultar eventos;
- consultar capacitaciones;
- consultar cursos;
- realizar búsquedas;
- utilizar filtros;
- revisar expositores asociados a una actividad;
- consultar precios;
- registrarse en eventos;
- registrarse en capacitaciones;
- conocer los cursos disponibles.

---

## 6.2 Participante

Persona que se encuentra registrada en al menos un evento o capacitación.

No necesariamente posee una cuenta en la plataforma.

Cada participante tendrá información personal que permita identificarlo y mantener su historial institucional.

Un participante podrá posteriormente convertirse también en usuario del campus.

---

## 6.3 Usuario del campus

Persona que posee una cuenta con correo electrónico y contraseña.

Podrá:

- iniciar sesión;
- consultar sus cursos;
- acceder a clases;
- visualizar videos;
- descargar o consultar materiales;
- realizar quizzes;
- consultar su progreso;
- calificar cursos;
- descargar certificados;
- acceder a nuevos cursos que posteriormente le sean habilitados.

---

## 6.4 Administrador

Usuario interno de la Cámara con permisos amplios.

Podrá gestionar:

- actividades;
- cursos;
- participantes;
- inscripciones;
- confirmaciones;
- asistencia;
- certificados;
- expositores;
- usuarios;
- contenido;
- configuración funcional.

---

## 6.5 Operador

Usuario interno destinado principalmente a tareas operativas.

Podrá, según los permisos que finalmente se le asignen:

- consultar inscritos;
- validar participantes;
- cambiar estados;
- registrar asistencia;
- consultar información necesaria para la atención de participantes.

El MVP deberá permitir diferenciar al menos roles internos, aunque la configuración avanzada de permisos no constituye un objetivo principal.

---

# 7. Modelo conceptual de actividades

Para evitar duplicar funcionalidades innecesariamente, Eventos y Capacitaciones compartirán un modelo funcional común denominado **Actividad**.

Una actividad tendrá un tipo:

- Evento.
- Capacitación.

Para el usuario seguirán apareciendo como categorías distintas.

La diferencia será principalmente conceptual y de contenido.

---

# 8. Eventos

Los eventos podrán representar, entre otros:

- conferencias;
- congresos;
- convenciones;
- ferias;
- foros;
- ruedas de negocios;
- networking;
- desayunos empresariales;
- encuentros institucionales;
- otras actividades empresariales.

Un evento podrá tener:

- una fecha;
- varias fechas;
- uno o varios horarios;
- uno o varios expositores;
- modalidad presencial;
- modalidad virtual;
- modalidad híbrida;
- programa o agenda;
- límite de cupos opcional;
- precio;
- precio especial para asociados;
- inscripción gratuita o con costo.

Un mismo evento podrá desarrollarse durante varios días.

En el MVP, una inscripción corresponderá a la actividad completa y no a días individuales.

---

# 9. Capacitaciones

Las capacitaciones utilizarán prácticamente el mismo flujo de publicación e inscripción que los eventos.

Podrán incluir información como:

- título;
- descripción;
- objetivo;
- público objetivo;
- modalidad;
- fechas;
- horarios;
- duración;
- horas académicas;
- docente o expositor;
- temario;
- materiales informativos;
- precio;
- precio asociado.

Una capacitación podrá desarrollarse durante varias fechas.

Para el MVP no se implementará control de asistencia por cada sesión.

La asistencia será general respecto de la capacitación.

Tampoco se manejarán evaluaciones académicas dentro de las capacitaciones en vivo.

Las evaluaciones formarán parte del módulo de cursos grabados.

---

# 10. Publicación de actividades

Una actividad podrá encontrarse en los siguientes estados:

- Borrador.
- Publicado.
- Finalizado.
- Archivado.
- Cancelado.

## Borrador

La actividad está siendo preparada y no es visible públicamente.

## Publicado

La actividad está disponible en el portal.

## Finalizado

La actividad ya se realizó.

## Archivado

La actividad se conserva históricamente pero deja de tener relevancia operativa.

## Cancelado

La actividad fue suspendida.

En el MVP no habrá un proceso interno de aprobación.

El usuario administrativo autorizado podrá crear y publicar directamente una actividad.

---

# 11. Información de una actividad

Dependiendo del tipo, la actividad podrá contener:

- título;
- imagen o banner;
- descripción;
- objetivos;
- público objetivo;
- categoría;
- tipo;
- modalidad;
- fecha o fechas;
- horarios;
- ubicación;
- dirección;
- información de conexión en caso de modalidad virtual;
- duración;
- horas académicas cuando corresponda;
- programa;
- agenda;
- temario;
- expositores;
- precio general;
- precio asociado;
- condición gratuita o con costo;
- exclusividad para asociados;
- responsable de consultas;
- teléfono o medio de contacto;
- correo;
- información adicional.

No todos los campos deberán ser obligatorios.

---

# 12. Catálogo público

La plataforma tendrá como mínimo las siguientes secciones:

- Eventos.
- Capacitaciones.
- Cursos.

También podrá existir una vista conjunta de actividades.

El catálogo deberá facilitar la identificación de las próximas actividades de la Cámara.

---

# 13. Búsqueda y filtros

El visitante podrá buscar actividades mediante palabras.

El sistema deberá permitir filtrar, como mínimo, por criterios relevantes como:

- modalidad;
- tipo de actividad;
- categoría;
- fecha;
- actividad gratuita;
- actividad con costo.

También podrá diferenciarse visualmente si una actividad es:

- pública;
- dirigida a asociados;
- exclusiva para asociados.

---

# 14. Inscripción en eventos y capacitaciones

Una persona **no deberá crear una cuenta** para inscribirse.

El proceso será directo desde la ficha de la actividad.

La finalidad es minimizar la fricción.

El formulario solicitará:

## Obligatorios

- tipo de documento;
- número de documento;
- nombres;
- apellidos;
- correo electrónico;
- teléfono o celular;
- cargo.

El tipo de documento será DNI por defecto.

También deberá admitirse Carné de Extranjería.

El cargo será un campo de texto libre.

## Opcionales

- dirección;
- empresa;
- RUC.

Cuando la persona seleccione una inscripción como asociado, empresa y RUC pasarán a ser obligatorios.

---

# 15. Inscripción general y asociado

No existirán dos formularios independientes.

Existirá un único formulario dinámico.

El participante seleccionará:

- Público general.
- Asociado CCI.

Cuando seleccione Asociado CCI, el sistema solicitará obligatoriamente:

- empresa;
- RUC.

El sistema no realizará dentro del MVP una validación automática del padrón de asociados.

La Cámara deberá verificar manualmente la condición del participante.

---

# 16. Actividades exclusivas para asociados

Algunas actividades podrán configurarse como exclusivas para asociados.

Estas actividades sí podrán mostrarse públicamente en el portal.

Esto permitirá informar al público sobre los beneficios de pertenecer a la Cámara.

Sin embargo, el proceso de inscripción indicará que la actividad está dirigida exclusivamente a asociados.

La condición del asociado será revisada posteriormente por el personal de la Cámara.

---

# 17. Detección de inscripciones duplicadas

Una misma persona no podrá inscribirse varias veces en la misma actividad utilizando el mismo documento de identidad.

Cuando esto ocurra, el sistema deberá informar:

“Ya te encuentras inscrito en esta actividad”.

Cada inscripción tendrá además un código único.

Ejemplo:

CCI-EV-000124

El código servirá como referencia tanto para el participante como para el personal de la Cámara.

---

# 18. Actividades gratuitas

El flujo será:

1. El usuario consulta la actividad.
2. Completa el formulario.
3. El sistema registra la inscripción.
4. La persona queda automáticamente en estado de inscrito/confirmado.
5. Se genera un código de inscripción.
6. Se envía una notificación por correo.

El mensaje deberá ser claro:

“Tu inscripción ha sido confirmada”.

---

# 19. Actividades con costo

El MVP no incorporará pasarela de pagos.

El proceso de pago continuará realizándose mediante los mecanismos externos definidos por la Cámara.

El flujo será:

1. La persona consulta la actividad.
2. Completa el formulario.
3. El sistema registra una preinscripción.
4. Se genera un código.
5. Se informa que debe comunicarse con la Cámara.
6. La persona realiza la coordinación correspondiente.
7. La Cámara verifica externamente el pago o requisito.
8. El personal cambia el estado a Confirmado.
9. El participante recibe una notificación por correo.

El mensaje posterior a la preinscripción deberá ser intuitivo y evitar que el usuario crea que ya se encuentra definitivamente inscrito.

Ejemplo:

“Tu preinscripción ha sido registrada correctamente. Para confirmar tu participación, comunícate con la Cámara de Comercio de Ica”.

---

# 20. Preinscritos y confirmados

En actividades con costo deberán diferenciarse claramente:

## Preinscritos / no confirmados

Personas que llenaron el formulario pero cuya participación todavía no ha sido validada por la Cámara.

## Confirmados

Personas cuya participación fue aceptada posteriormente.

La administración deberá permitir consultar ambos grupos de forma diferenciada.

---

# 21. Cupos

El límite de cupos será opcional.

Una actividad podrá configurarse como:

- Sin límite de cupos.
- Con límite de cupos.

Si existe un límite, el sistema deberá controlar la disponibilidad.

La Cámara también podrá cerrar manualmente las inscripciones cuando corresponda.

La lista de espera queda fuera del MVP.

---

# 22. Periodo de inscripción

Una actividad podrá disponer de:

- fecha de inicio de inscripción;
- fecha de cierre de inscripción.

El cierre de inscripción no necesariamente coincidirá con la fecha del evento.

---

# 23. Asistencia

La asistencia sí forma parte del MVP.

Su principal finalidad será permitir el control de participantes y determinar quién puede recibir certificados.

La Cámara podrá registrar asistencia:

- individualmente;
- mediante selección múltiple.

En actividades con costo, la pantalla deberá permitir diferenciar:

- preinscritos/no confirmados;
- confirmados.

Los no confirmados podrán seguir siendo consultados.

La asistencia deberá manejar estados como:

- Pendiente.
- Asistió.
- No asistió.

Para capacitaciones con varias sesiones, el MVP no controlará asistencia por cada sesión.

Solo se almacenará una condición general de asistencia.

---

# 24. Certificados de eventos y capacitaciones

Los certificados formarán parte del MVP.

Un participante no recibirá un certificado automáticamente al ser marcado como asistente.

El proceso será:

1. La Cámara registra asistencia.
2. Revisa la relación de asistentes.
3. Selecciona uno o varios participantes.
4. Ejecuta la acción “Habilitar certificados”.
5. El certificado queda disponible.
6. El participante recibe un correo con acceso al documento.

Esto permitirá revisar la información antes de emitir certificados.

Solamente personas marcadas como asistentes podrán recibir certificados.

---

# 25. Certificados sin cuenta

Los participantes de eventos y capacitaciones no necesitan crear cuenta.

Por ese motivo, sus certificados serán accesibles mediante un enlace proporcionado por correo.

No se obligará al participante a registrarse posteriormente solo para descargar su certificado.

---

# 26. Información de certificados

Los certificados utilizarán inicialmente una **plantilla institucional común**.

El contenido podrá variar según la actividad.

Podrá incluir:

- nombre de la Cámara de Comercio de Ica;
- nombre completo del participante;
- nombre de la actividad;
- condición correspondiente: participó, culminó, aprobó, etc.;
- fecha;
- horas académicas cuando corresponda;
- autoridades o firmantes;
- código único del certificado.

Las horas académicas serán configurables.

En eventos no serán necesarias por defecto.

En capacitaciones y cursos podrán utilizarse.

Cada certificado tendrá un código único.

Ejemplo:

CCI-CERT-2026-000245

La verificación pública de certificados no formará parte del MVP.

---

# 27. Expositores

Los expositores no serán simples textos dentro de cada actividad.

La plataforma mantendrá un registro reutilizable de expositores.

Cada expositor podrá contener:

- fotografía;
- nombres y apellidos;
- profesión o cargo;
- empresa o institución;
- reseña breve.

Al crear una actividad, el administrador podrá seleccionar un expositor existente o registrar uno nuevo.

Esto permitirá que la Cámara construya progresivamente un historial interno de personas que han participado como expositores.

El historial de actividades de cada expositor será visible únicamente para la administración durante el MVP.

Los expositores no tendrán cuentas propias ni acceso al sistema.

---

# 28. Cursos grabados

Los cursos grabados constituyen un módulo diferente a eventos y capacitaciones.

Su principal diferencia es que requieren una relación permanente entre usuario y plataforma.

Cada curso podrá contener:

- información pública;
- imagen;
- descripción;
- objetivos;
- instructor;
- horas;
- precio;
- precio asociado;
- condición gratuita o con costo;
- módulos;
- clases;
- videos;
- materiales;
- quizzes;
- valoración.

---

# 29. Catálogo público de cursos

Los cursos podrán mostrarse públicamente incluso cuando el visitante todavía no tenga una cuenta.

Cualquier persona podrá conocer:

- nombre del curso;
- descripción;
- instructor;
- contenidos;
- duración;
- precio;
- características generales.

Para ingresar al contenido deberá registrarse o iniciar sesión.

---

# 30. Cuenta de usuario para cursos

Los cursos grabados requerirán una cuenta.

El registro solicitará como mínimo:

- tipo de documento;
- documento;
- nombres;
- apellidos;
- correo;
- celular;
- cargo;
- contraseña;
- confirmación de contraseña.

Podrán existir datos adicionales opcionales como:

- empresa;
- RUC;
- dirección.

El correo electrónico será utilizado como dato principal de acceso.

Deberá existir recuperación de contraseña.

---

# 31. Relación entre participante y cuenta

Una persona puede existir dentro del sistema antes de tener una cuenta.

Ejemplo:

Una persona se registra en tres eventos.

Posteriormente decide llevar un curso grabado.

Al crear una cuenta utilizando el mismo documento, el sistema deberá mantener la relación con su información histórica.

Conceptualmente:

PERSONA

- Evento A.
- Evento B.
- Capacitación C.
- Cuenta de campus.
- Curso D.
- Curso E.

La creación de una cuenta no crea una segunda persona.

Esta regla será importante para mantener una ficha institucional única de cada participante.

---

# 32. Cursos gratuitos

Para cursos gratuitos el flujo será:

1. Usuario consulta el curso.
2. Crea una cuenta o inicia sesión.
3. Selecciona inscribirse.
4. El curso se habilita inmediatamente.
5. Aparece en “Mis cursos”.

No será necesaria aprobación manual de la Cámara.

---

# 33. Cursos con costo

Para cursos con costo:

1. El usuario consulta el curso.
2. Crea una cuenta o inicia sesión.
3. Se comunica con la Cámara.
4. Realiza el proceso externo correspondiente.
5. La Cámara confirma la condición.
6. Un administrador habilita manualmente el curso.
7. El curso aparece en “Mis cursos”.

La Cámara también podrá retirar el acceso a un curso cuando sea necesario.

Un usuario podrá tener varios cursos habilitados simultáneamente.

---

# 34. Organización académica de cursos

Los cursos estarán organizados en módulos.

Ejemplo:

Curso

Módulo 1
- Clase 1.
- Clase 2.
- Materiales.
- Quiz.

Módulo 2
- Clase 1.
- Clase 2.
- Materiales.
- Quiz.

Los alumnos podrán ingresar libremente a las clases.

No se aplicará desbloqueo secuencial.

Una persona podrá ingresar al módulo que desee.

---

# 35. Videos y progreso

El progreso de las clases será determinado automáticamente.

El participante no tendrá que pulsar un botón de “Marcar como completado”.

Una clase de video se considerará completada cuando se haya reproducido al menos el **90 % del contenido**.

Ejemplo:

Video de 20 minutos.

Al reproducir al menos 18 minutos:

Clase completada.

El progreso deberá conservarse cuando el usuario salga y vuelva posteriormente.

---

# 36. Materiales

Las clases podrán incluir materiales complementarios como:

- documentos;
- archivos;
- enlaces;
- recursos adicionales.

Los materiales no serán obligatorios para completar el curso.

No será necesario verificar si una persona descargó o leyó cada documento.

---

# 37. Quizzes

Los cursos podrán contener quizzes de alternativas.

Los quizzes serán configurables por módulo.

No todos los módulos estarán obligados a tener uno.

Cada pregunta tendrá:

- enunciado;
- alternativas;
- respuesta correcta;
- explicación opcional.

La nota mínima de aprobación será del **80 %**.

Los intentos serán ilimitados.

Después de cada intento se podrá mostrar:

- resultado;
- respuestas correctas;
- explicación cuando exista.

No se incluirán dentro del MVP:

- preguntas abiertas;
- trabajos;
- tareas;
- calificación manual del docente;
- rúbricas;
- exámenes supervisados.

---

# 38. Finalización del curso

Un curso se considerará completado cuando:

1. Todas las clases obligatorias de video hayan sido completadas.

Y

2. Todos los quizzes existentes hayan sido aprobados con una nota mínima de 80 %.

Si un curso no contiene quizzes, bastará completar todas sus clases.

Los materiales complementarios no condicionarán la finalización.

---

# 39. Certificado de curso

Cuando el alumno cumpla automáticamente las reglas de finalización:

- el curso cambiará a estado completado;
- se habilitará automáticamente el certificado.

No será necesaria una aprobación administrativa adicional.

El usuario podrá encontrarlo dentro de su cuenta.

Sección:

“Mis certificados”.

---

# 40. Valoración del curso

Una vez completado el curso, el usuario podrá calificarlo.

La valoración tendrá:

- puntuación de 1 a 5 estrellas;
- comentario opcional.

Un usuario tendrá una valoración por curso.

La valoración podrá ser modificada posteriormente.

---

# 41. Mi cuenta

El usuario del campus podrá disponer de un espacio personal con:

- perfil;
- mis cursos;
- progreso;
- cursos completados;
- certificados.

En futuras etapas podría mostrarse también el historial completo de eventos y capacitaciones.

Aunque ese historial no necesariamente se muestre al usuario en el MVP, la Cámara sí deberá conservar internamente la relación de todas sus participaciones.

---

# 42. Historial institucional de participantes

La plataforma deberá permitir construir una ficha única de participante.

Ejemplo:

JUAN PÉREZ

Datos personales.

Historial:

- Congreso Empresarial — asistió.
- Taller Tributario — asistió.
- Curso de Marketing — completado.
- Curso de Excel — 70 %.

Esto permitirá que la Cámara disponga progresivamente de información institucional organizada sobre las personas que participan en sus actividades.

---

# 43. Administración

El panel administrativo deberá centralizar la gestión del sistema.

Como mínimo deberá incluir:

## Actividades
- Eventos.
- Capacitaciones.

## Participantes
- Inscripciones.
- Preinscritos.
- Confirmados.
- Asistencia.
- Historial.

## Certificados
- Habilitación.
- Consulta.

## Campus
- Cursos.
- Módulos.
- Clases.
- Materiales.
- Quizzes.
- Usuarios.
- Habilitación de cursos.
- Progreso.

## Expositores
- Registro.
- Consulta.
- Historial administrativo.

---

# 44. Gestión de participantes

La administración deberá permitir buscar participantes mediante datos como:

- documento;
- nombre;
- correo;
- teléfono.

Deberá mostrar sus participaciones.

Los datos del participante podrán ser corregidos por personal autorizado cuando sea necesario.

---

# 45. Exportación de información

El MVP deberá permitir exportar listas de participantes.

Ejemplo:

- documento;
- nombres;
- correo;
- celular;
- cargo;
- empresa;
- RUC;
- tipo de inscripción;
- estado;
- asistencia.

Esto permitirá a las áreas de la Cámara seguir realizando determinados análisis administrativos fuera de la plataforma cuando sea necesario.

---

# 46. Correos automáticos

La experiencia deberá contemplar notificaciones automáticas por correo en tres situaciones principales:

## Inscripción gratuita

Confirmación automática.

## Preinscripción en actividad con costo

Información de que el registro fue recibido pero todavía no está confirmado.

## Confirmación de actividad con costo

Aviso de que la Cámara validó la participación.

También se enviará correo cuando se habilite un certificado de evento o capacitación.

La forma técnica de automatizar dichos correos no forma parte de este documento.

---

# 47. WhatsApp

No se implementará mensajería masiva mediante WhatsApp dentro del MVP.

La plataforma sí podrá facilitar el contacto individual con la Cámara cuando corresponda.

Como posibilidad posterior, la institución podrá utilizar correos para compartir enlaces hacia grupos o comunidades de WhatsApp de determinadas actividades.

Esto no constituye una funcionalidad central del MVP.

---

# 48. Cambios y cancelaciones

Un administrador podrá modificar o cancelar actividades.

La plataforma deberá mostrar claramente cuando una actividad haya sido cancelada.

Sin embargo, dentro del MVP:

- no se enviarán notificaciones automáticas por cambio de fecha;
- no se enviarán notificaciones automáticas por cancelación.

La gestión de esas comunicaciones continuará realizándose externamente cuando sea necesaria.

---

# 49. Experiencia del usuario

La plataforma deberá priorizar simplicidad.

Los eventos y capacitaciones deberán tener una experiencia especialmente rápida.

No deberá obligarse a:

- crear cuenta;
- crear contraseña;
- iniciar sesión;

simplemente para participar en una actividad.

Los cursos sí justificarán una cuenta porque existe una relación continua entre usuario y plataforma.

La cantidad de datos obligatorios deberá mantenerse limitada a los que tengan utilidad institucional real.

---

# 50. Flujo resumido: evento gratuito

Consultar evento.

↓

Seleccionar inscripción.

↓

Completar formulario.

↓

Inscripción confirmada automáticamente.

↓

Generación de código.

↓

Correo de confirmación.

↓

Participación.

↓

CCI registra asistencia.

↓

CCI habilita certificado.

↓

Correo con acceso al certificado.

---

# 51. Flujo resumido: evento o capacitación con costo

Consultar actividad.

↓

Completar formulario.

↓

Preinscripción.

↓

Correo de preinscripción.

↓

Coordinación externa con la Cámara.

↓

CCI verifica condición/pago.

↓

Confirmación manual.

↓

Correo de confirmación.

↓

Participación.

↓

Registro de asistencia.

↓

Habilitación administrativa del certificado.

↓

Acceso al certificado.

---

# 52. Flujo resumido: curso gratuito

Consultar curso.

↓

Crear cuenta o iniciar sesión.

↓

Inscribirse.

↓

Habilitación inmediata.

↓

Acceder a módulos.

↓

Visualizar clases.

↓

Completar 90 % de cada video requerido.

↓

Realizar quizzes existentes.

↓

Obtener 80 % o más.

↓

Completar curso.

↓

Certificado automático.

↓

Valoración del curso.

---

# 53. Flujo resumido: curso con costo

Consultar curso.

↓

Crear cuenta o iniciar sesión.

↓

Coordinar externamente con la Cámara.

↓

CCI valida.

↓

Administrador habilita curso.

↓

Curso aparece en “Mis cursos”.

↓

Visualización de clases.

↓

Quizzes.

↓

Finalización.

↓

Certificado.

↓

Valoración.

---

# 54. Reglas de negocio principales

1. Eventos y capacitaciones no requieren cuenta.

2. Cursos grabados sí requieren cuenta.

3. DNI será el documento predeterminado.

4. También se admitirá CE.

5. Una persona no podrá duplicar su inscripción en una misma actividad.

6. Cada inscripción tendrá código propio.

7. Las actividades gratuitas se confirman automáticamente.

8. Las actividades con costo generan inicialmente una preinscripción.

9. La Cámara confirma manualmente las actividades con costo.

10. La condición de asociado será declarada por el usuario y validada manualmente.

11. Para asociados, Empresa y RUC serán obligatorios.

12. El precio MVP tendrá dos categorías: general y asociado.

13. Las actividades podrán tener varias fechas.

14. El límite de cupos será opcional.

15. La asistencia formará parte del MVP.

16. La asistencia podrá registrarse individualmente o en grupo.

17. Los certificados de eventos y capacitaciones requieren asistencia registrada.

18. La emisión de estos certificados requiere una acción administrativa posterior.

19. Los cursos gratuitos se habilitan automáticamente.

20. Los cursos con costo se habilitan manualmente.

21. Una cuenta podrá contener varios cursos.

22. Un video se completará automáticamente al alcanzar 90 % de reproducción.

23. Los materiales no afectarán la finalización.

24. Los quizzes serán opcionales por módulo.

25. La nota mínima será 80 %.

26. Los intentos serán ilimitados.

27. Todos los quizzes existentes deberán aprobarse.

28. Un curso sin quizzes podrá completarse únicamente mediante las clases.

29. El certificado del curso se generará automáticamente al completarlo.

30. Los cursos podrán calificarse mediante estrellas y comentario opcional.

31. Los expositores tendrán registros reutilizables.

32. El historial de expositores será administrativo.

33. Una persona podrá existir sin cuenta y posteriormente vincularse a una cuenta del campus.

---

# 55. Alcance funcional del MVP

## Incluido

- Portal público.
- Catálogo.
- Eventos.
- Capacitaciones.
- Cursos grabados.
- Búsqueda.
- Filtros.
- Modalidades.
- Categorías.
- Actividades gratuitas y con costo.
- Precio general.
- Precio asociado.
- Actividades exclusivas para asociados.
- Inscripción sin cuenta.
- Inscripción dinámica asociado/general.
- Preinscripciones.
- Confirmaciones.
- Código de inscripción.
- Cupos opcionales.
- Varias fechas por actividad.
- Expositores.
- Historial administrativo de expositores.
- Registro de asistencia.
- Certificados.
- Plantilla institucional.
- Código de certificado.
- Cuenta de campus.
- Recuperación de contraseña.
- Cursos gratuitos.
- Cursos con costo.
- Habilitación manual de cursos.
- Múltiples cursos por alumno.
- Módulos.
- Videos.
- Materiales.
- Progreso automático.
- Regla de 90 % de reproducción.
- Quizzes.
- Nota mínima del 80 %.
- Intentos ilimitados.
- Certificado automático de cursos.
- Valoración del curso.
- Administración centralizada.
- Historial de participantes.
- Exportación de participantes.
- Correos transaccionales principales.

---

# 56. Funcionalidades fuera del MVP

Para evitar crecimiento innecesario del proyecto, se consideran fuera de la primera versión:

- pasarela de pagos;
- cobro electrónico interno;
- facturación electrónica;
- validación automática del padrón de asociados;
- múltiples tipos avanzados de tarifas;
- lista de espera;
- control de asistencia por cada sesión;
- QR avanzado de asistencia;
- aplicación móvil;
- mensajería masiva por WhatsApp;
- campañas de marketing;
- videoconferencia propia;
- streaming propio;
- evaluaciones abiertas;
- trabajos académicos;
- revisión manual de tareas;
- rúbricas;
- exámenes supervisados;
- secuencias obligatorias de módulos;
- desbloqueo progresivo de contenido;
- vencimiento de cursos;
- verificación pública de certificados;
- portal independiente para expositores;
- flujo interno de aprobación de publicaciones;
- notificaciones automáticas de cambios o cancelaciones;
- Business Intelligence avanzado;
- integraciones empresariales adicionales.

---

# 57. Criterio de éxito del MVP

El MVP podrá considerarse funcionalmente exitoso cuando la Cámara pueda gestionar dentro de la plataforma un proceso real completo.

Ejemplo:

1. Crear un evento.
2. Publicarlo.
3. Recibir inscripciones.
4. Consultar participantes.
5. Confirmar participantes cuando corresponda.
6. Registrar asistencia.
7. Entregar certificados.

Y simultáneamente:

1. Publicar un curso.
2. Registrar alumnos.
3. Habilitar el acceso.
4. Permitir que vean las clases.
5. Registrar automáticamente el progreso.
6. Aplicar quizzes.
7. Detectar que completaron el curso.
8. Entregar su certificado.

Si ambos recorridos pueden realizarse sin depender de registros manuales paralelos para administrar la información principal, el MVP estará cumpliendo su objetivo funcional.

---

# 58. Visión futura

Aunque el MVP se limitará a las funciones anteriores, el proyecto debe entenderse conceptualmente como el inicio de un ecosistema digital de servicios de la Cámara de Comercio de Ica.

En etapas posteriores podría evolucionar hacia funcionalidades como:

- integración con asociados;
- pagos;
- facturación;
- automatización avanzada;
- marketing;
- CRM;
- analítica;
- directorio empresarial;
- bolsa laboral;
- beneficios;
- servicios empresariales;
- integración con otras plataformas institucionales.

Estas posibilidades futuras no deberán incrementar el alcance de la primera versión.

---

# 59. Conclusión del análisis

La plataforma no debe plantearse como tres sistemas independientes.

La solución funcional óptima consiste en una **Plataforma Digital de Eventos y Formación de la Cámara de Comercio de Ica**, con experiencias especializadas dentro de un mismo ecosistema.

Eventos y capacitaciones utilizarán un flujo abierto y de rápida inscripción.

Los cursos grabados utilizarán un flujo de usuario autenticado debido a que necesitan mantener una relación permanente con el alumno.

La administración será centralizada.

El modelo permitirá que una misma persona pueda participar inicialmente en eventos sin cuenta y posteriormente convertirse en alumno del campus sin perder su historial previo.

El MVP debe concentrarse en sustituir los procesos manuales más importantes y ofrecer una experiencia de usuario simple.

Funciones como pagos electrónicos, integraciones avanzadas, mensajería masiva y otras automatizaciones deberán mantenerse fuera de la primera versión para evitar que el proyecto pierda su carácter de MVP.

Con las decisiones actualmente establecidas, el proyecto cuenta con una definición funcional suficientemente sólida para pasar a la siguiente etapa: **especificación formal de requisitos funcionales, actores, casos de uso, reglas de negocio y criterios de aceptación**, manteniendo todavía fuera de discusión cualquier decisión tecnológica.
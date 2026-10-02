# Preventa opcional de eventos

## Configuración y experiencia pública

En **Participación y cupos**, los precios general y para asociados son las tarifas regulares. Los eventos pagados pueden añadir **Precio de preventa general**, **Precio de preventa para asociados** y **Preventa hasta**. Cada tarifa de preventa es opcional: un público sin ella paga su precio regular. Un evento exclusivo solo admite la tarifa para asociados. Capacitaciones, actividades gratuitas y certificados opcionales conservan sus reglas comerciales actuales.

Las tarifas deben ser positivas, menores que su tarifa regular y tener como máximo dos decimales. Se permite guardar borradores incompletos; publicar una preventa exige fecha límite. La fecha incluye todo el día seleccionado en **America/Lima**: la frontera guardada es la medianoche del día siguiente, excluida de la preventa. La expiración no cierra las inscripciones y una preventa vencida puede conservarse al editar el evento.

El catálogo, el detalle y los formularios muestran la tarifa vigente. El detalle muestra también la tarifa regular mientras la preventa está activa; al vencer retira la oferta. Los componentes actualizan su reloj al vencimiento y al volver a la pestaña. La caché guarda configuración, no una cotización congelada, y se invalida al guardar.

En eventos exclusivos pagados con cortesías, el encabezado es **Su empresa cuenta con N pase(s) gratuito(s)**, seguido de **Adquiere pases adicionales**, tarifas y botón **Inscribirme**. La cantidad se indica una sola vez en el encabezado y procede de la cuota configurada; los pases restantes se verifican por RUC y se asignan transaccionalmente según el Hito 16. Debajo del botón se conserva la aclaración de que la disponibilidad se confirma al registrarse.

El banner principal del detalle usa proporción **25:8**, un 20% menos de altura que 5:2 al mismo ancho. La imagen usa encuadre centrado para ocupar el ancho disponible, recortando el excedente cuando su proporción difiere del marco. Solo se reservan franjas de **8 px por lado en móvil y 12 px desde tablet** para la animación verde lima. Los arcos tienen menor presencia y brillo, con esquinas y sombra discretas. La cabecera conserva etiquetas de tipo, modalidad y exclusividad, título y fecha con icono de calendario, sin una tarjeta que la envuelva junto al banner. El lugar se consulta en la tarjeta de inscripción y en Cómo llegar. En móvil, la cabecera y el banner preceden a la tarjeta de inscripción. Los banners de las tarjetas del catálogo conservan la imagen completa, su proporción y decoración.

## Persistencia y transacciones

La migración `202610020001_activity_presale_prices.sql` incorpora `activities.presale_general_price`, `presale_member_price` y `presale_ends_at`, anulables, sin configurar preventas en actividades existentes. Los importes rechazan precisión superior a dos decimales. La validación diferida comprueba el estado final de los envoltorios administrativos y también protege escrituras directas y cambios de estado.

`save_activity` conserva los campos de preventa omitidos por clientes antiguos; valores nulos explícitos eliminan la configuración. Al cambiar a actividad gratuita o capacitación limpia los campos inaplicables; la exclusividad elimina únicamente la tarifa general. Los cambios comerciales quedan auditados. No se aplican seeds ni se modifican precios históricos.

Los envíos individuales y grupales incluyen `expected_unit_price`. PostgreSQL bloquea la actividad, captura un único instante y calcula el importe desde la configuración guardada. El valor enviado sirve exclusivamente para comprobar la aceptación del precio; nunca determina el importe cobrado. Si difiere, devuelve `PRICE_CHANGED` antes de modificar personas, consumir cupos/pases, registrar solicitudes o generar outbox. Un cliente antiguo sin cotización debe recargarse cuando haya preventa configurada.

El formulario conserva los datos escritos, actualiza el resumen y requiere otro envío expreso. Los grupos mantienen además `expected_free_count` y su control de disponibilidad. Un reintento de una solicitud ya guardada devuelve su resultado original incluso después del vencimiento; el navegador conserva el payload original ante respuestas inciertas. Cambiar datos de la solicitud genera otra clave de idempotencia.

Cada plaza conserva `registrations.price_snapshot`: cero para cortesías y tarifa vigente para plazas pagadas. Los pagos posteriores, vistas administrativas, resultados, Excel y notificaciones utilizan estos importes históricos. Los totales grupales se derivan de los snapshots, sin multiplicar nuevamente el precio actual del evento. Los certificados opcionales siguen siendo independientes.

## Verificación y publicación

Las pruebas unitarias cubren normalización, validación, límite horario, públicos, visualización y reintentos. `036_activity_presale_prices_test.sql` verifica RPC públicas, atomicidad, snapshots, comprobantes, cortesías, idempotencia y compatibilidad administrativa con rollback. Ejecutar además las regresiones de grupos, pases, precios, comprobantes y perfiles, más `yarn lint`, `yarn typecheck` y `yarn build`.

Aplicar la migración con dry-run previo y regenerar los tipos mediante `yarn types:db:linked`. Publicar el frontend después de la migración. Hasta actualizarlo, los eventos sin preventa conservarán su funcionamiento; al habilitar preventa, los formularios antiguos deberán recargarse. Los valores y la fecha de cada evento se configuran manualmente desde administración.

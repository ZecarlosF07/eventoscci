export function getRegistrationProcessMessage(isFree: boolean, isGroup: boolean): string {
  if (isFree && isGroup) return "Las plazas se confirmarán al enviar la solicitud.";
  if (isFree) return "Tu inscripción se confirmará al enviar el formulario.";
  if (isGroup) return "Las plazas solicitadas quedarán reservadas. Confirmaremos cada inscripción después de validar el pago.";
  return "Recibiremos tu preinscripción. Confirmaremos tu lugar cuando la CCI valide el pago.";
}

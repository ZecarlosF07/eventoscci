"use client";

import { useState, useTransition } from "react";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Text } from "@/components/atoms/Text";
import { requestActivityCertificateAction } from "@/features/registrations/mutations/certificate-request.actions";
import type { CertificateRequestCardProps } from "@/features/registrations/types/certificate-request.types";
import { formatRegistrationPrice } from "@/features/registrations/utils/registration-formatters";

export function CertificateRequestCard({
  alreadyRequested,
  certificatePrice,
  registrationCode,
  requestToken,
}: CertificateRequestCardProps) {
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  function requestCertificate() {
    setMessage(undefined);
    startTransition(async () => {
      const result = await requestActivityCertificateAction(registrationCode, requestToken);
      if (!result.success) {
        setMessage(result.message);
        return;
      }
      window.location.assign(result.url);
    });
  }

  return (
    <section className="mt-6 rounded-2xl border border-cci-200 bg-cci-50 p-5">
      <Badge variant={alreadyRequested ? "success" : "neutral"}>
        {alreadyRequested ? "Solicitud registrada" : "Certificado digital opcional"}
      </Badge>
      <p className="mt-3 text-xl font-bold text-cci-950">
        Tarifa aplicable: {formatRegistrationPrice(certificatePrice)}
      </p>
      <Text className="mt-2" size="sm">Puedes solicitarlo ahora o después de participar.</Text>
      <Text className="mt-2" size="sm">
        La emisión requiere asistencia registrada. Si pagas antes y no asistes, el importe no es reembolsable.
      </Text>
      <Text className="mt-2" size="sm">
        Al solicitarlo, autorizas a la Cámara de Comercio de Ica a contactarte al celular registrado para coordinar el certificado y su pago.
      </Text>
      <Button className="mt-4 w-full sm:w-auto" disabled={pending} onClick={requestCertificate}>
        {pending ? "Registrando solicitud…" : alreadyRequested ? "Continuar por WhatsApp" : "Solicitar mi certificado"}
      </Button>
      {message ? <p className="mt-3 text-sm font-medium text-rose-700" role="alert">{message}</p> : null}
    </section>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { generateCourseCertificate } from "@/features/certificates/mutations/generate-course-certificate";
import type {
  CertificateGenerationState,
  CertificateGenerationStatusProps,
} from "@/features/certificates/types/certificate.types";

export function CertificateGenerationStatus({
  certificateId,
  fileReady,
}: CertificateGenerationStatusProps) {
  const router = useRouter();
  const [state, setState] = useState<CertificateGenerationState>(fileReady ? "ready" : "pending");

  async function retry() {
    setState("pending");
    try {
      await generateCourseCertificate(certificateId);
      setState("ready");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    if (fileReady) return;
    let active = true;
    void generateCourseCertificate(certificateId).then(() => {
      if (!active) return;
      setState("ready");
      router.refresh();
    }).catch(() => {
      if (active) setState("error");
    });
    return () => { active = false; };
  }, [certificateId, fileReady, router]);

  if (state === "ready") return null;
  if (state === "error") {
    return <Button onClick={() => void retry()} type="button" variant="secondary">Reintentar generación</Button>;
  }
  return <span className="inline-flex items-center text-sm font-medium text-slate-600"><Spinner className="mr-2" /> Generando certificado…</span>;
}

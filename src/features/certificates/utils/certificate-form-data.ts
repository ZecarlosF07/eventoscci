import type { CertificateSigner } from "@/features/certificates/types/certificate.types";

export function checkboxValue(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

export function signerFromFormData(formData: FormData, index: number): Omit<CertificateSigner, "id"> | null {
  const nameValue = formData.get(`signer_name_${index}`);
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  if (!name) return null;
  const titleValue = formData.get(`signer_title_${index}`);
  const pathValue = formData.get(`existing_signature_path_${index}`);
  return {
    signature_path: typeof pathValue === "string" && pathValue ? pathValue : null,
    signer_name: name,
    signer_title: typeof titleValue === "string" && titleValue.trim() ? titleValue.trim() : null,
    sort_order: index,
  };
}

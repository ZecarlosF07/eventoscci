export async function generateCourseCertificate(certificateId: string): Promise<void> {
  const response = await fetch(`/api/certificates/courses/${certificateId}/generate`, { method: "POST" });
  if (!response.ok) throw new Error("CERTIFICATE_GENERATION_FAILED");
}

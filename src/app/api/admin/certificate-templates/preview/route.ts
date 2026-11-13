import { getAdminSession } from "@/features/auth/services/admin-session";
import { readCertificateTemplateDraft, renderCertificateDraft } from "@/features/certificates/services/read-certificate-template-draft";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if ((await getAdminSession())?.role !== "administrator") {
    return Response.json({ message: "Solo un administrador puede preparar una vista previa." }, { status: 403 });
  }
  try {
    const formData = await request.formData();
    const draft = await readCertificateTemplateDraft(await createServerSupabaseClient(), formData);
    if (!draft.ok) return Response.json({ errors: draft.errors, message: draft.message ?? "Revisa los campos indicados." }, { status: 422 });
    const bytes = await renderCertificateDraft(draft, formData.has("preview_speaker"));
    let offset = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.enqueue(bytes.subarray(offset, offset + 64 * 1024));
        offset += 64 * 1024;
        if (offset >= bytes.length) controller.close();
      },
    });
    return new Response(body, {
      headers: { "Cache-Control": "private, no-store", "Content-Type": "application/pdf" },
    });
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : "No se pudo generar la vista previa." }, { status: 422 });
  }
}

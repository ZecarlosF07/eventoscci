import { NextResponse } from "next/server";

import { getCurrentAccount } from "@/features/auth/queries/get-current-account";
import { memberRosterPreviewSchema } from "@/features/member-roster/schemas/member-roster.schema";
import { parseMemberRosterWorkbook } from "@/features/member-roster/utils/parse-member-roster";
import type { Json } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 6 * 1024 * 1024) {
    return NextResponse.json({ error: "El archivo supera el tamaño permitido." }, { status: 413 });
  }
  const account = await getCurrentAccount();
  if (!account?.isActive || account.role !== "administrator") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Selecciona un archivo .xlsx." }, { status: 400 });
  }

  try {
    const parsed = await parseMemberRosterWorkbook(file);
    if (parsed.errors.length) {
      return NextResponse.json({ errors: parsed.errors }, { status: 422 });
    }
    const client = await createServerSupabaseClient();
    const { data, error } = await client.rpc("preview_member_roster_import", {
      p_file_hash: parsed.fileHash,
      p_file_name: parsed.fileName,
      p_rows: parsed.rows as unknown as Json,
    });
    if (error) throw error;
    const preview = memberRosterPreviewSchema.safeParse(data);
    if (!preview.success) throw new Error("La vista previa del padrón no tiene el formato esperado.");
    return NextResponse.json({ preview: preview.data });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "No se pudo previsualizar el padrón.",
    }, { status: 400 });
  }
}

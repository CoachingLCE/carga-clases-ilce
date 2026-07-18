import { NextResponse } from "next/server";
import { getClasesTomadas } from "@/lib/sheets";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cursoId = searchParams.get("cursoId");
  const edicion = searchParams.get("edicion");
  const alumno = searchParams.get("alumno") || "";

  if (!cursoId || !edicion) {
    return NextResponse.json(
      { ok: false, error: "Faltan parámetros cursoId o edicion." },
      { status: 400 }
    );
  }

  try {
    const tomadas = await getClasesTomadas(cursoId, edicion, alumno);
    return NextResponse.json({ ok: true, tomadas });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Error consultando la planilla. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }
}

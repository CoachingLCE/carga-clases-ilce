import { NextResponse } from "next/server";
import { getDocentePorEmail } from "@/lib/sheets";
import { getSesionesAsignadas } from "@/lib/sesionesExternas";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ ok: false, error: "Falta el email." }, { status: 400 });
  }

  try {
    const docente = await getDocentePorEmail(email);
    if (!docente || !docente.aliasSesiones) {
      // Sin alias configurado: no rompemos nada, simplemente no hay pre-asignadas.
      return NextResponse.json({ ok: true, asignaciones: [] });
    }

    const asignaciones = await getSesionesAsignadas(docente.aliasSesiones);
    return NextResponse.json({ ok: true, asignaciones });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Error consultando las sesiones asignadas." },
      { status: 500 }
    );
  }
}

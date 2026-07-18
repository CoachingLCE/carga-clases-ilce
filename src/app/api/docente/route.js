import { NextResponse } from "next/server";
import { getDocentePorEmail } from "@/lib/sheets";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ ok: false, error: "Falta el email." }, { status: 400 });
  }

  try {
    const docente = await getDocentePorEmail(email);
    if (!docente) {
      return NextResponse.json(
        { ok: false, error: "No encontramos ese email en la lista de docentes." },
        { status: 404 }
      );
    }
    if (!docente.activo) {
      return NextResponse.json(
        { ok: false, error: "Este docente figura como inactivo. Consultá con administración." },
        { status: 403 }
      );
    }
    return NextResponse.json({ ok: true, docente });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Error consultando la planilla. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }
}

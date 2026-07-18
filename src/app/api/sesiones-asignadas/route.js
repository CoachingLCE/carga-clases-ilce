import { NextResponse } from "next/server";
import { getDocentePorEmail, getClasesTomadas } from "@/lib/sheets";
import { getSesionesAsignadas } from "@/lib/sesionesExternas";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const cursoId = searchParams.get("cursoId") || "";

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

    // Sacamos las sesiones que el docente ya cargó (quedaron registradas en la
    // hoja "Cargas"), para no mostrarlas de nuevo como pendientes después de
    // recargar la página.
    const filtradas = [];
    for (const a of asignaciones) {
      const tomadas = cursoId
        ? await getClasesTomadas(cursoId, a.edicion, a.alumno)
        : [];
      const sesionesPendientes = a.sesiones.filter((s) => !tomadas.includes(String(s)));
      if (sesionesPendientes.length > 0) {
        filtradas.push({ ...a, sesiones: sesionesPendientes });
      }
    }

    return NextResponse.json({ ok: true, asignaciones: filtradas });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Error consultando las sesiones asignadas." },
      { status: 500 }
    );
  }
}

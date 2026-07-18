import { NextResponse } from "next/server";
import { registrarCargas, getClasesTomadas } from "@/lib/sheets";
import { getEstadoCierre } from "@/lib/mes";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, items, modoPrueba } = body;

    if (!email || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Faltan datos para registrar la carga." },
        { status: 400 }
      );
    }

    if (!modoPrueba) {
      const { habilitado } = getEstadoCierre();
      if (!habilitado) {
        return NextResponse.json(
          { ok: false, error: "La carga de este mes ya está cerrada." },
          { status: 403 }
        );
      }
    }

    let aceptados = items;
    let rechazados = [];

    if (!modoPrueba) {
      // Chequeamos, por cada combinación curso+edición(+alumno), qué números ya
      // están tomados, para no pisar la carga de otro docente.
      const cacheTomadas = {};
      aceptados = [];
      for (const item of items) {
        const clave = `${item.cursoId}::${item.edicion}::${(item.alumno || "").toLowerCase()}`;
        if (!(clave in cacheTomadas)) {
          cacheTomadas[clave] = await getClasesTomadas(item.cursoId, item.edicion, item.alumno);
        }
        const tomadas = cacheTomadas[clave];
        if (tomadas.includes(String(item.claseOSesion))) {
          rechazados.push(item);
        } else {
          aceptados.push(item);
          tomadas.push(String(item.claseOSesion));
        }
      }

      if (aceptados.length > 0) {
        await registrarCargas(email, aceptados);
      }
    }

    return NextResponse.json({ ok: true, aceptados, rechazados });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "No se pudo registrar la carga. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }
}

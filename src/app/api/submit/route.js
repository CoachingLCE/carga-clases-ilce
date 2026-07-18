import { NextResponse } from "next/server";
import { registrarCargas } from "@/lib/sheets";
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

    if (!modoPrueba) {
      await registrarCargas(email, items);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "No se pudo registrar la carga. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }
}

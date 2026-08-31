import { NextResponse } from "next/server";
import { getCargasDeDocente, editarCarga, eliminarCarga } from "@/lib/sheets";
import { getEstadoCierre } from "@/lib/mes";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const mes = searchParams.get("mes") || "";

  if (!email) {
    return NextResponse.json({ ok: false, error: "Falta el email." }, { status: 400 });
  }

  try {
    const cargas = await getCargasDeDocente(email, mes);
    return NextResponse.json({ ok: true, cargas });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "No se pudieron traer tus cargas. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { email, fila, claseOSesion, alumno } = body;

    if (!email || !fila) {
      return NextResponse.json(
        { ok: false, error: "Faltan datos para editar la carga." },
        { status: 400 }
      );
    }

    const { habilitado } = getEstadoCierre();
    if (!habilitado) {
      return NextResponse.json(
        { ok: false, error: "La carga de este mes ya está cerrada, no se puede editar." },
        { status: 403 }
      );
    }

    await editarCarga(email, fila, { claseOSesion, alumno });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message || "No se pudo editar la carga." },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { email, fila } = body;

    if (!email || !fila) {
      return NextResponse.json(
        { ok: false, error: "Faltan datos para eliminar la carga." },
        { status: 400 }
      );
    }

    const { habilitado } = getEstadoCierre();
    if (!habilitado) {
      return NextResponse.json(
        { ok: false, error: "La carga de este mes ya está cerrada, no se puede eliminar." },
        { status: 403 }
      );
    }

    await eliminarCarga(email, fila);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message || "No se pudo eliminar la carga." },
      { status: 400 }
    );
  }
}

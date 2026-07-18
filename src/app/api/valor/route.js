import { NextResponse } from "next/server";
import { getEdiciones, getValor } from "@/lib/sheets";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  try {
    if (searchParams.has("soloEdiciones")) {
      const ediciones = await getEdiciones();
      return NextResponse.json({ ok: true, ediciones });
    }

    const email = searchParams.get("email");
    const curso = searchParams.get("curso");
    if (!email || !curso) {
      return NextResponse.json(
        { ok: false, error: "Faltan parámetros email o curso." },
        { status: 400 }
      );
    }

    const valor = await getValor(email, curso);
    return NextResponse.json({ ok: true, valor });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Error consultando la planilla. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }
}

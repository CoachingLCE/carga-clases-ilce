import { NextResponse } from "next/server";
import { getHistorialDeDocente } from "@/lib/sheets";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ ok: false, error: "Falta el email." }, { status: 400 });
  }

  try {
    const cargas = await getHistorialDeDocente(email);
    return NextResponse.json({ ok: true, cargas });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "No se pudo traer tu historial. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }
}

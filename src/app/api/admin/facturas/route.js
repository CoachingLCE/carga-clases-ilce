import { NextResponse } from "next/server";
import { getFacturas } from "@/lib/sheets";
import { MAIL_ADMINISTRACION } from "@/lib/config";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get("email") || "").trim().toLowerCase();

  if (email !== MAIL_ADMINISTRACION.toLowerCase()) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 403 });
  }

  try {
    const facturas = await getFacturas();
    return NextResponse.json({ ok: true, facturas });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Error consultando la planilla." },
      { status: 500 }
    );
  }
}

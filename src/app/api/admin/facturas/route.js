import { NextResponse } from "next/server";
import { getFacturasRecibidas, getAdministradorPorEmail } from "@/lib/sheets";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get("email") || "").trim();

  try {
    const administrador = await getAdministradorPorEmail(email);
    if (!administrador || !administrador.activo) {
      return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 403 });
    }

    const facturas = await getFacturasRecibidas();
    return NextResponse.json({ ok: true, facturas });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Error consultando la planilla." },
      { status: 500 }
    );
  }
}

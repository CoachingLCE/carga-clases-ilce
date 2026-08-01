import { NextResponse } from "next/server";
import { marcarFacturaSubida, getDocentePorEmail } from "@/lib/sheets";
import { enviarMailFacturaSubida } from "@/lib/mail";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const archivo = formData.get("factura");
    const email = formData.get("email");
    const mes = formData.get("mes");
    const alias = formData.get("alias") || "";
    const modoPrueba = formData.get("modoPrueba") === "1";

    if (!archivo || !email || !mes) {
      return NextResponse.json(
        { ok: false, error: "Falta el archivo, el email o el mes." },
        { status: 400 }
      );
    }

    if (modoPrueba) {
      // No tocamos Drive ni la planilla: solo probamos que el mail se mande bien.
      try {
        await enviarMailFacturaSubida({
          emailDocente: email,
          nombreDocente: "Modo prueba",
          mes: `${mes} (PRUEBA — no se guardó nada)`,
          archivoUrl: "",
          alias,
        });
        return NextResponse.json({ ok: true });
      } catch (mailErr) {
        console.error("No se pudo enviar el mail de prueba de factura:", mailErr);
        return NextResponse.json(
          {
            ok: false,
            error:
              "No se pudo enviar el mail de prueba. Revisá GMAIL_USER y GMAIL_APP_PASSWORD en Vercel.",
          },
          { status: 500 }
        );
      }
    }

    const buffer = Buffer.from(await archivo.arrayBuffer());
    const fechaHoy = new Date().toISOString().slice(0, 10);
    const nombreArchivo = `Factura - ${email} - ${fechaHoy} - ${archivo.name}`;

    // Nota: ya no subimos el archivo a Google Drive. Las cuentas de servicio
    // no tienen cuota de almacenamiento propia en Drive normal (solo en
    // Unidades compartidas, que requieren Google Workspace). En su lugar,
    // adjuntamos la factura directo al mail de confirmación.
    const archivoUrl = "";

    const { count: actualizadas, detalle, total } = await marcarFacturaSubida({
      email,
      mes,
      archivoUrl,
      alias,
    });

    if (actualizadas === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No encontramos cargas pendientes de facturar para este mes. ¿Ya confirmaste tu carga?",
        },
        { status: 404 }
      );
    }

    // Mandamos el mail de confirmación. Si falla, no rompemos la respuesta —
    // la factura ya quedó registrada en la planilla.
    try {
      const docente = await getDocentePorEmail(email);
      await enviarMailFacturaSubida({
        emailDocente: email,
        nombreDocente: docente?.nombre || "",
        mes,
        archivoUrl,
        alias,
        adjunto: {
          filename: nombreArchivo,
          content: buffer,
          contentType: archivo.type || "application/octet-stream",
        },
        detalle,
        total,
      });
    } catch (mailErr) {
      console.error("No se pudo enviar el mail de factura recibida:", mailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "No se pudo subir la factura. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }
}

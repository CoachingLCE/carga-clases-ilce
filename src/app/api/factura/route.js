import { NextResponse } from "next/server";
import { Readable } from "stream";
import { getDriveClient } from "@/lib/googleAuth";
import { marcarFacturaSubida } from "@/lib/sheets";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const archivo = formData.get("factura");
    const email = formData.get("email");
    const mes = formData.get("mes");
    const alias = formData.get("alias") || "";

    if (!archivo || !email || !mes) {
      return NextResponse.json(
        { ok: false, error: "Falta el archivo, el email o el mes." },
        { status: 400 }
      );
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
      return NextResponse.json(
        { ok: false, error: "No está configurada la carpeta de Drive (GOOGLE_DRIVE_FOLDER_ID)." },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await archivo.arrayBuffer());
    const stream = Readable.from(buffer);

    const fechaHoy = new Date().toISOString().slice(0, 10);
    const nombreArchivo = `Factura - ${email} - ${fechaHoy} - ${archivo.name}`;

    const drive = getDriveClient();
    const subido = await drive.files.create({
      requestBody: {
        name: nombreArchivo,
        parents: [folderId],
      },
      media: {
        mimeType: archivo.type || "application/octet-stream",
        body: stream,
      },
      fields: "id, webViewLink",
    });

    const archivoUrl = subido.data.webViewLink || "";

    try {
      await drive.permissions.create({
        fileId: subido.data.id,
        requestBody: { role: "reader", type: "anyone" },
      });
    } catch (permErr) {
      console.error("No se pudo dar permiso de lectura al archivo:", permErr);
    }

    const actualizadas = await marcarFacturaSubida({ email, mes, archivoUrl, alias });

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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "No se pudo subir la factura. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }
}

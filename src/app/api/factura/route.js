import { NextResponse } from "next/server";
import { Readable } from "stream";
import { getDriveClient } from "@/lib/googleAuth";
import { getDocentePorEmail, registrarFactura } from "@/lib/sheets";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const archivo = formData.get("factura");
    const email = formData.get("email");
    const fechaFactura = formData.get("fechaFactura");
    const alias = formData.get("alias") || "";

    if (!archivo || !email) {
      return NextResponse.json(
        { ok: false, error: "Falta el archivo o el email." },
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

    const docente = await getDocentePorEmail(email);

    await registrarFactura({
      email,
      nombreDocente: docente?.nombre || "",
      fechaFactura: fechaFactura || fechaHoy,
      archivoUrl: subido.data.webViewLink || "",
      alias,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "No se pudo subir la factura. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }
}

import nodemailer from "nodemailer";
import { MAIL_ADMINISTRACION } from "./config";

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Faltan las variables de entorno GMAIL_USER o GMAIL_APP_PASSWORD.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

/**
 * Mail de confirmación al cargar clases: va al docente, con copia a administración.
 *
 * detalle: [{ cursoNombre, edicion, claseOSesion, alumno, valor }]
 * rechazadas: mismos items que detalle, para los que no se pudieron cargar por duplicados
 */
export async function enviarMailConfirmacionCarga({
  emailDocente,
  nombreDocente,
  mes,
  detalle,
  total,
  rechazadas,
}) {
  const transporter = getTransporter();

  const filasDetalle = detalle
    .map(
      (d) => `
        <tr>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${d.cursoNombre}${
        d.edicion ? ` — ${d.edicion}` : ""
      }</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${d.alumno || "—"}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${d.claseOSesion}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">$${(d.valor || 0).toLocaleString(
            "es-AR"
          )}</td>
        </tr>`
    )
    .join("");

  const avisoRechazadas =
    rechazadas && rechazadas.length > 0
      ? `<p style="color:#a4342e;">Ojo: ${rechazadas.length} clase(s)/sesión(es) no se pudieron cargar porque ya habían sido registradas por otro docente.</p>`
      : "";

  const html = `
    <div style="font-family: Arial, sans-serif; color:#01233f; max-width:600px;">
      <h2 style="color:#065f74;">Carga de clases confirmada — ${mes}</h2>
      <p>Hola ${nombreDocente || emailDocente},</p>
      <p>Registramos tu carga de clases correctamente. Este es el detalle:</p>
      <table style="border-collapse:collapse; width:100%; margin:16px 0;">
        <thead>
          <tr style="background:#f3f4f6; text-align:left;">
            <th style="padding:6px 10px;">Curso</th>
            <th style="padding:6px 10px;">Alumno</th>
            <th style="padding:6px 10px;">Clase/Sesión</th>
            <th style="padding:6px 10px;">Valor</th>
          </tr>
        </thead>
        <tbody>${filasDetalle}</tbody>
      </table>
      <p style="font-size:16px;"><strong>Total a facturar: $${total.toLocaleString(
        "es-AR"
      )}</strong></p>
      ${avisoRechazadas}
      <p>Recordá que podés subir tu factura desde la app, en la sección "Subir factura".</p>
      <p style="margin-top:24px; color:#6b7280; font-size:13px;">Instituto ILCE</p>
    </div>
  `;

  await transporter.sendMail({
    from: `Instituto ILCE <${process.env.GMAIL_USER}>`,
    to: emailDocente,
    cc: MAIL_ADMINISTRACION,
    subject: `Carga de clases confirmada — ${mes}`,
    html,
  });
}

/**
 * Mail de confirmación al subir la factura: va al docente, con copia a administración.
 */
export async function enviarMailFacturaSubida({ emailDocente, nombreDocente, mes, archivoUrl, alias }) {
  const transporter = getTransporter();

  const html = `
    <div style="font-family: Arial, sans-serif; color:#01233f; max-width:600px;">
      <h2 style="color:#065f74;">Factura recibida — ${mes}</h2>
      <p>Hola ${nombreDocente || emailDocente},</p>
      <p>Tu factura de ${mes} ya quedó registrada y enviada a administración.</p>
      ${alias ? `<p><strong>Alias informado:</strong> ${alias}</p>` : ""}
      ${archivoUrl ? `<p><a href="${archivoUrl}">Ver archivo de la factura</a></p>` : ""}
      <p style="margin-top:24px; color:#6b7280; font-size:13px;">Instituto ILCE</p>
    </div>
  `;

  await transporter.sendMail({
    from: `Instituto ILCE <${process.env.GMAIL_USER}>`,
    to: emailDocente,
    cc: MAIL_ADMINISTRACION,
    subject: `Factura recibida — ${mes}`,
    html,
  });
}

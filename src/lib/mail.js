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

// Paleta institucional ILCE para este mail — sobria y administrativa (sin violeta/magenta,
// esos quedan para piezas de marketing). Ver especificación del rediseño.
const COLOR = {
  azul: "#01233F",
  turquesa: "#0595AD",
  bgExterior: "#F7F9FA",
  bgContenido: "#FFFFFF",
  borde: "#E8EDF0",
  textoSecundario: "#40515C",
  bgTotal: "#EAF4F6",
};
const FUENTE = "Arial, 'Trebuchet MS', sans-serif";

// Si el detalle tiene alumno cargado en TODOS los ítems, es una carga de sesiones individuales.
// Si NINGUNO tiene alumno, es de clases grupales. Si está mezclado (carga con los dos tipos en
// un mismo envío), se usa un lenguaje neutro que sirve para ambos.
function tipoDeCarga(detalle) {
  const conAlumno = detalle.filter((d) => (d.alumno || "").trim()).length;
  if (conAlumno === detalle.length) return "sesion";
  if (conAlumno === 0) return "clase";
  return "mixto";
}
function palabras(tipo) {
  if (tipo === "sesion") return { singular: "sesión", plural: "sesiones", Plural: "Sesiones" };
  if (tipo === "clase") return { singular: "clase", plural: "clases", Plural: "Clases" };
  return { singular: "registro", plural: "registros", Plural: "Registros" };
}

// El nombre de curso que guarda la planilla trae pegado "(sesiones individuales)" para
// distinguirlo internamente de la versión grupal del mismo curso — acá se saca ese agregado
// para el mail, porque el tipo de carga ya se comunica aparte (en el título, no en el nombre).
function formacionLimpia(cursoNombre) {
  return (cursoNombre || "").replace(/\s*\(sesiones individuales\)\s*/i, "").trim();
}
// Orden de lectura natural: primero por edición (más baja primero), y adentro de cada edición
// por número de clase/sesión — así nunca aparece una clase "2" después de una "6" de la misma
// edición solo porque llegó antes en la planilla.
function ordenarDetalle(detalle) {
  return [...detalle].sort((a, b) => {
    const edA = parseInt(a.edicion, 10) || 0;
    const edB = parseInt(b.edicion, 10) || 0;
    if (edA !== edB) return edA - edB;
    const clA = parseInt(a.claseOSesion, 10) || 0;
    const clB = parseInt(b.claseOSesion, 10) || 0;
    return clA - clB;
  });
}

function formatearFechaHora(fecha) {
  const f = fecha instanceof Date ? fecha : new Date();
  const dia = String(f.getDate()).padStart(2, "0");
  const mesNum = String(f.getMonth() + 1).padStart(2, "0");
  const hora = String(f.getHours()).padStart(2, "0");
  const min = String(f.getMinutes()).padStart(2, "0");
  return `${dia}/${mesNum}/${f.getFullYear()} · ${hora}:${min}`;
}

function filaTabla(d, esSesion) {
  return `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid ${COLOR.borde};font-size:13px;color:${COLOR.azul};font-family:${FUENTE};">${formacionLimpia(d.cursoNombre)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${COLOR.borde};font-size:13px;color:${COLOR.azul};font-family:${FUENTE};text-align:center;white-space:nowrap;">${d.edicion || "—"}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${COLOR.borde};font-size:13px;color:${COLOR.azul};font-family:${FUENTE};">${d.alumno || "—"}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${COLOR.borde};font-size:13px;color:${COLOR.azul};font-family:${FUENTE};text-align:center;">${d.claseOSesion}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${COLOR.borde};font-size:13px;color:${COLOR.azul};font-family:${FUENTE};text-align:right;white-space:nowrap;">$${(d.valor || 0).toLocaleString("es-AR")}</td>
    </tr>`;
}

function tablaCompleta(detalle, esSesion) {
  const encabezadoSesionClase = esSesion ? "Sesión" : "Clase";
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin:14px 0;">
      <thead>
        <tr>
          <th style="padding:9px 12px;background:${COLOR.bgExterior};border-bottom:2px solid ${COLOR.borde};text-align:left;font-size:12px;color:${COLOR.textoSecundario};font-family:${FUENTE};text-transform:uppercase;letter-spacing:0.03em;">Formación</th>
          <th style="padding:9px 12px;background:${COLOR.bgExterior};border-bottom:2px solid ${COLOR.borde};text-align:center;font-size:12px;color:${COLOR.textoSecundario};font-family:${FUENTE};text-transform:uppercase;letter-spacing:0.03em;">Edición</th>
          <th style="padding:9px 12px;background:${COLOR.bgExterior};border-bottom:2px solid ${COLOR.borde};text-align:left;font-size:12px;color:${COLOR.textoSecundario};font-family:${FUENTE};text-transform:uppercase;letter-spacing:0.03em;">Alumno</th>
          <th style="padding:9px 12px;background:${COLOR.bgExterior};border-bottom:2px solid ${COLOR.borde};text-align:center;font-size:12px;color:${COLOR.textoSecundario};font-family:${FUENTE};text-transform:uppercase;letter-spacing:0.03em;">${encabezadoSesionClase}</th>
          <th style="padding:9px 12px;background:${COLOR.bgExterior};border-bottom:2px solid ${COLOR.borde};text-align:right;font-size:12px;color:${COLOR.textoSecundario};font-family:${FUENTE};text-transform:uppercase;letter-spacing:0.03em;">Valor</th>
        </tr>
      </thead>
      <tbody>${ordenarDetalle(detalle).map((d) => filaTabla(d, esSesion)).join("")}</tbody>
    </table>`;
}

/**
 * Mail de confirmación al cargar clases/sesiones: va al docente, con copia a administración.
 *
 * detalle: [{ cursoNombre, edicion, claseOSesion, alumno, valor }]
 * rechazadas: mismos items que detalle, para los que no se pudieron cargar por duplicados
 * fechaHora: opcional (Date) — momento del registro; si no se pasa, se usa el momento del envío
 */
export async function enviarMailConfirmacionCarga({
  emailDocente,
  nombreDocente,
  mes,
  detalle,
  total,
  rechazadas,
  fechaHora,
}) {
  const transporter = getTransporter();

  const tipo = tipoDeCarga(detalle);
  const p = palabras(tipo);
  const esSesion = tipo === "sesion";
  const cantidad = detalle.length;

  const avisoRechazadas =
    rechazadas && rechazadas.length > 0
      ? `<tr><td style="padding:10px 14px;background:#FDEEEE;border:1px solid #F3C7C4;border-radius:8px;font-size:13px;color:#A4342E;font-family:${FUENTE};">⚠️ ${rechazadas.length} ${rechazadas.length === 1 ? p.singular : p.plural} no se pud${rechazadas.length === 1 ? "o" : "ieron"} cargar porque ya hab${rechazadas.length === 1 ? "ía" : "ían"} sido registrada${rechazadas.length === 1 ? "" : "s"} por otro docente.</td></tr><tr><td style="height:14px;line-height:14px;font-size:1px;">&nbsp;</td></tr>`
      : "";

  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
  <body style="margin:0;padding:0;background:${COLOR.bgExterior};">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${COLOR.bgExterior};padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;background:${COLOR.bgContenido};border-radius:10px;overflow:hidden;">
            <tr><td style="height:5px;line-height:5px;font-size:1px;background:${COLOR.turquesa};">&nbsp;</td></tr>
            <tr>
              <td style="padding:28px 28px 4px 28px;">
                <p style="margin:0;font-family:${FUENTE};font-size:25px;font-weight:bold;color:${COLOR.azul};line-height:1.25;">Carga de ${p.plural} confirmada</p>
                <p style="margin:4px 0 0 0;font-family:${FUENTE};font-size:14px;color:${COLOR.textoSecundario};">${mes}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 0 28px;">
                <p style="margin:0 0 4px 0;font-family:${FUENTE};font-size:14px;color:${COLOR.azul};">Hola ${nombreDocente || emailDocente},</p>
                <p style="margin:0;font-family:${FUENTE};font-size:14px;color:${COLOR.azul};">Registramos correctamente tu carga de ${p.plural}. Este es el detalle:</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px 0 28px;">
                <p style="margin:0;font-family:${FUENTE};font-size:14px;font-weight:bold;color:${COLOR.azul};">${cantidad} ${cantidad === 1 ? p.singular : p.plural} registrada${cantidad === 1 ? "" : "s"}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 20px 0 20px;">
                ${tablaCompleta(detalle, esSesion)}
              </td>
            </tr>
            <tr>
              <td style="padding:4px 28px 0 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${avisoRechazadas}</table>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 28px 0 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${COLOR.bgTotal};border-radius:8px;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0;font-family:${FUENTE};font-size:13px;font-weight:bold;color:${COLOR.azul};text-transform:uppercase;letter-spacing:0.04em;">Total a facturar</p>
                      <p style="margin:2px 0 0 0;font-family:${FUENTE};font-size:24px;font-weight:bold;color:${COLOR.azul};">$${total.toLocaleString("es-AR")}</p>
                      <p style="margin:6px 0 0 0;font-family:${FUENTE};font-size:12px;color:${COLOR.textoSecundario};">Importe correspondiente a ${esSesion ? "las sesiones registradas" : tipo === "clase" ? "las clases registradas" : "los registros"} en este envío.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 28px 0 28px;">
                <p style="margin:0;font-family:${FUENTE};font-size:12px;color:${COLOR.textoSecundario};">Registrado el ${formatearFechaHora(fechaHora)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 28px 0 28px;">
                <p style="margin:0;font-family:${FUENTE};font-size:13px;color:${COLOR.textoSecundario};">Este mail confirma el registro administrativo de tu carga — recordá que podés subir tu factura desde la app, en la sección "Subir factura".</p>
              </td>
            </tr>
            <tr><td style="padding:20px 28px 0 28px;"><div style="border-top:1px solid ${COLOR.borde};"></div></td></tr>
            <tr>
              <td style="padding:16px 28px 26px 28px;">
                <p style="margin:0;font-family:${FUENTE};font-size:13px;font-weight:bold;color:${COLOR.azul};">Instituto ILCE</p>
                <p style="margin:2px 0 0 0;font-family:${FUENTE};font-size:12px;color:${COLOR.textoSecundario};">Formación online en Coaching, Liderazgo y Educación</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;

  await transporter.sendMail({
    from: `Instituto ILCE <${process.env.GMAIL_USER}>`,
    to: emailDocente,
    cc: MAIL_ADMINISTRACION,
    subject: `Carga de ${p.plural} confirmada — ${mes} · ${cantidad} ${cantidad === 1 ? p.singular : p.plural}`,
    html,
  });
}

// Se mantiene igual que antes — el rediseño de esta tanda es específicamente para el mail de
// carga de clases/sesiones (enviarMailConfirmacionCarga), no para este.
function etiquetaColumna(detalle) {
  const conAlumno = detalle.filter((d) => (d.alumno || "").trim()).length;
  if (conAlumno === detalle.length) return "Sesión";
  if (conAlumno === 0) return "Clase";
  return "Clase/Sesión";
}

function tablaDetalle(detalle) {
  return detalle
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
}

/**
 * Mail de confirmación al subir la factura: va al docente, con copia a administración.
 *
 * detalle/total: opcional — si se pasan, se muestra la misma tabla de clases/sesiones
 * que se facturaron, igual que en el mail de carga confirmada.
 */
export async function enviarMailFacturaSubida({
  emailDocente,
  nombreDocente,
  mes,
  archivoUrl,
  alias,
  adjunto,
  detalle,
  total,
}) {
  const transporter = getTransporter();

  const bloqueDetalle =
    detalle && detalle.length > 0
      ? `
      <table style="border-collapse:collapse; width:100%; margin:16px 0;">
        <thead>
          <tr style="background:#f3f4f6; text-align:left;">
            <th style="padding:6px 10px;">Curso</th>
            <th style="padding:6px 10px;">Alumno</th>
            <th style="padding:6px 10px;">${etiquetaColumna(detalle)}</th>
            <th style="padding:6px 10px;">Valor</th>
          </tr>
        </thead>
        <tbody>${tablaDetalle(detalle)}</tbody>
      </table>
      <p style="font-size:16px;"><strong>Total facturado: $${(total || 0).toLocaleString(
        "es-AR"
      )}</strong></p>`
      : "";

  const html = `
    <div style="font-family: Arial, sans-serif; color:#01233f; max-width:600px;">
      <h2 style="color:#065f74;">Factura recibida — ${mes}</h2>
      <p>Hola ${nombreDocente || emailDocente},</p>
      <p>Tu factura de ${mes} ya quedó registrada y enviada a administración${
    adjunto ? " (la encontrás adjunta a este mail)" : ""
  }.</p>
      ${alias ? `<p><strong>Alias informado:</strong> ${alias}</p>` : ""}
      ${bloqueDetalle}
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
    attachments: adjunto ? [adjunto] : [],
  });
}

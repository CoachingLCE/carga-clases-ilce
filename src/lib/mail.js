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

// ---------- Mail de "Factura recibida" ----------
// A diferencia del mail de carga, acá SÍ puede haber sesiones individuales Y clases/formaciones
// mezcladas en una misma factura (un docente puede dictar un curso grupal y además dar sesiones
// sueltas en el mismo mes) — por eso se separan en dos tablas, mostrando solo las que tengan
// contenido.
function separarPorTipo(detalle) {
  const sesiones = detalle.filter((d) => (d.alumno || "").trim());
  const clases = detalle.filter((d) => !(d.alumno || "").trim());
  return { sesiones, clases };
}

function filaFactura(d, columnas) {
  const celdas = columnas
    .map((col) => {
      if (col === "curso") {
        return `<td style="padding:9px 12px;border-bottom:1px solid ${COLOR.borde};font-size:13px;color:${COLOR.azul};font-family:${FUENTE};">${formacionLimpia(d.cursoNombre)}${d.edicion ? ` — ${d.edicion}` : ""}</td>`;
      }
      if (col === "alumno") {
        return `<td style="padding:9px 12px;border-bottom:1px solid ${COLOR.borde};font-size:13px;color:${COLOR.azul};font-family:${FUENTE};">${d.alumno}</td>`;
      }
      if (col === "numero") {
        return `<td style="padding:9px 12px;border-bottom:1px solid ${COLOR.borde};font-size:13px;color:${COLOR.azul};font-family:${FUENTE};text-align:center;">${d.claseOSesion}</td>`;
      }
      // importe
      return `<td style="padding:9px 12px;border-bottom:1px solid ${COLOR.borde};font-size:13px;color:${COLOR.azul};font-family:${FUENTE};text-align:right;white-space:nowrap;">$${(d.valor || 0).toLocaleString("es-AR")}</td>`;
    })
    .join("");
  return `<tr>${celdas}</tr>`;
}

// titulo/encabezados cambian según sea la tabla de sesiones (con Alumno) o de clases (sin Alumno)
function tablaPorTipo(titulo, items, { conAlumno }) {
  if (items.length === 0) return "";
  const columnas = conAlumno ? ["curso", "alumno", "numero", "importe"] : ["curso", "numero", "importe"];
  const encabezados = conAlumno
    ? ["Curso", "Alumno", "Sesión", "Importe"]
    : ["Curso", "Clase", "Importe"];
  const alineacion = ["left", conAlumno ? "left" : "center", conAlumno ? "center" : null, "right"].filter(Boolean);

  return `
    <p style="margin:18px 0 6px 0;font-family:${FUENTE};font-size:13px;font-weight:bold;color:${COLOR.azul};text-transform:uppercase;letter-spacing:0.03em;">${titulo}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin-bottom:6px;">
      <thead>
        <tr>
          ${encabezados
            .map(
              (h, i) =>
                `<th style="padding:8px 12px;background:${COLOR.bgExterior};border-bottom:2px solid ${COLOR.borde};text-align:${alineacion[i]};font-size:11.5px;color:${COLOR.textoSecundario};font-family:${FUENTE};text-transform:uppercase;letter-spacing:0.03em;">${h}</th>`
            )
            .join("")}
        </tr>
      </thead>
      <tbody>${items.map((d) => filaFactura(d, columnas)).join("")}</tbody>
    </table>`;
}

/**
 * Mail de "Factura recibida y registrada" — se manda en DOS variantes distintas (docente y
 * administración), con el mismo detalle de sesiones/clases y el mismo adjunto, pero la de
 * administración suma los datos administrativos (alias) que la docente no necesita ver.
 *
 * detalle/total: igual que en enviarMailConfirmacionCarga — [{ cursoNombre, edicion,
 * claseOSesion, alumno, valor }]
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
  const items = detalle || [];
  const { sesiones, clases } = separarPorTipo(items);
  const totalFinal = total ?? items.reduce((acc, d) => acc + (d.valor || 0), 0);
  const nombreArchivo = adjunto?.filename || "";

  function construirHtml({ variante }) {
    const esAdmin = variante === "admin";
    const bloqueTablas = `
      ${tablaPorTipo("Sesiones individuales", sesiones, { conAlumno: true })}
      ${tablaPorTipo("Clases / formaciones", clases, { conAlumno: false })}`;

    const bloqueDatosFactura =
      esAdmin && alias
        ? `
      <tr><td style="padding:14px 28px 0 28px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${COLOR.bgExterior};border-radius:8px;">
          <tr><td style="padding:12px 16px;">
            <p style="margin:0 0 4px 0;font-family:${FUENTE};font-size:11px;font-weight:bold;color:${COLOR.textoSecundario};text-transform:uppercase;letter-spacing:0.03em;">Datos de la factura</p>
            <p style="margin:0;font-family:${FUENTE};font-size:13px;color:${COLOR.azul};">Período: ${mes}</p>
            <p style="margin:2px 0 0 0;font-family:${FUENTE};font-size:13px;color:${COLOR.azul};">Alias informado: ${alias}</p>
          </td></tr>
        </table>
      </td></tr>`
        : "";

    const bloqueAdjunto = nombreArchivo
      ? `
      <tr><td style="padding:16px 28px 0 28px;">
        <p style="margin:0 0 4px 0;font-family:${FUENTE};font-size:11px;font-weight:bold;color:${COLOR.textoSecundario};text-transform:uppercase;letter-spacing:0.03em;">Documento adjunto</p>
        <p style="margin:0;font-family:${FUENTE};font-size:13px;color:${COLOR.azul};">📄 Factura — ${nombreArchivo}</p>
      </td></tr>`
      : "";

    return `
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
                  <p style="margin:0 0 10px 0;font-family:${FUENTE};font-size:12px;font-weight:bold;color:${COLOR.textoSecundario};text-transform:uppercase;letter-spacing:0.06em;">Instituto ILCE</p>
                  <p style="margin:0;font-family:${FUENTE};font-size:22px;font-weight:bold;color:${COLOR.azul};line-height:1.25;">Factura recibida y registrada</p>
                  <p style="margin:4px 0 0 0;font-family:${FUENTE};font-size:14px;color:${COLOR.textoSecundario};">${mes}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 28px 0 28px;">
                  <p style="margin:0 0 4px 0;font-family:${FUENTE};font-size:14px;color:${COLOR.azul};">Hola ${nombreDocente || emailDocente},</p>
                  <p style="margin:0;font-family:${FUENTE};font-size:14px;color:${COLOR.azul};">Recibimos tu factura correspondiente a ${mes}.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 28px 0 28px;">
                  <span style="display:inline-block;background:${COLOR.bgTotal};color:${COLOR.turquesa};font-family:${FUENTE};font-size:12px;font-weight:bold;padding:5px 12px;border-radius:999px;">✓ Factura recibida</span>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 28px 0 28px;">
                  <p style="margin:0;font-family:${FUENTE};font-size:14px;color:${COLOR.azul};">La factura fue registrada correctamente y enviada a Administración para su gestión.</p>
                </td>
              </tr>
              ${bloqueDatosFactura}
              ${
                items.length > 0
                  ? `
              <tr>
                <td style="padding:6px 20px 0 20px;">
                  <p style="margin:14px 8px 0 8px;font-family:${FUENTE};font-size:13px;font-weight:bold;color:${COLOR.azul};">Detalle de la factura</p>
                  ${bloqueTablas}
                </td>
              </tr>
              <tr>
                <td style="padding:4px 28px 0 28px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${COLOR.bgTotal};border-radius:8px;">
                    <tr>
                      <td style="padding:16px 20px;">
                        <p style="margin:0;font-family:${FUENTE};font-size:13px;font-weight:bold;color:${COLOR.azul};text-transform:uppercase;letter-spacing:0.04em;">Total facturado</p>
                        <p style="margin:2px 0 0 0;font-family:${FUENTE};font-size:24px;font-weight:bold;color:${COLOR.azul};">$${totalFinal.toLocaleString("es-AR")}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`
                  : ""
              }
              ${bloqueAdjunto}
              <tr>
                <td style="padding:18px 28px 0 28px;">
                  <p style="margin:0;font-family:${FUENTE};font-size:13px;color:${COLOR.textoSecundario};">Si encontrás algún inconveniente o necesitás realizar una aclaración sobre la información cargada, podés responder directamente a este correo.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 28px 0 28px;">
                  <p style="margin:0;font-family:${FUENTE};font-size:14px;color:${COLOR.azul};">Saludos,</p>
                  <p style="margin:6px 0 0 0;font-family:${FUENTE};font-size:14px;font-weight:bold;color:${COLOR.azul};">Marcela</p>
                  <p style="margin:0;font-family:${FUENTE};font-size:13px;color:${COLOR.textoSecundario};">Administración</p>
                  <p style="margin:0;font-family:${FUENTE};font-size:13px;color:${COLOR.textoSecundario};">Instituto ILCE</p>
                </td>
              </tr>
              <tr><td style="padding:18px 28px 0 28px;"><div style="border-top:1px solid ${COLOR.borde};"></div></td></tr>
              <tr>
                <td style="padding:12px 28px 24px 28px;">
                  <p style="margin:0;font-family:${FUENTE};font-size:11px;color:${COLOR.textoSecundario};">Este correo fue generado automáticamente por el sistema de gestión administrativa de Instituto ILCE.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`;
  }

  const asunto = `Factura recibida y registrada — ${mes} | Instituto ILCE`;
  const attachments = adjunto ? [adjunto] : [];

  // Dos envíos separados (no un solo mail con cc) para poder mostrarle a cada quien
  // justo lo que necesita — la docente no ve el alias, administración sí.
  await transporter.sendMail({
    from: `Instituto ILCE <${process.env.GMAIL_USER}>`,
    to: emailDocente,
    subject: asunto,
    html: construirHtml({ variante: "docente" }),
    attachments,
  });

  await transporter.sendMail({
    from: `Instituto ILCE <${process.env.GMAIL_USER}>`,
    to: MAIL_ADMINISTRACION,
    subject: asunto,
    html: construirHtml({ variante: "admin" }),
    attachments,
  });
}

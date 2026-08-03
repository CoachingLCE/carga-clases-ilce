import { getSheetsClient } from "./googleAuth";

const SESIONES_SHEET_ID = process.env.GOOGLE_SESIONES_SHEET_ID;

/*
 * Planilla externa de asignación de sesiones de Coaching Ontológico (solo lectura).
 *
 * Estructura real confirmada (columnas A a J):
 *   A: Estudiante | B: Edición | C: N° sesión | D: Fecha de ingreso |
 *   E: Fecha de asignación | F: Docente asignado | G: Fecha de devolución |
 *   H: Demora docente | I: Demora feedback | J: Observaciones
 *
 * Solo nos interesan A (alumno), B (edición), C (n° sesión) y F (alias del
 * docente), pero leemos hasta J por si se necesita algo más adelante.
 *
 * Si en "N° sesión" dice "Acuerdo" (en vez de un número), esa fila no
 * corresponde a una sesión numerada real y se descarta.
 *
 * Los datos viven en la pestaña "Asignaciones" de ese archivo (confirmado):
 * si no se especifica el nombre de la pestaña, Google Sheets toma la
 * primera por posición, que puede no ser esta.
 */
const RANGO = "Asignaciones!A2:J";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// "julio 2026" -> 6 (índice 0 = enero). null si no se puede interpretar.
function mesIndexDesdeLabel(mesLabel) {
  if (!mesLabel) return null;
  const nombre = mesLabel.trim().toLowerCase().split(" ")[0];
  const idx = MESES.indexOf(nombre);
  return idx === -1 ? null : idx;
}

// Las fechas de la planilla vienen como "DD/MM" (sin año).
// Si no se pidió filtrar por mes (mesIndex null), no se descarta ninguna fila.
// Si SÍ se pidió filtrar por mes pero la fila no tiene fecha cargada, se
// descarta: mostrarla "por las dudas" terminaba trayendo sesiones viejas de
// meses anteriores sin fecha, mezcladas con las del mes actual.
function fechaDentroDelMes(fechaStr, mesIndex) {
  if (mesIndex === null) return true;
  if (!fechaStr) return false;
  const partes = fechaStr.trim().split("/");
  if (partes.length < 2) return false;
  const mesFecha = parseInt(partes[1], 10) - 1;
  if (Number.isNaN(mesFecha)) return false;
  return mesFecha === mesIndex;
}

function mapearFila(fila) {
  return {
    alumno: (fila[0] || "").trim(),
    edicion: (fila[1] || "").trim().replace("°", "").trim(),
    numeroSesion: (fila[2] || "").trim(),
    fechaAsignacion: (fila[4] || "").trim(),
    aliasDocente: (fila[5] || "").trim(),
    fechaDevolucion: (fila[6] || "").trim(),
  };
}

// Devuelve las sesiones pre-asignadas a un docente (por su alias), agrupadas
// por alumno + edición: [{ alumno, edicion, sesiones: ["1","2",...] }]
//
// mesLabel (ej. "julio 2026"): si se pasa, solo se muestran las sesiones cuya
// "Fecha de asignación" (columna E) cae en ese mes.
// edicionFiltro (ej. "33"): si se pasa, solo se muestran las sesiones de esa
// edición puntual (la que el docente eligió en el desplegable de curso).
export async function getSesionesAsignadas(aliasDocente, mesLabel, edicionFiltro) {
  if (!SESIONES_SHEET_ID) {
    throw new Error("Falta la variable de entorno GOOGLE_SESIONES_SHEET_ID.");
  }
  if (!aliasDocente) return [];

  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SESIONES_SHEET_ID,
    range: RANGO,
  });

  const mesIndex = mesIndexDesdeLabel(mesLabel);
  const edicionNorm = (edicionFiltro || "").trim().toLowerCase();
  const filas = (res.data.values || []).map(mapearFila);
  const aliasNorm = aliasDocente.trim().toLowerCase();
  const propias = filas.filter(
    (f) =>
      f.aliasDocente.toLowerCase() === aliasNorm &&
      f.numeroSesion.toLowerCase() !== "acuerdo" &&
      fechaDentroDelMes(f.fechaAsignacion, mesIndex) &&
      (!edicionNorm || f.edicion.toLowerCase() === edicionNorm)
  );

  const grupos = {};
  for (const f of propias) {
    if (!f.alumno) continue;
    const clave = `${f.alumno.toLowerCase()}||${f.edicion.toLowerCase()}`;
    if (!grupos[clave]) {
      grupos[clave] = { alumno: f.alumno, edicion: f.edicion, sesiones: [] };
    }
    if (f.numeroSesion) grupos[clave].sesiones.push(f.numeroSesion);
  }

  return Object.values(grupos);
}

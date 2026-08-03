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
 */
const RANGO = "A2:J";

function mapearFila(fila) {
  return {
    alumno: (fila[0] || "").trim(),
    edicion: (fila[1] || "").trim().replace("°", "").trim(),
    numeroSesion: (fila[2] || "").trim(),
    aliasDocente: (fila[5] || "").trim(),
  };
}

// Devuelve las sesiones pre-asignadas a un docente (por su alias), agrupadas
// por alumno + edición: [{ alumno, edicion, sesiones: ["1","2",...] }]
export async function getSesionesAsignadas(aliasDocente) {
  if (!SESIONES_SHEET_ID) {
    throw new Error("Falta la variable de entorno GOOGLE_SESIONES_SHEET_ID.");
  }
  if (!aliasDocente) return [];

  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SESIONES_SHEET_ID,
    range: RANGO,
  });

  const filas = (res.data.values || []).map(mapearFila);
  const aliasNorm = aliasDocente.trim().toLowerCase();
  const propias = filas.filter(
    (f) =>
      f.aliasDocente.toLowerCase() === aliasNorm &&
      f.numeroSesion.toLowerCase() !== "acuerdo"
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

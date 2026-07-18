import { getSheetsClient } from "./googleAuth";

const SESIONES_SHEET_ID = process.env.GOOGLE_SESIONES_SHEET_ID;

/*
 * Planilla externa de asignación de sesiones de Coaching Ontológico (solo lectura).
 *
 * Estructura asumida — AJUSTAR estos índices si el orden real de columnas
 * en la planilla es distinto:
 *
 *   A: AliasDocente | B: Alumno | C: Edición | D: Número de sesión
 *
 * Si en la planilla real las columnas están en otro orden, alcanza con
 * cambiar los números de `mapearFila` de acá abajo (0 = A, 1 = B, etc.).
 * No hace falta tocar nada más de la app.
 */
const RANGO = "A2:D";

function mapearFila(fila) {
  return {
    aliasDocente: (fila[0] || "").trim(),
    alumno: (fila[1] || "").trim(),
    edicion: (fila[2] || "").trim(),
    numeroSesion: (fila[3] || "").trim(),
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
  const propias = filas.filter((f) => f.aliasDocente.toLowerCase() === aliasNorm);

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

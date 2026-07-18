import { getSheetsClient } from "./googleAuth";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

const HOJA_DOCENTES = "Docentes";
const HOJA_EDICIONES = "Ediciones";
const HOJA_VALORES = "Valores";
const HOJA_CARGAS = "Cargas";
const HOJA_FACTURAS = "Facturas";

/*
 * Estructura esperada de cada hoja (ver README para el detalle completo):
 *
 * Docentes   -> A: Email | B: Nombre
 * Ediciones  -> A: CursoId | B: NombreCurso | C: TipoCoaching | D: Edicion | E: Modalidad (clase|sesion) | F: TopeSesiones
 * Valores    -> A: Email | B: CursoId | C: Valor
 * Cargas     -> A: Timestamp | B: Email | C: CursoId | D: Edicion | E: ClaseOSesion | F: Alumno | G: EstadoFactura
 * Facturas   -> A: Email | B: NombreDocente | C: FechaFactura | D: FechaEnvio | E: ArchivoUrl
 */

async function leerRango(rango) {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: rango,
  });
  return res.data.values || [];
}

async function agregarFila(hoja, fila) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${hoja}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [fila] },
  });
}

// Busca un docente por email. Devuelve { email, nombre } o null si no existe.
export async function getDocentePorEmail(email) {
  const filas = await leerRango(`${HOJA_DOCENTES}!A2:B`);
  const encontrada = filas.find(
    (f) => (f[0] || "").trim().toLowerCase() === email.trim().toLowerCase()
  );
  if (!encontrada) return null;
  return { email: encontrada[0], nombre: encontrada[1] || "" };
}

// Devuelve la lista de ediciones/cursos disponibles para elegir.
export async function getEdiciones() {
  const filas = await leerRango(`${HOJA_EDICIONES}!A2:F`);
  return filas
    .filter((f) => f[0])
    .map((f) => ({
      cursoId: f[0],
      nombreCurso: f[1] || "",
      tipoCoaching: f[2] || "",
      edicion: f[3] || "",
      modalidad: (f[4] || "clase").toLowerCase(), // "clase" | "sesion"
      topeSesiones: f[5] ? Number(f[5]) : null,
    }));
}

// Busca el valor acordado para un docente + curso puntual.
// Devuelve el número, o null si todavía no está cargado.
export async function getValor(email, cursoId) {
  const filas = await leerRango(`${HOJA_VALORES}!A2:C`);
  const encontrada = filas.find(
    (f) =>
      (f[0] || "").trim().toLowerCase() === email.trim().toLowerCase() &&
      (f[1] || "").trim() === cursoId.trim()
  );
  if (!encontrada || !encontrada[2]) return null;
  const valor = Number(String(encontrada[2]).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(valor) ? valor : null;
}

// Registra una o más clases/sesiones cargadas por un docente.
// items: [{ cursoId, edicion, claseOSesion, alumno }]
export async function registrarCargas(email, items) {
  const timestamp = new Date().toISOString();
  for (const item of items) {
    await agregarFila(HOJA_CARGAS, [
      timestamp,
      email,
      item.cursoId,
      item.edicion || "",
      item.claseOSesion || "",
      item.alumno || "",
      "Pendiente", // EstadoFactura
    ]);
  }
}

// Registra el envío de una factura. fechaFactura es la fecha que puso el docente
// en su factura; fechaEnvio la pone el sistema automáticamente.
export async function registrarFactura({ email, nombreDocente, fechaFactura, archivoUrl }) {
  const fechaEnvio = new Date().toISOString();
  await agregarFila(HOJA_FACTURAS, [email, nombreDocente || "", fechaFactura || "", fechaEnvio, archivoUrl || ""]);
  return { fechaEnvio };
}

// Devuelve todas las facturas registradas, para el panel de administración.
export async function getFacturas() {
  const filas = await leerRango(`${HOJA_FACTURAS}!A2:E`);
  return filas
    .filter((f) => f[0])
    .map((f) => ({
      email: f[0],
      nombreDocente: f[1] || "",
      fechaFactura: f[2] || "",
      fechaEnvio: f[3] || "",
      archivoUrl: f[4] || "",
    }));
}

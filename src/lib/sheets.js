import { getSheetsClient } from "./googleAuth";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

const HOJA_DOCENTES = "Docentes";
const HOJA_ADMINISTRADORES = "Administradores";
const HOJA_REFERENCIA_CURSOS = "Referencia cursos";
const HOJA_EDICIONES = "Ediciones";
const HOJA_VALORES = "Valores";
const HOJA_CARGAS = "Cargas";

/*
 * Estructura real de la planilla (ver README para el detalle completo):
 *
 * Docentes            -> A: Email | B: Nombre | C: Activo (SI/NO) | D: AliasSesiones (Nombre en planilla de sesiones)
 * Administradores     -> A: Email | B: Nombre | C: Activo (SI/NO)
 * Referencia cursos   -> A: CursoId | B: NombreCurso | C: Modos | D: Rango  (hoja de referencia, no se escribe)
 * Ediciones           -> A: Curso | B: Edicion | C: Estado ("Abierta" = disponible para cargar)
 * Valores             -> A: EmailDocente | B: Curso | C: Valor
 * Cargas              -> A: Timestamp | B: EmailDocente | C: NombreDocente | D: Curso | E: Edicion |
 *                        F: ClaseOSesion | G: Alumno | H: Mes | I: Valor | J: EstadoFacturado |
 *                        K: FacturaURL | L: Alias
 *
 * Solo "ontologico" tiene doble modalidad (clase de cohorte 1-48 y sesión individual 1-4).
 * El resto de los cursos son solo "clase", rango 1-16.
 */
const TOPES_POR_CURSO = {
  ontologico: { clase: 48, sesion: 4 },
};
const TOPE_CLASE_DEFAULT = 16;

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

// Busca un docente por email. Devuelve { email, nombre, activo, aliasSesiones } o null si no existe.
export async function getDocentePorEmail(email) {
  const filas = await leerRango(`${HOJA_DOCENTES}!A2:D`);
  const encontrada = filas.find(
    (f) => (f[0] || "").trim().toLowerCase() === email.trim().toLowerCase()
  );
  if (!encontrada) return null;
  return {
    email: encontrada[0],
    nombre: encontrada[1] || "",
    activo: (encontrada[2] || "").trim().toUpperCase() !== "NO",
    aliasSesiones: (encontrada[3] || "").trim(),
  };
}

// Busca un administrador por email. Devuelve { email, nombre, activo } o null si no existe.
export async function getAdministradorPorEmail(email) {
  const filas = await leerRango(`${HOJA_ADMINISTRADORES}!A2:C`);
  const encontrada = filas.find(
    (f) => (f[0] || "").trim().toLowerCase() === email.trim().toLowerCase()
  );
  if (!encontrada) return null;
  return {
    email: encontrada[0],
    nombre: encontrada[1] || "",
    activo: (encontrada[2] || "").trim().toUpperCase() !== "NO",
  };
}

// Lee la hoja de referencia (nombres de curso) — no se escribe nunca acá.
async function getReferenciaCursos() {
  const filas = await leerRango(`${HOJA_REFERENCIA_CURSOS}!A2:D`);
  return filas
    .filter((f) => f[0])
    .map((f) => ({
      cursoId: (f[0] || "").trim(),
      nombreCurso: f[1] || "",
    }));
}

// Devuelve la lista de ediciones/cursos disponibles para elegir, combinando
// "Referencia cursos" (nombres) + "Ediciones" (cuáles están Abiertas) + las
// reglas fijas de modalidad y rango.
// Cada item tiene:
//   cursoId    -> clave única para la UI: "curso::modalidad::edicion"
//   cursoReal  -> el id real del curso (el que se guarda en Valores/Cargas)
//   nombreCurso, edicion, modalidad ("clase"|"sesion"), topeSesiones
export async function getEdiciones() {
  const [referencia, filasEdiciones] = await Promise.all([
    getReferenciaCursos(),
    leerRango(`${HOJA_EDICIONES}!A2:C`),
  ]);

  const nombrePorCurso = {};
  referencia.forEach((r) => {
    nombrePorCurso[r.cursoId] = r.nombreCurso;
  });

  const abiertas = filasEdiciones
    .filter((f) => (f[2] || "").trim().toLowerCase() === "abierta")
    .map((f) => ({ curso: (f[0] || "").trim(), edicion: (f[1] || "").trim() }))
    .filter((e) => e.curso && e.edicion);

  const resultado = [];
  for (const { curso, edicion } of abiertas) {
    const nombreCurso = nombrePorCurso[curso] || curso;
    const tieneDobleModalidad = curso in TOPES_POR_CURSO;

    if (tieneDobleModalidad) {
      resultado.push({
        cursoId: `${curso}::clase::${edicion}`,
        cursoReal: curso,
        nombreCurso,
        edicion,
        modalidad: "clase",
        topeSesiones: TOPES_POR_CURSO[curso].clase,
      });
      resultado.push({
        cursoId: `${curso}::sesion::${edicion}`,
        cursoReal: curso,
        nombreCurso: `${nombreCurso} (sesiones individuales)`,
        edicion,
        modalidad: "sesion",
        topeSesiones: TOPES_POR_CURSO[curso].sesion,
      });
    } else {
      resultado.push({
        cursoId: `${curso}::clase::${edicion}`,
        cursoReal: curso,
        nombreCurso,
        edicion,
        modalidad: "clase",
        topeSesiones: TOPE_CLASE_DEFAULT,
      });
    }
  }

  return resultado;
}

// Busca el valor acordado para un docente + curso puntual (cursoReal, no el
// cursoId compuesto de la UI). Devuelve el número, o null si no está cargado.
export async function getValor(email, cursoReal) {
  const filas = await leerRango(`${HOJA_VALORES}!A2:C`);
  const encontrada = filas.find(
    (f) =>
      (f[0] || "").trim().toLowerCase() === email.trim().toLowerCase() &&
      (f[1] || "").trim() === (cursoReal || "").trim()
  );
  if (!encontrada || !encontrada[2]) return null;
  const valor = Number(String(encontrada[2]).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(valor) ? valor : null;
}

// Registra una o más clases/sesiones cargadas por un docente en la hoja "Cargas".
// items: [{ cursoReal, edicion, claseOSesion, alumno, valor }]
export async function registrarCargas(email, nombreDocente, mes, items) {
  const timestamp = new Date().toISOString();
  for (const item of items) {
    await agregarFila(HOJA_CARGAS, [
      timestamp,
      email,
      nombreDocente || "",
      item.cursoReal,
      item.edicion || "",
      item.claseOSesion || "",
      item.alumno || "",
      mes || "",
      item.valor || 0,
      "Pendiente", // EstadoFacturado
      "", // FacturaURL
      "", // Alias
    ]);
  }
}

// Devuelve los números de clase/sesión ya cargados para un curso + edición
// (y, si se pasa alumno, solo los de ese alumno). Se usa para no mostrarle a
// un docente una clase que ya cargó otro, y para la barra de progreso.
export async function getClasesTomadas(cursoReal, edicion, alumno) {
  const filas = await leerRango(`${HOJA_CARGAS}!A2:L`);
  const alumnoNorm = (alumno || "").trim().toLowerCase();
  return filas
    .filter((f) => {
      const coincideCurso = (f[3] || "").trim() === (cursoReal || "").trim();
      const coincideEdicion = (f[4] || "").trim() === (edicion || "").trim();
      if (!coincideCurso || !coincideEdicion) return false;
      if (alumnoNorm) {
        return (f[6] || "").trim().toLowerCase() === alumnoNorm;
      }
      return true;
    })
    .map((f) => String(f[5] || "").trim())
    .filter(Boolean);
}

// Marca como facturadas todas las filas de "Cargas" de un docente para un mes
// puntual (las que estén en "Pendiente"), y les carga la URL del archivo y el
// alias bancario. Devuelve la cantidad de filas actualizadas.
export async function marcarFacturaSubida({ email, mes, archivoUrl, alias }) {
  const sheets = getSheetsClient();
  const filas = await leerRango(`${HOJA_CARGAS}!A2:L`);
  const emailNorm = email.trim().toLowerCase();

  const actualizaciones = [];
  filas.forEach((f, idx) => {
    const filaNumero = idx + 2; // offset por encabezado
    const coincideEmail = (f[1] || "").trim().toLowerCase() === emailNorm;
    const coincideMes = (f[7] || "").trim() === (mes || "").trim();
    const pendiente = (f[9] || "").trim().toLowerCase() !== "facturado";
    if (coincideEmail && coincideMes && pendiente) {
      actualizaciones.push({
        range: `${HOJA_CARGAS}!J${filaNumero}:L${filaNumero}`,
        values: [["Facturado", archivoUrl || "", alias || ""]],
      });
    }
  });

  if (actualizaciones.length === 0) return 0;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: actualizaciones,
    },
  });

  return actualizaciones.length;
}

// Devuelve las facturas recibidas, agrupadas por docente + mes, para el
// panel de administración.
export async function getFacturasRecibidas() {
  const filas = await leerRango(`${HOJA_CARGAS}!A2:L`);
  const grupos = {};

  filas.forEach((f) => {
    const estado = (f[9] || "").trim().toLowerCase();
    if (estado !== "facturado") return;
    const email = f[1] || "";
    const mes = f[7] || "";
    const clave = `${email}||${mes}`;
    if (!grupos[clave]) {
      grupos[clave] = {
        email,
        nombreDocente: f[2] || "",
        mes,
        cantidad: 0,
        total: 0,
        archivoUrl: f[10] || "",
        alias: f[11] || "",
      };
    }
    grupos[clave].cantidad += 1;
    grupos[clave].total += Number(f[8]) || 0;
    if (!grupos[clave].archivoUrl && f[10]) grupos[clave].archivoUrl = f[10];
    if (!grupos[clave].alias && f[11]) grupos[clave].alias = f[11];
  });

  return Object.values(grupos);
}

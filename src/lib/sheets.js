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
 *                        K: FacturaURL | L: Alias | M: Modalidad (clase|sesion, opcional)
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
export async function getReferenciaCursos() {
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
//
// modalidad ("clase" | "sesion"): la hoja "Valores" puede tener, opcionalmente,
// una columna D con la modalidad, para los casos en que un mismo docente cobra
// distinto por clases grupales que por sesiones individuales de un mismo curso
// (ej. "ontologico"). Si hay una fila que coincide en email+curso+modalidad,
// esa gana. Si no, se usa la fila general (sin modalidad especificada), que es
// como estaban cargadas todas las filas hasta ahora — así no hace falta tocar
// las filas existentes, solo agregar una fila nueva para el caso puntual que
// necesite un valor distinto.
export async function getValor(email, cursoReal, modalidad) {
  const filas = await leerRango(`${HOJA_VALORES}!A2:D`);
  const emailNorm = email.trim().toLowerCase();
  const cursoNorm = (cursoReal || "").trim();
  const modalidadNorm = (modalidad || "").trim().toLowerCase();

  const aNumero = (valorCelda) => {
    const n = Number(String(valorCelda).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  if (modalidadNorm) {
    const especifica = filas.find(
      (f) =>
        (f[0] || "").trim().toLowerCase() === emailNorm &&
        (f[1] || "").trim() === cursoNorm &&
        (f[3] || "").trim().toLowerCase() === modalidadNorm
    );
    if (especifica && especifica[2]) {
      const valor = aNumero(especifica[2]);
      if (valor !== null) return valor;
    }
  }

  const general = filas.find(
    (f) =>
      (f[0] || "").trim().toLowerCase() === emailNorm &&
      (f[1] || "").trim() === cursoNorm &&
      !(f[3] || "").trim()
  );
  if (!general || !general[2]) return null;
  return aNumero(general[2]);
}

// Registra una o más clases/sesiones cargadas por un docente en la hoja "Cargas".
// items: [{ cursoReal, edicion, claseOSesion, alumno, valor, modalidad }]
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
      item.modalidad || "", // Modalidad (columna M, opcional)
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
      const estado = (f[9] || "").trim().toLowerCase();
      if (estado === "eliminada") return false; // liberar el número si se borró
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

// Devuelve todas las cargas de un docente en un mes puntual, para el resumen
// y la tabla "Tu carga de este mes". Incluye el número de fila real de la
// hoja (para poder editar/eliminar esa fila puntual después).
export async function getCargasDeDocente(email, mes) {
  const [filas, referencia] = await Promise.all([
    leerRango(`${HOJA_CARGAS}!A2:M`),
    getReferenciaCursos(),
  ]);

  const nombrePorCurso = {};
  referencia.forEach((r) => {
    nombrePorCurso[r.cursoId] = r.nombreCurso;
  });

  const emailNorm = email.trim().toLowerCase();
  const mesNorm = (mes || "").trim();

  return filas
    .map((f, idx) => ({ f, fila: idx + 2 }))
    .filter(({ f }) => {
      const estado = (f[9] || "").trim().toLowerCase();
      if (estado === "eliminada") return false;
      const coincideEmail = (f[1] || "").trim().toLowerCase() === emailNorm;
      const coincideMes = (f[7] || "").trim() === mesNorm;
      return coincideEmail && coincideMes;
    })
    .map(({ f, fila }) => {
      const cursoReal = (f[3] || "").trim();
      const alumno = (f[6] || "").trim();
      // Filas viejas (previas a este cambio) no tienen modalidad guardada:
      // la inferimos por si tienen alumno cargado (típico de sesiones).
      const modalidad = (f[12] || "").trim() || (alumno ? "sesion" : "clase");
      const nombreBase = nombrePorCurso[cursoReal] || cursoReal;
      return {
        fila,
        timestamp: f[0] || "",
        email: f[1] || "",
        nombreDocente: f[2] || "",
        cursoReal,
        cursoNombre: modalidad === "sesion" ? `${nombreBase} (sesiones individuales)` : nombreBase,
        edicion: (f[4] || "").trim(),
        claseOSesion: (f[5] || "").trim(),
        alumno,
        mes: f[7] || "",
        valor: Number(f[8]) || 0,
        estadoFacturado: f[9] || "Pendiente",
        modalidad,
      };
    })
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)); // más reciente primero
}

// Edita el alumno y/o el número de clase/sesión de UNA fila puntual, verificando
// que sea del docente que la pide y que todavía no esté facturada.
export async function editarCarga(email, fila, cambios) {
  const filas = await leerRango(`${HOJA_CARGAS}!A${fila}:M${fila}`);
  const f = filas[0];
  if (!f) throw new Error("No se encontró esa carga.");
  if ((f[1] || "").trim().toLowerCase() !== email.trim().toLowerCase()) {
    throw new Error("Esa carga no te pertenece.");
  }
  if ((f[9] || "").trim().toLowerCase() === "facturado") {
    throw new Error("No se puede editar una clase que ya fue facturada.");
  }

  const nuevoClaseOSesion =
    cambios.claseOSesion !== undefined ? String(cambios.claseOSesion) : f[5] || "";
  const nuevoAlumno = cambios.alumno !== undefined ? cambios.alumno : f[6] || "";

  // Si se cambia el número, chequeamos que no choque con otra fila ya cargada
  // (de este u otro docente) para el mismo curso+edición(+alumno).
  if (cambios.claseOSesion !== undefined) {
    const tomadas = await getClasesTomadas(
      (f[3] || "").trim(),
      (f[4] || "").trim(),
      nuevoAlumno
    );
    if (
      String(nuevoClaseOSesion) !== String(f[5] || "").trim() &&
      tomadas.includes(String(nuevoClaseOSesion))
    ) {
      throw new Error("Ese número ya está cargado. Elegí otro.");
    }
  }

  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${HOJA_CARGAS}!F${fila}:G${fila}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[nuevoClaseOSesion, nuevoAlumno]] },
  });
}

// "Elimina" una fila puntual (en realidad la marca como Eliminada y le borra
// el número/alumno, para no tocar el orden de filas de la hoja). Verifica que
// sea del docente que la pide y que no esté ya facturada.
export async function eliminarCarga(email, fila) {
  const filas = await leerRango(`${HOJA_CARGAS}!A${fila}:M${fila}`);
  const f = filas[0];
  if (!f) throw new Error("No se encontró esa carga.");
  if ((f[1] || "").trim().toLowerCase() !== email.trim().toLowerCase()) {
    throw new Error("Esa carga no te pertenece.");
  }
  if ((f[9] || "").trim().toLowerCase() === "facturado") {
    throw new Error("No se puede eliminar una clase que ya fue facturada.");
  }

  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${HOJA_CARGAS}!J${fila}:L${fila}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [["Eliminada", "", ""]] },
  });
}

// Marca como facturadas todas las filas de "Cargas" de un docente para un mes
// puntual (las que estén en "Pendiente"), y les carga la URL del archivo y el
// alias bancario. Devuelve la cantidad de filas actualizadas.
export async function marcarFacturaSubida({ email, mes, archivoUrl, alias }) {
  const sheets = getSheetsClient();
  const [filas, referencia] = await Promise.all([
    leerRango(`${HOJA_CARGAS}!A2:L`),
    getReferenciaCursos(),
  ]);
  const emailNorm = email.trim().toLowerCase();

  const nombrePorCurso = {};
  referencia.forEach((r) => {
    nombrePorCurso[r.cursoId] = r.nombreCurso;
  });

  const actualizaciones = [];
  const detalle = [];
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
      const curso = (f[3] || "").trim();
      detalle.push({
        cursoNombre: nombrePorCurso[curso] || curso,
        edicion: (f[4] || "").trim(),
        claseOSesion: (f[5] || "").trim(),
        alumno: (f[6] || "").trim(),
        valor: Number(f[8]) || 0,
      });
    }
  });

  if (actualizaciones.length === 0) return { count: 0, detalle: [], total: 0 };

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: actualizaciones,
    },
  });

  const total = detalle.reduce((acc, d) => acc + d.valor, 0);
  return { count: actualizaciones.length, detalle, total };
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

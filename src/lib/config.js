// Día del mes hasta el cual se puede cargar clases/sesiones.
// Después de este día, el mes queda cerrado.
export const DIA_CIERRE_MENSUAL = 10;

export const MAIL_ADMINISTRACION = "administracion@institutoilce.com";

// Cantidad de sesiones que se muestran para elegir en cursos tipo "sesion"
// cuando todavía no hay un tope definido por edición.
export const SESIONES_DEFAULT = 20;

// Tipos de coaching y sus reglas de cuotas (usado como referencia en el front,
// la fuente de verdad real vive en la hoja "Ediciones").
export const REGLAS_CUOTAS = {
  "Coaching ontológico": 12,
  "Copywriting para redes sociales": 3,
  "Formación para formadores": 3,
  DEFAULT: 4,
};

export const CUIT_INSTITUTO = "23-34230780-9";
export const CONDICION_FISCAL = "Consumidor final";

// Datos de ejemplo para el modo prueba: así el demo funciona solo, sin leer
// ni escribir nada en la planilla real de Google Sheets.
export const DEMO_EDICIONES = [
  {
    cursoId: "ontologico::clase::50",
    cursoReal: "ontologico",
    nombreCurso: "Coaching Ontológico",
    edicion: "50",
    modalidad: "clase",
    topeSesiones: 48,
  },
  {
    cursoId: "ontologico::sesion::50",
    cursoReal: "ontologico",
    nombreCurso: "Coaching Ontológico (sesiones individuales)",
    edicion: "50",
    modalidad: "sesion",
    topeSesiones: 4,
  },
  {
    cursoId: "oratoria::clase::10",
    cursoReal: "oratoria",
    nombreCurso: "Oratoria",
    edicion: "10",
    modalidad: "clase",
    topeSesiones: 16,
  },
  {
    cursoId: "deportivo::clase::12",
    cursoReal: "deportivo",
    nombreCurso: "Coaching Deportivo",
    edicion: "12",
    modalidad: "clase",
    topeSesiones: 16,
  },
];

export const DEMO_VALORES = {
  ontologico: 19632,
  oratoria: 15000,
  deportivo: 12500,
};

// Sesiones "pre-asignadas" de ejemplo, para mostrar cómo se ve ese flujo en
// el modo prueba (normalmente vienen de la planilla externa real).
export const DEMO_ASIGNACIONES = [
  { alumno: "Alumno de ejemplo", edicion: "50", sesiones: ["1", "2", "3", "4"] },
];

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

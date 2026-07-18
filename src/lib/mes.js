import { DIA_CIERRE_MENSUAL } from "./config";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function nombreMesActual() {
  const hoy = new Date();
  return `${MESES[hoy.getMonth()]} ${hoy.getFullYear()}`;
}

// La ventana de carga de un mes X arranca el ÚLTIMO día de X y se cierra el
// día DIA_CIERRE_MENSUAL del mes siguiente. Ej.: las clases de julio se
// cargan entre el 31/07 y el 10/08.
//
// Devuelve:
// - habilitado: true si hoy hay una ventana de carga abierta
// - cerrado: true si no hay ninguna ventana abierta ahora
// - diasRestantes: días que quedan de la ventana actual (0 = hoy es el último día)
// - diasParaAbrir: si está cerrado, cuántos días faltan para que abra de nuevo
// - mesLabel: el mes que se está cargando (o el próximo a abrir, si está cerrado)
export function getEstadoCierre() {
  const hoy = new Date();
  const dia = hoy.getDate();
  const year = hoy.getFullYear();
  const month = hoy.getMonth();
  const ultimoDiaMesActual = new Date(year, month + 1, 0).getDate();
  const mesAnteriorIdx = (month - 1 + 12) % 12;
  const anioMesAnterior = month === 0 ? year - 1 : year;

  // Días 1 a DIA_CIERRE_MENSUAL: sigue abierta la ventana del mes anterior.
  if (dia <= DIA_CIERRE_MENSUAL) {
    return {
      habilitado: true,
      cerrado: false,
      diasRestantes: DIA_CIERRE_MENSUAL - dia,
      diasParaAbrir: 0,
      mesLabel: `${MESES[mesAnteriorIdx]} ${anioMesAnterior}`,
    };
  }

  // Último día del mes: se abre la ventana de este mes.
  if (dia === ultimoDiaMesActual) {
    return {
      habilitado: true,
      cerrado: false,
      diasRestantes: DIA_CIERRE_MENSUAL,
      diasParaAbrir: 0,
      mesLabel: `${MESES[month]} ${year}`,
    };
  }

  // Cualquier otro día: no hay ventana abierta.
  const diasParaAbrir = ultimoDiaMesActual - dia;
  return {
    habilitado: false,
    cerrado: true,
    diasRestantes: 0,
    diasParaAbrir,
    mesLabel: `${MESES[month]} ${year}`,
  };
}

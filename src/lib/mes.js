import { DIA_CIERRE_MENSUAL } from "./config";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function nombreMesActual() {
  const hoy = new Date();
  return `${MESES[hoy.getMonth()]} ${hoy.getFullYear()}`;
}

// Devuelve el estado de la carga del mes actual:
// - habilitado: true si hoy es <= DIA_CIERRE_MENSUAL
// - cerrado: true si ya se pasó el día de cierre
// - diasRestantes: días que quedan (0 = hoy es el último día)
// - diasParaAbrir: si está cerrado, cuántos días faltan para que abra de nuevo
// - mesLabel: nombre del mes que se está cargando (o el próximo a abrir)
export function getEstadoCierre() {
  const hoy = new Date();
  const diaActual = hoy.getDate();

  if (diaActual <= DIA_CIERRE_MENSUAL) {
    return {
      habilitado: true,
      cerrado: false,
      diasRestantes: DIA_CIERRE_MENSUAL - diaActual,
      diasParaAbrir: 0,
      mesLabel: nombreMesActual(),
    };
  }

  // Cerrado: calculamos cuántos días faltan hasta el DIA_CIERRE_MENSUAL del próximo mes
  const proximaApertura = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
  const msPorDia = 1000 * 60 * 60 * 24;
  const diasParaAbrir = Math.ceil((proximaApertura - hoy) / msPorDia);

  const proximoMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);

  return {
    habilitado: false,
    cerrado: true,
    diasRestantes: 0,
    diasParaAbrir,
    mesLabel: `${MESES[proximoMes.getMonth()]} ${proximoMes.getFullYear()}`,
  };
}

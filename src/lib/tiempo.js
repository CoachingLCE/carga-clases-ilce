// Texto relativo para una fecha ("Hoy", "Hace 1 día", "Hace N días"). Mismo criterio que usaba
// "Mi actividad" para la última carga.
export function haceCuanto(timestamp) {
  if (!timestamp) return "—";
  const ms = Date.now() - new Date(timestamp).getTime();
  const dias = Math.floor(ms / 86400000);
  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Hace 1 día";
  return `Hace ${dias} días`;
}

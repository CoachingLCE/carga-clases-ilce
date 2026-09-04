"use client";

// Bloque de stats compacto: Clases registradas / Total a facturar / Estado de la factura.
export function StatsFinal({ totalClases, total, estadoFactura }) {
  const facturada = estadoFactura === "Facturada";
  return (
    <div className="grid grid-cols-3 gap-2.5 mb-4">
      <div className="border border-[var(--line)] rounded-xl p-3 text-center">
        <p className="text-lg font-semibold text-[var(--teal-900)] font-mono">{totalClases}</p>
        <p className="text-[11px] text-[var(--ink)]/55 mt-0.5 leading-tight">
          Clases registradas
        </p>
      </div>
      <div className="border border-[var(--line)] rounded-xl p-3 text-center">
        <p className="text-[15px] font-semibold text-[var(--teal-900)] font-mono">
          ${total.toLocaleString("es-AR")}
        </p>
        <p className="text-[11px] text-[var(--ink)]/55 mt-0.5 leading-tight">
          Total a facturar
        </p>
      </div>
      <div className="border border-[var(--line)] rounded-xl p-3 text-center flex flex-col items-center justify-center">
        <span
          className={`text-[11px] font-semibold rounded-full px-2 py-1 ${
            facturada
              ? "bg-[var(--teal-500)]/10 text-[var(--teal-700)]"
              : "bg-[var(--amber-100)] text-[var(--amber-600)]"
          }`}
        >
          {estadoFactura}
        </span>
        <p className="text-[11px] text-[var(--ink)]/55 mt-1 leading-tight">
          Estado de la factura
        </p>
      </div>
    </div>
  );
}

// Sección de accesos rápidos, para el pie de la pantalla final.
export function AccesosILCE({ onVerMisCargas }) {
  return (
    <div className="border border-[var(--line)] bg-[var(--panel)] rounded-2xl p-5 mt-4">
      <h3 className="font-display text-[15px] text-[var(--teal-900)] mb-3">
        ¿Querés seguir conectado con ILCE?
      </h3>
      <div className="space-y-2.5">
        <a
          href="https://coachingeducativolider.com/blog"
          target="_blank"
          rel="noreferrer"
          className="flex items-start gap-2.5 border border-[var(--line)] rounded-xl px-3.5 py-3 hover:border-[var(--teal-500)] transition-colors"
        >
          <span className="text-lg leading-none">📚</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--teal-900)]">
              ¿Querés leer alguna nota de nuestro blog?
            </p>
            <p className="text-xs text-[var(--ink)]/55 mt-0.5">
              Encontrá artículos sobre coaching, liderazgo, educación y desarrollo personal.
            </p>
            <p className="text-xs text-[var(--teal-700)] font-medium mt-1">Ir al blog →</p>
          </div>
        </a>

        <a
          href="https://app.slack.com/client/T065ZV5C7FF"
          target="_blank"
          rel="noreferrer"
          className="flex items-start gap-2.5 border border-[var(--line)] rounded-xl px-3.5 py-3 hover:border-[var(--teal-500)] transition-colors"
        >
          <span className="text-lg leading-none">💬</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--teal-900)]">
              ¿Querés acceder a los recursos docentes?
            </p>
            <p className="text-xs text-[var(--ink)]/55 mt-0.5">
              Ingresá a nuestro espacio de Slack para encontrar recursos y comunicaciones.
            </p>
            <p className="text-xs text-[var(--teal-700)] font-medium mt-1">Ir a Slack →</p>
          </div>
        </a>

        {onVerMisCargas && (
          <button
            type="button"
            onClick={onVerMisCargas}
            className="w-full flex items-start gap-2.5 border border-[var(--line)] rounded-xl px-3.5 py-3 hover:border-[var(--teal-500)] text-left transition-colors"
          >
            <span className="text-lg leading-none">📋</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--teal-900)]">Ver mis cargas</p>
              <p className="text-xs text-[var(--ink)]/55 mt-0.5">
                Consultá tus cargas anteriores y su estado.
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

// Pasos del recorrido: apuntan a elementos por atributo data-tour, no por
// texto ni valores concretos de la app (curso, edición, etc.), para que
// sigan funcionando aunque cambien esos datos más adelante.
const PASOS = [
  {
    selector: '[data-tour="selector-curso"]',
    titulo: "1. Elegí el curso",
    texto: "Acá seleccionás el curso y la edición donde diste clase.",
  },
  {
    selector: '[data-tour="selector-clase"]',
    titulo: "2. Elegí la clase o sesión",
    texto:
      "Indicá qué clase o sesión diste. Si es una sesión individual de Ontológico, te va a mostrar directamente tus sesiones asignadas.",
  },
  {
    selector: '[data-tour="boton-agregar"]',
    titulo: "3. Agregala a tu carga",
    texto:
      "La sumás a la lista de este mes con este botón. Podés repetir el proceso para cargar todas tus clases antes de confirmar.",
  },
  {
    selector: '[data-tour="tabs"]',
    titulo: "4. Cambiá entre pestañas",
    texto: 'Desde acá pasás de "Cargar clases" a "Subir factura" cuando termines de cargar el mes.',
  },
];

export default function RecorridoGuiado({ onCerrar }) {
  const [paso, setPaso] = useState(0);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    function actualizarPosicion() {
      const el = document.querySelector(PASOS[paso].selector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null);
      }
    }
    actualizarPosicion();
    const t = setTimeout(actualizarPosicion, 300); // le da tiempo al scroll a asentarse
    window.addEventListener("resize", actualizarPosicion);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", actualizarPosicion);
    };
  }, [paso]);

  const actual = PASOS[paso];
  const esUltimo = paso === PASOS.length - 1;

  function siguiente() {
    if (esUltimo) onCerrar();
    else setPaso((p) => p + 1);
  }

  function anterior() {
    setPaso((p) => Math.max(0, p - 1));
  }

  const tarjetaStyle = rect
    ? {
        top: Math.min(rect.bottom + 16, (typeof window !== "undefined" ? window.innerHeight : 800) - 220),
        left: Math.max(16, Math.min(rect.left, (typeof window !== "undefined" ? window.innerWidth : 400) - 320)),
      }
    : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  return (
    <div className="fixed inset-0 z-[60]">
      {rect ? (
        <div
          className="absolute rounded-lg ring-4 ring-[var(--amber-600)]"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
            transition: "all .25s ease",
            pointerEvents: "none",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/60" style={{ pointerEvents: "none" }} />
      )}

      <div className="absolute bg-white rounded-2xl p-5 max-w-xs shadow-xl" style={tarjetaStyle}>
        <p className="text-xs font-medium text-[var(--amber-600)] mb-1">
          Paso {paso + 1} de {PASOS.length}
        </p>
        <h3 className="text-base font-semibold text-[var(--ink)] mb-1.5">{actual.titulo}</h3>
        <p className="text-sm text-[var(--ink)]/70 mb-1">{actual.texto}</p>
        {!rect && (
          <p className="text-xs text-[var(--ink)]/50 mb-3">
            (Este paso se ve reflejado en la pantalla a medida que avanzás con la carga.)
          </p>
        )}
        <div className="flex items-center justify-between gap-2 mt-3">
          <button onClick={onCerrar} className="text-xs text-[var(--ink)]/50 underline">
            Saltear
          </button>
          <div className="flex gap-2">
            {paso > 0 && (
              <button
                onClick={anterior}
                className="border border-[var(--clay-300)] rounded-lg px-3 py-1.5 text-sm"
              >
                Atrás
              </button>
            )}
            <button
              onClick={siguiente}
              className="bg-[var(--ink)] text-white rounded-lg px-3 py-1.5 text-sm font-medium"
            >
              {esUltimo ? "Listo" : "Siguiente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

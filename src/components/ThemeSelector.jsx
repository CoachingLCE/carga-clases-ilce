"use client";
import { useTheme } from "@/lib/ThemeContext";

const OPCIONES = [
  { valor: "claro", icono: "☀️", titulo: "Modo claro" },
  { valor: "oscuro", icono: "🌙", titulo: "Modo oscuro" },
  { valor: "auto", icono: "🕒", titulo: "Automático (según la hora)" },
];

export default function ThemeSelector() {
  const { preferencia, cambiarPreferencia } = useTheme();

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full p-0.5 shrink-0"
      style={{ background: "var(--clay-100)" }}
    >
      {OPCIONES.map((o) => (
        <button
          key={o.valor}
          type="button"
          title={o.titulo}
          onClick={() => cambiarPreferencia(o.valor)}
          className="w-7 h-7 flex items-center justify-center rounded-full text-xs transition-colors"
          style={{
            background: preferencia === o.valor ? "var(--teal-700)" : "transparent",
          }}
        >
          {o.icono}
        </button>
      ))}
    </div>
  );
}

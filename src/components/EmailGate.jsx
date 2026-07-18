"use client";

import { useState } from "react";
import { MAIL_ADMINISTRACION } from "@/lib/config";

const BENEFICIOS = [
  { color: "var(--teal-500)", texto: "Registrar tus clases" },
  { color: "var(--amber-600)", texto: "Cargar tus sesiones" },
  { color: "var(--teal-700)", texto: "Consultar tu historial" },
  { color: "var(--teal-900)", texto: "Acceder desde cualquier dispositivo" },
];

export default function EmailGate({ onIngreso }) {
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setCargando(true);
    setError("");
    try {
      const res = await fetch(`/api/docente?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!data.ok) {
        setError(
          data.error ||
            "No encontramos ese email en la lista de docentes. Revisá que esté bien escrito."
        );
        return;
      }
      onIngreso(data.docente);
    } catch (err) {
      setError("No pudimos verificar tu email. Probá de nuevo en un momento.");
    } finally {
      setCargando(false);
    }
  }

  function entrarModoPrueba() {
    const nombre = email.trim() ? email.trim().split("@")[0] : "Modo prueba";
    onIngreso({
      email: email.trim() || "prueba@ejemplo.com",
      nombre,
      modoPrueba: true,
    });
  }

  return (
    <div className="fade-in min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-[380px]">
        <img
          src="/logo.png"
          alt="Instituto ILCE"
          className="w-14 h-14 rounded-full mx-auto mb-4 object-cover"
        />

        <p className="text-center text-[13px] font-semibold uppercase tracking-wide text-[var(--teal-500)] mb-2">
          Acceso exclusivo para docentes de ILCE
        </p>

        <h1 className="font-display text-[38px] leading-tight text-center text-[var(--teal-900)] mb-2">
          Carga de clases
        </h1>

        <p className="text-center text-[var(--ink)]/70 text-[17px] mb-1.5">
          Registrá tus clases de forma simple y rápida.
        </p>
        <p className="text-center text-[var(--ink)]/55 text-sm mb-7">
          Registrá tus clases y tus sesiones en menos de un minuto.
        </p>

        <p className="text-center text-[var(--ink)]/65 text-base mb-4">
          Ingresá el correo electrónico con el que dictás clases en ILCE.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <input
            type="email"
            required
            placeholder="nombre@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[var(--line)] rounded-full px-5 py-3.5 text-base outline-none focus:border-[var(--teal-500)]"
          />
          {error && <p className="text-sm text-[var(--clay-600)] px-2">{error}</p>}
          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-[var(--teal-700)] text-white rounded-full px-4 py-3.5 text-base font-medium disabled:opacity-60"
          >
            {cargando ? "Verificando..." : "Continuar"}
          </button>
        </form>

        <button
          type="button"
          onClick={entrarModoPrueba}
          className="w-full mt-3 border border-[var(--amber-600)] text-[var(--amber-600)] rounded-full px-4 py-3 text-sm font-semibold"
        >
          Ver cómo funciona (modo prueba)
        </button>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-8 mb-8">
          {BENEFICIOS.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: b.color }}
              />
              <span className="text-sm text-[var(--ink)]/65">{b.texto}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-[var(--ink)]/50 text-center leading-relaxed">
          ¿Necesitás ayuda para ingresar?
          <br />
          Escribí a{" "}
          <a href={`mailto:${MAIL_ADMINISTRACION}`} className="text-[var(--teal-700)]">
            {MAIL_ADMINISTRACION}
          </a>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { MAIL_ADMINISTRACION } from "@/lib/config";

export default function EmailGate({ onIngreso }) {
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;

    if (email.trim().toLowerCase() === MAIL_ADMINISTRACION.toLowerCase()) {
      onIngreso({ email: email.trim(), nombre: "Administración", esAdmin: true });
      return;
    }

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
      <div className="w-full max-w-[360px]">
        <img
          src="/logo.jpg"
          alt="Instituto ILCE"
          className="w-14 h-14 rounded-full mx-auto mb-4 object-cover"
        />
        <p className="text-center text-[13px] font-medium text-[var(--teal-500)] mb-1.5">
          ¡Bienvenido/a!
        </p>
        <h1 className="font-display text-[28px] text-center text-[var(--teal-900)] mb-0.5">
          Carga de clases
        </h1>
        <p className="text-center text-[var(--ink)]/50 text-xs mb-2.5">
          (y sesiones de Coaching Ontológico)
        </p>
        <p className="text-center text-[var(--ink)]/65 text-sm mb-7">
          Ingresá con tu email de docente para empezar.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <input
            type="email"
            required
            placeholder="tu-email@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[var(--line)] rounded-full px-5 py-3 text-sm outline-none focus:border-[var(--teal-500)]"
          />
          {error && <p className="text-[13px] text-[var(--clay-600)] px-2">{error}</p>}
          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-[var(--teal-700)] text-white rounded-full px-4 py-3 text-sm font-medium disabled:opacity-60"
          >
            {cargando ? "Verificando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-xs text-[var(--ink)]/50 text-center mt-4 leading-relaxed">
          ¿Tenés algún inconveniente con la app?
          <br />
          Escribí a{" "}
          <a href={`mailto:${MAIL_ADMINISTRACION}`} className="text-[var(--teal-700)]">
            {MAIL_ADMINISTRACION}
          </a>
        </p>

        <div className="text-center mt-6 pt-5 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={entrarModoPrueba}
            className="bg-transparent border-none text-[var(--amber-600)] text-[13px] font-semibold underline"
          >
            ¿Solo querés ver cómo funciona? Entrá en modo prueba
          </button>
        </div>
      </div>
    </div>
  );
}

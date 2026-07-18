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

  return (
    <div className="max-w-sm mx-auto mt-16 px-6">
      <h1 className="text-xl font-semibold text-[var(--ink)] mb-1">Carga de clases</h1>
      <p className="text-sm text-[var(--ink)]/60 mb-6">
        Ingresá tu email para cargar tus clases y sesiones del mes.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="tu-email@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-[var(--clay-300)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--amber-600)]"
        />
        {error && <p className="text-sm text-[var(--clay-600)]">{error}</p>}
        <button
          type="submit"
          disabled={cargando}
          className="bg-[var(--amber-600)] text-white rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {cargando ? "Verificando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}

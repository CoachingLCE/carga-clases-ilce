"use client";

import { useEffect, useState } from "react";
import { MAIL_ADMINISTRACION } from "@/lib/config";

const BENEFICIOS = [
  { color: "var(--login-accentTeal)", texto: "Registrar tus clases" },
  { color: "var(--login-accentMagenta)", texto: "Cargar tus sesiones" },
  { color: "var(--login-accentPurple)", texto: "Consultar tu historial" },
  { color: "var(--login-accentTeal)", texto: "Acceder desde cualquier dispositivo" },
];

export default function EmailGate({ onIngreso }) {
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const ultimoEmail = localStorage.getItem("ilce_ultimo_email");
    if (ultimoEmail) setEmail(ultimoEmail);
  }, []);

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
      localStorage.setItem("ilce_ultimo_email", email.trim());
      onIngreso(data.docente);
    } catch (err) {
      setError("No pudimos verificar tu email. Probá de nuevo en un momento.");
    } finally {
      setCargando(false);
    }
  }

  function entrarModoPrueba() {
    if (!email.trim()) {
      setError(
        "Escribí tu email antes de entrar en modo prueba, así los mails de prueba te llegan a vos."
      );
      return;
    }
    localStorage.setItem("ilce_ultimo_email", email.trim());
    onIngreso({
      email: email.trim(),
      nombre: email.trim().split("@")[0],
      modoPrueba: true,
    });
  }

  return (
    <div className="fade-in min-h-[70vh] flex items-center justify-center">
      <div
        className="w-full max-w-[380px] rounded-2xl p-7"
        style={{
          background: "var(--login-surface2)",
          border: "1px solid var(--login-border)",
        }}
      >
        <img
          src="/logo.png"
          alt="Instituto ILCE"
          className="w-14 h-14 rounded-full mx-auto mb-4 object-cover"
        />

        <p
          className="text-center text-[13px] font-semibold uppercase tracking-wide mb-2"
          style={{ color: "var(--login-accentTeal)" }}
        >
          Acceso exclusivo para docentes de ILCE
        </p>

        <h1
          className="font-display text-[30px] leading-tight text-center mb-2"
          style={{ color: "var(--login-text)" }}
        >
          Carga de clases
        </h1>

        <p className="text-center text-sm mb-1" style={{ color: "var(--login-textSec)" }}>
          Registrá tus clases de forma simple y rápida.
        </p>
        <p className="text-center text-xs mb-6" style={{ color: "var(--login-textMuted)" }}>
          Registrá tus clases y tus sesiones en menos de un minuto.
        </p>

        <form onSubmit={handleSubmit}>
          <label
            className="text-xs block mb-1"
            style={{ color: "var(--login-textSec)" }}
          >
            Email
          </label>
          <input
            type="email"
            required
            placeholder="nombre@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm mb-3.5 outline-none"
            style={{
              background: "var(--login-bg)",
              border: "1px solid var(--login-border)",
              color: "var(--login-text)",
            }}
          />

          {error && (
            <p
              className="text-xs mb-3.5 rounded-lg px-3 py-2"
              style={{ background: "#331408", color: "#fbbf24" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full text-white rounded-lg py-2.5 font-semibold text-sm disabled:opacity-60"
            style={{
              background: `linear-gradient(to right, var(--login-accentPurple), var(--login-accentMagenta))`,
            }}
          >
            {cargando ? "Verificando..." : "Continuar"}
          </button>
        </form>

        <button
          type="button"
          onClick={entrarModoPrueba}
          className="w-full mt-3 rounded-lg py-2.5 text-sm font-semibold"
          style={{
            border: `1px solid var(--login-accentTeal)`,
            color: "var(--login-accentTeal)",
          }}
        >
          Ver cómo funciona (modo prueba)
        </button>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-7 mb-6">
          {BENEFICIOS.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: b.color }}
              />
              <span className="text-xs" style={{ color: "var(--login-textSec)" }}>
                {b.texto}
              </span>
            </div>
          ))}
        </div>

        <p
          className="text-xs text-center leading-relaxed"
          style={{ color: "var(--login-textMuted)" }}
        >
          ¿Necesitás ayuda para ingresar?
          <br />
          Escribí a{" "}
          <a href={`mailto:${MAIL_ADMINISTRACION}`} style={{ color: "var(--login-accentTeal)" }}>
            {MAIL_ADMINISTRACION}
          </a>
        </p>
      </div>
    </div>
  );
}

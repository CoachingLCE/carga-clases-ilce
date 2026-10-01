"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const CLAVE = "ilce-carga-clases-tema";

// Automático: 07:00–19:00 claro, resto oscuro.
function temaPorHorario() {
  const hora = new Date().getHours();
  return hora >= 7 && hora < 19 ? "light" : "dark";
}
function resolver(preferencia) {
  if (preferencia === "auto") return temaPorHorario();
  return preferencia === "claro" ? "light" : "dark";
}

export function ThemeProvider({ children }) {
  const [preferencia, setPreferencia] = useState("claro");

  useEffect(() => {
    const guardada = localStorage.getItem(CLAVE) || "claro";
    setPreferencia(guardada);
    document.documentElement.setAttribute("data-theme", resolver(guardada));
  }, []);

  useEffect(() => {
    if (preferencia !== "auto") return;
    const intervalo = setInterval(() => {
      document.documentElement.setAttribute("data-theme", temaPorHorario());
    }, 60 * 1000);
    return () => clearInterval(intervalo);
  }, [preferencia]);

  function cambiarPreferencia(nueva) {
    setPreferencia(nueva);
    localStorage.setItem(CLAVE, nueva);
    document.documentElement.setAttribute("data-theme", resolver(nueva));
  }

  return (
    <ThemeContext.Provider value={{ preferencia, cambiarPreferencia }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
}

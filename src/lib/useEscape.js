"use client";
import { useEffect } from "react";

// Cierra un modal o panel con la tecla Esc (accesibilidad por teclado).
export function useEscape(activo, onEscape) {
  useEffect(() => {
    if (!activo) return undefined;
    function manejar(e) {
      if (e.key === "Escape") onEscape();
    }
    document.addEventListener("keydown", manejar);
    return () => document.removeEventListener("keydown", manejar);
  }, [activo, onEscape]);
}

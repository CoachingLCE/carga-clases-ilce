import { NextResponse } from "next/server";
import { registrarCargas, getClasesTomadas, getDocentePorEmail, getEdiciones, getValor } from "@/lib/sheets";
import { getEstadoCierre } from "@/lib/mes";
import { enviarMailConfirmacionCarga } from "@/lib/mail";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, items, modoPrueba } = body;

    if (!email || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Faltan datos para registrar la carga." },
        { status: 400 }
      );
    }

    if (!modoPrueba) {
      const { habilitado } = getEstadoCierre();
      if (!habilitado) {
        return NextResponse.json(
          { ok: false, error: "La carga de este mes ya está cerrada." },
          { status: 403 }
        );
      }
    }

    let aceptados = items;
    let rechazados = [];

    if (!modoPrueba) {
      // Chequeamos, por cada combinación curso+edición(+alumno), qué números ya
      // están tomados, para no pisar la carga de otro docente.
      const cacheTomadas = {};
      aceptados = [];
      for (const item of items) {
        const clave = `${item.cursoId}::${item.edicion}::${(item.alumno || "").toLowerCase()}`;
        if (!(clave in cacheTomadas)) {
          cacheTomadas[clave] = await getClasesTomadas(item.cursoId, item.edicion, item.alumno);
        }
        const tomadas = cacheTomadas[clave];
        if (tomadas.includes(String(item.claseOSesion))) {
          rechazados.push(item);
        } else {
          aceptados.push(item);
          tomadas.push(String(item.claseOSesion));
        }
      }

      if (aceptados.length > 0) {
        await registrarCargas(email, aceptados);
      }

      // Mandamos el mail de confirmación al docente (con copia a administración).
      // Si falla el envío, no rompemos la respuesta — la carga ya quedó registrada.
      if (aceptados.length > 0) {
        try {
          const [docente, ediciones] = await Promise.all([getDocentePorEmail(email), getEdiciones()]);
          const valoresPorCurso = {};
          for (const item of aceptados) {
            if (!(item.cursoId in valoresPorCurso)) {
              valoresPorCurso[item.cursoId] = await getValor(email, item.cursoId);
            }
          }
          const detalle = aceptados.map((item) => {
            const edicion = ediciones.find((e) => e.cursoId === item.cursoId);
            return {
              cursoNombre: edicion?.nombreCurso || item.cursoId,
              edicion: item.edicion,
              claseOSesion: item.claseOSesion,
              alumno: item.alumno,
              valor: valoresPorCurso[item.cursoId] || 0,
            };
          });
          const rechazadasDetalle = rechazados.map((item) => {
            const edicion = ediciones.find((e) => e.cursoId === item.cursoId);
            return { cursoNombre: edicion?.nombreCurso || item.cursoId, ...item };
          });
          const total = detalle.reduce((acc, d) => acc + d.valor, 0);
          const { mesLabel } = getEstadoCierre();

          await enviarMailConfirmacionCarga({
            emailDocente: email,
            nombreDocente: docente?.nombre || "",
            mes: mesLabel,
            detalle,
            total,
            rechazadas: rechazadasDetalle,
          });
        } catch (mailErr) {
          console.error("No se pudo enviar el mail de confirmación:", mailErr);
        }
      }
    }

    return NextResponse.json({ ok: true, aceptados, rechazados });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "No se pudo registrar la carga. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }
}

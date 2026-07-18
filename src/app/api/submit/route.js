import { NextResponse } from "next/server";
import { registrarCargas, getClasesTomadas, getDocentePorEmail, getValor } from "@/lib/sheets";
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

    const { habilitado, mesLabel } = getEstadoCierre();

    if (!modoPrueba && !habilitado) {
      return NextResponse.json(
        { ok: false, error: "La carga de este mes ya está cerrada." },
        { status: 403 }
      );
    }

    let aceptados = items;
    let rechazados = [];

    if (modoPrueba) {
      // No escribimos nada en la planilla, pero sí mandamos el mail de
      // confirmación con los datos de ejemplo, para poder probar que el
      // envío de mails funciona sin tocar datos reales.
      try {
        const detalle = items.map((item) => ({
          cursoNombre: item.nombreCurso || item.cursoReal,
          edicion: item.edicion,
          claseOSesion: item.claseOSesion,
          alumno: item.alumno,
          valor: item.valor || 0,
        }));
        const total = detalle.reduce((acc, d) => acc + d.valor, 0);

        await enviarMailConfirmacionCarga({
          emailDocente: email,
          nombreDocente: "Modo prueba",
          mes: `${mesLabel} (PRUEBA — no se guardó nada)`,
          detalle,
          total,
          rechazadas: [],
        });
      } catch (mailErr) {
        console.error("No se pudo enviar el mail de prueba:", mailErr);
        return NextResponse.json(
          {
            ok: false,
            error:
              "No se pudo enviar el mail de prueba. Revisá GMAIL_USER y GMAIL_APP_PASSWORD en Vercel.",
          },
          { status: 500 }
        );
      }
    }

    if (!modoPrueba) {
      // Chequeamos, por cada combinación curso+edición(+alumno), qué números ya
      // están tomados, para no pisar la carga de otro docente.
      const cacheTomadas = {};
      aceptados = [];
      for (const item of items) {
        const clave = `${item.cursoReal}::${item.edicion}::${(item.alumno || "").toLowerCase()}`;
        if (!(clave in cacheTomadas)) {
          cacheTomadas[clave] = await getClasesTomadas(item.cursoReal, item.edicion, item.alumno);
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
        const docente = await getDocentePorEmail(email);

        // Buscamos el valor de cada curso involucrado (una sola vez por cursoReal).
        const valoresPorCurso = {};
        for (const item of aceptados) {
          if (!(item.cursoReal in valoresPorCurso)) {
            valoresPorCurso[item.cursoReal] = await getValor(email, item.cursoReal);
          }
        }

        const itemsConValor = aceptados.map((item) => ({
          ...item,
          valor: valoresPorCurso[item.cursoReal] || 0,
        }));

        await registrarCargas(email, docente?.nombre || "", mesLabel, itemsConValor);

        // Mandamos el mail de confirmación al docente (con copia a administración).
        // Si falla el envío, no rompemos la respuesta — la carga ya quedó registrada.
        try {
          const detalle = itemsConValor.map((item) => ({
            cursoNombre: item.nombreCurso || item.cursoReal,
            edicion: item.edicion,
            claseOSesion: item.claseOSesion,
            alumno: item.alumno,
            valor: item.valor,
          }));
          const rechazadasDetalle = rechazados.map((item) => ({
            cursoNombre: item.nombreCurso || item.cursoReal,
            ...item,
          }));
          const total = detalle.reduce((acc, d) => acc + d.valor, 0);

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

export const CHANGELOG = [
  {
    version: '1.5.0',
    fecha: '2026-10-02',
    cambios: [
      'Rediseño completo del mail "Factura recibida y registrada": separa sesiones individuales de clases/formaciones en tablas distintas (nunca mezcladas, nunca vacías), saludo personalizado, estado "✓ Factura recibida" discreto, total destacado al final, sección de documento adjunto, firma institucional y footer.',
      'Ahora se mandan 2 variantes del mail: la de la docente (sin datos administrativos) y la de Administración (con el alias informado) — antes era un único mail con copia a los dos.'
    ]
  },
  {
    version: '1.4.3',
    fecha: '2026-10-01',
    cambios: [
      'Mail de carga confirmada: "Formación" y "Edición" ahora son dos columnas separadas en la tabla (antes iban juntas en una).',
      'Las filas del mail ahora se ordenan primero por Edición y después por Clase/Sesión, para que se lean en orden natural.'
    ]
  },
  {
    version: '1.4.2',
    fecha: '2026-10-01',
    cambios: [
      'Arreglados varios fondos que quedaban fijos en blanco/gris claro y no se leían bien en modo oscuro: Historial, pestañas de Cargar/Factura, Tutorial, Recorrido guiado, los inputs y tarjetas de Agregar clase, el aviso de "carga cerrada", y la tabla del panel de administración.'
    ]
  },
  {
    version: '1.4.1',
    fecha: '2026-10-01',
    cambios: [
      'Centro de ayuda rediseñado con el mismo tono de bienvenida que seguimiento-lead-estudiante ("Te mostramos cómo funciona...") y "Comenzar recorrido" como botón principal destacado.'
    ]
  },
  {
    version: '1.4.0',
    fecha: '2026-10-01',
    cambios: [
      'La barra usa ahora el logo oficial completo de Instituto ILCE (el mismo que en seguimiento-lead-estudiante), que se adapta solo al modo claro/oscuro — antes era el isotipo circular + la palabra "ILCE" suelta.'
    ]
  },
  {
    version: '1.3.3',
    fecha: '2026-10-01',
    cambios: [
      'Arreglado el modo oscuro y automático, que no funcionaban (quedó mal anidado el CSS al agregarlo).',
      'En el login, el email ahora aparece oculto por defecto, con un ícono de ojito para mostrarlo.'
    ]
  },
  {
    version: '1.3.2',
    fecha: '2026-10-01',
    cambios: [
      'La barra de navegación se ensanchó más, para que todos los ítems entren en una sola línea en pantallas de escritorio normales.'
    ]
  },
  {
    version: '1.3.1',
    fecha: '2026-10-01',
    cambios: [
      'Se sacó "Recorrido" de la barra de navegación — ya está disponible dentro de "Ayuda".'
    ]
  },
  {
    version: '1.3.0',
    fecha: '2026-10-01',
    cambios: [
      'Nuevo selector de modo claro/oscuro/automático (☀️🌙🕒) en la barra superior — igual que en el resto de las apps de ILCE. "Automático" cambia solo según la hora (claro de 7 a 19hs).'
    ]
  },
  {
    version: '1.2.5',
    fecha: '2026-10-01',
    cambios: [
      'La barra de navegación ahora es más ancha y los ítems pasan a una segunda línea si hace falta, en vez de quedar con scroll horizontal.'
    ]
  },
  {
    version: '1.2.4',
    fecha: '2026-10-01',
    cambios: [
      'Los íconos de redes sociales de la barra ahora son los logos reales con sus colores de marca (Instagram, Facebook, WhatsApp, LinkedIn), en vez de emoji genéricos.'
    ]
  },
  {
    version: '1.2.3',
    fecha: '2026-10-01',
    cambios: [
      'Nuevo botón flotante "❓ Necesito ayuda" abajo a la derecha (igual que en las demás apps de ILCE) — abre el Centro de ayuda.'
    ]
  },
  {
    version: '1.2.2',
    fecha: '2026-10-01',
    cambios: [
      'La barra de navegación ahora queda fija arriba de todo (sticky) y ocupa todo el ancho de la pantalla, con el logo de ILCE — igual que en el resto de las apps de ILCE.'
    ]
  },
  {
    version: '1.2.1',
    fecha: '2026-10-01',
    cambios: [
      'Barra de navegación: ahora usa chips con el mismo lenguaje visual que el resto de las apps de ILCE (pastillas redondeadas, "Ir al Campus" destacado) en vez de texto subrayado.',
      'Se agregaron los links reales de Instagram, Facebook, WhatsApp y LinkedIn de ILCE.'
    ]
  },
  {
    version: '1.2.0',
    fecha: '2026-10-01',
    cambios: [
      'Nueva barra de navegación arriba (Mi actividad | Historial | Tutorial | Recorrido guiado | Campus | Ayuda), con los íconos de redes sociales a la derecha — reemplaza los botones sueltos de antes.',
      'Nueva sección "Historial de envíos": todas tus cargas organizadas por mes, colapsadas (el mes más reciente arranca abierto), con cantidad, total y el detalle de cada clase/sesión al desplegar.',
      '"Mi actividad" ahora muestra 4 indicadores (clases cargadas, cursos distintos, facturación estimada, última carga) en vez de solo 2.',
      'Nuevo "Centro de ayuda" con accesos directos a Tutorial, Recorrido guiado y contacto con soporte.'
    ]
  },
  {
    version: '1.1.0',
    fecha: '2026-10-01',
    cambios: [
      'Rediseño completo del mail de "Carga de clases/sesiones confirmada": formación y edición ahora se muestran separadas ("Coaching Ontológico — Ed. 35" en vez de mezclado con "(sesiones individuales)"), el lenguaje se adapta automáticamente a clases o sesiones, el asunto incluye la cantidad de registros (para que Gmail no agrupe varios envíos del mismo mes como una sola conversación), el total quedó en un bloque destacado, y se agregó la fecha/hora exacta del registro. Paleta institucional ILCE (azul/turquesa), compacto y compatible con Gmail/celular.'
    ]
  },
  {
    version: '1.0.0',
    fecha: '2026-09-29',
    cambios: [
      'Se agrego el boton de Novedades (abajo a la derecha), que parpadea cuando hay novedades que todavia no viste y se apaga al hacer clic.'
    ]
  }
];

export const CHANGELOG = [
  {
    version: '1.8.2',
    fecha: '2026-10-05',
    cambios: [
      'Novedades de la app: la lista ahora se va "prendiendo" renglón por renglón mientras se lee (arranca atenuada y cada renglón se ilumina al llegar a la zona de lectura de arriba), igual que en las demás apps de ILCE. Si tu sistema tiene activada la opción de "reducir movimiento", se muestra normal.',
      'Arreglo: al llegar al final de la lista, los últimos renglones quedaban apagados y no se podían leer bien; ahora se encienden.',
      'No se cambió ningún dato, flujo ni cálculo existente.'
    ]
  },
  {
    version: '1.8.1',
    fecha: '2026-10-04',
    cambios: [
      'Nueva barra lateral en la computadora: Campus, Mi actividad, Historial, Tutorial y Ayuda pasan de la barra de arriba a una columna fija a la izquierda, con un ícono por sección, y el tema y las redes abajo. Es la misma barra que ahora tienen Fichas, Gestión, Cronograma y Presentismo, para que las apps se vean como una sola. El panel de administración (Facturas recibidas) tiene la misma barra. En tablet y celular sigue la barra de arriba.',
      'No se cambió ningún dato, flujo ni cálculo existente.'
    ]
  },
  {
    version: '1.8.0',
    fecha: '2026-10-04',
    cambios: [
      'Tipografía de marca: el texto sigue en Dosis y los títulos y cifras pasan a TeX Gyre Adventor (antes Jost), como pide el manual. Las fuentes viajan dentro de la app: ya no se piden a Google, así se ven igual en todos los dispositivos y cargan más rápido.',
      'Íconos: los emoji de la interfaz se reemplazaron por íconos de trazo uniforme, los mismos que usan Fichas, Gestión, Cronograma y Presentismo. Toman el color del texto y cambian solos con el modo claro u oscuro.',
      'El cartel de versión pasa a 12 px, igual que en las otras apps.',
      'No se cambió ningún dato, flujo ni cálculo existente.'
    ]
  },
  {
    version: '1.7.2',
    fecha: '2026-10-04',
    cambios: [
      'En celular, cuando hay clases para confirmar, el botón "Confirmar carga" queda fijo abajo mostrando cuántas son y el total, así no hace falta buscarlo al final de la página. El botón de ayuda sube para no taparlo.'
    ]
  },
  {
    version: '1.7.1',
    fecha: '2026-10-04',
    cambios: [
      'Subir factura: el selector de archivo ahora es un botón propio de la app (antes era el del navegador, en inglés y sin estilo), con el nombre y el tamaño del archivo elegido.',
      'Panel de administración: las columnas que se pueden ordenar ahora lo muestran siempre con una flecha (antes solo aparecía después de usarlas).',
      'Las novedades y la versión ahora también se abren desde el botón de Ayuda. En celular se saca el cartelito de versión que se superponía con la lista.',
      'Modo oscuro: la pestaña activa se lee mejor.'
    ]
  },
  {
    version: '1.7.0',
    fecha: '2026-10-04',
    cambios: [
      'Pantalla principal reorganizada en escritorio: a la izquierda lo que querés hacer (agregar una clase y confirmar la carga) y a la derecha lo que ya cargaste este mes, agrupado por curso y edición con el subtotal de cada grupo. En celular, primero agregar y después lo ya cargado.',
      'Un solo resumen del mes arriba (antes había dos que repetían los mismos datos).',
      'Duplicar, Editar y Eliminar pasan a un menú ⋮ en cada clase cargada.',
      'Eliminar una carga y agregar una clase repetida ahora muestran un cuadro de la app, no el del navegador; los errores aparecen dentro de la pantalla.',
      'Panel de administración: tabla de ancho completo con pestañas por mes, indicadores (facturas, clases y total), búsqueda por docente o alias, orden por columna y estado "Sin archivo". En celular cada factura es una tarjeta.',
      'Las pestañas "Cargar clases" y "Subir factura" pasan a un estilo subrayado.',
      'No se cambió ningún dato, cálculo ni flujo existente.'
    ]
  },
  {
    version: '1.6.0',
    fecha: '2026-10-04',
    cambios: [
      'Arreglado: el texto secundario (etiquetas, datos de apoyo, subtítulos) se veía igual de fuerte que el principal y se perdía la jerarquía. Ahora se ve atenuado y con buen contraste.',
      'Arreglado: en celular la barra superior se apilaba y ocupaba casi un cuarto de la pantalla. Ahora es una sola fila con un menú desplegable.',
      'Modo oscuro: los botones de acción y el botón de ayuda ahora se leen bien (antes el texto blanco sobre celeste y rosa pastel casi no se veía), y los campos de texto ya no quedan en blanco.',
      'Un solo color para las acciones principales (el magenta de la marca). El botón "Necesito ayuda" pasa a ser neutro para no competir con la acción principal.',
      'Los paneles (Ayuda, Historial, Tutorial, Recorrido, Novedades) ahora se cierran con la tecla Esc; Ayuda e Historial también haciendo clic afuera.',
      'Se sacó el texto de versión duplicado que se superponía al badge de novedades.',
      'El resumen del mes ahora cuenta los cursos igual que "Mi actividad" (antes mostraba 4 donde "Mi actividad" mostraba 3, por contar por separado las sesiones individuales).',
      'Foco visible al navegar con teclado y textos chicos un poco más grandes.'
    ]
  },
  {
    version: '1.5.1',
    fecha: '2026-10-02',
    cambios: [
      'El mail de "Factura recibida" para Administración ahora lleva a la docente en copia (CC).'
    ]
  },
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

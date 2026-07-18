# Carga de clases — Instituto ILCE

App para que los docentes carguen sus clases y sesiones del mes, y suban su factura. Se conecta a una planilla de Google Sheets como base de datos.

---

## 1. Armar la planilla de Google Sheets

Creá una planilla nueva en [sheets.google.com](https://sheets.google.com) con **4 hojas**, con estos nombres exactos y estas columnas (fila 1 = encabezados, los datos arrancan en la fila 2):

### Hoja "Docentes"
| A: Email | B: Nombre | C: Activo | D: AliasSesiones |
|---|---|---|---|
| juan@mail.com | Juan Pérez | SI | Juan P. |

- **Activo**: `SI` o `NO`. Si es `NO`, ese docente no puede ingresar a la app (le aparece un aviso para que consulte con administración).
- **AliasSesiones** (opcional, columna "Nombre en planilla de sesiones"): el nombre/alias con el que ese docente aparece en la planilla externa de asignación de sesiones de Coaching Ontológico. Se usa para mostrarle solo sus sesiones pre-asignadas (ver sección "Sesiones pre-asignadas" más abajo). Si lo dejás vacío, el docente simplemente carga sus sesiones a mano, como hasta ahora.

### Hoja "Ediciones"
Acá cargás cada curso/edición que puede elegirse al cargar una clase.

| A: CursoId | B: NombreCurso | C: TipoCoaching | D: Edicion | E: Modalidad | F: TopeSesiones |
|---|---|---|---|---|---|
| CO27 | Coaching Ontológico | Coaching ontológico | Edición 27 | clase | |
| Or-10 | Oratoria | Oratoria | Edición 10 | clase | |
| IE-Individual | Inteligencia Emocional (sesiones) | Coaching educativo | | sesion | 20 |

- **CursoId**: un identificador único y corto (vos lo inventás, ej. "CO27"). Es la clave que conecta esta hoja con "Valores" y "Cargas".
- **Modalidad**: `clase` (clases de una cohorte) o `sesion` (sesiones individuales con nombre de alumno).
- **TopeSesiones**: solo para modalidad `sesion`. Si lo dejás vacío, se usan 20 por defecto.

### Hoja "Valores"
El valor acordado por docente y por curso.

| A: Email | B: CursoId | C: Valor |
|---|---|---|
| juan@mail.com | CO27 | 45000 |

### Hoja "Cargas"
Esta hoja la llena automáticamente la app — no necesitás escribir nada acá, solo dejarla creada con los encabezados.

| A: Timestamp | B: Email | C: CursoId | D: Edicion | E: ClaseOSesion | F: Alumno | G: EstadoFactura |
|---|---|---|---|---|---|---|

### Hoja "Facturas"
También la llena automáticamente la app cuando un docente sube su factura. Solo creála con los encabezados.

| A: Email | B: NombreDocente | C: FechaFactura | D: FechaEnvio | E: ArchivoUrl |
|---|---|---|---|---|

Anotá el **ID de la planilla**: es la parte de la URL entre `/d/` y `/edit`.
Ej: `https://docs.google.com/spreadsheets/d/ESTE-ES-EL-ID/edit` → `ESTE-ES-EL-ID`

---

## Sesiones pre-asignadas de Coaching Ontológico

Cuando un docente elige una edición con modalidad `sesion` (por ejemplo, una sesión individual de Ontológico), la app busca automáticamente sus sesiones pre-asignadas en una planilla externa de solo lectura, y se las muestra para elegir en vez de tener que escribir el nombre del alumno a mano. Si no encuentra ninguna (o el docente prefiere cargar algo que no está en la lista), siempre queda disponible el botón "No encuentro mi sesión, cargarla a mano".

Para activar esto hacen falta tres cosas:

1. **Compartir la planilla externa** con el email de la cuenta de servicio (el mismo `client_email` que ya usás para Sheets/Drive), con permiso de **Lector**.
2. **Cargar la columna `AliasSesiones`** en la hoja "Docentes" (ver arriba), con el alias exacto con el que cada docente figura en esa planilla externa.
3. **Agregar la variable de entorno `GOOGLE_SESIONES_SHEET_ID`** en Vercel, con el ID de esa planilla externa.

La estructura que la app espera leer de esa planilla (rango `A2:D`, sin encabezados en el código) es:

| A: AliasDocente | B: Alumno | C: Edición | D: Número de sesión |
|---|---|---|---|

Si en la planilla real las columnas están en otro orden, se ajusta fácilmente en `src/lib/sesionesExternas.js` (función `mapearFila`), sin tocar el resto de la app.

---

## Recorrido guiado

Además del tutorial inicial (que se ve solo la primera vez), hay un botón **"Ver recorrido guiado"** arriba de la app que el docente puede abrir cuando quiera. Ilumina, paso a paso, el selector de curso, el selector de clase/sesión, el botón de agregar y las tabs, con una explicación de cada uno. No depende de textos ni valores específicos de la app (nombres de cursos, ediciones, etc.) — apunta a los elementos por atributo `data-tour`, así que sigue funcionando igual aunque cambien los cursos, las ediciones o los textos de la interfaz.

---

## Panel de administración

Si entrás a la app con el email `administracion@institutoilce.com` (configurable en `src/lib/config.js`, constante `MAIL_ADMINISTRACION`), en vez del flujo normal de carga vas a ver una tabla con **Docente / Fecha de factura / Fecha de envío**, que se completa sola a medida que los docentes suben sus facturas. Desde ahí hay un botón **"Exportar a Excel"** que descarga esa tabla como archivo `.xlsx`.

---

## 2. Crear la carpeta de Drive para las facturas

Creá una carpeta en [drive.google.com](https://drive.google.com) donde se van a guardar los archivos de factura que suban los docentes. Anotá su **ID** (se ve igual que en Sheets, en la URL de la carpeta).

---

## 3. Crear la cuenta de servicio de Google (Service Account)

Esto le da a la app permiso para leer y escribir en tu planilla y tu carpeta de Drive, sin usar tu login personal.

1. Andá a [console.cloud.google.com](https://console.cloud.google.com) y creá un proyecto (o usá uno existente).
2. En el buscador del panel, buscá **"Google Sheets API"** y hacé clic en **Habilitar**. Repetí lo mismo para **"Google Drive API"**.
3. Andá a **IAM y administración → Cuentas de servicio → Crear cuenta de servicio**. Ponele un nombre (ej. "carga-clases-bot") y creála (no hace falta darle roles de proyecto).
4. Entrá a la cuenta de servicio recién creada → pestaña **Claves** → **Agregar clave → Crear clave nueva → JSON**. Se descarga un archivo `.json`.
5. Abrí ese archivo. Necesitás dos datos de ahí:
   - `client_email` → esto es tu `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → esto es tu `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

---

## 4. Compartir la planilla y la carpeta con la cuenta de servicio

- Abrí tu planilla de Sheets → **Compartir** → pegá el `client_email` de la cuenta de servicio → dale permiso de **Editor**.
- Hacé lo mismo con la carpeta de Drive de las facturas.

Sin este paso, la app no va a poder leer ni escribir nada.

---

## 5. Subir el proyecto a GitHub

1. Andá a [github.com](https://github.com) → **New repository** → ponele un nombre (ej. `carga-clases-ilce`) → **Create repository**.
2. En tu computadora, dentro de esta carpeta del proyecto:
   ```bash
   git init
   git add .
   git commit -m "Primera versión"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/carga-clases-ilce.git
   git push -u origin main
   ```
   (O usá el botón "uploading an existing file" en la web de GitHub si preferís no usar la terminal.)

---

## 6. Desplegar en Vercel

1. Andá a [vercel.com](https://vercel.com) → **Add New → Project** → elegí el repositorio que acabás de subir.
2. Antes de darle **Deploy**, abrí la sección **Environment Variables** y cargá estas 4:

   | Nombre | Valor |
   |---|---|
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | el `client_email` del JSON |
   | `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | el `private_key` del JSON (con los `\n` tal cual vienen) |
   | `GOOGLE_SHEET_ID` | el ID de tu planilla |
   | `GOOGLE_DRIVE_FOLDER_ID` | el ID de tu carpeta de facturas |
   | `GOOGLE_SESIONES_SHEET_ID` | el ID de la planilla externa de sesiones asignadas (opcional, solo si usás esa función) |

3. Dale **Deploy**. Al terminar te da una URL tipo `https://carga-clases-ilce.vercel.app`.

---

## 7. Insertarlo en Wix

En el editor de Wix, agregá un elemento **Embed → HTML embebido** en la página donde quieras que los docentes carguen sus clases, y pegá:

```html
<iframe src="https://TU-PROYECTO.vercel.app" style="width:100%; height:100vh; border:none;"></iframe>
```

---

## Probar sin tocar datos reales

Podés abrir la app con `?prueba` al final de la URL (ej. `https://carga-clases-ilce.vercel.app?prueba`) para activar el **modo prueba**: la interfaz funciona igual, pero ninguna carga se guarda en la planilla real.

---

## Estructura del proyecto

```
src/
  app/
    layout.js
    page.js
    globals.css
    api/
      docente/route.js   -> busca un docente por email
      valor/route.js     -> lista de ediciones / valor por docente+curso
      submit/route.js    -> registra la carga en la hoja "Cargas"
      factura/route.js   -> sube el archivo de factura a Drive y registra en "Facturas"
      admin/facturas/route.js -> lista de facturas para el panel de administración
      sesiones-asignadas/route.js -> sesiones pre-asignadas de un docente (planilla externa)
  components/
    App.jsx
    EmailGate.jsx
    Tutorial.jsx
    RecorridoGuiado.jsx
    SelectorClase.jsx
    TicketClase.jsx
    SubirFactura.jsx
    AdminPanel.jsx
  lib/
    config.js           -> día de cierre, mail de administración
    googleAuth.js       -> autenticación con la cuenta de servicio
    sheets.js           -> lectura/escritura de las hojas de la planilla principal
    sesionesExternas.js -> lectura de la planilla externa de sesiones asignadas
    mes.js              -> lógica de apertura/cierre mensual
```

## Correr localmente (opcional, para probar antes de desplegar)

```bash
npm install
cp .env.example .env.local   # y completá las 4 variables
npm run dev
```

Abrí `http://localhost:3000`.

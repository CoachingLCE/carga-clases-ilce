import { google } from "googleapis";

// Autenticación vía cuenta de servicio (Service Account). Requiere que la hoja de
// Google Sheets y la carpeta de Drive estén compartidas con el email de esta cuenta
// de servicio (ver README, sección "Configurar Google").
function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !rawKey) {
    throw new Error(
      "Faltan las variables de entorno GOOGLE_SERVICE_ACCOUNT_EMAIL o GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY."
    );
  }

  // En .env las claves privadas suelen guardarse con \n escapado, hay que revertirlo.
  const privateKey = rawKey.replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}

let cachedAuth = null;

export function getGoogleAuth() {
  if (!cachedAuth) {
    cachedAuth = getAuth();
  }
  return cachedAuth;
}

export function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getGoogleAuth() });
}

export function getDriveClient() {
  return google.drive({ version: "v3", auth: getGoogleAuth() });
}

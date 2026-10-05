import "./globals.css";
import VersionBadge from "../components/VersionBadge";
import { ThemeProvider } from "../lib/ThemeContext";

export const metadata = {
  title: "Carga de clases - ILCE",
  description: "Carga de clases y sesiones para docentes de Instituto ILCE",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <VersionBadge />
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import VersionBadge from "../components/VersionBadge";
import { ThemeProvider } from "../lib/ThemeContext";

export const metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/icon-32.png?v=2', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png?v=2', sizes: '192x192', type: 'image/png' }
    ],
    apple: '/apple-touch-icon.png?v=2'
  },
  title: "Carga de clases - ILCE",
  description: "Carga de clases y sesiones para docentes de Instituto ILCE",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
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

import "./globals.css";
import VersionBadge from "../components/VersionBadge";
import { ThemeProvider } from "../lib/ThemeContext";

export const metadata = {
  // Dominio de producción: hace que la imagen y el enlace de la vista previa sean absolutos (WhatsApp/Slack/Telegram lo exigen).
  metadataBase: new URL('https://carga-clases-ilce.vercel.app'),
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
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'Instituto ILCE',
    title: 'Carga de clases - ILCE',
    description: 'Carga de clases y sesiones para docentes de Instituto ILCE',
    url: '/',
    images: [{ url: '/og-image.png?v=1', width: 1200, height: 630, alt: 'Carga de clases — Instituto ILCE' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carga de clases - ILCE',
    description: 'Carga de clases y sesiones para docentes de Instituto ILCE',
    images: ['/og-image.png?v=1']
  }
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

import "./globals.css";

export const metadata = {
  title: "Carga de clases - ILCE",
  description: "Carga de clases y sesiones para docentes de Instituto ILCE",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

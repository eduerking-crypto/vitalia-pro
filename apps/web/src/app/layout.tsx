import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VITALIA Pro — Gestión Integral de Salud",
    template: "%s · VITALIA Pro",
  },
  description:
    "VITALIA Pro: salud integral con métricas, medicamentos, nutrición, asistente IA y telemedicina. Cumple HIPAA y GDPR.",
  applicationName: "VITALIA Pro",
  authors: [{ name: "Vitalia Health Tech" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9F9F9" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

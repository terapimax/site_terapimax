import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.terapimax.com.br"),
  title: { default: "Terapimax | Cuide do seu corpo, você mora nele.", template: "%s | Terapimax" },
  description:
    "Massageadores, vitaminas, suplementos, óleos e produtos de bem-estar com entrega para todo o Brasil.",
  icons: { icon: "/logo.png" },
};

export const viewport: Viewport = { themeColor: "#16a2c5", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

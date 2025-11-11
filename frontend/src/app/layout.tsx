"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Oculta navbar y footer solo en la raíz "/"
  const hideLayout = pathname === "/";

  return (
    <html lang="es">
      <body>
        {!hideLayout && <Navbar />}
        {children}
        {!hideLayout && <Footer />}
      </body>
    </html>
  );
}

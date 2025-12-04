"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "../hooks/useAuth";
import { CategoriasProvider } from "../contexts/CategoriasContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Oculta navbar y footer solo en la raíz "/"
  const hideLayout = pathname === "/";

  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <CategoriasProvider>
            {!hideLayout && <Navbar />}
            {children}
            {!hideLayout && <Footer />}
          </CategoriasProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "../hooks/useAuth";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Oculta navbar y footer solo en la raíz "/"
  const hideLayout = pathname === "/";

  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {!hideLayout && <Navbar />}
          {children}
          {!hideLayout && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}

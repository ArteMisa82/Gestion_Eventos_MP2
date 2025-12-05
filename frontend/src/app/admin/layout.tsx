"use client";
import React, { ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Calendar, FileCheck, LayoutDashboard, Settings, LogOut, Folder ,CalendarCheck} from "lucide-react";


interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/admin" },
    { name: "Eventos", icon: <Calendar size={18} />, href: "/admin/events" },
    { name: "Eventos Completos", icon: <CalendarCheck size={18} />, href: "/admin/eventos-completos" },

    //{ name: "Validaciones", icon: <FileCheck size={18} />, href: "/admin/validaciones" },
    { name: "Contenido", icon: <Settings size={18} />, href: "/admin/contenido" },
    { name: "Categorías", icon: <Folder size={18} />, href: "/admin/categoria" },
    { name: "Control de Cambios", icon: <Folder size={18} />, href: "../control-cambios" },
  ];

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#581517] shadow-md flex flex-col justify-between p-4">
        <div>
          <h1 className="text-xl font-bold mb-6 text-white text-center">
            Panel Admin
          </h1>
          <nav className="flex flex-col gap-3">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition font-medium ${
                  pathname === item.href
                    ? "bg-white text-[#581517] font-bold"
                    : "text-white hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto text-[#581517] bg-white">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

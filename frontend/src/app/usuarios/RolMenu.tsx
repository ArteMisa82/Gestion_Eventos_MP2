"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RolMenu({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="absolute top-4 right-6">
      <button
        onClick={() => setOpen(!open)}
        className="bg-white shadow p-2 rounded-full hover:bg-gray-100 transition"
      >
        <ChevronDown />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg p-3 w-48">
          {role === "docente" && (
            <button
              onClick={() => router.push("/panel/docente")}
              className="w-full text-left hover:bg-gray-100 p-2 rounded"
            >
              Panel Docente
            </button>
          )}
          {role === "responsable" && (
            <button
              onClick={() => router.push("/panel/responsable")}
              className="w-full text-left hover:bg-gray-100 p-2 rounded"
            >
              Panel Responsable
            </button>
          )}
        </div>
      )}
    </div>
  );
}

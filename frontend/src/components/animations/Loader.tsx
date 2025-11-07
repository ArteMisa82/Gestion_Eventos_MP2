// src/components/animations/Loader.tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Loader() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-screen bg-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 2.5 }}
    >
      {/* Logo institucional */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
        }}
        className="flex flex-col items-center"
      >
        <Image
          src="/logo_UTA.png"
          alt="Logo institucional"
          width={110}
          height={110}
          className="object-contain mb-6"
        />

        {/* Spinner discreto dorado */}
        <motion.div
          className="mt-6 w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

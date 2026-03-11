"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#ffe0ef] via-[#ffeef7] to-[#fff5fb]">
      {/* Background dots */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle, #BE185D 1.5px, transparent 1.5px)`,
          backgroundSize: "22px 22px",
        }}
      />

      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-pink-300 opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full bg-pink-200 opacity-25 blur-2xl pointer-events-none" />

      <div className="relative max-w-2xl md:max-w-4xl mx-auto px-4 py-8 md:py-10 flex flex-col md:flex-row items-center gap-4 md:gap-8">
        {/* Text block */}
        <div className="flex-1 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur-sm text-pink-600 text-xs font-semibold px-3 py-1 rounded-full border border-pink-200 mb-3"
          >
            <Sparkles className="w-3 h-3" />
            Feito artesanalmente com amor
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight mb-2"
          >
            Bolachas que contam
            <br />
            <span className="text-pink-600">histórias de carinho</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-500 text-sm md:text-base max-w-sm mx-auto md:mx-0 leading-relaxed"
          >
            Cada bolacha é decorada à mão para tornar seu momento especial e inesquecível.
          </motion.p>
        </div>

        {/* Decorative tags */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hidden md:flex flex-col gap-2"
        >
          {["Artesanal", "100% personalizado", "Entrega em Curitiba"].map((tag) => (
            <span
              key={tag}
              className="bg-white/80 backdrop-blur-sm text-pink-700 text-xs font-medium px-4 py-2 rounded-full border border-pink-100 shadow-sm whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 28" fill="white" preserveAspectRatio="none" className="w-full h-7">
          <path d="M0,14 C360,28 1080,0 1440,14 L1440,28 L0,28 Z" />
        </svg>
      </div>
    </div>
  );
}

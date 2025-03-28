'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="bg-[#ffe9f3] py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 text-center md:text-left"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#6b4c3b] mb-4">
              Bolachas Artesanais para sua Páscoa
            </h1>
            <p className="text-xl text-[#6b4c3b] mb-8">
              Feitas com amor e carinho para adoçar seus momentos especiais
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-64 h-64"
          >
            <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-[#fff9f0] shadow-xl">
              <Image
                src="/images/logo.png"
                alt="Bolachas da Mel Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 
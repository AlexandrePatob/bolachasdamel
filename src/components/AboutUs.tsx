'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const AboutUs = () => {
  return (
    <section className="w-full py-16 bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-pink-600 mb-4">
          Quem Somos
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg"
            >
              <Image
                src="/images/about-us.png"
                alt="Bolachas da Mel"
                fill
                className="object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-6 text-gray-700"
            >
              <p className="text-xl font-medium text-pink-600 md:whitespace-nowrap">
                🌸✨ Nasce uma menina, renasce uma mãe. ✨🌸
              </p>
              <p>
                A chegada da nossa menina transformou completamente o nosso mundo — ela trouxe cor, riso, doçura e leveza. Com ela, veio também a coragem de transformar a minha própria vida. 💛
              </p>
              <p>
                Foi com esse novo olhar, cheio de amor e propósito, que decidi começar um novo caminho. Um caminho mais leve, mais criativo e, claro… mais doce! 🍪
              </p>
              <p>
                Assim nasceram as Bolachas da Mel: feitas com muito carinho, dedicação e aquele toque especial de amor de mãe. Cada fornada carrega não só sabor, mas também sonhos, afeto e uma nova forma de viver. 💫
              </p>
              <p>
                Seja pra presentear, celebrar ou adoçar o seu dia, espero que cada bolachinha chegue até você como um pedacinho do nosso coração.
              </p>
              <p className="text-right font-medium">
                Com amor,<br />
                <a 
                  href="https://instagram.com/bolachasdamel_" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-pink-600 transition-colors"
                >
                  @bolachasdamel_ <span>📸</span>
                </a> 💕
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs; 
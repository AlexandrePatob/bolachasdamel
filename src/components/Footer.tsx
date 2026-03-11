'use client';
import React from 'react';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-[#fff9f0] border-t border-pink-100 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-[#6b4c3b] text-sm">
            Feito com 💕 por Bolachas da Mel
            <span className="block md:inline"> | Curitiba - PR</span>
          </p>
          <div className="flex space-x-6">
            <a
              href="https://instagram.com/bolachasdamel_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6b4c3b] hover:text-[#5a3d2e] transition-colors duration-200"
            >
              <div className="relative w-8 h-8">
                <Image
                  src="/images/system/instagram.png"
                  alt="Instagram"
                  width={32}
                  height={32}
                  className="drop-shadow-sm hover:scale-105 transition-transform duration-300"
                />
              </div>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
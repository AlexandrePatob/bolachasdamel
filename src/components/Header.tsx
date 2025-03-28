'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="w-full">
      {/* Top Bar */}
      <div className="bg-[#fff0f6] text-sm text-rose-600">
        <div className="container mx-auto px-4 py-1 flex justify-between items-center">
          <span>📍 Curitiba - PR</span>
          <Link 
            href="https://wa.me/554198038007" 
            target="_blank"
            className="hover:text-rose-700 transition-colors duration-300"
          >
            📞 (41) 9803-8007
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="Bolachas da Mel"
                width={180}
                height={60}
                className="drop-shadow-sm"
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 
'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, MapPin, Phone } from 'lucide-react';

interface HeaderProps {
  itemCount: number;
  onCartOpen: () => void;
  isNewItem?: boolean;
}

const Header = ({ itemCount, onCartOpen, isNewItem = false }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Announcement bar */}
      <div className="bg-pink-600 text-white text-xs">
        <div className="max-w-2xl md:max-w-4xl mx-auto px-4 py-1.5 flex justify-between items-center">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Santa Felicidade, Curitiba - PR
          </span>
          <Link
            href="https://wa.me/554198038007"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-pink-200 transition-colors"
          >
            <Phone className="w-3 h-3" />
            (41) 9803-8007
          </Link>
        </div>
      </div>

      {/* Main header bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm">
        <div className="max-w-2xl md:max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-pink-100 shadow-sm flex-shrink-0">
              <Image
                src="/images/system/logo.png"
                alt="Bolachas da Mel"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span
              className="text-2xl text-pink-600 leading-none"
              style={{ fontFamily: 'var(--font-great-vibes), cursive' }}
            >
              Bolachas da Mel
            </span>
          </Link>

          {/* Cart button */}
          <motion.button
            onClick={onCartOpen}
            aria-label={`Carrinho com ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
            animate={isNewItem ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.25 }}
            whileTap={{ scale: 0.93 }}
            className="relative flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white pl-3 pr-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer shadow-sm shadow-pink-200"
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={2} />
            <span className="hidden sm:inline">Carrinho</span>
            {itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-white text-pink-600 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-pink-200 shadow-sm leading-none"
              >
                {itemCount > 9 ? '9+' : itemCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Header;

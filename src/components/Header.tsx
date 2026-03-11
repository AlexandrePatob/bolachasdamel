'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, MapPin, Phone } from 'lucide-react';

interface HeaderProps {
  cartItemCount: number;
  isNewItem?: boolean;
  onCartClick: () => void;
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

const CATEGORIES = [
  { id: 'pascoa', label: 'Páscoa' },
  { id: 'maes', label: 'Dia das Mães' },
  { id: 'fe', label: 'Fé' },
  { id: 'outros', label: 'Outros' },
  { id: 'sobre', label: 'Quem Somos' },
];

const Header = ({
  cartItemCount,
  isNewItem = false,
  onCartClick,
  activeCategory,
  onCategoryChange,
}: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >

      {/* Área principal do header - design original */}
      <div className="bg-[#FDF8F9]">
        <div className="container mx-auto px-4 py-4 md:py-5">
          <div className="flex items-center justify-between gap-6">
            {/* Esquerda: título + slogan */}
            <Link href="/" className="flex flex-col justify-center min-w-0">
              <h1 className="text-xl md:text-2xl font-semibold text-[#D35E8E]">
                Bolachas Artesanais
              </h1>
              <p className="text-sm text-neutral-500 mt-0.5 hidden sm:block">
                Doces momentos feitos com carinho para celebrar a Páscoa
              </p>
            </Link>

            {/* Direita: logo circular + carrinho */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Logo circular */}
              <Link href="/" className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shrink-0 ring-2 ring-pink-200/50">
                <Image
                  src="/images/system/logo.png"
                  alt="Bolachas da Mel"
                  fill
                  className="object-cover"
                  priority
                />
              </Link>

              {/* Carrinho - circular, estilo original + badge */}
              <motion.button
                onClick={onCartClick}
                className="relative w-11 h-11 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center text-neutral-600 hover:border-pink-300 hover:text-[#D35E8E] transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isNewItem ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D35E8E] text-white text-[10px] font-bold flex items-center justify-center"
                    >
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Menus de categorias */}
        <nav className="border-t border-pink-100/80 bg-white/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto py-2.5 -mx-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map((category) => {
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shrink-0 ${
                      isActive
                        ? 'bg-pink-600 text-white'
                        : 'text-pink-600 hover:bg-pink-100'
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

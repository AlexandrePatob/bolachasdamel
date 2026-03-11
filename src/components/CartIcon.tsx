'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

interface CartIconProps {
  itemCount: number;
  onClick: () => void;
  isNewItem?: boolean;
}

const CartIcon = ({ itemCount, onClick, isNewItem = false }: CartIconProps) => {
  return (
    <motion.button
      onClick={onClick}
      aria-label={`Carrinho com ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
      className="fixed top-4 right-4 z-50 bg-white p-3 rounded-full shadow-md hover:shadow-lg border border-pink-50 transition-shadow duration-200 cursor-pointer"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      animate={isNewItem ? { scale: [1, 1.18, 1] } : {}}
      transition={{ duration: 0.25 }}
    >
      <div className="relative">
        <ShoppingBag className="w-6 h-6 text-pink-600" strokeWidth={1.8} />
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute -top-2 -right-2 bg-pink-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none"
          >
            {itemCount > 9 ? '9+' : itemCount}
          </motion.span>
        )}
      </div>
    </motion.button>
  );
};

export default CartIcon;

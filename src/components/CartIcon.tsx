'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface CartIconProps {
  itemCount: number;
  onClick: () => void;
  isNewItem?: boolean;
}

const CartIcon = ({ itemCount, onClick, isNewItem = false }: CartIconProps) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed top-4 right-4 z-50 bg-white p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={isNewItem ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <span className="text-2xl">🛒</span>
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
          >
            {itemCount}
          </motion.span>
        )}
      </div>
    </motion.button>
  );
};

export default CartIcon; 
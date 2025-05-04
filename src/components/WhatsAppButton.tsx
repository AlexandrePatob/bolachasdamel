'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/554198038007"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        y: [0, -5, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="relative w-14 h-14">
        <Image
          src="/images/system/whatsapp-icon.png"
          alt="WhatsApp"
          width={56}
          height={56}
          className="drop-shadow-lg"
        />
      </div>
    </motion.a>
  );
};

export default WhatsAppButton; 
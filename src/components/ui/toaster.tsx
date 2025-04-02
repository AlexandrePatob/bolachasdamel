'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="bottom-left"
      toastOptions={{
        duration: 2000,
        style: {
          background: '#FDF2F8',
          color: '#BE185D',
          border: '1px solid #FBCFE8',
        },
      }}
    />
  );
} 
import React from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bolachas da Mel - Deliciosas Bolachas Artesanais',
  description: 'As melhores bolachas artesanais feitas com amor e carinho.',
  openGraph: {
    title: 'Bolachas da Mel - Deliciosas Bolachas Artesanais',
    description: 'As melhores bolachas artesanais feitas com amor e carinho.',
    url: 'https://www.bolachasdamel.com.br/',
    siteName: 'Bolachas da Mel',
    images: [
      {
        url: 'https://www.bolachasdamel.com.br/image-preview.jpg',
        width: 1200,
        height: 630,
        alt: 'Bolachas da Mel - Deliciosas Bolachas Artesanais',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

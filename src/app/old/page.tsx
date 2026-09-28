import type { Metadata } from 'next';
import LegacyHome from './LegacyHome';

export const metadata: Metadata = {
  title: 'Catálogo original | Bolachas da Mel',
  description: 'Catálogo de bolachas artesanais da Bolachas da Mel.',
  robots: { index: false, follow: true },
};

export default function OldPage() {
  return <LegacyHome />;
}

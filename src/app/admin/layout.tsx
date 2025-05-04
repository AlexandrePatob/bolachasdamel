"use client";

import { useRouter } from "next/navigation";
import Image from 'next/image';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleSignOut = () => {
    // Limpa o cookie de autenticação
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/admin/login');
  };

  return (
    <div className="min-h-[75vh] bg-gradient-to-b from-[#ffe9f3] to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-5">
              <div className="relative w-12 h-12">
                <Image
                  src="/images/system/logo.png"
                  alt="Bolachas da Mel"
                  fill
                  className="object-contain rounded-full"
                />
              </div>
              <h1 className="text-xl font-bold text-[#6b4c3b]">Painel Administrativo</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-4">
        {children}
      </main>
    </div>
  );
} 
"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = () => {
    document.cookie =
      "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  };

  const isActive = (path: string) => pathname === path;
  const isLoginPage = pathname === "/admin/login";

  return (
    <div className="min-h-[75vh] bg-gradient-to-b from-[#ffe9f3] to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-5">
              <div className="relative w-12 h-12 shrink-0">
                <Image
                  src="/images/system/logo.png"
                  alt="Bolachas da Mel"
                  fill
                  className="object-contain rounded-full"
                />
              </div>
              <h1 className="text-xl font-bold text-[#6b4c3b]">
                Painel Administrativo
              </h1>
              {!isLoginPage && (
                <div className="flex gap-2 ml-4">
                  <Link
                    href="/admin/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/admin/dashboard")
                        ? "bg-[#6b4c3b] text-white"
                        : "text-[#6b4c3b] hover:bg-pink-100"
                    }`}
                  >
                    Torre
                  </Link>
                  <Link
                    href="/admin/history"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/admin/history")
                        ? "bg-[#6b4c3b] text-white"
                        : "text-[#6b4c3b] hover:bg-pink-100"
                    }`}
                  >
                    Histórico
                  </Link>
                  <Link
                    href="/admin/produtos"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith("/admin/produtos")
                        ? "bg-[#6b4c3b] text-white"
                        : "text-[#6b4c3b] hover:bg-pink-100"
                    }`}
                  >
                    Produtos
                  </Link>
                  <Link
                    href="/admin/categorias"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith("/admin/categorias")
                        ? "bg-[#6b4c3b] text-white"
                        : "text-[#6b4c3b] hover:bg-pink-100"
                    }`}
                  >
                    Categorias
                  </Link>
                </div>
              )}
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
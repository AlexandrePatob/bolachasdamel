import { NextResponse } from "next/server";
import { getProducts } from "@/lib/supabase";

// Força a rota a ser dinâmica e desativa TODOS os tipos de cache
export const revalidate = 300;

export async function GET(request: Request) {
  // Adiciona timestamp para forçar cache busting
  const timestamp = Date.now();

  try {
    // Extrai o parâmetro category da URL
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;

    const products = await getProducts(category);
    const response = NextResponse.json(products);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=59');

    return response;
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", timestamp },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}

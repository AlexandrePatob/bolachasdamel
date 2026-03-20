import { NextResponse } from "next/server";
import {
  getAllProductsAdmin,
  upsertProductRpc,
  deleteProductImage,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const products = await getAllProductsAdmin();
    return NextResponse.json(products, {
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { options = [], quantity_rules = [], ...productData } = body;

    let product;
    try {
      product = await upsertProductRpc(null, productData, options, quantity_rules);
    } catch (dbError) {
      // DB falhou — reverter imagem se foi enviada
      if (productData.image) {
        await deleteProductImage(productData.image).catch(() => {});
      }
      throw dbError;
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

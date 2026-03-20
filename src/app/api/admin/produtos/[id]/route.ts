import { NextResponse } from "next/server";
import {
  upsertProductRpc,
  setProductAvailability,
  deleteProductImage,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { options, quantity_rules, newImageUrl, ...productData } = body;

    // newImageUrl indica que uma nova imagem foi enviada nesta requisição
    // e deve ser revertida se o DB falhar
    let product;
    try {
      product = await upsertProductRpc(
        id,
        productData,
        options ?? [],
        quantity_rules ?? []
      );
    } catch (dbError) {
      if (newImageUrl) {
        await deleteProductImage(newImageUrl).catch(() => {});
      }
      throw dbError;
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await setProductAvailability(id, false);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disabling product:", error);
    return NextResponse.json({ error: "Failed to disable product" }, { status: 500 });
  }
}

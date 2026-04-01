import { NextResponse } from "next/server";
import { updateCategory, setCategoryActive } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const category = await updateCategory(id, body);
    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await setCategoryActive(id, false);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disabling category:", error);
    return NextResponse.json({ error: "Failed to disable category" }, { status: 500 });
  }
}

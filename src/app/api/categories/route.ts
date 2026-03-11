import { NextResponse } from "next/server";
import { getCategories } from "@/lib/supabase";

export const revalidate = 300;

export async function GET() {
  try {
    const categories = await getCategories();
    const response = NextResponse.json(categories);
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=59"
    );
    return response;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

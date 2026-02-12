import { NextRequest, NextResponse } from "next/server";
import { getCard } from "@/lib/db";
import { getPublicUrl } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const card = await getCard(id);

    if (!card) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...card,
      compositeImageUrl: card.composite_image_path
        ? getPublicUrl(card.composite_image_path)
        : null,
      rawImageUrl: card.raw_image_path
        ? getPublicUrl(card.raw_image_path)
        : null,
    });
  } catch (error) {
    console.error("Error fetching card:", error);
    return NextResponse.json(
      { message: "Failed to fetch card" },
      { status: 500 }
    );
  }
}

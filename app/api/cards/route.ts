import { NextRequest, NextResponse } from "next/server";
import { getAllCards } from "@/lib/db";
import { getPublicUrl } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  if (key !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const cards = await getAllCards();

    const cardsWithUrls = cards.map((card) => ({
      ...card,
      compositeImageUrl: card.composite_image_path
        ? getPublicUrl(card.composite_image_path)
        : null,
      rawImageUrl: card.raw_image_path
        ? getPublicUrl(card.raw_image_path)
        : null,
    }));

    return NextResponse.json(cardsWithUrls);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { message: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

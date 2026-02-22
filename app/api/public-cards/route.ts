import { NextResponse } from "next/server";
import { getFavoritedCards } from "@/lib/db";
import { getPublicUrl } from "@/lib/storage";

export async function GET() {
  try {
    const cards = await getFavoritedCards();

    const cardsWithUrls = cards.map((card) => ({
      id: card.id,
      title: card.title,
      compositeImageUrl: card.composite_image_path
        ? getPublicUrl(card.composite_image_path)
        : null,
    }));

    return NextResponse.json(cardsWithUrls);
  } catch (error) {
    console.error("Error fetching public cards:", error);
    return NextResponse.json(
      { message: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

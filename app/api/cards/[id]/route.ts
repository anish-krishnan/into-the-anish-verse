import { NextRequest, NextResponse } from "next/server";
import { getCard, deleteCard } from "@/lib/db";
import { getPublicUrl, deleteImages } from "@/lib/storage";

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const key = request.nextUrl.searchParams.get("key");

  if (key !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const card = await deleteCard(id);

    if (!card) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    // Clean up storage files
    const pathsToDelete: string[] = [];
    if (card.raw_image_path) pathsToDelete.push(card.raw_image_path);
    if (card.composite_image_path) pathsToDelete.push(card.composite_image_path);
    if (pathsToDelete.length > 0) {
      try {
        await deleteImages(pathsToDelete);
      } catch (err) {
        console.error("Failed to delete storage files:", err);
        // Don't fail the request — DB row is already deleted
      }
    }

    return NextResponse.json({ message: "Card deleted" });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { message: "Failed to delete card" },
      { status: 500 }
    );
  }
}

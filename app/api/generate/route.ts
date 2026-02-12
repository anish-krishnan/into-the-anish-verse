import { NextRequest, NextResponse } from "next/server";
import { generateCardImage } from "@/lib/image-generator";
import { compositeCard } from "@/lib/card-compositor";
import { buildPrompt } from "@/lib/prompts";
import { uploadImage } from "@/lib/storage";
import { insertCard, getCardCount, updateCardPaths } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import type { CardFormData } from "@/lib/types";

export const maxDuration = 60;

function validateInput(body: unknown): CardFormData {
  const data = body as Record<string, unknown>;

  const title = String(data.title || "").trim();
  const description = String(data.description || "").trim();
  const stat1Name = String(data.stat1Name || "").trim();
  const stat2Name = String(data.stat2Name || "").trim();
  const stat1Level = Number(data.stat1Level);
  const stat2Level = Number(data.stat2Level);

  if (!title || title.length > 30) {
    throw new Error("Card title is required (max 30 characters)");
  }
  if (!description || description.length > 300) {
    throw new Error("Character description is required (max 300 characters)");
  }
  if (!stat1Name || stat1Name.length > 12) {
    throw new Error("Stat 1 name is required (max 12 characters)");
  }
  if (!stat2Name || stat2Name.length > 12) {
    throw new Error("Stat 2 name is required (max 12 characters)");
  }
  if (!Number.isInteger(stat1Level) || stat1Level < 1 || stat1Level > 6) {
    throw new Error("Stat 1 level must be between 1 and 6");
  }
  if (!Number.isInteger(stat2Level) || stat2Level < 1 || stat2Level > 6) {
    throw new Error("Stat 2 level must be between 1 and 6");
  }

  return { title, description, stat1Name, stat1Level, stat2Name, stat2Level };
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const body = await request.json();
    const formData = validateInput(body);

    // Rate limit check
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      const minutes = Math.ceil((rateCheck.retryAfterMs || 0) / 60000);
      return NextResponse.json(
        {
          message: `Whoa, slow down! The Anish-Verse needs a moment to recharge. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
        },
        { status: 429 }
      );
    }

    // Generation cap check
    const maxGenerations = parseInt(
      process.env.MAX_GENERATIONS || "500",
      10
    );
    const currentCount = await getCardCount();
    if (currentCount >= maxGenerations) {
      return NextResponse.json(
        {
          message:
            "The Anish-Verse is sold out! All trading cards have been claimed.",
        },
        { status: 403 }
      );
    }

    // Generate image with timeout
    const prompt = buildPrompt(formData.title, formData.description);

    const rawImageBuffer = await Promise.race([
      generateCardImage(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Generation timed out")), 55000)
      ),
    ]);

    // Composite the final card (border only — title + stats are in the AI image)
    const compositeBuffer = await compositeCard(
      rawImageBuffer,
      formData.title,
      formData.stat1Name,
      formData.stat1Level,
      formData.stat2Name,
      formData.stat2Level
    );

    // Capture visitor info
    const userAgent = request.headers.get("user-agent") || null;

    // Insert card record to get the ID
    const card = await insertCard({
      title: formData.title,
      description: formData.description,
      stat1_name: formData.stat1Name,
      stat1_level: formData.stat1Level,
      stat2_name: formData.stat2Name,
      stat2_level: formData.stat2Level,
      raw_image_path: "",
      composite_image_path: "",
      ip_address: ip,
      user_agent: userAgent,
    });

    // Upload both images in parallel
    const rawPath = `raw/${card.id}.png`;
    const compositePath = `composite/${card.id}.png`;

    const [rawUrl, compositeUrl] = await Promise.all([
      uploadImage(rawPath, rawImageBuffer),
      uploadImage(compositePath, compositeBuffer),
    ]);

    // Update card record with actual storage paths
    await updateCardPaths(card.id, rawPath, compositePath);

    return NextResponse.json({
      id: card.id,
      compositeImageUrl: compositeUrl,
      rawImageUrl: rawUrl,
    });
  } catch (error) {
    console.error("Generation error:", error);

    const message =
      error instanceof Error ? error.message : "Something went wrong";

    if (message.includes("timed out")) {
      return NextResponse.json(
        { message: "The multiverse glitched — generation took too long. Try again!" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { message: `The multiverse glitched. ${message}` },
      { status: 500 }
    );
  }
}

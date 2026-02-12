import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

let _ai: GoogleGenAI | null = null;
let _sampleBase64: string | null = null;
let _coverBase64: string | null = null;

function getAI(): GoogleGenAI {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
    }
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
}

function loadReferenceImages(): {
  sampleBase64: string;
  coverBase64: string;
} {
  if (!_sampleBase64) {
    const samplePath = path.join(process.cwd(), "public", "assets", "anish-sample.jpg");
    _sampleBase64 = fs.readFileSync(samplePath).toString("base64");
  }
  if (!_coverBase64) {
    const coverPath = path.join(process.cwd(), "public", "assets", "partiful-cover.png");
    _coverBase64 = fs.readFileSync(coverPath).toString("base64");
  }
  return { sampleBase64: _sampleBase64, coverBase64: _coverBase64 };
}

export async function generateCardImage(prompt: string): Promise<Buffer> {
  const ai = getAI();
  const model =
    process.env.GEMINI_MODEL || "gemini-2.0-flash-preview-image-generation";

  const { sampleBase64, coverBase64 } = loadReferenceImages();

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        inlineData: {
          data: sampleBase64,
          mimeType: "image/jpeg",
        },
      },
      {
        inlineData: {
          data: coverBase64,
          mimeType: "image/png",
        },
      },
      {
        text:
          "Reference: The first image is a photo of the person this character should be based on — use their face and appearance. The second image shows the desired cartoon/comic art style to follow.\n\n" +
          prompt,
      },
    ],
    config: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error("No candidates returned from Gemini");
  }

  const parts = candidates[0].content?.parts;
  if (!parts) {
    throw new Error("No content parts returned from Gemini");
  }

  for (const part of parts) {
    if (part.inlineData) {
      return Buffer.from(part.inlineData.data!, "base64");
    }
  }

  throw new Error("No image returned from Gemini");
}

import { getSupabaseAdmin } from "./supabase";
import type { Card } from "./types";

export async function insertCard(
  card: Omit<Card, "id" | "created_at">
): Promise<Card> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("cards")
    .insert(card)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert card: ${error.message}`);
  }

  return data as Card;
}

export async function getCard(id: string): Promise<Card | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to get card: ${error.message}`);
  }

  return data as Card;
}

export async function getAllCards(): Promise<Card[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get cards: ${error.message}`);
  }

  return (data as Card[]) || [];
}

export async function updateCardPaths(
  id: string,
  rawImagePath: string,
  compositeImagePath: string
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("cards")
    .update({ raw_image_path: rawImagePath, composite_image_path: compositeImagePath })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update card paths: ${error.message}`);
  }
}

export async function getCardCount(): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { count, error } = await supabase
    .from("cards")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(`Failed to get card count: ${error.message}`);
  }

  return count || 0;
}

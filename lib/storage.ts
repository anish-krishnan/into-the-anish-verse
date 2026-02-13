import { getSupabaseAdmin } from "./supabase";

const BUCKET = "cards";

export async function uploadImage(
  path: string,
  buffer: Buffer,
  contentType: string = "image/png"
): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  return getPublicUrl(path);
}

export function getPublicUrl(path: string): string {
  const supabase = getSupabaseAdmin();

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}

export async function deleteImages(paths: string[]): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage.from(BUCKET).remove(paths);

  if (error) {
    throw new Error(`Failed to delete images: ${error.message}`);
  }
}

export async function downloadImage(path: string): Promise<Buffer> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.storage.from(BUCKET).download(path);

  if (error) {
    throw new Error(`Failed to download image: ${error.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

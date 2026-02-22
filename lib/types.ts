export interface Card {
  id: string;
  title: string;
  description: string;
  stat1_name: string;
  stat1_level: number;
  stat2_name: string;
  stat2_level: number;
  raw_image_path: string;
  composite_image_path: string;
  favorited: boolean;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface CardFormData {
  title: string;
  description: string;
  stat1Name: string;
  stat1Level: number;
  stat2Name: string;
  stat2Level: number;
}

export interface GenerateResponse {
  id: string;
  compositeImageUrl: string;
  rawImageUrl: string;
}

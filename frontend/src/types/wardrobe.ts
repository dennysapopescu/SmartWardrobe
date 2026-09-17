export type ClothingCategory =
  | 'TOPS'
  | 'BOTTOMS'
  | 'DRESSES'
  | 'OUTERWEAR'
  | 'SHOES'
  | 'ACCESSORIES';

export interface ClothingItem {
  id: number;
  name: string;
  category: ClothingCategory;
  subCategory?: string;
  primaryColor: string;
  secondaryColor?: string;
  pattern?: string;
  style: string;
  season: string;
  warmthLevel: number;
  imageUrl?: string;
  favorite: boolean;
  createdAt: string;
}

export interface WeatherInfo {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  condition: string;
  icon: string;
  isRaining: boolean;
  isCold: boolean;
  isHot: boolean;
  clothingAdvice: string;
  applicableSeasons: string[];
  recommendedWarmthMin: number;
  recommendedWarmthMax: number;
  locationName: string;
}

export interface Outfit {
  id?: number;
  name: string;
  occasion: string;
  weatherCondition: string;
  stylingAdvice: string;
  colorPalette: string;
  stylingTips?: string[];
  favorite: boolean;
  items: ClothingItem[];
  createdAt?: string;
}

export interface AiTaggingResult {
  name: string;
  category: ClothingCategory;
  subCategory: string;
  primaryColor: string;
  secondaryColor?: string;
  pattern: string;
  style: string;
  season: string;
  warmthLevel: number;
  analysisNotes: string;
  simulated: boolean;
}

export interface AiStatus {
  geminiConfigured: boolean;
  model: string;
  mode: string;
  freeTierAvailable: boolean;
  message: string;
}

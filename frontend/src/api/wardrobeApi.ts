import type { ClothingItem, WeatherInfo, Outfit, AiTaggingResult, AiStatus } from '../types/wardrobe';

const API_BASE = 'http://localhost:8080/api';

export const wardrobeApi = {
  // Clothes
  async getClothes(params?: { category?: string; search?: string; favorite?: boolean }): Promise<ClothingItem[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.favorite) query.append('favorite', 'true');

    const res = await fetch(`${API_BASE}/clothes?${query.toString()}`);
    if (!res.ok) throw new Error('Could not load clothes.');
    return res.json();
  },

  async uploadImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/clothes/upload-image`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload image.');
    return res.json();
  },

  async createClothingItem(formData: FormData): Promise<ClothingItem> {
    const res = await fetch(`${API_BASE}/clothes`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to save clothing item.');
    return res.json();
  },

  async createClothingItemJson(item: Partial<ClothingItem>): Promise<ClothingItem> {
    const res = await fetch(`${API_BASE}/clothes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to create clothing item.');
    return res.json();
  },

  async toggleFavoriteClothing(id: number): Promise<ClothingItem> {
    const res = await fetch(`${API_BASE}/clothes/${id}/favorite`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to toggle favorite.');
    return res.json();
  },

  async deleteClothing(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/clothes/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete clothing item.');
  },

  // Weather (100% Free Open-Meteo)
  async getWeather(params?: { latitude?: number; longitude?: number; city?: string }): Promise<WeatherInfo> {
    const query = new URLSearchParams();
    if (params?.latitude !== undefined) query.append('latitude', params.latitude.toString());
    if (params?.longitude !== undefined) query.append('longitude', params.longitude.toString());
    if (params?.city) query.append('city', params.city);

    const res = await fetch(`${API_BASE}/weather/current?${query.toString()}`);
    if (!res.ok) throw new Error('Could not fetch weather data.');
    return res.json();
  },

  // Outfit AI Generator
  async generateOutfit(
    request: {
      occasion: string;
      latitude?: number;
      longitude?: number;
      city?: string;
      overrideTemperature?: number;
      lockedItemIds?: number[];
    },
    clientApiKey?: string
  ): Promise<Outfit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (clientApiKey) {
      headers['X-Gemini-Api-Key'] = clientApiKey;
    }

    const res = await fetch(`${API_BASE}/outfits/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Failed to generate outfit.');
    }
    return res.json();
  },

  async saveOutfit(draft: Outfit): Promise<Outfit> {
    const res = await fetch(`${API_BASE}/outfits/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    if (!res.ok) throw new Error('Failed to save outfit.');
    return res.json();
  },

  async getSavedOutfits(): Promise<Outfit[]> {
    const res = await fetch(`${API_BASE}/outfits`);
    if (!res.ok) throw new Error('Could not load saved outfits.');
    return res.json();
  },

  async toggleFavoriteOutfit(id: number): Promise<Outfit> {
    const res = await fetch(`${API_BASE}/outfits/${id}/favorite`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to toggle outfit favorite.');
    return res.json();
  },

  async deleteOutfit(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/outfits/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete outfit.');
  },

  // AI Vision Tagging
  async analyzeClothingWithAi(imageFile: File, clientApiKey?: string): Promise<AiTaggingResult> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const headers: Record<string, string> = {};
    if (clientApiKey) {
      headers['X-Gemini-Api-Key'] = clientApiKey;
    }

    const res = await fetch(`${API_BASE}/ai/analyze-clothing`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to analyze image with AI.');
    return res.json();
  },

  async getAiStatus(): Promise<AiStatus> {
    const res = await fetch(`${API_BASE}/ai/status`);
    if (!res.ok) throw new Error('Could not verify AI status.');
    return res.json();
  },

  // Demo Wardrobe Seeder
  async resetAndSeedDemo(): Promise<{ message: string; totalItems: number }> {
    const res = await fetch(`${API_BASE}/demo/reset-and-seed`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to seed demo capsule.');
    return res.json();
  }
};

import type {
  ClothingItem,
  WeatherInfo,
  Outfit,
  AiTaggingResult,
  AiStatus,
  UserProfile,
  AuthResponse,
  PageResponse
} from '../types/wardrobe';

const defaultBase = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  ? `http://${window.location.hostname}:8080`
  : 'http://localhost:8080';
const BACKEND_BASE = (import.meta.env.VITE_API_URL || defaultBase).replace(/\/+$/, '');
const API_BASE = `${BACKEND_BASE}/api`;

export function getAuthToken(): string | null {
  return localStorage.getItem('smartwardrobe_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('smartwardrobe_token', token);
  } else {
    localStorage.removeItem('smartwardrobe_token');
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const authApi = {
  async register(data: { email: string; password: string; fullName: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Registration failed.' }));
      throw new Error(err.message || 'Registration failed.');
    }
    const result: AuthResponse = await res.json();
    setAuthToken(result.token);
    return result;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Invalid credentials.' }));
      throw new Error(err.message || 'Invalid credentials.');
    }
    const result: AuthResponse = await res.json();
    setAuthToken(result.token);
    return result;
  },

  async loginDemo(): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/demo`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Demo login failed.');
    const result: AuthResponse = await res.json();
    setAuthToken(result.token);
    return result;
  },

  async getMe(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error('Session expired.');
    return res.json();
  },

  logout() {
    setAuthToken(null);
  }
};

export const wardrobeApi = {
  // Clothes (Paginated catalog)
  async getClothes(params?: {
    category?: string;
    search?: string;
    favorite?: boolean;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<ClothingItem>> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.favorite) query.append('favorite', 'true');
    if (params?.page !== undefined) query.append('page', params.page.toString());
    if (params?.size !== undefined) query.append('size', params.size.toString());
    if (params?.sort) query.append('sort', params.sort);

    const res = await fetch(`${API_BASE}/clothes?${query.toString()}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error('Could not load clothes.');
    return res.json();
  },

  // All Clothes unpaginated (Used by AI Generator and Custom Outfit Canvas)
  async getAllClothes(): Promise<ClothingItem[]> {
    const res = await fetch(`${API_BASE}/clothes/all`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error('Could not load wardrobe items.');
    return res.json();
  },

  async uploadImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/clothes/upload-image`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload image.');
    return res.json();
  },

  async createClothingItem(formData: FormData): Promise<ClothingItem> {
    const res = await fetch(`${API_BASE}/clothes`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to save clothing item.');
    return res.json();
  },

  async createClothingItemJson(item: Partial<ClothingItem>): Promise<ClothingItem> {
    const res = await fetch(`${API_BASE}/clothes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to create clothing item.');
    return res.json();
  },

  async toggleFavoriteClothing(id: number): Promise<ClothingItem> {
    const res = await fetch(`${API_BASE}/clothes/${id}/favorite`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error('Failed to toggle favorite.');
    return res.json();
  },

  async deleteClothing(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/clothes/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
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
      ...getAuthHeaders(),
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

  async reviewCustomOutfit(
    request: {
      itemIds: number[];
      title?: string;
      occasion?: string;
      city?: string;
      overrideTemperature?: number;
    },
    clientApiKey?: string
  ): Promise<Outfit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    };
    if (clientApiKey) {
      headers['X-Gemini-Api-Key'] = clientApiKey;
    }

    const res = await fetch(`${API_BASE}/outfits/review-custom`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Failed to review custom outfit.');
    }
    return res.json();
  },

  async saveOutfit(draft: Outfit): Promise<Outfit> {
    const res = await fetch(`${API_BASE}/outfits/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(draft),
    });
    if (!res.ok) throw new Error('Failed to save outfit.');
    return res.json();
  },

  async getSavedOutfits(): Promise<Outfit[]> {
    const res = await fetch(`${API_BASE}/outfits`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error('Could not load saved outfits.');
    return res.json();
  },

  async toggleFavoriteOutfit(id: number): Promise<Outfit> {
    const res = await fetch(`${API_BASE}/outfits/${id}/favorite`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error('Failed to toggle outfit favorite.');
    return res.json();
  },

  async deleteOutfit(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/outfits/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error('Failed to delete outfit.');
  },

  // AI Vision Tagging
  async analyzeClothingWithAi(imageFile: File, clientApiKey?: string): Promise<AiTaggingResult> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const headers: Record<string, string> = {
      ...getAuthHeaders(),
    };
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
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error('Failed to seed demo capsule.');
    return res.json();
  }
};

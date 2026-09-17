import { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { ClosetPage } from './pages/ClosetPage';
import { OutfitGeneratorPage } from './pages/OutfitGeneratorPage';
import { LookbookPage } from './pages/LookbookPage';
import { SettingsPage } from './pages/SettingsPage';
import { AddClothingModal } from './components/upload/AddClothingModal';
import type { ClothingItem, Outfit, WeatherInfo } from './types/wardrobe';
import { wardrobeApi } from './api/wardrobeApi';

export function App() {
  const [activeTab, setActiveTab] = useState<'closet' | 'generator' | 'lookbook' | 'settings'>('closet');
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [isLoadingClothes, setIsLoadingClothes] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Settings state persisted in localStorage
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('smart_wardrobe_gemini_key') || '';
  });
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem('smart_wardrobe_city') || 'Timișoara';
  });

  // Load initial data
  useEffect(() => {
    loadClothes();
    loadOutfits();
    loadWeather(selectedCity);
  }, []);

  // When city changes, reload weather
  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    localStorage.setItem('smart_wardrobe_city', newCity);
    loadWeather(newCity);
  };

  const handleSaveGeminiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('smart_wardrobe_gemini_key', key);
  };

  const loadClothes = async () => {
    setIsLoadingClothes(true);
    try {
      const data = await wardrobeApi.getClothes();
      setClothes(data);
    } catch (error) {
      console.error('Failed to load clothes:', error);
    } finally {
      setIsLoadingClothes(false);
    }
  };

  const loadOutfits = async () => {
    try {
      const data = await wardrobeApi.getSavedOutfits();
      setSavedOutfits(data);
    } catch (error) {
      console.error('Failed to load outfits:', error);
    }
  };

  const loadWeather = async (city: string) => {
    try {
      const cityCoords: Record<string, { lat: number; lon: number }> = {
        'Paris': { lat: 48.8566, lon: 2.3522 },
        'London': { lat: 51.5074, lon: -0.1278 },
        'Milan': { lat: 45.4642, lon: 9.1900 },
        'New York': { lat: 40.7128, lon: -74.0060 },
        'Vienna': { lat: 48.2082, lon: 16.3738 },
        'Timisoara': { lat: 45.7537, lon: 21.2257 },
        'Bucharest': { lat: 44.4268, lon: 26.1025 },
        'Cluj-Napoca': { lat: 46.7712, lon: 23.6236 },
      };

      const coords = cityCoords[city] || { lat: 48.8566, lon: 2.3522 };
      const data = await wardrobeApi.getWeather({
        latitude: coords.lat,
        longitude: coords.lon,
        city: city,
      });
      setWeather(data);
    } catch (error) {
      console.error('Failed to load weather:', error);
    }
  };

  const handleToggleFavoriteClothing = async (id: number) => {
    try {
      const updated = await wardrobeApi.toggleFavoriteClothing(id);
      setClothes((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClothing = async (id: number) => {
    try {
      await wardrobeApi.deleteClothing(id);
      setClothes((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleItemAdded = (newItem: ClothingItem) => {
    setClothes((prev) => [newItem, ...prev]);
  };

  const handleOutfitSaved = (saved: Outfit) => {
    setSavedOutfits((prev) => [saved, ...prev]);
  };

  const handleToggleFavoriteOutfit = async (id: number) => {
    try {
      const updated = await wardrobeApi.toggleFavoriteOutfit(id);
      setSavedOutfits((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteOutfit = async (id: number) => {
    try {
      await wardrobeApi.deleteOutfit(id);
      setSavedOutfits((prev) => prev.filter((o) => o.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col selection:bg-roseGold-200">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        weather={weather}
        itemCount={clothes.length}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'closet' && (
          <ClosetPage
            clothes={clothes}
            onToggleFavorite={handleToggleFavoriteClothing}
            onDelete={handleDeleteClothing}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onSeedDemo={loadClothes}
            isLoading={isLoadingClothes}
          />
        )}

        {activeTab === 'generator' && (
          <OutfitGeneratorPage
            weather={weather}
            onRefreshWeather={() => loadWeather(selectedCity)}
            geminiApiKey={geminiApiKey}
            onOutfitSaved={handleOutfitSaved}
            totalClothesCount={clothes.length}
            onNavigateToCloset={() => setActiveTab('closet')}
          />
        )}

        {activeTab === 'lookbook' && (
          <LookbookPage
            outfits={savedOutfits}
            onToggleFavorite={handleToggleFavoriteOutfit}
            onDelete={handleDeleteOutfit}
            onNavigateToGenerator={() => setActiveTab('generator')}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            geminiApiKey={geminiApiKey}
            onSaveGeminiApiKey={handleSaveGeminiKey}
            onSeedDemo={loadClothes}
            selectedCity={selectedCity}
            onCityChange={handleCityChange}
          />
        )}
      </main>

      {/* Add Clothing Modal */}
      <AddClothingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onItemAdded={handleItemAdded}
        geminiApiKey={geminiApiKey}
      />

      {/* Luxury Editorial Footer */}
      <footer className="border-t border-stone-200/70 py-10 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-stone-900 tracking-wider">SMART WARDROBE</span>
            <span>&bull;</span>
            <span>Intelligent Capsule Wardrobe & Personal Stylist</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span className="hover:text-stone-700 transition-colors cursor-pointer">Capsule Guide</span>
            <span>&bull;</span>
            <span className="hover:text-stone-700 transition-colors cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-stone-700 transition-colors cursor-pointer">Terms of Service</span>
            <span>&bull;</span>
            <span>&copy; {new Date().getFullYear()} Smart Wardrobe Studio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, RefreshCw, CheckCircle, MapPin, Sparkle } from 'lucide-react';
import { wardrobeApi } from '../api/wardrobeApi';
import type { AiStatus } from '../types/wardrobe';

interface SettingsPageProps {
  geminiApiKey: string;
  onSaveGeminiApiKey: (key: string) => void;
  onSeedDemo: () => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  geminiApiKey,
  onSaveGeminiApiKey,
  onSeedDemo,
  selectedCity,
  onCityChange,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    wardrobeApi.getAiStatus().then(setAiStatus).catch(console.error);
  }, []);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGeminiApiKey(apiKeyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDemo = async () => {
    if (confirm('Are you sure you want to reset your wardrobe to the curated 22-piece capsule collection?')) {
      setIsResetting(true);
      try {
        await wardrobeApi.resetAndSeedDemo();
        onSeedDemo();
        alert('Wardrobe successfully reset to the signature capsule collection!');
      } catch (e) {
        console.error(e);
        alert('Error resetting wardrobe collection.');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-stone-200/80 pb-6">
        <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
          Preferences & Intelligence
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-semibold mt-1">
          Settings
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Customize your personal AI stylist preferences, meteorological location, and wardrobe catalog.
        </p>
      </div>

      {/* AI Intelligence Section */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-roseGold-100 text-roseGold-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                AI Vision & Styling Intelligence
              </h2>
              <p className="text-xs text-stone-500">
                Advanced multimodal image analysis & personalized outfit composition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-[11px] font-medium text-stone-700">
            <span className={`w-2 h-2 rounded-full ${geminiApiKey ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span>{geminiApiKey ? 'Vision Intelligence Active' : 'Smart Assistant Mode'}</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {aiStatus?.message || 
            'The studio works seamlessly out-of-the-box using the built-in Smart Fashion Engine. To enable instant camera recognition and deep multimodal styling, provide your free AI key below.'}
        </p>

        <form onSubmit={handleSaveKey} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              AI Stylist Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-4 py-2.5 bg-[#FAF8F5] rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-roseGold-400 font-mono"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 active:scale-95 transition-all shadow-sm"
              >
                Save Key
              </button>
            </div>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Stylist key saved securely in your browser!</span>
            </div>
          )}

          <div className="pt-2">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-roseGold-600 hover:text-roseGold-700 font-medium underline"
            >
              <span>Obtain a free AI key in seconds via Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </form>
      </div>

      {/* Weather & Location Settings */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-soft space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Styling Forecast Location
            </h2>
            <p className="text-xs text-stone-500">
              Real-time meteorological conditions for tailored outfit layering
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {['Paris', 'Milan', 'London', 'New York', 'Vienna', 'Timisoara', 'Bucharest', 'Cluj-Napoca'].map((city) => (
            <button
              key={city}
              onClick={() => onCityChange(city)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                selectedCity === city
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:bg-white'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Capsule Wardrobe Management */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <Sparkle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Signature Capsule Collection
            </h2>
            <p className="text-xs text-stone-500">
              Reset your closet to the curated 22-piece signature capsule collection (blazers, silk slips, denim, stiletto pumps, sneakers)
            </p>
          </div>
        </div>

        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-roseGold-50 text-roseGold-700 border border-roseGold-200 rounded-full text-xs font-semibold hover:bg-roseGold-100 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset to Signature Capsule</span>
        </button>
      </div>
    </div>
  );
};

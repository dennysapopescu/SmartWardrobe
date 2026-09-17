import React, { useState } from 'react';
import { 
  Wand2, 
  Sun, 
  Shuffle, 
  Bookmark, 
  Check, 
  Loader2,
  Sparkles,
  PenLine,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { WeatherInfo, Outfit } from '../types/wardrobe';
import { wardrobeApi } from '../api/wardrobeApi';

import { getFullImageUrl } from '../utils/imageUtils';

interface OutfitGeneratorPageProps {
  weather: WeatherInfo | null;
  onRefreshWeather: () => void;
  geminiApiKey: string;
  onOutfitSaved: (outfit: Outfit) => void;
  totalClothesCount: number;
  onNavigateToCloset: () => void;
}

const OCCASIONS = [
  { id: 'BRUNCH', label: 'Weekend Brunch', icon: '☕', desc: 'Relaxed, chic & photogenic' },
  { id: 'OFFICE', label: 'Office & Work', icon: '💼', desc: 'Smart chic, sharp & poised' },
  { id: 'DATE_NIGHT', label: 'Date Night', icon: '🍷', desc: 'Romantic, sultry & sleek' },
  { id: 'CASUAL', label: 'Casual Daily', icon: '👟', desc: 'Effortless, clean & minimal' },
  { id: 'PARTY', label: 'Evening Glam', icon: '✨', desc: 'Bold, festive & show-stopping' },
  { id: 'SPORT', label: 'Athleisure & Gym', icon: '🏃‍♀️', desc: 'Active, functional & stylish' },
];

const CUSTOM_INSPIRATIONS = [
  { label: '🎨 Art Gallery Opening', text: 'Art Gallery Opening Night' },
  { label: '🌿 Garden Wedding', text: 'Summer Garden Wedding' },
  { label: '🍸 Rooftop Cocktails', text: 'Rooftop Cocktail Lounge' },
  { label: '✈️ Airport Chic', text: 'First Class Airport Travel' },
  { label: '💡 Tech Pitch & Keynote', text: 'Tech Conference Keynote' },
  { label: '🎭 Opera & Theatre Night', text: 'Evening Opera & Theatre' },
];

export const OutfitGeneratorPage: React.FC<OutfitGeneratorPageProps> = ({
  weather,
  geminiApiKey,
  onOutfitSaved,
  totalClothesCount,
  onNavigateToCloset,
}) => {
  const [selectedOccasion, setSelectedOccasion] = useState('BRUNCH');
  const [customOccasionText, setCustomOccasionText] = useState('');
  const [isCustomOccasion, setIsCustomOccasion] = useState(false);
  const [customTemp, setCustomTemp] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutfit, setGeneratedOutfit] = useState<Outfit | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Active temperature is either real weather or simulated
  const activeTemp = customTemp !== null ? customTemp : (weather ? Math.round(weather.temperature) : 20);

  // Computed active occasion: custom text if active, otherwise the selected preset
  const activeOccasion = isCustomOccasion && customOccasionText.trim()
    ? customOccasionText.trim()
    : selectedOccasion;

  const handleGenerate = async () => {
    if (totalClothesCount === 0) {
      alert('Your wardrobe is currently empty. Please add items or load the demo capsule in the Wardrobe section.');
      return;
    }

    setIsGenerating(true);
    setIsSaved(false);

    try {
      const outfit = await wardrobeApi.generateOutfit(
        {
          occasion: activeOccasion,
          latitude: 45.7537,
          longitude: 21.2257,
          city: weather?.locationName || 'Timisoara',
          overrideTemperature: customTemp !== null ? customTemp : undefined,
        },
        geminiApiKey
      );

      setGeneratedOutfit(outfit);
    } catch (error) {
      console.error(error);
      alert('Could not generate outfit. Ensure the backend server is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLookbook = async () => {
    if (!generatedOutfit) return;
    setIsSaving(true);
    try {
      const saved = await wardrobeApi.saveOutfit(generatedOutfit);
      setIsSaved(true);
      onOutfitSaved(saved);

      // Trigger celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D9897E', '#BFA58C', '#FAF8F5', '#3A2A1B'],
      });
    } catch (e) {
      console.error(e);
      alert('Error saving outfit to Lookbook.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
          AI Personal Stylist
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-semibold mt-1">
          AI Outfit Generator
        </h1>
        <p className="text-sm text-stone-600 mt-1 max-w-xl">
          Harmonizes color theory, your chosen occasion, and real-time live weather to create the ideal outfit from your wardrobe.
        </p>
      </div>

      {/* Weather Context Banner */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sun className="w-7 h-7 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Live Weather Conditions &bull; {weather?.locationName || 'Local'}
                </span>
                {customTemp !== null && (
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                    Simulated
                  </span>
                )}
              </div>
              <h3 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                {activeTemp}°C &bull; {weather?.condition || 'Clear & Temperate'}
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                {weather?.clothingAdvice || 'Optimal weather for light layered styling.'}
              </p>
            </div>
          </div>

          {/* Quick Weather Simulator for Interview / Testing */}
          <div className="flex flex-wrap items-center gap-2 bg-[#FAF8F5] p-2 rounded-2xl border border-stone-200/60">
            <span className="text-[11px] font-medium text-stone-500 px-2">Test Weather:</span>
            <button
              onClick={() => setCustomTemp(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                customTemp === null ? 'bg-stone-900 text-white shadow-xs' : 'bg-white text-stone-700 hover:bg-stone-100'
              }`}
            >
              Live ({weather ? Math.round(weather.temperature) : 20}°C)
            </button>
            <button
              onClick={() => setCustomTemp(28)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                customTemp === 28 ? 'bg-amber-600 text-white shadow-xs' : 'bg-white text-stone-700 hover:bg-stone-100'
              }`}
            >
              ☀️ Summer (28°C)
            </button>
            <button
              onClick={() => setCustomTemp(14)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                customTemp === 14 ? 'bg-amber-800 text-white shadow-xs' : 'bg-white text-stone-700 hover:bg-stone-100'
              }`}
            >
              🍂 Fall (14°C)
            </button>
            <button
              onClick={() => setCustomTemp(3)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                customTemp === 3 ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-stone-700 hover:bg-stone-100'
              }`}
            >
              ❄️ Winter (3°C)
            </button>
          </div>
        </div>
      </div>

      {/* Occasion Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Select Today&rsquo;s Occasion
          </label>
          {isCustomOccasion && customOccasionText.trim() && (
            <span className="text-xs text-roseGold-700 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Custom Occasion Active
            </span>
          )}
        </div>

        {/* 6 Preset Occasions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {OCCASIONS.map((occ) => {
            const isSelected = !isCustomOccasion && selectedOccasion === occ.id;
            return (
              <button
                key={occ.id}
                onClick={() => {
                  setSelectedOccasion(occ.id);
                  setIsCustomOccasion(false);
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-md scale-[1.02]'
                    : 'bg-white text-stone-800 border-stone-200/80 hover:border-stone-300 hover:bg-stone-50/80 shadow-xs'
                }`}
              >
                <div className="text-2xl">{occ.icon}</div>
                <div>
                  <div className="font-medium text-xs sm:text-sm">{occ.label}</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                    {occ.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Occasion Write-in Panel */}
        <div
          className={`rounded-2xl border p-4 sm:p-5 transition-all ${
            isCustomOccasion
              ? 'bg-white border-stone-900 shadow-md ring-1 ring-stone-900'
              : 'bg-[#FAF8F5]/80 border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                  isCustomOccasion ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                <PenLine className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-stone-900">
                  Custom Event or Specific Vibe
                </h4>
                <p className="text-[11px] text-stone-500">
                  Have a specific event? Tell your AI stylist where you are heading.
                </p>
              </div>
            </div>
            {isCustomOccasion && customOccasionText && (
              <button
                type="button"
                onClick={() => {
                  setIsCustomOccasion(false);
                  setCustomOccasionText('');
                }}
                className="text-[11px] text-stone-500 hover:text-stone-900 underline transition-colors self-start sm:self-auto"
              >
                Reset to presets
              </button>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={customOccasionText}
              onChange={(e) => {
                setCustomOccasionText(e.target.value);
                setIsCustomOccasion(true);
              }}
              onFocus={() => {
                if (customOccasionText.trim().length > 0) {
                  setIsCustomOccasion(true);
                }
              }}
              placeholder="e.g. Art gallery opening night, Tech conference keynote, Summer garden wedding..."
              className="w-full px-4 py-3 bg-white rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all pr-10"
            />
            {customOccasionText && (
              <button
                type="button"
                onClick={() => {
                  setCustomOccasionText('');
                  setIsCustomOccasion(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Curated Inspiration Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider mr-1">
              Quick Ideas:
            </span>
            {CUSTOM_INSPIRATIONS.map((chip, idx) => {
              const isChipActive = isCustomOccasion && customOccasionText === chip.text;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCustomOccasionText(chip.text);
                    setIsCustomOccasion(true);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    isChipActive
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Big Generate Action Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || totalClothesCount === 0}
          className="group flex items-center gap-3 px-8 py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-full font-serif text-base sm:text-lg font-medium shadow-luxury active:scale-95 transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-roseGold-400" />
              <span>AI is assembling your curated outfit...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 text-roseGold-400 group-hover:rotate-12 transition-transform" />
              <span>
                {isCustomOccasion && customOccasionText.trim()
                  ? (customOccasionText.trim().length > 28
                      ? `Generate for "${customOccasionText.trim().substring(0, 28)}..."`
                      : `Generate for "${customOccasionText.trim()}"`)
                  : 'Generate Outfit with AI'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Generated Outfit Canvas / Lookbook Presentation */}
      {generatedOutfit && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-float animate-fade-in">
          {/* Header of the Outfit */}
          <div className="px-6 py-6 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF8F5]/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-roseGold-100 text-roseGold-700">
                  {OCCASIONS.find((o) => o.id === generatedOutfit.occasion)?.label || generatedOutfit.occasion}
                </span>
                <span className="text-xs text-stone-500">
                  Tailored for {generatedOutfit.weatherCondition}
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                {generatedOutfit.name}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-300 rounded-full text-xs font-medium text-stone-700 hover:bg-stone-50 shadow-xs active:scale-95 transition-all"
                title="Generate another variant"
              >
                <Shuffle className="w-3.5 h-3.5 text-stone-500" />
                <span>Shuffle Another Look</span>
              </button>

              <button
                onClick={handleSaveToLookbook}
                disabled={isSaved || isSaving}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  isSaved
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-900 text-white hover:bg-stone-800 shadow-sm active:scale-95'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved in Lookbook</span>
                  </>
                ) : isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save to Lookbook</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Canvas (Assembled items) */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {generatedOutfit.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="relative bg-[#FAF8F5] rounded-2xl border border-stone-200/80 p-3 flex flex-col items-center justify-between aspect-[3/4] group hover:border-stone-400 transition-colors shadow-xs"
                  >
                    <span className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">
                      {item.category}
                    </span>

                    <div className="w-full flex-1 flex items-center justify-center p-2 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={getFullImageUrl(item.imageUrl)}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="text-xs text-stone-400 font-serif">Smart Wardrobe</div>
                      )}
                    </div>

                    <div className="w-full text-center">
                      <p className="font-serif text-xs font-medium text-stone-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-stone-500">
                        {item.primaryColor} &bull; {item.style}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Stylist Reasoning & Tips */}
            <div className="lg:col-span-5 space-y-5 bg-[#FAF8F5] p-6 rounded-2xl border border-stone-200/80">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-roseGold-600 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Why This Outfit Works</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                  {generatedOutfit.stylingAdvice}
                </p>
              </div>

              {generatedOutfit.colorPalette && (
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1">
                    Color Harmony Palette
                  </span>
                  <div className="inline-block px-3 py-1 bg-white rounded-full border border-stone-200 text-xs text-stone-800 font-medium">
                    🎨 {generatedOutfit.colorPalette}
                  </div>
                </div>
              )}

              {generatedOutfit.stylingTips && generatedOutfit.stylingTips.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
                    Pro Styling Tips
                  </span>
                  <ul className="space-y-1.5 text-xs text-stone-600">
                    {generatedOutfit.stylingTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-roseGold-500 font-bold">&bull;</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State Help */}
      {totalClothesCount === 0 && (
        <div className="p-8 text-center bg-white rounded-3xl border border-stone-200">
          <p className="text-sm text-stone-600 mb-4">
            In order for the AI engine to compose outfits, the closet needs at least a few pieces (a top, bottoms, and footwear).
          </p>
          <button
            onClick={onNavigateToCloset}
            className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-xs font-semibold hover:bg-stone-800"
          >
            Go to Wardrobe to add clothes
          </button>
        </div>
      )}
    </div>
  );
};

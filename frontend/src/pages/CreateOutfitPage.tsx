import React, { useState } from 'react';
import { 
  Sparkles, 
  Bookmark, 
  Check, 
  Trash2, 
  Search, 
  Shirt, 
  Layers, 
  AlertCircle,
  Palette,
  Sun
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ClothingItem, ClothingCategory, WeatherInfo, Outfit } from '../types/wardrobe';
import { wardrobeApi } from '../api/wardrobeApi';
import { PinterestFlatLayCollage } from '../components/outfit/PinterestFlatLayCollage';
import { getFullImageUrl } from '../utils/imageUtils';

interface CreateOutfitPageProps {
  clothes: ClothingItem[];
  weather: WeatherInfo | null;
  geminiApiKey: string;
  onOutfitSaved: (outfit: Outfit) => void;
  onNavigateToLookbook: () => void;
  onNavigateToCloset: () => void;
}

const CATEGORY_SLOTS: { id: ClothingCategory; label: string; icon: string; optional?: boolean }[] = [
  { id: 'TOPS', label: 'Top or Shirt', icon: '👔' },
  { id: 'BOTTOMS', label: 'Bottom or Pants', icon: '👖' },
  { id: 'DRESSES', label: 'Dress', icon: '👗', optional: true },
  { id: 'SHOES', label: 'Footwear', icon: '👟' },
  { id: 'OUTERWEAR', label: 'Jacket or Coat', icon: '🧥', optional: true },
  { id: 'ACCESSORIES', label: 'Bag or Accessory', icon: '👜', optional: true },
];

const OCCASIONS = [
  { id: 'CASUAL', label: 'Casual Daily', icon: '👟' },
  { id: 'OFFICE', label: 'Office & Work', icon: '💼' },
  { id: 'DATE_NIGHT', label: 'Date Night', icon: '🍷' },
  { id: 'BRUNCH', label: 'Weekend Brunch', icon: '☕' },
  { id: 'PARTY', label: 'Evening Glam', icon: '✨' },
  { id: 'SPORT', label: 'Athleisure & Gym', icon: '🏃‍♀️' },
];

export const CreateOutfitPage: React.FC<CreateOutfitPageProps> = ({
  clothes,
  weather,
  geminiApiKey,
  onOutfitSaved,
  onNavigateToLookbook,
  onNavigateToCloset,
}) => {
  // State for user-selected pieces
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [outfitTitle, setOutfitTitle] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('CASUAL');
  const [customOccasion, setCustomOccasion] = useState('');
  const [isCustomOccasion, setIsCustomOccasion] = useState(false);

  // Wardrobe picker state
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | ClothingCategory | 'FAVORITES'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Review state
  const [isReviewing, setIsReviewing] = useState(false);
  const [aiReview, setAiReview] = useState<{
    explanation: string;
    colorPalette: string;
    stylingTips: string[];
    generatedTitle?: string;
  } | null>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeOccasionLabel = isCustomOccasion && customOccasion.trim()
    ? customOccasion.trim()
    : OCCASIONS.find(o => o.id === selectedOccasion)?.label || selectedOccasion;

  // Toggle item selection
  const handleToggleItem = (item: ClothingItem) => {
    setSelectedItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }

      // If user selects a dress, remove any selected top/bottom for a clean silhouette
      if (item.category === 'DRESSES') {
        const withoutTopsOrBottoms = prev.filter(
          (i) => i.category !== 'TOPS' && i.category !== 'BOTTOMS' && i.category !== 'DRESSES'
        );
        return [...withoutTopsOrBottoms, item];
      }

      // If user selects a top or bottom while a dress is selected, remove the dress
      if (item.category === 'TOPS' || item.category === 'BOTTOMS') {
        const withoutDress = prev.filter((i) => i.category !== 'DRESSES');
        // Replace existing item in the same category for a clean 1-per-slot experience
        const withoutSameCategory = withoutDress.filter((i) => i.category !== item.category);
        return [...withoutSameCategory, item];
      }

      // For shoes or outerwear, replace existing in same category to keep a focused look
      if (item.category === 'SHOES' || item.category === 'OUTERWEAR') {
        const withoutSameCategory = prev.filter((i) => i.category !== item.category);
        return [...withoutSameCategory, item];
      }

      return [...prev, item];
    });

    // Invalidate stale AI review on item modification
    setAiReview(null);
    setSaveSuccess(false);
  };

  const handleRemoveItem = (id: number) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
    setAiReview(null);
    setSaveSuccess(false);
  };

  const handleClearAll = () => {
    setSelectedItems([]);
    setAiReview(null);
    setSaveSuccess(false);
  };

  // AI Stylist Feedback
  const handleAskAiReview = async () => {
    if (selectedItems.length === 0) return;

    setIsReviewing(true);
    try {
      const result = await wardrobeApi.reviewCustomOutfit(
        {
          itemIds: selectedItems.map((i) => i.id),
          title: outfitTitle.trim() || undefined,
          occasion: activeOccasionLabel,
          city: weather?.locationName || 'Timisoara',
          overrideTemperature: weather ? Math.round(weather.temperature) : 20,
        },
        geminiApiKey
      );

      setAiReview({
        explanation: result.stylingAdvice,
        colorPalette: result.colorPalette,
        stylingTips: result.stylingTips || [],
        generatedTitle: result.name,
      });

      if (!outfitTitle.trim() && result.name) {
        setOutfitTitle(result.name);
      }
    } catch (err) {
      console.error(err);
      alert('Could not generate AI styling advice. Local evaluation used.');
    } finally {
      setIsReviewing(false);
    }
  };

  // Save to Lookbook
  const handleSaveToLookbook = async () => {
    if (selectedItems.length === 0) return;

    setIsSaving(true);
    try {
      const weatherSummary = weather 
        ? `${Math.round(weather.temperature)}°C (${weather.condition})` 
        : '21.0°C (Pleasant)';

      const titleToSave = outfitTitle.trim() 
        || aiReview?.generatedTitle 
        || `Curated ${activeOccasionLabel} Look`;

      const adviceToSave = aiReview?.explanation 
        || 'Custom ensemble curated by you in the Smart Wardrobe Studio.';

      const paletteToSave = aiReview?.colorPalette 
        || Array.from(new Set(selectedItems.map((i) => i.primaryColor))).join(' • ');

      const draft: Outfit = {
        name: titleToSave,
        occasion: activeOccasionLabel,
        weatherCondition: weatherSummary,
        stylingAdvice: adviceToSave,
        colorPalette: paletteToSave,
        stylingTips: aiReview?.stylingTips || [
          'Style with confidence and tailored posture.',
          'Consider delicate jewelry accents to complete the silhouette.'
        ],
        favorite: false,
        items: selectedItems,
      };

      const saved = await wardrobeApi.saveOutfit(draft);
      onOutfitSaved(saved);
      setSaveSuccess(true);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#D4AF37', '#E5A9A9', '#1C1917'],
      });
    } catch (err) {
      console.error(err);
      alert('Failed to save outfit to lookbook.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter clothes for right-side drawer
  const filteredClothes = clothes.filter((item) => {
    if (activeCategoryFilter === 'FAVORITES') {
      if (!item.favorite) return false;
    } else if (activeCategoryFilter !== 'ALL') {
      if (item.category !== activeCategoryFilter) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchColor = item.primaryColor.toLowerCase().includes(q);
      const matchSub = (item.subCategory || '').toLowerCase().includes(q);
      const matchStyle = (item.style || '').toLowerCase().includes(q);
      if (!matchName && !matchColor && !matchSub && !matchStyle) return false;
    }

    return true;
  });

  const totalWarmth = selectedItems.length > 0 
    ? Math.round(selectedItems.reduce((acc, i) => acc + (i.warmthLevel || 2), 0) / selectedItems.length) 
    : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-roseGold-500 text-xs font-semibold tracking-widest uppercase mb-1">
            <Palette className="w-4 h-4" />
            <span>Custom Outfit Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Create My Own Look
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-xl">
            Choose individual pieces from your closet to assemble your custom outfit. Get optional AI styling feedback and save your favorite combinations to your Lookbook.
          </p>
        </div>

        {/* Live Weather Capsule */}
        {weather && (
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-stone-200 shadow-sm self-start md:self-auto">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-stone-900">
                {weather.locationName} &bull; {Math.round(weather.temperature)}°C
              </div>
              <div className="text-[11px] text-stone-500">
                {weather.condition}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Outfit Metadata Bar: Name & Occasion */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Custom Name */}
          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-stone-500 mb-1.5">
              Outfit Name
            </label>
            <input
              type="text"
              value={outfitTitle}
              onChange={(e) => setOutfitTitle(e.target.value)}
              placeholder="e.g. Minimalist Parisian Chic, Sunday Brunch..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 text-sm text-stone-900 placeholder-stone-400"
            />
          </div>

          {/* Occasion Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold tracking-wider uppercase text-stone-500">
                Occasion / Vibe
              </label>
              <button
                type="button"
                onClick={() => setIsCustomOccasion(!isCustomOccasion)}
                className="text-xs text-roseGold-500 hover:text-roseGold-600 font-medium"
              >
                {isCustomOccasion ? 'Choose from presets' : 'Type custom occasion'}
              </button>
            </div>

            {isCustomOccasion ? (
              <input
                type="text"
                value={customOccasion}
                onChange={(e) => setCustomOccasion(e.target.value)}
                placeholder="e.g. Art Gallery Opening Night, Rooftop Cocktails..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 text-sm text-stone-900"
              />
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ.id}
                    onClick={() => setSelectedOccasion(occ.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      selectedOccasion === occ.id
                        ? 'bg-stone-900 text-stone-50 shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                    }`}
                  >
                    <span>{occ.icon}</span>
                    <span>{occ.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left Canvas / Right Wardrobe Picker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: THE OUTFIT CANVAS (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-stone-800" />
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  The Look Canvas
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {selectedItems.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
                <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
                  {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            {/* Visual Garment Slots / Assembled Pieces */}
            {selectedItems.length === 0 ? (
              <div className="border-2 border-dashed border-stone-200 rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <Shirt className="w-6 h-6" />
                </div>
                <p className="font-serif font-medium text-stone-800">
                  Your outfit canvas is empty
                </p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Click pieces from your wardrobe on the right to start building your look.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-stone-50/80 rounded-2xl border border-stone-200/80 hover:bg-stone-50 transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-white border border-stone-200/80 overflow-hidden flex items-center justify-center p-1 flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={getFullImageUrl(item.imageUrl)}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Shirt className="w-6 h-6 text-stone-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] tracking-wider uppercase font-semibold text-roseGold-500 block truncate">
                          {item.category} {item.subCategory ? `• ${item.subCategory}` : ''}
                        </span>
                        <h4 className="text-sm font-medium text-stone-900 truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-[11px] text-stone-500">
                            <span 
                              className="w-2 h-2 rounded-full border border-stone-300" 
                              style={{ backgroundColor: item.primaryColor.toLowerCase() }} 
                            />
                            {item.primaryColor}
                          </span>
                          <span className="text-stone-300">&bull;</span>
                          <span className="text-[11px] text-stone-400 capitalize">
                            {item.style.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 flex-shrink-0"
                      title="Remove from outfit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Metrics (Warmth, Palette) */}
            {selectedItems.length > 0 && (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60 space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span className="font-medium">Average Warmth:</span>
                  <span className="font-semibold text-stone-900">
                    Level {totalWarmth} / 5
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span className="font-medium">Color Palette:</span>
                  <div className="flex items-center gap-1.5">
                    {Array.from(new Set(selectedItems.map(i => i.primaryColor))).map((color, idx) => (
                      <span
                        key={idx}
                        className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs"
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Review Card (if requested) */}
            {aiReview && (
              <div className="p-5 bg-stone-900 text-stone-100 rounded-2xl space-y-3 shadow-md">
                <div className="flex items-center gap-2 text-roseGold-300 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Stylist Editorial Feedback</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed font-serif italic">
                  "{aiReview.explanation}"
                </p>
                {aiReview.colorPalette && (
                  <div className="text-[11px] text-stone-400">
                    <span className="text-stone-200 font-medium">Palette:</span> {aiReview.colorPalette}
                  </div>
                )}
                {aiReview.stylingTips && aiReview.stylingTips.length > 0 && (
                  <div className="pt-2 border-t border-stone-800 text-[11px] space-y-1 text-stone-400">
                    <span className="text-stone-300 font-medium block">Pro Tips:</span>
                    {aiReview.stylingTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-roseGold-400">&bull;</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Success Banner */}
            {saveSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Outfit saved to your Lookbook!</span>
                </div>
                <button
                  onClick={onNavigateToLookbook}
                  className="underline font-semibold hover:text-emerald-900"
                >
                  View Lookbook
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleSaveToLookbook}
                disabled={selectedItems.length === 0 || isSaving}
                className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 text-stone-50 hover:bg-stone-800 font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Bookmark className="w-4 h-4 text-roseGold-400" />
                <span>{isSaving ? 'Saving to Lookbook...' : 'Save to Lookbook'}</span>
              </button>

              <button
                onClick={handleAskAiReview}
                disabled={selectedItems.length === 0 || isReviewing}
                className="w-full py-3 px-6 rounded-2xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 font-medium text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3.5 h-3.5 text-roseGold-500" />
                <span>{isReviewing ? 'Analyzing with AI Stylist...' : 'Ask AI Stylist to Review Look'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WARDROBE BROWSER (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Select from Your Closet
                </h3>
                <p className="text-xs text-stone-500">
                  Click any item to add or replace it in your look.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pieces..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-full border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-100 scrollbar-none">
              <button
                onClick={() => setActiveCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategoryFilter === 'ALL'
                    ? 'bg-stone-900 text-stone-50'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                }`}
              >
                All Pieces ({clothes.length})
              </button>

              {CATEGORY_SLOTS.map((slot) => {
                const count = clothes.filter((c) => c.category === slot.id).length;
                return (
                  <button
                    key={slot.id}
                    onClick={() => setActiveCategoryFilter(slot.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                      activeCategoryFilter === slot.id
                        ? 'bg-stone-900 text-stone-50'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                    }`}
                  >
                    <span>{slot.icon}</span>
                    <span>{slot.label} ({count})</span>
                  </button>
                );
              })}

              <button
                onClick={() => setActiveCategoryFilter('FAVORITES')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategoryFilter === 'FAVORITES'
                    ? 'bg-stone-900 text-stone-50'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                }`}
              >
                ★ Favorites
              </button>
            </div>

            {/* Clothes Grid */}
            {filteredClothes.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-sm font-medium text-stone-700">
                  No matching clothing items found
                </p>
                <p className="text-xs text-stone-400">
                  Try adjusting your search query or select another category filter.
                </p>
                {clothes.length === 0 && (
                  <button
                    onClick={onNavigateToCloset}
                    className="text-xs text-roseGold-500 font-semibold underline mt-2"
                  >
                    Go to Wardrobe to add clothes
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredClothes.map((item) => {
                  const isSelected = selectedItems.some((i) => i.id === item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleItem(item)}
                      className={`relative group bg-[#FAF8F5] rounded-2xl p-3 border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-stone-900 ring-2 ring-stone-900 shadow-md bg-stone-50'
                          : 'border-stone-200 hover:border-stone-400 hover:shadow-sm'
                      }`}
                    >
                      {/* Image Canvas */}
                      <div className="w-full aspect-square rounded-xl bg-white flex items-center justify-center p-2 mb-2 overflow-hidden relative">
                        {item.imageUrl ? (
                          <img
                            src={getFullImageUrl(item.imageUrl)}
                            alt={item.name}
                            className="w-full h-full object-contain transition-transform group-hover:scale-105 duration-300"
                          />
                        ) : (
                          <Shirt className="w-8 h-8 text-stone-300" />
                        )}

                        {/* Selected Indicator Pill */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-stone-900 text-stone-50 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <Check className="w-3 h-3 text-roseGold-400" />
                            <span>In Look</span>
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-roseGold-500 block truncate">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-semibold text-stone-900 line-clamp-1 group-hover:text-stone-700">
                          {item.name}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
                          <span className="truncate">{item.primaryColor}</span>
                          <span className="text-[10px] text-stone-400 capitalize">
                            {item.style.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Pinterest-Style White Studio Flat Lay Moodboard */}
      {selectedItems.length >= 2 && (
        <div className="pt-6 border-t border-stone-200/80">
          <PinterestFlatLayCollage
            outfitName={outfitTitle.trim() || aiReview?.generatedTitle || `Custom ${activeOccasionLabel} Look`}
            occasion={activeOccasionLabel}
            weatherCondition={weather ? `${Math.round(weather.temperature)}°C (${weather.condition})` : undefined}
            items={selectedItems}
          />
        </div>
      )}
    </div>
  );
};

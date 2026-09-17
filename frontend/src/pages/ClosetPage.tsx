import React, { useState } from 'react';
import { Search, Heart, Sparkles, Plus, RefreshCw } from 'lucide-react';
import type { ClothingCategory, ClothingItem } from '../types/wardrobe';
import { ClothingCard } from '../components/closet/ClothingCard';

interface ClosetPageProps {
  clothes: ClothingItem[];
  onToggleFavorite: (id: number) => void;
  onDelete: (id: number) => void;
  onOpenAddModal: () => void;
  onSeedDemo: () => void;
  isLoading: boolean;
}

const CATEGORIES: { label: string; value: ClothingCategory | 'ALL' }[] = [
  { label: 'All Collection', value: 'ALL' },
  { label: 'Tops & Shirts', value: 'TOPS' },
  { label: 'Pants & Skirts', value: 'BOTTOMS' },
  { label: 'Dresses', value: 'DRESSES' },
  { label: 'Jackets & Coats', value: 'OUTERWEAR' },
  { label: 'Shoes', value: 'SHOES' },
  { label: 'Bags & Accessories', value: 'ACCESSORIES' },
];

export const ClosetPage: React.FC<ClosetPageProps> = ({
  clothes,
  onToggleFavorite,
  onDelete,
  onOpenAddModal,
  onSeedDemo,
  isLoading,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'ALL'>('ALL');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClothes = clothes.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
      return false;
    }
    if (onlyFavorites && !item.favorite) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchColor = item.primaryColor.toLowerCase().includes(q);
      const matchSub = item.subCategory?.toLowerCase().includes(q) || false;
      if (!matchName && !matchColor && !matchSub) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
            Your Personal Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-semibold mt-1">
            Digital Wardrobe
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-xl">
            Every piece cataloged, analyzed by AI, and styled effortlessly. Never suffer from &ldquo;nothing to wear&rdquo; again.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSeedDemo}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-300 rounded-full text-xs font-medium text-stone-700 hover:bg-stone-50 shadow-xs active:scale-95 transition-all"
            title="Load or reload curated capsule demo collection"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            <span>Load Demo Capsule</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-stone-50 rounded-full text-xs font-semibold hover:bg-stone-800 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Photograph Clothing</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:border-stone-300'
              }`}
            >
              {cat.label}
              {cat.value === 'ALL' ? ` (${clothes.length})` : ''}
            </button>
          ))}
        </div>

        {/* Search & Sub-filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, color (e.g. Camel, Black, Emerald), or cut..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-full border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-roseGold-400 text-stone-800"
            />
          </div>

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              onlyFavorites
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current text-rose-500' : ''}`} />
            <span>Favorites Only</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-stone-500">
          <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-serif">Curating wardrobe pieces...</p>
        </div>
      ) : filteredClothes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredClothes.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8">
          <div className="w-16 h-16 rounded-full bg-roseGold-100 text-roseGold-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-semibold text-stone-900 mb-2">
            No pieces found
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
            {clothes.length === 0
              ? 'Your wardrobe is currently empty. Add photos of your clothes or click below to populate with a 22-piece capsule wardrobe.'
              : 'No items match the currently selected filters.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {clothes.length === 0 && (
              <button
                onClick={onSeedDemo}
                className="px-5 py-2.5 bg-roseGold-50 text-roseGold-700 border border-roseGold-200 rounded-full text-xs font-semibold hover:bg-roseGold-100"
              >
                ✨ Load 22-Piece Capsule Demo
              </button>
            )}
            <button
              onClick={onOpenAddModal}
              className="px-5 py-2.5 bg-stone-900 text-white rounded-full text-xs font-semibold hover:bg-stone-800"
            >
              + Add First Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

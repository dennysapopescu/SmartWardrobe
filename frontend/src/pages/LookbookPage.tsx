import React, { useState } from 'react';
import { BookmarkCheck, Heart, Trash2, Wand2 } from 'lucide-react';
import type { Outfit } from '../types/wardrobe';
import { getFullImageUrl } from '../utils/imageUtils';

interface LookbookPageProps {
  outfits: Outfit[];
  onToggleFavorite: (id: number) => void;
  onDelete: (id: number) => void;
  onNavigateToGenerator: () => void;
}

export const LookbookPage: React.FC<LookbookPageProps> = ({
  outfits,
  onToggleFavorite,
  onDelete,
  onNavigateToGenerator,
}) => {
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const displayedOutfits = outfits.filter((o) => (onlyFavorites ? o.favorite : true));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
            Curated Inspiration
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-semibold mt-1">
            Lookbook & Saved Outfits
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-xl">
            Your favorite AI-generated outfits, styled and saved for effortless morning dressing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              onlyFavorites
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current text-rose-500' : ''}`} />
            <span>Favorites Only</span>
          </button>

          <button
            onClick={onNavigateToGenerator}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-full text-xs font-semibold hover:bg-stone-800 shadow-sm active:scale-95 transition-all"
          >
            <Wand2 className="w-4 h-4 text-roseGold-400" />
            <span>Compose New Outfit</span>
          </button>
        </div>
      </div>

      {/* Grid of Saved Outfits */}
      {displayedOutfits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedOutfits.map((outfit) => (
            <div
              key={outfit.id}
              className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-soft hover:shadow-float transition-all p-6 flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {outfit.occasion}
                      </span>
                      {outfit.weatherCondition && (
                        <span className="text-[11px] text-stone-500">
                          &bull; {outfit.weatherCondition}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-xl font-bold text-stone-900">
                      {outfit.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => outfit.id && onToggleFavorite(outfit.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        outfit.favorite ? 'text-rose-500 bg-rose-50' : 'text-stone-400 hover:text-stone-600'
                      }`}
                      title={outfit.favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-4 h-4 ${outfit.favorite ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => {
                        if (outfit.id && confirm('Are you sure you want to delete this outfit?')) {
                          onDelete(outfit.id);
                        }
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete outfit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Items preview collage */}
                <div className="grid grid-cols-4 gap-2 my-4">
                  {outfit.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="relative bg-[#FAF8F5] rounded-xl border border-stone-200/80 p-2 aspect-[3/4] flex items-center justify-center overflow-hidden group"
                      title={`${item.name} (${item.category})`}
                    >
                      {item.imageUrl ? (
                        <img
                          src={getFullImageUrl(item.imageUrl)}
                          alt={item.name}
                          className="w-full h-full object-contain drop-shadow-xs"
                        />
                      ) : (
                        <span className="text-[10px] text-stone-400 font-serif text-center">
                          {item.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Styling Advice snippet */}
                {outfit.stylingAdvice && (
                  <p className="text-xs text-stone-600 bg-[#FAF8F5] p-3 rounded-xl border border-stone-100 italic line-clamp-2">
                    ✨ &ldquo;{outfit.stylingAdvice}&rdquo;
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                <span>{outfit.items.length} wardrobe pieces</span>
                {outfit.colorPalette && (
                  <span className="truncate max-w-[200px]">🎨 {outfit.colorPalette}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8">
          <div className="w-16 h-16 rounded-full bg-roseGold-100 text-roseGold-600 flex items-center justify-center mx-auto mb-4">
            <BookmarkCheck className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-semibold text-stone-900 mb-2">
            No saved outfits in Lookbook yet
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
            Generate looks in the AI Generator and click &ldquo;Save to Lookbook&rdquo; to store them for quick morning inspiration.
          </p>
          <button
            onClick={onNavigateToGenerator}
            className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-xs font-semibold hover:bg-stone-800 shadow-sm"
          >
            Generate an Outfit Now
          </button>
        </div>
      )}
    </div>
  );
};

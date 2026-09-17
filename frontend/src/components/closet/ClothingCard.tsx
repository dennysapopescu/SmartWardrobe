import React from 'react';
import { Heart, Trash2, Tag } from 'lucide-react';
import type { ClothingItem } from '../../types/wardrobe';
import { getFullImageUrl } from '../../utils/imageUtils';

interface ClothingCardProps {
  item: ClothingItem;
  onToggleFavorite: (id: number) => void;
  onDelete: (id: number) => void;
  onClick?: () => void;
}

export const ClothingCard: React.FC<ClothingCardProps> = ({
  item,
  onToggleFavorite,
  onDelete,
  onClick,
}) => {
  return (
    <div 
      onClick={onClick}
      className="group relative bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-stone-400/80 transition-all duration-300 shadow-soft hover:shadow-float flex flex-col cursor-pointer"
    >
      {/* Top Floating Badges */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-stone-900/80 text-white backdrop-blur-sm shadow-sm">
          {item.category}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          className={`pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 ${
            item.favorite 
              ? 'bg-rose-50 text-rose-500 shadow-sm' 
              : 'bg-white/80 text-stone-400 hover:text-stone-700'
          }`}
          title={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${item.favorite ? 'fill-current text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Image Container with editorial padding */}
      <div className="relative aspect-[3/4] w-full bg-[#FAF8F5] overflow-hidden flex items-center justify-center p-4 group-hover:bg-stone-100/60 transition-colors">
        {item.imageUrl ? (
          <img
            src={getFullImageUrl(item.imageUrl)}
            alt={item.name}
            className="w-full h-full object-contain object-center drop-shadow-sm group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="text-stone-300 flex flex-col items-center gap-2">
            <Tag className="w-12 h-12 stroke-[1.2]" />
            <span className="text-xs font-serif text-stone-400">Smart Wardrobe</span>
          </div>
        )}

        {/* Delete action on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
              onDelete(item.id);
            }
          }}
          className="pointer-events-auto absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 text-stone-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm"
          title="Delete item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Info Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-medium text-stone-600">{item.subCategory || 'Wardrobe Essential'}</span>
            <span className="text-[11px] text-stone-400">{item.style}</span>
          </div>
          <h3 className="font-serif text-stone-900 font-medium text-base line-clamp-1 group-hover:text-roseGold-600 transition-colors">
            {item.name}
          </h3>
        </div>

        {/* Tags footer */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-stone-600">
            <span 
              className="w-2.5 h-2.5 rounded-full border border-stone-300" 
              style={{ backgroundColor: getColorHex(item.primaryColor) }}
            />
            {item.primaryColor}
          </span>

          {/* Warmth indicator dots */}
          <div className="flex items-center gap-0.5" title={`Warmth Rating: ${item.warmthLevel}/5`}>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <span
                key={lvl}
                className={`w-1.5 h-1.5 rounded-full ${
                  lvl <= item.warmthLevel ? 'bg-stone-700' : 'bg-stone-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function getColorHex(colorName: string): string {
  const c = colorName.toLowerCase();
  if (c.includes('white') || c.includes('alb')) return '#FFFFFF';
  if (c.includes('black') || c.includes('negru')) return '#1C1917';
  if (c.includes('beige') || c.includes('camel') || c.includes('cream') || c.includes('ecru') || c.includes('bej')) return '#E8DFD5';
  if (c.includes('blue') || c.includes('denim') || c.includes('navy') || c.includes('indigo')) return '#1E3A8A';
  if (c.includes('grey') || c.includes('gray')) return '#9CA3AF';
  if (c.includes('green') || c.includes('emerald') || c.includes('olive') || c.includes('khaki')) return '#065F46';
  if (c.includes('red') || c.includes('burgundy') || c.includes('bordeaux')) return '#991B1B';
  if (c.includes('brown') || c.includes('cognac')) return '#78350F';
  if (c.includes('pink') || c.includes('nude') || c.includes('blush')) return '#FBCFE8';
  if (c.includes('gold')) return '#D97706';
  return '#D5C4B1';
}

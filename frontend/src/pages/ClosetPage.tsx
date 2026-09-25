import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Heart, Sparkles, Plus, RefreshCw, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ClothingCategory, ClothingItem, PageResponse } from '../types/wardrobe';
import { ClothingCard } from '../components/closet/ClothingCard';
import { wardrobeApi } from '../api/wardrobeApi';

interface ClosetPageProps {
  onOpenAddModal: () => void;
  onSeedDemo?: () => void;
  onItemsChanged?: () => void;
  refreshSignal?: number;
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
  onOpenAddModal,
  onSeedDemo,
  onItemsChanged,
  refreshSignal = 0,
}) => {
  const [pageData, setPageData] = useState<PageResponse<ClothingItem> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'ALL'>('ALL');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value.trim());
      setCurrentPage(0);
    }, 350);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setCurrentPage(0);
  };

  const loadPage = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const data = await wardrobeApi.getClothes({
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        search: debouncedSearch || undefined,
        favorite: onlyFavorites ? true : undefined,
        page: page,
        size: 12,
        sort: 'id,desc',
      });
      setPageData(data);
      setCurrentPage(data.pageNumber);
    } catch (error) {
      console.error('Failed to load clothes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, debouncedSearch, onlyFavorites]);

  // Reload when filters or refreshSignal changes
  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage, selectedCategory, debouncedSearch, onlyFavorites, refreshSignal]);

  const handleCategoryChange = (category: ClothingCategory | 'ALL') => {
    setSelectedCategory(category);
    setCurrentPage(0);
  };

  const handleToggleFavoritesFilter = () => {
    setOnlyFavorites((prev) => !prev);
    setCurrentPage(0);
  };

  const handleToggleFavoriteItem = async (id: number) => {
    try {
      const updated = await wardrobeApi.toggleFavoriteClothing(id);
      if (pageData) {
        setPageData({
          ...pageData,
          content: pageData.content.map((item) => (item.id === id ? updated : item)),
        });
      }
      onItemsChanged?.();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await wardrobeApi.deleteClothing(id);
      const nextPage = pageData && pageData.content.length === 1 && currentPage > 0
        ? currentPage - 1
        : currentPage;
      await loadPage(nextPage);
      onItemsChanged?.();
    } catch (error) {
      console.error('Failed to delete clothing item:', error);
    }
  };

  const handleSeedCapsule = async () => {
    setIsSeeding(true);
    try {
      if (onSeedDemo) {
        await onSeedDemo();
      } else {
        await wardrobeApi.resetAndSeedDemo();
      }
      setCurrentPage(0);
      await loadPage(0);
      onItemsChanged?.();
    } catch (error) {
      console.error('Failed to seed demo capsule:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  const clothes = pageData?.content || [];
  const totalElements = pageData?.totalElements || 0;
  const totalPages = pageData?.totalPages || 0;

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
            Every piece cataloged, analyzed by AI, and styled effortlessly. Isolated to your private account with instant pagination.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedCapsule}
            disabled={isSeeding || isLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-300 rounded-full text-xs font-medium text-stone-700 hover:bg-stone-50 shadow-xs active:scale-95 transition-all disabled:opacity-50"
            title="Load or reload curated capsule demo collection"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${isSeeding ? 'animate-spin' : ''}`} />
            <span>{isSeeding ? 'Seeding...' : 'Load Demo Capsule'}</span>
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
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:border-stone-300'
              }`}
            >
              {cat.label}
              {cat.value === 'ALL' && totalElements > 0 ? ` (${totalElements})` : ''}
            </button>
          ))}
        </div>

        {/* Search & Sub-filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, color (e.g. Camel, Silk, Emerald), or style..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-white rounded-full border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-roseGold-400 text-stone-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={handleToggleFavoritesFilter}
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
        <div className="py-24 text-center text-stone-500">
          <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-serif">Curating wardrobe pieces...</p>
        </div>
      ) : clothes.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {clothes.map((item) => (
              <ClothingCard
                key={item.id}
                item={item}
                onToggleFavorite={handleToggleFavoriteItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && pageData && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-200/80">
              <div className="text-xs text-stone-500">
                Showing{' '}
                <span className="font-semibold text-stone-800">
                  {pageData.pageNumber * pageData.pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-stone-800">
                  {Math.min((pageData.pageNumber + 1) * pageData.pageSize, pageData.totalElements)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-stone-800">{pageData.totalElements}</span> items
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0 || isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-stone-200 bg-white text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i).map((p) => {
                  const isCurrent = p === currentPage;
                  if (
                    p === 0 ||
                    p === totalPages - 1 ||
                    (p >= currentPage - 1 && p <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        disabled={isLoading}
                        className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                          isCurrent
                            ? 'bg-stone-900 text-white shadow-sm'
                            : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {p + 1}
                      </button>
                    );
                  } else if (p === currentPage - 2 || p === currentPage + 2) {
                    return (
                      <span key={p} className="text-xs text-stone-400 px-1">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1 || isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-stone-200 bg-white text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
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
            {debouncedSearch || selectedCategory !== 'ALL' || onlyFavorites
              ? 'No items match the currently selected search or filters.'
              : 'Your wardrobe is currently empty. Add photos of your clothes or load the 22-piece curated capsule collection.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {totalElements === 0 && !debouncedSearch && selectedCategory === 'ALL' && !onlyFavorites && (
              <button
                onClick={handleSeedCapsule}
                disabled={isSeeding}
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

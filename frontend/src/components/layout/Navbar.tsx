import React from 'react';
import { Sparkles, Plus, Shirt, Wand2, BookmarkCheck, Settings } from 'lucide-react';
import type { WeatherInfo } from '../../types/wardrobe';

interface NavbarProps {
  activeTab: 'closet' | 'generator' | 'lookbook' | 'settings';
  setActiveTab: (tab: 'closet' | 'generator' | 'lookbook' | 'settings') => void;
  onOpenAddModal: () => void;
  weather: WeatherInfo | null;
  itemCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  weather,
  itemCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand / Logo */}
          <div 
            onClick={() => setActiveTab('closet')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-roseGold-400" />
            </div>
            <div>
              <span className="font-serif text-2xl tracking-wide font-semibold text-stone-900 block leading-tight">
                Smart Wardrobe
              </span>
              <span className="text-[11px] tracking-widest uppercase text-stone-500 font-medium">
                AI Outfit Studio &bull; {itemCount} items
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-stone-200/50 p-1.5 rounded-full border border-stone-300/40">
            <button
              onClick={() => setActiveTab('closet')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'closet'
                  ? 'bg-stone-900 text-stone-50 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Shirt className="w-4 h-4" />
              Wardrobe
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'generator'
                  ? 'bg-stone-900 text-stone-50 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Wand2 className="w-4 h-4 text-roseGold-400" />
              AI Generator
            </button>

            <button
              onClick={() => setActiveTab('lookbook')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'lookbook'
                  ? 'bg-stone-900 text-stone-50 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              Lookbook
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-stone-900 text-stone-50 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
              title="Settings & Gemini Key"
            >
              <Settings className="w-4 h-4" />
            </button>
          </nav>

          {/* Right Action: Weather Capsule + Add Button */}
          <div className="flex items-center gap-3">
            {weather && (
              <div 
                onClick={() => setActiveTab('generator')}
                className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 bg-white rounded-full border border-stone-200 shadow-sm text-xs text-stone-700 cursor-pointer hover:border-roseGold-400 transition-colors"
                title={weather.clothingAdvice}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-stone-900">{weather.locationName}</span>
                <span className="text-stone-400">&bull;</span>
                <span className="font-medium text-stone-800">{Math.round(weather.temperature)}°C</span>
                <span className="text-stone-500">{weather.condition}</span>
              </div>
            )}

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-stone-50 rounded-full text-sm font-medium hover:bg-stone-800 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Clothing</span>
            </button>
          </div>
        </div>

        {/* Mobile bottom navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-stone-200/70">
          <button
            onClick={() => setActiveTab('closet')}
            className={`flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-lg ${
              activeTab === 'closet' ? 'text-stone-900 font-semibold' : 'text-stone-500'
            }`}
          >
            <Shirt className="w-5 h-5" />
            <span>Wardrobe</span>
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-lg ${
              activeTab === 'generator' ? 'text-roseGold-600 font-semibold' : 'text-stone-500'
            }`}
          >
            <Wand2 className="w-5 h-5" />
            <span>Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('lookbook')}
            className={`flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-lg ${
              activeTab === 'lookbook' ? 'text-stone-900 font-semibold' : 'text-stone-500'
            }`}
          >
            <BookmarkCheck className="w-5 h-5" />
            <span>Lookbook</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-lg ${
              activeTab === 'settings' ? 'text-stone-900 font-semibold' : 'text-stone-500'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};

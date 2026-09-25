import React from 'react';
import { Sparkles, Plus, Shirt, Wand2, BookmarkCheck, Settings, Palette, LogIn, LogOut } from 'lucide-react';
import type { WeatherInfo } from '../../types/wardrobe';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  activeTab: 'closet' | 'generator' | 'create' | 'lookbook' | 'settings';
  setActiveTab: (tab: 'closet' | 'generator' | 'create' | 'lookbook' | 'settings') => void;
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
  const { user, openAuthModal, logout } = useAuth();

  return (
    <>
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            {/* Brand / Logo */}
            <div 
              onClick={() => setActiveTab('closet')} 
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-roseGold-400" />
              </div>
              <div>
                <span className="font-serif text-lg sm:text-2xl tracking-tight font-semibold text-stone-900 block leading-tight whitespace-nowrap">
                  Smart Wardrobe
                </span>
                <span className="text-[10px] sm:text-[11px] tracking-wider uppercase text-stone-500 font-medium block">
                  Studio &bull; {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            {/* Desktop Center Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 bg-stone-200/50 p-1.5 rounded-full border border-stone-300/40 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('closet')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 xl:px-4 xl:py-2 rounded-full text-xs xl:text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === 'closet'
                    ? 'bg-stone-900 text-stone-50 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Shirt className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                <span>Wardrobe</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('generator')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 xl:px-4 xl:py-2 rounded-full text-xs xl:text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === 'generator'
                    ? 'bg-stone-900 text-stone-50 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-roseGold-400" />
                <span>AI Generator</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 xl:px-4 xl:py-2 rounded-full text-xs xl:text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === 'create'
                    ? 'bg-stone-900 text-stone-50 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Palette className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-roseGold-400" />
                <span>Create My Own</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('lookbook')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 xl:px-4 xl:py-2 rounded-full text-xs xl:text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === 'lookbook'
                    ? 'bg-stone-900 text-stone-50 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                <span>Lookbook</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-full text-xs xl:text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === 'settings'
                    ? 'bg-stone-900 text-stone-50 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
                title="Settings & Key"
              >
                <Settings className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
              </button>
            </nav>

            {/* Right Action: Weather Capsule + Add Button + Auth */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {weather && (
                <div 
                  onClick={() => setActiveTab('generator')}
                  className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-stone-200 shadow-2xs text-xs text-stone-700 cursor-pointer hover:border-roseGold-400 transition-colors shrink-0 whitespace-nowrap"
                  title={weather.clothingAdvice}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-stone-900">{weather.locationName}</span>
                  <span className="text-stone-400">&bull;</span>
                  <span className="font-medium text-stone-800">{Math.round(weather.temperature)}°C</span>
                </div>
              )}

              <button
                type="button"
                onClick={onOpenAddModal}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 text-stone-50 rounded-full text-xs font-medium hover:bg-stone-800 active:scale-95 transition-all shadow-xs shrink-0 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>

              <button
                type="button"
                onClick={onOpenAddModal}
                className="sm:hidden p-2 bg-stone-900 text-stone-50 rounded-full hover:bg-stone-800 active:scale-95 transition-all shadow-xs shrink-0"
                title="Add Clothing Item"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Auth Session / Profile Badge */}
              {user ? (
                <div className="flex items-center gap-1 pl-1.5 sm:pl-2 border-l border-stone-200 shrink-0">
                  <button
                    type="button"
                    onClick={openAuthModal}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-stone-800 text-xs font-medium transition-all shrink-0"
                    title={`Logged in as ${user.email}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-roseGold-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="max-w-[70px] xl:max-w-[100px] truncate hidden md:inline text-xs">
                      {user.fullName || user.email}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    title="Sign out"
                    className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-200/80 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors border border-stone-300/40 shrink-0 whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile/Tablet Fixed Bottom Tab Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-stone-200/80 shadow-lg px-2 py-1.5 flex items-center justify-around">
        <button
          type="button"
          onClick={() => setActiveTab('closet')}
          className={`flex flex-col items-center gap-0.5 text-[11px] py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'closet' ? 'text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Shirt className="w-4 h-4" />
          <span>Closet</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('generator')}
          className={`flex flex-col items-center gap-0.5 text-[11px] py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'generator' ? 'text-roseGold-600 font-semibold' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>Generator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`flex flex-col items-center gap-0.5 text-[11px] py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'create' ? 'text-roseGold-600 font-semibold' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Create</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lookbook')}
          className={`flex flex-col items-center gap-0.5 text-[11px] py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'lookbook' ? 'text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Lookbook</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-0.5 text-[11px] py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'settings' ? 'text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </nav>
    </>
  );
};

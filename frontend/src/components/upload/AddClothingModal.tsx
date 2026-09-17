import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Sparkles, Loader2, Wand2, Check } from 'lucide-react';
import type { ClothingCategory, ClothingItem } from '../../types/wardrobe';
import { wardrobeApi } from '../../api/wardrobeApi';
import { removeLightBackground } from '../../utils/imageUtils';

interface AddClothingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (item: ClothingItem) => void;
  geminiApiKey: string;
}

export const AddClothingModal: React.FC<AddClothingModalProps> = ({
  isOpen,
  onClose,
  onItemAdded,
  geminiApiKey,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiNotes, setAiNotes] = useState<string>('');

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('TOPS');
  const [subCategory, setSubCategory] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [style, setStyle] = useState('CASUAL');
  const [season, setSeason] = useState('ALL_SEASON');
  const [warmthLevel, setWarmthLevel] = useState(2);
  const [favorite, setFavorite] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Auto trigger AI analysis right away for maximum wow-factor!
    runAiAnalysis(file);
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;
    setIsProcessingBg(true);
    try {
      const cleaned = await removeLightBackground(selectedFile, 35);
      setSelectedFile(cleaned);
      setPreviewUrl(URL.createObjectURL(cleaned));
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingBg(false);
    }
  };

  const runAiAnalysis = async (fileToAnalyze: File) => {
    setIsAnalyzingAi(true);
    try {
      const result = await wardrobeApi.analyzeClothingWithAi(fileToAnalyze, geminiApiKey);
      if (result.name) setName(result.name);
      if (result.category) setCategory(result.category);
      if (result.subCategory) setSubCategory(result.subCategory);
      if (result.primaryColor) setPrimaryColor(result.primaryColor);
      if (result.style) setStyle(result.style);
      if (result.season) setSeason(result.season);
      if (result.warmthLevel) setWarmthLevel(result.warmthLevel);
      if (result.analysisNotes) setAiNotes(result.analysisNotes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !primaryColor.trim()) {
      alert('Please fill in at least the item name and dominant color.');
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl: string | undefined = previewUrl.startsWith('http') ? previewUrl : undefined;

      if (selectedFile) {
        try {
          const uploadRes = await wardrobeApi.uploadImage(selectedFile);
          finalImageUrl = uploadRes.imageUrl;
        } catch (uploadErr) {
          console.warn('Direct upload failed, trying base64 fallback:', uploadErr);
          if (previewUrl.startsWith('data:image')) {
            finalImageUrl = previewUrl;
          }
        }
      } else if (previewUrl.startsWith('data:image')) {
        finalImageUrl = previewUrl;
      }

      const itemData = {
        name: name.trim(),
        category,
        subCategory: subCategory.trim() || undefined,
        primaryColor: primaryColor.trim(),
        style,
        season,
        warmthLevel,
        favorite,
        imageUrl: finalImageUrl,
      };

      const saved = await wardrobeApi.createClothingItemJson(itemData);
      onItemAdded(saved);
      onClose();
      resetForm();
    } catch (error) {
      console.error(error);
      alert('An error occurred while saving the clothing item.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setName('');
    setCategory('TOPS');
    setSubCategory('');
    setPrimaryColor('');
    setStyle('CASUAL');
    setSeason('ALL_SEASON');
    setWarmthLevel(2);
    setAiNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-roseGold-100 text-roseGold-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-stone-900">
                Add Clothing to Wardrobe
              </h2>
              <p className="text-xs text-stone-500">
                Snap a photo or upload &bull; AI auto-detects cuts, style, and palette
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload Area */}
          <div>
            {!previewUrl ? (
              <div className="border-2 border-dashed border-stone-200 hover:border-roseGold-400 rounded-2xl p-8 text-center bg-[#FAF8F5] transition-colors flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-600">
                  <Upload className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-800">
                    Drag and drop your clothing photo or browse device
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Supports PNG, JPG, WEBP taken on a bed, hanger, or flat surface
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white rounded-full border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50 shadow-sm"
                  >
                    Browse Files
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-full text-xs font-medium hover:bg-stone-800 shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Take Photo
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200">
                <div className="relative w-40 h-48 bg-white rounded-xl overflow-hidden flex items-center justify-center border border-stone-200/80 p-2 shadow-sm">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  {isProcessingBg && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center flex-col gap-1 text-xs text-stone-600">
                      <Loader2 className="w-5 h-5 animate-spin text-roseGold-500" />
                      <span>Removing background...</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2.5 w-full">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleRemoveBackground}
                      disabled={isProcessingBg}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-roseGold-500" />
                      {isProcessingBg ? 'Processing...' : 'Remove Background (Client AI)'}
                    </button>

                    <button
                      type="button"
                      onClick={() => selectedFile && runAiAnalysis(selectedFile)}
                      disabled={isAnalyzingAi}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-roseGold-50 border border-roseGold-200 rounded-lg text-xs font-medium text-roseGold-700 hover:bg-roseGold-100 transition-colors shadow-xs"
                    >
                      {isAnalyzingAi ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5" />
                      )}
                      Re-detect with AI
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                      }}
                      className="px-3 py-1.5 text-xs text-stone-500 hover:text-red-500"
                    >
                      Change Photo
                    </button>
                  </div>

                  {aiNotes && (
                    <div className="p-2.5 bg-white rounded-xl border border-stone-200 text-xs text-stone-600 italic">
                      ✨ {aiNotes}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Structured Oversized Linen Blazer"
                required
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-roseGold-400"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ClothingCategory)}
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-roseGold-400"
              >
                <option value="TOPS">Tops & Shirts</option>
                <option value="BOTTOMS">Pants & Skirts</option>
                <option value="DRESSES">Dresses</option>
                <option value="OUTERWEAR">Jackets, Blazers & Coats</option>
                <option value="SHOES">Shoes & Footwear</option>
                <option value="ACCESSORIES">Bags & Accessories</option>
              </select>
            </div>

            {/* SubCategory */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                Sub-Category / Cut
              </label>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="e.g. Blazer, Mom Jeans, Slip Dress"
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-roseGold-400"
              />
            </div>

            {/* Primary Color */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                Primary Color *
              </label>
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="e.g. Warm Camel, Jet Black, Emerald"
                required
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-roseGold-400"
              />
            </div>

            {/* Style */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                Style Aesthetics
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-roseGold-400"
              >
                <option value="CASUAL">Casual Daily</option>
                <option value="OFFICE">Office & Smart Casual</option>
                <option value="ELEGANT">Elegant & Romantic</option>
                <option value="STREETWEAR">Streetwear & Modern</option>
                <option value="PARTY">Evening Glam & Cocktail</option>
                <option value="SPORTY">Sport & Athleisure</option>
              </select>
            </div>

            {/* Season */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                Season
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-roseGold-400"
              >
                <option value="ALL_SEASON">All-Season (Capsule Essential)</option>
                <option value="SPRING">Spring</option>
                <option value="SUMMER">Summer</option>
                <option value="FALL">Fall</option>
                <option value="WINTER">Winter</option>
              </select>
            </div>

            {/* Warmth Level */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Warmth Rating
                </label>
                <span className="text-xs text-stone-500 font-medium">
                  {warmthLevel}/5 {warmthLevel === 1 ? '(Ultra Lightweight)' : warmthLevel >= 4 ? '(Heavy Warmth)' : '(Moderate)'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={warmthLevel}
                onChange={(e) => setWarmthLevel(parseInt(e.target.value))}
                className="w-full accent-stone-900 cursor-pointer"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
                className="rounded text-roseGold-500 focus:ring-roseGold-400 w-4 h-4"
              />
              Mark as wardrobe favorite
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-semibold shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save to Wardrobe</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useRef, useState } from 'react';
import { Download, Sparkles, Check } from 'lucide-react';
import type { ClothingItem } from '../../types/wardrobe';
import { getFullImageUrl } from '../../utils/imageUtils';

interface PinterestFlatLayCollageProps {
  outfitName: string;
  occasion: string;
  weatherCondition?: string;
  items: ClothingItem[];
}

export const PinterestFlatLayCollage: React.FC<PinterestFlatLayCollageProps> = ({
  outfitName,
  occasion,
  weatherCondition,
  items,
}) => {
  const collageRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Group items by category
  const outerwear = items.find((i) => i.category === 'OUTERWEAR');
  const dress = items.find((i) => i.category === 'DRESSES');
  const top = items.find((i) => i.category === 'TOPS');
  const bottom = items.find((i) => i.category === 'BOTTOMS');
  const shoes = items.find((i) => i.category === 'SHOES');
  const accessories = items.filter((i) => i.category === 'ACCESSORIES');

  // Palette colors
  const uniqueColors = Array.from(new Set(items.map((i) => i.primaryColor).filter(Boolean)));

  // Generate downloadable high-res Pinterest collage on canvas
  const handleDownloadCollage = async () => {
    if (items.length === 0) return;
    setIsDownloading(true);

    try {
      const width = 1200;
      const height = 1500;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas not supported');
      }

      // 1. Pristine White Studio Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Subtle editorial inner border
      ctx.strokeStyle = '#F0EDE8';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      // 2. Editorial Header
      ctx.textAlign = 'center';
      ctx.fillStyle = '#8C827A';
      ctx.font = '600 18px sans-serif';
      ctx.letterSpacing = '6px';
      ctx.fillText('SMART WARDROBE • EDITORIAL FLAT LAY', width / 2, 100);

      ctx.fillStyle = '#1C1917';
      ctx.font = 'bold 42px serif';
      ctx.letterSpacing = '1px';
      ctx.fillText(outfitName || 'Curated Ensemble', width / 2, 155);

      ctx.fillStyle = '#A8A29E';
      ctx.font = '500 18px sans-serif';
      ctx.letterSpacing = '2px';
      const subtitle = [occasion, weatherCondition].filter(Boolean).join(' • ').toUpperCase();
      ctx.fillText(subtitle, width / 2, 195);

      // Decorative divider
      ctx.strokeStyle = '#E7E5E4';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 80, 220);
      ctx.lineTo(width / 2 + 80, 220);
      ctx.stroke();

      // Helper to load image
      const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Image load failed'));
          img.src = url;
        });
      };

      // 3. Draw Clothing Items in Aesthetic Flat Lay Positions
      // Depending on whether it's a Dress look or Top+Bottom look:
      const drawPromises = items.map(async (item) => {
        if (!item.imageUrl) return;

        try {
          const img = await loadImage(getFullImageUrl(item.imageUrl));

          // Define target slots (x, y, w, h)
          let x = 0, y = 0, w = 320, h = 380;

          if (dress) {
            // DRESS LAYOUT
            if (item.category === 'DRESSES') {
              x = width / 2 - 190;
              y = 280;
              w = 380;
              h = 580;
            } else if (item.category === 'OUTERWEAR') {
              x = 100;
              y = 300;
              w = 320;
              h = 420;
            } else if (item.category === 'SHOES') {
              x = width / 2 - 140;
              y = 900;
              w = 280;
              h = 300;
            } else {
              x = width - 420;
              y = 360;
              w = 260;
              h = 280;
            }
          } else {
            // TOP + BOTTOM LAYOUT
            if (item.category === 'TOPS') {
              x = width / 2 - 170;
              y = 260;
              w = 340;
              h = 360;
            } else if (item.category === 'BOTTOMS') {
              x = width / 2 - 160;
              y = 600;
              w = 320;
              h = 440;
            } else if (item.category === 'OUTERWEAR') {
              x = 100;
              y = 280;
              w = 320;
              h = 420;
            } else if (item.category === 'SHOES') {
              x = width - 420;
              y = 860;
              w = 300;
              h = 320;
            } else {
              x = width - 380;
              y = 340;
              w = 240;
              h = 260;
            }
          }

          // Soft realistic drop shadow under garment
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
          ctx.shadowBlur = 30;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 16;

          // Preserve aspect ratio inside slot box
          const ratio = Math.min(w / img.width, h / img.height);
          const dw = img.width * ratio;
          const dh = img.height * ratio;
          const dx = x + (w - dw) / 2;
          const dy = y + (h - dh) / 2;

          ctx.drawImage(img, dx, dy, dw, dh);
          ctx.restore();

          // Small subtle caption under item
          ctx.fillStyle = '#A8A29E';
          ctx.font = '500 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(item.name, dx + dw / 2, dy + dh + 18);
        } catch {
          // If CORS fails, skip individual image gracefully
        }
      });

      await Promise.allSettled(drawPromises);

      // 4. Editorial Footer: Color Harmony Dots + Branding
      const footerY = height - 90;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#78716C';
      ctx.font = '600 14px sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('COLOR PALETTE HARMONY', width / 2, footerY - 25);

      // Draw color dots
      const dotSpacing = 28;
      const startX = width / 2 - ((uniqueColors.length - 1) * dotSpacing) / 2;
      uniqueColors.forEach((color, i) => {
        const cx = startX + i * dotSpacing;
        const cy = footerY;
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fillStyle = color.toLowerCase();
        ctx.fill();
        ctx.strokeStyle = '#D6D3D1';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      ctx.fillStyle = '#A8A29E';
      ctx.font = '400 12px sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('SMART WARDROBE STUDIO • PINTEREST FLAT LAY', width / 2, height - 55);

      // 5. Trigger PNG Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${(outfitName || 'outfit').toLowerCase().replace(/[^a-z0-9]/g, '-')}-flatlay.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download collage error:', err);
      alert('Could not export high-res PNG. Right click on the collage to save directly.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4 pt-6">
      {/* Section Title & Download Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-roseGold-500 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pinterest Flat Lay Aesthetic</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
            Outfit Flat Lay Moodboard
          </h3>
          <p className="text-xs text-stone-500">
            Pristine white studio layout styled like high-fashion editorial flat lays on Pinterest.
          </p>
        </div>

        <button
          onClick={handleDownloadCollage}
          disabled={isDownloading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-300 rounded-full text-xs font-semibold text-stone-900 hover:bg-stone-50 hover:border-stone-900 shadow-xs active:scale-95 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Collage Downloaded!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-roseGold-500" />
              <span>{isDownloading ? 'Rendering 1200x1500px...' : 'Download Pinterest Card (PNG)'}</span>
            </>
          )}
        </button>
      </div>

      {/* THE PINTEREST FLAT LAY BOARD (White Studio Canvas) */}
      <div
        ref={collageRef}
        className="w-full bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-12 relative overflow-hidden flex flex-col justify-between"
      >
        {/* Subtle Decorative Background Frame */}
        <div className="absolute inset-4 sm:inset-6 border border-stone-100 rounded-2xl pointer-events-none" />

        {/* Minimalist Header */}
        <div className="text-center relative z-10 space-y-1 mb-8">
          <span className="text-[10px] tracking-[0.3em] uppercase font-semibold text-stone-400 block">
            Smart Wardrobe &bull; Editorial Flat Lay
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            {outfitName || 'Curated Ensemble'}
          </h2>
          <div className="flex items-center justify-center gap-2 text-[11px] tracking-widest uppercase font-medium text-stone-500">
            <span>{occasion}</span>
            {weatherCondition && (
              <>
                <span>&bull;</span>
                <span>{weatherCondition}</span>
              </>
            )}
          </div>
          <div className="w-16 h-px bg-stone-200 mx-auto mt-3" />
        </div>

        {/* Dynamic Organic Flat Lay Composition */}
        <div className="relative z-10 my-4 min-h-[460px] sm:min-h-[560px] flex items-center justify-center">
          {dress ? (
            // DRESS COMPOSITION: Central dress flanked by outerwear and accessories
            <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {outerwear && (
                <div className="md:col-span-4 flex flex-col items-center">
                  <div className="w-44 sm:w-56 h-56 sm:h-72 flex items-center justify-center p-2">
                    <img
                      src={getFullImageUrl(outerwear.imageUrl)}
                      alt={outerwear.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_16px_24px_rgba(0,0,0,0.08)] hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[11px] text-stone-500 font-serif text-center mt-2 max-w-[180px] truncate">
                    {outerwear.name}
                  </span>
                </div>
              )}

              <div className={`${outerwear ? 'md:col-span-5' : 'md:col-span-7'} flex flex-col items-center`}>
                <div className="w-52 sm:w-64 h-64 sm:h-80 flex items-center justify-center p-2">
                  <img
                    src={getFullImageUrl(dress.imageUrl)}
                    alt={dress.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.09)] hover:scale-105 transition-transform"
                  />
                </div>
                <span className="text-xs font-medium text-stone-900 font-serif text-center mt-2 max-w-[220px] truncate">
                  {dress.name}
                </span>
              </div>

              <div className="md:col-span-3 flex flex-col items-center gap-6">
                {accessories.map((acc, idx) => (
                  <div key={acc.id || idx} className="flex flex-col items-center">
                    <div className="w-24 sm:w-32 h-24 sm:h-32 flex items-center justify-center p-1">
                      <img
                        src={getFullImageUrl(acc.imageUrl)}
                        alt={acc.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.07)] hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 font-serif text-center mt-1 max-w-[160px] truncate">
                      {acc.name}
                    </span>
                  </div>
                ))}

                {shoes && (
                  <div className="flex flex-col items-center">
                    <div className="w-32 sm:w-40 h-32 sm:h-40 flex items-center justify-center p-1">
                      <img
                        src={getFullImageUrl(shoes.imageUrl)}
                        alt={shoes.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_14px_20px_rgba(0,0,0,0.08)] hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[11px] text-stone-500 font-serif text-center mt-1 max-w-[160px] truncate">
                      {shoes.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // TOP + BOTTOM COMPOSITION: Balanced studio flat lay
            <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
              {/* Outerwear on Left */}
              {outerwear && (
                <div className="md:col-span-3 flex flex-col items-center">
                  <span className="text-[9px] uppercase tracking-widest font-semibold text-roseGold-500 mb-1">
                    Outerwear Layer
                  </span>
                  <div className="w-40 sm:w-48 h-48 sm:h-56 flex items-center justify-center p-1">
                    <img
                      src={getFullImageUrl(outerwear.imageUrl)}
                      alt={outerwear.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.08)] hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[11px] text-stone-500 font-serif text-center mt-2 max-w-[180px] truncate">
                    {outerwear.name}
                  </span>
                </div>
              )}

              {/* Core: Top + Bottom Center Alignment */}
              <div className={`${outerwear ? 'md:col-span-6' : 'md:col-span-8'} flex flex-col items-center gap-6`}>
                {top && (
                  <div className="flex flex-col items-center">
                    <div className="w-44 sm:w-56 h-44 sm:h-56 flex items-center justify-center p-1">
                      <img
                        src={getFullImageUrl(top.imageUrl)}
                        alt={top.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.08)] hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-xs font-medium text-stone-900 font-serif text-center mt-1.5 max-w-[200px] truncate">
                      {top.name}
                    </span>
                  </div>
                )}

                {bottom && (
                  <div className="flex flex-col items-center">
                    <div className="w-44 sm:w-56 h-44 sm:h-56 flex items-center justify-center p-1">
                      <img
                        src={getFullImageUrl(bottom.imageUrl)}
                        alt={bottom.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.08)] hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-xs font-medium text-stone-900 font-serif text-center mt-1.5 max-w-[200px] truncate">
                      {bottom.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Accessories & Footwear on Right */}
              <div className="md:col-span-3 flex flex-col items-center gap-6">
                {accessories.map((acc, idx) => (
                  <div key={acc.id || idx} className="flex flex-col items-center">
                    <div className="w-28 sm:w-32 h-28 sm:h-32 flex items-center justify-center p-1">
                      <img
                        src={getFullImageUrl(acc.imageUrl)}
                        alt={acc.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.07)] hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 font-serif text-center mt-1 max-w-[160px] truncate">
                      {acc.name}
                    </span>
                  </div>
                ))}

                {shoes && (
                  <div className="flex flex-col items-center">
                    <div className="w-32 sm:w-40 h-32 sm:h-40 flex items-center justify-center p-1">
                      <img
                        src={getFullImageUrl(shoes.imageUrl)}
                        alt={shoes.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.08)] hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[11px] text-stone-500 font-serif text-center mt-1 max-w-[160px] truncate">
                      {shoes.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Minimalist Editorial Footer */}
        <div className="pt-8 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-stone-400">
              Color Harmony:
            </span>
            <div className="flex items-center gap-1.5">
              {uniqueColors.map((color, idx) => (
                <span
                  key={idx}
                  className="w-3 h-3 rounded-full border border-stone-300 shadow-2xs inline-block"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="text-[10px] tracking-widest uppercase font-medium text-stone-400">
            Smart Wardrobe Studio &bull; Curated Flat Lay
          </div>
        </div>
      </div>
    </div>
  );
};

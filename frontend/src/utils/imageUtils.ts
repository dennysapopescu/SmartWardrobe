/**
 * Client-side fast background removal & image enhancement utility.
 * Runs 100% in-browser on the user's device (zero server cost, 100% free).
 */

const defaultBase = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  ? `http://${window.location.hostname}:8080`
  : 'http://localhost:8080';
const BACKEND_BASE = (import.meta.env.VITE_API_URL || defaultBase).replace(/\/+$/, '');

export function getFullImageUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${BACKEND_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function removeLightBackground(imageFile: File, tolerance: number = 30): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(imageFile);
          return;
        }

        // Limit dimensions for fast processing and optimal mobile performance
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Sample border corner pixels to detect the background color
        const corners = [
          [0, 0],
          [width - 1, 0],
          [0, height - 1],
          [width - 1, height - 1],
        ];

        let bgR = 0, bgG = 0, bgB = 0;
        corners.forEach(([x, y]) => {
          const idx = (y * width + x) * 4;
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        });
        bgR /= corners.length;
        bgG /= corners.length;
        bgB /= corners.length;

        // Flood-like corner & border transparency check
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Calculate Euclidean distance to background color
          const diff = Math.sqrt(
            Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
          );

          // If close to background color or very bright white/light grey, make transparent
          if (diff < tolerance || (r > 242 && g > 242 && b > 242 && (bgR > 230 && bgG > 230 && bgB > 230))) {
            // Feather edge slightly
            if (diff < tolerance * 0.7) {
              data[i + 3] = 0;
            } else {
              const alpha = Math.round(((diff - tolerance * 0.7) / (tolerance * 0.3)) * 255);
              data[i + 3] = Math.min(data[i + 3], alpha);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const cleanFile = new File([blob], imageFile.name.replace(/\.[^/.]+$/, "") + "-clean.png", {
              type: 'image/png',
            });
            resolve(cleanFile);
          } else {
            resolve(imageFile);
          }
        }, 'image/png');
      };

      img.onerror = () => resolve(imageFile);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(imageFile);
    reader.readAsDataURL(imageFile);
  });
}

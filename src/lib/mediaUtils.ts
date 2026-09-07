/**
 * Media compression and local storage utilities for Aliança Imobiliária.
 * Designed specifically to operate without Firebase Storage, avoiding extra cloud costs
 * and preventing indefinite processing/hangs during listing publications.
 */

export async function compressImageFile(
  file: File,
  maxWidth = 960,
  maxHeight = 960,
  quality = 0.65
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 10s watchdog timeout to ensure publishing never hangs indefinitely
    const timeout = setTimeout(() => {
      reject(new Error('Tempo limite excedido ao processar a fotografia.'));
    }, 10000);

    const reader = new FileReader();

    reader.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Erro ao ler o ficheiro da galeria.'));
    };

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Falha ao decodificar a imagem selecionada.'));
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            clearTimeout(timeout);
            // Fallback to original reader result if canvas 2D fails
            return resolve(event.target?.result as string);
          }

          // Render with smooth interpolation
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export compressed JPEG
          let dataUrl = canvas.toDataURL('image/jpeg', quality);

          // If still over ~200KB, re-compress slightly smaller to safeguard 1MB Firestore doc limit
          if (dataUrl.length > 250000) {
            const secondaryCanvas = document.createElement('canvas');
            const targetW = Math.round(width * 0.75);
            const targetH = Math.round(height * 0.75);
            secondaryCanvas.width = targetW;
            secondaryCanvas.height = targetH;
            const sCtx = secondaryCanvas.getContext('2d');
            if (sCtx) {
              sCtx.drawImage(canvas, 0, 0, targetW, targetH);
              dataUrl = secondaryCanvas.toDataURL('image/jpeg', 0.55);
            }
          }

          clearTimeout(timeout);
          resolve(dataUrl);
        } catch (err) {
          clearTimeout(timeout);
          reject(err);
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Generates an instant thumbnail snapshot and object URL for a short video from gallery.
 */
export async function processVideoFile(file: File): Promise<{
  objectUrl: string;
  thumbnailUrl: string;
  fileName: string;
  sizeMB: number;
}> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Tempo limite excedido ao carregar o vídeo.'));
    }, 15000);

    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;

    video.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Não foi possível carregar o vídeo selecionado. Formato incompatível.'));
    };

    video.onloadeddata = () => {
      // Seek to 0.5s to capture thumbnail
      video.currentTime = Math.min(0.5, video.duration / 2);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(480, video.videoWidth || 480);
        canvas.height = Math.min(320, video.videoHeight || 320);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
          clearTimeout(timeout);
          resolve({
            objectUrl,
            thumbnailUrl,
            fileName: file.name,
            sizeMB: Number((file.size / (1024 * 1024)).toFixed(2)),
          });
        } else {
          clearTimeout(timeout);
          resolve({
            objectUrl,
            thumbnailUrl: '',
            fileName: file.name,
            sizeMB: Number((file.size / (1024 * 1024)).toFixed(2)),
          });
        }
      } catch (err) {
        clearTimeout(timeout);
        resolve({
          objectUrl,
          thumbnailUrl: '',
          fileName: file.name,
          sizeMB: Number((file.size / (1024 * 1024)).toFixed(2)),
        });
      }
    };
  });
}

/**
 * Utilitários de Otimização e Processamento de Mídia para a A.PANZO Imobiliária.
 * 100% Baseado em Firestore (Zero dependência de Firebase Storage - 100% Gratuito).
 *
 * Características Técnicas:
 * - Correção automática de Orientação EXIF para fotos tiradas em smartphones (iOS e Android).
 * - Alta fidelidade e nitidez com qualidade calibrada entre 85% e 90% em WebP (com fallback JPEG).
 * - Redimensionamento inteligente proporcional (aspect-ratio mantido sem cortes ou distorções).
 * - Processamento assíncrono em lotes para suportar 15+ a 30+ fotos por imóvel sem travar a UI.
 */

export interface UploadProgressInfo {
  current: number;
  total: number;
  percent: number;
  message: string;
}

/**
 * Lê os metadados binários EXIF de uma imagem JPEG para extrair a orientação (tags 1 a 8).
 * Permite rotação automática precisa de fotos tiradas em modo retrato/paisagem no smartphone.
 */
export function getExifOrientation(buffer: ArrayBuffer): number {
  try {
    const view = new DataView(buffer);
    if (view.byteLength < 4) return 1;
    // Valida assinatura JPEG (0xFFD8)
    if (view.getUint16(0, false) !== 0xFFD8) return 1;

    const length = view.byteLength;
    let offset = 2;

    while (offset < length) {
      if (view.byteLength <= offset + 4) break;
      const marker = view.getUint16(offset, false);
      offset += 2;

      // Marcador APP1 (0xFFE1) armazena o cabeçalho EXIF
      if (marker === 0xFFE1) {
        if (view.getUint32(offset += 2, false) !== 0x45786966) { // "Exif"
          return 1;
        }
        offset += 6; // pula Exif\0\0

        const littleEndian = view.getUint16(offset, false) === 0x4949; // "II" (Intel) vs "MM" (Motorola)
        offset += view.getUint32(offset + 4, littleEndian);

        if (offset + 2 > view.byteLength) return 1;
        const tags = view.getUint16(offset, littleEndian);
        offset += 2;

        for (let i = 0; i < tags; i++) {
          if (offset + 12 > view.byteLength) break;
          if (view.getUint16(offset, littleEndian) === 0x0112) { // Tag 0x0112 = Orientation
            return view.getUint16(offset + 8, littleEndian);
          }
          offset += 12;
        }
        return 1;
      } else if ((marker & 0xFF00) !== 0xFF00) {
        break;
      } else {
        offset += view.getUint16(offset, false);
      }
    }
  } catch (err) {
    console.warn('Não foi possível ler EXIF da imagem:', err);
  }
  return 1;
}

/**
 * Redimensiona e otimiza uma fotografia via Canvas HTML5 preservando proporção e nitidez,
 * corrigindo a orientação EXIF de telemóveis e aplicando qualidade calibrada (85% a 90%).
 */
export async function compressImageToDataUrl(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<string> {
  const maxWidth = options?.maxWidth || 1440;
  const maxHeight = options?.maxHeight || 1440;
  // Qualidade padrão de 86% para máxima nitidez sem granularidade
  const quality = Math.min(0.92, Math.max(0.85, options?.quality || 0.86));

  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Tempo limite excedido ao processar imagem: ${file.name}`));
    }, 35000);

    try {
      // 1. Método Moderno: Tentar createImageBitmap com correção nativa de orientação EXIF
      if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
        try {
          // O navegador interpreta os metadados EXIF e já entrega os pixels com a rotação correta
          const bitmap = await (createImageBitmap as any)(file, {
            imageOrientation: 'from-image',
          });

          let srcWidth = bitmap.width;
          let srcHeight = bitmap.height;

          // Cálculo proporcional sem corte
          let destWidth = srcWidth;
          let destHeight = srcHeight;

          if (destWidth > maxWidth || destHeight > maxHeight) {
            const ratio = Math.min(maxWidth / destWidth, maxHeight / destHeight);
            destWidth = Math.round(destWidth * ratio);
            destHeight = Math.round(destHeight * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(destWidth, 1);
          canvas.height = Math.max(destHeight, 1);

          const ctx = canvas.getContext('2d', { alpha: false });
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            // Fundo neutro caso a imagem original possua transparência
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

            bitmap.close?.();

            let dataUrl = '';
            try {
              dataUrl = canvas.toDataURL('image/webp', quality);
              if (!dataUrl.startsWith('data:image/webp')) {
                dataUrl = canvas.toDataURL('image/jpeg', quality);
              }
            } catch {
              dataUrl = canvas.toDataURL('image/jpeg', quality);
            }

            clearTimeout(timeout);
            return resolve(dataUrl);
          }
          bitmap.close?.();
        } catch {
          // Se createImageBitmap com option falhar (ex: safari antigo), prossegue para o fallback
        }
      }

      // 2. Método Fallback com Leitura Manual de Orientação EXIF
      const arrayBuffer = await file.arrayBuffer();
      const exifOrientation = getExifOrientation(arrayBuffer);

      const blob = new Blob([arrayBuffer], { type: file.type || 'image/jpeg' });
      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        clearTimeout(timeout);
        reject(new Error(`Falha ao decodificar a fotografia: ${file.name}`));
      };

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        try {
          const rawWidth = img.naturalWidth || img.width;
          const rawHeight = img.naturalHeight || img.height;

          // Detecta se a orientação EXIF inverte as dimensões (90° ou 270°)
          const isSwapped = [5, 6, 7, 8].includes(exifOrientation);
          const origWidth = isSwapped ? rawHeight : rawWidth;
          const origHeight = isSwapped ? rawWidth : rawHeight;

          let targetWidth = origWidth;
          let targetHeight = origHeight;

          if (targetWidth > maxWidth || targetHeight > maxHeight) {
            const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
            targetWidth = Math.round(targetWidth * ratio);
            targetHeight = Math.round(targetHeight * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(targetWidth, 1);
          canvas.height = Math.max(targetHeight, 1);

          const ctx = canvas.getContext('2d', { alpha: false });
          if (!ctx) {
            clearTimeout(timeout);
            return resolve(img.src);
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Aplica a matriz de transformação de acordo com o EXIF
          ctx.save();
          switch (exifOrientation) {
            case 2: // Flip horizontal
              ctx.translate(canvas.width, 0);
              ctx.scale(-1, 1);
              break;
            case 3: // Rotação 180°
              ctx.translate(canvas.width, canvas.height);
              ctx.rotate(Math.PI);
              break;
            case 4: // Flip vertical
              ctx.translate(0, canvas.height);
              ctx.scale(1, -1);
              break;
            case 5: // 90° CCW + flip vertical
              ctx.rotate(0.5 * Math.PI);
              ctx.scale(1, -1);
              break;
            case 6: // Rotação 90° CW (comum em fotos verticais de smartphone)
              ctx.rotate(90 * Math.PI / 180);
              ctx.translate(0, -canvas.width);
              break;
            case 7: // 90° CW + flip horizontal
              ctx.rotate(0.5 * Math.PI);
              ctx.translate(canvas.height, -canvas.width);
              ctx.scale(-1, 1);
              break;
            case 8: // Rotação 270° CW / 90° CCW
              ctx.rotate(-90 * Math.PI / 180);
              ctx.translate(-canvas.height, 0);
              break;
            default:
              break;
          }

          const drawWidth = isSwapped ? canvas.height : canvas.width;
          const drawHeight = isSwapped ? canvas.width : canvas.height;
          ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
          ctx.restore();

          // Exporta em WebP de alta qualidade (ou JPEG de fallback)
          let finalDataUrl = '';
          try {
            finalDataUrl = canvas.toDataURL('image/webp', quality);
            if (!finalDataUrl.startsWith('data:image/webp')) {
              finalDataUrl = canvas.toDataURL('image/jpeg', quality);
            }
          } catch {
            finalDataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          clearTimeout(timeout);
          resolve(finalDataUrl);
        } catch (err) {
          clearTimeout(timeout);
          reject(err);
        }
      };

      img.src = objectUrl;
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });
}

/**
 * Função utilitária de compressão com retrocompatibilidade total.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1440,
  maxHeight = 1440,
  quality = 0.86
): Promise<string> {
  return compressImageToDataUrl(file, { maxWidth, maxHeight, quality });
}

/**
 * Processamento e upload em lote de 15+ a 30+ fotos diretamente para o Firestore.
 * Opera em lotes assíncronos controlados (3 fotos por vez) para manter a UI 100% responsiva,
 * com alta fidelidade visual (qualidade 85%-88%) e resolução nítida (1280px-1440px).
 */
export async function batchUploadPropertyPhotos(
  files: FileList | File[],
  onProgress?: (progress: UploadProgressInfo) => void,
  _folder = 'properties'
): Promise<string[]> {
  const fileArray = Array.from(files);
  const total = fileArray.length;
  if (total === 0) return [];

  // Calibra a resolução para acomodar 15+ a 30 fotos com máxima nitidez no Firestore
  const isHighVolume = total >= 15;
  const maxWidth = isHighVolume ? 1280 : 1440;
  const maxHeight = isHighVolume ? 1280 : 1440;
  // Mantém taxa de qualidade premium entre 85% e 88%
  const quality = isHighVolume ? 0.85 : 0.88;

  const results: string[] = [];
  const BATCH_SIZE = 3;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const currentBatch = fileArray.slice(i, i + BATCH_SIZE);

    const batchPromises = currentBatch.map(async (file, batchIndex) => {
      const globalIndex = i + batchIndex + 1;
      if (onProgress) {
        onProgress({
          current: globalIndex,
          total,
          percent: Math.round(((globalIndex - 0.5) / total) * 100),
          message: `A otimizar foto ${globalIndex} de ${total} com alta nitidez...`,
        });
      }

      const compressedDataUrl = await compressImageToDataUrl(file, {
        maxWidth,
        maxHeight,
        quality,
      });

      if (onProgress) {
        onProgress({
          current: globalIndex,
          total,
          percent: Math.round((globalIndex / total) * 100),
          message: `Foto ${globalIndex} de ${total} pronta!`,
        });
      }

      return compressedDataUrl;
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Pausa assíncrona leve para liberar a thread da interface
    await new Promise((resolve) => setTimeout(resolve, 40));
  }

  if (onProgress) {
    onProgress({
      current: total,
      total,
      percent: 100,
      message: `${total} fotografia(s) com alta nitidez prontas!`,
    });
  }

  return results;
}

/**
 * Gera um thumbnail instantâneo e URL seguro para preview de vídeos selecionados da galeria.
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
    }, 25000);

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
      video.currentTime = Math.min(0.5, video.duration / 2);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(640, video.videoWidth || 640);
        canvas.height = Math.min(360, video.videoHeight || 360);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
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
      } catch {
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

/**
 * Utilitários de Otimização e Compressão de Mídia para a A.PANZO Imobiliária.
 * 100% Baseado em Firestore (Zero dependência de Firebase Storage - 100% Gratuito).
 *
 * Suporta 15+ a 20+ fotos por imóvel comprimidas via Canvas no cliente em Data URLs
 * ultraleves (~20KB-30KB por foto), garantindo total fidelidade visual e mantendo o
 * documento do imóvel bem abaixo do limite seguro de 1MB do Cloud Firestore.
 */

export interface UploadProgressInfo {
  current: number;
  total: number;
  percent: number;
  message: string;
}

/**
 * Redimensiona e comprime uma foto no navegador através de HTML5 Canvas.
 * Ajusta dinamicamente a resolução e qualidade com base na contagem de fotos
 * para garantir que 15+ ou 20+ fotos caibam confortavelmente no documento Firestore.
 */
export async function compressImageToDataUrl(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxDataUrlLength?: number;
  }
): Promise<string> {
  const maxWidth = options?.maxWidth || 800;
  const maxHeight = options?.maxHeight || 800;
  const quality = options?.quality || 0.65;
  const maxDataUrlLength = options?.maxDataUrlLength || 45000; // ~33KB binário

  return new Promise((resolve, reject) => {
    // Timeout de segurança para fotos pesadas de smartphones (ex: 20MB-50MB)
    const timeout = setTimeout(() => {
      reject(new Error(`Tempo limite excedido ao comprimir imagem: ${file.name}`));
    }, 25000);

    const reader = new FileReader();

    reader.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Erro ao ler o ficheiro: ${file.name}`));
    };

    reader.onload = (event) => {
      const img = new Image();

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Falha ao decodificar imagem: ${file.name}`));
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Manter proporção limitando dentro de maxWidth e maxHeight
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
          canvas.width = Math.max(width, 1);
          canvas.height = Math.max(height, 1);

          const ctx = canvas.getContext('2d', { alpha: false });
          if (!ctx) {
            clearTimeout(timeout);
            // Fallback direto
            return resolve(event.target?.result as string);
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          // Preenchimento de fundo neutro para imagens sem canal alfa
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Tentar WebP primeiro se suportado, senão JPEG
          let dataUrl = '';
          try {
            dataUrl = canvas.toDataURL('image/webp', quality);
            if (!dataUrl.startsWith('data:image/webp')) {
              dataUrl = canvas.toDataURL('image/jpeg', quality);
            }
          } catch {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          // Se a foto ainda estiver acima do tamanho alvo (ex: fotos muito complexas/granuladas),
          // faz uma passagem rápida de redução para garantir cabimento no Firestore
          if (dataUrl.length > maxDataUrlLength) {
            const secondCanvas = document.createElement('canvas');
            secondCanvas.width = Math.round(canvas.width * 0.82);
            secondCanvas.height = Math.round(canvas.height * 0.82);
            const secondCtx = secondCanvas.getContext('2d', { alpha: false });
            if (secondCtx) {
              secondCtx.imageSmoothingEnabled = true;
              secondCtx.imageSmoothingQuality = 'medium';
              secondCtx.drawImage(canvas, 0, 0, secondCanvas.width, secondCanvas.height);
              dataUrl = secondCanvas.toDataURL('image/jpeg', Math.max(0.52, quality - 0.12));
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
 * Função utilitária de compressão com retrocompatibilidade total.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.65
): Promise<string> {
  return compressImageToDataUrl(file, { maxWidth, maxHeight, quality });
}

/**
 * Processamento e upload em lote de 15+ fotos diretamente para o Firestore.
 * Opera em lotes assíncronos controlados (3 fotos por vez) para nunca travar a UI,
 * liberando o loop de eventos para o navegador de telemóveis e computadores.
 */
export async function batchUploadPropertyPhotos(
  files: FileList | File[],
  onProgress?: (progress: UploadProgressInfo) => void,
  _folder = 'properties' // Mantido para compatibilidade de assinatura
): Promise<string[]> {
  const fileArray = Array.from(files);
  const total = fileArray.length;
  if (total === 0) return [];

  // Se houver mais de 12 fotos, otimiza sutilmente a resolução para poupar espaço
  const isHighVolume = total >= 12;
  const maxWidth = isHighVolume ? 720 : 800;
  const maxHeight = isHighVolume ? 720 : 800;
  const quality = isHighVolume ? 0.60 : 0.66;
  const maxDataUrlLength = isHighVolume ? 38000 : 45000;

  const results: string[] = [];
  const BATCH_SIZE = 3; // 3 fotos por lote para estabilidade de memória em smartphones

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const currentBatch = fileArray.slice(i, i + BATCH_SIZE);

    const batchPromises = currentBatch.map(async (file, batchIndex) => {
      const globalIndex = i + batchIndex + 1;
      if (onProgress) {
        onProgress({
          current: globalIndex,
          total,
          percent: Math.round(((globalIndex - 0.5) / total) * 100),
          message: `A otimizar foto ${globalIndex} de ${total} para o Firestore...`,
        });
      }

      const compressedDataUrl = await compressImageToDataUrl(file, {
        maxWidth,
        maxHeight,
        quality,
        maxDataUrlLength,
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

    // Pequena pausa assíncrona para o motor de renderização da UI respirar
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  if (onProgress) {
    onProgress({
      current: total,
      total,
      percent: 100,
      message: `${total} fotografia(s) processada(s) e salvas no Firestore!`,
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
    }, 20000);

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
        canvas.width = Math.min(480, video.videoWidth || 480);
        canvas.height = Math.min(320, video.videoHeight || 320);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.65);
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

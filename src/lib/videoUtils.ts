/**
 * Utilitários para análise, incorporação e reprodução de vídeos para a A.PANZO Imobiliária.
 * Suporta YouTube, Vimeo, links diretos MP4/WebM e arquivos locais otimizados.
 */

export interface ParsedVideo {
  type: 'youtube' | 'vimeo' | 'direct' | 'none';
  embedUrl?: string;
  directUrl?: string;
}

export function parseVideoSource(url?: string | null): ParsedVideo {
  if (!url || !url.trim()) {
    return { type: 'none' };
  }

  const clean = url.trim();

  // 1. YouTube (watch?v=, youtu.be/, /shorts/, /embed/)
  const ytMatch = clean.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`,
    };
  }

  // 2. Vimeo (vimeo.com/123456789)
  const vimeoMatch = clean.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}?dnt=1&playsinline=1`,
    };
  }

  // 3. Direct video file (mp4, webm, ogg, blob, data:video)
  return {
    type: 'direct',
    directUrl: clean,
  };
}

/**
 * Utilitaires pour optimiser les images et ressources statiques
 */

// Type pour les options d'images
export type ImageOptions = {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  placeholder?: 'blur' | 'empty';
};

// Constructeur d'URL pour les images
export function getOptimizedImageUrl(
  src: string,
  options: ImageOptions = {}
): string {
  // Si l'URL est relative, on la préfixe avec le domaine actuel
  if (src.startsWith('/')) {
    src = `${window.location.origin}${src}`;
  }
  
  // Si ce n'est pas une URL d'image (pas de format d'image courant)
  if (!src.match(/\.(jpe?g|png|gif|svg|webp|avif)$/i)) {
    return src;
  }
  
  try {
    const url = new URL(src);
    
    // Ajouter les paramètres d'optimisation à l'URL
    const { width, height, quality = 80, format } = options;
    
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    if (quality) url.searchParams.set('q', quality.toString());
    if (format) url.searchParams.set('fmt', format);
    
    return url.toString();
  } catch (error) {
    console.error('Invalid image URL:', error);
    return src;
  }
}

// Fonction pour précharger les images importantes
export function preloadImages(urls: string[]): void {
  if (typeof window === 'undefined') return; // Ne fonctionne que côté client
  
  for (const url of urls) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  }
}

// Fonction pour générer un placeholder de faible qualité
export function getLowQualityPlaceholder(src: string): string {
  return getOptimizedImageUrl(src, {
    width: 20,
    height: 20,
    quality: 20,
    format: 'webp'
  });
}

// Fonction pour créer un ensemble d'images responsives pour différentes tailles d'écran
export function createResponsiveImageSet(
  src: string,
  breakpoints: number[] = [640, 768, 1024, 1280, 1536]
): string {
  return breakpoints
    .map(width => `${getOptimizedImageUrl(src, { width, format: 'webp' })} ${width}w`)
    .join(', ');
}

export default {
  getOptimizedImageUrl,
  preloadImages,
  getLowQualityPlaceholder,
  createResponsiveImageSet
}; 
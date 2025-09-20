/**
 * Service API optimisé pour gérer les appels vers les endpoints du backend
 * Intègre les bonnes pratiques comme la gestion d'erreur, la mise en cache et le debounce
 */

// Types pour les requêtes
export interface ApiResponse<T = any> {
  data: T;
  error?: string;
  statusCode: number;
}

// Type pour les options de requêtes
export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  cache?: 'default' | 'no-cache' | 'reload' | 'force-cache' | 'only-if-cached';
  timeout?: number;
}

// Cache pour stocker les résultats des requêtes
const apiCache = new Map<string, { data: any; timestamp: number }>();
const DEFAULT_CACHE_TIME = 60 * 1000; // 1 minute en millisecondes

// Méthode pour construire l'URL avec les paramètres de requête
const buildUrl = (url: string, params?: Record<string, string | number | boolean | undefined>): string => {
  if (!params) return url;

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

/**
 * Vérifie et récupère une réponse du cache si disponible
 */
const getFromCache = <T>(cacheKey: string): ApiResponse<T> | null => {
  const cachedResponse = apiCache.get(cacheKey);
  if (cachedResponse && Date.now() - cachedResponse.timestamp < DEFAULT_CACHE_TIME) {
    return { data: cachedResponse.data, statusCode: 200 };
  }
  return null;
};

/**
 * Enregistre une réponse dans le cache
 */
const saveToCache = <T>(cacheKey: string, data: T): void => {
  apiCache.set(cacheKey, { data, timestamp: Date.now() });
};

/**
 * Traite la réponse HTTP et extrait les données
 */
const processResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const contentType = response.headers.get('content-type');
  // Utilisation de l'opérateur de chaînage optionnel
  const isJson = contentType?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  // Extraction de la logique de l'erreur pour plus de clarté
  let errorMessage: string | undefined = undefined;
  if (!response.ok) {
    // Utilisation du chaînage optionnel pour data.error aussi, par sécurité
    if (isJson && data?.error) {
      errorMessage = data.error;
    } else {
      errorMessage = response.statusText;
    }
  }

  return {
    data,
    statusCode: response.status,
    error: errorMessage
  };
};

/**
 * Gère les erreurs pendant la requête
 */
const handleFetchError = <T>(error: unknown): ApiResponse<T> => {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return { data: null as unknown as T, error: 'Request timeout', statusCode: 408 };
  }

  return {
    data: null as unknown as T,
    error: error instanceof Error ? error.message : 'Unknown error',
    statusCode: 500
  };
};

/**
 * Effectue une requête HTTP avec gestion des timeouts
 */
const executeFetch = async <T>(
  url: string,
  fetchOptions: RequestInit,
  timeout: number
): Promise<ApiResponse<T>> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return await processResponse<T>(response);
  } catch (error) {
    clearTimeout(timeoutId);
    return handleFetchError<T>(error);
  }
};

// Méthode principale pour effectuer des requêtes API
export async function fetchApi<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { params, cache, timeout = 8000, ...fetchOptions } = options;

  // Construire l'URL avec les paramètres
  const fullUrl = buildUrl(url, params);

  // Vérifier le cache si la requête est GET et que le cache n'est pas désactivé
  const cacheKey = `${fetchOptions.method || 'GET'}-${fullUrl}`;
  const useCache = !options.cache || options.cache !== 'no-cache';

  if (fetchOptions.method === 'GET' && useCache) {
    const cachedResult = getFromCache<T>(cacheKey);
    if (cachedResult) return cachedResult;
  }

  const result = await executeFetch<T>(fullUrl, fetchOptions, timeout);

  // Mettre en cache les réponses GET réussies
  if (fetchOptions.method === 'GET' && result.statusCode === 200 && useCache) {
    saveToCache(cacheKey, result.data);
  }

  return result;
}

// Méthodes utilitaires pour chaque type de requête
export const api = {
  get: <T = any>(url: string, options?: FetchOptions) =>
    fetchApi<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, data?: any, options?: FetchOptions) =>
    fetchApi<T>(url, { ...options, method: 'POST', body: JSON.stringify(data) }),

  put: <T = any>(url: string, data?: any, options?: FetchOptions) =>
    fetchApi<T>(url, { ...options, method: 'PUT', body: JSON.stringify(data) }),

  delete: <T = any>(url: string, options?: FetchOptions) =>
    fetchApi<T>(url, { ...options, method: 'DELETE' })
};

export default api;
/**
 * ANTAH API & Backend Gateway Configuration
 * Ensures full compatibility with Android APK WebViews, Capacitor, PWA, and production hosting.
 * Never hardcodes localhost in production or mobile APK packages.
 */

const getApiBaseUrl = (): string => {
  // 1. Explicitly configured production / staging backend URL
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv.VITE_API_BASE_URL) {
    return metaEnv.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  // 2. Detect Android APK / Hybrid WebView environments
  const isHybridApp =
    typeof window !== 'undefined' &&
    ((window as any).Capacitor ||
      (window as any).cordova ||
      window.location.protocol === 'file:' ||
      window.location.protocol === 'capacitor:');

  if (isHybridApp) {
    // In Android APK, localhost points to the phone's loopback, not the server.
    // Default to the designated cloud backend or configured gateway
    return 'https://api.antah.network/api/v1';
  }

  // 3. Standard Web environment
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.origin}/api/v1`;
  }

  // 4. Local desktop development fallback
  return 'http://127.0.0.1:8000/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/health`,
  reports: `${API_BASE_URL}/reports`,
  clusters: `${API_BASE_URL}/clusters`,
  incidents: `${API_BASE_URL}/incidents`,
  chatAuth: `${API_BASE_URL}/chat/token`,
  analytics: `${API_BASE_URL}/analytics`,
  authMe: `${API_BASE_URL}/auth/me`,
  notifications: `${API_BASE_URL}/notifications`,
  chatRooms: `${API_BASE_URL}/chat/rooms`,
} as const;

export interface User { id: number; email: string; full_name: string; role: string; is_active: boolean; }
export interface Report {
  id: number; title: string; description: string; category: string;
  location: string; urgency: number; status: string; reporter_id: number;
}
export interface Analytics {
  reports: number; clusters: number; approved_clusters: number;
  incidents: number; resolved_incidents: number;
}
export interface Cluster {
  id: number; title: string; explanation: string; score: number;
  status: 'pending' | 'approved' | 'rejected' | 'needs_info' | string;
}
export interface Notification {
  id: number; user_id: number; message: string; read: boolean; created_at: string;
}
export interface ChatRoom {
  id: number; room_key: string; title: string; room_type: string; incident_id?: number | null;
}
export interface ChatMessage {
  id: number; room_id: number; sender_id: number; sender_name: string; text: string; created_at: string;
}
export interface NexconnToken {
  access_token: string;
  nexconn_user_id: string;
  channel_id: string;
  channel_type: 'community' | 'group';
  area_code: number;
}
export interface AuthToken { access_token: string; token_type: string; }

const TOKEN_KEY = 'nexconn_access_token';
export const getAuthToken = () => typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export async function login(email: string, password: string): Promise<ApiResponse<AuthToken>> {
  const result = await apiRequest<AuthToken>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (result.data) setAuthToken(result.data.access_token);
  return result;
}

export async function register(
  email: string,
  fullName: string,
  password: string
): Promise<ApiResponse<User>> {
  return apiRequest<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, full_name: fullName, password, role: 'reporter' }),
  });
}

export function logout(): void {
  setAuthToken(null);
  clearApiCache();
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('antah-logout'));
}

// In-flight request deduplication map & short-term read cache
const inFlightRequests = new Map<string, Promise<ApiResponse<any>>>();
const readCache = new Map<string, { timestamp: number; response: ApiResponse<any> }>();
const CACHE_TTL_MS = 6000; // 6 seconds memory cache for read requests

export function clearApiCache(): void {
  readCache.clear();
  inFlightRequests.clear();
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, timeoutMs = 8000): Promise<ApiResponse<T>> {
  const method = (options.method || 'GET').toUpperCase();
  const token = getAuthToken();
  const fullUrl = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  // On data mutations, invalidate read cache so UI gets fresh data
  if (method !== 'GET') {
    readCache.clear();
    return fetchWithTimeout<T>(fullUrl, {
      ...options,
      headers: { ...authHeaders, ...(options.headers || {}) },
    }, timeoutMs);
  }

  // 1. Check in-memory cache for recent GET response
  const cacheKey = `${token ? 'auth:' : 'anon:'}${fullUrl}`;
  const cached = readCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.response as ApiResponse<T>;
  }

  // 2. Check for in-flight identical request to deduplicate
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  // 3. Initiate request with in-flight tracking
  const requestPromise = (async () => {
    try {
      const res = await fetchWithTimeout<T>(fullUrl, {
        ...options,
        headers: { ...authHeaders, ...(options.headers || {}) },
      }, timeoutMs);

      // Cache successful responses
      if (res.data) {
        readCache.set(cacheKey, { timestamp: Date.now(), response: res });
      }
      return res;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  isOffline?: boolean;
  status?: number;
}

export async function fetchWithTimeout<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 8000
): Promise<ApiResponse<T>> {
  // Check online status before initiating network request
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      error: 'Device is currently offline. Actions will be synchronized when connectivity resumes.',
      isOffline: true,
    };
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const body = await response.json();
        detail = body.detail || detail;
      } catch {
        // Some proxies return an empty response for errors.
      }
      const errorMessages: Record<number, string> = {
        400: 'The request could not be completed.',
        401: 'Your session is invalid or has expired.',
        403: 'You do not have permission to perform this action.',
        404: 'The requested resource was not found.',
        422: 'Please check the submitted information.',
        429: 'Too many requests. Please try again shortly.',
        500: 'The server encountered an error.',
        502: 'The service is temporarily unavailable.',
        503: 'The service is temporarily unavailable.',
        504: 'The service took too long to respond.',
      };
      const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register') || endpoint.includes('/auth/me');
      if (response.status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
        setAuthToken(null);
        clearApiCache();
        window.dispatchEvent(new CustomEvent('antah-auth-expired'));
      }
      return { error: errorMessages[response.status] || `${detail} (${response.status})`, status: response.status };
    }

    const data = await response.json();
    return { data };
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      return { error: 'Request timed out. Please check your network connection.' };
    }
    return { error: 'Unable to connect to the server. Please try again.' };
  }
}

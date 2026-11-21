/**
 * ANTAH API & Backend Gateway Configuration
 * Ensures full compatibility with Android APK WebViews, Capacitor, PWA, and production hosting.
 * Never hardcodes localhost in production or mobile APK packages.
 */

export const getStoredApiBaseUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('antah_api_base_url');
  } catch {
    return null;
  }
};

export const setCustomApiBaseUrl = (url: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = url.trim().replace(/\/+$/, '');
    if (cleaned) {
      localStorage.setItem('antah_api_base_url', cleaned);
    } else {
      localStorage.removeItem('antah_api_base_url');
    }
  } catch {}
};

const normalizeApiUrl = (url: string): string => {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return trimmed;
  // If user passed root domain (e.g. https://api.myantah.com), append /api/v1
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
};

const getApiBaseUrl = (): string => {
  // 1. Check user-configured override from localStorage (allows live IP changes on phone without recompiling)
  const stored = getStoredApiBaseUrl();
  if (stored && stored.trim().length > 0) {
    return normalizeApiUrl(stored);
  }

  // 2. Detect Android APK / Hybrid WebView environments
  const isHybridApp =
    typeof window !== 'undefined' &&
    ((window as any).Capacitor ||
      (window as any).cordova ||
      window.location.protocol === 'file:' ||
      window.location.protocol === 'capacitor:' ||
      window.location.hostname === 'appassets.androidplatform.net');

  // 3. Explicitly configured production / staging backend URL (supports VITE_API_BASE_URL, VITE_API_URL, VITE_BACKEND_URL)
  const metaEnv = (import.meta as any).env;
  const configuredEnvUrl =
    metaEnv?.VITE_API_BASE_URL ||
    metaEnv?.VITE_API_URL ||
    metaEnv?.VITE_BACKEND_URL;

  if (configuredEnvUrl && typeof configuredEnvUrl === 'string' && configuredEnvUrl.trim()) {
    const envUrl = normalizeApiUrl(configuredEnvUrl);
    // In Android APK, localhost/127.0.0.1 resolves to the phone itself, which has no backend.
    if (isHybridApp && (envUrl.includes('127.0.0.1') || envUrl.includes('localhost'))) {
      return 'http://192.168.30.120:8000/api/v1';
    }
    return envUrl;
  }

  if (isHybridApp) {
    // In Android APK, default to computer's local Wi-Fi IP
    return 'http://192.168.30.120:8000/api/v1';
  }

  // 4. Standard Web environment (Vercel, Cloud, or Local Browser)
  if (typeof window !== 'undefined') {
    if (window.location.port === '5173') {
      return `${window.location.origin}/api/v1`;
    }
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `${window.location.origin}/api/v1`;
    }
  }

  // 5. Local desktop development fallback
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
  chatUsers: `${API_BASE_URL}/chat/users`,
  profile: `${API_BASE_URL}/users/me`,
  logout: `${API_BASE_URL}/auth/logout`,
} as const;

export interface User { id: number; email: string; full_name: string; role: string; is_active: boolean; }
export interface ReportAttachment {
  id: number;
  report_id: number;
  file_url: string;
  file_type: string;
  file_name: string;
  file_size: number;
  created_at: string;
}
export interface Report {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  urgency: number;
  status: string;
  reporter_id: number;
  created_at?: string;
  attachments?: ReportAttachment[];
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
  id: number;
  room_id: number;
  sender_id: number;
  sender_name: string;
  sender_role?: string;
  message_uid?: string;
  text: string;
  created_at: string;
}
export interface NexconnToken {
  access_token: string;
  nexconn_user_id: string;
  user_name?: string;
  user_role?: string;
  channel_id: string;
  sub_channel_id?: string | null;
  channel_type: 'community' | 'group';
  area_code: number;
}
export interface AuthToken {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
}

const TOKEN_KEY = 'nexconn_access_token';
const REFRESH_TOKEN_KEY = 'nexconn_refresh_token';

export const getAuthToken = () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY));
export const getRefreshToken = () => (typeof window === 'undefined' ? null : localStorage.getItem(REFRESH_TOKEN_KEY));

export const setAuthToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export const setRefreshToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const clearAuthSession = () => {
  setAuthToken(null);
  setRefreshToken(null);
  clearApiCache();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('antah-auth-expired'));
    window.dispatchEvent(new CustomEvent('antah-logout'));
  }
};

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  const rToken = getRefreshToken();
  if (!rToken) return null;

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refresh_token: rToken }),
      });
      if (!response.ok) {
        clearAuthSession();
        return null;
      }
      const data: AuthToken = await response.json();
      setAuthToken(data.access_token);
      if (data.refresh_token) setRefreshToken(data.refresh_token);
      return data.access_token;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function login(email: string, password: string): Promise<ApiResponse<AuthToken>> {
  const cleanEmail = email.trim().toLowerCase();
  const result = await apiRequest<AuthToken>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: cleanEmail, password }),
  });
  if (result.data) {
    setAuthToken(result.data.access_token);
    if (result.data.refresh_token) {
      setRefreshToken(result.data.refresh_token);
    }
  }
  return result;
}

export async function register(
  email: string,
  fullName: string,
  password: string
): Promise<ApiResponse<User>> {
  const cleanEmail = email.trim().toLowerCase();
  return apiRequest<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: cleanEmail, full_name: fullName.trim(), password, role: 'reporter' }),
  });
}

export async function logout(): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch {
    // Ignore network error on logout
  }
  clearAuthSession();
}

/**
 * Resolves full media URL for uploaded evidence, supporting both relative and absolute paths.
 */
export function getMediaUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return '';
  if (
    pathOrUrl.startsWith('http://') ||
    pathOrUrl.startsWith('https://') ||
    pathOrUrl.startsWith('data:') ||
    pathOrUrl.startsWith('blob:')
  ) {
    return pathOrUrl;
  }
  const backendHost = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${backendHost}${cleanPath}`;
}

/**
 * Uploads a photographic evidence attachment associated with a community report.
 * Uses native FormData multipart/form-data without manual boundary interference.
 */
export async function uploadReportAttachment(
  reportId: number,
  file: File
): Promise<ApiResponse<ReportAttachment>> {
  const formData = new FormData();
  formData.append('file', file, file.name);
  return apiRequest<ReportAttachment>(`${API_ENDPOINTS.reports}/${reportId}/attachments`, {
    method: 'POST',
    body: formData,
  }, 30000); // 30s timeout for image uploads
}

/**
 * Deletes an evidence attachment from a report.
 */
export async function deleteReportAttachment(
  reportId: number,
  attachmentId: number
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`${API_ENDPOINTS.reports}/${reportId}/attachments/${attachmentId}`, {
    method: 'DELETE',
  });
}

// In-flight request deduplication map & short-term read cache
const inFlightRequests = new Map<string, Promise<ApiResponse<any>>>();
const readCache = new Map<string, { timestamp: number; response: ApiResponse<any> }>();
const CACHE_TTL_MS = 6000; // 6 seconds memory cache for read requests

export function clearApiCache(): void {
  readCache.clear();
  inFlightRequests.clear();
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 15000,
  isRetry = false
): Promise<ApiResponse<T>> {
  const method = (options.method || 'GET').toUpperCase();
  const isPublicAuthRoute = path.includes('/auth/login') || path.includes('/auth/register');
  const token = isPublicAuthRoute ? null : getAuthToken();
  const fullUrl = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const requestHeaders: Record<string, string> = {
    ...(isPublicAuthRoute ? {} : authHeaders),
    ...((options.headers as Record<string, string>) || {}),
  };
  if (isFormData) {
    delete requestHeaders['Content-Type'];
    delete requestHeaders['content-type'];
  }

  // On data mutations, invalidate read cache so UI gets fresh data
  if (method !== 'GET') {
    readCache.clear();
    const res = await fetchWithTimeout<T>(fullUrl, {
      ...options,
      headers: requestHeaders,
    }, timeoutMs);

    if (res.status === 401 && !isPublicAuthRoute && !path.includes('/auth/refresh') && !isRetry) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return apiRequest<T>(path, options, timeoutMs, true);
      } else {
        clearAuthSession();
      }
    }
    return res;
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
      let res = await fetchWithTimeout<T>(fullUrl, {
        ...options,
        headers: requestHeaders,
      }, timeoutMs);

      if (res.status === 401 && !isPublicAuthRoute && !path.includes('/auth/refresh') && !isRetry) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          res = await apiRequest<T>(path, options, timeoutMs, true);
        } else {
          clearAuthSession();
        }
      }

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
  timeoutMs = 15000
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

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const baseHeaders: Record<string, string> = {
    Accept: 'application/json',
  };
  if (!isFormData) {
    baseHeaders['Content-Type'] = 'application/json';
  }
  const mergedHeaders: Record<string, string> = {
    ...baseHeaders,
    ...((options.headers as Record<string, string>) || {}),
  };
  if (isFormData) {
    delete mergedHeaders['Content-Type'];
    delete mergedHeaders['content-type'];
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      signal: controller.signal,
      headers: mergedHeaders,
    });
    clearTimeout(id);

    if (!response.ok) {
      let detail = '';
      try {
        const body = await response.json();
        if (typeof body.detail === 'string') {
          detail = body.detail;
        } else if (Array.isArray(body.detail)) {
          detail = body.detail.map((item: any) => item.msg || JSON.stringify(item)).join(', ');
        } else if (body.message && typeof body.message === 'string') {
          detail = body.message;
        }
      } catch {
        // Some proxies return an empty response for errors.
      }

      const defaultErrorMessages: Record<number, string> = {
        400: 'The request could not be completed.',
        401: endpoint.includes('/auth/login')
          ? 'Incorrect email or password.'
          : 'Your session is invalid or has expired.',
        403: 'You do not have permission to perform this action.',
        404: 'The requested resource was not found.',
        409: 'This record already exists.',
        422: 'Please check the submitted information.',
        429: 'Too many requests. Please try again shortly.',
        500: 'The server encountered an error. Please try again later.',
        502: 'The service is temporarily unavailable.',
        503: 'The database or service is temporarily unavailable.',
        504: 'The service took too long to respond.',
      };

      const errorMessage =
        detail || defaultErrorMessages[response.status] || response.statusText || `Request failed (${response.status})`;

      return { error: errorMessage, status: response.status };
    }

    const data = await response.json();
    return { data };
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      return { error: 'Request timed out waiting for backend response. Your network or database connection may be slow. Please retry.' };
    }
    return { error: 'Unable to connect to the backend server. Please verify the server is running.' };
  }
}

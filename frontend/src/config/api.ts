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
} as const;

export interface User { id: number; email: string; full_name: string; role: string; }
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
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, timeoutMs = 8000): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  return fetchWithTimeout<T>(path.startsWith('http') ? path : `${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
  }, timeoutMs);
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  isOffline?: boolean;
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
      return { error: `${detail} (${response.status})` };
    }

    const data = await response.json();
    return { data };
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      return { error: 'Request timed out. Please check your network connection.' };
    }
    return { error: err.message || 'Network request failed.' };
  }
}


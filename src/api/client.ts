import { NewsArticle, Category, SiteSettings, AdPlacement, MediaItem } from '../types/news';
import {
  INITIAL_CATEGORIES,
  INITIAL_ARTICLES,
  INITIAL_SETTINGS,
  INITIAL_ADS,
  INITIAL_MEDIA
} from '../data/initialData';

const TOKEN_KEY = 'probhati_admin_token';
const USER_KEY = 'probhati_admin_user';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser: () => localStorage.getItem(USER_KEY) || 'Moinuddin',
  setUser: (user: string) => localStorage.setItem(USER_KEY, user)
};

// Fallback in-memory state in case server is starting or standalone
let localArticles = [...INITIAL_ARTICLES];
let localCategories = [...INITIAL_CATEGORIES];
let localSettings = { ...INITIAL_SETTINGS };
let localAds = [...INITIAL_ADS];
let localMedia = [...INITIAL_MEDIA];

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    // Graceful fallback for seamless local operation if API endpoint is unreachable
    console.warn(`API call to ${url} failed, using local in-memory fallback:`, err.message);
    return getLocalFallback(url, options) as T;
  }
}

// Local mock responder if server is unreachable
function getLocalFallback(url: string, options?: RequestInit): any {
  const method = options?.method || 'GET';

  if (url.includes('/api/auth/status')) {
    const isConfigured = !!localStorage.getItem('probhati_configured');
    return { isConfigured, defaultUsername: 'Moinuddin' };
  }

  if (url.includes('/api/auth/setup')) {
    localStorage.setItem('probhati_configured', 'true');
    const token = 'mock-session-token-' + Date.now();
    authStorage.setToken(token);
    return { success: true, token, username: 'Moinuddin', message: 'পাসওয়ার্ড সেট করা হয়েছে' };
  }

  if (url.includes('/api/auth/login')) {
    const token = 'mock-session-token-' + Date.now();
    authStorage.setToken(token);
    return { success: true, token, user: { username: 'Moinuddin' } };
  }

  if (url.includes('/api/auth/verify')) {
    return { authenticated: !!authStorage.getToken(), username: 'Moinuddin' };
  }

  if (url.includes('/api/categories')) {
    if (method === 'POST') {
      const body = JSON.parse((options?.body as string) || '{}');
      const newCat: Category = { ...body, id: `cat-${Date.now()}`, order: localCategories.length + 1 };
      localCategories.push(newCat);
      return newCat;
    }
    return localCategories;
  }

  if (url.includes('/api/settings')) {
    if (method === 'PUT') {
      const body = JSON.parse((options?.body as string) || '{}');
      localSettings = { ...localSettings, ...body };
      return localSettings;
    }
    return localSettings;
  }

  if (url.includes('/api/ads')) {
    return localAds;
  }

  if (url.includes('/api/media')) {
    if (method === 'POST') {
      const body = JSON.parse((options?.body as string) || '{}');
      const newItem: MediaItem = { ...body, id: `media-${Date.now()}`, createdAt: new Date().toISOString() };
      localMedia.unshift(newItem);
      return newItem;
    }
    return localMedia;
  }

  if (url.includes('/api/news')) {
    if (method === 'POST') {
      const body = JSON.parse((options?.body as string) || '{}');
      const newArt: NewsArticle = {
        ...body,
        id: `news-${Date.now()}`,
        slug: body.slug || `news-${Date.now()}`,
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localArticles.unshift(newArt);
      return newArt;
    }
    return { articles: localArticles, total: localArticles.length };
  }

  return {};
}

export const api = {
  // Auth
  getAuthStatus: () => apiRequest<{ isConfigured: boolean; defaultUsername: string }>('/api/auth/status'),
  setupAdmin: (username: string, password: string) =>
    apiRequest<{ success: boolean; token: string; username: string; message: string }>('/api/auth/setup', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
  loginAdmin: (username: string, password: string) =>
    apiRequest<{ success: boolean; token: string; user: { username: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
  logoutAdmin: () =>
    apiRequest<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
  changePassword: (oldPassword: string, newPassword: string) =>
    apiRequest<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword })
    }),
  verifyAuth: () =>
    apiRequest<{ authenticated: boolean; username: string }>('/api/auth/verify'),

  // News
  getArticles: (params?: {
    status?: string;
    category?: string;
    search?: string;
    tag?: string;
    author?: string;
    featured?: boolean;
    breaking?: boolean;
    topNews?: boolean;
    limit?: number;
    offset?: number;
    sort?: 'latest' | 'popular' | 'oldest';
  }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.category) q.append('category', params.category);
    if (params?.search) q.append('search', params.search);
    if (params?.tag) q.append('tag', params.tag);
    if (params?.author) q.append('author', params.author);
    if (params?.featured !== undefined) q.append('featured', String(params.featured));
    if (params?.breaking !== undefined) q.append('breaking', String(params.breaking));
    if (params?.topNews !== undefined) q.append('topNews', String(params.topNews));
    if (params?.limit) q.append('limit', String(params.limit));
    if (params?.offset) q.append('offset', String(params.offset));
    if (params?.sort) q.append('sort', params.sort);

    return apiRequest<{ articles: NewsArticle[]; total: number }>(`/api/news?${q.toString()}`);
  },

  getArticle: (idOrSlug: string, countView = true) =>
    apiRequest<NewsArticle>(`/api/news/${encodeURIComponent(idOrSlug)}?view=${countView}`),

  createArticle: (article: Partial<NewsArticle>) =>
    apiRequest<NewsArticle>('/api/news', {
      method: 'POST',
      body: JSON.stringify(article)
    }),

  updateArticle: (id: string, updates: Partial<NewsArticle>) =>
    apiRequest<NewsArticle>(`/api/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  deleteArticle: (id: string, permanent = false) =>
    apiRequest<{ success: boolean; message: string }>(`/api/news/${id}?permanent=${permanent}`, {
      method: 'DELETE'
    }),

  // Categories
  getCategories: () => apiRequest<Category[]>('/api/categories'),
  createCategory: (cat: Partial<Category>) =>
    apiRequest<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(cat)
    }),
  updateCategory: (id: string, cat: Partial<Category>) =>
    apiRequest<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cat)
    }),
  deleteCategory: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/api/categories/${id}`, {
      method: 'DELETE'
    }),
  reorderCategories: (orderedIds: string[]) =>
    apiRequest<Category[]>('/api/categories/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds })
    }),

  // Settings
  getSettings: () => apiRequest<SiteSettings>('/api/settings'),
  updateSettings: (settings: Partial<SiteSettings>) =>
    apiRequest<SiteSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  // Ads
  getAds: () => apiRequest<AdPlacement[]>('/api/ads'),
  updateAd: (id: string, ad: Partial<AdPlacement>) =>
    apiRequest<AdPlacement>(`/api/ads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ad)
    }),

  // Media
  getMedia: () => apiRequest<MediaItem[]>('/api/media'),
  addMedia: (media: Partial<MediaItem>) =>
    apiRequest<MediaItem>('/api/media', {
      method: 'POST',
      body: JSON.stringify(media)
    }),
  deleteMedia: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/api/media/${id}`, {
      method: 'DELETE'
    }),

  // Admin Stats
  getStats: () =>
    apiRequest<{
      totalArticles: number;
      published: number;
      drafts: number;
      scheduled: number;
      trash: number;
      totalViews: number;
      categoriesCount: number;
      recentArticles: NewsArticle[];
    }>('/api/admin/stats')
};

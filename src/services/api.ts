const TOKEN_KEY = 'foundlily_auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    credentials: 'include',
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'An error occurred during the request.');
  }
  return data;
}

export const api = {
  getSession: () => request('/api/auth/session'),
  login: (email: string, pass: string) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password: pass }) }),
  register: (name: string, email: string, pass: string) => request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password: pass }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),

  getCategories: () => request('/api/categories'),
  getRegions: () => request('/api/regions'),

  getProfiles: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/profiles?${query}`);
  },
  getTrending: () => request('/api/trending'),
  getPublicProfile: (slug: string) => request(`/api/public/profiles/${slug}`),
  getProfileById: (id: string) => request(`/api/profiles/${id}`),
  createProfile: (data: any) => request('/api/profiles', { method: 'POST', body: JSON.stringify(data) }),
  updateProfile: (id: string, data: any) => request(`/api/profiles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProfile: (id: string) => request(`/api/profiles/${id}`, { method: 'DELETE' }),

  getUserProfiles: () => request('/api/user/profiles'),
  getSavedProfiles: () => request('/api/user/saved'),

  followProfile: (id: string) => request(`/api/profiles/${id}/follow`, { method: 'POST' }),
  unfollowProfile: (id: string) => request(`/api/profiles/${id}/follow`, { method: 'DELETE' }),
  saveProfile: (id: string) => request(`/api/profiles/${id}/save`, { method: 'POST' }),
  unsaveProfile: (id: string) => request(`/api/profiles/${id}/save`, { method: 'DELETE' }),

  searchGlobal: (q: string) => request(`/api/search?q=${encodeURIComponent(q)}`),
  recordEvent: (profileId: string, eventType: string, metadata?: any) => request('/api/analytics/event', { method: 'POST', body: JSON.stringify({ profileId, eventType, metadata }) }),
  getOwnerAnalytics: (id: string) => request(`/api/analytics/profile/${id}`),

  getAdminDashboard: () => request('/api/admin/dashboard'),
  getPendingProfiles: () => request('/api/admin/profiles/pending'),
  approveProfile: (id: string) => request(`/api/admin/profiles/${id}/approve`, { method: 'PATCH' }),
  rejectProfile: (id: string) => request(`/api/admin/profiles/${id}/reject`, { method: 'PATCH' }),
  featureProfile: (id: string) => request(`/api/admin/profiles/${id}/feature`, { method: 'PATCH' }),

  getAiPitchReview: (profileData: any) => request('/api/ai/pitch-review', { method: 'POST', body: JSON.stringify({ profileData }) }),
};

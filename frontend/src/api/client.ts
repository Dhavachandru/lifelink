const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = true, headers = {}, ...customConfig } = options;

  const reqHeaders = new Headers(headers);

  if (requiresAuth) {
    const token = localStorage.getItem('lifelink_token');
    if (token) {
      reqHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  // Set default JSON Content-Type if body is not FormData
  if (customConfig.body && !(customConfig.body instanceof FormData) && !reqHeaders.has('Content-Type')) {
    reqHeaders.set('Content-Type', 'application/json');
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...customConfig,
    headers: reqHeaders,
  });

  if (response.status === 401 && requiresAuth) {
    // Attempt token refresh
    const refreshToken = localStorage.getItem('lifelink_refresh_token');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.success && refreshData.data?.accessToken) {
            localStorage.setItem('lifelink_token', refreshData.data.accessToken);
            localStorage.setItem('lifelink_refresh_token', refreshData.data.refreshToken);

            // Retry original request with new token
            reqHeaders.set('Authorization', `Bearer ${refreshData.data.accessToken}`);
            const retryResponse = await fetch(url, {
              ...customConfig,
              headers: reqHeaders,
            });
            const retryJson = await retryResponse.json();
            return retryJson.data !== undefined ? retryJson.data : retryJson;
          }
        }
      } catch (err) {
        console.error('Failed to refresh token', err);
      }
    }

    // Refresh failed or no refresh token; logout
    localStorage.removeItem('lifelink_token');
    localStorage.removeItem('lifelink_refresh_token');
    localStorage.removeItem('lifelink_user');
    window.dispatchEvent(new Event('lifelink_auth_invalidated'));
  }

  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error(`Invalid response from server: ${text.substring(0, 100)}`);
  }

  if (!response.ok) {
    const errorMessage = json.message || json.error || `HTTP error ${response.status}`;
    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.details = json.details;
    throw error;
  }

  return json.data !== undefined ? json.data : json;
}

export default apiClient;

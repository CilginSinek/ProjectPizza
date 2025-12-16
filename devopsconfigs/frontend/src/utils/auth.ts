// Auth utility functions

export const getToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const setToken = (token: string, rememberMe: boolean = true): void => {
  if (rememberMe) {
    localStorage.setItem('token', token);
  } else {
    sessionStorage.setItem('token', token);
  }
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const logout = (): void => {
  removeToken();
  window.location.href = '/login';
};

// Get authorization header for API requests
export const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Fetch current user info
export const getCurrentUser = async () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        ...getAuthHeader(),
      },
    });

    const result = await response.json();

    // Backend returns { status: "success" | "error", data, message }
    if (result.status === 'success') {
      return result.data;
    }

    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};
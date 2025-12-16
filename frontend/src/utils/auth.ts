// Auth utility functions

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
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

    if (result.success) {
      return result.data;
    }

    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

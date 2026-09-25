/**
 * Centralized API Client with environment variable support
 * Automatically attaches JWT authentication header and handles error responses
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

export const getAuthToken = () => {
  return localStorage.getItem('agentcraft_token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('agentcraft_token', token);
  } else {
    localStorage.removeItem('agentcraft_token');
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
      const err = new Error(errorMessage);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    // If network failure or server unreachable
    if (!err.status) {
      err.message = 'Unable to reach the server. Please ensure the backend is running.';
    }
    throw err;
  }
};

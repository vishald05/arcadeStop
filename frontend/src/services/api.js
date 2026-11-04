const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Custom lightweight API client with error handling
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch (parseErr) {
        // use default error message
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    throw error;
  }
}

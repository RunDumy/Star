// API client for STAR platform
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Generic API call function
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

// Posts API
export const postsAPI = {
  async getPosts() {
    return apiCall('/api/v1/posts');
  },

  async createPost(postData) {
    return apiCall('/api/v1/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  async updatePost(postId, postData) {
    return apiCall(`/api/v1/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  },

  async deletePost(postId) {
    return apiCall(`/api/v1/posts/${postId}`, {
      method: 'DELETE',
    });
  },
};

// Zodiac API
export const zodiacAPI = {
  async getNumbers() {
    return apiCall('/api/v1/zodiac/numbers');
  },

  async calculateEnergyFlow(data) {
    return apiCall('/api/v1/tarot/calculate-energy-flow', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getZodiacInfo(sign) {
    return apiCall(`/api/v1/zodiac/${sign}`);
  },
};

// Collaboration API
export const collaborationAPI = {
  async getConstellations() {
    return apiCall('/api/v1/constellations');
  },

  async createConstellation(constellationData) {
    return apiCall('/api/v1/constellations', {
      method: 'POST',
      body: JSON.stringify(constellationData),
    });
  },

  async updateConstellation(constellationId, constellationData) {
    return apiCall(`/api/v1/constellations/${constellationId}`, {
      method: 'PUT',
      body: JSON.stringify(constellationData),
    });
  },

  async deleteConstellation(constellationId) {
    return apiCall(`/api/v1/constellations/${constellationId}`, {
      method: 'DELETE',
    });
  },

  async getOnlineUsers() {
    return apiCall('/api/v1/users/online');
  },
};

// Authentication helper
export function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Enhanced API call with auth
export async function authenticatedApiCall(endpoint, options = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  return apiCall(endpoint, { ...options, headers });
}
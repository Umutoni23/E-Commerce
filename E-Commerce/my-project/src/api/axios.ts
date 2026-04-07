import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token automatically
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('user');

    if (stored) {
      try {
        const user = JSON.parse(stored);

        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch {
        console.error('Invalid user in localStorage');
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
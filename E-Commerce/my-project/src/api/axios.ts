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
        const parsed = JSON.parse(stored) as {
          token?: string;
          user?: { token?: string };
          data?: { token?: string; user?: { token?: string } };
        };

        const token = parsed.token ?? parsed.user?.token ?? parsed.data?.token ?? parsed.data?.user?.token;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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

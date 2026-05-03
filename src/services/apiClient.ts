import axios from 'axios';

const toErrorString = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const arrayMessages = value
      .map(item => toErrorString(item))
      .filter((item): item is string => Boolean(item));

    return arrayMessages.length > 0 ? arrayMessages.join(', ') : null;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    const primary = toErrorString(record.detail) || toErrorString(record.title) || toErrorString(record.message);
    if (primary) {
      return primary;
    }

    if (record.errors && typeof record.errors === 'object') {
      const errors = record.errors as Record<string, unknown>;
      const messages = Object.values(errors)
        .map(item => toErrorString(item))
        .filter((item): item is string => Boolean(item));

      if (messages.length > 0) {
        return messages.join(', ');
      }
    }

    const nestedMessages = Object.values(record)
      .map(item => toErrorString(item))
      .filter((item): item is string => Boolean(item));

    return nestedMessages.length > 0 ? nestedMessages.join(', ') : null;
  }

  return null;
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5126',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void, reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  res => res,
  async err => {
    if (err?.response?.data) {
      const normalizedMessage = toErrorString(err.response.data);
      if (normalizedMessage) {
        if (typeof err.response.data === 'object' && err.response.data !== null) {
          err.response.data.detail = normalizedMessage;
          err.response.data.message = normalizedMessage;
          err.response.data.title = normalizedMessage;
        } else {
          err.response.data = { detail: normalizedMessage, message: normalizedMessage, title: normalizedMessage };
        }
      }
    }

    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const token = localStorage.getItem('token');

        const response = await axios.post(`${apiClient.defaults.baseURL}/api/accounts/refresh-token`, {
          jwtToken: token,
          refreshToken: refreshToken
        });

        const newJwtToken = response.data.jwtToken;
        const newRefreshToken = response.data.refreshToken;

        localStorage.setItem('token', newJwtToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newJwtToken}`;
        originalRequest.headers.Authorization = `Bearer ${newJwtToken}`;

        processQueue(null, newJwtToken);
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
          window.location.href = '/logowanie';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default apiClient;

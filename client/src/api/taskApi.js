import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL;
const apiBaseUrl = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, '')
  : 'http://localhost:5000/api';
const baseURL = apiBaseUrl.endsWith('/api') ? apiBaseUrl : `${apiBaseUrl}/api`;

const api = axios.create({
  baseURL,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('taskTrackerToken', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('taskTrackerToken');
  }
};

const existingToken = localStorage.getItem('taskTrackerToken');
if (existingToken) {
  setAuthToken(existingToken);
}

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  google: (payload) => api.post('/auth/google', payload),
};

export const getTasks = (params = {}) => api.get('/tasks', { params });
export const getTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// services/api.js — Always points to Flask on localhost:5000 for local dev

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 422 / 401 globally — token expired, force re-login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 422 || error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login    = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe    = ()     => API.get('/auth/me');

// Tickets
export const getTickets    = (params) => API.get('/tickets/', { params });
export const getTicket     = (id)     => API.get(`/tickets/${id}`);
export const createTicket  = (data)   => API.post('/tickets/', data);
export const updateTicket  = (id, data) => API.put(`/tickets/${id}`, data);
export const deleteTicket  = (id)     => API.delete(`/tickets/${id}`);
export const getTicketLogs = (id)     => API.get(`/tickets/${id}/logs`);

// Users
export const getUsers    = ()         => API.get('/users/');
export const getStaff    = ()         => API.get('/users/staff');
export const updateUser  = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser  = (id)       => API.delete(`/users/${id}`);

// Fixtures
export const getFixtures     = ()         => API.get('/fixtures/');
export const getFixtureTypes = ()         => API.get('/fixtures/types');
export const createFixture   = (data)     => API.post('/fixtures/', data);
export const updateFixture   = (id, data) => API.put(`/fixtures/${id}`, data);
export const deleteFixture   = (id)       => API.delete(`/fixtures/${id}`);

// Dashboard
export const getDashboardMetrics = () => API.get('/dashboard/metrics');

// Audit Logs
export const getAllLogs = () => API.get('/logs/');

export default API;
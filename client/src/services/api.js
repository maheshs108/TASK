import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export async function fetchUsers({ page = 1, limit = 5, search = '' }) {
  const params = { page, limit };
  if (search) {
    params.search = search;
  }
  const res = await api.get('/users', { params });
  return res.data;
}

export async function fetchUserById(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function createUser(data) {
  const res = await api.post('/users', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function updateUser(id, data) {
  const res = await api.put(`/users/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export function exportUsersToCsv(search = '') {
  const params = new URLSearchParams();
  if (search) {
    params.append('search', search);
  }
  const url = `${API_BASE_URL}/api/users/export?${params.toString()}`;
  window.location.href = url;
}


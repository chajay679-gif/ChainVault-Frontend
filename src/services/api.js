import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api'
});

export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerUser = (credentials) => API.post('/auth/register', credentials);

export const registerDocument = (formData) => API.post('/documents/register', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const verifyFile = (formData) => API.post('/documents/verify-file', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const verifyByHash = (hash) => API.get(`/documents/verify/${hash}`);
export const fetchDocuments = () => API.get('/documents');
export const revokeDocument = (id) => API.put(`/documents/${id}/revoke`);
import api from './axios';

export const authApi = {
  register: (data) => api.post('/api/auth/register', data).then(r => r.data),
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return api.post('/api/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then(r => r.data);
  },
  me: () => api.get('/api/auth/me').then(r => r.data),
};
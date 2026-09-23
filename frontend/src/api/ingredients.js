import api from './axios';

export const ingredientsApi = {
    listAll: () => api.get('/api/ingredients/').then(r => r.data),
    create: (data) => api.post('/api/ingredients/', data).then(r => r.data),
};
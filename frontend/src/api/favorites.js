import api from './axios';

export const favoritesApi = {
    list: () => api.get('/api/favorites/').then(r => r.data),
    ids: () => api.get('/api/favorites/ids').then(r => r.data),
    add: (recipeId) => api.post(`/api/favorites/${recipeId}`).then(r => r.data),
    remove: (recipeId) => api.delete(`/api/favorites/${recipeId}`),
};
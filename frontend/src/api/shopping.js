import api from './axios';

export const shoppingApi = {

    preview: (recipeIds, title) =>
        api.post('/api/shopping-list/preview', { recipe_ids: recipeIds, title }).then(r => r.data),

    save: (recipeIds, title) =>
        api.post('/api/shopping-list/', { recipe_ids: recipeIds, title }).then(r => r.data),

    myLists: () => api.get('/api/shopping-list/').then(r => r.data),

    get: (id) => api.get(`/api/shopping-list/${id}`).then(r => r.data),

    toggleItem: (itemId) =>
        api.patch(`/api/shopping-list/items/${itemId}`).then(r => r.data),
};
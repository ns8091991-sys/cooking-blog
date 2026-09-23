import api from './axios';

export const recipesApi = {
  list: () => api.get('/api/recipes/').then(r => r.data),
  get: (id) => api.get(`/api/recipes/${id}`).then(r => r.data),
  create: (data) => api.post('/api/recipes/', data).then(r => r.data),
  update: (id, data) => api.put(`/api/recipes/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/api/recipes/${id}`),

  listSteps: (recipeId) => api.get(`/api/recipes/${recipeId}/steps`).then(r => r.data),
  addStep: (recipeId, data) => api.post(`/api/recipes/${recipeId}/steps`, data).then(r => r.data),

  listIngredients: (recipeId) =>
    api.get(`/api/ingredients/${recipeId}/ingredients`).then(r => r.data),
  addIngredient: (recipeId, data) =>
    api.post(`/api/ingredients/${recipeId}/ingredients`, data).then(r => r.data),
};